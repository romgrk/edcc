
import Maybe from 'folktale/maybe';
import {
  compose,
  assoc,
  prop,
  path,
  sortBy,
  groupBy,
  uniq
} from 'ramda';

const DEFAULT_SELECTION_VALUE = true


export const selectionMapFrom = (xs, key) =>
  xs.reduce((acc, cur) => {
    const id = cur[key] || 'Unknown'
    cur[key] = id
    acc[id] = { label: id, selected: DEFAULT_SELECTION_VALUE }
    return acc
  }, {})

export const assocSelected = xs =>
  xs.map(x => assoc('selected', DEFAULT_SELECTION_VALUE, x))

// Transforms data into a more usable format
export const prepare = compose(indexBy, assocSelected)

// Adds some informations on datasets
export const tagDatasets = (datasets, cellTypes, assays) =>
  datasets.map(set => {
    set.cell_type_category =
      Maybe.fromNullable(cellTypes[set.cell_type])
           .map(prop('cell_type_category'))
           .getOrElse(null)

    set.assay_category =
      Maybe.fromNullable(assays[set.assay])
           .map(prop('assay_category'))
           .getOrElse(null)

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

  return Object.values(datasets).filter(set => {
    if (!institutions[set.institution].selected)
      return false

    const cellTypeCategoryId = set.cell_type_category
    const isCellTypeCategorySelected =
      Maybe.fromNullable(prop(cellTypeCategoryId, cellTypeCategories))
      .map(prop('selected'))
      .getOrElse(false)

    if (!isCellTypeCategorySelected)
      return false

    const assayCategoryId = set.assay_category
    const isAssayCategorySelected =
      Maybe.fromNullable(prop(assayCategoryId, assayCategories))
      .map(prop('selected'))
      .getOrElse(false)

    if (!isAssayCategorySelected)
      return false

    return true
  })
}

export function asBooleanMap(data, key) {
  return data.reduce((acc, cur) => {
    acc[cur[key]] = false
    return acc
  }, {})
}

export function indexBy(xs, key = 'id') {
  return xs.reduce((acc, cur) => {
    acc[cur[key]] = cur
    return acc
  }, {})
}

