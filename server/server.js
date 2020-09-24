import express from 'express'
import path from 'path'
import cors from 'cors'
import bodyParser from 'body-parser'
import sockjs from 'sockjs'
import { renderToStaticNodeStream } from 'react-dom/server'
import React from 'react'
import axios from 'axios'

import cookieParser from 'cookie-parser'
import config from './config'
import Html from '../client/html'

const { readFile, writeFile, unlink } = require('fs').promises

const setHeaders = (req, res, next) => {
  res.set('x-skillcrucial-user', '562dee83-02be-437d-b53a-afb5efee0695') 
  res.set('Access-Control-Expose-Headers', 'X-SKILLCRUCIAL-USER') 
  next()
  }

const Root = () => ''

try {
  // eslint-disable-next-line import/no-unresolved
  // ;(async () => {
  //   const items = await import('../dist/assets/js/root.bundle')
  //   console.log(JSON.stringify(items))

  //   Root = (props) => <items.Root {...props} />
  //   console.log(JSON.stringify(items.Root))
  // })()
  console.log(Root)
} catch (ex) {
  console.log(' run yarn build:prod to enable ssr')
}

let connections = []

const port = process.env.PORT || 8090
const server = express()

const middleware = [
  cors(),
  express.static(path.resolve(__dirname, '../dist/assets')),
  bodyParser.urlencoded({ limit: '50mb', extended: true, parameterLimit: 50000 }),
  bodyParser.json({ limit: '50mb', extended: true }),
  cookieParser(),
  setHeaders
]

middleware.forEach((it) => server.use(it))

function checkFile(){
  const dataBase = readFile(`${__dirname}/users.json`) 
  .then((file) => { return JSON.parse(file) }) 
  .catch(async () => {
  const usersData = await axios('https://jsonplaceholder.typicode.com/users')
  writeFile(`${__dirname}/users.json`, JSON.stringify(usersData.data), { encoding: "utf8" })
  return usersData.data
  })
  return dataBase 
  }
  
  server.get('/api/v1/users', async (req, res) => {
  const getUsers = await checkFile()
  res.json(getUsers)
  })
  
  function toWriteFile(data) {
  writeFile(`${__dirname}/users.json`, JSON.stringify(data), "utf8")
  }
  
  server.post('/api/v1/users', async (req, res) => {
  const newUser = req.body
  const usersData = await checkFile()
  if (usersData.length === 0){
  newUser.id = 1
  }
  else newUser.id = usersData[usersData.length - 1].id + 1
  toWriteFile([...usersData, newUser])
  res.json({status: 'success', id: newUser.id})
  })
  
  server.patch('/api/v1/users/:userId', async (req, res) => {
  const { userId } = req.params
  const newUser = req.body
  const arr = await checkFile()
  const objId = arr.find(it => it.id === +userId)
  const objId2 = {...objId, ...newUser}
  const finalArr = arr.map(elem => {
  return (elem.id === objId2.id) ? objId2 : elem
  })
  toWriteFile(finalArr)
  res.json({ status: 'success', id: userId })
  })
  
  server.delete('/api/v1/users/:userId', async (req, res) => {
  const { userId } = req.params
  const arr = await checkFile()
  const objId = arr.filter(it => it.id !== +userId)
  toWriteFile(objId)
  res.json({ status: 'success', id: userId })
  })
  
  server.delete('/api/v1/users/', (req, res) => {
  unlink(`${__dirname}/users.json`)
  res.json()
  })

server.use('/api/', (req, res) => {
  res.status(404)
  res.end()
})

const [htmlStart, htmlEnd] = Html({
  body: 'separator',
  title: 'Skillcrucial - Become an IT HERO'
}).split('separator')

server.get('/', (req, res) => {
  const appStream = renderToStaticNodeStream(<Root location={req.url} context={{}} />)
  res.write(htmlStart)
  appStream.pipe(res, { end: false })
  appStream.on('end', () => {
    res.write(htmlEnd)
    res.end()
  })
})

server.get('/*', (req, res) => {
  const initialState = {
    location: req.url
  }

  return res.send(
    Html({
      body: '',
      initialState
    })
  )
})

const app = server.listen(port)

if (config.isSocketsEnabled) {
  const echo = sockjs.createServer()
  echo.on('connection', (conn) => {
    connections.push(conn)
    conn.on('data', async () => {})

    conn.on('close', () => {
      connections = connections.filter((c) => c.readyState !== 3)
    })
  })
  echo.installHandlers(app, { prefix: '/ws' })
}
console.log(`Serving at http://localhost:${port}`)
console.log(`Finished preparing it`)