import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Linking,
  Modal,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { useAuthStore } from '../store';
import { usersApi } from '../api';
import { useTranslation, useLanguage } from '../i18n';

const MenuItem = ({ icon, label, value, onPress, isLink, disabled }) => (
  <TouchableOpacity style={[styles.menuItem, disabled && styles.menuItemDisabled]} onPress={onPress} disabled={disabled}>
    <View style={styles.menuItemLeft}>
      {icon && <Ionicons name={icon} size={22} color={disabled ? 'rgba(255,255,255,0.4)' : isLink ? Colors.primary : Colors.white} />}
      <Text style={[styles.menuText, isLink && styles.menuTextLink, disabled && styles.menuTextDisabled]}>{label}</Text>
    </View>
    {value ? (
      <Text style={[styles.menuValue, disabled && styles.menuValueDisabled]}>{value}</Text>
    ) : (
      <Ionicons name="chevron-forward" size={20} color={disabled ? 'rgba(255,255,255,0.4)' : Colors.white} />
    )}
  </TouchableOpacity>
);

// Confirmation Modal Component
const ConfirmModal = ({ visible, title, onClose, onConfirm, confirmText, cancelText, isDanger = false }) => (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
    <View style={styles.modalOverlay}>
      <View style={styles.modalBox}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{title}</Text>
          <TouchableOpacity style={styles.modalClose} onPress={onClose}>
            <Ionicons name="close" size={18} color={Colors.white} />
          </TouchableOpacity>
        </View>
        <View style={styles.modalDivider} />
        <View style={styles.modalButtons}>
          <TouchableOpacity style={styles.modalButtonNo} onPress={onClose}>
            <Text style={styles.modalButtonNoText}>{cancelText}</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.modalButtonYes, isDanger && styles.modalButtonDanger]} 
            onPress={onConfirm}
          >
            <Text style={styles.modalButtonYesText}>{confirmText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

export const ProfileScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const { language, availableLanguages } = useLanguage();
  const { user, logout, isPremium, subscription, avatarUri, cancelSubscription, restoreSubscription } = useAuthStore();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCancelSubModal, setShowCancelSubModal] = useState(false);
  const [showRestoreSubModal, setShowRestoreSubModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  const currentLanguage = availableLanguages.find(l => l.code === language);

  const handleLogout = () => {
    setShowLogoutModal(false);
    logout();
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await usersApi.deleteAccount();
      setShowDeleteModal(false);
      logout();
    } catch (error) {
      const message = error.response?.data?.message || t('errors.serverError');
      Alert.alert(t('common.error'), message);
      setIsDeleting(false);
    }
  };

  const handleSupport = () => {
    Linking.openURL('mailto:supportbodyanddry@gmail.com');
  };

  const handleCancelSubscription = async () => {
    setIsCanceling(true);
    try {
      const success = await cancelSubscription();
      setShowCancelSubModal(false);
      if (success) {
        Alert.alert(
          t('profile.subscriptionCanceled'),
          subscription?.currentPeriodEnd
            ? t('profile.activeUntil', { date: formatDate(subscription.currentPeriodEnd) })
            : ''
        );
      } else {
        Alert.alert(t('common.error'), t('errors.serverError'));
      }
    } catch (error) {
      Alert.alert(t('common.error'), t('errors.serverError'));
    } finally {
      setIsCanceling(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1).toString().padStart(2, '0')}.${d.getFullYear()}`;
  };

  const getSubscriptionValue = () => {
    if (!isPremium) return undefined;
    if (subscription?.status === 'CANCELED' && subscription?.currentPeriodEnd) {
      return `BodyPro (${t('profile.until')} ${formatDate(subscription.currentPeriodEnd)})`;
    }
    return 'BodyPro ✓';
  };

  const handleSubscriptionPress = () => {
    if (isPremium && subscription?.status === 'CANCELED') {
      setShowRestoreSubModal(true);
    } else if (isPremium && subscription?.status !== 'CANCELED') {
      setShowCancelSubModal(true);
    } else {
      navigation.navigate('Payment');
    }
  };

  const handleRestoreSubscription = async () => {
    setIsRestoring(true);
    try {
      const success = await restoreSubscription();
      setShowRestoreSubModal(false);
      if (success) {
        Alert.alert(
          t('profile.subscriptionRestored'),
          t('profile.subscriptionRestoredInfo')
        );
      } else {
        Alert.alert(t('common.error'), t('errors.serverError'));
      }
    } catch (error) {
      Alert.alert(t('common.error'), t('errors.serverError'));
    } finally {
      setIsRestoring(false);
    }
  };

  const handlePrivacyPolicy = () => {
    navigation.navigate('PrivacyPolicy');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color={Colors.white} />
          </TouchableOpacity>
          <Text style={styles.title}>{t('profile.title')}</Text>
          <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate('EditProfile')}>
            <Ionicons name="create-outline" size={22} color={Colors.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.profileSection}>
          <View style={styles.profileHeader}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {user?.email?.charAt(0)?.toUpperCase() || 'U'}
                </Text>
              </View>
            )}
            <Text style={styles.profileName}>{user?.profile?.name || user?.email || 'User'}</Text>
          </View>

          <View style={styles.menuList}>
            <MenuItem 
              label={t('profile.language')} 
              value={`${currentLanguage?.flag} ${currentLanguage?.name}`}
              onPress={() => navigation.navigate('Language')} 
            />
            <View style={styles.divider} />

            <MenuItem 
              icon="flag-outline" 
              label={t('goals.title')} 
              onPress={() => navigation.navigate('Goals')} 
            />
            <View style={styles.divider} />

            <MenuItem 
              icon="card-outline" 
              label={t('profile.subscription')} 
              value={getSubscriptionValue()}
              onPress={handleSubscriptionPress} 
            />
            <View style={styles.divider} />

            <MenuItem 
              icon="lock-closed-outline" 
              label={t('auth.changePassword')} 
              onPress={() => navigation.navigate('ChangePassword')} 
            />
            <View style={styles.divider} />

            <MenuItem 
              icon="notifications-outline" 
              label={t('notifications.title')} 
              onPress={() => navigation.navigate('NotificationSettings')} 
            />
            <View style={styles.divider} />

            <MenuItem 
              icon="shield-outline" 
              label={t('profile.privacyPolicy')} 
              onPress={handlePrivacyPolicy} 
            />
            <View style={styles.divider} />

            <MenuItem
              icon="mail-outline"
              label={t('profile.support')}
              onPress={handleSupport}
              isLink
            />
            <View style={styles.divider} />

            <TouchableOpacity onPress={() => setShowDeleteModal(true)}>
              <Text style={styles.deleteLink}>{t('profile.deleteAccount')}?</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.logoutButton} onPress={() => setShowLogoutModal(true)}>
            <Text style={styles.logoutButtonText}>{t('auth.logout')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Logout Modal */}
      <ConfirmModal
        visible={showLogoutModal}
        title={t('profile.logoutConfirm')}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
        confirmText={t('common.yes')}
        cancelText={t('common.no')}
      />

      {/* Delete Account Modal */}
      <Modal visible={showDeleteModal} transparent animationType="fade" onRequestClose={() => !isDeleting && setShowDeleteModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('profile.deleteAccount')}?</Text>
              <TouchableOpacity style={styles.modalClose} onPress={() => !isDeleting && setShowDeleteModal(false)} disabled={isDeleting}>
                <Ionicons name="close" size={18} color={Colors.white} />
              </TouchableOpacity>
            </View>
            <View style={styles.modalDivider} />
            <Text style={styles.modalWarning}>
              {t('profile.deleteAccountConfirm')}
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalButtonNo} onPress={() => setShowDeleteModal(false)} disabled={isDeleting}>
                <Text style={styles.modalButtonNoText}>{t('common.no')}</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButtonYes, styles.modalButtonDanger]} 
                onPress={handleDeleteAccount}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <ActivityIndicator size="small" color={Colors.dark} />
                ) : (
                  <Text style={styles.modalButtonYesText}>{t('common.delete')}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Cancel Subscription Modal */}
      <Modal visible={showCancelSubModal} transparent animationType="fade" onRequestClose={() => !isCanceling && setShowCancelSubModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('profile.cancelSubscription')}</Text>
              <TouchableOpacity style={styles.modalClose} onPress={() => !isCanceling && setShowCancelSubModal(false)} disabled={isCanceling}>
                <Ionicons name="close" size={18} color={Colors.white} />
              </TouchableOpacity>
            </View>
            <View style={styles.modalDivider} />
            <Text style={styles.modalWarning}>
              {subscription?.currentPeriodEnd 
                ? t('profile.cancelSubscriptionConfirm', { date: formatDate(subscription.currentPeriodEnd) })
                : t('profile.cancelSubscriptionConfirmGeneric')
              }
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalButtonNo} onPress={() => setShowCancelSubModal(false)} disabled={isCanceling}>
                <Text style={styles.modalButtonNoText}>{t('common.no')}</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButtonYes, styles.modalButtonDanger]} 
                onPress={handleCancelSubscription}
                disabled={isCanceling}
              >
                {isCanceling ? (
                  <ActivityIndicator size="small" color={Colors.dark} />
                ) : (
                  <Text style={styles.modalButtonYesText}>{t('common.yes')}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Restore Subscription Modal */}
      <Modal visible={showRestoreSubModal} transparent animationType="fade" onRequestClose={() => !isRestoring && setShowRestoreSubModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('profile.restoreSubscription')}</Text>
              <TouchableOpacity style={styles.modalClose} onPress={() => !isRestoring && setShowRestoreSubModal(false)} disabled={isRestoring}>
                <Ionicons name="close" size={18} color={Colors.white} />
              </TouchableOpacity>
            </View>
            <View style={styles.modalDivider} />
            <Text style={styles.modalWarning}>
              {t('profile.restoreSubscriptionConfirm')}
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalButtonNo} onPress={() => setShowRestoreSubModal(false)} disabled={isRestoring}>
                <Text style={styles.modalButtonNoText}>{t('common.no')}</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.modalButtonYes} 
                onPress={handleRestoreSubscription}
                disabled={isRestoring}
              >
                {isRestoring ? (
                  <ActivityIndicator size="small" color={Colors.dark} />
                ) : (
                  <Text style={styles.modalButtonYesText}>{t('common.yes')}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginTop: 20,
  },
  backButton: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '500',
    color: Colors.primary,
    textTransform: 'uppercase',
  },
  editButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(244, 244, 244, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileSection: {
    paddingHorizontal: 30,
    paddingTop: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    marginBottom: 40,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.dark,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '500',
    color: Colors.white,
  },
  menuList: {
    gap: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuText: {
    fontSize: 14,
    color: Colors.white,
  },
  menuTextLink: {
    color: Colors.primary,
    textDecorationLine: 'underline',
  },
  menuValue: {
    fontSize: 14,
    color: Colors.primary,
  },
  menuItemDisabled: {
    opacity: 0.6,
  },
  menuTextDisabled: {
    color: 'rgba(255, 255, 255, 0.4)',
  },
  menuValueDisabled: {
    color: 'rgba(187, 224, 255, 0.5)',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  deleteLink: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.primary,
    textAlign: 'center',
    marginTop: 10,
  },
  logoutButton: {
    backgroundColor: Colors.white,
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
  logoutButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark,
    textTransform: 'uppercase',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(6, 6, 3, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalBox: {
    backgroundColor: 'rgba(30, 30, 30, 0.95)',
    borderRadius: 12,
    width: '100%',
    maxWidth: 340,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.white,
    flex: 1,
    textAlign: 'center',
    marginLeft: 24,
  },
  modalClose: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalDivider: {
    height: 0.5,
    backgroundColor: '#A8A8A8',
  },
  modalWarning: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    lineHeight: 18,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
    padding: 15,
    justifyContent: 'center',
  },
  modalButtonNo: {
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: Colors.white,
  },
  modalButtonNoText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.white,
  },
  modalButtonYes: {
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 50,
    backgroundColor: Colors.white,
  },
  modalButtonDanger: {
    backgroundColor: Colors.white,
  },
  modalButtonYesText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.dark,
  },
});
