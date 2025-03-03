import cron from 'node-cron'
import { JobTypes } from '../../type.js'
import { scrapeGoogleJobs } from './google-scrapper.js'
import { fetchAmazonJobsDynamically } from './amazon-scrapper.js'
import { fetchMicrosoftJobsDynamically } from './microsoft-scrapper.js'
import config from '../../config/index.js'
import { insertOrUpdateJobsBulk } from '../db-bluk-operation.js'
import { publishJobChunks } from '../service/redis-client.js'

// Centralized job fetcher
async function fetchAllJobs(limit: number): Promise<JobTypes[]> {
  console.log('Starting to fetch jobs from all sources...')
  // Array to store all jobs
  const allJobs: JobTypes[] = []
  try {
    // Fetch jobs from Google
    const googleJobs = await scrapeGoogleJobs(limit)
    console.log(`Fetched ${googleJobs.length} jobs from Google. \n`)
    allJobs.push(...googleJobs)

    // Fetch jobs from Amazon
    const amazonJobs = await fetchAmazonJobsDynamically(limit)
    console.log(`Fetched ${amazonJobs.length} jobs from Amazon. \n`)
    allJobs.push(...amazonJobs)

    // Fetch jobs from Microsoft
    const microsoftJobs = await fetchMicrosoftJobsDynamically(limit)
    console.log(`Fetched ${microsoftJobs.length} jobs from Microsoft. \n`)
    allJobs.push(...microsoftJobs)

    console.log(`Total jobs fetched: ${allJobs.length} \n`)
    return allJobs
  } catch (error: any) {
    console.error('Error fetching jobs:', error.message)
    return []
  }
}

export function scheduleJobFetching(AllJobs: JobTypes[]) {
  console.log('CORN_JOB_FUNCTION_CALLED')

  // Schedule the cron job to run every hour
  cron.schedule('*/2 * * * *', async () => {
    console.log('Scheduled job started: Fetching jobs...')

    const allJobs = await fetchAllJobs(config.JOB_FETCH_LIMIT)

    // await insertOrUpdateJobsBulk(allJobs)

    await publishJobChunks(config.QUEUE_NAME || 'JOB_QUEUE', allJobs, 50)

    AllJobs.push(...allJobs)

    console.log(`Fetched ${allJobs.length} jobs in the scheduled job.`)

    console.log('Scheduled job completed. ✅✅ \n\n')
  })
}
