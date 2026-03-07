import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTrip, Place } from '../context/TripContext';
import { Star, MapPin, Plus, Check, Loader2, Map as MapIcon, Clock, MessageSquare, LayoutGrid, List, AlignJustify } from 'lucide-react';
import { getCache, setCache } from '../utils/cache';

export default function PlacesList() {
  const navigate = useNavigate();
  const { state, addPlace, removePlace } = useTrip();
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'compact'>('list');
  const mapRef = useRef<HTMLDivElement>(null);
  const placesServiceRef = useRef<google.maps.places.PlacesService | null>(null);

  const fetchPlaces = useCallback(() => {
    if (!window.google || !mapRef.current) return;

    if (!placesServiceRef.current) {
      placesServiceRef.current = new window.google.maps.places.PlacesService(mapRef.current);
    }

    setLoading(true);
    setError(null);

    const location = new window.google.maps.LatLng(state.lat, state.lng);
    const allResults: Place[] = [];
    let completedRequests = 0;

    if (state.categories.length === 0) {
      setLoading(false);
      return;
    }

    state.categories.forEach((category) => {
      const request: google.maps.places.PlaceSearchRequest = {
        location,
        radius: 5000, // 5km radius
        type: category,
      };

      placesServiceRef.current?.nearbySearch(request, (results, status) => {
        completedRequests++;

        if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
          const formattedResults: Place[] = results.map((r) => ({
            place_id: r.place_id!,
            name: r.name!,
            address: r.vicinity || '',
            rating: r.rating,
            price_level: r.price_level,
            photo_url: r.photos?.[0]?.getUrl({ maxWidth: 400 }),
            category: category,
            lat: r.geometry?.location?.lat() || 0,
            lng: r.geometry?.location?.lng() || 0,
            open_now: r.opening_hours?.isOpen(),
            user_ratings_total: r.user_ratings_total,
          }));
          
          allResults.push(...formattedResults);
        }

        if (completedRequests === state.categories.length) {
          // Remove duplicates and sort by rating
          const uniquePlaces = Array.from(new Map(allResults.map(p => [p.place_id, p])).values());
          uniquePlaces.sort((a, b) => (b.rating || 0) - (a.rating || 0));
          
          // Fetch additional details (reviews, opening hours) for the top 10 places to avoid rate limits
          const topPlaces = uniquePlaces.slice(0, 10);
          const remainingPlaces = uniquePlaces.slice(10);
          
          let detailsFetched = 0;
          
          if (topPlaces.length === 0) {
            setPlaces(uniquePlaces);
            setLoading(false);
            return;
          }

          topPlaces.forEach((place, index) => {
            const cacheKey = `place_list_detail_${place.place_id}`;
            const cachedDetail = getCache(cacheKey);

            if (cachedDetail) {
              topPlaces[index] = {
                ...place,
                opening_hours: cachedDetail.opening_hours,
                reviews: cachedDetail.reviews
              };
              detailsFetched++;
              if (detailsFetched === topPlaces.length) {
                setPlaces([...topPlaces, ...remainingPlaces]);
                setLoading(false);
              }
              return;
            }

            placesServiceRef.current?.getDetails(
              {
                placeId: place.place_id,
                fields: ['reviews', 'opening_hours']
              },
              (detailResult, detailStatus) => {
                detailsFetched++;
                
                if (detailStatus === window.google.maps.places.PlacesServiceStatus.OK && detailResult) {
                  const detailData = {
                    opening_hours: detailResult.opening_hours?.weekday_text,
                    reviews: detailResult.reviews?.map(rev => ({
                      author_name: rev.author_name,
                      rating: rev.rating,
                      text: rev.text,
                      relative_time_description: rev.relative_time_description
                    }))
                  };
                  
                  setCache(cacheKey, detailData, 60 * 24); // Cache for 24 hours
                  
                  topPlaces[index] = {
                    ...place,
                    ...detailData
                  };
                }
                
                if (detailsFetched === topPlaces.length) {
                  setPlaces([...topPlaces, ...remainingPlaces]);
                  setLoading(false);
                }
              }
            );
          });
        }
      });
    });
  }, [state.lat, state.lng, state.categories]);

  useEffect(() => {
    if (state.lat === 0 && state.lng === 0) {
      navigate('/search');
      return;
    }

    // Wait for Google Maps API to load
    const checkGoogle = setInterval(() => {
      if (window.google) {
        clearInterval(checkGoogle);
        fetchPlaces();
      }
    }, 100);

    return () => clearInterval(checkGoogle);
  }, [state.lat, state.lng, fetchPlaces, navigate]);

  const togglePlace = (place: Place) => {
    const isSelected = state.selectedPlaces.some((p) => p.place_id === place.place_id);
    if (isSelected) {
      removePlace(place.place_id);
    } else {
      addPlace(place);
    }
  };

  const handleGenerate = () => {
    if (state.selectedPlaces.length < 3) return;
    navigate('/itinerary');
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 relative">
      <div ref={mapRef} className="hidden"></div>
      
      <div className="bg-white px-6 py-4 shadow-sm sticky top-0 z-10 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Select Places</h2>
          <p className="text-sm text-gray-500">Choose at least 3 places to visit.</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex bg-gray-100 rounded-full p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-full transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <List size={18} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-full transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <LayoutGrid size={18} />
            </button>
            <button
              onClick={() => setViewMode('compact')}
              className={`p-1.5 rounded-full transition-colors ${viewMode === 'compact' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <AlignJustify size={18} />
            </button>
          </div>
          <button
            onClick={() => navigate('/map')}
            className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
          >
            <MapIcon size={20} className="text-gray-700" />
          </button>
        </div>
      </div>

      <div className={`flex-1 overflow-y-auto p-4 pb-24 ${viewMode === 'grid' ? 'grid grid-cols-2 gap-4 content-start' : 'space-y-4'}`}>
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 col-span-full">
            <Loader2 size={40} className="text-indigo-600 animate-spin mb-4" />
            <p className="text-gray-500 font-medium">Finding the best spots in {state.city.split(',')[0]}...</p>
          </div>
        ) : error ? (
          <div className="text-center p-6 bg-red-50 rounded-2xl text-red-600 col-span-full">
            {error}
          </div>
        ) : places.length === 0 ? (
          <div className="text-center p-6 bg-gray-100 rounded-2xl text-gray-500 col-span-full">
            No places found for the selected categories. Try changing your preferences.
          </div>
        ) : (
          places.map((place) => {
            const isSelected = state.selectedPlaces.some((p) => p.place_id === place.place_id);
            
            if (viewMode === 'compact') {
              return (
                <div 
                  key={place.place_id} 
                  className={`bg-white rounded-2xl p-3 shadow-sm border-2 flex cursor-pointer transition-all relative ${
                    isSelected ? 'border-indigo-600 ring-2 ring-indigo-100' : 'border-transparent hover:border-gray-200'
                  }`}
                  onClick={() => navigate(`/place/${place.place_id}`)}
                >
                  <div className="w-20 h-20 bg-gray-200 rounded-xl relative shrink-0 overflow-hidden">
                    {place.photo_url ? (
                      <img src={place.photo_url} alt={place.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                        <MapPin size={24} />
                      </div>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePlace(place);
                      }}
                      className={`absolute top-1 right-1 p-1 rounded-full shadow-md transition-all ${
                        isSelected ? 'bg-indigo-600 text-white' : 'bg-white/90 text-gray-600 hover:bg-white'
                      }`}
                    >
                      {isSelected ? <Check size={14} /> : <Plus size={14} />}
                    </button>
                  </div>
                  <div className="ml-3 flex-1 flex flex-col justify-center">
                    <h3 className="font-bold text-gray-900 text-sm line-clamp-1">{place.name}</h3>
                    <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{place.address}</p>
                    <div className="flex items-center mt-1 space-x-2">
                      {place.rating && (
                        <div className="flex items-center text-xs">
                          <Star size={12} className="text-amber-500 fill-amber-500 mr-1" />
                          <span className="font-bold text-gray-900">{place.rating}</span>
                        </div>
                      )}
                      <span className="text-xs font-medium px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded-md uppercase tracking-wider">
                        {place.category?.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <div 
                key={place.place_id} 
                className={`bg-white rounded-2xl overflow-hidden shadow-sm border-2 transition-all cursor-pointer ${
                  viewMode === 'grid' ? 'flex flex-col' : ''
                } ${
                  isSelected ? 'border-indigo-600 ring-2 ring-indigo-100' : 'border-transparent hover:border-gray-200'
                }`}
                onClick={() => navigate(`/place/${place.place_id}`)}
              >
                <div className={`${viewMode === 'grid' ? 'h-32' : 'h-40'} bg-gray-200 relative shrink-0`}>
                  {place.photo_url ? (
                    <img src={place.photo_url} alt={place.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                      <MapPin size={32} />
                    </div>
                  )}
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePlace(place);
                    }}
                    className={`absolute top-3 right-3 p-2 rounded-full shadow-md transition-all ${
                      isSelected ? 'bg-indigo-600 text-white' : 'bg-white/90 text-gray-600 hover:bg-white'
                    }`}
                  >
                    {isSelected ? <Check size={20} /> : <Plus size={20} />}
                  </button>
                  
                  {place.rating && (
                    <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center shadow-sm">
                      <Star size={14} className="text-amber-500 fill-amber-500 mr-1" />
                      <span className="text-sm font-bold text-gray-900">{place.rating}</span>
                      {place.user_ratings_total && viewMode === 'list' && (
                        <span className="text-xs text-gray-500 ml-1">({place.user_ratings_total})</span>
                      )}
                    </div>
                  )}
                </div>
                
                <div className={`p-4 ${viewMode === 'grid' ? 'flex-1 flex flex-col' : ''}`}>
                  <h3 className={`font-bold text-gray-900 ${viewMode === 'grid' ? 'text-sm line-clamp-2' : 'text-lg line-clamp-1'}`}>{place.name}</h3>
                  <p className={`text-gray-500 mt-1 ${viewMode === 'grid' ? 'text-xs line-clamp-1' : 'text-sm line-clamp-1'}`}>{place.address}</p>
                  
                  <div className="flex items-center mt-3 space-x-2 flex-wrap gap-y-2">
                    <span className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-600 rounded-md uppercase tracking-wider">
                      {place.category?.replace('_', ' ')}
                    </span>
                    {place.price_level !== undefined && (
                      <span className="text-xs font-medium text-gray-500">
                        {'$'.repeat(place.price_level + 1)}
                      </span>
                    )}
                    {place.open_now !== undefined && viewMode === 'list' && (
                      <span className={`text-xs font-medium ${place.open_now ? 'text-emerald-600' : 'text-red-500'}`}>
                        {place.open_now ? 'Open Now' : 'Closed'}
                      </span>
                    )}
                  </div>

                  {/* Added Details: Opening Hours & Reviews (Only in list view) */}
                  {viewMode === 'list' && (place.opening_hours || (place.reviews && place.reviews.length > 0)) && (
                    <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                      {place.opening_hours && (
                        <div className="flex items-start text-sm text-gray-600">
                          <Clock size={16} className="mr-2 mt-0.5 text-indigo-500 shrink-0" />
                          <div className="line-clamp-1">
                            {place.opening_hours[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]}
                          </div>
                        </div>
                      )}
                      
                      {place.reviews && place.reviews.length > 0 && (
                        <div className="flex items-start text-sm text-gray-600 bg-gray-50 p-3 rounded-xl">
                          <MessageSquare size={16} className="mr-2 mt-0.5 text-indigo-500 shrink-0" />
                          <div>
                            <p className="line-clamp-2 italic">"{place.reviews[0].text}"</p>
                            <p className="text-xs text-gray-400 mt-1">- {place.reviews[0].author_name}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Floating Action Button */}
      <div className="absolute bottom-6 left-0 right-0 px-6 pointer-events-none">
        <button
          onClick={handleGenerate}
          disabled={state.selectedPlaces.length < 3}
          className={`w-full py-4 rounded-2xl text-lg font-semibold transition-all shadow-xl pointer-events-auto flex items-center justify-center ${
            state.selectedPlaces.length >= 3
              ? 'bg-indigo-600 text-white shadow-indigo-200 hover:bg-indigo-700 active:scale-95 translate-y-0 opacity-100'
              : 'bg-gray-800 text-white opacity-90 translate-y-0 cursor-not-allowed'
          }`}
        >
          {state.selectedPlaces.length < 3 
            ? `Select ${3 - state.selectedPlaces.length} more places` 
            : `Generate Itinerary (${state.selectedPlaces.length})`}
        </button>
      </div>
    </div>
  );
}
