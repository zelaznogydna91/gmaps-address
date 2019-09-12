/* global google */
import React from 'react'
import PropTypes from 'prop-types'
import { withScriptjs } from 'react-google-maps'

export const GmapsContext = React.createContext('')

function ChildWrapper(props) {
  return props.render()
}

const ApiInstaller = withScriptjs(ChildWrapper)

export default function WithGoogleApi(props) {
  const { apiKey, loadingComponent, children } = props
  return (
    <GmapsContext.Provider value={apiKey}>
      <ApiInstaller
        googleMapURL={`https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry`}
        loadingElement={loadingComponent}
        render={() => children}
      />
    </GmapsContext.Provider>
  )
}

WithGoogleApi.propTypes = {
  apiKey: PropTypes.string,
  loadingComponent: PropTypes.element,
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.array]).isRequired,
}
WithGoogleApi.defaultProps = {
  loadingComponent: <div />,
}

// HOC fror consuming the gmaps context on class components
export function withGmapsContext(BaseComp) {
  const comp = React.forwardRef((props, ref) => (
    <GmapsContext.Consumer>{apiKey => <BaseComp {...props} apiKey={apiKey} ref={ref} />}</GmapsContext.Consumer>
  ))
  comp.displayName = 'WithGmapsContext'
  return comp
}

// common stuffs
const SECRET_MARKER_KEY = '__SECRET_MARKER_DO_NOT_USE_OR_YOU_WILL_BE_FIRED'
export const MarkerAnimations = {
  get BOUNCE() {
    return google.maps.Animation.BOUNCE
  },
  get SMALL_DROP() {
    return google.maps.Animation.Vm
  },
  get DROP() {
    return google.maps.Animation.DROP
  },
  get RARITA() {
    return google.maps.Animation.Xm
  },
}
export const getGmapsMarkerInstance = markerComponentRef => markerComponentRef.current.state[SECRET_MARKER_KEY]
