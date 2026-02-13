/**
 * Scenario data: goals, backgrounds, character info for each conversation scenario.
 */

export const SCENARIO_IDS = [
  'cafe',
  'interview',
  'airport',
  'doctor',
  'shopping',
  'dating',
  'hotel',
  'restaurant',
  'taxi',
];

// Placeholder background images (Unsplash) – replace with your assets
const BACKGROUNDS = {
  cafe: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200&q=80',
  interview: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80',
  airport: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1200&q=80',
  doctor: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&q=80',
  shopping: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80',
  dating: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200&q=80',
  hotel: 'https://images.unsplash.com/photo-1566073771259-6a0e4b0c6c45?w=1200&q=80',
  restaurant: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80',
  taxi: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1200&q=80',
};

export const SCENARIOS = Object.fromEntries(
  SCENARIO_IDS.map((id) => {
    const configs = {
      cafe: {
        title: 'Café',
        characterRole: 'Barista',
        goals: [
          'Greet the barista',
          'Order a drink',
          'Ask about the price',
          'Thank them and say goodbye',
        ],
      },
      interview: {
        title: 'Job Interview',
        characterRole: 'Interviewer',
        goals: [
          'Introduce yourself',
          'Describe your experience',
          'Answer a strength question',
          'Ask a question about the role',
        ],
      },
      airport: {
        title: 'Airport',
        characterRole: 'Check-in agent',
        goals: [
          'Check in for your flight',
          'Ask about your gate',
          'Confirm boarding time',
          'Ask where to go for security',
        ],
      },
      doctor: {
        title: "Doctor's Office",
        characterRole: 'Doctor',
        goals: [
          'Describe your symptoms',
          'Answer questions about duration',
          'Ask about treatment options',
          'Thank the doctor',
        ],
      },
      shopping: {
        title: 'Shopping',
        characterRole: 'Shop assistant',
        goals: [
          'Ask to see an item',
          'Ask about the price',
          'Ask for a different size',
          'Decide to buy or not',
        ],
      },
      dating: {
        title: 'Dating',
        characterRole: 'Your date',
        goals: [
          'Introduce yourself',
          'Ask about their interests',
          'Share something about yourself',
          'Suggest meeting again',
        ],
      },
      hotel: {
        title: 'Hotel',
        characterRole: 'Receptionist',
        goals: [
          'Check in with a reservation',
          'Ask about breakfast times',
          'Ask for room key / WiFi',
          'Thank the receptionist',
        ],
      },
      restaurant: {
        title: 'Restaurant',
        characterRole: 'Waiter',
        goals: [
          'Get the menu',
          'Order food and drink',
          'Ask for the bill',
          'Thank the waiter',
        ],
      },
      taxi: {
        title: 'Taxi',
        characterRole: 'Driver',
        goals: [
          'Tell the driver your destination',
          'Ask how long it will take',
          'Ask about the fare',
          'Thank the driver',
        ],
      },
    };
    const c = configs[id] || { title: id, characterRole: 'Assistant', goals: [] };
    return [
      id,
      {
        id,
        title: c.title,
        characterRole: c.characterRole,
        goals: c.goals,
        backgroundImage: BACKGROUNDS[id],
      },
    ];
  })
);

export function getScenario(id) {
  return SCENARIOS[id] ?? null;
}

export function getGoals(id) {
  return SCENARIOS[id]?.goals ?? [];
}
