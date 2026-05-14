const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Load service account
const serviceAccount = require('../config/firebase-service-account.json');
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

const localDbPath = path.join(__dirname, '../local_db.json');
const data = JSON.parse(fs.readFileSync(localDbPath, 'utf8'));

async function importCollection(collectionName, items) {
  const batch = db.batch();
  items.forEach(item => {
    const docRef = db.collection(collectionName).doc(item.id || `${Date.now()}_${Math.random()}`);
    batch.set(docRef, item);
  });
  await batch.commit();
  console.log(`Imported ${items.length} items to ${collectionName}`);
}

async function main() {
  for (const [key, value] of Object.entries(data)) {
    if (Array.isArray(value) && value.length) {
      await importCollection(key, value);
    }
  }
  console.log('All collections imported');
  process.exit(0);
}

main().catch(err => {
  console.error('Import error', err);
  process.exit(1);
});
