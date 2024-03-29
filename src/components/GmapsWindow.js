import React, { useRef, useEffect } from 'react'
import { withGoogleMap, GoogleMap, Marker } from 'react-google-maps'
import { getGmapsMarkerInstance, MarkerAnimations } from './utils'

export default withGoogleMap(props => {
  const markerRef = useRef()
  useEffect(() => {
    const marker = getGmapsMarkerInstance(markerRef.current)
    if (marker) marker.setAnimation(MarkerAnimations.SMALL_DROP)
  }, [props.mapPosition])

  const onMarkerDragStart = () => {
    const marker = getGmapsMarkerInstance(markerRef.current)
    if (marker) marker.setAnimation(MarkerAnimations.BOUNCE)
  }
  const onMarkerDragEnd = event => {
    props.onMarkerDragEnd(event)
    const marker = getGmapsMarkerInstance(markerRef.current)
    if (marker) marker.setAnimation(MarkerAnimations.SMALL_DROP)
  }
  return (
    <GoogleMap zoom={props.zoom} google={props.google} center={props.mapPosition} onClick={ev => onMarkerDragEnd(ev)}>
      <Marker
        draggable
        google={props.google}
        key={0}
        onDragEnd={onMarkerDragEnd}
        onDragStart={onMarkerDragStart}
        position={{ lat: props.markerPosition.lat, lng: props.markerPosition.lng }}
        ref={markerRef}
        visible
      />
    </GoogleMap>
  )
})
