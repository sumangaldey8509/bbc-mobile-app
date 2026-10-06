import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Image,
  TouchableOpacity,
  Pressable,
  Dimensions,
} from 'react-native';
import { X } from 'lucide-react-native';
import { colors } from '../theme/colors';

interface Props {
  visible: boolean;
  uri: string;
  title: string;
  /** Square framing for profile photos; wide for covers. */
  shape?: 'square' | 'wide';
  updatedAt?: string | null;
  onClose: () => void;
}

const { width } = Dimensions.get('window');

const formatStamp = (iso?: string | null) => {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

export const PhotoViewerModal: React.FC<Props> = ({
  visible,
  uri,
  title,
  shape = 'square',
  updatedAt,
  onClose,
}) => {
  const box = Math.min(width - 48, 420);
  const imgStyle =
    shape === 'square'
      ? { width: box, height: box }
      : { width: box, height: Math.round((box * 9) / 16) };
  const stamp = formatStamp(updatedAt);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title} numberOfLines={1}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X color={colors.textPrimary} size={16} />
            </TouchableOpacity>
          </View>

          <View style={styles.imageWrap}>
            <Image source={{ uri }} style={[styles.image, imgStyle]} resizeMode="cover" />
          </View>

          <Text style={styles.stamp}>
            {stamp ? `Uploaded ${stamp}` : 'Upload date unavailable'}
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(11,25,44,0.8)' },
  card: {
    backgroundColor: colors.cardBg,
    borderRadius: 18,
    overflow: 'hidden',
    maxWidth: 460,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  title: { fontSize: 14, fontWeight: '800', color: colors.textPrimary, flex: 1, marginRight: 8 },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.cardBgElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageWrap: { backgroundColor: colors.primary },
  image: {},
  stamp: {
    fontSize: 11.5,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: 12,
    fontWeight: '600',
  },
});
