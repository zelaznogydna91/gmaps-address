import React from 'react'
import { Chip, Box, Fab, Divider } from '@material-ui/core'
import Cancel from '@material-ui/icons/Clear'
import DirectionsBike from '@material-ui/icons/DirectionsBike'
import DirectionsCar from '@material-ui/icons/DirectionsCar'
import Train from '@material-ui/icons/Train'
import Flight from '@material-ui/icons/Flight'
import Edit from '@material-ui/icons/Edit'
import Skeleton from '@material-ui/lab/Skeleton'
import { PropTypes } from 'prop-types'
import { useMultiStyles } from './utils'

const styles = theme => ({
  chip: {
    margin: theme.spacing(1),
    alignSelf: 'center',
  },
  box: {
    width: '100%',
    textAlign: 'center',
    display: 'flex',
    // flexWrap: 'wrap',
  },
  chipsOptions: {
    width: '100%',
    textAlign: 'center',
    display: 'flex',
    flexWrap: 'wrap',
  },
  iconButton: {
    alignSelf: 'center',
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
    height: '80%',
  },
  fabSkeleton: {
    margin: theme.spacing(1),
    alignSelf: 'center',
    backgroundColor: `${theme.palette.primary.light}80`,
  },
})

export default function ChipAreaPicker(props) {
  const classes = useMultiStyles(styles)
  const { handleChipClick, userAreaOptions, onEnterEditMode, loading } = props
  // const icons = [<LocationCityIcon />, <TerrainIcon />, <MapIcon />, <Edit />, <Cancel />]
  const icons = [<DirectionsBike />, <DirectionsCar />, <Train />, <Flight />, <Edit />, <Cancel />]
  return (
    <Box className={classes.box}>
      <div className={classes.chipsOptions}>
        {loading
          ? [...Array(3)].map((x, i) => (
              <Skeleton key={i} variant="rect" width={128} height={32} className={classes.chipSkeleton} />
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
      </div>
      {loading ? (
        <Skeleton variant="rect" width={1} className={classes.dividerSkeleton} />
      ) : (
        <Divider className={classes.divider} orientation="vertical" />
      )}
      {loading
        ? [
            <Skeleton key={0} variant="circle" width={40} height={40} className={classes.fabSkeleton} />,
            // <Skeleton key={1} variant="circle" width={40} height={40} className={classes.fabSkeleton} />,
          ]
        : [
            <div className={classes.iconButton}>
              <Fab
                key="editAddress"
                // clickable
                onClick={() => onEnterEditMode()}
                className={classes.chip}
                color="primary"
                size="small"
              >
                {icons[icons.length - 2]} {/* // The last element is the "go back to edit" button... */}
              </Fab>
            </div>,
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
  userAreaOptions: PropTypes.array,
  onEnterEditMode: PropTypes.func,
  loading: PropTypes.bool,
}
