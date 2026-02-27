import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Plus, Calendar, ChevronRight } from 'lucide-react';
import { useTrip } from '../context/TripContext';

export default function Home() {
  const navigate = useNavigate();
  const { resetTrip } = useTrip();
  const [recentItineraries, setRecentItineraries] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/itineraries')
      .then((res) => res.json())
      .then((data) => setRecentItineraries(data.slice(0, 3)))
      .catch((err) => console.error(err));
  }, []);

  const handlePlanTrip = () => {
    resetTrip();
    navigate('/search');
  };

  return (
    <div className="flex flex-col h-full bg-white p-6">
      <div className="mt-8 mb-12">
        <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
          WanderPlan
        </h1>
        <p className="text-lg text-gray-500 mt-2">
          Your personal travel itinerary generator.
        </p>
      </div>

      <button
        onClick={handlePlanTrip}
        className="w-full bg-indigo-600 text-white rounded-2xl py-4 px-6 flex items-center justify-between shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95"
      >
        <div className="flex items-center">
          <div className="bg-white/20 p-2 rounded-xl mr-4">
            <Plus size={24} className="text-white" />
          </div>
          <span className="text-lg font-semibold">Plan a New Trip</span>
        </div>
        <ChevronRight size={24} className="text-white/70" />
      </button>

      <div className="mt-12 flex-1">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Recent Trips</h2>
          {recentItineraries.length > 0 && (
            <button 
              onClick={() => navigate('/saved')}
              className="text-indigo-600 text-sm font-medium hover:underline"
            >
              See all
            </button>
          )}
        </div>

        {recentItineraries.length === 0 ? (
          <div className="bg-gray-50 rounded-2xl p-8 text-center border border-gray-100">
            <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No saved itineraries yet.</p>
            <p className="text-sm text-gray-400 mt-1">Plan a trip to see it here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentItineraries.map((itinerary) => (
              <button
                key={itinerary.id}
                onClick={() => navigate(`/saved/${itinerary.id}`)}
                className="w-full bg-white border border-gray-100 rounded-2xl p-4 flex items-center justify-between hover:border-indigo-100 hover:shadow-md transition-all text-left"
              >
                <div className="flex items-center overflow-hidden">
                  <div className="bg-indigo-50 p-3 rounded-xl mr-4 shrink-0">
                    <MapPin size={20} className="text-indigo-600" />
                  </div>
                  <div className="truncate">
                    <h3 className="font-semibold text-gray-900 truncate">{itinerary.name}</h3>
                    <p className="text-sm text-gray-500 truncate">{itinerary.city}</p>
                  </div>
                </div>
                <ChevronRight size={20} className="text-gray-300 shrink-0 ml-2" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
