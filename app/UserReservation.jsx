import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Image, ActivityIndicator, FlatList} from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { useNavigation } from '@react-navigation/native';
import BottomNav from '../assets/utils/BottomNav';

const API_HOST = 'http://localhost:5000';
const TABLES_ENDPOINT = `${API_HOST}/api/user/tables`;

function capitalize(s) {
  if (!s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const TableCard = ({ item, onBook }) => {
  return (
    <View style={styles.card}>
      <Image
        source={{ uri: item.image }}
        style={styles.cardImage}
        resizeMode="cover"
      />
      <Text style={styles.cardTitle}>{item.name}</Text>

      <View style={styles.row}>
        <Text style={styles.price}>₱ {item.price}</Text>
        <View style={styles.tag}>
          <Text style={styles.tagText}>{item.pax} Pax</Text>
        </View>
      </View>

      <Text style={styles.cardDesc} numberOfLines={2}>
        {item.description}
      </Text>

      <TouchableOpacity style={styles.bookBtn} onPress={() => onBook(item)}>
        <FontAwesome5 name="chair" size={14} color="#fff" />
        <Text style={styles.bookBtnText}>Book Table</Text>
      </TouchableOpacity>
    </View>
  );
};

export default function UserMenu() {
  const navigation = useNavigation();
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchTables = async (q = '') => {
    try {
      setLoading(true);
      const url = q ? `${TABLES_ENDPOINT}?q=${encodeURIComponent(q)}` : TABLES_ENDPOINT;
      const resp = await fetch(url);
      const data = await resp.json();

      if (resp.ok && Array.isArray(data.tables)) {
        setTables(data.tables);
      } else {
        setTables([]);
      }
    } catch (err) {
      console.error('Failed to load tables', err);
      setTables([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const onSearch = () => {
    fetchTables(query.trim());
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchTables(query.trim());
  };

  const onBookTable = (table) => {
    console.log('Booking table:', table._id);
  };

  return (
    <View style={styles.screen}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Image source={require('../assets/logo.jpg')} style={styles.logo} />
          <TouchableOpacity onPress={() => navigation.navigate('UserProfile')}>
            <FontAwesome5 name="user-circle" size={30} color="#333" />
          </TouchableOpacity>
        </View>

        <Text style={styles.pageTitle}>Book A Table</Text>

        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <FontAwesome5 name="search" size={14} color="#666" />
            <TextInput
              placeholder="Search For Table..."
              style={styles.searchInput}
              value={query}
              onChangeText={setQuery}
              returnKeyType="search"
              onSubmitEditing={onSearch}
            />
          </View>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#000" />
        ) : (
        <FlatList
          data={tables}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <TableCard item={item} onBook={onBookTable} />
          )}
          refreshing={refreshing}
          onRefresh={onRefresh}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
        )}
      </View>

      <View style={styles.bottom}>
        <BottomNav />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    paddingHorizontal: 18,
    paddingTop: 18,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  logo: {
    width: 58,
    height: 58,
    borderRadius: 30,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#101010',
    borderRadius: 30,
    paddingHorizontal: 12,
    alignItems: 'center',
    height: 42,
  },
  searchInput: {
    marginLeft: 8,
    flex: 1,
  },
  card: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 16,
    marginBottom: 16,
    flex: 1,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#000',
  },
  cardImage: {
    width: '100%',
    height: 100,
    borderRadius: 12,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'center',
  },
  cardDesc: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  price: {
    fontSize: 13,
    fontWeight: '700',
    color: '#222',
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginLeft: 4,
  },
  bookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2F80ED',
    paddingVertical: 6,
    justifyContent: 'center',
    borderRadius: 8,
    marginTop: 6,
  },
  bookBtnText: {
    color: '#fff',
    marginLeft: 6,
    fontWeight: '600',
    fontSize: 12,
  },
  bottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
  },
});
