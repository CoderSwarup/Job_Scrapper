import { Redis } from 'ioredis'
import { Queue, Worker } from 'bullmq'
import config from '../../config/index.js'
import { JobTypes } from '../../type.js'
import { insertOrUpdateJobsBulk } from '../db-bluk-operation.js'

const redisClient = new Redis(config.REDIS_URL as string)

export default redisClient

// Define the queue to use for jobs
export const JobQueue = new Queue(config.QUEUE_NAME || 'JOB_QUEUE', {
  connection: {
    url: config.REDIS_URL,
  },
  defaultJobOptions: {
    removeOnComplete: true,
    attempts: 2,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnFail: {
      count: 100,
    },
  },
})

// Define a worker to process jobs from the queue
export const worker = new Worker(
  config.QUEUE_NAME || 'JOB_QUEUE',
  async (job) => {
    const jobs: JobTypes[] = JSON.parse(job.data as string)
    console.log(`Processing ${jobs.length} jobs...`)
    // console.log('jobs data', jobs)

    await insertOrUpdateJobsBulk(jobs)

    await new Promise((res, rej) => {
      setTimeout(() => {
        console.log('Jobs processed successfully')
        res(1)
      }, 5000)
    })
  },
  {
    connection: {
      url: process.env.REDIS_URL,
    },
  },
)

// Function to publish chunks of jobs to the queue
export async function publishJobChunks(
  queue_name: string,
  jobs: JobTypes[],
  chunkSize: number,
) {
  for (let i = 0; i < jobs.length; i += chunkSize) {
    try {
      const chunk = jobs.slice(i, i + chunkSize)
      await JobQueue.add(queue_name, JSON.stringify(chunk))
      console.log(
        `Published chunk of ${chunk.length} jobs to queue: ${queue_name}`,
      )
    } catch (error: any) {
      console.error(`Failed to publish chunk: ${error.message}`)
    }
  }
}
