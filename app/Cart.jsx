import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { useNavigation, useRoute } from '@react-navigation/native';

const API_HOST = 'http://localhost:5000';

export default function Cart() {
  const navigation = useNavigation();
  const route = useRoute();
  const userId = route.params?.userId;

  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const fetchCart = async () => {
    try {
      const resp = await fetch(`${API_HOST}/api/user/cart?userId=${userId}`);
      const data = await resp.json();

      if (resp.ok && Array.isArray(data.cart)) {
        setCart(data.cart);
        const totalAmount = data.cart.reduce(
          (sum, item) => sum + (item.product?.price || 0) * item.quantity,
          0
        );
        setTotal(totalAmount);
      } else {
        setCart([]);
      }
    } catch (err) {
      console.error('Fetch cart failed:', err);
      setCart([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const onCheckout = () => {
    navigation.navigate('PlaceOrder', { userId, cart });
  };

  const renderItem = ({ item }) => {
    const product = item.product;
    const imageUri =
      product?.image?.startsWith('http') || product?.image?.startsWith('file')
        ? product.image
        : null;

    return (
      <View style={styles.cartItem}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.productImage} />
        ) : (
          <View style={styles.noImageBox}>
            <Text style={styles.noImageText}>No Image</Text>
          </View>
        )}
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.productName}>{product?.name || 'Unknown'}</Text>
          <Text style={styles.productPrice}>₱ {product?.price}</Text>
          <Text style={styles.productQty}>Qty: {item.quantity}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <FontAwesome5 name="arrow-left" size={20} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>My Cart</Text>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 30 }} size="large" />
      ) : cart.length === 0 ? (
        <View style={styles.emptyBox}>
          <FontAwesome5 name="shopping-cart" size={60} color="#ccc" />
          <Text style={styles.emptyText}>Your cart is empty</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={cart}
            keyExtractor={(item) => item._id}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 100 }}
          />

          <View style={styles.footer}>
            <Text style={styles.totalText}>Total: ₱ {total.toFixed(2)}</Text>
            <TouchableOpacity style={styles.checkoutBtn} onPress={onCheckout}>
              <Text style={styles.checkoutText}>Checkout</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  title: { fontSize: 20, fontWeight: 'bold', marginLeft: 10 },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 15,
    marginVertical: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 10,
  },
  productImage: { width: 70, height: 70, borderRadius: 10 },
  noImageBox: {
    width: 70,
    height: 70,
    borderRadius: 10,
    backgroundColor: '#f1f1f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageText: { color: '#888', fontSize: 12 },
  productName: { fontSize: 16, fontWeight: '600' },
  productPrice: { color: '#0a8f2d', marginTop: 4 },
  productQty: { color: '#555', fontSize: 13, marginTop: 2 },
  emptyBox: { alignItems: 'center', marginTop: 50 },
  emptyText: { marginTop: 10, color: '#777' },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderTopWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fff',
  },
  totalText: { fontSize: 18, fontWeight: 'bold' },
  checkoutBtn: {
    backgroundColor: '#2986FE',
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 10,
  },
  checkoutText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
