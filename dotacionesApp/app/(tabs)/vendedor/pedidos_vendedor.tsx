import React, { useState, useEffect } from 'react';
import { router } from 'expo-router';
import {
  View, Text, TouchableOpacity, FlatList,
  StyleSheet, ImageBackground, SafeAreaView, Alert,
} from 'react-native';
import axios from 'axios';

const API_URL = 'http://172.30.3.242/doto/api/pedidos.php';

type Producto = {
  nombre: string;
  precio: number;
  cantidad: number;
};

type Pedido = {
  id?: number;
  productos: Producto[];
  estado: 'Por pagar' | 'Pagado';
  fecha: string;
};

export default function PedidosCliente() {
  const [pedidos,  setPedidos]  = useState<Pedido[]>([]);
  const [cargando, setCargando] = useState(false);

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    try {
      setCargando(true);
      const res = await axios.get(API_URL, { timeout: 5000 });
      if (res.data.success) setPedidos(res.data.data);
    } catch {
      // sin servidor: lista vacía
    } finally {
      setCargando(false);
    }
  };

  const terminarPago = (index: number) => {
    Alert.alert('Confirmar pago', '¿Deseas completar el pago de este pedido?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Pagar',
        onPress: async () => {
          try {
            const pedido = pedidos[index];
            await axios.put(API_URL, { id: pedido.id, estado: 'Pagado' }, { timeout: 5000 });
            cargar();
          } catch {
            setPedidos(prev =>
              prev.map((p, i) => i === index ? { ...p, estado: 'Pagado' } : p)
            );
          }
        },
      },
    ]);
  };

  const eliminarPedido = (index: number) => {
    Alert.alert('Eliminar pedido', '¿Estás seguro de que deseas eliminar este pedido?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            const pedido = pedidos[index];
            await axios.delete(API_URL, { data: { id: pedido.id }, timeout: 5000 });
            cargar();
          } catch {
            setPedidos(prev => prev.filter((_, i) => i !== index));
          }
        },
      },
    ]);
  };

  const cancelarPedido = (index: number) => {
    Alert.alert('Cancelar pedido', '¿Deseas cancelar este pedido?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Sí, cancelar',
        style: 'destructive',
        onPress: async () => {
          try {
            const pedido = pedidos[index];
            await axios.put(API_URL, { id: pedido.id, estado: 'Cancelado' }, { timeout: 5000 });
            cargar();
          } catch {
            setPedidos(prev =>
              prev.map((p, i) => i === index ? { ...p, estado: 'Por pagar' } : p)
            );
          }
        },
      },
    ]);
  };

  const calcularTotal = (productos: Producto[]) =>
    productos.reduce((acc, p) => acc + p.precio * (p.cantidad || 1), 0);

  const renderItem = ({ item, index }: { item: Pedido; index: number }) => {
    const total = calcularTotal(item.productos);
    const pagado = item.estado === 'Pagado';

    return (
      <View style={styles.card}>
        {/* Header */}
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Pedido #{index + 1}</Text>
          <View style={[styles.estadoBadge, pagado ? styles.estadoPagado : styles.estadoPorPagar]}>
            <Text style={[styles.estadoText, pagado ? styles.estadoPagadoText : styles.estadoPorPagarText]}>
              {item.estado}
            </Text>
          </View>
        </View>

        <Text style={styles.fecha}>Fecha: {item.fecha}</Text>

        {/* Productos */}
        {item.productos.map((p, i) => (
          <View key={i} style={styles.productoItem}>
            <Text style={styles.productoNombre}>{p.nombre}</Text>
            <View style={styles.productoDetalle}>
              <Text style={styles.productoInfo}>Cant: {p.cantidad || 1}</Text>
              <Text style={styles.productoInfo}>${p.precio}.000</Text>
            </View>
          </View>
        ))}

        {/* Total */}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValor}>${total}.000</Text>
        </View>

        {/* Acciones */}
        <View style={styles.acciones}>
          {!pagado && (
            <TouchableOpacity style={styles.btnPagar} onPress={() => terminarPago(index)}>
              <Text style={styles.btnPagarText}>Pagar</Text>
            </TouchableOpacity>
          )}
          {pagado && (
            <TouchableOpacity style={styles.btnEliminar} onPress={() => eliminarPedido(index)}>
              <Text style={styles.btnAccionText}>Eliminar</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.btnFactura} onPress={() => router.push(`/vendedor/factura?id=${index}` as any)}>
            <Text style={styles.btnAccionText}>Factura</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnCancelar} onPress={() => cancelarPedido(index)}>
            <Text style={styles.btnAccionText}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnDevolucion} onPress={() => router.push('/vendedor/devoluciones' as any)}>
            <Text style={styles.btnAccionText}>Devolución</Text>
          </TouchableOpacity>
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
            <Text style={styles.headerTitle}>Mis Pedidos</Text>
          </View>
          <View style={{ width: 32 }} />
        </View>

        {/* Lista */}
        <FlatList
          data={pedidos}
          keyExtractor={(_, i) => i.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.empty}>No tienes pedidos aún 🛒</Text>
          }
        />

        {/* Bottom nav */}
        <View style={styles.bottomNav}>
          {[
            { label: 'Inicio', icon: '🏠', route: '/vendedor/panel_vendedor' },
            { label: 'Pedidos', icon: '📋', active: true },
            { label: 'Devol.', icon: '↩️', route: '/vendedor/devoluciones' },
            { label: 'Perfil', icon: '👤', route: '/vendedor/perfil_vendedor' },
            { label: 'Ventas', icon: '💰', route: '/vendedor/ver_ventas' },
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
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background:        { flex: 1 },
  safeArea:          { flex: 1, backgroundColor: 'rgba(9,8,13,0.82)' },

  header:            { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#B7975B33', backgroundColor: 'rgba(9,8,13,0.97)' },
  backBtn:           { color: '#B7975B', fontSize: 22, paddingHorizontal: 4 },
  logoArea:          { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoCircle:        { width: 30, height: 30, borderRadius: 15, backgroundColor: '#B7975B', alignItems: 'center', justifyContent: 'center' },
  logoInitials:      { color: '#fff', fontWeight: 'bold', fontSize: 10 },
  headerTitle:       { color: '#B7975B', fontWeight: 'bold', fontSize: 15 },

  listContent:       { padding: 14, paddingBottom: 24 },
  empty:             { color: '#666', textAlign: 'center', marginTop: 60, fontSize: 14 },

  card:              { backgroundColor: '#1e1c24', borderWidth: 1, borderColor: '#B7975B33', borderRadius: 12, padding: 14, marginBottom: 14 },
  cardHeader:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  cardTitle:         { color: '#B7975B', fontWeight: 'bold', fontSize: 15 },
  estadoBadge:       { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  estadoPorPagar:    { backgroundColor: '#e67e2222', borderWidth: 1, borderColor: '#e67e2244' },
  estadoPagado:      { backgroundColor: '#2ecc7122', borderWidth: 1, borderColor: '#2ecc7144' },
  estadoText:        { fontSize: 11, fontWeight: 'bold' },
  estadoPorPagarText:{ color: '#e67e22' },
  estadoPagadoText:  { color: '#2ecc71' },

  fecha:             { color: '#888', fontSize: 11, marginBottom: 10 },

  productoItem:      { backgroundColor: '#0e0d12', borderRadius: 8, padding: 10, marginBottom: 6 },
  productoNombre:    { color: '#eee', fontSize: 13, fontWeight: '500', marginBottom: 4 },
  productoDetalle:   { flexDirection: 'row', justifyContent: 'space-between' },
  productoInfo:      { color: '#aaa', fontSize: 11 },

  totalRow:          { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#B7975B33', marginTop: 10, paddingTop: 10 },
  totalLabel:        { color: '#aaa', fontWeight: 'bold', fontSize: 14 },
  totalValor:        { color: '#B7975B', fontWeight: 'bold', fontSize: 16 },

  acciones:          { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12 },
  btnPagar:          { backgroundColor: '#B7975B', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  btnPagarText:      { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  btnEliminar:       { backgroundColor: '#e74c3c', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  btnFactura:        { backgroundColor: '#2980b9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  btnCancelar:       { backgroundColor: '#7f8c8d', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  btnDevolucion:     { backgroundColor: '#8e44ad', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  btnAccionText:     { color: '#fff', fontSize: 12 },

  bottomNav:         { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#B7975B22', backgroundColor: 'rgba(9,8,13,0.98)' },
  bnav:              { alignItems: 'center', gap: 2 },
  bnavIcon:          { fontSize: 18 },
  bnavLabel:         { fontSize: 9, color: '#666' },
  bnavActive:        { color: '#B7975B' },
});
