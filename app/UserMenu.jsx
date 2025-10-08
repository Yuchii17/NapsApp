import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  FlatList,
  Platform,
  Modal,
} from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { useNavigation, useRoute } from '@react-navigation/native';
import BottomNav from '../assets/utils/BottomNav';

const API_HOST = 'http://localhost:5000'; 
const PRODUCTS_ENDPOINT = `${API_HOST}/api/user/products`;

function capitalize(s) {
  if (!s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const ProductCard = ({ item, onAdd }) => {
  const imageUri = item.image?.startsWith('http') ? item.image : null;

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
  const route = useRoute();

  const userId = route.params?.userId || '66f9f3a1234abcd56789ef00';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);


  const [cartCount, setCartCount] = useState(0);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalMsg, setModalMsg] = useState('');
  const [modalType, setModalType] = useState('success');

  const fetchProducts = async (q = '') => {
    try {
      setLoading(true);
      const url = q
        ? `${PRODUCTS_ENDPOINT}?q=${encodeURIComponent(q)}`
        : PRODUCTS_ENDPOINT;
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

  const fetchCartCount = async () => {
    try {
      const resp = await fetch(`${API_HOST}/api/user/cart?userId=${userId}`);
      const data = await resp.json();
      if (resp.ok && Array.isArray(data.cart)) {
        setCartCount(data.cart.length);
      } else {
        setCartCount(0);
      }
    } catch (err) {
      console.error('Failed to load cart count', err);
      setCartCount(0);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCartCount();
  }, []);

  const onSearch = () => {
    fetchProducts(query.trim());
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchProducts(query.trim());
  };

const onAddToCart = async (product) => {
  try {
    const response = await fetch(`${API_HOST}/api/user/cart`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        productId: product._id,
        quantity: 1,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log('Added to cart:', data.cart);

      setModalType('success');
      setModalMsg(`${product.name} added successfully!`);
      setModalVisible(true);

      setTimeout(() => setModalVisible(false), 1000);

      fetchCartCount();
    } else {
      setModalType('error');
      setModalMsg(data.message || 'Failed to add to cart.');
      setModalVisible(true);

      setTimeout(() => setModalVisible(false), 1000);
    }
  } catch (err) {
    console.error('Add to cart error:', err);
    setModalType('error');
    setModalMsg('Unable to connect to server.');
    setModalVisible(true);

    setTimeout(() => setModalVisible(false), 1000);
  }
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

          <TouchableOpacity style={styles.iconButton}>
            <FontAwesome5 name="sliders-h" size={16} color="#222" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate('Cart', { userId })}
          >
            <FontAwesome5 name="shopping-cart" size={16} color="#222" />
            {cartCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartCount}</Text>
              </View>
            )}
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
            renderItem={({ item }) => (
              <ProductCard item={item} onAdd={onAddToCart} />
            )}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No products found.</Text>
            }
          />
        )}

        <View style={{ height: 110 }} />
      </ScrollView>

      <View style={styles.bottom}>
        <BottomNav />
      </View>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalBox}>
            <FontAwesome5
              name={modalType === 'success' ? 'check-circle' : 'exclamation-circle'}
              size={42}
              color={modalType === 'success' ? '#28a745' : '#dc3545'}
              style={{ marginBottom: 10 }}
            />
            <Text style={styles.modalText}>{modalMsg}</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  container: { paddingHorizontal: 18, paddingTop: 18, paddingBottom: 20 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  logo: { width: 58, height: 58, borderRadius: 30 },
  pageTitle: { fontSize: 22, fontWeight: '700', marginBottom: 12 },
  searchRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
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
  searchInput: { marginLeft: 8, flex: 1 },
  iconButton: {
    borderWidth: 1,
    borderColor: '#101010',
    borderRadius: 20,
    padding: 8,
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadge: {
    position: 'absolute',
    right: -2,
    top: -4,
    backgroundColor: '#ff3b30',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  list: { paddingBottom: 10 },
  column: { justifyContent: 'space-between', marginBottom: 12 },
  card: {
    width: Platform.OS === 'web' ? '48%' : '47%',
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e6e6e6',
    padding: 10,
    alignItems: 'center',
  },
  productTitle: { fontSize: 14, fontWeight: '700', marginBottom: 6, textAlign: 'center' },
  priceRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  price: { color: '#0a8f2d', fontWeight: '700', marginRight: 8 },
  tag: { backgroundColor: '#ffe6e6', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
  tagText: { color: '#d14b4b', fontSize: 11, fontWeight: '600' },
  productDesc: { fontSize: 12, color: '#666', textAlign: 'center', marginBottom: 10 },
  addButton: {
    flexDirection: 'row',
    backgroundColor: '#2986FE',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  addButtonText: { color: '#fff', marginLeft: 8, fontWeight: '600' },
  emptyText: { textAlign: 'center', marginTop: 30, color: '#666' },
  bottom: { position: 'absolute', left: 0, right: 0, bottom: 0, alignItems: 'center' },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalBox: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 25,
    alignItems: 'center',
    width: '80%',
  },
  modalText: { fontSize: 16, textAlign: 'center', marginBottom: 12 },
  modalButton: { borderRadius: 10, paddingHorizontal: 20, paddingVertical: 10 },
  modalButtonText: { color: '#fff', fontWeight: 'bold' },
});