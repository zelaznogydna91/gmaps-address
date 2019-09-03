import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { Input } from '@material-ui/core'

const useStyles = makeStyles(theme => ({
  root: {
    // padding: '2px 4px',
    padding: theme.spacing(1),
    // display: 'flex',
    display: 'inline-block',
    // alignItems: 'center',
  },
}))

function GmapsAddressInput(props, ref) {
  const classes = useStyles()
  const { locationCity } = props

  return (
    <>
      <Input placeholder="Search for your Area" inputProps={{ 'aria-label': 'search google maps' }} inputRef={ref} />
    </>
  )
}

export default React.forwardRef(GmapsAddressInput)
