// Add dotenv for environment variables
try {
  require('dotenv').config();
} catch (error) {
  console.log('dotenv not found, using process.env variables');
}

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const db = require('./config/database');
const User = require('./models/user');
const Compound = require('./models/compound');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

async function startServer() {
  try {
    console.log('Database initialized');

    // Seed admin user if not exists
    const adminEmail = 'admin@example.com';
    const adminPassword = 'Admin1234';
    
    const existingAdmin = User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      User.create({ 
        email: adminEmail, 
        name: 'Admin User', 
        password: hashedPassword, 
        role: 'admin' 
      });
      console.log(`Admin user created: ${adminEmail}`);
    }
    
    // Import CSV data if compounds collection is empty
    if (db.get('compounds').size().value() === 0) {
      const { importCSV } = require('./scripts/importCSV');
      await importCSV();
    }
    
    // Set up routes
    const compoundRoutes = require('./routes/compoundRoutes');
    const authRoutes = require('./routes/authRoutes');
    
    app.use('/api/auth', authRoutes);
    app.use('/api/compounds', compoundRoutes);
    
    // Start server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Error during startup:', err);
  }
}

startServer().catch(err => {
  console.error('Unable to start server:', err);
});