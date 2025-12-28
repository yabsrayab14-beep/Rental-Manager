import React, { useState } from 'react';
import { Property, PropertyStatus } from '../types';
import { MapPin, BedDouble, Bath, Plus, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { generatePropertyDescription } from '../services/geminiService';

interface PropertiesViewProps {
  properties: Property[];
  onAddProperty: (p: Property) => void;
}

export const PropertiesView: React.FC<PropertiesViewProps> = ({ properties, onAddProperty }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    rentAmount: '',
    bedrooms: '1',
    bathrooms: '1',
    description: '',
    features: '' // used for AI generation
  });

  const handleGenerateDescription = async () => {
    if (!formData.name || !formData.features) return;
    setIsGenerating(true);
    const desc = await generatePropertyDescription(
        formData.name,
        "Apartment", // Simplifying for this demo
        parseInt(formData.bedrooms),
        parseInt(formData.bathrooms),
        formData.features
    );
    setFormData(prev => ({ ...prev, description: desc }));
    setIsGenerating(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newProperty: Property = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.name,
      address: formData.address,
      rentAmount: parseFloat(formData.rentAmount),
      status: PropertyStatus.VACANT,
      bedrooms: parseInt(formData.bedrooms),
      bathrooms: parseInt(formData.bathrooms),
      description: formData.description,
      imageUrl: `https://picsum.photos/400/300?random=${Math.floor(Math.random() * 1000)}`
    };
    onAddProperty(newProperty);
    setIsModalOpen(false);
    setFormData({ name: '', address: '', rentAmount: '', bedrooms: '1', bathrooms: '1', description: '', features: '' });
  };

  return (
    <div className="p-4 pb-24">
       <header className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Properties</h1>
        <Button size="sm" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} className="mr-1"/> Add
        </Button>
      </header>

      <div className="grid gap-4">
        {properties.map(property => (
          <div key={property.id} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
            <div className="h-32 w-full bg-slate-200 relative">
                <img src={property.imageUrl} alt={property.name} className="w-full h-full object-cover" />
                <span className={`absolute top-2 right-2 px-2 py-1 text-xs font-bold rounded-full ${
                    property.status === PropertyStatus.OCCUPIED ? 'bg-emerald-100 text-emerald-700' :
                    property.status === PropertyStatus.VACANT ? 'bg-amber-100 text-amber-700' :
                    'bg-red-100 text-red-700'
                }`}>
                    {property.status}
                </span>
            </div>
            <div className="p-4">
                <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-lg text-slate-900">{property.name}</h3>
                    <span className="font-semibold text-brand-600">${property.rentAmount}/mo</span>
                </div>
                <div className="flex items-center text-slate-500 text-sm mb-3">
                    <MapPin size={14} className="mr-1" />
                    {property.address}
                </div>
                <div className="flex space-x-4 text-sm text-slate-600 mb-3">
                    <div className="flex items-center"><BedDouble size={16} className="mr-1 text-slate-400"/> {property.bedrooms} Bed</div>
                    <div className="flex items-center"><Bath size={16} className="mr-1 text-slate-400"/> {property.bathrooms} Bath</div>
                </div>
                <p className="text-xs text-slate-500 line-clamp-2">{property.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Add Property Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="bg-white w-full max-w-lg rounded-t-2xl sm:rounded-2xl p-6 animate-slide-up sm:animate-none max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-bold mb-4">Add New Property</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Property Name</label>
                        <input required type="text" className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" placeholder="e.g. Sunset Apartments 101" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                        <input required type="text" className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Rent ($)</label>
                            <input required type="number" className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" value={formData.rentAmount} onChange={e => setFormData({...formData, rentAmount: e.target.value})} />
                        </div>
                        <div className="flex gap-2">
                             <div className="flex-1">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Beds</label>
                                <input required type="number" className="w-full p-2 border border-slate-300 rounded-lg" value={formData.bedrooms} onChange={e => setFormData({...formData, bedrooms: e.target.value})} />
                             </div>
                             <div className="flex-1">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Baths</label>
                                <input required type="number" className="w-full p-2 border border-slate-300 rounded-lg" value={formData.bathrooms} onChange={e => setFormData({...formData, bathrooms: e.target.value})} />
                             </div>
                        </div>
                    </div>

                    {/* AI Section */}
                    <div className="bg-brand-50 p-4 rounded-lg border border-brand-100">
                        <div className="flex items-center justify-between mb-2">
                             <label className="block text-sm font-semibold text-brand-800">AI Description Generator</label>
                             <Sparkles size={16} className="text-brand-600" />
                        </div>
                        <input 
                            type="text" 
                            className="w-full p-2 border border-brand-200 rounded-lg text-sm mb-2" 
                            placeholder="Keywords (e.g. modern, pool, quiet)"
                            value={formData.features}
                            onChange={e => setFormData({...formData, features: e.target.value})}
                        />
                        <Button 
                            type="button" 
                            size="sm" 
                            variant="secondary" 
                            className="w-full"
                            onClick={handleGenerateDescription}
                            isLoading={isGenerating}
                            disabled={!formData.name}
                        >
                            Generate Description
                        </Button>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                        <textarea 
                            className="w-full p-2 border border-slate-300 rounded-lg h-24 text-sm" 
                            value={formData.description}
                            onChange={e => setFormData({...formData, description: e.target.value})}
                        ></textarea>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button type="button" variant="ghost" className="flex-1" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button type="submit" className="flex-1">Save Property</Button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};
