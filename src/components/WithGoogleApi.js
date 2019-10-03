import React from 'react'
import PropTypes from 'prop-types'
import Geocode from 'react-geocode'
import { withScriptjs } from 'react-google-maps'

export const GmapsContext = React.createContext('')

function ChildWrapper(props) {
  return props.render()
}

const ApiInstaller = withScriptjs(ChildWrapper)

export default function WithGoogleApi(props) {
  Geocode.enableDebug()
  Geocode.setApiKey(props.apiKey)

  const { apiKey, loadingComponent, children } = props
  return (
    <GmapsContext.Provider value={{ withGmapsScripts: true }}>
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
    <GmapsContext.Consumer>{ctxt => <BaseComp {...props} {...ctxt} ref={ref} />}</GmapsContext.Consumer>
  ))
  comp.displayName = 'WithGmapsContext'
  return comp
}
