import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ImagePlus, Camera } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { InitialsAvatar } from './InitialsAvatar';
import { PhotoActionSheet } from './PhotoActionSheet';
import { PhotoViewerModal } from './PhotoViewerModal';
import { ImageCropperModal } from './ImageCropperModal';
import { ConfirmDialog } from './ConfirmDialog';
import {
  PickedFile,
  uploadFileRequest,
  setProfilePhotoRequest,
  removePhotoRequest,
} from '../services/profileApi';

interface Props {
  kind: 'avatar' | 'cover';
  name: string;
  url: string;
  updatedAt: string | null;
  onChange: (url: string, updatedAt: string | null) => void;
  onError: (message: string) => void;
}

const LABEL = { avatar: 'Profile photo', cover: 'Cover image' };

export const PhotoField: React.FC<Props> = ({
  kind,
  name,
  url,
  updatedAt,
  onChange,
  onError,
}) => {
  const isAvatar = kind === 'avatar';
  const shape = isAvatar ? 'square' : 'wide';
  const aspect: [number, number] = isAvatar ? [1, 1] : [16, 9];
  const outputWidth = isAvatar ? 768 : 1600;

  const [menuOpen, setMenuOpen] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [cropSource, setCropSource] = useState<{
    uri: string;
    width: number;
    height: number;
  } | null>(null);
  const [uploadPct, setUploadPct] = useState<number | null>(null);
  const [removing, setRemoving] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);

  const busy = uploadPct !== null || removing;

  const launchPicker = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        onError('Allow photo library access to upload an image.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: false, // member crops it themselves in the next step
        quality: 1,
      });
      if (result.canceled || !result.assets?.length) return;
      const a = result.assets[0];
      setCropSource({
        uri: a.uri,
        width: a.width || 1000,
        height: a.height || 1000,
      });
    } catch (err: any) {
      onError(err?.message || 'Could not open the photo library.');
    }
  };

  const handlePress = () => {
    if (busy) return;
    if (url) setMenuOpen(true);
    else launchPicker();
  };

  // Close the cropper immediately, then upload with a progress readout on the thumb.
  const handleCropped = async (file: PickedFile) => {
    setCropSource(null);
    setUploadPct(0);
    try {
      const uploaded = await uploadFileRequest(
        file,
        isAvatar ? 'avatar' : 'cover',
        pct => setUploadPct(pct)
      );
      setUploadPct(100);
      const res = await setProfilePhotoRequest(kind, uploaded.url);
      const stamp = isAvatar
        ? res.profile?.avatarUpdatedAt ?? null
        : res.profile?.coverImageUpdatedAt ?? null;
      onChange(uploaded.url, stamp);
    } catch (err: any) {
      onError(err?.message || 'Could not upload the photo.');
    } finally {
      setUploadPct(null);
    }
  };

  const doRemove = async () => {
    setRemoving(true);
    try {
      await removePhotoRequest(isAvatar ? 'avatar' : 'cover');
      onChange('', null);
      setConfirmRemove(false);
    } catch (err: any) {
      onError(err?.message || 'Could not remove the photo.');
    } finally {
      setRemoving(false);
    }
  };

  const ProgressOverlay = busy ? (
    <View style={[styles.overlay, isAvatar && styles.avatarOverlay]}>
      <ActivityIndicator size="small" color={colors.white} />
      {uploadPct !== null && <Text style={styles.pctText}>{uploadPct}%</Text>}
    </View>
  ) : null;

  const Thumb = isAvatar ? (
    <TouchableOpacity
      style={styles.avatarWrap}
      onPress={handlePress}
      disabled={busy}
      activeOpacity={0.8}
    >
      <InitialsAvatar name={name} uri={url || undefined} size={64} />
      {ProgressOverlay}
      {!url && !busy && (
        <View style={styles.addBadge}>
          <Camera color={colors.white} size={11} />
        </View>
      )}
    </TouchableOpacity>
  ) : (
    <TouchableOpacity
      style={styles.coverWrap}
      onPress={handlePress}
      disabled={busy}
      activeOpacity={0.85}
    >
      {url ? (
        <Image source={{ uri: url }} style={styles.coverImg} resizeMode="cover" />
      ) : (
        <View style={styles.coverPlaceholder}>
          <Text style={styles.coverName} numberOfLines={1}>{name}</Text>
          <View style={styles.coverHintRow}>
            <ImagePlus color="rgba(255,255,255,0.75)" size={14} />
            <Text style={styles.coverHint}>Add a cover image (16:9)</Text>
          </View>
        </View>
      )}
      {ProgressOverlay}
    </TouchableOpacity>
  );

  return (
    <>
      {Thumb}

      <PhotoActionSheet
        visible={menuOpen}
        title={LABEL[kind]}
        onView={() => {
          setMenuOpen(false);
          setViewerOpen(true);
        }}
        onChange={() => {
          setMenuOpen(false);
          launchPicker();
        }}
        onRemove={() => {
          setMenuOpen(false);
          setConfirmRemove(true);
        }}
        onClose={() => setMenuOpen(false)}
      />

      <PhotoViewerModal
        visible={viewerOpen}
        uri={url}
        title={LABEL[kind]}
        shape={shape}
        updatedAt={updatedAt}
        onClose={() => setViewerOpen(false)}
      />

      <ImageCropperModal
        visible={!!cropSource}
        uri={cropSource?.uri ?? null}
        imageWidth={cropSource?.width ?? 1000}
        imageHeight={cropSource?.height ?? 1000}
        aspect={aspect}
        outputWidth={outputWidth}
        onDone={handleCropped}
        onCancel={() => setCropSource(null)}
      />

      <ConfirmDialog
        visible={confirmRemove}
        title={`Remove ${LABEL[kind].toLowerCase()}?`}
        message="This deletes the photo from your profile and from storage. This cannot be undone."
        confirmLabel="Remove"
        destructive
        loading={removing}
        onConfirm={doRemove}
        onCancel={() => setConfirmRemove(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  avatarWrap: { width: 64, height: 64, borderRadius: 32 },
  avatarOverlay: { borderRadius: 32 },
  addBadge: {
    position: 'absolute',
    right: -1,
    bottom: -1,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.crimson,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.cardBg,
  },
  coverWrap: {
    height: 120,
    borderRadius: 12,
    backgroundColor: colors.primary,
    borderWidth: 1,
    borderColor: colors.cardBorderDarker,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverImg: { width: '100%', height: '100%' },
  coverPlaceholder: { alignItems: 'center', gap: 8, paddingHorizontal: 16 },
  coverName: { fontSize: 16, fontWeight: '800', color: colors.white, letterSpacing: 0.3 },
  coverHintRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  coverHint: { fontSize: 11, color: 'rgba(255,255,255,0.75)' },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(11,25,44,0.62)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  pctText: { color: colors.white, fontSize: 10, fontWeight: '800' },
});
