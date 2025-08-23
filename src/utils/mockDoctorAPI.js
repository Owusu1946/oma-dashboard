// Mock API for doctor endpoints during development
// This will be replaced with actual API calls in production

const mockDoctorData = {
  id: 'mock-doctor-1',
  name: 'Dr. Sarah Johnson',
  phone_number: '+233559123456',
  specialty: 'General Medicine',
  bio: 'Experienced general practitioner with over 10 years of practice.',
  experience_years: 10,
  consultation_fee: 150.00,
  location: 'Accra, Ghana',
  availability_status: 'available'
};

const mockBookings = [
  {
    id: 'booking-1',
    appointment_id: 'OMA-001',
    status: 'confirmed',
    consultation_date: '2025-01-25T10:00:00Z',
    diagnosis_notes: 'Patient presenting with mild fever and cough. Prescribed rest and fluids.',
    users: {
      first_name: 'John',
      last_name: 'Doe'
    }
  },
  {
    id: 'booking-2',
    appointment_id: 'OMA-002',
    status: 'pending',
    consultation_date: '2025-01-26T14:00:00Z',
    diagnosis_notes: null,
    users: {
      first_name: 'Jane',
      last_name: 'Smith'
    }
  }
];

export const mockDoctorAPI = {
  // Mock OTP request
  requestOTP: async (phoneNumber) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In real implementation, this would call the backend
    console.log(`Mock: OTP requested for ${phoneNumber}`);
    
    return { success: true, message: 'OTP sent successfully' };
  },

  // Mock OTP verification
  verifyOTP: async (phoneNumber, code) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simple validation - any 6-digit code works in mock
    if (code.length === 6 && /^\d{6}$/.test(code)) {
      console.log(`Mock: OTP verified for ${phoneNumber}`);
      
      return {
        success: true,
        token: 'mock-doctor-token-' + Date.now(),
        doctor: mockDoctorData
      };
    } else {
      throw new Error('Invalid OTP code');
    }
  },

  // Mock doctor profile fetch
  getDoctorProfile: async (token) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (token && token.startsWith('mock-doctor-token-')) {
      return mockDoctorData;
    } else {
      throw new Error('Invalid token');
    }
  },

  // Mock doctor bookings fetch
  getDoctorBookings: async (token) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (token && token.startsWith('mock-doctor-token-')) {
      return {
        bookings: mockBookings,
        total: mockBookings.length,
        pending: mockBookings.filter(b => b.status === 'pending').length,
        completed: mockBookings.filter(b => b.status === 'completed').length,
        earnings: mockBookings.filter(b => b.status === 'completed').length * mockDoctorData.consultation_fee
      };
    } else {
      throw new Error('Invalid token');
    }
  }
};

// Helper to check if we're in development mode
export const isDevelopment = () => {
  return import.meta.env.DEV || window.location.hostname === 'localhost';
};
