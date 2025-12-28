import React, { useState, useRef } from 'react';
import { Tenant, Property } from '../types';
import { Search, User, Check, DollarSign, Calendar, Phone, Mail, Clock, X, History, Camera, Edit2, Save, Trash2, AlertTriangle, Plus, Upload, Filter, StickyNote, ChevronDown } from 'lucide-react';
import { Button } from '../components/ui/Button';

interface TenantsViewProps {
  tenants: Tenant[];
  properties: Property[];
  onAddTenant: (tenant: Tenant) => void;
  onUpdateTenant: (tenant: Tenant) => void;
  onDeleteTenant: (tenantId: string) => void;
  isAddModalOpen: boolean;
  onOpenAddModal: () => void;
  onCloseAddModal: () => void;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const YEARS = [2023, 2024, 2025, 2026];

export const TenantsView: React.FC<TenantsViewProps> = ({ 
  tenants, 
  properties, 
  onAddTenant, 
  onUpdateTenant, 
  onDeleteTenant,
  isAddModalOpen,
  onOpenAddModal,
  onCloseAddModal
}) => {
  // Modal States
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // View State - Filter Logic
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());
  const [filterMonth, setFilterMonth] = useState<string>('All');

  // Edit Mode State
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Tenant>>({});
  const [isDeleteConfirm, setIsDeleteConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addFileInputRef = useRef<HTMLInputElement>(null);
  
  // Form State
  const [newTenantData, setNewTenantData] = useState({
    name: '',
    rentAmount: '',
    startDate: '',
    email: '',
    phone: '',
    photoUrl: '',
    notes: ''
  });

  // Filter Logic
  const filteredTenants = tenants.filter(tenant => 
    tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tenant.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tenant.phone?.includes(searchTerm)
  );

  const handleAddPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setNewTenantData(prev => ({ ...prev, photoUrl: reader.result as string }));
        };
        reader.readAsDataURL(file);
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTenant: Tenant = {
      id: Math.random().toString(36).substr(2, 9),
      name: newTenantData.name,
      rentAmount: parseFloat(newTenantData.rentAmount) || 0,
      startDate: newTenantData.startDate || new Date().toISOString().split('T')[0],
      email: newTenantData.email,
      phone: newTenantData.phone,
      photoUrl: newTenantData.photoUrl,
      notes: newTenantData.notes,
      payments: {}, 
      paymentHistory: [{ date: new Date().toLocaleDateString(), action: 'Tenant profile created' }]
    };
    onAddTenant(newTenant);
    onCloseAddModal();
    setNewTenantData({ name: '', rentAmount: '', startDate: '', email: '', phone: '', photoUrl: '', notes: '' });
  };

  const togglePayment = (tenant: Tenant, month: string) => {
    // Key format: YYYY-MMM (e.g., 2024-Jan)
    const paymentKey = `${filterYear}-${month}`;
    const isPaying = !tenant.payments[paymentKey];
    const timestamp = new Date().toLocaleDateString(); 
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const updatedTenant = {
        ...tenant,
        payments: {
            ...tenant.payments,
            [paymentKey]: isPaying
        },
        paymentHistory: [
            { 
              date: `${timestamp} • ${timeStr}`, 
              action: `Marked ${month} ${filterYear} as ${isPaying ? 'Paid' : 'Unpaid'}` 
            },
            ...(tenant.paymentHistory || [])
        ]
    };
    
    // If detail modal is open for this tenant, update the selected tenant state as well
    if (selectedTenant && selectedTenant.id === tenant.id) {
        setSelectedTenant(updatedTenant);
        if (isEditing) {
            setEditForm(prev => ({ ...prev, payments: updatedTenant.payments, paymentHistory: updatedTenant.paymentHistory }));
        }
    }
    
    onUpdateTenant(updatedTenant);
  };

  const openTenantDetail = (tenant: Tenant) => {
      setSelectedTenant(tenant);
      setIsEditing(false);
      setEditForm({});
      setIsDeleteConfirm(false);
  };

  const handleEnableEdit = () => {
      if (selectedTenant) {
          setEditForm({ ...selectedTenant });
          setIsEditing(true);
          setIsDeleteConfirm(false);
      }
  };

  const handleSaveEdit = () => {
      if (!selectedTenant) return;
      const updatedTenant = { 
          ...selectedTenant, 
          ...editForm,
          rentAmount: Number(editForm.rentAmount) 
      } as Tenant;
      
      onUpdateTenant(updatedTenant);
      setSelectedTenant(updatedTenant);
      setIsEditing(false);
  };

  const handleConfirmDelete = () => {
      if (selectedTenant) {
          onDeleteTenant(selectedTenant.id);
          setSelectedTenant(null);
          setIsEditing(false);
          setIsDeleteConfirm(false);
      }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              setEditForm(prev => ({ ...prev, photoUrl: reader.result as string }));
          };
          reader.readAsDataURL(file);
      }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 relative transition-colors">
       {/* Modern Header */}
       <div className="pt-8 px-6 pb-4 bg-white dark:bg-slate-950 sticky top-0 z-20 border-b border-slate-100/80 dark:border-slate-800 backdrop-blur-md bg-white/90 dark:bg-slate-950/90 transition-colors">
          <div className="flex justify-between items-center mb-6">
            <div>
               <p className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Management</p>
               <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Tenants</h1>
            </div>
            
            <button 
                onClick={onOpenAddModal} 
                className="h-12 w-12 rounded-full bg-slate-900 dark:bg-white dark:text-slate-900 text-white shadow-xl shadow-slate-900/20 dark:shadow-white/10 hover:bg-slate-800 dark:hover:bg-slate-100 transition-all active:scale-95 flex items-center justify-center group"
            >
                <Plus size={24} className="group-hover:rotate-90 transition-transform duration-300" />
            </button>
          </div>

          <div className="flex gap-2 mb-4">
               {/* Year Filter */}
                <div className="relative group flex-1">
                    <select 
                        value={filterYear} 
                        onChange={(e) => setFilterYear(Number(e.target.value))}
                        className="w-full appearance-none bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-sm font-bold py-3 pl-4 pr-8 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                        {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>

                {/* Month Filter */}
                <div className="relative group flex-1">
                    <select 
                        value={filterMonth} 
                        onChange={(e) => setFilterMonth(e.target.value)}
                        className="w-full appearance-none bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-sm font-bold py-3 pl-4 pr-8 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                        <option value="All">All Months</option>
                        {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
          </div>

          {/* Functional Search Bar */}
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors duration-300" size={20} />
            <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search name, email..." 
                className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:bg-white dark:focus:bg-slate-800 focus:border-brand-500/50 transition-all shadow-sm"
            />
          </div>
      </div>

      {/* Tenants List Grid */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-6 py-6 pb-32 space-y-5">
        {filteredTenants.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
                <div className="h-20 w-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 text-slate-300 dark:text-slate-600">
                    <Search size={32} />
                </div>
                <h3 className="text-slate-900 dark:text-white font-bold text-lg mb-1">No tenants found</h3>
                <p className="text-slate-400 dark:text-slate-500 text-sm max-w-[200px]">Try adjusting your search or add a new tenant.</p>
            </div>
        ) : (
            filteredTenants.map(tenant => (
            <div key={tenant.id} className="bg-white dark:bg-slate-900 rounded-[24px] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100 dark:border-slate-800 p-5 transition-transform active:scale-[0.99] relative overflow-hidden group">
                
                {/* Header Section */}
                <div className="flex justify-between items-start mb-6 cursor-pointer" onClick={() => openTenantDetail(tenant)}>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            {tenant.photoUrl ? (
                                <img src={tenant.photoUrl} alt={tenant.name} className="h-14 w-14 rounded-2xl object-cover shadow-md border-2 border-white dark:border-slate-800" />
                            ) : (
                                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center text-slate-400 font-bold text-xl border-2 border-white dark:border-slate-800 shadow-sm">
                                    {tenant.name.charAt(0)}
                                </div>
                            )}
                            {/* Status Indicator */}
                            <div className="absolute -bottom-1 -right-1 bg-emerald-500 h-4 w-4 rounded-full border-2 border-white dark:border-slate-900 shadow-sm ring-1 ring-white/50 dark:ring-black/50"></div>
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-white text-lg leading-tight mb-1">{tenant.name}</h3>
                            {/* Removed Unit Badge from here */}
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Rent</p>
                        <p className="font-bold text-slate-900 dark:text-white text-lg">${tenant.rentAmount}</p>
                    </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-slate-100 dark:bg-slate-800 w-full mb-4"></div>

                {/* Payments Grid - Dynamic based on Month Filter */}
                <div>
                    <div className="flex justify-between items-center mb-3">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Payment Status</p>
                        <span className="text-[10px] font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/30 px-2 py-0.5 rounded-full">{filterYear}</span>
                    </div>
                    
                    {filterMonth === 'All' ? (
                        // Grid View for All Months
                        <div className="grid grid-cols-6 gap-2">
                            {MONTHS.map(month => {
                                const paymentKey = `${filterYear}-${month}`;
                                const isPaid = tenant.payments[paymentKey];
                                return (
                                    <button 
                                        key={month}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            togglePayment(tenant, month);
                                        }}
                                        className={`relative h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                                            isPaid 
                                            ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/25 translate-y-0' 
                                            : 'bg-slate-50 dark:bg-slate-800 text-slate-300 dark:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-400 dark:hover:text-slate-500'
                                        }`}
                                    >
                                        <span className="text-[10px] font-bold">{month}</span>
                                        {isPaid && (
                                            <div className="absolute inset-0 bg-white/20 rounded-xl animate-pulse-slow"></div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    ) : (
                        // Single Month Focused View
                        <div>
                             <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    togglePayment(tenant, filterMonth);
                                }}
                                className={`w-full relative h-14 rounded-2xl flex items-center justify-between px-6 transition-all duration-300 ${
                                    tenant.payments[`${filterYear}-${filterMonth}`]
                                    ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/25' 
                                    : 'bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750'
                                }`}
                            >
                                <span className="font-bold text-base">{filterMonth} Rent</span>
                                <div className="flex items-center gap-2">
                                     <span className="font-bold text-sm uppercase tracking-wider">
                                        {tenant.payments[`${filterYear}-${filterMonth}`] ? 'Paid' : 'Unpaid'}
                                     </span>
                                     {tenant.payments[`${filterYear}-${filterMonth}`] ? <Check size={20} /> : <div className="h-5 w-5 rounded-full border-2 border-slate-300 dark:border-slate-600"></div>}
                                </div>
                            </button>
                        </div>
                    )}
                </div>
            </div>
            ))
        )}
      </div>

      {/* Tenant Detail Modal - Clean Design without "Big Channel" */}
      {selectedTenant && (
        <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center pointer-events-none">
            <div 
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm pointer-events-auto transition-opacity duration-300" 
                onClick={() => setSelectedTenant(null)} 
            />
            <div className="bg-white dark:bg-slate-950 w-full max-w-lg h-[92vh] sm:h-auto sm:max-h-[85vh] rounded-t-[32px] sm:rounded-3xl pointer-events-auto transform transition-transform duration-300 animate-slide-up shadow-2xl overflow-hidden flex flex-col relative border border-white/10 dark:border-slate-800">
                
                {/* Clean Modal Header Actions (No Dark Background) */}
                <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-20 pointer-events-none">
                    <button 
                        onClick={() => setSelectedTenant(null)}
                        className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full p-2.5 pointer-events-auto transition-colors shadow-sm"
                    >
                        <X size={20} />
                    </button>
                    
                    {!isEditing && (
                        <button 
                            onClick={handleEnableEdit}
                            className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full py-2.5 px-5 shadow-sm pointer-events-auto transition-transform active:scale-95 flex items-center gap-2 font-bold text-xs uppercase tracking-wide"
                        >
                            <Edit2 size={14} />
                            Edit
                        </button>
                    )}

                    {isEditing && (
                         <button 
                            onClick={handleSaveEdit}
                            className="bg-brand-500 text-white hover:bg-brand-600 rounded-full py-2.5 px-5 shadow-lg shadow-brand-500/30 pointer-events-auto transition-transform active:scale-95 flex items-center gap-2 font-bold text-xs uppercase tracking-wide"
                        >
                            <Save size={16} />
                            Save
                        </button>
                    )}
                </div>

                {/* Content Area - Avatar Moved Here */}
                <div className="pt-20 px-8 pb-8 flex-1 overflow-y-auto">
                    
                    {/* Avatar Section (Moved from top background) */}
                    <div className="flex justify-center mb-6">
                         {isEditing ? (
                            <div className="relative group/edit">
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    className="hidden" 
                                    accept="image/*" 
                                    onChange={handlePhotoUpload} 
                                />
                                <div 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="cursor-pointer relative overflow-hidden rounded-[2.5rem] h-28 w-28 border-4 border-white dark:border-slate-800 shadow-xl bg-white dark:bg-slate-900 ring-1 ring-slate-100 dark:ring-slate-800 transition-transform active:scale-95"
                                >
                                    {(editForm.photoUrl || selectedTenant.photoUrl) ? (
                                        <img src={editForm.photoUrl || selectedTenant.photoUrl} alt="Preview" className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="h-full w-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                                            <User size={48} className="text-slate-300 dark:text-slate-600"/>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover/edit:opacity-100 transition-opacity backdrop-blur-[2px]">
                                        <Camera className="text-white drop-shadow-md" size={32} />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="h-28 w-28 rounded-[2.5rem] border-4 border-white dark:border-slate-800 shadow-xl bg-white dark:bg-slate-900 overflow-hidden relative ring-1 ring-slate-100 dark:ring-slate-800">
                                {selectedTenant.photoUrl ? (
                                    <img src={selectedTenant.photoUrl} alt={selectedTenant.name} className="h-full w-full object-cover" />
                                ) : (
                                    <div className="h-full w-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-300 dark:text-slate-600">
                                        <User size={48} />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Name & Quick Stats */}
                    {!isEditing && (
                        <div className="text-center mb-10 animate-fade-in">
                            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight">{selectedTenant.name}</h2>
                            <div className="flex justify-center items-center text-slate-500 dark:text-slate-400 text-sm gap-3 font-medium">
                                <span className="flex items-center bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full"><Clock size={12} className="mr-1.5"/> Joined {new Date(selectedTenant.startDate || Date.now()).toLocaleDateString(undefined, {month:'short', year: 'numeric'})}</span>
                                {/* Removed Unit Badge from here */}
                            </div>
                        </div>
                    )}

                    {isEditing ? (
                        <div className="space-y-6 animate-fade-in">
                            {/* Edit Form */}
                            <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800">
                                <label className="flex items-center text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                                    <User size={14} className="mr-2" /> Personal Info
                                </label>
                                <div className="space-y-4">
                                    <div>
                                        <input 
                                            type="text" 
                                            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 rounded-2xl px-5 py-4 text-slate-900 dark:text-white font-semibold placeholder:text-slate-300 transition-all outline-none"
                                            placeholder="Full Name"
                                            value={editForm.name || ''} 
                                            onChange={e => setEditForm({...editForm, name: e.target.value})}
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 gap-4">
                                        <input 
                                            type="tel"
                                            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 rounded-2xl px-5 py-4 text-slate-900 dark:text-white font-semibold placeholder:text-slate-300 transition-all outline-none"
                                            placeholder="Phone"
                                            value={editForm.phone || ''}
                                            onChange={e => setEditForm({...editForm, phone: e.target.value})}
                                        />
                                        <input 
                                            type="email"
                                            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 rounded-2xl px-5 py-4 text-slate-900 dark:text-white font-semibold placeholder:text-slate-300 transition-all outline-none"
                                            placeholder="Email"
                                            value={editForm.email || ''}
                                            onChange={e => setEditForm({...editForm, email: e.target.value})}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800">
                                <label className="flex items-center text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                                    <DollarSign size={14} className="mr-2" /> Lease Details
                                </label>
                                <div className="grid grid-cols-2 gap-4">
                                     <div>
                                        <label className="text-[10px] text-slate-400 font-bold uppercase mb-1.5 block ml-1">Monthly Rent</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                                            <input 
                                                type="number" 
                                                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 rounded-2xl pl-9 pr-4 py-4 text-slate-900 dark:text-white font-bold transition-all outline-none"
                                                value={editForm.rentAmount} 
                                                onChange={e => setEditForm({...editForm, rentAmount: parseFloat(e.target.value)})}
                                            />
                                        </div>
                                     </div>
                                     <div>
                                        <label className="text-[10px] text-slate-400 font-bold uppercase mb-1.5 block ml-1">Start Date</label>
                                        <input 
                                            type="date" 
                                            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 rounded-2xl px-4 py-4 text-slate-900 dark:text-white font-medium transition-all outline-none text-sm"
                                            value={editForm.startDate || ''} 
                                            onChange={e => setEditForm({...editForm, startDate: e.target.value})}
                                        />
                                     </div>
                                </div>
                            </div>

                            {/* Notes Edit Section */}
                            <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800">
                                <label className="flex items-center text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                                    <StickyNote size={14} className="mr-2" /> Private Notes
                                </label>
                                <textarea
                                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 rounded-2xl px-5 py-4 text-slate-900 dark:text-white font-medium placeholder:text-slate-300 transition-all outline-none resize-none"
                                    placeholder="Add notes about this tenant (e.g., preferences, lease agreements)..."
                                    value={editForm.notes || ''}
                                    onChange={e => setEditForm({...editForm, notes: e.target.value})}
                                    rows={4}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="animate-fade-in space-y-8">
                            {/* Contact & Stats Cards */}
                            <div className="grid grid-cols-1 gap-4">
                                <div className="flex gap-4">
                                     <div className="flex-1 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
                                        <div>
                                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wide mb-1">Rent</p>
                                            <p className="text-xl font-bold text-slate-900 dark:text-white">${selectedTenant.rentAmount}</p>
                                        </div>
                                        <div className="h-10 w-10 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center">
                                            <DollarSign size={20} />
                                        </div>
                                     </div>
                                     <div className="flex-1 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
                                        <div>
                                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wide mb-1">Paid</p>
                                            {/* Count all payments for simplicity, or could filter by year */}
                                            <p className="text-xl font-bold text-slate-900 dark:text-white">{Object.values(selectedTenant.payments).filter(Boolean).length} <span className="text-sm text-slate-400 font-medium">total</span></p>
                                        </div>
                                        <div className="h-10 w-10 bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 rounded-full flex items-center justify-center">
                                            <Check size={20} />
                                        </div>
                                     </div>
                                </div>
                                
                                <div className="bg-slate-50 dark:bg-slate-900 rounded-3xl p-2 border border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm mb-2">
                                        <div className="h-10 w-10 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mr-4">
                                            <Phone size={18} />
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-400 font-bold uppercase">Mobile</p>
                                            <p className="text-sm font-bold text-slate-900 dark:text-white">{selectedTenant.phone || 'Not provided'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm">
                                        <div className="h-10 w-10 rounded-full bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center mr-4">
                                            <Mail size={18} />
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-400 font-bold uppercase">Email</p>
                                            <p className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[200px]">{selectedTenant.email || 'Not provided'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                             {/* Notes Display Section */}
                            <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 relative overflow-hidden">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center">
                                    <StickyNote size={12} className="mr-2" /> Notes
                                </h3>
                                <div className="relative z-10">
                                    {selectedTenant.notes ? (
                                        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap font-medium">
                                            {selectedTenant.notes}
                                        </p>
                                    ) : (
                                        <p className="text-sm text-slate-400 italic">No notes added yet.</p>
                                    )}
                                </div>
                                {/* Decorative elements */}
                                <div className="absolute top-0 right-0 w-20 h-20 bg-yellow-100/50 dark:bg-yellow-900/20 rounded-bl-[40px] -mr-4 -mt-4 opacity-50 pointer-events-none"></div>
                            </div>

                            {/* Payment History - Timeline Design */}
                            <div>
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5 flex items-center">
                                    <History size={12} className="mr-2" /> Recent Activity
                                </h3>
                                <div className="relative border-l-2 border-slate-100 dark:border-slate-800 ml-3 space-y-6 pb-2">
                                    {selectedTenant.paymentHistory && selectedTenant.paymentHistory.length > 0 ? (
                                        selectedTenant.paymentHistory.map((entry, index) => (
                                            <div key={index} className="relative pl-8">
                                                <div className="absolute -left-[7px] top-1.5 h-3.5 w-3.5 rounded-full bg-white dark:bg-slate-700 border-[3px] border-slate-200 dark:border-slate-600 ring-2 ring-slate-50 dark:ring-slate-900"></div>
                                                <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                                                    <p className="text-sm font-bold text-slate-900 dark:text-white mb-0.5">{entry.action}</p>
                                                    <p className="text-[11px] text-slate-400 font-semibold flex items-center gap-1.5 uppercase tracking-wide">
                                                        <Clock size={10} /> {entry.date}
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="pl-8 text-sm text-slate-400 italic">No history recorded yet.</div>
                                    )}
                                </div>
                            </div>

                            {/* Delete Actions */}
                            <div className="pt-2">
                                {isDeleteConfirm ? (
                                    <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-3xl border border-red-100 dark:border-red-900/30 animate-fade-in text-center">
                                        <div className="mx-auto w-14 h-14 bg-white dark:bg-red-900/50 rounded-full flex items-center justify-center mb-4 shadow-sm text-red-500">
                                            <AlertTriangle size={28} />
                                        </div>
                                        <h4 className="font-bold text-red-900 dark:text-red-200 text-lg mb-1">Delete Tenant?</h4>
                                        <p className="text-sm text-red-600/80 dark:text-red-400 mb-6">This action cannot be undone. All data will be lost.</p>
                                        <div className="flex gap-3">
                                            <Button 
                                                variant="ghost" 
                                                className="flex-1 bg-white dark:bg-slate-800 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30 py-3 rounded-xl"
                                                onClick={() => setIsDeleteConfirm(false)}
                                            >
                                                Cancel
                                            </Button>
                                            <Button 
                                                variant="danger" 
                                                className="flex-1 shadow-red-500/20 py-3 rounded-xl"
                                                onClick={handleConfirmDelete}
                                            >
                                                Confirm Delete
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <button 
                                        onClick={() => setIsDeleteConfirm(true)}
                                        className="w-full py-4 text-red-500 font-bold text-sm hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-colors flex items-center justify-center gap-2 border border-transparent hover:border-red-100 dark:hover:border-red-900/30"
                                    >
                                        <Trash2 size={16} />
                                        Delete Tenant
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
      )}

      {/* Add Tenant Modal - Redesigned Form with Image Upload */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center pointer-events-none">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm pointer-events-auto transition-opacity" onClick={onCloseAddModal} />
            <div className="bg-white dark:bg-slate-950 w-full max-w-lg rounded-t-[32px] sm:rounded-3xl p-8 pointer-events-auto transform transition-transform duration-300 animate-slide-up shadow-2xl max-h-[90vh] overflow-y-auto border-t border-white/10 dark:border-slate-800">
                <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-8"></div>
                
                <div className="text-center mb-8">
                     <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-1">Add New Tenant</h2>
                     <p className="text-slate-400 dark:text-slate-500 text-sm">Create a profile to track payments</p>
                </div>
                
                <form onSubmit={handleAddSubmit} className="space-y-6">
                    
                    {/* Image Upload Section */}
                    <div className="flex justify-center mb-8">
                        <div className="relative group cursor-pointer" onClick={() => addFileInputRef.current?.click()}>
                            <input 
                                type="file" 
                                ref={addFileInputRef} 
                                className="hidden" 
                                accept="image/*" 
                                onChange={handleAddPhotoUpload} 
                            />
                            <div className={`w-28 h-28 rounded-[2.5rem] border-4 border-white dark:border-slate-800 shadow-xl flex items-center justify-center overflow-hidden transition-all duration-300 ${newTenantData.photoUrl ? 'bg-white' : 'bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 hover:scale-105'}`}>
                                {newTenantData.photoUrl ? (
                                    <img src={newTenantData.photoUrl} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <Camera size={36} className="text-slate-300 dark:text-slate-600 group-hover:text-brand-500 transition-colors" />
                                )}
                            </div>
                            <div className="absolute -bottom-1 -right-1 bg-brand-500 text-white p-2.5 rounded-full border-[3px] border-white dark:border-slate-900 shadow-lg transform transition-transform group-hover:scale-110">
                                <Plus size={18} strokeWidth={3} />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {/* Name Input */}
                        <div>
                            <div className="relative">
                                <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20}/>
                                <input 
                                    required 
                                    type="text" 
                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-800 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 rounded-2xl pl-12 pr-4 py-4 text-slate-900 dark:text-white font-semibold placeholder:text-slate-400 transition-all outline-none" 
                                    placeholder="Full Name" 
                                    value={newTenantData.name} 
                                    onChange={e => setNewTenantData({...newTenantData, name: e.target.value})} 
                                />
                            </div>
                        </div>

                        {/* Financials & Dates */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <div className="relative">
                                    <DollarSign className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                                    <input 
                                        required 
                                        type="number" 
                                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-800 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 rounded-2xl pl-11 pr-4 py-4 text-slate-900 dark:text-white font-semibold placeholder:text-slate-400 transition-all outline-none" 
                                        placeholder="Rent" 
                                        value={newTenantData.rentAmount} 
                                        onChange={e => setNewTenantData({...newTenantData, rentAmount: e.target.value})} 
                                    />
                                </div>
                            </div>
                            <div>
                                <input 
                                    required 
                                    type="date" 
                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-800 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 rounded-2xl px-4 py-4 text-slate-900 dark:text-white font-semibold placeholder:text-slate-400 transition-all outline-none text-sm" 
                                    value={newTenantData.startDate} 
                                    onChange={e => setNewTenantData({...newTenantData, startDate: e.target.value})} 
                                />
                            </div>
                        </div>

                        {/* Contact Info */}
                        <div className="space-y-4 pt-2">
                             <div>
                                <div className="relative">
                                    <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                                    <input 
                                        type="tel" 
                                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-800 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 rounded-2xl pl-12 pr-4 py-4 text-slate-900 dark:text-white font-semibold placeholder:text-slate-400 transition-all outline-none" 
                                        placeholder="Phone Number (Optional)" 
                                        value={newTenantData.phone} 
                                        onChange={e => setNewTenantData({...newTenantData, phone: e.target.value})} 
                                    />
                                </div>
                            </div>
                            <div>
                                <div className="relative">
                                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                                    <input 
                                        type="email" 
                                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-800 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 rounded-2xl pl-12 pr-4 py-4 text-slate-900 dark:text-white font-semibold placeholder:text-slate-400 transition-all outline-none" 
                                        placeholder="Email Address (Optional)" 
                                        value={newTenantData.email} 
                                        onChange={e => setNewTenantData({...newTenantData, email: e.target.value})} 
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-6">
                        <Button type="button" variant="ghost" className="flex-1 py-4 h-auto text-slate-500 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl" onClick={onCloseAddModal}>Cancel</Button>
                        <Button type="submit" className="flex-[2] shadow-xl shadow-brand-500/20 py-4 h-auto text-base rounded-2xl font-bold">Create Profile</Button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};