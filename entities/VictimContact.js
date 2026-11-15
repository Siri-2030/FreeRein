export const victimContactFields = [
  {
    name: 'counsellorEmail',
    label: 'Counsellor/Advisor Email',
    type: 'email',
    required: true
  },
  {
    name: 'relationshipType',
    label: 'Relationship Type',
    type: 'select',
    required: true,
    options: [
      { value: 'counsellor', label: 'Counsellor' },
      { value: 'legal_advisor', label: 'Legal Advisor' },
      { value: 'mentor', label: 'Mentor' }
    ]
  },
  {
    name: 'notes',
    label: 'Notes (optional)',
    type: 'textarea',
    rows: 3
  }
];
