/* global google */
import isEmpty from 'lodash/isEmpty'
import React, { useRef, createRef, useEffect } from 'react'
import {
  withGoogleMap,
  GoogleMap,
  Polygon,
  // withScriptjs,
  // InfoWindow,
  Marker,
} from 'react-google-maps'
import { getGmapsMarkerInstance, MarkerAnimations } from './utils'

const polyColors = ['rebeccapurple', 'fuchsia', 'cadetblue', 'darkkhaki', 'lightsalmon', 'hotpink', 'brown']
class PolyRefMap {
  getById = id => {
    if (!this[id]) this[id] = createRef()
    return this[id]
  }

  toArray = () => Object.keys(this).filter(k => this[k].current)
}

export default withGoogleMap(props => {
  const { boundaries, areas, mapViewport, mapPosition } = props
  const mapRef = useRef()
  const boundaryPolyRefs = useRef(new PolyRefMap())
  const areaPolyRefs = useRef(new PolyRefMap())

  const markerRef = useRef()

  useEffect(() => {
    if (!isEmpty(mapViewport)) {
      const latlngBounds = new google.maps.LatLngBounds(mapViewport.sw, mapViewport.ne)
      mapRef.current.fitBounds(latlngBounds)
    }
  }, [mapViewport])

  useEffect(() => {
    const marker = getGmapsMarkerInstance(markerRef.current)
    if (marker) marker.setAnimation(MarkerAnimations.SMALL_DROP)
  }, [mapPosition])

  function updateAreaPolyOnVertexRemove(areaId, vertexId) {
    if (props.areas[areaId].polygon.length === 3) {
      props.onAreaRemove(areaId)
      return
    }
    const poly = [...props.areas[areaId].polygon]
    poly.splice(vertexId, 1)
    props.onAreaChange(areaId, poly)
  }

  function handleRightClick(areaId) {
    return e => {
      if (e.vertex !== undefined) {
        updateAreaPolyOnVertexRemove(areaId, e.vertex)
      }
    }
  }

  function updateAreaPolyOnVertexAdditionOrDrag(areaId) {
    // , point) {
    const areaPolyRef = areaPolyRefs.current.getById(areaId)
    const areaPolyCoords = areaPolyRef.current.getPath().g.map(x => ({ lat: x.lat(), lng: x.lng() }))

    props.onAreaChange(areaId, areaPolyCoords)
  }

  function handleMouseUp(areaId) {
    return e => {
      if (e.path !== undefined) {
        updateAreaPolyOnVertexAdditionOrDrag(areaId, e.latLng)
      }
    }
  }

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
    <GoogleMap ref={mapRef} google={props.google} center={props.mapPosition} onClick={ev => onMarkerDragEnd(ev)}>
      {props.boundaries &&
        props.boundaries.map((b, id) => (
          <Polygon
            key={b.caption}
            path={b.polygon}
            options={{
              clickable: false,
              strokeWeight: 2,
              strokeOpacity: 0.5,
              strokeColor: 'green',
              fillOpacity: 0.05,
              fillColor: 'lime',
            }}
            ref={boundaryPolyRefs.current.getById(id)}
          />
        ))}
      {props.areas &&
        props.areas.map((area, id) => (
          <Polygon
            key={area.caption}
            path={area.polygon}
            editable
            options={{
              clickable: true,
              strokeWeight: 2,
              strokeColor: area.isValid ? polyColors[id % 7] : 'red',
              fillColor: area.isValid ? polyColors[id % 7] : 'red',
              fillOpacity: 0.05,
            }}
            onRightClick={handleRightClick(id)}
            ref={areaPolyRefs.current.getById(id)}
            onMouseUp={handleMouseUp(id)}
          />
        ))}
      {props.showMarker && (
        <Marker
          animation={google.maps.Animation.DROP}
          draggable
          google={props.google}
          key={0}
          onDragEnd={onMarkerDragEnd}
          onDragStart={onMarkerDragStart}
          position={{ lat: props.markerPosition.lat, lng: props.markerPosition.lng }}
          ref={markerRef}
          visible
        />
      )}
    </GoogleMap>
  )
})
