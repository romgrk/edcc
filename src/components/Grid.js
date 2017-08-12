import React from 'react';
import { connect } from 'react-redux';
import d3 from 'd3';
import { prop, path, compose, sortBy, groupBy, indexBy, uniq } from 'ramda';
import Maybe from 'folktale/maybe';

import { colorScale } from '../constants';
import {
    getDistinctAssays
  , generateGridMap
} from '../models';
import {
    selectCell
  , selectRow
  , selectColumn
} from '../actions'

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
  , selectedSets:       state.data.selectedSets
  , gridMap:            state.data.gridMap
  , distinctAssays:     state.data.distinctAssays
  , selection:          state.selection
})
const mapDispatchToProps = dispatch => ({
    selectCell:   compose(dispatch, selectCell)
  , selectRow:    compose(dispatch, selectRow)
  , selectColumn: compose(dispatch, selectColumn)
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
      selectedSets,
      gridMap,
      distinctAssays,
      assays,
      selection,
      selected,
      selectCell,
      selectRow,
      selectColumn
    } = this.props

    if (selectedSets.length === 0)
      return (
        <div className='Grid'>
          <div className='Grid__empty'>
            No datasets visible
          </div>
        </div>
      )

    console.log(gridMap)

    console.log(distinctAssays)


    const renderCell = (cellTypeId, assayId) => {
      const sets = gridMap[cellTypeId][assayId]
      const isSelected = path([cellTypeId, assayId], selection)
      const shouldHighlight = isSelected && sets !== undefined
      const style = {
        opacity:         shouldHighlight ? '1' : '0.4',
        backgroundColor: getColorForSets(sets)
      }
      return (
        <td
            onClick={() => selectCell(cellTypeId, assayId)}
            style={style}
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
                <th key={id}
                    onClick={() => selectColumn(id)} >
                  { assays[id].name }
                </th>)
            }
          </tr>
          { Object.entries(gridMap).map(([cellTypeId, sets]) =>
            <tr>
              <td onClick={() => selectRow(cellTypeId)}>
                { this.getTextForCellTypeId(cellTypeId) }
              </td>
              {
                distinctAssays.map(assayId =>
                  renderCell(cellTypeId, assayId)
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
