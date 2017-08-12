
import { combineReducers } from 'redux';
import { overviewOptions } from './constants';
import {
    generateGridMap
  , getSelectedSets
  , getDistinctAssays
} from './models';

import {
    DATA
  , SET_FILTER
  , SET_FILTER_ALL
  , SELECT_OVERVIEW
  , SELECT_CELL
  , SELECT_ROW
  , SELECT_COLUMN
} from './actions';


const defaultUI = {
  overview: overviewOptions[0]
}

function uiReducer(state = defaultUI, action) {
  switch(action.type) {
    case SELECT_OVERVIEW: {
      const { overview } = action.payload
      return { ...state, overview }
    }
    case DATA.ERROR: {
      return { ...state, hasError: true, message: action.message }
    }
    default: return state;
  }
}


const computeDerivedData = data => {
  const selectedSets = getSelectedSets(data)
  const gridMap = generateGridMap(selectedSets)
  const distinctAssays = getDistinctAssays(selectedSets)
  return { ...data, selectedSets, gridMap, distinctAssays }
}

function dataReducer(state = {}, action) {
  switch(action.type) {
    case DATA.REQUEST: {
      return { hasData: false, isLoading: true }
    }
    case DATA.RECEIVE: {
      return computeDerivedData({ hasData: true, isLoading: false, ...action.payload })
    }
    case DATA.ERROR: {
      return { hasData: false, isLoading: false }
    }
    case SET_FILTER: {
      const { which, id, value } = action.payload
      const newData = { ...state[which] }
      newData[id] = { ...newData[id], selected: value }
      return computeDerivedData({ ...state, [which]: newData })
    }
    case SET_FILTER_ALL: {
      const { which, value } = action.payload
      const newData =
        Object.keys(state[which]).reduce((acc, key) => {
          acc[key] = { ...state[which][key], selected: value }
          return acc
        }, {})
      return computeDerivedData({ ...state, [which]: newData })
    }
    default: return state;
  }
}

function selectionReducer(state = {}, action, data) {
  switch(action.type) {
    case SET_FILTER:
    case SET_FILTER_ALL: {
      return {}
    }
    case SELECT_CELL: {
      const { cellTypeId, assayId } = action.payload
      const newState = { ...state }
      newState[cellTypeId] = { ...newState[cellTypeId], [assayId]: true }
      return newState
    }
    case SELECT_ROW: {
      const { cellTypeId } = action.payload
      const newState = { ...state }
      newState[cellTypeId] = data.distinctAssays.reduce((acc, assayId) => {
          acc[assayId] = true
          return acc
        }, {})
      return newState
    }
    case SELECT_COLUMN: {
      const { assayId } = action.payload
      const newState = { ...state }
      Object.keys(data.gridMap).forEach(cellTypeId => {
        newState[cellTypeId] = { ...newState[cellTypeId], [assayId]: true }
      })
      return newState
    }
    default: return state;
  }
}

export function rootReducer(state = {}, action) {
  const ui        = uiReducer(state.ui, action)
  const data      = dataReducer(state.data, action)
  const selection = selectionReducer(state.selection, action, data)
  return { ui, data, selection }
}
