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

  // const bermudaTriangle = new google.maps.Polygon({ paths: triangleCoords })
  // function handleClick(e) {
  //   const resultColor = google.maps.geometry.poly.containsLocation(e.latLng, bermudaTriangle) ? 'blue' : 'red'
  //   const resultPath = google.maps.geometry.poly.containsLocation(e.latLng, bermudaTriangle)
  //     ? // A triangle.
  //       'm 0 -1 l 1 2 -2 0 z'
  //     : google.maps.SymbolPath.CIRCLE

  //   // eslint-disable-next-line no-plusplus
  //   setMarkersDef([...markersDefs, { position: e.latLng, resultColor, resultPath, id: nextMarkerId++ }])
  // }

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

  console.log('did 1')
  return (
    <GoogleMap ref={mapRef} google={props.google} defaultCenter={props.mapPosition}>
      {props.boundaries.map(b => (
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
      {props.areas.map((area, id) => (
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
        key={0}
        google={props.google}
        visible
        draggable
        onDragEnd={props.onMarkerDragEnd}
        position={{ lat: props.markerPosition.lat, lng: props.markerPosition.lng }}
      />
    </GoogleMap>
  )
})
