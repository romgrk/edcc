import React from 'react';

import { overviewOptions, colorScale } from '../constants';
import DropDown from './DropDown';

const d3 = require('d3')

export default class Overview extends React.Component {

  update() {
    const width = 300
    const height = 150
    const radius = Math.min(width, height) / 2

    const { data } = this.props

    const color = d3.scaleOrdinal()
      .domain([0, data.length || 1])
      .range(d3.schemeCategory20b)

    const svg = d3.select(this.node)
      .append('svg')
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
    const { data, selected, onChange } = this.props

    return (
      <div className='Overview'>
        <div className='title'>
          Overview
        </div>
        <div className='Overview__content'>
          <DropDown
            label={selected}
            options={overviewOptions}
            onChange={onChange}
          />
          <br/>
          <svg ref={node => this.node = node}>
          </svg>
        </div>
      </div>
    )
  }

}
