/**
 * TO BE RENAMED GmapsAddress and correct a few bugs...
 */
import React, { useState } from 'react'
import { Paper, makeStyles, Typography } from '@material-ui/core'
import GmapsAddress from './GmapsAddress'
import WithGoogleApi from './WithGoogleApi'
import LanguageProvider from './LanguageProvider'

const GOOGLE_API_KEY = 'AIzaSyC43U2-wqXxYEk1RBrTLdkYt3aDoOxO4Fw'
/**
   * -------------------------------------------TASKS------------------------------------------
   * 
  /* ------------------------AREA MODE */
/* TODO: IF 'USA' IS TYPED IT DOESN'T ALLOW USA TO BE SELECTED (CHIP MAXES OUT IN STATES)
       NEW RULE -- ALLOW COUNTRY TO BE SELECTED...(AUTOCOMPLETE'S RANGE IS ON USA ONLY)

/* TODO: CLICKING A VENDOR BOUNDARY SHOULD EXIT AND ADD AS SELECTED THE PREVIOUSLY PROVIDED OPTION...

/* TODO: ADDED AREA POLYGON SHOULD BE RED WHEN HEART IS OUTSIDE OF BOUNDARIES

/* TODO: ON EDITING A VERTEX NEW AREA SELECTION OPTION SHOULD BE ADDED TO SELECT LIST AND SELECTED CHIPS 
  * ie. ----- Kendall, FL (User)----- USING HEART "ADMIN AREA 2" FOR NAMING CUSTOM INPUT

/* ------------------------STREET ADDRESS MODE */

/* FIXME: SET ADDRESS, OPEN MAP, MARKER APPEARS ON CORRECT LOCATION, ACCEPT GEOLOCATION REQUEST, MARKER MOVES TO CURRENT LOCATION
/**
 * ------------------------------------------------------------------------------------------
 */

const useStyles = makeStyles(theme => ({
  paper: {
    display: 'block',
    marginLeft: '25%',
    padding: theme.spacing(2),
    width: '50%',
  },
  component: {
    width: '100%',
    height: '100%',
  },
  sections: {
    padding: theme.spacing(1),
  },
  divider: {
    margin: theme.spacing(1),
  },
}))

const sampleData = {
  vendorStreetAddress: {
    caption: '9011 SW 122nd Ave, Miami, FL 33186',
    heart: { lat: 25.684192318072125, lng: -80.39375118467146 },
  },
  vendorServiceAreas: [
    {
      id: 5,
      caption: 'Kendall, Fl',
      area: 'Kendall',
      heart: { lat: 25.664112, lng: -80.356857 },
      polygon: [
        { lat: 25.634253, lng: -80.388439 },
        { lat: 25.632716, lng: -80.309863 },
        { lat: 25.705581, lng: -80.304534 },
        { lat: 25.703632, lng: -80.387227 },
      ],
    },
    {
      id: 6,
      caption: 'Coral Gables, FL, USA',
      area: 'Coral Gables',
      heart: { lat: 25.7491968, lng: -80.2635411 },
      polygon: [
        { lat: 25.771853, lng: -80.1956259 },
        { lat: 25.771853, lng: -80.3013 },
        { lat: 25.609988, lng: -80.3013 },
        { lat: 25.609988, lng: -80.1956259 },
      ],
    },
  ],

  userServiceAreas: [
    {
      id: 10,
      caption: 'Main Area',
      area: 'Coral Gables',
      state: 'Fl',
      heart: { lat: 25.7491968, lng: -80.2635411 },
      polygon: [
        { lat: 25.771853, lng: -80.1956259 },
        { lat: 25.771853, lng: -80.3013 },
        { lat: 25.609988, lng: -80.3013 },
        { lat: 25.609988, lng: -80.1956259 },
      ],
    },
  ],
}

const App = () => {
  const [streetAddr, setStreetAddr] = useState(sampleData.vendorStreetAddress)
  const [serviceAreas, setServiceAreas] = useState(sampleData.userServiceAreas)
  const classes = useStyles()
  const areaMode = true

  return (
    <Paper className={classes.paper}>
      <LanguageProvider messages={{} /* messages> */}>
        <WithGoogleApi apiKey={`${GOOGLE_API_KEY}`}>
          {areaMode ? (
            <div>
              <Typography className={classes.sections}>AREA MODE</Typography>
              <GmapsAddress
                areaMode
                className={classes.component}
                boundaries={sampleData.vendorServiceAreas}
                value={serviceAreas}
                onChange={setServiceAreas}
                countries={['us', 'pr']}
              />
            </div>
          ) : (
            <div>
              <Typography className={classes.sections}>STREET ADDRESS MODE</Typography>
              <GmapsAddress className={classes.component} value={streetAddr} onChange={setStreetAddr} />
            </div>
          )}
        </WithGoogleApi>
      </LanguageProvider>
    </Paper>
  )
}

export default App
