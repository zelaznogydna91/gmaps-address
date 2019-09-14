import isEmpty from 'lodash/isEmpty'
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
    width: '100%',
  },
  formControl: {
    // margin: theme.spacing(1),
    // minWidth: 350,
    // maxWidth: '100%',
    width: '100%',
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

function getStyles(value, list, theme) {
  return {
    fontWeight: list.indexOf(value) === -1 ? theme.typography.fontWeightRegular : theme.typography.fontWeightMedium,
  }
}

export default function ChipAreaSelect(props) {
  const classes = useStyles()
  const theme = useTheme()

  const { options, currentSelection, onChange, onAddNewArea } = props

  function handleChange(event) {
    const selection = event.target.value
    const values = selection.filter(x => x !== 'addNewAreaAction')
    if (values.length !== selection.length) {
      // props.onChange(selection)
      // Show google maps input field
      onAddNewArea()
      return
    }
    onChange(values)
  }

  function handleDelete(value) {
    return () => onChange(currentSelection.filter(x => x !== value))
  }

  return (
    <div className={classes.root}>
      <FormControl className={classes.formControl}>
        <InputLabel htmlFor="select-multiple-chip">Service Areas</InputLabel>
        <Select
          multiple
          fullWidth
          value={currentSelection}
          onChange={handleChange}
          input={<Input id="select-multiple-chip" />}
          renderValue={selected => (
            <div className={classes.chips}>
              {selected.map((value, id) => (
                <Chip onDelete={handleDelete(value)} key={id} label={value.caption} className={classes.chip} />
              ))}
            </div>
          )}
          MenuProps={MenuProps}
        >
          <MenuItem
            key="addNewAreaAction"
            value="addNewAreaAction"
            style={{
              fontWeight: theme.typography.fontWeightMedium,
              fontStyle: 'italic',
            }}
          >
            <FormattedMessage {...messages.addNewArea} />
          </MenuItem>
          {options.map((area, id) => (
            <MenuItem
              key={id}
              value={area}
              style={getStyles(area.caption, currentSelection.map(x => x.caption), theme)}
            >
              {area.caption}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  )
}

ChipAreaSelect.propTypes = {
  options: PropTypes.array,
}

ChipAreaSelect.defaultProps = {
  options: [],
}
