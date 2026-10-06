import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  Modal,
  Platform,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import {
  Heart,
  MessageSquare,
  Share2,
  FileText,
  ShieldCheck,
  Send,
  Building2,
  Sparkles,
  MoreVertical,
  Edit3,
  Trash2,
  X,
  Copy,
  UserCheck,
  Flag,
} from 'lucide-react-native';
import { Post } from '../types';
import { colors } from '../theme/colors';
import { useApp } from '../context/AppContext';

interface PostCardProps {
  post: Post;
  onOpenProfile?: (authorId: string) => void;
  onDirectMessage?: (authorId: string) => void;
}

/**
 * Format timestamp into standard human-readable relative time string:
 * "Just now", "5m ago", "2h ago", "Yesterday", "2d ago", "1w ago", "1mo ago", "1y ago"
 */
export function formatPostTime(dateInput?: string | Date | number): string {
  if (!dateInput) return 'Just now';

  const raw = String(dateInput).trim();
  if (raw.toLowerCase() === 'just now') return 'Just now';
  if (raw.toLowerCase() === 'posted today') return 'Today';
  if (raw.includes('ago')) return raw;

  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return raw;

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  if (diffMs < 0) return 'Just now';

  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) {
    return 'Just now';
  }

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) {
    return `${diffMin}m ago`;
  }

  const diffHours = Math.floor(diffMin / 60);

  // Accurate calendar day difference in local time
  const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const postDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const calendarDays = Math.round((nowDate.getTime() - postDate.getTime()) / (1000 * 60 * 60 * 24));

  if (calendarDays === 0) {
    return `${diffHours}h ago`;
  }

  if (calendarDays === 1) {
    return 'Yesterday';
  }

  if (calendarDays < 7) {
    return `${calendarDays}d ago`;
  }

  const diffWeeks = Math.floor(calendarDays / 7);
  if (diffWeeks < 4) {
    return diffWeeks === 1 ? '1w ago' : `${diffWeeks}w ago`;
  }

  const diffMonths = Math.floor(calendarDays / 30);
  if (diffMonths < 12) {
    return diffMonths === 1 ? '1mo ago' : `${diffMonths}mo ago`;
  }

  const diffYears = Math.floor(calendarDays / 365);
  return diffYears === 1 ? '1y ago' : `${diffYears}y ago`;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onOpenProfile, onDirectMessage }) => {
  const {
    toggleLikePost,
    openComments,
    openDigitalBusinessCard,
    openEditPostModal,
    deletePost,
    currentUser,
    isAdmin,
    users,
  } = useApp();

  const [showMenu, setShowMenu] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasMoreLines, setHasMoreLines] = useState(false);

  const authorUser = users.find(
    u =>
      u.id === post.authorId ||
      u.name?.toLowerCase() === post.authorName?.toLowerCase()
  );

  const isOwnerOrAdmin =
    String(post.authorId) === String(currentUser.id) ||
    post.authorName?.trim().toLowerCase() === currentUser.name?.trim().toLowerCase() ||
    isAdmin;

  const isLengthy =
    post.content.length > 170 ||
    (post.content.match(/\n/g) || []).length >= 4;

  const shouldShowToggle = hasMoreLines || isLengthy;

  const getTagColor = (tag: Post['tag']) => {
    switch (tag) {
      case 'B2B Requirement':
        return { bg: colors.crimsonLight, text: colors.crimson, border: colors.crimsonBorder };
      case 'Deal Won':
        return { bg: colors.emeraldLight, text: colors.emerald, border: colors.emeraldBorder };
      case 'Partnership Ask':
        return { bg: colors.accentBlueLight, text: colors.accentBlue, border: colors.accentBlueBorder };
      case 'Event Highlight':
        return { bg: colors.purpleLight, text: colors.purpleAccent, border: colors.purpleBorder };
      default:
        return { bg: colors.cardBgElevated, text: colors.primary, border: colors.cardBorder };
    }
  };

  const tagStyle = getTagColor(post.tag);
  const hasCustomTag = Boolean(post.tag && post.tag !== 'General');
  const formattedTime = formatPostTime(post.createdAt);
  const cleanChapter = post.chapter ? post.chapter.replace(' Chapter', '') : '';

  const renderFormattedContent = (text: string) => {
    if (!text) return null;
    const parts = text.split(/(#[a-zA-Z0-9_\u0980-\u09FF]+)/g);
    return (
      <View style={styles.contentContainer}>
        <Text
          style={styles.content}
          numberOfLines={isExpanded ? undefined : 4}
          ellipsizeMode="tail"
          onTextLayout={e => {
            if (e.nativeEvent.lines && e.nativeEvent.lines.length > 4) {
              setHasMoreLines(true);
            }
          }}
        >
          {parts.map((part, index) => {
            if (part.startsWith('#')) {
              return (
                <Text key={index} style={styles.hashtagText}>
                  {part}
                </Text>
              );
            }
            return part;
          })}
        </Text>

        {shouldShowToggle && (
          <TouchableOpacity
            onPress={() => setIsExpanded(prev => !prev)}
            style={styles.showMoreBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            activeOpacity={0.7}
          >
            <Text style={styles.showMoreText}>
              {isExpanded ? 'Show less' : '... Show more'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const handleShare = () => {
    Alert.alert('Post Copied', `Post from ${post.authorName} (${post.authorCompany}) copied to clipboard.`);
  };

  const handleCopyContent = async () => {
    setShowMenu(false);
    try {
      await Clipboard.setStringAsync(post.content);
      Alert.alert('Copied! 📋', 'Post text copied to clipboard.');
    } catch {
      Alert.alert('Post Copied', `Post from ${post.authorName} copied to clipboard.`);
    }
  };

  const handleReportPost = () => {
    setShowMenu(false);
    Alert.alert(
      'Report Post',
      'Thank you for bringing this to our attention. Our council moderation team will review this post.',
      [{ text: 'OK' }]
    );
  };

  const handleDelete = () => {
    setShowMenu(false);
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Are you sure you want to delete this post? This action cannot be undone.');
      if (confirmed) {
        deletePost(post.id);
      }
    } else {
      Alert.alert(
        'Delete Post',
        'Are you sure you want to delete this post? This action cannot be undone.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => deletePost(post.id),
          },
        ]
      );
    }
  };

  return (
    <View style={styles.card}>
      {/* Compact Top Author Row */}
      <View style={styles.authorRow}>
        {/* Avatar */}
        <TouchableOpacity
          style={styles.avatarContainer}
          onPress={() => {
            if (authorUser) {
              openDigitalBusinessCard(authorUser);
            }
          }}
          activeOpacity={0.8}
        >
          <Image
            source={{
              uri:
                post.authorAvatar ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(post.authorName || 'Member')}&background=0D1B2A&color=fff&bold=true`,
            }}
            style={styles.avatar}
          />
          <View style={styles.verifiedIconBadge}>
            <ShieldCheck color={colors.emerald} size={10} />
          </View>
        </TouchableOpacity>

        {/* Author Details */}
        <TouchableOpacity
          style={styles.authorInfo}
          onPress={() => {
            if (authorUser) {
              openDigitalBusinessCard(authorUser);
            }
          }}
          activeOpacity={0.7}
        >
          <View style={styles.nameRow}>
            <Text style={styles.authorName} numberOfLines={1}>{post.authorName}</Text>
            {cleanChapter ? (
              <View style={styles.chapterPill}>
                <Text style={styles.chapterPillText}>{cleanChapter}</Text>
              </View>
            ) : null}
          </View>

          <View style={styles.subMetaRow}>
            {post.authorDesignation ? (
              <Text style={styles.authorDesignation} numberOfLines={1}>
                {post.authorDesignation}
              </Text>
            ) : null}
            {post.authorDesignation && post.authorCompany ? (
              <Text style={styles.metaDot}>•</Text>
            ) : null}
            {post.authorCompany ? (
              <View style={styles.companyRow}>
                <Building2 color={colors.primary} size={10} />
                <Text style={styles.companyName} numberOfLines={1}>
                  {post.authorCompany}
                </Text>
              </View>
            ) : null}
          </View>
        </TouchableOpacity>

        {/* Right Header: Time & Always Visible Three Dots Button */}
        <View style={styles.rightHeaderBox}>
          <Text style={styles.timeAgo}>{formattedTime}</Text>

          <TouchableOpacity
            style={styles.moreOptionsBtn}
            onPress={() => setShowMenu(true)}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            activeOpacity={0.6}
          >
            <MoreVertical color={colors.textSecondary} size={16} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Optional Tag & Budget Row (only if explicitly set) */}
      {(hasCustomTag || post.budgetOrValue) && (
        <View style={styles.tagHeaderRow}>
          {hasCustomTag && (
            <View style={[styles.tagBadge, { backgroundColor: tagStyle.bg, borderColor: tagStyle.border }]}>
              <Sparkles color={tagStyle.text} size={10} />
              <Text style={[styles.tagText, { color: tagStyle.text }]}>{post.tag}</Text>
            </View>
          )}

          {post.budgetOrValue ? (
            <View style={styles.valueBadge}>
              <Text style={styles.valueBadgeText}>{post.budgetOrValue}</Text>
            </View>
          ) : null}
        </View>
      )}

      {/* Post Content with Bold Hashtags */}
      {renderFormattedContent(post.content)}

      {/* Document Attachment Preview */}
      {post.documentAttachment && (
        <TouchableOpacity
          style={styles.documentCard}
          onPress={() => Alert.alert('Open Document', `Opening ${post.documentAttachment?.name}`)}
          activeOpacity={0.8}
        >
          <View style={styles.docIconBox}>
            <FileText color={colors.crimson} size={16} />
          </View>
          <View style={styles.docInfo}>
            <Text style={styles.docName} numberOfLines={1}>
              {post.documentAttachment.name}
            </Text>
            <Text style={styles.docMeta}>
              {post.documentAttachment.type} • {post.documentAttachment.size}
            </Text>
          </View>
          <Text style={styles.docDownloadBtn}>View</Text>
        </TouchableOpacity>
      )}

      {/* Media Image */}
      {post.mediaUrl && (
        <View style={styles.mediaContainer}>
          <Image source={{ uri: post.mediaUrl }} style={styles.mediaImage} resizeMode="cover" />
        </View>
      )}

      {/* Interaction Footer Bar */}
      <View style={styles.footerBar}>
        <View style={styles.leftInteractions}>
          {/* Like */}
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => toggleLikePost(post.id)}
            activeOpacity={0.7}
          >
            <Heart
              color={post.isLiked ? colors.crimson : colors.textSecondary}
              fill={post.isLiked ? colors.crimson : 'transparent'}
              size={16}
            />
            <Text style={[styles.actionCount, post.isLiked && styles.activeLikedCount]}>
              {post.likesCount}
            </Text>
          </TouchableOpacity>

          {/* Comment */}
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => openComments(post)}
            activeOpacity={0.7}
          >
            <MessageSquare color={colors.textSecondary} size={16} />
            <Text style={styles.actionCount}>{post.commentsCount}</Text>
          </TouchableOpacity>

          {/* Share */}
          <TouchableOpacity style={styles.actionBtn} onPress={handleShare} activeOpacity={0.7}>
            <Share2 color={colors.textSecondary} size={15} />
          </TouchableOpacity>
        </View>

        {/* Connect / Direct Message */}
        <TouchableOpacity
          style={styles.directMessageBtn}
          onPress={() => {
            if (onDirectMessage && authorUser) {
              onDirectMessage(authorUser.id);
            } else if (authorUser) {
              openDigitalBusinessCard(authorUser);
            }
          }}
          activeOpacity={0.8}
        >
          <Send color={colors.white} size={11} />
          <Text style={styles.directMessageText}>Connect</Text>
        </TouchableOpacity>
      </View>

      {/* Cross-Platform Action Sheet Modal */}
      <Modal
        visible={showMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowMenu(false)}
        >
          <View style={styles.actionMenuCard}>
            <View style={styles.actionMenuHeader}>
              <Text style={styles.actionMenuTitle}>
                {isOwnerOrAdmin ? 'Manage Post' : 'Post Options'}
              </Text>
              <TouchableOpacity
                onPress={() => setShowMenu(false)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <X color={colors.textMuted} size={16} />
              </TouchableOpacity>
            </View>

            {isOwnerOrAdmin && (
              <>
                <TouchableOpacity
                  style={styles.actionMenuItem}
                  onPress={() => {
                    setShowMenu(false);
                    openEditPostModal(post);
                  }}
                  activeOpacity={0.7}
                >
                  <View style={[styles.actionIconBox, { backgroundColor: colors.accentBlueLight }]}>
                    <Edit3 color={colors.accentBlue} size={15} />
                  </View>
                  <Text style={styles.actionMenuText}>Edit Post</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionMenuItem}
                  onPress={handleDelete}
                  activeOpacity={0.7}
                >
                  <View style={[styles.actionIconBox, { backgroundColor: colors.crimsonLight }]}>
                    <Trash2 color={colors.crimson} size={15} />
                  </View>
                  <Text style={[styles.actionMenuText, { color: colors.crimson }]}>Delete Post</Text>
                </TouchableOpacity>

                <View style={styles.actionDivider} />
              </>
            )}

            <TouchableOpacity
              style={styles.actionMenuItem}
              onPress={handleCopyContent}
              activeOpacity={0.7}
            >
              <View style={[styles.actionIconBox, { backgroundColor: colors.cardBgElevated }]}>
                <Copy color={colors.primary} size={15} />
              </View>
              <Text style={styles.actionMenuText}>Copy Post Text</Text>
            </TouchableOpacity>

            {!isOwnerOrAdmin && authorUser && (
              <TouchableOpacity
                style={styles.actionMenuItem}
                onPress={() => {
                  setShowMenu(false);
                  openDigitalBusinessCard(authorUser);
                }}
                activeOpacity={0.7}
              >
                <View style={[styles.actionIconBox, { backgroundColor: colors.emeraldLight }]}>
                  <UserCheck color={colors.emerald} size={15} />
                </View>
                <Text style={styles.actionMenuText}>View Business Card</Text>
              </TouchableOpacity>
            )}

            {!isOwnerOrAdmin && (
              <TouchableOpacity
                style={styles.actionMenuItem}
                onPress={handleReportPost}
                activeOpacity={0.7}
              >
                <View style={[styles.actionIconBox, { backgroundColor: colors.cardBgElevated }]}>
                  <Flag color={colors.textMuted} size={15} />
                </View>
                <Text style={[styles.actionMenuText, { color: colors.textSecondary }]}>
                  Report Post
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cardBg,
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 9,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.cardBgElevated,
    borderWidth: 1.2,
    borderColor: colors.crimson,
  },
  verifiedIconBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: colors.cardBg,
    borderRadius: 6,
    padding: 1,
  },
  authorInfo: {
    flex: 1,
    minWidth: 0,
    paddingRight: 8,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'nowrap',
  },
  authorName: {
    fontSize: 13.5,
    fontWeight: '700',
    color: colors.textPrimary,
    flexShrink: 1,
  },
  chapterPill: {
    backgroundColor: colors.cardBgElevated,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    flexShrink: 0,
  },
  chapterPillText: {
    fontSize: 9,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  rightHeaderBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginLeft: 'auto',
    flexShrink: 0,
  },
  timeAgo: {
    fontSize: 10,
    color: colors.textMuted,
    flexShrink: 0,
  },
  moreOptionsBtn: {
    padding: 4,
    borderRadius: 6,
    backgroundColor: colors.cardBgElevated,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  subMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 1,
    gap: 4,
  },
  authorDesignation: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  metaDot: {
    fontSize: 10,
    color: colors.textMuted,
  },
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  companyName: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primary,
  },
  tagHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  tagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    gap: 3,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  valueBadge: {
    backgroundColor: colors.accentBlueLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.accentBlueBorder,
  },
  valueBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.accentBlue,
  },
  contentContainer: {
    marginBottom: 8,
  },
  content: {
    fontSize: 13,
    lineHeight: 19.5,
    color: colors.textPrimary,
  },
  hashtagText: {
    fontWeight: '800',
    color: colors.textPrimary,
  },
  showMoreBtn: {
    alignSelf: 'flex-start',
    marginTop: 3,
    paddingVertical: 2,
    paddingRight: 6,
  },
  showMoreText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: colors.primary,
  },
  documentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBgElevated,
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: 8,
  },
  docIconBox: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: colors.crimsonLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  docInfo: {
    flex: 1,
  },
  docName: {
    fontSize: 11.5,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  docMeta: {
    fontSize: 9.5,
    color: colors.textMuted,
    marginTop: 1,
  },
  docDownloadBtn: {
    fontSize: 10.5,
    fontWeight: '700',
    color: colors.crimson,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  mediaContainer: {
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  mediaImage: {
    width: '100%',
    height: 160,
    backgroundColor: colors.cardBgElevated,
  },
  footerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  leftInteractions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 2,
  },
  actionCount: {
    fontSize: 11.5,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  activeLikedCount: {
    color: colors.crimson,
  },
  directMessageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.crimson,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 7,
    gap: 4,
  },
  directMessageText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  actionMenuCard: {
    width: '100%',
    maxWidth: 280,
    backgroundColor: colors.cardBg,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  actionMenuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  actionMenuTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  actionMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    gap: 10,
  },
  actionIconBox: {
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionMenuText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  actionDivider: {
    height: 1,
    backgroundColor: colors.cardBorder,
    marginVertical: 4,
  },
});


