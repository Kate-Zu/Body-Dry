import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Modal,
  TextInput,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
  Image,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { Card, ProgressRing } from '../components';
import { useDiaryStore, useAuthStore, useProgressStore, useDryPlanStore } from '../store';
import { useTranslation } from '../i18n';
import { useFocusEffect } from '@react-navigation/native';
import Svg, { Path, Line, Circle, Defs, LinearGradient, Stop, Text as SvgText } from 'react-native-svg';

const { width } = Dimensions.get('window');

export const HomeScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const { dayData, isLoading, fetchDay } = useDiaryStore();
  const { user } = useAuthStore();
  const avatarUri = useAuthStore(s => s.avatarUri);
  const { weightHistory, addWeight, fetchWeightHistory } = useProgressStore();
  
  // Dry plan weekly reminder
  const { load: loadDryPlan, isReminderDue, weekNumber: dryWeekNumber, isActive: dryPlanActive } = useDryPlanStore();
  const [dryPlanModalVisible, setDryPlanModalVisible] = useState(false);

  const [weightModalVisible, setWeightModalVisible] = useState(false);
  const [newWeight, setNewWeight] = useState('');
  const [selectedDate, setSelectedDate] = useState('today');
  const [customDate, setCustomDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Helper function to get date string
  const getDateString = (offset) => {
    const date = new Date();
    date.setDate(date.getDate() + offset);
    return date.toISOString().split('T')[0];
  };

  useEffect(() => {
    fetchDay();
    fetchWeightHistory();
    loadDryPlan();
  }, []);

  // Refetch when screen regains focus (e.g. after AI plan applied new KBJU / weight)
  useFocusEffect(
    useCallback(() => {
      fetchDay();
      fetchWeightHistory();
      // Check dry plan weekly reminder
      loadDryPlan().then(() => {
        const due = useDryPlanStore.getState().isReminderDue();
        if (due) {
          setDryPlanModalVisible(true);
        }
      });
    }, [fetchDay, fetchWeightHistory, loadDryPlan])
  );

  const totals = dayData?.totals || { calories: 0, protein: 0, carbs: 0, fats: 0 };
  const goals = dayData?.goals || { calories: 2000, protein: 150, carbs: 200, fats: 65 };
  
  // Вода: current та goal вже в літрах (конвертація в diaryStore)
  const waterCurrentL = dayData?.water?.current || 0;
  const waterGoalL = dayData?.water?.goal || 2.7;
  const waterProgress = waterGoalL > 0 ? (waterCurrentL / waterGoalL) * 100 : 0;

  const caloriesRemaining = goals.calories - totals.calories;
  const calorieProgress = (totals.calories / goals.calories) * 100;
  const proteinRemaining = goals.protein - totals.protein;
  const carbsRemaining = goals.carbs - totals.carbs;
  const fatsRemaining = goals.fats - totals.fats;

  // Get user profile info
  const profile = user?.profile;
  
  // Get today's weight from weightHistory (most recent entry for today or past)
  const getTodayWeight = () => {
    if (!weightHistory || !Array.isArray(weightHistory) || weightHistory.length === 0) {
      return profile?.currentWeight || 0;
    }
    // weightHistory is sorted from oldest to newest, so last entry is most recent
    const latestEntry = weightHistory[weightHistory.length - 1];
    if (latestEntry && !latestEntry.isExpected && typeof latestEntry.weight === 'number') {
      return latestEntry.weight;
    }
    // If latest is expected, find the last non-expected
    for (let i = weightHistory.length - 1; i >= 0; i--) {
      if (!weightHistory[i].isExpected && typeof weightHistory[i].weight === 'number') {
        return weightHistory[i].weight;
      }
    }
    return profile?.currentWeight || 0;
  };
  
  const currentWeight = getTodayWeight();
  const targetWeight = profile?.targetWeight || 0;

  // === Analytics for weight card ===
  const weightAnalytics = useMemo(() => {
    const result = { bmi: 0, bmiColor: '#4CAF50', bmiCategory: '', weeklyChange: 0, goalPercent: 0 };
    if (!profile) return result;
    const heightM = (profile.height || 170) / 100;
    const cw = currentWeight || profile.currentWeight || 0;
    const tw = profile.targetWeight || cw;
    // BMI
    if (heightM > 0 && cw > 0) {
      result.bmi = cw / (heightM * heightM);
      if (result.bmi < 17.59) { result.bmiCategory = 'underweight'; result.bmiColor = '#4FC3F7'; }
      else if (result.bmi < 25) { result.bmiCategory = 'normal'; result.bmiColor = '#4CAF50'; }
      else if (result.bmi < 30) { result.bmiCategory = 'overweight'; result.bmiColor = '#FFB800'; }
      else { result.bmiCategory = 'obese'; result.bmiColor = '#FF6B6B'; }
    }
    // Weekly change
    if (weightHistory && weightHistory.length >= 2) {
      const real = weightHistory.filter(w => !w.isExpected);
      if (real.length >= 2) {
        const days = Math.max((new Date(real[real.length-1].date) - new Date(real[0].date)) / 86400000, 1);
        result.weeklyChange = ((real[real.length-1].weight - real[0].weight) / days) * 7;
      }
    }
    // Goal progress
    const startW = weightHistory?.length > 0 ? weightHistory[0].weight : cw;
    const totalToChange = Math.abs(startW - tw);
    if (totalToChange > 0.1) {
      const goingDown = tw < startW;
      const moved = goingDown ? startW - cw : cw - startW;
      result.goalPercent = moved > 0 ? Math.min(Math.round((moved / totalToChange) * 100), 100) : 0;
    }
    return result;
  }, [profile, currentWeight, weightHistory]);

  const handleUpdateWeight = async () => {
    const weight = parseFloat(newWeight);
    if (weight > 0 && weight < 500) {
      let dateStr;
      switch (selectedDate) {
        case 'day_before_yesterday':
          dateStr = getDateString(-2);
          break;
        case 'yesterday':
          dateStr = getDateString(-1);
          break;
        case 'custom':
          dateStr = customDate.toISOString().split('T')[0];
          break;
        default:
          dateStr = getDateString(0);
      }
      await addWeight(weight, dateStr);
      setWeightModalVisible(false);
      setNewWeight('');
      setSelectedDate('today');
      setCustomDate(new Date());
      fetchWeightHistory();
    }
  };

  const handleDatePickerChange = (event, date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (date) {
      setCustomDate(date);
      setSelectedDate('custom');
    }
  };

  const formatCustomDate = (date) => {
    return date.toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit' });
  };

  // Handle dry plan weekly update confirmation
  const handleDryPlanUpdate = () => {
    setDryPlanModalVisible(false);
    const nextWeek = (dryWeekNumber || 0) + 1;
    // Navigate to AI tab → AIDryPlan with autoUpdate
    navigation.navigate('AI', {
      screen: 'AIDryPlan',
      params: { autoUpdate: true, autoUpdateWeek: nextWeek },
    });
  };

  // Generate weight graph data
  const getWeightGraphPoints = () => {
    if (!weightHistory || !Array.isArray(weightHistory) || weightHistory.length === 0) {
      return null;
    }
    
    // Take last 7 entries (already sorted oldest to newest from backend)
    const recentWeights = weightHistory.slice(-7);
    
    const graphWidth = width - 80;
    const graphHeight = 140;
    const padLeft = 36;
    const padRight = 10;
    const padTop = 20;
    const padBottom = 20;
    
    const weights = recentWeights.map(w => w.weight);
    // Include target weight in range calculation so the line is visible
    const tw = targetWeight || 0;
    const allVals = tw > 0 ? [...weights, tw] : weights;
    const minWeight = Math.min(...allVals) - 1;
    const maxWeight = Math.max(...allVals) + 1;
    const range = maxWeight - minWeight || 1;
    
    // For single point, show it in the center
    const points = recentWeights.map((w, i) => ({
      x: recentWeights.length === 1 
        ? graphWidth / 2 
        : padLeft + (i / (recentWeights.length - 1)) * (graphWidth - padLeft - padRight),
      y: padTop + ((maxWeight - w.weight) / range) * (graphHeight - padTop - padBottom),
      isExpected: w.isExpected || false,
      weight: w.weight,
    }));
    
    // Target weight Y position
    const targetY = tw > 0 ? padTop + ((maxWeight - tw) / range) * (graphHeight - padTop - padBottom) : null;
    
    // Find last non-expected point for solid line
    const lastRealIndex = points.findIndex(p => p.isExpected);
    const solidPoints = lastRealIndex === -1 
      ? points.filter(p => !p.isExpected) 
      : lastRealIndex > 0 
        ? points.slice(0, lastRealIndex + 1) 
        : points.filter(p => !p.isExpected);
    const expectedPoints = points.filter(p => p.isExpected);
    
    // Create solid path for real weights (only if more than 1 point)
    let solidPath = '';
    if (solidPoints.length > 1) {
      solidPath = `M ${solidPoints[0].x} ${solidPoints[0].y}`;
      for (let i = 1; i < solidPoints.length; i++) {
        solidPath += ` L ${solidPoints[i].x} ${solidPoints[i].y}`;
      }
    }
    
    // Area fill path
    let areaPath = '';
    if (solidPoints.length > 1) {
      areaPath = `${solidPath} L ${solidPoints[solidPoints.length-1].x} ${graphHeight - padBottom} L ${solidPoints[0].x} ${graphHeight - padBottom} Z`;
    }
    
    // Create dashed path for expected weights
    let dashedPath = '';
    if (expectedPoints.length > 0 && solidPoints.length > 0) {
      const lastSolid = solidPoints[solidPoints.length - 1];
      dashedPath = `M ${lastSolid.x} ${lastSolid.y}`;
      for (let i = 0; i < expectedPoints.length; i++) {
        dashedPath += ` L ${expectedPoints[i].x} ${expectedPoints[i].y}`;
      }
    }
    
    const lastPoint = points[points.length - 1];
    const firstPoint = points[0];
    const weightDelta = points.length >= 2 ? lastPoint.weight - firstPoint.weight : 0;
    
    return { solidPath, dashedPath, areaPath, points, lastPoint, firstPoint, hasExpected: expectedPoints.length > 0, targetY, graphWidth, graphHeight, padLeft, padRight, padTop, padBottom, minWeight, maxWeight, weightDelta };
  };

  const weightGraphData = getWeightGraphPoints();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={() => { fetchDay(); fetchWeightHistory(); }} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('common.home').toUpperCase()}</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {user?.email?.charAt(0)?.toUpperCase() || 'U'}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>{t('common.today')}</Text>

        {/* Calories Card */}
        <TouchableOpacity activeOpacity={0.7} onPress={() => navigation.navigate('Diary')}>
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>{t('diary.calories')}</Text>
          <Text style={styles.cardSubtitle}>{t('diary.caloriesFormula')}</Text>
          <View style={styles.caloriesContent}>
            <ProgressRing
              progress={Math.min(calorieProgress, 100)}
              size={125}
              strokeWidth={12}
              centerValue={Math.round(caloriesRemaining).toLocaleString()}
              centerLabel={t('diary.remaining')}
            />
            <View style={styles.caloriesStats}>
              <View style={styles.statItem}>
                <Ionicons name="flag-outline" size={20} color={Colors.white} />
                <View>
                  <Text style={styles.statLabel}>{t('diary.baseGoal')}</Text>
                  <Text style={styles.statValue}>{Math.round(goals.calories).toLocaleString()}</Text>
                </View>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="restaurant-outline" size={20} color={Colors.primary} />
                <View>
                  <Text style={styles.statLabel}>{t('diary.food')}</Text>
                  <Text style={styles.statValue}>{Math.round(totals.calories).toLocaleString()}</Text>
                </View>
              </View>
            </View>
          </View>
        </Card>
        </TouchableOpacity>

        {/* Macros Card */}
        <TouchableOpacity activeOpacity={0.7} onPress={() => navigation.navigate('Progress')}>
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>{t('diary.macros')}</Text>
          <View style={styles.macrosContent}>
            <View style={styles.macroItem}>
              <ProgressRing
                progress={(totals.protein / goals.protein) * 100}
                size={87}
                strokeWidth={8}
                centerValue={`${Math.round(proteinRemaining)}${t('units.g')}`}
                centerLabel={t('diary.remainingShort')}
                fontSize={12}
              />
              <Text style={styles.macroLabel}>{t('diary.protein')}</Text>
            </View>
            <View style={styles.macroItem}>
              <ProgressRing
                progress={(totals.fats / goals.fats) * 100}
                size={87}
                strokeWidth={8}
                centerValue={`${Math.round(fatsRemaining)}${t('units.g')}`}
                centerLabel={t('diary.remainingShort')}
                fontSize={12}
              />
              <Text style={styles.macroLabel}>{t('diary.fats')}</Text>
            </View>
            <View style={styles.macroItem}>
              <ProgressRing
                progress={(totals.carbs / goals.carbs) * 100}
                size={87}
                strokeWidth={8}
                centerValue={`${Math.round(carbsRemaining)}${t('units.g')}`}
                centerLabel={t('diary.remainingShort')}
                fontSize={12}
              />
              <Text style={styles.macroLabel}>{t('diary.carbs')}</Text>
            </View>
          </View>
        </Card>
        </TouchableOpacity>

        {/* Water Card */}
        <Card style={styles.card}>
          <View style={styles.waterContent}>
            <ProgressRing
              progress={Math.min(waterProgress, 100)}
              size={117}
              strokeWidth={10}
              centerValue={`${waterCurrentL.toFixed(2)} ${t('units.l')}`}
              centerLabel={`${waterGoalL.toFixed(2)} ${t('units.liter')}`}
            />
            <View style={styles.waterInfo}>
              <Text style={styles.waterTitle}>{t('water.title')}</Text>
              <TouchableOpacity
                style={styles.waterButton}
                onPress={() => navigation.navigate('WaterTracker')}
              >
                <Text style={styles.waterButtonText}>{t('water.addWater')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Card>

        {/* Weight Card */}
        <Card style={styles.card}>
          <Text style={styles.weightTitle}>{t('progress.weight')}</Text>
          
          <View style={[styles.weightGraph, { height: 140 }]}>
            {weightGraphData ? (
              <Svg width={weightGraphData.graphWidth} height={weightGraphData.graphHeight}>
                <Defs>
                  <LinearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0%" stopColor={Colors.primary} stopOpacity={0.35} />
                    <Stop offset="100%" stopColor={Colors.primary} stopOpacity={0.02} />
                  </LinearGradient>
                </Defs>
                {/* Y-axis labels */}
                <SvgText x={weightGraphData.padLeft - 6} y={weightGraphData.padTop + 4} fontSize={9} fill="rgba(255,255,255,0.4)" textAnchor="end">
                  {weightGraphData.maxWeight.toFixed(1)}
                </SvgText>
                <SvgText x={weightGraphData.padLeft - 6} y={weightGraphData.graphHeight - weightGraphData.padBottom + 4} fontSize={9} fill="rgba(255,255,255,0.4)" textAnchor="end">
                  {weightGraphData.minWeight.toFixed(1)}
                </SvgText>
                {/* Grid lines */}
                {[0, 1, 2].map((i) => {
                  const y = weightGraphData.padTop + (i / 2) * (weightGraphData.graphHeight - weightGraphData.padTop - weightGraphData.padBottom);
                  return (
                    <Line key={i} x1={weightGraphData.padLeft} y1={y} x2={weightGraphData.graphWidth - weightGraphData.padRight} y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth={1} />
                  );
                })}
                {/* Target weight line */}
                {weightGraphData.targetY != null && (
                  <>
                    <Line
                      x1={weightGraphData.padLeft}
                      y1={weightGraphData.targetY}
                      x2={weightGraphData.graphWidth - weightGraphData.padRight}
                      y2={weightGraphData.targetY}
                      stroke="#4CAF50"
                      strokeWidth={1}
                      strokeDasharray="4,3"
                      strokeOpacity={0.7}
                    />
                    <SvgText
                      x={weightGraphData.graphWidth - weightGraphData.padRight + 2}
                      y={weightGraphData.targetY - 3}
                      fontSize={8}
                      fill="#4CAF50"
                      textAnchor="end"
                      opacity={0.8}
                    >
                      {t('progress.targetLabel')}
                    </SvgText>
                  </>
                )}
                {/* Area fill */}
                {weightGraphData.areaPath && (
                  <Path d={weightGraphData.areaPath} fill="url(#weightGradient)" />
                )}
                {/* Solid weight line (real measurements) */}
                {weightGraphData.solidPath && (
                  <Path
                    d={weightGraphData.solidPath}
                    stroke={Colors.primary}
                    strokeWidth={3}
                    fill="none"
                    strokeLinecap="round"
                  />
                )}
                {/* Dashed line for expected weight */}
                {weightGraphData.dashedPath && (
                  <Path
                    d={weightGraphData.dashedPath}
                    stroke={Colors.primary}
                    strokeWidth={2}
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray="6,4"
                    strokeOpacity={0.5}
                  />
                )}
                {/* Points for each measurement */}
                {weightGraphData.points.map((point, idx) => (
                  <Circle
                    key={idx}
                    cx={point.x}
                    cy={point.y}
                    r={point.isExpected ? 4 : 5}
                    fill={point.isExpected ? 'rgba(187,224,255,0.3)' : Colors.white}
                    stroke={Colors.primary}
                    strokeWidth={2}
                  />
                ))}
                {/* First weight label */}
                {weightGraphData.points.length >= 2 && (
                  <SvgText
                    x={weightGraphData.firstPoint.x}
                    y={weightGraphData.firstPoint.y - 10}
                    fontSize={10}
                    fill="rgba(255,255,255,0.6)"
                    textAnchor="middle"
                    fontWeight="600"
                  >
                    {weightGraphData.firstPoint.weight.toFixed(1)}
                  </SvgText>
                )}
                {/* Last weight label + delta */}
                <SvgText
                  x={weightGraphData.lastPoint.x}
                  y={weightGraphData.lastPoint.y - 10}
                  fontSize={11}
                  fill={Colors.white}
                  textAnchor="middle"
                  fontWeight="700"
                >
                  {weightGraphData.lastPoint.weight.toFixed(1)}
                </SvgText>
                {weightGraphData.weightDelta !== 0 && (
                  <SvgText
                    x={weightGraphData.lastPoint.x}
                    y={weightGraphData.lastPoint.y + 16}
                    fontSize={9}
                    fill={weightGraphData.weightDelta < 0 ? '#4CAF50' : '#FF6B6B'}
                    textAnchor="middle"
                    fontWeight="600"
                  >
                    {weightGraphData.weightDelta > 0 ? '+' : ''}{weightGraphData.weightDelta.toFixed(1)}
                  </SvgText>
                )}
              </Svg>
            ) : (
              <View style={styles.graphPlaceholder}>
                <Ionicons name="analytics-outline" size={50} color={Colors.primary} />
                <Text style={styles.placeholderText}>{t('progress.noData')}</Text>
              </View>
            )}
          </View>

          {currentWeight > 0 && (
            <View style={styles.weightStats}>
              <View style={styles.weightStatItem}>
                <Text style={styles.weightStatLabel}>{t('progress.current')}</Text>
                <Text style={styles.weightStatValue}>{currentWeight} {t('units.kg')}</Text>
              </View>
              {targetWeight > 0 && (
                <View style={styles.weightStatItem}>
                  <Text style={styles.weightStatLabel}>{t('profile.targetWeight')}</Text>
                  <Text style={styles.weightStatValue}>{targetWeight} {t('units.kg')}</Text>
                </View>
              )}
            </View>
          )}

          {/* Compact Analytics Row */}
          {profile && weightAnalytics.bmi > 0 && (
            <View style={styles.analyticsRow}>
              {/* Weight trend */}
              <View style={styles.analyticsBadge}>
                <Ionicons 
                  name={weightAnalytics.weeklyChange < 0 ? 'trending-down' : weightAnalytics.weeklyChange > 0 ? 'trending-up' : 'remove-outline'}
                  size={14}
                  color={weightAnalytics.weeklyChange < 0 ? '#4CAF50' : weightAnalytics.weeklyChange > 0 ? '#FF6B6B' : Colors.textSecondary}
                />
                <Text style={[
                  styles.analyticsBadgeText,
                  weightAnalytics.weeklyChange < 0 && { color: '#4CAF50' },
                  weightAnalytics.weeklyChange > 0 && { color: '#FF6B6B' },
                ]}>
                  {weightAnalytics.weeklyChange > 0 ? '+' : ''}{weightAnalytics.weeklyChange.toFixed(1)}/{t('progress.weekShort')}
                </Text>
              </View>

              {/* BMI badge */}
              <View style={[styles.analyticsBadge, { backgroundColor: weightAnalytics.bmiColor + '18' }]}>
                <Text style={[styles.analyticsBadgeText, { color: weightAnalytics.bmiColor }]}>
                  BMI {weightAnalytics.bmi.toFixed(1)}
                </Text>
              </View>

              {/* Goal mini-bar */}
              {targetWeight > 0 && targetWeight !== currentWeight && (
                <View style={styles.goalMini}>
                  <Text style={styles.goalMiniLabel}>{t('progress.goalProgress')}</Text>
                  <View style={styles.goalMiniBarBg}>
                    <View style={[styles.goalMiniBarFill, { width: `${weightAnalytics.goalPercent}%` }]} />
                  </View>
                  <Text style={styles.goalMiniPercent}>{weightAnalytics.goalPercent}%</Text>
                </View>
              )}
            </View>
          )}

          <Text style={styles.weightNote}>
            {t('progress.weightNote')}
          </Text>
          <TouchableOpacity 
            style={styles.weightButton}
            onPress={() => setWeightModalVisible(true)}
          >
            <Text style={styles.weightButtonText}>{t('progress.updateWeight')}</Text>
          </TouchableOpacity>
        </Card>
      </ScrollView>

      {/* Weight Update Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={weightModalVisible}
        onRequestClose={() => setWeightModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('progress.updateWeight')}</Text>
            
            {/* Date Selection */}
            <View style={styles.dateSelector}>
              <TouchableOpacity 
                style={[styles.dateOption, selectedDate === 'day_before_yesterday' && styles.dateOptionSelected]}
                onPress={() => setSelectedDate('day_before_yesterday')}
              >
                <Text style={[styles.dateOptionText, selectedDate === 'day_before_yesterday' && styles.dateOptionTextSelected]}>
                  {t('progress.dayBeforeYesterday')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.dateOption, selectedDate === 'yesterday' && styles.dateOptionSelected]}
                onPress={() => setSelectedDate('yesterday')}
              >
                <Text style={[styles.dateOptionText, selectedDate === 'yesterday' && styles.dateOptionTextSelected]}>
                  {t('progress.yesterday')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.dateOption, selectedDate === 'today' && styles.dateOptionSelected]}
                onPress={() => setSelectedDate('today')}
              >
                <Text style={[styles.dateOptionText, selectedDate === 'today' && styles.dateOptionTextSelected]}>
                  {t('progress.today')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.dateOptionSmall, selectedDate === 'custom' && styles.dateOptionSelected]}
                onPress={() => setShowDatePicker(true)}
              >
                <Ionicons 
                  name="calendar-outline" 
                  size={16} 
                  color={selectedDate === 'custom' ? Colors.dark : 'rgba(255,255,255,0.6)'} 
                />
              </TouchableOpacity>
            </View>
            
            {selectedDate === 'custom' && (
              <Text style={styles.customDateNote}>{formatCustomDate(customDate)}</Text>
            )}

            {showDatePicker && (
              <DateTimePicker
                value={customDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleDatePickerChange}
                maximumDate={new Date()}
                themeVariant="dark"
                textColor={Colors.white}
              />
            )}
            
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={newWeight}
                onChangeText={setNewWeight}
                keyboardType="decimal-pad"
                placeholder={`${t('progress.currentWeight')} (${t('units.kg')})`}
                placeholderTextColor="rgba(255,255,255,0.5)"
              />
              <Text style={styles.inputUnit}>{t('units.kg')}</Text>
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.modalButtonCancel}
                onPress={() => { setWeightModalVisible(false); setSelectedDate('today'); }}
              >
                <Text style={styles.modalButtonCancelText}>{t('common.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.modalButtonSave}
                onPress={handleUpdateWeight}
              >
                <Text style={styles.modalButtonSaveText}>{t('common.save')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Dry Plan Weekly Reminder Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={dryPlanModalVisible}
        onRequestClose={() => setDryPlanModalVisible(false)}
      >
        <View style={dryPlanStyles.overlay}>
          <View style={dryPlanStyles.container}>
            {/* Glow accent */}
            <View style={dryPlanStyles.glowCircle}>
              <Ionicons name="refresh-circle" size={56} color={Colors.primary} />
            </View>
            <Text style={dryPlanStyles.title}>
              {t('dryPlanReminder.title')}
            </Text>
            <Text style={dryPlanStyles.subtitle}>
              {t('dryPlanReminder.subtitle', { week: (dryWeekNumber || 0) + 1 })}
            </Text>
            <Text style={dryPlanStyles.description}>
              {t('dryPlanReminder.description')}
            </Text>
            <View style={dryPlanStyles.buttons}>
              <TouchableOpacity
                style={dryPlanStyles.cancelBtn}
                onPress={() => setDryPlanModalVisible(false)}
              >
                <Text style={dryPlanStyles.cancelBtnText}>{t('common.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={dryPlanStyles.confirmBtn}
                onPress={handleDryPlanUpdate}
              >
                <Ionicons name="checkmark-circle-outline" size={18} color={Colors.dark} style={{ marginRight: 6 }} />
                <Text style={dryPlanStyles.confirmBtnText}>{t('dryPlanReminder.confirm')}</Text>
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
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '500',
    color: Colors.primary,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.white,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '500',
    color: Colors.white,
    textAlign: 'left',
    marginBottom: 15,
  },
  card: {
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '400',
    color: Colors.white,
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 10,
    fontWeight: '400',
    color: Colors.white,
    letterSpacing: 0.1,
    opacity: 0.8,
  },
  caloriesContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 35,
    marginTop: 15,
  },
  caloriesStats: {
    gap: 15,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.white,
    letterSpacing: 0.4,
  },
  statValue: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.white,
    letterSpacing: 0.5,
  },
  macrosContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  macroItem: {
    alignItems: 'center',
    gap: 5,
  },
  macroLabel: {
    fontSize: 10,
    color: Colors.white,
    letterSpacing: 0.4,
    marginTop: 5,
  },
  waterContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  waterInfo: {
    flex: 1,
    gap: 15,
  },
  waterTitle: {
    fontSize: 18,
    fontWeight: '400',
    color: Colors.white,
  },
  waterButton: {
    backgroundColor: Colors.white,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 50,
    alignSelf: 'flex-start',
  },
  waterButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.dark,
    textTransform: 'uppercase',
  },
  weightTitle: {
    fontSize: 18,
    fontWeight: '400',
    color: Colors.white,
    textAlign: 'left',
    marginBottom: 10,
  },
  weightGraph: {
    height: 120,
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  graphPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: 8,
    borderStyle: 'dashed',
    gap: 8,
  },
  placeholderText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
  },
  weightStats: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 40,
    marginBottom: 10,
  },
  weightStatItem: {
    alignItems: 'center',
  },
  weightStatLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  weightStatValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  weightNote: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginBottom: 15,
    lineHeight: 20,
  },
  weightButton: {
    backgroundColor: Colors.white,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  weightButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.dark,
    textTransform: 'uppercase',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    borderWidth: 2,
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.white,
    textAlign: 'center',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    height: 50,
    color: Colors.white,
    fontSize: 18,
  },
  inputUnit: {
    fontSize: 16,
    color: Colors.white,
    fontWeight: '500',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButtonCancel: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.white,
  },
  modalButtonCancelText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.white,
  },
  modalButtonSave: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  modalButtonSaveText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.dark,
  },
  dateSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  dateOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
  },
  dateOptionSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  dateOptionText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '500',
  },
  dateOptionTextSelected: {
    color: Colors.dark,
  },
  dateOptionSmall: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  customDateNote: {
    fontSize: 12,
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: '500',
  },
  // Analytics row
  analyticsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  analyticsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  analyticsBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.white,
  },
  goalMini: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  goalMiniLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
  goalMiniBarBg: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  goalMiniBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  goalMiniPercent: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.primary,
  },
});

// ─── Dry Plan Reminder Modal Styles (blue theme) ─────────────────
const dryPlanStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#0d1b2a',
    borderRadius: 20,
    padding: 28,
    width: '85%',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.primary,
    // Blue glow shadow
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 25,
    elevation: 15,
  },
  glowCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(187, 224, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(187, 224, 255, 0.7)',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(187, 224, 255, 0.3)',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  confirmBtn: {
    flex: 1.5,
    height: 46,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: Colors.primary,
  },
  confirmBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark,
  },
});
