/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { TripProvider } from './context/TripContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
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
import ForgotPassword from './pages/ForgotPassword';
import ChangePassword from './pages/ChangePassword';
import { LoadScript } from '@react-google-maps/api';

const libraries: ("places" | "geometry" | "drawing" | "visualization")[] = ['places'];

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/signin" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <LoadScript googleMapsApiKey={(import.meta as any).env.VITE_GOOGLE_MAPS_API_KEY || ''} libraries={libraries}>
      <LanguageProvider>
        <AuthProvider>
          <TripProvider>
            <Router>
              <Routes>
                <Route path="/signin" element={<SignIn />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/" element={<Layout />}>
                  <Route index element={<Home />} />
                  <Route path="search" element={<CitySearch />} />
                  <Route path="preferences" element={<Preferences />} />
                  <Route path="places" element={<PlacesList />} />
                  <Route path="place/:id" element={<PlaceDetail />} />
                  <Route path="map" element={<MapScreen />} />
                  <Route path="itinerary" element={<GeneratedItinerary />} />
                  <Route path="saved" element={<ProtectedRoute><SavedItineraries /></ProtectedRoute>} />
                  <Route path="saved/:id" element={<ProtectedRoute><SavedItineraryDetail /></ProtectedRoute>} />
                  <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                  <Route path="settings" element={<ProtectedRoute><AccountSettings /></ProtectedRoute>} />
                  <Route path="settings/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
                  <Route path="favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
                  <Route path="history" element={<ProtectedRoute><History /></ProtectedRoute>} />
                </Route>
              </Routes>
            </Router>
          </TripProvider>
        </AuthProvider>
      </LanguageProvider>
    </LoadScript>
  );
}
