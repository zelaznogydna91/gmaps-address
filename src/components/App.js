import React from 'react'
import { Paper, makeStyles } from '@material-ui/core'
import GmapsAddress from './GmapsAddress'
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
    <Paper className={classes.root}>
      <ChipAreaSelect></ChipAreaSelect>
      <GmapsAddressInput />
      <GmapsAddress gmapsApiKey="AIzaSyC43U2-wqXxYEk1RBrTLdkYt3aDoOxO4Fw" />
    </Paper>
  )
}

export default App
