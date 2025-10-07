import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons'; 

const Home = () => {
    const navigation = useNavigation();

    const handleGetStarted = () => {
        navigation.navigate('Login');
    };

    return (
        <View style={styles.container}>
            <Image source={require('../assets/logo.jpg')} style={styles.logo} />
            <Text style={styles.title}>Welcome to Nap’s Grill and Restobar</Text>
            <Text style={styles.subtitle}>
                Where Every Bite Is A Celebration Of Taste Combination of American and Filipino Food.
            </Text>

            <TouchableOpacity style={styles.customButton} onPress={handleGetStarted}>
                <Ionicons name="arrow-forward-circle-outline" size={20} color="#fff" style={styles.icon} />
                <Text style={styles.customButtonText}>Get Started</Text>
            </TouchableOpacity>
        </View>
    );
};

export default Home;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 20,
        margin: 10,
    },
    logo: {
        width: 250,
        height: 250,
        borderRadius: 150,
        marginBottom: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#343a40',
        textAlign: 'center',
        marginBottom: 15,
    },
    subtitle: {
        fontSize: 15,
        color: '#6c757d',
        textAlign: 'center',
        marginBottom: 20,
    },
    customButton: {
        backgroundColor: '#2986FE',
        flexDirection: 'row',          
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 30,
    },
    icon: {
        marginRight: 8,
    },
    customButtonText: {
        fontSize: 16,
        color: '#fff',
        textAlign: 'center',
        textTransform: 'none',
    },
});
