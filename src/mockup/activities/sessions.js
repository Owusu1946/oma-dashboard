/**
 * Mockup data for session activities
 * These represent WhatsApp chat sessions with the OMA health bot
 */

const sessions = [
  {
    id: 'session-mock-1',
    type: 'session',
    title: 'Session Started',
    description: 'John started a new session',
    timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(), // 10 minutes ago
    link: {
      url: '/chat/mock-1',
      text: 'View conversation'
    }
  },
  {
    id: 'session-mock-2',
    type: 'session',
    title: 'Session Ended',
    description: 'Daniel ended their session (completed)',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), // 8 hours ago
    link: {
      url: '/chat/mock-2',
      text: 'View conversation'
    }
  },
  {
    id: 'session-mock-3',
    type: 'session',
    title: 'Session Started',
    description: 'Alex started a new session',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 minutes ago
    link: {
      url: '/chat/mock-3',
      text: 'View conversation'
    }
  },
  {
    id: 'session-mock-4',
    type: 'session',
    title: 'Session Ended',
    description: 'Sophia ended their session (cancelled)',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    link: {
      url: '/chat/mock-4',
      text: 'View conversation'
    }
  }
];

export default sessions; 