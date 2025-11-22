import { Post, User } from './NewsFeedtypes';

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Juan Dela Cruz',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    role: 'Farmer'
  },
  {
    id: '2', 
    name: 'Maria Santos',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    role: 'Vendor'
  },
  {
    id: '3',
    name: 'Pedro Gonzalez',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    role: 'Contractor'
  },
  {
    id: '4',
    name: 'Ana Reyes',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    role: 'Farmer'
  },
  {
    id: '5',
    name: 'Miguel Torres',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    role: 'Vendor'
  },
  {
    id: '6',
    name: 'Sofia Lim',
    avatar: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=150&h=150&fit=crop&crop=face',
    role: 'Contractor'
  }
];

export const mockPosts: Post[] = [
  {
    id: '1',
    userId: '1',
    user: mockUsers[0],
    content: 'Just harvested my first batch of organic rice this season! The quality is excellent and I\'m excited to share it with the community. #FarmLife #OrganicFarming 🌾',
    image: 'https://images.unsplash.com/photo-1592981415071-8cdf75180613?w=500&h=300&fit=crop',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    reactions: [
      { userId: '2', type: 'like' },
      { userId: '3', type: 'love' },
      { userId: '4', type: 'like' },
      { userId: '5', type: 'wow' }
    ],
    shares: 3
  },
  {
    id: '2',
    userId: '2',
    user: mockUsers[1],
    content: 'Fresh vegetables available at the market today! Tomatoes, onions, potatoes, and cabbages at great prices. Come visit our stall! 🥬🍅🥔 #FreshProduce #LocalMarket',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    reactions: [
      { userId: '1', type: 'like' },
      { userId: '3', type: 'wow' },
      { userId: '4', type: 'like' },
      { userId: '6', type: 'like' }
    ],
    shares: 5
  },
  {
    id: '3',
    userId: '3',
    user: mockUsers[2],
    content: 'Looking for reliable farmers to supply rice for our new restaurant chain. Must be able to provide consistent quality and volume. DM me for details! 🍚 #BusinessOpportunity',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    reactions: [
      { userId: '1', type: 'like' },
      { userId: '2', type: 'like' },
      { userId: '4', type: 'love' },
      { userId: '5', type: 'like' }
    ],
    shares: 2
  },
  {
    id: '4',
    userId: '4',
    user: mockUsers[3],
    content: 'Beautiful sunrise at the farm today! Grateful for another day of working with nature. What are you planting this season? 🌱 #FarmLife #Gratitude',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=500&h=300&fit=crop',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    reactions: [
      { userId: '1', type: 'love' },
      { userId: '2', type: 'like' },
      { userId: '3', type: 'like' },
      { userId: '5', type: 'love' },
      { userId: '6', type: 'like' }
    ],
    shares: 8
  },
  {
    id: '5',
    userId: '5',
    user: mockUsers[4],
    content: 'Special offer this weekend! Buy 2 kilos of tomatoes and get 1 kilo of onions FREE! Limited time only! 🍅🧅 #SpecialOffer #WeekendDeal',
    image: 'https://images.unsplash.com/photo-1561136594-7f68413baa99?w=500&h=300&fit=crop',
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
    reactions: [
      { userId: '1', type: 'wow' },
      { userId: '2', type: 'like' },
      { userId: '3', type: 'like' },
      { userId: '4', type: 'like' },
      { userId: '6', type: 'love' }
    ],
    shares: 7
  },
  {
    id: '6',
    userId: '6',
    user: mockUsers[5],
    content: 'Just signed a contract with local farmers for our supermarket chain. Supporting local agriculture while providing fresh produce to our customers! 🛒🌽 #LocalBusiness #SupportFarmers',
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
    reactions: [
      { userId: '1', type: 'like' },
      { userId: '2', type: 'love' },
      { userId: '3', type: 'like' },
      { userId: '4', type: 'like' },
      { userId: '5', type: 'wow' }
    ],
    shares: 4
  },
  {
    id: '7',
    userId: '1',
    user: mockUsers[0],
    content: 'Learned about new sustainable farming techniques at the agriculture workshop today. Excited to implement these methods for better yield! 📚🌱 #SustainableFarming #Education',
    timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000), // 36 hours ago
    reactions: [
      { userId: '2', type: 'like' },
      { userId: '4', type: 'love' },
      { userId: '5', type: 'like' },
      { userId: '6', type: 'like' }
    ],
    shares: 2
  },
  {
    id: '8',
    userId: '2',
    user: mockUsers[1],
    content: 'New shipment of fruits just arrived! Fresh mangoes, bananas, and pineapples available. Perfect for your family\'s healthy snacks! 🍌🍍🥭 #FreshFruits #HealthyLiving',
    image: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=500&h=300&fit=crop',
    timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000), // 2 days ago
    reactions: [
      { userId: '1', type: 'like' },
      { userId: '3', type: 'wow' },
      { userId: '4', type: 'love' },
      { userId: '5', type: 'like' },
      { userId: '6', type: 'like' }
    ],
    shares: 6
  },
  {
    id: '9',
    userId: '3',
    user: mockUsers[2],
    content: 'Our restaurant is now sourcing 80% of our ingredients from local farmers. Quality is exceptional and we\'re proud to support our community! 🍽️👨‍🌾 #SupportLocal #FarmToTable',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    reactions: [
      { userId: '1', type: 'love' },
      { userId: '2', type: 'like' },
      { userId: '4', type: 'like' },
      { userId: '5', type: 'wow' },
      { userId: '6', type: 'like' }
    ],
    shares: 9
  },
  {
    id: '10',
    userId: '4',
    user: mockUsers[3],
    content: 'Harvest season is here! The fields are golden and ready. Thankful for good weather and healthy crops this year. 🙏🌾 #HarvestSeason #GratefulFarmer',
    image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500&h=300&fit=crop',
    timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
    reactions: [
      { userId: '1', type: 'love' },
      { userId: '2', type: 'like' },
      { userId: '3', type: 'like' },
      { userId: '5', type: 'love' },
      { userId: '6', type: 'wow' }
    ],
    shares: 12
  }
];