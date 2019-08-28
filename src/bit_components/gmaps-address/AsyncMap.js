import React from 'react'
import {
  withGoogleMap,
  GoogleMap,
  withScriptjs,
  // InfoWindow,
  Marker,
} from 'react-google-maps'
import Autocomplete from 'react-google-autocomplete'

export default withScriptjs(
  withGoogleMap(props => (
    <>
      <Autocomplete
        style={{
          width: '100%',
          height: '30px',
          paddingLeft: '16px',
          marginTop: '50px',
          marginBottom: '50px',
        }}
        onPlaceSelected={props.onPlaceSelected}
        componentRestrictions={{ country: 'us' }}
        types={['geocode', 'establishment']}
      />
      <GoogleMap
        google={props.google}
        defaultZoom={props.zoom}
        defaultCenter={{ lat: props.mapPosition.lat, lng: props.mapPosition.lng }}
      >
        <Marker
          google={props.google}
          name="Dolores park"
          visible
          draggable
          onDragEnd={props.onMarkerDragEnd}
          position={{ lat: props.markerPosition.lat, lng: props.markerPosition.lng }}
        />
      </GoogleMap>
    </>
  ))
)
