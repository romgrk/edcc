
import Maybe from 'folktale/maybe';
import {
  compose,
  assoc,
  prop,
  path,
  sortBy,
  groupBy
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

