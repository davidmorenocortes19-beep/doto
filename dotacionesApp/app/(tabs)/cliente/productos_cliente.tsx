import React, { useState, useEffect } from 'react';
import { router } from 'expo-router';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, ImageBackground, SafeAreaView, Alert,
  Linking, Modal, Image,
} from 'react-native';
import axios from 'axios';

const API_URL = 'http://192.168.1.19/doto/api/productos.php';
const API_BASE = 'http://192.168.1.19/doto/';

type Producto = {
  id_producto: number;
  nombre: string;
  precio: number;
  talla: string;
  color: string;
  imagen?: string;
  estado: 'Disponible' | 'Agotado';
};

type ItemCarrito = Producto & { cantidad: number };

export default function ProductosCliente() {
  const [productos,      setProductos]      = useState<Producto[]>([]);
  const [carrito,        setCarrito]        = useState<ItemCarrito[]>([]);
  const [carritoVisible, setCarritoVisible] = useState(false);
  const [nombre,         setNombre]         = useState('');
  const [correo,         setCorreo]         = useState('');
  const [mensaje,        setMensaje]        = useState('');

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    try {
      const res = await axios.get(API_URL, { timeout: 5000 });
      // La API devuelve directamente el array, no un objeto con .success
      const data: Producto[] = Array.isArray(res.data) ? res.data : [];
      setProductos(data);
    } catch {
      // sin servidor
    }
  };

  const agregarAlCarrito = (producto: Producto) => {
    if (producto.estado === 'Agotado') return;
    setCarrito(prev => {
      const existe = prev.find(i => i.id_producto === producto.id_producto);
      if (existe) {
        return prev.map(i =>
          i.id_producto === producto.id_producto
            ? { ...i, cantidad: i.cantidad + 1 }
            : i
        );
      }
      return [...prev, { ...producto, cantidad: 1 }];
    });
    Alert.alert('🛒 Carrito', `"${producto.nombre}" agregado al carrito`);
  };

  const quitarDelCarrito = (id: number) => {
    setCarrito(prev => prev.filter(i => i.id_producto !== id));
  };

  const totalCarrito = carrito.reduce((acc, i) => acc + i.precio * i.cantidad, 0);

  const obtenerImagen = (imagen?: string) => {
    if (!imagen) return '';
    if (/^https?:\/\//i.test(imagen)) return imagen;
    return `${API_BASE}${imagen.replace(/^\/+/, '')}`;
  };

  const enviarContacto = () => {
    if (!nombre || !correo || !mensaje) {
      Alert.alert('⚠ Todos los campos son obligatorios');
      return;
    }
    Alert.alert('✅ Mensaje enviado');
    setNombre(''); setCorreo(''); setMensaje('');
  };

  const renderProducto = ({ item }: { item: Producto }) => (
    <View style={styles.card}>
      {obtenerImagen(item.imagen) ? (
        <Image
          source={{ uri: obtenerImagen(item.imagen) }}
          style={styles.cardImg}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.cardImgPlaceholder}>
          <Text style={styles.cardImgIcon}>📦</Text>
        </View>
      )}
      <Text style={styles.cardNombre}>{item.nombre}</Text>
      <Text style={styles.cardPrecio}>${Number(item.precio).toLocaleString('es-CO')}</Text>
      <View style={styles.cardInfo}>
        <Text style={styles.cardInfoText}>Talla: {item.talla || 'N/A'}</Text>
        <Text style={styles.cardInfoText}>Color: {item.color || 'N/A'}</Text>
      </View>
      <View style={[styles.estadoBadge,
        item.estado === 'Disponible' ? styles.estadoDisponible : styles.estadoAgotado
      ]}>
        <Text style={[styles.estadoText,
          item.estado === 'Disponible' ? styles.estadoDispText : styles.estadoAgotText
        ]}>
          {item.estado}
        </Text>
      </View>
      <TouchableOpacity
        style={[styles.btnAgregar, item.estado === 'Agotado' && styles.btnAgregarDisabled]}
        onPress={() => agregarAlCarrito(item)}
        disabled={item.estado === 'Agotado'}
      >
        <Text style={styles.btnAgregarText}>
          {item.estado === 'Agotado' ? 'Agotado' : '🛒 Agregar al carrito'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ImageBackground
      source={require('../../../assets/images/camiseta.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safeArea}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.replace('/cliente/panel_cliente')}>
            <Text style={styles.backBtn}>←</Text>
          </TouchableOpacity>
          <View style={styles.logoArea}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoInitials}>DT</Text>
            </View>
            <Text style={styles.brand}>Productos</Text>
          </View>
          <TouchableOpacity onPress={() => setCarritoVisible(true)} style={styles.carritoBtn}>
            <Text style={styles.carritoIcon}>🛒</Text>
            {carrito.length > 0 && (
              <View style={styles.carritoBadge}>
                <Text style={styles.carritoBadgeText}>{carrito.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Nuestros Productos</Text>
          <Text style={styles.heroDesc}>
            Ofrecemos una amplia gama de equipos de protección y uniformes para
            industria, construcción, salud y más. Alta calidad, seguridad y durabilidad.
          </Text>
        </View>

        {/* Lista de productos */}
        <FlatList
          data={productos}
          keyExtractor={item => item.id_producto.toString()}
          renderItem={renderProducto}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          onRefresh={cargar}
          refreshing={false}
          ListEmptyComponent={
            <Text style={styles.empty}>No hay productos disponibles</Text>
          }
        />

        {/* Bottom nav */}
        <View style={styles.bottomNav}>
          {[
            { label: 'Inicio',    icon: '🏠', route: '/cliente/index_cliente' },
            { label: 'Productos', icon: '📦', active: true },
            { label: 'Pedidos',   icon: '📋', route: '/cliente/pedidos' },
            { label: 'Perfil',    icon: '👤', route: '/cliente/perfil' },
          ].map(item => (
            <TouchableOpacity
              key={item.label}
              style={styles.bnav}
              onPress={() => item.route && router.push(item.route as any)}
            >
              <Text style={styles.bnavIcon}>{item.icon}</Text>
              <Text style={[styles.bnavLabel, item.active && styles.bnavActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

      </SafeAreaView>

      {/* Modal Carrito */}
      <Modal visible={carritoVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>🛒 Mi Carrito</Text>
              <TouchableOpacity onPress={() => setCarritoVisible(false)}>
                <Text style={styles.modalCerrar}>✖</Text>
              </TouchableOpacity>
            </View>

            {carrito.length === 0 ? (
              <Text style={styles.empty}>El carrito está vacío</Text>
            ) : (
              <>
                {carrito.map(item => (
                  <View key={item.id_producto} style={styles.carritoItem}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.carritoNombre}>{item.nombre}</Text>
                      <Text style={styles.carritoDetalle}>
                        {item.cantidad} x ${Number(item.precio).toLocaleString('es-CO')}
                      </Text>
                    </View>
                    <TouchableOpacity onPress={() => quitarDelCarrito(item.id_producto)}>
                      <Text style={styles.carritoQuitar}>✖</Text>
                    </TouchableOpacity>
                  </View>
                ))}
                <View style={styles.carritoTotal}>
                  <Text style={styles.carritoTotalLabel}>Total</Text>
                  <Text style={styles.carritoTotalValor}>${totalCarrito.toLocaleString('es-CO')}</Text>
                </View>
                <TouchableOpacity style={styles.btnPedir} onPress={() => {
                  setCarritoVisible(false);
                  router.push('/cliente/pedidos' as any);
                }}>
                  <Text style={styles.btnPedirText}>Realizar Pedido</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background:         { flex: 1 },
  safeArea:           { flex: 1, backgroundColor: 'rgba(9,8,13,0.75)' },

  header:             { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#B7975B', backgroundColor: 'rgba(9,8,13,0.88)' },
  backBtn:            { color: '#B7975B', fontSize: 22, paddingHorizontal: 4 },
  logoArea:           { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoCircle:         { width: 30, height: 30, borderRadius: 15, backgroundColor: '#B7975B', alignItems: 'center', justifyContent: 'center' },
  logoInitials:       { color: '#333333', fontWeight: 'bold', fontSize: 10 },
  brand:              { color: '#B7975B', fontWeight: 'bold', fontSize: 15 },
  carritoBtn:         { position: 'relative', padding: 4 },
  carritoIcon:        { fontSize: 22 },
  carritoBadge:       { position: 'absolute', top: 0, right: 0, backgroundColor: '#B7975B', borderRadius: 8, minWidth: 16, alignItems: 'center' },
  carritoBadgeText:   { color: '#333333', fontSize: 10, fontWeight: 'bold', paddingHorizontal: 3 },

  hero:               { padding: 20, borderBottomWidth: 1, borderBottomColor: '#B7975B' },
  heroTitle:          { color: '#B7975B', fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  heroDesc:           { color: '#333333', fontSize: 12, lineHeight: 19 },

  listContent:        { padding: 10, paddingBottom: 24 },
  row:                { justifyContent: 'space-between', marginBottom: 10 },
  empty:              { color: '#333333', textAlign: 'center', marginTop: 40, fontSize: 13 },

  card:               { width: '48%', backgroundColor: '#fff', borderWidth: 1, borderColor: '#ccc', borderRadius: 10, padding: 10 },
  cardImg:            { width: '100%', height: 76, borderRadius: 8, marginBottom: 8, backgroundColor: '#fff' },
  cardImgPlaceholder: { backgroundColor: '#fff', borderRadius: 8, alignItems: 'center', justifyContent: 'center', height: 70, marginBottom: 8 },
  cardImgIcon:        { fontSize: 32 },
  cardNombre:         { color: '#333333', fontWeight: 'bold', fontSize: 13, marginBottom: 4 },
  cardPrecio:         { color: '#333333', fontWeight: 'bold', fontSize: 15, marginBottom: 6 },
  cardInfo:           { marginBottom: 6 },
  cardInfoText:       { color: '#333333', fontSize: 11 },
  estadoBadge:        { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start', marginBottom: 8, borderWidth: 1 },
  estadoDisponible:   { backgroundColor: '#B7975B22', borderColor: '#ccc' },
  estadoAgotado:      { backgroundColor: '#B7975B22', borderColor: '#ccc' },
  estadoText:         { fontSize: 10, fontWeight: 'bold' },
  estadoDispText:     { color: '#333333' },
  estadoAgotText:     { color: '#333333' },
  btnAgregar:         { backgroundColor: '#B7975B', padding: 7, borderRadius: 6, alignItems: 'center' },
  btnAgregarDisabled: { backgroundColor: '#B7975B' },
  btnAgregarText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },

  seccion:            { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ccc', borderRadius: 12, padding: 14, marginBottom: 14 },
  seccionTitulo:      { color: '#B7975B', fontWeight: 'bold', fontSize: 15, marginBottom: 6 },
  contactoSub:        { color: '#333333', fontSize: 12, marginBottom: 12 },
  input:              { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ccc', color: '#333333', borderRadius: 8, padding: 10, fontSize: 13, marginBottom: 10 },
  textArea:           { height: 80, textAlignVertical: 'top' },
  btnEnviar:          { backgroundColor: '#B7975B', padding: 12, borderRadius: 8, alignItems: 'center' },
  btnEnviarText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },

  footer:             { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ccc', borderRadius: 12, padding: 16, marginBottom: 8, alignItems: 'center' },
  footerTel:          { color: '#333333', fontWeight: 'bold', fontSize: 15, marginBottom: 6 },
  footerInfo:         { color: '#333333', fontSize: 12, marginBottom: 4, textAlign: 'center' },
  horario:            { marginTop: 10, alignItems: 'center' },
  horarioTitulo:      { color: '#B7975B', fontWeight: 'bold', fontSize: 13, marginBottom: 6 },
  horarioText:        { color: '#333333', fontSize: 12, marginBottom: 3 },
  footerCopy:         { color: '#333333', fontSize: 11, marginTop: 12 },

  bottomNav:          { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#B7975B', backgroundColor: 'rgba(9,8,13,0.9)' },
  bnav:               { alignItems: 'center', gap: 2 },
  bnavIcon:           { fontSize: 18 },
  bnavLabel:          { fontSize: 9, color: '#eee' },
  bnavActive:         { color: '#333333' },

  modalOverlay:       { flex: 1, backgroundColor: 'rgba(51,51,51,0.35)', justifyContent: 'flex-end' },
  modalBox:           { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '70%' },
  modalHeader:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle:         { color: '#B7975B', fontWeight: 'bold', fontSize: 16 },
  modalCerrar:        { color: '#333333', fontSize: 18 },
  carritoItem:        { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#B7975B' },
  carritoNombre:      { color: '#333333', fontSize: 13, fontWeight: '500' },
  carritoDetalle:     { color: '#333333', fontSize: 12 },
  carritoQuitar:      { color: '#333333', fontSize: 16, paddingLeft: 10 },
  carritoTotal:       { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#B7975B', marginTop: 8 },
  carritoTotalLabel:  { color: '#eee', fontWeight: 'bold', fontSize: 14 },
  carritoTotalValor:  { color: '#333333', fontWeight: 'bold', fontSize: 16 },
  btnPedir:           { backgroundColor: '#B7975B', padding: 13, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  btnPedirText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
});
