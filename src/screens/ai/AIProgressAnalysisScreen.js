import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, Circle, Line, Defs, LinearGradient, Stop, Text as SvgText } from 'react-native-svg';
import { Colors } from '../../constants/colors';
import { PremiumGate } from '../../components/PremiumGate';
import { useTranslation } from '../../i18n';
import { useProgressStore, useAuthStore } from '../../store';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const AnalysisCard = ({ title, icon, children }) => (
  <View style={styles.analysisCard}>
    <View style={styles.cardHeader}>
      <Ionicons name={icon} size={24} color={Colors.primary} />
      <Text style={styles.cardTitle}>{title}</Text>
    </View>
    {children}
  </View>
);

const StatRow = ({ label, value, target, unit, color }) => {
  const percentage = target ? Math.min((value / target) * 100, 100) : 0;
  return (
    <View style={styles.statRow}>
      <View style={styles.statHeader}>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={styles.statValue}>
          {Math.round(value)} <Text style={styles.statTarget}>/ {Math.round(target)} {unit}</Text>
        </Text>
      </View>
      <View style={styles.statBarBg}>
        <View style={[styles.statBarFill, { width: `${percentage}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
};

const RecommendationItem = ({ icon, text, type }) => (
  <View style={[styles.recommendationItem, type === 'warning' && styles.recommendationWarning]}>
    <Ionicons 
      name={icon} 
      size={20} 
      color={type === 'warning' ? '#FFB800' : type === 'success' ? '#4CAF50' : Colors.primary} 
    />
    <Text style={styles.recommendationText}>{text}</Text>
  </View>
);

export const AIProgressAnalysisScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { weeklyStats, monthlyStats, weightHistory, fetchWeeklyStats, fetchMonthlyStats, fetchWeightHistory, isLoading } = useProgressStore();
  const [analyzing, setAnalyzing] = useState(true);
  const [recommendations, setRecommendations] = useState([]);

  const hasMounted = useRef(false);

  // Fetch fresh data on every focus (also covers first mount)
  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        if (!hasMounted.current) setAnalyzing(true);
        await Promise.all([fetchWeeklyStats(), fetchMonthlyStats(), fetchWeightHistory(14)]);
        if (!hasMounted.current) {
          // First mount — run AI analysis with delay
          setTimeout(() => {
            generateRecommendations();
            setAnalyzing(false);
          }, 1500);
          hasMounted.current = true;
        } else {
          // Subsequent focuses — just refresh recommendations instantly
          generateRecommendations();
        }
      };
      loadData();
    }, [fetchWeeklyStats, fetchMonthlyStats, fetchWeightHistory])
  );

  const generateRecommendations = useCallback(() => {
    const stats = weeklyStats || monthlyStats;
    const recs = [];
    
    if (stats?.averages && stats?.goals) {
      const { averages, goals } = stats;
      
      // Calorie analysis
      const calorieRatio = averages.calories / goals.calories;
      if (calorieRatio < 0.8) {
        recs.push({
          icon: 'warning-outline',
          text: t('progressAnalysis.lowCalories'),
          type: 'warning',
        });
      } else if (calorieRatio > 1.2) {
        recs.push({
          icon: 'warning-outline',
          text: t('progressAnalysis.highCalories'),
          type: 'warning',
        });
      } else {
        recs.push({
          icon: 'checkmark-circle-outline',
          text: t('progressAnalysis.goodCalories'),
          type: 'success',
        });
      }
      
      // Protein analysis
      const proteinRatio = averages.protein / goals.protein;
      if (proteinRatio < 0.8) {
        recs.push({
          icon: 'fitness-outline',
          text: t('progressAnalysis.lowProtein'),
          type: 'warning',
        });
      } else {
        recs.push({
          icon: 'checkmark-circle-outline',
          text: t('progressAnalysis.goodProtein'),
          type: 'success',
        });
      }
      
      // Water analysis
      const waterRatio = averages.water / goals.water;
      if (waterRatio < 0.7) {
        recs.push({
          icon: 'water-outline',
          text: t('progressAnalysis.lowWater'),
          type: 'warning',
        });
      } else {
        recs.push({
          icon: 'checkmark-circle-outline',
          text: t('progressAnalysis.goodWater'),
          type: 'success',
        });
      }
    }
    
    // Add general recommendations
    recs.push({
      icon: 'bulb-outline',
      text: t('progressAnalysis.tipConsistency'),
      type: 'info',
    });
    
    setRecommendations(recs);
  }, [weeklyStats, monthlyStats, t]);

  const stats = weeklyStats || monthlyStats;
  const profile = user?.profile;

  // === Analytics computations ===
  const analytics = useMemo(() => {
    const result = { bmi: 0, bmiColor: '#4CAF50', bmiCategory: '', weeklyChange: 0, goalPercent: 0, overallScore: 0 };
    if (!profile) return result;
    const heightM = (profile.height || 170) / 100;
    const cw = profile.currentWeight || 0;
    const tw = profile.targetWeight || cw;
    if (heightM > 0 && cw > 0) {
      result.bmi = cw / (heightM * heightM);
      if (result.bmi < 17.59) { result.bmiCategory = 'underweight'; result.bmiColor = '#4FC3F7'; }
      else if (result.bmi < 25) { result.bmiCategory = 'normal'; result.bmiColor = '#4CAF50'; }
      else if (result.bmi < 30) { result.bmiCategory = 'overweight'; result.bmiColor = '#FFB800'; }
      else { result.bmiCategory = 'obese'; result.bmiColor = '#FF6B6B'; }
    }
    if (weightHistory && weightHistory.length >= 2) {
      const real = weightHistory.filter(w => !w.isExpected);
      if (real.length >= 2) {
        const days = Math.max((new Date(real[real.length-1].date) - new Date(real[0].date)) / 86400000, 1);
        result.weeklyChange = ((real[real.length-1].weight - real[0].weight) / days) * 7;
      }
    }
    const startW = weightHistory?.length > 0 ? weightHistory[0].weight : cw;
    const totalToChange = Math.abs(startW - tw);
    if (totalToChange > 0.1) {
      const goingDown = tw < startW;
      const moved = goingDown ? startW - cw : cw - startW;
      result.goalPercent = moved > 0 ? Math.min(Math.round((moved / totalToChange) * 100), 100) : 0;
    }
    // Overall score
    if (stats?.averages && stats?.goals) {
      const a = stats.averages;
      const g = stats.goals;
      const calScore = g.calories > 0 ? Math.max(0, 100 - Math.abs(((a.calories - g.calories) / g.calories) * 100)) : 0;
      const waterScore = g.water > 0 ? Math.min(100, (a.water / g.water) * 100) : 0;
      const protScore = g.protein > 0 ? Math.min(100, (a.protein / g.protein) * 100) : 0;
      result.overallScore = Math.round(calScore * 0.4 + waterScore * 0.3 + protScore * 0.3);
    }
    return result;
  }, [profile, weightHistory, stats]);

  // Weight chart for AI screen
  const renderWeightMiniChart = () => {
    if (!weightHistory || weightHistory.length < 2) return null;
    const data = weightHistory.slice(-14).filter(w => !w.isExpected);
    if (data.length < 2) return null;
    const chartW = width - 80;
    const chartH = 120;
    const pad = { top: 18, right: 10, bottom: 20, left: 35 };
    const innerW = chartW - pad.left - pad.right;
    const innerH = chartH - pad.top - pad.bottom;
    const weights = data.map(d => d.weight);
    const tw = profile?.targetWeight || 0;
    if (tw > 0) weights.push(tw);
    const minW = Math.min(...weights) - 1;
    const maxW = Math.max(...weights) + 1;
    const range = maxW - minW || 1;
    const dataWeights = data.map(d => d.weight);
    const points = data.map((entry, i) => ({
      x: pad.left + (i / (data.length - 1)) * innerW,
      y: pad.top + (1 - (entry.weight - minW) / range) * innerH,
      weight: entry.weight,
    }));
    const targetY = tw > 0 ? pad.top + (1 - (tw - minW) / range) * innerH : null;
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      path += ` L ${points[i].x} ${points[i].y}`;
    }
    const areaPath = `${path} L ${points[points.length-1].x} ${chartH - pad.bottom} L ${points[0].x} ${chartH - pad.bottom} Z`;
    const delta = points[points.length-1].weight - points[0].weight;
    return (
      <Svg width={chartW} height={chartH}>
        <Defs>
          <LinearGradient id="aiWeightGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={Colors.primary} stopOpacity={0.3} />
            <Stop offset="100%" stopColor={Colors.primary} stopOpacity={0.02} />
          </LinearGradient>
        </Defs>
        {/* Y-axis labels */}
        <SvgText x={pad.left - 6} y={pad.top + 4} fontSize={9} fill="rgba(255,255,255,0.4)" textAnchor="end">{maxW.toFixed(1)}</SvgText>
        <SvgText x={pad.left - 6} y={chartH - pad.bottom + 4} fontSize={9} fill="rgba(255,255,255,0.4)" textAnchor="end">{minW.toFixed(1)}</SvgText>
        {/* Target weight line */}
        {targetY != null && (
          <>
            <Line x1={pad.left} y1={targetY} x2={chartW - pad.right} y2={targetY} stroke="#4CAF50" strokeWidth={1} strokeDasharray="4,3" strokeOpacity={0.7} />
            <SvgText x={chartW - pad.right} y={targetY - 3} fontSize={8} fill="#4CAF50" textAnchor="end" opacity={0.8}>
              {t('progress.targetLabel')} {tw.toFixed(1)}
            </SvgText>
          </>
        )}
        <Path d={areaPath} fill="url(#aiWeightGrad)" />
        <Path d={path} stroke={Colors.primary} strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((p, i) => (
          <Circle key={i} cx={p.x} cy={p.y} r={i === points.length - 1 ? 5 : 3} fill={i === points.length - 1 ? Colors.primary : Colors.white} stroke={Colors.primary} strokeWidth={1.5} />
        ))}
        {/* First weight label */}
        <SvgText x={points[0].x} y={points[0].y - 8} fontSize={9} fill="rgba(255,255,255,0.6)" textAnchor="middle" fontWeight="600">
          {points[0].weight.toFixed(1)}
        </SvgText>
        {/* Last weight label + delta */}
        <SvgText x={points[points.length-1].x} y={points[points.length-1].y - 8} fontSize={10} fill={Colors.white} textAnchor="middle" fontWeight="700">
          {points[points.length-1].weight.toFixed(1)}
        </SvgText>
        {delta !== 0 && (
          <SvgText x={points[points.length-1].x} y={points[points.length-1].y + 15} fontSize={9} fill={delta < 0 ? '#4CAF50' : '#FF6B6B'} textAnchor="middle" fontWeight="600">
            {delta > 0 ? '+' : ''}{delta.toFixed(1)}
          </SvgText>
        )}
      </Svg>
    );
  };

  // Calorie daily bars for AI screen
  const renderCalorieMiniChart = () => {
    const dailyData = stats?.dailyData;
    if (!dailyData || dailyData.length === 0) return null;
    const bars = dailyData.slice(-7);
    const goalCal = stats?.goals?.calories || 2000;
    const maxCal = Math.max(...bars.map(d => d.calories), goalCal, 1);
    const barChartH = 80;
    return (
      <View style={{ marginTop: 8 }}>
        <View style={{ height: barChartH, flexDirection: 'row', alignItems: 'flex-end', gap: 4, position: 'relative' }}>
          {/* Goal line */}
          <View style={[styles.aiGoalLine, { bottom: (goalCal / maxCal) * barChartH }]} />
          {bars.map((item, i) => {
            const h = Math.max((item.calories / maxCal) * barChartH, 4);
            const over = item.calories > goalCal;
            return (
              <View key={i} style={{ flex: 1, alignItems: 'center' }}>
                <View style={{ width: 20, height: h, backgroundColor: over ? '#FF6B6B' : Colors.primary, borderRadius: 4 }} />
              </View>
            );
          })}
        </View>
        <View style={{ flexDirection: 'row', marginTop: 4 }}>
          {bars.map((item, i) => (
            <View key={i} style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ fontSize: 9, color: Colors.textSecondary }}>
                {new Date(item.date).toLocaleDateString('uk-UA', { weekday: 'short' }).slice(0, 2)}
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <PremiumGate feature={t('ai.progressAnalysisTitle')}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color={Colors.white} />
          </TouchableOpacity>
          <Text style={styles.title}>{t('ai.progressAnalysisTitle')}</Text>
          <View style={{ width: 42 }} />
        </View>

        {analyzing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>{t('progressAnalysis.analyzing')}</Text>
          </View>
        ) : (
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Period Summary */}
            <AnalysisCard title={t('progressAnalysis.periodSummary')} icon="calendar-outline">
              {stats ? (
                <>
                  <Text style={styles.periodText}>
                    {stats.period?.days || 7} {t('progressAnalysis.daysAnalyzed')}
                  </Text>
                  <View style={styles.statsContainer}>
                    <StatRow 
                      label={t('diary.calories')} 
                      value={stats.averages?.calories || 0}
                      target={stats.goals?.calories || 2000}
                      unit={t('diary.kcal')}
                      color="#FFAD8F"
                    />
                    <StatRow 
                      label={t('diary.protein')} 
                      value={stats.averages?.protein || 0}
                      target={stats.goals?.protein || 150}
                      unit={t('units.g')}
                      color="#BBE0FF"
                    />
                    <StatRow 
                      label={t('water.title')} 
                      value={(stats.averages?.water || 0) / 1000}
                      target={(stats.goals?.water || 2500) / 1000}
                      unit={t('units.l')}
                      color="#4FC3F7"
                    />
                  </View>
                </>
              ) : (
                <Text style={styles.noDataText}>{t('progressAnalysis.noData')}</Text>
              )}
            </AnalysisCard>

            {/* Weight Progress with Chart */}
            {profile && (
              <AnalysisCard title={t('progressAnalysis.weightProgress')} icon="trending-down-outline">
                {/* Weight trend chart */}
                <View style={styles.miniChartContainer}>
                  {renderWeightMiniChart() || (
                    <Text style={styles.noDataText}>{t('progressAnalysis.noData')}</Text>
                  )}
                </View>

                <View style={styles.weightContainer}>
                  <View style={styles.weightItem}>
                    <Text style={styles.weightLabel}>{t('progressAnalysis.current')}</Text>
                    <Text style={styles.weightValue}>{profile.currentWeight} {t('units.kg')}</Text>
                  </View>
                  {profile.targetWeight && (
                    <>
                      <Ionicons name="arrow-forward" size={20} color={Colors.textSecondary} />
                      <View style={styles.weightItem}>
                        <Text style={styles.weightLabel}>{t('progressAnalysis.target')}</Text>
                        <Text style={styles.weightValue}>{profile.targetWeight} {t('units.kg')}</Text>
                      </View>
                    </>
                  )}
                </View>

                {/* Weekly trend badge */}
                {weightHistory && weightHistory.length >= 2 && (
                  <View style={styles.trendBadgeRow}>
                    <View style={[styles.trendBadge, { backgroundColor: analytics.weeklyChange < 0 ? 'rgba(76,175,80,0.15)' : analytics.weeklyChange > 0 ? 'rgba(255,107,107,0.15)' : 'rgba(255,255,255,0.08)' }]}>
                      <Ionicons 
                        name={analytics.weeklyChange < 0 ? 'trending-down' : analytics.weeklyChange > 0 ? 'trending-up' : 'remove-outline'}
                        size={16}
                        color={analytics.weeklyChange < 0 ? '#4CAF50' : analytics.weeklyChange > 0 ? '#FF6B6B' : Colors.textSecondary}
                      />
                      <Text style={[styles.trendBadgeText, { color: analytics.weeklyChange < 0 ? '#4CAF50' : analytics.weeklyChange > 0 ? '#FF6B6B' : Colors.white }]}>
                        {analytics.weeklyChange > 0 ? '+' : ''}{analytics.weeklyChange.toFixed(2)} {t('units.kg')}/{t('progress.weekShort')}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Goal progress bar */}
                {profile.targetWeight && profile.targetWeight !== profile.currentWeight && (
                  <View style={styles.aiGoalSection}>
                    <View style={styles.aiGoalHeader}>
                      <Text style={styles.aiGoalLabel}>{t('progress.goalProgress')}</Text>
                      <Text style={styles.aiGoalPercent}>{analytics.goalPercent}%</Text>
                    </View>
                    <View style={styles.aiGoalBarBg}>
                      <View style={[styles.aiGoalBarFill, { width: `${analytics.goalPercent}%` }]} />
                    </View>
                    <Text style={styles.weightDiff}>
                      {t('progressAnalysis.remaining')}: {Math.abs(profile.currentWeight - profile.targetWeight).toFixed(1)} {t('units.kg')}
                    </Text>
                  </View>
                )}
              </AnalysisCard>
            )}

            {/* BMI Card */}
            {profile && analytics.bmi > 0 && (
              <AnalysisCard title="BMI" icon="body-outline">
                <View style={styles.bmiMainRow}>
                  <Text style={[styles.bmiMainValue, { color: analytics.bmiColor }]}>
                    {analytics.bmi.toFixed(1)}
                  </Text>
                  <View style={[styles.bmiMainBadge, { backgroundColor: analytics.bmiColor + '22' }]}>
                    <Text style={[styles.bmiMainText, { color: analytics.bmiColor }]}>
                      {t(`progress.bmi_${analytics.bmiCategory}`)}
                    </Text>
                  </View>
                </View>
                <View style={styles.bmiScaleWrap}>
                  <View style={styles.bmiScale}>
                    <View style={{ flex: 17.59, backgroundColor: '#4FC3F7', height: '100%' }} />
                    <View style={{ flex: 7.41, backgroundColor: '#4CAF50', height: '100%' }} />
                    <View style={{ flex: 5, backgroundColor: '#FFB800', height: '100%' }} />
                    <View style={{ flex: 10, backgroundColor: '#FF6B6B', height: '100%' }} />
                  </View>
                  <View style={[styles.bmiPointer, { left: `${Math.min(Math.max(((analytics.bmi - 15) / 25) * 100, 0), 100)}%` }]}>
                    <View style={styles.bmiPointerDot} />
                  </View>
                </View>
                <View style={styles.bmiLabels}>
                  <Text style={styles.bmiLabelText}>15</Text>
                  <Text style={styles.bmiLabelText}>17.6</Text>
                  <Text style={styles.bmiLabelText}>25</Text>
                  <Text style={styles.bmiLabelText}>30</Text>
                  <Text style={styles.bmiLabelText}>40</Text>
                </View>
              </AnalysisCard>
            )}

            {/* Calorie Trend Chart */}
            {stats?.dailyData && stats.dailyData.length > 0 && (
              <AnalysisCard title={t('progress.caloriesFor') + ' ' + t('progress.week').toLowerCase()} icon="bar-chart-outline">
                {renderCalorieMiniChart()}
                {/* Macro split bar */}
                {stats.averages && (stats.averages.protein + stats.averages.carbs + stats.averages.fats > 0) && (() => {
                  const total = stats.averages.protein * 4 + stats.averages.carbs * 4 + stats.averages.fats * 9;
                  const protPct = total > 0 ? Math.round((stats.averages.protein * 4 / total) * 100) : 0;
                  const carbPct = total > 0 ? Math.round((stats.averages.carbs * 4 / total) * 100) : 0;
                  const fatPct = total > 0 ? 100 - protPct - carbPct : 0;
                  return (
                    <View style={styles.macroDistSection}>
                      <Text style={styles.macroDistTitle}>{t('progress.macroDistribution')}</Text>
                      <View style={styles.macroDistBar}>
                        <View style={{ flex: protPct, backgroundColor: '#FFAD8F', height: '100%', borderRadius: 4 }} />
                        <View style={{ flex: carbPct, backgroundColor: '#BBE0FF', height: '100%', borderRadius: 4 }} />
                        <View style={{ flex: fatPct, backgroundColor: '#FEFFFC', height: '100%', borderRadius: 4 }} />
                      </View>
                      <View style={styles.macroDistLegend}>
                        <View style={styles.macroDistLegendItem}>
                          <View style={[styles.macroDistDot, { backgroundColor: '#FFAD8F' }]} />
                          <Text style={styles.macroDistLabelText}>{t('diary.protein')} {protPct}%</Text>
                        </View>
                        <View style={styles.macroDistLegendItem}>
                          <View style={[styles.macroDistDot, { backgroundColor: '#BBE0FF' }]} />
                          <Text style={styles.macroDistLabelText}>{t('diary.carbs')} {carbPct}%</Text>
                        </View>
                        <View style={styles.macroDistLegendItem}>
                          <View style={[styles.macroDistDot, { backgroundColor: '#FEFFFC' }]} />
                          <Text style={styles.macroDistLabelText}>{t('diary.fats')} {fatPct}%</Text>
                        </View>
                      </View>
                    </View>
                  );
                })()}
              </AnalysisCard>
            )}

            {/* Overall Score */}
            {analytics.overallScore > 0 && (
              <AnalysisCard title={t('progress.consistencyTitle')} icon="checkmark-done-outline">
                <View style={styles.scoreCenter}>
                  <View style={[styles.scoreCircle, { borderColor: analytics.overallScore >= 80 ? '#4CAF50' : analytics.overallScore >= 60 ? '#FFB800' : '#FF6B6B' }]}>
                    <Text style={[styles.scoreNumber, { color: analytics.overallScore >= 80 ? '#4CAF50' : analytics.overallScore >= 60 ? '#FFB800' : '#FF6B6B' }]}>
                      {analytics.overallScore}
                    </Text>
                    <Text style={styles.scoreOf}>/100</Text>
                  </View>
                  <Text style={styles.scoreLabel}>{t('progress.overallScore')}</Text>
                </View>
              </AnalysisCard>
            )}

            {/* AI Recommendations */}
            <AnalysisCard title={t('progressAnalysis.recommendations')} icon="sparkles">
              {recommendations.length > 0 ? (
                recommendations.map((rec, index) => (
                  <RecommendationItem 
                    key={index}
                    icon={rec.icon}
                    text={rec.text}
                    type={rec.type}
                  />
                ))
              ) : (
                <Text style={styles.noDataText}>{t('progressAnalysis.noRecommendations')}</Text>
              )}
            </AnalysisCard>

            {/* Action Tips */}
            <AnalysisCard title={t('progressAnalysis.actionTips')} icon="list-outline">
              <View style={styles.tipItem}>
                <Text style={styles.tipNumber}>1</Text>
                <Text style={styles.tipText}>{t('progressAnalysis.tip1')}</Text>
              </View>
              <View style={styles.tipItem}>
                <Text style={styles.tipNumber}>2</Text>
                <Text style={styles.tipText}>{t('progressAnalysis.tip2')}</Text>
              </View>
              <View style={styles.tipItem}>
                <Text style={styles.tipNumber}>3</Text>
                <Text style={styles.tipText}>{t('progressAnalysis.tip3')}</Text>
              </View>
            </AnalysisCard>

            <View style={{ height: 40 }} />
          </ScrollView>
        )}
      </SafeAreaView>
    </PremiumGate>
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
    width: 42,
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  analysisCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.white,
  },
  periodText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  statsContainer: {
    gap: 12,
  },
  statRow: {
    gap: 8,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: Colors.white,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
  },
  statTarget: {
    fontWeight: '400',
    color: Colors.textSecondary,
  },
  statBarBg: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  statBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  noDataText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingVertical: 20,
  },
  weightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 10,
  },
  weightItem: {
    alignItems: 'center',
    gap: 4,
  },
  weightLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  weightValue: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.white,
  },
  weightDiff: {
    fontSize: 14,
    color: Colors.primary,
    textAlign: 'center',
    marginTop: 8,
  },
  // Mini chart
  miniChartContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  // Trend badge
  trendBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  trendBadgeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  // Goal in AI screen
  aiGoalSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  aiGoalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  aiGoalLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  aiGoalPercent: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primary,
  },
  aiGoalBarBg: {
    height: 8,
    backgroundColor: 'rgba(187,224,255,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  aiGoalBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  aiGoalLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: 'rgba(255,173,143,0.4)',
    zIndex: 10,
  },
  // BMI
  bmiMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bmiMainValue: {
    fontSize: 32,
    fontWeight: '800',
  },
  bmiMainBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  bmiMainText: {
    fontSize: 13,
    fontWeight: '600',
  },
  bmiScaleWrap: {
    marginTop: 12,
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
  bmiLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  bmiLabelText: {
    fontSize: 9,
    color: Colors.textSecondary,
  },
  // Macro distribution
  macroDistSection: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
    gap: 10,
  },
  macroDistTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.white,
  },
  macroDistBar: {
    flexDirection: 'row',
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
    gap: 2,
  },
  macroDistLegend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  macroDistLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  macroDistDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  macroDistLabelText: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  // Score
  scoreCenter: {
    alignItems: 'center',
    marginVertical: 8,
  },
  scoreCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  scoreNumber: {
    fontSize: 26,
    fontWeight: '800',
  },
  scoreOf: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: -2,
  },
  scoreLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  recommendationWarning: {
    backgroundColor: 'rgba(255, 184, 0, 0.1)',
    marginHorizontal: -12,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderBottomWidth: 0,
    marginBottom: 8,
  },
  recommendationText: {
    flex: 1,
    fontSize: 14,
    color: Colors.white,
    lineHeight: 20,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 10,
  },
  tipNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    color: Colors.dark,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 24,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: Colors.white,
    lineHeight: 20,
  },
});
