import isNumber from 'lodash/isNumber'
import getProp from 'lodash/get'

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
