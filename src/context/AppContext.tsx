import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  User,
  Story,
  Post,
  PostComment,
  Community,
  OneToOneMeeting,
  Referral,
  BusinessDeal,
  MeetingSummary,
  EventItem,
  MessageThread,
  Message,
  AppNotification,
} from '../types';
import {
  CURRENT_USER,
  MOCK_USERS,
  MOCK_STORIES,
  MOCK_POSTS,
  MOCK_COMMENTS,
  MOCK_COMMUNITIES,
  MOCK_ONE_TO_ONE_MEETINGS,
  MOCK_REFERRALS,
  MOCK_BUSINESS_DEALS,
  MOCK_MEETING_SUMMARIES,
  MOCK_EVENTS,
  MOCK_MESSAGE_THREADS,
  MOCK_MESSAGES,
  MOCK_NOTIFICATIONS,
} from '../data/mockData';
import {
  loginRequest,
  getMeRequest,
  adaptBackendUser,
  adaptBackendUserWithProfile,
} from '../services/authApi';
import { getMyProfileRequest } from '../services/profileApi';
import { listMembers } from '../services/adminApi';
import {
  fetchFeedPosts,
  createPostRequest,
  updatePostRequest,
  deletePostRequest,
  toggleLikePostRequest,
  fetchPostCommentsRequest,
  addPostCommentRequest,
  updatePostCommentRequest,
  deletePostCommentRequest,
} from '../services/postApi';
import { subscribeToFeedRealtime } from '../services/realtimeSubscription';
import { ProfileStatus, ProfileCompletion } from '../types';
import { tokenStorage } from '../utils/tokenStorage';

interface AppContextType {
  currentUser: User;
  users: User[];
  posts: Post[];
  stories: Story[];
  communities: Community[];
  oneToOneMeetings: OneToOneMeeting[];
  referrals: Referral[];
  businessDeals: BusinessDeal[];
  meetingSummaries: MeetingSummary[];
  events: EventItem[];
  messageThreads: MessageThread[];
  messages: Record<string, Message[]>;
  comments: Record<string, PostComment[]>;
  isLoadingComments: boolean;
  notifications: AppNotification[];
  requestedAdminAccessIds: string[];
  isAuthenticated: boolean;
  /** True while a persisted session is being restored on app launch. */
  isBootstrappingAuth: boolean;
  /** True when the signed-in user carries the backend 'admin' role. */
  isAdmin: boolean;

  // Profile-details gate
  profileStatus: ProfileStatus | null;
  profileCompletion: ProfileCompletion | null;
  /** True while the profile status is being (re)fetched. */
  isLoadingProfile: boolean;
  /** Members are gated out of the app until their profile is approved (admins bypass). */
  isProfileApproved: boolean;
  refreshProfileStatus: () => Promise<void>;
  refreshMembers: () => Promise<void>;

  // Modal State
  activeStory: Story | null;
  showStoryViewer: boolean;
  showBusinessCardModal: boolean;
  selectedBusinessCardUser: User | null;
  showLogOneToOneModal: boolean;
  targetOneToOneUser: User | null;
  showGiveReferralModal: boolean;
  targetReferralUser: User | null;
  showRecordDealModal: boolean;
  showCreatePostModal: boolean;
  showCommentsModal: boolean;
  selectedPostForComments: Post | null;
  showRequestAdminAccessModal: boolean;
  selectedUserForAdminAccess: User | null;
  showNotificationsModal: boolean;
  showDrawer: boolean;
  activeSearchQuery: string;

  // Actions
  login: (user?: User) => void;
  /** Authenticate against bbc-backend with email/phone + password. Throws on failure. */
  loginWithCredentials: (identifier: string, password: string) => Promise<void>;
  logout: () => void;
  register: (newUser: Partial<User>) => void;
  switchUser: (userId: string) => void;
  toggleLikePost: (postId: string) => void;
  addComment: (postId: string, text: string, parentCommentId?: string | null) => Promise<void> | void;
  editComment: (postId: string, commentId: string, text: string) => Promise<void>;
  deleteComment: (postId: string, commentId: string) => Promise<void>;
  createPost: (
    content: string,
    optionsOrTag?: any,
    urgentRequirement?: boolean,
    budgetOrValue?: string
  ) => Promise<void> | void;
  editPost: (
    postId: string,
    content: string,
    optionsOrTag?: any
  ) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;
  refreshPosts: () => Promise<void>;
  logOneToOne: (withUserId: string, date: string, time: string, location: string, agenda: string) => void;
  markMeetingCompleted: (meetingId: string, minutes?: string) => void;
  giveReferral: (memberId: string, clientName: string, clientContact: string, serviceNeeded: string, estimatedValue: string, urgency: Referral['urgency']) => void;
  recordBusinessDeal: (toUserId: string, amountFormatted: string, amountInINR: number, dealDescription: string, referralType: BusinessDeal['referralType']) => void;
  toggleFollowUser: (userId: string) => void;
  toggleJoinCommunity: (communityId: string) => void;
  toggleRegisterEvent: (eventId: string) => void;
  sendMessage: (threadId: string, text: string) => void;
  requestAdminContactAccess: (userId: string, reason: string) => void;
  markNotificationRead: (notifId: string) => void;
  clearAllNotifications: () => void;
  
  // Modal Handlers
  openStory: (story: Story) => void;
  closeStory: () => void;
  openDigitalBusinessCard: (user?: User) => void;
  closeDigitalBusinessCard: () => void;
  openLogOneToOne: (user?: User) => void;
  closeLogOneToOne: () => void;
  openGiveReferral: (user?: User) => void;
  closeGiveReferral: () => void;
  openRecordDeal: () => void;
  closeRecordDeal: () => void;
  editingPost: Post | null;
  openCreatePost: () => void;
  openEditPostModal: (post: Post) => void;
  closeCreatePost: () => void;
  openComments: (post: Post) => void;
  closeComments: () => void;
  openRequestAdminAccess: (user: User) => void;
  closeRequestAdminAccess: () => void;
  openNotifications: () => void;
  closeNotifications: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  setActiveSearchQuery: (query: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(CURRENT_USER);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS);
  const [stories, setStories] = useState<Story[]>(MOCK_STORIES);
  const [communities, setCommunities] = useState<Community[]>(MOCK_COMMUNITIES);
  const [oneToOneMeetings, setOneToOneMeetings] = useState<OneToOneMeeting[]>(MOCK_ONE_TO_ONE_MEETINGS);
  const [referrals, setReferrals] = useState<Referral[]>(MOCK_REFERRALS);
  const [businessDeals, setBusinessDeals] = useState<BusinessDeal[]>(MOCK_BUSINESS_DEALS);
  const [meetingSummaries] = useState<MeetingSummary[]>(MOCK_MEETING_SUMMARIES);
  const [events, setEvents] = useState<EventItem[]>(MOCK_EVENTS);
  const [messageThreads, setMessageThreads] = useState<MessageThread[]>(MOCK_MESSAGE_THREADS);
  const [messages, setMessages] = useState<Record<string, Message[]>>(MOCK_MESSAGES);
  const [comments, setComments] = useState<Record<string, PostComment[]>>(MOCK_COMMENTS);
  const [isLoadingComments, setIsLoadingComments] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<AppNotification[]>(MOCK_NOTIFICATIONS);
  const [requestedAdminAccessIds, setRequestedAdminAccessIds] = useState<string[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isBootstrappingAuth, setIsBootstrappingAuth] = useState<boolean>(true);

  const [profileStatus, setProfileStatus] = useState<ProfileStatus | null>(null);
  const [profileCompletion, setProfileCompletion] = useState<ProfileCompletion | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState<boolean>(false);

  const isAdmin = (currentUser.roles ?? []).includes('admin');
  const isProfileApproved = isAdmin || profileStatus === 'approved';

  // Modals state
  const [activeStory, setActiveStory] = useState<Story | null>(null);
  const [showStoryViewer, setShowStoryViewer] = useState(false);
  const [showBusinessCardModal, setShowBusinessCardModal] = useState(false);
  const [selectedBusinessCardUser, setSelectedBusinessCardUser] = useState<User | null>(null);
  const [showLogOneToOneModal, setShowLogOneToOneModal] = useState(false);
  const [targetOneToOneUser, setTargetOneToOneUser] = useState<User | null>(null);
  const [showGiveReferralModal, setShowGiveReferralModal] = useState(false);
  const [targetReferralUser, setTargetReferralUser] = useState<User | null>(null);
  const [showRecordDealModal, setShowRecordDealModal] = useState(false);
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [selectedPostForComments, setSelectedPostForComments] = useState<Post | null>(null);
  const [showRequestAdminAccessModal, setShowRequestAdminAccessModal] = useState(false);
  const [selectedUserForAdminAccess, setSelectedUserForAdminAccess] = useState<User | null>(null);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [activeSearchQuery, setActiveSearchQuery] = useState('');

  /** Fetch all registered members from the backend and populate the directory. */
  const refreshMembers = async () => {
    try {
      const res = await listMembers();
      if (res && Array.isArray(res) && res.length > 0) {
        const adapted = res.map(m => adaptBackendUser(m as any, (m as any).profileDetails));
        setUsers(adapted);
      }
    } catch {
      // Keep existing users if backend is unreachable
    }
  };

  /** Fetch live posts from the backend feed. */
  const refreshPosts = async () => {
    try {
      const res = await fetchFeedPosts({ page: 1, limit: 20 });
      if (res && Array.isArray(res.items) && res.items.length > 0) {
        setPosts(res.items);
      }
    } catch {
      // Keep existing posts if backend is offline
    }
  };

  /** Fetch the profile-details gate state and full profile for the signed-in member. */
  const refreshProfileStatus = async () => {
    setIsLoadingProfile(true);
    try {
      const res = await getMyProfileRequest();
      setProfileStatus(res.status);
      setProfileCompletion(res.completion);
      if (res.profile) {
        setCurrentUser(prev => adaptBackendUserWithProfile(prev, res.profile!));
      }
    } catch {
      // Unreachable / unauthenticated — treat as no profile yet.
      setProfileStatus(null);
      setProfileCompletion(null);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  // Restore a persisted backend session on launch.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const token = await tokenStorage.get();
      if (!token) {
        if (!cancelled) setIsBootstrappingAuth(false);
        return;
      }

      try {
        const backendUser = await getMeRequest();
        if (cancelled) return;

        let profileData = null;
        try {
          const profileRes = await getMyProfileRequest();
          if (!cancelled) {
            setProfileStatus(profileRes.status);
            setProfileCompletion(profileRes.completion);
            profileData = profileRes.profile;
          }
        } catch {
          if (!cancelled) {
            setProfileStatus(null);
            setProfileCompletion(null);
          }
        }

        if (cancelled) return;
        setCurrentUser(adaptBackendUser(backendUser, profileData));
        setIsAuthenticated(true);
        void refreshMembers();
        void refreshPosts();
      } catch {
        // Token invalid / expired / server unreachable — drop it and show login.
        await tokenStorage.clear();
      } finally {
        if (!cancelled) setIsBootstrappingAuth(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Supabase Realtime Feed Subscription (broadcast listener)
  useEffect(() => {
    const unsubscribe = subscribeToFeedRealtime({
      onNewPost: (incomingPost: Post) => {
        console.log('[AppContext] Received live new_post:', incomingPost.id, incomingPost.authorName);
        setPosts(prev => {
          // If post with this id already exists, replace it
          const exists = prev.some(p => p.id === incomingPost.id);
          if (exists) {
            return prev.map(p => (p.id === incomingPost.id ? { ...p, ...incomingPost } : p));
          }

          // If current user created an optimistic post with same content recently, replace it
          const tempIndex = prev.findIndex(
            p =>
              p.id.startsWith('post_') &&
              p.authorId === incomingPost.authorId &&
              p.content === incomingPost.content
          );

          if (tempIndex !== -1) {
            const next = [...prev];
            next[tempIndex] = incomingPost;
            return next;
          }

          // Otherwise prepend new post to feed
          return [incomingPost, ...prev];
        });
      },
      onUpdatePost: (updatedPost: Post) => {
        console.log('[AppContext] Received live update_post:', updatedPost.id);
        setPosts(prev =>
          prev.map(p => (p.id === updatedPost.id ? { ...p, ...updatedPost } : p))
        );
      },
      onDeletePost: (payload) => {
        const targetId = payload.id || payload.deletedPostId;
        console.log('[AppContext] Received live delete_post:', targetId);
        if (targetId) {
          setPosts(prev => prev.filter(p => p.id !== targetId));
        }
      },
      onPostLike: (payload) => {
        console.log('[AppContext] Received live post_like:', payload.postId, 'likesCount:', payload.likesCount);
        if (payload?.postId) {
          setPosts(prev =>
            prev.map(p =>
              p.id === payload.postId
                ? { ...p, likesCount: payload.likesCount }
                : p
            )
          );
        }
      },
      onNewComment: (incomingComment: PostComment) => {
        console.log('[AppContext] Received live new_comment for post:', incomingComment.postId);
        setComments(prev => {
          const currentList = prev[incomingComment.postId] || [];
          const exists = currentList.some(c => c.id === incomingComment.id);
          if (exists) {
            return {
              ...prev,
              [incomingComment.postId]: currentList.map(c =>
                c.id === incomingComment.id ? { ...c, ...incomingComment } : c
              ),
            };
          }

          // Check if temp optimistic comment matches
          const tempIndex = currentList.findIndex(
            c =>
              c.id.startsWith('c_') &&
              c.authorName === incomingComment.authorName &&
              c.text === incomingComment.text
          );

          if (tempIndex !== -1) {
            const next = [...currentList];
            next[tempIndex] = incomingComment;
            return {
              ...prev,
              [incomingComment.postId]: next,
            };
          }

          return {
            ...prev,
            [incomingComment.postId]: [...currentList, incomingComment],
          };
        });

        // Update post comments count in feed
        setPosts(prev =>
          prev.map(p =>
            p.id === incomingComment.postId
              ? {
                  ...p,
                  commentsCount: (incomingComment as any).commentsCount !== undefined
                    ? (incomingComment as any).commentsCount
                    : p.commentsCount + 1,
                }
              : p
          )
        );
      },
      onUpdateComment: (incomingComment: PostComment) => {
        console.log('[AppContext] Received live update_comment for post:', incomingComment.postId, incomingComment.id);
        setComments(prev => {
          const currentList = prev[incomingComment.postId] || [];
          return {
            ...prev,
            [incomingComment.postId]: currentList.map(c =>
              c.id === incomingComment.id ? { ...c, ...incomingComment } : c
            ),
          };
        });
      },
      onDeleteComment: (payload) => {
        console.log('[AppContext] Received live delete_comment:', payload.postId, payload.commentId);
        const targetCommentId = payload.commentId || payload.deletedCommentId;
        const deletedIds = new Set<string>((payload as any).deletedCommentIds || (targetCommentId ? [targetCommentId] : []));
        if (targetCommentId) {
          deletedIds.add(targetCommentId);
        }
        if (deletedIds.size > 0) {
          setComments(prev => ({
            ...prev,
            [payload.postId]: (prev[payload.postId] || []).filter(c => !deletedIds.has(c.id) && c.parentCommentId !== targetCommentId),
          }));
        }

        setPosts(prev =>
          prev.map(p =>
            p.id === payload.postId
              ? {
                  ...p,
                  commentsCount: payload.commentsCount !== undefined
                    ? payload.commentsCount
                    : Math.max(0, p.commentsCount - 1),
                }
              : p
          )
        );
      },
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Authentication Handlers
  const login = (user?: User) => {
    if (user) {
      setCurrentUser(user);
    }
    setIsAuthenticated(true);
  };

  const loginWithCredentials = async (identifier: string, password: string) => {
    const { token, user } = await loginRequest(identifier, password);
    await tokenStorage.set(token);

    let profileData = null;
    try {
      const profileRes = await getMyProfileRequest();
      setProfileStatus(profileRes.status);
      setProfileCompletion(profileRes.completion);
      profileData = profileRes.profile;
    } catch {
      setProfileStatus(null);
      setProfileCompletion(null);
    }

    setCurrentUser(adaptBackendUser(user, profileData));
    setIsAuthenticated(true);
    void refreshMembers();
    void refreshPosts();
  };

  const logout = () => {
    setIsAuthenticated(false);
    setProfileStatus(null);
    setProfileCompletion(null);
    void tokenStorage.clear();
  };

  const switchUser = (userId: string) => {
    const found = users.find(u => u.id === userId);
    if (found) {
      setCurrentUser(found);
    }
  };

  const register = (newUser: Partial<User>) => {
    const userToCreate: User = {
      id: `user_${Date.now()}`,
      name: newUser.name || 'Member',
      designation: newUser.designation || 'Director',
      companyName: newUser.companyName || 'Business Enterprises',
      industry: newUser.industry || 'Manufacturing',
      chapter: newUser.chapter || 'Kolkata Central Chapter',
      location: newUser.location || 'Kolkata, WB',
      gstNumber: newUser.gstNumber || '19AAAAA0000A1Z5',
      isGstVerified: true,
      turnover: newUser.turnover || '₹10 Cr - ₹25 Cr',
      yearJoined: 2026,
      avatar:
        newUser.avatar ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
      membershipTier: newUser.membershipTier || 'Executive Member',
      bio: newUser.bio || 'Bengal Business Council active executive member.',
      requirementDocs: [],
      contact: {
        email: newUser.contact?.email || 'contact@bengalbusinesscouncil.com',
        phone: newUser.contact?.phone || '+91 98300 00000',
        website: 'https://bengalbusinesscouncil.com',
        officeAddress: 'Kolkata, West Bengal',
      },
      stats: {
        oneToOneCount: 0,
        referralsGiven: 0,
        referralsReceived: 0,
        businessValueInLakhs: 0,
      },
    };

    setUsers(prev => [userToCreate, ...prev]);
    setCurrentUser(userToCreate);
    setIsAuthenticated(true);
  };

  // Actions
  const toggleLikePost = async (postId: string) => {
    setPosts(prev =>
      prev.map(post => {
        if (post.id === postId) {
          const isLiked = !post.isLiked;
          return {
            ...post,
            isLiked,
            likesCount: isLiked ? post.likesCount + 1 : Math.max(0, post.likesCount - 1),
          };
        }
        return post;
      })
    );

    try {
      const res = await toggleLikePostRequest(postId);
      if (res) {
        setPosts(prev =>
          prev.map(post =>
            post.id === postId ? { ...post, isLiked: res.isLiked, likesCount: res.likesCount } : post
          )
        );
      }
    } catch (err) {
      console.warn('[toggleLikePost] backend sync failed:', err);
    }
  };

  const addComment = async (postId: string, text: string, parentCommentId?: string | null) => {
    if (!text.trim()) return;

    const tempComment: PostComment = {
      id: `c_${Date.now()}`,
      postId,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorCompany: currentUser.companyName,
      authorDesignation: currentUser.designation,
      authorAvatar: currentUser.avatar,
      text: text.trim(),
      createdAt: 'Just now',
      parentCommentId: parentCommentId || null,
    };

    setComments(prev => ({
      ...prev,
      [postId]: [...(prev[postId] || []), tempComment],
    }));

    setPosts(prev =>
      prev.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            commentsCount: p.commentsCount + 1,
          };
        }
        return p;
      })
    );

    try {
      const res = await addPostCommentRequest(postId, text.trim(), parentCommentId);
      if (res && res.id) {
        setComments(prev => ({
          ...prev,
          [postId]: (prev[postId] || []).map(c => (c.id === tempComment.id ? res : c)),
        }));
      }
    } catch (err) {
      console.warn('[addComment] backend sync failed:', err);
    }
  };

  const editComment = async (postId: string, commentId: string, text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    // Optimistically update comment
    setComments(prev => ({
      ...prev,
      [postId]: (prev[postId] || []).map(c =>
        c.id === commentId ? { ...c, text: trimmed } : c
      ),
    }));

    try {
      const res = await updatePostCommentRequest(postId, commentId, trimmed);
      if (res && res.id) {
        setComments(prev => ({
          ...prev,
          [postId]: (prev[postId] || []).map(c => (c.id === commentId ? res : c)),
        }));
      }
    } catch (err) {
      console.warn('[editComment] backend sync failed:', err);
    }
  };

  const deleteComment = async (postId: string, commentId: string) => {
    // Optimistically remove comment and all its nested child replies
    let removedCount = 1;
    setComments(prev => {
      const currentList = prev[postId] || [];
      const toRemove = new Set<string>([commentId]);
      currentList.forEach(c => {
        if (c.parentCommentId === commentId) {
          toRemove.add(c.id);
        }
      });
      removedCount = toRemove.size;
      return {
        ...prev,
        [postId]: currentList.filter(c => !toRemove.has(c.id)),
      };
    });

    setPosts(prev =>
      prev.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            commentsCount: Math.max(0, p.commentsCount - removedCount),
          };
        }
        return p;
      })
    );

    try {
      await deletePostCommentRequest(postId, commentId);
    } catch (err) {
      console.warn('[deleteComment] backend sync failed:', err);
    }
  };

  const createPost = async (
    content: string,
    optionsOrTag?: any,
    urgentRequirement?: boolean,
    budgetOrValue?: string
  ) => {
    let mediaUrl: string | undefined;
    let documentAttachment: any;
    let tag: Post['tag'] = 'General';
    let isUrgent = false;
    let budget: string | undefined;

    if (typeof optionsOrTag === 'object' && optionsOrTag !== null) {
      mediaUrl = optionsOrTag.mediaUrl;
      documentAttachment = optionsOrTag.documentAttachment;
      tag = optionsOrTag.tag || 'General';
      isUrgent = !!optionsOrTag.urgentRequirement;
      budget = optionsOrTag.budgetOrValue;
    } else if (typeof optionsOrTag === 'string') {
      tag = optionsOrTag as Post['tag'];
      isUrgent = !!urgentRequirement;
      budget = budgetOrValue;
    }

    const tempId = `post_${Date.now()}`;
    const optimisticPost: Post = {
      id: tempId,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorDesignation: currentUser.designation,
      authorCompany: currentUser.companyName,
      authorAvatar: currentUser.avatar,
      chapter: currentUser.chapter || 'Kolkata Central Chapter',
      createdAt: 'Just now',
      content,
      tag: tag || 'General',
      mediaUrl,
      documentAttachment,
      urgentRequirement: isUrgent,
      budgetOrValue: budget,
      likesCount: 0,
      isLiked: false,
      commentsCount: 0,
      sharesCount: 0,
    };

    setPosts(prev => [optimisticPost, ...prev]);

    try {
      const serverPost = await createPostRequest({
        content,
        mediaUrl,
        documentAttachment,
      });
      if (serverPost && serverPost.id) {
        setPosts(prev =>
          prev.map(p => (p.id === tempId ? { ...serverPost, tag: serverPost.tag || tag } : p))
        );
      }
    } catch (err) {
      console.warn('[createPost] backend creation failed:', err);
    }
  };

  const editPost = async (
    postId: string,
    content: string,
    optionsOrTag?: any
  ) => {
    let mediaUrl: string | undefined;
    let documentAttachment: any;
    let tag: Post['tag'] = 'General';

    if (typeof optionsOrTag === 'object' && optionsOrTag !== null) {
      mediaUrl = optionsOrTag.mediaUrl;
      documentAttachment = optionsOrTag.documentAttachment;
      tag = optionsOrTag.tag || 'General';
    }

    // Optimistically update in feed
    setPosts(prev =>
      prev.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            content,
            mediaUrl: mediaUrl !== undefined ? mediaUrl : p.mediaUrl,
            documentAttachment:
              documentAttachment !== undefined ? documentAttachment : p.documentAttachment,
            tag: tag || p.tag,
          };
        }
        return p;
      })
    );

    try {
      const updated = await updatePostRequest(postId, {
        content,
        mediaUrl,
        documentAttachment,
      });
      if (updated && updated.id) {
        setPosts(prev =>
          prev.map(p => (p.id === postId ? { ...p, ...updated, tag: updated.tag || p.tag } : p))
        );
      }
    } catch (err) {
      console.warn('[editPost] backend update failed:', err);
    }
  };

  const deletePost = async (postId: string) => {
    // Optimistically remove from feed
    setPosts(prev => prev.filter(p => p.id !== postId));

    try {
      await deletePostRequest(postId);
    } catch (err) {
      console.warn('[deletePost] backend deletion failed:', err);
    }
  };

  const logOneToOne = (
    withUserId: string,
    date: string,
    time: string,
    location: string,
    agenda: string
  ) => {
    const target = users.find(u => u.id === withUserId) || users[1];
    const newMeeting: OneToOneMeeting = {
      id: `oto_${Date.now()}`,
      creatorId: currentUser.id,
      creatorName: currentUser.name,
      creatorCompany: currentUser.companyName,
      creatorAvatar: currentUser.avatar,
      withUserId: target.id,
      withUserName: target.name,
      withUserCompany: target.companyName,
      withUserAvatar: target.avatar,
      date: date || 'Upcoming',
      time: time || '11:00 AM',
      status: 'Scheduled',
      locationOrLink: location || 'Council Office Boardroom, Salt Lake',
      agenda: agenda || 'Discuss business services and project collaboration.',
      createdAt: 'Just now',
    };

    setOneToOneMeetings(prev => [newMeeting, ...prev]);

    // Push instant notification to the recipient member
    const newNotif: AppNotification = {
      id: `notif_${Date.now()}`,
      recipientId: target.id,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      senderCompany: currentUser.companyName,
      title: 'New 1-to-1 Meeting Scheduled',
      message: `${currentUser.name} scheduled a 1-to-1 meeting with you for ${date || 'Upcoming'} at ${time || '11:00 AM'}.`,
      type: 'Meeting',
      timestamp: 'Just now',
      read: false,
      meetingDetails: {
        date: date || 'Upcoming',
        time: time || '11:00 AM',
        location: location || 'Council Office Boardroom, Salt Lake',
        agenda: agenda || 'Discuss business services and project collaboration.',
      },
    };
    setNotifications(prev => [newNotif, ...prev]);

    setCurrentUser(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        oneToOneCount: prev.stats.oneToOneCount + 1,
      },
    }));
  };

  const markMeetingCompleted = (meetingId: string, minutes?: string) => {
    setOneToOneMeetings(prev =>
      prev.map(m => {
        if (m.id === meetingId) {
          return {
            ...m,
            status: 'Completed',
            meetingMinutes: minutes || 'Meeting completed successfully. Strategic action items agreed.',
          };
        }
        return m;
      })
    );
  };

  const giveReferral = (
    memberId: string,
    clientName: string,
    clientContact: string,
    serviceNeeded: string,
    estimatedValue: string,
    urgency: Referral['urgency']
  ) => {
    const target = users.find(u => u.id === memberId) || users[1];
    const newRef: Referral = {
      id: `ref_${Date.now()}`,
      fromUserId: currentUser.id,
      fromUserName: currentUser.name,
      fromUserCompany: currentUser.companyName,
      fromUserAvatar: currentUser.avatar,
      toUserId: target.id,
      toUserName: target.name,
      toUserCompany: target.companyName,
      toUserAvatar: target.avatar,
      clientOrProspectName: clientName,
      clientContact: clientContact,
      serviceNeeded: serviceNeeded,
      date: 'Today',
      status: 'New Lead',
      estimatedValue: estimatedValue || '₹ 25 Lakhs',
      urgency: urgency || 'Immediate',
    };

    setReferrals(prev => [newRef, ...prev]);
    setCurrentUser(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        referralsGiven: prev.stats.referralsGiven + 1,
      },
    }));
  };

  const recordBusinessDeal = (
    toUserId: string,
    amountFormatted: string,
    amountInINR: number,
    dealDescription: string,
    referralType: BusinessDeal['referralType']
  ) => {
    const target = users.find(u => u.id === toUserId) || users[1];
    const newDeal: BusinessDeal = {
      id: `deal_${Date.now()}`,
      fromUserId: currentUser.id,
      fromUserName: currentUser.name,
      fromUserCompany: currentUser.companyName,
      toUserId: target.id,
      toUserName: target.name,
      toUserCompany: target.companyName,
      amountInINR: amountInINR || 1000000,
      amountFormatted: amountFormatted || '₹ 10.0 Lakhs',
      dealDescription: dealDescription || 'Closed business deal',
      date: 'Today',
      referralType: referralType || 'Inside Council',
    };

    setBusinessDeals(prev => [newDeal, ...prev]);
    const addedLakhs = (amountInINR || 1000000) / 100000;
    setCurrentUser(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        businessValueInLakhs: prev.stats.businessValueInLakhs + addedLakhs,
      },
    }));
  };

  const toggleFollowUser = (userId: string) => {
    setUsers(prev =>
      prev.map(u => (u.id === userId ? { ...u, isFollowed: !u.isFollowed } : u))
    );
  };

  const toggleJoinCommunity = (communityId: string) => {
    setCommunities(prev =>
      prev.map(c => {
        if (c.id === communityId) {
          const isJoined = !c.isJoined;
          return {
            ...c,
            isJoined,
            membersCount: isJoined ? c.membersCount + 1 : c.membersCount - 1,
          };
        }
        return c;
      })
    );
  };

  const toggleRegisterEvent = (eventId: string) => {
    setEvents(prev =>
      prev.map(e => {
        if (e.id === eventId) {
          const isRegistered = !e.isRegistered;
          return {
            ...e,
            isRegistered,
            attendeesCount: isRegistered ? e.attendeesCount + 1 : e.attendeesCount - 1,
          };
        }
        return e;
      })
    );
  };

  const sendMessage = (threadId: string, text: string) => {
    if (!text.trim()) return;
    const newMsg: Message = {
      id: `m_${Date.now()}`,
      threadId,
      senderId: currentUser.id,
      text: text.trim(),
      timestamp: 'Just now',
      isMe: true,
    };

    setMessages(prev => ({
      ...prev,
      [threadId]: [...(prev[threadId] || []), newMsg],
    }));

    setMessageThreads(prev =>
      prev.map(th =>
        th.id === threadId
          ? { ...th, lastMessage: text.trim(), lastMessageTime: 'Just now' }
          : th
      )
    );
  };

  const requestAdminContactAccess = (userId: string, _reason: string) => {
    setRequestedAdminAccessIds(prev => (prev.includes(userId) ? prev : [...prev, userId]));
  };

  // Modal helpers
  const openStory = (story: Story) => {
    setActiveStory(story);
    setShowStoryViewer(true);
    setStories(prev =>
      prev.map(s => (s.id === story.id ? { ...s, viewed: true } : s))
    );
  };
  const closeStory = () => {
    setShowStoryViewer(false);
    setActiveStory(null);
  };

  const openDigitalBusinessCard = (user?: User) => {
    setSelectedBusinessCardUser(user || currentUser);
    setShowBusinessCardModal(true);
  };
  const closeDigitalBusinessCard = () => {
    setShowBusinessCardModal(false);
    setSelectedBusinessCardUser(null);
  };

  const openLogOneToOne = (user?: User) => {
    setTargetOneToOneUser(user || null);
    setShowLogOneToOneModal(true);
  };
  const closeLogOneToOne = () => {
    setShowLogOneToOneModal(false);
    setTargetOneToOneUser(null);
  };

  const openGiveReferral = (user?: User) => {
    setTargetReferralUser(user || null);
    setShowGiveReferralModal(true);
  };
  const closeGiveReferral = () => {
    setShowGiveReferralModal(false);
    setTargetReferralUser(null);
  };

  const openRecordDeal = () => setShowRecordDealModal(true);
  const closeRecordDeal = () => setShowRecordDealModal(false);

  const openCreatePost = () => {
    setEditingPost(null);
    setShowCreatePostModal(true);
  };
  const openEditPostModal = (post: Post) => {
    setEditingPost(post);
    setShowCreatePostModal(true);
  };
  const closeCreatePost = () => {
    setShowCreatePostModal(false);
    setEditingPost(null);
  };

  const openComments = async (post: Post) => {
    setSelectedPostForComments(post);
    setShowCommentsModal(true);
    setIsLoadingComments(true);
    try {
      const res = await fetchPostCommentsRequest(post.id, 1, 50);
      if (res && Array.isArray(res.items)) {
        setComments(prev => ({
          ...prev,
          [post.id]: res.items,
        }));
      }
    } catch (err) {
      console.warn('[openComments] Failed to fetch comments:', err);
    } finally {
      setIsLoadingComments(false);
    }
  };
  const closeComments = () => {
    setShowCommentsModal(false);
    setSelectedPostForComments(null);
  };

  const openRequestAdminAccess = (user: User) => {
    setSelectedUserForAdminAccess(user);
    setShowRequestAdminAccessModal(true);
  };
  const closeRequestAdminAccess = () => {
    setShowRequestAdminAccessModal(false);
    setSelectedUserForAdminAccess(null);
  };

  const openNotifications = () => setShowNotificationsModal(true);
  const closeNotifications = () => setShowNotificationsModal(false);

  const markNotificationRead = (notifId: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === notifId ? { ...n, read: true } : n))
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const openDrawer = () => setShowDrawer(true);
  const closeDrawer = () => setShowDrawer(false);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        posts,
        stories,
        communities,
        oneToOneMeetings,
        referrals,
        businessDeals,
        meetingSummaries,
        events,
        messageThreads,
        messages,
        comments,
        isLoadingComments,
        notifications,
        requestedAdminAccessIds,
        isAuthenticated,
        isBootstrappingAuth,
        isAdmin,
        profileStatus,
        profileCompletion,
        isLoadingProfile,
        isProfileApproved,
        refreshProfileStatus,
        refreshMembers,

        activeStory,
        showStoryViewer,
        showBusinessCardModal,
        selectedBusinessCardUser,
        showLogOneToOneModal,
        targetOneToOneUser,
        showGiveReferralModal,
        targetReferralUser,
        showRecordDealModal,
        showCreatePostModal,
        editingPost,
        showCommentsModal,
        selectedPostForComments,
        showRequestAdminAccessModal,
        selectedUserForAdminAccess,
        showNotificationsModal,
        showDrawer,
        activeSearchQuery,

        login,
        loginWithCredentials,
        logout,
        register,
        switchUser,
        toggleLikePost,
        addComment,
        editComment,
        deleteComment,
        createPost,
        editPost,
        deletePost,
        refreshPosts,
        logOneToOne,
        markMeetingCompleted,
        giveReferral,
        recordBusinessDeal,
        toggleFollowUser,
        toggleJoinCommunity,
        toggleRegisterEvent,
        sendMessage,
        requestAdminContactAccess,
        markNotificationRead,
        clearAllNotifications,

        openStory,
        closeStory,
        openDigitalBusinessCard,
        closeDigitalBusinessCard,
        openLogOneToOne,
        closeLogOneToOne,
        openGiveReferral,
        closeGiveReferral,
        openRecordDeal,
        closeRecordDeal,
        openCreatePost,
        openEditPostModal,
        closeCreatePost,
        openComments,
        closeComments,
        openRequestAdminAccess,
        closeRequestAdminAccess,
        openNotifications,
        closeNotifications,
        openDrawer,
        closeDrawer,
        setActiveSearchQuery,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
