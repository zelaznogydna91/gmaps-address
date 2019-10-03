import React from 'react'
// import { Chip, Box } from '@material-ui/core'
import { Chip } from '@material-ui/core'
import { unstable_Box as Box } from '@material-ui/core/Box'
import Cancel from '@material-ui/icons/Clear'
import DirectionsBike from '@material-ui/icons/DirectionsBike'
import DirectionsCar from '@material-ui/icons/DirectionsCar'
import Train from '@material-ui/icons/Train'
import Flight from '@material-ui/icons/Flight'
import Edit from '@material-ui/icons/Edit'
import Skeleton from '@material-ui/lab/Skeleton'
import { PropTypes } from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
// import { useMultiStyles } from './utils'
import styled, { keyframes } from 'styled-components'

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
    display: 'flex',
    // ^^^--({ loading }) => (loading ? 'flex' : 'block'),
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
    marginRight: theme.spacing.unit * 1,
    marginBottom: theme.spacing.unit * 0.5,
    alignSelf: 'center',
  },
  '@keyframes fadingPulse': {
    '0%': {
      opacity: 1,
    },
    '50%': {
      opacity: 0.4,
    },
    '100%': {
      opacity: 1,
    },
  },
  chipSkeleton: {
    marginRight: theme.spacing.unit * 1,
    marginBottom: theme.spacing.unit * 0.5,
    alignSelf: 'center',
    backgroundColor: `${theme.palette.primary.light}80`,
    borderRadius: 16,
    animation: 'fadingPulse 1.5s ease-in-out infinite',
  },
})

// // Create the keyframes
// const fadingPulse = keyframes`
//   0% {
//       opacity: 1;
//   }
//   50% {
//       opacity: 0.4;
//   }
//   100% {
//       opacity: 1;
//   }
// `
// const StyledSkeleton = styled(Skeleton)`
//   display: inline-block;
//   animation: ${fadingPulse} 1.5s ease-in-out infinite;
// `

const ChipAreaPicker = props => {
  // const classes = useMultiStyles(styles, props)
  const { classes, handleChipClick, userAreaOptions, loading } = props
  // const icons = [<LocationCityIcon />, <TerrainIcon />, <MapIcon />, <Edit />, <Cancel />]
  const icons = [<DirectionsBike />, <DirectionsCar />, <Train />, <Flight />, <Edit />, <Cancel />]
  const chipSkeletonWidths = [128, 220, 180]
  return (
    <Box>
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

export default withStyles(styles)(ChipAreaPicker)
// export default ChipAreaPicker
