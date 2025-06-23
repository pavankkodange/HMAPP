import React, { useState, useEffect } from 'react';
import { useHotel } from '../context/HotelContext';
import { useCurrency } from '../context/CurrencyContext';
import { RoomManagement } from './RoomManagement';
import { BillGenerator } from './BillGenerator';
import { 
  Bed, 
  Plus, 
  User, 
  Clock, 
  Search,
  Filter,
  Calendar,
  CheckCircle,
  X,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Receipt,
  Star,
  Building,
  Settings,
  ArrowRight,
  Eye,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  AlertCircle,
  FileText,
  DollarSign
} from 'lucide-react';
import { Room, Booking, Guest } from '../types';

interface RoomsModuleProps {
  filters?: {
    statusFilter?: string;
    dateFilter?: string;
    view?: string;
    action?: string;
    revenueFilter?: string;
  };
  onModuleChange?: (module: string, filter?: any) => void;
}

export function RoomsModule({ filters, onModuleChange }: RoomsModuleProps) {
  const { 
    rooms, 
    bookings, 
    guests, 
    updateRoomStatus, 
    addBooking, 
    updateBookingStatus,
    addRoomCharge
  } = useHotel();
  const { formatCurrency, hotelSettings } = useCurrency();
  
  const [view, setView] = useState<'rooms' | 'bookings'>('rooms');
  const [showRoomManagement, setShowRoomManagement] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showCheckInForm, setShowCheckInForm] = useState(false);
  const [showCheckOutForm, setShowCheckOutForm] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [showBillGenerator, setShowBillGenerator] = useState(false);

  // Apply filters from dashboard navigation
  useEffect(() => {
    if (filters) {
      if (filters.statusFilter) {
        setStatusFilter(filters.statusFilter);
      }
      if (filters.dateFilter) {
        setDateFilter(filters.dateFilter);
        if (filters.dateFilter.includes('check-in') || filters.dateFilter.includes('check-out')) {
          setView('bookings');
        }
      }
      if (filters.view) {
        setView(filters.view as any);
      }
      if (filters.action === 'new-booking') {
        setShowBookingForm(true);
      }
      if (filters.action === 'check-in') {
        setShowCheckInForm(true);
      }
    }
  }, [filters]);

  const getStatusColor = (status: Room['status']) => {
    switch (status) {
      case 'clean': return 'bg-green-100 text-green-800';
      case 'dirty': return 'bg-orange-100 text-orange-800';
      case 'occupied': return 'bg-blue-100 text-blue-800';
      case 'maintenance': return 'bg-red-100 text-red-800';
      case 'out-of-order': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getBookingStatusColor = (status: Booking['status']) => {
    switch (status) {
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'checked-in': return 'bg-green-100 text-green-800';
      case 'checked-out': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'no-show': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getVipTierColor = (tier?: string) => {
    switch (tier) {
      case 'diamond': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'platinum': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'gold': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  // Filter rooms based on search and status filter
  const filteredRooms = rooms.filter(room => {
    const matchesSearch = !searchTerm || 
      room.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || room.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Filter bookings based on search and date filter
  const filteredBookings = bookings.filter(booking => {
    const guest = guests.find(g => g.id === booking.guestId);
    const room = rooms.find(r => r.id === booking.roomId);
    
    const matchesSearch = !searchTerm || 
      (guest?.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (room?.number.toLowerCase().includes(searchTerm.toLowerCase()));
    
    let matchesDate = true;
    const today = new Date().toISOString().split('T')[0];
    
    if (dateFilter === 'today') {
      matchesDate = booking.checkIn === today || booking.checkOut === today;
    } else if (dateFilter === 'check-in-today') {
      matchesDate = booking.checkIn === today;
    } else if (dateFilter === 'check-out-today') {
      matchesDate = booking.checkOut === today;
    }
    
    return matchesSearch && matchesDate;
  });

  const handleManageRooms = () => {
    if (onModuleChange) {
      onModuleChange('admin');
    } else {
      setShowRoomManagement(true);
    }
  };

  const BookingForm = () => {
    const [formData, setFormData] = useState({
      guestId: '',
      roomId: '',
      checkIn: '',
      checkOut: '',
      adults: 1,
      children: 0,
      specialRequests: '',
      source: 'direct' as Booking['source']
    });

    const [showNewGuestForm, setShowNewGuestForm] = useState(false);
    const [newGuestData, setNewGuestData] = useState({
      name: '',
      email: '',
      phone: '',
      address: '',
      nationality: '',
      idType: 'passport',
      idNumber: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      // Calculate total amount based on room rate and stay duration
      const room = rooms.find(r => r.id === formData.roomId);
      if (!room) return;
      
      const checkIn = new Date(formData.checkIn);
      const checkOut = new Date(formData.checkOut);
      const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
      const totalAmount = room.rate * nights;
      
      addBooking({
        ...formData,
        totalAmount,
        currency: hotelSettings.baseCurrency,
        status: 'confirmed',
        paymentStatus: 'pending',
        createdAt: new Date().toISOString()
      });
      
      setShowBookingForm(false);
    };

    const availableRooms = rooms.filter(room => room.status === 'clean');

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">New Reservation</h3>
              <button
                onClick={() => setShowBookingForm(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Guest Selection */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Guest Information</h4>
                
                {!showNewGuestForm ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Select Guest</label>
                      <select
                        value={formData.guestId}
                        onChange={(e) => setFormData({ ...formData, guestId: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        required
                      >
                        <option value="">Select a guest</option>
                        {guests.map((guest) => (
                          <option key={guest.id} value={guest.id}>
                            {guest.name} - {guest.email}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => setShowNewGuestForm(true)}
                        className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                      >
                        + Add New Guest
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                        <input
                          type="text"
                          value={newGuestData.name}
                          onChange={(e) => setNewGuestData({ ...newGuestData, name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input
                          type="email"
                          value={newGuestData.email}
                          onChange={(e) => setNewGuestData({ ...newGuestData, email: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                        <input
                          type="tel"
                          value={newGuestData.phone}
                          onChange={(e) => setNewGuestData({ ...newGuestData, phone: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nationality</label>
                        <input
                          type="text"
                          value={newGuestData.nationality}
                          onChange={(e) => setNewGuestData({ ...newGuestData, nationality: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                      <textarea
                        value={newGuestData.address}
                        onChange={(e) => setNewGuestData({ ...newGuestData, address: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        rows={2}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">ID Type</label>
                        <select
                          value={newGuestData.idType}
                          onChange={(e) => setNewGuestData({ ...newGuestData, idType: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="passport">Passport</option>
                          <option value="drivers_license">Driver's License</option>
                          <option value="national_id">National ID</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">ID Number</label>
                        <input
                          type="text"
                          value={newGuestData.idNumber}
                          onChange={(e) => setNewGuestData({ ...newGuestData, idNumber: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-4">
                      <button
                        type="button"
                        onClick={() => setShowNewGuestForm(false)}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          // In a real app, this would add the guest to the database
                          // and return the new guest ID
                          setShowNewGuestForm(false);
                        }}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                      >
                        Add Guest
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Room Selection */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Room Selection</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Room</label>
                    <select
                      value={formData.roomId}
                      onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      required
                    >
                      <option value="">Select a room</option>
                      {availableRooms.map((room) => (
                        <option key={room.id} value={room.id}>
                          Room {room.number} - {room.type} ({formatCurrency(room.rate)}/night)
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Check-in Date</label>
                      <input
                        type="date"
                        value={formData.checkIn}
                        onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Check-out Date</label>
                      <input
                        type="date"
                        value={formData.checkOut}
                        onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        min={formData.checkIn || new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Adults</label>
                      <input
                        type="number"
                        value={formData.adults}
                        onChange={(e) => setFormData({ ...formData, adults: parseInt(e.target.value) || 1 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        min="1"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Children</label>
                      <input
                        type="number"
                        value={formData.children}
                        onChange={(e) => setFormData({ ...formData, children: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        min="0"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Special Requests</label>
                    <textarea
                      value={formData.specialRequests}
                      onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Booking Source</label>
                    <select
                      value={formData.source}
                      onChange={(e) => setFormData({ ...formData, source: e.target.value as Booking['source'] })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="direct">Direct</option>
                      <option value="booking.com">Booking.com</option>
                      <option value="expedia">Expedia</option>
                      <option value="phone">Phone</option>
                      <option value="walk-in">Walk-in</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowBookingForm(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors"
                >
                  Create Reservation
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  const CheckInForm = () => {
    const [selectedBookingId, setSelectedBookingId] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [depositAmount, setDepositAmount] = useState('0');
    
    const pendingBookings = bookings.filter(b => b.status === 'confirmed');

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      const booking = bookings.find(b => b.id === selectedBookingId);
      if (!booking) return;
      
      // Update booking status
      updateBookingStatus(selectedBookingId, 'checked-in');
      
      // Update room status
      updateRoomStatus(booking.roomId, 'occupied');
      
      // Add deposit as a charge if provided
      if (parseFloat(depositAmount) > 0) {
        addRoomCharge(selectedBookingId, {
          description: 'Security Deposit',
          amount: parseFloat(depositAmount),
          currency: booking.currency,
          date: new Date().toISOString().split('T')[0],
          category: 'other'
        });
      }
      
      setShowCheckInForm(false);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-md w-full">
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Check-in Guest</h3>
              <button
                onClick={() => setShowCheckInForm(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Reservation</label>
                <select
                  value={selectedBookingId}
                  onChange={(e) => setSelectedBookingId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="">Select a reservation</option>
                  {pendingBookings.map((booking) => {
                    const guest = guests.find(g => g.id === booking.guestId);
                    return (
                      <option key={booking.id} value={booking.id}>
                        {guest?.name} - Room {booking.roomId} ({booking.checkIn})
                      </option>
                    );
                  })}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="card">Credit Card</option>
                  <option value="cash">Cash</option>
                  <option value="bank-transfer">Bank Transfer</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Security Deposit ({hotelSettings.baseCurrency})
                </label>
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  min="0"
                  step="0.01"
                />
              </div>
              
              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCheckInForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Complete Check-in
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  const CheckOutForm = () => {
    const [selectedBookingId, setSelectedBookingId] = useState('');
    
    const activeBookings = bookings.filter(b => b.status === 'checked-in');

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      const booking = bookings.find(b => b.id === selectedBookingId);
      if (!booking) return;
      
      const guest = guests.find(g => g.id === booking.guestId);
      const room = rooms.find(r => r.id === booking.roomId);
      
      if (guest && room) {
        setSelectedBooking(booking);
        setSelectedGuest(guest);
        setSelectedRoom(room);
        setShowCheckOutForm(false);
        setShowBillGenerator(true);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-md w-full">
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Check-out Guest</h3>
              <button
                onClick={() => setShowCheckOutForm(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Guest</label>
                <select
                  value={selectedBookingId}
                  onChange={(e) => setSelectedBookingId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="">Select a guest</option>
                  {activeBookings.map((booking) => {
                    const guest = guests.find(g => g.id === booking.guestId);
                    return (
                      <option key={booking.id} value={booking.id}>
                        {guest?.name} - Room {booking.roomId}
                      </option>
                    );
                  })}
                </select>
              </div>
              
              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCheckOutForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                >
                  Generate Bill
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Rooms & Bookings</h1>
          {statusFilter && (
            <div className="mt-2 flex items-center space-x-2">
              <span className="text-sm text-gray-600">Showing:</span>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold capitalize">
                {statusFilter} Rooms
              </span>
              <button
                onClick={() => setStatusFilter('')}
                className="text-indigo-600 hover:text-indigo-800 text-sm"
              >
                Show All
              </button>
            </div>
          )}
          {dateFilter && (
            <div className="mt-2 flex items-center space-x-2">
              <span className="text-sm text-gray-600">Showing:</span>
              <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-semibold">
                {dateFilter === 'today' ? "Today's Activity" : 
                 dateFilter === 'check-in-today' ? "Today's Check-ins" : 
                 dateFilter === 'check-out-today' ? "Today's Check-outs" : dateFilter}
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
            onClick={handleManageRooms}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <Settings className="w-4 h-4" />
            <span>Manage Rooms</span>
          </button>
          <button
            onClick={() => setShowCheckOutForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
          >
            <UserX className="w-4 h-4" />
            <span>Check-out</span>
          </button>
          <button
            onClick={() => setShowCheckInForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <UserCheck className="w-4 h-4" />
            <span>Check-in</span>
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
              { id: 'rooms', name: 'Room Status', icon: Bed },
              { id: 'bookings', name: 'Reservations', icon: Calendar }
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

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={view === 'rooms' ? "Search rooms..." : "Search reservations..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          {view === 'rooms' && (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Statuses</option>
              <option value="clean">Clean</option>
              <option value="dirty">Dirty</option>
              <option value="occupied">Occupied</option>
              <option value="maintenance">Maintenance</option>
              <option value="out-of-order">Out of Order</option>
            </select>
          )}
          {view === 'bookings' && (
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Dates</option>
              <option value="today">Today</option>
              <option value="check-in-today">Check-in Today</option>
              <option value="check-out-today">Check-out Today</option>
            </select>
          )}
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter className="w-4 h-4" />
            <span>More Filters</span>
          </button>
        </div>
      </div>

      {/* Room Status View */}
      {view === 'rooms' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map((room) => (
            <div key={room.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="aspect-video bg-gray-200 relative">
                {room.photos.length > 0 ? (
                  <img
                    src={room.photos[0]}
                    alt={`Room ${room.number}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Bed className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(room.status)}`}>
                    {room.status.charAt(0).toUpperCase() + room.status.slice(1)}
                  </span>
                </div>
                {room.isVipRoom && (
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 flex items-center space-x-1">
                      <Star className="w-3 h-3" />
                      <span>VIP</span>
                    </span>
                  </div>
                )}
              </div>
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Room {room.number}</h3>
                    <p className="text-sm text-gray-600 capitalize">{room.type} room</p>
                  </div>
                  <span className="text-lg font-semibold text-green-600">{formatCurrency(room.rate)}</span>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center space-x-2">
                    <Building className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Floor {room.floor}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Max {room.maxOccupancy} guests</span>
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
                
                <div className="flex space-x-2">
                  {room.status === 'clean' && (
                    <button
                      onClick={() => setShowBookingForm(true)}
                      className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      <Calendar className="w-4 h-4" />
                      <span>Book Now</span>
                    </button>
                  )}
                  {room.status === 'dirty' && (
                    <button
                      onClick={() => updateRoomStatus(room.id, 'clean')}
                      className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Mark as Clean</span>
                    </button>
                  )}
                  {room.status === 'occupied' && (
                    <button
                      onClick={() => {
                        const activeBooking = bookings.find(b => b.roomId === room.id && b.status === 'checked-in');
                        if (activeBooking) {
                          setSelectedBookingId(activeBooking.id);
                          setShowCheckOutForm(true);
                        }
                      }}
                      className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                    >
                      <UserX className="w-4 h-4" />
                      <span>Check-out</span>
                    </button>
                  )}
                  {room.status === 'maintenance' && (
                    <button
                      onClick={() => updateRoomStatus(room.id, 'clean')}
                      className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Mark as Ready</span>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (room.status === 'clean') {
                        updateRoomStatus(room.id, 'dirty');
                      } else if (room.status === 'dirty') {
                        updateRoomStatus(room.id, 'maintenance');
                      } else if (room.status === 'maintenance') {
                        updateRoomStatus(room.id, 'out-of-order');
                      } else if (room.status === 'out-of-order') {
                        updateRoomStatus(room.id, 'clean');
                      }
                    }}
                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    disabled={room.status === 'occupied'}
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredRooms.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-16 border-2 border-dashed border-gray-300 rounded-xl">
              <Bed className="w-16 h-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Rooms Found</h3>
              <p className="text-gray-600 text-center mb-6">
                {rooms.length === 0 
                  ? "No rooms have been added to the system yet" 
                  : "No rooms match your current filters"}
              </p>
              <button
                onClick={handleManageRooms}
                className="flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Settings className="w-5 h-5" />
                <span>Manage Rooms</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Bookings View */}
      {view === 'bookings' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guest</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBookings.map((booking) => {
                  const guest = guests.find(g => g.id === booking.guestId);
                  const room = rooms.find(r => r.id === booking.roomId);
                  
                  return (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                            <span className="text-indigo-600 font-medium">
                              {guest?.name.charAt(0) || 'G'}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="flex items-center space-x-2">
                              <div className="text-sm font-medium text-gray-900">{guest?.name}</div>
                              {guest?.vipStatus && (
                                <div className="flex items-center space-x-1">
                                  <Star className="w-4 h-4 text-yellow-500" />
                                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getVipTierColor(guest?.vipTier)}`}>
                                    {guest?.vipTier?.toUpperCase() || 'VIP'}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="text-sm text-gray-500">{guest?.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">Room {room?.number}</div>
                        <div className="text-sm text-gray-500 capitalize">{room?.type}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          {booking.adults} Adult{booking.adults !== 1 ? 's' : ''}{booking.children > 0 ? `, ${booking.children} Child${booking.children !== 1 ? 'ren' : ''}` : ''}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getBookingStatusColor(booking.status)}`}>
                          {booking.status.replace('-', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(booking.totalAmount, booking.currency)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {booking.status === 'confirmed' && (
                            <button
                              onClick={() => {
                                setSelectedBookingId(booking.id);
                                setShowCheckInForm(true);
                              }}
                              className="text-green-600 hover:text-green-900"
                            >
                              Check-in
                            </button>
                          )}
                          {booking.status === 'checked-in' && (
                            <button
                              onClick={() => {
                                const guest = guests.find(g => g.id === booking.guestId);
                                const room = rooms.find(r => r.id === booking.roomId);
                                
                                if (guest && room) {
                                  setSelectedBooking(booking);
                                  setSelectedGuest(guest);
                                  setSelectedRoom(room);
                                  setShowBillGenerator(true);
                                }
                              }}
                              className="text-orange-600 hover:text-orange-900"
                            >
                              Check-out
                            </button>
                          )}
                          <button
                            onClick={() => {
                              // View booking details
                            }}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              // Edit booking
                            }}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          {booking.status !== 'checked-in' && (
                            <button
                              onClick={() => {
                                // Delete booking
                              }}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="w-4 h-4" />
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

      {showRoomManagement && <RoomManagement onClose={() => setShowRoomManagement(false)} />}
      {showBookingForm && <BookingForm />}
      {showCheckInForm && <CheckInForm />}
      {showCheckOutForm && <CheckOutForm />}
      {showBillGenerator && selectedBooking && selectedGuest && selectedRoom && (
        <BillGenerator 
          booking={selectedBooking} 
          guest={selectedGuest} 
          room={selectedRoom} 
          onClose={() => setShowBillGenerator(false)}
          onCheckoutComplete={() => {
            setShowBillGenerator(false);
            updateRoomStatus(selectedRoom.id, 'dirty');
          }}
        />
      )}
    </div>
  );
}