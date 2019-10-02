import React from 'react'
import { Chip, Box } from '@material-ui/core'
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
  box: {
    width: '100%',
    textAlign: 'center',
    display: 'flex',
    // flexWrap: 'wrap',
  },
  chipsOptions: {
    alignSelf: 'center',
    width: '100%',
    textAlign: 'left',
    display: ({ loading }) => (loading ? 'flex' : 'block'),
    flexWrap: 'wrap',
  },
  divider: {
    // height: 28,
    // margin: 4,
    height: '80%',
    margin: '4px',
    width: '1px',
  },
  chip: {
    marginRight: theme.spacing(1),
    marginBottom: theme.spacing(0.5),
    alignSelf: 'center',
  },
  chipSkeleton: {
    marginRight: theme.spacing(1),
    marginBottom: theme.spacing(0.5),
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
  const classes = useMultiStyles(styles, props)
  const { handleChipClick, userAreaOptions, loading } = props
  // const icons = [<LocationCityIcon />, <TerrainIcon />, <MapIcon />, <Edit />, <Cancel />]
  const icons = [<DirectionsBike />, <DirectionsCar />, <Train />, <Flight />, <Edit />, <Cancel />]
  const chipSkeletonWidths = [128, 220, 180]
  return (
    <Box className={classes.box}>
      <div className={classes.chipsOptions}>
        {loading
          ? [...Array(3)].map((x, i) => (
              <Skeleton
                key={i}
                variant="rect"
                width={chipSkeletonWidths[i]}
                height={32}
                className={classes.chipSkeleton}
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
      </div>
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
  loading: PropTypes.bool,
}
