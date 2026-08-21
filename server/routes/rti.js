const express = require('express');
const axios = require('axios');
const DepartmentLookup = require('../models/DepartmentLookup');

const router = express.Router();

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000';
const INTERNAL_SECRET = process.env.INTERNAL_SECRET || 'adhikaar_internal_secret_key_2026';

router.post('/generate', async (req, res, next) => {
  try {
    const { query, applicant, region } = req.body;

    if (!query || typeof query !== 'string' || !query.trim()) {
      return res.status(400).json({ error: 'RTI query text is required.' });
    }

    if (
      !applicant ||
      typeof applicant !== 'object' ||
      !applicant.name?.trim() ||
      !applicant.address?.trim() ||
      !applicant.contact?.trim()
    ) {
      return res.status(400).json({
        error: 'Applicant details (name, address, and contact) are required for drafting an RTI application.',
      });
    }

    let departments = [];
    try {
      departments = await DepartmentLookup.find({}).lean();
    } catch (dbErr) {
      console.warn('[RTI Route] Database lookup failed, continuing with empty lookup list:', dbErr.message);
    }

    const payload = {
      query: query.trim(),
      applicant: {
        name: applicant.name.trim(),
        address: applicant.address.trim(),
        contact: applicant.contact.trim(),
      },
      region: region || 'generic',
      departments: departments.map((d) => ({
        subject_keywords: d.subject_keywords,
        department_name: d.department_name,
        region: d.region,
        address_template: d.address_template,
      })),
    };

    const pyResponse = await axios.post(
      `${PYTHON_SERVICE_URL}/internal/rti/generate`,
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
        error: 'RTI generation timed out while waiting for AI microservice response. Please try again.',
      });
    }

    if (error.response) {
      console.error('[RTI Route] AI microservice error:', error.response.status, error.response.data);
      const detail = error.response.data?.detail || error.response.data?.error;
      return res.status(error.response.status).json({
        error: detail || 'RTI generation service failed. Please try again.',
      });
    }

    console.error('[RTI Route] Express error:', error.message);
    return res.status(500).json({
      error: 'Could not connect to AI microservice. Ensure Python service is running.',
    });
  }
});

module.exports = router;
