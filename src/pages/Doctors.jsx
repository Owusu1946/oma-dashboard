import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const API_BASE = (import.meta.env.VITE_DB_API_URL || 'https://oma-db-service-pcxd.onrender.com').replace(/\/+$/, '');

export default function Doctors() {
  const { supabase } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [activeDoctors, setActiveDoctors] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    phone_number: '',
    specialty: '',
    bio: '',
    experience_years: '',
    consultation_fee: '',
    location: '',
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .order('name');

      if (error) throw error;

      const pending = data.filter(d => d.registration_status === 'pending');
      const active = data.filter(d => d.registration_status === 'approved' && d.is_active);

      setPendingDoctors(pending || []);
      setActiveDoctors(active || []);
      setDoctors(data || []); // Keep all doctors in a single state for simplicity in rendering
    } catch (error) {
      console.error('Error fetching doctors:', error);
      toast.error('Failed to load doctors');
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
      // Format the consultation fee as a number
      const formattedData = {
        ...formData,
        consultation_fee: parseFloat(formData.consultation_fee),
        experience_years: formData.experience_years ? parseInt(formData.experience_years) : null,
      };
      
      const { data, error } = await supabase
        .from('doctors')
        .insert([formattedData])
        .select();

      if (error) throw error;

      setDoctors([...doctors, data[0]]);
      toast.success('Doctor added successfully');
      setShowAddModal(false);
      resetForm();
    } catch (error) {
      console.error('Error adding doctor:', error);
      
      if (error.code === '23505') {
        setFormErrors({
          ...formErrors,
          phone_number: 'A doctor with this phone number already exists',
        });
      } else {
        toast.error('Failed to add doctor');
      }
    }
  };

  const handleDeleteDoctor = async (id, name) => {
    if (!confirm(`Are you sure you want to remove doctor ${name}?`)) {
      return;
    }

    try {
      // Check if doctor has active bookings first
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('id')
        .eq('doctor_id', id)
        .in('status', ['pending', 'confirmed'])
        .limit(1);

      if (bookingsError) throw bookingsError;

      if (bookings && bookings.length > 0) {
        toast.error('Cannot remove doctor with active bookings');
        return;
      }

      // Mark as inactive instead of deleting
      const { error } = await supabase
        .from('doctors')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;

      setDoctors(doctors.filter(doctor => doctor.id !== id));
      toast.success('Doctor removed successfully');
    } catch (error) {
      console.error('Error removing doctor:', error);
      toast.error('Failed to remove doctor');
    }
  };

  const handleApproveDoctor = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/doctors/${id}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to approve doctor');
      }

      toast.success('Doctor approved successfully!');
      fetchDoctors(); // Refresh the list
    } catch (error) {
      console.error('Error approving doctor:', error);
      toast.error(error.message || 'Failed to approve doctor');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      phone_number: '',
      specialty: '',
      bio: '',
      experience_years: '',
      consultation_fee: '',
      location: '',
    });
    setFormErrors({});
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Doctors</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all doctors available for consultations through the OMA Health Assistant.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
          >
            <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
            Add Doctor
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="mt-8 text-center">
          <p className="text-gray-500">Loading doctors...</p>
        </div>
      ) : (
        <div className="mt-8 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              {/* Pending Doctors Table */}
              {pendingDoctors.length > 0 && (
                <div className="mt-8">
                  <h2 className="text-lg font-semibold text-gray-900">Pending Registrations</h2>
                  <div className="mt-4">
                    <table className="min-w-full divide-y divide-gray-300">
                      <thead>
                        <tr>
                          <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">
                            Name
                          </th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                            Specialty
                          </th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                            Location
                          </th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                            Experience
                          </th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                            Fee
                          </th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                            Status
                          </th>
                          <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                            <span className="sr-only">Actions</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {pendingDoctors.map((doctor) => (
                          <tr key={doctor.id}>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                              <Link to={`/admin/doctors/${doctor.id}`} className="text-primary-600 hover:text-primary-900">
                                {doctor.name}
                              </Link>
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{doctor.specialty}</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{doctor.location || 'Not specified'}</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {doctor.experience_years ? `${doctor.experience_years} years` : 'Not specified'}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {`GH₵${doctor.consultation_fee}`}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm">
                              <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                                doctor.availability_status === 'available'
                                  ? 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20'
                                  : doctor.availability_status === 'busy'
                                  ? 'bg-yellow-50 text-yellow-700 ring-1 ring-inset ring-yellow-600/20'
                                  : 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20'
                              }`}>
                                {doctor.availability_status.charAt(0).toUpperCase() + doctor.availability_status.slice(1)}
                              </span>
                            </td>
                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                              <div className="flex items-center justify-end space-x-3">
                                <button
                                  onClick={() => handleApproveDoctor(doctor.id)}
                                  className="text-green-600 hover:text-green-900"
                                >
                                  <CheckCircleIcon className="h-5 w-5" aria-hidden="true" />
                                  <span className="sr-only">Approve {doctor.name}</span>
                                </button>
                                <Link to={`/admin/doctors/${doctor.id}`} className="text-primary-600 hover:text-primary-900">
                                  <PencilIcon className="h-5 w-5" aria-hidden="true" />
                                  <span className="sr-only">Edit {doctor.name}</span>
                                </Link>
                                <button
                                  onClick={() => handleDeleteDoctor(doctor.id, doctor.name)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  <TrashIcon className="h-5 w-5" aria-hidden="true" />
                                  <span className="sr-only">Delete {doctor.name}</span>
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

              {/* Active Doctors Table */}
              {activeDoctors.length === 0 && pendingDoctors.length === 0 ? (
                <div className="text-center py-10 bg-white shadow overflow-hidden sm:rounded-lg">
                  <p className="text-gray-500">No doctors found</p>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(true)}
                    className="mt-4 inline-flex items-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
                  >
                    <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
                    Add your first doctor
                  </button>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-300">
                  <thead>
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">
                        Name
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Specialty
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Location
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Experience
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Fee
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Status
                      </th>
                      <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {activeDoctors.map((doctor) => (
                      <tr key={doctor.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                          <Link to={`/admin/doctors/${doctor.id}`} className="text-primary-600 hover:text-primary-900">
                            {doctor.name}
                          </Link>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{doctor.specialty}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{doctor.location || 'Not specified'}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {doctor.experience_years ? `${doctor.experience_years} years` : 'Not specified'}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {`GH₵${doctor.consultation_fee}`}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                          <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                            doctor.availability_status === 'available'
                              ? 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20'
                              : doctor.availability_status === 'busy'
                              ? 'bg-yellow-50 text-yellow-700 ring-1 ring-inset ring-yellow-600/20'
                              : 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20'
                          }`}>
                            {doctor.availability_status.charAt(0).toUpperCase() + doctor.availability_status.slice(1)}
                          </span>
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                          <div className="flex items-center justify-end space-x-3">
                            <Link to={`/admin/doctors/${doctor.id}`} className="text-primary-600 hover:text-primary-900">
                              <PencilIcon className="h-5 w-5" aria-hidden="true" />
                              <span className="sr-only">Edit {doctor.name}</span>
                            </Link>
                            <button
                              onClick={() => handleDeleteDoctor(doctor.id, doctor.name)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <TrashIcon className="h-5 w-5" aria-hidden="true" />
                              <span className="sr-only">Delete {doctor.name}</span>
                            </button>
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
      
      {/* Add Doctor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-10 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setShowAddModal(false)}></div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                        Add New Doctor
                      </h3>
                      <div className="mt-4 space-y-4">
                        {/* Name */}
                        <div>
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
                            placeholder="Dr. John Smith"
                          />
                          {formErrors.name && <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>}
                        </div>
                        
                        {/* Phone Number */}
                        <div>
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
                            placeholder="+233559123456"
                          />
                          {formErrors.phone_number && (
                            <p className="mt-1 text-sm text-red-600">{formErrors.phone_number}</p>
                          )}
                        </div>
                        
                        {/* Specialty */}
                        <div>
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
                            placeholder="General Medicine"
                          />
                          {formErrors.specialty && <p className="mt-1 text-sm text-red-600">{formErrors.specialty}</p>}
                        </div>
                        
                        {/* Location */}
                        <div>
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
                            placeholder="Accra, Ghana"
                          />
                        </div>
                        
                        {/* Experience Years */}
                        <div>
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
                            placeholder="10"
                          />
                          {formErrors.experience_years && (
                            <p className="mt-1 text-sm text-red-600">{formErrors.experience_years}</p>
                          )}
                        </div>
                        
                        {/* Consultation Fee */}
                        <div>
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
                            placeholder="100.00"
                          />
                          {formErrors.consultation_fee && (
                            <p className="mt-1 text-sm text-red-600">{formErrors.consultation_fee}</p>
                          )}
                        </div>
                        
                        {/* Bio */}
                        <div>
                          <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                            Bio
                          </label>
                          <textarea
                            name="bio"
                            id="bio"
                            rows="3"
                            value={formData.bio}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                            placeholder="Brief description of the doctor's background and expertise"
                          ></textarea>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Add Doctor
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}