const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { db } = require('./config/firebase');
const auth = require('./middleware/auth');
const genericController = require('./controllers/genericController');

const app = express();

// Middleware
app.use(cors());
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/showrooms', require('./routes/showroomRoutes'));
app.use('/api/departments', require('./routes/departmentRoutes'));
app.use('/api/positions', require('./routes/positionRoutes'));
app.use('/api/pnl-categories', require('./routes/pnlCategoryRoutes'));
app.use('/api/bank-accounts', require('./routes/bankAccountRoutes'));
app.use('/api/payment-terms', require('./routes/paymentTermRoutes'));
app.use('/api/currencies', require('./routes/currencyRoutes'));
app.use('/api/taxes', require('./routes/taxRoutes'));
app.use('/api/stats', require('./routes/statsRoutes'));
app.use('/api/purchases', require('./routes/purchaseRoutes'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/migration', require('./routes/migration'));
app.use('/api/requests', require('./routes/requests'));
app.use('/api/customers', require('./routes/customerRoutes'));
app.use('/api/partners', require('./routes/partnerRoutes'));
app.use('/api/proposals', require('./routes/proposalRoutes'));
app.use('/api/settings', require('./routes/settingsRoutes'));
app.use('/api/suppliers', require('./routes/supplierRoutes'));
app.use('/api/cash-flow', require('./routes/cashFlowRoutes'));
app.use('/api/expense-items', require('./routes/expenseItemsRoutes'));
app.use('/api/cost-centers', require('./routes/costCenterRoutes'));
app.use('/api/integrations', require('./routes/integrationRoutes'));

// Generic Master Data Routes
const masterDataCollections = [
    'customer-types', 'lead-sources', 'sales-channels', 'kp-statuses', 'rejection-reasons',
    'product-types', 'prod-stages', 'operations', 'prod-order-statuses', 'qc-reasons',
    'warehouses', 'warehouse-types', 'material-groups', 'materials', 'units', 'wh-op-types',
    'supplier-types', 'purchase-cats', 'pr-statuses', 'po-statuses', 'delivery-terms'
];

masterDataCollections.forEach(col => {
    const router = express.Router();
    router.get('/', auth, genericController.getAll(col));
    router.post('/', auth, genericController.create(col));
    router.put('/:id', auth, genericController.update(col));
    router.delete('/:id', auth, genericController.delete(col));
    app.use(`/api/${col}`, router);
});

// Serve Frontend Static Files
app.use(express.static(path.join(__dirname, '../front/dist')));

app.use('/api', (req, res) => {
    res.status(404).json({ msg: 'API yo\'li topilmadi', path: req.originalUrl });
});

app.use((req, res) => {
    res.sendFile(path.join(__dirname, '../front/dist/index.html'));
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT} with Firestore`);
});
