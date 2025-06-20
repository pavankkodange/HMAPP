import React, { useState } from 'react';
import { useHotel } from '../context/HotelContext';
import { useCurrency } from '../context/CurrencyContext';
import { BrandingSettings } from './BrandingSettings';
import { 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Upload,
  Bed,
  Users,
  UtensilsCrossed,
  MapPin,
  DollarSign,
  Image,
  Wifi,
  Tv,
  Car,
  Coffee,
  Star,
  Music,
  Camera,
  Utensils,
  Globe,
  RefreshCw,
  Palette,
  Building,
  Cigarette,
  Ban
} from 'lucide-react';
import { Room, BanquetHall, RestaurantTable } from '../types';

export function AdminModule() {
  const { 
    rooms, 
    banquetHalls, 
    restaurantTables, 
    addRoom, 
    updateRoom, 
    deleteRoom,
    addBanquetHall,
    updateBanquetHall,
    deleteBanquetHall,
    addRestaurantTable,
    updateRestaurantTable,
    deleteRestaurantTable
  } = useHotel();
  
  const {
    currencies,
    hotelSettings,
    updateHotelSettings,
    formatCurrency,
    updateExchangeRates,
    lastUpdated
  } = useCurrency();
  
  const [activeTab, setActiveTab] = useState<'branding' | 'rooms' | 'banquet' | 'restaurant' | 'settings'>('branding');
  const [showRoomForm, setShowRoomForm] = useState(false);
  const [showHallForm, setShowHallForm] = useState(false);
  const [showTableForm, setShowTableForm] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isUpdatingRates, setIsUpdatingRates] = useState(false);

  const roomTypes = ['single', 'double', 'suite', 'deluxe'];
  const roomAmenities = ['WiFi', 'AC', 'TV', 'Mini Bar', 'Balcony', 'Jacuzzi', 'Safe', 'Parking'];
  const hallAmenities = ['Stage', 'Audio System', 'Lighting', 'Dance Floor', 'Catering', 'Photography', 'Decorations', 'Parking'];

  const handleUpdateRates = async () => {
    setIsUpdatingRates(true);
    await updateExchangeRates();
    setIsUpdatingRates(false);
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

  const CurrencySettings = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Globe className="w-6 h-6 text-indigo-600" />
          <h3 className="text-lg font-semibold text-gray-900">Currency Settings</h3>
        </div>
        <button
          onClick={handleUpdateRates}
          disabled={isUpdatingRates}
          className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isUpdatingRates ? 'animate-spin' : ''}`} />
          <span>{isUpdatingRates ? 'Updating...' : 'Update Rates'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Base Currency</label>
          <select
            value={hotelSettings.baseCurrency}
            onChange={(e) => updateHotelSettings({ baseCurrency: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            {currencies.map((currency) => (
              <option key={currency.code} value={currency.code}>
                {currency.code} - {currency.name} ({currency.symbol})
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">Currency used for internal calculations and storage</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Display Currency</label>
          <select
            value={hotelSettings.displayCurrency}
            onChange={(e) => updateHotelSettings({ displayCurrency: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            {currencies.map((currency) => (
              <option key={currency.code} value={currency.code}>
                {currency.code} - {currency.name} ({currency.symbol})
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">Currency shown to guests and staff</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Decimal Places</label>
          <select
            value={hotelSettings.decimalPlaces}
            onChange={(e) => updateHotelSettings({ decimalPlaces: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value={0}>0 (¥1,000)</option>
            <option value={2}>2 ($10.00)</option>
            <option value={3}>3 ($10.000)</option>
          </select>
        </div>

        <div className="space-y-4">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={hotelSettings.autoConvert}
              onChange={(e) => updateHotelSettings({ autoConvert: e.target.checked })}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm font-medium text-gray-700">Auto-convert prices</span>
          </label>
          
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={hotelSettings.showCurrencyCode}
              onChange={(e) => updateHotelSettings({ showCurrencyCode: e.target.checked })}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm font-medium text-gray-700">Show currency codes</span>
          </label>
        </div>
      </div>

      {lastUpdated && (
        <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
          <p className="text-sm text-green-700">
            Exchange rates last updated: {lastUpdated.toLocaleString()}
          </p>
        </div>
      )}

      <div className="mt-6">
        <h4 className="text-md font-semibold text-gray-900 mb-4">Currency Preview</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['USD', 'EUR', 'GBP', 'JPY', 'CNY', 'INR', 'AED', 'CAD'].map((code) => {
            const currency = currencies.find(c => c.code === code);
            if (!currency) return null;
            
            return (
              <div key={code} className="p-3 bg-gray-50 rounded-lg text-center">
                <div className="text-sm font-medium text-gray-900">{code}</div>
                <div className="text-lg font-bold text-indigo-600">
                  {formatCurrency(100, code)}
                </div>
                <div className="text-xs text-gray-500">{currency.name}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const RoomForm = () => {
    const [formData, setFormData] = useState({
      number: editingItem?.number || '',
      type: editingItem?.type || 'single',
      rate: editingItem?.rate || '',
      photos: editingItem?.photos || [''],
      amenities: editingItem?.amenities || [],
      smokingAllowed: editingItem?.smokingAllowed || false,
      floor: editingItem?.floor || '',
      maxOccupancy: editingItem?.maxOccupancy || '',
      size: editingItem?.size || '',
      bedType: editingItem?.bedType || '',
      view: editingItem?.view || ''
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const roomData = {
        ...formData,
        rate: parseFloat(formData.rate),
        photos: formData.photos.filter(photo => photo.trim() !== ''),
        status: editingItem?.status || 'clean' as Room['status'],
        floor: formData.floor ? parseInt(formData.floor) : undefined,
        maxOccupancy: formData.maxOccupancy ? parseInt(formData.maxOccupancy) : undefined,
        size: formData.size ? parseInt(formData.size) : undefined
      };

      if (editingItem) {
        updateRoom(editingItem.id, roomData);
      } else {
        addRoom(roomData);
      }

      setShowRoomForm(false);
      setEditingItem(null);
      setFormData({ 
        number: '', type: 'single', rate: '', photos: [''], amenities: [], 
        smokingAllowed: false, floor: '', maxOccupancy: '', size: '', bedType: '', view: ''
      });
    };

    const addPhotoField = () => {
      setFormData({ ...formData, photos: [...formData.photos, ''] });
    };

    const updatePhoto = (index: number, value: string) => {
      const newPhotos = [...formData.photos];
      newPhotos[index] = value;
      setFormData({ ...formData, photos: newPhotos });
    };

    const removePhoto = (index: number) => {
      const newPhotos = formData.photos.filter((_, i) => i !== index);
      setFormData({ ...formData, photos: newPhotos });
    };

    const toggleAmenity = (amenity: string) => {
      const newAmenities = formData.amenities.includes(amenity)
        ? formData.amenities.filter(a => a !== amenity)
        : [...formData.amenities, amenity];
      setFormData({ ...formData, amenities: newAmenities });
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 max-w-2xl w-full m-4 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold">{editingItem ? 'Edit Room' : 'Add New Room'}</h3>
            <button
              onClick={() => {
                setShowRoomForm(false);
                setEditingItem(null);
              }}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Room Number</label>
                <input
                  type="text"
                  value={formData.number}
                  onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Room Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as Room['type'] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  {roomTypes.map(type => (
                    <option key={type} value={type} className="capitalize">{type}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rate per Night ({hotelSettings.baseCurrency})
                </label>
                <input
                  type="number"
                  value={formData.rate}
                  onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Room Category</label>
                <div className="flex items-center space-x-6">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="smokingAllowed"
                      checked={!formData.smokingAllowed}
                      onChange={() => setFormData({ ...formData, smokingAllowed: false })}
                      className="text-green-600 focus:ring-green-500"
                    />
                    <div className="flex items-center space-x-1">
                      <Ban className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Non-Smoking</span>
                    </div>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="smokingAllowed"
                      checked={formData.smokingAllowed}
                      onChange={() => setFormData({ ...formData, smokingAllowed: true })}
                      className="text-orange-600 focus:ring-orange-500"
                    />
                    <div className="flex items-center space-x-1">
                      <Cigarette className="w-4 h-4 text-orange-600" />
                      <span className="text-sm">Smoking</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Floor</label>
                <input
                  type="number"
                  value={formData.floor}
                  onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Occupancy</label>
                <input
                  type="number"
                  value={formData.maxOccupancy}
                  onChange={(e) => setFormData({ ...formData, maxOccupancy: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Size (m²)</label>
                <input
                  type="number"
                  value={formData.size}
                  onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bed Type</label>
                <input
                  type="text"
                  value={formData.bedType}
                  onChange={(e) => setFormData({ ...formData, bedType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., King, Queen"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">View</label>
              <input
                type="text"
                value={formData.view}
                onChange={(e) => setFormData({ ...formData, view: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., Ocean, City, Garden, Mountain"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Photos (URLs)</label>
              {formData.photos.map((photo, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <input
                    type="url"
                    value={photo}
                    onChange={(e) => updatePhoto(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="https://example.com/photo.jpg"
                  />
                  {formData.photos.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addPhotoField}
                className="flex items-center space-x-2 px-3 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"
              >
                <Plus className="w-4 h-4" />
                <span>Add Photo</span>
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Amenities</label>
              <div className="grid grid-cols-2 gap-2">
                {roomAmenities.map(amenity => (
                  <label key={amenity} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.amenities.includes(amenity)}
                      onChange={() => toggleAmenity(amenity)}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm">{amenity}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex space-x-4 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowRoomForm(false);
                  setEditingItem(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                {editingItem ? 'Update Room' : 'Add Room'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const HallForm = () => {
    const [formData, setFormData] = useState({
      name: editingItem?.name || '',
      capacity: editingItem?.capacity || '',
      rate: editingItem?.rate || '',
      photos: editingItem?.photos || [''],
      amenities: editingItem?.amenities || []
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const hallData = {
        ...formData,
        capacity: parseInt(formData.capacity),
        rate: parseFloat(formData.rate),
        photos: formData.photos.filter(photo => photo.trim() !== '')
      };

      if (editingItem) {
        updateBanquetHall(editingItem.id, hallData);
      } else {
        addBanquetHall(hallData);
      }

      setShowHallForm(false);
      setEditingItem(null);
      setFormData({ name: '', capacity: '', rate: '', photos: [''], amenities: [] });
    };

    const addPhotoField = () => {
      setFormData({ ...formData, photos: [...formData.photos, ''] });
    };

    const updatePhoto = (index: number, value: string) => {
      const newPhotos = [...formData.photos];
      newPhotos[index] = value;
      setFormData({ ...formData, photos: newPhotos });
    };

    const removePhoto = (index: number) => {
      if (formData.photos.length > 1) {
        const newPhotos = formData.photos.filter((_, i) => i !== index);
        setFormData({ ...formData, photos: newPhotos });
      }
    };

    const toggleAmenity = (amenity: string) => {
      const newAmenities = formData.amenities.includes(amenity)
        ? formData.amenities.filter(a => a !== amenity)
        : [...formData.amenities, amenity];
      setFormData({ ...formData, amenities: newAmenities });
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 max-w-2xl w-full m-4 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold">{editingItem ? 'Edit Banquet Hall' : 'Add New Banquet Hall'}</h3>
            <button
              onClick={() => {
                setShowHallForm(false);
                setEditingItem(null);
              }}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hall Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Capacity (guests)</label>
                <input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  min="1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rate per Hour ({hotelSettings.baseCurrency})
                </label>
                <input
                  type="number"
                  value={formData.rate}
                  onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-gray-700">Hall Photos (URLs)</label>
                <button
                  type="button"
                  onClick={addPhotoField}
                  className="flex items-center space-x-2 px-3 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"
                >
                  <Camera className="w-4 h-4" />
                  <span>Add Photo</span>
                </button>
              </div>
              
              <div className="space-y-3">
                {formData.photos.map((photo, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                    <div className="flex-shrink-0">
                      <Image className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="url"
                      value={photo}
                      onChange={(e) => updatePhoto(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      placeholder={`Photo ${index + 1} URL - https://example.com/hall-photo-${index + 1}.jpg`}
                    />
                    {formData.photos.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove photo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start space-x-2">
                  <Camera className="w-4 h-4 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-700">
                    <p className="font-medium mb-1">Photo Tips:</p>
                    <ul className="text-xs space-y-1">
                      <li>• Add multiple angles: main hall, stage area, dining setup</li>
                      <li>• Include photos showing different event configurations</li>
                      <li>• Show lighting and decoration possibilities</li>
                      <li>• Capture capacity and space details</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Amenities & Features</label>
              <div className="grid grid-cols-2 gap-2">
                {hallAmenities.map(amenity => (
                  <label key={amenity} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.amenities.includes(amenity)}
                      onChange={() => toggleAmenity(amenity)}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm">{amenity}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex space-x-4 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowHallForm(false);
                  setEditingItem(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                {editingItem ? 'Update Hall' : 'Add Hall'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const TableForm = () => {
    const [formData, setFormData] = useState({
      number: editingItem?.number || '',
      seats: editingItem?.seats || '',
      position: editingItem?.position || { x: 50, y: 50 }
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const tableData = {
        ...formData,
        seats: parseInt(formData.seats),
        status: editingItem?.status || 'available' as RestaurantTable['status']
      };

      if (editingItem) {
        updateRestaurantTable(editingItem.id, tableData);
      } else {
        addRestaurantTable(tableData);
      }

      setShowTableForm(false);
      setEditingItem(null);
      setFormData({ number: '', seats: '', position: { x: 50, y: 50 } });
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full m-4">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold">{editingItem ? 'Edit Table' : 'Add New Table'}</h3>
            <button
              onClick={() => {
                setShowTableForm(false);
                setEditingItem(null);
              }}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Table Number</label>
              <input
                type="text"
                value={formData.number}
                onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Number of Seats</label>
              <input
                type="number"
                value={formData.seats}
                onChange={(e) => setFormData({ ...formData, seats: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                min="1"
                max="20"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Position X</label>
                <input
                  type="number"
                  value={formData.position.x}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    position: { ...formData.position, x: parseInt(e.target.value) || 0 }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  min="0"
                  max="350"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Position Y</label>
                <input
                  type="number"
                  value={formData.position.y}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    position: { ...formData.position, y: parseInt(e.target.value) || 0 }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  min="0"
                  max="300"
                />
              </div>
            </div>

            <div className="flex space-x-4 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowTableForm(false);
                  setEditingItem(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                {editingItem ? 'Update Table' : 'Add Table'}
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
          <h1 className="text-3xl font-bold text-gray-900">Hotel Administration</h1>
          <p className="text-gray-600 mt-2">Manage hotel settings, branding, rooms, banquet halls, and restaurant configuration</p>
        </div>
        <div className="flex items-center space-x-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg">
          <Settings className="w-5 h-5" />
          <span className="font-medium">Admin Panel</span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'branding', name: 'Hotel Branding', icon: Palette },
              { id: 'settings', name: 'System Settings', icon: Settings },
              { id: 'rooms', name: 'Rooms', icon: Bed, count: rooms.length },
              { id: 'banquet', name: 'Banquet Halls', icon: Users, count: banquetHalls.length },
              { id: 'restaurant', name: 'Restaurant Tables', icon: UtensilsCrossed, count: restaurantTables.length }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.name}</span>
                  {tab.count !== undefined && (
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      activeTab === tab.id ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Hotel Branding Tab */}
      {activeTab === 'branding' && <BrandingSettings />}

      {/* System Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-8">
          <CurrencySettings />
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">General Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Default Language</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                  <option value="zh">Chinese</option>
                  <option value="ja">Japanese</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date Format</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Time Format</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                  <option value="12">12 Hour (AM/PM)</option>
                  <option value="24">24 Hour</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Week Start</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                  <option value="sunday">Sunday</option>
                  <option value="monday">Monday</option>
                </select>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-200 mt-6">
              <button className="flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                <Save className="w-5 h-5" />
                <span>Save Settings</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rooms Management */}
      {activeTab === 'rooms' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Room Management</h2>
            <button
              onClick={() => setShowRoomForm(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4" />
              <span>Add Room</span>
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rate</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amenities</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rooms.map((room) => (
                  <tr key={room.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">Room {room.number}</div>
                      {room.floor && <div className="text-sm text-gray-500">Floor {room.floor}</div>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 capitalize">{room.type}</div>
                      {room.bedType && <div className="text-sm text-gray-500">{room.bedType}</div>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getSmokingIcon(room.smokingAllowed || false)}
                        <span className="text-sm font-medium text-gray-900">
                          {getSmokingLabel(room.smokingAllowed || false)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(room.rate)}/night
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 capitalize">
                        {room.status.replace('-', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {room.amenities.slice(0, 3).map((amenity) => (
                          <span key={amenity} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                            {amenity}
                          </span>
                        ))}
                        {room.amenities.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                            +{room.amenities.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setEditingItem(room);
                            setShowRoomForm(true);
                          }}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteRoom(room.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Banquet Halls Management */}
      {activeTab === 'banquet' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Banquet Hall Management</h2>
            <button
              onClick={() => setShowHallForm(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4" />
              <span>Add Hall</span>
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hall Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rate</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Photos</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amenities</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {banquetHalls.map((hall) => (
                  <tr key={hall.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{hall.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{hall.capacity} guests</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(hall.rate)}/hour
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <Camera className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {hall.photos.length} photo{hall.photos.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {hall.amenities.slice(0, 3).map((amenity) => (
                          <span key={amenity} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                            {amenity}
                          </span>
                        ))}
                        {hall.amenities.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                            +{hall.amenities.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setEditingItem(hall);
                            setShowHallForm(true);
                          }}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteBanquetHall(hall.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Restaurant Tables Management */}
      {activeTab === 'restaurant' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Restaurant Table Management</h2>
            <button
              onClick={() => setShowTableForm(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4" />
              <span>Add Table</span>
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Table</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seats</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {restaurantTables.map((table) => (
                  <tr key={table.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">Table {table.number}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{table.seats} seats</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 capitalize">
                        {table.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">X: {table.position.x}, Y: {table.position.y}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setEditingItem(table);
                            setShowTableForm(true);
                          }}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteRestaurantTable(table.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Forms */}
      {showRoomForm && <RoomForm />}
      {showHallForm && <HallForm />}
      {showTableForm && <TableForm />}
    </div>
  );
}