const express = require('express');
const router = express.Router();

// Controllers Import
const carsController = require('./carsController');

// RESTful Routes
// GET /api/brands/:brand/cars
router.get('/:brand/cars', carsController.getCarsByBrand);

// GET /api/brands/:brand/cars/:carName
router.get('/:brand/cars/:carName', carsController.getCarDetails);

module.exports = router;
