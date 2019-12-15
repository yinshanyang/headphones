import * as React from 'react'
import { useState, useRef } from 'react'
import { useDrag } from 'react-use-gesture'

import { Card, Elevation } from '@blueprintjs/core'

const OFFSET = -128
const HEIGHT = window.innerHeight

const Details = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [offset, setOffset] = useState(OFFSET)
  const isFull = -HEIGHT === offset
  const isSmall = window.innerWidth < 481

  const handleOpen = () => {
    setIsOpen(true)
    setOffset(-HEIGHT)
  }
  const handleClose = () => {
    setIsOpen(false)
    setOffset(OFFSET)
  }
  const handleReset = () => {
    if (isOpen) {
      setOffset(-HEIGHT)
    } else {
      setOffset(OFFSET)
    }
  }

  const bind = useDrag(({ event, last, movement: [_, my] }) => {
    if (isOpen) {
      setOffset(Math.max(-HEIGHT + my, -HEIGHT))
    } else {
      const dy = OFFSET + my
      if (dy > OFFSET) {
        setOffset(OFFSET + my / 2)
      } else {
        setOffset(dy)
      }
    }

    if (last) {
      if (!isOpen && my < -120) {
        handleOpen()
      } else if (isOpen && my > 120) {
        handleClose()
      } else {
        handleReset()
      }
    }
  })

  return (
    <Card
      {...bind()}
      className="absolute h-100 left-1-ns left-0 right-0 ph3 pb3 pt3 z-1"
      elevation={Elevation.THREE}
      style={{
        top: '100%',
        right: isSmall ? '' : 'auto',
        transform: `translateY(${offset}px)`,
        borderRadius: isFull ? 0 : ''
      }}
    >
      <div
        className="w5-ns w-100"
        style={{
          transition: 'margin 0.3s ease-in-out',
          marginTop: isFull ? '3rem' : 0
        }}
      >
        <h2 className="lh-solid ma0">Why Hello There</h2>
      </div>
    </Card>
  )
}

export default Details
