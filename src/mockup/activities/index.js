// Export all mockup activity data
import sessions from './sessions';
import escalations from './escalations';
import users from './users';
import messages from './messages';

// Combined array with all activities
const allActivities = [
  ...sessions,
  ...escalations,
  ...users,
  ...messages
].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

// Export individual categories
export { sessions, escalations, users, messages };

// Export the combined and sorted activities
export default allActivities; 