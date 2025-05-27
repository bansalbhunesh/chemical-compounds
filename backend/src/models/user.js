const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const User = {
  findAll: () => {
    return db.get('users').value();
  },
  
  findById: (id) => {
    return db.get('users').find({ id }).value();
  },
  
  findOne: (query) => {
    const users = db.get('users').value();
    
    return users.find(user => {
      return Object.keys(query).every(key => user[key] === query[key]);
    });
  },
  
  create: (userData) => {
    const newUser = {
      id: uuidv4(),
      ...userData,
      createdAt: new Date().toISOString()
    };
    
    db.get('users').push(newUser).write();
    return newUser;
  }
};

module.exports = User;