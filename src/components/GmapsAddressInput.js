import React from 'react'
// import { makeStyles } from '@material-ui/core/styles'
import { Input } from '@material-ui/core'
import PropTypes from 'prop-types'

function GmapsAddressInput(props, ref) {
  //  const classes = useStyles()
  const {
    inputProps,
    // ...others
  } = props

  return <Input inputProps={{ 'aria-label': 'search google maps' }} inputRef={ref} {...inputProps} />
}

export default React.forwardRef(GmapsAddressInput)

GmapsAddressInput.propTypes = {
  inputProps: PropTypes.object,
}
