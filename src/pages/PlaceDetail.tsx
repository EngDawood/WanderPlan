import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTrip, Place } from '../context/TripContext';
import { Star, MapPin, Clock, Globe, Phone, Plus, Check, Loader2, Navigation, Heart } from 'lucide-react';

export default function PlaceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state, addPlace, removePlace } = useTrip();
  const [place, setPlace] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id || !window.google || !mapRef.current) return;

    const service = new window.google.maps.places.PlacesService(mapRef.current);
    
    service.getDetails(
      {
        placeId: id,
        fields: ['name', 'rating', 'formatted_phone_number', 'geometry', 'formatted_address', 'photo', 'reviews', 'opening_hours', 'website', 'price_level', 'types']
      },
      (result, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && result) {
          setPlace(result);
        }
        setLoading(false);
      }
    );

    // Check if place is in favorites
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    setIsFavorite(favorites.some((fav: any) => fav.place_id === id));
  }, [id]);

  const toggleFavorite = () => {
    if (!place || !id) return;

    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    
    if (isFavorite) {
      const newFavorites = favorites.filter((fav: any) => fav.place_id !== id);
      localStorage.setItem('favorites', JSON.stringify(newFavorites));
      setIsFavorite(false);
    } else {
      const newFavorite = {
        place_id: id,
        name: place.name || '',
        address: place.formatted_address || '',
        rating: place.rating,
        price_level: place.price_level,
        photo_url: place.photos?.[0]?.getUrl({ maxWidth: 800 }),
        lat: place.geometry?.location?.lat() || 0,
        lng: place.geometry?.location?.lng() || 0,
        category: place.types?.[0],
      };
      favorites.push(newFavorite);
      localStorage.setItem('favorites', JSON.stringify(favorites));
      setIsFavorite(true);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-white">
        <div ref={mapRef} className="hidden"></div>
        <Loader2 size={40} className="text-indigo-600 animate-spin mb-4" />
      </div>
    );
  }

  if (!place) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-white p-6 text-center">
        <div ref={mapRef} className="hidden"></div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Place not found</h2>
        <button onClick={() => navigate(-1)} className="text-indigo-600 font-medium">Go back</button>
      </div>
    );
  }

  const isSelected = state.selectedPlaces.some((p) => p.place_id === id);
  
  const togglePlace = () => {
    if (!id) return;
    
    if (isSelected) {
      removePlace(id);
    } else {
      const newPlace: Place = {
        place_id: id,
        name: place.name || '',
        address: place.formatted_address || '',
        rating: place.rating,
        price_level: place.price_level,
        photo_url: place.photos?.[0]?.getUrl({ maxWidth: 800 }),
        lat: place.geometry?.location?.lat() || 0,
        lng: place.geometry?.location?.lng() || 0,
        category: place.types?.[0],
      };
      addPlace(newPlace);
    }
  };

  const photoUrl = place.photos?.[0]?.getUrl({ maxWidth: 800 });

  return (
    <div className="flex flex-col h-full bg-white relative pb-24">
      <div ref={mapRef} className="hidden"></div>
      
      {/* Header Image */}
      <div className="h-64 bg-gray-200 relative">
        {photoUrl ? (
          <img src={photoUrl} alt={place.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
            <MapPin size={48} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30"></div>
        
        {/* Top Actions */}
        <div className="absolute top-4 right-4 z-10">
          <button 
            onClick={toggleFavorite}
            className="p-2.5 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-colors"
          >
            <Heart size={24} className={isFavorite ? "fill-pink-500 text-pink-500" : ""} />
          </button>
        </div>

        <div className="absolute bottom-4 left-4 right-4">
          <h1 className="text-2xl font-bold text-white leading-tight">{place.name}</h1>
          <div className="flex items-center mt-2 space-x-3 text-white/90">
            {place.rating && (
              <div className="flex items-center">
                <Star size={16} className="text-amber-400 fill-amber-400 mr-1" />
                <span className="font-medium">{place.rating}</span>
                <span className="text-white/70 ml-1 text-sm">({place.reviews?.length || 0})</span>
              </div>
            )}
            {place.price_level !== undefined && (
              <span className="font-medium">{'$'.repeat(place.price_level + 1)}</span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Info Items */}
        <div className="space-y-4">
          <div className="flex items-start">
            <MapPin size={20} className="text-indigo-600 mt-0.5 mr-3 shrink-0" />
            <p className="text-gray-700">{place.formatted_address}</p>
          </div>
          
          {place.opening_hours && (
            <div className="flex items-start">
              <Clock size={20} className="text-indigo-600 mt-0.5 mr-3 shrink-0" />
              <div>
                <p className={`font-medium ${place.opening_hours.isOpen() ? 'text-emerald-600' : 'text-red-500'}`}>
                  {place.opening_hours.isOpen() ? 'Open Now' : 'Closed'}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {place.opening_hours.weekday_text?.[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]}
                </p>
              </div>
            </div>
          )}

          {place.formatted_phone_number && (
            <div className="flex items-center">
              <Phone size={20} className="text-indigo-600 mr-3 shrink-0" />
              <a href={`tel:${place.formatted_phone_number}`} className="text-indigo-600 hover:underline">
                {place.formatted_phone_number}
              </a>
            </div>
          )}

          {place.website && (
            <div className="flex items-center">
              <Globe size={20} className="text-indigo-600 mr-3 shrink-0" />
              <a href={place.website} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline truncate">
                {place.website.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]}
              </a>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4 border-t border-gray-100">
          <button 
            onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${place.geometry?.location?.lat()},${place.geometry?.location?.lng()}&query_place_id=${id}`, '_blank')}
            className="flex-1 py-3 bg-gray-100 text-gray-800 rounded-xl font-medium flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <Navigation size={18} className="mr-2" />
            Directions
          </button>
        </div>

        {/* Reviews */}
        {place.reviews && place.reviews.length > 0 && (
          <div className="pt-6 border-t border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Top Reviews</h3>
            <div className="space-y-4">
              {place.reviews.slice(0, 3).map((review: any, index: number) => (
                <div key={index} className="bg-gray-50 p-4 rounded-2xl">
                  <div className="flex items-center mb-2">
                    <img src={review.profile_photo_url} alt={review.author_name} className="w-8 h-8 rounded-full mr-3" />
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{review.author_name}</p>
                      <div className="flex items-center">
                        <Star size={12} className="text-amber-400 fill-amber-400 mr-1" />
                        <span className="text-xs text-gray-500">{review.relative_time_description}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 line-clamp-3">{review.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Fixed Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 max-w-md mx-auto z-20 pb-safe">
        <button
          onClick={togglePlace}
          className={`w-full py-4 rounded-2xl text-lg font-semibold transition-all flex items-center justify-center ${
            isSelected
              ? 'bg-red-50 text-red-600 hover:bg-red-100'
              : 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700'
          }`}
        >
          {isSelected ? (
            <>
              <Check size={20} className="mr-2" /> Remove from Trip
            </>
          ) : (
            <>
              <Plus size={20} className="mr-2" /> Add to Trip
            </>
          )}
        </button>
      </div>
    </div>
  );
}
