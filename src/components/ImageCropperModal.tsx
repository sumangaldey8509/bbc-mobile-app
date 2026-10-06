import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Image,
  Animated,
  PanResponder,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { X, Minus, Plus, RotateCcw, Check } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { PickedFile } from '../services/profileApi';

interface Props {
  visible: boolean;
  uri: string | null;
  imageWidth: number;
  imageHeight: number;
  /** Crop frame ratio, e.g. [1,1] for avatar, [16,9] for cover. */
  aspect: [number, number];
  /** Target width of the exported image. */
  outputWidth: number;
  onDone: (file: PickedFile) => void;
  onCancel: () => void;
}

const FRAME_W = Math.min(Dimensions.get('window').width - 40, 380);
const MIN_ZOOM = 1;
const MAX_ZOOM = 4;

export const ImageCropperModal: React.FC<Props> = ({
  visible,
  uri,
  imageWidth,
  imageHeight,
  aspect,
  outputWidth,
  onDone,
  onCancel,
}) => {
  const frameH = FRAME_W * (aspect[1] / aspect[0]);

  const [zoom, setZoom] = useState(1);
  const [processing, setProcessing] = useState(false);

  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const panValue = useRef({ x: 0, y: 0 });
  const boundsRef = useRef({ minX: 0, minY: 0 });

  const { coverScale } = useMemo(() => {
    if (!imageWidth || !imageHeight) return { coverScale: 1 };
    return { coverScale: Math.max(FRAME_W / imageWidth, frameH / imageHeight) };
  }, [imageWidth, imageHeight, frameH]);

  const scale = coverScale * zoom;
  const dispW = imageWidth * scale;
  const dispH = imageHeight * scale;
  boundsRef.current = { minX: FRAME_W - dispW, minY: frameH - dispH };

  useEffect(() => {
    const id = pan.addListener(v => {
      panValue.current = v;
    });
    return () => pan.removeListener(id);
  }, [pan]);

  const clampToBounds = () => {
    const { minX, minY } = boundsRef.current;
    const x = Math.min(0, Math.max(minX, panValue.current.x));
    const y = Math.min(0, Math.max(minY, panValue.current.y));
    Animated.spring(pan, {
      toValue: { x, y },
      useNativeDriver: false,
      speed: 20,
      bounciness: 0,
    }).start();
  };

  // Re-centre when a new image opens.
  useEffect(() => {
    if (visible) {
      setZoom(1);
      pan.setValue({ x: (FRAME_W - dispW) / 2, y: (frameH - dispH) / 2 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, uri]);

  // Re-clamp whenever zoom changes.
  useEffect(() => {
    clampToBounds();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoom]);

  const responder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 2 || Math.abs(g.dy) > 2,
      onPanResponderGrant: () => {
        pan.setOffset({ x: panValue.current.x, y: panValue.current.y });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: () => {
        pan.flattenOffset();
        clampToBounds();
      },
      onPanResponderTerminate: () => {
        pan.flattenOffset();
        clampToBounds();
      },
    })
  ).current;

  const handleCrop = async () => {
    if (!uri || processing) return;
    setProcessing(true);
    try {
      const { x, y } = panValue.current;
      const originX = Math.max(0, Math.round(-x / scale));
      const originY = Math.max(0, Math.round(-y / scale));
      const cropW = Math.min(Math.round(FRAME_W / scale), imageWidth - originX);
      const cropH = Math.min(Math.round(frameH / scale), imageHeight - originY);

      const result = await manipulateAsync(
        uri,
        [
          { crop: { originX, originY, width: cropW, height: cropH } },
          { resize: { width: outputWidth } },
        ],
        { compress: 0.85, format: SaveFormat.JPEG }
      );

      onDone({ uri: result.uri, name: 'photo.jpg', type: 'image/jpeg' });
    } catch {
      // Fall back to the un-cropped image so the member is never stuck.
      onDone({ uri, name: 'photo.jpg', type: 'image/jpeg' });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.root}>
        <View style={styles.header}>
          <Text style={styles.title}>Crop photo</Text>
          <TouchableOpacity onPress={onCancel} disabled={processing} style={styles.closeBtn}>
            <X color={colors.white} size={18} />
          </TouchableOpacity>
        </View>

        <Text style={styles.hint}>Drag to reposition · use − / + to zoom</Text>

        <View style={styles.frameArea}>
          <View
            style={[styles.frame, { width: FRAME_W, height: frameH }]}
            {...responder.panHandlers}
          >
            {uri && (
              <Animated.Image
                source={{ uri }}
                style={{
                  position: 'absolute',
                  width: dispW,
                  height: dispH,
                  transform: [{ translateX: pan.x }, { translateY: pan.y }],
                }}
                resizeMode="cover"
              />
            )}
            <View pointerEvents="none" style={styles.grid} />
          </View>
        </View>

        <View style={styles.zoomRow}>
          <TouchableOpacity
            style={styles.zoomBtn}
            onPress={() => setZoom(z => Math.max(MIN_ZOOM, +(z - 0.5).toFixed(2)))}
          >
            <Minus color={colors.white} size={18} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.zoomBtn}
            onPress={() => {
              setZoom(1);
              pan.setValue({ x: (FRAME_W - dispW) / 2, y: (frameH - dispH) / 2 });
            }}
          >
            <RotateCcw color={colors.white} size={16} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.zoomBtn}
            onPress={() => setZoom(z => Math.min(MAX_ZOOM, +(z + 0.5).toFixed(2)))}
          >
            <Plus color={colors.white} size={18} />
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.cancelBtn} onPress={onCancel} disabled={processing}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.doneBtn, processing && styles.btnDisabled]}
            onPress={handleCrop}
            disabled={processing}
          >
            {processing ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <>
                <Check color={colors.white} size={16} />
                <Text style={styles.doneText}>Crop &amp; use</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: 'rgba(8,18,32,0.97)', paddingTop: 44 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingBottom: 6,
  },
  title: { fontSize: 15, fontWeight: '800', color: colors.white },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hint: {
    fontSize: 11.5,
    color: 'rgba(255,255,255,0.65)',
    textAlign: 'center',
    marginTop: 4,
  },
  frameArea: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  frame: {
    overflow: 'hidden',
    backgroundColor: '#000',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.9)',
  },
  grid: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderColor: 'rgba(255,255,255,0.25)',
    borderWidth: 0,
  },
  zoomRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 14,
    paddingVertical: 14,
  },
  zoomBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 18,
    paddingBottom: 34,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  cancelText: { color: colors.white, fontWeight: '800', fontSize: 13.5 },
  doneBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.crimson,
  },
  doneText: { color: colors.white, fontWeight: '800', fontSize: 13.5 },
  btnDisabled: { opacity: 0.6 },
});
