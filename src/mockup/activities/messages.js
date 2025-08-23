/**
 * Mockup data for message activities
 * These represent user message interactions with the OMA health bot
 */

const messages = [
  {
    id: 'message-mock-1',
    type: 'message',
    title: 'User Active',
    description: 'Emma was recently active',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 hours ago
    link: {
      url: '/users/message-1',
      text: 'View profile'
    }
  },
];

export default messages; 