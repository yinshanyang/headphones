import * as React from 'react'
import { useState, useContext } from 'react'
import * as data from 'app/data/headphones.json'
import { scaleLinear, color } from 'd3'

import { Context, setSelection } from 'app/store'

import DeckGL, {
  COORDINATE_SYSTEM,
  LineLayer,
  TextLayer,
  PolygonLayer,
  OrthographicView
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
    .range([
      'rgb(28, 96, 159)',
      'rgb(108, 180, 215)',
      'rgb(216, 216, 216)',
      'rgb(248, 135, 57)',
      'rgb(220, 75, 4)'
    ])
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
  }
})

// const overlayLayer =
//   selection.length &&
//   new PolygonLayer({
//     id: 'overlay',
//     coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
//     data: [
//       [
//         [-1.5, -1.5],
//         [-1.5, 1.5],
//         [1.5, 1.5],
//         [1.5, -1.5],
//         [-1.5, -1.5]
//       ]
//     ],
//     getPolygon: (d) => d,
//     filled: true,
//     stroked: false,
//     getFillColor: [255, 255, 255],
//     opacity: 0.5,
//     pickable: true,
//     onClick: handleDeselect
//   })
// const selectionLineLayer =
//   selection.length &&
//   new LineLayer({
//     id: 'selection-line',
//     coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
//     data: selection.lines,
//     getSourcePosition: (d) => d.position[0],
//     getTargetPosition: (d) => d.position[1],
//     getColor: [255, 128, 0],
//     getWidth: 1,
//     widthMinPixels: 2,
//     widthMaxPixels: 2
//   })
// const selectionTextLayer =
//   selection.length &&
//   new TextLayer({
//     id: 'selection-text',
//     coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
//     data: selection.texts,
//     sizeUnits: 'meters',
//     sizeScale: 0.0012,
//     fontFamily: '-apple-system, sans-serif',
//     getPosition: (d) => d.position,
//     getText: (d) => d.name,
//     getColor: [255, 128, 0],
//     getTextAnchor: 'start',
//     getAlignmentBaseline: 'center',
//     getSize: 1,
//     sizeMinPixels: 0,
//     sizeMaxPixels: 16
//   })

const layerFilter = ({ layer, viewport }) => {
  return layer.id.match('text') && viewport.zoom < 11 ? false : true
}
const layers = [lineLayer, textLayer]
const views = [
  new OrthographicView({
    id: 'view',
    controller: true
  })
]

const Map = () => {
  // const [{ selection, data }, dispatch] = useContext(Context)
  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE)
  const [isHovered, setIsHovered] = useState(false)

  const handleViewStateChange = ({ viewState }) => setViewState(viewState)
  // const handleDeselect = () => dispatch(setSelection([]))
  // const getCursor = ({ isDragging }) =>
  //   isDragging ? 'move' : isHovered ? 'pointer' : 'default'

  return (
    <DeckGL
      layerFilter={layerFilter}
      layers={layers}
      views={views}
      viewState={viewState}
      onViewStateChange={handleViewStateChange}
      // getCursor={getCursor}
    />
  )
}

export default Map
