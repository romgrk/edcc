/*
 * actions.js
 */

import Maybe from 'folktale/maybe';
import { compose, assoc, prop, path, sortBy, groupBy } from 'ramda';

import {
    prepare
  , tagDatasets
  , selectionMapFrom
} from './models';
import {
    fetchCellTypes
  , fetchAssays
  , fetchInstitutions
  , fetchDatasets
} from './requests';

const createFetchActionNames = base => ({
  REQUEST: `${base}_REQUEST`,
  RECEIVE: `${base}_RECEIVE`,
  ERROR:   `${base}_ERROR`
})

const createAction = (type, payload) => ({
  type, payload
})

export const DATA = createFetchActionNames('DATA')

export const SELECT_CELL   = 'SELECT_CELL'
export const SELECT_ROW    = 'SELECT_ROW'
export const SELECT_COLUMN = 'SELECT_COLUMN'

export const fetchData = () => {
  return (dispatch, getState) => {
    const { data } = getState()

    if (data.isLoading)
      return

    dispatch(createAction(DATA.REQUEST))

    Promise.all([
        fetchCellTypes()
      , fetchAssays()
      , fetchInstitutions()
      , fetchDatasets()
    ])
    .then(results => {
      const [
        cellTypesData,
        assaysData,
        institutionsData,
        datasetsData
      ] = results

      /* Data parsing/processing */

      const cellTypes          = prepare(cellTypesData.cell_type)
      const cellTypeCategories = prepare(cellTypesData.cell_type_category)

      const assays          = prepare(assaysData.assay)
      const assayCategories = prepare(assaysData.assay_category)

      const institutions = prepare(institutionsData.institution)

      const otherSettings = prepare([
        { id: 1, label: 'Non-registered' },
        { id: 2, label: 'Partial epigenomes' },
        { id: 3, label: 'Non-core assays' }
      ])

      const epirrIds = selectionMapFrom(datasetsData.dataset, 'epirr_id')

      const donorIds = selectionMapFrom(datasetsData.dataset, 'donorID')

      const datasets = prepare(tagDatasets(datasetsData.dataset, cellTypes, assays))

      console.log(datasets)

      dispatch(createAction(DATA.RECEIVE, {
        cellTypes,
        cellTypeCategories,
        assays,
        assayCategories,
        institutions,
        otherSettings,
        datasets,
        epirrIds,
        donorIds
      }))
    })
    .catch(error => {
      dispatch(createAction(DATA.ERROR, error))
    })
  }
}

export const selectCell = (assayId, cellTypeId) =>
  createAction(SELECT_CELL, { assayId, cellTypeId })

export const selectRow = (cellTypeId) =>
  createAction(SELECT_ROW, { cellTypeId })

export const selectColumn = (assayId) =>
  createAction(SELECT_COLUMN, { assayId })
