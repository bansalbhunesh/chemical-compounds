const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const Compound = {
  findAll: () => {
    return db.get('compounds').value();
  },
  
  findById: (id) => {
    return db.get('compounds').find({ id: parseInt(id) }).value();
  },
  
  findByName: (name) => {
    return db.get('compounds')
      .filter(compound => compound.CompoundName.toLowerCase().includes(name.toLowerCase()))
      .value();
  },
  
  create: (compoundData) => {
    const newCompound = {
      id: db.get('compounds').size().value() + 1,
      ...compoundData,
      dateModified: new Date().toISOString()
    };
    
    db.get('compounds').push(newCompound).write();
    return newCompound;
  },
  
  update: (id, compoundData) => {
    const compound = db.get('compounds').find({ id: parseInt(id) }).value();
    
    if (!compound) return null;
    
    const updatedCompound = {
      ...compound,
      ...compoundData,
      dateModified: new Date().toISOString()
    };
    
    db.get('compounds')
      .find({ id: parseInt(id) })
      .assign(updatedCompound)
      .write();
      
    return updatedCompound;
  },
  
  delete: (id) => {
    const compound = db.get('compounds').find({ id: parseInt(id) }).value();
    if (!compound) return false;
    
    db.get('compounds')
      .remove({ id: parseInt(id) })
      .write();
      
    return true;
  },
  
  search: (query) => {
    return db.get('compounds')
      .filter(compound => {
        const name = compound.CompoundName.toLowerCase();
        const description = compound.CompoundDescription.toLowerCase();
        const searchTerm = query.toLowerCase();
        
        return name.includes(searchTerm) || description.includes(searchTerm);
      })
      .value();
  },
  
  bulkCreate: (compounds) => {
    const startId = db.get('compounds').size().value() + 1;
    
    const compoundsWithIds = compounds.map((compound, index) => ({
      id: startId + index,
      ...compound,
      dateModified: new Date().toISOString()
    }));
    
    db.get('compounds')
      .push(...compoundsWithIds)
      .write();
    
    return compoundsWithIds;
  }
};

module.exports = Compound;