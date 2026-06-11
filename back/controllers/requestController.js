const { db, formatQuery, formatDoc } = require('../config/firebase');

// Condition Parser Helper
function evaluateCondition(conditionStr, request) {
    if (!conditionStr || conditionStr === 'Barcha arizalar uchun' || conditionStr.trim() === '') {
        return true;
    }
    try {
        const cleaned = conditionStr.replace(/UZS/g, '').replace(/,/g, '').trim();
        // Check amount conditions (e.g., amount > 5000000)
        const amountMatch = cleaned.match(/(?:summa|amount)\s*(>|>=|<|<=|==)\s*(\d+)/i);
        if (amountMatch) {
            const operator = amountMatch[1];
            const value = parseFloat(amountMatch[2]);
            const reqAmount = parseFloat(request.amount || 0);
            if (operator === '>') return reqAmount > value;
            if (operator === '>=') return reqAmount >= value;
            if (operator === '<') return reqAmount < value;
            if (operator === '<=') return reqAmount <= value;
            if (operator === '==') return reqAmount === value;
        }
        
        // Category check (e.g., category == 'travel')
        const categoryMatch = cleaned.match(/(?:kategoriya|category)\s*==\s*['"]?([^'"]+)['"]?/i);
        if (categoryMatch) {
            const val = categoryMatch[1];
            return request.category === val;
        }
    } catch (e) {
        console.error("Condition evaluation error:", e);
    }
    return true; // Default to true to be safe
}

// Normalize step if it comes from the old seed format (no approver_type)
function normalizeStep(step) {
    if (!step) return step;
    if (!step.approver_type && step.role) {
        const roleLower = step.role.toLowerCase();
        if (roleLower.includes('savdo rahbari') || roleLower.includes('sales head') || roleLower.includes('showroom')) {
            step.approver_type = 'showroom_manager';
        } else if (roleLower.includes('moliyaviy') || roleLower.includes('cfo') || roleLower.includes('finance')) {
            step.approver_type = 'finance_manager';
        } else if (roleLower.includes('direktor') || roleLower.includes('ceo')) {
            step.approver_type = 'director';
        } else if (roleLower.includes('ombor') || roleLower.includes('sex') || roleLower.includes('warehouse')) {
            step.approver_type = 'role';
            step.role_id = 'warehouse';
            step.scope = 'all_company';
        } else if (roleLower.includes('buxgalter') || roleLower.includes('accountant')) {
            step.approver_type = 'role';
            step.role_id = 'kassa';
            step.scope = 'all_company';
        }
    }
    if (step.active === undefined && step.status === 'active') {
        step.active = true;
    }
    return step;
}

// Find matched users for a step
async function resolveApprovers(step, request) {
    if (!step) return [];
    step = normalizeStep(step);
    if (!step.active) return [];
    
    // Fetch all active users
    const usersSnapshot = await db.collection('users').get();
    const users = formatQuery(usersSnapshot);
    
    let matchedUsers = [];
    const requesterShowroom = request.requesterShowroom || request.showroom || '';
    const requesterDepartment = request.requesterDepartment || '';
    
    if (step.approver_type === 'specific_user') {
        matchedUsers = users.filter(u => u._id === step.user_id || u.id === step.user_id);
    } else if (step.approver_type === 'showroom_manager') {
        matchedUsers = users.filter(u => u.role === 'showroom' && u.showroom === requesterShowroom);
    } else if (step.approver_type === 'director') {
        matchedUsers = users.filter(u => u.role === 'super' || u.positionName === 'Bosh direktor');
    } else if (step.approver_type === 'finance_manager') {
        matchedUsers = users.filter(u => u.role === 'kassa' || u.positionName === 'Moliyaviy rahbar' || u.positionName === 'Moliyaviy menejer');
    } else if (step.approver_type === 'department_head') {
        matchedUsers = users.filter(u => {
            if (u.department !== requesterDepartment) return false;
            const name = (u.positionName || '').toLowerCase();
            return name.includes('rahbar') || name.includes('boshliq') || name.includes('mudir') || name.includes('inspektor') || name.includes('menejer');
        });
    } else if (step.approver_type === 'role') {
        const roleId = step.role_id;
        matchedUsers = users.filter(u => {
            const roleMatch = u.role === roleId || (u.positionName || '').toLowerCase() === roleId.toLowerCase();
            if (roleMatch) {
                if (step.scope === 'requester_showroom') {
                    return u.showroom === requesterShowroom;
                } else if (step.scope === 'requester_department') {
                    return u.department === requesterDepartment;
                }
                return true;
            }
            return false;
        });
    }
    
    return matchedUsers;
}

// Generate the display label details
function getApproverDisplayInfo(step, matchedUsers, request) {
    const label = step.label || step.role || 'Tasdiqlovchi';
    if (!matchedUsers || matchedUsers.length === 0) {
        let context = '';
        if (step.approver_type === 'showroom_manager') {
            context = 'Showroom';
        } else if (step.scope === 'requester_showroom') {
            context = 'Showroom';
        } else if (step.scope === 'requester_department') {
            context = 'Bo\'lim';
        } else {
            context = step.role_id || 'Tizim';
        }
        return {
            label,
            names: `${context} bo‘yicha mas’ul topilmadi`,
            count: 0
        };
    } else if (matchedUsers.length === 1) {
        const u = matchedUsers[0];
        let roleSuffix = '';
        if (u.role === 'showroom') roleSuffix = ' (Showroom Rahbari)';
        else if (u.role === 'kassa') roleSuffix = ' (Moliya / Kassir)';
        else if (u.role === 'super') roleSuffix = ' (Super Admin)';
        else if (u.role === 'sales_manager') roleSuffix = ' (Savdo Menejeri)';
        else if (u.role === 'proekt_manager') roleSuffix = ' (PM)';
        return {
            label,
            names: `${u.name} ${u.surname || ''}${roleSuffix}`.trim(),
            count: 1
        };
    } else {
        return {
            label,
            names: `${matchedUsers.length} ta mas’ul`,
            count: matchedUsers.length
        };
    }
}

// Map request category / fields to a workflow documentType key
function getWorkflowKey(category, purchaseId) {
    if (purchaseId || category === 'Maxsulot uchun') {
        return 'xarid_arizasi_workflow';
    }
    if (category === 'Yo\'l xarajati uchun' || category === 'Oziq-ovqat uchun') {
        return 'sotuvoldi_xarajat_arizasi_workflow';
    }
    if (category === 'Ish xaqqi bonusi') {
        return 'bonus_approval_workflow';
    }
    if (category === 'ish xaqqi fiksadan avans') {
        return 'hr_tabel_workflow';
    }
    if (category === 'Ustanovshik puli') {
        return 'kassadan_chiqim_arizasi_workflow';
    }
    if (category === 'Chegirma arizasi') {
        return 'chegirma_approval_workflow';
    }
    return 'sotuvoldi_xarajat_arizasi_workflow'; // fallback default
}

// Helper to run / advance the workflow step by step
async function runWorkflowEngine(request) {
    const steps = request.workflowSnapshot?.steps || [];
    let currentIndex = request.currentStepIndex !== undefined ? request.currentStepIndex : 0;
    
    let matchedStep = null;
    let matchedUsers = [];
    
    while (currentIndex < steps.length) {
        let step = steps[currentIndex];
        step = normalizeStep(step);
        // Check if active and condition is met
        if (step.active !== false && evaluateCondition(step.condition, request)) {
            // Found active step whose condition is met
            matchedStep = step;
            matchedUsers = await resolveApprovers(step, request);
            break;
        }
        currentIndex++;
    }
    
    if (matchedStep) {
        const displayInfo = getApproverDisplayInfo(matchedStep, matchedUsers, request);
        request.currentStepIndex = currentIndex;
        request.currentStepLabel = displayInfo.label;
        request.currentApproverNames = displayInfo.names;
        request.currentApproverCount = displayInfo.count;
        request.currentApproverType = matchedStep.approver_type;
        request.currentApproverRole = matchedStep.role_id || '';
        request.currentApprovers = matchedUsers.map(u => ({ id: u._id || u.id, name: `${u.name} ${u.surname || ''}`.trim() }));
        request.status = 'pending_approval';
    } else {
        // No more steps or all skipped -> Approved for Payment
        request.currentStepIndex = -1;
        request.currentStepLabel = 'To‘lovga tayyor';
        request.currentApproverNames = 'Kassir';
        request.currentApproverCount = 1;
        request.currentApproverType = 'kassa';
        request.currentApproverRole = '';
        request.currentApprovers = [];
        request.status = 'approved_for_payment';
    }
    
    return request;
}

exports.getRequests = async (req, res) => {
    try {
        let queryRef = db.collection('money_requests');
        const snapshot = await queryRef.get();
        let requests = formatQuery(snapshot);

        // Filter requests based on role visibility
        if (req.user.role === 'proekt_manager') {
            requests = requests.filter(r => r.userId === req.user.id);
        } else if (req.user.role === 'sales_manager' || req.user.role === 'sotuv_manager') {
            requests = requests.filter(r => r.userId === req.user.id);
        } else if (req.user.role === 'showroom') {
            requests = requests.filter(r => r.showroom === req.user.showroom || r.requesterShowroom === req.user.showroom);
        }

        // Sort by creation date descending
        requests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        res.json(requests);
    } catch (err) {
        console.error("GetRequests Error:", err.message);
        res.status(500).send('Server xatosi');
    }
};

exports.createRequest = async (req, res) => {
    try {
        // Fetch requester's full user doc for department
        const userDoc = await db.collection('users').doc(req.user.id).get();
        let requesterDept = '';
        if (userDoc.exists) {
            requesterDept = userDoc.data().department || '';
        }

        const category = req.body.category || '';
        const purchaseId = req.body.purchaseId || '';
        const docType = req.body.documentType || getWorkflowKey(category, purchaseId);

        // Fetch active workflow for this documentType
        const workflowSnapshot = await db.collection('approval-matrix')
            .where('key', '==', docType)
            .where('isActive', '==', true)
            .get();

        let activeWorkflow = null;
        if (!workflowSnapshot.empty) {
            activeWorkflow = formatDoc(workflowSnapshot.docs[0]);
        } else {
            // Fallback to searching without isActive if needed or find standard matching
            const allWorkflows = await db.collection('approval-matrix').get();
            const list = formatQuery(allWorkflows);
            // Try matching legacy key
            let oldKey = docType;
            if (docType === 'xarid_arizasi_workflow') oldKey = 'purchase_request';
            if (docType === 'kassadan_chiqim_arizasi_workflow') oldKey = 'cash_outflow';
            if (docType === 'sotuvoldi_xarajat_arizasi_workflow') oldKey = 'pre_sale';
            
            activeWorkflow = list.find(w => w.key === docType || w.key === oldKey);
        }

        const initialStatus = req.body.status || 'submitted';

        let newRequest = {
            ...req.body,
            userId: req.user.id,
            userName: req.user.name,
            showroom: req.user.showroom || '',
            requesterShowroom: req.user.showroom || '',
            requesterDepartment: requesterDept,
            documentType: docType,
            status: initialStatus,
            createdAt: new Date().toISOString(),
            approvalLog: []
        };

        if (initialStatus === 'submitted') {
            if (activeWorkflow) {
                newRequest.workflowVersion = activeWorkflow.version || 1;
                newRequest.workflowSnapshot = {
                    key: activeWorkflow.key,
                    name: activeWorkflow.name,
                    version: activeWorkflow.version || 1,
                    steps: activeWorkflow.steps || []
                };
                newRequest.currentStepIndex = 0;
                // Run engine
                newRequest = await runWorkflowEngine(newRequest);
            } else {
                // No workflow defined -> direct approved_for_payment
                newRequest.status = 'approved_for_payment';
            }
        } else {
            // For draft status
            newRequest.status = 'draft';
        }

        const docRef = await db.collection('money_requests').add(newRequest);
        res.json({ _id: docRef.id, ...newRequest });
    } catch (err) {
        console.error("CreateRequest Error:", err.message);
        res.status(500).send('Server xatosi');
    }
};

exports.updateRequestStatus = async (req, res) => {
    try {
        const { status, rejectReason, comment } = req.body;
        const requestRef = db.collection('money_requests').doc(req.params.id);
        const doc = await requestRef.get();
        if (!doc.exists) return res.status(404).json({ msg: 'So\'rov topilmadi' });

        let request = formatDoc(doc);
        const oldStatus = request.status;

        // If transitioning from draft to submitted:
        if (status === 'pending' || status === 'submitted') {
            // Fetch active workflow and snapshot it
            const docType = request.documentType || getWorkflowKey(request.category, request.purchaseId);
            const workflowSnapshot = await db.collection('approval-matrix')
                .where('key', '==', docType)
                .where('isActive', '==', true)
                .get();

            let activeWorkflow = null;
            if (!workflowSnapshot.empty) {
                activeWorkflow = formatDoc(workflowSnapshot.docs[0]);
            } else {
                const allWorkflows = await db.collection('approval-matrix').get();
                const list = formatQuery(allWorkflows);
                let oldKey = docType;
                if (docType === 'xarid_arizasi_workflow') oldKey = 'purchase_request';
                if (docType === 'kassadan_chiqim_arizasi_workflow') oldKey = 'cash_outflow';
                if (docType === 'sotuvoldi_xarajat_arizasi_workflow') oldKey = 'pre_sale';
                activeWorkflow = list.find(w => w.key === docType || w.key === oldKey);
            }

            if (activeWorkflow) {
                request.workflowVersion = activeWorkflow.version || 1;
                request.workflowSnapshot = {
                    key: activeWorkflow.key,
                    name: activeWorkflow.name,
                    version: activeWorkflow.version || 1,
                    steps: activeWorkflow.steps || []
                };
                request.currentStepIndex = 0;
                request = await runWorkflowEngine(request);
            } else {
                request.status = 'approved_for_payment';
            }
            request.approvalLog = request.approvalLog || [];
            request.approvalLog.push({
                step: 0,
                approvedBy: req.user.name,
                role: req.user.role,
                approvedAt: new Date().toISOString(),
                comment: 'Tasdiqlashga yuborildi',
                oldStatus,
                newStatus: request.status
            });

            await requestRef.update(request);
            return res.json(request);
        }

        // Check approvals
        if (status === 'approved') {
            // Verify if user is authorized to approve this step
            const currentStep = request.workflowSnapshot?.steps?.[request.currentStepIndex];
            if (!currentStep) {
                return res.status(400).json({ msg: 'Ushbu so\'rov uchun tasdiqlash bosqichi mavjud emas' });
            }

            // Check if current user's ID or role matches authorized approvers
            const currentApprovers = request.currentApprovers || [];
            const isAuthorized = currentApprovers.some(a => a.id === req.user.id) || 
                                 req.user.role === 'super' || 
                                 (currentStep.approver_type === 'director' && req.user.role === 'super') ||
                                 (currentStep.approver_type === 'finance_manager' && req.user.role === 'kassa');

            if (!isAuthorized) {
                return res.status(403).json({ msg: 'Siz ushbu bosqichni tasdiqlash huquqiga ega emassiz' });
            }

            // Advance workflow to next step
            request.currentStepIndex++;
            request = await runWorkflowEngine(request);
            
            // Log approval
            request.approvalLog = request.approvalLog || [];
            request.approvalLog.push({
                step: request.currentStepIndex,
                approvedBy: req.user.name,
                role: req.user.role,
                approvedAt: new Date().toISOString(),
                comment: comment || 'Tasdiqlandi',
                oldStatus,
                newStatus: request.status
            });

            await requestRef.update(request);
            return res.json(request);
        }

        if (status === 'rejected') {
            request.status = 'rejected';
            request.rejectReason = rejectReason || comment || '';
            request.approvalLog = request.approvalLog || [];
            request.approvalLog.push({
                step: request.currentStepIndex || 0,
                approvedBy: req.user.name,
                role: req.user.role,
                approvedAt: new Date().toISOString(),
                comment: rejectReason || comment || 'Rad etildi',
                oldStatus,
                newStatus: 'rejected'
            });

            await requestRef.update(request);
            return res.json(request);
        }

        if (status === 'returned') {
            request.status = 'returned';
            request.rejectReason = rejectReason || comment || '';
            request.approvalLog = request.approvalLog || [];
            request.approvalLog.push({
                step: request.currentStepIndex || 0,
                approvedBy: req.user.name,
                role: req.user.role,
                approvedAt: new Date().toISOString(),
                comment: rejectReason || comment || 'Qayta ishlashga qaytarildi',
                oldStatus,
                newStatus: 'returned'
            });

            await requestRef.update(request);
            return res.json(request);
        }

        if (status === 'paid') {
            // Cashier executes payment
            if (req.user.role !== 'kassa' && req.user.role !== 'super') {
                return res.status(403).json({ msg: 'Faqat kassa xodimi to\'lovni amalga oshirishi mumkin' });
            }

            request.status = 'paid';
            request.paidAt = new Date().toISOString();
            request.paidBy = req.user.name;
            request.approvalLog = request.approvalLog || [];
            request.approvalLog.push({
                step: 99, // execution step
                approvedBy: req.user.name,
                role: 'kassa',
                approvedAt: new Date().toISOString(),
                comment: comment || 'To\'lov bajarildi',
                oldStatus,
                newStatus: 'paid'
            });

            await requestRef.update(request);
            return res.json(request);
        }

        // Fallback for simple status updates
        await requestRef.update(req.body);
        const updated = await requestRef.get();
        res.json(formatDoc(updated));
    } catch (err) {
        console.error("UpdateRequestStatus Error:", err.message);
        res.status(500).send('Server xatosi');
    }
};

exports.deleteRequest = async (req, res) => {
    try {
        const requestRef = db.collection('money_requests').doc(req.params.id);
        const doc = await requestRef.get();
        if (!doc.exists) return res.status(404).json({ msg: 'So\'rov topilmadi' });
        
        await requestRef.delete();
        res.json({ msg: 'So\'rov o\'chirildi' });
    } catch (err) {
        console.error("DeleteRequest Error:", err.message);
        res.status(500).send('Server xatosi');
    }
};
