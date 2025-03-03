import axios from 'axios'
import { JobTypes } from '../../type.js'

// Scraper function for Microsoft jobs
async function scrapeMicrosoftJobs(
  page: number = 1,
  pageSize: number = 20,
): Promise<JobTypes[]> {
  try {
    console.log(`Fetching Microsoft jobs: page=${page}`)

    // Construct the dynamic API URL
    const baseURL = `https://gcsservices.careers.microsoft.com/search/api/v1/search?l=en_us&pg=${page}&pgSz=${pageSize}&o=Recent&flt=true`

    // Fetch data from Microsoft jobs API
    const { data } = await axios.get(baseURL)

    // Extract and map the required fields
    const jobs: JobTypes[] = data?.operationResult?.result?.jobs.map(
      (job: any) => ({
        jobTitle: job.title || 'N/A',
        jobDescription:
          job.properties?.description?.replace(/<[^>]+>/g, '') || 'N/A', // Strips HTML tags
        jobLocation: job?.primaryLocation || job?.locations?.[0] || 'N/A',
        jobURL: `https://careers.microsoft.com/us/en/job/${job.jobId}` || 'N/A',
        jobPostedDate: new Date(job.postingDate) || new Date(),
        company: 'MICROSOFT',
      }),
    )

    console.log(`Successfully fetched ${jobs.length} Microsoft jobs.`)
    return jobs
  } catch (error: any) {
    console.error('Error while scraping Microsoft jobs:', error.message)
    return []
  }
}

// Dynamic fetch function for Microsoft jobs
export async function fetchMicrosoftJobsDynamically(totalJobs: number) {
  const allJobs: JobTypes[] = []
  let page = 1
  const pageSize = 20 // Default page size for Microsoft API

  while (allJobs.length < totalJobs) {
    const jobs = await scrapeMicrosoftJobs(page, pageSize)
    allJobs.push(...jobs)

    // Break the loop if there are no more jobs
    if (jobs.length < pageSize) break

    page += 1
  }

  console.log(`Total Microsoft Jobs Fetched: ${allJobs.length}`)
  return allJobs
}

// fetchMicrosoftJobsDynamically(50)
//   .then((jobs) => {})
//   .catch(console.error)
