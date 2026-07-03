const { db, initDb } = require('./config/firebase');

async function test() {
    await initDb();
    const depsSnap = await db.collection('departments').get();
    const deps = [];
    (depsSnap.docs || []).forEach(doc => {
        deps.push({ id: doc.id, ...doc.data() });
    });
    console.log('Departments:', deps);
}

test().catch(console.error);
