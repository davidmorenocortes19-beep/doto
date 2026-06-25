import React, { useState, useCallback } from 'react';
import { router, useFocusEffect } from 'expo-router';
import {
  View, Text, TouchableOpacity, FlatList, Modal, TextInput,
  StyleSheet, ImageBackground, SafeAreaView, RefreshControl,
  ActivityIndicator, Alert, ScrollView,
} from 'react-native';
import axios from 'axios';
import { sesion } from '../../../constants/sesion';

const API_PEDIDOS = 'http://192.168.137.9/doto/api/pedidos.php';
const API_DEVOLUCIONES = 'http://192.168.137.9/doto/api/devoluciones.php';

type ProductoPedido = {
  id_producto_fk: number;
  nombre: string;
  precio_unitario: number;
  cantidad: number;
};

type Pedido = {
  id_pedido: number;
  numero_pedido: number;
  fecha_pedido: string;
  estado: string;
  id_venta?: number;
  productos: ProductoPedido[];
  total: number;
};

type ProductoVenta = {
  id_detalle_venta: number;
  nombre: string;
  cantidad: number;
  precio_unitario: number;
};

export default function PedidosCliente() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [cargando, setCargando] = useState(false);
  const [cancelando, setCancelando] = useState(false);

  // Devolución
  const [modalDevolucion, setModalDevolucion] = useState(false);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<Pedido | null>(null);
  const [productosVenta, setProductosVenta] = useState<ProductoVenta[]>([]);
  const [productoElegido, setProductoElegido] = useState<ProductoVenta | null>(null);
  const [cantidadDevolucion, setCantidadDevolucion] = useState('1');
  const [motivoDevolucion, setMotivoDevolucion] = useState('');
  const [enviandoDev, setEnviandoDev] = useState(false);
  const [cargandoProductos, setCargandoProductos] = useState(false);

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [])
  );

  const cargar = async () => {
    if (!sesion.id) return;
    setCargando(true);
    try {
      const res = await axios.get(API_PEDIDOS, {
        params: { id_usuario: sesion.id },
        timeout: 8000,
      });
      const data: Pedido[] = Array.isArray(res.data) ? res.data : [];
      setPedidos(data);
    } catch (e: any) {
      console.log('Error cargando pedidos:', e?.message, e?.response?.data);
      // No vaciamos pedidos aquí: si falla, dejamos lo que ya estaba en pantalla
    } finally {
      setCargando(false);
    }
  };

  const cancelarPedido = async (pedido: Pedido) => {
    setCancelando(true);
    try {
      const res = await axios.put(API_PEDIDOS, {
        id_pedido: pedido.id_pedido,
        cancelar: true,
      }, { timeout: 8000 });
      console.log('Respuesta cancelar:', res.data);
      await cargar();
      Alert.alert('✅', 'Pedido cancelado correctamente');
    } catch (e: any) {
      console.log('Error cancelar:', e?.message, e?.response?.data);
      Alert.alert('Error', e?.message ?? 'No se pudo cancelar el pedido');
    } finally {
      setCancelando(false);
    }
  };

  const abrirDevolucion = async (pedido: Pedido) => {
    if (!pedido.id_venta) {
      Alert.alert('Error', 'No se encontró la venta asociada a este pedido');
      return;
    }
    setPedidoSeleccionado(pedido);
    setProductoElegido(null);
    setCantidadDevolucion('1');
    setMotivoDevolucion('');
    setCargandoProductos(true);
    setModalDevolucion(true);
    try {
      const res = await axios.get(API_DEVOLUCIONES, {
        params: { id_venta: pedido.id_venta, productos: 1 },
        timeout: 8000,
      });
      setProductosVenta(Array.isArray(res.data) ? res.data : []);
    } catch {
      Alert.alert('Error', 'No se pudieron cargar los productos');
      setModalDevolucion(false);
    } finally {
      setCargandoProductos(false);
    }
  };

  const enviarDevolucion = async () => {
    if (!productoElegido) { Alert.alert('⚠', 'Selecciona un producto'); return; }
    const cant = parseInt(cantidadDevolucion);
    if (!cant || cant <= 0 || cant > productoElegido.cantidad) {
      Alert.alert('⚠', `Cantidad inválida. Máximo: ${productoElegido.cantidad}`);
      return;
    }
    if (!motivoDevolucion.trim()) { Alert.alert('⚠', 'Ingresa el motivo de la devolución'); return; }

    setEnviandoDev(true);
    try {
      await axios.post(API_DEVOLUCIONES, {
        id_detalle_venta: productoElegido.id_detalle_venta,
        cantidad: cant,
        motivo: motivoDevolucion.trim(),
      });
      setModalDevolucion(false);
      Alert.alert('✅', 'Devolución registrada correctamente. Pronto te contactaremos.');
    } catch {
      Alert.alert('Error', 'No se pudo registrar la devolución');
    } finally {
      setEnviandoDev(false);
    }
  };

  const formatearFecha = (fecha: string) => {
    const d = new Date(fecha);
    if (isNaN(d.getTime())) return fecha;
    return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const colorEstado = (estado: string) => {
    switch (estado.toLowerCase()) {
      case 'pendiente': return { bg: '#FEF9C3', border: '#CA8A04', text: '#854D0E' };
      case 'enviado': return { bg: '#DBEAFE', border: '#2563EB', text: '#1E3A8A' };
      case 'entregado': return { bg: '#DCFCE7', border: '#16A34A', text: '#166534' };
      case 'cancelado': return { bg: '#FEE2E2', border: '#DC2626', text: '#991B1B' };
      default: return { bg: '#E2E8F0', border: '#64748B', text: '#334155' };
    }
  };

  const renderPedido = ({ item }: { item: Pedido }) => {
    const estadoColor = colorEstado(item.estado);
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardId}>Pedido #{item.numero_pedido}</Text>
          <View style={[styles.estadoBadge, { backgroundColor: estadoColor.bg, borderColor: estadoColor.border }]}>
            <Text style={[styles.estadoText, { color: estadoColor.text }]}>{item.estado}</Text>
          </View>
        </View>

        <Text style={styles.cardFecha}>{formatearFecha(item.fecha_pedido)}</Text>
        <View style={styles.divider} />

        {item.productos.map((p, idx) => (
          <View key={idx} style={styles.productoRow}>
            <Text style={styles.productoNombre} numberOfLines={1}>{p.cantidad} x {p.nombre}</Text>
            <Text style={styles.productoPrecio}>${Number(p.precio_unitario * p.cantidad).toLocaleString('es-CO')}</Text>
          </View>
        ))}

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValor}>${Number(item.total).toLocaleString('es-CO')}</Text>
        </View>

        {/* Botón cancelar — solo si está Pendiente */}
        {item.estado === 'Pendiente' && (
          <TouchableOpacity
            style={[styles.btnAccion, styles.btnCancelar, cancelando && { opacity: 0.6 }]}
            onPress={() => {
              Alert.alert(
                'Cancelar pedido',
                `¿Cancelar el Pedido #${item.numero_pedido}?`,
                [
                  { text: 'No', style: 'cancel' },
                  { text: 'Sí, cancelar', style: 'destructive', onPress: () => cancelarPedido(item) },
                ]
              );
            }}
            disabled={cancelando}
          >
            <Text style={styles.btnCancelarTexto}>✖ Cancelar pedido</Text>
          </TouchableOpacity>
        )}

        {/* Botón devolución — solo si está Entregado */}
        {item.estado === 'Entregado' && (
          <TouchableOpacity
            style={[styles.btnAccion, styles.btnDevolucion]}
            onPress={() => abrirDevolucion(item)}
          >
            <Text style={styles.btnDevolucionTexto}>↩ Solicitar devolución</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <ImageBackground
      source={require('../../../assets/images/camiseta.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay} />
      <SafeAreaView style={styles.safeArea}>

        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.replace('/cliente/panel_cliente')} style={styles.btnVolver}>
            <Text style={styles.btnVolverTexto}>←</Text>
          </TouchableOpacity>
          <View style={styles.logoArea}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoInitials}>DT</Text>
            </View>
            <Text style={styles.brand}>Mis Pedidos</Text>
          </View>
          <TouchableOpacity style={styles.btnRecargar} onPress={cargar}>
            <Text style={styles.btnRecargarTexto}>↻</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={pedidos}
          keyExtractor={item => item.id_pedido.toString()}
          renderItem={renderPedido}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={cargando} onRefresh={cargar} />}
          ListEmptyComponent={
            <Text style={styles.empty}>
              {cargando ? '' : 'Aún no tienes pedidos realizados'}
            </Text>
          }
        />

        <View style={styles.bottomNav}>
          {[
            { label: 'Inicio', icon: '🏠', route: '/cliente/panel_cliente' },
            { label: 'Productos', icon: '📦', route: '/cliente/productos_cliente' },
            { label: 'Pedidos', icon: '📋', active: true },
            { label: 'Perfil', icon: '👤', route: '/cliente/perfil_cliente' },
          ].map(item => (
            <TouchableOpacity
              key={item.label}
              style={styles.bnav}
              onPress={() => item.route && router.push(item.route as any)}
            >
              <Text style={styles.bnavIcon}>{item.icon}</Text>
              <Text style={[styles.bnavLabel, item.active && styles.bnavActive]}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

      </SafeAreaView>

      {/* MODAL DEVOLUCIÓN */}
      <Modal visible={modalDevolucion} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitulo}>↩ Solicitar devolución</Text>
              <TouchableOpacity onPress={() => setModalDevolucion(false)}>
                <Text style={styles.modalCerrar}>✖</Text>
              </TouchableOpacity>
            </View>

            {cargandoProductos ? (
              <ActivityIndicator size="large" color="#1E293B" style={{ marginVertical: 30 }} />
            ) : (
              <ScrollView showsVerticalScrollIndicator={false}>

                <Text style={styles.inputLabel}>Producto a devolver *</Text>
                {productosVenta.map(p => (
                  <TouchableOpacity
                    key={p.id_detalle_venta}
                    style={[
                      styles.productoOpcion,
                      productoElegido?.id_detalle_venta === p.id_detalle_venta && styles.productoOpcionActivo,
                    ]}
                    onPress={() => { setProductoElegido(p); setCantidadDevolucion('1'); }}
                  >
                    <Text style={[
                      styles.productoOpcionTexto,
                      productoElegido?.id_detalle_venta === p.id_detalle_venta && styles.productoOpcionTextoActivo,
                    ]}>
                      {p.nombre}
                    </Text>
                    <Text style={[
                      styles.productoOpcionSub,
                      productoElegido?.id_detalle_venta === p.id_detalle_venta && { color: '#F8FAFC' },
                    ]}>
                      Cantidad comprada: {p.cantidad}
                    </Text>
                  </TouchableOpacity>
                ))}

                <Text style={styles.inputLabel}>Cantidad a devolver *</Text>
                <TextInput
                  style={styles.input}
                  value={cantidadDevolucion}
                  onChangeText={setCantidadDevolucion}
                  keyboardType="numeric"
                  placeholder={`Máx: ${productoElegido?.cantidad ?? 0}`}
                  placeholderTextColor="#94A3B8"
                />

                <Text style={styles.inputLabel}>Motivo de la devolución *</Text>
                <TextInput
                  style={[styles.input, styles.inputTextArea]}
                  value={motivoDevolucion}
                  onChangeText={setMotivoDevolucion}
                  placeholder="Describe el motivo de tu devolución..."
                  placeholderTextColor="#94A3B8"
                  multiline
                  numberOfLines={4}
                />

                <TouchableOpacity
                  style={[styles.btnEnviarDev, enviandoDev && { opacity: 0.6 }]}
                  onPress={enviarDevolucion}
                  disabled={enviandoDev}
                >
                  <Text style={styles.btnEnviarDevTexto}>
                    {enviandoDev ? 'Enviando...' : '↩ Enviar solicitud'}
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
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255,255,255,0.10)' },
  safeArea: { flex: 1 },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 12, backgroundColor: 'rgba(255,255,255,1.0)', borderBottomWidth: 1.5, borderBottomColor: '#1E293B' },
  btnVolver: { backgroundColor: '#1E293B', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 4 },
  btnVolverTexto: { color: '#F8FAFC', fontSize: 20, fontWeight: '600' },
  logoArea: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoCircle: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#1E293B', alignItems: 'center', justifyContent: 'center' },
  logoInitials: { color: '#F8FAFC', fontWeight: 'bold', fontSize: 10 },
  brand: { color: '#0F172A', fontWeight: '700', fontSize: 15 },
  btnRecargar: { backgroundColor: '#F1F5F9', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1.5, borderColor: '#1E293B' },
  btnRecargarTexto: { color: '#0F172A', fontSize: 16, fontWeight: '600' },

  listContent: { padding: 14, paddingBottom: 24 },
  empty: { color: '#0F172A', textAlign: 'center', marginTop: 40, fontSize: 13 },

  card: { backgroundColor: 'rgba(255,255,255,1.0)', borderWidth: 1.5, borderColor: '#1E293B', borderRadius: 12, padding: 14, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  cardId: { color: '#0F172A', fontWeight: '700', fontSize: 14 },
  cardFecha: { color: '#64748B', fontSize: 11, marginBottom: 10 },
  estadoBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1 },
  estadoText: { fontSize: 10, fontWeight: 'bold' },
  divider: { height: 1, backgroundColor: '#E2E8F0', marginBottom: 8 },
  productoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  productoNombre: { color: '#334155', fontSize: 12, flex: 1, marginRight: 8 },
  productoPrecio: { color: '#0F172A', fontSize: 12, fontWeight: '600' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 10, marginTop: 6, borderTopWidth: 1, borderTopColor: '#E2E8F0' },
  totalLabel: { color: '#0F172A', fontWeight: 'bold', fontSize: 13 },
  totalValor: { color: '#0F172A', fontWeight: 'bold', fontSize: 15 },

  btnAccion: { marginTop: 10, padding: 10, borderRadius: 8, alignItems: 'center', borderWidth: 1.5 },
  btnCancelar: { backgroundColor: '#FEF2F2', borderColor: '#DC2626' },
  btnCancelarTexto: { color: '#DC2626', fontWeight: '600', fontSize: 13 },
  btnDevolucion: { backgroundColor: '#EFF6FF', borderColor: '#2563EB' },
  btnDevolucionTexto: { color: '#2563EB', fontWeight: '600', fontSize: 13 },

  bottomNav: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 10, backgroundColor: 'rgba(255,255,255,1.0)', borderTopWidth: 1.5, borderTopColor: '#1E293B' },
  bnav: { alignItems: 'center', gap: 2 },
  bnavIcon: { fontSize: 18 },
  bnavLabel: { fontSize: 9, color: '#64748B' },
  bnavActive: { color: '#0F172A', fontWeight: '700' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.5)', justifyContent: 'flex-end' },
  modalBox: { backgroundColor: '#F8FAFC', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '85%', borderTopWidth: 1.5, borderTopColor: '#1E293B' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitulo: { color: '#0F172A', fontWeight: '700', fontSize: 17 },
  modalCerrar: { color: '#64748B', fontSize: 20, padding: 4 },

  inputLabel: { color: '#0F172A', fontWeight: '600', fontSize: 13, marginBottom: 8, marginTop: 14 },
  input: { backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#1E293B', borderRadius: 8, padding: 12, fontSize: 14, color: '#0F172A', marginBottom: 4 },
  inputTextArea: { height: 100, textAlignVertical: 'top' },

  productoOpcion: { backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#1E293B', borderRadius: 8, padding: 12, marginBottom: 8 },
  productoOpcionActivo: { backgroundColor: '#1E293B' },
  productoOpcionTexto: { color: '#0F172A', fontWeight: '600', fontSize: 13 },
  productoOpcionTextoActivo: { color: '#F8FAFC' },
  productoOpcionSub: { color: '#64748B', fontSize: 11, marginTop: 2 },

  btnEnviarDev: { backgroundColor: '#1E293B', padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 16, marginBottom: 8 },
  btnEnviarDevTexto: { color: '#F8FAFC', fontWeight: '600', fontSize: 15 },
});