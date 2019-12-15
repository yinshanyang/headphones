import * as React from 'react'

import 'normalize.css'
import '@blueprintjs/core/lib/css/blueprint.css'
import 'tachyons'

import StoreProvider from 'app/store'
import _Module from 'app/interface/Module'

// import { Classes } from '@blueprintjs/core'

// if (window.matchMedia('(prefers-color-scheme: dark)').matches || true) {
//   document.body.classList.add(Classes.DARK)
// }

document.body.style.position = 'fixed'
document.body.style.top = '0px'
document.body.style.bottom = '0px'
document.body.style.left = '0px'
document.body.style.right = '0px'
document.body.style.overflow = 'hidden'

const Module = () => (
  <StoreProvider>
    <_Module />
  </StoreProvider>
)

export default Module
