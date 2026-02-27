import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Search, Clock, TrendingUp } from 'lucide-react';
import usePlacesAutocomplete, { getGeocode, getLatLng } from 'use-places-autocomplete';
import { useTrip } from '../context/TripContext';

const popularDestinations = [
  { name: 'Paris, France', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=300&q=80' },
  { name: 'Tokyo, Japan', image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=300&q=80' },
  { name: 'New York, NY, USA', image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=300&q=80' },
  { name: 'Rome, Italy', image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=300&q=80' },
];

export default function CitySearch() {
  const navigate = useNavigate();
  const { setCity } = useTrip();
  const inputRef = useRef<HTMLInputElement>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  const saveRecentSearch = (city: string) => {
    const updated = [city, ...recentSearches.filter(c => c !== city)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {
      types: ['(cities)'],
    },
    debounce: 300,
  });

  useEffect(() => {
    if (ready && inputRef.current) {
      inputRef.current.focus();
    }
  }, [ready]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  const handleSelectCity = (description: string) => {
    setValue(description, false);
    clearSuggestions();
    saveRecentSearch(description);

    getGeocode({ address: description }).then((results) => {
      const { lat, lng } = getLatLng(results[0]);
      setCity(description, lat, lng);
      navigate('/preferences');
    });
  };

  const handleSelect = ({ description }: { description: string }) => () => {
    handleSelectCity(description);
  };

  return (
    <div className="flex flex-col h-full bg-white p-6 overflow-y-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Where are you going?</h2>
        <p className="text-gray-500 mt-2">Search for a city to start planning.</p>
      </div>

      <div className="relative z-20">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search size={20} className="text-gray-400" />
        </div>
        <input
          ref={inputRef}
          value={value}
          onChange={handleInput}
          disabled={!ready}
          placeholder="e.g. Paris, Tokyo, New York"
          className="w-full pl-11 pr-4 py-4 bg-gray-50 border-transparent rounded-2xl text-lg focus:bg-white focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all shadow-sm"
        />
      </div>

      {status === 'OK' && (
        <ul className="mt-4 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden divide-y divide-gray-50 z-30 relative">
          {data.map((suggestion) => {
            const {
              place_id,
              structured_formatting: { main_text, secondary_text },
            } = suggestion;

            return (
              <li
                key={place_id}
                onClick={handleSelect(suggestion)}
                className="px-4 py-4 flex items-center hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="bg-gray-100 p-2 rounded-full mr-4">
                  <MapPin size={18} className="text-gray-600" />
                </div>
                <div>
                  <strong className="text-gray-900 font-medium">{main_text}</strong>
                  <p className="text-sm text-gray-500">{secondary_text}</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {status !== 'OK' && !value && (
        <div className="mt-8 space-y-8 pb-24">
          {recentSearches.length > 0 && (
            <section>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center">
                <Clock size={16} className="mr-2" />
                Recent Searches
              </h3>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((city) => (
                  <button
                    key={city}
                    onClick={() => handleSelectCity(city)}
                    className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-100 hover:border-gray-300 transition-colors"
                  >
                    {city}
                  </button>
                ))}
              </div>
            </section>
          )}

          <section>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center">
              <TrendingUp size={16} className="mr-2" />
              Popular Destinations
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {popularDestinations.map((dest) => (
                <button
                  key={dest.name}
                  onClick={() => handleSelectCity(dest.name)}
                  className="relative h-32 rounded-2xl overflow-hidden group text-left"
                >
                  <img 
                    src={dest.image} 
                    alt={dest.name} 
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/10"></div>
                  <div className="absolute bottom-0 left-0 p-3">
                    <span className="text-white font-semibold text-sm leading-tight block">
                      {dest.name.split(',')[0]}
                    </span>
                    <span className="text-white/80 text-xs">
                      {dest.name.split(',')[1]?.trim()}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
