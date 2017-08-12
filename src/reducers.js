
import { combineReducers } from 'redux';

import {
  DATA
} from './actions';

function uiReducer(state = {}, action) {
  switch(action.type) {
    case DATA.ERROR: {
      return { ...state, hasError: true, message: action.message }
    }
    default: return state;
  }
}

function dataReducer(state = {}, action) {
  switch(action.type) {
    case DATA.REQUEST: {
      return { isLoading: true }
    }
    case DATA.RECEIVE: {
      return { isLoading: false, ...action.payload }
    }
    case DATA.ERROR: {
      return { isLoading: false }
    }
    default: return state;
  }
}


export const rootReducer = combineReducers({
  ui:   uiReducer,
  data: dataReducer
})
