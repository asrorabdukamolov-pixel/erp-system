import React, { useState } from 'react';
import { Database, Upload, CheckCircle, AlertTriangle, Trash2 } from 'lucide-react';
import api from '../../utils/api';

const Migration = () => {
    const [status, setStatus] = useState('idle'); // idle, migrating, success, error
    const [log, setLog] = useState([]);
    const [error, setError] = useState(null);

    const addLog = (msg) => setLog(prev => [...prev, { time: new Date().toLocaleTimeString(), msg }]);

    const startMigration = async () => {
        console.log("Migratsiya boshlanmoqda...");
        if (!window.confirm("Barcha ma'lumotlarni serverga ko'chirmoqchimisiz?")) return;

        setStatus('migrating');
        setLog([]);
        addLog("Migratsiya boshlandi...");

        try {
            addLog("LocalStorage tahlil qilinmoqda...");
            const allKeys = Object.keys(localStorage);
            console.log("LocalStorage Keys:", allKeys);
            addLog(`Xotirada jami ${allKeys.length} ta kalit topildi.`);
            
            allKeys.forEach(k => {
                const val = localStorage.getItem(k);
                if (val && val.length > 2) { // Bo'sh bo'lmaganlarni ko'rsatish
                    addLog(`Kalit: '${k}' (${val.length} bayt)`);
                }
            });

            addLog("Ma'lumotlar o'qilmoqda...");
            
            const readData = (key) => {
                try {
                    const item = localStorage.getItem(key);
                    if (!item) return [];
                    return JSON.parse(item);
                } catch (e) {
                    console.error(`${key} o'qishda xato:`, e);
                    addLog(`OGOHLANTIRISH: ${key} xotiradan o'qilmadi.`);
                    return [];
                }
            };

            const data = {
                users: readData('erp_staff_list'),
                orders: readData('erp_orders'),
                transactions: readData('erp_transactions'),
                showrooms: readData('erp_showrooms'),
                customers: readData('erp_customers')
            };

            addLog(`O'qilgan: ${data.users.length} xodim, ${data.orders.length} buyurtma, ${data.transactions.length} tranzaksiya, ${data.customers.length} mijoz.`);

            if (data.users.length === 0 && data.orders.length === 0 && data.transactions.length === 0) {
                addLog("LocalStorage bo'sh ko'rinmoqda! Ma'lumot topilmadi.");
            }

            addLog("Serverga yuborilmoqda...");
            const res = await api.post('/migrate', data);
            
            addLog("Server javobi: " + (res.data.msg || "Muvaffaqiyatli yakunlandi"));
            addLog(`Natija: Foydalanuvchilar: ${res.data.results?.users || 0}, Buyurtmalar: ${res.data.results?.orders || 0}, Tranzaksiyalar: ${res.data.results?.transactions || 0}`);
            
            setStatus('success');
            addLog("Migratsiya muvaffaqiyatli yakunlandi!");

        } catch (err) {
            console.error("Migratsiya xatosi:", err);
            const errorMsg = err.response?.data?.msg || err.message || "Noma'lum xatolik";
            setError(errorMsg);
            setStatus('error');
            addLog("XATOLIK: " + errorMsg);
        }
    };

    const resetDatabase = async () => {
        if (!window.confirm("⚠️ DIQQAT! MongoDB dagi BARCHA ma'lumotlar o'chiriladi. Davom etasizmi?")) return;

        setStatus('migrating');
        setLog([]);
        addLog("Baza tozalanmoqda...");

        try {
            const res = await api.delete('/migrate/reset');
            addLog("Server javobi: " + res.data.msg);
            setStatus('idle');
            addLog("✅ Baza muvaffaqiyatli tozalandi. Endi qaytadan migratsiya qilishingiz mumkin.");
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.msg || err.message);
            setStatus('error');
            addLog("XATOLIK: " + (err.response?.data?.msg || err.message));
        }
    };

    return (
        <div style={{ padding: '40px', maxWidth: '800px' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '900', marginBottom: '10px' }}>
                Ma'lumotlar <span style={{ color: 'var(--accent-gold)' }}>Migratsiyasi</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>
                Ushbu bo'lim brauzer xotirasidagi (LocalStorage) barcha ma'lumotlarni markaziy server bazasiga (MongoDB) ko'chirish uchun xizmat qiladi.
            </p>

            {/* Asosiy migratsiya kartasi */}
            <div className="premium-card" style={{ padding: '30px', border: '1px solid var(--border-color)', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px' }}>
                    <div style={{ padding: '15px', background: 'rgba(251, 191, 36, 0.1)', borderRadius: '15px' }}>
                        <Database size={40} color="var(--accent-gold)" />
                    </div>
                    <div>
                        <h4 style={{ fontSize: '18px', fontWeight: '800' }}>Brauzerdan Serverga</h4>
                        <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Barcha xodimlar, buyurtmalar va moliya tarixi ko'chiriladi.</p>
                    </div>
                </div>

                {status !== 'migrating' && (
                    <button 
                        onClick={startMigration} 
                        className="gold-btn" 
                        style={{ 
                            width: '100%', 
                            height: '54px', 
                            fontSize: '16px',
                            background: status === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'var(--accent-gold)',
                            color: status === 'success' ? '#10b981' : 'black',
                            border: status === 'success' ? '1px solid #10b981' : 'none',
                            marginBottom: '10px'
                        }}
                    >
                        {status === 'success' ? <CheckCircle size={20} /> : <Upload size={20} />} 
                        {status === 'success' ? "Yana Migratsiya Qilish" : "Migratsiyani Boshlash"}
                    </button>
                )}

                {status === 'migrating' && (
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                        <div className="spin-anim" style={{ marginBottom: '15px', fontSize: '30px' }}>⌛</div>
                        <p style={{ fontWeight: '700' }}>Jarayon bajarilmoqda, iltimos kuting...</p>
                    </div>
                )}

                {status === 'success' && (
                    <div style={{ textAlign: 'center', marginTop: '10px' }}>
                        <button onClick={() => window.location.reload()} className="secondary-btn" style={{ width: '100%' }}>Sahifani Yangilash</button>
                    </div>
                )}

                {status === 'error' && (
                    <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '20px', borderRadius: '12px', border: '1px solid #ef4444', marginTop: '20px' }}>
                        <AlertTriangle color="#ef4444" size={48} style={{ marginBottom: '10px', display: 'block', margin: '0 auto' }} />
                        <h4 style={{ color: '#ef4444', fontWeight: '800', textAlign: 'center' }}>Xatolik yuz berdi</h4>
                        <p style={{ fontSize: '14px', textAlign: 'center' }}>{error}</p>
                        <button onClick={startMigration} className="secondary-btn" style={{ marginTop: '15px', width: '100%' }}>Qayta Urinish</button>
                    </div>
                )}
            </div>

            {/* Baza tozalash (Danger Zone) */}
            <div className="premium-card" style={{ padding: '24px', border: '1px solid rgba(239, 68, 68, 0.3)', background: 'rgba(239, 68, 68, 0.03)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '12px' }}>
                            <Trash2 size={28} color="#ef4444" />
                        </div>
                        <div>
                            <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#ef4444' }}>Bazani Tozalash</h4>
                            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>MongoDB dagi barcha ma'lumotlarni o'chirib, tizimni 0 holatga qaytaradi.</p>
                        </div>
                    </div>
                    <button
                        onClick={resetDatabase}
                        disabled={status === 'migrating'}
                        style={{
                            background: 'rgba(239, 68, 68, 0.15)',
                            border: '1px solid rgba(239, 68, 68, 0.5)',
                            color: '#ef4444',
                            padding: '10px 20px',
                            borderRadius: '10px',
                            fontWeight: '700',
                            fontSize: '13px',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            transition: 'all 0.2s'
                        }}
                    >
                        0 ga qaytarish
                    </button>
                </div>
            </div>

            {/* System Log */}
            {(status === 'migrating' || log.length > 0) && (
                <div className="premium-card" style={{ marginTop: '20px', padding: '20px', background: '#000', fontFamily: 'monospace', fontSize: '12px', maxHeight: '300px', overflowY: 'auto' }}>
                    <p style={{ color: 'var(--accent-gold)', marginBottom: '10px', fontWeight: 'bold' }}>SYSTEM LOG:</p>
                    {log.map((item, i) => (
                        <div key={i} style={{ marginBottom: '4px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '4px' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>[{item.time}]</span> {item.msg}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Migration;
