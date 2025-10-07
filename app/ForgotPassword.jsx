import React, { useState } from 'react';
import {
  StyleSheet, View, Text, TextInput, TouchableOpacity, Image, ScrollView, Modal,
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';

const ForgotPassword = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showOtpSuccessModal, setShowOtpSuccessModal] = useState(false);
  const [showResetSuccessModal, setShowResetSuccessModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const handleSendOTP = async () => {
    if (!email) {
      setErrorMsg('Please enter your email address.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/forgot-password/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (data.success) {
        setShowModal(true);
        setShowOtpSuccessModal(true);
        setTimeout(() => {
          setShowOtpSuccessModal(false);
        }, 2000);
      } else {
        setErrorMsg(data.message || 'Failed to send OTP.');
      }
    } catch (err) {
      setErrorMsg('Network error. Please try again.');
    }
  };

  const handleResetPassword = async () => {
    if (!otp || !newPassword || !confirmPassword) {
      setErrorMsg('Please fill in all fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/forgot-password/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword }),
      });

      const data = await response.json();
      if (data.success) {
        setShowResetSuccessModal(true);
        setShowModal(false);
        setTimeout(() => {
          setShowResetSuccessModal(false);
          navigation.navigate('Login');
        }, 4000);
      } else {
        setErrorMsg(data.message || 'Password reset failed.');
      }
    } catch (err) {
      setErrorMsg('Network error. Please try again.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={require('../assets/logo.jpg')} style={styles.logo} />
      <Text style={styles.heading}>Forgot Password?</Text>
      <Text style={styles.subheading}>We'll send you an OTP to reset your password.</Text>
      <View style={styles.divider} />

      {errorMsg ? (
        <Text style={styles.errorText}>{errorMsg}</Text>
      ) : null}

      <View style={styles.inputWrapper}>
        <FontAwesome name="envelope" size={20} style={styles.icon} />
        <TextInput
          placeholder="Enter your registered email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSendOTP}>
        <FontAwesome name="send" size={18} color="#fff" style={{ marginRight: 8 }} />
        <Text style={styles.buttonText}>Send OTP</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.linkRow} onPress={() => navigation.navigate('Login')}>
        <FontAwesome name="arrow-left" size={16} color="#2986FE" />
        <Text style={styles.link}> Back to Login</Text>
      </TouchableOpacity>

      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Reset Password</Text>

            <TextInput
              placeholder="Enter OTP"
              value={otp}
              onChangeText={setOtp}
              keyboardType="numeric"
              maxLength={6}
              style={styles.modalInput}
            />
            <View style={styles.passwordWrapper}>
              <TextInput
                placeholder="New Password"
                secureTextEntry={!showNewPassword}
                value={newPassword}
                onChangeText={setNewPassword}
                style={styles.modalInputWithIcon}
              />
              <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)} style={styles.eyeIcon}>
                <FontAwesome name={showNewPassword ? 'eye-slash' : 'eye'} size={20} />
              </TouchableOpacity>
            </View>
            <View style={styles.passwordWrapper}>
              <TextInput
                placeholder="Confirm Password"
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                style={styles.modalInputWithIcon}
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
                <FontAwesome name={showConfirmPassword ? 'eye-slash' : 'eye'} size={20} />
              </TouchableOpacity>
            </View>

            {errorMsg ? (
              <Text style={styles.errorText}>{errorMsg}</Text>
            ) : null}

            <TouchableOpacity style={styles.modalButton} onPress={handleResetPassword}>
              <Text style={styles.modalButtonText}>Submit</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showOtpSuccessModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.successModal}>
            <FontAwesome name="check-circle" size={48} color="#28a745" style={{ marginBottom: 10 }}/>
            <Text style={styles.successText}>OTP sent!</Text>
            <Text style={{ color: '#555', fontSize: 14 }}>Please check your email account.</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowOtpSuccessModal(false)}
            >
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showResetSuccessModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.successModal}>
            <FontAwesome name="check-circle" size={48} color="#28a745" style={{ marginBottom: 10 }} />
            <Text style={styles.successText}>Password changed successfully!</Text>
            <Text style={{ color: '#555', fontSize: 14 }}>Redirecting to login...</Text>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default ForgotPassword;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 75,
    marginTop: 50,
    marginBottom: 20,
  },
  heading: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  subheading: {
    fontSize: 14,
    color: '#555',
    marginBottom: 15,
    textAlign: 'center',
  },
  divider: {
    height: 3,
    width: 200,
    backgroundColor: '#2986FE',
    marginBottom: 20,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
    fontSize: 14,
  },
  inputWrapper: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#101010',
    borderRadius: 30,
    paddingHorizontal: 15,
    alignItems: 'center',
    marginBottom: 15,
    width: '100%',
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
  button: {
    flexDirection: 'row',
    backgroundColor: '#2986FE',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 25,
  },
  link: {
    color: '#2986FE',
    fontSize: 14,
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  modalButton: {
    backgroundColor: '#2986FE',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  modalCancel: {
    color: '#FF3333',
    textAlign: 'center',
    fontSize: 14,
    marginTop: 5,
  },
  successModal: {
    width: '80%',
    backgroundColor: '#fff',
    padding: 25,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 5,
  },
  successText: {
    fontSize: 16,
    marginBottom: 3,
    textAlign: 'center',
    color: '#333',
    fontWeight: '600',
  },
  passwordWrapper: {
  flexDirection: 'row',
  alignItems: 'center',
  borderWidth: 1,
  borderColor: '#ccc',
  borderRadius: 8,
  paddingHorizontal: 10,
  marginBottom: 12,
  },
  modalInputWithIcon: {
    flex: 1,
    paddingVertical: 10,
    paddingRight: 35,
  },
  eyeIcon: {
    position: 'absolute',
    right: 10,
    padding: 4,
  }
});
