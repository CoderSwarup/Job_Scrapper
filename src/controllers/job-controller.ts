import { Request, Response } from 'express'
import { JobModel } from '../models/jobmodel.js'

// Controller for fetching jobs with advanced query features
export const getJobs = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      location,
      company,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query

    // Convert page and limit to numbers
    const pageNumber = parseInt(page as string, 10)
    const limitNumber = parseInt(limit as string, 10)

    // Build query object for filtering
    const query: any = {}
    if (search) {
      query.title = { $regex: search, $options: 'i' }
    }
    if (location) {
      query.location = { $regex: location, $options: 'i' }
    }
    if (company) {
      query.company = company
    }

    // Sorting
    const sortOptions: any = {}
    sortOptions[sortBy as string] = sortOrder === 'desc' ? -1 : 1

    // Pagination and data fetching
    const jobs = await JobModel.find(query)
      .sort(sortOptions)
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber)

    const totalJobs = await JobModel.countDocuments(query)

    res.status(200).json({
      success: true,
      totalJobs,
      totalPages: Math.ceil(totalJobs / limitNumber),
      currentPage: pageNumber,
      jobs,
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch jobs',
      error: error.message,
    })
  }
}

export const removeDuplicateJobs = async (req: Request, res: Response) => {
  try {
    //  Find duplicate jobUrls
    const duplicates = await JobModel.aggregate([
      {
        $group: {
          _id: '$jobUrl', // Group by jobUrl
          count: { $sum: 1 }, // Count occurrences
          ids: { $push: '$_id' }, // Collect all IDs for duplicates
        },
      },
      {
        $match: {
          count: { $gt: 1 }, // Only keep groups with more than one occurrence
        },
      },
    ])

    // Flatten duplicate IDs
    const idsToDelete: string[] = []
    duplicates.forEach((group) => {
      const [firstId, ...restIds] = group.ids
      idsToDelete.push(...restIds)
    })

    // Step 3: Delete all duplicates
    if (idsToDelete.length > 0) {
      await JobModel.deleteMany({ _id: { $in: idsToDelete } })
    }

    res.status(200).json({
      success: true,
      message: `Removed ${idsToDelete.length} duplicate job entries.`,
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to remove duplicates',
      error: error.message,
    })
  }
}
