import mongoose from 'mongoose'
import config from '../config/index.js'

export default {
  connect: async () => {
    try {
      await mongoose.connect(config.MONGO_URL as string)
      return mongoose.connection
    } catch (err) {
      throw err
    }
  },
}
