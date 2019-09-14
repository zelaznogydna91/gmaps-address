import React from 'react'
import { Chip, Box, Fab, Divider } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import LocationCityIcon from '@material-ui/icons/LocationCity'
import Cancel from '@material-ui/icons/Clear'
import TerrainIcon from '@material-ui/icons/Terrain'
import MapIcon from '@material-ui/icons/Map'
import Edit from '@material-ui/icons/Edit'
import Skeleton from '@material-ui/lab/Skeleton'

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
  chipSkeleton: {
    margin: theme.spacing(1),
    alignSelf: 'center',
    backgroundColor: `${theme.palette.primary.light}80`,
    borderRadius: 16,
  },
  dividerSkeleton: {
    backgroundColor: 'primary', // '#3f51b560',
    margin: '4px',
  },
  fabSkeleton: {
    margin: theme.spacing(1),
    alignSelf: 'center',
    backgroundColor: `${theme.palette.primary.light}80`,
  },
}))

export default function ChipAreaPicker(props) {
  const classes = useStyles()
  const { handleChipClick, userAreaOptions, onEnterEditMode, onCancel, loading } = props
  const icons = [<LocationCityIcon />, <TerrainIcon />, <MapIcon />, <Edit />, <Cancel />]
  return (
    <Box className={classes.box}>
      {loading
        ? [...Array(3)].map((x, i) => (
            <Skeleton
              variant="rect"
              width={128}
              height={32}
              classes={{ root: classes.chipSkeleton }}
              // style={{ borderRadius: 16 }}
            />
          ))
        : userAreaOptions.map(o => (
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
      {loading ? (
        <Skeleton variant="rect" width={1} height={45} classes={{ root: classes.dividerSkeleton }} />
      ) : (
        <Divider className={classes.divider} orientation="vertical" />
      )}
      {loading
        ? [
            <Skeleton variant="circle" width={40} height={40} classes={{ root: classes.fabSkeleton }} />,
            <Skeleton variant="circle" width={40} height={40} classes={{ root: classes.fabSkeleton }} />,
          ]
        : [
            <Fab
              key="editAddress"
              // clickable
              onClick={() => onEnterEditMode()}
              className={classes.chip}
              color="primary"
              size="small"
            >
              {icons[icons.length - 2]} {/* // The last element is the "go back to edit" button... */}
            </Fab>,
            <Fab
              key="cancel"
              // clickable
              onClick={() => onCancel()}
              className={classes.chip}
              // color="primary"
              size="small"
            >
              {icons[icons.length - 1]} {/* // The last element is the "go back to edit" button... */}
            </Fab>,
          ]}
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
