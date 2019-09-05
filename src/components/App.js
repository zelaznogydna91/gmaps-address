/**
 * TO BE RENAMED GMAPSADDRESS
 */
import React from 'react'
import { Paper, makeStyles } from '@material-ui/core'
import GmapsAddress from './GmapsAddress'
import WithGoogleApi from './WithGoogleApi'
import LanguageProvider from './LanguageProvider'

const useStyles = makeStyles(theme => ({
  paper: {
    display: 'block',
    marginLeft: '25%',
    padding: theme.spacing(3),
    width: '50%',
  },
  component: {
    width: '100%',
    height: '100%',
  },
}))
const data = {
  areas: [
    'Kendall, Fl',
    'Miami, Fl',
    'Coral Gables, Fl',
    'Weston, Fl',
    'Ft. Lauderdale, Fl',
    'Little Havana, Fl',
    'Hialeah, Fl',
    'Homestead, Fl',
    'Miami Springs, Fl',
    'Miami Garden, Fl',
  ],
}

const App = () => {
  const classes = useStyles()
  return (
    <Paper className={classes.paper}>
      <LanguageProvider messages={{} /* messages> */}>
        <WithGoogleApi apiKey="AIzaSyC43U2-wqXxYEk1RBrTLdkYt3aDoOxO4Fw">
          <GmapsAddress areaMode className={classes.component} existingAreas={data.areas} />
        </WithGoogleApi>
      </LanguageProvider>
    </Paper>
  )
}

export default App
