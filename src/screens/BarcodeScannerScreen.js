import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Modal,
  Dimensions,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Colors } from '../constants/colors';
import { useTranslation } from '../i18n';
import { useFoodsStore } from '../store/foodsStore';

const { width, height } = Dimensions.get('window');
const SCAN_AREA_SIZE = width * 0.7;

export const BarcodeScannerScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showNotFound, setShowNotFound] = useState(false);
  const [scannedBarcode, setScannedBarcode] = useState('');
  const { searchByBarcode } = useFoodsStore();
  
  // Use ref to prevent multiple scans (state update is async)
  const isProcessingRef = useRef(false);

  const handleBarCodeScanned = async ({ type, data }) => {
    // Use ref for immediate check (prevents multiple calls)
    if (isProcessingRef.current || scanned || isLoading) return;
    
    isProcessingRef.current = true;
    setScanned(true);
    setIsLoading(true);
    
    try {
      const food = await searchByBarcode(data);
      setIsLoading(false);
      
      if (food) {
        // Navigate to food detail screen with the found food
        navigation.replace('FoodDetail', { food, fromBarcode: true });
      } else {
        // Product not found - show modal
        setScannedBarcode(data);
        setShowNotFound(true);
      }
    } catch (error) {
      setIsLoading(false);
      Alert.alert(
        t('common.error'),
        t('food.scanError'),
        [
          { text: t('common.ok'), onPress: () => resetScanner() },
        ]
      );
    }
  };

  const resetScanner = () => {
    isProcessingRef.current = false;
    setScanned(false);
    setShowNotFound(false);
  };

  const handleCancel = () => {
    setShowNotFound(false);
    isProcessingRef.current = false;
    setScanned(false);
    // Use setTimeout to ensure modal closes before navigation
    setTimeout(() => {
      navigation.goBack();
    }, 100);
  };

  const handleScanAgain = () => {
    setShowNotFound(false);
    isProcessingRef.current = false;
    setScanned(false);
  };

  const handleCreateNew = () => {
    const barcode = scannedBarcode;
    setShowNotFound(false);
    isProcessingRef.current = false;
    setScanned(false);
    // Use setTimeout to ensure modal closes before navigation
    setTimeout(() => {
      navigation.replace('CreateFood', { barcode });
    }, 100);
  };

  if (!permission) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionTitle}>{t('camera.permissionNeeded')}</Text>
          <Text style={styles.permissionText}>{t('camera.permissionDescription')}</Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>{t('camera.grantPermission')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
            <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        barcodeScannerSettings={{
          barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'code39'],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      />
      
      {/* Overlay - positioned absolutely over camera */}
      <View style={styles.overlay} pointerEvents="box-none">
        {/* Top */}
        <View style={styles.overlayTop} />
        
        {/* Middle row */}
        <View style={styles.overlayMiddle}>
          <View style={styles.overlaySide} />
          <View style={styles.scanArea}>
            {/* Corner markers */}
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />
            
            {/* Scan line animation placeholder */}
            <View style={styles.scanLine} />
          </View>
          <View style={styles.overlaySide} />
        </View>
        
        {/* Bottom */}
        <View style={styles.overlayBottom}>
          <Text style={styles.instructionText}>{t('food.scanBarcode')}</Text>
          
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={Colors.white} />
              <Text style={styles.loadingText}>{t('food.searching')}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Header - positioned absolutely */}
      <SafeAreaView style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{t('food.barcodeScanner')}</Text>
        <View style={styles.placeholder} />
      </SafeAreaView>

      {/* Not Found Modal */}
      <Modal
        visible={showNotFound}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('createFood.notFoundTitle')}</Text>
            <Text style={styles.modalMessage}>{t('createFood.notFoundMessage')}</Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonPrimary]} 
                onPress={handleCreateNew}
              >
                <Text style={styles.modalButtonTextPrimary}>{t('createFood.createNew')}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonSecondary]} 
                onPress={handleScanAgain}
              >
                <Text style={styles.modalButtonTextSecondary}>{t('food.scanAgain')}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonCancel]} 
                onPress={handleCancel}
              >
                <Text style={styles.modalButtonTextCancel}>{t('common.cancel')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  overlayTop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  overlayMiddle: {
    flexDirection: 'row',
  },
  overlaySide: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  scanArea: {
    width: SCAN_AREA_SIZE,
    height: SCAN_AREA_SIZE * 0.6,
    borderRadius: 16,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: Colors.primary,
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 16,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 16,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 16,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 16,
  },
  scanLine: {
    position: 'absolute',
    top: '50%',
    left: 10,
    right: 10,
    height: 2,
    backgroundColor: Colors.primary,
    opacity: 0.8,
  },
  overlayBottom: {
    flex: 1.5,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    paddingTop: 40,
  },
  instructionText: {
    color: Colors.white,
    fontSize: 16,
    textAlign: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    gap: 10,
  },
  loadingText: {
    color: Colors.white,
    fontSize: 14,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: Colors.white,
    fontSize: 20,
  },
  title: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.white,
    marginBottom: 12,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  permissionButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 16,
  },
  permissionButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    paddingVertical: 14,
  },
  cancelButtonText: {
    color: Colors.textSecondary,
    fontSize: 16,
  },
  // Modal styles - dark theme
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 340,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.white,
    textAlign: 'center',
    marginBottom: 12,
  },
  modalMessage: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  modalButtons: {
    gap: 12,
  },
  modalButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonPrimary: {
    backgroundColor: Colors.primary,
  },
  modalButtonTextPrimary: {
    color: Colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
  modalButtonSecondary: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  modalButtonTextSecondary: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '500',
  },
  modalButtonCancel: {
    backgroundColor: 'transparent',
    marginTop: 4,
  },
  modalButtonTextCancel: {
    color: Colors.textSecondary,
    fontSize: 15,
  },
});
