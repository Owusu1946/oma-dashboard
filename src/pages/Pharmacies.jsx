import { useState, useEffect } from 'react';
import { useDatabase } from '../contexts/DatabaseContext';
import { BuildingStorefrontIcon, PencilIcon, PlusIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { TableSkeleton } from '../components/ShimmerLoading';

export default function Pharmacies() {
  const { pharmacies, pharmaciesLoading, fetchPharmacies, createPharmacy, updatePharmacy } = useDatabase();
  
  console.log('[Pharmacies] Component render:', { 
    pharmacies: pharmacies?.length || 0, 
    pharmaciesLoading, 
    hasPharmacies: pharmacies && pharmacies.length > 0 
  });
  const [showModal, setShowModal] = useState(false);
  const [editingPharmacy, setEditingPharmacy] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone_number: '',
    location: '',
    address: '',
    status: 'active'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    console.log('[Pharmacies] Component mounted, fetching pharmacies...');
    
    // Add a timeout to see if the loading state persists
    const timeoutId = setTimeout(() => {
      console.log('[Pharmacies] 5 seconds passed, pharmaciesLoading:', pharmaciesLoading);
      console.log('[Pharmacies] pharmacies data:', pharmacies);
    }, 5000);
    
    fetchPharmacies();
    
    return () => clearTimeout(timeoutId);
  }, []); // Remove fetchPharmacies from dependency array to avoid infinite re-renders

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingPharmacy) {
        await updatePharmacy(editingPharmacy.id, formData);
        toast.success('Pharmacy updated successfully');
      } else {
        await createPharmacy(formData);
        toast.success('Pharmacy created successfully');
      }

      // Reset form and close modal
      setFormData({
        name: '',
        phone_number: '',
        location: '',
        address: '',
        status: 'active'
      });
      setEditingPharmacy(null);
      setShowModal(false);
    } catch (error) {
      toast.error(error.message || 'Failed to save pharmacy');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (pharmacy) => {
    setEditingPharmacy(pharmacy);
    setFormData({
      name: pharmacy.name,
      phone_number: pharmacy.phone_number,
      location: pharmacy.location || '',
      address: pharmacy.address || '',
      status: pharmacy.status || 'active'
    });
    setShowModal(true);
  };

  const statusBadge = (status) => {
    switch (status) {
      case 'active':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Active</span>;
      case 'inactive':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Inactive</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6 text-gray-900">Pharmacies</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all the pharmacies registered in the system for prescription fulfillment.
          </p>
        </div>
                 <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
           <div className="flex gap-2">
             <button
               type="button"
               onClick={() => {
                 console.log('[Pharmacies] Manual refresh clicked');
                 fetchPharmacies();
               }}
               className="block rounded-md bg-gray-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-gray-500"
             >
               <div className="flex items-center">
                 <span>Refresh</span>
               </div>
             </button>
             <button
               type="button"
               onClick={() => {
                 setEditingPharmacy(null);
                 setFormData({
                   name: '',
                   phone_number: '',
                   location: '',
                   address: '',
                   status: 'active'
                 });
                 setShowModal(true);
               }}
               className="block rounded-md bg-primary-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-primary-500"
             >
               <div className="flex items-center">
                 <PlusIcon className="h-5 w-5 mr-1" aria-hidden="true" />
                 <span>Add Pharmacy</span>
               </div>
             </button>
           </div>
         </div>
      </div>

             {pharmaciesLoading ? (
         <div>
           <div className="mt-4 text-center">
             <p className="text-sm text-gray-500">Loading pharmacies...</p>
           </div>
           <TableSkeleton rows={5} columns={4} />
         </div>
       ) : (
        <div className="mt-8 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                        Name
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Phone Number
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Location
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Status
                      </th>
                      <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                        <span className="sr-only">Edit</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {pharmacies.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="py-4 text-center text-sm text-gray-500">
                          <div className="flex flex-col items-center py-10">
                            <BuildingStorefrontIcon className="h-12 w-12 text-gray-400 mb-4" />
                            <h3 className="text-sm font-medium text-gray-900 mb-1">No pharmacies registered</h3>
                            <p className="text-sm text-gray-500">
                              Get started by adding a new pharmacy
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      pharmacies.map((pharmacy) => (
                        <tr key={pharmacy.id}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                            {pharmacy.name}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{pharmacy.phone_number}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{pharmacy.location || '-'}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{statusBadge(pharmacy.status)}</td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                            <button
                              onClick={() => handleEdit(pharmacy)}
                              className="text-primary-600 hover:text-primary-900 mr-4"
                            >
                              <PencilIcon className="h-4 w-4" aria-hidden="true" />
                              <span className="sr-only">Edit {pharmacy.name}</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Pharmacy Modal */}
      {showModal && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setShowModal(false)}></div>

            <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
              <div className="absolute right-0 top-0 pr-4 pt-4">
                <button
                  type="button"
                  className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  onClick={() => setShowModal(false)}
                >
                  <span className="sr-only">Close</span>
                  <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>

              <div>
                <div className="mt-3 text-center sm:mt-0 sm:text-left">
                  <h3 className="text-base font-semibold leading-6 text-gray-900">
                    {editingPharmacy ? 'Edit Pharmacy' : 'Add New Pharmacy'}
                  </h3>
                  
                  <form onSubmit={handleSubmit} className="mt-4">
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                          Pharmacy Name *
                        </label>
                        <input
                          type="text"
                          name="name"
                          id="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                        />
                      </div>

                      <div>
                        <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700">
                          Phone Number *
                        </label>
                        <input
                          type="text"
                          name="phone_number"
                          id="phone_number"
                          value={formData.phone_number}
                          onChange={handleInputChange}
                          required
                          placeholder="+233xxxxxxxxx"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                        />
                      </div>

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
                          placeholder="Accra, Ghana"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                        />
                      </div>

                      <div>
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                          Address
                        </label>
                        <textarea
                          name="address"
                          id="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          rows={3}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                        />
                      </div>

                      <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                          Status
                        </label>
                        <select
                          id="status"
                          name="status"
                          value={formData.status}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </div>
                    </div>

                    <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex w-full justify-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 sm:col-start-2"
                      >
                        {isSubmitting ? 'Saving...' : editingPharmacy ? 'Update' : 'Create'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowModal(false)}
                        className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}