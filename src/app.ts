import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'
import JobRouter from './routes/job-routes.js'

dotenv.config()

// Initialize express app
const app = express()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Set up CORS to accept requests from a specific origin
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
  }),
)

// Use cookie parser to read cookies
app.use(cookieParser())

// Accept JSON payloads in requests, limiting the size to 16kb
app.use(
  express.json({
    limit: '16kb',
  }),
)

// Parse URL-encoded payloads with a limit of 16kb
app.use(express.urlencoded({ extended: true, limit: '16kb' }))

// Serve static files from the 'Public' folder
app.use(express.static('Public'))

// Routes
app.get('/', async (req, res) => {
  res.send('Server is Started')
})
app.get('/api/v1/healthcheck', async (req, res) => {
  res.send('Hello Sever is Running.....')
})

app.use('/api/v1/job', JobRouter)
export default app
