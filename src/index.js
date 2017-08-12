
import './polyfills'
import './style.css';

import React, { Component } from 'react';
import { render } from 'react-dom';

import { Provider } from 'react-redux';
import { createLogger } from 'redux-logger';
import thunkMiddleware from 'redux-thunk';
import { compose, createStore, applyMiddleware } from 'redux';

import { rootReducer } from './reducers';
import { fetchData } from './actions';

import App from './components/App';


let store
let initialState = {}

if (process.env.NODE_ENV === 'production')
  store = createStore(rootReducer, initialState, applyMiddleware(thunkMiddleware))
else
  store = createStore(
    rootReducer, initialState,
    compose(applyMiddleware(thunkMiddleware, createLogger()),
      window.devToolsExtension ? window.devToolsExtension() : f => f))

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.querySelector('#root'))

store.dispatch(fetchData())

if (module.hot) {
  module.hot.accept(['./reducers',  './actions', './components/App'], () => {
    const NextApp = require('./components/App').default;
    render(
      <Provider store={store}>
        <NextApp />
      </Provider>,
      document.querySelector('#root')
    );
  });
}
