const { db, formatQuery, formatDoc } = require('../config/firebase');

// @desc    Receive Lead from AmoCRM Webhook
// @access  Public (Validated by AmoCRM Secret/Logic)
exports.receiveAmoLead = async (req, res) => {
    try {
        console.log("Received AmoCRM Webhook:", JSON.stringify(req.body));

        // AmoCRM sends data in leads[add][0] or leads[update][0]
        const leadData = req.body.leads?.add?.[0] || req.body.leads?.update?.[0];
        
        if (!leadData) {
            return res.status(200).json({ msg: "No lead data found" });
        }

        // 1. Extract Lead Info
        const leadId = leadData.id;
        const leadName = leadData.name;
        const price = leadData.price;
        
        // 2. Extract Custom Fields (Phone, Notes, etc.)
        // These IDs depend on the specific AmoCRM setup, but usually phone is a standard field
        let phone = '';
        let source = 'AmoCRM';
        let notes = `AmoCRM Lead ID: ${leadId}\nName: ${leadName}`;

        if (leadData.custom_fields) {
            leadData.custom_fields.forEach(field => {
                if (field.name === 'Phone' || field.code === 'PHONE') {
                    phone = field.values[0].value;
                }
                if (field.name === 'Source' || field.code === 'SOURCE') {
                    source = field.values[0].value;
                }
            });
        }

        // 3. Prevent Duplicate Leads (Check by amoId)
        const existingOrderSnapshot = await db.collection('orders')
            .where('amoId', '==', leadId)
            .limit(1)
            .get();
        
        if (!existingOrderSnapshot.empty) {
            console.log(`Lead ${leadId} already exists in Express ERP. Skipping.`);
            return res.status(200).json({ success: true, msg: "Lead already exists" });
        }

        // 4. Create/Update Customer in Express ERP
        let customerId = '';
        if (phone) {
            const customerSnapshot = await db.collection('customers')
                .where('phone', '==', phone)
                .limit(1)
                .get();
            
            if (!customerSnapshot.empty) {
                customerId = customerSnapshot.docs[0].id;
            } else {
                const newCustomer = {
                    name: leadName || 'AmoCRM Lead',
                    phone: phone,
                    source: source,
                    createdAt: new Date().toISOString()
                };
                const custRef = await db.collection('customers').add(newCustomer);
                customerId = custRef.id;
            }
        }

        // 5. Create Order/Lead in Express ERP
        const timelineEntries = [
            {
                type: 'system',
                text: 'AmoCRM Call Center-dan yangi lid qabul qilindi',
                user: 'AmoCRM System',
                time: new Date().toISOString()
            }
        ];

        if (notes) {
            timelineEntries.push({
                type: 'note',
                text: `Call-markaz izohi: ${notes}`,
                user: 'AmoCRM Agent',
                time: new Date().toISOString()
            });
        }

        const newOrder = {
            customerName: leadName || 'AmoCRM Lead',
            customerPhone: phone,
            customerId: customerId,
            status: 'amocrm_lead', 
            pmStatus: 'yangi_buyurtma',
            price: price || 0,
            source: source,
            notes: notes,
            amoId: leadId,
            createdAt: new Date().toISOString(),
            timeline: timelineEntries
        };

        const orderRef = await db.collection('orders').add(newOrder);

        res.status(200).json({ 
            success: true, 
            msg: "Lead created in Express ERP", 
            orderId: orderRef.id 
        });

    } catch (err) {
        console.error("ReceiveAmoLead Error:", err.message);
        res.status(200).json({ error: err.message });
    }
};

// @desc    Receive Call Logs from Telephony Provider (Zadarma, OnlinePBX, etc.)
// @access  Public
exports.receiveCallLog = async (req, res) => {
    try {
        console.log("Received Call Log Webhook:", JSON.stringify(req.body));

        // Note: Field names vary by provider. This is a generic implementation.
        const customerPhone = req.body.customer_phone || req.body.phone;
        const managerPhone = req.body.manager_phone || req.body.ext_phone;
        const recordingUrl = req.body.recording_url || req.body.link;
        const duration = req.body.duration || 0;

        if (!customerPhone || !recordingUrl) {
            return res.status(200).json({ msg: "Incomplete call data" });
        }

        // 1. Find the latest active order for this customer phone
        // We look for orders where customerPhone matches
        const orderSnapshot = await db.collection('orders')
            .where('customerPhone', '==', customerPhone)
            .orderBy('createdAt', 'desc')
            .limit(1)
            .get();

        if (orderSnapshot.empty) {
            console.log(`No order found for customer ${customerPhone}. Logging to standalone call collection?`);
            // Optionally create a generic call log entry
            return res.status(200).json({ msg: "No matching order found" });
        }

        const orderId = orderSnapshot.docs[0].id;
        const orderData = orderSnapshot.docs[0].data();

        // 2. [OPTIONAL] Trigger AI Analysis (DeepSales Logic)
        // Here we would call OpenAI or another Speech-to-Text + GPT service
        // For now, we'll create a placeholder that can be enabled with an API key
        let aiInsight = "AI tahlili jarayonda...";
        
        // This is where you'd implement the AI call:
        // const analysis = await aiService.analyzeCall(recordingUrl);
        // aiInsight = analysis.summary;

        // 3. Add Call Recording to Timeline
        const callLog = {
            type: 'call',
            text: `Telefon suhbati yozib olindi (${duration} soniya). [Zapisni eshitish](${recordingUrl})`,
            aiAnalysis: aiInsight, // Placeholder for Phase 5
            user: orderData.managerName || 'Manager',
            time: new Date().toISOString(),
            recordingUrl: recordingUrl
        };

        await db.collection('orders').doc(orderId).update({
            timeline: [...(orderData.timeline || []), callLog]
        });

        res.status(200).json({ success: true, msg: "Call log attached to order and AI triggered" });

    } catch (err) {
        console.error("ReceiveCallLog Error:", err.message);
        res.status(200).json({ error: err.message });
    }
};
