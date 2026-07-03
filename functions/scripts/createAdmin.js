const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const bcrypt = require('bcryptjs');
const fs = require('fs');

const dbPath = path.join(__dirname, '..', 'local_db.json');

async function createAdmin() {
  let store = {};
  if (fs.existsSync(dbPath)) {
    store = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  }
  
  if (!store.users) store.users = [];
  
  // Remove existing admin
  store.users = store.users.filter(u => u.login !== 'admin');
  
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('admin123', salt);
  
  store.users.push({
    id: Date.now().toString(),
    name: 'Admin',
    surname: 'System',
    login: 'admin',
    password: hashedPassword,
    role: 'super_admin',
    showroom: '',
    phone: '',
    status: 'active',
    createdAt: new Date().toISOString()
  });
  
  fs.writeFileSync(dbPath, JSON.stringify(store, null, 2));
  
  console.log('Admin user created in local_db.json!');
  console.log('Login: admin');
  console.log('Parol: admin123');
}

createAdmin();
