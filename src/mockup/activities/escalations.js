/**
 * Mockup data for escalation activities
 * These represent cases that were escalated to human healthcare professionals
 */

const escalations = [
  {
    id: 'escalation-mock-1',
    type: 'escalation',
    title: 'Case Escalated',
    description: 'Sarah\'s case was escalated: Patient reported severe abdominal pain that hasn\'t responded to prescribed medication...',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    link: {
      url: '/escalations/mock-1',
      text: 'View details'
    }
  },
  {
    id: 'escalation-mock-2',
    type: 'escalation',
    title: 'Case Escalated',
    description: 'Jamie\'s case was escalated: Patient requested to speak with a healthcare professional directly.',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 minutes ago
    link: {
      url: '/escalations/mock-2',
      text: 'View details'
    }
  }
 
];

export default escalations; 