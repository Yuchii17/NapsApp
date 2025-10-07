import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { useNavigation, useRoute } from '@react-navigation/native';
import BottomNav from '../assets/utils/BottomNav';

const API_HOST = 'http://localhost:5000';
const CART_ENDPOINT = `${API_HOST}/api/user/cart`;

export default function Cart() {
  const navigation = useNavigation();
  const route = useRoute();
  const userId = route.params?.userId;
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${CART_ENDPOINT}?userId=${userId}`);
      const data = await res.json();
      if (res.ok) setCartItems(data.cart || []);
      else Alert.alert('Error', data.message || 'Failed to fetch cart');
    } catch (err) {
      console.error('Error fetching cart:', err);
      Alert.alert('Error', 'Unable to load cart');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const updateCartItem = async (productId, action) => {
    try {
      const res = await fetch(`${CART_ENDPOINT}/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, productId, action }),
      });
      const data = await res.json();
      if (res.ok) fetchCart();
      else Alert.alert('Error', data.message || 'Failed to update item');
    } catch (err) {
      console.error('Error updating cart:', err);
    }
  };

  const deleteItem = async (productId) => {
    Alert.alert('Remove Item', 'Are you sure you want to remove this item?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const res = await fetch(`${CART_ENDPOINT}/remove`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId, productId }),
            });
            const data = await res.json();
            if (res.ok) {
              fetchCart();
              setTimeout(() => {
                Alert.alert('Success', 'Product removed successfully');
              }, 1000);
            } else {
              Alert.alert('Error', data.message || 'Failed to delete item');
            }
          } catch (err) {
            console.error('Error deleting item:', err);
          }
        },
      },
    ]);
  };

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => {
      const price = item.product?.price || 0;
      return sum + price * item.quantity;
    }, 0);
  };

  const renderItem = ({ item }) => {
    const imageUri =
      item.product?.image && item.product.image.startsWith('http')
        ? item.product.image
        : null;

    return (
      <View style={styles.card}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} />
        ) : (
          <View style={styles.placeholder}>
            <FontAwesome5 name="image" size={22} color="#aaa" />
          </View>
        )}
        <View style={styles.details}>
          <Text style={styles.name}>{item.product?.name || 'Unnamed Product'}</Text>
          <Text style={styles.price}>₱ {item.product?.price?.toFixed(2) || '0.00'}</Text>
          <View style={styles.qtyContainer}>
            <TouchableOpacity
              onPress={() => updateCartItem(item.product._id, 'decrease')}
              disabled={item.quantity <= 1}
              style={[styles.qtyButton, item.quantity <= 1 && { opacity: 0.4 }]}
            >
              <FontAwesome5 name="minus" size={14} color="#000" />
            </TouchableOpacity>
            <Text style={styles.qtyText}>{item.quantity}</Text>
            <TouchableOpacity
              onPress={() => updateCartItem(item.product._id, 'increase')}
              style={styles.qtyButton}
            >
              <FontAwesome5 name="plus" size={14} color="#000" />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.deleteContainer}>
          <TouchableOpacity onPress={() => deleteItem(item.product._id)}>
            <FontAwesome5 name="trash" size={18} color="#dc3545" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <FontAwesome5 name="arrow-left" size={20} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>My Cart</Text>
        <View style={{ width: 25 }} />
      </View>
      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 40 }} />
      ) : cartItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <FontAwesome5 name="shopping-cart" size={50} color="#aaa" />
          <Text style={styles.emptyText}>Your cart is empty</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={cartItems}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderItem}
            numColumns={2}
            columnWrapperStyle={styles.row}
            contentContainerStyle={{ paddingBottom: 100 }}
          />
          <View style={styles.footer}>
            <Text style={styles.totalText}>Total: ₱ {calculateTotal().toFixed(2)}</Text>
            <TouchableOpacity
              style={styles.checkoutButton}
              onPress={() => Alert.alert('Checkout', 'Proceeding to checkout...')}
            >
              <Text style={styles.checkoutText}>Checkout</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
      <View style={styles.bottom}>
        <BottomNav />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 18, borderBottomWidth: 1, borderBottomColor: '#eaeaea' },
  title: { fontSize: 20, fontWeight: '700' },
  row: { justifyContent: 'space-between', marginHorizontal: 10 },
  card: { flex: 1, margin: 8, borderWidth: 1, borderColor: '#eee', borderRadius: 10, padding: 10, backgroundColor: '#fafafa', alignItems: 'center' },
  image: { width: '100%', height: 120, borderRadius: 10, marginBottom: 8 },
  placeholder: { width: '100%', height: 120, borderRadius: 10, backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  details: { alignItems: 'center' },
  name: { fontSize: 14, fontWeight: '600', textAlign: 'center' },
  price: { color: '#0a8f2d', fontWeight: '700', marginTop: 2 },
  qtyContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  qtyButton: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 4, width: 30, alignItems: 'center' },
  qtyText: { marginHorizontal: 10, fontSize: 16, fontWeight: '600' },
  deleteContainer: { marginTop: 10, alignItems: 'center' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#777', fontSize: 16, marginTop: 10 },
  footer: { position: 'absolute', bottom: 60, left: 0, right: 0, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#eee', padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalText: { fontSize: 16, fontWeight: '700' },
  checkoutButton: { backgroundColor: '#2986FE', paddingVertical: 10, paddingHorizontal: 18, borderRadius: 10 },
  checkoutText: { color: '#fff', fontWeight: '600' },
  bottom: { position: 'absolute', left: 0, right: 0, bottom: 0, alignItems: 'center' },
});
