import React, { useState, useEffect } from 'react';
import { useHotel } from '../context/HotelContext';
import { useCurrency } from '../context/CurrencyContext';
import { BillGenerator } from './BillGenerator';
import { 
  Bed, 
  Users, 
  Calendar, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  User,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  X,
  Star,
  Crown,
  Gift,
  Sparkles,
  Upload,
  FileText,
  Image,
  Paperclip,
  Download,
  Check
} from 'lucide-react';
import { Room, Guest, Booking } from '../types';

interface RoomsModuleProps {
  filters?: {
    statusFilter?: string;
    view?: string;
    dateFilter?: string;
    action?: string;
    revenueFilter?: string;
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
    updateRoomStatus: updateRoom
  } = useHotel();
  const { formatCurrency } = useCurrency();
  
  const [view, setView] = useState<'rooms' | 'bookings' | 'guests'>('rooms');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showGuestForm, setShowGuestForm] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showBillGenerator, setShowBillGenerator] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  // Apply filters from dashboard navigation
  useEffect(() => {
    if (filters) {
      if (filters.statusFilter) {
        setStatusFilter(filters.statusFilter);
      }
      if (filters.view) {
        setView(filters.view as any);
      }
      if (filters.action === 'new-booking') {
        setShowBookingForm(true);
      }
      if (filters.action === 'check-in') {
        setView('bookings');
      }
    }
  }, [filters]);

  const getStatusColor = (status: Room['status']) => {
    switch (status) {
      case 'clean': return 'bg-green-100 text-green-800';
      case 'dirty': return 'bg-orange-100 text-orange-800';
      case 'occupied': return 'bg-blue-100 text-blue-800';
      case 'out-of-order': return 'bg-red-100 text-red-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getBookingStatusColor = (status: Booking['status']) => {
    switch (status) {
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'checked-in': return 'bg-green-100 text-green-800';
      case 'checked-out': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'no-show': return 'bg-red-100 text-red-800';
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

  const getVipTierIcon = (tier?: string) => {
    switch (tier) {
      case 'diamond': return <Crown className="w-4 h-4 text-purple-600" />;
      case 'platinum': return <Star className="w-4 h-4 text-gray-600" />;
      case 'gold': return <Star className="w-4 h-4 text-yellow-600" />;
      default: return <Gift className="w-4 h-4 text-blue-600" />;
    }
  };

  // Filter rooms based on status
  const filteredRooms = statusFilter 
    ? rooms.filter(room => room.status === statusFilter)
    : rooms;

  // Filter bookings based on date filters
  const getFilteredBookings = () => {
    const today = new Date().toISOString().split('T')[0];
    
    if (filters?.dateFilter === 'check-in-today') {
      return bookings.filter(b => b.checkIn === today);
    }
    if (filters?.dateFilter === 'check-out-today') {
      return bookings.filter(b => b.checkOut === today);
    }
    if (filters?.dateFilter === 'today') {
      return bookings.filter(b => b.checkIn === today || b.checkOut === today);
    }
    
    return bookings;
  };

  const filteredBookings = getFilteredBookings();

  const GuestForm = () => {
    const [formData, setFormData] = useState({
      name: '',
      email: '',
      phone: '',
      title: 'Mr.',
      company: '',
      nationality: '',
      address: '',
      dateOfBirth: '',
      preferredCurrency: 'USD',
      vipStatus: false,
      vipTier: 'gold' as 'gold' | 'platinum' | 'diamond',
      roomPreferences: {
        smokingRoom: false,
        floor: 'any' as 'low' | 'high' | 'any',
        view: '',
        bedType: ''
      },
      identificationDetails: {
        type: 'passport' as 'passport' | 'drivers_license' | 'national_id',
        number: '',
        issuingCountry: '',
        expiryDate: ''
      },
      emergencyContactDetails: {
        name: '',
        relationship: '',
        phone: '',
        email: ''
      },
      specialRequests: [] as string[],
      dietaryRestrictions: [] as string[],
      vipPreferences: {
        preferredRoomType: '',
        preferredFloor: 1,
        preferredAmenities: [] as string[],
        specialServices: [] as string[],
        dietaryRequirements: [] as string[],
        communicationPreference: 'email' as 'email' | 'phone' | 'sms'
      }
    });

    // ID Proof attachment state
    const [idProofFiles, setIdProofFiles] = useState<File[]>([]);
    const [idProofPreviews, setIdProofPreviews] = useState<string[]>([]);
    const [uploadProgress, setUploadProgress] = useState<number>(0);
    const [isUploading, setIsUploading] = useState(false);

    const handleIdProofUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || []);
      if (files.length === 0) return;

      // Validate file types
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      const validFiles = files.filter(file => {
        if (!allowedTypes.includes(file.type)) {
          alert(`File ${file.name} is not a supported format. Please upload JPG, PNG, or PDF files.`);
          return false;
        }
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
          alert(`File ${file.name} is too large. Please upload files smaller than 10MB.`);
          return false;
        }
        return true;
      });

      if (validFiles.length === 0) return;

      setIsUploading(true);
      setUploadProgress(0);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            setIsUploading(false);
            return 100;
          }
          return prev + 10;
        });
      }, 200);

      // Add files to state
      setIdProofFiles(prev => [...prev, ...validFiles]);

      // Generate previews
      validFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          setIdProofPreviews(prev => [...prev, e.target?.result as string]);
        };
        reader.readAsDataURL(file);
      });
    };

    const removeIdProofFile = (index: number) => {
      setIdProofFiles(prev => prev.filter((_, i) => i !== index));
      setIdProofPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const downloadIdProof = (index: number) => {
      const file = idProofFiles[index];
      const url = URL.createObjectURL(file);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      // Create guest data with ID proof information
      const guestData = {
        ...formData,
        bookingHistory: [],
        totalStays: 0,
        loyaltyPoints: formData.vipStatus ? 1000 : 0,
        // Store ID proof file information (in production, these would be uploaded to cloud storage)
        idProofDocuments: idProofFiles.map((file, index) => ({
          id: `${Date.now()}-${index}`,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          uploadDate: new Date().toISOString(),
          preview: idProofPreviews[index],
          verified: false
        }))
      };

      addGuest(guestData);
      setShowGuestForm(false);
      
      // Reset form
      setFormData({
        name: '', email: '', phone: '', title: 'Mr.', company: '', nationality: '', address: '', dateOfBirth: '', preferredCurrency: 'USD', vipStatus: false, vipTier: 'gold',
        roomPreferences: { smokingRoom: false, floor: 'any', view: '', bedType: '' },
        identificationDetails: { type: 'passport', number: '', issuingCountry: '', expiryDate: '' },
        emergencyContactDetails: { name: '', relationship: '', phone: '', email: '' },
        specialRequests: [], dietaryRestrictions: [],
        vipPreferences: { preferredRoomType: '', preferredFloor: 1, preferredAmenities: [], specialServices: [], dietaryRequirements: [], communicationPreference: 'email' }
      });
      setIdProofFiles([]);
      setIdProofPreviews([]);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl max-w-4xl w-full m-4 max-h-[90vh] overflow-y-auto">
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Add New Guest</h3>
              <button
                onClick={() => setShowGuestForm(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                    <select
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="Mr.">Mr.</option>
                      <option value="Mrs.">Mrs.</option>
                      <option value="Ms.">Ms.</option>
                      <option value="Dr.">Dr.</option>
                      <option value="Prof.">Prof.</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nationality</label>
                    <input
                      type="text"
                      value={formData.nationality}
                      onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                    <input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Currency</label>
                    <select
                      value={formData.preferredCurrency}
                      onChange={(e) => setFormData({ ...formData, preferredCurrency: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="GBP">GBP - British Pound</option>
                      <option value="JPY">JPY - Japanese Yen</option>
                    </select>
                  </div>
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    rows={3}
                  />
                </div>
              </div>

              {/* ID Proof Documents */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Identification Documents</h4>
                
                {/* Identification Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ID Type</label>
                    <select
                      value={formData.identificationDetails.type}
                      onChange={(e) => setFormData({
                        ...formData,
                        identificationDetails: {
                          ...formData.identificationDetails,
                          type: e.target.value as any
                        }
                      })}
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
                      value={formData.identificationDetails.number}
                      onChange={(e) => setFormData({
                        ...formData,
                        identificationDetails: {
                          ...formData.identificationDetails,
                          number: e.target.value
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Issuing Country</label>
                    <input
                      type="text"
                      value={formData.identificationDetails.issuingCountry}
                      onChange={(e) => setFormData({
                        ...formData,
                        identificationDetails: {
                          ...formData.identificationDetails,
                          issuingCountry: e.target.value
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                    <input
                      type="date"
                      value={formData.identificationDetails.expiryDate}
                      onChange={(e) => setFormData({
                        ...formData,
                        identificationDetails: {
                          ...formData.identificationDetails,
                          expiryDate: e.target.value
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* File Upload Section */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <div className="text-center">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Upload ID Proof Documents</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Upload clear photos or scans of identification documents (JPG, PNG, PDF - Max 10MB each)
                    </p>
                    
                    <label className="inline-flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer transition-colors">
                      <Paperclip className="w-5 h-5" />
                      <span>Choose Files</span>
                      <input
                        type="file"
                        multiple
                        accept="image/jpeg,image/png,image/jpg,application/pdf"
                        onChange={handleIdProofUpload}
                        className="hidden"
                      />
                    </label>
                    
                    {isUploading && (
                      <div className="mt-4">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">Uploading... {uploadProgress}%</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Uploaded Files Preview */}
                {idProofFiles.length > 0 && (
                  <div className="mt-6">
                    <h5 className="text-md font-semibold text-gray-900 mb-3">Uploaded Documents</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {idProofFiles.map((file, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              {file.type.startsWith('image/') ? (
                                <Image className="w-5 h-5 text-blue-600" />
                              ) : (
                                <FileText className="w-5 h-5 text-red-600" />
                              )}
                              <span className="text-sm font-medium text-gray-900 truncate">
                                {file.name}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeIdProofFile(index)}
                              className="text-red-600 hover:text-red-800 p-1"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          
                          {/* Preview for images */}
                          {file.type.startsWith('image/') && idProofPreviews[index] && (
                            <div className="mb-3">
                              <img
                                src={idProofPreviews[index]}
                                alt={`Preview of ${file.name}`}
                                className="w-full h-32 object-cover rounded-lg border border-gray-200"
                              />
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                            <button
                              type="button"
                              onClick={() => downloadIdProof(index)}
                              className="flex items-center space-x-1 text-indigo-600 hover:text-indigo-800"
                            >
                              <Download className="w-3 h-3" />
                              <span>Download</span>
                            </button>
                          </div>
                          
                          <div className="mt-2 flex items-center space-x-1">
                            <Check className="w-4 h-4 text-green-600" />
                            <span className="text-xs text-green-600">Ready for verification</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* VIP Status */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">VIP Status</h4>
                <div className="space-y-4">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.vipStatus}
                      onChange={(e) => setFormData({ ...formData, vipStatus: e.target.checked })}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm font-medium text-gray-700">VIP Guest</span>
                  </label>
                  
                  {formData.vipStatus && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">VIP Tier</label>
                        <select
                          value={formData.vipTier}
                          onChange={(e) => setFormData({ ...formData, vipTier: e.target.value as any })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="gold">Gold</option>
                          <option value="platinum">Platinum</option>
                          <option value="diamond">Diamond</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Communication Preference</label>
                        <select
                          value={formData.vipPreferences.communicationPreference}
                          onChange={(e) => setFormData({
                            ...formData,
                            vipPreferences: {
                              ...formData.vipPreferences,
                              communicationPreference: e.target.value as any
                            }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="email">Email</option>
                          <option value="phone">Phone</option>
                          <option value="sms">SMS</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Emergency Contact */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contact</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contact Name</label>
                    <input
                      type="text"
                      value={formData.emergencyContactDetails.name}
                      onChange={(e) => setFormData({
                        ...formData,
                        emergencyContactDetails: {
                          ...formData.emergencyContactDetails,
                          name: e.target.value
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Relationship</label>
                    <input
                      type="text"
                      value={formData.emergencyContactDetails.relationship}
                      onChange={(e) => setFormData({
                        ...formData,
                        emergencyContactDetails: {
                          ...formData.emergencyContactDetails,
                          relationship: e.target.value
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={formData.emergencyContactDetails.phone}
                      onChange={(e) => setFormData({
                        ...formData,
                        emergencyContactDetails: {
                          ...formData.emergencyContactDetails,
                          phone: e.target.value
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={formData.emergencyContactDetails.email}
                      onChange={(e) => setFormData({
                        ...formData,
                        emergencyContactDetails: {
                          ...formData.emergencyContactDetails,
                          email: e.target.value
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowGuestForm(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                >
                  Add Guest
                </button>
              </div>
            </form>
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
      adults: 1,
      children: 0,
      specialRequests: '',
      source: 'direct' as const
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      const room = rooms.find(r => r.id === formData.roomId);
      if (!room) return;

      const checkInDate = new Date(formData.checkIn);
      const checkOutDate = new Date(formData.checkOut);
      const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
      
      addBooking({
        ...formData,
        status: 'confirmed',
        totalAmount: room.rate * nights,
        currency: 'USD',
        paymentStatus: 'pending',
        createdAt: new Date().toISOString(),
        confirmationNumber: `HM${Date.now().toString().slice(-6)}`
      });
      
      setShowBookingForm(false);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 max-w-2xl w-full m-4">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold">New Booking</h3>
            <button
              onClick={() => setShowBookingForm(false)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
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
                    <option key={guest.id} value={guest.id}>
                      {guest.name} - {guest.email}
                    </option>
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
                      Room {room.number} - {room.type} ({formatCurrency(room.rate)}/night)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Check-in Date</label>
                <input
                  type="date"
                  value={formData.checkIn}
                  onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
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
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Special Requests</label>
              <textarea
                value={formData.specialRequests}
                onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                rows={3}
              />
            </div>

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => setShowBookingForm(false)}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
              >
                Create Booking
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
        </div>
        <div className="flex space-x-4">
          <button
            onClick={() => setShowGuestForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Plus className="w-4 h-4" />
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
              { id: 'guests', name: 'Guests', icon: Users }
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

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={`Search ${view}...`}
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
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </button>
        </div>
      </div>

      {/* Rooms View */}
      {view === 'rooms' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map((room) => (
            <div key={room.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="aspect-video bg-gray-200 relative">
                <img
                  src={room.photos[0]}
                  alt={`Room ${room.number}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(room.status)}`}>
                    {room.status}
                  </span>
                </div>
                {room.isVipRoom && (
                  <div className="absolute top-4 left-4">
                    <span className="flex items-center space-x-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold">
                      <Crown className="w-3 h-3" />
                      <span>VIP Room</span>
                    </span>
                  </div>
                )}
              </div>
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">Room {room.number}</h3>
                  <span className="text-lg font-semibold text-green-600">{formatCurrency(room.rate)}/night</span>
                </div>
                
                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <Bed className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600 capitalize">{room.type}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Max {room.maxOccupancy || 2}</span>
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
                  <button
                    onClick={() => setSelectedRoom(room)}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View Details</span>
                  </button>
                  <button
                    onClick={() => updateRoomStatus(room.id, room.status === 'clean' ? 'dirty' : 'clean')}
                    className={`px-4 py-2 rounded-lg ${
                      room.status === 'clean' 
                        ? 'bg-orange-600 text-white hover:bg-orange-700' 
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {room.status === 'clean' ? 'Mark Dirty' : 'Mark Clean'}
                  </button>
                </div>
              </div>
            </div>
          ))}
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
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                              <span className="text-indigo-600 font-medium">{guest?.name.charAt(0)}</span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{guest?.name}</div>
                            <div className="text-sm text-gray-500">{guest?.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">Room {room?.number}</div>
                        <div className="text-sm text-gray-500 capitalize">{room?.type}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{new Date(booking.checkIn).toLocaleDateString()}</div>
                        <div className="text-sm text-gray-500">{new Date(booking.checkOut).toLocaleDateString()}</div>
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
                                setSelectedGuest(guest || null);
                                setSelectedRoom(room || null);
                                setShowBillGenerator(true);
                              }}
                              className="text-orange-600 hover:text-orange-900"
                            >
                              Check Out
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setSelectedBooking(booking);
                              setSelectedGuest(guest || null);
                              setSelectedRoom(room || null);
                            }}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
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

      {/* Guests View */}
      {view === 'guests' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guest</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stays</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Documents</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {guests.map((guest) => {
                  const activeBooking = bookings.find(b => b.guestId === guest.id && b.status === 'checked-in');
                  const hasIdDocuments = guest.idProofDocuments && guest.idProofDocuments.length > 0;
                  
                  return (
                    <tr key={guest.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                              <span className="text-indigo-600 font-medium">{guest.name.charAt(0)}</span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-gray-900">{guest.name}</span>
                              {guest.vipStatus && (
                                <div className="flex items-center space-x-1">
                                  {getVipTierIcon(guest.vipTier)}
                                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getVipTierColor(guest.vipTier)}`}>
                                    {guest.vipTier?.toUpperCase() || 'VIP'}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="text-sm text-gray-500">{guest.nationality}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{guest.email}</div>
                        <div className="text-sm text-gray-500">{guest.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {activeBooking ? (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            In House
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                            Not Checked In
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {guest.totalStays} stays
                        {guest.lastStayDate && (
                          <div className="text-xs text-gray-500">
                            Last: {new Date(guest.lastStayDate).toLocaleDateString()}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {hasIdDocuments ? (
                          <div className="flex items-center space-x-2">
                            <FileText className="w-4 h-4 text-green-600" />
                            <span className="text-sm text-green-600">
                              {guest.idProofDocuments.length} document{guest.idProofDocuments.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <AlertCircle className="w-4 h-4 text-orange-600" />
                            <span className="text-sm text-orange-600">No documents</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setSelectedGuest(guest);
                            }}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setShowBookingForm(true);
                              // Pre-fill guest ID in booking form
                            }}
                            className="text-green-600 hover:text-green-900"
                          >
                            Book
                          </button>
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

      {showGuestForm && <GuestForm />}
      {showBookingForm && <BookingForm />}
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