import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeftIcon, CalendarIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function DoctorProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { supabase } = useAuth();
  
  const [doctor, setDoctor] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone_number: '',
    specialty: '',
    bio: '',
    experience_years: '',
    consultation_fee: '',
    location: '',
    availability_status: 'available',
  });
  const [formErrors, setFormErrors] = useState({});
  const [availability, setAvailability] = useState([
    { day_of_week: 0, enabled: false, start_time: '09:00', end_time: '17:00' },
    { day_of_week: 1, enabled: true, start_time: '09:00', end_time: '17:00' },
    { day_of_week: 2, enabled: true, start_time: '09:00', end_time: '17:00' },
    { day_of_week: 3, enabled: true, start_time: '09:00', end_time: '17:00' },
    { day_of_week: 4, enabled: true, start_time: '09:00', end_time: '17:00' },
    { day_of_week: 5, enabled: false, start_time: '09:00', end_time: '12:00' },
    { day_of_week: 6, enabled: false, start_time: '09:00', end_time: '12:00' }
  ]);
  const [savingAvailability, setSavingAvailability] = useState(false);

  useEffect(() => {
    fetchDoctorData();
  }, [id]);

  const fetchDoctorData = async () => {
    try {
      setLoading(true);
      
      // Fetch doctor details
      const { data: doctorData, error: doctorError } = await supabase
        .from('doctors')
        .select('*')
        .eq('id', id)
        .single();

      if (doctorError) throw doctorError;
      
      if (!doctorData) {
        toast.error('Doctor not found');
        navigate('/doctors');
        return;
      }
      
      setDoctor(doctorData);
      
      // Initialize form data
      setFormData({
        name: doctorData.name || '',
        phone_number: doctorData.phone_number || '',
        specialty: doctorData.specialty || '',
        bio: doctorData.bio || '',
        experience_years: doctorData.experience_years?.toString() || '',
        consultation_fee: doctorData.consultation_fee?.toString() || '',
        location: doctorData.location || '',
        availability_status: doctorData.availability_status || 'available',
      });

      // Fetch weekly availability
      try {
        const { data: rules, error: availErr } = await supabase
          .from('doctor_availability')
          .select('*')
          .eq('doctor_id', id)
          .eq('is_active', true);
        if (!availErr && rules) {
          const map = new Map();
          for (const r of rules) {
            if (!map.has(r.day_of_week)) map.set(r.day_of_week, r);
          }
          setAvailability(prev => prev.map(d => {
            const r = map.get(d.day_of_week);
            return r ? {
              day_of_week: d.day_of_week,
              enabled: true,
              start_time: String(r.start_time).slice(0,5),
              end_time: String(r.end_time).slice(0,5)
            } : d;
          }));
        }
      } catch (e) {
        // ignore
      }
      
      // Fetch recent bookings
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          *,
          users (id, phone_number, first_name)
        `)
        .eq('doctor_id', id)
        .order('booking_date', { ascending: false })
        .limit(5);
      
      if (bookingsError) throw bookingsError;
      
      setBookings(bookingsData || []);
    } catch (error) {
      console.error('Error fetching doctor data:', error);
      toast.error('Failed to load doctor data');
    } finally {
      setLoading(false);
    }
  };

  const weekdayName = (i) => ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][i];

  const handleAvailabilityChange = (idx, field, value) => {
    setAvailability(prev => prev.map((row, i) => i === idx ? { ...row, [field]: value } : row));
  };

  const saveAvailability = async () => {
    if (!doctor) return;
    setSavingAvailability(true);
    try {
      const { error: delErr } = await supabase
        .from('doctor_availability')
        .delete()
        .eq('doctor_id', doctor.id);
      if (delErr) throw delErr;
      const rows = availability
        .filter(r => r.enabled)
        .map(r => ({
          doctor_id: doctor.id,
          day_of_week: r.day_of_week,
          start_time: r.start_time + ':00',
          end_time: r.end_time + ':00',
          timezone: 'Africa/Accra',
          is_active: true
        }));
      if (rows.length > 0) {
        const { error: insErr } = await supabase
          .from('doctor_availability')
          .insert(rows);
        if (insErr) throw insErr;
      }
      toast.success('Availability saved');
    } catch (e) {
      console.error('Save availability error:', e);
      toast.error('Failed to save availability');
    } finally {
      setSavingAvailability(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Clear error when field is edited
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null,
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!formData.phone_number.trim()) {
      errors.phone_number = 'Phone number is required';
    } else if (!/^\+?[0-9]{10,15}$/.test(formData.phone_number.trim())) {
      errors.phone_number = 'Please enter a valid phone number';
    }
    
    if (!formData.specialty.trim()) {
      errors.specialty = 'Specialty is required';
    }
    
    if (!formData.consultation_fee.trim()) {
      errors.consultation_fee = 'Consultation fee is required';
    } else if (isNaN(formData.consultation_fee) || parseFloat(formData.consultation_fee) <= 0) {
      errors.consultation_fee = 'Please enter a valid fee amount';
    }
    
    if (formData.experience_years && (isNaN(formData.experience_years) || parseInt(formData.experience_years) < 0)) {
      errors.experience_years = 'Please enter a valid number of years';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      // Format the consultation fee and experience years as numbers
      const formattedData = {
        ...formData,
        consultation_fee: parseFloat(formData.consultation_fee),
        experience_years: formData.experience_years ? parseInt(formData.experience_years) : null,
      };
      
      const { data, error } = await supabase
        .from('doctors')
        .update(formattedData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setDoctor(data);
      toast.success('Doctor updated successfully');
      setEditMode(false);
    } catch (error) {
      console.error('Error updating doctor:', error);
      
      if (error.code === '23505') {
        setFormErrors({
          ...formErrors,
          phone_number: 'A doctor with this phone number already exists',
        });
      } else {
        toast.error('Failed to update doctor');
      }
    }
  };

  const handleNotifyDoctor = async (bookingId) => {
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
      
      // Refresh bookings data to show updated notification status
      fetchDoctorData();
    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error(error.message || 'Failed to send notification');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">Loading doctor information...</p>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500">Doctor not found</p>
        <Link to="/doctors" className="mt-4 inline-flex items-center text-primary-600 hover:text-primary-900">
          <ArrowLeftIcon className="h-5 w-5 mr-1" />
          Back to Doctors
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link to="/doctors" className="inline-flex items-center text-primary-600 hover:text-primary-900">
          <ArrowLeftIcon className="h-5 w-5 mr-1" />
          Back to Doctors
        </Link>
      </div>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">Doctor Profile</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Personal details and bookings.</p>
          </div>
          <div>
            {editMode ? (
              <div className="flex space-x-3">
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
              {/* Name */}
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm ${
                      formErrors.name ? 'border-red-300' : ''
                    }`}
                  />
                  {formErrors.name && <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>}
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700">
                    WhatsApp Number *
                  </label>
                  <input
                    type="text"
                    name="phone_number"
                    id="phone_number"
                    value={formData.phone_number}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm ${
                      formErrors.phone_number ? 'border-red-300' : ''
                    }`}
                  />
                  {formErrors.phone_number && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.phone_number}</p>
                  )}
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="specialty" className="block text-sm font-medium text-gray-700">
                    Specialty *
                  </label>
                  <input
                    type="text"
                    name="specialty"
                    id="specialty"
                    value={formData.specialty}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm ${
                      formErrors.specialty ? 'border-red-300' : ''
                    }`}
                  />
                  {formErrors.specialty && <p className="mt-1 text-sm text-red-600">{formErrors.specialty}</p>}
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    id="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="experience_years" className="block text-sm font-medium text-gray-700">
                    Years of Experience
                  </label>
                  <input
                    type="number"
                    name="experience_years"
                    id="experience_years"
                    value={formData.experience_years}
                    onChange={handleInputChange}
                    min="0"
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm ${
                      formErrors.experience_years ? 'border-red-300' : ''
                    }`}
                  />
                  {formErrors.experience_years && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.experience_years}</p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="consultation_fee" className="block text-sm font-medium text-gray-700">
                    Consultation Fee (GH₵) *
                  </label>
                  <input
                    type="number"
                    name="consultation_fee"
                    id="consultation_fee"
                    value={formData.consultation_fee}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm ${
                      formErrors.consultation_fee ? 'border-red-300' : ''
                    }`}
                  />
                  {formErrors.consultation_fee && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.consultation_fee}</p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="availability_status" className="block text-sm font-medium text-gray-700">
                    Availability Status
                  </label>
                  <select
                    id="availability_status"
                    name="availability_status"
                    value={formData.availability_status}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  >
                    <option value="available">Available</option>
                    <option value="busy">Busy</option>
                    <option value="unavailable">Unavailable</option>
                  </select>
                </div>

                <div className="sm:col-span-6">
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    rows={3}
                    value={formData.bio}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  />
                </div>
              </div>
            </form>
          </div>
        ) : (
          <div>
            <div className="border-t border-gray-200">
              <dl>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Name</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{doctor.name}</dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">WhatsApp Number</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{doctor.phone_number}</dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Specialty</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{doctor.specialty}</dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Location</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                    {doctor.location || 'Not specified'}
                  </dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Years of Experience</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                    {doctor.experience_years ? `${doctor.experience_years} years` : 'Not specified'}
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Consultation Fee</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                    {`GH₵${doctor.consultation_fee}`}
                  </dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Availability Status</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                    <span className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-sm font-medium ${
                      doctor.availability_status === 'available'
                        ? 'bg-green-100 text-green-800'
                        : doctor.availability_status === 'busy'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {doctor.availability_status.charAt(0).toUpperCase() + doctor.availability_status.slice(1)}
                    </span>
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Bio</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                    {doctor.bio || 'No bio provided'}
                  </dd>
                </div>
              </dl>
            </div>
            
            {/* Recent Bookings */}
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Bookings</h3>
              <div className="mt-4 flow-root">
                {bookings.length === 0 ? (
                  <p className="text-sm text-gray-500">No bookings found for this doctor.</p>
                ) : (
                  <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                      <table className="min-w-full divide-y divide-gray-300">
                        <thead>
                          <tr>
                            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                              Appointment ID
                            </th>
                            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                              Patient
                            </th>
                            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                              Date
                            </th>
                            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                              Status
                            </th>
                            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {bookings.map((booking) => (
                            <tr key={booking.id}>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                <Link to={`/bookings/${booking.id}`} className="text-primary-600 hover:text-primary-900">
                                  {booking.appointment_id}
                                </Link>
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                {booking.users?.first_name || 'Unknown'} ({booking.users?.phone_number})
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                {new Date(booking.booking_date).toLocaleDateString()}
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm">
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
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm">
                                {!booking.doctor_notified && (
                                  <button
                                    type="button"
                                    onClick={() => handleNotifyDoctor(booking.id)}
                                    className="inline-flex items-center rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-primary-600 shadow-sm ring-1 ring-inset ring-primary-300 hover:bg-primary-50"
                                  >
                                    <CalendarIcon className="h-4 w-4 mr-1" />
                                    Notify Doctor
                                  </button>
                                )}
                                {booking.doctor_notified && (
                                  <span className="text-sm text-gray-500">
                                    Notified: {new Date(booking.doctor_notified_at).toLocaleString()}
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Weekly Availability */}
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Weekly Availability</h3>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {availability.map((row, idx) => (
                  <div key={row.day_of_week} className={`p-3 rounded-md border ${row.enabled ? 'border-primary-300 bg-primary-50' : 'border-gray-200'}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-800">{weekdayName(row.day_of_week)}</span>
                      <input type="checkbox" className="h-4 w-4" checked={row.enabled} onChange={(e) => handleAvailabilityChange(idx, 'enabled', e.target.checked)} />
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-gray-500">Start</label>
                        <input type="time" disabled={!row.enabled} value={row.start_time} onChange={(e) => handleAvailabilityChange(idx, 'start_time', e.target.value)} className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">End</label>
                        <input type="time" disabled={!row.enabled} value={row.end_time} onChange={(e) => handleAvailabilityChange(idx, 'end_time', e.target.value)} className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-end">
                <button onClick={saveAvailability} disabled={savingAvailability} className={`inline-flex items-center rounded-md ${savingAvailability ? 'bg-gray-400' : 'bg-primary-600 hover:bg-primary-700'} px-3 py-2 text-sm font-semibold text-white shadow-sm`}>
                  {savingAvailability ? 'Saving…' : 'Save Availability'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}