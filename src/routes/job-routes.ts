import { Router } from 'express'
import { getJobs, removeDuplicateJobs } from '../controllers/job-controller.js'

const JobRouter = Router()

JobRouter.get('/', getJobs)

JobRouter.get('/delete-duplicate', removeDuplicateJobs)

export default JobRouter
