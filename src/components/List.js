import React from 'react';
import cx from 'classname';

export default ({ data, labelBy, title, folded, onChange, onToggle, onToggleAll }) => {
  const entries = Object.entries(data || [])
  const areAllChecked = entries.every(([id, item]) => item.selected)
  const areSomeChecked = areAllChecked || entries.some(([id, item]) => item.selected)

  return (
    <div className={ folded ? 'List folded' : 'List' }>
      <div 
        className='title --clickable'
        onClick={() => onToggle(folded)} >
        { title }
      </div>
      <ul className={ folded ? 'folded' : '' }>
        <li className='list-header'>
          <label
            className={areAllChecked  ? 'checked' :
                       areSomeChecked ? 'indeterminate' :
                                        'not-checked'}
            onClick={() => onToggleAll(!areAllChecked)}
            >
              <b>Category</b>
          </label>
        </li>
      { entries.map(([id, item]) =>
        <li key={id}>
          <label className={item.selected ? 'checked' : 'not-checked'}>
            <input 
              type='checkbox' 
              checked={item.selected}
              onChange={ev => onChange(id, ev.target.checked)}
            />
            { item[labelBy] }
          </label>
        </li>
      ) }
      </ul>
    </div>
  )
}
