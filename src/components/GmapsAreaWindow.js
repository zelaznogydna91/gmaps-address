/* global google */
import isEmpty from 'lodash/isEmpty'
import React, { useState, useRef, createRef, useEffect } from 'react'
import {
  withGoogleMap,
  GoogleMap,
  Polygon,
  // withScriptjs,
  // InfoWindow,
  Marker,
} from 'react-google-maps'
import { getGmapsMarkerInstance, MarkerAnimations } from './WithGoogleApi'

// let nextMarkerId = 1

const polyColors = ['rebeccapurple', 'fuchsia', 'aqua', 'darkkhaki', 'lightsalmon', 'hotpink', 'brown']

export default withGoogleMap(props => {
  const { mapViewport } = props
  const mapRef = useRef()
  const polyRefs = useRef([...Array(props.areas.length)].map(() => createRef()))
  const markerRef = useRef()

  useEffect(() => {
    if (!isEmpty(mapViewport)) {
      console.log('mapViewport', mapViewport) // eslint-disable-line no-console
      const latlngBounds = new google.maps.LatLngBounds(mapViewport.sw, mapViewport.ne)
      mapRef.current.fitBounds(latlngBounds)
    }
  }, [mapViewport])

  useEffect(() => {
    getGmapsMarkerInstance(markerRef).setAnimation(MarkerAnimations.SMALL_DROP)
  }, [props.mapPosition])

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
      console.log('right click', e)
      if (e.vertex !== undefined) {
        updateAreaPolyOnVertexRemove(areaId, e.vertex)
      }
    }
  }

  function updateAreaPolyOnVertexAdditionOrDrag(areaId) {
    const polyRef = polyRefs.current[areaId]
    const poly = polyRef.current.getPath().g.map(x => ({ lat: x.lat(), lng: x.lng() }))
    props.onAreaChange(areaId, poly)
  }

  function handleMouseUp(areaId) {
    return e => {
      console.log('mouse up', e)
      if (e.path !== undefined && e.vertex === undefined) {
        updateAreaPolyOnVertexAdditionOrDrag(areaId)
      }
    }
  }

  const onMarkerDragStart = () => {
    getGmapsMarkerInstance(markerRef).setAnimation(MarkerAnimations.BOUNCE)
  }
  const onMarkerDragEnd = event => {
    props.onMarkerDragEnd(event)
    getGmapsMarkerInstance(markerRef).setAnimation(MarkerAnimations.SMALL_DROP)
  }
  // const onMapClick = event => {
  //   props.onMarkerDragEnd(event)
  //   getGmapsMarkerInstance(markerRef).setAnimation(MarkerAnimations.SMALL_DROP)
  // }

  console.log('did 1')
  return (
    <GoogleMap ref={mapRef} google={props.google} center={props.mapPosition} onClick={ev => onMarkerDragEnd(ev)}>
      {props.boundaries &&
        props.boundaries.map(b => (
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
              strokeColor: polyColors[id % 7],
              fillColor: polyColors[id % 7],
              fillOpacity: 0.05,
            }}
            onRightClick={handleRightClick(id)}
            ref={polyRefs.current[id]}
            onMouseUp={handleMouseUp(id)}
          />
        ))}
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
    </GoogleMap>
  )
})
