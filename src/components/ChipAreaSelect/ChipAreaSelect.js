import React from 'react'
import { makeStyles, useTheme } from '@material-ui/core/styles'
import Input from '@material-ui/core/Input'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'
import FormControl from '@material-ui/core/FormControl'
import Select from '@material-ui/core/Select'
import Chip from '@material-ui/core/Chip'

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

const areas = [
  'Kendall, Fl',
  'Miami, Fl',
  'Coral Gables, Fl',
  'Weston, Fl',
  'Ft. Lauderdale, Fl',
  'Little Havana, Fl',
  'Hialeah, Fl',
  'Homestead, Fl',
  'Miami Springs, Fl',
  'Miami Garden, Fl',
]

function getStyles(name, personName, theme) {
  return {
    fontWeight:
      personName.indexOf(name) === -1 ? theme.typography.fontWeightRegular : theme.typography.fontWeightMedium,
  }
}

export default function ChipAreaSelect() {
  const classes = useStyles()
  const theme = useTheme()
  const [personName, setPersonName] = React.useState([])

  function handleChange(event) {
    const selection = event.target.value
    const values = selection.filter(x => x !== 'addNewAreaAction')
    if (values.length !== selection.length) {
      alert('te cogi')
      // Show google maps input field
      return
    }
    setPersonName(values)
  }

  function handleDelete(value) {
    return () => setPersonName(personName.filter(x => x !== value))
  }

  return (
    <div className={classes.root}>
      <FormControl className={classes.formControl}>
        <InputLabel htmlFor="select-multiple-chip">Service Areas</InputLabel>
        <Select
          multiple
          value={personName}
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
            Add New Area ...
          </MenuItem>
          {areas.map(name => (
            <MenuItem key={name} value={name} style={getStyles(name, personName, theme)}>
              {name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  )
}
