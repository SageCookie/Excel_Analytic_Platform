const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fileName: String,
  uploadDate: { type: Date, default: Date.now },
  xAxis: String,
  yAxis: String,
  chartType: String
});

module.exports = mongoose.model('History', historySchema);
