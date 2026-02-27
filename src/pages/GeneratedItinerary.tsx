import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTrip, ItineraryPlace } from '../context/TripContext';
import { Clock, MapPin, Loader2, Save, Share2, Edit3, Navigation, Calendar, ArrowUp, ArrowDown, MessageSquare } from 'lucide-react';

export default function GeneratedItinerary() {
  const navigate = useNavigate();
  const { state, setGeneratedItinerary } = useTrip();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [date, setDate] = useState<string>('');
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [notesText, setNotesText] = useState<string>('');

  useEffect(() => {
    if (state.selectedPlaces.length < 3) {
      navigate('/places');
      return;
    }

    if (state.generatedItinerary.length > 0) {
      setLoading(false);
      return;
    }

    const generatePlan = async () => {
      try {
        const response = await fetch('/api/generate-itinerary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            city: state.city,
            categories: state.categories,
            places: state.selectedPlaces,
          }),
        });

        if (!response.ok) throw new Error('Failed to generate itinerary');

        const data = await response.json();
        setGeneratedItinerary(data);
      } catch (err) {
        console.error(err);
        setError('Could not generate your itinerary. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    generatePlan();
  }, [state.selectedPlaces, state.city, state.categories, state.generatedItinerary, navigate, setGeneratedItinerary]);

  const handleSave = async () => {
    const name = prompt('Name your trip:', `Trip to ${state.city.split(',')[0]}`);
    if (!name) return;

    setSaving(true);
    try {
      const response = await fetch('/api/itineraries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          city: state.city,
          date,
          places: state.generatedItinerary,
        }),
      });

      if (!response.ok) throw new Error('Failed to save itinerary');
      
      const data = await response.json();
      navigate(`/saved/${data.id}`);
    } catch (err) {
      console.error(err);
      alert('Failed to save itinerary.');
    } finally {
      setSaving(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Trip to ${state.city}`,
        text: `Check out my itinerary for ${state.city}!`,
        url: window.location.href,
      }).catch(console.error);
    } else {
      alert('Sharing is not supported on this browser.');
    }
  };

  const movePlace = (placeId: string, direction: 'up' | 'down') => {
    const newItinerary = [...state.generatedItinerary];
    const placeIndex = newItinerary.findIndex(p => p.place_id === placeId);
    if (placeIndex === -1) return;

    const place = newItinerary[placeIndex];
    const sectionPlaces = newItinerary.filter(p => p.section === place.section).sort((a, b) => a.order_index - b.order_index);
    const sectionIndex = sectionPlaces.findIndex(p => p.place_id === placeId);

    if (direction === 'up' && sectionIndex > 0) {
      const prevPlace = sectionPlaces[sectionIndex - 1];
      const prevIndex = newItinerary.findIndex(p => p.place_id === prevPlace.place_id);
      
      // Swap order_index
      const tempOrder = newItinerary[placeIndex].order_index;
      newItinerary[placeIndex].order_index = newItinerary[prevIndex].order_index;
      newItinerary[prevIndex].order_index = tempOrder;
    } else if (direction === 'down' && sectionIndex < sectionPlaces.length - 1) {
      const nextPlace = sectionPlaces[sectionIndex + 1];
      const nextIndex = newItinerary.findIndex(p => p.place_id === nextPlace.place_id);
      
      // Swap order_index
      const tempOrder = newItinerary[placeIndex].order_index;
      newItinerary[placeIndex].order_index = newItinerary[nextIndex].order_index;
      newItinerary[nextIndex].order_index = tempOrder;
    }

    setGeneratedItinerary(newItinerary);
  };

  const saveNotes = (placeId: string) => {
    const newItinerary = state.generatedItinerary.map(p => 
      p.place_id === placeId ? { ...p, notes: notesText } : p
    );
    setGeneratedItinerary(newItinerary);
    setEditingNotesId(null);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-white p-6 text-center">
        <Loader2 size={48} className="text-indigo-600 animate-spin mb-6" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Crafting your perfect day</h2>
        <p className="text-gray-500">Our AI is organizing your selected places into a logical itinerary...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-white p-6 text-center">
        <div className="bg-red-50 p-4 rounded-full mb-4">
          <Edit3 size={32} className="text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Oops!</h2>
        <p className="text-gray-500 mb-6">{error}</p>
        <button
          onClick={() => navigate('/places')}
          className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium"
        >
          Go back to places
        </button>
      </div>
    );
  }

  const sections = ['Morning', 'Afternoon', 'Evening'] as const;

  return (
    <div className="flex flex-col h-full bg-gray-50 relative pb-24">
      <div className="bg-white px-6 py-6 shadow-sm sticky top-0 z-10">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Your Itinerary</h1>
            <p className="text-gray-500 mt-1">{state.city.split(',')[0]}</p>
          </div>
          <button onClick={handleShare} className="p-2 bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-100 transition-colors">
            <Share2 size={20} />
          </button>
        </div>
        
        <div className="mt-4 flex items-center bg-gray-50 p-3 rounded-xl border border-gray-100">
          <Calendar size={20} className="text-indigo-600 mr-3 shrink-0" />
          <input 
            type="date" 
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="bg-transparent border-none focus:ring-0 text-gray-900 font-medium w-full p-0"
            placeholder="Select date"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-8">
        {sections.map((section) => {
          const sectionPlaces = state.generatedItinerary
            .filter((p) => p.section === section)
            .sort((a, b) => a.order_index - b.order_index);

          if (sectionPlaces.length === 0) return null;

          return (
            <div key={section} className="relative">
              <div className="sticky top-0 bg-gray-50/90 backdrop-blur-sm py-2 z-10 mb-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <span className="w-2 h-8 bg-indigo-600 rounded-full mr-3"></span>
                  {section}
                </h2>
              </div>

              <div className="space-y-4 pl-5 border-l-2 border-indigo-100 ml-1">
                {sectionPlaces.map((place, index) => (
                  <div key={place.place_id} className="relative group">
                    <div className="absolute -left-[27px] top-6 w-4 h-4 rounded-full bg-white border-4 border-indigo-600"></div>
                    
                    <div className="bg-white rounded-2xl p-4 shadow-sm ml-4 border border-gray-100 hover:border-indigo-100 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center text-indigo-600 font-medium text-sm bg-indigo-50 px-2 py-1 rounded-md">
                          <Clock size={14} className="mr-1.5" />
                          {place.time_estimate}
                        </div>
                        <div className="flex items-center space-x-1">
                          <div className="flex flex-col mr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => movePlace(place.place_id, 'up')}
                              disabled={index === 0}
                              className="p-1 text-gray-400 hover:text-indigo-600 disabled:opacity-30"
                            >
                              <ArrowUp size={14} />
                            </button>
                            <button 
                              onClick={() => movePlace(place.place_id, 'down')}
                              disabled={index === sectionPlaces.length - 1}
                              className="p-1 text-gray-400 hover:text-indigo-600 disabled:opacity-30"
                            >
                              <ArrowDown size={14} />
                            </button>
                          </div>
                          <button 
                            onClick={() => {
                              setEditingNotesId(place.place_id);
                              setNotesText(place.notes || '');
                            }}
                            className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          >
                            <MessageSquare size={18} />
                          </button>
                          <button 
                            onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lng}&query_place_id=${place.place_id}`, '_blank')}
                            className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          >
                            <Navigation size={18} />
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex mt-3">
                        {place.photo_url && (
                          <img 
                            src={place.photo_url} 
                            alt={place.name} 
                            className="w-20 h-20 rounded-xl object-cover mr-4 shrink-0"
                          />
                        )}
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 leading-tight">{place.name}</h3>
                          <p className="text-sm text-gray-500 mt-1 flex items-start line-clamp-2">
                            <MapPin size={14} className="mr-1 mt-0.5 shrink-0" />
                            {place.address}
                          </p>
                        </div>
                      </div>

                      {/* Notes Section */}
                      {(place.notes || editingNotesId === place.place_id) && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          {editingNotesId === place.place_id ? (
                            <div className="flex flex-col space-y-2">
                              <textarea
                                value={notesText}
                                onChange={(e) => setNotesText(e.target.value)}
                                placeholder="Add your notes here (e.g., 'Remember to buy tickets online')"
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-indigo-500 focus:border-indigo-500"
                                rows={3}
                              />
                              <div className="flex justify-end space-x-2">
                                <button
                                  onClick={() => setEditingNotesId(null)}
                                  className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => saveNotes(place.place_id)}
                                  className="px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
                                >
                                  Save Notes
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="bg-amber-50 p-3 rounded-xl border border-amber-100">
                              <p className="text-sm text-amber-900 whitespace-pre-wrap">{place.notes}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 max-w-md mx-auto z-20 pb-safe flex space-x-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-semibold flex items-center justify-center hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 disabled:opacity-70"
        >
          {saving ? (
            <Loader2 size={20} className="animate-spin mr-2" />
          ) : (
            <Save size={20} className="mr-2" />
          )}
          {saving ? 'Saving...' : 'Save Itinerary'}
        </button>
      </div>
    </div>
  );
}
