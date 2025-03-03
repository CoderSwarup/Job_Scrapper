import dotenv from 'dotenv'

dotenv.config()

const config = Object.freeze({
  PORT: process.env.PORT!,
  MONGO_URL: process.env.MONGO_URL!,
  JOB_FETCH_LIMIT: (() => {
    const limit = parseInt(process.env.JOB_FETCH_LIMIT!, 10)
    if (isNaN(limit)) {
      throw new Error('JOB_FETCH_LIMIT must be a valid number')
    }
    return limit || 50
  })(),
  REDIS_URL: process.env.REDIS_URL,
  QUEUE_NAME: process.env.QUEUE_NAME,
  JOB_CHUNK_SIZE: (() => {
    const chunk_size = parseInt(process.env.JOB_CHUNK_SIZE!, 10)
    if (isNaN(chunk_size)) {
      throw new Error('JOB_CHUNK_SIZE must be a valid number')
    }
    return chunk_size || 50
  })(),
})

export default config
