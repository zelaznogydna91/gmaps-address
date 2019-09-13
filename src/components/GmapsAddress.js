/* eslint-disable react/no-unused-state */
import isEmpty from 'lodash/isEmpty'
import getProp from 'lodash/get'
import React, { Component, useContext } from 'react'
import PropTypes from 'prop-types'
import Geocode from 'react-geocode'
import { Chip, Paper, IconButton } from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles'
import PinDrop from '@material-ui/icons/PinDrop'
import { withGmapsContext } from './WithGoogleApi'
import GmapsAddressInput from './GmapsAddressInput'
import GmapsWindow from './GmapsWindow'
import GmapsAutocomplete from './GmapsAutocomplete'
import ChipAreaSelect from './ChipAreaSelect'
import ChipAreaPicker from './ChipAreaPicker'
import GmapsAreaWindow from './GmapsAreaWindow'
import { validLocation, validArea, getMapViewportFromAreas } from './utils'

Geocode.enableDebug()
const styles = theme => ({
  gmapsWindow: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  iconButton: {
    alignSelf: 'center',
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
      address: '',
      area: '',
      city: '',
      state: '',

      mapPosition: null,
      markerPosition: null,
      mapViewport: null,

      currentAreaSelection: [],
      addedUserAreas: [],
      userAreaOptions: null,

      showAddressInput: true,
      showChipAreaSelect: props.areaMode,
      showChipAreaPicker: false,
      showMap: false,
    }
  }

  async componentDidMount() {
    this.setState(GmapsAddress.getStateFromProps(this.props))
  }

  componentDidUpdate(prevProps, prevState) {
    const newState = GmapsAddress.getStateFromProps(this.props)
    let mapPositionUpdate = {}
    if (isEmpty(prevState.markerPosition) && !isEmpty(newState.markerPosition)) {
      let mapViewport = null
      if (props.areaMode && (!isEmpty(newState.currentAreaSelection) || !isEmpty(props.boundaries))) {
        mapViewport = getMapViewportFromAreas([...initialAreaSelection, ...(props.boundaries || [])])
      }
      mapUpdates = { mapPosition: newState.markerPosition }
    }
    // eslint-disable-next-line react/no-did-update-set-state
    this.setState({ ...prevState, ...newState, ...mapUpdates })
  }

  static getStateFromProps = async props => {
    // AREA MODE
    if (props.areaMode) {
      const currentAreaSelection = (Array.isArray(props.value) || []).filter(x => validArea(x))
      return { currentAreaSelection, mar }
    }

    // STREET ADDRESS MODE
    const address = getProp(props.value, 'caption', '')
    const markerPosition = (validLocation(getProp(props.value, 'heart')) && props.value) || null
    if (isEmpty(address) && !isEmpty(markerPosition)) {
      const geoResp = await Geocode.fromLatLng(markerPosition.lat, markerPosition.lng)
      return GmapsAddress.getStreetAddrPartsFromGeoResult(geoResp.results[0])
    }
    return { address, markerPosition }

    // let mapViewport = null
    // if (props.areaMode && (!isEmpty(initialAreaSelection) || !isEmpty(props.boundaries))) {
    //   mapViewport = getMapViewportFromAreas([...initialAreaSelection, ...(props.boundaries || [])])
    // }
  }

  static getStreetAddrPartsFromGeoResult = geoResult => {
    const addressArray = geoResult.address_components
    return {
      area:
        (addressArray.find(x => x.types.some(t => ['sublocality_level_1', 'locality'].includes(t))) || {}).long_name ||
        '',
      city: (addressArray.find(x => x.types[0] === 'administrative_area_level_2') || {}).long_name || '',
      state: (addressArray.find(x => x.types[0] === 'administrative_area_level_1') || {}).long_name || '',
      address: geoResult.formatted_address,
    }
  }

  /**
   * When the marker is dragged you get the lat and long using the functions available from event object.
   * Use geocode to get the address, city, area and state from the lat and lng positions.
   * And then set those values in the state.
   *
   * @param event
   */
  onMarkerDragEnd = async event => {
    const newLat = event.latLng.lat()
    const newLng = event.latLng.lng()

    const geoCodeResp = await Geocode.fromLatLng(newLat, newLng)

    if (!this.props.areaMode) {
      this.saveInStateStreetAddressDetails(newLat, newLng, geoCodeResp.results[0])
    }

    console.log('geoCodeResp - onPlaceSelected', geoCodeResp) // eslint-disable-line no-console
    const userAreaOptions = this.getUserAreaOptionsFromGeocodeResponse(null, geoCodeResp)
    this.setState({
      userAreaOptions,
      address: userAreaOptions[0].caption,
      markerPosition: { lat: newLat, lng: newLng },
      showChipAreaPicker: true,
    })
  }

  saveInStateStreetAddressDetails = (newLat, newLng, geoResult, updateMapPos) => {
    const location = { lat: newLat, lng: newLng }
    this.setState({
      ...GmapsAddress.getStreetAddrPartsFromGeoResult(geoResult),
      markerPosition: location,
      ...(updateMapPos ? { mapPosition: location } : {}),
    })
  }

  /**
   * When the user types an address in the search box
   * @param place
   */
  onPlaceSelected = async place => {
    console.log('plc', place) // eslint-disable-line no-console
    if (isEmpty(place.address_components)) {
      return
    }
    const placeAddress = place.formatted_address
    const latValue = place.geometry.location.lat()
    const lngValue = place.geometry.location.lng()
    console.log('onPlaceSelect - Place Address', placeAddress)

    if (!this.props.areaMode) {
      this.saveInStateStreetAddressDetails(latValue, lngValue, place, true)
      return
    }

    const geoCodeResp = await Geocode.fromLatLng(latValue, lngValue)
    console.log('geoCodeResp - onPlaceSelected', geoCodeResp) // eslint-disable-line no-console
    const userAreaOptions = this.getUserAreaOptionsFromGeocodeResponse(placeAddress, geoCodeResp)
    this.setState({
      userAreaOptions,
      address: userAreaOptions[0].caption,
      markerPosition: userAreaOptions[0].heart,
      showChipAreaPicker: true,
    })
  }

  getUserAreaOptionsFromGeocodeResponse = (placeAddress, geoResp) => {
    const levels = ['locality', 'administrative_area_level_2', 'administrative_area_level_1']
    let minLevel = 0
    if (placeAddress) {
      const exactResult = geoResp.results.find(r => r.formatted_address === placeAddress)
      console.log('exactResult', exactResult)
      if (exactResult) {
        minLevel = Math.max(levels.findIndex(l => exactResult.types.some(t => t === l)), 0)
        // if (minLevel < 0) minLevel = 0
      }
    }

    const userAreaOptions = []
    console.log(geoResp.results)
    // eslint-disable-next-line no-plusplus
    for (let id = 0; id < 3 - minLevel; id++) {
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
    console.log(userAreaOptions)
    return userAreaOptions
  }

  handleAddressChange = event => {
    this.setState({ address: event.target.value })
  }

  handleShowMapToggle = () => {
    this.setState(prev => ({ showMap: !prev.showMap }))
  }

  handleAreaSelection = updatedAreaSelection => {
    this.setState({ currentAreaSelection: [...updatedAreaSelection] })
  }

  handleAddNewArea = async () => {
    const { lat, lng } = this.props.center
    const geoCodeResp = await Geocode.fromLatLng(lat, lng)
    console.log('geoCodeResp - handleAddNewArea', geoCodeResp) // eslint-disable-line no-console
    const userAreaOptions = this.getUserAreaOptionsFromGeocodeResponse(null, geoCodeResp)
    // this.setState({ userAreaOptions })
    this.setState({ userAreaOptions, showChipAreaSelect: false, showChipAreaPicker: true })
  }

  addNewUserArea = newUserArea => {
    this.setState(prev => {
      let addedUserAreasUpdate = {}
      if (!prev.addedUserAreas.some(x => x.caption === newUserArea.caption))
        addedUserAreasUpdate = { addedUserAreas: [...prev.addedUserAreas, newUserArea] }
      let currentAreaSelectionUpdate = {}
      if (!prev.currentAreaSelection.some(x => x.caption === newUserArea.caption))
        currentAreaSelectionUpdate = { currentAreaSelection: [...prev.currentAreaSelection, newUserArea] }

      const mapViewport = getMapViewportFromAreas([newUserArea])

      return {
        ...addedUserAreasUpdate,
        ...currentAreaSelectionUpdate,
        showChipAreaSelect: true,
        mapViewport,
      }
    })
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

  onChipOtherClick = () => {
    this.setState({ showChipAreaPicker: false })
  }

  render() {
    const { classes, inputComponent, inputProps, boundaries, areaMode } = this.props
    const inputPlaceholder = areaMode ? 'Search for an area center' : 'Enter your address'
    const {
      address,
      showChipAreaSelect,
      userAreaOptions,
      showMap,
      addedUserAreas,
      currentAreaSelection,
      markerPosition,
      showChipAreaPicker,
      mapViewport,
    } = this.state
    let boundariesAndUserAreas = []

    // if (this.props.center.lat === undefined) {
    //   return <div style={{ height: this.state.height }} />
    // }

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
              currentSelection={currentAreaSelection}
              onChange={this.handleAreaSelection}
              onAddNewArea={this.handleAddNewArea}
            />
          ) : !showChipAreaPicker ? (
            <GmapsAutocomplete
              onPlaceSelected={this.onPlaceSelected}
              inputComponent={inputComponent}
              inputProps={{
                fullWidth: true,
                placeholder: inputPlaceholder,
                value: address,
                onChange: this.handleAddressChange,
                ...inputProps,
              }}
            />
          ) : (
            areaMode &&
            showChipAreaPicker && (
              <ChipAreaPicker
                userAreaOptions={userAreaOptions || []}
                handleChipClick={this.addNewUserArea}
                onChipOtherClick={this.onChipOtherClick}
              />
            )
          )}
          <div className={classes.iconButton}>
            <IconButton onClick={this.handleShowMapToggle} color="primary" aria-label="map-pin-drop">
              <PinDrop />
            </IconButton>
          </div>
        </div>
        {showMap &&
          (areaMode ? (
            <GmapsAreaWindow
              areas={currentAreaSelection}
              boundaries={boundaries}
              containerElement={<div style={{ height: this.props.height }} />}
              mapElement={<div style={{ height: '100%' }} />}
              mapPosition={this.state.mapPosition}
              markerPosition={this.state.markerPosition}
              onAreaChange={this.handleAreaChangeOnMapWindow}
              onMarkerDragEnd={this.onMarkerDragEnd}
              zoom={this.props.zoom}
              mapViewport={mapViewport}
            />
          ) : (
            <GmapsWindow
              containerElement={<div style={{ height: this.props.height }} />}
              mapElement={<div style={{ height: '100%' }} />}
              mapPosition={this.state.mapPosition}
              markerPosition={this.state.markerPosition}
              onMarkerDragEnd={this.onMarkerDragEnd}
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
  currentLocation: PropTypes.object,
  height: PropTypes.string,
  zoom: PropTypes.number,
  inputComponent: PropTypes.elementType,
  inputProps: PropTypes.object,
  value: PropTypes.any,
}

GmapsAddress.defaultProps = {
  areaMode: false,
  currentLocation: TheHeartOfKendall,
  height: '600px',
  zoom: 15,
  inputComponent: GmapsAddressInput,
  inputProps: {},
}

export default withStyles(styles)(withGmapsContext(GmapsAddress))
