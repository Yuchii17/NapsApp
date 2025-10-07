import React, { useEffect, useState } from 'react';
import {StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Image, ActivityIndicator, FlatList, Platform,} from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { useNavigation } from '@react-navigation/native';
import BottomNav from '../assets/utils/BottomNav';

const API_HOST = 'http://localhost:5000';
const PRODUCTS_ENDPOINT = `${API_HOST}/api/user/products`;

function capitalize(s) {
  if (!s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const ProductCard = ({ item, onAdd }) => {
  const imageUri = (() => {
    if (item.image && typeof item.image === 'string') {
      if (item.image.startsWith('http')) {
        return item.image;
      } else {
        return null;
      }
    }
    return null;
  })();

  return (
    <View style={styles.card}>
      <Image
        source={{ uri: imageUri }}
        style={{ width: 120, height: 120, borderRadius: 10 }}
        resizeMode="cover"
      />
      <Text style={styles.productTitle}>{item.name}</Text>
      <View style={styles.priceRow}>
        <Text style={styles.price}>₱ {item.price}</Text>
        {item.category ? (
          <View style={styles.tag}>
            <Text style={styles.tagText}>{capitalize(item.category)}</Text>
          </View>
        ) : null}
      </View>
      <Text style={styles.productDesc} numberOfLines={2}>
        {item.description}
      </Text>
      <TouchableOpacity style={styles.addButton} onPress={() => onAdd(item)}>
        <FontAwesome5 name="cart-plus" size={14} color="#fff" />
        <Text style={styles.addButtonText}>Add To Cart</Text>
      </TouchableOpacity>
    </View>
  );
};

export default function UserMenu() {
  const navigation = useNavigation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchProducts = async (q = '') => {
    try {
      setLoading(true);
      const url = q ? `${PRODUCTS_ENDPOINT}?q=${encodeURIComponent(q)}` : PRODUCTS_ENDPOINT;
      const resp = await fetch(url);
      const data = await resp.json();
      if (resp.ok && Array.isArray(data.products)) {
        setProducts(data.products);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error('Failed to load products', err);
      setProducts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const onSearch = () => {
    fetchProducts(query.trim());
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchProducts(query.trim());
  };

  const onAddToCart = (product) => {
    console.log('Add to cart', product._id);
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerRow}>
          <Image source={require('../assets/logo.jpg')} style={styles.logo} />
          <TouchableOpacity onPress={() => navigation.navigate('UserProfile')}>
            <FontAwesome5 name="user-circle" size={30} color="#333" />
          </TouchableOpacity>
        </View>

        <Text style={styles.pageTitle}>Menu</Text>

        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <FontAwesome5 name="search" size={14} color="#666" />
            <TextInput
              placeholder="Search For Products..."
              style={styles.searchInput}
              value={query}
              onChangeText={setQuery}
              returnKeyType="search"
              onSubmitEditing={onSearch}
            />
          </View>

          <TouchableOpacity style={styles.iconButton} onPress={() => {}}>
            <FontAwesome5 name="sliders-h" size={16} color="#222" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Orders')}>
            <FontAwesome5 name="shopping-cart" size={16} color="#222" />
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator style={{ marginTop: 30 }} size="large" />
        ) : (
          <FlatList
            contentContainerStyle={styles.list}
            data={products}
            keyExtractor={(item) => item._id}
            numColumns={2}
            columnWrapperStyle={styles.column}
            refreshing={refreshing}
            onRefresh={onRefresh}
            renderItem={({ item }) => <ProductCard item={item} onAdd={onAddToCart} />}
            ListEmptyComponent={<Text style={styles.emptyText}>No products found.</Text>}
          />
        )}

        <View style={{ height: 110 }} />
      </ScrollView>

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
    paddingBottom: 20,
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
  iconButton: {
    borderWidth: 1,
    borderColor: '#101010',
    borderRadius: 20,
    padding: 8,
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    paddingBottom: 10,
  },
  column: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  card: {
    width: Platform.OS === 'web' ? '48%' : '47%',
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e6e6e6',
    padding: 10,
    alignItems: 'center',
  },
  cardImage: {
    width: 92,
    height: 92,
    borderRadius: 10,
    marginBottom: 10,
    resizeMode: 'cover',
  },
  productTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
    textAlign: 'center',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  price: {
    color: '#0a8f2d',
    fontWeight: '700',
    marginRight: 8,
  },
  tag: {
    backgroundColor: '#ffe6e6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  tagText: {
    color: '#d14b4b',
    fontSize: 11,
    fontWeight: '600',
  },
  productDesc: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: '#2986FE',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 30,
    color: '#666',
  },
  bottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
  },
});
