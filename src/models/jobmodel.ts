import { Schema, model, Document } from 'mongoose'

export interface IJob extends Document {
  title: string
  location: string
  description?: string
  postedDate?: Date
  company: 'AMAZON' | 'GOOGLE' | 'MICROSOFT'
  jobUrl: string
  createdAt?: Date
  updatedAt?: Date
}

const jobSchema = new Schema<IJob>(
  {
    title: { type: String, required: true },
    location: { type: String, required: true },
    description: { type: String },
    postedDate: { type: Date },
    company: {
      type: String,
      required: true,
      enum: ['AMAZON', 'GOOGLE', 'MICROSOFT'],
    },
    jobUrl: { type: String, unique: true, required: true },
  },
  {
    timestamps: true,
    versionKey: false,
  },
)

export const JobModel = model<IJob>('Job', jobSchema)
