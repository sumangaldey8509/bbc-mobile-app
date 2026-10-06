import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Send,
  ArrowLeft,
  CalendarPlus,
  DollarSign,
  QrCode,
  ShieldCheck,
  Building2,
  Lock,
} from 'lucide-react-native';
import { colors } from '../theme/colors';
import { useApp } from '../context/AppContext';
import { Header } from '../components/Header';
import { MessageThread } from '../types';
import { MessagesScreenSkeleton } from '../components/SkeletonLoader';

export const MessagesScreen: React.FC = () => {
  const {
    messageThreads,
    messages,
    sendMessage,
    openLogOneToOne,
    openRecordDeal,
    openDigitalBusinessCard,
  } = useApp();

  const [isLoading, setIsLoading] = useState(true);
  const [activeThread, setActiveThread] = useState<MessageThread | null>(null);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    // Simulate backend encrypted chat channel load
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 850);
    return () => clearTimeout(timer);
  }, []);

  const currentMessages = activeThread ? (messages[activeThread.id] || []) : [];

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 850);
  };

  const handleSend = () => {
    if (!activeThread || !inputText.trim() || isSending) return;
    const text = inputText.trim();
    setInputText('');
    setIsSending(true);
    setTimeout(() => {
      sendMessage(activeThread.id, text);
      setIsSending(false);
    }, 450);
  };

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
              <View style={styles.securePill}>
                <ShieldCheck color={colors.emerald} size={13} />
                <Text style={styles.securePillText}>Encrypted Peer-to-Peer</Text>
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
              {messageThreads.map(thread => (
                <TouchableOpacity
                  key={thread.id}
                  style={styles.threadItem}
                  onPress={() => setActiveThread(thread)}
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
            ref={ref => ref?.scrollToEnd({ animated: true })}
          >
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
                  <Text style={[styles.msgTimestamp, msg.isMe ? styles.myTimestamp : styles.otherTimestamp]}>
                    {msg.timestamp}
                  </Text>
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
    marginTop: 4,
    alignSelf: 'flex-end',
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
});
