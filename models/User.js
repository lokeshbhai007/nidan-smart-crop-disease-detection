// models/User.js
import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    maxlength: [50, 'Name cannot be more than 50 characters'],
  },
  email: {
    type: Number,
    required: [true, 'Please provide Phone No.'],
    unique: true,
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters'],
  },
  language: {
    type: String,
    required: [true, 'Please select a language'],
    enum: ['hindi', 'bengali', 'telugu', 'marathi', 'tamil', 'gujarati']
  }
}, {
  timestamps: true,
})

// Prevent model overwrite in development
export default mongoose.models.User || mongoose.model('User', UserSchema)