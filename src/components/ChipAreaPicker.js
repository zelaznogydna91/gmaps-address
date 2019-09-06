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
  const { handleChipClick, userAreaOptions } = props
  const icons = [<LocationCityIcon />, <TerrainIcon />, <MapIcon />]
  return (
    <Paper className={classes.paper}>
      {userAreaOptions.map(o => (
        <Chip
          key={o.level}
          clickable
          onClick={() => handleChipClick(o)}
          icon={icons[o.level]}
          className={classes.chip}
          label={o.caption}
          color="primary"
        />
      ))}
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
