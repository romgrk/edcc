import React from 'react';
import { connect } from 'react-redux';

import { compose } from 'ramda';
import { selectOverview } from '../actions';
import {
  overviewOptions,
  colorScale
} from '../constants';
import DropDown from './DropDown';

const d3 = require('d3')



const countByKey = (xs, key) =>
  xs.reduce((acc, cur) => {
    if (cur[key] in acc)
      acc[cur[key]] += 1
    else
      acc[cur[key]] = 1
    return acc
  }, {})


const mapStateToProps = state => ({
  selectedOverview:   state.ui.overview,
  selectedSets:       state.data.selectedSets,
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
  selectOverview: compose(dispatch, selectOverview)
})

class Overview extends React.Component {

  update() {
    const width = 300
    const height = 150
    const radius = Math.min(width, height) / 2

    const { selectedSets, key, selectedOverview } = this.props

    const dataByKey = countByKey(selectedSets, selectedOverview.key)

    const data =
      Object.entries(dataByKey).reduce((acc, [label, value]) =>
        acc.concat({ label, value }), [])


    const color = d3.scaleOrdinal()
      .domain([0, data.length || 1])
      .range(d3.schemeCategory20b)

    while (this.node.firstElementChild)
      this.node.removeChild(this.node.firstElementChild)

    const svg = d3.select(this.node)
      .append('svg')
      .attr('shape-rendering', 'geometricPrecision')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`)

    const arc = d3.arc()
      .innerRadius(radius - 20)
      .outerRadius(radius)

    const pie = d3.pie()
      .value(d => d.value)
      .sort(null)

    const selection = svg.selectAll('path')
      .data(pie(data))

    const path = selection
      .enter()
        .append('path')
        .attr('d', arc)
        .attr('fill', (d, i) => colorScale(d.data.value))

    selection.exit()
        .remove()
  }

  componentDidMount() {
    this.update()
  }

  componentDidUpdate() {
    this.update()
  }

  render() {
    const {
      data,
      selectedOverview,
      selectOverview
    } = this.props

    return (
      <div className='Overview'>
        <div className='title'>
          Overview
        </div>
        <div className='Overview__content'>
          <DropDown
            label={selectedOverview.label}
            options={overviewOptions}
            onChange={selectOverview}
          />
          <br/>
          <div ref={node => this.node = node}>
          </div>
        </div>
      </div>
    )
  }

}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Overview)
