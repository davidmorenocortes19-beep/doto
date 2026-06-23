import React, { useState, useCallback } from 'react';
import { router, useFocusEffect } from 'expo-router';
import {
  View, Text, TouchableOpacity, FlatList, ScrollView, Modal,
  StyleSheet, ImageBackground, SafeAreaView, Alert, TextInput, RefreshControl,
} from 'react-native';
import axios from 'axios';
import { sesion } from '../../../constants/sesion';

const API_DEVOLUCIONES = 'http://192.168.1.19/doto/api/devoluciones.php';

type ItemVenta = {
  id_detalle_venta: number;
  cantidad:         number;
  producto_nombre:  string;
  producto_precio:  number;
  subtotal:         number;
  id_venta:         number;
  fecha_venta:      string;
  ya_devuelto:      boolean;
};

type Devolucion = {
  id_devolucion:    number;
  cantidad:         number;
  motivo:           string;
  fecha_devolucion: string;
  producto_nombre:  string;
  subtotal_devuelto: number;
  id_venta:         number;
};

type Tab = 'solicitar' | 'historial';

export default function DevolucionesCliente() {
  const [tab,           setTab]           = useState<Tab>('solicitar');
  const [ventas,        setVentas]        = useState<ItemVenta[]>([]);
  const [historial,     setHistorial]     = useState<Devolucion[]>([]);
  const [cargando,      setCargando]      = useState(false);
  const [modalVisible,  setModalVisible]  = useState(false);
  const [itemSeleccionado, setItemSeleccionado] = useState<ItemVenta | null>(null);
  const [motivo,        setMotivo]        = useState('');
  const [enviando,      setEnviando]      = useState(false);

  useFocusEffect(
    useCallback(() => {
      cargarVentas();
      cargarHistorial();
    }, [])
  );

  const cargarVentas = async () => {
    if (!sesion.id) return;
    setCargando(true);
    try {
      const res = await axios.get(API_DEVOLUCIONES, {
        params: { id_usuario: sesion.id },
        timeout: 5000,
      });
      const data: ItemVenta[] = Array.isArray(res.data) ? res.data : [];
      setVentas(data);
    } catch {
      Alert.alert('Error', 'No se pudo cargar tus compras');
    } finally {
      setCargando(false);
    }
  };

  const cargarHistorial = async () => {
    if (!sesion.id) return;
    try {
      const res = await axios.get(API_DEVOLUCIONES, {
        params: { id_usuario: sesion.id, historial: 1 },
        timeout: 5000,
      });
      const data: Devolucion[] = Array.isArray(res.data) ? res.data : [];
      setHistorial(data);
    } catch {
      // silencioso
    }
  };

  const abrirModal = (item: ItemVenta) => {
    setItemSeleccionado(item);
    setMotivo('');
    setModalVisible(true);
  };

  const enviarDevolucion = async () => {
    if (!itemSeleccionado) return;
    if (!motivo.trim()) {
      Alert.alert('⚠ Campo requerido', 'Por favor ingresa el motivo de la devolución');
      return;
    }

    setEnviando(true);
    try {
      await axios.post(API_DEVOLUCIONES, {
        id_detalle_venta: itemSeleccionado.id_detalle_venta,
        cantidad:         itemSeleccionado.cantidad,
        motivo:           motivo.trim(),
      });
      setModalVisible(false);
      Alert.alert('✅ Solicitud enviada', 'Tu devolución fue registrada correctamente');
      await cargarVentas();
      await cargarHistorial();
    } catch (e: any) {
      const msg = e?.response?.data?.error ?? 'No se pudo registrar la devolución';
      Alert.alert('Error', msg);
    } finally {
      setEnviando(false);
    }
  };

  const formatearFecha = (fecha: string) => {
    const d = new Date(fecha);
    if (isNaN(d.getTime())) return fecha;
    return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const renderVenta = ({ item }: { item: ItemVenta }) => (
    <View style={[styles.card, item.ya_devuelto && styles.cardDevuelta]}>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardProducto} numberOfLines={1}>{item.producto_nombre}</Text>
          <Text style={styles.cardSub}>Venta #{item.id_venta} — {formatearFecha(item.fecha_venta)}</Text>
        </View>
        {item.ya_devuelto ? (
          <View style={styles.badgeDevuelta}>
            <Text style={styles.badgeDevueltaTexto}>Devuelto</Text>
          </View>
        ) : (
          <TouchableOpacity style={styles.btnSolicitar} onPress={() => abrirModal(item)}>
            <Text style={styles.btnSolicitarTexto}>Devolver</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.divider} />
      <View style={styles.cardFooter}>
        <Text style={styles.cardCantidad}>Cant: {item.cantidad}</Text>
        <Text style={styles.cardTotal}>${Number(item.subtotal).toLocaleString('es-CO')}</Text>
      </View>
    </View>
  );

  const renderHistorial = ({ item }: { item: Devolucion }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardProducto} numberOfLines={1}>{item.producto_nombre}</Text>
          <Text style={styles.cardSub}>{formatearFecha(item.fecha_devolucion)}</Text>
        </View>
        <View style={styles.badgeHistorial}>
          <Text style={styles.badgeHistorialTexto}>#{item.id_devolucion}</Text>
        </View>
      </View>
      <View style={styles.divider} />
      <Text style={styles.cardMotivo} numberOfLines={2}>💬 {item.motivo}</Text>
      <View style={styles.cardFooter}>
        <Text style={styles.cardCantidad}>Cant: {item.cantidad}</Text>
        <Text style={styles.cardTotal}>
          −${Number(item.subtotal_devuelto).toLocaleString('es-CO')}
        </Text>
      </View>
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

        {/* HEADER */}
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
            <Text style={styles.brand}>Devoluciones</Text>
          </View>
          <View style={{ width: 36 }} />
        </View>

        {/* TABS */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, tab === 'solicitar' && styles.tabActivo]}
            onPress={() => setTab('solicitar')}
          >
            <Text style={[styles.tabTexto, tab === 'solicitar' && styles.tabTextoActivo]}>
              📦 Mis compras
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, tab === 'historial' && styles.tabActivo]}
            onPress={() => setTab('historial')}
          >
            <Text style={[styles.tabTexto, tab === 'historial' && styles.tabTextoActivo]}>
              ↩ Historial
            </Text>
          </TouchableOpacity>
        </View>

        {/* CONTENIDO */}
        {tab === 'solicitar' ? (
          <FlatList
            data={ventas}
            keyExtractor={item => item.id_detalle_venta.toString()}
            renderItem={renderVenta}
            contentContainerStyle={styles.lista}
            refreshControl={<RefreshControl refreshing={cargando} onRefresh={cargarVentas} />}
            ListEmptyComponent={
              <Text style={styles.empty}>
                {cargando ? '' : 'No tienes compras registradas'}
              </Text>
            }
          />
        ) : (
          <FlatList
            data={historial}
            keyExtractor={item => item.id_devolucion.toString()}
            renderItem={renderHistorial}
            contentContainerStyle={styles.lista}
            refreshControl={<RefreshControl refreshing={cargando} onRefresh={cargarHistorial} />}
            ListEmptyComponent={
              <Text style={styles.empty}>No tienes devoluciones registradas</Text>
            }
          />
        )}

        {/* BOTTOM NAV */}
        <View style={styles.bottomNav}>
          {[
            { label: 'Inicio',    icon: '🏠', route: '/cliente/panel_cliente' },
            { label: 'Productos', icon: '📦', route: '/cliente/productos_cliente' },
            { label: 'Pedidos',   icon: '📋', route: '/cliente/pedidos_cliente' },
            { label: 'Perfil',    icon: '👤', route: '/cliente/perfil_cliente' },
          ].map(item => (
            <TouchableOpacity
              key={item.label}
              style={styles.bnav}
              onPress={() => router.push(item.route as any)}
            >
              <Text style={styles.bnavIcon}>{item.icon}</Text>
              <Text style={styles.bnavLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

      </SafeAreaView>

      {/* MODAL SOLICITAR DEVOLUCIÓN */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitulo}>Solicitar devolución</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.modalCerrar}>✖</Text>
              </TouchableOpacity>
            </View>

            {itemSeleccionado && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.seccion}>
                  <Text style={styles.seccionTitulo}>📦 Producto</Text>
                  <Text style={styles.infoTexto}>{itemSeleccionado.producto_nombre}</Text>
                  <Text style={styles.infoTextoSub}>Cantidad: {itemSeleccionado.cantidad}</Text>
                  <Text style={styles.infoTextoSub}>
                    Total: ${Number(itemSeleccionado.subtotal).toLocaleString('es-CO')}
                  </Text>
                </View>

                <View style={styles.seccion}>
                  <Text style={styles.seccionTitulo}>💬 Motivo de devolución</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Describe el motivo (ej: producto defectuoso, talla incorrecta...)"
                    placeholderTextColor="#94A3B8"
                    value={motivo}
                    onChangeText={setMotivo}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </View>

                <TouchableOpacity
                  style={[styles.btnEnviar, enviando && { opacity: 0.6 }]}
                  onPress={enviarDevolucion}
                  disabled={enviando}
                >
                  <Text style={styles.btnEnviarTexto}>
                    {enviando ? 'Enviando...' : '↩ Confirmar devolución'}
                  </Text>
                </TouchableOpacity>
              </ScrollView>
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
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  safeArea: { flex: 1 },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 14, paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,1.0)',
    borderBottomWidth: 1.5, borderBottomColor: '#1E293B',
  },
  btnVolver:      { backgroundColor: '#1E293B', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 4 },
  btnVolverTexto: { color: '#F8FAFC', fontSize: 20, fontWeight: '600' },
  logoArea:       { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoCircle:     { width: 30, height: 30, borderRadius: 15, backgroundColor: '#1E293B', alignItems: 'center', justifyContent: 'center' },
  logoInitials:   { color: '#F8FAFC', fontWeight: 'bold', fontSize: 10 },
  brand:          { color: '#0F172A', fontWeight: '700', fontSize: 15 },

  tabs: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,1.0)',
    borderBottomWidth: 1.5, borderBottomColor: '#1E293B',
  },
  tab:            { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabActivo:      { borderBottomWidth: 2.5, borderBottomColor: '#1E293B' },
  tabTexto:       { color: '#64748B', fontSize: 13, fontWeight: '500' },
  tabTextoActivo: { color: '#0F172A', fontWeight: '700' },

  lista: { padding: 14, paddingBottom: 24 },
  empty: { color: '#0F172A', textAlign: 'center', marginTop: 40, fontSize: 13 },

  card: {
    backgroundColor: 'rgba(255,255,255,1.0)',
    borderWidth: 1.5, borderColor: '#1E293B',
    borderRadius: 12, padding: 14, marginBottom: 12,
  },
  cardDevuelta:  { borderColor: '#94A3B8', opacity: 0.75 },
  cardHeader:    { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 },
  cardProducto:  { color: '#0F172A', fontWeight: '700', fontSize: 14 },
  cardSub:       { color: '#64748B', fontSize: 11, marginTop: 2 },
  cardMotivo:    { color: '#334155', fontSize: 12, marginBottom: 8 },
  divider:       { height: 1, backgroundColor: '#E2E8F0', marginBottom: 8 },
  cardFooter:    { flexDirection: 'row', justifyContent: 'space-between' },
  cardCantidad:  { color: '#64748B', fontSize: 12 },
  cardTotal:     { color: '#DC2626', fontWeight: '700', fontSize: 14 },

  btnSolicitar:      { backgroundColor: '#1E293B', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, marginLeft: 8 },
  btnSolicitarTexto: { color: '#F8FAFC', fontSize: 11, fontWeight: '600' },

  badgeDevuelta:      { backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#94A3B8', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, marginLeft: 8 },
  badgeDevueltaTexto: { color: '#64748B', fontSize: 10, fontWeight: 'bold' },
  badgeHistorial:      { backgroundColor: '#FEE2E2', borderWidth: 1, borderColor: '#DC2626', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, marginLeft: 8 },
  badgeHistorialTexto: { color: '#DC2626', fontSize: 10, fontWeight: 'bold' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.5)', justifyContent: 'flex-end' },
  modalBox: {
    backgroundColor: '#F8FAFC',
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 20, maxHeight: '80%',
    borderTopWidth: 1.5, borderTopColor: '#1E293B',
  },
  modalHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitulo:  { color: '#0F172A', fontWeight: '700', fontSize: 17 },
  modalCerrar:  { color: '#64748B', fontSize: 20, padding: 4 },

  seccion:       { backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 10, padding: 12, marginBottom: 12 },
  seccionTitulo: { color: '#0F172A', fontWeight: '700', fontSize: 13, marginBottom: 8 },
  infoTexto:     { color: '#0F172A', fontSize: 14, fontWeight: '500' },
  infoTextoSub:  { color: '#64748B', fontSize: 12, marginTop: 4 },

  input: {
    backgroundColor: '#F8FAFC', borderWidth: 1.5, borderColor: '#CBD5E1',
    borderRadius: 8, padding: 10, fontSize: 13, color: '#0F172A',
    minHeight: 90,
  },

  btnEnviar:      { backgroundColor: '#1E293B', padding: 14, borderRadius: 10, alignItems: 'center', marginBottom: 8 },
  btnEnviarTexto: { color: '#F8FAFC', fontWeight: '700', fontSize: 14 },

  bottomNav: {
    flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,1.0)',
    borderTopWidth: 1.5, borderTopColor: '#1E293B',
  },
  bnav:      { alignItems: 'center', gap: 2 },
  bnavIcon:  { fontSize: 18 },
  bnavLabel: { fontSize: 9, color: '#64748B' },
});