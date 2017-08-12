import React from 'react';
import { connect } from 'react-redux';
import d3 from 'd3';
import { prop, sortBy, groupBy, indexBy, uniq } from 'ramda';
import Maybe from 'folktale/maybe';

import { colorScale } from '../constants';

/* Helper functions */

const sortByCellType = sortBy(prop('cell_type'))


const groupByCellType = (xs) =>
  Object.entries(groupBy(prop('cell_type'), xs))
        .map(([cell_type, sets]) => ({ cell_type, sets }))

const indexByAssayCategory = xs =>
  Object.entries(groupBy(prop('assay_category'), xs))
        .reduce((acc, [key, value]) => {
          if (!acc[key])
            acc[key] = []
          acc[key].push(value)
          return acc
        }, {})

const getOrElse = (object, key, value) =>
  Maybe.fromNullable(object)
       .map(o => o[key])
       .getOrElse(value)


const getColorForSets = sets => {
  if (!sets)
    return 'grey'
  const institutions = uniq(sets.map(s => s.institution))
  if (institutions.length === 1)
    return colorScale(institutions[0])
  return 'white'
}

const mapStateToProps = state => ({

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


    const byCellType = Object.entries(groupBy(prop('cell_type'), data)).reduce((acc, [key, sets]) => {
      acc[key] = groupBy(prop('assay'), sets)
      return acc
    }, {})
    console.log(byCellType)

    const distinctAssays = uniq(sortBy(prop('assay_category'), data).map(d => d.assay))
    console.log(distinctAssays)

    const renderCell = (cellTypeId, assayId) => {
      const sets = byCellType[cellTypeId][assayId]
      return (
        <td style={{ backgroundColor: getColorForSets(sets) }}>
          { getOrElse(sets, 'length', '') }
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
