import axios from 'axios'
import * as cheerio from 'cheerio'
import { JobTypes as Job } from '../../type.js'

// Function to scrape Google Jobs with a limit on the number of jobs
export async function scrapeGoogleJobs(limit: number): Promise<Job[]> {
  console.log(`Starting Google Jobs scraper to fetch up to ${limit} jobs...`)

  const jobData: Job[] = []
  let currentPage = 1
  // const baseURL =
  //   'https://www.google.com/about/careers/applications/jobs/results/?sort_by=date&employment_type&degree&skills&target_level=all&location=Mumbai%2C%20India&page='
  const baseURL =
    'https://www.google.com/about/careers/applications/jobs/results/?sort_by=date&page'

  try {
    while (jobData.length < limit) {
      console.log(`Fetching page ${currentPage}...`)
      // Construct the URL for the current page
      const pageURL = `${baseURL}${currentPage}`

      // Set headers to mimic a browser
      const headers = {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        Referer: 'https://www.google.com/about/careers/',
        Connection: 'keep-alive',
        'Cache-Control': 'max-age=0',
      }

      // Make a request to the Google Jobs page
      const response = await axios.get(pageURL, { headers, timeout: 60000 })

      if (response.status !== 200) {
        throw new Error(`Failed to fetch page: ${response.status}`)
      }

      // Load the HTML content with cheerio
      const $ = cheerio.load(response.data)

      let jobsFound = false
      $('.lLd3Je').each((index, element) => {
        if (jobData.length >= limit) {
          return false // Stop iteration if limit is reached
        }

        try {
          const titleElement = $(element).find('.QJPWVe')
          const jobTitle = titleElement.text().trim()
          const jobDescription = $(element).find('.Xsxa1e').text().trim()
          const jobLocation = $(element).find('.r0wTof').text().trim()
          const jobURL = $(element)
            .find('.WpHeLc.VfPpkd-mRLv6.VfPpkd-RLmnJb')
            .attr('href')

          if (jobURL) {
            jobData.push({
              jobTitle,
              jobDescription,
              jobLocation,
              jobPostedDate: new Date(),
              jobURL: `https://www.google.com/about/careers/applications/${jobURL}`,
              company: 'GOOGLE',
            })
            jobsFound = true
          }
        } catch (error) {
          console.error(`Error parsing job data at index ${index}:`, error)
        }
      })

      console.log(
        `Page ${currentPage}: Extracted ${jobData.length} jobs so far.`,
      )

      // Break the loop if no jobs are found on the current page
      if (!jobsFound) {
        console.log('No more jobs found, ending pagination.')
        break
      }

      currentPage++
    }

    console.log(
      `Scraping completed. Total jobs extracted: ${jobData.length}/${limit}`,
    )
    return jobData
  } catch (error: any) {
    console.error('An error occurred during scraping:', error.message)

    // Handle anti-scraping measures
    if (
      error.response &&
      (error.response.status === 403 || error.response.status === 429)
    ) {
      console.log(
        'It looks like Google might be blocking our scraper. Consider alternative approaches.',
      )
    }
    return []
  }
}

// scrapeGoogleJobs(50)
//   .then((jobData) => {
//     console.log('Scraping completed successfully.')
//   })
//   .catch(console.error)
