const mongoose = require('mongoose');
const Food = require('./modal/food'); 
const fs = require('fs');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {})
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log('Error:', err));

// Read JSON file
const fileName = 'food.json';
let data = JSON.parse(fs.readFileSync(fileName, 'utf-8'));

// Remove duplicates from JSON before inserting
const uniqueData = [];
const foodSet = new Set();

for (const item of data) {
    if (!foodSet.has(item.name)) {
        foodSet.add(item.name);
        uniqueData.push(item);
    }
}

// Insert or Update food items
const importData = async () => {
    try {
        for (const item of uniqueData) {
            await Food.updateOne(
                { name: item.name }, // Find food by name
                { $set: item }, // Update if exists
                { upsert: true } // Insert if not exists
            );
        }
        console.log('Food data imported/updated successfully.');
    } catch (error) {
        console.error('Error importing data:', error);
    } finally {
        mongoose.connection.close();
    }
};

importData();
