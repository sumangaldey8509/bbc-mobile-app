import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Image,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import {
  X,
  Send,
  Building2,
  MessageSquare,
  Trash2,
  Edit3,
  MoreVertical,
  Copy,
  Flag,
  Check,
  CornerDownRight,
  ChevronDown,
  ChevronUp,
  ThumbsUp,
} from 'lucide-react-native';
import { colors } from '../theme/colors';
import { useApp } from '../context/AppContext';
import { formatPostTime } from './PostCard';
import { PostComment } from '../types';

interface InlineReplyBoxProps {
  replyTargetAuthor: string;
  userAvatar: string;
  value: string;
  isSending: boolean;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

const InlineReplyBox: React.FC<InlineReplyBoxProps> = ({
  replyTargetAuthor,
  userAvatar,
  value,
  isSending,
  onChangeText,
  onSubmit,
  onCancel,
}) => {
  return (
    <View style={styles.inlineReplyWrapper}>
      {/* Thread curve connector indicator */}
      <View style={styles.threadCurveLine} />

      <View style={styles.inlineReplyRow}>
        <Image source={{ uri: userAvatar }} style={styles.inlineUserAvatar} />

        <View style={styles.inlineReplyCard}>
          {/* Target header tag */}
          <View style={styles.inlineReplyHeader}>
            <Text style={styles.inlineReplyRecipient} numberOfLines={1}>
              Replying to <Text style={styles.inlineReplyRecipientBold}>@{replyTargetAuthor}</Text>
            </Text>
          </View>

          {/* Multiline Input Field */}
          <TextInput
            style={styles.inlineReplyInput}
            placeholder={`Reply to ${replyTargetAuthor}...`}
            placeholderTextColor={colors.textMuted}
            value={value}
            onChangeText={onChangeText}
            multiline
            autoFocus
            maxLength={500}
          />

          {/* Bottom Action Buttons Row */}
          <View style={styles.inlineReplyActionsRow}>
            <View style={styles.replyPillTag}>
              <CornerDownRight color={colors.crimson} size={10} />
              <Text style={styles.replyPillText}>Thread</Text>
            </View>

            <View style={styles.inlineReplyButtonsGroup}>
              <TouchableOpacity
                style={styles.inlineCancelBtn}
                onPress={onCancel}
                disabled={isSending}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                activeOpacity={0.7}
              >
                <Text style={styles.inlineCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.inlineSubmitBtn,
                  (!value.trim() || isSending) && styles.inlineSubmitBtnDisabled,
                ]}
                onPress={onSubmit}
                disabled={!value.trim() || isSending}
                activeOpacity={0.8}
              >
                {isSending ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <Text style={styles.inlineSubmitText}>Reply</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

interface CommentRowProps {
  comment: PostComment;
  isPostAuthor: boolean;
  isBeingEdited: boolean;
  isReply?: boolean;
  isReplyingToThis: boolean;
  activeReplyText: string;
  isSendingReply: boolean;
  currentUserAvatar: string;
  onOpenMenu: (comment: PostComment) => void;
  onStartReply: (comment: PostComment) => void;
  onChangeReplyText: (text: string) => void;
  onSubmitReply: () => void;
  onCancelReply: () => void;
}

const CommentRow: React.FC<CommentRowProps> = ({
  comment,
  isPostAuthor,
  isBeingEdited,
  isReply = false,
  isReplyingToThis,
  activeReplyText,
  isSendingReply,
  currentUserAvatar,
  onOpenMenu,
  onStartReply,
  onChangeReplyText,
  onSubmitReply,
  onCancelReply,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasMoreLines, setHasMoreLines] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  const isLengthy =
    comment.text.length > 120 ||
    (comment.text.match(/\n/g) || []).length >= 3;

  const shouldShowToggle = hasMoreLines || isLengthy;

  const avatarUri =
    comment.authorAvatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.authorName || 'Member')}&background=0D1B2A&color=fff&bold=true`;

  const handleToggleLike = () => {
    setIsLiked((prev) => {
      const next = !prev;
      setLikesCount((cnt) => (next ? cnt + 1 : Math.max(0, cnt - 1)));
      return next;
    });
  };

  return (
    <View style={styles.commentItemOuter}>
      <View
        style={[
          styles.commentItem,
          isReply && styles.replyCommentItem,
          isBeingEdited && styles.commentItemEditing,
        ]}
      >
        <Image
          source={{ uri: avatarUri }}
          style={[styles.avatar, isReply && styles.replyAvatar]}
        />
        <View
          style={[
            styles.commentBubble,
            isReply && styles.replyCommentBubble,
            isBeingEdited && styles.commentBubbleEditing,
          ]}
        >
          {/* Author Header */}
          <View style={styles.authorRow}>
            <View style={styles.authorNameGroup}>
              <Text
                style={[styles.authorName, isReply && styles.replyAuthorName]}
                numberOfLines={1}
              >
                {comment.authorName}
              </Text>
              {isPostAuthor && (
                <View style={styles.authorBadgePill}>
                  <Text style={styles.authorBadgeText}>Author</Text>
                </View>
              )}
              {isBeingEdited && (
                <View style={styles.editingBadgePill}>
                  <Text style={styles.editingBadgeText}>Editing</Text>
                </View>
              )}
            </View>
            <View style={styles.rightCommentMeta}>
              <Text style={styles.createdAt}>{formatPostTime(comment.createdAt)}</Text>
              {/* Three dots options button */}
              <TouchableOpacity
                style={styles.commentMoreBtn}
                onPress={() => onOpenMenu(comment)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                activeOpacity={0.6}
              >
                <MoreVertical color={colors.textSecondary} size={13} />
              </TouchableOpacity>
            </View>
          </View>

          {comment.authorCompany ? (
            <View style={styles.companyRow}>
              <Building2 color={colors.primary} size={9.5} />
              <Text style={styles.authorCompany} numberOfLines={1}>
                {comment.authorCompany}
              </Text>
            </View>
          ) : null}

          {/* Comment Text with 3-line clamp & See more toggle */}
          <Text
            style={[styles.commentText, isReply && styles.replyCommentText]}
            numberOfLines={isExpanded ? undefined : 3}
            ellipsizeMode="tail"
            onTextLayout={(e) => {
              if (e.nativeEvent.lines && e.nativeEvent.lines.length > 3) {
                setHasMoreLines(true);
              }
            }}
          >
            {comment.text}
          </Text>

          {shouldShowToggle && (
            <TouchableOpacity
              onPress={() => setIsExpanded((prev) => !prev)}
              style={styles.showMoreCommentBtn}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              activeOpacity={0.7}
            >
              <Text style={styles.showMoreCommentText}>
                {isExpanded ? 'Show less' : '... See more'}
              </Text>
            </TouchableOpacity>
          )}

          {/* Action Row: Like & Reply */}
          <View style={styles.commentActionRow}>
            <TouchableOpacity
              style={[styles.commentActionBtn, isLiked && styles.commentActionBtnActive]}
              onPress={handleToggleLike}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              activeOpacity={0.7}
            >
              <ThumbsUp
                color={isLiked ? colors.crimson : colors.textMuted}
                size={11}
                fill={isLiked ? colors.crimson : 'none'}
              />
              <Text style={[styles.commentActionText, isLiked && styles.commentActionTextActive]}>
                {likesCount > 0 ? likesCount : 'Like'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.commentActionBtn,
                isReplyingToThis && styles.commentActionBtnReplyActive,
              ]}
              onPress={() => onStartReply(comment)}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              activeOpacity={0.7}
            >
              <MessageSquare
                color={isReplyingToThis ? colors.crimson : colors.textSecondary}
                size={11}
              />
              <Text
                style={[
                  styles.commentActionText,
                  isReplyingToThis && styles.commentActionTextActive,
                ]}
              >
                Reply
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Inline Reply Input Box (Opens directly underneath this comment) */}
      {isReplyingToThis && (
        <InlineReplyBox
          replyTargetAuthor={comment.authorName}
          userAvatar={currentUserAvatar}
          value={activeReplyText}
          isSending={isSendingReply}
          onChangeText={onChangeReplyText}
          onSubmit={onSubmitReply}
          onCancel={onCancelReply}
        />
      )}
    </View>
  );
};

export const CommentsModal: React.FC = () => {
  const {
    showCommentsModal,
    selectedPostForComments,
    closeComments,
    comments,
    isLoadingComments,
    addComment,
    editComment,
    deleteComment,
    currentUser,
    isAdmin,
  } = useApp();

  const [commentText, setCommentText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [editingComment, setEditingComment] = useState<PostComment | null>(null);
  const [activeReplyComment, setActiveReplyComment] = useState<PostComment | null>(null);
  const [inlineReplyText, setInlineReplyText] = useState('');
  const [isSendingInlineReply, setIsSendingInlineReply] = useState(false);
  const [activeCommentMenu, setActiveCommentMenu] = useState<PostComment | null>(null);
  const [expandedThreads, setExpandedThreads] = useState<Record<string, boolean>>({});

  const inputRef = useRef<TextInput>(null);

  if (!showCommentsModal || !selectedPostForComments) return null;

  const postComments = comments[selectedPostForComments.id] || [];

  // Separate root comments and child replies
  const rootComments = postComments.filter((c) => !c.parentCommentId);
  const repliesByParent = postComments.reduce<Record<string, PostComment[]>>((acc, c) => {
    if (c.parentCommentId) {
      acc[c.parentCommentId] = acc[c.parentCommentId] || [];
      acc[c.parentCommentId].push(c);
    }
    return acc;
  }, {});

  const toggleThread = (commentId: string) => {
    setExpandedThreads((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  const handleCloseAll = () => {
    setActiveCommentMenu(null);
    setEditingComment(null);
    setActiveReplyComment(null);
    setInlineReplyText('');
    setCommentText('');
    closeComments();
  };

  const handleSendRoot = async () => {
    const trimmed = commentText.trim();
    if (!trimmed) return;

    setIsSending(true);
    try {
      if (editingComment) {
        await editComment(selectedPostForComments.id, editingComment.id, trimmed);
        setEditingComment(null);
      } else {
        await addComment(selectedPostForComments.id, trimmed);
      }
      setCommentText('');
    } finally {
      setIsSending(false);
    }
  };

  const handleSendInlineReply = async () => {
    if (!activeReplyComment) return;
    const trimmed = inlineReplyText.trim();
    if (!trimmed) return;

    setIsSendingInlineReply(true);
    try {
      const parentId = activeReplyComment.parentCommentId || activeReplyComment.id;
      await addComment(selectedPostForComments.id, trimmed, parentId);
      // Auto expand parent thread
      setExpandedThreads((prev) => ({ ...prev, [parentId]: true }));
      setActiveReplyComment(null);
      setInlineReplyText('');
    } finally {
      setIsSendingInlineReply(false);
    }
  };

  const handleStartEdit = (comment: PostComment) => {
    setActiveCommentMenu(null);
    setActiveReplyComment(null);
    setInlineReplyText('');
    setEditingComment(comment);
    setCommentText(comment.text);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleCancelEdit = () => {
    setEditingComment(null);
    setCommentText('');
  };

  const handleStartReply = (comment: PostComment) => {
    setEditingComment(null);
    setCommentText('');
    setActiveReplyComment(comment);
    setInlineReplyText('');
    const parentId = comment.parentCommentId || comment.id;
    setExpandedThreads((prev) => ({ ...prev, [parentId]: true }));
  };

  const handleCancelReply = () => {
    setActiveReplyComment(null);
    setInlineReplyText('');
  };

  const handleDeleteComment = (comment: PostComment) => {
    setActiveCommentMenu(null);

    const performDelete = () => {
      if (editingComment && editingComment.id === comment.id) {
        handleCancelEdit();
      }
      if (activeReplyComment && activeReplyComment.id === comment.id) {
        handleCancelReply();
      }
      deleteComment(selectedPostForComments.id, comment.id);
    };

    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Are you sure you want to delete this response permanently?');
      if (confirmed) {
        performDelete();
      }
    } else {
      Alert.alert(
        'Delete Response',
        'Are you sure you want to delete this response permanently? Any replies to it will also be removed.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: performDelete,
          },
        ]
      );
    }
  };

  const handleCopyComment = async (comment: PostComment) => {
    setActiveCommentMenu(null);
    try {
      await Clipboard.setStringAsync(comment.text);
      if (Platform.OS === 'web') {
        window.alert('Comment copied to clipboard.');
      } else {
        Alert.alert('Copied', 'Comment copied to clipboard.');
      }
    } catch {
      // Fallback
    }
  };

  const handleReportComment = () => {
    setActiveCommentMenu(null);
    if (Platform.OS === 'web') {
      window.alert('Report Submitted. The Council moderation team will review this comment.');
    } else {
      Alert.alert(
        'Report Submitted',
        'Thank you for helping keep the Council feed professional. The moderation team will review this comment.'
      );
    }
  };

  const isMenuCommentOwner =
    activeCommentMenu &&
    (String(activeCommentMenu.authorId) === String(currentUser.id) ||
      activeCommentMenu.authorName?.trim().toLowerCase() === currentUser.name?.trim().toLowerCase() ||
      isAdmin);

  const currentUserAvatar =
    currentUser.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name || 'Member')}&background=0D1B2A&color=fff&bold=true`;

  return (
    <Modal
      visible={showCommentsModal}
      transparent
      animationType="slide"
      onRequestClose={handleCloseAll}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        {/* Backdrop Dismiss */}
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={handleCloseAll} />

        <View style={styles.sheetContainer}>
          {/* Top Drag Handle */}
          <View style={styles.sheetHandle} />

          {/* Compact Streamlined Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleGroup}>
              <Text style={styles.headerTitle}>
                Comments <Text style={styles.headerCountBadge}>({postComments.length})</Text>
              </Text>
            </View>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={handleCloseAll}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              activeOpacity={0.7}
            >
              <X color={colors.textPrimary} size={16} />
            </TouchableOpacity>
          </View>

          {/* Streamlined Mini Post Context Strip */}
          <View style={styles.postContextStrip}>
            <View style={styles.contextLeftBorder} />
            <View style={styles.contextContent}>
              <View style={styles.contextMetaRow}>
                <Text style={styles.contextAuthor} numberOfLines={1}>
                  {selectedPostForComments.authorName}
                </Text>
                {selectedPostForComments.tag && selectedPostForComments.tag !== 'General' && (
                  <View style={styles.contextTagPill}>
                    <Text style={styles.contextTagText} numberOfLines={1}>
                      {selectedPostForComments.tag}
                    </Text>
                  </View>
                )}
              </View>
              <Text style={styles.contextQuote} numberOfLines={1}>
                {selectedPostForComments.content}
              </Text>
            </View>
          </View>

          {/* Comments List Area */}
          {isLoadingComments && postComments.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={colors.crimson} />
              <Text style={styles.loadingText}>Loading comments...</Text>
            </View>
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.commentsList}
              keyboardShouldPersistTaps="handled"
            >
              {rootComments.length === 0 ? (
                <View style={styles.emptyState}>
                  <View style={styles.emptyIconBg}>
                    <MessageSquare color={colors.textMuted} size={20} />
                  </View>
                  <Text style={styles.emptyTitle}>No comments yet</Text>
                  <Text style={styles.emptyText}>
                    Be the first to share your insights or offer a solution!
                  </Text>
                </View>
              ) : (
                rootComments.map((rootComment) => {
                  const isPostAuthor =
                    (rootComment.authorId &&
                      selectedPostForComments.authorId &&
                      String(rootComment.authorId) === String(selectedPostForComments.authorId)) ||
                    rootComment.authorName?.trim().toLowerCase() ===
                      selectedPostForComments.authorName?.trim().toLowerCase();

                  const isBeingEdited = editingComment?.id === rootComment.id;
                  const childReplies = repliesByParent[rootComment.id] || [];
                  const isThreadExpanded = expandedThreads[rootComment.id] ?? true;
                  const isRootReplying = activeReplyComment?.id === rootComment.id;

                  return (
                    <View key={rootComment.id} style={styles.threadGroup}>
                      {/* Parent / Root Comment */}
                      <CommentRow
                        comment={rootComment}
                        isPostAuthor={isPostAuthor}
                        isBeingEdited={isBeingEdited}
                        isReplyingToThis={isRootReplying}
                        activeReplyText={inlineReplyText}
                        isSendingReply={isSendingInlineReply}
                        currentUserAvatar={currentUserAvatar}
                        onOpenMenu={(item) => setActiveCommentMenu(item)}
                        onStartReply={(item) => handleStartReply(item)}
                        onChangeReplyText={setInlineReplyText}
                        onSubmitReply={handleSendInlineReply}
                        onCancelReply={handleCancelReply}
                      />

                      {/* Thread Replies Toggle & Nested List */}
                      {childReplies.length > 0 && (
                        <View style={styles.repliesContainer}>
                          <TouchableOpacity
                            style={styles.viewRepliesBtn}
                            onPress={() => toggleThread(rootComment.id)}
                            activeOpacity={0.7}
                            hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
                          >
                            <View style={styles.viewRepliesLine} />
                            <Text style={styles.viewRepliesText}>
                              {isThreadExpanded
                                ? `Hide ${childReplies.length === 1 ? 'reply' : 'replies'}`
                                : `View ${childReplies.length} ${childReplies.length === 1 ? 'reply' : 'replies'}`}
                            </Text>
                            {isThreadExpanded ? (
                              <ChevronUp color={colors.crimson} size={11} />
                            ) : (
                              <ChevronDown color={colors.crimson} size={11} />
                            )}
                          </TouchableOpacity>

                          {/* Nested Replies */}
                          {isThreadExpanded && (
                            <View style={styles.nestedRepliesList}>
                              {childReplies.map((reply) => {
                                const isReplyPostAuthor =
                                  (reply.authorId &&
                                    selectedPostForComments.authorId &&
                                    String(reply.authorId) ===
                                      String(selectedPostForComments.authorId)) ||
                                  reply.authorName?.trim().toLowerCase() ===
                                    selectedPostForComments.authorName?.trim().toLowerCase();

                                const isReplyBeingEdited = editingComment?.id === reply.id;
                                const isChildReplying = activeReplyComment?.id === reply.id;

                                return (
                                  <CommentRow
                                    key={reply.id}
                                    comment={reply}
                                    isPostAuthor={isReplyPostAuthor}
                                    isBeingEdited={isReplyBeingEdited}
                                    isReply
                                    isReplyingToThis={isChildReplying}
                                    activeReplyText={inlineReplyText}
                                    isSendingReply={isSendingInlineReply}
                                    currentUserAvatar={currentUserAvatar}
                                    onOpenMenu={(item) => setActiveCommentMenu(item)}
                                    onStartReply={(item) => handleStartReply(item)}
                                    onChangeReplyText={setInlineReplyText}
                                    onSubmitReply={handleSendInlineReply}
                                    onCancelReply={handleCancelReply}
                                  />
                                );
                              })}
                            </View>
                          )}
                        </View>
                      )}
                    </View>
                  );
                })
              )}
            </ScrollView>
          )}

          {/* Active Edit Mode Banner */}
          {editingComment && (
            <View style={styles.editingBanner}>
              <View style={styles.editingBannerLeft}>
                <View style={styles.editingIconPill}>
                  <Edit3 color={colors.accentBlue} size={11} />
                </View>
                <View style={styles.editingTextGroup}>
                  <Text style={styles.editingBannerTitle}>Editing comment</Text>
                  <Text style={styles.editingBannerSnippet} numberOfLines={1}>
                    "{editingComment.text}"
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.cancelEditBtn}
                onPress={handleCancelEdit}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                activeOpacity={0.7}
              >
                <X color={colors.textSecondary} size={12} />
                <Text style={styles.cancelEditText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Slimmer Bottom Composer */}
          <View style={styles.composerBar}>
            <Image source={{ uri: currentUserAvatar }} style={styles.composerAvatar} />
            <TextInput
              ref={inputRef}
              style={[
                styles.composerInput,
                editingComment && styles.composerInputEditing,
              ]}
              placeholder={
                editingComment
                  ? 'Update comment...'
                  : 'Add a comment...'
              }
              placeholderTextColor={colors.textMuted}
              value={commentText}
              onChangeText={setCommentText}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[
                styles.sendBtn,
                editingComment && styles.saveEditBtn,
                (!commentText.trim() || isSending) && styles.sendBtnDisabled,
              ]}
              onPress={handleSendRoot}
              disabled={!commentText.trim() || isSending}
              activeOpacity={0.8}
            >
              {isSending ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : editingComment ? (
                <Check color={colors.white} size={14} />
              ) : (
                <Send color={colors.white} size={13} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Comment Action Sheet / Context Modal */}
        <Modal
          visible={activeCommentMenu !== null}
          transparent
          animationType="fade"
          onRequestClose={() => setActiveCommentMenu(null)}
        >
          <TouchableOpacity
            style={styles.menuModalOverlay}
            activeOpacity={1}
            onPress={() => setActiveCommentMenu(null)}
          >
            <View style={styles.actionMenuCard}>
              <View style={styles.actionMenuHeader}>
                <View style={styles.menuHeaderLeft}>
                  {activeCommentMenu?.authorAvatar ? (
                    <Image
                      source={{ uri: activeCommentMenu.authorAvatar }}
                      style={styles.menuAvatar}
                    />
                  ) : null}
                  <View style={styles.menuHeaderInfo}>
                    <Text style={styles.actionMenuTitle} numberOfLines={1}>
                      {activeCommentMenu?.authorName}
                    </Text>
                    <Text style={styles.menuSubtitle} numberOfLines={1}>
                      {isMenuCommentOwner ? 'Manage your comment' : 'Comment options'}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => setActiveCommentMenu(null)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  style={styles.menuCloseBtn}
                >
                  <X color={colors.textMuted} size={15} />
                </TouchableOpacity>
              </View>

              {/* Comment Content Preview Snippet */}
              {activeCommentMenu && (
                <View style={styles.menuCommentSnippet}>
                  <Text style={styles.menuCommentSnippetText} numberOfLines={2}>
                    "{activeCommentMenu.text}"
                  </Text>
                </View>
              )}

              {/* Menu Actions */}
              <View style={styles.menuActionsList}>
                {/* Reply action inside context menu */}
                <TouchableOpacity
                  style={styles.actionMenuItem}
                  onPress={() => {
                    const target = activeCommentMenu!;
                    setActiveCommentMenu(null);
                    handleStartReply(target);
                  }}
                  activeOpacity={0.7}
                >
                  <View style={[styles.actionIconBox, { backgroundColor: colors.crimsonLight }]}>
                    <CornerDownRight color={colors.crimson} size={14} />
                  </View>
                  <View style={styles.actionItemTextGroup}>
                    <Text style={styles.actionMenuText}>Reply to Comment</Text>
                    <Text style={styles.actionMenuSubtext}>Start an inline response in this thread</Text>
                  </View>
                </TouchableOpacity>

                {isMenuCommentOwner && (
                  <>
                    <TouchableOpacity
                      style={styles.actionMenuItem}
                      onPress={() => handleStartEdit(activeCommentMenu!)}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.actionIconBox, { backgroundColor: colors.accentBlueLight }]}>
                        <Edit3 color={colors.accentBlue} size={14} />
                      </View>
                      <View style={styles.actionItemTextGroup}>
                        <Text style={styles.actionMenuText}>Edit Comment</Text>
                        <Text style={styles.actionMenuSubtext}>Update your text</Text>
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.actionMenuItem}
                      onPress={() => handleDeleteComment(activeCommentMenu!)}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.actionIconBox, { backgroundColor: '#FEF2F2' }]}>
                        <Trash2 color={colors.crimson} size={14} />
                      </View>
                      <View style={styles.actionItemTextGroup}>
                        <Text style={[styles.actionMenuText, { color: colors.crimson }]}>
                          Delete Comment
                        </Text>
                        <Text style={styles.actionMenuSubtext}>Permanently remove this comment</Text>
                      </View>
                    </TouchableOpacity>
                  </>
                )}

                <View style={styles.actionDivider} />

                <TouchableOpacity
                  style={styles.actionMenuItem}
                  onPress={() => handleCopyComment(activeCommentMenu!)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.actionIconBox, { backgroundColor: colors.cardBgElevated }]}>
                    <Copy color={colors.primary} size={14} />
                  </View>
                  <View style={styles.actionItemTextGroup}>
                    <Text style={styles.actionMenuText}>Copy Text</Text>
                    <Text style={styles.actionMenuSubtext}>Copy comment to clipboard</Text>
                  </View>
                </TouchableOpacity>

                {!isMenuCommentOwner && (
                  <TouchableOpacity
                    style={styles.actionMenuItem}
                    onPress={handleReportComment}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.actionIconBox, { backgroundColor: '#FEF2F2' }]}>
                      <Flag color="#DC2626" size={14} />
                    </View>
                    <View style={styles.actionItemTextGroup}>
                      <Text style={[styles.actionMenuText, { color: '#DC2626' }]}>
                        Report Comment
                      </Text>
                      <Text style={styles.actionMenuSubtext}>Flag inappropriate content</Text>
                    </View>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </TouchableOpacity>
        </Modal>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(11, 25, 44, 0.6)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  sheetContainer: {
    backgroundColor: colors.cardBg,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.7)',
    maxHeight: '88%',
    height: '80%',
    paddingBottom: Platform.OS === 'ios' ? 14 : 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 20,
  },
  sheetHandle: {
    width: 36,
    height: 3.5,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitleGroup: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.2,
  },
  headerCountBadge: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.cardBgElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  postContextStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    marginHorizontal: 12,
    marginTop: 6,
    marginBottom: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  contextLeftBorder: {
    width: 3,
    alignSelf: 'stretch',
    backgroundColor: colors.crimson,
  },
  contextContent: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  contextMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 1,
  },
  contextAuthor: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary,
  },
  contextTagPill: {
    backgroundColor: colors.crimsonLight,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
  },
  contextTagText: {
    fontSize: 8.5,
    fontWeight: '700',
    color: colors.crimson,
  },
  contextQuote: {
    fontSize: 10.5,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
    gap: 6,
  },
  loadingText: {
    fontSize: 11.5,
    color: colors.textMuted,
    fontWeight: '600',
  },
  commentsList: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  threadGroup: {
    gap: 4,
  },
  commentItemOuter: {
    gap: 4,
  },
  emptyState: {
    paddingVertical: 30,
    alignItems: 'center',
  },
  emptyIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.cardBgElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  emptyText: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  commentItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  replyCommentItem: {
    gap: 6,
  },
  commentItemEditing: {
    transform: [{ scale: 1.005 }],
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.cardBgElevated,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginTop: 1,
  },
  replyAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginTop: 1,
  },
  commentBubble: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: '#E9EEF4',
  },
  replyCommentBubble: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  commentBubbleEditing: {
    borderColor: colors.accentBlue,
    backgroundColor: '#F0F7FF',
    shadowColor: colors.accentBlue,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  authorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 1,
  },
  authorNameGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flex: 1,
    marginRight: 4,
  },
  authorName: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
    flexShrink: 1,
  },
  replyAuthorName: {
    fontSize: 11.5,
  },
  authorBadgePill: {
    backgroundColor: colors.crimsonLight,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
    borderWidth: 0.8,
    borderColor: colors.crimsonBorder,
    flexShrink: 0,
  },
  authorBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    color: colors.crimson,
    letterSpacing: 0.2,
  },
  editingBadgePill: {
    backgroundColor: colors.accentBlueLight,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
    borderWidth: 0.8,
    borderColor: colors.accentBlueBorder,
    flexShrink: 0,
  },
  editingBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    color: colors.accentBlue,
    letterSpacing: 0.2,
  },
  rightCommentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexShrink: 0,
  },
  createdAt: {
    fontSize: 9.5,
    color: colors.textMuted,
  },
  commentMoreBtn: {
    padding: 2,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginBottom: 3,
  },
  authorCompany: {
    fontSize: 9.5,
    color: colors.textMuted,
  },
  commentText: {
    fontSize: 12,
    color: colors.textPrimary,
    lineHeight: 16.5,
  },
  replyCommentText: {
    fontSize: 11.5,
    lineHeight: 16,
  },
  showMoreCommentBtn: {
    alignSelf: 'flex-start',
    marginTop: 2,
    paddingVertical: 1,
  },
  showMoreCommentText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: colors.crimson,
  },
  commentActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  commentActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3.5,
    paddingVertical: 1,
    paddingHorizontal: 2,
  },
  commentActionBtnActive: {
    opacity: 1,
  },
  commentActionBtnReplyActive: {
    backgroundColor: colors.crimsonLight,
    borderRadius: 4,
    paddingHorizontal: 4,
  },
  commentActionText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  commentActionTextActive: {
    color: colors.crimson,
    fontWeight: '800',
  },
  inlineReplyWrapper: {
    marginTop: 4,
    position: 'relative',
  },
  threadCurveLine: {
    position: 'absolute',
    left: 16,
    top: -6,
    bottom: 20,
    width: 1.5,
    backgroundColor: '#CBD5E1',
    borderBottomLeftRadius: 8,
  },
  inlineReplyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginLeft: 12,
  },
  inlineUserAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.cardBgElevated,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginTop: 1,
  },
  inlineReplyCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  inlineReplyHeader: {
    marginBottom: 2,
  },
  inlineReplyRecipient: {
    fontSize: 9.5,
    color: colors.textSecondary,
  },
  inlineReplyRecipientBold: {
    fontWeight: '800',
    color: colors.crimson,
  },
  inlineReplyInput: {
    fontSize: 11.5,
    color: colors.textPrimary,
    minHeight: 30,
    maxHeight: 80,
    paddingVertical: 2,
    textAlignVertical: 'top',
  },
  inlineReplyActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  replyPillTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.crimsonLight,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  replyPillText: {
    fontSize: 8.5,
    fontWeight: '800',
    color: colors.crimson,
  },
  inlineReplyButtonsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  inlineCancelBtn: {
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  inlineCancelText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  inlineSubmitBtn: {
    backgroundColor: colors.crimson,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    shadowColor: colors.crimson,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 1,
  },
  inlineSubmitBtnDisabled: {
    backgroundColor: '#CBD5E1',
    shadowOpacity: 0,
    elevation: 0,
  },
  inlineSubmitText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: colors.white,
  },
  repliesContainer: {
    marginLeft: 18,
    borderLeftWidth: 1.5,
    borderLeftColor: '#E2E8F0',
    paddingLeft: 8,
    gap: 4,
    marginTop: 2,
  },
  viewRepliesBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 2,
  },
  viewRepliesLine: {
    width: 8,
    height: 1.5,
    backgroundColor: '#CBD5E1',
  },
  viewRepliesText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: colors.crimson,
  },
  nestedRepliesList: {
    gap: 6,
    marginTop: 1,
  },
  editingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderTopWidth: 1,
    borderTopColor: '#DBEAFE',
    borderBottomWidth: 1,
    borderBottomColor: '#DBEAFE',
  },
  editingBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    marginRight: 8,
  },
  editingIconPill: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.accentBlueLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editingTextGroup: {
    flex: 1,
  },
  editingBannerTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.accentBlue,
  },
  editingBannerSnippet: {
    fontSize: 10,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  cancelEditBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 5,
    backgroundColor: '#E2E8F0',
  },
  cancelEditText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  composerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 6,
    paddingBottom: 4,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 8,
  },
  composerAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.cardBgElevated,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  composerInput: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontSize: 12,
    color: colors.textPrimary,
    minHeight: 34,
    maxHeight: 75,
  },
  composerInputEditing: {
    borderColor: colors.accentBlue,
    backgroundColor: '#FFFFFF',
  },
  sendBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.crimson,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.crimson,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 2,
  },
  saveEditBtn: {
    backgroundColor: colors.emerald,
    shadowColor: colors.emerald,
  },
  sendBtnDisabled: {
    backgroundColor: colors.textMuted,
    shadowOpacity: 0,
    elevation: 0,
  },
  menuModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(11, 25, 44, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  actionMenuCard: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: colors.cardBg,
    borderRadius: 16,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  actionMenuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  menuHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  menuAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.cardBgElevated,
  },
  menuHeaderInfo: {
    flex: 1,
  },
  actionMenuTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  menuSubtitle: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 1,
  },
  menuCloseBtn: {
    padding: 3,
    borderRadius: 10,
    backgroundColor: colors.cardBgElevated,
  },
  menuCommentSnippet: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 8,
    marginBottom: 10,
    borderLeftWidth: 2.5,
    borderLeftColor: colors.accentBlue,
  },
  menuCommentSnippetText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontStyle: 'italic',
    lineHeight: 15,
  },
  menuActionsList: {
    gap: 6,
  },
  actionMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    gap: 10,
  },
  actionIconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionItemTextGroup: {
    flex: 1,
  },
  actionMenuText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  actionMenuSubtext: {
    fontSize: 9.5,
    color: colors.textMuted,
    marginTop: 1,
  },
  actionDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 2,
  },
});
