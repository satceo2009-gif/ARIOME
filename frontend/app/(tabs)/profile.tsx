import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import ConsciousHeader from '@/components/ConsciousHeader';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      setShowLogoutModal(false);
      router.replace('/auth');
    } catch (error) {
      console.error('Logout error:', error);
      setShowLogoutModal(false);
      router.replace('/auth');
    } finally {
      setLoggingOut(false);
    }
  };

  const getRoleBadge = (role: string) => {
    const badges = {
      explorer: { label: 'Explorer', color: '#14B8A6', icon: 'compass' },
      subscriber: { label: 'Subscriber', color: '#F59E0B', icon: 'crown' },
      creator: { label: 'Creator', color: '#8B5CF6', icon: 'creation' },
      admin: { label: 'Admin', color: '#EF4444', icon: 'shield-account' },
    };
    return badges[role as keyof typeof badges] || badges.explorer;
  };

  const badge = getRoleBadge(user?.role || 'explorer');

  const menuItems = [
    { id: 'settings', label: 'Settings', icon: 'cog', route: '/settings' },
    ...(user?.role === 'admin' ? [{ id: 'admin', label: 'Admin Dashboard', icon: 'shield-account', route: '/admin' }] : []),
    ...(user?.role === 'creator' ? [{ id: 'creator', label: 'Creator Dashboard', icon: 'creation', route: '/creator' }] : []),
    { id: 'help', label: 'Help & Support', icon: 'help-circle', route: '/help' },
    { id: 'about', label: 'About ARIOME', icon: 'information', route: '/about' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ConsciousHeader showSettings />
      
      <ScrollView style={styles.scrollView}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <Image 
            source={{ uri: user?.avatar || 'https://i.pravatar.cc/150' }}
            style={styles.avatar}
          />
          <Text style={styles.name}>{user?.name || 'Guest'}</Text>
          <Text style={styles.email}>{user?.email || ''}</Text>
          
          {/* Role Badge */}
          <View style={[styles.roleBadge, { backgroundColor: `${badge.color}20` }]}>
            <MaterialCommunityIcons name={badge.icon as any} size={16} color={badge.color} />
            <Text style={[styles.roleText, { color: badge.color }]}>{badge.label}</Text>
          </View>

          {/* Profile always accessible */}
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={() => item.route && router.push(item.route as any)}
            >
              <View style={styles.menuItemLeft}>
                <MaterialCommunityIcons name={item.icon as any} size={24} color="#14B8A6" />
                <Text style={styles.menuItemText}>{item.label}</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#6B7280" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={() => setShowLogoutModal(true)} data-testid="logout-btn">
          <MaterialCommunityIcons name="logout" size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>ARIOME v1.0.0</Text>
        </View>
      </ScrollView>

      {/* Logout Confirmation Modal */}
      <Modal visible={showLogoutModal} transparent animationType="fade" onRequestClose={() => setShowLogoutModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <MaterialCommunityIcons name="logout" size={48} color="#EF4444" style={{ marginBottom: 16 }} />
            <Text style={styles.modalTitle}>Logout</Text>
            <Text style={styles.modalText}>Are you sure you want to logout?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={() => setShowLogoutModal(false)}
                data-testid="cancel-logout-btn"
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.confirmLogoutButton} 
                onPress={handleLogout}
                disabled={loggingOut}
                data-testid="confirm-logout-btn"
              >
                <Text style={styles.confirmLogoutText}>{loggingOut ? 'Logging out...' : 'Logout'}</Text>
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
    backgroundColor: '#0A0A0F',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFF',
  },
  profileCard: {
    backgroundColor: '#1F2937',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 16,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  roleText: {
    fontSize: 14,
    fontWeight: '600',
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#14B8A6',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 24,
    marginTop: 16,
    gap: 8,
  },
  loginButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },

  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F59E0B',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 16,
    gap: 8,
  },
  upgradeButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  menuSection: {
    backgroundColor: '#1F2937',
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  menuItemText: {
    fontSize: 16,
    color: '#FFF',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EF4444',
    gap: 8,
    marginBottom: 24,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 32,
  },
  footerText: {
    fontSize: 12,
    color: '#6B7280',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 8,
  },
  modalText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    backgroundColor: '#374151',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  confirmLogoutButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    backgroundColor: '#EF4444',
    alignItems: 'center',
  },
  confirmLogoutText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
