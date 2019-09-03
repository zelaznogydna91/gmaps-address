import React from 'react'
import {
  withGoogleMap,
  GoogleMap,
  // withScriptjs,
  // InfoWindow,
  Marker,
} from 'react-google-maps'

export default withGoogleMap(props => (
  <GoogleMap
    google={props.google}
    defaultZoom={props.zoom}
    defaultCenter={{ lat: props.mapPosition.lat, lng: props.mapPosition.lng }}
  >
    <Marker
      google={props.google}
      visible
      draggable
      onDragEnd={props.onMarkerDragEnd}
      position={{ lat: props.markerPosition.lat, lng: props.markerPosition.lng }}
    />
  </GoogleMap>
))
