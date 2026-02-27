/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { TripProvider } from './context/TripContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import CitySearch from './pages/CitySearch';
import Preferences from './pages/Preferences';
import PlacesList from './pages/PlacesList';
import PlaceDetail from './pages/PlaceDetail';
import MapScreen from './pages/MapScreen';
import GeneratedItinerary from './pages/GeneratedItinerary';
import SavedItineraries from './pages/SavedItineraries';
import SavedItineraryDetail from './pages/SavedItineraryDetail';
import Profile from './pages/Profile';
import AccountSettings from './pages/AccountSettings';
import Favorites from './pages/Favorites';
import History from './pages/History';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import { LoadScript } from '@react-google-maps/api';

const libraries: ("places" | "geometry" | "drawing" | "visualization")[] = ['places'];

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/signin" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <LoadScript googleMapsApiKey={(import.meta as any).env.VITE_GOOGLE_MAPS_API_KEY || ''} libraries={libraries}>
      <AuthProvider>
        <TripProvider>
          <Router>
            <Routes>
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                <Route index element={<Home />} />
                <Route path="search" element={<CitySearch />} />
                <Route path="preferences" element={<Preferences />} />
                <Route path="places" element={<PlacesList />} />
                <Route path="place/:id" element={<PlaceDetail />} />
                <Route path="map" element={<MapScreen />} />
                <Route path="itinerary" element={<GeneratedItinerary />} />
                <Route path="saved" element={<SavedItineraries />} />
                <Route path="saved/:id" element={<SavedItineraryDetail />} />
                <Route path="profile" element={<Profile />} />
                <Route path="settings" element={<AccountSettings />} />
                <Route path="favorites" element={<Favorites />} />
                <Route path="history" element={<History />} />
              </Route>
            </Routes>
          </Router>
        </TripProvider>
      </AuthProvider>
    </LoadScript>
  );
}
