
import { scaleOrdinal, schemeCategory20b } from 'd3';

export const colorScale = scaleOrdinal()
  .domain([0, schemeCategory20b.length])
  .range(schemeCategory20b)

export const overviewOptions = [
  { label: 'Institutions', key: 'institution' },
  { label: 'Cell Type', key: 'cell_type_category' },
  { label: 'Assays', key: 'assay_category' },
]
