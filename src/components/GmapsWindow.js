/* global google */
import React, { useState } from 'react'
import {
  withGoogleMap,
  GoogleMap,
  Polygon,
  // withScriptjs,
  // InfoWindow,
  Marker,
} from 'react-google-maps'

let nextMarkerId = 1
const initialTriangleCoords = [
  { lat: 25.774, lng: -80.19 },
  { lat: 18.466, lng: -66.118 },
  { lat: 32.321, lng: -64.757 },
  { lat: 18.466, lng: -80.19 },
]
export default withGoogleMap(props => {
  const [triangleCoords, setTriangleCoords] = useState(initialTriangleCoords)
  const [markersDefs, setMarkersDef] = useState([{ id: 0 }])
  const bermudaTriangle = new google.maps.Polygon({ paths: triangleCoords })

  function handleClick(e) {
    const resultColor = google.maps.geometry.poly.containsLocation(e.latLng, bermudaTriangle) ? 'blue' : 'red'
    const resultPath = google.maps.geometry.poly.containsLocation(e.latLng, bermudaTriangle)
      ? // A triangle.
        'm 0 -1 l 1 2 -2 0 z'
      : google.maps.SymbolPath.CIRCLE

    // eslint-disable-next-line no-plusplus
    setMarkersDef([...markersDefs, { position: e.latLng, resultColor, resultPath, id: nextMarkerId++ }])
  }
  function triangleCoodDragEnd(coordId, latLng) {
    const newCoords = [...triangleCoords]
    newCoords[coordId] = latLng
    setTriangleCoords(newCoords)
  }

  return (
    <GoogleMap
      google={props.google}
      defaultZoom={props.zoom}
      defaultCenter={{ lat: props.mapPosition.lat, lng: props.mapPosition.lng }}
      onClick={handleClick}
    >
      <Polygon path={triangleCoords} />
      {triangleCoords.map((tc, id) => (
        <Marker
          key={id}
          google={props.google}
          visible
          draggable
          onDrag={e => triangleCoodDragEnd(id, e.latLng)}
          position={tc}
          icon={{
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: 'red',
            fillOpacity: 1,
            strokeColor: 'red',
            strokeWeight: 0.5,
            scale: 10,
          }}
        />
      ))}
      {markersDefs.map(md =>
        md.id === 0 ? (
          <Marker
            key={0}
            google={props.google}
            visible
            draggable
            onDragEnd={props.onMarkerDragEnd}
            position={{ lat: props.markerPosition.lat, lng: props.markerPosition.lng }}
          />
        ) : (
          <Marker
            key={md.id}
            google={props.google}
            visible
            // draggable
            // onDragEnd={props.onMarkerDragEnd}
            position={md.position}
            icon={{
              path: md.resultPath,
              fillColor: md.resultColor,
              fillOpacity: 0.2,
              strokeColor: 'white',
              strokeWeight: 0.5,
              scale: 10,
            }}
          />
        )
      )}
    </GoogleMap>
  )
})
