import React, { useState, useRef } from 'react';
import {StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Modal, Pressable, Image, Alert, ActivityIndicator,} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';

const BACKEND_BASE = 'http://localhost:5000';

const Register = () => {
  const navigation = useNavigation();
  const scrollViewRef = useRef(null);

  const [agree, setAgree] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [canAgree, setCanAgree] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    address: '',
    contactNo: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleScroll = ({ nativeEvent }) => {
    const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
    if (layoutMeasurement.height + contentOffset.y >= contentSize.height - 20) {
      setCanAgree(true);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateFormBeforeOtp = () => {
    const { firstName, lastName, address, contactNo, email, password, confirmPassword } = formData;
    if (!firstName || !lastName || !address || !contactNo || !email || !password || !confirmPassword) {
      Alert.alert('Validation', 'Please fill all fields.');
      return false;
    }
    if (password !== confirmPassword) {
      Alert.alert('Validation', 'Passwords do not match.');
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    if (!validateFormBeforeOtp()) return;

    setLoading(true);
    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        address: formData.address,
        contactNo: formData.contactNo,
        email: formData.email,
        password: formData.password,
      };

      const res = await axios.post(`${BACKEND_BASE}/api/auth/request-otp`, payload, { timeout: 10000 });

      if (res?.data?.success) {
        setShowOTPModal(true);
        Alert.alert('OTP Sent', 'Check your email for the verification code.');
      } else {
        Alert.alert('Error', res?.data?.message || 'Failed to request OTP');
      }
    } catch (err) {
      console.error('Request OTP error:', err.response?.data || err.message);
      const msg = err.response?.data?.message || err.message || 'Failed to send OTP. Is backend running?';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || !formData.email) {
      Alert.alert('Validation', 'Please enter the OTP and ensure email is present.');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${BACKEND_BASE}/api/auth/verify-otp`, {
        email: formData.email,
        otp: otp.trim(),
      }, { timeout: 10000 });

      if (res?.data?.success) {
        Alert.alert('Success', 'Account created successfully');
        setShowOTPModal(false);
        setFormData({
          firstName: '',
          lastName: '',
          address: '',
          contactNo: '',
          email: '',
          password: '',
          confirmPassword: '',
        });
        navigation.navigate('Login');
      } else {
        Alert.alert('Verification failed', res?.data?.message || 'OTP verification failed');
      }
    } catch (err) {
      console.error('Verify OTP error:', err.response?.data || err.message);
      const msg = err.response?.data?.message || err.message || 'Failed to verify OTP';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ScrollView contentContainerStyle={styles.container}>
        <Image source={require('../assets/logo.jpg')} style={styles.logo} />

        <Text style={styles.heading}>Registration</Text>
        <Text style={styles.subheading}>Let’s Get You Started.</Text>
        <View style={styles.divider} />

        <View style={styles.row}>
          <View style={styles.inputWrapper}>
            <FontAwesome name="user" size={20} style={styles.icon} />
            <TextInput
              placeholder="First Name:"
              style={styles.input}
              value={formData.firstName}
              onChangeText={(v) => handleInputChange('firstName', v)}
            />
          </View>
          <View style={styles.inputWrapper}>
            <FontAwesome name="user" size={20} style={styles.icon} />
            <TextInput
              placeholder="Last Name:"
              style={styles.input}
              value={formData.lastName}
              onChangeText={(v) => handleInputChange('lastName', v)}
            />
          </View>
        </View>

        <View style={styles.fullWidthInputWrapper}>
          <FontAwesome name="home" size={20} style={styles.icon} />
          <TextInput
            placeholder="Address:"
            style={styles.input}
            value={formData.address}
            onChangeText={(v) => handleInputChange('address', v)}
          />
        </View>

        <View style={styles.row}>
          <View style={styles.inputWrapper}>
            <FontAwesome name="phone" size={20} style={styles.icon} />
            <TextInput
              placeholder="Contact No:"
              keyboardType="phone-pad"
              style={styles.input}
              value={formData.contactNo}
              onChangeText={(v) => handleInputChange('contactNo', v)}
            />
          </View>
          <View style={styles.inputWrapper}>
            <FontAwesome name="envelope" size={20} style={styles.icon} />
            <TextInput
              placeholder="Email:"
              keyboardType="email-address"
              style={styles.input}
              value={formData.email}
              onChangeText={(v) => handleInputChange('email', v)}
              autoCapitalize="none"
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.inputWrapper}>
            <FontAwesome name="lock" size={20} style={styles.icon} />
            <TextInput
              placeholder="Password:"
              secureTextEntry
              style={styles.input}
              value={formData.password}
              onChangeText={(v) => handleInputChange('password', v)}
            />
          </View>
          <View style={styles.inputWrapper}>
            <FontAwesome name="lock" size={20} style={styles.icon} />
            <TextInput
              placeholder="Confirm pass:"
              secureTextEntry
              style={styles.input}
              value={formData.confirmPassword}
              onChangeText={(v) => handleInputChange('confirmPassword', v)}
            />
          </View>
        </View>

        <View style={styles.agreeRow}>
          <TouchableOpacity
            style={[styles.checkbox, agree && styles.checkboxChecked, !canAgree && { opacity: 0.5 }]}
            onPress={() => canAgree && setAgree(!agree)}
            disabled={!canAgree}
          >
            {agree && <FontAwesome name="check" size={14} color="#fff" />}
          </TouchableOpacity>
          <Text style={styles.agreeText}>
            I Agree to{' '}
            <Text style={styles.link} onPress={() => setShowModal(true)}>Terms and Policy</Text>
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.button, (!agree || loading) && { opacity: 0.6 }]}
          disabled={!agree || loading}
          onPress={handleRegister}
        >
          {loading ? <ActivityIndicator color="#fff" style={{ marginRight: 8 }} /> :
            <FontAwesome name="user-plus" size={18} color="#fff" style={{ marginRight: 8 }} />
          }
          <Text style={styles.buttonText}>{loading ? 'Please wait...' : 'Create Account'}</Text>
        </TouchableOpacity>

        <View style={{ marginTop: 16, alignItems: 'center', width: '100%' }}>
          <Text>
            Already have an account?{' '}
            <Text style={styles.link} onPress={() => navigation.navigate('Login')}>Login</Text>
          </Text>
        </View>
      </ScrollView>

      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ScrollView ref={scrollViewRef} onScroll={handleScroll} scrollEventThrottle={16}>
              <Text style={styles.modalTitle}>Terms and Privacy Policy</Text>
              <Text style={styles.modalText}>{Array(20).fill('Sample policy text.').join('\n\n')}</Text>
            </ScrollView>
            <Pressable style={styles.modalButton} onPress={() => setShowModal(false)}>
              <Text style={styles.modalButtonText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal visible={showOTPModal} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enter OTP</Text>
            <TextInput
              style={[styles.input, { borderWidth: 1, marginVertical: 10, paddingHorizontal: 10 }]}
              keyboardType="number-pad"
              placeholder="Enter OTP"
              value={otp}
              onChangeText={setOtp}
            />
            <Pressable style={styles.modalButton} onPress={handleVerifyOTP}>
              <Text style={styles.modalButtonText}>Verify OTP</Text>
            </Pressable>
            <Pressable style={[styles.modalButton, { backgroundColor: 'gray', marginTop: 10 }]} onPress={() => setShowOTPModal(false)}>
              <Text style={styles.modalButtonText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default Register;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 75,
    marginTop: 120,
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subheading: {
    fontSize: 16,
    marginBottom: 15,
    color: '#555',
  },
  divider: {
    height: 3,
    width: 200,
    backgroundColor: '#2986FE',
    marginBottom: 15,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 10,
    marginBottom: 10,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#101010',
    borderRadius: 30,
    paddingHorizontal: 15,
    alignItems: 'center',
    marginBottom: 10,
  },
  fullWidthInputWrapper: {
    width: '100%',
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#101010',
    borderRadius: 30,
    paddingHorizontal: 15,
    alignItems: 'center',
    marginBottom: 10,
  },
  input: {
    flex: 1,
    height: 45,
    paddingHorizontal: 8,
    fontSize: 14,
  },
  icon: {
    marginRight: 8,
    color: '#000',
  },
  agreeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
    width: '100%',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#2986FE',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    backgroundColor: '#fff',
  },
  checkboxChecked: {
    backgroundColor: '#2986FE',
  },
  agreeText: {
    fontSize: 13,
    color: '#444',
  },
  link: {
    color: '#2986FE',
    textDecorationLine: 'none',
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#2986FE',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },

  modalContainer: {
    flex: 1,
    backgroundColor: '#000000aa',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#2986FE',
  },
  modalText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#2986FE',
  },
  modalText: {
    fontSize: 14,
    color: '#444',
    lineHeight: 22,
  },
  modalButton: {
    marginTop: 20,
    backgroundColor: '#2986FE',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});
