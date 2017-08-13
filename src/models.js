
import Maybe from 'folktale/maybe';
import {
  compose,
  assoc,
  prop,
  path,
  sortBy,
  groupBy,
  indexBy,
  uniq,
} from 'ramda';

import { getOrElse } from './utils';

const DEFAULT_SELECTION_VALUE = true


export const selectionMapFrom = (xs, key) =>
  xs.reduce((acc, cur) => {
    const id = cur[key] || 'Unknown'
    cur[key] = id /* mutation */
    acc[id] = { label: id, selected: DEFAULT_SELECTION_VALUE }
    return acc
  }, {})

export const assocSelected = xs =>
  xs.map(x => assoc('selected', DEFAULT_SELECTION_VALUE, x))

// Transforms data into a more usable format
export const prepare = compose(indexBy(prop('id')), assocSelected)

// Transforms data into a more usable format
export function normalizeData(data) {
  const list = []
  const byId = data.reduce((acc, cur) => {
    list.push(cur.id)
    acc[cur.id] = cur
    return acc
  }, {})
  return { byId, list }
}

export function generateGroupedMaps(datasets, description) {
  const descriptionEntries = Object.entries(description)

  const maps = descriptionEntries.reduce((acc, [name, key]) => {
    acc[name] = {}
    return acc
  }, {})

  datasets.forEach(set => {
    descriptionEntries.forEach(([name, key]) => {
      const index = set[key]
      if (!maps[name][index])
        maps[name][index] = []
      maps[name][index].push(set.id)
    })
  })

  return maps
}

export function generateGroupedMapsForKeys(datasets, keys) {
  const maps = keys.reduce((acc, key) => {
    acc[key] = {}
    return acc
  }, {})

  datasets.forEach(set => {
    keys.forEach(key => {
      const index = set[key]
      if (!maps[key][index])
        maps[key][index] = []
      maps[key][index].push(set.id)
    })
  })

  return maps
}


// Adds some informations on datasets
export const tagDatasets = (datasets, cellTypes, assays) =>
  datasets.map(set => {
    set.cell_type_category =
      getOrElse(cellTypes[set.cell_type], 'cell_type_category', null)

    set.assay_category =
      getOrElse(assays[set.assay], 'assay_category', null)

    return set
  })

// Returns an array of unique assays in the provided sets
export const getDistinctAssays = sets =>
  uniq(sortBy(prop('assay_category'), sets).map(d => d.assay))

// Generate a map of sets by assay by cellType
export const generateGridMap = sets =>
  Object.entries(groupBy(prop('cell_type'), sets)).reduce((acc, [key, groupedSets]) => {
    acc[key] = groupBy(prop('assay'), groupedSets)
    return acc
  }, {})


// Returns the list of selected sets
export const getSelectedSets = data => {
  const {
    datasets,
    institutions,
    assays,
    assayCategories,
    cellTypes,
    cellTypeCategories,
  } = data

  return Object.values(datasets.byId).filter(set => {
    const isInstitutionSelected =
      getOrElse(
        institutions[set.institution],
        'selected',
        false
      )

    if (!isInstitutionSelected)
      return false

    const cellTypeCategoryId = set.cell_type_category
    const isCellTypeCategorySelected =
      getOrElse(
        prop(cellTypeCategoryId, cellTypeCategories),
        'selected',
        false
      )

    if (!isCellTypeCategorySelected)
      return false

    const assayCategoryId = set.assay_category
    const isAssayCategorySelected =
      getOrElse(
        prop(assayCategoryId, assayCategories),
        'selected',
        false
      )

    if (!isAssayCategorySelected)
      return false

    return true
  })
}


