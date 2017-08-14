import React from 'react';
import { connect } from 'react-redux';
import { compose } from 'ramda';

import { getOrElse } from '../utils';
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

const midAngle = (d) =>
  d.startAngle + (d.endAngle - d.startAngle) / 2

const mapStateToProps = state => ({
  selectedOverview:   state.ui.overview,
  datasets:           state.data.datasets,
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
  //...state.data
})
const mapDispatchToProps = dispatch => ({
  selectOverview: compose(dispatch, selectOverview)
})

class Overview extends React.Component {

  update() {
    const width  = this.node.clientWidth
    const height = 300
    const radius = (Math.min(width, height) / 2) - 20
    const minVisibleAngle = 0.5

    const { selectedSets, selectedOverview } = this.props

    const dataByKey = countByKey(selectedSets, selectedOverview.key)

    const getLabelForID = id => {
      switch (selectedOverview.key) {
        case 'institution': return getOrElse(this.props.institutions[id], 'name', 'Unknown')
        case 'assay_category': return getOrElse(this.props.assayCategories[id], 'name', 'Unknown')
        case 'cell_type_category': return getOrElse(this.props.cellTypeCategories[id], 'name', 'Unknown')
        default: return 'Unkown'
      }
    }

    const data =
      Object.entries(dataByKey).reduce((acc, [id, value]) =>
        acc.concat({ id, value, label: getLabelForID(id) }), [])

    while (this.node.firstElementChild)
      this.node.removeChild(this.node.firstElementChild)

    const arc = d3.arc()
      .innerRadius(radius - 30)
      .outerRadius(radius)

    const arcOver = d3.arc()
      .innerRadius(radius - 25)
      .outerRadius(radius + 5)

    const labelArc = d3.arc()
      .innerRadius(radius)
      .outerRadius(radius + 30)

    const pie = d3.pie()
      .value(d => d.value)
      .sort(null)

    const opacity = d => {
      const diff = d.endAngle - d.startAngle
      return (diff < minVisibleAngle) ? 0 : 1
    }

    const svg = d3.select(this.node)
      .append('svg')
      .attr('shape-rendering', 'geometricPrecision')
      .attr('width', width)
      .attr('height', height)
      .append('g')
        .attr('transform', `translate(${width / 2}, ${height / 2})`)

    svg.append('text')
      .style('text-anchor', 'middle')
      .attr('dy', '.35em')
      .attr('dx', '.35em')
      .attr('fill', '#fff')
      .attr('font-size', '24px')
      .text(selectedSets.length)

    svg.append('g')
      .attr('class', 'content')

    const content = svg.select('.content')
      .selectAll('g')
      .data(pie(data))
      .enter()
      .append('g')
      .on('mouseover', function() {
        d3.select(this)
          .attr('font-weight', 'bold')

        d3.select(this)
          .selectAll('path')
          .transition().duration(500)
          .attr('d', arcOver);
      })
      .on('mouseout', function() {
        d3.select(this)
          .attr('font-weight', '')

        d3.select(this)
          .selectAll('path')
          .transition().duration(500)
          .attr('d', arc);
      })

    content
      .append('path')
        .attr('d', arc)
        .attr('fill', d => colorScale(d.data.id))

    content
      .append('svg:title')
        .text(d => `${d.data.label} (${d.data.value})`)

    content
      .append('text')
      .attr('transform', (d) => {
        const pos = labelArc.centroid(d)
        return 'translate(' + pos + ')'
      })
      .style('text-anchor', (d) =>
        midAngle(d) < Math.PI ? 'start' : 'end')
      .attr('dy', '.35em')
      .attr('dx', '.35em')
      .style('fill-opacity', opacity)
      .attr('font-size', '10px')
      .attr('fill', d => colorScale(d.data.id))
      .text(d => d.data.label)

    content
      .append('text')
      .attr('transform', (d) => {
        const pos = arc.centroid(d)
        //pos[0]  = radius * (midAngle(d) < Math.PI ? 1 : -1)
        return 'translate(' + pos + ')'
      })
      .style('text-anchor', 'middle')
      .attr('dy', '.35em')
      .attr('dx', '.35em')
      .style('fill-opacity', opacity)
      .attr('font-size', '10px')
      .attr('fill', '#fff')
      .text(d => d.data.value)
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
