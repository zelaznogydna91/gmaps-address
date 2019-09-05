import React from 'react'
import PropTypes from 'prop-types'
import { IntlProvider } from 'react-intl'

/**
 * LanguageProvider
 *
 * This component connects the redux state language locale to the
 * IntlProvider component and i18n messages (loaded from `app/translations`)
 */
export default class LanguageProvider extends React.PureComponent {
  // eslint-disable-line react/prefer-stateless-function
  render() {
    const formats = {
      number: {
        USD: {
          style: 'currency',
          currency: 'USD',
        },
      },
    }
    return (
      <IntlProvider
        formats={formats}
        defaultFormats={formats}
        locale={this.props.locale}
        key={this.props.locale}
        messages={this.props.messages[this.props.locale]}
      >
        {React.Children.only(this.props.children)}
      </IntlProvider>
    )
  }
}

LanguageProvider.propTypes = {
  /** Locale of the language, 2 characters, defaults to 'en' */
  locale: PropTypes.string,
  /** Internationalized messages */
  messages: PropTypes.object,
  /** The content of the LanguageProvider */
  children: PropTypes.element.isRequired,
}
LanguageProvider.defaultProps = {
  locale: 'en',
}
