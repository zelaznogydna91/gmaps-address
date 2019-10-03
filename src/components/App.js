/**
 * TO BE RENAMED GmapsAddress and correct a few bugs...
 */
import React, { useState } from 'react'
import { Paper, withStyles, Typography } from '@material-ui/core'
import WithGoogleApi from './WithGoogleApi'
import GmapsAddress from './GmapsAddress'
import GmapsAreaWindow from './GmapsAreaWindow'
import LanguageProvider from './LanguageProvider'
import { getMapViewportFromAreas } from './utils'

const GOOGLE_API_KEY = 'AIzaSyC43U2-wqXxYEk1RBrTLdkYt3aDoOxO4Fw'
/**
   * -------------------------------------------TASKS------------------------------------------
   * 
  /* ------------------------AREA MODE */
/* TODO: IF 'USA' IS TYPED IT DOESN'T ALLOW USA TO BE SELECTED (CHIP MAXES OUT IN STATES)
       NEW RULE -- ALLOW COUNTRY TO BE SELECTED...(AUTOCOMPLETE'S RANGE IS ON USA ONLY)
       
/* TODO: ADDED AREA POLYGON SHOULD BE RED WHEN HEART IS OUTSIDE OF BOUNDARIES

/* TODO: ON EDITING A VERTEX NEW AREA SELECTION OPTION SHOULD BE ADDED TO SELECT LIST AND SELECTED CHIPS 
  * ie. ----- Kendall, FL (User)----- USING HEART "ADMIN AREA 2" FOR NAMING CUSTOM INPUT

/* ------------------------STREET ADDRESS MODE */

/* FIXME: SET ADDRESS, OPEN MAP, MARKER APPEARS ON CORRECT LOCATION, ACCEPT GEOLOCATION REQUEST, MARKER MOVES TO CURRENT LOCATION
/**
 * ------------------------------------------------------------------------------------------
 */

const styles = theme => ({
  paper: {
    display: 'block',
    marginLeft: '25%',
    padding: theme.spacing.unit * 2,
    width: '50%',
  },
  component: {
    width: '100%',
    height: '100%',
  },
  sections: {
    padding: theme.spacing.unit * 1,
  },
  divider: {
    margin: theme.spacing.unit * 1,
  },
})

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

const App = withStyles(styles)(props => {
  const [streetAddr, setStreetAddr] = useState(sampleData.vendorStreetAddress)
  const [serviceAreas, setServiceAreas] = useState(sampleData.userServiceAreas)
  const { classes } = props
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
          <>
            <br />
            <Typography className={classes.sections}>MAP WINDOW</Typography>
            <GmapsAreaWindow
              containerElement={<div style={{ height: '400px' }} />}
              mapElement={<div style={{ height: '100%' }} />}
              // boundaries={boundaries}
              // showErrors
              areas={serviceAreas}
              // editableAreas
              mapViewport={getMapViewportFromAreas(serviceAreas)}
              mapPosition={serviceAreas[0].heart}
              markerPosition={serviceAreas[0].heart}
              // onAreaChange={this.handleAreaChangeOnMapWindow}
              // onAreaRemove={this.handleAreaRemoveOnMapWindow}
              // onMarkerDragEnd={this.handleMarkerDragEnd}
              // editableMarker
              // showMarker
              // zoom={15}
              onAreaClick={area => alert(area.caption)}
            />
          </>
        </WithGoogleApi>
      </LanguageProvider>
    </Paper>
  )
})

export default App
