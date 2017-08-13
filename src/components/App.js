
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { compose, assoc, prop, path, sortBy, groupBy } from 'ramda';
import Maybe from 'folktale/maybe';

import List from './List';
import Overview from './Overview';
import Grid from './Grid';
import { getOrElse } from '../utils';
import { indexBy, prepare, selectionMapFrom } from '../models';
import {
  overviewOptions,
  colorScale
} from '../constants';
import {
  setFilter,
  setFilterAll
} from '../actions';


const isSelected = prop('selected')


/* App */

const mapStateToProps = state => ({
  isLoading:          state.data.isLoading,
  hasData:            state.data.hasData,
  datasets:           getOrElse(state.data.datasets, 'byId', {}),
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
  setFilter: compose(dispatch, setFilter),
  setFilterAll: compose(dispatch, setFilterAll)
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
      cellTypeCategories,
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

    const {
      isLoading,
      hasData,
      setFilter,
      setFilterAll,
    } = this.props

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
        setFilter(key, id, value)

    const toggleAllHandler = key =>
      value =>
        setFilterAll(key, value)

    const togglePanelHandler = key =>
      value => this.setState({ visiblePanel: value ? key : '' })


    const onChangeOverview = option =>
      this.setState({ selectedOverview: option })

    const createList = (title, key, labelBy, render) =>
      <List
        title={title}
        folded={this.state.visiblePanel !== key}
        data={this.props[key]}
        labelBy={labelBy}
        render={render}
        onChange={toggleValueHandler(key)}
        onToggle={togglePanelHandler(key)}
        onToggleAll={toggleAllHandler(key)}
      />

    const { selectedOverview } = this.state
    const overviewKey = selectedOverview.value

    //const selectedSets = this.getSelectedSets()
    //console.log(selectedSets)

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
            <Grid />
          }
        </div>
        <div className='App__right'>
          { createList('Epirr ID', 'epirrIds', 'label') }
          { createList('Donor ID', 'donorIds', 'label') }
          { createList('Track Hubs', 'institutions', undefined, item => 
            <span>
              <span
                className='color-drop'
                style={{ backgroundColor: colorScale(item.id) }} />
              { item.name }
            </span>
          ) }
          { createList('Assay Categories', 'assayCategories', 'name') }
          { createList('Cell Types', 'cellTypeCategories', 'name') }
          { createList('Other Settings', 'otherSettings', 'label') }
          <hr/>
          <Overview
            key={overviewKey}
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
