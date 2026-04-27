const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { db } = require('./config/firebase');

const app = express();

// Middleware
app.use(cors());
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const path = require('path');

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/showrooms', require('./routes/showroomRoutes'));
app.use('/api/customers', require('./routes/customerRoutes'));
app.use('/api/partners', require('./routes/partnerRoutes'));
app.use('/api/purchases', require('./routes/purchaseRoutes'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/migration', require('./routes/migration'));
app.use('/api/requests', require('./routes/requests'));
app.use('/api/stats', require('./routes/statsRoutes'));
app.use('/api/proposals', require('./routes/proposalRoutes'));
app.use('/api/settings', require('./routes/settingsRoutes'));
app.use('/api/suppliers', require('./routes/supplierRoutes'));

// Serve Frontend Static Files
app.use(express.static(path.join(__dirname, '../front/dist')));

app.use((req, res) => {
    res.sendFile(path.join(__dirname, '../front/dist/index.html'));
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT} with Firestore`);
});
