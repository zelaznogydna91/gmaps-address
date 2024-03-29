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
