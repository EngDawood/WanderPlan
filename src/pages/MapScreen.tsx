import React, { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';
import { useTrip, Place } from '../context/TripContext';
import { Star, Navigation, Plus, Check } from 'lucide-react';

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

export default function MapScreen() {
  const navigate = useNavigate();
  const { state, addPlace, removePlace } = useTrip();
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

  const [places, setPlaces] = useState<Place[]>([]);
  const mapRef = useRef<google.maps.Map | null>(null);

  const center = {
    lat: state.lat || 0,
    lng: state.lng || 0,
  };

  const onLoad = useCallback(function callback(map: google.maps.Map) {
    mapRef.current = map;
    
    // Fetch places for the map view
    if (state.lat && state.lng && state.categories.length > 0) {
      const service = new window.google.maps.places.PlacesService(map);
      const location = new window.google.maps.LatLng(state.lat, state.lng);
      const allResults: Place[] = [];
      let completedRequests = 0;

      state.categories.forEach((category) => {
        const request: google.maps.places.PlaceSearchRequest = {
          location,
          radius: 5000,
          type: category,
        };

        service.nearbySearch(request, (results, status) => {
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
            }));
            
            allResults.push(...formattedResults);
          }

          if (completedRequests === state.categories.length) {
            const uniquePlaces = Array.from(new Map(allResults.map(p => [p.place_id, p])).values());
            uniquePlaces.sort((a, b) => (b.rating || 0) - (a.rating || 0));
            setPlaces(uniquePlaces);
            
            // Fit bounds to show all places
            if (uniquePlaces.length > 0) {
              const bounds = new window.google.maps.LatLngBounds();
              uniquePlaces.forEach((place) => {
                bounds.extend({ lat: place.lat, lng: place.lng });
              });
              map.fitBounds(bounds);
            }
          }
        });
      });
    } else if (state.selectedPlaces.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      state.selectedPlaces.forEach((place) => {
        bounds.extend({ lat: place.lat, lng: place.lng });
      });
      map.fitBounds(bounds);
    }
  }, [state.lat, state.lng, state.categories, state.selectedPlaces]);

  const togglePlace = (place: Place) => {
    const isSelected = state.selectedPlaces.some((p) => p.place_id === place.place_id);
    if (isSelected) {
      removePlace(place.place_id);
    } else {
      addPlace(place);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white relative">
      <div className="absolute top-4 left-4 right-4 z-10 bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-lg flex items-center justify-between">
        <div>
          <h2 className="font-bold text-gray-900">{state.city.split(',')[0]}</h2>
          <p className="text-sm text-gray-500">{state.selectedPlaces.length} places selected</p>
        </div>
        <button
          onClick={() => navigate('/places')}
          className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          List View
        </button>
      </div>

      <div className="flex-1 w-full h-full relative">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={13}
          onLoad={onLoad}
          options={{
            disableDefaultUI: true,
            zoomControl: true,
            styles: [
              {
                featureType: 'poi',
                elementType: 'labels',
                stylers: [{ visibility: 'off' }],
              },
            ],
          }}
        >
          {places.map((place) => {
            const isSelected = state.selectedPlaces.some(p => p.place_id === place.place_id);
            return (
              <Marker
                key={place.place_id}
                position={{ lat: place.lat, lng: place.lng }}
                onClick={() => setSelectedPlace(place)}
                icon={{
                  url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="${isSelected ? '#4f46e5' : '#9ca3af'}" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                  `),
                  scaledSize: new window.google.maps.Size(32, 32),
                  anchor: new window.google.maps.Point(16, 32),
                }}
              />
            );
          })}

          {selectedPlace && (
            <InfoWindow
              position={{ lat: selectedPlace.lat, lng: selectedPlace.lng }}
              onCloseClick={() => setSelectedPlace(null)}
              options={{ pixelOffset: new window.google.maps.Size(0, -32) }}
            >
              <div className="p-2 max-w-[200px]">
                {selectedPlace.photo_url && (
                  <img 
                    src={selectedPlace.photo_url} 
                    alt={selectedPlace.name} 
                    className="w-full h-24 object-cover rounded-lg mb-2"
                  />
                )}
                <h3 className="font-bold text-gray-900 text-sm leading-tight mb-1">{selectedPlace.name}</h3>
                
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center">
                    <Star size={12} className="text-amber-400 fill-amber-400 mr-1" />
                    <span className="text-xs font-medium">{selectedPlace.rating || 'N/A'}</span>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => togglePlace(selectedPlace)}
                      className={`p-1.5 rounded-md transition-colors ${
                        state.selectedPlaces.some(p => p.place_id === selectedPlace.place_id)
                          ? 'bg-red-50 text-red-600 hover:bg-red-100'
                          : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                      }`}
                    >
                      {state.selectedPlaces.some(p => p.place_id === selectedPlace.place_id) ? (
                        <Check size={14} />
                      ) : (
                        <Plus size={14} />
                      )}
                    </button>
                    <button
                      onClick={() => navigate(`/place/${selectedPlace.place_id}`)}
                      className="px-2 py-1.5 bg-gray-100 text-gray-700 rounded-md text-xs font-medium hover:bg-gray-200 transition-colors"
                    >
                      Details
                    </button>
                  </div>
                </div>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </div>
    </div>
  );
}
