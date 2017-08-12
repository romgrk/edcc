
import cellTypesData from './data/cellTypes.json';
import assaysData from './data/assays.json';
import institutionsData from './data/institutions.json';
import datasetsData from './data/datasets.json';


export function fetchCellTypes() {
  return Promise.resolve(cellTypesData)
}

export function fetchAssays() {
  return Promise.resolve(assaysData)
}

export function fetchInstitutions() {
  return Promise.resolve(institutionsData)
}

export function fetchDatasets() {
  return Promise.delay(2000)
    .then(() => Promise.resolve(datasetsData))
}
