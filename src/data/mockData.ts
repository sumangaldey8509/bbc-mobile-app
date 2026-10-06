import { User, Story, Post, PostComment, Community, OneToOneMeeting, Referral, BusinessDeal, MeetingSummary, EventItem, MessageThread, Message, AppNotification } from '../types';

export const CURRENT_USER: User = {
  id: 'user_me',
  name: 'Subrata Mukherjee',
  designation: 'Founder & Managing Director',
  companyName: 'Bengal Precision Dynamics Pvt Ltd',
  industry: 'Industrial Automation & Heavy Engineering',
  chapter: 'Kolkata Central Chapter',
  location: 'Salt Lake Sector V, Kolkata',
  gstNumber: '19AAECB4821M1Z5',
  isGstVerified: true,
  turnover: '₹35 Cr - ₹50 Cr',
  yearJoined: 2021,
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
  coverImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80',
  membershipTier: 'Founder Council',
  bio: 'Pioneering heavy precision tooling, IoT telemetry and automated CNC machinery for automotive and defense manufacturing across Eastern India.',
  requirementDocs: [
    { title: 'Company Capabilities & CNC Plant Profile 2026.pdf', size: '3.4 MB', type: 'PDF' },
    { title: 'ISO 9001:2015 & Defense Vendor Registration.pdf', size: '1.8 MB', type: 'PDF' },
    { title: 'Tier-1 Supplier Product Catalog.pdf', size: '5.2 MB', type: 'PDF' }
  ],
  contact: {
    email: 'subrata.m@bengalprecision.in',
    phone: '+91 98300 24890',
    website: 'https://bengalprecision.in',
    officeAddress: 'Plot 12, Block GP, Salt Lake Sector V, Kolkata 700091'
  },
  stats: {
    oneToOneCount: 18,
    referralsGiven: 24,
    referralsReceived: 31,
    businessValueInLakhs: 462.5
  }
};

export const MOCK_USERS: User[] = [
  CURRENT_USER,
  {
    id: 'user_1',
    name: 'Ananya Roy',
    designation: 'Co-Founder & CEO',
    companyName: 'Medisurg Bengal Biotech Ltd',
    industry: 'Healthcare & Medical Devices',
    chapter: 'Kolkata Central Chapter',
    location: 'New Town, Kolkata',
    gstNumber: '19AADCM3321K1ZF',
    isGstVerified: true,
    turnover: '₹40 Cr - ₹60 Cr',
    yearJoined: 2022,
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
    membershipTier: 'Executive Member',
    bio: 'Manufacturing certified surgical sutures, titanium orthopedic implants, and sterile healthcare consumables exported to 14 countries.',
    requirementDocs: [
      { title: 'Medisurg Product Brochure & FDA Certs.pdf', size: '4.1 MB', type: 'PDF' }
    ],
    contact: {
      email: 'ananya.roy@medisurgbiotech.com',
      phone: '+91 98311 99012',
      website: 'https://medisurgbiotech.com',
      officeAddress: 'Ecospace Business Park, New Town, Kolkata 700156'
    },
    isFollowed: true,
    hasActiveStory: true,
    stats: {
      oneToOneCount: 14,
      referralsGiven: 19,
      referralsReceived: 26,
      businessValueInLakhs: 310.0
    }
  },
  {
    id: 'user_2',
    name: 'Debashis Ganguly',
    designation: 'Managing Partner',
    companyName: 'Ganguly Heritage Tea & Agro Exports',
    industry: 'Tea, Plantation & Agro Exports',
    chapter: 'North Bengal Chapter',
    location: 'Siliguri & Darjeeling',
    gstNumber: '19AABCG8922L1ZX',
    isGstVerified: true,
    turnover: '₹75 Cr - ₹100 Cr',
    yearJoined: 2020,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
    membershipTier: 'Founder Council',
    bio: 'Single estate artisanal Darjeeling & Dooars orthodox teas, premium export packaging, supplying luxury hospitality chains in UK, Japan & Europe.',
    requirementDocs: [
      { title: 'Darjeeling First Flush Catalog 2026.pdf', size: '2.9 MB', type: 'PDF' }
    ],
    contact: {
      email: 'debashis@gangulytea.com',
      phone: '+91 94340 12399',
      website: 'https://gangulytea.com',
      officeAddress: 'Sevoke Road, Siliguri 734001, West Bengal'
    },
    isFollowed: false,
    hasActiveStory: true,
    stats: {
      oneToOneCount: 22,
      referralsGiven: 35,
      referralsReceived: 41,
      businessValueInLakhs: 780.0
    }
  },
  {
    id: 'user_3',
    name: 'Souvik Sen',
    designation: 'Director',
    companyName: 'Howrah Heavy Forgings & Castings',
    industry: 'Metals, Forgings & Railways',
    chapter: 'Asansol-Howrah Heavy Hub',
    location: 'Howrah Industrial Belt',
    gstNumber: '19AAECS6712Q1ZW',
    isGstVerified: true,
    turnover: '₹120 Cr - ₹150 Cr',
    yearJoined: 2019,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80',
    membershipTier: 'Enterprise Council',
    bio: 'RDSO approved railway rolling stock casting supplier, ductile iron fittings, and structural steel fabrication for metro & freight corridor projects.',
    contact: {
      email: 'souvik@howrahforgings.com',
      phone: '+91 98305 77123',
      website: 'https://howrahforgings.com',
      officeAddress: 'Baltikuri Industrial Estate, Howrah 711113'
    },
    isFollowed: true,
    hasActiveStory: true,
    stats: {
      oneToOneCount: 29,
      referralsGiven: 48,
      referralsReceived: 53,
      businessValueInLakhs: 1450.0
    }
  },
  {
    id: 'user_4',
    name: 'Priyanka Banerjee',
    designation: 'Creative Director & Founder',
    companyName: 'Bengal Loom & Silk Heritage',
    industry: 'Textiles, Handlooms & Apparel',
    chapter: 'Kolkata Central Chapter',
    location: 'Park Street, Kolkata',
    gstNumber: '19AAJCB1102P1Z9',
    isGstVerified: true,
    turnover: '₹20 Cr - ₹35 Cr',
    yearJoined: 2023,
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&auto=format&fit=crop&q=80',
    membershipTier: 'Executive Member',
    bio: 'Promoting authentic Baluchari, Jamdani, and fine organic Tussar silk across global luxury fashion retail and corporate gift suites.',
    contact: {
      email: 'priyanka@bengalloom.com',
      phone: '+91 98302 44109',
      website: 'https://bengalloom.com',
      officeAddress: '44 Park Street, Kolkata 700016'
    },
    isFollowed: false,
    hasActiveStory: true,
    stats: {
      oneToOneCount: 11,
      referralsGiven: 15,
      referralsReceived: 18,
      businessValueInLakhs: 195.0
    }
  },
  {
    id: 'user_5',
    name: 'Arnab Bhattacharya',
    designation: 'Founder & Chief Architect',
    companyName: 'Synapse Enterprise AI & Cloud',
    industry: 'IT, AI & Enterprise Software',
    chapter: 'Tech & Startups SIG',
    location: 'Sector V, Salt Lake',
    gstNumber: '19AACCS5512D1ZR',
    isGstVerified: true,
    turnover: '₹15 Cr - ₹25 Cr',
    yearJoined: 2023,
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&auto=format&fit=crop&q=80',
    membershipTier: 'Executive Member',
    bio: 'Enterprise GenAI pipelines, ERP modernization, and automated computer vision inspection systems for manufacturing and logistics plants.',
    contact: {
      email: 'arnab@synapseai.io',
      phone: '+91 98319 88320',
      website: 'https://synapseai.io',
      officeAddress: 'Millennium Tower, Sector V, Salt Lake, Kolkata'
    },
    isFollowed: true,
    hasActiveStory: false,
    stats: {
      oneToOneCount: 16,
      referralsGiven: 22,
      referralsReceived: 29,
      businessValueInLakhs: 285.0
    }
  },
  {
    id: 'user_6',
    name: 'Rajesh Agarwal',
    designation: 'Executive Director',
    companyName: 'Haldia Multimodal Logistics & Terminals',
    industry: 'Logistics, Ports & Warehousing',
    chapter: 'Haldia Coastal Hub',
    location: 'Haldia Port Zone',
    gstNumber: '19AABCA9001H1ZK',
    isGstVerified: true,
    turnover: '₹200 Cr - ₹250 Cr',
    yearJoined: 2021,
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&auto=format&fit=crop&q=80',
    membershipTier: 'Enterprise Council',
    bio: 'Operates 1.2M sq ft Grade-A bonded warehousing, CFS facilities, and multimodal freight handling connected to Kolkata and Haldia docks.',
    contact: {
      email: 'rajesh.agarwal@haldialogistics.in',
      phone: '+91 98308 00192',
      website: 'https://haldialogistics.in',
      officeAddress: 'Port Complex Area, Haldia 721607'
    },
    isFollowed: false,
    hasActiveStory: false,
    stats: {
      oneToOneCount: 25,
      referralsGiven: 39,
      referralsReceived: 45,
      businessValueInLakhs: 1890.0
    }
  }
];

export const MOCK_STORIES: Story[] = [
  {
    id: 'story_1',
    userId: 'user_1',
    userName: 'Ananya Roy',
    userAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
    companyName: 'Medisurg Biotech',
    title: 'New EU MDR Certification Received 🎖️',
    caption: 'Thrilled to share that Medisurg Biotech has been granted European CE-MDR Class III approval for our cardiovascular suture line. Looking for European distributor introductions from fellow BBC members!',
    tag: 'Milestone',
    timestamp: '2h ago',
    viewed: false,
    accentColor: '#10B981'
  },
  {
    id: 'story_2',
    userId: 'user_2',
    userName: 'Debashis Ganguly',
    userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
    companyName: 'Ganguly Heritage Tea',
    title: 'Spring First Flush Auctions Open 🍃',
    caption: 'Our Kurseong high-elevation garden commenced First Flush harvest today. Open for exclusive private corporate gifting bookings for BBC Council patrons.',
    tag: 'Announcement',
    timestamp: '4h ago',
    viewed: false,
    accentColor: '#D4AF37'
  },
  {
    id: 'story_3',
    userId: 'user_3',
    userName: 'Souvik Sen',
    userAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80',
    companyName: 'Howrah Heavy Forgings',
    title: 'New 3000-Ton Hydraulic Press Live ⚙️',
    caption: 'Commissioned our state-of-the-art closed-die forging line in Howrah. Capable of forging large monobloc railway axles and turbine shafts in Bengal.',
    tag: 'Requirement',
    timestamp: '6h ago',
    viewed: false,
    accentColor: '#D83030'
  },
  {
    id: 'story_4',
    userId: 'user_4',
    userName: 'Priyanka Banerjee',
    userAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&auto=format&fit=crop&q=80',
    companyName: 'Bengal Loom',
    title: 'London Fashion Week Pavilion Showcase 🏛️',
    caption: 'Bengal Loom will be representing artisanal weavers of Bengal at the Commonwealth Trade Expo in London next month. Grateful to BBC Global Diaspora Chapter for the support.',
    tag: 'Event',
    timestamp: '8h ago',
    viewed: true,
    accentColor: '#8B5CF6'
  }
];

export const MOCK_POSTS: Post[] = [
  {
    id: 'post_1',
    authorId: 'user_1',
    authorName: 'Ananya Roy',
    authorDesignation: 'Co-Founder & CEO',
    authorCompany: 'Medisurg Bengal Biotech',
    authorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
    chapter: 'Kolkata Central Chapter',
    createdAt: '35 mins ago',
    content: '🚨 URGENT B2B REQUIREMENT: We are expanding our sterile cleanroom facility in New Town by 25,000 sq ft. Looking for verified BBC members with expertise in HVAC Class-10,000 cleanroom design, pharmaceutical epoxy flooring, and air handling units (AHU).\n\nBudget: ₹1.4 Cr - ₹1.8 Cr. Vendors with existing pharma/hospital credentials please DM or comment below.',
    tag: 'B2B Requirement',
    urgentRequirement: true,
    budgetOrValue: '₹ 1.6 Cr Budget',
    likesCount: 34,
    isLiked: true,
    commentsCount: 9,
    sharesCount: 12,
    documentAttachment: {
      name: 'Cleanroom_Expansion_RFP_Specification.pdf',
      size: '2.6 MB',
      type: 'PDF'
    }
  },
  {
    id: 'post_2',
    authorId: 'user_3',
    authorName: 'Souvik Sen',
    authorDesignation: 'Director',
    authorCompany: 'Howrah Heavy Forgings',
    authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80',
    chapter: 'Asansol-Howrah Heavy Hub',
    createdAt: '3 hours ago',
    content: '🤝 DEAL ANNOUNCEMENT: Happy to announce the successful signing of an annual supply contract with Eastern Railway for bogie bolster castings worth ₹8.20 Crores. Special thanks to Subrata Mukherjee (Bengal Precision) for introducing us through our 1-to-1 meeting last quarter! #BengalBusinessesGrowingTogether',
    tag: 'Deal Won',
    budgetOrValue: '₹ 8.20 Cr Deal Closed',
    likesCount: 88,
    isLiked: false,
    commentsCount: 21,
    sharesCount: 18,
    mediaUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'post_3',
    authorId: 'user_5',
    authorName: 'Arnab Bhattacharya',
    authorDesignation: 'Founder & Chief Architect',
    authorCompany: 'Synapse Enterprise AI',
    authorAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&auto=format&fit=crop&q=80',
    chapter: 'Tech & Startups SIG',
    createdAt: '6 hours ago',
    content: '💡 PARTNERSHIP ASK: We have developed an AI automated optical defect inspection system specifically calibrated for textile weaving looms and sheet metal surface anomalies. We are looking for 2 progressive manufacturing plants in Bengal to run a zero-cost 30-day pilot. Happy to demo next Tuesday.',
    tag: 'Partnership Ask',
    budgetOrValue: 'Zero-Cost Pilot Partner',
    likesCount: 42,
    isLiked: false,
    commentsCount: 14,
    sharesCount: 7
  },
  {
    id: 'post_4',
    authorId: 'user_6',
    authorName: 'Rajesh Agarwal',
    authorDesignation: 'Executive Director',
    authorCompany: 'Haldia Multimodal Logistics',
    authorAvatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&auto=format&fit=crop&q=80',
    chapter: 'Haldia Coastal Hub',
    createdAt: '1 day ago',
    content: '📦 CAPACITY UPDATE: Haldia Logistics is commissioning an additional 80,000 sq ft pre-engineered bonded warehouse adjacent to NH-116 with 12m clear height & laser screed flooring. BBC members getting priority allotment and special long-term tariff rates for export cargo staging.',
    tag: 'General',
    likesCount: 56,
    isLiked: true,
    commentsCount: 6,
    sharesCount: 15,
    mediaUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80'
  }
];

export const MOCK_COMMENTS: Record<string, PostComment[]> = {
  post_1: [
    {
      id: 'c_1',
      postId: 'post_1',
      authorName: 'Subrata Mukherjee',
      authorCompany: 'Bengal Precision Dynamics',
      authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
      text: 'Ananya, our sister engineering firm does AHU ducting and HVAC automation. Sending our technical profile over DM and scheduling a 1-to-1.',
      createdAt: '22 mins ago'
    },
    {
      id: 'c_2',
      postId: 'post_1',
      authorName: 'Souvik Sen',
      authorCompany: 'Howrah Heavy Forgings',
      authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80',
      text: 'Can highly recommend Subrata’s team for ductwork fabrication. Worked with them on our plant expansion.',
      createdAt: '15 mins ago'
    }
  ],
  post_2: [
    {
      id: 'c_3',
      postId: 'post_2',
      authorName: 'Debashis Ganguly',
      authorCompany: 'Ganguly Heritage Tea',
      authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
      text: 'Hearty congratulations Souvik & Subrata! Exemplary showcase of how BBC networking translates into tangible economic value for Bengal.',
      createdAt: '2 hours ago'
    }
  ]
};

export const MOCK_COMMUNITIES: Community[] = [
  {
    id: 'comm_1',
    name: 'Kolkata Central Chapter',
    type: 'Regional Chapter',
    description: 'The flagship chapter bringing together leaders in manufacturing, trade, infrastructure, and enterprise services across the Kolkata metropolitan region.',
    presidentName: 'Subhasis Dutt',
    presidentAvatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=300&auto=format&fit=crop&q=80',
    presidentCompany: 'Council Office & Founder President',
    membersCount: 148,
    activeDiscussionsCount: 38,
    nextMeeting: {
      title: 'Bi-Weekly Breakfast Meeting',
      date: 'Thursday, Aug 27, 2026',
      time: '07:30 AM - 09:30 AM',
      venue: 'The Oberoi Grand, Kolkata (Ballroom)'
    },
    banner: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&auto=format&fit=crop&q=80',
    isJoined: true
  },
  {
    id: 'comm_2',
    name: 'Tech, AI & Startups SIG',
    type: 'Industry Special Interest Group (SIG)',
    description: 'Dedicated group for tech, SaaS, AI, and digital founders to collaborate with business leaders across Bengal.',
    presidentName: 'Arnab Bhattacharya',
    presidentAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&auto=format&fit=crop&q=80',
    presidentCompany: 'Synapse Enterprise AI',
    membersCount: 84,
    activeDiscussionsCount: 22,
    nextMeeting: {
      title: 'AI in Heavy Manufacturing & Supply Chain Meet',
      date: 'Tuesday, Sep 1, 2026',
      time: '05:00 PM - 07:00 PM',
      venue: 'NASSCOM Warehouse, Salt Lake Sector V'
    },
    banner: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
    isJoined: true
  },
  {
    id: 'comm_3',
    name: 'North Bengal & Tea Corridor',
    type: 'Regional Chapter',
    description: 'Representing planters, cold chain operators, eco-tourism resorts, and cross-border trade leaders across Siliguri, Jalpaiguri, and Darjeeling.',
    presidentName: 'Debashis Ganguly',
    presidentAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
    presidentCompany: 'Ganguly Heritage Tea',
    membersCount: 62,
    activeDiscussionsCount: 15,
    nextMeeting: {
      title: 'North Bengal Agri-Export Strategy Meet',
      date: 'Saturday, Sep 5, 2026',
      time: '11:00 AM - 01:30 PM',
      venue: 'Courtyard by Marriott, Siliguri'
    },
    banner: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800&auto=format&fit=crop&q=80',
    isJoined: false
  },
  {
    id: 'comm_4',
    name: 'Asansol-Howrah Heavy Industry Hub',
    type: 'Regional Chapter',
    description: 'Foundries, rolling mills, engineering fabricators, casting units, and railway component manufacturers driving Eastern India’s core sector.',
    presidentName: 'Souvik Sen',
    presidentAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80',
    presidentCompany: 'Howrah Heavy Forgings',
    membersCount: 95,
    activeDiscussionsCount: 29,
    nextMeeting: {
      title: 'Industrial Energy Transition & Green Steel Meet',
      date: 'Friday, Sep 11, 2026',
      time: '04:00 PM - 06:30 PM',
      venue: 'The Peerless Inn, Durgapur'
    },
    banner: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=800&auto=format&fit=crop&q=80',
    isJoined: true
  },
  {
    id: 'comm_5',
    name: 'BBC Global Diaspora Council (UK, US, UAE & SG)',
    type: 'Global Chapter',
    description: 'Connecting NRI entrepreneurs, global funds, and trade partners with West Bengal based businesses for investment and growth.',
    presidentName: 'Dr. Rahul Roychowdhury',
    presidentAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    presidentCompany: 'Bengal Global Capital Partners (London)',
    membersCount: 110,
    activeDiscussionsCount: 41,
    nextMeeting: {
      title: 'Global Bengal Investors Virtual Meet Q3',
      date: 'Sunday, Sep 13, 2026',
      time: '06:30 PM - 08:30 PM IST',
      venue: 'BBC Global Zoom Meeting'
    },
    banner: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
    isJoined: false
  }
];

export const MOCK_ONE_TO_ONE_MEETINGS: OneToOneMeeting[] = [
  {
    id: 'oto_1',
    creatorId: 'user_me',
    creatorName: 'Subrata Mukherjee',
    creatorCompany: 'Bengal Precision Dynamics',
    creatorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    withUserId: 'user_1',
    withUserName: 'Ananya Roy',
    withUserCompany: 'Medisurg Bengal Biotech',
    withUserAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
    date: 'Tomorrow, Aug 21, 2026',
    time: '04:00 PM - 04:45 PM',
    status: 'Scheduled',
    locationOrLink: 'Starbucks, South City Mall / Zoom',
    agenda: 'Reviewing Cleanroom AHU & CNC precision valve design for new surgical suture plant.',
    actionItems: ['Prepare CNC machinery spec sheet', 'Bring ISO compliance records']
  },
  {
    id: 'oto_2',
    creatorId: 'user_5',
    creatorName: 'Arnab Bhattacharya',
    creatorCompany: 'Synapse Enterprise AI',
    creatorAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&auto=format&fit=crop&q=80',
    withUserId: 'user_me',
    withUserName: 'Subrata Mukherjee',
    withUserCompany: 'Bengal Precision Dynamics',
    withUserAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    date: 'Monday, Aug 24, 2026',
    time: '11:00 AM - 11:45 AM',
    status: 'Scheduled',
    locationOrLink: 'Council Office Boardroom, Salt Lake',
    agenda: 'Exploring automated vision inspection integration on our CNC milling machines.'
  },
  {
    id: 'oto_3',
    creatorId: 'user_me',
    creatorName: 'Subrata Mukherjee',
    creatorCompany: 'Bengal Precision Dynamics',
    creatorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    withUserId: 'user_3',
    withUserName: 'Souvik Sen',
    withUserCompany: 'Howrah Heavy Forgings',
    withUserAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80',
    date: 'Aug 14, 2026',
    time: '03:00 PM - 04:00 PM',
    status: 'Completed',
    locationOrLink: 'Howrah Plant Office',
    agenda: 'Strategic partnership on Railway bogie casting subcontracting.',
    meetingMinutes: 'Agreed on subcontract terms for Tier-1 machining. Contract signed on Aug 18 for ₹8.20 Cr total value.',
    actionItems: ['Contract execution done', 'First batch inspection scheduled for Sep 10']
  },
  {
    id: 'oto_4',
    creatorId: 'user_2',
    creatorName: 'Debashis Ganguly',
    creatorCompany: 'Ganguly Heritage Tea',
    creatorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
    withUserId: 'user_me',
    withUserName: 'Subrata Mukherjee',
    withUserCompany: 'Bengal Precision Dynamics',
    withUserAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    date: 'Aug 05, 2026',
    time: '05:30 PM - 06:15 PM',
    status: 'Completed',
    locationOrLink: 'The Bengal Club, Kolkata',
    agenda: 'Automated tea leaf grading & robotic packing equipment consultation.',
    meetingMinutes: 'Delivered initial conceptual engineering drawings. RFP under active evaluation.',
    actionItems: ['Submit formal financial quote by Aug 28']
  },
  {
    id: 'oto_5',
    creatorId: 'user_me',
    creatorName: 'Subrata Mukherjee',
    creatorCompany: 'Bengal Precision Dynamics',
    creatorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    withUserId: 'user_1',
    withUserName: 'Ananya Roy',
    withUserCompany: 'Medisurg Bengal Biotech',
    withUserAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
    date: 'Jul 22, 2026',
    time: '02:00 PM - 02:45 PM',
    status: 'Completed',
    locationOrLink: 'Medisurg HQ, New Town',
    agenda: 'Orthopedic implant precision CNC calibration requirements review.',
    meetingMinutes: 'Completed technical specs walkthrough. Sample batch testing approved.',
    actionItems: ['Send calibrated valve prototypes']
  },
  {
    id: 'oto_6',
    creatorId: 'user_3',
    creatorName: 'Souvik Sen',
    creatorCompany: 'Howrah Heavy Forgings',
    creatorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80',
    withUserId: 'user_me',
    withUserName: 'Subrata Mukherjee',
    withUserCompany: 'Bengal Precision Dynamics',
    withUserAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    date: 'Jul 10, 2026',
    time: '04:30 PM - 05:15 PM',
    status: 'Completed',
    locationOrLink: 'Council Office, Salt Lake',
    agenda: 'Exploring joint bid for Metro Railway wheel-hub forging contract.',
    meetingMinutes: 'Agreed on joint consortium model. Souvik handling forging; Subrata handling precision machining.',
    actionItems: ['Joint RFP submitted on Jul 18']
  }
];

export const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif_1',
    recipientId: 'user_me',
    senderId: 'user_5',
    senderName: 'Arnab Bhattacharya',
    senderAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&auto=format&fit=crop&q=80',
    senderCompany: 'Synapse Enterprise AI',
    title: 'New 1-to-1 Meeting Scheduled',
    message: 'Arnab Bhattacharya scheduled a 1-to-1 meeting with you on Monday, Aug 24 at 11:00 AM.',
    type: 'Meeting',
    timestamp: '15 mins ago',
    read: false,
    meetingDetails: {
      date: 'Monday, Aug 24, 2026',
      time: '11:00 AM - 11:45 AM',
      location: 'Council Office Boardroom, Salt Lake',
      agenda: 'Exploring automated vision inspection integration on our CNC milling machines.',
    }
  },
  {
    id: 'notif_2',
    recipientId: 'user_me',
    senderId: 'user_3',
    senderName: 'Souvik Sen',
    senderAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80',
    senderCompany: 'Howrah Heavy Forgings',
    title: 'Meeting Notes Updated',
    message: 'Souvik Sen added contract execution minutes to your completed 1-to-1 session.',
    type: 'Meeting',
    timestamp: '2 hours ago',
    read: false
  },
  {
    id: 'notif_3',
    recipientId: 'user_me',
    senderId: 'user_1',
    senderName: 'Ananya Roy',
    senderAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
    senderCompany: 'Medisurg Bengal Biotech',
    title: 'Meeting Confirmed: Aug 21',
    message: 'Ananya Roy confirmed the 1-to-1 meeting for tomorrow at Starbucks, South City Mall.',
    type: 'Meeting',
    timestamp: 'Yesterday',
    read: true
  }
];

export const MOCK_REFERRALS: Referral[] = [
  {
    id: 'ref_1',
    fromUserId: 'user_1',
    fromUserName: 'Rajiv Debnath',
    fromUserCompany: 'Bengal Heavy Fabricators Ltd',
    fromUserAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    toUserId: 'user_3',
    toUserName: 'Souvik Sen',
    toUserCompany: 'Howrah Heavy Forgings',
    toUserAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80',
    clientOrProspectName: 'Chief Mechanical Engineer, Eastern Railway',
    clientContact: 'cme.er@indianrailways.gov.in',
    serviceNeeded: 'Supply of forged bolster assemblies & heavy axle castings',
    date: 'Aug 10, 2026',
    status: 'Deal Closed',
    estimatedValue: '₹ 8.20 Cr',
    urgency: 'Immediate'
  },
  {
    id: 'ref_2',
    fromUserId: 'user_1',
    fromUserName: 'Rajiv Debnath',
    fromUserCompany: 'Bengal Heavy Fabricators Ltd',
    fromUserAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    toUserId: 'user_5',
    toUserName: 'Arnab Bhattacharya',
    toUserCompany: 'Synapse Enterprise AI',
    toUserAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&auto=format&fit=crop&q=80',
    clientOrProspectName: 'VP Technology, Titagarh Rail Systems',
    clientContact: 'vp.tech@titagarh.in',
    serviceNeeded: 'Computer Vision AI for automated weld inspection',
    date: 'Aug 16, 2026',
    status: 'In Discussion',
    estimatedValue: '₹ 45 Lakhs',
    urgency: 'Within 30 Days'
  },
  {
    id: 'ref_3',
    fromUserId: 'user_2',
    fromUserName: 'Priyanka Banerjee',
    fromUserCompany: 'Bengal Silk Mills & Exports',
    fromUserAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
    toUserId: 'user_1',
    toUserName: 'Rajiv Debnath',
    toUserCompany: 'Bengal Heavy Fabricators Ltd',
    toUserAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    clientOrProspectName: 'Managing Director, Goodricke Tea Processing Ltd',
    clientContact: 'md@goodricke-processing.com',
    serviceNeeded: 'High-speed automated tea blending & packaging machinery line',
    date: 'Aug 12, 2026',
    status: 'In Discussion',
    estimatedValue: '₹ 1.25 Cr',
    urgency: 'Immediate'
  },
  {
    id: 'ref_4',
    fromUserId: 'user_6',
    fromUserName: 'Subrata Ghosh',
    fromUserCompany: 'Bengal Green Energy & Solar Infra',
    fromUserAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80',
    toUserId: 'user_4',
    toUserName: 'Ananya Roy',
    toUserCompany: 'Meditech Eastern Hospitals Group',
    toUserAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&auto=format&fit=crop&q=80',
    clientOrProspectName: 'Operations Lead, Haldia Petrochemicals (HPL)',
    clientContact: 'operations.lead@hpl.co.in',
    serviceNeeded: 'Hospital rooftop commercial solar installation (1.2 MW)',
    date: 'Jul 28, 2026',
    status: 'Deal Closed',
    estimatedValue: '₹ 75 Lakhs',
    urgency: 'Immediate'
  }
];

export const MOCK_BUSINESS_DEALS: BusinessDeal[] = [
  {
    id: 'deal_1',
    fromUserId: 'user_3',
    fromUserName: 'Souvik Sen (Howrah Forgings)',
    fromUserCompany: 'Howrah Heavy Forgings',
    toUserId: 'user_me',
    toUserName: 'Subrata Mukherjee',
    toUserCompany: 'Bengal Precision Dynamics',
    amountInINR: 82000000,
    amountFormatted: '₹ 8.20 Crores',
    dealDescription: 'Eastern Railway Bogie Bolster Subcontract Tier-1 Machining',
    date: 'Aug 18, 2026',
    referralType: 'Inside Council'
  },
  {
    id: 'deal_2',
    fromUserId: 'user_me',
    fromUserName: 'Subrata Mukherjee',
    fromUserCompany: 'Bengal Precision Dynamics',
    toUserId: 'user_6',
    toUserName: 'Rajesh Agarwal',
    toUserCompany: 'Haldia Multimodal Logistics',
    amountInINR: 7500000,
    amountFormatted: '₹ 75.0 Lakhs',
    dealDescription: 'Custom SS Valve Actuators for HPL Port Terminal',
    date: 'Aug 02, 2026',
    referralType: 'Inside Council'
  },
  {
    id: 'deal_3',
    fromUserId: 'user_2',
    fromUserName: 'Debashis Ganguly',
    fromUserCompany: 'Ganguly Heritage Tea',
    toUserId: 'user_4',
    toUserName: 'Priyanka Banerjee',
    toUserCompany: 'Bengal Loom & Silk',
    amountInINR: 3500000,
    amountFormatted: '₹ 35.0 Lakhs',
    dealDescription: 'Luxury Handcrafted Silk Tea Gift Box Corporate Packaging for UK Exporters',
    date: 'Jul 20, 2026',
    referralType: 'Cross-Chapter Referral'
  }
];

export const MOCK_MEETING_SUMMARIES: MeetingSummary[] = [
  {
    id: 'sum_1',
    title: 'Kolkata Central Chapter 84th Bi-Weekly Meeting',
    chapter: 'Kolkata Central Chapter',
    date: 'Aug 13, 2026',
    attendeesCount: 52,
    keyHighlights: [
      '38 One-to-One meetings logged during the past two weeks.',
      '4 new members joined in Healthcare and Solar Energy sectors.',
      'Special presentation on "Export Schemes for 2026" by Exim Bank Regional Head.'
    ],
    totalBusinessAnnounced: '₹ 11.45 Crores',
    nextSteps: [
      'Finalize delegation for Bengal Global Trade Expo.',
      'Next meeting on Aug 27 at The Oberoi Grand.'
    ]
  },
  {
    id: 'sum_2',
    title: 'Tech & Heavy Industry Collaboration Roundtable',
    chapter: 'Tech & Startups SIG',
    date: 'Jul 30, 2026',
    attendeesCount: 44,
    keyHighlights: [
      'Presentation of 3 AI vision pilot projects for defect reduction.',
      'Partnership signed between 2 MSME members and AI startup Synapse AI.',
      'Discussion on Bengal IT Policy support for cloud infrastructure.'
    ],
    totalBusinessAnnounced: '₹ 2.80 Crores',
    nextSteps: [
      'Roll out pilot test across 2 member factories by Sep 1.'
    ]
  }
];

export const MOCK_EVENTS: EventItem[] = [
  {
    id: 'evt_1',
    title: 'Bengal Business Council Annual Summit 2026',
    category: 'Annual Conclave',
    date: 'Saturday, Sep 26, 2026',
    time: '09:30 AM - 06:00 PM IST',
    venue: 'Biswa Bangla Mela Prangan (Convention Hall A), Kolkata',
    chiefGuest: 'Minister of Commerce & Industries, Govt. of West Bengal',
    bannerUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80',
    isRegistered: true,
    attendeesCount: 450,
    description: 'The main annual gathering of over 500+ business owners, investors, and leaders to discuss growth and opportunities in Bengal.'
  },
  {
    id: 'evt_2',
    title: 'Bi-Weekly Executive Breakfast Meeting #85',
    category: 'Bi-Weekly Chapter Meet',
    date: 'Thursday, Aug 27, 2026',
    time: '07:30 AM - 09:30 AM IST',
    venue: 'The Oberoi Grand Ballroom, Esplanade, Kolkata',
    bannerUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80',
    isRegistered: true,
    attendeesCount: 65,
    description: 'Bi-weekly meeting, member introductions, featured presentation by Medisurg Biotech, and passing business referrals.'
  },
  {
    id: 'evt_3',
    title: 'Bengal Trade Delegation to Singapore & ASEAN',
    category: 'Trade Delegation',
    date: 'Oct 14 - 18, 2026',
    time: '5 Days Commercial Delegation',
    venue: 'Marina Bay Sands Expo & Singapore Indian Chamber of Commerce',
    chiefGuest: 'High Commissioner of India to Singapore',
    bannerUrl: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&auto=format&fit=crop&q=80',
    isRegistered: false,
    attendeesCount: 28,
    description: 'B2B business delegation covering logistics, food processing exports, and cross-border tech partnerships in Singapore and ASEAN.'
  }
];

export const MOCK_MESSAGE_THREADS: MessageThread[] = [
  {
    id: 'th_1',
    participant: MOCK_USERS[1], // Ananya Roy
    lastMessage: 'Let’s meet tomorrow at 4 PM to finalize the AHU specs.',
    lastMessageTime: '10:45 AM',
    unreadCount: 1
  },
  {
    id: 'th_2',
    participant: MOCK_USERS[3], // Souvik Sen
    lastMessage: 'Contract copy sent to your legal team. Thank you Subrata!',
    lastMessageTime: 'Yesterday',
    unreadCount: 0
  },
  {
    id: 'th_3',
    participant: MOCK_USERS[2], // Debashis Ganguly
    lastMessage: 'The Darjeeling first flush sample box is on its way to your office.',
    lastMessageTime: 'Aug 17',
    unreadCount: 0
  },
  {
    id: 'th_4',
    participant: MOCK_USERS[5], // Arnab Bhattacharya
    lastMessage: 'Sending the camera sensor placement diagram for your CNC machine.',
    lastMessageTime: 'Aug 15',
    unreadCount: 0
  }
];

export const MOCK_MESSAGES: Record<string, Message[]> = {
  th_1: [
    {
      id: 'm1',
      threadId: 'th_1',
      senderId: 'user_1',
      text: 'Hi Subrata! Saw your response on my cleanroom expansion post.',
      timestamp: '10:30 AM',
      isMe: false
    },
    {
      id: 'm2',
      threadId: 'th_1',
      senderId: 'user_me',
      text: 'Yes Ananya! We have completed two similar ISO Class-10,000 cleanroom HVAC ducting systems in Howrah. We can definitely support your New Town project.',
      timestamp: '10:35 AM',
      isMe: true
    },
    {
      id: 'm3',
      threadId: 'th_1',
      senderId: 'user_1',
      text: 'That is wonderful. Can we do our scheduled 1-to-1 tomorrow at 4 PM?',
      timestamp: '10:42 AM',
      isMe: false
    },
    {
      id: 'm4',
      threadId: 'th_1',
      senderId: 'user_1',
      text: 'Let’s meet tomorrow at 4 PM to finalize the AHU specs.',
      timestamp: '10:45 AM',
      isMe: false
    }
  ]
};
