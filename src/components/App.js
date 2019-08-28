import React from 'react'
import { Paper, makeStyles } from '@material-ui/core'
import GmapsAddress, { WithGoogleApi } from './GmapsAddress'
import GmapsAddressInput from './GmapsAddressInput'
import ChipAreaSelect from './ChipAreaSelect'

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(3, 2),
  },
}))

const App = () => {
  const classes = useStyles()
  return (
    <WithGoogleApi apiKey="AIzaSyC43U2-wqXxYEk1RBrTLdkYt3aDoOxO4Fw">
      <Paper className={classes.root}>
        <ChipAreaSelect />
        <GmapsAddressInput />
        <GmapsAddress />
      </Paper>
    </WithGoogleApi>
  )
}

export default App
