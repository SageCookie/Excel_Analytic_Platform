const express = require('express');
const multer = require('multer');
const path = require('path');
const xlsx = require('xlsx');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Configure storage (for now, store in local 'uploads/' folder)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // make sure this folder exists
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter to accept only .xls and .xlsx
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['.xls', '.xlsx'];
  const ext = path.extname(file.originalname);
  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only .xls and .xlsx files are allowed'));
  }
};

const upload = multer({ storage, fileFilter });

// Route: POST /api/upload
router.post('/', protect, upload.single('file'), (req, res) => {
  try {
    const filePath = req.file.path;
    // Read the file
    const workbook = xlsx.readFile(filePath);
    // Assume we just want the first sheet
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    // Convert to JSON
    const data = xlsx.utils.sheet_to_json(sheet);

    res.json({
      message: '✅ File uploaded and parsed successfully',
      data
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error parsing Excel file', error: err });
  }
});

module.exports = router;