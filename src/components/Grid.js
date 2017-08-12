import React from 'react';
import { connect } from 'react-redux';
import d3 from 'd3';
import { prop, sortBy, groupBy, indexBy, uniq } from 'ramda';
import Maybe from 'folktale/maybe';

import { colorScale } from '../constants';
import {
    getDistinctAssays
  , generateGridMap
} from '../models';

/* Helper functions */

const sortByCellType = sortBy(prop('cell_type'))



const getColorForSets = sets => {
  if (!sets)
    return 'transparent'
  const institutions = uniq(sets.map(s => s.institution))
  if (institutions.length === 1)
    return colorScale(institutions[0])
  return 'white'
}


const mapStateToProps = state => ({
    assays:             state.data.assays
  , assayCategories:    state.data.assayCategories
  , cellTypes:          state.data.cellTypes
  , cellTypeCategories: state.data.cellTypeCategories
})
const mapDispatchToProps = dispatch => ({

})

class Grid extends React.Component {

  getTextForCellTypeId(id) {
    const {
      cellTypes,
      cellTypeCategories,
    } = this.props
    const cellType = cellTypes[id]
    const cellTypeCategory = cellTypeCategories[cellType.cell_type_category]
    return `${cellType.name} - ${cellTypeCategory.name}`
  }

  render() {
    const {
      data,
      assays,
      assayCategories,
      cellTypes,
      cellTypeCategories,
      selected
    } = this.props


    const byCellType = generateGridMap(data)
    console.log(byCellType)

    const distinctAssays = getDistinctAssays(data)
    console.log(distinctAssays)


    const renderCell = (cellTypeId, assayId) => {
      const sets = byCellType[cellTypeId][assayId]
      return (
        <td
            style={{ backgroundColor: getColorForSets(sets) }}
        >
          { sets ? sets.length : '' }
        </td>
      )
    }

    return (
      <div className='Grid'>
        <table>
          <tr>
            <th></th>
            {
              distinctAssays.map(id =>
                <th key={id}>{ assays[id].name }</th>)
            }
          </tr>
          { Object.entries(byCellType).map(([cellTypeId, sets]) =>
            <tr>
              <td>{ this.getTextForCellTypeId(cellTypeId) }</td>
              {
                distinctAssays.map(id =>
                  renderCell(cellTypeId, id)
                )
              }
            </tr>
          ) }
        </table>
      </div>
    )
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Grid)
