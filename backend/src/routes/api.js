const express = require('express');
const { uploadRateLimiter } = require('../middleware/security');
const uploadMiddleware = require('../middleware/upload');
const { rateImage, testVisionService, getVisionHealth } = require('../controllers/rateController');

const router = express.Router();


router.get('/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'API is running',
      timestamp: new Date().toISOString()
    }
  });
});


router.get('/vision/health', getVisionHealth);


router.post('/vision/test', uploadRateLimiter, uploadMiddleware, testVisionService);




router.post('/rate', uploadRateLimiter, uploadMiddleware, rateImage);

module.exports = router;