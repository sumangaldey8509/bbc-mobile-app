import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
  Keyboard,
  StatusBar,
  Platform,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Modal,
  Animated,
  AppState,
  AppStateStatus,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import {
  Send,
  ArrowLeft,
  CalendarPlus,
  DollarSign,
  QrCode,
  ShieldCheck,
  Building2,
  UserPlus,
  X,
  Search,
  Check,
  CheckCheck,
} from 'lucide-react-native';
import { colors } from '../theme/colors';
import { InitialsAvatar } from '../components/InitialsAvatar';
import { UserTierBadge } from '../components/UserTierBadge';
import { useApp } from '../context/AppContext';
import { Header } from '../components/Header';
import { MessageThread, Message } from '../types';
import { MessagesScreenSkeleton } from '../components/SkeletonLoader';
import {
  fetchMessageThreadsRequest,
  createMessageThreadRequest,
  fetchThreadMessagesRequest,
  sendThreadMessageRequest,
  markThreadReadRequest,
  markMessagesDeliveredRequest,
  sendTypingStatusRequest,
} from '../services/messageApi';
import {
  subscribeToFeedRealtime,
  broadcastTyping,
  broadcastMessageDelivered,
  broadcastMessageRead,
  ensureRealtimeConnected,
} from '../services/realtimeSubscription';

const isSameDay = (a?: string | null, b?: string | null): boolean => {
  if (!a || !b) return false;
  const d1 = new Date(a);
  const d2 = new Date(b);
  if (Number.isNaN(d1.getTime()) || Number.isNaN(d2.getTime())) return false;
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

const formatDateSeparator = (value?: string | null): string => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((today.getTime() - target.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString([], { day: 'numeric', month: 'short' });
  }
  return date.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' });
};

const formatMessageTime = (value?: string | null): string => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
};

const formatThreadTime = (value?: string | null): string => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((today.getTime() - target.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  }
  if (diffDays === 1) return 'Yesterday';
  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString([], { day: '2-digit', month: 'short' });
  }
  return date.toLocaleDateString([], { day: '2-digit', month: '2-digit', year: '2-digit' });
};

const formatTime = formatThreadTime;

const mergeReceiptStatus = (
  oldStatus?: 'sent' | 'delivered' | 'seen',
  newStatus?: 'sent' | 'delivered' | 'seen'
): 'sent' | 'delivered' | 'seen' => {
  if (oldStatus === 'seen' || newStatus === 'seen') return 'seen';
  if (oldStatus === 'delivered' || newStatus === 'delivered') return 'delivered';
  return newStatus || oldStatus || 'sent';
};

const TypingAnimation: React.FC = () => {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createAnim = (val: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(val, {
            toValue: -5,
            duration: 260,
            useNativeDriver: true,
          }),
          Animated.timing(val, {
            toValue: 0,
            duration: 260,
            useNativeDriver: true,
          }),
          Animated.delay(350),
        ])
      );
    };

    const a1 = createAnim(dot1, 0);
    const a2 = createAnim(dot2, 140);
    const a3 = createAnim(dot3, 280);

    a1.start();
    a2.start();
    a3.start();

    return () => {
      a1.stop();
      a2.stop();
      a3.stop();
    };
  }, [dot1, dot2, dot3]);

  return (
    <View style={styles.typingDotsContainer}>
      <Animated.View style={[styles.typingDot, { transform: [{ translateY: dot1 }] }]} />
      <Animated.View style={[styles.typingDot, { transform: [{ translateY: dot2 }] }]} />
      <Animated.View style={[styles.typingDot, { transform: [{ translateY: dot3 }] }]} />
    </View>
  );
};

export const MessagesScreen: React.FC = () => {
  const {
    users,
    currentUser,
    openLogOneToOne,
    openRecordDeal,
    openDigitalBusinessCard,
  } = useApp();

  const [messageThreads, setMessageThreads] = useState<MessageThread[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingConversation, setIsLoadingConversation] = useState(false);
  const [activeThread, setActiveThread] = useState<MessageThread | null>(null);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showMemberPicker, setShowMemberPicker] = useState(false);
  const [memberQuery, setMemberQuery] = useState('');
  const [startingMemberId, setStartingMemberId] = useState<string | null>(null);
  const [pickerError, setPickerError] = useState('');
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const [typingThreads, setTypingThreads] = useState<Record<string, boolean>>({});

  const messagesRef = useRef<ScrollView>(null);
  const activeThreadRef = useRef<MessageThread | null>(null);
  const openedNotificationThreadRef = useRef<string | null>(null);
  const isSelfTypingRef = useRef(false);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const otherTypingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const route = useRoute<any>();
  const navigation = useNavigation();

  // Floating sticky date separator state & animation
  const [floatingDate, setFloatingDate] = useState<string>('');
  const floatingDateOpacity = useRef(new Animated.Value(0)).current;
  const hideFloatingDateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dateSeparatorPositionsRef = useRef<Record<number, { y: number; label: string }>>({});

  const hideFloatingDate = useCallback((immediate = false) => {
    if (hideFloatingDateTimerRef.current) {
      clearTimeout(hideFloatingDateTimerRef.current);
      hideFloatingDateTimerRef.current = null;
    }
    if (immediate) {
      floatingDateOpacity.setValue(0);
    } else {
      Animated.timing(floatingDateOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }
  }, [floatingDateOpacity]);

  const showFloatingDate = useCallback(() => {
    Animated.timing(floatingDateOpacity, {
      toValue: 1,
      duration: 120,
      useNativeDriver: true,
    }).start();

    if (hideFloatingDateTimerRef.current) {
      clearTimeout(hideFloatingDateTimerRef.current);
    }
    hideFloatingDateTimerRef.current = setTimeout(() => {
      Animated.timing(floatingDateOpacity, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }).start();
    }, 1400);
  }, [floatingDateOpacity]);

  const handleMessagesScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const scrollY = event.nativeEvent.contentOffset.y;
      const separators = Object.values(dateSeparatorPositionsRef.current).sort((a, b) => a.y - b.y);

      // 1. If at top of chat, the inline date separator is already visible in its natural place
      const firstSep = separators[0];
      const isAtTop = firstSep ? scrollY <= firstSep.y + 10 : scrollY <= 25;

      // 2. If any inline date separator is currently in the top slot of the viewport ([-15px to 55px]), hide floating badge so it does not overlap
      const isOverlappingInlineSep = separators.some(
        (sep) => sep.y - scrollY >= -15 && sep.y - scrollY <= 55
      );

      if (isAtTop || isOverlappingInlineSep) {
        hideFloatingDate(true);
        return;
      }

      showFloatingDate();

      if (separators.length > 0) {
        let activeLabel = separators[0].label;
        for (const sep of separators) {
          if (sep.y <= scrollY + 45) {
            activeLabel = sep.label;
          } else {
            break;
          }
        }
        setFloatingDate(activeLabel);
      }
    },
    [hideFloatingDate, showFloatingDate]
  );

  useEffect(() => {
    dateSeparatorPositionsRef.current = {};
    if (activeThread && messages[activeThread.id]?.length) {
      const threadMsgs = messages[activeThread.id];
      const lastMsg = threadMsgs[threadMsgs.length - 1];
      setFloatingDate(formatDateSeparator(lastMsg.createdAt || lastMsg.timestamp));
    }
    return () => {
      if (hideFloatingDateTimerRef.current) {
        clearTimeout(hideFloatingDateTimerRef.current);
      }
    };
  }, [activeThread?.id, messages]);

  // Hide bottom tab bar in active conversation view (WhatsApp experience)
  useEffect(() => {
    if (activeThread) {
      navigation.setOptions({ tabBarStyle: { display: 'none' } });
    } else {
      navigation.setOptions({ tabBarStyle: undefined });
    }
    return () => {
      navigation.setOptions({ tabBarStyle: undefined });
    };
  }, [activeThread, navigation]);

  // Auto scroll to bottom when keyboard opens
  useEffect(() => {
    if (!activeThread) return;
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const sub = Keyboard.addListener(showEvent, () => {
      setTimeout(() => {
        messagesRef.current?.scrollToEnd({ animated: true });
      }, 80);
    });
    return () => {
      sub.remove();
    };
  }, [activeThread]);

  const loadThreads = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      setMessageThreads(await fetchMessageThreadsRequest());
    } catch (error) {
      if (!silent) Alert.alert('Could not load messages', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadThreads();
  }, [loadThreads]);

  useEffect(() => {
    const requestedThreadId = route.params?.threadId;
    if (!requestedThreadId || openedNotificationThreadRef.current === requestedThreadId) return;
    const requestedThread = messageThreads.find((thread) => thread.id === requestedThreadId);
    if (requestedThread) {
      openedNotificationThreadRef.current = requestedThreadId;
      setActiveThread(requestedThread);
    }
  }, [messageThreads, route.params?.threadId]);

  const currentMessages = activeThread ? (messages[activeThread.id] || []) : [];

  const loadConversation = useCallback(async (thread: MessageThread, silent = false) => {
    if (!silent) setIsLoadingConversation(true);
    try {
      const response = await fetchThreadMessagesRequest(thread.id);
      setMessages(prev => {
        const existingList = prev[thread.id] || [];
        const existingMap = new Map(existingList.map(m => [m.id, m]));
        const mergedItems = response.items.map(incoming => {
          const old = existingMap.get(incoming.id);
          if (!old) return incoming;
          return {
            ...incoming,
            receiptStatus: mergeReceiptStatus(old.receiptStatus, incoming.receiptStatus),
            deliveredAt: old.deliveredAt || incoming.deliveredAt || null,
            seenAt: old.seenAt || incoming.seenAt || null,
          };
        });
        return { ...prev, [thread.id]: mergedItems };
      });
      try {
        await markThreadReadRequest(thread.id);
        if (currentUser?.id) {
          void broadcastMessageRead(thread.id, currentUser.id);
        }
        void markMessagesDeliveredRequest().catch(() => { });
        setMessageThreads(prev => prev.map(item => item.id === thread.id ? { ...item, unreadCount: 0 } : item));
      } catch (receiptError) {
        console.warn('[Messages] Could not mark conversation as seen:', receiptError);
      }
    } catch (error) {
      if (!silent) Alert.alert('Could not load conversation', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      if (!silent) setIsLoadingConversation(false);
    }
  }, [currentUser?.id]);

  useEffect(() => {
    if (!activeThread) return;
    void loadConversation(activeThread);
  }, [activeThread, loadConversation]);

  // Track active thread ref and reset typing timers on thread switch
  useEffect(() => {
    setIsOtherTyping(false);
    if (otherTypingTimerRef.current) clearTimeout(otherTypingTimerRef.current);

    if (isSelfTypingRef.current && activeThreadRef.current && currentUser?.id) {
      isSelfTypingRef.current = false;
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      void broadcastTyping(activeThreadRef.current.id, currentUser.id, false);
      void sendTypingStatusRequest(activeThreadRef.current.id, false).catch(() => { });
    }

    activeThreadRef.current = activeThread;
  }, [activeThread, currentUser?.id]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      if (otherTypingTimerRef.current) clearTimeout(otherTypingTimerRef.current);
      if (isSelfTypingRef.current && activeThreadRef.current && currentUser?.id) {
        void broadcastTyping(activeThreadRef.current.id, currentUser.id, false);
        void sendTypingStatusRequest(activeThreadRef.current.id, false).catch(() => { });
      }
    };
  }, [currentUser?.id]);

  // Acknowledge delivery of any pending messages when Messages screen mounts
  useEffect(() => {
    void markMessagesDeliveredRequest().catch((receiptError) => {
      console.warn('[Messages] Could not acknowledge initial delivery:', receiptError);
    });
  }, []);

  // Listen for AppState changes (e.g. app reopened from background) to re-sync delivery & read receipts
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        ensureRealtimeConnected();
        void markMessagesDeliveredRequest().catch(() => { });
        const open = activeThreadRef.current;
        if (open) {
          void markThreadReadRequest(open.id).catch(() => { });
          if (currentUser?.id) {
            void broadcastMessageRead(open.id, currentUser.id);
          }
        }
      }
    };

    const sub = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      sub.remove();
    };
  }, [currentUser?.id]);

  // Realtime subscription for instant messages, typing, delivery and read receipts
  useEffect(() => {
    const unsubscribe = subscribeToFeedRealtime({
      onTyping: (payload) => {
        const myId = currentUser?.id;
        if (!myId || String(payload.userId) === String(myId)) return;

        // Update list preview map
        setTypingThreads((prev) => {
          if (prev[payload.threadId] === payload.isTyping) return prev;
          return { ...prev, [payload.threadId]: payload.isTyping };
        });

        // Update active thread typing indicator
        const openThread = activeThreadRef.current;
        if (openThread && String(openThread.id) === String(payload.threadId)) {
          if (payload.isTyping) {
            setIsOtherTyping(true);
            if (otherTypingTimerRef.current) clearTimeout(otherTypingTimerRef.current);
            otherTypingTimerRef.current = setTimeout(() => {
              setIsOtherTyping(false);
            }, 4000);
            setTimeout(() => messagesRef.current?.scrollToEnd({ animated: true }), 50);
          } else {
            if (otherTypingTimerRef.current) clearTimeout(otherTypingTimerRef.current);
            setIsOtherTyping(false);
          }
        }
      },
      onNewMessage: (payload) => {
        const myId = currentUser?.id;
        if (!myId) return;
        const isParticipant = (payload.participants || []).some(
          (p) => String(p) === String(myId)
        );
        if (!isParticipant) return;

        const isMe = String(payload.senderId) === String(myId);
        const createdAt = payload.message.createdAt || new Date().toISOString();
        const incomingMsg: Message = {
          ...payload.message,
          createdAt,
          timestamp: formatMessageTime(createdAt),
          isMe,
        };

        const openThread = activeThreadRef.current;
        const isCurrentActive = openThread && String(openThread.id) === String(payload.threadId);

        // Clear typing indicator for this sender immediately upon receiving message
        if (!isMe) {
          setIsOtherTyping(false);
          setTypingThreads((prev) => ({ ...prev, [payload.threadId]: false }));
        }

        // 1. Update message list in state for this thread with safe receipt merge
        setMessages((prev) => {
          const currentThreadMessages = prev[payload.threadId] || [];
          const existsIndex = currentThreadMessages.findIndex((m) => m.id === incomingMsg.id);
          if (existsIndex !== -1) {
            const old = currentThreadMessages[existsIndex];
            const merged: Message = {
              ...old,
              ...incomingMsg,
              seenAt: old.seenAt || incomingMsg.seenAt || null,
              deliveredAt: old.deliveredAt || incomingMsg.deliveredAt || null,
              receiptStatus: mergeReceiptStatus(old.receiptStatus, incomingMsg.receiptStatus),
            };
            const updated = [...currentThreadMessages];
            updated[existsIndex] = merged;
            return {
              ...prev,
              [payload.threadId]: updated,
            };
          }
          return {
            ...prev,
            [payload.threadId]: [...currentThreadMessages, incomingMsg],
          };
        });

        // 2. Update thread list (update preview, move conversation to top, update unread count)
        setMessageThreads((prev) => {
          const threadIndex = prev.findIndex((t) => String(t.id) === String(payload.threadId));
          if (threadIndex === -1) {
            void loadThreads(true);
            return prev;
          }

          const existingThread = prev[threadIndex];
          const updatedThread: MessageThread = {
            ...existingThread,
            lastMessage: payload.lastMessage,
            lastMessageAt: payload.lastMessageAt || createdAt,
            lastMessageTime: formatThreadTime(payload.lastMessageAt || createdAt),
            unreadCount: isCurrentActive || isMe ? 0 : existingThread.unreadCount + 1,
          };

          const remaining = prev.filter((_, idx) => idx !== threadIndex);
          return [updatedThread, ...remaining];
        });

        // 3. Acknowledge delivery / read status immediately
        if (isCurrentActive && !isMe) {
          // If conversation is open, mark seen
          void broadcastMessageRead(payload.threadId, myId);
          void markThreadReadRequest(payload.threadId).catch((err) => {
            console.warn('[MessagesScreen] Failed auto markThreadRead on new_message:', err);
          });
        } else if (!isMe) {
          // If conversation is not open, mark delivered
          void broadcastMessageDelivered(payload.threadId, myId, incomingMsg.id);
          void markMessagesDeliveredRequest().catch((err) => {
            console.warn('[MessagesScreen] Failed auto markMessagesDelivered on new_message:', err);
          });
        }
      },
      onMessageRead: (payload) => {
        const myId = currentUser?.id;
        if (!myId) return;
        if (String(payload.readerId) === String(myId)) return;

        // If other user read this conversation, mark all messages sent by me as 'seen'
        setMessages((prev) => {
          const threadMsgs = prev[payload.threadId];
          if (!threadMsgs) return prev;
          let changed = false;
          const updated = threadMsgs.map((m) => {
            if ((m.isMe || String(m.senderId) === String(myId)) && m.receiptStatus !== 'seen') {
              changed = true;
              return {
                ...m,
                seenAt: payload.seenAt,
                receiptStatus: 'seen' as const,
              };
            }
            return m;
          });
          if (!changed) return prev;
          return {
            ...prev,
            [payload.threadId]: updated,
          };
        });
      },
      onMessagesDelivered: (payload) => {
        const myId = currentUser?.id;
        if (!myId) return;
        if (String(payload.recipientId) === String(myId)) return;

        // If other user received/delivered messages, mark pending sent messages as 'delivered'
        setMessages((prev) => {
          const next = { ...prev };
          let changed = false;
          const targetThreadIds = payload.threadIds || (payload.threadId ? [payload.threadId] : Object.keys(next));
          for (const threadId of targetThreadIds) {
            if (!next[threadId]) continue;
            const updated = next[threadId].map((m) => {
              if ((m.isMe || String(m.senderId) === String(myId)) && m.receiptStatus === 'sent') {
                changed = true;
                return {
                  ...m,
                  deliveredAt: payload.deliveredAt,
                  receiptStatus: 'delivered' as const,
                };
              }
              return m;
            });
            if (changed) next[threadId] = updated;
          }
          return changed ? next : prev;
        });
      },
    });

    return () => {
      unsubscribe();
    };
  }, [currentUser?.id, loadThreads]);

  useEffect(() => {
    const timer = setTimeout(() => messagesRef.current?.scrollToEnd({ animated: true }), 50);
    return () => clearTimeout(timer);
  }, [currentMessages.length, isOtherTyping, activeThread?.id]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadThreads(true);
    setIsRefreshing(false);
  };

  const handleInputChange = useCallback((text: string) => {
    setInputText(text);
    const thread = activeThreadRef.current;
    const myId = currentUser?.id;
    if (!thread || !myId) return;

    if (text.trim().length > 0) {
      if (!isSelfTypingRef.current) {
        isSelfTypingRef.current = true;
        void broadcastTyping(thread.id, myId, true, currentUser.name);
        void sendTypingStatusRequest(thread.id, true).catch(() => { });
      }

      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      typingTimerRef.current = setTimeout(() => {
        isSelfTypingRef.current = false;
        void broadcastTyping(thread.id, myId, false);
        void sendTypingStatusRequest(thread.id, false).catch(() => { });
      }, 2500);
    } else {
      if (isSelfTypingRef.current) {
        isSelfTypingRef.current = false;
        if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
        void broadcastTyping(thread.id, myId, false);
        void sendTypingStatusRequest(thread.id, false).catch(() => { });
      }
    }
  }, [currentUser?.id, currentUser?.name]);

  const handleSend = async () => {
    if (!activeThread || !inputText.trim() || isSending) return;
    const text = inputText.trim();
    const threadId = activeThread.id;
    const myId = currentUser?.id;

    // Reset typing status immediately
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    if (isSelfTypingRef.current && myId) {
      isSelfTypingRef.current = false;
      void broadcastTyping(threadId, myId, false);
      void sendTypingStatusRequest(threadId, false).catch(() => { });
    }

    setInputText('');
    setIsSending(true);
    try {
      const sent = await sendThreadMessageRequest(threadId, text);
      setMessages(prev => {
        const list = prev[threadId] || [];
        const existsIndex = list.findIndex(m => m.id === sent.id);
        if (existsIndex !== -1) {
          const old = list[existsIndex];
          const merged: Message = {
            ...old,
            ...sent,
            receiptStatus: mergeReceiptStatus(old.receiptStatus, sent.receiptStatus),
          };
          const next = [...list];
          next[existsIndex] = merged;
          return { ...prev, [threadId]: next };
        }
        return { ...prev, [threadId]: [...list, sent] };
      });
      setMessageThreads(prev => {
        const threadIndex = prev.findIndex(t => t.id === threadId);
        if (threadIndex === -1) return prev;
        const current = prev[threadIndex];
        const updated = {
          ...current,
          lastMessage: sent.text,
          lastMessageAt: sent.createdAt || new Date().toISOString(),
          lastMessageTime: formatThreadTime(sent.createdAt || new Date().toISOString()),
        };
        return [updated, ...prev.filter((_, idx) => idx !== threadIndex)];
      });
    } catch (error) {
      setInputText(text);
      Alert.alert('Message not sent', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const openThread = (thread: MessageThread) => {
    setActiveThread(thread);
  };

  const startConversation = async (participantId: string) => {
    if (startingMemberId) return;
    setStartingMemberId(participantId);
    setPickerError('');
    try {
      const thread = await createMessageThreadRequest(participantId);
      setMessageThreads(prev => [thread, ...prev.filter(item => item.id !== thread.id)]);
      setShowMemberPicker(false);
      setMemberQuery('');
      setActiveThread(thread);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Please try again.';
      setPickerError(message);
      if (Platform.OS !== 'web') Alert.alert('Could not start conversation', message);
    } finally {
      setStartingMemberId(null);
    }
  };

  const availableMembers = users.filter(user => {
    if (user.id === currentUser.id) return false;
    const isSystemAdmin =
      Boolean(user.roles && user.roles.includes('admin')) ||
      user.name.toLowerCase().trim() === 'system admin';
    if (isSystemAdmin) return false;

    const haystack = `${user.name} ${user.companyName} ${user.designation}`.toLowerCase();
    return haystack.includes(memberQuery.trim().toLowerCase());
  });

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={activeThread ? ['top', 'left', 'right', 'bottom'] : ['top', 'left', 'right']}
    >
      {!activeThread ? (
        <>
          <Header showSearchBar={false} />

          <View style={styles.container}>
            {/* Header Title */}
            <View style={styles.threadsHeader}>
              <View>
                <Text style={styles.threadsBadge}>COUNCIL DIRECT CONNECT</Text>
                <Text style={styles.threadsTitle}>Executive Messages</Text>
              </View>
              <View style={styles.headerActions}>
                <View style={styles.securePill}>
                  <ShieldCheck color={colors.emerald} size={13} />
                  <Text style={styles.securePillText}>Private</Text>
                </View>
                <TouchableOpacity
                  style={styles.newChatButton}
                  onPress={() => setShowMemberPicker(true)}
                  accessibilityLabel="Start a new conversation"
                >
                  <UserPlus color={colors.white} size={16} />
                </TouchableOpacity>
              </View>
            </View>

            {isLoading ? (
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.threadsList}>
                <MessagesScreenSkeleton />
              </ScrollView>
            ) : (
              /* Threads List */
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.threadsList}
                refreshControl={
                  <RefreshControl
                    refreshing={isRefreshing}
                    onRefresh={handleRefresh}
                    tintColor={colors.crimson}
                    colors={[colors.crimson, colors.accentBlue]}
                  />
                }
              >
                {messageThreads.length === 0 && (
                  <View style={styles.emptyState}>
                    <View style={styles.emptyIcon}>
                      <UserPlus color={colors.crimson} size={24} />
                    </View>
                    <Text style={styles.emptyTitle}>Start your first conversation</Text>
                    <Text style={styles.emptyText}>Connect privately with a verified council member.</Text>
                    <TouchableOpacity style={styles.emptyButton} onPress={() => setShowMemberPicker(true)}>
                      <Text style={styles.emptyButtonText}>Choose a member</Text>
                    </TouchableOpacity>
                  </View>
                )}
                {messageThreads.map(thread => (
                  <TouchableOpacity
                    key={thread.id}
                    style={styles.threadItem}
                    onPress={() => openThread(thread)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.avatarWrapper}>
                      <InitialsAvatar
                        name={thread.participant.name}
                        uri={thread.participant.avatar}
                        user={thread.participant}
                        size={48}
                      />
                      {thread.unreadCount > 0 && <View style={styles.unreadDot} />}
                    </View>

                    <View style={styles.threadInfo}>
                      <View style={styles.threadNameRow}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1, minWidth: 0 }}>
                          <UserTierBadge user={thread.participant} size={15} />
                          <Text style={styles.participantName} numberOfLines={1}>{thread.participant.name}</Text>
                        </View>
                        <Text style={styles.messageTime}>{thread.lastMessageTime}</Text>
                      </View>
                      <View style={styles.companyRow}>
                        <Building2 color={colors.primary} size={11} />
                        <Text style={styles.participantCompany} numberOfLines={1}>
                          {thread.participant.companyName}
                        </Text>
                      </View>
                      {typingThreads[thread.id] ? (
                        <Text style={styles.typingPreviewText} numberOfLines={1}>
                          typing...
                        </Text>
                      ) : (
                        <Text
                          style={[styles.lastMessage, thread.unreadCount > 0 && styles.lastMessageUnread]}
                          numberOfLines={1}
                        >
                          {thread.lastMessage}
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        </>
      ) : (
        /* Conversation View */
        <KeyboardAvoidingView
          style={styles.chatContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : (StatusBar.currentHeight || 0)}
        >
          {/* Chat Top Bar */}
          <View style={styles.chatHeader}>
            <TouchableOpacity style={styles.backBtn} onPress={() => setActiveThread(null)}>
              <ArrowLeft color={colors.textPrimary} size={20} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.chatHeaderUser}
              onPress={() => openDigitalBusinessCard(activeThread.participant)}
              activeOpacity={0.8}
            >
              <InitialsAvatar
                name={activeThread.participant.name}
                uri={activeThread.participant.avatar}
                user={activeThread.participant}
                size={40}
              />
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <UserTierBadge user={activeThread.participant} size={15} />
                  <Text style={styles.chatName}>{activeThread.participant.name}</Text>
                </View>
                {isOtherTyping ? (
                  <View style={styles.typingHeaderRow}>
                    <Text style={styles.typingHeaderText}>typing</Text>
                    <Text style={styles.typingDotsPulse}>...</Text>
                  </View>
                ) : (
                  <Text style={styles.chatCompany}>{activeThread.participant.companyName}</Text>
                )}
              </View>
            </TouchableOpacity>

            {/* Fast Desk Actions */}
            <View style={styles.chatActionIcons}>
              <TouchableOpacity
                style={styles.chatActionBtn}
                onPress={() => openLogOneToOne(activeThread.participant)}
              >
                <CalendarPlus color={colors.crimson} size={18} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.chatActionBtn}
                onPress={openRecordDeal}
              >
                <DollarSign color={colors.emerald} size={18} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.chatActionBtn}
                onPress={() => openDigitalBusinessCard(activeThread.participant)}
              >
                <QrCode color={colors.primary} size={18} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Messages History */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.messagesList}
            ref={messagesRef}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            scrollEventThrottle={16}
            onScroll={handleMessagesScroll}
            onContentSizeChange={() => messagesRef.current?.scrollToEnd({ animated: true })}
          >
            {isLoadingConversation && (
              <ActivityIndicator color={colors.crimson} style={styles.conversationLoader} />
            )}
            {!isLoadingConversation && currentMessages.length === 0 && (
              <View style={styles.emptyConversation}>
                <ShieldCheck color={colors.emerald} size={22} />
                <Text style={styles.emptyConversationTitle}>Private member conversation</Text>
                <Text style={styles.emptyConversationText}>Messages are visible only to the two participants.</Text>
              </View>
            )}
            {currentMessages.map((msg, index) => {
              const prevMsg = index > 0 ? currentMessages[index - 1] : null;
              const msgDate = msg.createdAt || msg.timestamp;
              const prevDate = prevMsg ? (prevMsg.createdAt || prevMsg.timestamp) : null;
              const showDateSeparator = !prevMsg || !isSameDay(msgDate, prevDate);

              return (
                <React.Fragment key={msg.id}>
                  {showDateSeparator && (
                    <View
                      style={styles.dateSeparatorWrapper}
                      onLayout={(e) => {
                        const y = e.nativeEvent.layout.y;
                        dateSeparatorPositionsRef.current[index] = {
                          y,
                          label: formatDateSeparator(msgDate),
                        };
                      }}
                    >
                      <View style={styles.dateSeparatorBadge}>
                        <Text style={styles.dateSeparatorText}>
                          {formatDateSeparator(msgDate)}
                        </Text>
                      </View>
                    </View>
                  )}
                  <View
                    style={[
                      styles.messageBubbleWrapper,
                      msg.isMe ? styles.myBubbleWrapper : styles.otherBubbleWrapper,
                    ]}
                  >
                    <View
                      style={[
                        styles.messageBubble,
                        msg.isMe ? styles.myBubble : styles.otherBubble,
                      ]}
                    >
                      <Text style={[styles.messageText, msg.isMe ? styles.myMessageText : styles.otherMessageText]}>
                        {msg.text}
                      </Text>
                      <View style={styles.messageMeta}>
                        <Text style={[styles.msgTimestamp, msg.isMe ? styles.myTimestamp : styles.otherTimestamp]}>
                          {formatMessageTime(msg.createdAt) || msg.timestamp}
                        </Text>
                        {msg.isMe && (
                          msg.receiptStatus === 'sent' ? (
                            <Check size={13} strokeWidth={2.2} color="rgba(255, 255, 255, 0.72)" />
                          ) : (
                            <CheckCheck
                              size={14}
                              strokeWidth={2.2}
                              color={msg.receiptStatus === 'seen' ? '#8DE8FF' : 'rgba(255, 255, 255, 0.82)'}
                            />
                          )
                        )}
                      </View>
                    </View>
                  </View>
                </React.Fragment>
              );
            })}
            {isOtherTyping && (
              <View style={[styles.messageBubbleWrapper, styles.otherBubbleWrapper]}>
                <View style={[styles.messageBubble, styles.otherBubble, styles.typingBubble]}>
                  <TypingAnimation />
                </View>
              </View>
            )}
          </ScrollView>

          {/* Floating Sticky Date Separator (WhatsApp style) */}
          {floatingDate ? (
            <Animated.View
              pointerEvents="none"
              style={[
                styles.floatingDateContainer,
                { opacity: floatingDateOpacity },
              ]}
            >
              <View style={styles.floatingDateBadge}>
                <Text style={styles.floatingDateText}>{floatingDate}</Text>
              </View>
            </Animated.View>
          ) : null}

          {/* Message Input Bar */}
          <View style={styles.inputBar}>
            <TextInput
              style={styles.chatInput}
              placeholder={`Message ${activeThread.participant.name.split(' ')[0]}...`}
              placeholderTextColor={colors.textMuted}
              value={inputText}
              onChangeText={handleInputChange}
              editable={!isSending}
            />
            <TouchableOpacity
              style={[styles.sendBtn, (!inputText.trim() && !isSending) && styles.sendBtnDisabled]}
              onPress={handleSend}
              disabled={!inputText.trim() || isSending}
            >
              {isSending ? (
                <ActivityIndicator size="small" color={colors.white} style={{ transform: [{ scale: 0.8 }] }} />
              ) : (
                <Send color={colors.white} size={16} />
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}

      <Modal
        visible={showMemberPicker}
        animationType="slide"
        transparent
        onRequestClose={() => setShowMemberPicker(false)}
      >
        <View style={styles.modalBackdrop}>
          <SafeAreaView style={styles.memberPicker} edges={['top', 'left', 'right', 'bottom']}>
            <View style={styles.memberPickerHeader}>
              <View>
                <Text style={styles.memberPickerEyebrow}>NEW MESSAGE</Text>
                <Text style={styles.memberPickerTitle}>Choose a member</Text>
              </View>
              <TouchableOpacity style={styles.closeButton} onPress={() => setShowMemberPicker(false)}>
                <X color={colors.textPrimary} size={20} />
              </TouchableOpacity>
            </View>
            <View style={styles.memberSearch}>
              <Search color={colors.textMuted} size={17} />
              <TextInput
                style={styles.memberSearchInput}
                value={memberQuery}
                onChangeText={setMemberQuery}
                placeholder="Search by member, company or role"
                placeholderTextColor={colors.textMuted}
                autoFocus
              />
            </View>
            {!!pickerError && (
              <View style={styles.pickerError}>
                <Text style={styles.pickerErrorText}>{pickerError}</Text>
              </View>
            )}
            <ScrollView contentContainerStyle={styles.memberList} keyboardShouldPersistTaps="handled">
              {availableMembers.map(member => (
                <TouchableOpacity
                  key={member.id}
                  style={[styles.memberRow, startingMemberId === member.id && styles.memberRowLoading]}
                  onPress={() => void startConversation(member.id)}
                  disabled={startingMemberId !== null}
                >
                  <InitialsAvatar
                    name={member.name}
                    uri={member.avatar}
                    user={member}
                    size={44}
                  />
                  <View style={styles.memberInfo}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <UserTierBadge user={member} size={15} />
                      <Text style={styles.memberName}>{member.name}</Text>
                    </View>
                    <Text style={styles.memberCompany} numberOfLines={1}>
                      {member.designation}{member.companyName ? ` · ${member.companyName}` : ''}
                    </Text>
                  </View>
                  {startingMemberId === member.id ? (
                    <ActivityIndicator size="small" color={colors.crimson} />
                  ) : (
                    <Send color={colors.crimson} size={17} />
                  )}
                </TouchableOpacity>
              ))}
              {availableMembers.length === 0 && (
                <Text style={styles.noMembersText}>No matching members found.</Text>
              )}
            </ScrollView>
          </SafeAreaView>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.cardBg,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  threadsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
    backgroundColor: colors.cardBg,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  threadsBadge: {
    fontSize: 9.5,
    fontWeight: '800',
    color: colors.crimson,
    letterSpacing: 1,
  },
  threadsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  securePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.emeraldLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  securePillText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.emerald,
  },
  newChatButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.crimson,
    alignItems: 'center',
    justifyContent: 'center',
  },
  threadsList: {
    padding: 16,
    gap: 12,
  },
  threadItem: {
    flexDirection: 'row',
    backgroundColor: colors.cardBg,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 56,
    paddingHorizontal: 28,
  },
  emptyIcon: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: colors.crimsonLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  emptyText: {
    marginTop: 6,
    fontSize: 12,
    lineHeight: 18,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  emptyButton: {
    marginTop: 18,
    backgroundColor: colors.crimson,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
  },
  emptyButtonText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '800',
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: colors.crimson,
  },
  unreadDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.crimson,
    borderWidth: 2,
    borderColor: colors.cardBg,
  },
  threadInfo: {
    flex: 1,
  },
  threadNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  participantName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  messageTime: {
    fontSize: 10.5,
    color: colors.textMuted,
  },
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  participantCompany: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '600',
  },
  lastMessage: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  lastMessageUnread: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  chatContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.cardBg,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  backBtn: {
    padding: 6,
    marginRight: 8,
  },
  chatHeaderUser: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  chatAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    borderColor: colors.crimson,
  },
  chatName: {
    fontSize: 13.5,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  chatCompany: {
    fontSize: 10.5,
    color: colors.primary,
    fontWeight: '600',
  },
  chatActionIcons: {
    flexDirection: 'row',
    gap: 8,
  },
  chatActionBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.cardBgElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  messagesList: {
    padding: 16,
    gap: 10,
    flexGrow: 1,
  },
  conversationLoader: {
    marginTop: 32,
  },
  emptyConversation: {
    flex: 1,
    minHeight: 300,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 36,
  },
  emptyConversationTitle: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  emptyConversationText: {
    marginTop: 5,
    fontSize: 11.5,
    lineHeight: 17,
    color: colors.textMuted,
    textAlign: 'center',
  },
  dateSeparatorWrapper: {
    alignItems: 'center',
    marginVertical: 12,
  },
  dateSeparatorBadge: {
    backgroundColor: colors.cardBgElevated,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  dateSeparatorText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.2,
  },
  floatingDateContainer: {
    position: 'absolute',
    top: 72,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 99,
  },
  floatingDateBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 5,
  },
  floatingDateText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: 0.2,
  },
  messageBubbleWrapper: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  myBubbleWrapper: {
    justifyContent: 'flex-end',
  },
  otherBubbleWrapper: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    borderRadius: 14,
    padding: 12,
  },
  myBubble: {
    backgroundColor: colors.crimson,
    borderBottomRightRadius: 2,
  },
  otherBubble: {
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderBottomLeftRadius: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  messageText: {
    fontSize: 13,
    lineHeight: 18,
  },
  myMessageText: {
    color: colors.white,
  },
  otherMessageText: {
    color: colors.textPrimary,
  },
  msgTimestamp: {
    fontSize: 9.5,
  },
  messageMeta: {
    marginTop: 4,
    alignSelf: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  myTimestamp: {
    color: 'rgba(255, 255, 255, 0.75)',
  },
  otherTimestamp: {
    color: colors.textMuted,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.cardBg,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    gap: 10,
  },
  chatInput: {
    flex: 1,
    backgroundColor: colors.cardBgElevated,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    paddingHorizontal: 14,
    paddingVertical: 8,
    color: colors.textPrimary,
    fontSize: 13,
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.crimson,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.4,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(11, 25, 44, 0.45)',
    justifyContent: 'flex-end',
  },
  memberPicker: {
    maxHeight: '82%',
    backgroundColor: colors.cardBg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  memberPickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 12,
  },
  memberPickerEyebrow: {
    fontSize: 9.5,
    letterSpacing: 1,
    color: colors.crimson,
    fontWeight: '900',
  },
  memberPickerTitle: {
    marginTop: 2,
    fontSize: 20,
    color: colors.textPrimary,
    fontWeight: '800',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.cardBgElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  memberSearch: {
    marginHorizontal: 18,
    marginBottom: 10,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    backgroundColor: colors.cardBgElevated,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 8,
  },
  memberSearchInput: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 13,
  },
  memberList: {
    paddingHorizontal: 18,
    paddingBottom: 24,
  },
  pickerError: {
    marginHorizontal: 18,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: colors.crimsonLight,
    borderWidth: 1,
    borderColor: colors.crimsonBorder,
  },
  pickerErrorText: {
    color: colors.crimsonDark,
    fontSize: 11.5,
    lineHeight: 16,
    fontWeight: '600',
  },
  memberRow: {
    minHeight: 66,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
    gap: 11,
  },
  memberRowLoading: {
    opacity: 0.65,
  },
  memberAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.cardBgElevated,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 13.5,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  memberCompany: {
    marginTop: 3,
    fontSize: 11,
    color: colors.textSecondary,
  },
  noMembersText: {
    textAlign: 'center',
    paddingVertical: 36,
    fontSize: 13,
    color: colors.textMuted,
  },
  typingHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  typingHeaderText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.emerald,
  },
  typingDotsPulse: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.emerald,
  },
  typingBubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    minHeight: 36,
    minWidth: 54,
    justifyContent: 'center',
    alignItems: 'center',
  },
  typingDotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4.5,
  },
  typingDot: {
    width: 6.5,
    height: 6.5,
    borderRadius: 3.25,
    backgroundColor: colors.textSecondary,
  },
  typingPreviewText: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: '700',
    color: colors.emerald,
    fontStyle: 'italic',
  },
});
