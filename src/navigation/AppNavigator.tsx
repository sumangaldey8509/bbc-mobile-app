import React, { useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Home, Users, Search, Briefcase, MessageSquare } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { useApp } from '../context/AppContext';

import { HomeScreen } from '../screens/HomeScreen';
import { CommunityScreen } from '../screens/CommunityScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { BusinessDeskScreen } from '../screens/BusinessDeskScreen';
import { MessagesScreen } from '../screens/MessagesScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { MeetingSummaryScreen } from '../screens/MeetingSummaryScreen';
import { EventsScreen } from '../screens/EventsScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { SignUpScreen } from '../screens/SignUpScreen';
import { ForgotPasswordScreen } from '../screens/ForgotPasswordScreen';
import { VerifyEmailScreen } from '../screens/VerifyEmailScreen';
import { ProfileSetupScreen } from '../screens/ProfileSetupScreen';
import { CustomSplashScreen } from '../screens/CustomSplashScreen';
import { AdminConsoleScreen } from '../screens/admin/AdminConsoleScreen';

import { StoryViewerModal } from '../components/StoryViewerModal';
import { DigitalBusinessCardModal } from '../components/DigitalBusinessCardModal';
import { LogOneToOneModal } from '../components/LogOneToOneModal';
import { GiveReferralModal } from '../components/GiveReferralModal';
import { RecordDealModal } from '../components/RecordDealModal';
import { PostCreationModal } from '../components/PostCreationModal';
import { CommentsModal } from '../components/CommentsModal';
import { RequestAdminAccessModal } from '../components/RequestAdminAccessModal';
import { NotificationsModal } from '../components/NotificationsModal';
import { DrawerModal } from '../components/DrawerModal';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
export const navigationRef = createNavigationContainerRef();

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.crimson,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Community"
        component={CommunityScreen}
        options={{
          tabBarLabel: 'Chapters',
          tabBarIcon: ({ color, size }) => <Users color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          tabBarLabel: 'Directory',
          tabBarIcon: ({ color, size }) => <Search color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="BusinessDesk"
        component={BusinessDeskScreen}
        options={{
          tabBarLabel: 'Deals & Referrals',
          tabBarIcon: ({ color, size }) => <Briefcase color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Messages"
        component={MessagesScreen}
        options={{
          tabBarLabel: 'Messages',
          tabBarIcon: ({ color, size }) => <MessageSquare color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
};

export const AppNavigator: React.FC = () => {
  const { isAuthenticated, isBootstrappingAuth, isAdmin, isProfileApproved } = useApp();
  const [isSplashVisible, setIsSplashVisible] = useState(true);

  const handleDrawerNavigate = (screenName: string) => {
    if (navigationRef.isReady()) {
      if (screenName === 'Home') {
        (navigationRef.navigate as any)('MainTabs', { screen: 'Home' });
      } else {
        (navigationRef.navigate as any)(screenName);
      }
    }
  };

  if (isSplashVisible || isBootstrappingAuth) {
    return <CustomSplashScreen onFinish={() => setIsSplashVisible(false)} />;
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <View style={styles.rootContainer}>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            animation: 'fade_from_bottom',
          }}
        >
          {isAuthenticated && isProfileApproved ? (
            <Stack.Group>
              <Stack.Screen name="MainTabs" component={MainTabs} />
              <Stack.Screen name="Profile" component={ProfileScreen} />
              <Stack.Screen name="MeetingSummary" component={MeetingSummaryScreen} />
              <Stack.Screen name="Events" component={EventsScreen} />
              {isAdmin && (
                <Stack.Screen name="AdminConsole" component={AdminConsoleScreen} />
              )}
            </Stack.Group>
          ) : isAuthenticated ? (
            <Stack.Group>
              {/* Profile-details gate: no app access until an admin approves. */}
              <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
            </Stack.Group>
          ) : (
            <Stack.Group>
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="SignUp" component={SignUpScreen} />
              <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
              <Stack.Screen name="VerifyEmail" component={VerifyEmailScreen} />
            </Stack.Group>
          )}
        </Stack.Navigator>

        {/* Global Modals */}
        {isAuthenticated && isProfileApproved && (
          <>
            <StoryViewerModal />
            <DigitalBusinessCardModal />
            <LogOneToOneModal />
            <GiveReferralModal />
            <RecordDealModal />
            <PostCreationModal />
            <CommentsModal />
            <RequestAdminAccessModal />
            <NotificationsModal />
            <DrawerModal onNavigate={handleDrawerNavigate} />
          </>
        )}
      </View>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  tabBar: {
    backgroundColor: colors.cardBg,
    borderTopColor: colors.cardBorder,
    borderTopWidth: 1,
    height: Platform.OS === 'ios' ? 84 : 64,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    paddingTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 8,
  },
  tabBarLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    marginTop: 2,
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
    borderRadius: 8,
  },
  activeIconWrapper: {
    backgroundColor: colors.crimsonLight,
  },
});
