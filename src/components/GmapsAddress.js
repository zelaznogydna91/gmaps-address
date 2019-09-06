/* eslint-disable react/no-unused-state */
import isEmpty from 'lodash/isEmpty'
import React, { Component, useContext } from 'react'
import PropTypes from 'prop-types'
import Geocode from 'react-geocode'
import LocationCityIcon from '@material-ui/icons/LocationCity'
import TerrainIcon from '@material-ui/icons/Terrain'
import MapIcon from '@material-ui/icons/Map'
import { Chip, Paper, IconButton } from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles'
import PinDrop from '@material-ui/icons/PinDrop'
import { withGmapsContext } from './WithGoogleApi'
import GmapsAddressInput from './GmapsAddressInput'
import GmapsWindow from './GmapsWindow'
import GmapsAutocomplete from './GmapsAutocomplete'
import ChipAreaSelect from './ChipAreaSelect'
import ChipAreaPicker from './ChipAreaPicker'

Geocode.enableDebug()
const styles = theme => ({})

class GmapsAddress extends Component {
  constructor(props) {
    super(props)
    Geocode.setApiKey(props.apiKey)
    this.state = {
      userAreaOptions: null,
      addedUserAreas: [],
      state: '',
      area: '',
      city: '',
      address: '',
      mapPosition: {
        lat: props.center.lat,
        lng: props.center.lng,
      },
      markerPosition: {
        lat: props.center.lat,
        lng: props.center.lng,
      },
      showMap: false,
      showChipAreaSelect: props.areaMode,
      showAddressInput: true,
      currentAreaSelection: [],
    }
  }

  /**
   * Get the current address from the default map position and set those values in the state
   */
  componentDidMount() {
    const { mapPosition } = this.state
    Geocode.fromLatLng(mapPosition.lat, mapPosition.lng).then(
      response => {
        const address = response.results[0].formatted_address
        const addressArray = response.results[0].address_components
        const city = this.getCity(addressArray)
        const area = this.getArea(addressArray)
        const state = this.getState(addressArray)

        console.log('city', city, area, state) // eslint-disable-line no-console

        this.setState({
          address: address || '',
          area: area || '',
          city: city || '',
          state: state || '',
        })
      },
      error => {
        console.error(error) // eslint-disable-line no-console
      }
    )
  }

  /**
   * Component should only update ( meaning re-render ),
   * when the user selects the address, or drags the pin
   *
   * @param nextProps
   * @param nextState
   * @return {boolean}
   */
  // shouldComponentUpdate(nextProps, nextState) {
  //   const currState = this.state
  //   if (
  //     currState.markerPosition.lat !== this.props.center.lat ||
  //     currState.state !== nextState.state ||
  //     currState.area !== nextState.area ||
  //     currState.city !== nextState.city ||
  //     currState.address !== nextState.address ||
  //     currState.showMap !== nextState.showMap ||
  //     currState.currentAreaSelection !== nextState.currentAreaSelection
  //   ) {
  //     return true
  //   }
  //   if (this.props.center.lat === nextProps.center.lat) {
  //     return false
  //   }
  //   return true
  // }

  /**
   * Get the city from the selected address
   *
   * @param addressArray
   * @return {string}
   */
  getCity = addressArray => (addressArray.find(x => x.types[0] === 'administrative_area_level_2') || {}).long_name || ''

  /**
   * Get the area from the selected address
   *
   * @param addressArray
   * @return {string}
   */
  getArea = addressArray =>
    (addressArray.find(x => x.types.some(t => ['sublocality_level_1', 'locality'].includes(t))) || {}).long_name || ''

  /**
   * Get the state from the selected address
   *
   * @param addressArray
   * @return {string}
   */
  getState = addressArray =>
    (addressArray.find(x => x.types[0] === 'administrative_area_level_1') || {}).long_name || ''

  /**
   * And function for city,state and address input
   * @param event
   */
  onChange = event => {
    this.setState({ [event.target.name]: event.target.value })
  }

  /**
   * This Event triggers when the marker window is closed
   *
   * @param event
   */
  onInfoWindowClose = event => {} // eslint-disable-line no-unused-vars

  /**
   * When the marker is dragged you get the lat and long using the functions available from event object.
   * Use geocode to get the address, city, area and state from the lat and lng positions.
   * And then set those values in the state.
   *
   * @param event
   */
  onMarkerDragEnd = event => {
    const newLat = event.latLng.lat()
    const newLng = event.latLng.lng()
    Geocode.fromLatLng(newLat, newLng).then(
      response => {
        const addressArray = response.results[0].address_components
        const area = this.getArea(addressArray)
        const city = this.getCity(addressArray)
        const state = this.getState(addressArray)
        const address = response.results[0].formatted_address
        this.setState({
          area: area || '',
          city: city || '',
          state: state || '',
          address: address || '',
          markerPosition: { lat: newLat, lng: newLng },
        })
      },
      error => {
        console.error(error) // eslint-disable-line no-console
      }
    )
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

    if (this.props.areaMode) {
      const geoCodeResp = await Geocode.fromLatLng(latValue, lngValue)
      console.log('geoCodeResp - onPlaceSelected', geoCodeResp) // eslint-disable-line no-console
      const userAreaOptions = this.getUserAreaOptionsFromGeocodeResponse(placeAddress, geoCodeResp)
      this.setState({ userAreaOptions })
      return
    }

    const area = this.getArea(place.address_components)
    const city = this.getCity(place.address_components)
    const state = this.getState(place.address_components)
    // Set these values in the state.
    this.setState({
      area: area || '',
      city: city || '',
      state: state || '',
      address: placeAddress || '',
      markerPosition: {
        lat: latValue,
        lng: lngValue,
      },
      mapPosition: {
        lat: latValue,
        lng: lngValue,
      },
    })
  }

  getUserAreaOptionsFromGeocodeResponse = (placeAddress, geoResp) => {
    const levels = ['locality', 'administrative_area_level_2', 'administrative_area_level_1']
    let minLevel = 0
    if (placeAddress) {
      const exactResult = geoResp.results.find(r => r.formatted_address === placeAddress)
      minLevel = levels.findIndex(l => exactResult.types.some(t => t === l))
      if (minLevel < 0) minLevel = 0
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
    this.setState({ userAreaOptions })
    this.setState({ showChipAreaSelect: false, userAreaOptions })
  }

  addNewUserArea = newUserArea => {
    // eslint-disable-next-line no-unused-expressions
    this.state.currentAreaSelection.some(s => s.caption === newUserArea.caption)
      ? this.setState({
          showChipAreaSelect: true,
        })
      : this.setState(prev => ({
          addedUserAreas: [...prev.addedUserAreas, newUserArea],
          currentAreaSelection: [...prev.currentAreaSelection, newUserArea],
          showChipAreaSelect: true,
        }))
  }

  render() {
    const { classes, inputComponent, inputProps, boundaries, areaMode } = this.props
    const { showChipAreaSelect, userAreaOptions, showMap, addedUserAreas, currentAreaSelection } = this.state
    let boundariesAndUserAreas = []

    if (this.props.center.lat === undefined) {
      return <div style={{ height: this.state.height }} />
    }

    if (areaMode) {
      boundariesAndUserAreas = [...boundaries, ...addedUserAreas]
    }

    return (
      <div>
        {areaMode && showChipAreaSelect ? (
          <ChipAreaSelect
            options={boundariesAndUserAreas}
            currentSelection={currentAreaSelection}
            onChange={this.handleAreaSelection}
            onAddNewArea={this.handleAddNewArea}
          />
        ) : (
          <div>
            <div style={{ display: 'flex' }}>
              <GmapsAutocomplete
                onPlaceSelected={this.onPlaceSelected}
                inputComponent={inputComponent}
                inputProps={{
                  fullWidth: true,
                  ...inputProps,
                }}
              />
              <IconButton onClick={this.handleShowMapToggle} color="primary" aria-label="map-pin-drop">
                <PinDrop />
              </IconButton>
            </div>
            {showMap && (
              <GmapsWindow
                containerElement={<div style={{ height: this.props.height }} />}
                mapElement={<div style={{ height: '100%' }} />}
                zoom={this.props.zoom}
                mapPosition={this.state.markerPosition}
                markerPosition={this.state.markerPosition}
                onMarkerDragEnd={this.onMarkerDragEnd}
              />
            )}
            {areaMode && (
              <ChipAreaPicker userAreaOptions={userAreaOptions || []} handleChipClick={this.addNewUserArea} />
            )}
          </div>
        )}
      </div>
    )
  }
}

GmapsAddress.propTypes = {
  apiKey: PropTypes.string,
  areaMode: PropTypes.bool,
  center: PropTypes.object,
  height: PropTypes.string,
  zoom: PropTypes.number,
  inputComponent: PropTypes.elementType,
  inputProps: PropTypes.object,
}

GmapsAddress.defaultProps = {
  areaMode: false,
  center: { lat: 25.678167, lng: -80.404497 },
  height: '300px',
  zoom: 11,
  inputComponent: GmapsAddressInput,
  inputProps: {},
}

export default withStyles(styles)(withGmapsContext(GmapsAddress))
