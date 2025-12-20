const multer = require('multer');
const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../public/uploads/route-maps');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  logger.info('Created uploads directory:', uploadsDir);
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: timestamp-random-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const filename = `route-map-${uniqueSuffix}${ext}`;
    cb(null, filename);
  }
});

// File filter - only allow images
const fileFilter = (req, file, cb) => {
  // Accept images only
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed for route map'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Middleware for single file upload (route map)
const uploadRouteMap = upload.single('routeMap');

// Middleware wrapper to handle errors
const handleUpload = (req, res, next) => {
  uploadRouteMap(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: 'File size too large. Maximum size is 5MB.'
          });
        }
        return res.status(400).json({
          success: false,
          message: `Upload error: ${err.message}`
        });
      }
      return res.status(400).json({
        success: false,
        message: err.message || 'File upload error'
      });
    }
    next();
  });
};

// Ensure result images directory exists
const resultImagesDir = path.join(__dirname, '../../public/uploads/result-images');
if (!fs.existsSync(resultImagesDir)) {
  fs.mkdirSync(resultImagesDir, { recursive: true });
  logger.info('Created result images directory:', resultImagesDir);
}

// Configure storage for result images
const resultImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, resultImagesDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const filename = `result-image-${uniqueSuffix}${ext}`;
    cb(null, filename);
  }
});

// File filter for result images
const resultImageFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

// Configure multer for result images
const uploadResultImage = multer({
  storage: resultImageStorage,
  fileFilter: resultImageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Middleware for single result image upload
const uploadResultImageSingle = uploadResultImage.single('image');

// Middleware wrapper to handle result image upload errors
const handleResultImageUpload = (req, res, next) => {
  uploadResultImageSingle(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: 'File size too large. Maximum size is 5MB.'
          });
        }
        return res.status(400).json({
          success: false,
          message: `Upload error: ${err.message}`
        });
      }
      return res.status(400).json({
        success: false,
        message: err.message || 'File upload error'
      });
    }
    next();
  });
};

// Ensure Excel uploads directory exists
const excelUploadsDir = path.join(__dirname, '../../public/uploads/excel-imports');
if (!fs.existsSync(excelUploadsDir)) {
  fs.mkdirSync(excelUploadsDir, { recursive: true });
  logger.info('Created Excel uploads directory:', excelUploadsDir);
}

// Configure storage for Excel files
const excelStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, excelUploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const filename = `excel-import-${uniqueSuffix}${ext}`;
    cb(null, filename);
  }
});

// File filter for Excel files
const excelFileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-excel', // .xls
    'text/csv' // .csv
  ];
  
  const allowedExtensions = ['.xlsx', '.xls', '.csv'];
  const fileExtension = path.extname(file.originalname).toLowerCase();
  
  if (allowedMimeTypes.includes(file.mimetype) || allowedExtensions.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error('Only Excel files (.xlsx, .xls, .csv) are allowed'), false);
  }
};

// Configure multer for Excel files
const uploadExcel = multer({
  storage: excelStorage,
  fileFilter: excelFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Middleware for single Excel file upload
const uploadExcelSingle = uploadExcel.single('excelFile');

// Middleware wrapper to handle Excel upload errors
const handleExcelUpload = (req, res, next) => {
  uploadExcelSingle(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: 'File size too large. Maximum size is 10MB.'
          });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return res.status(400).json({
            success: false,
            message: 'Unexpected field name. Please use "excelFile" as the field name for the file upload.'
          });
        }
        return res.status(400).json({
          success: false,
          message: `Upload error: ${err.message}`
        });
      }
      return res.status(400).json({
        success: false,
        message: err.message || 'File upload error'
      });
    }
    
    // Check if file was actually uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded. Please ensure the field name is "excelFile" and a file is selected.'
      });
    }
    
    next();
  });
};

module.exports = {
  handleUpload,
  uploadRouteMap,
  handleResultImageUpload,
  uploadResultImageSingle,
  handleExcelUpload,
  uploadExcelSingle
};

