
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
  isLoading:          state.data.isLoading,
  hasData:            state.data.hasData,
  datasets:           state.data.datasets,
  donorIds:           state.data.donorIds,
  epirrIds:           state.data.epirrIds,
  assays:             state.data.assays,
  assayCategories:    state.data.assayCategories,
  cellTypes:          state.data.cellTypes,
  cellTypeCategories: state.data.cellTypeCategories,
  assayCategories:    state.data.assayCategories,
  institutions:       state.data.institutions,
  otherSettings:      state.data.otherSettings,
})
const mapDispatchToProps = dispatch => ({

})

class App extends Component {
  constructor() {
    super();
    this.state = {
      visiblePanel: undefined,
      selectedOverview: overviewOptions[0],
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
    } = this.props

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

  render() {

    const { isLoading, hasData } = this.props

    if (isLoading || !hasData) {
      return (
        <div className='App'>
          <div className='App__left'>
            <div className='App__loading'>
              <div className='spinner'/>
              <div>
                Loading data
              </div>
            </div>
          </div>
          <div className='App__right'>
          </div>
        </div>
      );
    }

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
          Object.entries(state[key]).reduce((acc, [optionName, option]) => {
            option.selected = value
            acc[optionName] = option
            return acc
          }, {})}))

    const onChangeOverview = option =>
      this.setState({ selectedOverview: option })

    const createList = (title, key, labelBy) =>
      <List
        title={title}
        folded={this.state.visiblePanel !== key}
        data={this.props[key]}
        labelBy={labelBy}
        onChange={toggleValueHandler(key)}
        onToggle={togglePanelHandler(key)}
        onToggleAll={toggleAllHandler(key)}
      />

    const { selectedOverview } = this.state
    const overviewKey = selectedOverview.value

    const selectedSets = this.getSelectedSets()
    console.log(selectedSets)

    const dataByKey = countByKey(selectedSets, overviewKey)

    const overviewData =
      Object.entries(dataByKey).reduce((acc, [label, value]) =>
        acc.concat({ label, value }), [])

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
            <Grid data={selectedSets} />
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


export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App)
