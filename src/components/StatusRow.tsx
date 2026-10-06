import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Plus } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { useApp } from '../context/AppContext';

export const StatusRow: React.FC = () => {
  const { currentUser, stories, openStory, openCreatePost } = useApp();

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>MEMBER HIGHLIGHTS & STATUS</Text>
        <Text style={styles.liveIndicator}>● LIVE</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollList}
      >
        {/* Current User Add Status */}
        <TouchableOpacity
          style={styles.statusItem}
          onPress={openCreatePost}
          activeOpacity={0.8}
        >
          <View style={styles.myAvatarWrapper}>
            <Image source={{ uri: currentUser.avatar }} style={styles.avatarImage} />
            <View style={styles.addBadge}>
              <Plus color={colors.white} size={14} strokeWidth={3} />
            </View>
          </View>
          <Text style={styles.statusAuthorName} numberOfLines={1}>
            Post Update
          </Text>
          <Text style={styles.companySubtext} numberOfLines={1}>
            My Company
          </Text>
        </TouchableOpacity>

        {/* Member Statuses */}
        {stories.map(story => {
          const ringColor = story.viewed ? colors.cardBorder : (story.accentColor || colors.crimson);

          return (
            <TouchableOpacity
              key={story.id}
              style={styles.statusItem}
              onPress={() => openStory(story)}
              activeOpacity={0.8}
            >
              <View style={[styles.avatarRing, { borderColor: ringColor }]}>
                <Image source={{ uri: story.userAvatar }} style={styles.avatarImage} />
                {!story.viewed && (
                  <View style={[styles.tagMiniBadge, { backgroundColor: story.accentColor || colors.crimson }]}>
                    <Text style={styles.tagMiniText}>
                      {story.tag === 'Milestone' ? '★' : story.tag === 'Requirement' ? 'RFQ' : '•'}
                    </Text>
                  </View>
                )}
              </View>
              <Text style={styles.statusAuthorName} numberOfLines={1}>
                {story.userName.split(' ')[0]}
              </Text>
              <Text style={styles.companySubtext} numberOfLines={1}>
                {story.companyName}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.cardBg,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.8,
  },
  liveIndicator: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.emerald,
    letterSpacing: 0.5,
  },
  scrollList: {
    paddingHorizontal: 14,
    gap: 14,
  },
  statusItem: {
    alignItems: 'center',
    width: 72,
  },
  myAvatarWrapper: {
    width: 62,
    height: 62,
    borderRadius: 31,
    borderWidth: 2,
    borderColor: colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 5,
  },
  avatarRing: {
    width: 62,
    height: 62,
    borderRadius: 31,
    borderWidth: 2.5,
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 5,
  },
  avatarImage: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.cardBgElevated,
  },
  addBadge: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.crimson,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.white,
  },
  tagMiniBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.white,
  },
  tagMiniText: {
    color: colors.white,
    fontSize: 8,
    fontWeight: '800',
  },
  statusAuthorName: {
    color: colors.textPrimary,
    fontSize: 11.5,
    fontWeight: '700',
    textAlign: 'center',
  },
  companySubtext: {
    color: colors.textSecondary,
    fontSize: 9.5,
    textAlign: 'center',
    marginTop: 1,
  },
});
