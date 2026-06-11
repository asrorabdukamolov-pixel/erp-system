const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Load service account
const serviceAccount = require('../config/firebase-service-account.json');
if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}
const db = admin.firestore();

const localDbPath = path.join(__dirname, '../local_db.json');

async function exportCollection(collectionName) {
  const snapshot = await db.collection(collectionName).get();
  const items = [];
  snapshot.forEach(doc => {
    items.push({ id: doc.id, ...doc.data() });
  });
  return items;
}

async function main() {
  let existingData = {};
  if (fs.existsSync(localDbPath)) {
    existingData = JSON.parse(fs.readFileSync(localDbPath, 'utf8'));
  }

  console.log('Fetching positions...');
  const positions = await exportCollection('positions');
  console.log(`Fetched ${positions.length} positions.`);

  console.log('Fetching departments...');
  const departments = await exportCollection('departments');
  console.log(`Fetched ${departments.length} departments.`);

  existingData.positions = positions;
  existingData.departments = departments;

  fs.writeFileSync(localDbPath, JSON.stringify(existingData, null, 2), 'utf8');
  console.log('Successfully exported and saved to local_db.json');
  process.exit(0);
}

main().catch(err => {
  console.error('Export error', err);
  process.exit(1);
});
