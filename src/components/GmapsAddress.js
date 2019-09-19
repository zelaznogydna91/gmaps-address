/* eslint-disable react/no-unused-state */
import isEmpty from 'lodash/isEmpty'
import getProp from 'lodash/get'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Geocode from 'react-geocode'
import { Fab } from '@material-ui/core'
import Cancel from '@material-ui/icons/Clear'
import { withStyles } from '@material-ui/core/styles'
import PinDrop from '@material-ui/icons/PinDrop'
import MapIcon from '@material-ui/icons/Map'
import { withGmapsContext } from './WithGoogleApi'
import GmapsAddressInput from './GmapsAddressInput'
import GmapsWindow from './GmapsWindow'
import GmapsAutocomplete from './GmapsAutocomplete'
import ChipAreaSelect from './ChipAreaSelect'
import ChipAreaPicker from './ChipAreaPicker'
import GmapsAreaWindow from './GmapsAreaWindow'
import { validLocation, validArea, getMapViewportFromAreas, getStreetAddrPartsFromGeoResult } from './utils'

/**
 * /src/components/GmapsAddress.js
  Line 333:  'areaId' is defined but never used. Allowed unused args must match /res|next|^err/  no-unused-vars
  Line 334:  'prev' is defined but never used. Allowed unused args must match /res|next|^err/    no-unused-vars
  Line 423:  'classes.iconButton' is missing in props validation                                 react/prop-types
  Line 429:  'classes.chip' is missing in props validation                                       react/prop-types
  Line 437:  'classes.iconButton' is missing in props validation                                 react/prop-types
  Line 489:  'value' PropType is defined but prop is never used                                  react/no-unused-prop-types
 */

Geocode.enableDebug()
const styles = theme => ({
  gmapsWindow: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  iconButton: {
    alignSelf: 'center',
  },
  chip: {
    margin: theme.spacing(1),
    alignSelf: 'center',
  },
  fabs: {
    display: 'flex',
    contentAlign: 'end',
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
      return { currentAreaSelection }
    }

    // STREET ADDRESS MODE
    const address = getProp(props.value, 'caption', '')
    const markerPosition = (validLocation(getProp(props.value, 'heart')) && props.value.heart) || TheHeartOfKendall
    if (isEmpty(address) && !isEmpty(markerPosition)) {
      const geoResp = await Geocode.fromLatLng(markerPosition.lat, markerPosition.lng)
      return getStreetAddrPartsFromGeoResult(geoResp.results[0])
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

    if (this.props.areaMode === false) {
      this.saveInStateStreetAddressDetails(newLat, newLng, geoCodeResp.results[0])
      return
    }

    const userAreaOptions = this.getUserAreaOptionsFromGeocodeResponse(null, geoCodeResp)
    this.setState({
      userAreaOptions,
      address: userAreaOptions[0].caption,
      showChipAreaPicker: this.props.areaMode,
    })
  }

  saveInStateStreetAddressDetails = (newLat, newLng, geoResult, updateMapPos) => {
    const location = { lat: newLat, lng: newLng }
    this.setState({
      ...getStreetAddrPartsFromGeoResult(geoResult),
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

    if (!this.props.areaMode) {
      this.saveInStateStreetAddressDetails(latValue, lngValue, place, true)
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
        // if (minLevel < 0) minLevel = 0
      }
    }

    const userAreaOptions = []

    //     for (let id = 0; id < 3 && id < 3 + 1 - minLevel; id++) {

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
      areaOptionsFromCurrentLocation = {
        userAreaOptions: this.getUserAreaOptionsFromGeocodeResponse(null, geoCodeResp),
      }
    }
    this.setState({
      ...currentLocationSetting,
      ...areaOptionsFromCurrentLocation,
      loadingUserAreaOptions: false,
    })
  }

  addNewUserArea = newUserArea => {
    this.setState(prev => {
      let addedUserAreasUpdate = {}
      if (!prev.addedUserAreas.some(x => x.caption === newUserArea.caption))
        addedUserAreasUpdate = { addedUserAreas: [...prev.addedUserAreas, newUserArea] }
      let currentAreaSelectionUpdate = {}
      if (!prev.currentAreaSelection.some(x => x.caption === newUserArea.caption))
        currentAreaSelectionUpdate = { currentAreaSelection: [...prev.currentAreaSelection, newUserArea] }

      return {
        ...addedUserAreasUpdate,
        ...currentAreaSelectionUpdate,
        showChipAreaSelect: true,
        markerPosition: newUserArea.heart,
        mapViewport: getMapViewportFromAreas([newUserArea]),
      }
    })
  }

  handleAreaRemoveOnMapWindow = areaId => {
    this.setState(prev => ({
      currentAreaSelection: [], // prev.currentAreaSelection.filter((x, i) => i !== areaId),
    }))
  }

  handleAreaChangeOnMapWindow = (areaId, updatedPolygon) => {
    this.setState(prev => {
      const update = [...prev.currentAreaSelection]
      update[areaId] = {
        ...prev.currentAreaSelection[areaId],
        polygon: updatedPolygon,
      }
      return {
        currentAreaSelection: update,
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
      boundariesAndUserAreas = [...boundaries, ...addedUserAreas]
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
                    onEnterEditMode={this.handleEnterEditMode}
                    onCancel={this.handleChipAreaPickerCancel}
                    loading={loadingUserAreaOptions}
                  />
                )
              )}
            </div>
          )}
          <div className={classes.fabs}>
            <div className={classes.iconButton}>
              {areaMode && !showChipAreaSelect && (
                <Fab
                  key="cancel"
                  // clickable
                  onClick={this.handleChipAreaPickerCancel}
                  className={classes.chip}
                  // color="primary"
                  size="small"
                  aria-label="cancel"
                >
                  <Cancel />
                </Fab>
              )}
            </div>
            <div className={classes.iconButton}>
              <Fab
                size="small"
                onClick={this.handleShowMapToggle}
                // color="primary"
                aria-label="map-pin-drop"
              >
                {/* <PinDrop /> */}
                <MapIcon></MapIcon>
              </Fab>
            </div>
          </div>
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
    PropTypes.exact({
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
