import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Image,
  TouchableOpacity,
  TextInput,
  Dimensions,
} from 'react-native';
import { X, Send, ShieldCheck, CalendarPlus, Sparkles, Building2, MessageCircle } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { useApp } from '../context/AppContext';

const { width, height } = Dimensions.get('window');

export const StoryViewerModal: React.FC = () => {
  const { activeStory, showStoryViewer, closeStory, openLogOneToOne, users } = useApp();
  const [replyText, setReplyText] = useState('');
  const [progress, setProgress] = useState(0);

  const storyUser = activeStory ? users.find(u => u.id === activeStory.userId) : null;

  useEffect(() => {
    if (!showStoryViewer) {
      setProgress(0);
      return;
    }

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 1) {
          clearInterval(interval);
          closeStory();
          return 1;
        }
        return prev + 0.05;
      });
    }, 250);

    return () => clearInterval(interval);
  }, [showStoryViewer]);

  if (!activeStory) return null;

  const handleSendReply = () => {
    if (replyText.trim()) {
      alert(`Message sent to ${activeStory.userName}!`);
      setReplyText('');
      closeStory();
    }
  };

  return (
    <Modal
      visible={showStoryViewer}
      transparent
      animationType="fade"
      onRequestClose={closeStory}
    >
      <View style={styles.overlay}>
        {/* Backdrop Dismiss */}
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={closeStory} />

        <View style={styles.storyCard}>
          {/* Top Progress Bar */}
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
          </View>

          {/* Header Row */}
          <View style={styles.headerRow}>
            <View style={styles.authorRow}>
              <Image source={{ uri: activeStory.userAvatar }} style={styles.avatar} />
              <View>
                <View style={styles.nameRow}>
                  <Text style={styles.authorName}>{activeStory.userName}</Text>
                  <ShieldCheck color={colors.emerald} size={14} />
                </View>
                <View style={styles.companyRow}>
                  <Building2 color={colors.primary} size={11} />
                  <Text style={styles.companyName}>{activeStory.companyName}</Text>
                  <Text style={styles.timestamp}>• {activeStory.timestamp}</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity style={styles.closeBtn} onPress={closeStory} activeOpacity={0.7}>
              <X color={colors.textPrimary} size={18} />
            </TouchableOpacity>
          </View>

          {/* Tag Pill */}
          <View style={styles.tagPillRow}>
            <View style={[styles.tagPill, { backgroundColor: activeStory.accentColor || colors.crimson }]}>
              <Sparkles color={colors.white} size={12} />
              <Text style={styles.tagPillText}>{activeStory.tag.toUpperCase()}</Text>
            </View>
          </View>

          {/* Story Content Area */}
          <View style={styles.contentBody}>
            <View style={styles.storyCardInner}>
              <Text style={styles.storyTitle}>{activeStory.title}</Text>
              <Text style={styles.storyCaption}>{activeStory.caption}</Text>
            </View>

            {/* Quick Action to Schedule 1-to-1 */}
            {storyUser && (
              <TouchableOpacity
                style={styles.schedule1to1Card}
                onPress={() => {
                  closeStory();
                  openLogOneToOne(storyUser);
                }}
                activeOpacity={0.8}
              >
                <CalendarPlus color={colors.crimson} size={18} />
                <Text style={styles.schedule1to1Text}>Schedule 1-to-1 with {activeStory.userName.split(' ')[0]}</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Bottom Reply Bar */}
          <View style={styles.replyBar}>
            <TextInput
              style={styles.replyInput}
              placeholder={`Reply to ${activeStory.userName.split(' ')[0]}...`}
              placeholderTextColor={colors.textMuted}
              value={replyText}
              onChangeText={setReplyText}
            />
            <TouchableOpacity
              style={[styles.sendBtn, !replyText.trim() && styles.sendBtnDisabled]}
              onPress={handleSendReply}
              disabled={!replyText.trim()}
              activeOpacity={0.8}
            >
              <Send color={colors.white} size={15} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(11, 25, 44, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  storyCard: {
    width: Math.min(width - 32, 420),
    height: Math.min(height * 0.8, 620),
    backgroundColor: colors.cardBg,
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.8)',
    padding: 20,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 25,
  },
  progressBarBg: {
    height: 3.5,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 14,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.crimson,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2,
    borderColor: colors.crimson,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  authorName: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '800',
  },
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  companyName: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  timestamp: {
    color: colors.textMuted,
    fontSize: 11,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.cardBgElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  tagPillRow: {
    marginTop: 12,
  },
  tagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 6,
  },
  tagPillText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  contentBody: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 14,
  },
  storyCardInner: {
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  storyTitle: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '900',
    lineHeight: 26,
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  storyCaption: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 21,
  },
  schedule1to1Card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.crimsonLight,
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.crimsonBorder,
    marginTop: 16,
    gap: 8,
  },
  schedule1to1Text: {
    color: colors.crimson,
    fontSize: 13.5,
    fontWeight: '800',
  },
  replyBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 6,
  },
  replyInput: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: colors.textPrimary,
    fontSize: 13,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.crimson,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.crimson,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  sendBtnDisabled: {
    backgroundColor: colors.textMuted,
    shadowOpacity: 0,
    elevation: 0,
  },
});
