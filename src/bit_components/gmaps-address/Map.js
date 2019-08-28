import React, { Component } from 'react'
import Geocode from 'react-geocode'
import LocationCityIcon from '@material-ui/icons/LocationCity'
import TerrainIcon from '@material-ui/icons/Terrain'
import MapIcon from '@material-ui/icons/Map'
import { Chip } from '@material-ui/core'
import AsyncMap from './AsyncMap'

Geocode.enableDebug()

class Map extends Component {
  constructor(props) {
    super(props)
    console.log(props.gmapsApiKey)
    Geocode.setApiKey(props.gmapsApiKey)
    this.state = {
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
  shouldComponentUpdate(nextProps, nextState) {
    const currState = this.state
    if (
      currState.markerPosition.lat !== this.props.center.lat ||
      currState.state !== nextState.state ||
      currState.area !== nextState.area ||
      currState.city !== nextState.city ||
      currState.address !== nextState.address
    ) {
      return true
    }
    if (this.props.center.lat === nextProps.center.lat) {
      return false
    }
    return true
  }

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
        const state = this.getState(addressArray)
        const area = this.getArea(addressArray)
        const city = this.getCity(addressArray)
        const address = response.results[0].formatted_address
        this.setState({
          state: state || '',
          area: area || '',
          city: city || '',
          address: address || '',
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
    const state = this.getState(place.address_components)
    const area = this.getArea(place.address_components)
    const city = this.getCity(place.address_components)
    const address = place.formatted_address
    const latValue = place.geometry.location.lat()
    const lngValue = place.geometry.location.lng()

    const geoCodeResp = await Geocode.fromLatLng(latValue, lngValue)
    console.log('geoCodeResp', geoCodeResp) // eslint-disable-line no-console

    // Set these values in the state.
    this.setState({
      state: state || '',
      area: area || '',
      city: city || '',
      address: address || '',
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

  render() {
    if (this.props.center.lat === undefined) {
      return <div style={{ height: this.props.height }} />
    }
    return (
      <div>
        <Chip icon={<LocationCityIcon />} label={this.state.city} />
        <Chip icon={<TerrainIcon />} label={this.state.area} />
        <Chip icon={<MapIcon />} label={this.state.state} />

        <AsyncMap
          googleMapURL={`https://maps.googleapis.com/maps/api/js?key=${this.props.gmapsApiKey}&libraries=places`}
          loadingElement={<div style={{ height: '1300%' }} />}
          containerElement={<div style={{ height: this.props.height }} />}
          mapElement={<div style={{ height: '100%' }} />}
          zoom={this.props.zoom}
          mapPosition={this.state.markerPosition}
          markerPosition={this.state.markerPosition}
          onPlaceSelected={this.onPlaceSelected}
          onMarkerDragEnd={this.onMarkerDragEnd}
        />
      </div>
    )
  }
}
export default Map
