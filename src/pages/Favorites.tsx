import React, { useEffect, useState } from 'react';
import { Heart, MapPin, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Favorites() {
  const [favorites, setFavorites] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const savedFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    setFavorites(savedFavorites);
  }, []);

  const removeFavorite = (e: React.MouseEvent, placeId: string) => {
    e.stopPropagation();
    const newFavorites = favorites.filter(fav => fav.place_id !== placeId);
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
    setFavorites(newFavorites);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 p-6 overflow-y-auto pb-24">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Favorites</h1>
        <p className="text-gray-500 mt-2">Places you love.</p>
      </div>

      {favorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 bg-white rounded-3xl p-8 text-center border border-gray-100 shadow-sm">
          <div className="bg-pink-50 p-4 rounded-full mb-4">
            <Heart size={48} className="text-pink-300" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">No favorites yet</h2>
          <p className="text-gray-500 mb-6">Tap the heart icon on places to save them here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {favorites.map((place) => (
            <div 
              key={place.place_id}
              onClick={() => navigate(`/place/${place.place_id}`)}
              className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex cursor-pointer hover:border-indigo-100 transition-colors relative"
            >
              {place.photo_url ? (
                <img 
                  src={place.photo_url} 
                  alt={place.name} 
                  className="w-24 h-24 rounded-xl object-cover shrink-0"
                />
              ) : (
                <div className="w-24 h-24 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
                  <MapPin className="text-gray-400" size={24} />
                </div>
              )}
              
              <div className="ml-4 flex-1">
                <div className="flex justify-between items-start pr-8">
                  <h3 className="font-bold text-gray-900 leading-tight line-clamp-2">{place.name}</h3>
                </div>
                
                <div className="flex items-center mt-1 space-x-2">
                  {place.rating && (
                    <div className="flex items-center text-sm">
                      <Star size={14} className="text-amber-400 fill-amber-400 mr-1" />
                      <span className="font-medium text-gray-700">{place.rating}</span>
                    </div>
                  )}
                  {place.price_level !== undefined && (
                    <span className="text-sm text-gray-500">
                      • {'$'.repeat(place.price_level + 1)}
                    </span>
                  )}
                </div>
                
                <p className="text-sm text-gray-500 mt-2 flex items-start line-clamp-2">
                  <MapPin size={14} className="mr-1 mt-0.5 shrink-0" />
                  {place.address}
                </p>
              </div>

              <button 
                onClick={(e) => removeFavorite(e, place.place_id)}
                className="absolute top-4 right-4 p-2 bg-pink-50 rounded-full text-pink-500 hover:bg-pink-100 transition-colors"
              >
                <Heart size={20} className="fill-pink-500" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
