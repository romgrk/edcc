/*
 * actions.js
 */

import Maybe from 'folktale/maybe';
import { compose, assoc, prop, path, sortBy, groupBy } from 'ramda';

import {
    prepare
  , tagDatasets
  , selectionMapFrom
  , normalizeData
  , generateGroupedMaps
  , generateGroupedMapsForKeys
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
export const SET_FILTER = 'SET_FILTER'
export const SET_FILTER_ALL = 'SET_FILTER_ALL'

export const SELECT_OVERVIEW = 'SELECT_OVERVIEW'

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



      const datasets = tagDatasets(datasetsData.dataset, cellTypes, assays)

      const groupByKeys = [
        'institution',
        'cell_type',
        'cell_type_category',
        'assay',
        'assay_category',
        'donorID',
        'epirr_id',
        'sampleID'
      ]

      const normalizedDatasets = {
        ...normalizeData(datasets),
        by: generateGroupedMapsForKeys(datasets, groupByKeys)
      }

      console.log(normalizedDatasets)

      dispatch(createAction(DATA.RECEIVE, {
        datasets: normalizedDatasets,
        cellTypes,
        cellTypeCategories,
        assays,
        assayCategories,
        institutions,
        otherSettings,
        epirrIds,
        donorIds
      }))
    })
    .catch(error => {
      dispatch(createAction(DATA.ERROR, error))
    })
  }
}

export const setFilter = (which, id, value) =>
  createAction(SET_FILTER, { which, id, value })

export const setFilterAll = (which, value) =>
  createAction(SET_FILTER_ALL, { which, value })

export const selectOverview = (overview) =>
  createAction(SELECT_OVERVIEW, { overview })

export const selectCell = (cellTypeId, assayId, value) =>
  createAction(SELECT_CELL, { assayId, cellTypeId, value })

export const selectRow = (cellTypeId) =>
  createAction(SELECT_ROW, { cellTypeId })

export const selectColumn = (assayId) =>
  createAction(SELECT_COLUMN, { assayId })
