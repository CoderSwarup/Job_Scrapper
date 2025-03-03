export interface JobTypes {
  jobTitle: string
  jobDescription: string
  jobLocation: string
  jobURL: string
  jobPostedDate?: Date
  company: 'AMAZON' | 'GOOGLE' | 'MICROSOFT'
}
