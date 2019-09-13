import React from 'react'
import { Chip, Box, Fab, Divider } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import LocationCityIcon from '@material-ui/icons/LocationCity'
import TerrainIcon from '@material-ui/icons/Terrain'
import MapIcon from '@material-ui/icons/Map'
import Edit from '@material-ui/icons/Edit'
import { PropTypes } from 'prop-types'

const useStyles = makeStyles(theme => ({
  chip: {
    margin: theme.spacing(1),
    alignSelf: 'center',
  },
  box: {
    width: '100%',
    textAlign: 'center',
    display: 'flex',
  },
  divider: {
    // height: 28,
    // margin: 4,
    height: '80%',
    margin: '4px',
    width: '1px',
  },
}))

export default function ChipAreaPicker(props) {
  const classes = useStyles()
  const { handleChipClick, userAreaOptions, onChipOtherClick } = props
  const icons = [<LocationCityIcon />, <TerrainIcon />, <MapIcon />, <Edit />]
  return (
    <Box className={classes.box}>
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
      <Divider className={classes.divider} orientation="vertical" />
      <Fab
        key="OtherOptionChip"
        clickable
        onClick={() => onChipOtherClick()}
        className={classes.chip}
        color="primary"
        size="small"
      >
        {icons[icons.length - 1]} {/* // The last element is the "go back to edit" button... */}
      </Fab>
    </Box>
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
