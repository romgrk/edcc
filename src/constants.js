
import { scaleOrdinal, schemeCategory20b } from 'd3';

export const colorScale = scaleOrdinal()
  .domain([0, schemeCategory20b.length])
  .range(schemeCategory20b)

export const overviewOptions = [
  { label: 'Institutions', value: 'institution' },
  { label: 'Cell Type', value: 'cell_type_category' },
  { label: 'Assays', value: 'assay_category' },
]
