/* global google */
import { makeStyles, useTheme } from '@material-ui/core/styles'
import isNumber from 'lodash/isNumber'
import roundNumber from 'lodash/round'
import getProp from 'lodash/get'
import isEmpty from 'lodash/isEmpty'

export const useMultiStyles = (styles, props) => {
  const theme = useTheme()
  const objStyles = typeof styles === 'function' ? styles(theme) : styles
  const keys = Object.keys(objStyles)
  const classesStyles = keys
    .filter(k => k.startsWith('$'))
    .map(k => k.substr(1))
    .reduce(
      (o, k) =>
        Object.assign(o, {
          [k]: makeStyles(objStyles[`$${k}`])(props),
        }),
      {}
    )
  const classNameStyles = keys
    .filter(k => !k.startsWith('$'))
    .reduce(
      (o, k) =>
        Object.assign(o, {
          [k]: objStyles[k],
        }),
      {}
    )
  return {
    ...classesStyles,
    ...makeStyles(classNameStyles)(props),
  }
}

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

export const getMapViewportFromAreas = areas =>
  areas.reduce((viewport, boundary) => {
    const polyViewport = boundary.polygon.reduce((pv, coords) => extendViewport(pv, coords), null)
    // the winner
    return Object.assign(viewport || {}, extendViewport(extendViewport(viewport, polyViewport.sw), polyViewport.ne))
  }, null)

export const validLocation = loc => isNumber(getProp(loc, 'lat')) && isNumber(getProp(loc, 'lng'))

export const validArea = area =>
  validLocation(getProp(area, 'heart')) && getProp(area, 'polygon', []).filter(p => validLocation(p)).length > 2

export const getStreetAddrPartsFromGeoResult = geoResult => {
  const addressArray = geoResult.address_components
  const area =
    (addressArray.find(x => x.types.some(t => ['sublocality_level_1', 'locality'].includes(t))) || {}).long_name || ''
  const city = (addressArray.find(x => x.types[0] === 'administrative_area_level_2') || {}).long_name || ''
  const state = (addressArray.find(x => x.types[0] === 'administrative_area_level_1') || {}).long_name || ''
  if (isEmpty(area) && isEmpty(city) && isEmpty(state)) return {}
  return {
    area,
    city,
    state,
    address: geoResult.formatted_address,
  }
}

const fixedNumber = n => roundNumber(n, 6)
export const equalCoords = (c1, c2) => c1.lat === c2.lat && c1.lng === c2.lng

export const samePolygons = (x, y) => {
  const p1 = x.map(c => ({ lat: fixedNumber(c.lat), lng: fixedNumber(c.lng) }))
  const p2 = y.map(c => ({ lat: fixedNumber(c.lat), lng: fixedNumber(c.lng) }))
  if (p1.length !== p2.length) return -1
  const i2 = p2.findIndex(c => equalCoords(p1[0], c))
  if (i2 < 0) return 0
  for (let i1 = 0; i1 < p1.length; i1 += 1) {
    if (!equalCoords(p1[i1], p2[(i2 + i1) % p1.length])) return i1
  }
  return true
}

export const sameAreas = (a1, a2) => samePolygons(a1.polygon, a2.polygon) === true

// common stuffs
const SECRET_MARKER_KEY = '__SECRET_MARKER_DO_NOT_USE_OR_YOU_WILL_BE_FIRED'
const SECRET_POLYGON_KEY = '__SECRET_POLYGON_DO_NOT_USE_OR_YOU_WILL_BE_FIRED'
export const MarkerAnimations = {
  get BOUNCE() {
    return google.maps.Animation.BOUNCE
  },
  get SMALL_DROP() {
    return 4 // google.maps.Animation.Vm
  },
  get DROP() {
    return google.maps.Animation.DROP
  },
  get RARITA() {
    return 3 // google.maps.Animation.Xm
  },
}
export const getGmapsMarkerInstance = markerComponent => markerComponent && markerComponent.state[SECRET_MARKER_KEY]
export const getGmapsPolygonInstance = polygonComponent =>
  polygonComponent && polygonComponent.state[SECRET_POLYGON_KEY]

export const getGmapsPoint = point => new google.maps.LatLng(point.lat, point.lng)
export const getGmapsPolygon = polygon => new google.maps.Polygon({ paths: polygon })

export const pointIsWithinGmapsPolygon = (point, gmapsPolygon) => {
  const gmapsPoint = getGmapsPoint(point)
  return google.maps.geometry.poly.containsLocation(gmapsPoint, gmapsPolygon)
}

// working with area/boundary polygon react components
export const isAreaWithinBounds = (boundaryPolygons, areaPolygon) => {
  for (let bId = 0; bId < boundaryPolygons.length; bId += 1) {
    const gmapsBoundaryPoly = getGmapsPolygon(boundaryPolygons[bId])
    if (areaPolygon.every(coords => pointIsWithinGmapsPolygon(coords, gmapsBoundaryPoly))) {
      return true
    }
  }
  return false
}

export function animate(animator, { rate = 10, steps = 10 } = {}) {
  let position = 0
  let cancel = false
  const animation = () => {
    if (position < 100 && !cancel) {
      position += steps
      animator(position / 100)
      setTimeout(() => {
        animation()
      }, rate)
    }
  }
  animation()
  return {
    cancel: () => {
      cancel = true
    },
  }
}
