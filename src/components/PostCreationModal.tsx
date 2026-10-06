import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  TextInput,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  X,
  Sparkles,
  Image as ImageIcon,
  FileText,
  Hash,
  Globe2,
  Trash2,
} from 'lucide-react-native';
import { colors } from '../theme/colors';
import { useApp } from '../context/AppContext';
import { InitialsAvatar } from './InitialsAvatar';

export const PostCreationModal: React.FC = () => {
  const { showCreatePostModal, closeCreatePost, createPost, editPost, editingPost, currentUser } = useApp();

  const [content, setContent] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [attachedDoc, setAttachedDoc] = useState<{
    name: string;
    size: string;
    type: string;
    url: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (editingPost) {
      setContent(editingPost.content || '');
      setSelectedImage(editingPost.mediaUrl || null);
      setAttachedDoc(
        editingPost.documentAttachment
          ? {
              name: editingPost.documentAttachment.name,
              size: editingPost.documentAttachment.size,
              type: editingPost.documentAttachment.type,
              url: (editingPost.documentAttachment as any).url || '',
            }
          : null
      );
    } else {
      setContent('');
      setSelectedImage(null);
      setAttachedDoc(null);
    }
  }, [editingPost, showCreatePostModal]);

  if (!showCreatePostModal) return null;

  const handleInsertHashtag = (tag: string) => {
    setContent(prev => (prev ? `${prev} ${tag} ` : `${tag} `));
    inputRef.current?.focus();
  };

  const handleToggleSampleImage = () => {
    if (selectedImage) {
      setSelectedImage(null);
    } else {
      // High-quality business/manufacturing facility sample
      setSelectedImage(
        'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&auto=format&fit=crop&q=80'
      );
    }
  };

  const handleToggleSampleDoc = () => {
    if (attachedDoc) {
      setAttachedDoc(null);
    } else {
      setAttachedDoc({
        name: 'Technical_RFP_Specification.pdf',
        size: '2.4 MB',
        type: 'PDF',
        url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      });
    }
  };

  const handleResetAndClose = () => {
    setContent('');
    setSelectedImage(null);
    setAttachedDoc(null);
    setIsSubmitting(false);
    closeCreatePost();
  };

  const handleSubmit = async () => {
    const trimmed = content.trim();
    if (!trimmed && !selectedImage && !attachedDoc) {
      Alert.alert('Empty Post', 'Please write something or attach media before publishing.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingPost) {
        await editPost(editingPost.id, trimmed, {
          mediaUrl: selectedImage || undefined,
          documentAttachment: attachedDoc || undefined,
        });
        setIsSubmitting(false);
        handleResetAndClose();
        Alert.alert('Post Updated! ✨', 'Your post has been updated.');
      } else {
        await createPost(trimmed, {
          mediaUrl: selectedImage || undefined,
          documentAttachment: attachedDoc || undefined,
        });
        setIsSubmitting(false);
        handleResetAndClose();
        Alert.alert('Post Published! 🚀', 'Your post is now live on the council feed.');
      }
    } catch {
      setIsSubmitting(false);
      Alert.alert('Error', 'Failed to save post. Please try again.');
    }
  };

  const canSubmit = content.trim().length > 0 || !!selectedImage || !!attachedDoc;

  return (
    <Modal
      visible={showCreatePostModal}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={handleResetAndClose}
    >
      <SafeAreaView style={styles.fullScreenContainer} edges={['top', 'bottom', 'left', 'right']}>
        {/* Full-Screen Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={handleResetAndClose}
            activeOpacity={0.7}
          >
            <X color={colors.textPrimary} size={20} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>{editingPost ? 'Edit Post' : 'Create Post'}</Text>

          <TouchableOpacity
            style={[styles.publishPillBtn, !canSubmit && styles.publishPillBtnDisabled]}
            onPress={handleSubmit}
            disabled={!canSubmit || isSubmitting}
            activeOpacity={0.8}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <>
                <Sparkles color={colors.white} size={14} />
                <Text style={styles.publishPillText}>{editingPost ? 'Save' : 'Post'}</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardContainer}
        >
          <ScrollView
            style={styles.scrollArea}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollBody}
            keyboardShouldPersistTaps="handled"
          >
            {/* Author Identity Card */}
            <View style={styles.authorRow}>
              {currentUser.avatar ? (
                <Image source={{ uri: currentUser.avatar }} style={styles.authorAvatar} />
              ) : (
                <InitialsAvatar name={currentUser.name} size={48} />
              )}
              <View style={styles.authorInfo}>
                <Text style={styles.authorName}>{currentUser.name}</Text>
                <Text style={styles.authorMeta} numberOfLines={1}>
                  {currentUser.companyName
                    ? `${currentUser.companyName} • ${currentUser.chapter || 'Council Member'}`
                    : currentUser.chapter || 'Kolkata Central Chapter'}
                </Text>

                <View style={styles.audienceBadge}>
                  <Globe2 color={colors.primary} size={11} />
                  <Text style={styles.audienceText}>Council Network Feed</Text>
                </View>
              </View>
            </View>

            {/* Expansive Full-Screen Canvas */}
            <TouchableWithoutFeedback onPress={() => inputRef.current?.focus()}>
              <View style={styles.canvasWrapper}>
                <TextInput
                  ref={inputRef}
                  style={styles.textArea}
                  value={content}
                  onChangeText={setContent}
                  placeholder="What's on your mind? Share a business requirement, collaboration ask, or council update..."
                  placeholderTextColor="#94A3B8"
                  multiline
                  autoFocus
                  textAlignVertical="top"
                />
              </View>
            </TouchableWithoutFeedback>

            {/* Attached Image Preview */}
            {selectedImage && (
              <View style={styles.imagePreviewContainer}>
                <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
                <TouchableOpacity
                  style={styles.removeMediaBtn}
                  onPress={() => setSelectedImage(null)}
                  activeOpacity={0.8}
                >
                  <Trash2 color={colors.white} size={14} />
                </TouchableOpacity>
              </View>
            )}

            {/* Attached Document Preview */}
            {attachedDoc && (
              <View style={styles.docPreviewCard}>
                <View style={styles.docIconBox}>
                  <FileText color={colors.crimson} size={22} />
                </View>
                <View style={styles.docDetails}>
                  <Text style={styles.docName} numberOfLines={1}>
                    {attachedDoc.name}
                  </Text>
                  <Text style={styles.docMeta}>
                    {attachedDoc.type} • {attachedDoc.size}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.removeDocBtn}
                  onPress={() => setAttachedDoc(null)}
                  activeOpacity={0.8}
                >
                  <X color={colors.textSecondary} size={18} />
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>

          {/* Docked Quick Tags Strip (Always Accessible at Bottom) */}
          <View style={styles.dockedTagHelpersBox}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tagHelpersRow}
              keyboardShouldPersistTaps="handled"
            >
              {[
                '#B2BRequirement',
                '#HVAC',
                '#Manufacturing',
                '#Pharma',
                '#DealClosed',
                '#Partnership',
                '#Logistics',
                '#Engineering',
              ].map(t => (
                <TouchableOpacity
                  key={t}
                  style={styles.quickTagPill}
                  onPress={() => handleInsertHashtag(t)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.quickTagText}>{t}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Docked Bottom Action Toolbar */}
          <View style={styles.bottomToolbar}>
            <View style={styles.toolbarActions}>
              <TouchableOpacity
                style={[styles.toolIconBtn, !!selectedImage && styles.toolIconBtnActive]}
                onPress={handleToggleSampleImage}
                activeOpacity={0.7}
              >
                <ImageIcon color={selectedImage ? colors.crimson : colors.primary} size={20} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.toolIconBtn, !!attachedDoc && styles.toolIconBtnActive]}
                onPress={handleToggleSampleDoc}
                activeOpacity={0.7}
              >
                <FileText color={attachedDoc ? colors.crimson : colors.primary} size={20} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.toolIconBtn}
                onPress={() => handleInsertHashtag('#')}
                activeOpacity={0.7}
              >
                <Hash color={colors.primary} size={20} />
              </TouchableOpacity>
            </View>

            <Text style={styles.charCountText}>
              {content.length > 0 ? `${content.length} chars` : ''}
            </Text>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    backgroundColor: colors.cardBg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: colors.cardBg,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.cardBgElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  publishPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.crimson,
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 22,
    shadowColor: colors.crimson,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  publishPillBtnDisabled: {
    backgroundColor: '#CBD5E1',
    shadowOpacity: 0,
    elevation: 0,
  },
  publishPillText: {
    color: colors.white,
    fontSize: 13.5,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  keyboardContainer: {
    flex: 1,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  authorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: colors.crimson,
    marginRight: 12,
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 15.5,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  authorMeta: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
  audienceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.cardBgElevated,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 5,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  audienceText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: colors.primary,
  },
  scrollArea: {
    flex: 1,
    backgroundColor: colors.cardBg,
  },
  scrollBody: {
    flexGrow: 1,
    padding: 18,
    paddingBottom: 24,
  },
  canvasWrapper: {
    flex: 1,
    minHeight: 280,
  },
  textArea: {
    flex: 1,
    fontSize: 16.5,
    color: colors.textPrimary,
    lineHeight: 25,
    minHeight: 280,
    paddingTop: 8,
    paddingBottom: 16,
    paddingHorizontal: 0,
    backgroundColor: 'transparent',
    borderWidth: 0,
    fontWeight: '500',
    ...(Platform.OS === 'web'
      ? ({
          outlineStyle: 'none',
          outlineWidth: 0,
        } as any)
      : {}),
  },
  imagePreviewContainer: {
    position: 'relative',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  imagePreview: {
    width: '100%',
    height: 220,
    backgroundColor: '#E2E8F0',
  },
  removeMediaBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.65)',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  docPreviewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  docIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: colors.crimsonLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  docDetails: {
    flex: 1,
  },
  docName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  docMeta: {
    fontSize: 11.5,
    color: colors.textSecondary,
    marginTop: 2,
  },
  removeDocBtn: {
    padding: 6,
  },
  dockedTagHelpersBox: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: colors.cardBg,
  },
  tagHelpersRow: {
    gap: 8,
  },
  quickTagPill: {
    backgroundColor: colors.cardBgElevated,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  quickTagText: {
    fontSize: 11.5,
    color: colors.primary,
    fontWeight: '800',
  },
  bottomToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: colors.cardBg,
  },
  toolbarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  toolIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.cardBgElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  toolIconBtnActive: {
    backgroundColor: colors.crimsonLight,
    borderColor: colors.crimson,
  },
  charCountText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  },
});
