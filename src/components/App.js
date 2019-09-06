/**
 * TO BE RENAMED GMAPSADDRESS
 */
import React, { useState } from 'react'
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
  vendorServiceAreas: [
    {
      caption: 'Kendall, Fl',
      heart: { lat: 25.664112, lng: -80.356857 },
      polygon: [
        { lat: 25.634253, lng: -80.388439 },
        { lat: 25.632716, lng: -80.309863 },
        { lat: 25.705581, lng: -80.304534 },
        { lat: 25.703632, lng: -80.387227 },
      ],
    },
    {
      caption: 'Coral Gables, Fl',
      heart: { lat: 25.746895, lng: -80.267322 },
      polygon: [
        { lat: 25.633666, lng: -80.303403 },
        { lat: 25.628092, lng: -80.28007 },
        { lat: 25.706354, lng: -80.242616 },
        { lat: 25.772882, lng: -80.254253 },
        { lat: 25.764537, lng: -80.288614 },
      ],
    },
  ],
}

const App = () => {
  const [streetAddr, setStreetAddr] = useState(data.vendorServiceAreas[0])
  const [serviceAreas, setServiceAreas] = useState([])
  const classes = useStyles()
  return (
    <Paper className={classes.paper}>
      <LanguageProvider messages={{} /* messages> */}>
        <WithGoogleApi apiKey="AIzaSyC43U2-wqXxYEk1RBrTLdkYt3aDoOxO4Fw">
          {/* STREET ADDRESS MODE */}
          {/* <GmapsAddress className={classes.component} value={streetAddr} onChange={setStreetAddr} /> */}
          {/* AREA SELECTION MODE */}
          <GmapsAddress
            areaMode
            className={classes.component}
            boundaries={data.vendorServiceAreas}
            value={serviceAreas}
            onChange={setServiceAreas}
          />
        </WithGoogleApi>
      </LanguageProvider>
    </Paper>
  )
}

export default App
