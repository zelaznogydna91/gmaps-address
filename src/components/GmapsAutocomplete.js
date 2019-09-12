import React from 'react'
import PropTypes from 'prop-types'
import ReactGoogleAutocomplete from 'react-google-autocomplete'

class GmapsAutocomplete extends ReactGoogleAutocomplete {
  componentDidMount() {
    if (this.refs.input) this.setupInputToSelectFirstOnEnter(this.refs.input)
    super.componentDidMount()
  }

  setupInputToSelectFirstOnEnter = input => {
    // store the original event binding function
    const _addEventListener = input.addEventListener ? input.addEventListener : input.attachEvent
    function addEventListenerWrapper(type, listener) {
      // Simulate a 'down arrow' keypress on hitting 'return' when no pac suggestion is selected,
      // and then trigger the original listener.
      let newListener = listener
      if (type === 'keydown') {
        const origListener = listener
        newListener = function(event) {
          // const suggestionSelected = $('.pac-item-selected').length > 0
          const suggestionSelected = document.getElementsByClassName('pac-item-selected').length > 0
          if (event.which === 13 && !suggestionSelected) {
            const simulatedDownarrow = new KeyboardEvent('keydown', {
              keyCode: 40,
              which: 40,
              bubbles: true,
              cancelBubble: false,
              cancelable: true,
              isTrusted: true,
            })
            origListener.apply(input, [simulatedDownarrow])
          }
          origListener.apply(input, [event])
        }
      }

      _addEventListener.apply(input, [type, newListener])
    }
    input.addEventListener = addEventListenerWrapper
    input.attachEvent = addEventListenerWrapper
  }

  render() {
    // eslint-disable-next-line no-unused-vars
    const { inputComponent, inputProps } = this.props
    const InputComponent = inputComponent
    // eslint-disable-next-line react/no-string-refs
    return <InputComponent ref="input" inputProps={inputProps} />
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
