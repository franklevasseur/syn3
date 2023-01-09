import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import ReactGA from 'react-ga4'
import App from './App'

const MEASUREMENT_ID = 'G-EKNN287WKQ'
ReactGA.initialize(MEASUREMENT_ID)
ReactGA.send({ hitType: 'pageview', page: window.location.toString() })
const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
