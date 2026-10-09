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
  Platform,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
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
import { useApp } from '../context/AppContext';
import { Header } from '../components/Header';
import { MessageThread } from '../types';
import { MessagesScreenSkeleton } from '../components/SkeletonLoader';
import {
  fetchMessageThreadsRequest,
  createMessageThreadRequest,
  fetchThreadMessagesRequest,
  sendThreadMessageRequest,
  markThreadReadRequest,
  markMessagesDeliveredRequest,
} from '../services/messageApi';
import { subscribeToFeedRealtime } from '../services/realtimeSubscription';

const formatTime = (value?: string) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const now = new Date();
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return date.toLocaleDateString([], { day: '2-digit', month: 'short' });
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
  const [messages, setMessages] = useState<Record<string, import('../types').Message[]>>({});
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
  const messagesRef = useRef<ScrollView>(null);
  const activeThreadRef = useRef<MessageThread | null>(null);
  const openedNotificationThreadRef = useRef<string | null>(null);
  const route = useRoute<any>();

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
      setMessages(prev => ({ ...prev, [thread.id]: response.items }));
      try {
        await markThreadReadRequest(thread.id);
        setMessageThreads(prev => prev.map(item => item.id === thread.id ? { ...item, unreadCount: 0 } : item));
      } catch (receiptError) {
        console.warn('[Messages] Could not mark conversation as seen:', receiptError);
      }
    } catch (error) {
      if (!silent) Alert.alert('Could not load conversation', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      if (!silent) setIsLoadingConversation(false);
    }
  }, []);

  useEffect(() => {
    if (!activeThread) return;
    void loadConversation(activeThread);
  }, [activeThread, loadConversation]);

  useEffect(() => {
    activeThreadRef.current = activeThread;
  }, [activeThread]);

  // Acknowledge delivery of any pending messages when Messages screen mounts
  useEffect(() => {
    void markMessagesDeliveredRequest().catch((receiptError) => {
      console.warn('[Messages] Could not acknowledge initial delivery:', receiptError);
    });
  }, []);

  // Realtime subscription for instant message delivery and read receipts
  useEffect(() => {
    const unsubscribe = subscribeToFeedRealtime({
      onNewMessage: (payload) => {
        const myId = currentUser?.id;
        if (!myId) return;
        const isParticipant = (payload.participants || []).some(
          (p) => String(p) === String(myId)
        );
        if (!isParticipant) return;

        const isMe = String(payload.senderId) === String(myId);
        const incomingMsg: import('../types').Message = {
          ...payload.message,
          isMe,
        };

        // 1. Update message list in state for this thread
        setMessages((prev) => {
          const currentThreadMessages = prev[payload.threadId] || [];
          const exists = currentThreadMessages.some((m) => m.id === incomingMsg.id);
          if (exists) {
            return {
              ...prev,
              [payload.threadId]: currentThreadMessages.map((m) =>
                m.id === incomingMsg.id ? incomingMsg : m
              ),
            };
          }
          return {
            ...prev,
            [payload.threadId]: [...currentThreadMessages, incomingMsg],
          };
        });

        // 2. Update thread list (update preview, move conversation to top, update unread count)
        const openThread = activeThreadRef.current;
        const isCurrentActive = openThread && String(openThread.id) === String(payload.threadId);

        setMessageThreads((prev) => {
          const threadIndex = prev.findIndex((t) => String(t.id) === String(payload.threadId));
          if (threadIndex === -1) {
            // New thread we don't have yet in state, fetch threads silently
            void loadThreads(true);
            return prev;
          }

          const existingThread = prev[threadIndex];
          const updatedThread: MessageThread = {
            ...existingThread,
            lastMessage: payload.lastMessage,
            lastMessageAt: payload.lastMessageAt,
            lastMessageTime: formatTime(payload.lastMessageAt),
            unreadCount: isCurrentActive || isMe ? 0 : existingThread.unreadCount + 1,
          };

          const remaining = prev.filter((_, idx) => idx !== threadIndex);
          return [updatedThread, ...remaining];
        });

        // 3. If this conversation is currently open and we are the recipient, auto-mark as read immediately
        if (isCurrentActive && !isMe) {
          void markThreadReadRequest(payload.threadId).catch((err) => {
            console.warn('[MessagesScreen] Failed auto markThreadRead on new_message:', err);
          });
        }
      },
      onMessageRead: (payload) => {
        const myId = currentUser?.id;
        if (!myId) return;
        const isParticipant = (payload.participants || []).some(
          (p) => String(p) === String(myId)
        );
        if (!isParticipant) return;

        // If other user read this conversation, mark all messages sent by me as 'seen'
        if (String(payload.readerId) !== String(myId)) {
          setMessages((prev) => {
            const threadMsgs = prev[payload.threadId];
            if (!threadMsgs) return prev;
            return {
              ...prev,
              [payload.threadId]: threadMsgs.map((m) => {
                if (m.isMe || String(m.senderId) === String(myId)) {
                  return {
                    ...m,
                    seenAt: payload.seenAt,
                    receiptStatus: 'seen' as const,
                  };
                }
                return m;
              }),
            };
          });
        }
      },
      onMessagesDelivered: (payload) => {
        const myId = currentUser?.id;
        if (!myId) return;

        // If other user received/delivered messages, mark pending sent messages as 'delivered'
        if (String(payload.recipientId) !== String(myId)) {
          setMessages((prev) => {
            const next = { ...prev };
            let changed = false;
            for (const threadId of Object.keys(next)) {
              next[threadId] = next[threadId].map((m) => {
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
            }
            return changed ? next : prev;
          });
        }
      },
    });

    return () => {
      unsubscribe();
    };
  }, [currentUser?.id, loadThreads]);

  useEffect(() => {
    const timer = setTimeout(() => messagesRef.current?.scrollToEnd({ animated: true }), 50);
    return () => clearTimeout(timer);
  }, [currentMessages.length, activeThread?.id]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadThreads(true);
    setIsRefreshing(false);
  };

  const handleSend = async () => {
    if (!activeThread || !inputText.trim() || isSending) return;
    const text = inputText.trim();
    setInputText('');
    setIsSending(true);
    try {
      const sent = await sendThreadMessageRequest(activeThread.id, text);
      setMessages(prev => {
        const list = prev[activeThread.id] || [];
        const exists = list.some(m => m.id === sent.id);
        if (exists) return prev;
        return { ...prev, [activeThread.id]: [...list, sent] };
      });
      setMessageThreads(prev => {
        const threadIndex = prev.findIndex(t => t.id === activeThread.id);
        if (threadIndex === -1) return prev;
        const current = prev[threadIndex];
        const updated = {
          ...current,
          lastMessage: sent.text,
          lastMessageTime: sent.timestamp,
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
    const haystack = `${user.name} ${user.companyName} ${user.designation}`.toLowerCase();
    return haystack.includes(memberQuery.trim().toLowerCase());
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
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
                    <Image source={{ uri: thread.participant.avatar }} style={styles.avatar} />
                    {thread.unreadCount > 0 && <View style={styles.unreadDot} />}
                  </View>

                  <View style={styles.threadInfo}>
                    <View style={styles.threadNameRow}>
                      <Text style={styles.participantName}>{thread.participant.name}</Text>
                      <Text style={styles.messageTime}>{thread.lastMessageTime}</Text>
                    </View>
                    <View style={styles.companyRow}>
                      <Building2 color={colors.primary} size={11} />
                      <Text style={styles.participantCompany} numberOfLines={1}>
                        {thread.participant.companyName}
                      </Text>
                    </View>
                    <Text
                      style={[styles.lastMessage, thread.unreadCount > 0 && styles.lastMessageUnread]}
                      numberOfLines={1}
                    >
                      {thread.lastMessage}
                    </Text>
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
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
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
              <Image source={{ uri: activeThread.participant.avatar }} style={styles.chatAvatar} />
              <View>
                <Text style={styles.chatName}>{activeThread.participant.name}</Text>
                <Text style={styles.chatCompany}>{activeThread.participant.companyName}</Text>
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
            {currentMessages.map(msg => (
              <View
                key={msg.id}
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
                      {msg.timestamp}
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
            ))}
          </ScrollView>

          {/* Message Input Bar */}
          <View style={styles.inputBar}>
            <TextInput
              style={styles.chatInput}
              placeholder={`Message ${activeThread.participant.name.split(' ')[0]}...`}
              placeholderTextColor={colors.textMuted}
              value={inputText}
              onChangeText={setInputText}
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
                  <Image source={{ uri: member.avatar }} style={styles.memberAvatar} />
                  <View style={styles.memberInfo}>
                    <Text style={styles.memberName}>{member.name}</Text>
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
});
