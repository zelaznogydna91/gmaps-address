/**
 * TO BE RENAMED GMAPSADDRESS
 */
import React from 'react'
import { Paper, makeStyles } from '@material-ui/core'
import GmapsAddress /* , { WithGoogleApi */ from './GmapsAddress'
import WithGoogleApi from './WithGoogleApi'

const useStyles = makeStyles(theme => ({
  root: {
    // margin: '10px',
  },
}))

const App = () => {
  const classes = useStyles()
  return (
    <WithGoogleApi apiKey="AIzaSyC43U2-wqXxYEk1RBrTLdkYt3aDoOxO4Fw">
      <GmapsAddress />
    </WithGoogleApi>
  )
}

export default App
