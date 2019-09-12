import React, { useRef, useEffect } from 'react'
import { withGoogleMap, GoogleMap, Marker } from 'react-google-maps'
import { getGmapsMarkerInstance, MarkerAnimations } from './WithGoogleApi'

export default withGoogleMap(props => {
  const markerRef = useRef()
  useEffect(() => {
    getGmapsMarkerInstance(markerRef).setAnimation(MarkerAnimations.SMALL_DROP)
  }, [props.mapPosition])

  const onMarkerDragStart = () => {
    getGmapsMarkerInstance(markerRef).setAnimation(MarkerAnimations.BOUNCE)
  }
  const onMarkerDragEnd = event => {
    getGmapsMarkerInstance(markerRef).setAnimation(MarkerAnimations.SMALL_DROP)
    props.onMarkerDragEnd(event)
  }

  return (
    <GoogleMap zoom={props.zoom} google={props.google} center={props.mapPosition}>
      <Marker
        ref={markerRef}
        draggable
        google={props.google}
        key={0}
        // animation={markerAnimation}
        onDragStart={onMarkerDragStart}
        onDragEnd={onMarkerDragEnd}
        position={{ lat: props.markerPosition.lat, lng: props.markerPosition.lng }}
        visible
      />
    </GoogleMap>
  )
})
