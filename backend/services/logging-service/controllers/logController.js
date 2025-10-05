const Log = require("../models/Log");

// POST /logs -> ghi log từ service khác
const createLog = async (req, res) => {
  try {
    const { service, action, user, details, level } = req.body;

    const log = await Log.create({ service, action, user, details, level });
    res.status(201).json(log);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /logs (admin) -> xem tất cả log
const getLogs = async (req, res) => {
  try {
    const logs = await Log.find().sort({ createdAt: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createLog, getLogs };
