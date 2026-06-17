import React, { useState, useEffect } from 'react';
import { router } from 'expo-router';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, ImageBackground, SafeAreaView, Alert, Modal,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import axios from 'axios';

const API_URL = 'http://192.168.1.19/doto/api/ventas.php';

type Producto = {
  nombre: string;
  precio: number;
  cantidad: number;
};

type Venta = {
  id?: number;
  cliente: string;
  productos: Producto[];
  estado: 'Pendiente' | 'Completada' | 'Cancelada';
  fecha: string;
};

const hoy = () => new Date().toISOString().split('T')[0];

export default function VerVentasScreen() {
  const [ventas,       setVentas]       = useState<Venta[]>([]);
  const [busqueda,     setBusqueda]     = useState('');
  const [cargando,     setCargando]     = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [ventaSel,     setVentaSel]     = useState<Venta | null>(null);

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    try {
      setCargando(true);
      const res = await axios.get(API_URL, { timeout: 5000 });
      if (res.data.success) setVentas(res.data.data);
    } catch {
      // fallback local
    } finally {
      setCargando(false);
    }
  };

  const cambiarEstado = (index: number, nuevoEstado: Venta['estado']) => {
    Alert.alert(
      'Cambiar estado',
      `¿Marcar esta venta como "${nuevoEstado}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            try {
              const venta = ventas[index];
              await axios.put(API_URL, { id: venta.id, estado: nuevoEstado }, { timeout: 5000 });
              cargar();
            } catch {
              setVentas(prev =>
                prev.map((v, i) => i === index ? { ...v, estado: nuevoEstado } : v)
              );
            }
          },
        },
      ]
    );
  };

  const eliminarVenta = (index: number) => {
    Alert.alert(
      'Eliminar venta',
      '¿Estás seguro de que deseas eliminar esta venta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              const venta = ventas[index];
              await axios.delete(API_URL, { data: { id: venta.id }, timeout: 5000 });
              cargar();
            } catch {
              setVentas(prev => prev.filter((_, i) => i !== index));
            }
          },
        },
      ]
    );
  };

  const verDetalle = (venta: Venta) => {
    setVentaSel(venta);
    setModalVisible(true);
  };

  const calcularTotal = (productos: Producto[]) =>
    productos.reduce((acc, p) => acc + p.precio * (p.cantidad || 1), 0);

  const colorEstado = (estado: string) => {
    if (estado === 'Completada') return { bg: '#333333', border: '#333333', text: '#333333' };
    if (estado === 'Cancelada')  return { bg: '#B7975B22', border: '#333333', text: '#333333' };
    return { bg: '#333333', border: '#333333', text: '#333333' };
  };

  const ventasFiltradas = ventas.filter(v =>
    JSON.stringify(v).toLowerCase().includes(busqueda.toLowerCase())
  );

  const totalGeneral = ventas
    .filter(v => v.estado === 'Completada')
    .reduce((acc, v) => acc + calcularTotal(v.productos), 0);

  const renderItem = ({ item, index }: { item: Venta; index: number }) => {
    const total  = calcularTotal(item.productos);
    const colores = colorEstado(item.estado);

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Venta #{index + 1}</Text>
          <View style={[styles.estadoBadge, { backgroundColor: colores.bg, borderColor: colores.border }]}>
            <Text style={[styles.estadoText, { color: colores.text }]}>{item.estado}</Text>
          </View>
        </View>

        <View style={styles.cardRow}>
          <Text style={styles.rowLabel}>Cliente</Text>
          <Text style={styles.rowValue}>{item.cliente}</Text>
        </View>
        <View style={styles.cardRow}>
          <Text style={styles.rowLabel}>Fecha</Text>
          <Text style={styles.rowValue}>{item.fecha}</Text>
        </View>
        <View style={styles.cardRow}>
          <Text style={styles.rowLabel}>Productos</Text>
          <Text style={styles.rowValue}>{item.productos.length} ítem(s)</Text>
        </View>
        <View style={[styles.cardRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValor}>${total}.000</Text>
        </View>

        <View style={styles.acciones}>
          <TouchableOpacity style={styles.btnDetalle} onPress={() => verDetalle(item)}>
            <Text style={styles.btnText}>Ver detalle</Text>
          </TouchableOpacity>

          {item.estado === 'Pendiente' && (
            <TouchableOpacity style={styles.btnCompletar} onPress={() => cambiarEstado(index, 'Completada')}>
              <Text style={styles.btnText}>Completar</Text>
            </TouchableOpacity>
          )}
          {item.estado === 'Pendiente' && (
            <TouchableOpacity style={styles.btnCancelar} onPress={() => cambiarEstado(index, 'Cancelada')}>
              <Text style={styles.btnText}>Cancelar</Text>
            </TouchableOpacity>
          )}
          {item.estado !== 'Pendiente' && (
            <TouchableOpacity style={styles.btnEliminar} onPress={() => eliminarVenta(index)}>
              <Text style={styles.btnText}>Eliminar</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <ImageBackground
      source={require('../../../assets/images/camiseta.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safeArea}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.replace('/vendedor/panel_vendedor')}>
            <Text style={styles.backBtn}>←</Text>
          </TouchableOpacity>
          <View style={styles.logoArea}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoInitials}>DT</Text>
            </View>
            <Text style={styles.headerTitle}>Ver Ventas</Text>
          </View>
          <View style={{ width: 32 }} />
        </View>

        {/* Resumen */}
        <View style={styles.resumen}>
          <View style={styles.resumenCard}>
            <Text style={styles.resumenNum}>{ventas.length}</Text>
            <Text style={styles.resumenLabel}>Total ventas</Text>
          </View>
          <View style={styles.resumenCard}>
            <Text style={styles.resumenNum}>{ventas.filter(v => v.estado === 'Completada').length}</Text>
            <Text style={styles.resumenLabel}>Completadas</Text>
          </View>
          <View style={styles.resumenCard}>
            <Text style={styles.resumenNum}>${totalGeneral}.000</Text>
            <Text style={styles.resumenLabel}>Ingresos</Text>
          </View>
        </View>

        {/* Búsqueda */}
        <View style={styles.searchWrap}>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por cliente, fecha, estado..."
            placeholderTextColor="#333333"
            value={busqueda}
            onChangeText={setBusqueda}
          />
          <Text style={styles.searchIcon}>🔍</Text>
        </View>

        {/* Lista */}
        <FlatList
          data={ventasFiltradas}
          keyExtractor={(_, i) => i.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.empty}>Sin ventas registradas</Text>
          }
        />

        {/* Bottom nav */}
        <View style={styles.bottomNav}>
          {[
            { label: 'Inicio',  icon: '🏠', route: '/vendedor/panel_vendedor' },
            { label: 'Pedidos', icon: '📋', route: '/vendedor/pedidos_vendedor' },
            { label: 'Ventas',  icon: '💰', active: true },
            { label: 'Perfil',  icon: '👤', route: '/vendedor/perfil_vendedor' },
            { label: 'Devol.', icon: '↩️', route: '/vendedor/devoluciones' },
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

      {/* Modal detalle */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Detalle de venta</Text>

            {ventaSel && (
              <>
                <View style={styles.cardRow}>
                  <Text style={styles.rowLabel}>Cliente</Text>
                  <Text style={styles.rowValue}>{ventaSel.cliente}</Text>
                </View>
                <View style={styles.cardRow}>
                  <Text style={styles.rowLabel}>Fecha</Text>
                  <Text style={styles.rowValue}>{ventaSel.fecha}</Text>
                </View>
                <View style={styles.cardRow}>
                  <Text style={styles.rowLabel}>Estado</Text>
                  <Text style={[styles.rowValue, { color: colorEstado(ventaSel.estado).text }]}>
                    {ventaSel.estado}
                  </Text>
                </View>

                <Text style={styles.prodTitle}>Productos</Text>
                {ventaSel.productos.map((p, i) => (
                  <View key={i} style={styles.productoItem}>
                    <Text style={styles.productoNombre}>{p.nombre}</Text>
                    <View style={styles.productoDetalle}>
                      <Text style={styles.productoInfo}>Cant: {p.cantidad}</Text>
                      <Text style={styles.productoInfo}>${p.precio}.000</Text>
                    </View>
                  </View>
                ))}

                <View style={[styles.cardRow, styles.totalRow, { marginTop: 12 }]}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.totalValor}>${calcularTotal(ventaSel.productos)}.000</Text>
                </View>
              </>
            )}

            <TouchableOpacity style={styles.btnCerrar} onPress={() => setModalVisible(false)}>
              <Text style={styles.btnCerrarText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background:    { flex: 1 },
  safeArea:      { flex: 1, backgroundColor: 'rgba(248,249,250,0.96)' },

  header:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#333333', backgroundColor: 'rgba(248,249,250,0.97)' },
  backBtn:       { color: '#333333', fontSize: 22, paddingHorizontal: 4 },
  logoArea:      { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoCircle:    { width: 30, height: 30, borderRadius: 15, backgroundColor: '#B7975B', alignItems: 'center', justifyContent: 'center' },
  logoInitials:  { color: '#333333', fontWeight: 'bold', fontSize: 10 },
  headerTitle:   { color: '#333333', fontWeight: 'bold', fontSize: 15 },

  resumen:       { flexDirection: 'row', gap: 8, padding: 12 },
  resumenCard:   { flex: 1, backgroundColor: '#F8F9FA', borderWidth: 1, borderColor: '#333333', borderRadius: 10, padding: 10, alignItems: 'center' },
  resumenNum:    { color: '#333333', fontWeight: 'bold', fontSize: 15 },
  resumenLabel:  { color: '#333333', fontSize: 10, marginTop: 2, textAlign: 'center' },

  searchWrap:    { flexDirection: 'row', alignItems: 'center', marginHorizontal: 12, marginBottom: 10, backgroundColor: '#F8F9FA', borderWidth: 1, borderColor: '#333333', borderRadius: 8 },
  searchInput:   { flex: 1, color: '#333333', padding: 9, fontSize: 12 },
  searchIcon:    { paddingRight: 10, fontSize: 14 },

  listContent:   { paddingHorizontal: 12, paddingBottom: 24 },
  empty:         { color: '#333333', textAlign: 'center', marginTop: 60, fontSize: 14 },

  card:          { backgroundColor: '#F8F9FA', borderWidth: 1, borderColor: '#333333', borderRadius: 12, padding: 14, marginBottom: 12 },
  cardHeader:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  cardTitle:     { color: '#333333', fontWeight: 'bold', fontSize: 15 },
  estadoBadge:   { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20, borderWidth: 1 },
  estadoText:    { fontSize: 11, fontWeight: 'bold' },

  cardRow:       { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  rowLabel:      { color: '#333333', fontSize: 12 },
  rowValue:      { color: '#333333', fontSize: 12, fontWeight: '500' },
  totalRow:      { borderTopWidth: 1, borderTopColor: '#333333', paddingTop: 10, marginTop: 6 },
  totalLabel:    { color: '#333333', fontWeight: 'bold', fontSize: 14 },
  totalValor:    { color: '#333333', fontWeight: 'bold', fontSize: 16 },

  acciones:      { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12 },
  btnDetalle:    { backgroundColor: '#B7975B', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  btnCompletar:  { backgroundColor: '#B7975B', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  btnCancelar:   { backgroundColor: '#B7975B', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  btnEliminar:   { backgroundColor: '#B7975B', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  btnText:       { color: '#333333', fontSize: 12 },

  bottomNav:     { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#333333', backgroundColor: 'rgba(248,249,250,0.98)' },
  bnav:          { alignItems: 'center', gap: 2 },
  bnavIcon:      { fontSize: 18 },
  bnavLabel:     { fontSize: 9, color: '#333333' },
  bnavActive:    { color: '#333333' },

  modalOverlay:  { flex: 1, backgroundColor: 'rgba(51,51,51,0.35)', justifyContent: 'center', alignItems: 'center' },
  modalBox:      { backgroundColor: '#F8F9FA', borderWidth: 1, borderColor: '#333333', borderRadius: 14, padding: 18, width: '90%' },
  modalTitle:    { color: '#333333', fontSize: 16, fontWeight: 'bold', textAlign: 'center', marginBottom: 14 },
  prodTitle:     { color: '#333333', fontSize: 13, fontWeight: 'bold', marginTop: 12, marginBottom: 6 },
  productoItem:  { backgroundColor: '#F8F9FA', borderRadius: 8, padding: 10, marginBottom: 6 },
  productoNombre:{ color: '#333333', fontSize: 13, fontWeight: '500', marginBottom: 4 },
  productoDetalle:{ flexDirection: 'row', justifyContent: 'space-between' },
  productoInfo:  { color: '#333333', fontSize: 11 },
  btnCerrar:     { backgroundColor: '#B7975B', padding: 11, borderRadius: 8, alignItems: 'center', marginTop: 16 },
  btnCerrarText: { color: '#333333', fontWeight: 'bold', fontSize: 14 },
});
