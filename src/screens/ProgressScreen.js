import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Svg, { Path, Circle, Line, Defs, LinearGradient, Stop, Text as SvgText } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { Card } from '../components';
import { useProgressStore, useAuthStore } from '../store';
import { useTranslation } from '../i18n';

const { width } = Dimensions.get('window');
const CHART_WIDTH = width - 72;
const CHART_HEIGHT = 180;
const CHART_PADDING = { top: 20, right: 15, bottom: 30, left: 40 };

export const ProgressScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('day');
  const { user } = useAuthStore();
  const { 
    weeklyStats, 
    monthlyStats, 
    yearlyStats, 
    weightHistory,
    isLoading,
    fetchWeeklyStats,
    fetchMonthlyStats,
    fetchYearlyStats,
    fetchWeightHistory,
  } = useProgressStore();

  // Refresh when screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchWeeklyStats();
      fetchWeightHistory(30);
    }, [])
  );

  useEffect(() => {
    const limitMap = { day: 1, week: 7, month: 30 };
    fetchWeightHistory(limitMap[activeTab]);
    
    if (activeTab === 'day' || activeTab === 'week') {
      fetchWeeklyStats();
    } else if (activeTab === 'month') {
      fetchMonthlyStats();
    }
  }, [activeTab]);

  const currentStats = activeTab === 'day'
    ? weeklyStats
    : activeTab === 'month' 
      ? monthlyStats 
      : weeklyStats;

  // Helper to get averages from current stats
  const getAverages = () => {
    if (!currentStats?.averages) {
      return { calories: 0, protein: 0, carbs: 0, fats: 0, water: 0 };
    }
    return currentStats.averages;
  };

  // Helper to get goals from current stats
  const getGoals = () => {
    if (!currentStats?.goals) {
      return { calories: 2000, protein: 150, carbs: 200, fats: 70, water: 2500 };
    }
    return currentStats.goals;
  };

  // Helper to get daily data for charts
  const getDailyData = () => {
    if (!currentStats?.dailyData) return [];
    return currentStats.dailyData;
  };

  const averages = getAverages();
  const goals = getGoals();

  // Get weight data for selected period
  const getWeightDataForPeriod = () => {
    if (!weightHistory || !Array.isArray(weightHistory) || weightHistory.length === 0) {
      return [];
    }
    const limitMap = { day: 1, week: 7, month: 30 };
    return weightHistory.slice(-limitMap[activeTab]);
  };

  const weightData = getWeightDataForPeriod();

  // === Analytics calculations ===
  const profile = user?.profile;
  const analytics = useMemo(() => {
    const result = {
      bmi: 0,
      bmiCategory: '',
      bmiColor: '#4CAF50',
      goalPercent: 0,
      startWeight: 0,
      currentW: 0,
      targetW: 0,
      weeklyChange: 0,
      estimatedWeeks: null,
      calorieConsistency: 0,
      waterConsistency: 0,
      proteinConsistency: 0,
      overallScore: 0,
    };

    if (!profile) return result;

    // BMI
    const heightM = (profile.height || 170) / 100;
    const cw = profile.currentWeight || 0;
    result.currentW = cw;
    result.startWeight = currentStats?.weight?.start || cw;
    result.targetW = profile.targetWeight || cw;

    if (heightM > 0 && cw > 0) {
      result.bmi = cw / (heightM * heightM);
      if (result.bmi < 17.59) {
        result.bmiCategory = 'underweight';
        result.bmiColor = '#4FC3F7';
      } else if (result.bmi < 25) {
        result.bmiCategory = 'normal';
        result.bmiColor = '#4CAF50';
      } else if (result.bmi < 30) {
        result.bmiCategory = 'overweight';
        result.bmiColor = '#FFB800';
      } else {
        result.bmiCategory = 'obese';
        result.bmiColor = '#FF6B6B';
      }
    }

    // Goal progress
    const totalToLose = Math.abs(result.startWeight - result.targetW);
    const lostSoFar = Math.abs(result.startWeight - result.currentW);
    if (totalToLose > 0) {
      // check direction is correct
      const goingDown = result.targetW < result.startWeight;
      const movedCorrectDirection = goingDown
        ? result.currentW < result.startWeight
        : result.currentW > result.startWeight;
      result.goalPercent = movedCorrectDirection
        ? Math.min(Math.round((lostSoFar / totalToLose) * 100), 100)
        : 0;
    }

    // Weekly weight change from weight history
    if (weightHistory && weightHistory.length >= 2) {
      const realWeights = weightHistory.filter(w => !w.isExpected);
      if (realWeights.length >= 2) {
        const oldest = realWeights[0];
        const newest = realWeights[realWeights.length - 1];
        const daysDiff = Math.max((new Date(newest.date) - new Date(oldest.date)) / (1000 * 60 * 60 * 24), 1);
        const totalChange = newest.weight - oldest.weight;
        result.weeklyChange = (totalChange / daysDiff) * 7;

        // Estimated weeks to goal
        const remaining = result.targetW - result.currentW;
        if (result.weeklyChange !== 0) {
          const weeksNeeded = remaining / result.weeklyChange;
          if (weeksNeeded > 0 && weeksNeeded < 200) {
            result.estimatedWeeks = Math.ceil(weeksNeeded);
          }
        }
      }
    }

    // Consistency scores (how close to goals on average, 0-100)
    if (currentStats?.averages && currentStats?.goals) {
      const a = currentStats.averages;
      const g = currentStats.goals;
      result.calorieConsistency = g.calories > 0
        ? Math.max(0, 100 - Math.abs(((a.calories - g.calories) / g.calories) * 100))
        : 0;
      result.waterConsistency = g.water > 0
        ? Math.min(100, (a.water / g.water) * 100)
        : 0;
      result.proteinConsistency = g.protein > 0
        ? Math.min(100, (a.protein / g.protein) * 100)
        : 0;
      result.overallScore = Math.round(
        (result.calorieConsistency * 0.4 + result.waterConsistency * 0.3 + result.proteinConsistency * 0.3)
      );
    }

    return result;
  }, [profile, currentStats, weightHistory]);

  // === Score color helper ===
  const getScoreColor = (score) => {
    if (score >= 80) return '#4CAF50';
    if (score >= 60) return '#FFB800';
    return '#FF6B6B';
  };

  // Calculate weight stats
  const weights = weightData.filter(w => !w.isExpected).map(w => w.weight);
  const currentWeight = weights.length > 0 ? weights[weights.length - 1] : (user?.profile?.currentWeight || 0);
  const avgWeight = weights.length > 0 ? weights.reduce((a, b) => a + b, 0) / weights.length : 0;
  const minWeight = weights.length > 0 ? Math.min(...weights) : 0;
  const maxWeight = weights.length > 0 ? Math.max(...weights) : 0;
  const weightChange = weights.length >= 2 ? weights[weights.length - 1] - weights[0] : 0;

  // Generate SVG weight chart
  const renderWeightChart = () => {
    if (weightData.length === 0) {
      return (
        <View style={styles.chartEmpty}>
          <Text style={styles.chartEmptyText}>{t('progress.noData')}</Text>
        </View>
      );
    }

    const chartInnerWidth = CHART_WIDTH - CHART_PADDING.left - CHART_PADDING.right;
    const chartInnerHeight = CHART_HEIGHT - CHART_PADDING.top - CHART_PADDING.bottom;

    // Calculate Y axis bounds
    const allWeights = weightData.map(w => w.weight);
    // Include target weight in range so target line is visible
    const tw = profile?.targetWeight || 0;
    if (tw > 0) allWeights.push(tw);
    const dataMin = Math.min(...allWeights);
    const dataMax = Math.max(...allWeights);
    const range = dataMax - dataMin || 2;
    const yMin = dataMin - range * 0.15;
    const yMax = dataMax + range * 0.15;

    // Target weight Y
    const targetWeightY = tw > 0 ? CHART_PADDING.top + (1 - (tw - yMin) / (yMax - yMin)) * chartInnerHeight : null;

    // Generate points
    const points = weightData.map((entry, index) => {
      const x = CHART_PADDING.left + (index / Math.max(weightData.length - 1, 1)) * chartInnerWidth;
      const y = CHART_PADDING.top + (1 - (entry.weight - yMin) / (yMax - yMin)) * chartInnerHeight;
      return { x, y, weight: entry.weight, date: entry.date, isExpected: entry.isExpected };
    });

    // Smooth bezier curve
    const createSmoothPath = (pts) => {
      if (pts.length < 2) return '';
      let path = `M ${pts[0].x} ${pts[0].y}`;
      for (let i = 0; i < pts.length - 1; i++) {
        const p0 = pts[i === 0 ? i : i - 1];
        const p1 = pts[i];
        const p2 = pts[i + 1];
        const p3 = pts[i + 2 >= pts.length ? i + 1 : i + 2];
        const cp1x = p1.x + (p2.x - p0.x) / 6;
        const cp1y = p1.y + (p2.y - p0.y) / 6;
        const cp2x = p2.x - (p3.x - p1.x) / 6;
        const cp2y = p2.y - (p3.y - p1.y) / 6;
        path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
      }
      return path;
    };

    // Area fill under curve
    const createAreaPath = (pts) => {
      if (pts.length < 2) return '';
      const linePath = createSmoothPath(pts);
      const lastPoint = pts[pts.length - 1];
      const firstPoint = pts[0];
      return `${linePath} L ${lastPoint.x} ${CHART_HEIGHT - CHART_PADDING.bottom} L ${firstPoint.x} ${CHART_HEIGHT - CHART_PADDING.bottom} Z`;
    };

    const realPoints = points.filter(p => !p.isExpected);
    const expectedPoints = points.filter(p => p.isExpected);
    const connectExpected = realPoints.length > 0 && expectedPoints.length > 0 
      ? [realPoints[realPoints.length - 1], ...expectedPoints] 
      : expectedPoints;

    // Y-axis labels
    const yLabels = [yMax, (yMax + yMin) / 2, yMin];

    // X-axis labels
    const getDateLabel = (dateStr, index) => {
      const date = new Date(dateStr);
      if (activeTab === 'year') {
        return date.toLocaleDateString('uk-UA', { month: 'short' }).slice(0, 3);
      }
      if (weightData.length <= 7) {
        return date.toLocaleDateString('uk-UA', { weekday: 'short' }).slice(0, 2);
      }
      if (index % Math.ceil(weightData.length / 7) === 0 || index === weightData.length - 1) {
        return `${date.getDate()}`;
      }
      return '';
    };

    return (
      <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
        <Defs>
          <LinearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={Colors.primary} stopOpacity={0.4} />
            <Stop offset="100%" stopColor={Colors.primary} stopOpacity={0.02} />
          </LinearGradient>
        </Defs>

        {/* Grid lines */}
        {yLabels.map((label, i) => {
          const y = CHART_PADDING.top + (i / (yLabels.length - 1)) * chartInnerHeight;
          return (
            <React.Fragment key={i}>
              <Line
                x1={CHART_PADDING.left}
                y1={y}
                x2={CHART_WIDTH - CHART_PADDING.right}
                y2={y}
                stroke="rgba(255,255,255,0.08)"
                strokeWidth={1}
              />
              <SvgText
                x={CHART_PADDING.left - 8}
                y={y + 4}
                fontSize={10}
                fill="rgba(255,255,255,0.4)"
                textAnchor="end"
              >
                {label.toFixed(1)}
              </SvgText>
            </React.Fragment>
          );
        })}

        {/* Target weight line */}
        {targetWeightY != null && (
          <>
            <Line
              x1={CHART_PADDING.left}
              y1={targetWeightY}
              x2={CHART_WIDTH - CHART_PADDING.right}
              y2={targetWeightY}
              stroke="#4CAF50"
              strokeWidth={1.5}
              strokeDasharray="5,3"
              strokeOpacity={0.7}
            />
            <SvgText
              x={CHART_WIDTH - CHART_PADDING.right}
              y={targetWeightY - 4}
              fontSize={9}
              fill="#4CAF50"
              textAnchor="end"
              opacity={0.85}
            >
              {t('progress.targetLabel')} {tw.toFixed(1)}
            </SvgText>
          </>
        )}

        {/* Area fill */}
        {realPoints.length >= 2 && (
          <Path d={createAreaPath(realPoints)} fill="url(#areaGradient)" />
        )}

        {/* Main line */}
        {realPoints.length >= 2 && (
          <Path
            d={createSmoothPath(realPoints)}
            stroke={Colors.primary}
            strokeWidth={3}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Expected dashed line */}
        {connectExpected.length >= 2 && (
          <Path
            d={createSmoothPath(connectExpected)}
            stroke={Colors.primary}
            strokeWidth={2}
            strokeOpacity={0.4}
            strokeDasharray="6,4"
            fill="none"
            strokeLinecap="round"
          />
        )}

        {/* Data points */}
        {points.map((point, index) => (
          <Circle
            key={index}
            cx={point.x}
            cy={point.y}
            r={point.isExpected ? 4 : 5}
            fill={point.isExpected ? 'rgba(187,224,255,0.3)' : Colors.white}
            stroke={Colors.primary}
            strokeWidth={2}
          />
        ))}

        {/* First & last weight labels */}
        {realPoints.length >= 2 && (
          <>
            <SvgText
              x={realPoints[0].x}
              y={realPoints[0].y - 10}
              fontSize={10}
              fill="rgba(255,255,255,0.6)"
              textAnchor="middle"
              fontWeight="600"
            >
              {realPoints[0].weight.toFixed(1)}
            </SvgText>
            <SvgText
              x={realPoints[realPoints.length - 1].x}
              y={realPoints[realPoints.length - 1].y - 10}
              fontSize={11}
              fill={Colors.white}
              textAnchor="middle"
              fontWeight="700"
            >
              {realPoints[realPoints.length - 1].weight.toFixed(1)}
            </SvgText>
          </>
        )}

        {/* X-axis labels */}
        {points.map((point, index) => {
          const label = getDateLabel(point.date, index);
          if (!label) return null;
          return (
            <SvgText
              key={`label-${index}`}
              x={point.x}
              y={CHART_HEIGHT - 8}
              fontSize={10}
              fill="rgba(255,255,255,0.5)"
              textAnchor="middle"
            >
              {label}
            </SvgText>
          );
        })}
      </Svg>
    );
  };

  const getPeriodLabel = () => {
    switch (activeTab) {
      case 'day': return t('progress.day').toLowerCase();
      case 'week': return t('progress.week').toLowerCase();
      case 'month': return t('progress.month').toLowerCase();
      default: return '';
    }
  };

  const tabs = [
    { key: 'day', label: t('progress.day') },
    { key: 'week', label: t('progress.week') },
    { key: 'month', label: t('progress.month') },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('progress.title').toUpperCase()}</Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && styles.tabActive]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.content}>
          {isLoading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="small" color={Colors.primary} />
            </View>
          )}

          {/* Weight Chart Card */}
          <Card style={styles.chartCard}>
            <Text style={styles.chartTitle}>{t('progress.weight')}</Text>
            
            <View style={styles.chartContainer}>
              {renderWeightChart()}
            </View>

            <Text style={styles.weightValue}>
              {currentWeight.toFixed(1)} {t('units.kg')}
            </Text>
            <Text style={[
              styles.weightChange, 
              weightChange > 0 && styles.weightChangeUp,
              weightChange < 0 && styles.weightChangeDown,
            ]}>
              {weightChange > 0 ? '+' : ''}{weightChange.toFixed(1)} {t('units.kg')} {t('progress.for')} {getPeriodLabel()}
            </Text>
          </Card>

          {/* Calories & Goals Card */}
          <Card style={styles.chartCard}>
            <Text style={styles.chartTitle}>{t('progress.nutrition')}</Text>
            
            {/* Calories */}
            <View style={styles.nutritionRow}>
              <View style={styles.nutritionInfo}>
                <Text style={styles.nutritionLabel}>{t('diary.calories')}</Text>
                <Text style={styles.nutritionValue}>
                  {Math.round(averages.calories).toLocaleString()} 
                  <Text style={styles.nutritionGoal}> / {Math.round(goals.calories).toLocaleString()} {t('diary.kcal')}</Text>
                </Text>
              </View>
              <View style={styles.progressBarContainer}>
                <View style={[styles.progressBar, { width: `${Math.min((averages.calories / goals.calories) * 100, 100)}%` }]} />
              </View>
            </View>

            {/* Water */}
            <View style={styles.nutritionRow}>
              <View style={styles.nutritionInfo}>
                <Text style={styles.nutritionLabel}>{t('water.title')}</Text>
                <Text style={styles.nutritionValue}>
                  {(averages.water / 1000).toFixed(1)} 
                  <Text style={styles.nutritionGoal}> / {(goals.water / 1000).toFixed(1)} {t('units.l')}</Text>
                </Text>
              </View>
              <View style={styles.progressBarContainer}>
                <View style={[styles.progressBar, styles.progressBarWater, { width: `${Math.min((averages.water / goals.water) * 100, 100)}%` }]} />
              </View>
            </View>
          </Card>

          {/* Macros Card */}
          <Card style={styles.chartCard}>
            <Text style={styles.chartTitle}>{t('progress.macros')}</Text>
            
            <View style={styles.macrosGrid}>
              {/* Protein */}
              <View style={styles.macroItem}>
                <View style={[styles.macroIcon, { backgroundColor: 'rgba(255, 173, 143, 0.2)' }]}>
                  <Text style={[styles.macroIconText, { color: '#FFAD8F' }]}>Б</Text>
                </View>
                <Text style={styles.macroValue}>{Math.round(averages.protein)}{t('units.g')}</Text>
                <Text style={styles.macroGoal}>/ {Math.round(goals.protein)}{t('units.g')}</Text>
                <View style={styles.macroProgressContainer}>
                  <View style={[styles.macroProgress, { width: `${Math.min((averages.protein / goals.protein) * 100, 100)}%`, backgroundColor: '#FFAD8F' }]} />
                </View>
              </View>

              {/* Carbs */}
              <View style={styles.macroItem}>
                <View style={[styles.macroIcon, { backgroundColor: 'rgba(187, 224, 255, 0.2)' }]}>
                  <Text style={[styles.macroIconText, { color: '#BBE0FF' }]}>В</Text>
                </View>
                <Text style={styles.macroValue}>{Math.round(averages.carbs)}{t('units.g')}</Text>
                <Text style={styles.macroGoal}>/ {Math.round(goals.carbs)}{t('units.g')}</Text>
                <View style={styles.macroProgressContainer}>
                  <View style={[styles.macroProgress, { width: `${Math.min((averages.carbs / goals.carbs) * 100, 100)}%`, backgroundColor: '#BBE0FF' }]} />
                </View>
              </View>

              {/* Fats */}
              <View style={styles.macroItem}>
                <View style={[styles.macroIcon, { backgroundColor: 'rgba(254, 255, 252, 0.2)' }]}>
                  <Text style={[styles.macroIconText, { color: '#FEFFFC' }]}>Ж</Text>
                </View>
                <Text style={styles.macroValue}>{Math.round(averages.fats)}{t('units.g')}</Text>
                <Text style={styles.macroGoal}>/ {Math.round(goals.fats)}{t('units.g')}</Text>
                <View style={styles.macroProgressContainer}>
                  <View style={[styles.macroProgress, { width: `${Math.min((averages.fats / goals.fats) * 100, 100)}%`, backgroundColor: '#FEFFFC' }]} />
                </View>
              </View>
            </View>
          </Card>

          {/* Weight Stats Row */}
          <View style={styles.statsGrid}>
            <Card style={styles.statCard}>
              <Text style={styles.statLabel}>{t('progress.average')}</Text>
              <Text style={styles.statValue}>{avgWeight > 0 ? avgWeight.toFixed(1) : '-'} {t('units.kg')}</Text>
            </Card>
            <Card style={styles.statCard}>
              <Text style={styles.statLabel}>{t('progress.minWeight')}</Text>
              <Text style={styles.statValue}>{minWeight > 0 ? minWeight.toFixed(1) : '-'} {t('units.kg')}</Text>
            </Card>
          </View>

          {/* Analytics: Goal Progress & BMI */}
          {profile && (
            <Card style={styles.chartCard}>
              <View style={styles.analyticsHeader}>
                <Ionicons name="analytics-outline" size={20} color={Colors.primary} />
                <Text style={styles.chartTitle}>{t('progress.analytics')}</Text>
              </View>

              {/* BMI indicator */}
              <View style={styles.bmiRow}>
                <Text style={styles.bmiLabel}>BMI</Text>
                <View style={styles.bmiRight}>
                  <Text style={[styles.bmiValue, { color: analytics.bmiColor }]}>
                    {analytics.bmi > 0 ? analytics.bmi.toFixed(1) : '-'}
                  </Text>
                  <View style={[styles.bmiCategoryBadge, { backgroundColor: analytics.bmiColor + '22' }]}>
                    <Text style={[styles.bmiCategoryText, { color: analytics.bmiColor }]}>
                      {t(`progress.bmi_${analytics.bmiCategory || 'normal'}`)}
                    </Text>
                  </View>
                </View>
              </View>

              {/* BMI scale bar */}
              <View style={styles.bmiScaleContainer}>
                <View style={styles.bmiScale}>
                  <View style={[styles.bmiSegment, { flex: 17.59, backgroundColor: '#4FC3F7' }]} />
                  <View style={[styles.bmiSegment, { flex: 7.41, backgroundColor: '#4CAF50' }]} />
                  <View style={[styles.bmiSegment, { flex: 5, backgroundColor: '#FFB800' }]} />
                  <View style={[styles.bmiSegment, { flex: 10, backgroundColor: '#FF6B6B' }]} />
                </View>
                {analytics.bmi > 0 && (
                  <View style={[styles.bmiPointer, { 
                    left: `${Math.min(Math.max(((analytics.bmi - 15) / 25) * 100, 0), 100)}%` 
                  }]}>
                    <View style={styles.bmiPointerDot} />
                  </View>
                )}
              </View>

              {/* Weight goal progress */}
              {analytics.targetW > 0 && analytics.targetW !== analytics.currentW && (
                <View style={styles.goalSection}>
                  <View style={styles.goalHeader}>
                    <Text style={styles.goalLabel}>{t('progress.goalProgress')}</Text>
                    <Text style={styles.goalPercent}>{analytics.goalPercent}%</Text>
                  </View>
                  <View style={styles.goalBarBg}>
                    <View style={[styles.goalBarFill, { width: `${analytics.goalPercent}%` }]} />
                  </View>
                  <View style={styles.goalWeights}>
                    <Text style={styles.goalWeightText}>
                      {analytics.startWeight.toFixed(1)} {t('units.kg')}
                    </Text>
                    <Text style={[styles.goalWeightText, { color: Colors.primary }]}>
                      {analytics.targetW.toFixed(1)} {t('units.kg')}
                    </Text>
                  </View>

                  {/* Estimated time to goal */}
                  {analytics.estimatedWeeks && (
                    <View style={styles.estimateRow}>
                      <Ionicons name="time-outline" size={14} color={Colors.textSecondary} />
                      <Text style={styles.estimateText}>
                        {t('progress.estimatedTime', { weeks: analytics.estimatedWeeks })}
                      </Text>
                    </View>
                  )}
                </View>
              )}

              {/* Weekly change trend */}
              {weightHistory.length >= 2 && (
                <View style={styles.trendRow}>
                  <View style={styles.trendItem}>
                    <Ionicons 
                      name={analytics.weeklyChange < 0 ? 'trending-down' : analytics.weeklyChange > 0 ? 'trending-up' : 'remove-outline'} 
                      size={18} 
                      color={analytics.weeklyChange < 0 ? '#4CAF50' : analytics.weeklyChange > 0 ? '#FF6B6B' : Colors.textSecondary} 
                    />
                    <Text style={styles.trendLabel}>{t('progress.weeklyTrend')}</Text>
                    <Text style={[
                      styles.trendValue,
                      analytics.weeklyChange < 0 && { color: '#4CAF50' },
                      analytics.weeklyChange > 0 && { color: '#FF6B6B' },
                    ]}>
                      {analytics.weeklyChange > 0 ? '+' : ''}{analytics.weeklyChange.toFixed(2)} {t('units.kg')}/{t('progress.weekShort')}
                    </Text>
                  </View>
                </View>
              )}
            </Card>
          )}

          {/* Consistency Score Card */}
          {currentStats?.averages && currentStats?.goals && (
            <Card style={styles.chartCard}>
              <View style={styles.analyticsHeader}>
                <Ionicons name="checkmark-done-outline" size={20} color={Colors.primary} />
                <Text style={styles.chartTitle}>{t('progress.consistencyTitle')}</Text>
              </View>

              {/* Overall score circle */}
              <View style={styles.scoreCenter}>
                <View style={[styles.scoreCircle, { borderColor: getScoreColor(analytics.overallScore) }]}>
                  <Text style={[styles.scoreNumber, { color: getScoreColor(analytics.overallScore) }]}>
                    {analytics.overallScore}
                  </Text>
                  <Text style={styles.scoreOf}>/100</Text>
                </View>
                <Text style={styles.scoreLabel}>{t('progress.overallScore')}</Text>
              </View>

              {/* Individual consistency bars */}
              <View style={styles.consistencyList}>
                <View style={styles.consistencyItem}>
                  <Text style={styles.consistencyLabel}>{t('diary.calories')}</Text>
                  <View style={styles.consistencyBarBg}>
                    <View style={[styles.consistencyBarFill, { 
                      width: `${Math.min(analytics.calorieConsistency, 100)}%`,
                      backgroundColor: getScoreColor(analytics.calorieConsistency),
                    }]} />
                  </View>
                  <Text style={styles.consistencyPercent}>{Math.round(analytics.calorieConsistency)}%</Text>
                </View>

                <View style={styles.consistencyItem}>
                  <Text style={styles.consistencyLabel}>{t('water.title')}</Text>
                  <View style={styles.consistencyBarBg}>
                    <View style={[styles.consistencyBarFill, { 
                      width: `${Math.min(analytics.waterConsistency, 100)}%`,
                      backgroundColor: getScoreColor(analytics.waterConsistency),
                    }]} />
                  </View>
                  <Text style={styles.consistencyPercent}>{Math.round(analytics.waterConsistency)}%</Text>
                </View>

                <View style={styles.consistencyItem}>
                  <Text style={styles.consistencyLabel}>{t('diary.protein')}</Text>
                  <View style={styles.consistencyBarBg}>
                    <View style={[styles.consistencyBarFill, { 
                      width: `${Math.min(analytics.proteinConsistency, 100)}%`,
                      backgroundColor: getScoreColor(analytics.proteinConsistency),
                    }]} />
                  </View>
                  <Text style={styles.consistencyPercent}>{Math.round(analytics.proteinConsistency)}%</Text>
                </View>
              </View>
            </Card>
          )}

          {/* Calories Bar Chart */}
          <Card style={styles.chartCard}>
            <Text style={styles.chartTitle}>{t('progress.caloriesFor')} {getPeriodLabel()}</Text>
            <View style={styles.barsContainer}>
              {(() => {
                const dailyData = getDailyData();
                
                // For day view, show single value card instead of bars
                if (activeTab === 'day' && dailyData.length > 0) {
                  const todayData = dailyData[dailyData.length - 1];
                  return (
                    <View style={styles.dayValueContainer}>
                      <Text style={styles.dayValueText}>{Math.round(todayData?.calories || 0)}</Text>
                      <Text style={styles.dayValueLabel}>{t('diary.kcal')}</Text>
                    </View>
                  );
                }
                
                // For week - show 7 bars, for month - show sampled data
                const barsToShow = activeTab === 'month' 
                  ? dailyData.filter((_, i) => i % 4 === 0 || i === dailyData.length - 1).slice(-8)
                  : dailyData;
                
                if (barsToShow.length === 0) {
                  return (
                    <View style={styles.chartEmpty}>
                      <Text style={styles.chartEmptyText}>{t('progress.noData')}</Text>
                    </View>
                  );
                }
                
                const maxCal = Math.max(...barsToShow.map(d => d.calories), goals.calories, 1);
                const goalHeightPercent = (goals.calories / maxCal) * 100;
                
                return (
                  <View style={{ width: '100%', height: 160, position: 'relative' }}>
                    {/* Goal line */}
                    <View style={[styles.goalLine, { bottom: 20 + (goalHeightPercent / 100) * 100 }]}>
                      <View style={styles.goalLineDash} />
                      <Text style={styles.goalLineLabel}>{Math.round(goals.calories)} {t('progress.goalLabel')}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', flex: 1, paddingTop: 20 }}>
                      {barsToShow.map((item, index) => {
                        const heightPercent = (item.calories / maxCal) * 100;
                        const overGoal = item.calories > goals.calories;
                        return (
                          <View key={index} style={styles.barItem}>
                            <Text style={styles.barValue}>{Math.round(item.calories / 100) * 100}</Text>
                            <View style={styles.barTrack}>
                              <View style={[styles.bar, { height: `${Math.max(heightPercent, 5)}%` }, overGoal && styles.barOverGoal]} />
                            </View>
                            <Text style={styles.barLabel}>
                              {activeTab === 'month' 
                                ? new Date(item.date).toLocaleDateString('uk-UA', { day: 'numeric' })
                                : new Date(item.date).toLocaleDateString('uk-UA', { weekday: 'short' }).slice(0, 2)
                              }
                            </Text>
                          </View>
                        );
                      })}
                    </View>
                  </View>
                );
              })()}
            </View>
          </Card>

          {/* Macro Distribution Card */}
          {averages.protein + averages.carbs + averages.fats > 0 && (
            <Card style={styles.chartCard}>
              <Text style={styles.chartTitle}>{t('progress.macroDistribution')}</Text>
              <View style={styles.macroDistRow}>
                {(() => {
                  const total = averages.protein * 4 + averages.carbs * 4 + averages.fats * 9;
                  const protPct = total > 0 ? Math.round((averages.protein * 4 / total) * 100) : 0;
                  const carbPct = total > 0 ? Math.round((averages.carbs * 4 / total) * 100) : 0;
                  const fatPct = total > 0 ? 100 - protPct - carbPct : 0;
                  return (
                    <>
                      <View style={styles.macroDistBar}>
                        <View style={[styles.macroDistSegment, { flex: protPct, backgroundColor: '#FFAD8F' }]} />
                        <View style={[styles.macroDistSegment, { flex: carbPct, backgroundColor: '#BBE0FF' }]} />
                        <View style={[styles.macroDistSegment, { flex: fatPct, backgroundColor: '#FEFFFC' }]} />
                      </View>
                      <View style={styles.macroDistLegend}>
                        <View style={styles.macroDistLegendItem}>
                          <View style={[styles.macroDistDot, { backgroundColor: '#FFAD8F' }]} />
                          <Text style={styles.macroDistLabel}>{t('diary.protein')} {protPct}%</Text>
                        </View>
                        <View style={styles.macroDistLegendItem}>
                          <View style={[styles.macroDistDot, { backgroundColor: '#BBE0FF' }]} />
                          <Text style={styles.macroDistLabel}>{t('diary.carbs')} {carbPct}%</Text>
                        </View>
                        <View style={styles.macroDistLegendItem}>
                          <View style={[styles.macroDistDot, { backgroundColor: '#FEFFFC' }]} />
                          <Text style={styles.macroDistLabel}>{t('diary.fats')} {fatPct}%</Text>
                        </View>
                      </View>
                    </>
                  );
                })()}
              </View>
            </Card>
          )}
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
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    padding: 20,
    paddingTop: 50,
  },
  title: {
    fontSize: 20,
    fontWeight: '500',
    color: Colors.primary,
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 20,
    gap: 24,
    marginBottom: 8,
  },
  tab: {
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    marginBottom: -1,
  },
  tabActive: {
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.primary,
  },
  content: {
    padding: 20,
    gap: 16,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  chartCard: {
    gap: 12,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.white,
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  chartEmpty: {
    height: CHART_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  chartEmptyText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  weightValue: {
    fontSize: 36,
    fontWeight: '700',
    color: Colors.white,
    textAlign: 'center',
    marginTop: 8,
  },
  weightChange: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  weightChangeUp: {
    color: '#FF6B6B',
  },
  weightChangeDown: {
    color: '#4CAF50',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    gap: 8,
  },
  statLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '600',
    color: Colors.white,
  },
  // Nutrition stats
  nutritionRow: {
    marginBottom: 16,
  },
  nutritionInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  nutritionLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  nutritionValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  nutritionGoal: {
    fontSize: 14,
    fontWeight: '400',
    color: Colors.textSecondary,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: 'rgba(187, 224, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  progressBarWater: {
    backgroundColor: '#4FC3F7',
  },
  // Macros
  macrosGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  macroItem: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  macroIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  macroIconText: {
    fontSize: 18,
    fontWeight: '700',
  },
  macroValue: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.white,
  },
  macroGoal: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  macroProgressContainer: {
    width: '80%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 4,
  },
  macroProgress: {
    height: '100%',
    borderRadius: 2,
  },
  barsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 160,
    paddingTop: 20,
  },
  dayValueContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 140,
  },
  dayValueText: {
    fontSize: 48,
    fontWeight: '700',
    color: Colors.white,
  },
  dayValueLabel: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  barItem: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  barValue: {
    fontSize: 9,
    color: Colors.textSecondary,
  },
  barTrack: {
    width: 28,
    height: 100,
    backgroundColor: 'rgba(187, 224, 255, 0.08)',
    borderRadius: 6,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  bar: {
    width: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 6,
  },
  barOverGoal: {
    backgroundColor: '#FF6B6B',
  },
  barLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    textTransform: 'capitalize',
  },
  goalLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
    gap: 4,
  },
  goalLineDash: {
    flex: 1,
    height: 1,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: 'rgba(255,173,143,0.5)',
  },
  goalLineLabel: {
    fontSize: 9,
    color: 'rgba(255,173,143,0.7)',
    fontWeight: '500',
  },
  // Macro distribution
  macroDistRow: {
    gap: 12,
    marginTop: 8,
  },
  macroDistBar: {
    flexDirection: 'row',
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
    gap: 2,
  },
  macroDistSegment: {
    height: '100%',
    borderRadius: 4,
  },
  macroDistLegend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  macroDistLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  macroDistDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  macroDistLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  // Analytics
  analyticsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bmiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  bmiLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  bmiRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bmiValue: {
    fontSize: 22,
    fontWeight: '700',
  },
  bmiCategoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  bmiCategoryText: {
    fontSize: 12,
    fontWeight: '600',
  },
  bmiScaleContainer: {
    marginTop: 8,
    position: 'relative',
    height: 20,
  },
  bmiScale: {
    flexDirection: 'row',
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 7,
  },
  bmiSegment: {
    height: '100%',
  },
  bmiPointer: {
    position: 'absolute',
    top: 0,
    marginLeft: -6,
  },
  bmiPointerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  goalSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  goalLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  goalPercent: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
  },
  goalBarBg: {
    height: 10,
    backgroundColor: 'rgba(187, 224, 255, 0.1)',
    borderRadius: 5,
    overflow: 'hidden',
  },
  goalBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 5,
  },
  goalWeights: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  goalWeightText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  estimateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },
  estimateText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  trendRow: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  trendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  trendLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    flex: 1,
  },
  trendValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
  },
  // Consistency
  scoreCenter: {
    alignItems: 'center',
    marginVertical: 12,
  },
  scoreCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  scoreNumber: {
    fontSize: 28,
    fontWeight: '800',
  },
  scoreOf: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: -2,
  },
  scoreLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  consistencyList: {
    gap: 12,
  },
  consistencyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  consistencyLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    width: 70,
  },
  consistencyBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  consistencyBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  consistencyPercent: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.white,
    width: 38,
    textAlign: 'right',
  },
});
