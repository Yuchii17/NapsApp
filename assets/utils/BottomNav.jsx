import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const API_HOST = 'http://localhost:5000';

const BottomNav = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();

  const menuItems = [
    { key: 'Home', label: 'Home', icon: 'home', screen: 'UserDashboard' },
    { key: 'Menu', label: 'Menu', icon: 'list', screen: 'UserMenu' },
    { key: 'Reservation', label: 'Reservation', icon: 'calendar-alt', screen: 'UserReservation' },
    { key: 'Review', label: 'Review', icon: 'comment-dots', screen: 'UserReview' },
    { key: 'Table', label: 'Table', icon: 'chair', screen: 'UserTable' },
    { key: 'Orders', label: 'Orders', icon: 'clipboard-list', screen: 'UserOrder' },
  ];

  const handleLogout = async () => {
    try {
      await fetch(`${API_HOST}/api/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (err) {}
    try {
      navigation.replace('Login');
    } catch (e) {
      navigation.navigate('Login');
    }
  };

  return (
    <View style={[styles.wrapper, { bottom: insets.bottom + 16 }]}>
      <View style={styles.container}>
        {menuItems.map(item => {
          const isActive = route.name === item.screen;
          return (
            <TouchableOpacity
              key={item.key}
              style={styles.navItem}
              onPress={() => navigation.navigate(item.screen)}
            >
              <FontAwesome5 name={item.icon} size={18} color={isActive ? '#2986FE' : '#222'} />
              <Text style={[styles.label, isActive && styles.labelActive]} numberOfLines={1}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
        <TouchableOpacity style={styles.navItem} onPress={handleLogout}>
          <FontAwesome5 name="sign-out-alt" size={18} color="#222" />
          <Text style={styles.label}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default BottomNav;

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 20,
    right: 20,
    alignItems: 'center',
    zIndex: 50,
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 40,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#101010',
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 6,
  },
  navItem: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 6,
  },
  label: {
    fontSize: 10,
    marginTop: 4,
    color: '#444',
  },
  labelActive: {
    color: '#2986FE',
    fontWeight: '600',
  },
});
