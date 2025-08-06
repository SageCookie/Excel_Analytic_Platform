const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const Analysis = require('../models/Analysis');
const router = express.Router();

// save a new analysis
router.post('/', protect, async (req, res) => {
  const { historyId, xAxis, yAxis, chartType } = req.body;
  if (!historyId) return res.status(400).json({ message: 'historyId required' });
  const a = await Analysis.create({
    userId: req.user.id,
    historyId, xAxis, yAxis, chartType
  });
  res.json({ analysis: a });
});

// list all saved analyses for this user
router.get('/', protect, async (req, res) => {
  const list = await Analysis.find({ userId: req.user.id })
    .populate('historyId', 'fileName uploadDate');
  res.json({ analyses: list });
});

module.exports = router;