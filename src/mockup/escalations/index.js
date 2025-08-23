/**
 * Mockup data for escalations
 * These represent patient cases that have been escalated to healthcare professionals
 */

const generateTimeAgo = (hoursAgo) => {
  return new Date(Date.now() - 1000 * 60 * 60 * hoursAgo).toISOString();
};

const escalationsMockup = [
  {
    id: 'esc-mock-1',
    reason: 'Patient reported severe abdominal pain that hasn\'t responded to prescribed medication. Pain level rated as 8/10 and increasing over the last 3 hours.',
    status: 'pending',
    created_at: generateTimeAgo(2),
    updated_at: generateTimeAgo(2),
    session_id: 'session-mock-1',
    users: {
      id: 'user-mock-1',
      first_name: 'Sarah',
      phone_number: '+1234567890'
    },
    sessions: {
      id: 'session-mock-1',
      started_at: generateTimeAgo(3)
    }
  },
  {
    id: 'esc-mock-2',
    reason: 'Patient requested to speak with a healthcare professional directly regarding medication side effects that are severely affecting daily activities.',
    status: 'in_progress',
    created_at: generateTimeAgo(6),
    updated_at: generateTimeAgo(5),
    session_id: 'session-mock-2',
    users: {
      id: 'user-mock-2',
      first_name: 'Jamie',
      phone_number: '+2345678901'
    },
    sessions: {
      id: 'session-mock-2',
      started_at: generateTimeAgo(7)
    }
  },
  {
    id: 'esc-mock-3',
    reason: 'Symptoms described may indicate an urgent medical condition requiring immediate attention. Patient experiencing chest pain radiating to left arm with shortness of breath.',
    status: 'pending',
    created_at: generateTimeAgo(12),
    updated_at: generateTimeAgo(12),
    session_id: 'session-mock-3',
    users: {
      id: 'user-mock-3',
      first_name: 'Robert',
      phone_number: '+3456789012'
    },
    sessions: {
      id: 'session-mock-3',
      started_at: generateTimeAgo(13)
    }
  },
  {
    id: 'esc-mock-4',
    reason: 'Patient reported severe headache with blurred vision and dizziness after recent head injury. Symptoms have worsened in the last hour.',
    status: 'resolved',
    created_at: generateTimeAgo(24),
    updated_at: generateTimeAgo(20),
    resolved_at: generateTimeAgo(20),
    resolved_by: 'Dr. Johnson',
    session_id: 'session-mock-4',
    users: {
      id: 'user-mock-4',
      first_name: 'Maria',
      phone_number: '+4567890123'
    },
    sessions: {
      id: 'session-mock-4',
      started_at: generateTimeAgo(25)
    }
  },
  {
    id: 'esc-mock-5',
    reason: 'Patient having difficulty breathing and experiencing hives after taking new prescription medication. Possible allergic reaction.',
    status: 'in_progress',
    created_at: generateTimeAgo(4),
    updated_at: generateTimeAgo(3.5),
    session_id: 'session-mock-5',
    users: {
      id: 'user-mock-5',
      first_name: 'David',
      phone_number: '+5678901234'
    },
    sessions: {
      id: 'session-mock-5',
      started_at: generateTimeAgo(4.5)
    }
  },
  {
    id: 'esc-mock-6',
    reason: 'Patient experiencing severe depression with suicidal thoughts. Requires immediate mental health intervention.',
    status: 'pending',
    created_at: generateTimeAgo(1),
    updated_at: generateTimeAgo(1),
    session_id: 'session-mock-6',
    users: {
      id: 'user-mock-6',
      first_name: 'Thomas',
      phone_number: '+6789012345'
    },
    sessions: {
      id: 'session-mock-6',
      started_at: generateTimeAgo(1.5)
    }
  },
  {
    id: 'esc-mock-7',
    reason: 'Pregnant patient experiencing contractions at 34 weeks. Possible preterm labor requiring evaluation.',
    status: 'resolved',
    created_at: generateTimeAgo(36),
    updated_at: generateTimeAgo(35),
    resolved_at: generateTimeAgo(35),
    resolved_by: 'Dr. Martinez',
    session_id: 'session-mock-7',
    users: {
      id: 'user-mock-7',
      first_name: 'Emma',
      phone_number: '+7890123456'
    },
    sessions: {
      id: 'session-mock-7',
      started_at: generateTimeAgo(37)
    }
  },
  {
    id: 'esc-mock-8',
    reason: 'Patient reported concerning lab results requiring physician review. Blood glucose levels extremely elevated.',
    status: 'resolved',
    created_at: generateTimeAgo(48),
    updated_at: generateTimeAgo(47),
    resolved_at: generateTimeAgo(47),
    resolved_by: 'Dr. Wilson',
    session_id: 'session-mock-8',
    users: {
      id: 'user-mock-8',
      first_name: 'Michael',
      phone_number: '+8901234567'
    },
    sessions: {
      id: 'session-mock-8',
      started_at: generateTimeAgo(49)
    }
  }
];

export default escalationsMockup;
