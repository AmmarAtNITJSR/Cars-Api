const express = require('express');
const router = express.Router();

// Controllers Import
const brandsController = require('./brandsController');

// RESTful Routes
// GET /api/brands
router.get('/', brandsController.getAllBrandsName);

module.exports = router;
