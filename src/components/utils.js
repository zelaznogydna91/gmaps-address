import { makeStyles, useTheme } from '@material-ui/core/styles'
import isNumber from 'lodash/isNumber'
import getProp from 'lodash/get'

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
  return {
    area:
      (addressArray.find(x => x.types.some(t => ['sublocality_level_1', 'locality'].includes(t))) || {}).long_name ||
      '',
    city: (addressArray.find(x => x.types[0] === 'administrative_area_level_2') || {}).long_name || '',
    state: (addressArray.find(x => x.types[0] === 'administrative_area_level_1') || {}).long_name || '',
    address: geoResult.formatted_address,
  }
}
