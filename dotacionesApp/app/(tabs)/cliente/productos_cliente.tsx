import React, { useState, useCallback } from 'react';
import { router, useFocusEffect } from 'expo-router';
import {
  View, Text, TouchableOpacity, FlatList,
  StyleSheet, ImageBackground, SafeAreaView, Alert,
  Modal, Image,
} from 'react-native';
import axios from 'axios';
import { sesion } from '../../../constants/sesion';

const API_URL      = 'http://192.168.1.19/doto/api/productos.php';
const API_CARRITO  = 'http://192.168.1.19/doto/api/carrito.php';
const API_PEDIDOS  = 'http://192.168.1.19/doto/api/pedidos.php';
const API_BASE     = 'http://192.168.1.19/doto/';

type Producto = {
  id_producto: number;
  nombre:      string;
  precio:      number;
  talla:       string;
  color:       string;
  imagen?:     string;
  estado:      'Disponible' | 'Agotado';
};

type ItemCarrito = Producto & {
  cantidad:            number;
  id_detalle_carrito?: number;
};

export default function ProductosCliente() {
  const [productos,      setProductos]      = useState<Producto[]>([]);
  const [carrito,        setCarrito]        = useState<ItemCarrito[]>([]);
  const [carritoVisible, setCarritoVisible] = useState(false);
  const [enviandoPedido, setEnviandoPedido] = useState(false);

  // Recarga productos y carrito cada vez que la pantalla recibe foco
  // así al cambiar de usuario siempre carga los datos correctos
  useFocusEffect(
    useCallback(() => {
      setProductos([]);
      setCarrito([]);
      cargar();
      cargarCarrito();
    }, [])
  );

  const cargar = async () => {
    try {
      const res = await axios.get(API_URL, { timeout: 5000 });
      const data: Producto[] = Array.isArray(res.data) ? res.data : [];
      setProductos(data);
    } catch {
      // sin servidor
    }
  };

  const cargarCarrito = async () => {
    if (!sesion.id) return;
    try {
      const res = await axios.get(API_CARRITO, {
        params: { id_usuario: sesion.id },
        timeout: 5000,
      });
      const data = Array.isArray(res.data) ? res.data : [];
      const items: ItemCarrito[] = data.map((d: any) => ({
        id_producto:        d.id_producto,
        id_detalle_carrito: d.id_detalle_carrito,
        nombre:             d.nombre,
        precio:             d.precio,
        talla:              d.talla,
        color:              d.color,
        imagen:             d.imagen,
        estado:             d.estado,
        cantidad:           d.cantidad,
      }));
      setCarrito(items);
    } catch {
      // sin servidor
    }
  };

  const agregarAlCarrito = async (producto: Producto) => {
    if (producto.estado === 'Agotado') return;
    try {
      await axios.post(API_CARRITO, {
        id_usuario:  sesion.id,
        id_producto: producto.id_producto,
        cantidad:    1,
      });
      await cargarCarrito();
      Alert.alert('🛒 Carrito', `"${producto.nombre}" agregado al carrito`);
    } catch {
      Alert.alert('⚠ Error', 'No se pudo agregar el producto al carrito');
    }
  };

  const quitarDelCarrito = async (item: ItemCarrito) => {
    if (!item.id_detalle_carrito) return;
    try {
      await axios.delete(API_CARRITO, {
        params: { id_detalle_carrito: item.id_detalle_carrito },
      });
      await cargarCarrito();
    } catch {
      Alert.alert('⚠ Error', 'No se pudo quitar el producto');
    }
  };

  const realizarPedido = async () => {
    if (carrito.length === 0) return;
    setEnviandoPedido(true);
    try {
      await axios.post(API_PEDIDOS, { id_usuario: sesion.id });
      setCarritoVisible(false);
      setCarrito([]);
     
      router.push('/cliente/pedidos_cliente' as any);
    } catch {
      Alert.alert('⚠ Error', 'No se pudo registrar el pedido');
    } finally {
      setEnviandoPedido(false);
    }
  };

  const totalCarrito = carrito.reduce((acc, i) => acc + i.precio * i.cantidad, 0);

  const obtenerImagen = (imagen?: string) => {
    if (!imagen) return '';
    if (/^https?:\/\//i.test(imagen)) return imagen;
    return `${API_BASE}${imagen.replace(/^\/+/, '')}`;
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
      <View style={styles.overlay} />

      <SafeAreaView style={styles.safeArea}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.replace('/cliente/panel_cliente')}
            style={styles.btnVolver}
          >
            <Text style={styles.btnVolverTexto}>←</Text>
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
            { label: 'Inicio',    icon: '🏠', route: '/cliente/panel_cliente' },
            { label: 'Productos', icon: '📦', active: true },
            { label: 'Pedidos',   icon: '📋', route: '/cliente/pedidos_cliente' },
            { label: 'Perfil',    icon: '👤', route: '/cliente/perfil_cliente' },
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
                  <View key={item.id_detalle_carrito ?? item.id_producto} style={styles.carritoItem}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.carritoNombre}>{item.nombre}</Text>
                      <Text style={styles.carritoDetalle}>
                        {item.cantidad} x ${Number(item.precio).toLocaleString('es-CO')}
                      </Text>
                    </View>
                    <TouchableOpacity onPress={() => quitarDelCarrito(item)}>
                      <Text style={styles.carritoQuitar}>✖</Text>
                    </TouchableOpacity>
                  </View>
                ))}
                <View style={styles.carritoTotal}>
                  <Text style={styles.carritoTotalLabel}>Total</Text>
                  <Text style={styles.carritoTotalValor}>${totalCarrito.toLocaleString('es-CO')}</Text>
                </View>
                <TouchableOpacity
                  style={[styles.btnPedir, enviandoPedido && { opacity: 0.6 }]}
                  onPress={realizarPedido}
                  disabled={enviandoPedido}
                >
                  <Text style={styles.btnPedirText}>
                    {enviandoPedido ? 'Enviando...' : 'Realizar Pedido'}
                  </Text>
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
  background: { flex: 1 },
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
  },
  safeArea: { flex: 1 },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 14, paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 1.0)',
    borderBottomWidth: 1.5, borderBottomColor: '#1E40AF',
  },
  btnVolver: {
    backgroundColor: '#1E40AF', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 4,
  },
  btnVolverTexto: { color: '#F8FAFC', fontSize: 20, fontWeight: '600' },
  logoArea:    { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoCircle:  {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: '#1E40AF', alignItems: 'center', justifyContent: 'center',
  },
  logoInitials: { color: '#F8FAFC', fontWeight: 'bold', fontSize: 10 },
  brand:        { color: '#0F172A', fontWeight: '700', fontSize: 15 },
  carritoBtn:   { position: 'relative', padding: 4 },
  carritoIcon:  { fontSize: 22 },
  carritoBadge: {
    position: 'absolute', top: 0, right: 0,
    backgroundColor: '#1E40AF', borderRadius: 8,
    minWidth: 16, alignItems: 'center',
  },
  carritoBadgeText: { color: '#F8FAFC', fontSize: 10, fontWeight: 'bold', paddingHorizontal: 3 },

  hero: {
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 1.0)',
    borderBottomWidth: 1.5, borderBottomColor: '#1E40AF',
  },
  heroTitle: { color: '#0F172A', fontSize: 20, fontWeight: '700', marginBottom: 8 },
  heroDesc:  { color: '#64748B', fontSize: 12, lineHeight: 19 },

  listContent: { padding: 10, paddingBottom: 24 },
  row:         { justifyContent: 'space-between', marginBottom: 10 },
  empty:       { color: '#0F172A', textAlign: 'center', marginTop: 40, fontSize: 13 },

  card: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 1.0)',
    borderWidth: 1.5, borderColor: '#1E40AF',
    borderRadius: 12, padding: 10,
  },
  cardImg:            { width: '100%', height: 76, borderRadius: 8, marginBottom: 8 },
  cardImgPlaceholder: {
    backgroundColor: '#F1F5F9', borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
    height: 70, marginBottom: 8,
  },
  cardImgIcon:  { fontSize: 32 },
  cardNombre:   { color: '#0F172A', fontWeight: '700', fontSize: 13, marginBottom: 4 },
  cardPrecio:   { color: '#0F172A', fontWeight: '700', fontSize: 15, marginBottom: 6 },
  cardInfo:     { marginBottom: 6 },
  cardInfoText: { color: '#64748B', fontSize: 11 },

  estadoBadge:      {
    borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3,
    alignSelf: 'flex-start', marginBottom: 8, borderWidth: 1,
  },
  estadoDisponible: { backgroundColor: '#DCFCE7', borderColor: '#16A34A' },
  estadoAgotado:    { backgroundColor: '#FEE2E2', borderColor: '#DC2626' },
  estadoText:       { fontSize: 10, fontWeight: 'bold' },
  estadoDispText:   { color: '#16A34A' },
  estadoAgotText:   { color: '#DC2626' },

  btnAgregar:         { backgroundColor: '#1E40AF', padding: 7, borderRadius: 6, alignItems: 'center' },
  btnAgregarDisabled: { backgroundColor: '#94A3B8' },
  btnAgregarText:     { color: '#F8FAFC', fontSize: 11, fontWeight: '600' },

  bottomNav: {
    flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 10,
    backgroundColor: 'rgba(255, 255, 255, 1.0)',
    borderTopWidth: 1.5, borderTopColor: '#1E40AF',
  },
  bnav:       { alignItems: 'center', gap: 2 },
  bnavIcon:   { fontSize: 18 },
  bnavLabel:  { fontSize: 9, color: '#64748B' },
  bnavActive: { color: '#0F172A', fontWeight: '700' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.4)', justifyContent: 'flex-end' },
  modalBox: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 20, maxHeight: '70%',
    borderTopWidth: 1.5, borderColor: '#1E40AF',
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 16,
  },
  modalTitle:  { color: '#0F172A', fontWeight: '700', fontSize: 16 },
  modalCerrar: { color: '#64748B', fontSize: 18 },

  carritoItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#E2E8F0',
  },
  carritoNombre:     { color: '#0F172A', fontSize: 13, fontWeight: '500' },
  carritoDetalle:    { color: '#64748B', fontSize: 12 },
  carritoQuitar:     { color: '#DC2626', fontSize: 16, paddingLeft: 10 },
  carritoTotal: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 12, borderTopWidth: 1,
    borderTopColor: '#E2E8F0', marginTop: 8,
  },
  carritoTotalLabel: { color: '#0F172A', fontWeight: 'bold', fontSize: 14 },
  carritoTotalValor: { color: '#0F172A', fontWeight: 'bold', fontSize: 16 },
  btnPedir:          { backgroundColor: '#1E40AF', padding: 13, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  btnPedirText:      { color: '#F8FAFC', fontWeight: '600', fontSize: 14 },
});