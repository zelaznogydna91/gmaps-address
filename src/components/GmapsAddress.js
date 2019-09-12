/* eslint-disable react/no-unused-state */
import isEmpty from 'lodash/isEmpty'
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

Geocode.enableDebug()
const styles = theme => ({
  gmapsWindow: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
})

class GmapsAddress extends Component {
  constructor(props) {
    super(props)
    Geocode.setApiKey(props.apiKey)
    this.state = {
      address: '',
      area: '',
      city: '',
      state: '',

      mapPosition: {
        lat: props.center.lat,
        lng: props.center.lng,
      },
      markerPosition: {
        lat: props.center.lat,
        lng: props.center.lng,
      },

      addedUserAreas: [],
      currentAreaSelection: [],
      userAreaOptions: null,

      showAddressInput: true,
      showChipAreaSelect: props.areaMode,
      showMap: false,
    }
  }

  /**
   * Get the current address from the default map position and set those values in the state
   */
  componentDidMount() {
    const { lat, lng } = this.props.center
    Geocode.fromLatLng(lat, lng).then(
      response => {
        this.saveStreetAddressDetails(lat, lng, response)
      },
      error => {
        console.error(error) // eslint-disable-line no-console
      }
    )
  }

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
        this.saveStreetAddressDetails(newLat, newLng, response)
      },
      error => {
        console.error(error) // eslint-disable-line no-console
      }
    )
  }

  saveStreetAddressDetails = (newLat, newLng, geoResp, updateMapPos) => {
    const addressArray = geoResp.results[0].address_components
    const area =
      (addressArray.find(x => x.types.some(t => ['sublocality_level_1', 'locality'].includes(t))) || {}).long_name || ''
    const city = (addressArray.find(x => x.types[0] === 'administrative_area_level_2') || {}).long_name || ''
    const state = (addressArray.find(x => x.types[0] === 'administrative_area_level_1') || {}).long_name || ''
    const address = geoResp.results[0].formatted_address

    console.log('city', city, area, state) // eslint-disable-line no-console

    this.setState({
      address: address || '',
      area: area || '',
      city: city || '',
      state: state || '',
      markerPosition: { lat: newLat, lng: newLng },
      ...(updateMapPos
        ? {
            mapPosition: { lat: newLat, lng: newLng },
          }
        : {}),
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

    const geoCodeResp = await Geocode.fromLatLng(latValue, lngValue)

    if (this.props.areaMode) {
      console.log('onPlaceSelect - Place Address', placeAddress)

      console.log('geoCodeResp - onPlaceSelected', geoCodeResp) // eslint-disable-line no-console
      const userAreaOptions = this.getUserAreaOptionsFromGeocodeResponse(placeAddress, geoCodeResp)
      this.setState({ userAreaOptions })
      return
    }

    this.saveStreetAddressDetails(latValue, lngValue, geoCodeResp, true)
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

  render() {
    const { classes, inputComponent, inputProps, boundaries, areaMode } = this.props
    const inputPlaceholder = areaMode ? 'Search for an area center' : 'Enter your address'
    const { address, showChipAreaSelect, userAreaOptions, showMap, addedUserAreas, currentAreaSelection } = this.state
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
            inputProps={{ fullWidth: true }}
            options={boundariesAndUserAreas}
            currentSelection={currentAreaSelection}
            onChange={this.handleAreaSelection}
            onAddNewArea={this.handleAddNewArea}
          />
        ) : (
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
        )}
        {
          <IconButton onClick={this.handleShowMapToggle} color="primary" aria-label="map-pin-drop">
            <PinDrop />
          </IconButton>
        }
        {showMap &&
          (areaMode ? (
            <GmapsAreaWindow
              containerElement={<div style={{ height: this.props.height }} />}
              mapElement={<div style={{ height: '100%' }} />}
              zoom={this.props.zoom}
              mapPosition={this.state.mapPosition}
              markerPosition={this.state.markerPosition}
              onMarkerDragEnd={this.onMarkerDragEnd}
              boundaries={boundaries}
              areas={currentAreaSelection}
              onAreaChange={this.handleAreaChangeOnMapWindow}
            />
          ) : (
            <GmapsWindow
              containerElement={<div style={{ height: this.props.height }} />}
              mapElement={<div style={{ height: '100%' }} />}
              zoom={this.props.zoom}
              mapPosition={this.state.mapPosition}
              markerPosition={this.state.markerPosition}
              onMarkerDragEnd={this.onMarkerDragEnd}
            />
          ))}
        {areaMode && <ChipAreaPicker userAreaOptions={userAreaOptions || []} handleChipClick={this.addNewUserArea} />}
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
  height: '600px',
  zoom: 15,
  inputComponent: GmapsAddressInput,
  inputProps: {},
}

export default withStyles(styles)(withGmapsContext(GmapsAddress))
