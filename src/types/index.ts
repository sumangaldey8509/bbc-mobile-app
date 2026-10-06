export type ProfileStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'rejected';

export interface RequirementDoc {
  title: string;
  publicLink: string;
}

export interface ProfileDetails {
  _id?: string;
  userId?: string;
  designation: string;
  companyName: string;
  industry: string[];
  state: string;
  city: string;
  gstNumber: string;
  isGstVerified: boolean;
  turnover: number | null;
  turnoverUnit?: 'k' | 'l' | 'cr';
  yearJoined: number | null;
  avatar: string;
  avatarUpdatedAt?: string | null;
  coverImage: string;
  coverImageUpdatedAt?: string | null;
  bio: string;
  requirementDocs: RequirementDoc[];
  website: string;
  officeAddress: string;
  status: ProfileStatus;
  submittedAt?: string | null;
  reviewedAt?: string | null;
  reviewNote?: string;
}

export interface ProfileCompletion {
  percent: number;
  filled: number;
  total: number;
  /** Every completion field not yet filled (includes photo & cover). */
  missing: string[];
  /** Only the fields that block submission. */
  missingRequired: string[];
  /** True when all required (non-photo) fields are filled. */
  canSubmit: boolean;
}

export interface ProfileMeResponse {
  profile: ProfileDetails | null;
  completion: ProfileCompletion;
  status: ProfileStatus;
  gate: 'ok' | 'blocked';
}

export interface User {
  id: string;
  name: string;
  designation: string;
  companyName: string;
  industry: string;
  chapter: string;
  location: string;
  gstNumber: string;
  isGstVerified: boolean;
  turnover: string;
  yearJoined: number;
  avatar: string;
  coverImage?: string;
  membershipTier: 'Founder Council' | 'Executive Member' | 'Enterprise Council' | 'Global Council';
  bio: string;
  requirementDocs?: { title: string; size?: string; type?: string; publicLink?: string }[];
  contact: {
    email: string;
    phone: string;
    website: string;
    officeAddress: string;
  };
  isFollowed?: boolean;
  hasActiveStory?: boolean;
  /** Backend role names (e.g. ['admin', 'member']). Present for API-authenticated users. */
  roles?: string[];
  stats: {
    oneToOneCount: number;
    referralsGiven: number;
    referralsReceived: number;
    businessValueInLakhs: number;
  };
}

export interface Story {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  companyName: string;
  title: string;
  caption: string;
  tag: 'Announcement' | 'Requirement' | 'Milestone' | 'Event';
  timestamp: string;
  viewed: boolean;
  accentColor?: string;
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorDesignation: string;
  authorCompany: string;
  authorAvatar: string;
  chapter: string;
  createdAt: string;
  content: string;
  tag: 'B2B Requirement' | 'Deal Won' | 'Partnership Ask' | 'General' | 'Event Highlight';
  mediaUrl?: string;
  documentAttachment?: { name: string; size: string; type: string };
  likesCount: number;
  isLiked: boolean;
  commentsCount: number;
  sharesCount: number;
  urgentRequirement?: boolean;
  budgetOrValue?: string;
}

export interface PostComment {
  id: string;
  postId: string;
  authorId?: string;
  authorName: string;
  authorCompany?: string;
  authorDesignation?: string;
  authorAvatar?: string;
  text: string;
  createdAt: string;
  parentCommentId?: string | null;
}

export interface Community {
  id: string;
  name: string;
  type: 'Regional Chapter' | 'Industry Special Interest Group (SIG)' | 'Global Chapter';
  description: string;
  presidentName: string;
  presidentAvatar: string;
  presidentCompany: string;
  membersCount: number;
  activeDiscussionsCount: number;
  nextMeeting: {
    title: string;
    date: string;
    time: string;
    venue: string;
  };
  banner: string;
  isJoined: boolean;
}

export interface OneToOneMeeting {
  id: string;
  creatorId?: string;
  creatorName?: string;
  creatorCompany?: string;
  creatorAvatar?: string;
  withUserId: string;
  withUserName: string;
  withUserCompany: string;
  withUserAvatar: string;
  date: string;
  time: string;
  status: 'Scheduled' | 'Completed' | 'Pending Confirmation';
  locationOrLink: string;
  agenda: string;
  meetingMinutes?: string;
  actionItems?: string[];
  createdAt?: string;
}

export interface AppNotification {
  id: string;
  recipientId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  senderCompany?: string;
  title: string;
  message: string;
  type: 'like' | 'comment' | 'meeting' | 'referral' | 'deal' | 'general' | 'Like' | 'Comment' | 'Meeting' | 'Referral' | 'Deal' | 'General';
  timestamp: string;
  read: boolean;
  postId?: string;
  commentId?: string;
  createdAt?: string;
  meetingDetails?: {
    date: string;
    time: string;
    location: string;
    agenda: string;
  };
}

export interface Referral {
  id: string;
  fromUserId: string;
  fromUserName: string;
  fromUserCompany: string;
  fromUserAvatar: string;
  toUserId: string;
  toUserName: string;
  toUserCompany: string;
  toUserAvatar: string;
  type?: 'Given By Me' | 'Received By Me';
  memberId?: string;
  memberName?: string;
  memberCompany?: string;
  memberAvatar?: string;
  clientOrProspectName: string;
  clientContact: string;
  serviceNeeded: string;
  date: string;
  status: 'New Lead' | 'In Discussion' | 'Deal Closed' | 'Not Feasible';
  estimatedValue: string;
  urgency: 'Immediate' | 'Within 30 Days' | 'Exploring';
}

export interface BusinessDeal {
  id: string;
  fromUserId: string;
  fromUserName: string;
  fromUserCompany: string;
  toUserId: string;
  toUserName: string;
  toUserCompany: string;
  amountInINR: number;
  amountFormatted: string;
  dealDescription: string;
  date: string;
  referralType: 'Inside Council' | 'Cross-Chapter Referral' | 'Tier-3 Referral';
}

export interface MeetingSummary {
  id: string;
  title: string;
  chapter: string;
  date: string;
  attendeesCount: number;
  keyHighlights: string[];
  totalBusinessAnnounced: string;
  nextSteps: string[];
}

export interface EventItem {
  id: string;
  title: string;
  category: 'Annual Conclave' | 'Bi-Weekly Chapter Meet' | 'Trade Delegation' | 'Masterclass';
  date: string;
  time: string;
  venue: string;
  chiefGuest?: string;
  bannerUrl: string;
  isRegistered: boolean;
  attendeesCount: number;
  description: string;
}

export interface Message {
  id: string;
  threadId: string;
  senderId: string;
  text: string;
  timestamp: string;
  isMe: boolean;
}

export interface MessageThread {
  id: string;
  participant: User;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}
