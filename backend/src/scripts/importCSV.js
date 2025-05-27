const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const Compound = require('../models/compound');
const db = require('../config/database');

async function importCSV() {
  const csvFilePath = path.join(__dirname, '../../data/chemical_compounds.csv');
  
  // Check if the CSV file exists
  if (!fs.existsSync(csvFilePath)) {
    console.log('CSV file not found at:', csvFilePath);
    return;
  }
  
  console.log('Found CSV file at:', csvFilePath);
  const compounds = [];
  
  return new Promise((resolve, reject) => {
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (data) => {
        // Handle the format in your CSV file
        compounds.push({
          CompoundName: data.CompoundName || data.Name || 'Unknown Compound',
          CompoundDescription: data.CompounrDescription || data.CompoundDescription || data.Description || '',
          strImageSource: data.strImageSource || data.ImageSource || '',
          strImageAttribution: data.strImageAttribution || data.ImageAttribution || ''
        });
      })
      .on('end', () => {
        try {
          if (compounds.length > 0) {
            // Clear existing compounds first to avoid duplicates
            const existingCount = Compound.findAll().length;
            if (existingCount > 0) {
              console.log(`Clearing ${existingCount} existing compounds before import...`);
              db.get('compounds').remove().write();
            }
            
            const addedCompounds = Compound.bulkCreate(compounds);
            console.log(`Successfully imported ${compounds.length} compounds from CSV file`);
            resolve(addedCompounds);
          } else {
            console.log('No compounds found in CSV file');
            resolve([]);
          }
        } catch (error) {
          console.error('Error importing CSV data:', error);
          reject(error);
        }
      })
      .on('error', (error) => {
        console.error('Error reading CSV file:', error);
        reject(error);
      });
  });
}

// Create a sample CSV file if needed (this will be used if no CSV exists)
function createSampleCSV(filePath) {
  // Create the data directory if it doesn't exist
  const dataDir = path.dirname(filePath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  // Sample compounds data
  const sampleData = `CompoundName,CompoundDescription,strImageSource,strImageAttribution
Water,H2O is a transparent and nearly colorless chemical substance.,https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Water_drops_on_green_leaf.jpg/1200px-Water_drops_on_green_leaf.jpg,Wikimedia Commons
Carbon Dioxide,CO2 is a colorless gas with a density about 53% higher than that of dry air.,https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Carbon_dioxide_pressure_temperature_phase_diagram.svg/1200px-Carbon_dioxide_pressure_temperature_phase_diagram.svg.png,Wikimedia Commons
Sodium Chloride,NaCl is an ionic compound with the chemical formula NaCl.,https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Sodium_chloride_crystal_01.jpg/1200px-Sodium_chloride_crystal_01.jpg,Wikimedia Commons
Glucose,C6H12O6 is a simple sugar with the molecular formula C₆H₁₂O₆.,https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Alpha-D-glucose-from-xtal-1979-3D-balls.png/1200px-Alpha-D-glucose-from-xtal-1979-3D-balls.png,Wikimedia Commons
Oxygen,O2 is the chemical element with the symbol O and atomic number 8.,https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Liquid_oxygen_in_a_beaker_4.jpg/1200px-Liquid_oxygen_in_a_beaker_4.jpg,Wikimedia Commons
`;
  
  fs.writeFileSync(filePath, sampleData);
  console.log('Created sample CSV file with 5 compounds');
}

module.exports = { importCSV, createSampleCSV };