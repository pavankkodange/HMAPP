import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useHotel } from '../context/HotelContext';
import { useCurrency } from '../context/CurrencyContext';
import { useBranding } from '../context/BrandingContext';
import { 
  Bed, 
  Users, 
  Calendar, 
  UtensilsCrossed, 
  DollarSign, 
  TrendingUp,
  Clock,
  CheckCircle,
  ArrowRight,
  AlertCircle,
  Plus,
  Eye
} from 'lucide-react';

interface DashboardProps {
  onModuleChange: (module: string, filter?: any) => void;
}

export function Dashboard({ onModuleChange }: DashboardProps) {
  const { user } = useAuth();
  const { rooms, bookings, banquetBookings, restaurantTables, roomServiceOrders } = useHotel();
  const { formatCurrency, hotelSettings } = useCurrency();
  const { branding, formatDateTime, formatTime, getCurrentDate, getCurrentTime } = useBranding();

  const today = getCurrentDate();
  const currentMonth = today.slice(0, 7); // YYYY-MM format

  // Calculate accurate revenue
  const calculateRevenue = () => {
    let todayRevenue = 0;
    let monthRevenue = 0;

    // Room revenue from bookings
    bookings.forEach(booking => {
      const totalCharges = booking.charges.reduce((sum, charge) => sum + charge.amount, 0);
      
      // Today's revenue (check-ins today or charges posted today)
      if (booking.checkIn === today || booking.charges.some(charge => charge.date === today)) {
        todayRevenue += totalCharges;
      }
      
      // Monthly revenue (check-ins this month or charges this month)
      if (booking.checkIn.startsWith(currentMonth) || booking.charges.some(charge => charge.date.startsWith(currentMonth))) {
        monthRevenue += totalCharges;
      }
    });

    // Banquet revenue
    banquetBookings.forEach(booking => {
      if (booking.date === today) {
        todayRevenue += booking.totalAmount;
      }
      if (booking.date.startsWith(currentMonth)) {
        monthRevenue += booking.totalAmount;
      }
    });

    // Room service revenue
    roomServiceOrders.forEach(order => {
      const orderDate = order.orderTime.split('T')[0];
      if (orderDate === today) {
        todayRevenue += order.total;
      }
      if (orderDate.startsWith(currentMonth)) {
        monthRevenue += order.total;
      }
    });

    return { todayRevenue, monthRevenue };
  };

  const { todayRevenue, monthRevenue } = calculateRevenue();

  const stats = {
    totalRooms: rooms.length,
    occupiedRooms: rooms.filter(r => r.status === 'occupied').length,
    dirtyRooms: rooms.filter(r => r.status === 'dirty').length,
    cleanRooms: rooms.filter(r => r.status === 'clean').length,
    todayCheckIns: bookings.filter(b => b.checkIn === today).length,
    todayCheckOuts: bookings.filter(b => b.checkOut === today).length,
    activeBanquets: banquetBookings.filter(b => b.date === today).length,
    availableTables: restaurantTables.filter(t => t.status === 'available').length,
    occupiedTables: restaurantTables.filter(t => t.status === 'occupied').length,
    pendingRoomService: roomServiceOrders.filter(o => ['pending', 'confirmed', 'preparing'].includes(o.status)).length,
    todayRevenue,
    monthRevenue
  };

  const occupancyRate = stats.totalRooms > 0 ? ((stats.occupiedRooms / stats.totalRooms) * 100).toFixed(1) : '0.0';

  const getGreeting = () => {
    const currentTime = getCurrentTime();
    const hour = parseInt(currentTime.split(':')[0]);
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Role-specific dashboard content
  const getRoleSpecificContent = () => {
    switch (user?.role) {
      case 'housekeeping':
        return {
          title: 'Housekeeping Dashboard',
          subtitle: 'Your room cleaning assignments and status updates',
          primaryStats: [
            {
              title: 'Rooms to Clean',
              value: stats.dirtyRooms,
              icon: AlertCircle,
              color: 'orange',
              onClick: () => onModuleChange('housekeeping', { filter: 'dirty' }),
              urgent: stats.dirtyRooms > 0
            },
            {
              title: 'Clean Rooms',
              value: stats.cleanRooms,
              icon: CheckCircle,
              color: 'green',
              onClick: () => onModuleChange('rooms', { statusFilter: 'clean' })
            },
            {
              title: 'Check-outs Today',
              value: stats.todayCheckOuts,
              icon: Clock,
              color: 'blue',
              onClick: () => onModuleChange('rooms', { view: 'bookings', dateFilter: 'check-out-today' }),
              urgent: stats.todayCheckOuts > 0
            }
          ]
        };
      
      case 'restaurant':
        return {
          title: 'Restaurant Dashboard',
          subtitle: 'Restaurant operations and room service management',
          primaryStats: [
            {
              title: 'Available Tables',
              value: stats.availableTables,
              icon: UtensilsCrossed,
              color: 'green',
              onClick: () => onModuleChange('restaurant', { tableFilter: 'available' })
            },
            {
              title: 'Occupied Tables',
              value: stats.occupiedTables,
              icon: Users,
              color: 'blue',
              onClick: () => onModuleChange('restaurant', { tableFilter: 'occupied' })
            },
            {
              title: 'Pending Room Service',
              value: stats.pendingRoomService,
              icon: Clock,
              color: 'orange',
              onClick: () => onModuleChange('room-service', { view: 'kitchen-orders', statusFilter: 'pending' }),
              urgent: stats.pendingRoomService > 0
            }
          ]
        };
      
      case 'front-desk':
        return {
          title: 'Front Desk Dashboard',
          subtitle: 'Guest services and reservation management',
          primaryStats: [
            {
              title: 'Check-ins Today',
              value: stats.todayCheckIns,
              icon: Clock,
              color: 'green',
              onClick: () => onModuleChange('rooms', { view: 'bookings', dateFilter: 'check-in-today' }),
              urgent: stats.todayCheckIns > 0
            },
            {
              title: 'Check-outs Today',
              value: stats.todayCheckOuts,
              icon: CheckCircle,
              color: 'orange',
              onClick: () => onModuleChange('rooms', { view: 'bookings', dateFilter: 'check-out-today' }),
              urgent: stats.todayCheckOuts > 0
            },
            {
              title: 'Occupancy Rate',
              value: `${occupancyRate}%`,
              icon: Bed,
              color: 'blue',
              onClick: () => onModuleChange('rooms', { statusFilter: 'occupied' })
            }
          ]
        };
      
      default:
        return {
          title: `Welcome to VervConnect`,
          subtitle: `Here's what's happening at ${branding.hotelName} today`,
          primaryStats: [
            {
              title: 'Rooms Occupied',
              value: `${stats.occupiedRooms}/${stats.totalRooms}`,
              subtitle: `${occupancyRate}% occupancy`,
              icon: Bed,
              color: 'blue',
              onClick: () => onModuleChange('rooms', { statusFilter: 'occupied' })
            },
            {
              title: 'Check-ins Today',
              value: stats.todayCheckIns,
              icon: Clock,
              color: 'green',
              onClick: () => onModuleChange('rooms', { view: 'bookings', dateFilter: 'check-in-today' }),
              urgent: stats.todayCheckIns > 0
            },
            {
              title: 'Check-outs Today',
              value: stats.todayCheckOuts,
              icon: CheckCircle,
              color: 'orange',
              onClick: () => onModuleChange('rooms', { view: 'bookings', dateFilter: 'check-out-today' }),
              urgent: stats.todayCheckOuts > 0
            },
            {
              title: 'Revenue Today',
              value: formatCurrency(stats.todayRevenue),
              icon: DollarSign,
              color: 'emerald',
              onClick: () => onModuleChange('rooms', { view: 'bookings', revenueFilter: 'today' })
            }
          ]
        };
    }
  };

  const roleContent = getRoleSpecificContent();

  const ClickableCard = ({ 
    title, 
    value, 
    icon: Icon, 
    color = 'indigo', 
    subtitle, 
    onClick,
    urgent = false
  }: {
    title: string;
    value: string | number;
    icon: React.ElementType;
    color?: string;
    subtitle?: string;
    onClick?: () => void;
    urgent?: boolean;
  }) => (
    <div 
      className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 transition-all duration-200 ${
        onClick ? 'hover:shadow-md hover:scale-105 cursor-pointer' : ''
      } ${urgent ? 'ring-2 ring-red-200 bg-red-50' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm font-medium ${urgent ? 'text-red-700' : 'text-gray-600'}`}>{title}</p>
          <p className={`text-3xl font-bold mt-2 ${urgent ? 'text-red-900' : 'text-gray-900'}`}>{value}</p>
          {subtitle && <p className={`text-sm mt-1 ${urgent ? 'text-red-600' : 'text-gray-500'}`}>{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-lg ${urgent ? 'bg-red-200' : `bg-${color}-100`}`}>
          <Icon className={`w-6 h-6 ${urgent ? 'text-red-700' : `text-${color}-600`}`} />
        </div>
      </div>
      {onClick && (
        <div className="mt-4 flex items-center text-sm text-indigo-600 font-medium">
          <span>View Details</span>
          <ArrowRight className="w-4 h-4 ml-1" />
        </div>
      )}
    </div>
  );

  const QuickActionCard = ({ 
    title, 
    description, 
    icon: Icon, 
    color, 
    onClick 
  }: {
    title: string;
    description: string;
    icon: React.ElementType;
    color: string;
    onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      className={`p-6 text-left rounded-xl border-2 border-dashed border-${color}-300 hover:border-${color}-400 hover:bg-${color}-50 transition-all duration-200 group`}
    >
      <Icon className={`w-8 h-8 text-${color}-600 mb-3 group-hover:scale-110 transition-transform`} />
      <h4 className={`font-semibold text-${color}-900 mb-1`}>{title}</h4>
      <p className={`text-sm text-${color}-700`}>{description}</p>
    </button>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {getGreeting()}, {user?.name}!
        </h1>
        <p className="text-gray-600 mt-2">{roleContent.subtitle}</p>
        <div className="mt-2 text-sm text-gray-500">
          Current time: {formatTime(getCurrentTime())} • {formatDateTime(new Date())}
        </div>
        
        {/* VervConnect Tagline */}
        <div className="mt-3 flex items-center space-x-2">
          <div className="h-1 w-12 bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600 rounded-full"></div>
          <span className="text-sm font-medium bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 bg-clip-text text-transparent">
            Connect with Comfort
          </span>
          <div className="h-1 w-12 bg-gradient-to-r from-teal-400 via-blue-500 to-green-500 rounded-full"></div>
        </div>
      </div>

      {/* Role-specific Primary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {roleContent.primaryStats.map((stat, index) => (
          <ClickableCard
            key={index}
            title={stat.title}
            value={stat.value}
            subtitle={stat.subtitle}
            icon={stat.icon}
            color={stat.color}
            onClick={stat.onClick}
            urgent={stat.urgent}
          />
        ))}
      </div>

      {/* Role-specific Quick Actions */}
      {(user?.role === 'admin' || user?.role === 'manager' || user?.role === 'front-desk') && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <Plus className="w-5 h-5 mr-2 text-indigo-600" />
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <QuickActionCard
              title="New Booking"
              description="Create a room reservation"
              icon={Calendar}
              color="blue"
              onClick={() => onModuleChange('rooms', { action: 'new-booking' })}
            />
            <QuickActionCard
              title="Check-in Guest"
              description="Process guest arrival"
              icon={CheckCircle}
              color="green"
              onClick={() => onModuleChange('rooms', { view: 'bookings', action: 'check-in' })}
            />
            {(user?.role === 'admin' || user?.role === 'manager') && (
              <>
                <QuickActionCard
                  title="Table Reservation"
                  description="Reserve restaurant table"
                  icon={UtensilsCrossed}
                  color="orange"
                  onClick={() => onModuleChange('restaurant', { action: 'new-reservation' })}
                />
                <QuickActionCard
                  title="Event Booking"
                  description="Schedule banquet event"
                  icon={Users}
                  color="purple"
                  onClick={() => onModuleChange('banquet', { action: 'new-booking' })}
                />
              </>
            )}
          </div>
        </div>
      )}

      {/* Today's Activity - Relevant to all roles */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Calendar className="w-5 h-5 mr-2 text-indigo-600" />
          Today's Activity
        </h3>
        <div className="space-y-3">
          {user?.role === 'housekeeping' ? (
            <>
              {stats.dirtyRooms > 0 && (
                <button
                  onClick={() => onModuleChange('housekeeping', { filter: 'dirty' })}
                  className="w-full flex items-center space-x-3 p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
                >
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                  <span className="text-sm text-orange-800 flex-1 text-left">
                    <strong>{stats.dirtyRooms}</strong> room{stats.dirtyRooms !== 1 ? 's' : ''} need{stats.dirtyRooms === 1 ? 's' : ''} cleaning
                  </span>
                  <ArrowRight className="w-4 h-4 text-orange-600" />
                </button>
              )}
              {stats.todayCheckOuts > 0 && (
                <button
                  onClick={() => onModuleChange('rooms', { view: 'bookings', dateFilter: 'check-out-today' })}
                  className="w-full flex items-center space-x-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span className="text-sm text-blue-800 flex-1 text-left">
                    <strong>{stats.todayCheckOuts}</strong> guest{stats.todayCheckOuts !== 1 ? 's' : ''} checking out today
                  </span>
                  <ArrowRight className="w-4 h-4 text-blue-600" />
                </button>
              )}
            </>
          ) : user?.role === 'restaurant' ? (
            <>
              {stats.pendingRoomService > 0 && (
                <button
                  onClick={() => onModuleChange('room-service', { view: 'kitchen-orders', statusFilter: 'pending' })}
                  className="w-full flex items-center space-x-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <UtensilsCrossed className="w-5 h-5 text-blue-600" />
                  <span className="text-sm text-blue-800 flex-1 text-left">
                    <strong>{stats.pendingRoomService}</strong> room service order{stats.pendingRoomService !== 1 ? 's' : ''} pending
                  </span>
                  <ArrowRight className="w-4 h-4 text-blue-600" />
                </button>
              )}
              {stats.occupiedTables > 0 && (
                <button
                  onClick={() => onModuleChange('restaurant', { tableFilter: 'occupied' })}
                  className="w-full flex items-center space-x-3 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <Users className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-green-800 flex-1 text-left">
                    <strong>{stats.occupiedTables}</strong> table{stats.occupiedTables !== 1 ? 's' : ''} currently occupied
                  </span>
                  <ArrowRight className="w-4 h-4 text-green-600" />
                </button>
              )}
            </>
          ) : (
            <>
              {stats.todayCheckIns > 0 && (
                <button
                  onClick={() => onModuleChange('rooms', { view: 'bookings', dateFilter: 'check-in-today' })}
                  className="w-full flex items-center space-x-3 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-green-800 flex-1 text-left">
                    <strong>{stats.todayCheckIns}</strong> guest{stats.todayCheckIns !== 1 ? 's' : ''} checking in today
                  </span>
                  <ArrowRight className="w-4 h-4 text-green-600" />
                </button>
              )}
              {stats.todayCheckOuts > 0 && (
                <button
                  onClick={() => onModuleChange('rooms', { view: 'bookings', dateFilter: 'check-out-today' })}
                  className="w-full flex items-center space-x-3 p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
                >
                  <Clock className="w-5 h-5 text-orange-600" />
                  <span className="text-sm text-orange-800 flex-1 text-left">
                    <strong>{stats.todayCheckOuts}</strong> guest{stats.todayCheckOuts !== 1 ? 's' : ''} checking out today
                  </span>
                  <ArrowRight className="w-4 h-4 text-orange-600" />
                </button>
              )}
              {stats.activeBanquets > 0 && (
                <button
                  onClick={() => onModuleChange('banquet', { dateFilter: 'today' })}
                  className="w-full flex items-center space-x-3 p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  <Users className="w-5 h-5 text-purple-600" />
                  <span className="text-sm text-purple-800 flex-1 text-left">
                    <strong>{stats.activeBanquets}</strong> banquet event{stats.activeBanquets !== 1 ? 's' : ''} scheduled today
                  </span>
                  <ArrowRight className="w-4 h-4 text-purple-600" />
                </button>
              )}
              {stats.pendingRoomService > 0 && (
                <button
                  onClick={() => onModuleChange('room-service', { view: 'kitchen-orders', statusFilter: 'pending' })}
                  className="w-full flex items-center space-x-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <UtensilsCrossed className="w-5 h-5 text-blue-600" />
                  <span className="text-sm text-blue-800 flex-1 text-left">
                    <strong>{stats.pendingRoomService}</strong> room service order{stats.pendingRoomService !== 1 ? 's' : ''} pending
                  </span>
                  <ArrowRight className="w-4 h-4 text-blue-600" />
                </button>
              )}
              {stats.dirtyRooms > 0 && (
                <button
                  onClick={() => onModuleChange('housekeeping', { filter: 'dirty' })}
                  className="w-full flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
                >
                  <Bed className="w-5 h-5 text-yellow-600" />
                  <span className="text-sm text-yellow-800 flex-1 text-left">
                    <strong>{stats.dirtyRooms}</strong> room{stats.dirtyRooms !== 1 ? 's' : ''} need{stats.dirtyRooms === 1 ? 's' : ''} cleaning
                  </span>
                  <ArrowRight className="w-4 h-4 text-yellow-600" />
                </button>
              )}
            </>
          )}
          
          {/* Show "all caught up" message when no activities */}
          {((user?.role === 'housekeeping' && stats.dirtyRooms === 0 && stats.todayCheckOuts === 0) ||
            (user?.role === 'restaurant' && stats.pendingRoomService === 0 && stats.occupiedTables === 0) ||
            (user?.role !== 'housekeeping' && user?.role !== 'restaurant' && 
             stats.todayCheckIns === 0 && stats.todayCheckOuts === 0 && stats.activeBanquets === 0 && 
             stats.pendingRoomService === 0 && stats.dirtyRooms === 0)) && (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <p className="text-gray-500">All caught up! No urgent tasks for today.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}