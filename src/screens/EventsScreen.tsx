import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Calendar,
  MapPin,
  Users,
  CheckCircle2,
  Building,
  Sparkles,
} from 'lucide-react-native';
import { colors } from '../theme/colors';
import { useApp } from '../context/AppContext';
import { Header } from '../components/Header';
import { EventsScreenSkeleton } from '../components/SkeletonLoader';

export const EventsScreen: React.FC = () => {
  const { events, toggleRegisterEvent } = useApp();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [registeringId, setRegisteringId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'All' | 'Registered' | 'Annual Conclave' | 'Trade Delegation' | 'Masterclass'>('All');

  useEffect(() => {
    // Simulate backend events schedule fetch
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 850);
    return () => clearTimeout(timer);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 800);
  };

  const handleToggleRegister = (id: string) => {
    setRegisteringId(id);
    setTimeout(() => {
      toggleRegisterEvent(id);
      setRegisteringId(null);
    }, 600);
  };

  const filteredEvents = events.filter(e => {
    if (activeTab === 'Registered') return e.isRegistered;
    if (activeTab === 'Annual Conclave') return e.category === 'Annual Conclave';
    if (activeTab === 'Trade Delegation') return e.category === 'Trade Delegation';
    if (activeTab === 'Masterclass') return e.category === 'Masterclass';
    return true;
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <Header showSearchBar={false} />

      {isLoading ? (
        <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>
          <EventsScreenSkeleton />
        </ScrollView>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.container}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={colors.crimson}
              colors={[colors.crimson, colors.accentBlue]}
            />
          }
        >
          {/* Banner Section */}
          <View style={styles.heroCard}>
            <View style={styles.badgeRow}>
              <Sparkles color={colors.crimson} size={16} />
              <Text style={styles.badgeText}>BENGAL BUSINESS EVENTS</Text>
            </View>
            <Text style={styles.heroTitle}>Events & Business Meets</Text>
            <Text style={styles.heroSubtitle}>
              Industry summits, business exhibitions, international buyer meets, and networking events across Bengal.
            </Text>
          </View>

          {/* Tab Filters */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabScroll}
          >
            {(['All', 'Registered', 'Annual Conclave', 'Trade Delegation', 'Masterclass'] as const).map(tab => {
              const isSelected = activeTab === tab;
              return (
                <TouchableOpacity
                  key={tab}
                  style={[styles.tabBtn, isSelected && styles.tabBtnActive]}
                  onPress={() => setActiveTab(tab)}
                >
                  <Text style={[styles.tabText, isSelected && styles.tabTextActive]}>
                    {tab === 'All' ? 'All Events' : tab === 'Annual Conclave' ? 'Annual Meet' : tab}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Events List */}
          <View style={styles.eventsList}>
            {filteredEvents.map(event => {
              const isRegisteringThis = registeringId === event.id;

              return (
                <View key={event.id} style={styles.eventCard}>
                  {/* Event Banner */}
                  <View style={styles.bannerContainer}>
                    <Image source={{ uri: event.bannerUrl }} style={styles.bannerImage} />
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryBadgeText}>{event.category.toUpperCase()}</Text>
                    </View>
                  </View>

                  {/* Event Content */}
                  <View style={styles.eventContent}>
                    <Text style={styles.eventTitle}>{event.title}</Text>
                    <Text style={styles.eventDescription}>{event.description}</Text>

                    {/* Event Metadata Box */}
                    <View style={styles.metaBox}>
                      <View style={styles.metaRow}>
                        <Calendar color={colors.crimson} size={14} />
                        <Text style={styles.metaText}>{event.date} • {event.time}</Text>
                      </View>

                      <View style={styles.metaRow}>
                        <MapPin color={colors.textSecondary} size={14} />
                        <Text style={styles.metaText} numberOfLines={1}>{event.venue}</Text>
                      </View>
                    </View>

                    {/* Chief Guest / Keynote Speaker */}
                    {event.chiefGuest && (
                      <View style={styles.speakerBox}>
                        <Building color={colors.crimson} size={18} />
                        <View style={styles.speakerInfo}>
                          <Text style={styles.speakerRole}>CHIEF GUEST / SPEAKER</Text>
                          <Text style={styles.speakerName}>{event.chiefGuest}</Text>
                        </View>
                      </View>
                    )}

                    {/* Footer & Registration */}
                    <View style={styles.eventFooter}>
                      <View style={styles.attendeesCount}>
                        <Users color={colors.textSecondary} size={14} />
                        <Text style={styles.attendeesText}>{event.attendeesCount} Registered</Text>
                      </View>

                      <TouchableOpacity
                        style={[styles.regBtn, event.isRegistered && styles.regBtnActive, isRegisteringThis && { opacity: 0.75 }]}
                        onPress={() => handleToggleRegister(event.id)}
                        disabled={isRegisteringThis}
                        activeOpacity={0.8}
                      >
                        {isRegisteringThis ? (
                          <ActivityIndicator size="small" color={event.isRegistered ? colors.textPrimary : colors.white} style={{ transform: [{ scale: 0.8 }] }} />
                        ) : event.isRegistered ? (
                          <>
                            <CheckCircle2 color={colors.emerald} size={15} />
                            <Text style={styles.regTextActive}>Registered</Text>
                          </>
                        ) : (
                          <>
                            <Text style={styles.regText}>Register for Event</Text>
                          </>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>
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
  heroCard: {
    backgroundColor: colors.cardBg,
    margin: 16,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  badgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: colors.crimson,
    letterSpacing: 1,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 12.5,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  tabScroll: {
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 14,
  },
  tabBtn: {
    backgroundColor: colors.cardBg,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  tabBtnActive: {
    backgroundColor: colors.crimson,
    borderColor: colors.crimson,
  },
  tabText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  tabTextActive: {
    color: colors.white,
    fontWeight: '700',
  },
  eventsList: {
    paddingHorizontal: 16,
    paddingBottom: 30,
    gap: 16,
  },
  eventCard: {
    backgroundColor: colors.cardBg,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  bannerContainer: {
    height: 130,
    width: '100%',
    position: 'relative',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.cardBgElevated,
  },
  categoryBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: colors.crimson,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: 0.5,
  },
  eventContent: {
    padding: 16,
  },
  eventTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  eventDescription: {
    fontSize: 12.5,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 12,
  },
  metaBox: {
    backgroundColor: colors.cardBgElevated,
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    gap: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaText: {
    fontSize: 12,
    color: colors.textPrimary,
    flex: 1,
  },
  speakerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBgElevated,
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
    gap: 10,
  },
  speakerInfo: {
    flex: 1,
  },
  speakerRole: {
    fontSize: 8.5,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  speakerName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 1,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    paddingTop: 12,
  },
  attendeesCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  attendeesText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  regBtn: {
    backgroundColor: colors.crimson,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  regBtnActive: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.emeraldLight,
    borderWidth: 1,
    borderColor: colors.emeraldBorder,
    gap: 5,
  },
  regText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.white,
  },
  regTextActive: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.emerald,
  },
});
