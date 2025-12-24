import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import AriomeLogo from '@/components/AriomeLogo';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://meditate-hub-3.preview.emergentagent.com/api';

export default function SettingsScreen() {
  const router = useRouter();
  const { user, token } = useAuth();
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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>

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
          <Text style={styles.sectionTitle}>Danger Zone</Text>
          
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
    backgroundColor: '#0A0A0F',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1F2937',
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 8,
    borderRadius: 12,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 16,
  },
  settingText: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 4,
  },
  settingDesc: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});
