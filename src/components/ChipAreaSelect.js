import React from 'react'
import Input from '@material-ui/core/Input'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'
import FormControl from '@material-ui/core/FormControl'
import Select from '@material-ui/core/Select'
import Chip from '@material-ui/core/Chip'
import Typography from '@material-ui/core/Typography'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'
// import withStyles from '@material-ui/styles/withStyles'
import { withStyles } from '@material-ui/core/styles'

import messages from './messages'

const styles = theme => ({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    width: '100%',
  },
  selectorSection: {
    backgroundColor: '#00000015',
    padding: '0px',
  },
  formControl: {
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
    marginTop: theme.spacing.unit * 3,
  },
})

const ITEM_HEIGHT = 48
const ITEM_PADDING_TOP = 8
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 5.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
}

const ChipAreaSelect = props => {
  const { classes } = props
  const { options, currentSelection, onChange, onAddNewArea } = props

  function addNewAreaActionWasSelected(selection) {
    const values = selection.filter(x => x !== 'addNewAreaAction')
    return values.length !== selection.length
  }

  function handleChange(event) {
    const selection = event.target.value
    // eslint-disable-next-line no-unused-expressions
    addNewAreaActionWasSelected(selection) ? onAddNewArea() : onChange(selection)
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
                <Chip
                  onDelete={handleDelete(value)}
                  key={id}
                  label={`${value.caption} (${value.area})`}
                  className={classes.chip}
                />
              ))}
            </div>
          )}
          MenuProps={MenuProps}
        >
          <MenuItem
            key="addNewAreaAction"
            value="addNewAreaAction"
            style={{
              fontStyle: 'italic',
            }}
          >
            <FormattedMessage {...messages.addNewArea} />
          </MenuItem>
          {/* ------------- FROM BOUNDARIES SEPARATOR */}
          {options.some(a => a.isBoundary) && (
            <MenuItem value="" className={classes.selectorSection} disableGutters dense disabled>
              <Typography variant="caption">&nbsp;&nbsp;From boundaries</Typography>
            </MenuItem>
          )}

          {/* ------------- USER AREAS */}
          {options
            .filter(a => a.isBoundary)
            .map((area, id) => (
              <MenuItem key={id} value={area}>
                {`${area.caption}`}
              </MenuItem>
            ))}

          {/* ------------- USER AREAS SEPARATOR */}
          <MenuItem value="" className={classes.selectorSection} disableGutters dense disabled>
            <Typography variant="caption">&nbsp;&nbsp;User Areas</Typography>
          </MenuItem>

          {/* ------------- USER AREAS */}
          {options
            .filter(a => !a.isBoundary)
            .map((area, id) => (
              <MenuItem key={id} value={area}>
                {`${area.caption} (${area.area})`}
              </MenuItem>
            ))}
        </Select>
      </FormControl>
    </div>
  )
}

ChipAreaSelect.propTypes = {
  options: PropTypes.array,
  currentSelection: PropTypes.array,
  onChange: PropTypes.func,
  onAddNewArea: PropTypes.func,
}

ChipAreaSelect.defaultProps = {
  options: [],
}

export default withStyles(styles)(ChipAreaSelect)
