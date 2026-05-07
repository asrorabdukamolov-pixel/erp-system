const { db } = require('./config/firebase');
const bcrypt = require('bcryptjs');

const resetPassword = async () => {
    try {
        console.log("Resetting admin password...");
        const login = 'admin';
        const newPassword = 'admin123';
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        
        const snapshot = await db.collection('users').where('login', '==', login).get();
        
        if (snapshot.empty) {
            console.log("Admin user not found.");
            process.exit(1);
        }
        
        const adminDoc = snapshot.docs[0];
        await adminDoc.ref.update({
            password: hashedPassword
        });
        
        console.log(`Password for user '${login}' has been reset to '${newPassword}'`);
        process.exit(0);
    } catch (err) {
        console.error("Error resetting password:", err);
        process.exit(1);
    }
};

resetPassword();
