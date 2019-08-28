import React from 'react'
import PropTypes from 'prop-types'
import ReactGoogleAutocomplete from 'react-google-autocomplete'

class GmapsAutocomplete extends ReactGoogleAutocomplete {
  render() {
    // eslint-disable-next-line no-unused-vars
    const { onPlaceSelected, types, componentRestrictions, bounds, inputComponent, inputProps, ...rest } = this.props
    const InputComponent = inputComponent
    // eslint-disable-next-line react/no-string-refs
    return <InputComponent ref="input" {...inputProps} {...rest} />
  }
}
GmapsAutocomplete.propTypes = {
  componentRestrictions: PropTypes.object,
  types: PropTypes.array,
  bounds: PropTypes.object,
  fields: PropTypes.array,
  onPlaceSelected: PropTypes.func,
  inputComponent: PropTypes.elementType,
  inputProps: PropTypes.object,
}
GmapsAutocomplete.defaultProps = {
  componentRestrictions: { country: 'us' },
  types: ['geocode', 'establishment'],
  inputComponent: 'input',
  inputProps: {},
}

export default GmapsAutocomplete
