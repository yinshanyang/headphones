export type Action = {
  type: string
  payload?: any
}

export type State = {
  selection: Selection
  data: Headphones
}

export type Selection = string[]

export type Headphone = {
  name: string
  position: number[]
  pairs: number[][]
}
export type Headphones = Headphone[]
