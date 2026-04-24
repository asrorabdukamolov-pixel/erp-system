const MoneyRequest = require('../models/MoneyRequest');

exports.getRequests = async (req, res) => {
    try {
        let query = {};
        if (req.user.role === 'proekt_manager') {
            query.userId = req.user.id;
        } else if (req.user.role === 'showroom') {
            query.showroom = req.user.showroom;
        }

        const requests = await MoneyRequest.find(query).sort({ createdAt: -1 });
        res.json(requests);
    } catch (err) {
        res.status(500).send('Server xatosi');
    }
};

exports.createRequest = async (req, res) => {
    try {
        const newRequest = new MoneyRequest({
            ...req.body,
            userId: req.user.id,
            userName: req.user.name,
            showroom: req.user.showroom
        });
        const request = await newRequest.save();
        res.json(request);
    } catch (err) {
        res.status(500).send('Server xatosi');
    }
};

exports.updateRequestStatus = async (req, res) => {
    try {
        const { status } = req.body;
        let request = await MoneyRequest.findById(req.params.id);
        if (!request) return res.status(404).json({ msg: 'So\'rov topilmadi' });

        request.status = status;
        if (status === 'approved') {
            request.approvedBy = req.user.name;
            request.approvedAt = new Date();
        } else if (status === 'paid') {
            request.paidAt = new Date();
        }

        await request.save();
        res.json(request);
    } catch (err) {
        res.status(500).send('Server xatosi');
    }
};

exports.deleteRequest = async (req, res) => {
    try {
        const request = await MoneyRequest.findById(req.params.id);
        if (!request) return res.status(404).json({ msg: 'So\'rov topilmadi' });
        
        await MoneyRequest.findByIdAndDelete(req.params.id);
        res.json({ msg: 'So\'rov o\'chirildi' });
    } catch (err) {
        res.status(500).send('Server xatosi');
    }
};
