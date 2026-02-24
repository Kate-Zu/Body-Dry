import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  GoalSelectionScreen,
  BodyParamsScreen,
  ActivityLevelScreen,
} from '../screens';

const Stack = createNativeStackNavigator();

export const OnboardingNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="GoalSelection" component={GoalSelectionScreen} />
      <Stack.Screen name="BodyParams" component={BodyParamsScreen} />
      <Stack.Screen name="ActivityLevel" component={ActivityLevelScreen} />
    </Stack.Navigator>
  );
};
