import React from 'react';
import cx from 'classname';

export default class DropDown extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      visible: false
    }
    this.showPopup = this.showPopup.bind(this)
    this.hidePopup = this.hidePopup.bind(this)
    this.togglePopup = this.togglePopup.bind(this)
  }

  togglePopup() {
    if (this.state.visible)
      this.hidePopup()
    else
      this.showPopup()
  }

  showPopup() {
    this.setState({ visible: true })
    document.addEventListener('click', this.hidePopup)
  }

  hidePopup() {
    this.setState({ visible: false })
    document.removeEventListener('click', this.hidePopup)
  }

  render() {
    const { label, options, onChange } = this.props
    const { visible } = this.state

    const containerClassName = cx('DropDown', { visible })
    const labelClassName = cx('DropDown__label activatable', {
      'has-open-popup': visible
    })

    return (
      <div className={containerClassName}>
        <button className={labelClassName} onClick={this.togglePopup}>
          { label }
        </button>
        <div className='DropDown__content'>
          { options.map((option, i) =>
            <div className='DropDown__item'
                onClick={() => (this.hidePopup(), onChange(option, i))}>
              { option.label }
            </div>
          ) }
        </div>
      </div>
    )
  }

}
