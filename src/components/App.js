/**
 * TO BE RENAMED GMAPSADDRESS
 */
import React from 'react'
import { Paper, makeStyles } from '@material-ui/core'
import GmapsAddress from './GmapsAddress'
import WithGoogleApi from './WithGoogleApi'
import LanguageProvider from './LanguageProvider'

const useStyles = makeStyles(theme => ({
  root: {
    // margin: '10px',
  },
}))

const App = () => {
  const classes = useStyles()
  return (
    <LanguageProvider messages={{} /* messages> */}>
      <WithGoogleApi apiKey="AIzaSyC43U2-wqXxYEk1RBrTLdkYt3aDoOxO4Fw">
        <GmapsAddress areaMode />
      </WithGoogleApi>
    </LanguageProvider>
  )
}

export default App
