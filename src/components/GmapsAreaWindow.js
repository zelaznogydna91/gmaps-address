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

const extendViewport = (viewport, coords) => {
  if (!viewport)
    return {
      sw: { lat: coords.lat, lng: coords.lng },
      ne: { lat: coords.lat, lng: coords.lng },
    }
  const { sw, ne } = viewport
  if (coords.lat > ne.lat) ne.lat = coords.lat
  if (coords.lng > ne.lng) ne.lng = coords.lng
  if (coords.lat < sw.lat) sw.lat = coords.lat
  if (coords.lng < sw.lng) sw.lng = coords.lng
  return viewport
}

const getMapViewportFromBoundaries = boundaries =>
  boundaries.reduce((viewport, boundary) => {
    const polyViewport = boundary.polygon.reduce((pv, coords) => extendViewport(pv, coords), null)
    // the winner
    return Object.assign(viewport || {}, extendViewport(extendViewport(viewport, polyViewport.sw), polyViewport.ne))
  }, null)

export default withGoogleMap(props => {
  const mapRef = useRef()
  const polyRefs = useRef([...Array(props.areas.length)].map(() => createRef()))
  const markerRef = useRef()

  useEffect(() => {
    console.log('did 2')
    if (!isEmpty(props.boundaries)) {
      console.log('did 3')
      const mapViewport = getMapViewportFromBoundaries(props.boundaries)
      console.log('mapViewport', mapViewport)
      const latlngBounds = new google.maps.LatLngBounds(mapViewport.sw, mapViewport.ne)
      // mapViewportCenter = latlngBounds.getCenter()
      mapRef.current.fitBounds(latlngBounds)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    getGmapsMarkerInstance(markerRef).setAnimation(MarkerAnimations.SMALL_DROP)
  }, [props.mapPosition])

  function updateAreaPolyOnVertexRemove(areaId, vertexId) {
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
    getGmapsMarkerInstance(markerRef).setAnimation(MarkerAnimations.SMALL_DROP)
    props.onMarkerDragEnd(event)
  }

  console.log('did 1')
  return (
    <GoogleMap ref={mapRef} google={props.google} center={props.mapPosition}>
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
        ref={markerRef}
        key={0}
        google={props.google}
        visible
        animation={google.maps.Animation.DROP}
        draggable
        onDragEnd={props.onMarkerDragEnd}
        position={{ lat: props.markerPosition.lat, lng: props.markerPosition.lng }}
      />
    </GoogleMap>
  )
})
