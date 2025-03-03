import app from './app.js'
import config from './config/index.js'
import ConnectDB from './db/ConnectDB.js'
import { JobTypes } from './type.js'
import { scheduleJobFetching } from './utils/Scrappers/index.js'
import redisClient, { worker } from './utils/service/redis-client.js'

const PORT = config.PORT || 3000

async function checkRedisConnection() {
  try {
    const redisStatus = await redisClient.ping() // ping Redis server
    if (redisStatus === 'PONG') {
      console.log('Redis connection successful')
    } else {
      throw new Error('Failed to connect to Redis')
    }
  } catch (err: any) {
    console.error('Redis connection failed:', err.message)
    throw new Error('Failed to connect to Redis')
  }
}

// Starting the server
const server = app.listen(PORT, () => {
  console.log(`APPLICATION_STARTED`, { PORT: config.PORT })
})

let AllJobs: JobTypes[] = []

;(async () => {
  try {
    const connection = await ConnectDB.connect()
    console.log(`DATABASE_CONNECTION`, connection.name)

    await checkRedisConnection()

    console.log('Starting job worker...')

    worker.on('completed', (job) => {
      console.log(`Job completed with Name: ${job.name}`)
    })

    worker.on('failed', (job: any, err: any) => {
      console.error(`Job failed: ${job.name} with error: ${err.message}`)
    })

    scheduleJobFetching(AllJobs)
  } catch (err) {
    console.error('APPLICATION_ERROR', { err })

    // Graceful shutdown in case of failure
    server.close((error) => {
      if (error) {
        console.log(`APPLICATION_ERROR during shutdown`, { error })
      }

      process.exit(1)
    })
  }
})()
