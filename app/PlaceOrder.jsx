import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { useNavigation, useRoute } from '@react-navigation/native';

const API_HOST = 'http://localhost:5000';

export default function PlaceOrder() {
  const navigation = useNavigation();
  const route = useRoute();
  const { userId, cart, user } = route.params || {};

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showProcessingModal, setShowProcessingModal] = useState(false);

  const [referenceNumber, setReferenceNumber] = useState('');
  const [proofOfPayment, setProofOfPayment] = useState(null);
  const [fileName, setFileName] = useState('');

  const [userDetails, setUserDetails] = useState(user || {});

  useEffect(() => {
    if (cart && cart.length > 0) {
      setItems(cart);
      const totalAmount = cart.reduce(
        (sum, item) => sum + (item.product?.price || 0) * item.quantity,
        0
      );
      setTotal(totalAmount);
    }
  }, [cart]);

  // 📤 Select file
  const selectProofFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['image/*', 'application/pdf'],
    });

    if (!result.canceled) {
      setProofOfPayment(result.assets[0]);
      setFileName(result.assets[0].name);
    }
  };

  // 🧾 Submit Order
  const onConfirmOrder = async () => {
    if (!referenceNumber || !proofOfPayment) {
      Alert.alert('Missing Info', 'Please provide all required payment details.');
      return;
    }

    setShowProcessingModal(true);

    const formData = new FormData();
    formData.append('userId', userId);
    formData.append('total', total);
    formData.append(
      'items',
      JSON.stringify(
        items.map((item) => ({
          productId: item.product._id,
          quantity: item.quantity,
        }))
      )
    );
    formData.append('payment[method]', 'GCash');
    formData.append('payment[referenceNumber]', referenceNumber);

    if (proofOfPayment) {
      const fileUri = proofOfPayment.uri;
      const fileType = proofOfPayment.mimeType || 'image/jpeg';
      formData.append('proofOfPayment', {
        uri: fileUri,
        name: proofOfPayment.name || 'proof.jpg',
        type: fileType,
      });
    }

    try {
      const resp = await fetch(`${API_HOST}/api/user/placeOrder`, {
        method: 'POST',
        body: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const data = await resp.json();
      setShowProcessingModal(false);

      if (resp.ok) {
        setUserDetails(data.order.userDetails);
        setShowDetailsModal(false);
        Alert.alert('Order Placed!', 'Your order has been successfully submitted.', [
          { text: 'OK', onPress: () => navigation.navigate('UserMenu', { userId }) },
        ]);
      } else {
        Alert.alert('Error', data.message || 'Failed to place order.');
      }
    } catch (err) {
      console.error('Checkout failed:', err);
      setShowProcessingModal(false);
      Alert.alert('Error', 'Unable to connect to server.');
    }
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
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <FontAwesome5 name="arrow-left" size={20} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Checkout</Text>
      </View>

      {items.length === 0 ? (
        <View style={styles.emptyBox}>
          <FontAwesome5 name="shopping-cart" size={60} color="#ccc" />
          <Text style={styles.emptyText}>No items in cart</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={items}
            keyExtractor={(item) => item._id}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 100 }}
          />

          <View style={styles.footer}>
            <Text style={styles.totalText}>Total: ₱ {total.toFixed(2)}</Text>
            <TouchableOpacity
              style={styles.confirmBtn}
              onPress={() => setShowQRModal(true)}
            >
              <Text style={styles.confirmText}>Confirm Order</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* 1️⃣ QR Modal */}
      <Modal transparent visible={showQRModal} animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>GCash Payment</Text>
            <Image
              source={{
                uri: 'https://upload.wikimedia.org/wikipedia/commons/4/4e/GCash_logo.png',
              }}
              style={styles.qrImage}
            />
            <Text style={styles.modalDesc}>
              Please scan and complete your payment. Then tap “Next” to upload proof.
            </Text>
            <TouchableOpacity
              style={styles.nextBtn}
              onPress={() => {
                setShowQRModal(false);
                setShowDetailsModal(true);
              }}
            >
              <Text style={styles.nextText}>Next</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 2️⃣ Payment Details Modal */}
      <Modal transparent visible={showDetailsModal} animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Payment Details</Text>

            <Text style={styles.label}>Name:</Text>
            <Text style={styles.value}>{userDetails.firstName} {userDetails.lastName}</Text>

            <Text style={styles.label}>Address:</Text>
            <Text style={styles.value}>{userDetails.address}</Text>

            <Text style={styles.label}>Contact:</Text>
            <Text style={styles.value}>{userDetails.contactNo}</Text>

            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{userDetails.email}</Text>

            <TextInput
              style={styles.input}
              placeholder="Enter Reference Number"
              value={referenceNumber}
              onChangeText={setReferenceNumber}
            />

            <TouchableOpacity style={styles.uploadBtn} onPress={selectProofFile}>
              <FontAwesome5 name="upload" size={18} color="#fff" />
              <Text style={styles.uploadText}>
                {fileName ? ` ${fileName}` : ' Upload Proof of Payment'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.nextBtn} onPress={onConfirmOrder}>
              <Text style={styles.nextText}>Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 3️⃣ Processing Modal */}
      <Modal transparent visible={showProcessingModal} animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.processingBox}>
            <ActivityIndicator size="large" color="#2986FE" />
            <Text style={styles.processingText}>Processing your order...</Text>
          </View>
        </View>
      </Modal>
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
  confirmBtn: {
    backgroundColor: '#2986FE',
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 10,
  },
  confirmText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
  },
  processingBox: {
    width: '70%',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 25,
    alignItems: 'center',
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  modalDesc: { textAlign: 'center', color: '#555', marginBottom: 15 },
  qrImage: { width: 150, height: 150, marginBottom: 10 },
  nextBtn: {
    backgroundColor: '#2986FE',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginTop: 10,
  },
  uploadBtn: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
  },
  uploadText: { color: '#fff', fontWeight: 'bold' },
  nextText: { color: '#fff', fontWeight: 'bold' },
  label: { alignSelf: 'flex-start', fontWeight: '600', marginTop: 8 },
  value: { alignSelf: 'flex-start', color: '#555', marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 8,
    width: '100%',
    marginTop: 8,
  },
  processingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
});
