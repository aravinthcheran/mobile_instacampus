import React, { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { sendOtp, verifyOtp, register } from '@/api/auth';

// Registration steps
enum RegistrationStep {
  EMAIL,
  OTP,
  ACCOUNT_DETAILS
}

export default function RegisterScreen() {
  // State management
  const [step, setStep] = useState<RegistrationStep>(RegistrationStep.EMAIL);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Send OTP to email
  const handleSendOtp = async () => {
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }

    try {
      setLoading(true);
      await sendOtp(email);
      setStep(RegistrationStep.OTP);
      Alert.alert('OTP Sent', 'Please check your email for the verification code');
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      Alert.alert('Invalid OTP', 'Please enter the 6-digit code sent to your email');
      return;
    }

    try {
      setLoading(true);
      const verified = await verifyOtp(email, otp);
      if (verified) {
        setStep(RegistrationStep.ACCOUNT_DETAILS);
      } else {
        Alert.alert('Invalid OTP', 'The code you entered is incorrect');
      }
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  // Complete registration
  const handleRegister = async () => {
    if (!name) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Password Mismatch', 'Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      const userData = await register(email, password, name);
      console.log('Registration successful', userData);
      Alert.alert('Success', 'Your account has been created successfully', [
        { text: 'OK', onPress: () => router.replace('/(tabs)') }
      ]);
    } catch (error) {
      Alert.alert('Registration Failed', error instanceof Error ? error.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  // Render different steps
  const renderStep = () => {
    switch (step) {
      case RegistrationStep.EMAIL:
        return (
          <>
            <ThemedText type="title" style={styles.title}>Create Account</ThemedText>
            <ThemedText style={styles.subtitle}>Enter your email to get started</ThemedText>
            
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoFocus
            />
            
            <TouchableOpacity 
              style={styles.button} 
              onPress={handleSendOtp}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <ThemedText style={styles.buttonText}>Continue</ThemedText>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.secondaryButton} 
              onPress={() => router.replace('/auth/login')}
            >
              <ThemedText>Already have an account? Login</ThemedText>
            </TouchableOpacity>
          </>
        );
      
      case RegistrationStep.OTP:
        return (
          <>
            <ThemedText type="title" style={styles.title}>Verify Email</ThemedText>
            <ThemedText style={styles.subtitle}>Enter the 6-digit code sent to {email}</ThemedText>
            
            <TextInput
              style={styles.input}
              placeholder="6-digit code"
              value={otp}
              onChangeText={setOtp}
              keyboardType="number-pad"
              maxLength={6}
              autoFocus
            />
            
            <TouchableOpacity 
              style={styles.button} 
              onPress={handleVerifyOtp}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <ThemedText style={styles.buttonText}>Verify Code</ThemedText>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.secondaryButton} 
              onPress={handleSendOtp}
              disabled={loading}
            >
              <ThemedText>Resend Code</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.secondaryButton} 
              onPress={() => setStep(RegistrationStep.EMAIL)}
            >
              <ThemedText>Change Email</ThemedText>
            </TouchableOpacity>
          </>
        );
      
      case RegistrationStep.ACCOUNT_DETAILS:
        return (
          <>
            <ThemedText type="title" style={styles.title}>Complete Registration</ThemedText>
            <ThemedText style={styles.subtitle}>Set up your account details</ThemedText>
            
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              value={name}
              onChangeText={setName}
              autoFocus
            />
            
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
            
            <TouchableOpacity 
              style={styles.button} 
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <ThemedText style={styles.buttonText}>Create Account</ThemedText>
              )}
            </TouchableOpacity>
          </>
        );
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.form}>
        {renderStep()}
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  form: {
    width: '100%',
    maxWidth: 400,
  },
  title: {
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    height: 50,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
  },
  button: {
    height: 50,
    backgroundColor: '#0a7ea4',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  secondaryButton: {
    height: 50,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  }
});
