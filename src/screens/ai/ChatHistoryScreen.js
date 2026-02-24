import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { useTranslation } from '../../i18n';
import { useChatStore } from '../../store';
import { useFocusEffect } from '@react-navigation/native';

const typeIcons = {
  dry_plan: 'fitness-outline',
  recipes: 'restaurant-outline',
};

const ChatItem = ({ item, onPress, onDelete, t }) => {
  const date = new Date(item.updatedAt || item.createdAt);
  const dateStr = date.toLocaleDateString('uk-UA', { day: 'numeric', month: 'short', year: 'numeric' });
  const timeStr = date.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });
  const typeLabel = item.type === 'dry_plan' ? t('ai.dryPlanTitle') : t('ai.recipesTitle');

  return (
    <TouchableOpacity style={styles.chatItem} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.chatIconWrap}>
        <Ionicons name={typeIcons[item.type] || 'chatbubble-outline'} size={24} color={Colors.primary} />
      </View>
      <View style={styles.chatInfo}>
        <Text style={styles.chatType}>{typeLabel}</Text>
        <Text style={styles.chatPreview} numberOfLines={1}>
          {item.lastMessage || t('chat.noMessages')}
        </Text>
        <Text style={styles.chatDate}>{dateStr}, {timeStr}</Text>
      </View>
      <TouchableOpacity
        style={styles.deleteBtn}
        onPress={onDelete}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="trash-outline" size={20} color={Colors.error} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

export const ChatHistoryScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const { conversations, fetchConversations, deleteConversation, isLoading } = useChatStore();

  useFocusEffect(
    React.useCallback(() => {
      fetchConversations();
    }, [fetchConversations])
  );

  const handleOpenChat = (item) => {
    if (item.type === 'dry_plan') {
      navigation.navigate('AIDryPlan', { conversationId: item.id });
    } else if (item.type === 'recipes') {
      navigation.navigate('AIRecipes', { conversationId: item.id });
    }
  };

  const handleDelete = (item) => {
    Alert.alert(
      t('chat.deleteTitle'),
      t('chat.deleteConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => deleteConversation(item.id),
        },
      ]
    );
  };

  const renderItem = ({ item }) => (
    <ChatItem
      item={item}
      onPress={() => handleOpenChat(item)}
      onDelete={() => handleDelete(item)}
      t={t}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('chat.historyTitle')}</Text>
        <View style={{ width: 40 }} />
      </View>

      {isLoading && conversations.length === 0 ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : conversations.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="chatbubbles-outline" size={64} color={Colors.textMuted} />
          <Text style={styles.emptyText}>{t('chat.empty')}</Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
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
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textMuted,
    marginTop: 16,
    textAlign: 'center',
  },
  list: {
    padding: 16,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 14,
    marginBottom: 12,
  },
  chatIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: `${Colors.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  chatInfo: {
    flex: 1,
  },
  chatType: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.white,
    marginBottom: 2,
  },
  chatPreview: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  chatDate: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  deleteBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
});
