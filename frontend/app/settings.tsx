import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import ConsciousHeader from '@/components/ConsciousHeader';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ARIOME_COLORS, ARIOME_SPACING, ARIOME_BORDERS } from '@/constants/ariomeTheme';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://logohomelink.preview.emergentagent.com/api';

export default function SettingsScreen() {
  const router = useRouter();
  const { user, token, logout } = useAuth();
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotificationSettings();
  }, []);

  const loadNotificationSettings = async () => {
    try {
      const authToken = token || await AsyncStorage.getItem('auth_token');
      if (!authToken) {
        setLoading(false);
        return;
      }
      
      const response = await axios.get(`${API_URL}/auth/settings/notifications`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      setEmailNotifs(response.data.email_notifications ?? true);
      setPushNotifs(response.data.push_notifications ?? true);
      setMarketingEmails(response.data.marketing_emails ?? false);
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateNotificationSetting = async (setting: string, value: boolean) => {
    try {
      const authToken = token || await AsyncStorage.getItem('auth_token');
      await axios.put(
        `${API_URL}/auth/settings/notifications`,
        { [setting]: value },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      Alert.alert('Success', 'Setting updated');
    } catch (error) {
      Alert.alert('Error', 'Failed to update setting');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ConsciousHeader showBack />

      <Text style={styles.pageTitle}>Settings</Text>

      <ScrollView style={styles.scrollView}>
        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <MaterialCommunityIcons name="bell" size={24} color="#14B8A6" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Push Notifications</Text>
                <Text style={styles.settingDesc}>Receive push notifications</Text>
              </View>
            </View>
            <Switch
              value={pushNotifs}
              onValueChange={(value) => {
                setPushNotifs(value);
                updateNotificationSetting('push_notifications', value);
              }}
              trackColor={{ false: '#374151', true: '#14B8A6' }}
              thumbColor="#FFF"
              disabled={loading}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <MaterialCommunityIcons name="email" size={24} color="#14B8A6" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Email Notifications</Text>
                <Text style={styles.settingDesc}>Receive email updates</Text>
              </View>
            </View>
            <Switch
              value={emailNotifs}
              onValueChange={(value) => {
                setEmailNotifs(value);
                updateNotificationSetting('email_notifications', value);
              }}
              trackColor={{ false: '#374151', true: '#14B8A6' }}
              thumbColor="#FFF"
              disabled={loading}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <MaterialCommunityIcons name="email-newsletter" size={24} color="#14B8A6" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Marketing Emails</Text>
                <Text style={styles.settingDesc}>Promotional content and updates</Text>
              </View>
            </View>
            <Switch
              value={marketingEmails}
              onValueChange={(value) => {
                setMarketingEmails(value);
                updateNotificationSetting('marketing_emails', value);
              }}
              trackColor={{ false: '#374151', true: '#14B8A6' }}
              thumbColor="#FFF"
              disabled={loading}
            />
          </View>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => router.push('/edit-profile')}
          >
            <View style={styles.settingLeft}>
              <MaterialCommunityIcons name="account-edit" size={24} color="#14B8A6" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Edit Profile</Text>
                <Text style={styles.settingDesc}>Update your name and bio</Text>
              </View>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#6B7280" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => router.push('/change-password')}
          >
            <View style={styles.settingLeft}>
              <MaterialCommunityIcons name="lock-reset" size={24} color="#14B8A6" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Change Password</Text>
                <Text style={styles.settingDesc}>Update your password</Text>
              </View>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Billing Section - Only for subscribers */}
        {user?.role === 'subscriber' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Billing & Subscription</Text>
            
            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <MaterialCommunityIcons name="credit-card" size={24} color="#14B8A6" />
                <View style={styles.settingText}>
                  <Text style={styles.settingLabel}>Payment Methods</Text>
                  <Text style={styles.settingDesc}>Manage payment methods</Text>
                </View>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#6B7280" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <MaterialCommunityIcons name="receipt" size={24} color="#14B8A6" />
                <View style={styles.settingText}>
                  <Text style={styles.settingLabel}>Billing History</Text>
                  <Text style={styles.settingDesc}>View past transactions</Text>
                </View>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#6B7280" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => Alert.alert('Cancel Subscription', 'Are you sure you want to cancel your subscription?')}
            >
              <View style={styles.settingLeft}>
                <MaterialCommunityIcons name="cancel" size={24} color="#EF4444" />
                <View style={styles.settingText}>
                  <Text style={[styles.settingLabel, { color: '#EF4444' }]}>Cancel Subscription</Text>
                  <Text style={styles.settingDesc}>Access continues until billing period ends</Text>
                </View>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
        )}

        {/* Privacy Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy</Text>
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => router.push('/privacy')}
          >
            <View style={styles.settingLeft}>
              <MaterialCommunityIcons name="shield-account" size={24} color="#14B8A6" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Privacy Policy</Text>
                <Text style={styles.settingDesc}>View our privacy policy</Text>
              </View>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#6B7280" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => router.push('/terms')}
          >
            <View style={styles.settingLeft}>
              <MaterialCommunityIcons name="file-document" size={24} color="#14B8A6" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Terms of Service</Text>
                <Text style={styles.settingDesc}>Read terms and conditions</Text>
              </View>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Support & Feedback Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support & Feedback</Text>
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => router.push('/feedback')}
          >
            <View style={styles.settingLeft}>
              <MaterialCommunityIcons name="message-draw" size={24} color="#F59E0B" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Share Feedback</Text>
                <Text style={styles.settingDesc}>Help us improve ARIOME</Text>
              </View>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#6B7280" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => router.push('/help')}
          >
            <View style={styles.settingLeft}>
              <MaterialCommunityIcons name="help-circle" size={24} color="#14B8A6" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Help Center</Text>
                <Text style={styles.settingDesc}>FAQs and support</Text>
              </View>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#6B7280" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => router.push('/about')}
          >
            <View style={styles.settingLeft}>
              <MaterialCommunityIcons name="information" size={24} color="#14B8A6" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>About ARIOME</Text>
                <Text style={styles.settingDesc}>Learn about our mission</Text>
              </View>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => {
              Alert.alert(
                'Logout',
                'Are you sure you want to logout?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { 
                    text: 'Logout', 
                    style: 'destructive',
                    onPress: async () => {
                      await logout();
                      router.replace('/auth');
                    }
                  }
                ]
              );
            }}
          >
            <View style={styles.settingLeft}>
              <MaterialCommunityIcons name="logout" size={24} color="#F59E0B" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Logout</Text>
                <Text style={styles.settingDesc}>Sign out of your account</Text>
              </View>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#6B7280" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => Alert.alert('Delete Account', 'This action cannot be undone. Are you sure?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Delete', style: 'destructive', onPress: () => {} }
            ])}
          >
            <View style={styles.settingLeft}>
              <MaterialCommunityIcons name="delete" size={24} color="#EF4444" />
              <View style={styles.settingText}>
                <Text style={[styles.settingLabel, { color: '#EF4444' }]}>Delete Account</Text>
                <Text style={styles.settingDesc}>Permanently delete your account</Text>
              </View>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ARIOME_COLORS.background.deep,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '300',
    color: ARIOME_COLORS.text.primary,
    textAlign: 'center',
    marginBottom: ARIOME_SPACING.lg,
    letterSpacing: 1,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: ARIOME_SPACING.xl,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: ARIOME_COLORS.text.primary,
    marginBottom: ARIOME_SPACING.md,
    paddingHorizontal: ARIOME_SPACING.lg,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: ARIOME_COLORS.background.secondary,
    padding: ARIOME_SPACING.md,
    marginHorizontal: ARIOME_SPACING.lg,
    marginBottom: ARIOME_SPACING.sm,
    borderRadius: ARIOME_BORDERS.radiusMedium,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: ARIOME_SPACING.md,
  },
  settingText: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: ARIOME_COLORS.text.primary,
    marginBottom: 2,
  },
  settingDesc: {
    fontSize: 12,
    color: ARIOME_COLORS.text.muted,
  },
});
