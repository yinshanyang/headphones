import * as React from 'react'

import Details from 'app/interface/Details'
import Search from 'app/interface/Search'
import Map from 'app/interface/Map'

import Colors from 'app/colors'

document.body.style.background = Colors.background

const Module = () => (
  <div className="absolute top-0 bottom-0 left-0 right-0 overflow-hidden">
    <Search />
    <Map />
  </div>
)

export default Module
