import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { CalendarIcon, BellIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function Bookings() {
  const { supabase } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    paymentStatus: 'all',
  });

  useEffect(() => {
    fetchBookings();
  }, [filters]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      
      // Build query with related doctor and user information
      let query = supabase.from('bookings').select(`
        *,
        doctors (id, name, phone_number, specialty),
        users (id, phone_number, first_name)
      `);
      
      // Apply filters if not set to 'all'
      if (filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      
      if (filters.paymentStatus !== 'all') {
        query = query.eq('payment_status', filters.paymentStatus);
      }
      
      // Apply ordering
      query = query.order('booking_date', { ascending: false });
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value,
    });
  };

  const handleNotifyDoctor = async (bookingId) => {
    try {
      // Use the API endpoint to send notification
      const response = await fetch(`/api/bookings/notify/${bookingId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to send notification');
      }
      
      toast.success('Doctor notification sent successfully');
      
      // Refresh bookings to show updated notification status
      fetchBookings();
    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error(error.message || 'Failed to send notification');
    }
  };

  const getStatusBadgeClasses = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 ring-green-600/20';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 ring-blue-600/20';
      case 'cancelled':
        return 'bg-red-100 text-red-800 ring-red-600/20';
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800 ring-yellow-600/20';
    }
  };

  const getPaymentStatusBadgeClasses = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 ring-green-600/20';
      case 'refunded':
        return 'bg-purple-100 text-purple-800 ring-purple-600/20';
      case 'failed':
        return 'bg-red-100 text-red-800 ring-red-600/20';
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800 ring-yellow-600/20';
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Doctor Bookings</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all doctor consultations booked through the OMA Health Assistant.
          </p>
        </div>
      </div>
      
      {/* Filters */}
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            Booking Status
          </label>
          <select
            id="status"
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div>
          <label htmlFor="paymentStatus" className="block text-sm font-medium text-gray-700">
            Payment Status
          </label>
          <select
            id="paymentStatus"
            name="paymentStatus"
            value={filters.paymentStatus}
            onChange={handleFilterChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          >
            <option value="all">All Payments</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
      </div>
      
      {loading ? (
        <div className="mt-8 text-center">
          <p className="text-gray-500">Loading bookings...</p>
        </div>
      ) : (
        <div className="mt-8 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              {bookings.length === 0 ? (
                <div className="text-center py-10 bg-white shadow overflow-hidden sm:rounded-lg">
                  <p className="text-gray-500">No bookings found</p>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-300">
                  <thead>
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">
                        Appointment ID
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Doctor
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Patient
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Date
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Status
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Payment
                      </th>
                      <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {bookings.map((booking) => (
                      <tr key={booking.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                          <Link to={`/admin/bookings/${booking.id}`} className="text-primary-600 hover:text-primary-900">
                            {booking.appointment_id}
                          </Link>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <Link to={`/doctors/${booking.doctor_id}`} className="text-primary-600 hover:text-primary-900">
                            {booking.doctors?.name || 'Unknown doctor'}
                          </Link>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <Link to={`/users/${booking.user_id}`} className="text-primary-600 hover:text-primary-900">
                            {booking.users?.first_name || 'Unknown'} ({booking.users?.phone_number})
                          </Link>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {new Date(booking.booking_date).toLocaleString()}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                          <span className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-sm font-medium ${getStatusBadgeClasses(booking.status)}`}>
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                          <span className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-sm font-medium ${getPaymentStatusBadgeClasses(booking.payment_status)}`}>
                            {booking.payment_status.charAt(0).toUpperCase() + booking.payment_status.slice(1)}
                          </span>
                          {booking.payment_status === 'paid' && (
                            <span className="ml-2 text-gray-500">
                              GH₵{booking.payment_amount}
                            </span>
                          )}
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                          <div className="flex items-center justify-end space-x-3">
                            <Link to={`/admin/bookings/${booking.id}`} className="text-primary-600 hover:text-primary-900">
                              <CalendarIcon className="h-5 w-5" aria-hidden="true" />
                              <span className="sr-only">View booking {booking.appointment_id}</span>
                            </Link>
                            {booking.payment_status === 'paid' && !booking.doctor_notified && (
                              <button
                                onClick={() => handleNotifyDoctor(booking.id)}
                                className="text-primary-600 hover:text-primary-900"
                                title="Notify Doctor"
                              >
                                <BellIcon className="h-5 w-5" aria-hidden="true" />
                                <span className="sr-only">Notify doctor about booking {booking.appointment_id}</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 