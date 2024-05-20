import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './App.css'
import {BrowserRouter as Router} from 'react-router-dom';

import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { persistor, store } from './components/store/Store.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
    <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <Router>
      <App />
      </Router>
    </PersistGate>
    </Provider>
)
