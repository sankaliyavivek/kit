const express = require('express');
const FoodSchema = require('../modal/food');

const router = express.Router();

// Get all food items
router.get('/getfood', async (req, res) => {
    try {
        const foods = await FoodSchema.find();
        res.json(foods);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching food items', error });
    }
});

module.exports = router;
