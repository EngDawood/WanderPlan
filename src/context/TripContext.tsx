import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Place = {
  place_id: string;
  name: string;
  address: string;
  rating?: number;
  price_level?: number;
  photo_url?: string;
  category?: string;
  lat: number;
  lng: number;
  open_now?: boolean;
  description?: string;
};

export type ItineraryPlace = Place & {
  section: 'Morning' | 'Afternoon' | 'Evening';
  order_index: number;
  time_estimate: string;
  notes?: string;
};

interface TripState {
  city: string;
  lat: number;
  lng: number;
  categories: string[];
  selectedPlaces: Place[];
  generatedItinerary: ItineraryPlace[];
}

interface TripContextType {
  state: TripState;
  setCity: (city: string, lat: number, lng: number) => void;
  setCategories: (categories: string[]) => void;
  addPlace: (place: Place) => void;
  removePlace: (placeId: string) => void;
  setGeneratedItinerary: (itinerary: ItineraryPlace[]) => void;
  resetTrip: () => void;
}

const initialState: TripState = {
  city: '',
  lat: 0,
  lng: 0,
  categories: [],
  selectedPlaces: [],
  generatedItinerary: [],
};

const TripContext = createContext<TripContextType | undefined>(undefined);

export function TripProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<TripState>(initialState);

  const setCity = (city: string, lat: number, lng: number) => {
    setState((prev) => ({ ...prev, city, lat, lng }));
  };

  const setCategories = (categories: string[]) => {
    setState((prev) => ({ ...prev, categories }));
  };

  const addPlace = (place: Place) => {
    setState((prev) => {
      if (prev.selectedPlaces.some((p) => p.place_id === place.place_id)) {
        return prev;
      }
      return { ...prev, selectedPlaces: [...prev.selectedPlaces, place] };
    });
  };

  const removePlace = (placeId: string) => {
    setState((prev) => ({
      ...prev,
      selectedPlaces: prev.selectedPlaces.filter((p) => p.place_id !== placeId),
    }));
  };

  const setGeneratedItinerary = (generatedItinerary: ItineraryPlace[]) => {
    setState((prev) => ({ ...prev, generatedItinerary }));
  };

  const resetTrip = () => {
    setState(initialState);
  };

  return (
    <TripContext.Provider
      value={{
        state,
        setCity,
        setCategories,
        addPlace,
        removePlace,
        setGeneratedItinerary,
        resetTrip,
      }}
    >
      {children}
    </TripContext.Provider>
  );
}

export function useTrip() {
  const context = useContext(TripContext);
  if (context === undefined) {
    throw new Error('useTrip must be used within a TripProvider');
  }
  return context;
}
