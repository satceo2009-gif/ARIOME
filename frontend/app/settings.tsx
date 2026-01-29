import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch, Alert, ActivityIndicator, Modal, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/contexts/AuthContext';
import ConsciousHeader from '@/components/ConsciousHeader';
import api from '@/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ARIOME_COLORS, ARIOME_SPACING, ARIOME_BORDERS } from '@/constants/theme';

export default function SettingsScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  
  // Notification settings
  const [pushNotifs, setPushNotifs] = useState(true);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [reminderNotifs, setReminderNotifs] = useState(true);
  const [communityNotifs, setCommunityNotifs] = useState(true);
  
  // Privacy settings
  const [anonymousJournal, setAnonymousJournal] = useState(false);
  const [shareProgress, setShareProgress] = useState(true);
  const [showInCircles, setShowInCircles] = useState(true);
  
  // Appearance
  const [darkMode, setDarkMode] = useState(true);
  
  // Modals
  const [showExportModal, setShowExportModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('user_settings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        setPushNotifs(settings.pushNotifs ?? true);
        setEmailNotifs(settings.emailNotifs ?? true);
        setReminderNotifs(settings.reminderNotifs ?? true);
        setCommunityNotifs(settings.communityNotifs ?? true);
        setAnonymousJournal(settings.anonymousJournal ?? false);
        setShareProgress(settings.shareProgress ?? true);
        setShowInCircles(settings.showInCircles ?? true);
        setDarkMode(settings.darkMode ?? true);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const saveSetting = async (key: string, value: boolean) => {
    try {
      const savedSettings = await AsyncStorage.getItem('user_settings');
      const settings = savedSettings ? JSON.parse(savedSettings) : {};
      settings[key] = value;
      await AsyncStorage.setItem('user_settings', JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save setting:', error);
    }
  };

  const handleExportData = async () => {
    setExporting(true);
    try {
      const response = await api.get('/auth/export-data');
      // In a real app, this would trigger a download
      Alert.alert(
        'Export Ready',
        'Your data export has been prepared. Check your email for the download link.',
        [{ text: 'OK', onPress: () => setShowExportModal(false) }]
      );
    } catch (error) {
      Alert.alert('Export Failed', 'Unable to export data. Please try again later.');
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      Alert.alert('Error', 'Please type DELETE to confirm');
      return;
    }
    
    setDeleting(true);
    try {
      await api.delete('/auth/account');
      Alert.alert('Account Deleted', 'Your account has been permanently deleted.', [
        { text: 'OK', onPress: () => { logout(); router.replace('/'); } }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to delete account. Please contact support.');
    } finally {
      setDeleting(false);
    }
  };

  const SettingToggle = ({ 
    icon, 
    label, 
    description, 
    value, 
    onValueChange, 
    settingKey 
  }: { 
    icon: string; 
    label: string; 
    description: string; 
    value: boolean; 
    onValueChange: (val: boolean) => void;
    settingKey: string;
  }) => (
    <View style={styles.settingItem}>
      <View style={styles.settingLeft}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name={icon as any} size={22} color={ARIOME_COLORS.consciousness.teal} />
        </View>
        <View style={styles.settingText}>
          <Text style={styles.settingLabel}>{label}</Text>
          <Text style={styles.settingDesc}>{description}</Text>
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={(val) => {
          onValueChange(val);
          saveSetting(settingKey, val);
        }}
        trackColor={{ false: ARIOME_COLORS.background.elevated, true: ARIOME_COLORS.consciousness.tealMuted }}
        thumbColor={value ? ARIOME_COLORS.consciousness.teal : ARIOME_COLORS.text.muted}
      />
    </View>
  );

  const SettingLink = ({ 
    icon, 
    label, 
    description, 
    onPress,
    danger = false 
  }: { 
    icon: string; 
    label: string; 
    description: string; 
    onPress: () => void;
    danger?: boolean;
  }) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingLeft}>
        <View style={[styles.iconContainer, danger && styles.dangerIcon]}>
          <MaterialCommunityIcons 
            name={icon as any} 
            size={22} 
            color={danger ? ARIOME_COLORS.semantic.error : ARIOME_COLORS.consciousness.teal} 
          />
        </View>
        <View style={styles.settingText}>
          <Text style={[styles.settingLabel, danger && styles.dangerText]}>{label}</Text>
          <Text style={styles.settingDesc}>{description}</Text>
        </View>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={24} color={ARIOME_COLORS.text.muted} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ConsciousHeader showBack />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>Settings</Text>

        {/* Notifications Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="bell-outline" size={20} color={ARIOME_COLORS.consciousness.teal} />
            <Text style={styles.sectionTitle}>Notifications</Text>
          </View>
          
          <View style={styles.card}>
            <SettingToggle
              icon="bell-ring-outline"
              label="Push Notifications"
              description="Daily reminders and updates"
              value={pushNotifs}
              onValueChange={setPushNotifs}
              settingKey="pushNotifs"
            />
            <SettingToggle
              icon="email-outline"
              label="Email Notifications"
              description="Weekly summaries and insights"
              value={emailNotifs}
              onValueChange={setEmailNotifs}
              settingKey="emailNotifs"
            />
            <SettingToggle
              icon="clock-outline"
              label="Mindful Reminders"
              description="Gentle nudges to reflect"
              value={reminderNotifs}
              onValueChange={setReminderNotifs}
              settingKey="reminderNotifs"
            />
            <SettingToggle
              icon="account-group-outline"
              label="Community Updates"
              description="Circle activity and responses"
              value={communityNotifs}
              onValueChange={setCommunityNotifs}
              settingKey="communityNotifs"
            />
          </View>
        </View>

        {/* Privacy Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="shield-lock-outline" size={20} color={ARIOME_COLORS.accent.lavender} />
            <Text style={styles.sectionTitle}>Privacy</Text>
          </View>
          
          <View style={styles.card}>
            <SettingToggle
              icon="incognito"
              label="Anonymous Journaling"
              description="Hide your identity in shared reflections"
              value={anonymousJournal}
              onValueChange={setAnonymousJournal}
              settingKey="anonymousJournal"
            />
            <SettingToggle
              icon="chart-line"
              label="Share Progress"
              description="Allow others to see your journey stats"
              value={shareProgress}
              onValueChange={setShareProgress}
              settingKey="shareProgress"
            />
            <SettingToggle
              icon="eye-outline"
              label="Visible in Circles"
              description="Show your profile in circle member lists"
              value={showInCircles}
              onValueChange={setShowInCircles}
              settingKey="showInCircles"
            />
          </View>
        </View>

        {/* Appearance Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="palette-outline" size={20} color={ARIOME_COLORS.accent.amber} />
            <Text style={styles.sectionTitle}>Appearance</Text>
          </View>
          
          <View style={styles.card}>
            <SettingToggle
              icon="weather-night"
              label="Dark Mode"
              description="Easier on the eyes, better for reflection"
              value={darkMode}
              onValueChange={setDarkMode}
              settingKey="darkMode"
            />
          </View>
        </View>

        {/* Data & Account Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="database-outline" size={20} color={ARIOME_COLORS.accent.sage} />
            <Text style={styles.sectionTitle}>Data & Account</Text>
          </View>
          
          <View style={styles.card}>
            <SettingLink
              icon="download-outline"
              label="Export My Data"
              description="Download all your reflections and data"
              onPress={() => setShowExportModal(true)}
            />
            <SettingLink
              icon="trash-can-outline"
              label="Delete Account"
              description="Permanently remove your account and data"
              onPress={() => setShowDeleteModal(true)}
              danger
            />
          </View>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="help-circle-outline" size={20} color={ARIOME_COLORS.consciousness.teal} />
            <Text style={styles.sectionTitle}>Support</Text>
          </View>
          
          <View style={styles.card}>
            <SettingLink
              icon="help-circle-outline"
              label="Help Center"
              description="FAQs and guides"
              onPress={() => router.push('/help')}
            />
            <SettingLink
              icon="file-document-outline"
              label="Privacy Policy"
              description="How we protect your data"
              onPress={() => router.push('/privacy')}
            />
            <SettingLink
              icon="file-certificate-outline"
              label="Terms of Service"
              description="Usage guidelines"
              onPress={() => router.push('/terms')}
            />
            <SettingLink
              icon="information-outline"
              label="About AriOme"
              description="Version and credits"
              onPress={() => router.push('/about')}
            />
          </View>
        </View>

        {/* Admin/Creator Access */}
        {(user?.role === 'admin' || user?.role === 'creator') && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="crown-outline" size={20} color={ARIOME_COLORS.accent.gold} />
              <Text style={styles.sectionTitle}>Creator Tools</Text>
            </View>
            
            <View style={styles.card}>
              {user?.role === 'creator' && (
                <SettingLink
                  icon="pencil-outline"
                  label="Creator Dashboard"
                  description="Manage your content"
                  onPress={() => router.push('/creator-dashboard')}
                />
              )}
              {user?.role === 'admin' && (
                <SettingLink
                  icon="shield-crown-outline"
                  label="Admin Dashboard"
                  description="Platform management"
                  onPress={() => router.push('/admin-dashboard')}
                />
              )}
            </View>
          </View>
        )}

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <MaterialCommunityIcons name="logout" size={20} color={ARIOME_COLORS.semantic.error} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>AriOme v1.0.0</Text>
          <Text style={styles.footerText}>Made with 💚 for conscious living</Text>
        </View>
      </ScrollView>

      {/* Export Data Modal */}
      <Modal visible={showExportModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <MaterialCommunityIcons name="download-circle-outline" size={48} color={ARIOME_COLORS.consciousness.teal} />
            <Text style={styles.modalTitle}>Export Your Data</Text>
            <Text style={styles.modalDescription}>
              We'll prepare a complete export of your reflections, bookmarks, and settings. 
              You'll receive a download link via email.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.modalCancelButton} 
                onPress={() => setShowExportModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.modalConfirmButton} 
                onPress={handleExportData}
                disabled={exporting}
              >
                {exporting ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.modalConfirmText}>Export Data</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Account Modal */}
      <Modal visible={showDeleteModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <MaterialCommunityIcons name="alert-circle-outline" size={48} color={ARIOME_COLORS.semantic.error} />
            <Text style={styles.modalTitle}>Delete Account</Text>
            <Text style={styles.modalDescription}>
              This action is permanent and cannot be undone. All your reflections, 
              bookmarks, and data will be permanently deleted.
            </Text>
            <Text style={styles.confirmLabel}>Type DELETE to confirm:</Text>
            <TextInput
              style={styles.confirmInput}
              value={deleteConfirmText}
              onChangeText={setDeleteConfirmText}
              placeholder="DELETE"
              placeholderTextColor={ARIOME_COLORS.text.subtle}
              autoCapitalize="characters"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.modalCancelButton} 
                onPress={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmText('');
                }}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalConfirmButton, styles.deleteButton]} 
                onPress={handleDeleteAccount}
                disabled={deleting || deleteConfirmText !== 'DELETE'}
              >
                {deleting ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.modalConfirmText}>Delete Forever</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ARIOME_COLORS.background.deep,
  },
  scrollView: {
    flex: 1,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '300',
    color: ARIOME_COLORS.text.primary,
    paddingHorizontal: ARIOME_SPACING.lg,
    paddingVertical: ARIOME_SPACING.md,
  },
  section: {
    marginBottom: ARIOME_SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: ARIOME_SPACING.lg,
    marginBottom: ARIOME_SPACING.sm,
    gap: ARIOME_SPACING.sm,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: ARIOME_COLORS.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  card: {
    backgroundColor: ARIOME_COLORS.background.card,
    marginHorizontal: ARIOME_SPACING.lg,
    borderRadius: ARIOME_BORDERS.radiusLarge,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: ARIOME_SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: ARIOME_COLORS.background.elevated,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: ARIOME_SPACING.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: ARIOME_BORDERS.radiusMedium,
    backgroundColor: ARIOME_COLORS.consciousness.tealMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dangerIcon: {
    backgroundColor: ARIOME_COLORS.semantic.error + '20',
  },
  settingText: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: ARIOME_COLORS.text.primary,
  },
  dangerText: {
    color: ARIOME_COLORS.semantic.error,
  },
  settingDesc: {
    fontSize: 13,
    color: ARIOME_COLORS.text.muted,
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: ARIOME_SPACING.lg,
    marginTop: ARIOME_SPACING.lg,
    padding: ARIOME_SPACING.md,
    borderRadius: ARIOME_BORDERS.radiusMedium,
    backgroundColor: ARIOME_COLORS.semantic.error + '15',
    gap: ARIOME_SPACING.sm,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: ARIOME_COLORS.semantic.error,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: ARIOME_SPACING.xl,
    gap: ARIOME_SPACING.xs,
  },
  footerText: {
    fontSize: 12,
    color: ARIOME_COLORS.text.subtle,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: ARIOME_SPACING.lg,
  },
  modalContent: {
    backgroundColor: ARIOME_COLORS.background.secondary,
    borderRadius: ARIOME_BORDERS.radiusXL,
    padding: ARIOME_SPACING.xl,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: ARIOME_COLORS.text.primary,
    marginTop: ARIOME_SPACING.md,
  },
  modalDescription: {
    fontSize: 14,
    color: ARIOME_COLORS.text.muted,
    textAlign: 'center',
    marginTop: ARIOME_SPACING.sm,
    lineHeight: 20,
  },
  confirmLabel: {
    fontSize: 14,
    color: ARIOME_COLORS.text.secondary,
    marginTop: ARIOME_SPACING.lg,
  },
  confirmInput: {
    backgroundColor: ARIOME_COLORS.background.deep,
    borderRadius: ARIOME_BORDERS.radiusMedium,
    padding: ARIOME_SPACING.md,
    fontSize: 16,
    color: ARIOME_COLORS.text.primary,
    width: '100%',
    textAlign: 'center',
    marginTop: ARIOME_SPACING.sm,
    letterSpacing: 4,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: ARIOME_SPACING.md,
    marginTop: ARIOME_SPACING.xl,
    width: '100%',
  },
  modalCancelButton: {
    flex: 1,
    padding: ARIOME_SPACING.md,
    borderRadius: ARIOME_BORDERS.radiusMedium,
    backgroundColor: ARIOME_COLORS.background.elevated,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: ARIOME_COLORS.text.secondary,
  },
  modalConfirmButton: {
    flex: 1,
    padding: ARIOME_SPACING.md,
    borderRadius: ARIOME_BORDERS.radiusMedium,
    backgroundColor: ARIOME_COLORS.consciousness.teal,
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: ARIOME_COLORS.semantic.error,
  },
  modalConfirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
});
