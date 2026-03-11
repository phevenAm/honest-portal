// ============================================================
// MOCK DATA — replace these with real API calls later
// All data lives here so you can easily swap in a backend
// ============================================================

export const MOCK_USERS = [
  {
    id: 'user-1',
    email: 'sarah.chen@email.com',
    name: 'Sarah Chen',
    role: 'client',
    joinedAt: '2024-01-15',
    avatar: 'SC',
    color: 'sage',
  },
  {
    id: 'user-2',
    email: 'marcus.j@email.com',
    name: 'Marcus Johnson',
    role: 'client',
    joinedAt: '2024-02-03',
    avatar: 'MJ',
    color: 'lavender',
  },
  {
    id: 'user-3',
    email: 'priya.k@email.com',
    name: 'Priya Kapoor',
    role: 'client',
    joinedAt: '2024-02-20',
    avatar: 'PK',
    color: 'blush',
  },
  {
    id: 'admin-1',
    email: 'admin@mindfulspace.com',
    name: 'Dr. Alex Morgan',
    role: 'admin',
    joinedAt: '2023-12-01',
    avatar: 'AM',
    color: 'sky',
  },
];

export const MOCK_QUESTIONNAIRES = [
  {
    id: 'q-1',
    title: 'Weekly Wellbeing Check-in',
    description: 'A gentle reflection on your week — mood, sleep, and connection.',
    frequency: 'weekly',
    isActive: true,
    createdAt: '2024-01-10',
    assignedTo: ['user-1', 'user-2', 'user-3'],
    questions: [
      { id: 'q1-1', text: 'How would you rate your overall mood this week?', type: 'scale', min: 1, max: 10, minLabel: 'Very low', maxLabel: 'Excellent' },
      { id: 'q1-2', text: 'How many hours of sleep did you average each night?', type: 'scale', min: 1, max: 10, minLabel: 'Very poor', maxLabel: 'Great' },
      { id: 'q1-3', text: 'How connected did you feel to people around you?', type: 'scale', min: 1, max: 10, minLabel: 'Very isolated', maxLabel: 'Very connected' },
      { id: 'q1-4', text: 'How well did you manage stressful situations?', type: 'scale', min: 1, max: 10, minLabel: 'Struggled a lot', maxLabel: 'Handled well' },
      { id: 'q1-5', text: 'Is there anything specific you\'d like to reflect on from this week?', type: 'text' },
    ],
  },
  {
    id: 'q-2',
    title: 'Daily Mood Snapshot',
    description: 'A quick 2-minute check-in to track your daily emotional state.',
    frequency: 'daily',
    isActive: true,
    createdAt: '2024-01-15',
    assignedTo: ['user-1', 'user-3'],
    questions: [
      { id: 'q2-1', text: 'How are you feeling right now?', type: 'scale', min: 1, max: 10, minLabel: 'Very difficult', maxLabel: 'Wonderful' },
      { id: 'q2-2', text: 'Your anxiety level today?', type: 'scale', min: 1, max: 10, minLabel: 'Very high', maxLabel: 'Very calm' },
      { id: 'q2-3', text: 'One word to describe today:', type: 'text' },
    ],
  },
];

// Generate realistic response data for the past 12 weeks
const generateResponses = (userId, questionnaireId, weeks = 12) => {
  const responses = [];
  const now = new Date();
  for (let w = weeks; w >= 0; w--) {
    const date = new Date(now);
    date.setDate(date.getDate() - (w * 7));
    // Simulate gradual improvement with some natural variation
    const baseScore = 4 + ((weeks - w) / weeks) * 3;
    responses.push({
      id: `resp-${userId}-${questionnaireId}-${w}`,
      userId,
      questionnaireId,
      submittedAt: date.toISOString(),
      week: weeks - w + 1,
      scores: {
        'q1-1': Math.min(10, Math.max(1, Math.round(baseScore + (Math.random() - 0.5) * 2))),
        'q1-2': Math.min(10, Math.max(1, Math.round(baseScore + (Math.random() - 0.5) * 2))),
        'q1-3': Math.min(10, Math.max(1, Math.round(baseScore + (Math.random() - 0.5) * 2.5))),
        'q1-4': Math.min(10, Math.max(1, Math.round(baseScore + (Math.random() - 0.5) * 2))),
      },
      textResponses: { 'q1-5': '' },
      average: parseFloat((baseScore + (Math.random() - 0.5)).toFixed(1)),
    });
  }
  return responses;
};

export const MOCK_RESPONSES = [
  ...generateResponses('user-1', 'q-1'),
  ...generateResponses('user-2', 'q-1'),
  ...generateResponses('user-3', 'q-1'),
];

export const MOCK_RESOURCES = [
  {
    id: 'res-1',
    type: 'article',
    title: 'Understanding the Window of Tolerance',
    excerpt: 'Learn how your nervous system regulates stress and how to expand your capacity for difficult emotions.',
    content: 'The window of tolerance is a concept developed by Dr. Dan Siegel...',
    category: 'Psychoeducation',
    publishedAt: '2024-02-01',
    readTime: '5 min read',
    isPublished: true,
    color: 'sage',
  },
  {
    id: 'res-2',
    type: 'article',
    title: 'Grounding Techniques for Anxiety',
    excerpt: 'Practical, evidence-based techniques to bring you back to the present moment when anxiety spikes.',
    content: 'Grounding techniques are powerful tools...',
    category: 'Coping Skills',
    publishedAt: '2024-02-08',
    readTime: '7 min read',
    isPublished: true,
    color: 'lavender',
  },
  {
    id: 'res-3',
    type: 'video',
    title: 'Box Breathing for Immediate Calm',
    excerpt: 'A guided 5-minute breathing exercise to activate your parasympathetic nervous system.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    category: 'Breathwork',
    publishedAt: '2024-02-15',
    duration: '5:30',
    isPublished: true,
    color: 'blush',
  },
  {
    id: 'res-4',
    type: 'article',
    title: 'The Science of Self-Compassion',
    excerpt: 'Research by Dr. Kristin Neff shows how treating yourself with kindness changes your brain.',
    content: 'Self-compassion is not self-indulgence...',
    category: 'Self-Compassion',
    publishedAt: '2024-02-22',
    readTime: '8 min read',
    isPublished: false,
    color: 'peach',
  },
];

// Credentials for mock auth — in real app, this would be JWT from your backend
export const MOCK_CREDENTIALS = {
  'admin@mindfulspace.com': { password: 'admin123', userId: 'admin-1' },
  'sarah.chen@email.com':   { password: 'client123', userId: 'user-1' },
  'marcus.j@email.com':     { password: 'client123', userId: 'user-2' },
  'priya.k@email.com':      { password: 'client123', userId: 'user-3' },
};
