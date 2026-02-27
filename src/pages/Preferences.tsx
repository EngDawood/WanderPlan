import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTrip } from '../context/TripContext';
import { Utensils, Coffee, Landmark, ShoppingBag, Moon, Check } from 'lucide-react';

const CATEGORIES = [
  { id: 'restaurant', label: 'Restaurants', icon: Utensils, color: 'bg-orange-100 text-orange-600' },
  { id: 'cafe', label: 'Cafes', icon: Coffee, color: 'bg-amber-100 text-amber-600' },
  { id: 'tourist_attraction', label: 'Attractions', icon: Landmark, color: 'bg-blue-100 text-blue-600' },
  { id: 'shopping_mall', label: 'Shopping', icon: ShoppingBag, color: 'bg-pink-100 text-pink-600' },
  { id: 'night_club', label: 'Nightlife', icon: Moon, color: 'bg-purple-100 text-purple-600' },
];

export default function Preferences() {
  const navigate = useNavigate();
  const { state, setCategories } = useTrip();
  const [selected, setSelected] = useState<string[]>(state.categories.length > 0 ? state.categories : ['tourist_attraction', 'restaurant']);

  const toggleCategory = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleContinue = () => {
    if (selected.length === 0) return;
    setCategories(selected);
    navigate('/places');
  };

  return (
    <div className="flex flex-col h-full bg-white p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">What do you like?</h2>
        <p className="text-gray-500 mt-2">Select the types of places you want to visit in {state.city.split(',')[0]}.</p>
      </div>

      <div className="flex-1 space-y-3">
        {CATEGORIES.map((cat) => {
          const isSelected = selected.includes(cat.id);
          const Icon = cat.icon;
          
          return (
            <button
              key={cat.id}
              onClick={() => toggleCategory(cat.id)}
              className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                isSelected 
                  ? 'border-indigo-600 bg-indigo-50/50' 
                  : 'border-gray-100 bg-white hover:border-gray-200'
              }`}
            >
              <div className="flex items-center">
                <div className={`p-3 rounded-xl mr-4 ${isSelected ? 'bg-indigo-600 text-white' : cat.color}`}>
                  <Icon size={24} />
                </div>
                <span className={`text-lg font-medium ${isSelected ? 'text-indigo-900' : 'text-gray-700'}`}>
                  {cat.label}
                </span>
              </div>
              
              <div className={`w-6 h-6 rounded-full flex items-center justify-center border ${
                isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300'
              }`}>
                {isSelected && <Check size={14} className="text-white" />}
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-8 pt-4 border-t border-gray-100">
        <button
          onClick={handleContinue}
          disabled={selected.length === 0}
          className={`w-full py-4 rounded-2xl text-lg font-semibold transition-all shadow-lg ${
            selected.length > 0
              ? 'bg-indigo-600 text-white shadow-indigo-200 hover:bg-indigo-700 active:scale-95'
              : 'bg-gray-100 text-gray-400 shadow-none cursor-not-allowed'
          }`}
        >
          Find Places
        </button>
      </div>
    </div>
  );
}
