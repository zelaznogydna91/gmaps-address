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

// export default function GmapsAddress(props) {
//   const apiKey = useContext(GmapsContext)
//   return (
//     <div style={{ margin: '100px' }}>
//       <Map
//         areaMode={props.areaMode}
//         gmapsApiKey={apiKey}
//         center={{ lat: 25.678167, lng: -80.404497 }}
//         height="300px"
//         zoom={17}
//         inputComponent={GmapsAddressInput}
//         inputProps={{}}
//       />
//     </div>
//   )
// }

// GmapsAddress.propTypes = {
//   areaMode: PropTypes.bool,
// }
// ---------------------------------------------- MAP TO GMAPSADDRESS

const styles = theme => ({})

class GmapsAddress extends Component {
  constructor(props) {
    super(props)
    Geocode.setApiKey(props.apiKey)
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
      showMap: false,
      showChipAreaSelect: false,
      showAddressInput: true,
      areas: [
        'Kendall, Fl',
        'Miami, Fl',
        'Coral Gables, Fl',
        'Weston, Fl',
        'Ft. Lauderdale, Fl',
        'Little Havana, Fl',
        'Hialeah, Fl',
        'Homestead, Fl',
        'Miami Springs, Fl',
        'Miami Garden, Fl',
      ],
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
      currState.address !== nextState.address ||
      currState.showMap !== nextState.showMap
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
    console.log('sss', newLat, newLng)
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
    if (isEmpty(place.address_components)) {
      // const sugestions = document.getElementsByClassName('pac-item')
      // if (isEmpty(sugestions)) return
      // window.alert(sugestions[0].innerHTML)
      // this.simulateClick(sugestions[0])
      return
    }
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

  handleShowMapToggle = () => {
    this.setState(prev => ({ showMap: !prev.showMap }))
  }

  handleChipClick = param => this.addNewAreaToList(param)

  addNewAreaToList = param => {
    alert(param)
  }

  render() {
    const { classes, inputComponent, inputProps, areaMode } = this.props
    const { showChipAreaSelect, showAddressInput, showMap } = this.state

    if (this.props.center.lat === undefined) {
      return <div style={{ height: this.state.height }} />
    }
    return (
      <div>
        {areaMode && showChipAreaSelect ? (
          <ChipAreaSelect areas={this.state.areas} />
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
              <ChipAreaPicker
                areas={{
                  area: this.state.area,
                  city: this.state.city,
                  state: this.state.state,
                }}
                handleChipClick={this.handleChipClick}
              />
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
