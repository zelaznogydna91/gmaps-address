import React from 'react'
import GmapsAddress from '@bit/zelaznogydna.telaclaims.gmaps-address'
import GmapsAddressInput from './GmapsAddressInput'
// import ChipAreaSelect from './ChipAreaSelect/ChipAreaSelect'

const App = () => (
  <div>
    {/* <ChipAreaSelect></ChipAreaSelect> */}
    <GmapsAddressInput />
    <GmapsAddress gmapsApiKey="AIzaSyC43U2-wqXxYEk1RBrTLdkYt3aDoOxO4Fw" />
  </div>
)

export default App
