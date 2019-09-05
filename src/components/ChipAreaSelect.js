import React from 'react'
import { makeStyles, useTheme } from '@material-ui/core/styles'
import Input from '@material-ui/core/Input'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'
import FormControl from '@material-ui/core/FormControl'
import Select from '@material-ui/core/Select'
import Chip from '@material-ui/core/Chip'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'
import messages from './messages'

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 350,
    maxWidth: '100%',
  },
  chips: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  chip: {
    margin: 2,
  },
  noLabel: {
    marginTop: theme.spacing(3),
  },
}))

const ITEM_HEIGHT = 48
const ITEM_PADDING_TOP = 8
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
}

function getStyles(name, personName, theme) {
  return {
    fontWeight:
      personName.indexOf(name) === -1 ? theme.typography.fontWeightRegular : theme.typography.fontWeightMedium,
  }
}

export default function ChipAreaSelect(props) {
  const classes = useStyles()
  const theme = useTheme()
  const [currentSelection, setCurrentSelection] = React.useState([])
  const { areas } = props

  function handleChange(event) {
    const selection = event.target.value
    const values = selection.filter(x => x !== 'addNewAreaAction')
    if (values.length !== selection.length) {
      alert('te cogi')
      // Show google maps input field
      return
    }
    setCurrentSelection(values)
  }

  function handleDelete(value) {
    return () => setCurrentSelection(currentSelection.filter(x => x !== value))
  }

  return (
    <div className={classes.root}>
      <FormControl className={classes.formControl}>
        <InputLabel htmlFor="select-multiple-chip">Service Areas</InputLabel>
        <Select
          multiple
          value={currentSelection}
          onChange={handleChange}
          input={<Input id="select-multiple-chip" />}
          renderValue={selected => (
            <div className={classes.chips}>
              {selected.map(value => (
                <Chip onDelete={handleDelete(value)} key={value} label={value} className={classes.chip} />
              ))}
            </div>
          )}
          MenuProps={MenuProps}
        >
          <MenuItem
            key="addNewAreaAction"
            value="addNewAreaAction"
            style={{
              fontWeight: theme.typography.fontWeightRegular,
              fontStyle: 'italic',
            }}
          >
            <FormattedMessage {...messages.addNewArea} />
          </MenuItem>
          {areas.map(name => (
            <MenuItem key={name} value={name} style={getStyles(name, currentSelection, theme)}>
              {name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  )
}

ChipAreaSelect.propTypes = {
  areas: PropTypes.array,
}

ChipAreaSelect.defaultProps = {
  areas: [],
}
