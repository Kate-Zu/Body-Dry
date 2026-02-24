import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Modal,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { subscriptionsApi } from '../../api/endpoints';
import { useAuthStore } from '../../store/authStore';
import { useTranslation } from '../../i18n';

const getSubscriptionPlan = (t) => ({
  name: 'BodyPro',
  description: t('payment.planDescription'),
  price: 274,
  period: 'month',
  advantages: [
    t('payment.benefit1'),
    t('payment.benefit2'),
    t('payment.benefit3'),
    t('payment.benefit4'),
    t('payment.benefit5'),
    t('payment.benefit6'),
  ],
});

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

// Format expiry date
const formatExpiry = (value) => {
  const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
  if (v.length >= 2) {
    return v.substring(0, 2) + '/' + v.substring(2, 4);
  }
  return v;
};

export const PaymentScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const SUBSCRIPTION_PLAN = getSubscriptionPlan(t);
  
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const setSubscription = useAuthStore((state) => state.setSubscription);
  
  // Card form state
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVV, setCardCVV] = useState('');
  const [cardName, setCardName] = useState('');

  // Validation
  const isCardValid = 
    cardNumber.replace(/\s/g, '').length >= 16 &&
    cardExpiry.length === 5 &&
    cardCVV.length >= 3 &&
    cardName.length >= 2;

  const handleSelectPlan = () => {
    setShowPaymentModal(true);
  };

  const handlePayment = async () => {
    if (!isCardValid) return;
    
    setIsProcessing(true);
    
    try {
      // Симуляція обробки платежу (для демо приймаємо будь-які дані)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Активуємо підписку на бекенді
      const cardLast4 = cardNumber.replace(/\s/g, '').slice(-4);
      const response = await subscriptionsApi.activate({ 
        paymentId: `pay_${Date.now()}`,
        cardLast4 
      });
      
      // Оновлюємо статус підписки в store
      setSubscription(response.data);
      
      setShowPaymentModal(false);
      setShowSuccessModal(true);
      
      // Очищаємо форму
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

  const handleProceed = () => {
    setShowSuccessModal(false);
    navigation.navigate('PaymentSuccess');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>План підписки</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerSection}>
          <Text style={styles.mainTitle}>Створюй найкращу версію себе разом{'\n'}<Text style={{ color: Colors.primary }}>із BodyPro</Text></Text>
        </View>

        <View style={styles.subscriptionCard}>
          <View style={styles.subscriptionHeader}>
            <Text style={styles.subscriptionTitle}>{SUBSCRIPTION_PLAN.name}</Text>
            <Text style={styles.subscriptionDescription}>
              {SUBSCRIPTION_PLAN.description}
            </Text>
          </View>

          <Text style={styles.priceSection}>
            {SUBSCRIPTION_PLAN.price} UAH{' '}
            <Text style={styles.pricePeriod}>/ {SUBSCRIPTION_PLAN.period}</Text>
          </Text>

          <TouchableOpacity
            style={styles.selectButton}
            onPress={handleSelectPlan}
          >
            <Text style={styles.selectButtonText}>{t('payment.select')}</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <View style={styles.advantagesList}>
            {SUBSCRIPTION_PLAN.advantages.map((advantage, index) => (
              <View key={index} style={styles.advantageItem}>
                <Ionicons name="flash" size={20} color="#BBE0FF" />
                <Text style={styles.advantageText}>{advantage}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Payment Card Modal */}
      <Modal
        visible={showPaymentModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPaymentModal(false)}
      >
        <KeyboardAvoidingView 
          style={styles.modalContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.paymentModalOverlay}>
            <View style={styles.paymentModalContent}>
              <View style={styles.paymentModalHeader}>
                <Text style={styles.paymentModalTitle}>{t('payment.subscriptionPayment')}</Text>
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={() => setShowPaymentModal(false)}
                >
                  <Ionicons name="close" size={24} color={Colors.white} />
                </TouchableOpacity>
              </View>

              <View style={styles.amountSection}>
                <Text style={styles.amountLabel}>{t('payment.amountDue')}</Text>
                <Text style={styles.amountValue}>{SUBSCRIPTION_PLAN.price} UAH</Text>
              </View>

              <View style={styles.cardForm}>
                {/* Card Number */}
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

                {/* Expiry and CVV Row */}
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

                {/* Cardholder Name */}
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

              {/* Security Note */}
              <View style={styles.securityNote}>
                <Ionicons name="shield-checkmark-outline" size={16} color="#4CAF50" />
                <Text style={styles.securityText}>
                  {t('payment.securityMessage')}
                </Text>
              </View>

              {/* Pay Button */}
              <TouchableOpacity
                style={[styles.payButton, !isCardValid && styles.payButtonDisabled]}
                onPress={handlePayment}
                disabled={!isCardValid || isProcessing}
              >
                {isProcessing ? (
                  <ActivityIndicator color={Colors.dark} />
                ) : (
                  <Text style={styles.payButtonText}>
                    {t('payment.pay')} {SUBSCRIPTION_PLAN.price} UAH
                  </Text>
                )}
              </TouchableOpacity>
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
        <View style={styles.modalOverlay}>
          <View style={styles.alertBox}>
            <View style={styles.alertContent}>
              <View style={styles.alertIconContainer}>
                <Ionicons name="sparkles" size={32} color={Colors.dark} />
              </View>
              <Text style={styles.alertTitle}>{t('payment.successTitle')}</Text>
              <Text style={styles.alertSubtitle}>
                {t('payment.successSubtitle')}
              </Text>
            </View>
            <TouchableOpacity style={styles.alertButton} onPress={handleProceed}>
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
    backgroundColor: Colors.dark,
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.white,
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  headerSection: {
    marginTop: 35,
    marginBottom: 35,
  },
  mainTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: Colors.white,
    marginBottom: 13,
  },
  mainSubtitle: {
    fontSize: 12,
    fontWeight: '400',
    color: Colors.white,
    lineHeight: 18,
  },
  subscriptionCard: {
    backgroundColor: 'rgba(187, 224, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 20,
    padding: 25,
  },
  subscriptionHeader: {
    marginBottom: 15,
  },
  subscriptionTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: Colors.white,
    marginBottom: 10,
  },
  subscriptionDescription: {
    fontSize: 12,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 18,
  },
  priceSection: {
    fontSize: 24,
    fontWeight: '500',
    color: Colors.white,
    marginBottom: 15,
  },
  pricePeriod: {
    fontSize: 12,
  },
  selectButton: {
    backgroundColor: Colors.white,
    height: 56,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  selectButtonDisabled: {
    opacity: 0.7,
  },
  selectButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.dark,
    textTransform: 'uppercase',
  },
  divider: {
    height: 0.5,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 15,
  },
  advantagesList: {
    gap: 18,
  },
  advantageItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 17,
  },
  advantageText: {
    fontSize: 12,
    fontWeight: '400',
    color: Colors.white,
    lineHeight: 21,
    flex: 1,
  },
  modalOverlay: {
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
  // Payment Modal Styles
  modalContainer: {
    flex: 1,
  },
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
  closeButton: {
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
  },
  payButtonDisabled: {
    backgroundColor: 'rgba(187, 224, 255, 0.3)',
  },
  payButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark,
  },
});
