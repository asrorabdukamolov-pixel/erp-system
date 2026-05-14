import React, { useState } from 'react';
import CostCenters from './CostCenters';
import CashFlowSettings from './CashFlowSettings';
import ExpenseItemsSettings from './ExpenseItemsSettings';
import PnLCategoriesSettings from './PnLCategoriesSettings';
import BankAccountsSettings from './BankAccountsSettings';
import PaymentTermsSettings from './PaymentTermsSettings';
import CurrenciesSettings from './CurrenciesSettings';
import TaxesSettings from './TaxesSettings';
import { Settings as SettingsIcon, BarChart3, Wallet } from 'lucide-react';

const Settings = () => {
    const [activeTab, setActiveTab] = useState('general');
    const [activeMasterDataTab, setActiveMasterDataTab] = useState('moliya');
    const [activeFinanceSubTab, setActiveFinanceSubTab] = useState('exp-items');


    const tabStyle = (isActive) => ({
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '16px 24px',
        fontSize: '15px',
        fontWeight: '700',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        color: isActive ? 'var(--accent-gold)' : 'var(--text-secondary)',
        borderBottom: isActive ? '3px solid var(--accent-gold)' : '3px solid transparent',
        background: 'transparent',
    });

    const subTabStyle = (isActive) => ({
        padding: '8px 20px',
        fontSize: '13px',
        fontWeight: '600',
        cursor: 'pointer',
        borderRadius: '8px',
        transition: 'all 0.2s ease',
        background: isActive ? 'rgba(212,175,55,0.1)' : 'transparent',
        color: isActive ? 'var(--accent-gold)' : 'var(--text-secondary)',
        border: isActive ? '1px solid var(--accent-gold)' : '1px solid transparent',
    });

    return (
        <div style={{ padding: '30px' }}>
            <div style={{ marginBottom: '40px' }}>
                <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '8px' }}>Tizim Sozlamalari</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>ERP tizimi parametrlarini boshqarish va tahrirlash.</p>
            </div>

            {/* Tabs Navigation */}
            <div style={{ 
                display: 'flex', 
                gap: '10px', 
                marginBottom: '32px', 
                borderBottom: '1px solid var(--border-color)',
                paddingLeft: '10px'
            }}>
                <button 
                    onClick={() => setActiveTab('general')}
                    style={tabStyle(activeTab === 'general')}
                >
                    <SettingsIcon size={20} />
                    Umumiy sozlamalar
                </button>
                <button 
                    onClick={() => setActiveTab('master-data')}
                    style={tabStyle(activeTab === 'master-data')}
                >
                    <BarChart3 size={20} />
                    Master Data
                </button>
            </div>

            {/* Tab Content */}
            <div style={{ marginTop: '20px' }}>
                {activeTab === 'general' && (
                    <div className="premium-card" style={{ padding: '40px', textAlign: 'center' }}>
                        <div style={{ color: 'var(--accent-gold)', marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
                            <SettingsIcon size={48} />
                        </div>
                        <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '12px' }}>Umumiy sozlamalar</h3>
                        <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto' }}>
                            Bu bo'limda tizimning asosiy parametrlari, kompaniya ma'lumotlari va boshqa texnik sozlamalar joylashadi.
                        </p>
                    </div>
                )}
                
                {activeTab === 'master-data' && (
                    <div>
                        {/* Sub-tabs for Master Data Categories */}
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', flexWrap: 'wrap' }}>
                            {['Savdo', 'Ishlab chiqarish', 'Ombor', 'Xarid', 'Moliya'].map(cat => (
                                <button 
                                    key={cat}
                                    onClick={() => setActiveMasterDataTab(cat.toLowerCase())}
                                    style={subTabStyle(activeMasterDataTab === cat.toLowerCase())}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        {/* Master Data Category Content */}
                        <div className="fade-in">
                            {activeMasterDataTab === 'moliya' ? (
                                <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '30px' }}>
                                    {/* Finance Side Menu */}
                                    <div className="premium-card" style={{ padding: '15px', height: 'fit-content' }}>
                                        {[
                                            { id: 'cf-items', label: 'Pul oqimi moddalari' },
                                            { id: 'exp-items', label: 'Xarajat moddalari' },
                                            { id: 'cost-centers', label: 'Xarajat markazlari / ЦФО' },
                                            { id: 'pnl-cats', label: 'P&L kategoriyalari' },
                                            { id: 'bank-accounts', label: 'Bank va kassalar' },
                                            { id: 'payment-terms', label: 'To‘lov shartlari' },
                                            { id: 'currencies', label: 'Valyutalar' },
                                            { id: 'tax-types', label: 'Soliq turlari' },
                                            { id: 'budget-items', label: 'Byudjet moddalari' }
                                        ].map(item => (
                                            <div 
                                                key={item.id}
                                                onClick={() => setActiveFinanceSubTab(item.id)}
                                                style={{
                                                    padding: '12px 16px',
                                                    borderRadius: '10px',
                                                    cursor: 'pointer',
                                                    fontSize: '13px',
                                                    fontWeight: '600',
                                                    marginBottom: '4px',
                                                    transition: 'all 0.2s ease',
                                                    background: activeFinanceSubTab === item.id ? 'rgba(212,175,55,0.1)' : 'transparent',
                                                    color: activeFinanceSubTab === item.id ? 'var(--accent-gold)' : 'var(--text-secondary)',
                                                    borderLeft: activeFinanceSubTab === item.id ? '3px solid var(--accent-gold)' : '3px solid transparent'
                                                }}
                                            >
                                                {item.label}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Finance Content Area */}
                                    <div>
                                        {activeFinanceSubTab === 'cf-items' && <CashFlowSettings />}
                                        {activeFinanceSubTab === 'exp-items' && <ExpenseItemsSettings />}
                                        {activeFinanceSubTab === 'cost-centers' && <CostCenters />}
                                        {activeFinanceSubTab === 'pnl-cats' && <PnLCategoriesSettings />}
                                        {activeFinanceSubTab === 'bank-accounts' && <BankAccountsSettings />}
                                        {activeFinanceSubTab === 'payment-terms' && <PaymentTermsSettings />}
                                        {activeFinanceSubTab === 'currencies' && <CurrenciesSettings />}
                                        {activeFinanceSubTab === 'tax-types' && <TaxesSettings />}
                                        
                                        {!['cf-items', 'exp-items', 'cost-centers', 'pnl-cats', 'bank-accounts', 'payment-terms', 'currencies', 'tax-types'].includes(activeFinanceSubTab) && (
                                            <div className="premium-card" style={{ padding: '60px', textAlign: 'center' }}>
                                                <h3 style={{ fontSize: '18px', fontWeight: '700' }}>
                                                    {activeFinanceSubTab.replace('-', ' ')}
                                                </h3>
                                                <p style={{ color: 'var(--text-secondary)', marginTop: '10px' }}>
                                                    Ushbu bo'lim uchun sozlamalar tez orada tayyor bo'ladi.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                ['savdo', 'ishlab chiqarish', 'ombor', 'xarid'].includes(activeMasterDataTab) && (
                                    <div className="premium-card" style={{ padding: '60px', textAlign: 'center' }}>
                                        <div style={{ color: 'var(--accent-gold)', opacity: 0.5, marginBottom: '20px' }}>
                                            <BarChart3 size={48} style={{ margin: '0 auto' }} />
                                        </div>
                                        <h3 style={{ fontSize: '20px', fontWeight: '700', textTransform: 'capitalize' }}>{activeMasterDataTab} Ma'lumotlari</h3>
                                        <p style={{ color: 'var(--text-secondary)', marginTop: '10px' }}>Ushbu bo'lim uchun master-ma'lumotlar yaqin orada qo'shiladi.</p>
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                )}


            </div>
        </div>
    );
};


export default Settings;



