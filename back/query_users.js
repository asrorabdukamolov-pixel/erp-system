const { db, initDb } = require('./config/firebase');

async function test() {
    await initDb();
    
    const usersSnap = await db.collection('users').get();
    const users = [];
    (usersSnap.docs || []).forEach(doc => {
        users.push({ id: doc.id, ...doc.data() });
    });
    console.log('Total users:', users.length);
    console.log('Users:');
    console.log(users.map(u => ({ login: u.login, role: u.role, showroom: u.showroom, department: u.department, name: u.name, type: u.type })));
    
    const empSnap = await db.collection('employees').get();
    const employees = [];
    (empSnap.docs || []).forEach(doc => {
        employees.push({ id: doc.id, ...doc.data() });
    });
    console.log('Total employees:', employees.length);
    console.log('Employees:');
    console.log(employees.map(e => ({ name: e.name, role: e.role, type: e.type, showroom: e.showroom })));

    const custSnap = await db.collection('customers').get();
    const customers = [];
    (custSnap.docs || []).forEach(doc => {
        customers.push({ id: doc.id, ...doc.data() });
    });
    console.log('Total customers:', customers.length);
    const testCustomers = customers.filter(c => JSON.stringify(c).toLowerCase().includes('test web') || JSON.stringify(c).toLowerCase().includes('website'));
    console.log('Test web customers:', testCustomers);

}

test().catch(console.error);
