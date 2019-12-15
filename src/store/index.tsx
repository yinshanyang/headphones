import * as React from 'react'
import { createContext, useReducer } from 'react'
import { color, scaleLinear } from 'd3'
import * as data from 'app/data/headphones.json'

import { Action, State, Selection } from 'app/types'

const initialState: State = {
  selection: [],
  data
}

const setSelectionReducer = (state: State, action: Action): State => {
  const selection = action.payload.map((name) =>
    data.find((d) => d.name === name)
  )
  selection.lines = data.lines.filter(({ name }) =>
    action.payload.includes(name)
  )
  selection.texts = data.texts.filter(({ name }) =>
    action.payload.includes(name)
  )
  return {
    ...state,
    selection
  }
}

export const Context = createContext(initialState)
export const Consumer = Context.Consumer

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'SET_SELECTION':
      return setSelectionReducer(state, action)
    default:
      return state
  }
}

export const setSelection = (selection: Selection): Action => ({
  type: 'SET_SELECTION',
  payload: selection
})

const Provider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState)
  return (
    <Context.Provider value={[state, dispatch]}>{children}</Context.Provider>
  )
}

export default Provider
