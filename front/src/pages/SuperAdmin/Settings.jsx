import React, { useState } from 'react';
import CostCenters from './CostCenters';
import CashFlowSettings from './CashFlowSettings';
import ExpenseItemsSettings from './ExpenseItemsSettings';
import PnLCategoriesSettings from './PnLCategoriesSettings';
import BankAccountsSettings from './BankAccountsSettings';
import PaymentTermsSettings from './PaymentTermsSettings';
import CurrenciesSettings from './CurrenciesSettings';
import TaxesSettings from './TaxesSettings';
import Departments from './Departments';
import PositionsSettings from './PositionsSettings';
import RolesPermissionsSettings from './RolesPermissionsSettings';
import CompanySettings from './CompanySettings';
import Partners from './Partners';
import FactoryAccounts from './FactoryAccounts';
import WarehousesSettings from './WarehousesSettings';
import MasterDataList from '../../components/MasterDataList';
import { 
    Settings as SettingsIcon, BarChart3, Wallet, Users, ShieldCheck, 
    Briefcase, ShoppingCart, Factory, Package, Building2, Layers,
    Tag, MessageSquare, ClipboardList, Ban, Box, GitBranch, Settings2,
    CheckCircle2, AlertTriangle, Database, Bookmark, Boxes, Ruler, 
    ArrowRightLeft, UserCheck, FolderTree, FileQuestion, FileCheck, Truck,
    FileText, Key
} from 'lucide-react';

const Settings = () => {
    const [activeTab, setActiveTab] = useState('general');
    const [activeMasterDataTab, setActiveMasterDataTab] = useState('savdo');
    
    // General Sub-tabs
    const [activeGeneralSubTab, setActiveGeneralSubTab] = useState('company');

    // Master Data Sub-tabs states
    const [activeFinanceSubTab, setActiveFinanceSubTab] = useState('cf-items');
    const [activeOrgSubTab, setActiveOrgSubTab] = useState('departments');
    const [activeSalesSubTab, setActiveSalesSubTab] = useState('customer-types');
    const [activeProdSubTab, setActiveProdSubTab] = useState('product-types');
    const [activeWarehouseSubTab, setActiveWarehouseSubTab] = useState('warehouses');
    const [activePurchaseSubTab, setActivePurchaseSubTab] = useState('supplier-types');


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

    const sideMenuItemStyle = (isActive) => ({
        padding: '12px 16px',
        borderRadius: '10px',
        cursor: 'pointer',
        fontSize: '13px',
        fontWeight: '600',
        marginBottom: '4px',
        transition: 'all 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        background: isActive ? 'rgba(212,175,55,0.1)' : 'transparent',
        color: isActive ? 'var(--accent-gold)' : 'var(--text-secondary)',
        borderLeft: isActive ? '3px solid var(--accent-gold)' : '3px solid transparent'
    });

    const masterDataCategories = [
        { id: 'savdo', label: 'Savdo', icon: <ShoppingCart size={18} /> },
        { id: 'ishlab chiqarish', label: 'Ishlab chiqarish', icon: <Factory size={18} /> },
        { id: 'ombor', label: 'Ombor', icon: <Package size={18} /> },
        { id: 'xarid', label: 'Xarid', icon: <Building2 size={18} /> },
        { id: 'moliya', label: 'Moliya', icon: <Wallet size={18} /> },
        { id: 'tashkiliy tuzilma', label: 'Tashkiliy tuzilma', icon: <Layers size={18} /> }
    ];

    const generalCategories = [
        { id: 'company', label: 'Kompaniya Ma\'lumotlari', icon: <Building2 size={18} /> },
        { id: 'kp', label: 'Tijorat Taklifi Identikasi', icon: <FileText size={18} /> },
        { id: 'accounts', label: 'Fabrika Akkauntlari', icon: <Key size={18} /> }
    ];

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
                <button onClick={() => setActiveTab('general')} style={tabStyle(activeTab === 'general')}>
                    <SettingsIcon size={20} /> Umumiy sozlamalar
                </button>
                <button onClick={() => setActiveTab('master-data')} style={tabStyle(activeTab === 'master-data')}>
                    <BarChart3 size={20} /> Master Data
                </button>
            </div>

            {/* Tab Content */}
            <div style={{ marginTop: '20px' }}>
                {activeTab === 'general' && (
                    <div>
                        {/* Sub-tabs for General */}
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', flexWrap: 'wrap' }}>
                            {generalCategories.map(cat => (
                                <button 
                                    key={cat.id}
                                    onClick={() => setActiveGeneralSubTab(cat.id)}
                                    style={subTabStyle(activeGeneralSubTab === cat.id)}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        {cat.icon}
                                        {cat.label}
                                    </div>
                                </button>
                            ))}
                        </div>

                        <div className="fade-in">
                            {activeGeneralSubTab === 'company' && <CompanySettings />}
                            {activeGeneralSubTab === 'kp' && <Partners />}
                            {activeGeneralSubTab === 'accounts' && <FactoryAccounts />}
                        </div>
                    </div>
                )}
                
                {activeTab === 'master-data' && (
                    <div>
                        {/* Sub-tabs for Master Data Categories */}
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', flexWrap: 'wrap' }}>
                            {masterDataCategories.map(cat => (
                                <button 
                                    key={cat.id}
                                    onClick={() => setActiveMasterDataTab(cat.id)}
                                    style={subTabStyle(activeMasterDataTab === cat.id)}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        {cat.icon}
                                        {cat.label}
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* Master Data Category Content */}
                        <div className="fade-in">
                            
                            {/* SALES CATEGORY */}
                            {activeMasterDataTab === 'savdo' && (
                                <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '30px' }}>
                                    <div className="premium-card" style={{ padding: '15px', height: 'fit-content' }}>
                                        {[
                                            { id: 'customer-types', label: 'Mijoz turlari', icon: <Tag size={16} /> },
                                            { id: 'lead-sources', label: 'Lead manbalari', icon: <MessageSquare size={16} /> },
                                            { id: 'sales-channels', label: 'Savdo kanallari', icon: <ArrowRightLeft size={16} /> },
                                            { id: 'kp-statuses', label: 'KP statuslari', icon: <ClipboardList size={16} /> },
                                            { id: 'rejection-reasons', label: 'Rad etish sabablari', icon: <Ban size={16} /> }
                                        ].map(item => (
                                            <div key={item.id} onClick={() => setActiveSalesSubTab(item.id)} style={sideMenuItemStyle(activeSalesSubTab === item.id)}>
                                                {item.icon} {item.label}
                                            </div>
                                        ))}
                                    </div>
                                    <div>
                                        {activeSalesSubTab === 'customer-types' && <MasterDataList title="Mijoz turlari" endpoint="/customer-types" description="Mijozlarni toifalash uchun ishlatiladi (Masalan: VIP, Doimiy, Yangi)." icon={Tag} />}
                                        {activeSalesSubTab === 'lead-sources' && <MasterDataList title="Lead manbalari" endpoint="/lead-sources" description="Mijozlar qayerdan kelayotganini kuzatish uchun (Masalan: Instagram, Telegram, Tavsiya)." icon={MessageSquare} />}
                                        {activeSalesSubTab === 'sales-channels' && <MasterDataList title="Savdo kanallari" endpoint="/sales-channels" description="Savdo amalga oshiriladigan platformalar (Masalan: Showroom, Onlayn, Eksport)." icon={ArrowRightLeft} />}
                                        {activeSalesSubTab === 'kp-statuses' && <MasterDataList title="KP statuslari" endpoint="/kp-statuses" description="Tijorat takliflarining bosqichlari." icon={ClipboardList} />}
                                        {activeSalesSubTab === 'rejection-reasons' && <MasterDataList title="Rad etish sabablari" endpoint="/rejection-reasons" description="Mijozlar nima sababdan voz kechayotganini tahlil qilish uchun." icon={Ban} />}
                                    </div>
                                </div>
                            )}

                            {/* PRODUCTION CATEGORY */}
                            {activeMasterDataTab === 'ishlab chiqarish' && (
                                <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '30px' }}>
                                    <div className="premium-card" style={{ padding: '15px', height: 'fit-content' }}>
                                        {[
                                            { id: 'product-types', label: 'Mahsulot turlari', icon: <Box size={16} /> },
                                            { id: 'prod-stages', label: 'Ishlab chiqarish bosqichlari', icon: <GitBranch size={16} /> },
                                            { id: 'operations', label: 'Operatsiyalar', icon: <Settings2 size={16} /> },
                                            { id: 'prod-order-statuses', label: 'Production order statuslari', icon: <CheckCircle2 size={16} /> },
                                            { id: 'qc-reasons', label: 'QC / brak sabablari', icon: <AlertTriangle size={16} /> }
                                        ].map(item => (
                                            <div key={item.id} onClick={() => setActiveProdSubTab(item.id)} style={sideMenuItemStyle(activeProdSubTab === item.id)}>
                                                {item.icon} {item.label}
                                            </div>
                                        ))}
                                    </div>
                                    <div>
                                        {activeProdSubTab === 'product-types' && <MasterDataList title="Mahsulot turlari" endpoint="/product-types" description="Ishlab chiqariladigan mahsulotlar kategoriyalari (Masalan: Oshxona mebeli, Yumshoq mebel)." icon={Box} />}
                                        {activeProdSubTab === 'prod-stages' && <MasterDataList title="Ishlab chiqarish bosqichlari" endpoint="/prod-stages" description="Ishlab chiqarishning asosiy bosqichlari." icon={GitBranch} />}
                                        {activeProdSubTab === 'operations' && <MasterDataList title="Operatsiyalar" endpoint="/operations" description="Har bir bosqichdagi aniq ish amallari (Masalan: Kesish, Kromka, Teshish)." icon={Settings2} />}
                                        {activeProdSubTab === 'prod-order-statuses' && <MasterDataList title="Production order statuslari" endpoint="/prod-order-statuses" description="Ishlab chiqarish buyurtmalari holatlari." icon={CheckCircle2} />}
                                        {activeProdSubTab === 'qc-reasons' && <MasterDataList title="QC / brak sabablari" endpoint="/qc-reasons" description="Sifat nazoratidan o'tmagan mahsulotlar sabablari." icon={AlertTriangle} />}
                                    </div>
                                </div>
                            )}

                            {/* WAREHOUSE CATEGORY */}
                            {activeMasterDataTab === 'ombor' && (
                                <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '30px' }}>
                                    <div className="premium-card" style={{ padding: '15px', height: 'fit-content' }}>
                                        {[
                                            { id: 'warehouses', label: 'Omborlar', icon: <Database size={16} /> },
                                            { id: 'warehouse-types', label: 'Ombor turlari', icon: <Layers size={16} /> },
                                            { id: 'material-groups', label: 'Material guruhlari', icon: <Bookmark size={16} /> },
                                            { id: 'materials', label: 'Materiallar', icon: <Boxes size={16} /> },
                                            { id: 'units', label: 'O‘lchov birliklari', icon: <Ruler size={16} /> },
                                            { id: 'wh-op-types', label: 'Ombor operatsiya turlari', icon: <ArrowRightLeft size={16} /> }
                                        ].map(item => (
                                            <div key={item.id} onClick={() => setActiveWarehouseSubTab(item.id)} style={sideMenuItemStyle(activeWarehouseSubTab === item.id)}>
                                                {item.icon} {item.label}
                                            </div>
                                        ))}
                                    </div>
                                    <div>
                                        {activeWarehouseSubTab === 'warehouses' && <WarehousesSettings />}
                                        {activeWarehouseSubTab === 'warehouse-types' && <MasterDataList title="Ombor turlari" endpoint="/warehouse-types" description="Omborlarni guruhlash uchun turlar (Masalan: Xom ashyo, Ishlab chiqarish)." icon={Layers} />}
                                        {activeWarehouseSubTab === 'material-groups' && <MasterDataList title="Material guruhlari" endpoint="/material-groups" description="Materiallarni guruhlash uchun (Masalan: DSP, Furnitura, Bo'yoq)." icon={Bookmark} />}
                                        {activeWarehouseSubTab === 'materials' && <MasterDataList title="Materiallar" endpoint="/materials" description="Barcha xom-ashyo va materiallar ro'yxati." icon={Boxes} />}
                                        {activeWarehouseSubTab === 'units' && <MasterDataList title="O‘lchov birliklari" endpoint="/units" description="Soni, kg, metr, kv.m va h.k." icon={Ruler} />}
                                        {activeWarehouseSubTab === 'wh-op-types' && <MasterDataList title="Ombor operatsiya turlari" endpoint="/wh-op-types" description="Kirim, chiqim, ichki ko'chirish va h.k." icon={ArrowRightLeft} />}
                                    </div>
                                </div>
                            )}

                            {/* PURCHASE CATEGORY */}
                            {activeMasterDataTab === 'xarid' && (
                                <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '30px' }}>
                                    <div className="premium-card" style={{ padding: '15px', height: 'fit-content' }}>
                                        {[
                                            { id: 'supplier-types', label: 'Yetkazib beruvchi turlari', icon: <UserCheck size={16} /> },
                                            { id: 'purchase-cats', label: 'Xarid kategoriyalari', icon: <FolderTree size={16} /> },
                                            { id: 'pr-statuses', label: 'Purchase request statuslari', icon: <FileQuestion size={16} /> },
                                            { id: 'po-statuses', label: 'Purchase order statuslari', icon: <FileCheck size={16} /> },
                                            { id: 'delivery-terms', label: 'Yetkazib berish shartlari', icon: <Truck size={16} /> }
                                        ].map(item => (
                                            <div key={item.id} onClick={() => setActivePurchaseSubTab(item.id)} style={sideMenuItemStyle(activePurchaseSubTab === item.id)}>
                                                {item.icon} {item.label}
                                            </div>
                                        ))}
                                    </div>
                                    <div>
                                        {activePurchaseSubTab === 'supplier-types' && <MasterDataList title="Yetkazib beruvchi turlari" endpoint="/supplier-types" description="Yetkazib beruvchilar toifalari." icon={UserCheck} />}
                                        {activePurchaseSubTab === 'purchase-cats' && <MasterDataList title="Xarid kategoriyalari" endpoint="/purchase-cats" description="Xarid qilinadigan tovar va xizmatlar turlari." icon={FolderTree} />}
                                        {activePurchaseSubTab === 'pr-statuses' && <MasterDataList title="Purchase request statuslari" endpoint="/pr-statuses" description="Xarid so'rovlari holatlari." icon={FileQuestion} />}
                                        {activePurchaseSubTab === 'po-statuses' && <MasterDataList title="Purchase order statuslari" endpoint="/po-statuses" description="Xarid buyurtmalari holatlari." icon={FileCheck} />}
                                        {activePurchaseSubTab === 'delivery-terms' && <MasterDataList title="Yetkazib berish shartlari" endpoint="/delivery-terms" description="Incoterms yoki boshqa yetkazib berish shartlari." icon={Truck} />}
                                    </div>
                                </div>
                            )}

                            {/* FINANCE CATEGORY */}
                            {activeMasterDataTab === 'moliya' && (
                                <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '30px' }}>
                                    <div className="premium-card" style={{ padding: '15px', height: 'fit-content' }}>
                                        {[
                                            { id: 'cf-items', label: 'Pul oqimi moddalari', icon: <ArrowRightLeft size={16} /> },
                                            { id: 'exp-items', label: 'Xarajat moddalari', icon: <Tag size={16} /> },
                                            { id: 'cost-centers', label: 'Xarajat markazlari / CFO', icon: <Building2 size={16} /> },
                                            { id: 'pnl-cats', label: 'P&L kategoriyalari', icon: <BarChart3 size={16} /> },
                                            { id: 'bank-accounts', label: 'Bank va kassalar', icon: <Wallet size={16} /> },
                                            { id: 'payment-terms', label: 'To‘lov shartlari', icon: <ClipboardList size={16} /> },
                                            { id: 'currencies', label: 'Valyutalar', icon: <Bookmark size={16} /> },
                                            { id: 'tax-types', label: 'Soliq turlari', icon: <Settings2 size={16} /> }
                                        ].map(item => (
                                            <div key={item.id} onClick={() => setActiveFinanceSubTab(item.id)} style={sideMenuItemStyle(activeFinanceSubTab === item.id)}>
                                                {item.icon} {item.label}
                                            </div>
                                        ))}
                                    </div>
                                    <div>
                                        {activeFinanceSubTab === 'cf-items' && <CashFlowSettings />}
                                        {activeFinanceSubTab === 'exp-items' && <ExpenseItemsSettings />}
                                        {activeFinanceSubTab === 'cost-centers' && <CostCenters />}
                                        {activeFinanceSubTab === 'pnl-cats' && <PnLCategoriesSettings />}
                                        {activeFinanceSubTab === 'bank-accounts' && <BankAccountsSettings />}
                                        {activeFinanceSubTab === 'payment-terms' && <PaymentTermsSettings />}
                                        {activeFinanceSubTab === 'currencies' && <CurrenciesSettings />}
                                        {activeFinanceSubTab === 'tax-types' && <TaxesSettings />}
                                    </div>
                                </div>
                            )}

                            {/* ORG STRUCTURE CATEGORY */}
                            {activeMasterDataTab === 'tashkiliy tuzilma' && (
                                <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '30px' }}>
                                    <div className="premium-card" style={{ padding: '15px', height: 'fit-content' }}>
                                        {[
                                            { id: 'departments', label: 'Bo\'limlar', icon: <Users size={16} /> },
                                            { id: 'positions', label: 'Lavozimlar', icon: <Briefcase size={16} /> },
                                            { id: 'roles', label: 'Rollar va huquqlar', icon: <ShieldCheck size={16} /> }
                                        ].map(item => (
                                            <div key={item.id} onClick={() => setActiveOrgSubTab(item.id)} style={sideMenuItemStyle(activeOrgSubTab === item.id)}>
                                                {item.icon} {item.label}
                                            </div>
                                        ))}
                                    </div>
                                    <div>
                                        {activeOrgSubTab === 'departments' && <Departments />}
                                        {activeOrgSubTab === 'positions' && <PositionsSettings />}
                                        {activeOrgSubTab === 'roles' && <RolesPermissionsSettings />}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Settings;
