const express = require('express');
const axios = require('axios');

const router = express.Router();

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000';
const INTERNAL_SECRET = process.env.INTERNAL_SECRET || 'adhikaar_internal_secret_key_2026';

router.post('/analyze', async (req, res, next) => {
  try {
    const { query, category } = req.body;

    if (!query || typeof query !== 'string' || !query.trim()) {
      return res.status(400).json({ error: 'Dispute description text is required.' });
    }

    const payload = {
      query: query.trim(),
      category: category ? String(category).trim().toLowerCase() : null,
    };

    const pyResponse = await axios.post(
      `${PYTHON_SERVICE_URL}/internal/rights/analyze`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Internal-Key': INTERNAL_SECRET,
        },
        timeout: 90000,
      }
    );

    return res.status(200).json(pyResponse.data);
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      return res.status(504).json({
        error: 'Rights analysis timed out while waiting for AI microservice response. Please try again.',
      });
    }

    if (error.response) {
      console.error('[Rights Route] AI microservice error:', error.response.status, error.response.data);
      const detail = error.response.data?.detail || error.response.data?.error;
      return res.status(error.response.status).json({
        error: detail || 'Rights analysis service failed. Please try again.',
      });
    }

    console.error('[Rights Route] Express error:', error.message);
    return res.status(500).json({
      error: 'Could not connect to AI microservice. Ensure Python service is running.',
    });
  }
});

module.exports = router;
