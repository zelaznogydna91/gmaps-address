/* global google */
import PropTypes from 'prop-types'
import isEmpty from 'lodash/isEmpty'
import React, { useRef, createRef, useEffect, useState } from 'react'
import {
  withGoogleMap,
  GoogleMap,
  Polygon,
  // withScriptjs,
  // InfoWindow,
  Marker,
} from 'react-google-maps'
import { withGmapsContext } from './WithGoogleApi'
import {
  getGmapsPolygonInstance,
  getGmapsMarkerInstance,
  MarkerAnimations,
  isAreaWithinBounds,
  animate,
  getGmapsPoint,
  samePolygons,
  getGmapsPolygon,
  pointIsWithinGmapsPolygon,
} from './utils'

const polyColors = ['rebeccapurple', 'slateblue', 'magenta', 'indigo', 'royalblue', 'darkorange', 'coral', 'deeppink']
const polyColorsHex = ['#663399', '#6A5ACD', '#FF00FF', '#4B0082', '#4169E1', '#FF8C00', '#FF7F50', '#FF1493']
class RefMap {
  getById = id => {
    if (!this[id]) this[id] = createRef()
    return this[id]
  }

  toArray = () => Object.keys(this).filter(k => this[k].current)
}

const BaseMapComponent = withGoogleMap(props => {
  const { boundaries, areas, mapViewport, mapPosition, showErrors, editableAreas } = props
  // const update = useState()[1]
  const [editableAreaCaption, setEditableAreaCaption] = useState()
  const [zIndexMap, setZIndexMap] = useState({})
  const mapRef = useRef()
  const boundaryPolyRefs = useRef(new RefMap())
  const areaPolyRefs = useRef(new RefMap())
  const heartRefs = useRef(new RefMap())
  const markerRef = useRef()

  useEffect(() => {
    if (!isEmpty(mapViewport)) {
      const latlngBounds = new google.maps.LatLngBounds(mapViewport.sw, mapViewport.ne)
      mapRef.current.fitBounds(latlngBounds)
    }
  }, [mapViewport])

  useEffect(() => {
    const marker = getGmapsMarkerInstance(markerRef.current)
    if (marker) {
      marker.setAnimation(MarkerAnimations.SMALL_DROP)
    }
  }, [mapPosition])

  function updateAreaPolyOnVertexRemove(areaId, vertexId) {
    if (areas[areaId].polygon.length === 3) {
      props.onAreaRemove(areaId)
      return
    }
    const poly = [...areas[areaId].polygon]
    poly.splice(vertexId, 1)
    props.onAreaChange(areaId, { polygon: poly })
  }

  function handleRightClick(areaId) {
    return e => {
      if (e.vertex !== undefined) {
        updateAreaPolyOnVertexRemove(areaId, e.vertex)
      }
    }
  }

  function updateAreaPolyOnVertexAdditionOrDrag(areaId, point) {
    const areaPolyRef = areaPolyRefs.current.getById(areaId)
    const newPoly = areaPolyRef.current.getPath().g.map(x => ({ lat: x.lat(), lng: x.lng() }))

    // ensure heart within the area polygon
    if (!isAreaWithinBounds([newPoly], [areas[areaId].heart])) {
      const polyInst = getGmapsPolygonInstance(areaPolyRef.current)
      // discard change
      const prevPoly = areas[areaId].polygon
      const prevPointIndex = samePolygons(prevPoly, newPoly) // get changed coord index, or true if all same
      if (prevPointIndex < 0) {
        polyInst.setPath(prevPoly)
        return
      }
      if (prevPointIndex === true) return
      const prevPoint = prevPoly[prevPointIndex]
      const updatePoly = [...prevPoly]
      updatePoly[prevPointIndex] = point
      const fromGmapsPoint = getGmapsPoint(point)
      const toGmapsPoint = getGmapsPoint(prevPoint)
      animate(position => {
        const newPoint = google.maps.geometry.spherical.interpolate(fromGmapsPoint, toGmapsPoint, position)
        updatePoly[prevPointIndex] = { lat: newPoint.lat(), lng: newPoint.lng() }
        polyInst.setPath(updatePoly)
      })
      return
    }

    props.onAreaChange(areaId, { polygon: newPoly })
  }

  function handleAreaDrag(areaId) {
    return () => {
      const prevPoly = areas[areaId].polygon
      const areaPolyRef = areaPolyRefs.current.getById(areaId)
      const draggedPoly = areaPolyRef.current.getPath().g.map(x => ({ lat: x.lat(), lng: x.lng() }))
      let fromGmapsPoint = getGmapsPoint(prevPoly[0])
      const toGmapsPoint = getGmapsPoint(draggedPoly[0])
      const draggingVector = {
        distance: google.maps.geometry.spherical.computeDistanceBetween(fromGmapsPoint, toGmapsPoint),
        heading: google.maps.geometry.spherical.computeHeading(fromGmapsPoint, toGmapsPoint),
      }

      fromGmapsPoint = getGmapsPoint(areas[areaId].heart)
      const heartRef = heartRefs.current.getById(areaId)
      const heartMarkerInst = getGmapsMarkerInstance(heartRef.current)

      const newPoint = google.maps.geometry.spherical.computeOffset(
        fromGmapsPoint,
        draggingVector.distance,
        draggingVector.heading
      )
      heartMarkerInst.setPosition(newPoint)
    }
  }

  function handleAreaDragEnd(areaId) {
    return () => {
      const areaPolyRef = areaPolyRefs.current.getById(areaId)
      const draggedPoly = areaPolyRef.current.getPath().g.map(x => ({ lat: x.lat(), lng: x.lng() }))
      const heartRef = heartRefs.current.getById(areaId)
      const heartPos = heartRef.current.getPosition()
      const newHeart = { lat: heartPos.lat(), lng: heartPos.lng() }
      props.onAreaChange(areaId, { heart: newHeart, polygon: draggedPoly })
    }
  }

  function handleAreaClick(areaId) {
    return e => {
      if (editableAreas) {
        const point = { lat: e.latLng.lat(), lng: e.latLng.lng() }
        const withPointIds = areas
          .map((a, i) => (pointIsWithinGmapsPolygon(point, getGmapsPolygon(a.polygon)) ? i : null))
          .filter(x => x !== null)
          .sort((x, y) => (zIndexMap[y] || 0) - (zIndexMap[x] || 0))

        const newZIndexMap = { ...zIndexMap }
        withPointIds.forEach(id => {
          newZIndexMap[id] = (newZIndexMap[id] || 0) + 1
        })

        const losingFocusId = areas.findIndex(a => a.caption === editableAreaCaption)
        newZIndexMap[losingFocusId] = -withPointIds.length

        if (losingFocusId !== areaId) {
          newZIndexMap[areaId] = areas.length
          setZIndexMap(newZIndexMap)
          setEditableAreaCaption(areas[areaId].caption)
          return
        }

        const nextId = withPointIds[0]
        newZIndexMap[nextId] = areas.length
        setZIndexMap(newZIndexMap)
        setEditableAreaCaption(areas[nextId].caption)
      }
      props.onAreaClick(areas[areaId])
    }
  }

  function handleMouseUp(areaId) {
    return e => {
      if (e.path !== undefined) {
        const point = { lat: e.latLng.lat(), lng: e.latLng.lng() }
        updateAreaPolyOnVertexAdditionOrDrag(areaId, point)
      }
    }
  }

  const handleMarkerDragStart = () => {
    const marker = getGmapsMarkerInstance(markerRef.current)
    if (marker) marker.setAnimation(MarkerAnimations.BOUNCE)
  }
  const handleMarkerDragEnd = event => {
    if (!props.editableMarker) return
    const newPosition = { lat: event.latLng.lat(), lng: event.latLng.lng() }
    props.onMarkerDragEnd(newPosition)
    const marker = getGmapsMarkerInstance(markerRef.current)
    if (marker) marker.setAnimation(MarkerAnimations.SMALL_DROP)
  }

  const onHeartDragStart = areaId => () => {
    const heartRef = heartRefs.current.getById(areaId)
    const marker = getGmapsMarkerInstance(heartRef.current)
    if (marker) marker.setAnimation(MarkerAnimations.BOUNCE)
  }

  const onHeartDragEnd = areaId => event => {
    const newHeart = { lat: event.latLng.lat(), lng: event.latLng.lng() }
    const heartRef = heartRefs.current.getById(areaId)

    const marker = getGmapsMarkerInstance(heartRef.current)
    if (marker) marker.setAnimation(MarkerAnimations.SMALL_DROP)

    const areaPoly = areas[areaId].polygon
    if (!isAreaWithinBounds([areaPoly], [newHeart])) {
      const prevHeart = areas[areaId].heart
      const fromGmapsPoint = getGmapsPoint(newHeart)
      const toGmapsPoint = getGmapsPoint(prevHeart)
      const heartMarkerInst = getGmapsMarkerInstance(heartRef.current)
      animate(
        position => {
          const newPoint = google.maps.geometry.spherical.interpolate(fromGmapsPoint, toGmapsPoint, position)
          heartMarkerInst.setPosition(newPoint)
        },
        { rate: 20 }
      )
      return
    }
    props.onAreaChange(areaId, { heart: newHeart })
  }

  function handleMapClick(event) {
    setEditableAreaCaption(null)
    handleMarkerDragEnd(event)
  }

  const gmapsPoint = (x, y) => new google.maps.Point(x, y)
  const heartIcons = (area, id) => ({
    default: {
      anchor: gmapsPoint(12, 24),
      path:
        'M19 1H5c-1.1 0-1.99.9-1.99 2L3 15.93c0 .69.35 1.3.88 1.66L12 23l8.11-5.41c.53-.36.88-.97.88-1.66L21 3c0-1.1-.9-2-2-2zm-9 15l-5-5 1.41-1.41L10 13.17l7.59-7.59L19 7l-9 9z',
      fillColor: !showErrors || area.isValid ? polyColors[id % 7] : 'red',
      fillOpacity: 0.85,
      strokeColor: !showErrors || area.isValid ? `${polyColorsHex[id % 7]}50` : '#FF000050',
    },
    dragging: {},
  })

  return (
    <GoogleMap ref={mapRef} google={props.google} center={props.mapPosition} onClick={handleMapClick} zoom={props.zoom}>
      {/**
      ---------------------------------------------
      ------------------------------BOUNDARIES POLYGONS
      ---------------------------------------------
      */}
      {boundaries &&
        boundaries.map((b, id) => (
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

      {/**
      ---------------------------------------------
      --------------------------------AREA POLYGONS
      ---------------------------------------------
      */}
      {areas &&
        areas.map((area, id) => (
          <div key={`${area.caption}poly-n-marker`}>
            <Polygon
              editable={editableAreas && editableAreaCaption === area.caption}
              draggable={editableAreas && editableAreaCaption === area.caption}
              key={area.caption}
              // onDragStart={handleAreaDragStart(id)}
              onDrag={handleAreaDrag(id)}
              onDragEnd={handleAreaDragEnd(id)}
              onClick={handleAreaClick(id)}
              onMouseUp={handleMouseUp(id)}
              onRightClick={handleRightClick(id)}
              path={area.polygon}
              ref={areaPolyRefs.current.getById(id)}
              options={{
                clickable: true,
                strokeWeight: 2,
                strokeColor: !showErrors || area.isValid ? polyColors[id % 7] : 'red',
                strokeOpacity: 1,
                fillColor: !showErrors || area.isValid ? polyColors[id % 7] : 'red',
                fillOpacity: 0.05,
                zIndex: zIndexMap[id] || 0,
              }}
            />
            <Marker
              ref={heartRefs.current.getById(id)}
              animation={google.maps.Animation.DROP}
              draggable={editableAreaCaption === area.caption}
              onClick={handleAreaClick(id)}
              google={props.google}
              key={`${area.caption}heart`}
              onDragStart={onHeartDragStart(id)}
              onDragEnd={onHeartDragEnd(id)}
              position={{ lat: area.heart.lat, lng: area.heart.lng }}
              visible
              icon={heartIcons(area, id).default}
            />
          </div>
        ))}

      {/**
      ---------------------------------------------
      ---------------------------------GMAPS MARKER
      ---------------------------------------------
      */}
      {props.showMarker && !isEmpty(props.markerPosition) && (
        <Marker
          animation={google.maps.Animation.DROP}
          draggable={props.editableMarker}
          google={props.google}
          key={0}
          onDragEnd={handleMarkerDragEnd}
          onDragStart={handleMarkerDragStart}
          position={{ lat: props.markerPosition.lat, lng: props.markerPosition.lng }}
          ref={markerRef}
          visible
        />
      )}
    </GoogleMap>
  )
})

function GmapsAreaWindow(props) {
  // eslint-disable-next-line react/prop-types
  if (!props.withGmapsScripts) {
    throw new Error('Need outter WithGoogleApi component, with your own api key as prop.')
  }

  return (
    <BaseMapComponent
      containerElement={<div style={props.windowStyle} />}
      mapElement={<div style={{ height: '100%' }} />}
      {...props}
    />
  )
}

GmapsAreaWindow.propTypes = {
  windowStyle: PropTypes.object,
  showErrors: PropTypes.bool,
  zoom: PropTypes.number,
  mapViewport: PropTypes.object,
  mapPosition: PropTypes.object,
  // boundaries & areas
  boundaries: PropTypes.array,
  areas: PropTypes.array,
  editableAreas: PropTypes.bool,
  onAreaChange: PropTypes.func,
  onAreaRemove: PropTypes.func,
  onAreaClick: PropTypes.func,
  // marker
  markerPosition: PropTypes.object,
  showMarker: PropTypes.bool,
  editableMarker: PropTypes.bool,
  onMarkerDragEnd: PropTypes.func,
}

GmapsAreaWindow.defaultProps = {
  windowStyle: {
    height: '600px',
    margin: '16px 0px 0px 0px',
  },
  zoom: 15,
  boundaries: [],
  onMarkerDragEnd: () => {},
  onAreaChange: () => {},
  onAreaRemove: () => {},
  onAreaClick: () => {},
}

export default withGmapsContext(GmapsAreaWindow)
