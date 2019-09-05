import React from 'react'
import { Paper, Chip } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import LocationCityIcon from '@material-ui/icons/LocationCity'
import TerrainIcon from '@material-ui/icons/Terrain'
import MapIcon from '@material-ui/icons/Map'
import { PropTypes } from 'prop-types'

const useStyles = makeStyles(theme => ({
  chip: {
    margin: theme.spacing(1),
  },
}))

export default function ChipAreaPicker(props) {
  const classes = useStyles()
  const {
    handleChipClick,
    areas: { area, city, state },
  } = props
  return (
    <Paper className={classes.paper}>
      <Chip
        clickable
        onClick={() => handleChipClick(area)}
        icon={<LocationCityIcon />}
        className={classes.chip}
        label={area}
        color="primary"
      />
      <Chip
        clickable
        color="primary"
        onClick={() => handleChipClick(city)}
        icon={<TerrainIcon />}
        className={classes.chip}
        label={city}
      />
      <Chip
        color="primary"
        clickable
        onClick={() => handleChipClick(state)}
        icon={<MapIcon />}
        className={classes.chip}
        label={state}
      />
    </Paper>
  )
}

ChipAreaPicker.propTypes = {
  handleChipClick: PropTypes.func,
  areas: PropTypes.shape({
    area: PropTypes.string,
    city: PropTypes.string,
    state: PropTypes.string,
  }),
}
