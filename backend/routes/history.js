const express = require('express');
const router = express.Router();
const History = require('../models/History');

// Save new history
router.post('/save', async (req, res) => {
  try {
    const { userId, fileName, xAxis, yAxis, chartType } = req.body;
    if (!userId || !fileName) {
      return res.status(400).json({ success: false, message: 'userId and fileName are required.' });
    }
    const history = new History({ userId, fileName, xAxis, yAxis, chartType });
    await history.save();
    res.json({ success: true, history });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get history for user
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const history = await History.find({ userId }).sort({ uploadDate: -1 });
    res.json({ success: true, history });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
