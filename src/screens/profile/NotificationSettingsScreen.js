import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { useNotificationsStore } from '../../store';
import { useTranslation } from '../../i18n';

export const NotificationSettingsScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const { settings, isLoading, fetchSettings, updateSettings, sendTestNotification } = useNotificationsStore();
  const [localSettings, setLocalSettings] = useState(settings);

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleToggle = async (key, value) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    await updateSettings({ [key]: value });
  };

  const handleTestNotification = async () => {
    const success = await sendTestNotification();
    if (success) {
      Alert.alert(t('notifications.testSent'), t('notifications.testSentDesc'));
    } else {
      Alert.alert(t('common.error'), t('notifications.testError'));
    }
  };

  const SettingRow = ({ icon, title, subtitle, value, onToggle }) => (
    <View style={styles.settingRow}>
      <View style={styles.settingIcon}>
        <Ionicons name={icon} size={22} color={Colors.primary} />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: Colors.cardBorder, true: Colors.primary }}
        thumbColor={Colors.white}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.title}>{t('notifications.title')}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('notifications.reminders')}</Text>
          
          <SettingRow
            icon="water-outline"
            title={t('notifications.waterReminders')}
            subtitle={t('notifications.waterRemindersDesc')}
            value={localSettings.waterReminders}
            onToggle={(v) => handleToggle('waterReminders', v)}
          />

          <SettingRow
            icon="restaurant-outline"
            title={t('notifications.mealReminders')}
            subtitle={t('notifications.mealRemindersDesc')}
            value={localSettings.mealReminders}
            onToggle={(v) => handleToggle('mealReminders', v)}
          />

          <SettingRow
            icon="scale-outline"
            title={t('notifications.weightReminder')}
            subtitle={t('notifications.weightReminderDesc')}
            value={localSettings.weightReminder}
            onToggle={(v) => handleToggle('weightReminder', v)}
          />

          <SettingRow
            icon="bar-chart-outline"
            title={t('notifications.dailySummary')}
            subtitle={t('notifications.dailySummaryDesc')}
            value={localSettings.dailySummary}
            onToggle={(v) => handleToggle('dailySummary', v)}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('notifications.test')}</Text>
          <TouchableOpacity style={styles.testButton} onPress={handleTestNotification}>
            <Ionicons name="notifications-outline" size={20} color={Colors.white} />
            <Text style={styles.testButtonText}>{t('notifications.sendTest')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.white,
  },
  placeholder: {
    width: 32,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(187, 224, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.white,
  },
  settingSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  testButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
});
