import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import multer from 'multer'

// Get the current module file URL
const __filename = fileURLToPath(import.meta.url)

// Resolve the directory name
const __dirname = path.dirname(__filename)

const uploadDirectory = path.resolve(__dirname, '../uploads/')
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory)
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory)
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    const mimetype = file.mimetype.split('/').pop() // Extract file type from mimetype
    const filename = `${file.fieldname}-${uniqueSuffix}-${mimetype}${ext}`
    cb(null, filename)
  }
})

// File filter function to accept only JPEG, PNG, PDF, GIF, and video files
const fileFilter = (req, file, cb) => {
  const avatarAllowedMimeTypes = ['image/jpeg', 'image/png']
  const mediaAllowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'video/*'
  ]

  if (
    file.fieldname === 'avatar' &&
    avatarAllowedMimeTypes.includes(file.mimetype)
  ) {
    cb(null, true)
  } else if (
    file.fieldname === 'media' &&
    mediaAllowedMimeTypes.includes(file.mimetype)
  ) {
    cb(null, true)
  } else {
    cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'Invalid file format'))
  }
}

// Multer configuration with file size limit and file filter
const upload = multer({
  storage: storage,
  limits: {
    fileSize: (file) => {
      // Set different file size limits based on file type
      if (file.mimetype.startsWith('image/')) {
        return 5 * 1024 * 1024 // 5 MB limit for images
      } else if (file.mimetype === 'application/pdf') {
        return 5 * 1024 * 1024 // 5 MB limit for PDFs
      } else if (file.mimetype === 'image/gif') {
        return 5 * 1024 * 1024 // 5 MB limit for GIFs
      } else if (file.mimetype.startsWith('video/')) {
        return 100 * 1024 * 1024 // 100 MB limit for videos
      } else {
        return 0 // No limit for other file types
      }
    }
  },
  fileFilter: fileFilter
})

function handleFileSizeLimit(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'File size exceeds the limit of 5 MB'
      })
    }
  }
  next(err)
}

function handleFileFormatError(err, req, res, next) {
  if (
    err instanceof multer.MulterError &&
    err.code === 'LIMIT_UNEXPECTED_FILE'
  ) {
    return res
      .status(400)
      .json({ error: 'Bad Request', message: 'Invalid file format' })
  }
  next(err)
}

export { uploadDirectory, upload, handleFileSizeLimit, handleFileFormatError }
