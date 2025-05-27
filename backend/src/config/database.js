const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const path = require('path');
const fs = require('fs');

// Ensure data directory exists
const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Create database file
const adapter = new FileSync(path.join(dataDir, 'db.json'));
const db = low(adapter);

// Set default data structure
db.defaults({ 
  compounds: [],
  users: []
}).write();

module.exports = db; 