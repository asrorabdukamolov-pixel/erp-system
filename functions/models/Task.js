const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    assigneeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    assigneeName: {
        type: String,
        required: true
    },
    creatorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    creatorName: {
        type: String,
        required: true
    },
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    },
    orderUniqueId: {
        type: String
    },
    dueDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['yangi', 'jarayonda', 'bajarildi', 'bekor_qilindi'],
        default: 'yangi'
    },
    priority: {
        type: String,
        enum: ['past', 'orta', 'yuqori'],
        default: 'orta'
    },
    showroom: {
        type: String,
        required: true
    },
    completedAt: {
        type: Date
    },
    comments: [{
        user: String,
        text: String,
        time: { type: Date, default: Date.now }
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Task', TaskSchema);
