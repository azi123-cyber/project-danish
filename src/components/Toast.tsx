import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface ToastMessage {
  title: string;
  desc: string;
  type: 'success' | 'warning' | 'info';
}

interface ToastProps {
  toast: ToastMessage | null;
  onDismiss: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  if (!toast) return null;

  const isSuccess = toast.type === 'success';
  const isWarning = toast.type === 'warning';

  return (
    <View style={styles.toastContainer}>
      <View
        style={[
          styles.toastCard,
          isSuccess
            ? styles.toastSuccess
            : isWarning
            ? styles.toastWarning
            : styles.toastInfo,
        ]}
      >
        <Ionicons
          name={
            isSuccess
              ? 'checkmark-circle'
              : isWarning
              ? 'alert-circle'
              : 'information-circle'
          }
          size={18}
          color={isSuccess ? '#059669' : isWarning ? '#D97706' : '#0D9488'}
        />

        <View style={styles.textContainer}>
          <Text style={styles.toastTitle}>{toast.title}</Text>
          <Text style={styles.toastDesc}>{toast.desc}</Text>
        </View>

        <TouchableOpacity onPress={onDismiss} style={styles.closeBtn}>
          <Ionicons name="close" size={16} color="#64748B" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    zIndex: 1000,
  },
  toastCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    gap: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 5,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  toastSuccess: {
    borderColor: '#A7F3D0',
    backgroundColor: '#F0FDF4',
  },
  toastWarning: {
    borderColor: '#FDE68A',
    backgroundColor: '#FFFBEB',
  },
  toastInfo: {
    borderColor: '#CCFBF1',
    backgroundColor: '#F0FDFA',
  },
  textContainer: {
    flex: 1,
  },
  toastTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  toastDesc: {
    fontSize: 11,
    color: '#475569',
    marginTop: 1,
  },
  closeBtn: {
    padding: 2,
  },
});
