import axios from 'axios'
import { JobTypes } from '../../type.js'

// Scraper function
async function scrapeAmazonJobs(offset: number = 0): Promise<JobTypes[]> {
  try {
    console.log(`Fetching Amazon jobs: offset=${offset}...`)

    // Construct the dynamic API URL
    // if We Want For the Advance Query
    // const baseURL = `https://www.amazon.jobs/en/search.json?offset=${offset}&result_limit=50&sort=recent&distanceType=Mi&radius=24km&latitude=&longitude=&loc_group_id=&loc_query=&base_query=&city=&country=&region=&county=&query_options=`
    const baseURL = `https://www.amazon.jobs/en/search.json?offset=${offset}&result_limit=50&sort=recent`

    // Fetch data from Amazon jobs API
    const { data } = await axios.get(baseURL)

    // Extract and map the required fields
    const jobs: JobTypes[] = data.jobs.map((job: any) => ({
      jobTitle: job.title || 'N/A',
      jobDescription: job.description || job.description_short || 'N/A',
      jobLocation: job.location || 'N/A',
      jobURL: `https://www.amazon.jobs${job.job_path}` || 'N/A',
      jobPostedDate: new Date(job.posted_date) || new Date(),
      company: 'AMAZON',
    }))

    console.log(`Successfully fetched ${jobs.length} jobs.`)
    return jobs
  } catch (error: any) {
    console.error('Error while scraping Amazon jobs:', error.message)
    return []
  }
}

export async function fetchAmazonJobsDynamically(totalJobs: number) {
  const allJobs: JobTypes[] = []
  let offset = 0

  while (allJobs.length < totalJobs) {
    const jobs = await scrapeAmazonJobs(offset)
    allJobs.push(...jobs)

    // Break the loop if there are no more jobs
    if (jobs.length < 1) break

    offset += 10
  }

  console.log(`Total Jobs Fetched: ${allJobs.length}`)
  return allJobs
}

// fetchAmazonJobsDynamically(25)
//   .then((jobs) => {})
//   .catch(console.error)
