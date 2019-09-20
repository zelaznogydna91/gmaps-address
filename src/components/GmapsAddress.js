/* eslint-disable react/no-unused-state */
import isEmpty from 'lodash/isEmpty'
import getProp from 'lodash/get'
import pickProps from 'lodash/pick'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Geocode from 'react-geocode'
import { Fab, Divider } from '@material-ui/core'
import Cancel from '@material-ui/icons/Clear'
import { withStyles } from '@material-ui/core/styles'
import EditIcon from '@material-ui/icons/Edit'
import MapIcon from '@material-ui/icons/Map'
import { withGmapsContext } from './WithGoogleApi'
import GmapsAddressInput from './GmapsAddressInput'
import GmapsWindow from './GmapsWindow'
import GmapsAutocomplete from './GmapsAutocomplete'
import ChipAreaSelect from './ChipAreaSelect'
import ChipAreaPicker from './ChipAreaPicker'
import GmapsAreaWindow from './GmapsAreaWindow'
import { validLocation, validArea, getMapViewportFromAreas, getStreetAddrPartsFromGeoResult, sameAreas } from './utils'

Geocode.enableDebug()
const styles = theme => ({
  gmapsWindow: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },

  divider: {
    height: '80%',
    margin: '4px',
    width: '1px',
    alignSelf: 'end',
  },

  fabControlGroup: {
    display: 'flex',
  },
  fabContainer: {
    alignSelf: 'center',
    marginRight: theme.spacing(1),
    marginBottom: theme.spacing(0.5),
  },
  fab: {
    alignSelf: 'center',

    height: '36px',
    width: '36px',
  },
})

const TheHeartOfKendall = { lat: 25.678167, lng: -80.404497 }

/**
 * Street Address mode
 * - On valid value (shape {caption?, heart} )
 *   - query geocode with heart
 *   - saveInStateStreetAddressDetails
 * - On value empty
 *   - input shown empty -- { address: '', markerPosition: userCurrentLocation || null }
 * - On invalid value (shape diff from {caption?, heart} )
 *   - { showError: true, address: value, markerPosition: userCurrentLocation || null }
 *
 * Area Mode
 * - On valid value (areas array shape [ {caption?,heart,polygon} ])
 *   - set { currentAreaSelection: value }
 * - On empty value (areas = [])
 *   - set { currentAreaSelection: [] }
 * - On invalid value (shape diff from [ {caption?, heart, polygon} ])
 *   - set { currentAreaSelection: [] }
 */

class GmapsAddress extends Component {
  constructor(props) {
    super(props)
    Geocode.setApiKey(props.apiKey)

    this.state = {
      address: undefined,
      area: '',
      city: '',
      state: '',

      mapPosition: TheHeartOfKendall,
      markerPosition: TheHeartOfKendall,
      mapViewport: null,

      currentAreaSelection: undefined,
      addedUserAreas: [],
      userAreaOptions: null,

      showAddressInput: true,
      showChipAreaSelect: props.areaMode,
      showChipAreaPicker: false,
      showMap: false,
      mapFirstShowing: true,
      currentLocation: null,
    }
  }

  async componentDidMount() {
    const newState = await this.getStateFromProps(this.props)
    this.setState(newState)
  }

  async componentDidUpdate(prevProps, prevState) {
    // chasing for data loading
    if (!prevState.dataJustLoaded) {
      const newState = await this.getStateFromProps(this.props)
      if (
        (this.props.areaMode === false && this.dataJustLoaded(prevState, newState, 'address')) ||
        (this.props.areaMode && this.dataJustLoaded(prevState, newState, 'currentAreaSelection'))
      ) {
        let mapUpdates = {}
        if (
          this.props.areaMode &&
          (isEmpty(newState.currentAreaSelection) && isEmpty(this.props.boundaries)) === false
        ) {
          const mapViewport = getMapViewportFromAreas([
            ...newState.currentAreaSelection,
            ...(this.props.boundaries || []),
          ])
          const mapViewportCenter = {
            lat: (mapViewport.ne.lat + mapViewport.sw.lat) / 2,
            lng: (mapViewport.ne.lng + mapViewport.sw.lng) / 2,
          }
          mapUpdates = { mapPosition: mapViewportCenter, markerPosition: mapViewportCenter, mapViewport }
        }
        if (this.props.areaMode === false) {
          mapUpdates = { mapPosition: newState.markerPosition }
        }

        // eslint-disable-next-line react/no-did-update-set-state
        this.setState({ ...prevState, ...newState, ...mapUpdates, dataJustLoaded: true })
      }
    }
  }

  dataJustLoaded = (prevData, newData, key) => prevData[key] === undefined && newData[key] !== undefined

  getStateFromProps = async props => {
    // AREA MODE
    if (props.areaMode) {
      const currentAreaSelection = ((Array.isArray(props.value) && props.value) || []).filter(x => validArea(x))
      return { currentAreaSelection, addedUserAreas: currentAreaSelection }
    }

    // STREET ADDRESS MODE
    const address = getProp(props.value, 'caption', '')
    const markerPosition = (validLocation(getProp(props.value, 'heart')) && props.value.heart) || TheHeartOfKendall
    if (isEmpty(address) && !isEmpty(markerPosition)) {
      const geoResp = await Geocode.fromLatLng(markerPosition.lat, markerPosition.lng)
      const parts = getStreetAddrPartsFromGeoResult(geoResp.results[0])
      if (!isEmpty(parts)) {
        return parts
      }
    }
    return { address, markerPosition }
  }

  /**
   * When the marker is dragged you get the lat and long using the functions available from event object.
   * Use geocode to get the address, city, area and state from the lat and lng positions.
   * And then set those values in the state.
   *
   * @param event
   */
  handleMarkerDragEnd = async event => {
    const newLat = event.latLng.lat()
    const newLng = event.latLng.lng()
    this.setState({
      markerPosition: { lat: newLat, lng: newLng },
    })

    const geoCodeResp = await Geocode.fromLatLng(newLat, newLng)
    const addressDetails = getStreetAddrPartsFromGeoResult(geoCodeResp.results[0])
    if (isEmpty(addressDetails)) return

    if (this.props.areaMode === false) {
      this.saveInStateStreetAddressDetails(newLat, newLng, addressDetails)
      return
    }

    const userAreaOptions = this.getUserAreaOptionsFromGeocodeResponse(null, geoCodeResp)
    this.setState(prev => ({
      userAreaOptions,
      address: userAreaOptions[0].caption,
      showChipAreaPicker: !prev.showChipAreaSelect,
    }))
  }

  saveInStateStreetAddressDetails = (newLat, newLng, addressDetails, updateMapPos) => {
    const location = { lat: newLat, lng: newLng }
    this.setState({
      ...addressDetails,
      markerPosition: location,
      ...(updateMapPos ? { mapPosition: location } : {}),
    })
  }

  /**
   * When the user types an address in the search box
   * @param place
   */
  onPlaceSelected = async place => {
    if (isEmpty(place.address_components)) {
      return
    }
    const placeAddress = place.formatted_address
    const latValue = place.geometry.location.lat()
    const lngValue = place.geometry.location.lng()

    const addressDetails = getStreetAddrPartsFromGeoResult(place)
    if (isEmpty(addressDetails)) return

    if (!this.props.areaMode) {
      this.saveInStateStreetAddressDetails(latValue, lngValue, addressDetails, true)
      return
    }

    const geoCodeResp = await Geocode.fromLatLng(latValue, lngValue)

    const userAreaOptions = this.getUserAreaOptionsFromGeocodeResponse(placeAddress, geoCodeResp)
    this.setState({
      userAreaOptions,
      address: userAreaOptions[0].caption,
      markerPosition: userAreaOptions[0].heart,
      mapPosition: userAreaOptions[0].heart,
      showChipAreaPicker: true,
    })
  }

  getUserAreaOptionsFromGeocodeResponse = (placeAddress, geoResp) => {
    const levels = ['locality', 'administrative_area_level_2', 'administrative_area_level_1', 'country']
    let minLevel = 0
    if (placeAddress) {
      const exactResult = geoResp.results.find(r => r.formatted_address === placeAddress)
      if (exactResult) {
        minLevel = Math.max(levels.findIndex(l => exactResult.types.some(t => t === l)), 0)
      }
    }

    const userAreaOptions = []
    // eslint-disable-next-line no-plusplus
    for (let id = 0; id < 3; id++) {
      const levelType = levels[minLevel + id]
      const r = geoResp.results.find(z => z.types.some(t => t === levelType))
      if (!r) continue // eslint-disable-line no-continue
      const { lat: b, lng: a } = r.geometry.bounds.northeast
      const { lat: y, lng: x } = r.geometry.bounds.southwest
      userAreaOptions.push({
        level: minLevel + id,
        caption: r.formatted_address,
        area: r.address_components[0].long_name,
        heart: { lat: r.geometry.location.lat, lng: r.geometry.location.lng },
        polygon: [{ lat: b, lng: a }, { lat: b, lng: x }, { lat: y, lng: x }, { lat: y, lng: a }],
      })
    }

    return userAreaOptions
  }

  handleAddressChange = event => {
    this.setState({ address: event.target.value })
  }

  captureCurrentLocationFromNavigator = async () =>
    new Promise(resolve => {
      if (!navigator.geolocation) {
        resolve(null)
      } else {
        navigator.geolocation.getCurrentPosition(
          position => {
            resolve({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            })
          },
          () => resolve(null)
        )
      }
    })

  handleShowMapToggle = async () => {
    let { showMap, mapFirstShowing, currentLocation } = this.state

    this.setState(prev => ({ showMap: !prev.showMap }))

    let currentLocationSetting = {}
    if (showMap === false && mapFirstShowing) {
      currentLocation = currentLocation || (await this.captureCurrentLocationFromNavigator()) || TheHeartOfKendall
      currentLocationSetting = {
        currentLocation,
        markerPosition: currentLocation,
        mapFirstShowing: false,
      }
    }

    this.setState(currentLocationSetting)
  }

  handleAreaSelection = updatedAreaSelection => {
    const fromBoundary = updatedAreaSelection.find(x => x.isBoundary)
    if (fromBoundary) {
      this.addNewUserArea(fromBoundary)
      return
    }
    this.setState({ currentAreaSelection: [...updatedAreaSelection] })
  }

  handleAddNewArea = async () => {
    this.setState({
      showChipAreaSelect: false,
      showChipAreaPicker: true,
      loadingUserAreaOptions: true,
    })

    // using cached or capture current location ..
    let { currentLocation } = this.state
    let currentLocationSetting = {}
    if (!currentLocation) {
      currentLocation = (await this.captureCurrentLocationFromNavigator()) || TheHeartOfKendall
      currentLocationSetting = { currentLocation }
    }

    let areaOptionsFromCurrentLocation = {}
    if (!isEmpty(currentLocation)) {
      const { lat, lng } = currentLocation
      const geoCodeResp = await Geocode.fromLatLng(lat, lng)
      const addressDetails = getStreetAddrPartsFromGeoResult(geoCodeResp.results[0])
      if (!isEmpty(addressDetails)) {
        areaOptionsFromCurrentLocation = {
          userAreaOptions: this.getUserAreaOptionsFromGeocodeResponse(null, geoCodeResp),
        }
      }
    }

    this.setState({
      ...currentLocationSetting,
      ...areaOptionsFromCurrentLocation,
      loadingUserAreaOptions: false,
    })
  }

  getNextGenAreaName = () => {
    const existing = this.state.addedUserAreas
    for (let i = 1; i < Number.MAX_VALUE; i += 1) {
      const name = `Area${i}`
      if (!existing.some(x => x.caption === name)) return name
    }
    throw new Error("unbelievable ...\nshouldn't you have less areas?")
  }

  addNewUserArea = pickedOption => {
    let userAreaToAdd = {
      ...pickProps(pickedOption, ['id', 'caption', 'area', 'heart', 'polygon']),
      caption: this.getNextGenAreaName(),
    }
    this.setState(prev => {
      let addedUserAreasUpdate = {}
      const laqueequee = prev.addedUserAreas.find(x => sameAreas(x, userAreaToAdd))
      if (!laqueequee) addedUserAreasUpdate = { addedUserAreas: [...prev.addedUserAreas, userAreaToAdd] }
      if (laqueequee) userAreaToAdd = laqueequee

      let currentAreaSelectionUpdate = {}
      if (!prev.currentAreaSelection.some(x => sameAreas(x, userAreaToAdd)))
        currentAreaSelectionUpdate = { currentAreaSelection: [...prev.currentAreaSelection, userAreaToAdd] }

      return {
        ...addedUserAreasUpdate,
        ...currentAreaSelectionUpdate,
        showChipAreaSelect: true,
        showChipAreaPicker: false,
        markerPosition: userAreaToAdd.heart,
        mapViewport: getMapViewportFromAreas([userAreaToAdd]),
      }
    })
  }

  handleAreaRemoveOnMapWindow = areaId => {
    this.setState(prev => ({
      currentAreaSelection: [], // prev.currentAreaSelection.filter((x, i) => i !== areaId),
    }))
  }

  handleAreaChangeOnMapWindow = (areaId, updatedPolygon, isValid) => {
    this.setState(prev => {
      const changedArea = prev.currentAreaSelection[areaId]
      const areaUpdate = {
        ...changedArea,
        polygon: updatedPolygon,
        isValid,
      }

      let addedUserAreaUpdate = {}
      const changedAddedUserAreaIndex = prev.addedUserAreas.findIndex(
        x => x === changedArea || (x.id > 0 && x.id === changedArea.id)
      )

      if (changedAddedUserAreaIndex > -1) {
        addedUserAreaUpdate = { addedUserAreas: [...prev.addedUserAreas] }
        addedUserAreaUpdate.addedUserAreas[changedAddedUserAreaIndex] = areaUpdate
      }

      const currentAreaSelectionUpdate = [...prev.currentAreaSelection]
      currentAreaSelectionUpdate[areaId] = areaUpdate
      return {
        ...addedUserAreaUpdate,
        currentAreaSelection: currentAreaSelectionUpdate,
      }
    })
  }

  handleEnterEditMode = () => {
    this.setState({ showChipAreaPicker: false, showMap: false, address: '' })
  }

  handleChipAreaPickerCancel = () => {
    this.setState({ showChipAreaPicker: false, showChipAreaSelect: true })
  }

  render() {
    const { classes, inputComponent, inputProps, boundaries, areaMode } = this.props
    const inputPlaceholder = areaMode ? 'Search for an area center' : 'Enter your address'
    const {
      address,
      currentAreaSelection,
      addedUserAreas,
      userAreaOptions,
      loadingUserAreaOptions,
      markerPosition,
      mapViewport,
      mapPosition,
      showChipAreaSelect,
      showChipAreaPicker,
      showMap,
    } = this.state

    let boundariesAndUserAreas = []
    if (areaMode) {
      boundariesAndUserAreas = [...boundaries.map(b => ({ ...b, isBoundary: true })), ...addedUserAreas]
    }

    return (
      <div>
        <div style={{ display: 'flex' }}>
          {areaMode && showChipAreaSelect ? (
            <ChipAreaSelect
              inputProps={{ fullWidth: true }}
              options={boundariesAndUserAreas}
              currentSelection={currentAreaSelection || []}
              onChange={this.handleAreaSelection}
              onAddNewArea={this.handleAddNewArea}
            />
          ) : (
            <div style={{ display: 'flex', width: '100%' }}>
              {!showChipAreaPicker ? (
                <GmapsAutocomplete
                  onPlaceSelected={this.onPlaceSelected}
                  inputComponent={inputComponent}
                  inputProps={{
                    fullWidth: true,
                    placeholder: inputPlaceholder,
                    value: address || '',
                    onChange: this.handleAddressChange,
                    ...inputProps,
                  }}
                  componentRestrictions={{ country: this.props.countries }}
                />
              ) : (
                areaMode &&
                showChipAreaPicker && (
                  <ChipAreaPicker
                    userAreaOptions={userAreaOptions || []}
                    handleChipClick={this.addNewUserArea}
                    onCancel={this.handleChipAreaPickerCancel}
                    loading={loadingUserAreaOptions}
                  />
                )
              )}
            </div>
          )}
          {/* ---------------------------------------- */}
          {/* --------------------------- FAB CONTROLS */}
          {/* ---------------------------------------- */}
          <div className={classes.fabControlGroup}>
            {showChipAreaPicker && <Divider className={classes.divider} orientation="vertical" />}
            {showChipAreaPicker && (
              <div className={classes.fabContainer}>
                <Fab
                  className={classes.fab}
                  color="primary"
                  key="editAddress"
                  onClick={() => this.handleEnterEditMode()}
                  size="small"
                >
                  <EditIcon />
                </Fab>
              </div>
            )}
            {areaMode && !showChipAreaSelect && (
              <div className={classes.fabContainer}>
                <Fab
                  aria-label="cancel"
                  className={classes.fab}
                  key="cancel"
                  onClick={this.handleChipAreaPickerCancel}
                  size="small"
                >
                  <Cancel />
                </Fab>
              </div>
            )}
            <div
              className={classes.fabContainer}
              style={{
                ...(!showChipAreaSelect
                  ? {}
                  : {
                      alignSelf: 'flex-end',
                    }),
              }}
            >
              <Fab
                aria-label="open-map"
                size="small"
                key="open-map"
                onClick={this.handleShowMapToggle}
                className={classes.fab}
              >
                <MapIcon />
              </Fab>
            </div>
          </div>
          {/* ---------------------------------------- */}
          {/* ------------------------FAB CONTROLS END */}
          {/* ---------------------------------------- */}
        </div>
        {/* Showing the map... */}
        {showMap &&
          (areaMode ? (
            <GmapsAreaWindow
              areas={currentAreaSelection}
              boundaries={boundaries}
              containerElement={<div style={{ height: this.props.height }} />}
              mapElement={<div style={{ height: '100%' }} />}
              mapPosition={mapPosition}
              markerPosition={markerPosition}
              onAreaChange={this.handleAreaChangeOnMapWindow}
              onAreaRemove={this.handleAreaRemoveOnMapWindow}
              onMarkerDragEnd={this.handleMarkerDragEnd}
              zoom={this.props.zoom}
              mapViewport={mapViewport}
              showMarker={!showChipAreaSelect}
            />
          ) : (
            <GmapsWindow
              containerElement={<div style={{ height: this.props.height }} />}
              mapElement={<div style={{ height: '100%' }} />}
              mapPosition={mapPosition}
              markerPosition={markerPosition}
              onMarkerDragEnd={this.handleMarkerDragEnd}
              zoom={this.props.zoom}
            />
          ))}
      </div>
    )
  }
}

GmapsAddress.propTypes = {
  apiKey: PropTypes.string,
  areaMode: PropTypes.bool,
  height: PropTypes.string,
  zoom: PropTypes.number,
  inputComponent: PropTypes.elementType,
  inputProps: PropTypes.object,
  countries: PropTypes.array,
  classes: PropTypes.object,
  boundaries: PropTypes.arrayOf(
    PropTypes.shape({
      caption: PropTypes.string,
      heart: PropTypes.exact({ lat: PropTypes.number, lng: PropTypes.number }),
      polygon: PropTypes.arrayOf(PropTypes.exact({ lat: PropTypes.number, lng: PropTypes.number })),
    })
  ),
}

GmapsAddress.defaultProps = {
  areaMode: false,
  height: '600px',
  zoom: 15,
  inputComponent: GmapsAddressInput,
  inputProps: {},
  countries: ['us'],
}

export default withStyles(styles)(withGmapsContext(GmapsAddress))
