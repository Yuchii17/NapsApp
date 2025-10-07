import {StyleSheet, Image, View, Text, ScrollView, TouchableOpacity,} from 'react-native';
import BottomNav from '../assets/utils/BottomNav';
import { MaterialIcons } from '@expo/vector-icons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { useNavigation } from '@react-navigation/native';

const Card = ({ image, title, subtitle, buttonText, onPress, iconName }) => (
  <View style={styles.card}>
    <Image source={image} style={styles.cardImage} />
    <View style={styles.cardBody}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardSubtitle}>{subtitle}</Text>
      <TouchableOpacity style={styles.cardButton} onPress={onPress}>
        <FontAwesome5 name={iconName || 'search'} size={14} color="#fff" />
        <Text style={styles.cardButtonText}>{buttonText}</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const UserDashboard = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Image source={require('../assets/logo.jpg')} style={styles.logo} />
          <TouchableOpacity onPress={() => navigation.navigate('UserProfile')}>
            <FontAwesome5 name="user-circle" size={30} color="#333" />
          </TouchableOpacity>
        </View>

        <Text style={styles.pageTitle}>Home</Text>

        <Card
          image={require('../assets/card1.jpg')}
          title="Discover Our Best Bites"
          subtitle="From grilled favorites to sweet indulgences, our menu is packed with bold flavors and comforting classics."
          buttonText="Explore Menu"
          iconName="utensils"
          onPress={() => navigation.navigate('UserMenu')}
        />

        <Card
          image={require('../assets/card2.webp')}
          title="Dine With Us"
          subtitle="Skip the wait — reserve ahead and enjoy a hassle-free dining experience."
          buttonText="Book Table"
          iconName="calendar-check"
          onPress={() => navigation.navigate('UserReservation')}
        />

        <Card
          image={require('../assets/card3.png')}
          title="Your Exclusive Offers"
          subtitle="Grab special deals and vouchers to enjoy your favorites for less."
          buttonText="Get Voucher"
          iconName="ticket-alt"
          onPress={() => navigation.navigate('Offers')}
        />

        <Card
          image={require('../assets/card4.jpg')}
          title="Tell Us What You Think"
          subtitle="Loved your last bite? Leave a review and help us improve."
          buttonText="Write A Review"
          iconName="comment-dots"
          onPress={() => navigation.navigate('UserReview')}
        />

        <View style={{ height: 90 }} />
      </ScrollView>

        <BottomNav />
    </View>
  );
};

export default UserDashboard;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  container: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
    paddingHorizontal: 4,
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  accountIcon: {
    opacity: 0.95,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111',
    marginBottom: 14,
  },

  card: {
    marginTop: 25,
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 10,
    marginBottom: 3,
    borderWidth: 1,
    borderColor: '#101010',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
    alignItems: 'center',
  },
  cardImage: {
    width: 84,
    height: 84,
    borderRadius: 10,
    marginRight: 12,
    resizeMode: 'cover',
    borderWidth: 1,
    borderColor: '#101010',
  },
  cardBody: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
    color: '#111',
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#555',
    marginBottom: 10,
  },
  cardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#2986FE',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
  },
  cardButtonText: {
    color: '#fff',
    fontSize: 13,
    marginLeft: 8,
    fontWeight: '600',
  },

});
