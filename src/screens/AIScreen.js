import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Modal,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { Card } from '../components';
import { useTranslation } from '../i18n';
import { useAuthStore } from '../store/authStore';
import { subscriptionsApi } from '../api/endpoints';

const AICard = ({ title, description, actionText, onPress }) => (
  <TouchableOpacity onPress={onPress}>
    <Card style={styles.aiCard}>
      <View style={styles.aiCardContent}>
        <View style={styles.aiCardIcon}>
          <Ionicons name="sparkles" size={40} color={Colors.primary} />
        </View>
        <View style={styles.aiCardText}>
          <Text style={styles.aiCardTitle}>{title}</Text>
          <Text style={styles.aiCardDescription}>{description}</Text>
          <View style={styles.aiCardAction}>
            <Text style={styles.aiCardActionText}>{actionText}</Text>
            <Ionicons name="arrow-forward" size={20} color={Colors.white} />
          </View>
        </View>
      </View>
    </Card>
  </TouchableOpacity>
);

// Format card number with spaces
const formatCardNumber = (value) => {
  const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
  const matches = v.match(/\d{4,16}/g);
  const match = (matches && matches[0]) || '';
  const parts = [];
  for (let i = 0, len = match.length; i < len; i += 4) {
    parts.push(match.substring(i, i + 4));
  }
  return parts.length ? parts.join(' ') : v;
};

const formatExpiry = (value) => {
  const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
  if (v.length >= 2) {
    return v.substring(0, 2) + '/' + v.substring(2, 4);
  }
  return v;
};

export const AIScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const isPremium = useAuthStore((state) => state.isPremium);
  const setSubscription = useAuthStore((state) => state.setSubscription);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Card form state
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVV, setCardCVV] = useState('');
  const [cardName, setCardName] = useState('');

  const isCardValid = 
    cardNumber.replace(/\s/g, '').length >= 16 &&
    cardExpiry.length === 5 &&
    cardCVV.length >= 3 &&
    cardName.length >= 2;

  const benefits = [
    t('payment.benefit1'),
    t('payment.benefit2'),
    t('payment.benefit3'),
    t('payment.benefit4'),
    t('payment.benefit5'),
    t('payment.benefit6'),
  ];

  const handlePremiumFeature = (screen) => {
    if (isPremium) {
      navigation.navigate(screen);
    } else {
      setShowPaywall(true);
    }
  };

  const handleSelectPlan = () => {
    setShowPaywall(false);
    setShowPaymentForm(true);
  };

  const handlePayment = async () => {
    if (!isCardValid) return;
    setIsProcessing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const cardLast4 = cardNumber.replace(/\s/g, '').slice(-4);
      const response = await subscriptionsApi.activate({ 
        paymentId: `pay_${Date.now()}`,
        cardLast4 
      });
      setSubscription(response.data);
      setShowPaymentForm(false);
      setShowSuccessModal(true);
      setCardNumber('');
      setCardExpiry('');
      setCardCVV('');
      setCardName('');
    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert(t('common.error'), t('payment.paymentError'));
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.logoIcon}
            resizeMode="contain"
          />
          <Text style={styles.title}>{t('ai.assistant').toUpperCase()}</Text>
        </View>
        <TouchableOpacity
          style={styles.historyBtn}
          onPress={() => navigation.navigate('ChatHistory')}
        >
          <Ionicons name="chatbubbles-outline" size={22} color={Colors.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <AICard
          title={t('ai.dryPlanTitle')}
          description={t('ai.dryPlanDescription')}
          actionText={t('ai.tapToView')}
          onPress={() => handlePremiumFeature('AIDryPlan')}
        />

        <AICard
          title={t('ai.recipesTitle')}
          description={t('ai.recipesDescription')}
          actionText={t('ai.tapToView')}
          onPress={() => handlePremiumFeature('AIRecipes')}
        />

        <AICard
          title={t('ai.progressAnalysisTitle')}
          description={t('ai.progressAnalysisDescription')}
          actionText={t('ai.tapToView')}
          onPress={() => handlePremiumFeature('ProgressAnalysis')}
        />
      </View>

      {/* Paywall Modal */}
      <Modal
        visible={showPaywall}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPaywall(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowPaywall(false)}
            >
              <Ionicons name="close" size={24} color={Colors.white} />
            </TouchableOpacity>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>{t('payment.choosePlan')}</Text>
              <Text style={styles.modalSubtitle}>{t('ai.upgradeDescription')}</Text>

              <View style={styles.subscriptionCard}>
                <Text style={styles.subscriptionTitle}>BodyPro</Text>
                <Text style={styles.subscriptionPrice}>
                  274 UAH <Text style={styles.subscriptionPeriod}>/ month</Text>
                </Text>

                <TouchableOpacity
                  style={styles.selectButton}
                  onPress={handleSelectPlan}
                >
                  <Text style={styles.selectButtonText}>{t('payment.select')}</Text>
                </TouchableOpacity>

                <View style={styles.modalDivider} />

                <View style={styles.benefitsList}>
                  {benefits.map((benefit, index) => (
                    <View key={index} style={styles.benefitItem}>
                      <Ionicons name="flash" size={20} color={Colors.primary} />
                      <Text style={styles.benefitText}>{benefit}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Payment Card Modal */}
      <Modal
        visible={showPaymentForm}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPaymentForm(false)}
      >
        <KeyboardAvoidingView 
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.paymentModalOverlay}>
            <View style={styles.paymentModalContent}>
              <View style={styles.paymentModalHeader}>
                <Text style={styles.paymentModalTitle}>{t('payment.subscriptionPayment')}</Text>
                <TouchableOpacity 
                  style={styles.closeBtn}
                  onPress={() => setShowPaymentForm(false)}
                >
                  <Ionicons name="close" size={24} color={Colors.white} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.amountSection}>
                  <Text style={styles.amountLabel}>{t('payment.amountDue')}</Text>
                  <Text style={styles.amountValue}>274 UAH</Text>
                </View>

                <View style={styles.cardForm}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>{t('payment.cardNumber')}</Text>
                    <View style={styles.inputWrapper}>
                      <Ionicons name="card-outline" size={20} color="rgba(255,255,255,0.5)" />
                      <TextInput
                        style={styles.input}
                        value={cardNumber}
                        onChangeText={(text) => setCardNumber(formatCardNumber(text))}
                        placeholder="0000 0000 0000 0000"
                        placeholderTextColor="rgba(255,255,255,0.3)"
                        keyboardType="number-pad"
                        maxLength={19}
                      />
                    </View>
                  </View>

                  <View style={styles.rowInputs}>
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                      <Text style={styles.inputLabel}>{t('payment.expiry')}</Text>
                      <View style={styles.inputWrapper}>
                        <TextInput
                          style={styles.input}
                          value={cardExpiry}
                          onChangeText={(text) => setCardExpiry(formatExpiry(text))}
                          placeholder="MM/YY"
                          placeholderTextColor="rgba(255,255,255,0.3)"
                          keyboardType="number-pad"
                          maxLength={5}
                        />
                      </View>
                    </View>
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                      <Text style={styles.inputLabel}>CVV</Text>
                      <View style={styles.inputWrapper}>
                        <TextInput
                          style={styles.input}
                          value={cardCVV}
                          onChangeText={setCardCVV}
                          placeholder="***"
                          placeholderTextColor="rgba(255,255,255,0.3)"
                          keyboardType="number-pad"
                          maxLength={4}
                          secureTextEntry
                        />
                      </View>
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>{t('payment.cardholderName')}</Text>
                    <View style={styles.inputWrapper}>
                      <Ionicons name="person-outline" size={20} color="rgba(255,255,255,0.5)" />
                      <TextInput
                        style={styles.input}
                        value={cardName}
                        onChangeText={setCardName}
                        placeholder="IVAN PETRENKO"
                        placeholderTextColor="rgba(255,255,255,0.3)"
                        autoCapitalize="characters"
                      />
                    </View>
                  </View>
                </View>

                <View style={styles.securityNote}>
                  <Ionicons name="shield-checkmark-outline" size={16} color="#4CAF50" />
                  <Text style={styles.securityText}>{t('payment.securityMessage')}</Text>
                </View>

                <TouchableOpacity
                  style={[styles.payButton, !isCardValid && styles.payButtonDisabled]}
                  onPress={handlePayment}
                  disabled={!isCardValid || isProcessing}
                >
                  {isProcessing ? (
                    <ActivityIndicator color={Colors.dark} />
                  ) : (
                    <Text style={styles.payButtonText}>{t('payment.pay')} 274 UAH</Text>
                  )}
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={styles.successOverlay}>
          <View style={styles.alertBox}>
            <View style={styles.alertContent}>
              <View style={styles.alertIconContainer}>
                <Ionicons name="sparkles" size={32} color={Colors.dark} />
              </View>
              <Text style={styles.alertTitle}>{t('payment.successTitle')}</Text>
              <Text style={styles.alertSubtitle}>{t('payment.successSubtitle')}</Text>
            </View>
            <TouchableOpacity 
              style={styles.alertButton} 
              onPress={() => setShowSuccessModal(false)}
            >
              <Text style={styles.alertButtonText}>{t('payment.proceed')}</Text>
            </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 25,
    paddingVertical: 20,
    marginTop: 30,
  },
  historyBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${Colors.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoIcon: {
    width: 25,
    height: 25,
  },
  title: {
    fontSize: 20,
    fontWeight: '500',
    color: Colors.primary,
    textTransform: 'uppercase',
  },
  content: {
    flex: 1,
    paddingHorizontal: 25,
    gap: 15,
  },
  aiCard: {
    padding: 15,
  },
  aiCardTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: Colors.primary,
    textAlign: 'left',
    marginBottom: 5,
  },
  aiCardContent: {
    flexDirection: 'row',
    gap: 15,
    alignItems: 'center',
  },
  aiCardIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(187, 224, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiCardText: {
    flex: 1,
    gap: 10,
  },
  aiCardDescription: {
    fontSize: 12,
    color: Colors.white,
    lineHeight: 16,
  },
  aiCardAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  aiCardActionText: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.dark,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 25,
    maxHeight: '85%',
  },
  modalCloseButton: {
    alignSelf: 'flex-end',
    padding: 5,
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.white,
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 20,
    lineHeight: 20,
  },
  subscriptionCard: {
    backgroundColor: 'rgba(187, 224, 255, 0.08)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(187, 224, 255, 0.15)',
    marginBottom: 20,
  },
  subscriptionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 10,
  },
  subscriptionPrice: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 15,
  },
  subscriptionPeriod: {
    fontSize: 16,
    fontWeight: '400',
    color: Colors.textSecondary,
  },
  selectButton: {
    backgroundColor: Colors.white,
    height: 56,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  selectButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.dark,
    textTransform: 'uppercase',
  },
  modalDivider: {
    height: 1,
    backgroundColor: 'rgba(187, 224, 255, 0.15)',
    marginVertical: 15,
  },
  benefitsList: {
    gap: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  benefitText: {
    fontSize: 14,
    color: Colors.white,
    flex: 1,
    lineHeight: 18,
  },
  // Payment Modal
  paymentModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'flex-end',
  },
  paymentModalContent: {
    backgroundColor: '#1A1A1A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: '90%',
  },
  paymentModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  paymentModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.white,
  },
  closeBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  amountSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(187, 224, 255, 0.15)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  amountLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  amountValue: {
    fontSize: 20,
    fontWeight: '600',
    color: '#BBE0FF',
  },
  cardForm: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.6)',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 14,
    gap: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: Colors.white,
    letterSpacing: 1,
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 20,
    marginBottom: 20,
  },
  securityText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    flex: 1,
  },
  payButton: {
    backgroundColor: '#BBE0FF',
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  payButtonDisabled: {
    backgroundColor: 'rgba(187, 224, 255, 0.3)',
  },
  payButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark,
  },
  // Success Modal
  successOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  alertBox: {
    backgroundColor: '#BBE0FF',
    borderRadius: 8,
    width: '100%',
    maxWidth: 342,
    overflow: 'hidden',
  },
  alertContent: {
    alignItems: 'center',
    paddingTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  alertIconContainer: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.dark,
    textAlign: 'center',
    marginBottom: 4,
  },
  alertSubtitle: {
    fontSize: 11,
    fontWeight: '400',
    color: 'rgba(6, 6, 3, 0.7)',
    textAlign: 'center',
    lineHeight: 18,
  },
  alertButton: {
    backgroundColor: Colors.dark,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 0.5,
    borderTopColor: Colors.white,
  },
  alertButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.white,
    textTransform: 'uppercase',
  },
});
