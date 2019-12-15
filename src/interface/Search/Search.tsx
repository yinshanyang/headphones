import * as React from 'react'
import { useContext } from 'react'

import { Context, setSelection } from 'app/store'
import { Button, Card, MenuItem, Position, Elevation } from '@blueprintjs/core'
import { Suggest } from '@blueprintjs/select'

const Select = Suggest.ofType()

const itemRenderer = (option, { handleClick, modifiers, query }) =>
  modifiers.matchesPredicate && (
    <MenuItem
      key={option.value}
      active={modifiers.active}
      onClick={handleClick}
      text={option.label}
    />
  )

const itemPredicate = (query, option) =>
  option.label.toLowerCase().indexOf(query.toLowerCase()) >= 0

const inputValueRenderer = ({ label }) => label || ''

const NoResults = <MenuItem disabled={true} text="No matches." />

const ClearButton = ({ onClick }) => (
  <Button minimal={true} icon="cross" onClick={onClick} />
)

const Search = () => {
  const [{ selection, data }, dispatch] = useContext(Context)
  const options = data.map(({ name }) => ({ label: name, value: name }))
  const selectedItem = null

  const handleSelect = (selection) => dispatch(setSelection([selection.value]))
  const handleDeselect = () => dispatch(setSelection([]))

  return (
    <>
      <style>
        {`.poopybutthead .bp3-menu { max-height: 24rem; overflow: auto }`}
      </style>
      <div
        className="absolute mw5-ns left-2-ns top-1 left-1 right-1 pa0 z-2"
        elevation={Elevation.ZERO}
      >
        <Select
          items={options}
          selectedItem={selectedItem}
          fill={true}
          itemRenderer={itemRenderer}
          itemPredicate={itemPredicate}
          inputValueRenderer={inputValueRenderer}
          onItemSelect={handleSelect}
          resetOnClose={true}
          resetOnSelect={true}
          placeholder="Search…"
          inputProps={{
            // leftIcon: 'search',
            large: true,
            rightElement:
              selection.length > 0 ? (
                <ClearButton onClick={handleDeselect} />
              ) : null
          }}
          popoverProps={{
            popoverClassName: 'poopybutthead',
            targetClassName: 'w-100',
            position: Position.BOTTOM_LEFT,
            minimal: true
          }}
          noResults={NoResults}
        />
      </div>
    </>
  )
}
export default Search
