import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, MapPin, ChevronRight, Loader2 } from 'lucide-react';

export default function History() {
  const navigate = useNavigate();
  const [itineraries, setItineraries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItineraries();
  }, []);

  const fetchItineraries = async () => {
    try {
      const response = await fetch('/api/itineraries');
      const data = await response.json();
      setItineraries(data);
    } catch (error) {
      console.error('Failed to fetch itineraries:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-white">
        <Loader2 size={40} className="text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">History</h1>
        <p className="text-gray-500 mt-2">Your past trips and generated itineraries.</p>
      </div>

      {itineraries.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 bg-white rounded-3xl p-8 text-center border border-gray-100 shadow-sm">
          <div className="bg-indigo-50 p-4 rounded-full mb-4">
            <Clock size={48} className="text-indigo-300" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">No history yet</h2>
          <p className="text-gray-500 mb-6">Your generated itineraries will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4 flex-1 overflow-y-auto pb-24">
          {itineraries.map((itinerary) => (
            <div
              key={itinerary.id}
              onClick={() => navigate(`/saved/${itinerary.id}`)}
              className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center justify-between hover:border-indigo-100 hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-center overflow-hidden flex-1">
                <div className="bg-gray-50 p-4 rounded-xl mr-4 shrink-0">
                  <MapPin size={24} className="text-gray-400" />
                </div>
                <div className="truncate">
                  <h3 className="font-bold text-gray-900 text-lg truncate">{itinerary.name}</h3>
                  <p className="text-sm text-gray-500 truncate">{itinerary.city}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {itinerary.date ? new Date(itinerary.date).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    }) : new Date(itinerary.created_at).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
              <ChevronRight size={20} className="text-gray-300 shrink-0 ml-4" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
