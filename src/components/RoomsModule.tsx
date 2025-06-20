import React, { useState, useEffect } from 'react';
import { useHotel } from '../context/HotelContext';
import { useCurrency } from '../context/CurrencyContext';
import { BillGenerator } from './BillGenerator';
import { 
  Bed, 
  Calendar, 
  Plus, 
  User, 
  Phone, 
  Mail, 
  DollarSign,
  Search,
  Filter,
  Eye,
  X,
  Wifi,
  Tv,
  Car,
  Coffee,
  CreditCard,
  Receipt,
  CheckCircle,
  Clock,
  LogOut,
  FileText,
  Cigarette,
  Ban
} from 'lucide-react';
import { Room, Guest, Booking } from '../types';

interface RoomsModuleProps {
  filters?: {
    statusFilter?: string;
    view?: string;
    dateFilter?: string;
    revenueFilter?: string;
    action?: string;
  };
}

export function RoomsModule({ filters }: RoomsModuleProps) {
  const { 
    rooms, 
    guests, 
    bookings, 
    updateRoomStatus, 
    addGuest, 
    addBooking, 
    updateBookingStatus,
    addRoomCharge 
  } = useHotel();
  const { formatCurrency, hotelSettings } = useCurrency();
  
  const [view, setView] = useState<'rooms' | 'bookings' | 'guests'>('rooms');
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showGuestForm, setShowGuestForm] = useState(false);
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [showChargeForm, setShowChargeForm] = useState(false);
  const [showBillGenerator, setShowBillGenerator] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showRoomDetails, setShowRoomDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<string>('');

  // Apply filters from dashboard navigation
  useEffect(() => {
    if (filters) {
      if (filters.statusFilter) {
        setStatusFilter(filters.statusFilter);
        setView('rooms');
      }
      if (filters.view) {
        setView(filters.view as any);
      }
      if (filters.dateFilter) {
        setDateFilter(filters.dateFilter);
        setView('bookings');
      }
      if (filters.action === 'new-booking') {
        setShowBookingForm(true);
      }
      if (filters.action === 'check-in') {
        setView('bookings');
        setDateFilter('check-in-today');
      }
    }
  }, [filters]);

  const today = new Date().toISOString().split('T')[0];

  const getStatusColor = (status: Room['status']) => {
    switch (status) {
      case 'clean': return 'bg-green-100 text-green-800';
      case 'dirty': return 'bg-orange-100 text-orange-800';
      case 'occupied': return 'bg-blue-100 text-blue-800';
      case 'out-of-order': return 'bg-red-100 text-red-800';
      case 'maintenance': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getBookingStatusColor = (status: Booking['status']) => {
    switch (status) {
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'checked-in': return 'bg-green-100 text-green-800';
      case 'checked-out': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case 'wifi': return <Wifi className="w-4 h-4" />;
      case 'tv': return <Tv className="w-4 h-4" />;
      case 'parking': return <Car className="w-4 h-4" />;
      case 'mini bar': return <Coffee className="w-4 h-4" />;
      default: return <span className="w-4 h-4 flex items-center justify-center text-xs">•</span>;
    }
  };

  const getSmokingLabel = (smokingAllowed: boolean) => {
    return smokingAllowed ? 'Smoking Room' : 'Non-Smoking Room';
  };

  const getSmokingIcon = (smokingAllowed: boolean) => {
    return smokingAllowed ? (
      <Cigarette className="w-4 h-4 text-orange-600" />
    ) : (
      <Ban className="w-4 h-4 text-green-600" />
    );
  };

  const getSmokingColor = (smokingAllowed: boolean) => {
    return smokingAllowed ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800';
  };

  // Filter rooms based on status filter
  const filteredRooms = rooms.filter(room => {
    if (statusFilter) {
      if (statusFilter === 'maintenance') {
        return room.status === 'out-of-order' || room.status === 'maintenance';
      }
      return room.status === statusFilter;
    }
    return true;
  });

  // Filter bookings based on date filter
  const filteredBookings = bookings.filter(booking => {
    if (dateFilter === 'check-in-today') {
      return booking.checkIn === today;
    }
    if (dateFilter === 'check-out-today') {
      return booking.checkOut === today;
    }
    return true;
  });

  const CheckoutForm = () => {
    if (!selectedBooking) return null;

    const guest = guests.find(g => g.id === selectedBooking.guestId);
    const room = rooms.find(r => r.id === selectedBooking.roomId);
    const totalCharges = selectedBooking.charges.reduce((sum, charge) => sum + charge.amount, 0);

    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'bank'>('card');
    const [notes, setNotes] = useState('');

    const handleGenerateBill = () => {
      if (guest && room) {
        setShowCheckoutForm(false);
        setShowBillGenerator(true);
      }
    };

    const handleQuickCheckout = () => {
      updateBookingStatus(selectedBooking.id, 'checked-out');
      updateRoomStatus(selectedBooking.roomId, 'dirty');
      setShowCheckoutForm(false);
      setSelectedBooking(null);
      alert('Guest checked out successfully!');
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl max-w-2xl w-full m-4 max-h-[90vh] overflow-y-auto">
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Guest Checkout</h3>
              <button
                onClick={() => {
                  setShowCheckoutForm(false);
                  setSelectedBooking(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Guest Information */}
            <div className="bg-blue-50 rounded-xl p-6 mb-6">
              <h4 className="text-lg font-semibold text-blue-900 mb-3">Guest Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-blue-700">Guest Name</p>
                  <p className="font-semibold text-blue-900">{guest?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-blue-700">Room Number</p>
                  <p className="font-semibold text-blue-900">Room {room?.number}</p>
                </div>
                <div>
                  <p className="text-sm text-blue-700">Room Type</p>
                  <p className="font-semibold text-blue-900 capitalize">{room?.type}</p>
                </div>
                <div>
                  <p className="text-sm text-blue-700">Room Category</p>
                  <div className="flex items-center space-x-2">
                    {room && getSmokingIcon(room.smokingAllowed || false)}
                    <span className="font-semibold text-blue-900">
                      {room && getSmokingLabel(room.smokingAllowed || false)}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-blue-700">Check-in Date</p>
                  <p className="font-semibold text-blue-900">{new Date(selectedBooking.checkIn).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-blue-700">Check-out Date</p>
                  <p className="font-semibold text-blue-900">{new Date(selectedBooking.checkOut).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {/* Bill Summary */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Receipt className="w-5 h-5 mr-2" />
                Bill Summary
              </h4>
              
              <div className="space-y-3">
                {selectedBooking.charges.map((charge) => (
                  <div key={charge.id} className="flex items-center justify-between py-2 border-b border-gray-100">
                    <div>
                      <p className="font-medium text-gray-900">{charge.description}</p>
                      <p className="text-sm text-gray-500">{new Date(charge.date).toLocaleDateString()} • {charge.category}</p>
                    </div>
                    <p className="font-semibold text-gray-900">{formatCurrency(charge.amount, charge.currency)}</p>
                  </div>
                ))}
                
                <div className="flex items-center justify-between py-3 border-t-2 border-gray-200">
                  <p className="text-lg font-bold text-gray-900">Total Amount</p>
                  <p className="text-xl font-bold text-green-600">{formatCurrency(totalCharges, selectedBooking.currency)}</p>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h4>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { id: 'card', name: 'Credit Card', icon: CreditCard },
                  { id: 'cash', name: 'Cash', icon: DollarSign },
                  { id: 'bank', name: 'Bank Transfer', icon: Receipt }
                ].map((method) => {
                  const Icon = method.icon;
                  return (
                    <button
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id as any)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        paymentMethod === method.id
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="w-6 h-6 mx-auto mb-2" />
                      <p className="text-sm font-medium">{method.name}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Notes */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Checkout Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                rows={3}
                placeholder="Any special notes or feedback..."
              />
            </div>

            {/* Actions */}
            <div className="flex space-x-4">
              <button
                onClick={() => {
                  setShowCheckoutForm(false);
                  setSelectedBooking(null);
                }}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleQuickCheckout}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium"
              >
                Quick Checkout
              </button>
              <button
                onClick={handleGenerateBill}
                className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium flex items-center justify-center space-x-2"
              >
                <FileText className="w-5 h-5" />
                <span>Generate Bill & Checkout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const ChargeForm = () => {
    const [formData, setFormData] = useState({
      bookingId: '',
      description: '',
      amount: '',
      category: 'other' as 'room' | 'restaurant' | 'spa' | 'other'
    });

    const activeBookings = bookings.filter(b => b.status === 'checked-in');

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      addRoomCharge(formData.bookingId, {
        description: formData.description,
        amount: parseFloat(formData.amount),
        currency: hotelSettings.baseCurrency,
        date: new Date().toISOString().split('T')[0],
        category: formData.category
      });
      
      setShowChargeForm(false);
      setFormData({ bookingId: '', description: '', amount: '', category: 'other' });
      alert('Charge posted to room successfully!');
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full m-4">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold">Post Charge to Room</h3>
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
                  const room = rooms.find(r => r.id === booking.roomId);
                  return (
                    <option key={booking.id} value={booking.id}>
                      Room {room?.number} - {guest?.name} ({room && getSmokingLabel(room.smokingAllowed || false)})
                    </option>
                  );
                })}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                required
              >
                <option value="restaurant">Restaurant</option>
                <option value="spa">Spa & Wellness</option>
                <option value="room">Room Service</option>
                <option value="other">Other Services</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., Dinner at The Grill, Spa Treatment"
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

  const RoomDetailsModal = () => {
    if (!selectedRoom) return null;

    const currentBooking = bookings.find(b => 
      b.roomId === selectedRoom.id && b.status === 'checked-in'
    );
    const currentGuest = currentBooking ? guests.find(g => g.id === currentBooking.guestId) : null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl max-w-2xl w-full m-4 max-h-[90vh] overflow-y-auto">
          <div className="relative">
            <img
              src={selectedRoom.photos[0]}
              alt={`Room ${selectedRoom.number}`}
              className="w-full h-64 object-cover rounded-t-2xl"
            />
            <button
              onClick={() => {
                setShowRoomDetails(false);
                setSelectedRoom(null);
              }}
              className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="absolute bottom-4 left-4 flex space-x-2">
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(selectedRoom.status)}`}>
                {selectedRoom.status.replace('-', ' ')}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center space-x-1 ${getSmokingColor(selectedRoom.smokingAllowed || false)}`}>
                {getSmokingIcon(selectedRoom.smokingAllowed || false)}
                <span>{getSmokingLabel(selectedRoom.smokingAllowed || false)}</span>
              </span>
            </div>
          </div>

          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Room {selectedRoom.number}</h2>
                <div className="flex items-center space-x-4 mt-2">
                  <p className="text-lg text-gray-600 capitalize">{selectedRoom.type} Room</p>
                  <div className="flex items-center space-x-1">
                    {getSmokingIcon(selectedRoom.smokingAllowed || false)}
                    <span className="text-sm font-medium text-gray-700">
                      {getSmokingLabel(selectedRoom.smokingAllowed || false)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-600">{formatCurrency(selectedRoom.rate)}</p>
                <p className="text-sm text-gray-500">per night</p>
              </div>
            </div>

            {currentGuest && currentBooking && (
              <div className="bg-blue-50 rounded-xl p-6 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-blue-900">Current Guest</h3>
                  <button
                    onClick={() => {
                      setSelectedBooking(currentBooking);
                      setShowCheckoutForm(true);
                      setShowRoomDetails(false);
                    }}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Checkout</span>
                  </button>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-blue-600" />
                    <span className="font-medium">{currentGuest.name}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-blue-600" />
                    <span>{currentGuest.email}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-blue-600" />
                    <span>{currentGuest.phone}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <span>
                      {new Date(currentBooking.checkIn).toLocaleDateString()} - {new Date(currentBooking.checkOut).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Receipt className="w-5 h-5 text-blue-600" />
                    <span>Total Charges: {formatCurrency(currentBooking.charges.reduce((sum, c) => sum + c.amount, 0), currentBooking.currency)}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Room Details</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">Floor</p>
                  <p className="font-semibold">{selectedRoom.floor || 'N/A'}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">Size</p>
                  <p className="font-semibold">{selectedRoom.size || 'N/A'} m²</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">Bed Type</p>
                  <p className="font-semibold">{selectedRoom.bedType || 'N/A'}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">View</p>
                  <p className="font-semibold">{selectedRoom.view || 'N/A'}</p>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Amenities</h3>
              <div className="grid grid-cols-2 gap-3">
                {selectedRoom.amenities.map((amenity) => (
                  <div key={amenity} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    {getAmenityIcon(amenity)}
                    <span className="text-gray-700">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => updateRoomStatus(selectedRoom.id, 'clean')}
                disabled={selectedRoom.status === 'clean'}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Mark as Clean
              </button>
              <button
                onClick={() => updateRoomStatus(selectedRoom.id, 'maintenance')}
                disabled={selectedRoom.status === 'maintenance'}
                className="flex-1 px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Maintenance
              </button>
              <button
                onClick={() => updateRoomStatus(selectedRoom.id, 'out-of-order')}
                disabled={selectedRoom.status === 'out-of-order'}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Out of Order
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const BookingForm = () => {
    const [formData, setFormData] = useState({
      guestId: '',
      roomId: '',
      checkIn: '',
      checkOut: '',
      specialRequests: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const guest = guests.find(g => g.id === formData.guestId);
      const room = rooms.find(r => r.id === formData.roomId);
      
      if (guest && room) {
        const nights = Math.ceil(
          (new Date(formData.checkOut).getTime() - new Date(formData.checkIn).getTime()) / (1000 * 60 * 60 * 24)
        );
        
        addBooking({
          guestId: formData.guestId,
          roomId: formData.roomId,
          checkIn: formData.checkIn,
          checkOut: formData.checkOut,
          status: 'confirmed',
          totalAmount: room.rate * nights,
          currency: hotelSettings.baseCurrency,
          specialRequests: formData.specialRequests,
          adults: 1,
          children: 0,
          source: 'direct',
          paymentStatus: 'pending',
          createdAt: new Date().toISOString()
        });
        
        setShowBookingForm(false);
        setFormData({ guestId: '', roomId: '', checkIn: '', checkOut: '', specialRequests: '' });
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full m-4">
          <h3 className="text-2xl font-bold mb-6">New Booking</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Guest</label>
              <select
                value={formData.guestId}
                onChange={(e) => setFormData({ ...formData, guestId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                required
              >
                <option value="">Select a guest</option>
                {guests.map((guest) => (
                  <option key={guest.id} value={guest.id}>{guest.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Room</label>
              <select
                value={formData.roomId}
                onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                required
              >
                <option value="">Select a room</option>
                {rooms.filter(r => r.status === 'clean').map((room) => (
                  <option key={room.id} value={room.id}>
                    Room {room.number} - {room.type} - {getSmokingLabel(room.smokingAllowed || false)} ({formatCurrency(room.rate)}/night)
                  </option>
                ))}
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Check-in</label>
                <input
                  type="date"
                  value={formData.checkIn}
                  onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Check-out</label>
                <input
                  type="date"
                  value={formData.checkOut}
                  onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Special Requests</label>
              <textarea
                value={formData.specialRequests}
                onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                rows={3}
              />
            </div>
            
            <div className="flex space-x-4 pt-4">
              <button
                type="button"
                onClick={() => setShowBookingForm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Create Booking
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const GuestForm = () => {
    const [formData, setFormData] = useState({
      name: '',
      email: '',
      phone: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      addGuest(formData);
      setShowGuestForm(false);
      setFormData({ name: '', email: '', phone: '' });
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full m-4">
          <h3 className="text-2xl font-bold mb-6">Add New Guest</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            
            <div className="flex space-x-4 pt-4">
              <button
                type="button"
                onClick={() => setShowGuestForm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Add Guest
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Rooms & Reservations</h1>
          {statusFilter && (
            <div className="mt-2 flex items-center space-x-2">
              <span className="text-sm text-gray-600">Filtered by:</span>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(statusFilter)}`}>
                {statusFilter === 'maintenance' ? 'Out of Order/Maintenance' : statusFilter.replace('-', ' ')}
              </span>
              <button
                onClick={() => setStatusFilter('')}
                className="text-indigo-600 hover:text-indigo-800 text-sm"
              >
                Clear Filter
              </button>
            </div>
          )}
          {dateFilter && (
            <div className="mt-2 flex items-center space-x-2">
              <span className="text-sm text-gray-600">Showing:</span>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                {dateFilter === 'check-in-today' ? 'Check-ins Today' : 
                 dateFilter === 'check-out-today' ? 'Check-outs Today' : dateFilter}
              </span>
              <button
                onClick={() => setDateFilter('')}
                className="text-indigo-600 hover:text-indigo-800 text-sm"
              >
                Clear Filter
              </button>
            </div>
          )}
        </div>
        <div className="flex space-x-4">
          <button
            onClick={() => setShowChargeForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Receipt className="w-4 h-4" />
            <span>Post Charge</span>
          </button>
          <button
            onClick={() => setShowGuestForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <User className="w-4 h-4" />
            <span>Add Guest</span>
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
              { id: 'rooms', name: 'Rooms', icon: Bed },
              { id: 'bookings', name: 'Bookings', icon: Calendar },
              { id: 'guests', name: 'Guests', icon: User }
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

      {view === 'rooms' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredRooms.map((room) => (
            <div key={room.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="aspect-video bg-gray-200 relative">
                <img
                  src={room.photos[0]}
                  alt={`Room ${room.number}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(room.status)}`}>
                    {room.status.replace('-', ' ')}
                  </span>
                </div>
                <div className="absolute top-4 left-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1 ${getSmokingColor(room.smokingAllowed || false)}`}>
                    {getSmokingIcon(room.smokingAllowed || false)}
                    <span>{getSmokingLabel(room.smokingAllowed || false)}</span>
                  </span>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">Room {room.number}</h3>
                  <span className="text-lg font-semibold text-green-600">{formatCurrency(room.rate)}/night</span>
                </div>
                
                <div className="space-y-2 mb-4">
                  <p className="text-gray-600 capitalize">{room.type} Room</p>
                  <div className="flex items-center space-x-2">
                    {getSmokingIcon(room.smokingAllowed || false)}
                    <span className="text-sm font-medium text-gray-700">
                      {getSmokingLabel(room.smokingAllowed || false)}
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {room.amenities.slice(0, 3).map((amenity) => (
                    <span key={amenity} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                      {amenity}
                    </span>
                  ))}
                  {room.amenities.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                      +{room.amenities.length - 3} more
                    </span>
                  )}
                </div>
                
                <button
                  onClick={() => {
                    setSelectedRoom(room);
                    setShowRoomDetails(true);
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
                  placeholder="Search bookings..."
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guest</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-in</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-out</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBookings.map((booking) => {
                  const guest = guests.find(g => g.id === booking.guestId);
                  const room = rooms.find(r => r.id === booking.roomId);
                  const totalCharges = booking.charges.reduce((sum, charge) => sum + charge.amount, 0);
                  
                  return (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{guest?.name}</div>
                        <div className="text-sm text-gray-500">{guest?.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">Room {room?.number}</div>
                        <div className="text-sm text-gray-500 capitalize">{room?.type}</div>
                        <div className="flex items-center space-x-1 mt-1">
                          {room && getSmokingIcon(room.smokingAllowed || false)}
                          <span className="text-xs text-gray-500">
                            {room && getSmokingLabel(room.smokingAllowed || false)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(booking.checkIn).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(booking.checkOut).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getBookingStatusColor(booking.status)}`}>
                          {booking.status.replace('-', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(totalCharges, booking.currency)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {booking.status === 'confirmed' && (
                            <button
                              onClick={() => {
                                updateBookingStatus(booking.id, 'checked-in');
                                updateRoomStatus(booking.roomId, 'occupied');
                              }}
                              className="text-green-600 hover:text-green-900"
                            >
                              Check In
                            </button>
                          )}
                          {booking.status === 'checked-in' && (
                            <button
                              onClick={() => {
                                setSelectedBooking(booking);
                                setShowCheckoutForm(true);
                              }}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Checkout
                            </button>
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

      {view === 'guests' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {guests.map((guest) => {
            // Find current booking for this guest
            const currentBooking = bookings.find(b => 
              b.guestId === guest.id && b.status === 'checked-in'
            );
            const currentRoom = currentBooking ? rooms.find(r => r.id === currentBooking.roomId) : null;
            
            return (
              <div key={guest.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-lg">
                      {guest.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{guest.name}</h3>
                    <p className="text-sm text-gray-500">{guest.totalStays} stays</p>
                  </div>
                </div>
                
                {/* Current Room Information */}
                {currentRoom && currentBooking && (
                  <div className="bg-blue-50 rounded-lg p-4 mb-4">
                    <h4 className="text-sm font-semibold text-blue-900 mb-2">Currently Staying</h4>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-blue-700">Room:</span>
                        <span className="text-sm font-medium text-blue-900">{currentRoom.number}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-blue-700">Type:</span>
                        <span className="text-sm font-medium text-blue-900 capitalize">{currentRoom.type}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-blue-700">Category:</span>
                        <div className="flex items-center space-x-1">
                          {getSmokingIcon(currentRoom.smokingAllowed || false)}
                          <span className="text-sm font-medium text-blue-900">
                            {getSmokingLabel(currentRoom.smokingAllowed || false)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-blue-700">Check-out:</span>
                        <span className="text-sm font-medium text-blue-900">
                          {new Date(currentBooking.checkOut).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{guest.email}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{guest.phone}</span>
                  </div>
                  {guest.company && (
                    <div className="flex items-center space-x-3">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{guest.company}</span>
                    </div>
                  )}
                </div>
                
                {/* Guest Preferences */}
                {guest.roomPreferences && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Room Preferences</h4>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Smoking:</span>
                        <div className="flex items-center space-x-1">
                          {getSmokingIcon(guest.roomPreferences.smokingRoom || false)}
                          <span className="text-xs font-medium text-gray-800">
                            {guest.roomPreferences.smokingRoom ? 'Yes' : 'No'}
                          </span>
                        </div>
                      </div>
                      {guest.roomPreferences.floor && (
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600">Floor:</span>
                          <span className="text-xs font-medium text-gray-800 capitalize">
                            {guest.roomPreferences.floor}
                          </span>
                        </div>
                      )}
                      {guest.roomPreferences.bedType && (
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600">Bed:</span>
                          <span className="text-xs font-medium text-gray-800">
                            {guest.roomPreferences.bedType}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {guest.lastStayDate && (
                  <p className="text-sm text-gray-500">
                    Last stay: {new Date(guest.lastStayDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showBookingForm && <BookingForm />}
      {showGuestForm && <GuestForm />}
      {showRoomDetails && <RoomDetailsModal />}
      {showCheckoutForm && <CheckoutForm />}
      {showChargeForm && <ChargeForm />}
      {showBillGenerator && selectedBooking && (
        <BillGenerator
          booking={selectedBooking}
          guest={guests.find(g => g.id === selectedBooking.guestId)!}
          room={rooms.find(r => r.id === selectedBooking.roomId)!}
          onClose={() => {
            setShowBillGenerator(false);
            setSelectedBooking(null);
          }}
          onCheckoutComplete={() => {
            setShowBillGenerator(false);
            setSelectedBooking(null);
          }}
        />
      )}
    </div>
  );
}