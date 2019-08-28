import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import InputBase from '@material-ui/core/InputBase'
import Divider from '@material-ui/core/Divider'
import IconButton from '@material-ui/core/IconButton'
import SearchIcon from '@material-ui/icons/Search'
import PinDrop from '@material-ui/icons/PinDrop'

const useStyles = makeStyles(theme => {
  const light = theme.palette.type === 'light'
  const bottomLineColor = light ? 'rgba(0, 0, 0, 0.42)' : 'rgba(255, 255, 255, 0.7)'
  return {
    root: {
      padding: '2px 4px',
      display: 'flex',
      alignItems: 'center',
      width: 400,
      // height: 100,
    },
    input: {
      marginLeft: 8,
      flex: 1,
    },
    iconButton: {
      padding: 10,
    },
    divider: {
      width: 1,
      height: 28,
      margin: 4,
    },
    /* Styles applied to the root element if `disableUnderline={false}`. */
    underline: {
      '&:after': {
        borderBottom: `2px solid ${theme.palette.primary[light ? 'dark' : 'light']}`,
        left: 0,
        bottom: 0,
        // Doing the other way around crash on IE 11 "''" https://github.com/cssinjs/jss/issues/242
        content: '""',
        position: 'absolute',
        right: 0,
        transform: 'scaleX(0)',
        transition: theme.transitions.create('transform', {
          duration: theme.transitions.duration.shorter,
          easing: theme.transitions.easing.easeOut,
        }),
        pointerEvents: 'none', // Transparent to the hover style.
      },
      '&$focused:after': {
        transform: 'scaleX(1)',
      },
      '&$error:after': {
        borderBottomColor: theme.palette.error.main,
        transform: 'scaleX(1)', // error is always underlined in red
      },
      '&:before': {
        borderBottom: `1px solid ${bottomLineColor}`,
        left: 0,
        bottom: 0,
        // Doing the other way around crash on IE 11 "''" https://github.com/cssinjs/jss/issues/242
        content: '"\\00a0"',
        position: 'absolute',
        right: 0,
        transition: theme.transitions.create('border-bottom-color', {
          duration: theme.transitions.duration.shorter,
        }),
        pointerEvents: 'none', // Transparent to the hover style.
      },
      '&:hover:not($disabled):before': {
        borderBottom: `2px solid ${theme.palette.text.primary}`,
        // Reset on touch devices, it doesn't add specificity
        '@media (hover: none)': {
          borderBottom: `1px solid ${bottomLineColor}`,
        },
      },
      '&$disabled:before': {
        borderBottomStyle: 'dotted',
      },
    },
  }
})

function GmapsAddressInput(props, ref) {
  const classes = useStyles()
  const { locationCity } = props

  return (
    // <Paper className={classes.root}>
    <div
      className={[classes.root, classes.underline].join(' ')}
      // className={classNames({
      //   [classes.root]: true,
      //   [classes.underline]: true
      // })}
      // classes={{
      //   ...classes,
      //   root: clsx(classes.root, {
      //     // [classes.input]: true,
      //     [classes.underline]: true
      //   }),
      //   underline: null
      // }}
    >
      <InputBase
        className={classes.input}
        placeholder="Search Google Maps"
        inputProps={{ 'aria-label': 'search google maps' }}
        inputRef={ref}
      />
      <IconButton className={classes.iconButton} aria-label="search">
        <SearchIcon />
      </IconButton>
      <Divider className={classes.divider} />
      <IconButton color="primary" className={classes.iconButton} aria-label="directions">
        <PinDrop />
      </IconButton>
    </div>
    // </Paper>
  )
}

export default React.forwardRef(GmapsAddressInput)
