# OMA Health Doctor Portal

This document describes the Doctor Portal functionality within the OMA Health dashboard.

## Overview

The Doctor Portal allows registered doctors to:
- Sign in using their phone number and OTP
- View their personalized dashboard
- See recent patient bookings
- View their profile information
- Access booking statistics and earnings

## Access

### For Doctors
1. Navigate to `/doctor/login` in the dashboard
2. Enter your registered phone number
3. Receive and enter the 6-digit OTP
4. Access your personalized dashboard at `/doctor/dashboard`

### For Administrators
1. Access the main dashboard
2. Use the "Doctor Portal" section to access doctor management
3. Navigate to `/doctors` to manage doctor profiles

## Features

### Authentication
- **Phone Number + OTP**: Secure login using registered phone numbers
- **Token-based**: JWT tokens for session management
- **Auto-logout**: Automatic logout on token expiration

### Dashboard
- **Welcome Message**: Personalized greeting with doctor's name
- **Statistics**: Total bookings, pending, completed, and earnings
- **Profile Card**: Doctor information, specialty, experience, fees
- **Recent Bookings**: Latest patient consultations with status

### Security
- **Protected Routes**: All doctor pages require authentication
- **Token Validation**: Backend verification of authentication tokens
- **Session Management**: Secure storage and cleanup of session data

## Development Mode

During development, the portal uses mock APIs for testing:

### Mock Features
- Any valid phone number format works
- Any 6-digit OTP code works (e.g., 123456)
- Sample doctor data and bookings are displayed
- Mock mode is clearly indicated with 🧪 badges

### Testing
1. Start the development server
2. Navigate to `/doctor/login`
3. Enter any phone number (e.g., +233 55 912 3456)
4. Enter any 6-digit code (e.g., 123456)
5. Access the mock dashboard

## Production Integration

In production, the portal will integrate with:

### Backend APIs
- `POST /api/auth/doctor/request-otp` - Request OTP
- `POST /api/auth/doctor/verify-otp` - Verify OTP
- `GET /api/doctor/me` - Get doctor profile
- `GET /api/doctor/bookings` - Get doctor bookings

### Database Tables
- `doctors` - Doctor profile information
- `doctor_login_codes` - OTP codes for authentication
- `doctor_sessions` - Active session tokens
- `bookings` - Patient consultation records

## File Structure

```
web/dashboard/src/
├── pages/
│   ├── DoctorLogin.jsx          # Doctor login page
│   └── DoctorDashboard.jsx      # Doctor dashboard
├── components/
│   └── DoctorProtectedRoute.jsx # Authentication guard
└── utils/
    └── mockDoctorAPI.js         # Mock API for development
```

## Styling

The portal uses:
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Heroicons** for icons
- **Responsive design** for mobile and desktop

## Future Enhancements

Planned features include:
- **Availability Management**: Set working hours and availability
- **Patient Communication**: Secure messaging system
- **Consultation History**: Complete patient interaction logs
- **Prescription Management**: Digital prescription system
- **Video Consultations**: Integrated video calling

## Support

For technical support or questions about the Doctor Portal:
- Email: support@omahealth.com
- Documentation: Check the main README.md
- Issues: Report bugs through the project repository
