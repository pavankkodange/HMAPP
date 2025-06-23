import React, { useState, useEffect } from 'react';
import { useHotel } from '../context/HotelContext';
import { useCurrency } from '../context/CurrencyContext';
import { BanquetHallManagement } from './BanquetHallManagement';
import { 
  Users, 
  Calendar, 
  Plus, 
  MapPin, 
  Clock, 
  Mail, 
  Phone,
  Search,
  Filter,
  Eye,
  DollarSign,
  X,
  Star,
  Utensils,
  Music,
  Camera,
  Receipt,
  Edit,
  Trash2,
  Check,
  CreditCard,
  Briefcase,
  Home,
  ChevronDown,
  Printer,
  Download
} from 'lucide-react';
import { BanquetHall, BanquetBooking } from '../types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface BanquetModuleProps {
  filters?: {
    dateFilter?: string;
    action?: string;
  };
}

export function BanquetModule({ filters }: BanquetModuleProps) {
  const { 
    banquetHalls, 
    banquetBookings, 
    addBanquetBooking,
    updateBanquetBooking,
    deleteBanquetBooking,
    bookings,
    guests,
    addRoomCharge
  } = useHotel();
  const { formatCurrency, hotelSettings } = useCurrency();
  
  const [view, setView] = useState<'halls' | 'bookings'>('halls');
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showChargeForm, setShowChargeForm] = useState(false);
  const [showHallManagement, setShowHallManagement] = useState(false);
  const [selectedHall, setSelectedHall] = useState<BanquetHall | null>(null);
  const [showHallDetails, setShowHallDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [bookingError, setBookingError] = useState<string>('');
  const [showInvoice, setShowInvoice] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BanquetBooking | null>(null);
  const [editingBooking, setEditingBooking] = useState<BanquetBooking | null>(null);
  const [showPaymentDropdown, setShowPaymentDropdown] = useState<string | null>(null);

  // Apply filters from dashboard navigation
  useEffect(() => {
    if (filters) {
      if (filters.dateFilter === 'today') {
        setDateFilter('today');
        setView('bookings');
      }
      if (filters.action === 'new-booking') {
        setShowBookingForm(true);
      }
    }
  }, [filters]);

  const today = new Date().toISOString().split('T')[0];

  const getStatusColor = (status: BanquetBooking['status']) => {
    switch (status) {
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status?: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-red-100 text-red-800';
    }
  };

  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case 'stage': return <Star className="w-4 h-4" />;
      case 'audio system': return <Music className="w-4 h-4" />;
      case 'catering': return <Utensils className="w-4 h-4" />;
      case 'photography': return <Camera className="w-4 h-4" />;
      default: return <span className="w-4 h-4 flex items-center justify-center text-xs">•</span>;
    }
  };

  // Check if a hall is already booked for the given date and time
  const isHallBooked = (hallId: string, date: string, startTime: string, endTime: string, excludeBookingId?: string): boolean => {
    return banquetBookings.some(booking => {
      // Skip cancelled bookings and the booking being edited
      if (booking.status === 'cancelled' || (excludeBookingId && booking.id === excludeBookingId)) return false;
      
      // Check if it's the same hall and date
      if (booking.hallId === hallId && booking.date === date) {
        // Check if time periods overlap
        const bookingStart = booking.startTime;
        const bookingEnd = booking.endTime;
        
        // Overlap occurs if:
        // - New start time is between existing booking's start and end times
        // - New end time is between existing booking's start and end times
        // - New booking completely encompasses existing booking
        if (
          (startTime >= bookingStart && startTime < bookingEnd) ||
          (endTime > bookingStart && endTime <= bookingEnd) ||
          (startTime <= bookingStart && endTime >= bookingEnd)
        ) {
          return true;
        }
      }
      return false;
    });
  };

  // Filter bookings based on date filter
  const filteredBookings = dateFilter === 'today' 
    ? banquetBookings.filter(booking => booking.date === today)
    : banquetBookings;

  const handleMarkAsPaid = (bookingId: string, paymentMethod: 'cash' | 'card' | 'bank-transfer' | 'room-charge') => {
    const booking = banquetBookings.find(b => b.id === bookingId);
    if (!booking) return;

    updateBanquetBooking(bookingId, {
      paymentStatus: 'paid',
      paymentMethod: paymentMethod,
      paymentDate: new Date().toISOString().split('T')[0]
    });

    // If payment method is room-charge, add to room charges
    if (paymentMethod === 'room-charge') {
      setShowChargeForm(true);
    }

    setShowPaymentDropdown(null);
  };

  const handleDeleteBooking = (bookingId: string) => {
    if (window.confirm('Are you sure you want to delete this booking?')) {
      deleteBanquetBooking(bookingId);
    }
  };

  const ChargeForm = () => {
    const [formData, setFormData] = useState({
      bookingId: '',
      description: '',
      amount: '',
      eventName: ''
    });

    const activeBookings = bookings.filter(b => b.status === 'checked-in');

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      addRoomCharge(formData.bookingId, {
        description: formData.description,
        amount: parseFloat(formData.amount),
        currency: hotelSettings.baseCurrency,
        date: new Date().toISOString().split('T')[0],
        category: 'banquet'
      });
      
      setShowChargeForm(false);
      setFormData({ bookingId: '', description: '', amount: '', eventName: '' });
      alert('Banquet charge posted to room successfully!');
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full m-4">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold">Post Banquet Charge</h3>
            <button
              onClick={() => setShowChargeForm(false)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Guest Room</label>
              <select
                value={formData.bookingId}
                onChange={(e) => setFormData({ ...formData, bookingId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                required
              >
                <option value="">Select a room</option>
                {activeBookings.map((booking) => {
                  const guest = guests.find(g => g.id === booking.guestId);
                  const roomNumber = booking.roomId;
                  return (
                    <option key={booking.id} value={booking.id}>
                      Room {roomNumber} - {guest?.name}
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Event/Service</label>
              <select
                value={formData.eventName}
                onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select service type</option>
                <option value="banquet-hall">Banquet Hall Rental</option>
                <option value="catering">Catering Services</option>
                <option value="decoration">Event Decoration</option>
                <option value="av-equipment">A/V Equipment</option>
                <option value="photography">Photography Services</option>
                <option value="other">Other Event Services</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., Wedding Reception, Corporate Event Setup"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount ({hotelSettings.baseCurrency})
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                min="0"
                required
              />
            </div>
            
            <div className="flex space-x-4 pt-4">
              <button
                type="button"
                onClick={() => setShowChargeForm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Post Charge
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const HallDetailsModal = () => {
    if (!selectedHall) return null;

    const upcomingEvents = banquetBookings.filter(b => 
      b.hallId === selectedHall.id && new Date(b.date) >= new Date()
    ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl max-w-4xl w-full m-4 max-h-[90vh] overflow-y-auto">
          <div className="relative">
            {selectedHall.photos.length > 0 && (
              <img
                src={selectedHall.photos[0]}
                alt={selectedHall.name}
                className="w-full h-80 object-cover rounded-t-2xl"
              />
            )}
            <button
              onClick={() => {
                setShowHallDetails(false);
                setSelectedHall(null);
              }}
              className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="absolute bottom-4 left-4">
              <span className="px-4 py-2 bg-green-500 text-white rounded-full text-sm font-semibold">
                Available
              </span>
            </div>
          </div>

          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">{selectedHall.name}</h2>
                <div className="flex items-center space-x-4 mt-2">
                  <div className="flex items-center space-x-2">
                    <Users className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-600">Up to {selectedHall.capacity} guests</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-green-600">{formatCurrency(selectedHall.rate)}</p>
                <p className="text-sm text-gray-500">per hour</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Amenities & Features</h3>
                <div className="grid grid-cols-1 gap-3">
                  {selectedHall.amenities.map((amenity) => (
                    <div key={amenity} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      {getAmenityIcon(amenity)}
                      <span className="text-gray-700 font-medium">{amenity}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Perfect For</h4>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">Weddings</span>
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">Corporate Events</span>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">Conferences</span>
                    <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">Celebrations</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Upcoming Events</h3>
                {upcomingEvents.length > 0 ? (
                  <div className="space-y-3">
                    {upcomingEvents.slice(0, 3).map((event) => (
                      <div key={event.id} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-900">{event.eventName}</h4>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(event.status)}`}>
                            {event.status.replace('-', ' ')}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(event.date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4" />
                            <span>{event.startTime} - {event.endTime}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Users className="w-4 h-4" />
                            <span>{event.attendees} attendees</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {upcomingEvents.length > 3 && (
                      <p className="text-sm text-gray-500 text-center">
                        +{upcomingEvents.length - 3} more events
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No upcoming events</p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200 flex space-x-4">
              <button
                onClick={() => {
                  setShowHallDetails(false);
                  setShowBookingForm(true);
                }}
                className="flex-1 bg-indigo-600 text-white py-4 px-6 rounded-lg hover:bg-indigo-700 font-semibold text-lg transition-colors"
              >
                Book This Hall
              </button>
              <button
                onClick={() => setShowChargeForm(true)}
                className="px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition-colors"
              >
                Post Charge to Room
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const BookingForm = () => {
    const initialFormData = editingBooking ? {
      hallId: editingBooking.hallId,
      eventName: editingBooking.eventName,
      clientName: editingBooking.clientName,
      clientEmail: editingBooking.clientEmail,
      clientPhone: editingBooking.clientPhone,
      date: editingBooking.date,
      startTime: editingBooking.startTime,
      endTime: editingBooking.endTime,
      attendees: editingBooking.attendees.toString(),
      specialRequirements: editingBooking.specialRequirements || ''
    } : {
      hallId: selectedHall?.id || '',
      eventName: '',
      clientName: '',
      clientEmail: '',
      clientPhone: '',
      date: '',
      startTime: '',
      endTime: '',
      attendees: '',
      specialRequirements: ''
    };

    const [formData, setFormData] = useState(initialFormData);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const hall = banquetHalls.find(h => h.id === formData.hallId);
      
      // Check if the hall is already booked for the selected date and time
      if (isHallBooked(formData.hallId, formData.date, formData.startTime, formData.endTime, editingBooking?.id)) {
        setBookingError('This hall is already booked for the selected date and time. Please choose a different time or date.');
        return;
      }
      
      if (hall) {
        const hours = Math.ceil(
          (new Date(`1970-01-01T${formData.endTime}`).getTime() - 
           new Date(`1970-01-01T${formData.startTime}`).getTime()) / (1000 * 60 * 60)
        );
        
        const bookingData = {
          hallId: formData.hallId,
          eventName: formData.eventName,
          clientName: formData.clientName,
          clientEmail: formData.clientEmail,
          clientPhone: formData.clientPhone,
          date: formData.date,
          startTime: formData.startTime,
          endTime: formData.endTime,
          attendees: parseInt(formData.attendees),
          totalAmount: hall.rate * hours,
          currency: hotelSettings.baseCurrency,
          specialRequirements: formData.specialRequirements,
          status: 'confirmed' as const,
          paymentStatus: 'pending' as const
        };
        
        if (editingBooking) {
          updateBanquetBooking(editingBooking.id, bookingData);
        } else {
          addBanquetBooking(bookingData);
        }
        
        setShowBookingForm(false);
        setBookingError('');
        setFormData({
          hallId: '', eventName: '', clientName: '', clientEmail: '', clientPhone: '',
          date: '', startTime: '', endTime: '', attendees: '', specialRequirements: ''
        });
        setEditingBooking(null);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 max-w-2xl w-full m-4 max-h-[90vh] overflow-y-auto">
          <h3 className="text-2xl font-bold mb-6">{editingBooking ? 'Edit Banquet Booking' : 'New Banquet Booking'}</h3>
          
          {bookingError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {bookingError}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Banquet Hall</label>
                <select
                  value={formData.hallId}
                  onChange={(e) => setFormData({ ...formData, hallId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="">Select a hall</option>
                  {banquetHalls.map((hall) => (
                    <option key={hall.id} value={hall.id}>
                      {hall.name} - Capacity: {hall.capacity} ({formatCurrency(hall.rate)}/hour)
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Event Name</label>
                <input
                  type="text"
                  value={formData.eventName}
                  onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., Wedding Reception, Corporate Event"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Client Name</label>
                <input
                  type="text"
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Client Email</label>
                <input
                  type="email"
                  value={formData.clientEmail}
                  onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Client Phone</label>
                <input
                  type="tel"
                  value={formData.clientPhone}
                  onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Event Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Number of Attendees</label>
                <input
                  type="number"
                  value={formData.attendees}
                  onChange={(e) => setFormData({ ...formData, attendees: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Special Requirements</label>
                <textarea
                  value={formData.specialRequirements}
                  onChange={(e) => setFormData({ ...formData, specialRequirements: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  rows={3}
                  placeholder="Catering, decorations, A/V equipment, etc."
                />
              </div>
            </div>
            
            <div className="flex space-x-4 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowBookingForm(false);
                  setBookingError('');
                  setEditingBooking(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                {editingBooking ? 'Update Booking' : 'Create Booking'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const InvoiceModal = () => {
    if (!selectedBooking) return null;
    
    const hall = banquetHalls.find(h => h.id === selectedBooking.hallId);
    const hours = Math.ceil(
      (new Date(`1970-01-01T${selectedBooking.endTime}`).getTime() - 
       new Date(`1970-01-01T${selectedBooking.startTime}`).getTime()) / (1000 * 60 * 60)
    );
    
    const hallRental = hall ? hall.rate * hours : 0;
    const cateringCost = selectedBooking.attendees * 1500; // Assuming 1500 per person for catering
    const decorationCost = 15000; // Fixed cost for decoration
    const equipmentCost = 10000; // Fixed cost for equipment rental
    
    const subtotal = hallRental + cateringCost + decorationCost + equipmentCost;
    const gstRate = 0.18; // 18% GST
    const gstAmount = subtotal * gstRate;
    const totalAmount = subtotal + gstAmount;
    
    const invoiceRef = React.useRef<HTMLDivElement>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    
    const generatePDF = async () => {
      if (!invoiceRef.current) return;
      
      setIsGenerating(true);
      try {
        const canvas = await html2canvas(invoiceRef.current, {
          scale: 2,
          useCORS: true,
          logging: false
        });
        
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = 210;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        pdf.save(`Invoice_${selectedBooking.eventName.replace(/\s+/g, '_')}.pdf`);
      } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Failed to generate PDF. Please try again.');
      } finally {
        setIsGenerating(false);
      }
    };
    
    const printInvoice = () => {
      if (!invoiceRef.current) return;
      
      const printWindow = window.open('', '_blank');
      if (!printWindow) return;
      
      const invoiceHTML = invoiceRef.current.innerHTML;
      
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Banquet Hall Invoice</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
              .invoice-container { max-width: 800px; margin: 0 auto; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
              .text-right { text-align: right; }
              .total-row { font-weight: bold; background-color: #f9f9f9; }
              .header { display: flex; justify-content: space-between; margin-bottom: 20px; }
              .footer { margin-top: 40px; border-top: 1px solid #ddd; padding-top: 20px; }
              @media print {
                body { padding: 0; }
                button { display: none; }
              }
            </style>
          </head>
          <body>
            <div class="invoice-container">
              ${invoiceHTML}
            </div>
            <script>
              window.onload = function() { window.print(); window.close(); }
            </script>
          </body>
        </html>
      `);
      
      printWindow.document.close();
    };

    const handleMarkAsPaid = (paymentMethod: 'cash' | 'card' | 'bank-transfer' | 'room-charge') => {
      if (!selectedBooking) return;
      
      updateBanquetBooking(selectedBooking.id, {
        paymentStatus: 'paid',
        paymentMethod: paymentMethod,
        paymentDate: new Date().toISOString().split('T')[0],
        invoiceGenerated: true,
        invoiceNumber: `INV-${new Date().getFullYear()}-${selectedBooking.id.slice(-4)}`
      });
      
      setSelectedBooking({
        ...selectedBooking,
        paymentStatus: 'paid',
        paymentMethod: paymentMethod,
        paymentDate: new Date().toISOString().split('T')[0],
        invoiceGenerated: true,
        invoiceNumber: `INV-${new Date().getFullYear()}-${selectedBooking.id.slice(-4)}`
      });
      
      // If payment method is room-charge, show charge form
      if (paymentMethod === 'room-charge') {
        setShowInvoice(false);
        setShowChargeForm(true);
      }
    };
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl max-w-4xl w-full m-4 max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-900">Banquet Hall Invoice</h3>
              <div className="flex items-center space-x-3">
                <button
                  onClick={printInvoice}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  disabled={isGenerating}
                >
                  <Printer className="w-4 h-4" />
                  <span>Print</span>
                </button>
                <button
                  onClick={generatePDF}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <span>Generating...</span>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Download PDF</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowInvoice(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
          
          <div className="p-8">
            <div ref={invoiceRef} className="bg-white p-6 rounded-lg">
              {/* Invoice Header */}
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Harmony Suites</h2>
                  <p className="text-gray-600">123 Luxury Avenue</p>
                  <p className="text-gray-600">Metropolitan City, State 12345</p>
                  <p className="text-gray-600">Phone: +1 (555) 123-4567</p>
                  <p className="text-gray-600">Email: info@harmonysuite.com</p>
                  <p className="text-gray-600">GSTIN: 27AABCH1234R1Z5</p>
                </div>
                <div className="text-right">
                  <h3 className="text-xl font-bold text-gray-900">INVOICE</h3>
                  <p className="text-gray-600">
                    Invoice #: {selectedBooking.invoiceNumber || `INV-${new Date().getFullYear()}-${selectedBooking.id.slice(-4)}`}
                  </p>
                  <p className="text-gray-600">Date: {new Date().toLocaleDateString()}</p>
                  <p className="text-gray-600">Event Date: {new Date(selectedBooking.date).toLocaleDateString()}</p>
                  <div className="mt-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      selectedBooking.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                      selectedBooking.paymentStatus === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {selectedBooking.paymentStatus ? selectedBooking.paymentStatus.toUpperCase() : 'PENDING'}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Client Information */}
              <div className="mb-8 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Client Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-600">Name: <span className="font-medium text-gray-900">{selectedBooking.clientName}</span></p>
                    <p className="text-gray-600">Email: <span className="font-medium text-gray-900">{selectedBooking.clientEmail}</span></p>
                    <p className="text-gray-600">Phone: <span className="font-medium text-gray-900">{selectedBooking.clientPhone}</span></p>
                  </div>
                  <div>
                    <p className="text-gray-600">Event: <span className="font-medium text-gray-900">{selectedBooking.eventName}</span></p>
                    <p className="text-gray-600">Venue: <span className="font-medium text-gray-900">{hall?.name}</span></p>
                    <p className="text-gray-600">Time: <span className="font-medium text-gray-900">{selectedBooking.startTime} - {selectedBooking.endTime}</span></p>
                  </div>
                </div>
              </div>
              
              {/* Invoice Items */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Invoice Details</h3>
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-2 text-left text-gray-600 border border-gray-200">Description</th>
                      <th className="px-4 py-2 text-left text-gray-600 border border-gray-200">Quantity</th>
                      <th className="px-4 py-2 text-left text-gray-600 border border-gray-200">Rate</th>
                      <th className="px-4 py-2 text-left text-gray-600 border border-gray-200">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="px-4 py-2 border border-gray-200">
                        <p className="font-medium">{hall?.name} - Hall Rental</p>
                        <p className="text-sm text-gray-600">{hours} hours ({selectedBooking.startTime} - {selectedBooking.endTime})</p>
                      </td>
                      <td className="px-4 py-2 border border-gray-200">{hours}</td>
                      <td className="px-4 py-2 border border-gray-200">{formatCurrency(hall?.rate || 0)}/hour</td>
                      <td className="px-4 py-2 border border-gray-200">{formatCurrency(hallRental)}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 border border-gray-200">
                        <p className="font-medium">Catering Services</p>
                        <p className="text-sm text-gray-600">Food and beverage for {selectedBooking.attendees} guests</p>
                      </td>
                      <td className="px-4 py-2 border border-gray-200">{selectedBooking.attendees}</td>
                      <td className="px-4 py-2 border border-gray-200">{formatCurrency(1500)}/person</td>
                      <td className="px-4 py-2 border border-gray-200">{formatCurrency(cateringCost)}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 border border-gray-200">
                        <p className="font-medium">Decoration Package</p>
                        <p className="text-sm text-gray-600">Event theme and floral arrangements</p>
                      </td>
                      <td className="px-4 py-2 border border-gray-200">1</td>
                      <td className="px-4 py-2 border border-gray-200">{formatCurrency(decorationCost)}</td>
                      <td className="px-4 py-2 border border-gray-200">{formatCurrency(decorationCost)}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 border border-gray-200">
                        <p className="font-medium">Audio/Visual Equipment</p>
                        <p className="text-sm text-gray-600">Sound system, projector, and lighting</p>
                      </td>
                      <td className="px-4 py-2 border border-gray-200">1</td>
                      <td className="px-4 py-2 border border-gray-200">{formatCurrency(equipmentCost)}</td>
                      <td className="px-4 py-2 border border-gray-200">{formatCurrency(equipmentCost)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              {/* Totals */}
              <div className="mb-8">
                <div className="flex justify-end">
                  <div className="w-64">
                    <div className="flex justify-between py-2">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-medium">{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-gray-600">GST (18%):</span>
                      <span className="font-medium">{formatCurrency(gstAmount)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-t border-gray-200 font-bold">
                      <span>Total:</span>
                      <span>{formatCurrency(totalAmount)}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Payment Information */}
              <div className="mb-8 p-4 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Information</h3>
                {selectedBooking.paymentStatus === 'paid' ? (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 text-green-800">
                      <Check className="w-5 h-5" />
                      <span className="font-medium">PAID</span>
                    </div>
                    <p className="mt-2 text-green-700">
                      Payment received on {selectedBooking.paymentDate} via {selectedBooking.paymentMethod?.replace('-', ' ')}
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-600 mb-2">Payment Status: <span className="font-medium text-red-600">PENDING</span></p>
                    <p className="text-gray-600 mb-4">Please complete payment using one of the following methods:</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 border border-gray-200 rounded-lg">
                        <p className="font-medium text-gray-900">Bank Transfer</p>
                        <p className="text-sm text-gray-600">Account Name: Harmony Suites</p>
                        <p className="text-sm text-gray-600">Account Number: 1234567890</p>
                        <p className="text-sm text-gray-600">IFSC Code: HDFC0001234</p>
                      </div>
                      <div className="p-3 border border-gray-200 rounded-lg">
                        <p className="font-medium text-gray-900">Online Payment</p>
                        <p className="text-sm text-gray-600">Visit: pay.harmonysuite.com</p>
                        <p className="text-sm text-gray-600">Use Invoice #: {selectedBooking.invoiceNumber || `INV-${new Date().getFullYear()}-${selectedBooking.id.slice(-4)}`}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Terms and Conditions */}
              <div className="text-sm text-gray-600">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Terms & Conditions</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Full payment is required 7 days before the event date.</li>
                  <li>Cancellation policy: 50% refund if cancelled 14 days before event, no refund thereafter.</li>
                  <li>Additional charges may apply for overtime or extra services requested during the event.</li>
                  <li>Damage to venue or equipment will be charged separately.</li>
                </ul>
              </div>
              
              {/* Footer */}
              <div className="mt-8 pt-4 border-t border-gray-200 text-center text-gray-500 text-sm">
                <p>Thank you for choosing Harmony Suites for your event!</p>
                <p>For any queries, please contact our events team at events@harmonysuite.com</p>
              </div>
            </div>
            
            {/* Action Buttons - Outside the invoice ref */}
            {selectedBooking.paymentStatus !== 'paid' && (
              <div className="mt-6 flex justify-center">
                <div className="relative">
                  <button
                    onClick={() => setShowPaymentDropdown('invoice')}
                    className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                  >
                    <DollarSign className="w-5 h-5" />
                    <span>Mark as Paid</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  
                  {showPaymentDropdown === 'invoice' && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                      <div className="py-1">
                        <button
                          onClick={() => handleMarkAsPaid('cash')}
                          className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-left"
                        >
                          <DollarSign className="w-4 h-4" />
                          <span>Cash</span>
                        </button>
                        <button
                          onClick={() => handleMarkAsPaid('card')}
                          className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-left"
                        >
                          <CreditCard className="w-4 h-4" />
                          <span>Card</span>
                        </button>
                        <button
                          onClick={() => handleMarkAsPaid('bank-transfer')}
                          className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-left"
                        >
                          <Briefcase className="w-4 h-4" />
                          <span>Bank Transfer</span>
                        </button>
                        <button
                          onClick={() => handleMarkAsPaid('room-charge')}
                          className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-left"
                        >
                          <Home className="w-4 h-4" />
                          <span>Charge to Room</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Banquet Halls</h1>
          {dateFilter === 'today' && (
            <div className="mt-2 flex items-center space-x-2">
              <span className="text-sm text-gray-600">Showing:</span>
              <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-semibold">
                Today's Events
              </span>
              <button
                onClick={() => setDateFilter('')}
                className="text-indigo-600 hover:text-indigo-800 text-sm"
              >
                Show All
              </button>
            </div>
          )}
        </div>
        <div className="flex space-x-4">
          <button
            onClick={() => setShowHallManagement(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <Eye className="w-4 h-4" />
            <span>Manage Halls</span>
          </button>
          <button
            onClick={() => setShowChargeForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Receipt className="w-4 h-4" />
            <span>Post to Room</span>
          </button>
          <button
            onClick={() => setShowBookingForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4" />
            <span>New Booking</span>
          </button>
        </div>
      </div>

      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'halls', name: 'Halls', icon: MapPin },
              { id: 'bookings', name: 'Event Bookings', icon: Calendar }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setView(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    view === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {view === 'halls' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {banquetHalls.map((hall) => (
            <div key={hall.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="aspect-video bg-gray-200 relative">
                <img
                  src={hall.photos[0]}
                  alt={hall.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                    Available
                  </span>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">{hall.name}</h3>
                  <span className="text-lg font-semibold text-green-600">{formatCurrency(hall.rate)}/hour</span>
                </div>
                
                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Up to {hall.capacity} guests</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {hall.amenities.slice(0, 3).map((amenity) => (
                    <span key={amenity} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                      {amenity}
                    </span>
                  ))}
                  {hall.amenities.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                      +{hall.amenities.length - 3} more
                    </span>
                  )}
                </div>
                
                <button
                  onClick={() => {
                    setSelectedHall(hall);
                    setShowHallDetails(true);
                  }}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  <span>View Details</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {view === 'bookings' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Filter className="w-4 h-4" />
                <span>Filter</span>
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hall</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attendees</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBookings.map((booking) => {
                  const hall = banquetHalls.find(h => h.id === booking.hallId);
                  return (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{booking.eventName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{booking.clientName}</div>
                        <div className="text-sm text-gray-500">{booking.clientEmail}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{hall?.name}</div>
                        <div className="text-sm text-gray-500">Capacity: {hall?.capacity}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {new Date(booking.date).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          {booking.startTime} - {booking.endTime}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {booking.attendees}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                          {booking.status.replace('-', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(booking.paymentStatus)}`}>
                          {booking.paymentStatus ? booking.paymentStatus.toUpperCase() : 'PENDING'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(booking.totalAmount, booking.currency)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setSelectedBooking(booking);
                              setShowInvoice(true);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Receipt className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingBooking(booking);
                              setShowBookingForm(true);
                            }}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteBooking(booking.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          
                          {booking.paymentStatus !== 'paid' && (
                            <div className="relative">
                              <button
                                onClick={() => setShowPaymentDropdown(booking.id)}
                                className="text-green-600 hover:text-green-900"
                              >
                                <DollarSign className="w-4 h-4" />
                              </button>
                              
                              {showPaymentDropdown === booking.id && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                                  <div className="py-1">
                                    <button
                                      onClick={() => handleMarkAsPaid(booking.id, 'cash')}
                                      className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-left"
                                    >
                                      <DollarSign className="w-4 h-4" />
                                      <span>Cash</span>
                                    </button>
                                    <button
                                      onClick={() => handleMarkAsPaid(booking.id, 'card')}
                                      className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-left"
                                    >
                                      <CreditCard className="w-4 h-4" />
                                      <span>Card</span>
                                    </button>
                                    <button
                                      onClick={() => handleMarkAsPaid(booking.id, 'bank-transfer')}
                                      className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-left"
                                    >
                                      <Briefcase className="w-4 h-4" />
                                      <span>Bank Transfer</span>
                                    </button>
                                    <button
                                      onClick={() => handleMarkAsPaid(booking.id, 'room-charge')}
                                      className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-left"
                                    >
                                      <Home className="w-4 h-4" />
                                      <span>Charge to Room</span>
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showBookingForm && <BookingForm />}
      {showHallDetails && <HallDetailsModal />}
      {showChargeForm && <ChargeForm />}
      {showHallManagement && <BanquetHallManagement onClose={() => setShowHallManagement(false)} />}
      {showInvoice && <InvoiceModal />}
      
      {/* Click outside to close payment dropdown */}
      {showPaymentDropdown && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowPaymentDropdown(null)}
        ></div>
      )}
    </div>
  );
}