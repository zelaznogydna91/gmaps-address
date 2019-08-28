import React from 'react'
import Map from './Map'

const GmapsAddress = props => (
  <div style={{ margin: '100px' }}>
    <Map
      // google={this.props.google}
      center={{ lat: 25.678167, lng: -80.404497 }}
      height="300px"
      zoom={17}
      gmapsApiKey={props.gmapsApiKey}
    />
  </div>
)

export default GmapsAddress
