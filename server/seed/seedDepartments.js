const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const DepartmentLookup = require('../models/DepartmentLookup');

const seedDataPath = path.join(__dirname, '../../ai_service/seed/department_lookup_seed.json');

async function seedDepartments() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error("Error: MONGO_URI is missing from environment variables.");
    process.exit(1);
  }

  try {
    console.log("Connecting to MongoDB Atlas...");
    const conn = await mongoose.connect(mongoUri);
    console.log(`Connected to database: ${conn.connection.name}`);

    const rawData = fs.readFileSync(seedDataPath, 'utf8');
    const departments = JSON.parse(rawData);

    console.log("Clearing existing DepartmentLookup documents...");
    await DepartmentLookup.deleteMany({});

    console.log(`Inserting ${departments.length} department lookup records...`);
    const result = await DepartmentLookup.insertMany(departments);

    console.log(`Department seeding completed successfully! Inserted ${result.length} documents into '${conn.connection.name}.${DepartmentLookup.collection.name}'.`);
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error.message || error);
    process.exit(1);
  }
}

seedDepartments();
