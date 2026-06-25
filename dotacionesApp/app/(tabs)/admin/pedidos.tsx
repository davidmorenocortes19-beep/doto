import React, { useState, useCallback } from 'react';
import { router, useFocusEffect } from 'expo-router';
import {
  View, Text, TouchableOpacity, FlatList, ScrollView, Modal,
  StyleSheet, ImageBackground, ActivityIndicator, Alert, RefreshControl,
} from 'react-native';
import axios from 'axios';

const API_PEDIDOS = 'http://172.30.4.41/doto/api/pedidos.php';

type ProductoPedido = {
  nombre:          string;
  precio_unitario: number;
  cantidad:        number;
};

type Pedido = {
  id_pedido:         number;
  numero_pedido:     number;
  fecha_pedido:      string;
  estado:            string;
  oculto:            number;
  cliente_nombre:    string;
  cliente_correo:    string;
  cliente_telefono:  string;
  cliente_direccion: string;
  productos:         ProductoPedido[];
  total:             number;
};

type FiltroEstado = 'Todos' | 'Pendiente' | 'Enviado' | 'Entregado';

const ESTADOS: FiltroEstado[] = ['Todos', 'Pendiente', 'Enviado', 'Entregado'];

const colorEstado = (estado: string) => {
  switch (estado.toLowerCase()) {
    case 'pendiente': return { bg: '#FEF9C3', border: '#CA8A04', text: '#854D0E' };
    case 'enviado':   return { bg: '#DBEAFE', border: '#2563EB', text: '#1E3A8A' };
    case 'entregado': return { bg: '#DCFCE7', border: '#16A34A', text: '#166534' };
    default:          return { bg: '#E2E8F0', border: '#64748B', text: '#334155' };
  }
};

export default function PedidosAdmin() {
  const [pedidos,      setPedidos]      = useState<Pedido[]>([]);
  const [cargando,     setCargando]     = useState(false);
  const [verOcultos,   setVerOcultos]   = useState(false);
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>('Todos');
  const [modalVisible, setModalVisible] = useState(false);
  const [pedidoActivo, setPedidoActivo] = useState<Pedido | null>(null);
  const [actualizando, setActualizando] = useState(false);

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [verOcultos])
  );

  const cargar = async () => {
    setCargando(true);
    try {
      const res = await axios.get(API_PEDIDOS, {
        params: { admin: 1, ocultos: verOcultos ? '1' : '0' },
        timeout: 5000,
      });
      const data: Pedido[] = Array.isArray(res.data) ? res.data : [];
      setPedidos(data);
    } catch {
      Alert.alert('Error', 'No se pudo cargar los pedidos');
    } finally {
      setCargando(false);
    }
  };

  const cambiarEstado = async (id_pedido: number, nuevoEstado: string) => {
    setActualizando(true);
    try {
      await axios.put(API_PEDIDOS, { id_pedido, estado: nuevoEstado });
      await cargar();
      setPedidoActivo(prev => prev ? { ...prev, estado: nuevoEstado } : null);
    } catch {
      Alert.alert('Error', 'No se pudo cambiar el estado');
    } finally {
      setActualizando(false);
    }
  };

  const ejecutarToggleOculto = async (pedido: Pedido) => {
    try {
      const nuevoOculto = pedido.oculto === 0 ? 1 : 0;
      console.log('Enviando:', { id_pedido: pedido.id_pedido, oculto: nuevoOculto });
      const res = await axios.put(
        API_PEDIDOS,
        { id_pedido: pedido.id_pedido, oculto: nuevoOculto },
        { timeout: 5000 }
      );
      console.log('Respuesta:', res.data);
      setModalVisible(false);
      await cargar();
      Alert.alert('✅', nuevoOculto === 1 ? 'Pedido ocultado' : 'Pedido restaurado');
    } catch (e: any) {
      console.log('Error toggle:', e?.message, e?.response?.data);
      Alert.alert('Error', e?.message ?? 'No se pudo actualizar el pedido');
    }
  };

  const formatearFecha = (fecha: string) => {
    const d = new Date(fecha);
    if (isNaN(d.getTime())) return fecha;
    return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const pedidosFiltrados = pedidos.filter(p =>
    filtroEstado === 'Todos' ? true : p.estado === filtroEstado
  );

  const abrirDetalle = (pedido: Pedido) => {
    setPedidoActivo(pedido);
    setModalVisible(true);
  };

  const renderPedido = ({ item }: { item: Pedido }) => {
    const ec = colorEstado(item.estado);
    return (
      <TouchableOpacity style={styles.card} onPress={() => abrirDetalle(item)} activeOpacity={0.85}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.cardId}>Pedido #{item.numero_pedido}</Text>
            <Text style={styles.cardCliente}>{item.cliente_nombre}</Text>
          </View>
          <View style={[styles.estadoBadge, { backgroundColor: ec.bg, borderColor: ec.border }]}>
            <Text style={[styles.estadoText, { color: ec.text }]}>{item.estado}</Text>
          </View>
        </View>

        <Text style={styles.cardFecha}>{formatearFecha(item.fecha_pedido)}</Text>
        <View style={styles.divider} />

        {item.productos.slice(0, 2).map((p, idx) => (
          <Text key={idx} style={styles.productoResumen} numberOfLines={1}>
            {p.cantidad} x {p.nombre}
          </Text>
        ))}
        {item.productos.length > 2 && (
          <Text style={styles.masProductos}>+{item.productos.length - 2} más...</Text>
        )}

        <View style={styles.cardFooter}>
          <Text style={styles.totalLabel}>
            Total: <Text style={styles.totalValor}>${Number(item.total).toLocaleString('es-CO')}</Text>
          </Text>
          <Text style={styles.verDetalle}>Ver detalle →</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ImageBackground
      source={require('../../../assets/images/camiseta.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay} />
      <View style={styles.container}>

        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.replace('/admin/panel_admin')}
            style={styles.btnVolver}
          >
            <Text style={styles.btnVolverTexto}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.titulo}>
            {verOcultos ? '📦 Pedidos Ocultos' : '📋 Pedidos'}
          </Text>
          <TouchableOpacity style={styles.btnRecargar} onPress={cargar}>
            <Text style={styles.btnRecargarTexto}>↻ Recargar</Text>
          </TouchableOpacity>
        </View>

        {/* BARRA DE ACCIONES */}
        <View style={styles.accionesBar}>
          <TouchableOpacity
            style={[styles.btnOcultos, verOcultos && styles.btnOcultosActivo]}
            onPress={() => { setVerOcultos(!verOcultos); setPedidos([]); }}
          >
            <Text style={[styles.btnOcultosTexto, verOcultos && styles.btnOcultosTextoActivo]}>
              {verOcultos ? '👁 Ver activos' : '🗄 Ver ocultos'}
            </Text>
          </TouchableOpacity>
          <Text style={styles.contadorTexto}>
            {pedidosFiltrados.length} pedido{pedidosFiltrados.length !== 1 ? 's' : ''}
          </Text>
        </View>

        {/* FILTROS ESTADO */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtrosScroll}
        >
          {ESTADOS.map(estado => (
            <TouchableOpacity
              key={estado}
              style={[styles.chip, filtroEstado === estado && styles.chipActivo]}
              onPress={() => setFiltroEstado(estado)}
            >
              <Text style={[styles.chipTexto, filtroEstado === estado && styles.chipTextoActivo]}>
                {estado}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* LISTA */}
        {cargando && pedidos.length === 0 ? (
          <ActivityIndicator size="large" color="#1E293B" style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={pedidosFiltrados}
            keyExtractor={item => item.id_pedido.toString()}
            renderItem={renderPedido}
            contentContainerStyle={styles.lista}
            refreshControl={<RefreshControl refreshing={cargando} onRefresh={cargar} />}
            ListEmptyComponent={
              <Text style={styles.empty}>
                {verOcultos ? 'No hay pedidos ocultos' : 'No hay pedidos'}
              </Text>
            }
          />
        )}

      </View>

      {/* MODAL DETALLE */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            {pedidoActivo && (() => {
              const ec = colorEstado(pedidoActivo.estado);
              return (
                <>
                  {/* Modal header */}
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitulo}>Pedido #{pedidoActivo.numero_pedido}</Text>
                    <TouchableOpacity onPress={() => setModalVisible(false)}>
                      <Text style={styles.modalCerrar}>✖</Text>
                    </TouchableOpacity>
                  </View>

                  <ScrollView showsVerticalScrollIndicator={false}>

                    {/* Info cliente */}
                    <View style={styles.seccion}>
                      <Text style={styles.seccionTitulo}>👤 Cliente</Text>
                      <Text style={styles.infoTexto}>{pedidoActivo.cliente_nombre}</Text>
                      <Text style={styles.infoTextoSub}>{pedidoActivo.cliente_correo}</Text>
                      <Text style={styles.infoTextoSub}>
                        📞 {pedidoActivo.cliente_telefono || 'Sin teléfono'}
                      </Text>
                      <Text style={styles.infoTextoSub}>
                        📍 {pedidoActivo.cliente_direccion || 'Sin dirección registrada'}
                      </Text>
                    </View>

                    {/* Fecha y estado */}
                    <View style={styles.seccion}>
                      <Text style={styles.seccionTitulo}>📅 Fecha</Text>
                      <Text style={styles.infoTexto}>{formatearFecha(pedidoActivo.fecha_pedido)}</Text>
                      <View style={[
                        styles.estadoBadge,
                        { backgroundColor: ec.bg, borderColor: ec.border, marginTop: 8, alignSelf: 'flex-start' }
                      ]}>
                        <Text style={[styles.estadoText, { color: ec.text }]}>{pedidoActivo.estado}</Text>
                      </View>
                    </View>

                    {/* Productos */}
                    <View style={styles.seccion}>
                      <Text style={styles.seccionTitulo}>🛍 Productos</Text>
                      {pedidoActivo.productos.map((p, idx) => (
                        <View key={idx} style={styles.productoRow}>
                          <Text style={styles.productoNombre} numberOfLines={2}>
                            {p.cantidad} x {p.nombre}
                          </Text>
                          <Text style={styles.productoPrecio}>
                            ${Number(p.precio_unitario * p.cantidad).toLocaleString('es-CO')}
                          </Text>
                        </View>
                      ))}
                      <View style={styles.totalRow}>
                        <Text style={styles.totalLabelModal}>Total</Text>
                        <Text style={styles.totalValorModal}>
                          ${Number(pedidoActivo.total).toLocaleString('es-CO')}
                        </Text>
                      </View>
                    </View>

                    {/* Cambiar estado */}
                    <View style={styles.seccion}>
                      <Text style={styles.seccionTitulo}>🔄 Cambiar estado</Text>
                      <View style={styles.estadosBotones}>
                        {(['Pendiente', 'Enviado', 'Entregado'] as const).map(est => {
                          const ecc = colorEstado(est);
                          const esActual = pedidoActivo.estado === est;
                          return (
                            <TouchableOpacity
                              key={est}
                              style={[
                                styles.btnEstado,
                                { borderColor: ecc.border },
                                esActual && { backgroundColor: ecc.bg },
                                actualizando && { opacity: 0.5 },
                              ]}
                              onPress={() => cambiarEstado(pedidoActivo.id_pedido, est)}
                              disabled={actualizando || esActual}
                            >
                              <Text style={[styles.btnEstadoTexto, { color: ecc.text }]}>
                                {esActual ? '✓ ' : ''}{est}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </View>

                    {/* Ocultar / restaurar — sin Alert intermedio para evitar problemas */}
                    <TouchableOpacity
                      style={[
                        styles.btnOcultarPedido,
                        pedidoActivo.oculto === 1 && styles.btnRestaurar,
                      ]}
                      onPress={() => ejecutarToggleOculto(pedidoActivo)}
                    >
                      <Text style={[
                        styles.btnOcultarPedidoTexto,
                        pedidoActivo.oculto === 1 && { color: '#16A34A' },
                      ]}>
                        {pedidoActivo.oculto === 1 ? '👁 Restaurar pedido' : '🗄 Ocultar pedido'}
                      </Text>
                    </TouchableOpacity>

                  </ScrollView>
                </>
              );
            })()}
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
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
  },
  container: { flex: 1 },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16, paddingTop: 50,
    backgroundColor: 'rgba(255, 255, 255, 1.0)',
    borderBottomWidth: 1.5, borderBottomColor: '#1E293B',
  },
  titulo:           { fontSize: 17, fontWeight: '700', color: '#0F172A' },
  btnVolver:        { backgroundColor: '#1E293B', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  btnVolverTexto:   { color: '#F8FAFC', fontSize: 12, fontWeight: '600' },
  btnRecargar:      { backgroundColor: '#F1F5F9', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1.5, borderColor: '#1E293B' },
  btnRecargarTexto: { color: '#0F172A', fontSize: 12, fontWeight: '600' },

  accionesBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 14, paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,1.0)',
    borderBottomWidth: 1, borderBottomColor: '#E2E8F0',
  },
  btnOcultos:           { borderWidth: 1.5, borderColor: '#1E293B', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  btnOcultosActivo:     { backgroundColor: '#1E293B' },
  btnOcultosTexto:      { color: '#0F172A', fontSize: 12, fontWeight: '600' },
  btnOcultosTextoActivo:{ color: '#F8FAFC' },
  contadorTexto:        { color: '#64748B', fontSize: 12 },

  filtrosScroll:  { paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  chip:           { backgroundColor: 'rgba(255,255,255,1.0)', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1.5, borderColor: '#1E293B' },
  chipActivo:     { backgroundColor: '#1E293B' },
  chipTexto:      { color: '#0F172A', fontSize: 12, fontWeight: '500' },
  chipTextoActivo:{ color: '#F8FAFC', fontWeight: '600' },

  lista: { padding: 14, paddingBottom: 30 },
  empty: { color: '#0F172A', textAlign: 'center', marginTop: 40, fontSize: 13 },

  card: {
    backgroundColor: 'rgba(255,255,255,1.0)',
    borderWidth: 1.5, borderColor: '#1E293B',
    borderRadius: 12, padding: 14, marginBottom: 12,
  },
  cardHeader:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 2 },
  cardId:          { color: '#0F172A', fontWeight: '700', fontSize: 14 },
  cardCliente:     { color: '#64748B', fontSize: 12, marginTop: 2 },
  cardFecha:       { color: '#94A3B8', fontSize: 11, marginBottom: 8 },
  divider:         { height: 1, backgroundColor: '#E2E8F0', marginBottom: 8 },
  productoResumen: { color: '#334155', fontSize: 12, marginBottom: 2 },
  masProductos:    { color: '#94A3B8', fontSize: 11, marginBottom: 4 },
  cardFooter:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  totalLabel:      { color: '#64748B', fontSize: 12 },
  totalValor:      { color: '#0F172A', fontWeight: '700', fontSize: 14 },
  verDetalle:      { color: '#1E293B', fontSize: 12, fontWeight: '600' },
  estadoBadge:     { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1 },
  estadoText:      { fontSize: 10, fontWeight: 'bold' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.5)', justifyContent: 'flex-end' },
  modalBox: {
    backgroundColor: '#F8FAFC',
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 20, maxHeight: '85%',
    borderTopWidth: 1.5, borderTopColor: '#1E293B',
  },
  modalHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitulo:  { color: '#0F172A', fontWeight: '700', fontSize: 17 },
  modalCerrar:  { color: '#64748B', fontSize: 20, padding: 4 },

  seccion:       { backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 10, padding: 12, marginBottom: 12 },
  seccionTitulo: { color: '#0F172A', fontWeight: '700', fontSize: 13, marginBottom: 8 },
  infoTexto:     { color: '#0F172A', fontSize: 14, fontWeight: '500' },
  infoTextoSub:  { color: '#64748B', fontSize: 12, marginTop: 4 },

  productoRow:     { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  productoNombre:  { color: '#334155', fontSize: 12, flex: 1, marginRight: 8 },
  productoPrecio:  { color: '#0F172A', fontSize: 12, fontWeight: '600' },
  totalRow:        { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 10, marginTop: 6, borderTopWidth: 1, borderTopColor: '#E2E8F0' },
  totalLabelModal: { color: '#0F172A', fontWeight: 'bold', fontSize: 13 },
  totalValorModal: { color: '#0F172A', fontWeight: 'bold', fontSize: 15 },

  estadosBotones: { flexDirection: 'row', gap: 8 },
  btnEstado:      { flex: 1, paddingVertical: 8, borderRadius: 8, borderWidth: 1.5, alignItems: 'center', backgroundColor: '#FFFFFF' },
  btnEstadoTexto: { fontSize: 12, fontWeight: '600' },

  btnOcultarPedido:      { backgroundColor: '#FEF2F2', borderWidth: 1.5, borderColor: '#DC2626', borderRadius: 10, padding: 13, alignItems: 'center', marginTop: 4, marginBottom: 8 },
  btnRestaurar:          { backgroundColor: '#F0FDF4', borderColor: '#16A34A' },
  btnOcultarPedidoTexto: { color: '#DC2626', fontWeight: '600', fontSize: 14 },
});