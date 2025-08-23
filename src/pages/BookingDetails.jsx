import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeftIcon, BellIcon, CheckCircleIcon, ClockIcon, CurrencyDollarIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function BookingDetails() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { supabase } = useAuth();
  
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [markingPaid, setMarkingPaid] = useState(false);
  const [formData, setFormData] = useState({
    status: '',
    payment_status: '',
    consultation_date: '',
    diagnosis_notes: '',
  });

  useEffect(() => {
    fetchBookingDetails();
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          doctors (id, name, phone_number, specialty, experience_years, consultation_fee),
          users (id, phone_number, first_name, gender, age_range, location)
        `)
        .eq('id', bookingId)
        .single();

      if (error) throw error;
      
      if (!data) {
        toast.error('Booking not found');
        navigate('/bookings');
        return;
      }
      
      setBooking(data);
      
      // Initialize form data
      setFormData({
        status: data.status || 'pending',
        payment_status: data.payment_status || 'pending',
        consultation_date: data.consultation_date ? new Date(data.consultation_date).toISOString().slice(0, 16) : '',
        diagnosis_notes: data.diagnosis_notes || '',
      });
    } catch (error) {
      console.error('Error fetching booking details:', error);
      toast.error('Failed to load booking details');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const updateData = {
        status: formData.status,
        payment_status: formData.payment_status,
        consultation_date: formData.consultation_date || null,
        diagnosis_notes: formData.diagnosis_notes,
      };
      
      const { data, error } = await supabase
        .from('bookings')
        .update(updateData)
        .eq('id', bookingId)
        .select()
        .single();

      if (error) throw error;

      setBooking({
        ...booking,
        ...data,
      });
      
      toast.success('Booking updated successfully');
      setEditMode(false);
    } catch (error) {
      console.error('Error updating booking:', error);
      toast.error('Failed to update booking');
    }
  };

  const handleMarkAsPaid = async () => {
    if (!booking) return;
    try {
      setMarkingPaid(true);
      // Update DB payment_status first for source of truth
      const { data, error } = await supabase
        .from('bookings')
        .update({ payment_status: 'paid' })
        .eq('id', bookingId)
        .select()
        .single();
      if (error) throw error;

      // Ask bot engine to send invoice PDF to user via WhatsApp
      const botUrl = import.meta.env.VITE_BOT_ENGINE_URL || 'https://oma-bot-engine-on1w.onrender.com';
      const resp = await fetch(`${botUrl}/payments/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId: booking.appointment_id,
          userPhone: booking.users?.phone_number,
          doctorName: booking.doctors?.name,
          amount: booking.payment_amount || booking.doctors?.consultation_fee || 0,
          currency: booking.payment_currency || 'GHS',
          reference: booking.payment_reference || `OMA-${booking.appointment_id}`
        })
      });
      const result = await resp.json();
      if (!resp.ok) throw new Error(result.error || 'Failed to complete payment');

      toast.success('Payment marked as paid. Invoice sent to patient.');
      setBooking({ ...booking, payment_status: 'paid' });
    } catch (err) {
      console.error('Error marking as paid:', err);
      toast.error(err.message || 'Failed to mark as paid');
    } finally {
      setMarkingPaid(false);
    }
  };

  const handleNotifyDoctor = async () => {
    try {
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
      
      // Refresh booking data to show updated notification status
      fetchBookingDetails();
    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error(error.message || 'Failed to send notification');
    }
  };

  // Format array of symptoms
  const formatSymptoms = (symptoms) => {
    if (!symptoms || symptoms.length === 0) return 'None reported';
    
    if (typeof symptoms === 'string') {
      try {
        const parsedSymptoms = JSON.parse(symptoms);
        if (Array.isArray(parsedSymptoms)) {
          return parsedSymptoms.join('\n');
        }
      } catch (e) {
        return symptoms;
      }
    }
    
    if (Array.isArray(symptoms)) {
      return symptoms.join('\n');
    }
    
    return 'Unable to display symptoms';
  };

  if (loading) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">Loading booking details...</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500">Booking not found</p>
        <Link to="/bookings" className="mt-4 inline-flex items-center text-primary-600 hover:text-primary-900">
          <ArrowLeftIcon className="h-5 w-5 mr-1" />
          Back to Bookings
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link to="/bookings" className="inline-flex items-center text-primary-600 hover:text-primary-900">
          <ArrowLeftIcon className="h-5 w-5 mr-1" />
          Back to Bookings
        </Link>
      </div>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Booking Details - {booking.appointment_id}
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Patient and doctor consultation information.
            </p>
          </div>
          <div className="flex space-x-2">
            {!booking.doctor_notified && booking.payment_status === 'paid' && (
              <button
                type="button"
                onClick={handleNotifyDoctor}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <BellIcon className="-ml-0.5 mr-1.5 h-4 w-4" aria-hidden="true" />
                Notify Doctor
              </button>
            )}
            
            {!editMode && booking.payment_status !== 'paid' && (
              <button
                type="button"
                onClick={handleMarkAsPaid}
                disabled={markingPaid}
                className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white ${markingPaid ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500`}
              >
                {markingPaid ? 'Marking…' : 'Mark as Paid'}
              </button>
            )}

            {editMode ? (
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setEditMode(false)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Save Changes
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setEditMode(true)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Edit
              </button>
            )}
          </div>
        </div>
        
        {editMode ? (
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <form className="space-y-6">
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                    Booking Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                
                <div className="sm:col-span-3">
                  <label htmlFor="payment_status" className="block text-sm font-medium text-gray-700">
                    Payment Status
                  </label>
                  <select
                    id="payment_status"
                    name="payment_status"
                    value={formData.payment_status}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="failed">Failed</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>
                
                <div className="sm:col-span-3">
                  <label htmlFor="consultation_date" className="block text-sm font-medium text-gray-700">
                    Consultation Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    id="consultation_date"
                    name="consultation_date"
                    value={formData.consultation_date}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  />
                </div>
                
                <div className="sm:col-span-6">
                  <label htmlFor="diagnosis_notes" className="block text-sm font-medium text-gray-700">
                    Diagnosis Notes
                  </label>
                  <textarea
                    id="diagnosis_notes"
                    name="diagnosis_notes"
                    rows={4}
                    value={formData.diagnosis_notes}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    placeholder="Notes about the patient's diagnosis"
                  />
                </div>
              </div>
            </form>
          </div>
        ) : (
          <div>
            <div className="border-t border-gray-200">
              <dl>
                {/* Booking Status */}
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                    <span className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-sm font-medium ${
                      booking.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : booking.status === 'confirmed'
                        ? 'bg-blue-100 text-blue-800'
                        : booking.status === 'cancelled'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                    
                    {booking.doctor_notified && (
                      <span className="ml-2 inline-flex items-center text-sm text-gray-500">
                        <CheckCircleIcon className="h-4 w-4 mr-1 text-green-500" />
                        Doctor notified on {new Date(booking.doctor_notified_at).toLocaleString()}
                      </span>
                    )}
                  </dd>
                </div>
                
                {/* Payment Info */}
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Payment</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                    <div className="flex items-center">
                      <span className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-sm font-medium ${
                        booking.payment_status === 'paid'
                          ? 'bg-green-100 text-green-800'
                          : booking.payment_status === 'refunded'
                          ? 'bg-purple-100 text-purple-800'
                          : booking.payment_status === 'failed'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {booking.payment_status.charAt(0).toUpperCase() + booking.payment_status.slice(1)}
                      </span>
                      
                      <span className="ml-2 flex items-center">
                        <CurrencyDollarIcon className="h-4 w-4 mr-1 text-gray-400" />
                        GH₵{booking.payment_amount || '0.00'} {booking.payment_currency}
                      </span>
                      
                      {booking.payment_reference && (
                        <span className="ml-2 text-gray-500">
                          Ref: {booking.payment_reference}
                        </span>
                      )}
                    </div>
                  </dd>
                </div>
                
                {/* Consultation Date */}
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Consultation Date</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                    <div className="flex items-center">
                      <ClockIcon className="h-4 w-4 mr-1 text-gray-400" />
                      {booking.consultation_date ? (
                        <span>{new Date(booking.consultation_date).toLocaleString()}</span>
                      ) : (
                        <span className="text-gray-500">Not scheduled yet</span>
                      )}
                    </div>
                  </dd>
                </div>
                
                {/* Booking Date */}
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Booking Created</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                    {new Date(booking.booking_date).toLocaleString()}
                  </dd>
                </div>
                
                {/* Doctor Info */}
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Doctor</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                    <div className="flex flex-col">
                      <Link to={`/doctors/${booking.doctor_id}`} className="text-primary-600 hover:text-primary-900 font-medium">
                        {booking.doctors?.name || 'Unknown doctor'}
                      </Link>
                      <span className="text-gray-500">{booking.doctors?.specialty}</span>
                      <span className="text-gray-500">
                        {booking.doctors?.experience_years ? `${booking.doctors.experience_years} years experience` : ''}
                      </span>
                      <span className="text-gray-500 mt-1">
                        WhatsApp: {booking.doctors?.phone_number}
                      </span>
                    </div>
                  </dd>
                </div>
                
                {/* Patient Info */}
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Patient</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                    <div className="flex flex-col">
                      <div className="flex items-center">
                        <UserCircleIcon className="h-5 w-5 mr-1 text-gray-400" />
                        <Link to={`/users/${booking.user_id}`} className="text-primary-600 hover:text-primary-900 font-medium">
                          {booking.users?.first_name || 'Unknown patient'}
                        </Link>
                      </div>
                      <span className="text-gray-500">
                        WhatsApp: {booking.users?.phone_number}
                      </span>
                      <div className="flex space-x-3 mt-1 text-gray-500">
                        <span>{booking.users?.gender || 'Gender not specified'}</span>
                        <span>•</span>
                        <span>{booking.users?.age_range || 'Age not specified'}</span>
                        <span>•</span>
                        <span>{booking.users?.location || 'Location not specified'}</span>
                      </div>
                    </div>
                  </dd>
                </div>
                
                {/* Symptoms */}
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Reported Symptoms</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                    <div className="whitespace-pre-line">
                      {formatSymptoms(booking.symptoms)}
                    </div>
                  </dd>
                </div>
                
                {/* Diagnosis Notes */}
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Diagnosis Notes</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                    <div className="whitespace-pre-line">
                      {booking.diagnosis_notes || 'No diagnosis notes available'}
                    </div>
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 