const { importCSV } = require('./src/scripts/importCSV');

console.log('Starting CSV import process...');

importCSV()
  .then(compounds => {
    console.log(`Import complete. ${compounds.length} compounds imported.`);
    process.exit(0);
  })
  .catch(error => {
    console.error('Error during import:', error);
    process.exit(1);
  }); 