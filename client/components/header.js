import React from 'react'
import { Link, useParams } from 'react-router-dom'

const Header = () => {
  const { userName, repositoryName } = useParams()

  return (
    <nav className="flex bg-indigo-800 items-center justify-between flex-wrap p-6 text-white font-bold">
      <div className="flex flex-shrink-0 mr-6" id="repository-name">
        {userName}
      </div>
      {repositoryName && (
        <Link id="go-repository-list" to={`/${userName}`}>
          Go repository list
        </Link>
      )}
      <Link id="go-back" to="/">
        Go back
      </Link>
    </nav>
  )
}

export default React.memo(Header)