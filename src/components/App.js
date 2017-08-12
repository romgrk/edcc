
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { compose, assoc, prop, path, sortBy, groupBy } from 'ramda';
import Maybe from 'folktale/maybe';

import List from './List';
import Overview from './Overview';
import Grid from './Grid';
import { asBooleanMap, indexBy, prepare, selectionMapFrom } from '../models';
import { overviewOptions } from '../constants';

import cellTypesData from '../data/cellTypes.json';
import assaysData from '../data/assays.json';
import institutionsData from '../data/institutions.json';
import datasetsData from '../data/datasets.json';



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


const datasets = datasetsData.dataset
  .map(set => {
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

console.log(datasets)


const epirrIds = selectionMapFrom(datasets, 'epirr_id')

const donorIds = selectionMapFrom(datasets, 'donorID')


const isSelected = prop('selected')

const countByKey = (xs, key) =>
  xs.reduce((acc, cur) => {
    if (cur[key] in acc)
      acc[cur[key]] += 1
    else
      acc[cur[key]] = 1
    return acc
  }, {})


/* App */

const mapStateToProps = state => ({
  isLoading: state.data.isLoading
})
const mapDispatchToProps = dispatch => ({

})

class App extends Component {
  constructor() {
    super();
    this.state = {
      visiblePanel: undefined,
      selectedOverview: overviewOptions[0],

      donorIds:           donorIds,
      epirrIds:           epirrIds,
      assays:             assays,
      assayCategories:    assayCategories,
      cellTypes:          cellTypes,
      cellTypeCategories: cellTypeCategories,
      assayCategories:    assayCategories,
      institutions:       institutions,
      otherSettings:      otherSettings,

      datasets: datasets
    };
  }

  getSelectedSets() {
    const {
      institutions,
      datasets,
      assays,
      assayCategories,
      cellTypes,
      cellTypeCategories
    } = this.state

    return datasets.filter(set => {
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

  getSortedSets() {
    return this.getSelectedSets()
  }

  render() {

    const { isLoading } = this.props

    const toggleValueHandler = key =>
      (id, value) =>
        this.setState(state =>
          ({ [key]:
            Object.assign(state[key], { [id]:
              Object.assign(state[key][id], { selected: value }) }) }))

    const togglePanelHandler = key =>
      value => this.setState({ visiblePanel: value ? key : '' })

    const toggleAllHandler = key =>
      value =>
        this.setState(state => ({ [key]:
          Object.entries(state[key]).reduce((acc, cur) => {
            cur[1].selected = value
            acc[cur[0]] = cur[1]
            return acc
          }, {})}))

    const onChangeOverview = option =>
      this.setState({ selectedOverview: option })

    const createList = (title, key, labelBy) =>
      <List
        title={title}
        folded={this.state.visiblePanel !== key}
        data={this.state[key]}
        labelBy={labelBy}
        onChange={toggleValueHandler(key)}
        onToggle={togglePanelHandler(key)}
        onToggleAll={toggleAllHandler(key)}
      />

    const { selectedOverview } = this.state
    const overviewKey = selectedOverview.value

    const datasets = this.getSelectedSets()
    console.log(datasets)

    const dataByKey = countByKey(datasets, overviewKey)

    const overviewData =
      Object.entries(dataByKey).reduce((acc, [label, value]) =>
        acc.concat({ label, value }), [])

    const selectedAssays =
      Object.values(this.state.assays)
        .filter(assay => assayCategories[assay.assay_category].selected)

    const selectedAssayCategories =
      Object.values(this.state.assayCategories)
        .filter(isSelected)

    return (
      <div className='App'>
        <div className='App__left'>
          { isLoading &&
            <div className='App__loading'>
              <div className='spinner'/>
              <div>
                Loading data
              </div>
            </div>
          }
          { !isLoading &&
            <Grid
            data={datasets}
            assays={this.state.assays}
            assayCategories={assayCategories}
            cellTypes={this.state.cellTypes}
            cellTypeCategories={this.state.cellTypeCategories} />
          }
        </div>
        <div className='App__right'>
          { createList('Epirr ID', 'epirrIds', 'label') }
          { createList('Donor ID', 'donorIds', 'label') }
          { createList('Track Hubs', 'institutions', 'name') }
          { createList('Assay Categories', 'assayCategories', 'name') }
          { createList('Cell Types', 'cellTypeCategories', 'name') }
          { createList('Other Settings', 'otherSettings', 'label') }
          <hr/>
          <Overview
            data={overviewData}
            selected={selectedOverview.label}
            onChange={onChangeOverview}
          />
        </div>
      </div>
    );
  }
}

function cellText(cellTypeId) {
  const cellType = cellTypes[cellTypeId]
  const cellTypeCategory = cellTypeCategories[cellType.cell_type_category]
  return `${cellType.name} - ${cellTypeCategory.name}`
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App)
