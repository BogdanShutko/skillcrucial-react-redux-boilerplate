import React, { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import axios from 'axios'
import Header from './header'

const UserName = () => {
  const { userName } = useParams()
  const [value, setValue] = useState([])

  useEffect(() => {
    axios.get(`https://api.github.com/users/${userName}/repos`).then((it) => {
      const repName = it.data.map((item) => item.name)
      setValue(repName)
    })
  }, [userName])

  return (
    <div>
      <Header />
      <div className="flex items-center justify-center h-screen">
        <div className="bg-indigo-800 text-white font-bold rounded-lg border shadow-lg p-10">
          <ul>
            {value.map((repo) => {
              return (
                <li key={repo}>
                  <Link to={`${userName}/${repo}`}>{repo}</Link>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </div>
  )
}

UserName.propTypes = {}

export default React.memo(UserName)
