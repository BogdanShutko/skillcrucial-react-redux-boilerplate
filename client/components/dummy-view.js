import React, { useState } from 'react'
import { history } from '../redux'

const Dummy = () => {
  const [value, setValue] = useState('')
  const onChange = (e) => {
    setValue(e.target.value)
  }
  const onClick = () => {
    history.push(`/${value}`)
  }
  return (
    <div>
      <div className="flex items-center justify-center h-screen">
        <div className="bg-indigo-800 text-black font-bold rounded-lg border shadow-lg p-10">
        <input id="input-field" type="text" value={value} onChange={onChange} />
        <button className="m-2" type="button" id="search-button" onClick={onClick}>Search</button>
        </div>
      </div>
    </div>
  )
}

Dummy.propTypes = {}

export default React.memo(Dummy)

/*

*/