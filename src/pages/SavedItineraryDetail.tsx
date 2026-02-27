import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, MapPin, Loader2, Navigation, Share2, ArrowLeft, Calendar, Download, FileText, MessageSquare } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as ics from 'ics';

export default function SavedItineraryDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [itinerary, setItinerary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [notesText, setNotesText] = useState('');

  useEffect(() => {
    const fetchItinerary = async () => {
      try {
        const response = await fetch(`/api/itineraries/${id}`);
        if (!response.ok) throw new Error('Itinerary not found');
        const data = await response.json();
        setItinerary(data);
      } catch (err) {
        console.error(err);
        setError('Could not load the itinerary.');
      } finally {
        setLoading(false);
      }
    };

    fetchItinerary();
  }, [id]);

  const saveNotes = async (placeId: string, dbId: string) => {
    try {
      const response = await fetch(`/api/places/${dbId}/notes`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notes: notesText }),
      });

      if (!response.ok) throw new Error('Failed to save notes');

      const newItinerary = {
        ...itinerary,
        places: itinerary.places.map((p: any) => 
          p.place_id === placeId ? { ...p, notes: notesText } : p
        )
      };
      setItinerary(newItinerary);
      setEditingNotesId(null);
    } catch (err) {
      console.error(err);
      alert('Failed to save notes. Please try again.');
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(20);
    doc.text(itinerary.name, 14, 22);
    
    // Subtitle
    doc.setFontSize(12);
    doc.setTextColor(100);
    const dateStr = itinerary.date ? ` - ${new Date(itinerary.date).toLocaleDateString()}` : '';
    doc.text(`${itinerary.city.split(',')[0]}${dateStr}`, 14, 30);
    
    let yPos = 40;
    
    const sections = ['Morning', 'Afternoon', 'Evening'] as const;
    
    sections.forEach(section => {
      const sectionPlaces = itinerary.places
        .filter((p: any) => p.section === section)
        .sort((a: any, b: any) => a.order_index - b.order_index);
        
      if (sectionPlaces.length === 0) return;
      
      // Section Header
      doc.setFontSize(14);
      doc.setTextColor(0);
      doc.text(section, 14, yPos);
      yPos += 10;
      
      const tableData = sectionPlaces.map((place: any) => [
        place.time_estimate,
        place.name,
        place.address,
        place.notes || ''
      ]);
      
      (doc as any).autoTable({
        startY: yPos,
        head: [['Time', 'Place', 'Address', 'Notes']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [79, 70, 229] }, // Indigo-600
        margin: { top: 10, right: 14, bottom: 10, left: 14 },
      });
      
      yPos = (doc as any).lastAutoTable.finalY + 15;
    });
    
    doc.save(`${itinerary.name.replace(/\s+/g, '_')}_Itinerary.pdf`);
    setShowExportMenu(false);
  };

  const exportToICal = () => {
    if (!itinerary.date) {
      alert('Please set a date for this itinerary to export to calendar.');
      return;
    }

    const events: ics.EventAttributes[] = [];
    const baseDate = new Date(itinerary.date);
    const year = baseDate.getFullYear();
    const month = baseDate.getMonth() + 1;
    const day = baseDate.getDate();

    itinerary.places.forEach((place: any) => {
      // Parse time estimate (e.g., "09:00 AM - 11:00 AM")
      let startHour = 9;
      let startMin = 0;
      let durationHours = 2;
      
      try {
        const timeMatch = place.time_estimate.match(/(\d+):(\d+)\s*(AM|PM)/i);
        if (timeMatch) {
          let h = parseInt(timeMatch[1], 10);
          const m = parseInt(timeMatch[2], 10);
          const ampm = timeMatch[3].toUpperCase();
          
          if (ampm === 'PM' && h < 12) h += 12;
          if (ampm === 'AM' && h === 12) h = 0;
          
          startHour = h;
          startMin = m;
        }
      } catch (e) {
        console.error("Failed to parse time:", place.time_estimate);
      }

      events.push({
        title: place.name,
        description: `${place.notes ? place.notes + '\n\n' : ''}Address: ${place.address}\nLink: https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lng}&query_place_id=${place.place_id}`,
        location: place.address,
        start: [year, month, day, startHour, startMin],
        duration: { hours: durationHours, minutes: 0 },
        url: `https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lng}&query_place_id=${place.place_id}`,
      });
    });

    ics.createEvents(events, (error, value) => {
      if (error) {
        console.error(error);
        alert('Failed to generate calendar file.');
        return;
      }
      
      const blob = new Blob([value], { type: 'text/calendar;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${itinerary.name.replace(/\s+/g, '_')}.ics`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
    
    setShowExportMenu(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-white">
        <Loader2 size={40} className="text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (error || !itinerary) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-white p-6 text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Oops!</h2>
        <p className="text-gray-500 mb-6">{error || 'Itinerary not found'}</p>
        <button
          onClick={() => navigate('/saved')}
          className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium"
        >
          Go back to saved trips
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
            <h1 className="text-2xl font-bold text-gray-900">{itinerary.name}</h1>
            <div className="flex items-center mt-2 space-x-4">
              <p className="text-gray-500 flex items-center text-sm">
                <MapPin size={16} className="mr-1" />
                {itinerary.city.split(',')[0]}
              </p>
              {itinerary.date && (
                <p className="text-indigo-600 flex items-center text-sm font-medium bg-indigo-50 px-2 py-1 rounded-md">
                  <Calendar size={14} className="mr-1" />
                  {new Date(itinerary.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                </p>
              )}
            </div>
          </div>
          <div className="relative">
            <button 
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="p-2 bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-100 transition-colors"
            >
              <Download size={20} />
            </button>
            
            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                <button 
                  onClick={exportToPDF}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                >
                  <FileText size={16} className="mr-2 text-gray-400" />
                  Export as PDF
                </button>
                <button 
                  onClick={exportToICal}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                >
                  <Calendar size={16} className="mr-2 text-gray-400" />
                  Export to Calendar (iCal)
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-8" onClick={() => setShowExportMenu(false)}>
        {sections.map((section) => {
          const sectionPlaces = itinerary.places
            .filter((p: any) => p.section === section)
            .sort((a: any, b: any) => a.order_index - b.order_index);

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
                {sectionPlaces.map((place: any) => (
                  <div key={place.id} className="relative">
                    <div className="absolute -left-[27px] top-6 w-4 h-4 rounded-full bg-white border-4 border-indigo-600"></div>
                    
                    <div className="bg-white rounded-2xl p-4 shadow-sm ml-4 border border-gray-100 hover:border-indigo-100 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center text-indigo-600 font-medium text-sm bg-indigo-50 px-2 py-1 rounded-md">
                          <Clock size={14} className="mr-1.5" />
                          {place.time_estimate}
                        </div>
                        <button 
                          onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lng}&query_place_id=${place.place_id}`, '_blank')}
                          className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        >
                          <Navigation size={18} />
                        </button>
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
                                onClick={() => saveNotes(place.place_id, place.id)}
                                className="px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
                              >
                                Save Notes
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col">
                            {place.notes ? (
                              <div className="bg-amber-50 p-3 rounded-xl border border-amber-100 relative group">
                                <p className="text-sm text-amber-900 whitespace-pre-wrap pr-8">{place.notes}</p>
                                <button
                                  onClick={() => {
                                    setNotesText(place.notes || '');
                                    setEditingNotesId(place.place_id);
                                  }}
                                  className="absolute top-2 right-2 p-1.5 text-amber-600 hover:bg-amber-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                >
                                  <MessageSquare size={16} />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => {
                                  setNotesText('');
                                  setEditingNotesId(place.place_id);
                                }}
                                className="flex items-center text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                              >
                                <MessageSquare size={16} className="mr-1.5" />
                                Add notes
                              </button>
                            )}
                          </div>
                        )}
                      </div>
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
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: itinerary.name,
                text: `Check out my itinerary for ${itinerary.city}!`,
                url: window.location.href,
              });
            } else {
              alert('Sharing is not supported on this browser.');
            }
          }}
          className="flex-1 py-4 bg-indigo-50 text-indigo-600 rounded-2xl font-semibold flex items-center justify-center hover:bg-indigo-100 transition-colors"
        >
          <Share2 size={20} className="mr-2" />
          Share
        </button>
      </div>
    </div>
  );
}
