import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import {
  HomeScreen,
  DiaryScreen,
  AddMealScreen,
  FoodDetailScreen,
  CustomPortionSizeScreen,
  WaterTrackerScreen,
  ProgressScreen,
  ProfileScreen,
  AIScreen,
  PaymentScreen,
  PaymentSuccessScreen,
  GoalsScreen,
  MacroCaloriesEditScreen,
  ChangePasswordScreen,
  EditProfileScreen,
  LanguageScreen,
  PrivacyPolicyScreen,
  NotificationSettingsScreen,
  AIDryPlanScreen,
  AIRecipesScreen,
  AIProgressAnalysisScreen,
  ChatHistoryScreen,
  BarcodeScannerScreen,
  CreateFoodScreen,
} from '../screens';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const HomeStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="HomeMain" component={HomeScreen} />
    <Stack.Screen name="WaterTracker" component={WaterTrackerScreen} />
    <Stack.Screen name="Profile" component={ProfileScreen} />
    <Stack.Screen name="Payment" component={PaymentScreen} />
    <Stack.Screen name="PaymentSuccess" component={PaymentSuccessScreen} />
    <Stack.Screen name="Goals" component={GoalsScreen} />
    <Stack.Screen name="MacroCaloriesEdit" component={MacroCaloriesEditScreen} />
    <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
    <Stack.Screen name="EditProfile" component={EditProfileScreen} />
    <Stack.Screen name="Language" component={LanguageScreen} />
    <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
    <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
  </Stack.Navigator>
);

const DiaryStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="DiaryMain" component={DiaryScreen} />
    <Stack.Screen name="AddMeal" component={AddMealScreen} />
    <Stack.Screen name="FoodDetail" component={FoodDetailScreen} />
    <Stack.Screen name="CustomPortionSize" component={CustomPortionSizeScreen} />
    <Stack.Screen name="BarcodeScanner" component={BarcodeScannerScreen} />
    <Stack.Screen name="CreateFood" component={CreateFoodScreen} />
    <Stack.Screen name="WaterTracker" component={WaterTrackerScreen} />
  </Stack.Navigator>
);

const AIStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="AIMain" component={AIScreen} />
    <Stack.Screen name="AIDryPlan" component={AIDryPlanScreen} />
    <Stack.Screen name="AIRecipes" component={AIRecipesScreen} />
    <Stack.Screen name="ProgressAnalysis" component={AIProgressAnalysisScreen} />
    <Stack.Screen name="ChatHistory" component={ChatHistoryScreen} />
  </Stack.Navigator>
);

const TabBarIcon = ({ name, focused }) => (
  <View style={styles.iconContainer}>
    <Ionicons
      name={name}
      size={28}
      color={focused ? Colors.primary : 'rgba(187, 224, 255, 0.3)'}
    />
  </View>
);

export const MainNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: 'rgba(187, 224, 255, 0.3)',
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarIcon name={focused ? 'home' : 'home-outline'} focused={focused} />
          ),
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate('Home', { screen: 'HomeMain' });
          },
        })}
      />
      <Tab.Screen
        name="Diary"
        component={DiaryStack}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarIcon name={focused ? 'book' : 'book-outline'} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Progress"
        component={ProgressScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarIcon name={focused ? 'bar-chart' : 'bar-chart-outline'} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="AI"
        component={AIStack}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarIcon name={focused ? 'sparkles' : 'sparkles-outline'} focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
    height: 90,
    paddingTop: 10,
    paddingBottom: 25,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
