import React, { useState } from 'react';
import { View, Modal, StyleSheet, TouchableOpacity, TextInput, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

interface DateTimePickerModalProps {
  isVisible: boolean;
  onClose: () => void;
  onConfirm: (value: string) => void;
  title: string;
  initialValue: string;
  type: 'date' | 'time';
}

export function DateTimePickerModal({
  isVisible,
  onClose,
  onConfirm,
  title,
  initialValue,
  type
}: DateTimePickerModalProps) {
  const [value, setValue] = useState(initialValue);

  const handleConfirm = () => {
    let isValid = false;
    let errorMessage = '';

    if (type === 'date') {
      // Validate date format YYYY-MM-DD
      isValid = /^\d{4}-\d{2}-\d{2}$/.test(value) && !isNaN(new Date(value).getTime());
      errorMessage = 'Please enter a valid date in YYYY-MM-DD format';
    } else {
      // Validate time format HH:MM
      isValid = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value);
      errorMessage = 'Please enter a valid time in HH:MM format (24-hour)';
    }

    if (isValid) {
      onConfirm(value);
      onClose();
    } else {
      alert(errorMessage);
    }
  };

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <ThemedView style={styles.modalContent}>
          <ThemedText style={styles.modalTitle}>{title}</ThemedText>
          
          <TextInput
            style={styles.input}
            value={value}
            onChangeText={setValue}
            placeholder={type === 'date' ? 'YYYY-MM-DD' : 'HH:MM'}
            autoFocus
          />
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={onClose}>
              <ThemedText style={styles.buttonText}>Cancel</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.button, styles.confirmButton]} onPress={handleConfirm}>
              <ThemedText style={[styles.buttonText, styles.confirmButtonText]}>Confirm</ThemedText>
            </TouchableOpacity>
          </View>
        </ThemedView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    minWidth: 100,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
  },
  confirmButton: {
    backgroundColor: '#0a7ea4',
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});
