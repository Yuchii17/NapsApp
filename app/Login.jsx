import React, { useState, useRef, useEffect } from 'react';
import {StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Image, ActivityIndicator, Modal} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';

const API_URL = 'http://localhost:5000/api/auth';

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const Login = () => {
  const navigation = useNavigation();
  const timeoutRef = useRef(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState('success');

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const showModal = (message, type = 'success', duration = 3000) => {
    setModalMessage(message);
    setModalType(type);
    setModalVisible(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setModalVisible(false);
      timeoutRef.current = null;
    }, duration);
  };

  const onEmailChange = (text) => {
    setEmail(text);
    if (emailError) setEmailError(false);
  };
  const onPasswordChange = (text) => {
    setPassword(text);
    if (passwordError) setPasswordError(false);
  };

  const handleLogin = async () => {
    setEmailError(false);
    setPasswordError(false);

    if (!email || !password) {
      if (!email) setEmailError(true);
      if (!password) setPasswordError(true);
      showModal('Please provide both email and password.', 'error');
      return;
    }

    if (!isValidEmail(email)) {
      setEmailError(true);
      showModal('Please enter a valid email address.', 'error');
      return;
    }

    try {
      setLoading(true);

      const resp = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await resp.json();
      setLoading(false);

      if (!resp.ok) {
        const msg = (data && data.message) ? data.message.toLowerCase() : '';

        if (msg.includes('not registered') || msg.includes('no user') || msg.includes('not found') || msg.includes('user not')) {
          setEmailError(true);
          showModal(data.message || 'Email not registered.', 'error');
          return;
        }

        if (msg.includes('incorrect password') || msg.includes('invalid credentials') || msg.includes('wrong password') || msg.includes('password')) {
          setPasswordError(true);
          showModal(data.message || 'Incorrect password.', 'error');
          return;
        }

        showModal(data.message || 'Invalid email or password.', 'error');
        return;
      }

      const MODAL_DURATION = 3000;
      showModal('Login successful! Redirecting...', 'success', MODAL_DURATION);

      timeoutRef.current = setTimeout(() => {
        try {
          navigation.replace('UserDashboard');
        } catch (err) {
          console.error('replace failed, falling back to navigate', err);
          try {
            navigation.navigate('UserDashboard');
          } catch (err2) {
            console.error('navigation fallback failed', err2);
          }
        }
      }, MODAL_DURATION + 50);
    } catch (err) {
      setLoading(false);
      console.error('Login error', err);
      showModal('Failed to reach server. Please try again.', 'error');
    }
  };

  return (
    <>
      <ScrollView contentContainerStyle={styles.container}>
        <Image source={require('../assets/logo.jpg')} style={styles.logo} />

        <Text style={styles.heading}>Welcome back!</Text>
        <Text style={styles.subheading}>Back For More? We Got You.</Text>
        <View style={styles.divider} />
        
        <View style={[
          styles.inputWrapper,
          emailError ? styles.inputErrorWrapper : null
        ]}>
          <FontAwesome name="envelope" size={20} style={styles.icon} />
          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={onEmailChange}
            keyboardType="email-address"
            style={styles.input}
            autoCapitalize="none"
          />
        </View>

        <View style={[
          styles.inputWrapper,
          passwordError ? styles.inputErrorWrapper : null
        ]}>
          <FontAwesome name="lock" size={20} style={styles.icon} />
          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={onPasswordChange}
            secureTextEntry={!showPassword}
            style={styles.input}
            autoCapitalize="none"
          />
          <TouchableOpacity
            onPress={() => setShowPassword(prev => !prev)}
            style={styles.eyeButton}
            accessible={true}
            accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
          >
            <FontAwesome name={showPassword ? 'eye' : 'eye-slash'} size={18} style={styles.eyeIcon} />
          </TouchableOpacity>
        </View>

        <View style={styles.linkRow}>
          <Text style={styles.link} onPress={() => navigation.navigate('ForgotPassword')}>
            Forgot Password?
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.8 }]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <FontAwesome name="sign-in" size={18} color="#fff" style={{ marginRight: 8 }} />
          )}
          <Text style={styles.buttonText}>{loading ? 'Logging in...' : 'Login'}</Text>
        </TouchableOpacity>

        <View style={styles.linkRow}>
          <Text>Don’t have an account? </Text>
          <Text style={styles.link} onPress={() => navigation.navigate('Register')}>
            Register now
          </Text>
        </View>
      </ScrollView>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, modalType === 'error' ? styles.errorModal : styles.successModal]}>
            <Text style={styles.modalText}>{modalMessage}</Text>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default Login;

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
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  subheading: {
    fontSize: 16,
    color: '#555',
    marginBottom: 15,
  },
  divider: {
    height: 3,
    width: 200,
    backgroundColor: '#2986FE',
    marginBottom: 20,
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
    position: 'relative',
  },
  inputErrorWrapper: {
    borderColor: '#F44336', 
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
  eyeButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  eyeIcon: {
    color: '#000',
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#2986FE',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  link: {
    color: '#2986FE',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  successModal: {
    backgroundColor: '#4CAF50',
  },
  errorModal: {
    backgroundColor: '#F44336',
  },
  modalText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
});
