import * as React from 'react'
import { useState, useContext } from 'react'
import * as data from 'app/data/headphones.json'
import { scaleLinear, color, interpolateHcl, easeCubicInOut } from 'd3'
import Colors from 'app/colors'

import { Context, setSelection } from 'app/store'

import DeckGL, {
  COORDINATE_SYSTEM,
  TRANSITION_EVENTS,
  LineLayer,
  TextLayer,
  PolygonLayer,
  OrthographicView,
  LinearInterpolator
} from 'deck.gl'

const WIDTH = window.innerWidth
const HEIGHT = window.innerHeight
const MARGIN = window.innerWidth > 480 && window.innerHeight > 480 ? 32 : 16
const ZOOM = Math.log2(Math.min(WIDTH, HEIGHT) - MARGIN * 2) - 1
const INITIAL_VIEW_STATE = {
  width: WIDTH,
  height: HEIGHT,
  target: [0, 0],
  zoom: ZOOM
}

// transform the data here
const scales = {
  w: scaleLinear()
    .domain([0, 149])
    .range([-0.018, 0.018]),
  h: scaleLinear()
    .domain([-30, 30])
    .range([0.006, -0.006])
    .clamp(true),
  c: scaleLinear()
    .domain([30, 15, 0, -15, -30])
    .range([Colors.positive, Colors.foreground, Colors.negative])
    .interpolate(interpolateHcl)
}
data.lines = data
  .map(({ name, position, pairs }) =>
    pairs.map(([d1, d2], i) => {
      const { r, g, b } = color(scales.c((d1 + d2) / 2))
      return {
        name,
        color: [r, g, b],
        position: [
          [position[0] + scales.w(i), position[1] + scales.h(d1)],
          [position[0] + scales.w(i + 1), position[1] + scales.h(d2)]
        ]
      }
    })
  )
  .reduce((memo, d) => [...memo, ...d], [])
data.texts = data.map(({ name, position, pairs }) => ({
  name,
  position: [
    position[0] + scales.w(150),
    position[1] + scales.h(pairs[pairs.length - 1][1])
  ]
}))

const lineLayer = new LineLayer({
  id: 'line',
  coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
  data: data.lines,
  getSourcePosition: (d) => d.position[0],
  getTargetPosition: (d) => d.position[1],
  getColor: (d) => d.color,
  getWidth: 1,
  widthMinPixels: 2,
  widthMaxPixels: 2
})
const textLayer = new TextLayer({
  id: 'text',
  coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
  data: data.texts,
  sizeUnits: 'meters',
  sizeScale: 0.0012,
  fontFamily: '-apple-system, sans-serif',
  getPosition: (d) => d.position,
  getText: (d) => d.name,
  getTextAnchor: 'start',
  getAlignmentBaseline: 'center',
  getSize: 1,
  sizeMinPixels: 0,
  sizeMaxPixels: 16,
  pickable: true,
  _subLayerProps: {
    characters: { alphaCutoff: 0 }
  },
  getColor: () => Colors.foregroundArray
})

const layerFilter = ({ layer, viewport }) => {
  return layer.id.match('text') && viewport.zoom < 11 ? false : true
}
const views = [
  new OrthographicView({
    id: 'view',
    controller: true
  })
]

const Map = () => {
  const [{ selection }, dispatch] = useContext(Context)
  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE)
  const [previous, setPrevious] = useState(null)

  const handleViewStateChange = ({ viewState }) => {
    setViewState(viewState)
    setPrevious(selection)
  }
  const handleDeselect = () => dispatch(setSelection([]))
  // const getCursor = ({ isDragging }) =>
  //   isDragging ? 'move' : isHovered ? 'pointer' : 'default'

  const _viewState =
    selection.length && previous !== selection
      ? {
          ...viewState,
          target: selection[0].position,
          zoom: Math.max(viewState.zoom, 12.5),
          transitionDuration: 1200,
          transitionEasing: easeCubicInOut,
          transitionInterpolator: new LinearInterpolator(['zoom', 'target']),
          transitionInterruption: TRANSITION_EVENTS.BREAK
        }
      : viewState

  const overlayLayer =
    selection.length &&
    new PolygonLayer({
      id: 'overlay',
      coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
      data: [
        [
          [-1.5, -1.5],
          [-1.5, 1.5],
          [1.5, 1.5],
          [1.5, -1.5],
          [-1.5, -1.5]
        ]
      ],
      getPolygon: (d) => d,
      filled: true,
      stroked: false,
      getFillColor: Colors.backgroundArray,
      opacity: 0.5,
      pickable: true,
      onClick: handleDeselect
    })
  const selectionLineLayer =
    selection.length &&
    new LineLayer({
      id: 'selection-line',
      coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
      data: selection.lines,
      getSourcePosition: (d) => d.position[0],
      getTargetPosition: (d) => d.position[1],
      getColor: Colors.activeArray,
      getWidth: 1,
      widthMinPixels: 2,
      widthMaxPixels: 2
    })
  const selectionTextLayer =
    selection.length &&
    new TextLayer({
      id: 'selection-text',
      coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
      data: selection.texts,
      sizeUnits: 'meters',
      sizeScale: 0.0012,
      fontFamily: '-apple-system, sans-serif',
      getPosition: (d) => d.position,
      getText: (d) => d.name,
      getColor: Colors.activeArray,
      getTextAnchor: 'start',
      getAlignmentBaseline: 'center',
      getSize: 1,
      sizeMinPixels: 0,
      sizeMaxPixels: 16
    })

  const layers = [
    lineLayer,
    textLayer,
    overlayLayer,
    selectionLineLayer,
    selectionTextLayer
  ]

  return (
    <DeckGL
      layerFilter={layerFilter}
      layers={layers}
      views={views}
      viewState={_viewState}
      onViewStateChange={handleViewStateChange}
    />
  )
}

export default Map

// ...deckgl.viewState.view,
// zoom: Math.max(deckgl.viewState.view.zoom, 8),
// target: [...selection.position, 0],
// transitionDuration: 600,
// transitionEasing: d3.easeCubicInOut,
// transitionInterpolator: new deck.LinearInterpolator(['zoom', 'target']),
// transitionInterruption: deck.TRANSITION_EVENTS.BREAK
