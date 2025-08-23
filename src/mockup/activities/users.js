/**
 * Mockup data for user activities
 * These represent new users joining the OMA health platform
 */

const users = [
  {
    id: 'user-mock-1',
    type: 'newUser',
    title: 'New User',
    description: 'Michael joined the platform',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    link: {
      url: '/users/mock-1',
      text: 'View profile'
    }
  }

];

export default users; 