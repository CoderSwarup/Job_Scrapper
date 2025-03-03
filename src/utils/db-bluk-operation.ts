import { JobModel } from '../models/jobmodel.js'
import { JobTypes } from '../type.js'

// Insert or update jobs in bulk using jobUrl and timestamp for deduplication.
export async function insertOrUpdateJobsBulk(jobs: JobTypes[]) {
  try {
    console.log('Starting bulk insert/update process...')

    // Prepare bulk operations
    const bulkOperations = jobs.map((job) => {
      return {
        updateOne: {
          filter: { jobUrl: job.jobURL }, // Match by unique jobUrl
          update: {
            $setOnInsert: {
              title: job.jobTitle,
              description: job.jobDescription,
              location: job.jobLocation,
              // postedDate: job.jobPostedDate,
              company: job.company,
              jobUrl: job.jobURL,
            },
            $max: { postedDate: job.jobPostedDate }, // Only update if postedDate is newer
          },
          upsert: true, // Insert if no match found
        },
      }
    })

    // const bulkOperations = jobs.map((job) => {
    //     const filter: any = {
    //       jobUrl: job.jobURL,
    //     };

    //     if (job.company !== 'GOOGLE') {
    //       filter.$or = [
    //         { postedDate: { $lt: job.jobPostedDate } }, // Update if newer timestamp
    //         { postedDate: { $exists: false } }, // If no timestamp exists
    //       ];
    //     }

    //     return {
    //       updateOne: {
    //         filter,
    //         update: {
    //           $set: {
    //             jobTitle: job.jobTitle,
    //             jobDescription: job.jobDescription,
    //             jobLocation: job.jobLocation,
    //             jobUrl: job.jobURL,
    //             jobPostedDate: job.jobPostedDate,
    //             company: job.company,
    //           },
    //         },
    //         upsert: true, // Insert if job doesn't exist
    //       },
    //     };
    //   });

    // Perform bulkWrite operation

    const result = await JobModel.bulkWrite(bulkOperations)

    // console.log(
    //   `Bulk operation completed: ${result.nUpserted} inserted, ${result.nModified} updated.`,
    // )

    console.log(`Bulk operation completed: ${result}.`)
  } catch (error: any) {
    console.error('Error during bulk insert/update:', error.message)
  }
}
