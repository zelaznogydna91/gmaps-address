import React, { useContext } from 'react'
import PropTypes from 'prop-types'
import { withScriptjs } from 'react-google-maps'
import Map from './Map'
import GmapsAddressInput from './GmapsAddressInput'

export const GmapsContext = React.createContext('')

function ChildWrapper(props) {
  return props.render()
}

const ApiInstaller = withScriptjs(ChildWrapper)

export function WithGoogleApi(props) {
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

export default function GmapsAddress(props) {
  const apiKey = useContext(GmapsContext)
  return (
    <div style={{ margin: '100px' }}>
      <Map
        // google={this.props.google}
        gmapsApiKey={apiKey}
        center={{ lat: 25.678167, lng: -80.404497 }}
        height="400px"
        zoom={17}
        inputComponent={GmapsAddressInput}
        inputProps={{}}
      />
    </div>
  )
}
