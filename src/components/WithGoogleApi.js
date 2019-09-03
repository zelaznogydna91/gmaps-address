import React, { useContext } from 'react'
import PropTypes from 'prop-types'
import { withScriptjs } from 'react-google-maps'

export const GmapsContext = React.createContext('')

function ChildWrapper(props) {
  return props.render()
}

const ApiInstaller = withScriptjs(ChildWrapper)

export default function WithGoogleApi(props) {
  const { apiKey, loadingComponent, children } = props
  // console.log(`https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`)
  return (
    <GmapsContext.Provider value={apiKey}>
      <ApiInstaller
        googleMapURL={`https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`}
        loadingElement={loadingComponent}
        render={() => children}
      />
    </GmapsContext.Provider>
  )
}

WithGoogleApi.propTypes = {
  apiKey: PropTypes.string,
  loadingComponent: PropTypes.element,
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.arrayOf(PropTypes.element)]).isRequired,
}
WithGoogleApi.defaultProps = {
  loadingComponent: <div />,
}
