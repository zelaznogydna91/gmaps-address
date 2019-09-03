import React, { useContext } from 'react'
import PropTypes from 'prop-types'
import Map from './Map'
import GmapsAddressInput from './GmapsAddressInput'
import { GmapsContext } from './WithGoogleApi'

export default function GmapsAddress(props) {
  const apiKey = useContext(GmapsContext)
  return (
    <div style={{ margin: '100px' }}>
      <Map
        areaMode={props.areaMode}
        // google={this.props.google}
        gmapsApiKey={apiKey}
        center={{ lat: 25.678167, lng: -80.404497 }}
        height="300px"
        zoom={17}
        inputComponent={GmapsAddressInput}
        inputProps={{}}
      />
    </div>
  )
}

GmapsAddress.propTypes = {
  areaMode: PropTypes.bool,
}
