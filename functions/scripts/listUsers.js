const path = require('path');
require('dotenv').config({path: path.join(__dirname, '..', '.env')});
const {db} = require('../config/firebase');

async function listUsers() {
  const snapshot = await db.collection('users').get();
  console.log('Total users:', snapshot.size);
  snapshot.forEach(doc => {
    const u = doc.data();
    console.log(`ID: ${doc.id} | login: ${u.login} | role: ${u.role} | name: ${u.name} | status: ${u.status}`);
  });
  process.exit(0);
}

listUsers().catch(e => { console.error('Error:', e.message); process.exit(1); });
