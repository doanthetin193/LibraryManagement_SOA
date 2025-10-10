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

// GET /logs (admin) -> xem tất cả log với pagination
const getLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get total count for pagination info
    const total = await Log.countDocuments();
    
    // Get paginated logs
    const logs = await Log.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      data: logs,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total: total,
        limit: limit
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createLog, getLogs };
