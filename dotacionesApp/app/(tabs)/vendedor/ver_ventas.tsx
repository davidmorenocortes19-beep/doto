import React, { useState, useCallback } from 'react';
import { router, useFocusEffect } from 'expo-router';
import {
  View, Text, TouchableOpacity, FlatList, ScrollView, Modal,
  StyleSheet, ImageBackground, ActivityIndicator, Alert, RefreshControl,
} from 'react-native';
import axios from 'axios';

const API_VENTAS = 'http://172.30.4.41/doto/api/ventas.php';

type ProductoVenta = {
  id_detalle_venta: number;
  nombre:           string;
  cantidad:         number;
  precio_unitario:  number;
};

type Venta = {
  id_venta:         number;
  fecha_venta:      string;
  total_pagado:     number;
  cliente_nombre:   string;
  cliente_correo:   string;
  cliente_telefono: string;
  productos:        ProductoVenta[];
};

type Estadisticas = {
  total_semana:  number;
  total_mes:     number;
  total_general: number;
  por_mes:       { mes: string; cantidad: number; total: number }[];
};

export default function VerVentas() {
  const [ventas,        setVentas]        = useState<Venta[]>([]);
  const [estadisticas,  setEstadisticas]  = useState<Estadisticas | null>(null);
  const [cargando,      setCargando]      = useState(false);
  const [modalVisible,  setModalVisible]  = useState(false);
  const [ventaActiva,   setVentaActiva]   = useState<Venta | null>(null);

  useFocusEffect(useCallback(() => { cargar(); }, []));

  const cargar = async () => {
    setCargando(true);
    try {
      const [resVentas, resStats] = await Promise.all([
        axios.get(API_VENTAS, { timeout: 5000 }),
        axios.get(API_VENTAS, { params: { estadisticas: 1 }, timeout: 5000 }),
      ]);
      setVentas(Array.isArray(resVentas.data) ? resVentas.data : []);
      setEstadisticas(resStats.data);
    } catch {
      Alert.alert('Error', 'No se pudo cargar las ventas');
    } finally {
      setCargando(false);
    }
  };

  const formatearFecha = (fecha: string) => {
    const d = new Date(fecha);
    if (isNaN(d.getTime())) return fecha;
    return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatearMes = (mes: string) => {
    const [anio, m] = mes.split('-');
    const nombres = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    return `${nombres[parseInt(m) - 1]} ${anio}`;
  };

  const renderVenta = ({ item }: { item: Venta }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => { setVentaActiva(item); setModalVisible(true); }}
      activeOpacity={0.85}
    >
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.cardId}>Venta #{item.id_venta}</Text>
          <Text style={styles.cardCliente}>{item.cliente_nombre}</Text>
        </View>
        <Text style={styles.cardTotal}>${Number(item.total_pagado).toLocaleString('es-CO')}</Text>
      </View>
      <Text style={styles.cardFecha}>{formatearFecha(item.fecha_venta)}</Text>
      <View style={styles.divider} />
      {item.productos.slice(0, 2).map((p, idx) => (
        <Text key={idx} style={styles.productoResumen} numberOfLines={1}>
          {p.cantidad} x {p.nombre}
        </Text>
      ))}
      {item.productos.length > 2 && (
        <Text style={styles.masProductos}>+{item.productos.length - 2} más...</Text>
      )}
      <Text style={styles.verDetalle}>Ver detalle ?</Text>
    </TouchableOpacity>
  );

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
          <TouchableOpacity onPress={() => router.replace('/vendedor/panel_vendedor')} style={styles.btnVolver}>
            <Text style={styles.btnVolverTexto}>? Volver</Text>
          </TouchableOpacity>
          <Text style={styles.titulo}>?? Ventas</Text>
          <TouchableOpacity style={styles.btnRecargar} onPress={cargar}>
            <Text style={styles.btnRecargarTexto}>? Recargar</Text>
          </TouchableOpacity>
        </View>

        {cargando && !estadisticas ? (
          <ActivityIndicator size="large" color="#1E293B" style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={ventas}
            keyExtractor={item => item.id_venta.toString()}
            renderItem={renderVenta}
            contentContainerStyle={styles.lista}
            refreshControl={<RefreshControl refreshing={cargando} onRefresh={cargar} />}
            ListHeaderComponent={estadisticas ? (
              <View>
                {/* Estadísticas */}
                <View style={styles.statsGrid}>
                  <View style={styles.statCard}>
                    <Text style={styles.statLabel}>Esta semana</Text>
                    <Text style={styles.statValor}>${Number(estadisticas.total_semana).toLocaleString('es-CO')}</Text>
                  </View>
                  <View style={styles.statCard}>
                    <Text style={styles.statLabel}>Este mes</Text>
                    <Text style={styles.statValor}>${Number(estadisticas.total_mes).toLocaleString('es-CO')}</Text>
                  </View>
                  <View style={[styles.statCard, styles.statCardFull]}>
                    <Text style={styles.statLabel}>Total general</Text>
                    <Text style={[styles.statValor, styles.statValorGrande]}>${Number(estadisticas.total_general).toLocaleString('es-CO')}</Text>
                  </View>
                </View>

                {/* Por mes */}
                {estadisticas.por_mes.length > 0 && (
                  <View style={styles.seccionMes}>
                    <Text style={styles.seccionMesTitulo}>Últimos 6 meses</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      {estadisticas.por_mes.map((m, idx) => (
                        <View key={idx} style={styles.mesBarra}>
                          <Text style={styles.mesTotal}>${Number(m.total).toLocaleString('es-CO')}</Text>
                          <View style={[styles.mesBarraFill, {
                            height: Math.max(20, (Number(m.total) / Math.max(...estadisticas.por_mes.map(x => Number(x.total)))) * 80),
                          }]} />
                          <Text style={styles.mesNombre}>{formatearMes(m.mes)}</Text>
                          <Text style={styles.mesCantidad}>{m.cantidad} venta{Number(m.cantidad) !== 1 ? 's' : ''}</Text>
                        </View>
                      ))}
                    </ScrollView>
                  </View>
                )}

                <Text style={styles.listaTitle}>Historial de ventas</Text>
              </View>
            ) : null}
            ListEmptyComponent={<Text style={styles.empty}>No hay ventas registradas</Text>}
          />
        )}
      </View>

      {/* MODAL DETALLE VENTA */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            {ventaActiva && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitulo}>Venta #{ventaActiva.id_venta}</Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Text style={styles.modalCerrar}>?</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                  <View style={styles.seccion}>
                    <Text style={styles.seccionTitulo}>?? Cliente</Text>
                    <Text style={styles.infoTexto}>{ventaActiva.cliente_nombre}</Text>
                    <Text style={styles.infoTextoSub}>{ventaActiva.cliente_correo}</Text>
                    <Text style={styles.infoTextoSub}>?? {ventaActiva.cliente_telefono || 'Sin teléfono'}</Text>
                  </View>

                  <View style={styles.seccion}>
                    <Text style={styles.seccionTitulo}>?? Fecha</Text>
                    <Text style={styles.infoTexto}>{formatearFecha(ventaActiva.fecha_venta)}</Text>
                  </View>

                  <View style={styles.seccion}>
                    <Text style={styles.seccionTitulo}>?? Productos</Text>
                    {ventaActiva.productos.map((p, idx) => (
                      <View key={idx} style={styles.productoRow}>
                        <Text style={styles.productoNombre} numberOfLines={2}>{p.cantidad} x {p.nombre}</Text>
                        <Text style={styles.productoPrecio}>${Number(p.precio_unitario * p.cantidad).toLocaleString('es-CO')}</Text>
                      </View>
                    ))}
                    <View style={styles.totalRow}>
                      <Text style={styles.totalLabelModal}>Total pagado</Text>
                      <Text style={styles.totalValorModal}>${Number(ventaActiva.total_pagado).toLocaleString('es-CO')}</Text>
                    </View>
                  </View>
                </ScrollView>
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
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255,255,255,0.10)' },
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingTop: 50, backgroundColor: 'rgba(255,255,255,1.0)', borderBottomWidth: 1.5, borderBottomColor: '#1E293B' },
  titulo: { fontSize: 17, fontWeight: '700', color: '#0F172A' },
  btnVolver: { backgroundColor: '#1E293B', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  btnVolverTexto: { color: '#F8FAFC', fontSize: 12, fontWeight: '600' },
  btnRecargar: { backgroundColor: '#F1F5F9', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1.5, borderColor: '#1E293B' },
  btnRecargarTexto: { color: '#0F172A', fontSize: 12, fontWeight: '600' },
  lista: { padding: 14, paddingBottom: 30 },
  listaTitle: { color: '#0F172A', fontWeight: '700', fontSize: 15, marginBottom: 12, marginTop: 4 },
  empty: { color: '#0F172A', textAlign: 'center', marginTop: 20, fontSize: 13 },

  // Stats
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 14 },
  statCard: { flex: 1, minWidth: '45%', backgroundColor: 'rgba(255,255,255,1.0)', borderWidth: 1.5, borderColor: '#1E293B', borderRadius: 12, padding: 14 },
  statCardFull: { width: '100%', flex: 0 },
  statLabel: { color: '#64748B', fontSize: 11, marginBottom: 4 },
  statValor: { color: '#0F172A', fontWeight: '700', fontSize: 16 },
  statValorGrande: { fontSize: 22 },

  // Barras por mes
  seccionMes: { backgroundColor: 'rgba(255,255,255,1.0)', borderWidth: 1.5, borderColor: '#1E293B', borderRadius: 12, padding: 14, marginBottom: 14 },
  seccionMesTitulo: { color: '#0F172A', fontWeight: '700', fontSize: 13, marginBottom: 12 },
  mesBarra: { alignItems: 'center', marginRight: 16, width: 64 },
  mesTotal: { color: '#0F172A', fontSize: 9, fontWeight: '600', marginBottom: 4, textAlign: 'center' },
  mesBarraFill: { width: 32, backgroundColor: '#1E293B', borderRadius: 4, marginBottom: 6 },
  mesNombre: { color: '#64748B', fontSize: 10, textAlign: 'center' },
  mesCantidad: { color: '#94A3B8', fontSize: 9, textAlign: 'center', marginTop: 2 },

  // Cards
  card: { backgroundColor: 'rgba(255,255,255,1.0)', borderWidth: 1.5, borderColor: '#1E293B', borderRadius: 12, padding: 14, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 2 },
  cardId: { color: '#0F172A', fontWeight: '700', fontSize: 14 },
  cardCliente: { color: '#64748B', fontSize: 12, marginTop: 2 },
  cardTotal: { color: '#0F172A', fontWeight: '700', fontSize: 15 },
  cardFecha: { color: '#94A3B8', fontSize: 11, marginBottom: 8 },
  divider: { height: 1, backgroundColor: '#E2E8F0', marginBottom: 8 },
  productoResumen: { color: '#334155', fontSize: 12, marginBottom: 2 },
  masProductos: { color: '#94A3B8', fontSize: 11, marginBottom: 4 },
  verDetalle: { color: '#1E293B', fontSize: 12, fontWeight: '600', marginTop: 6, textAlign: 'right' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.5)', justifyContent: 'flex-end' },
  modalBox: { backgroundColor: '#F8FAFC', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '80%', borderTopWidth: 1.5, borderTopColor: '#1E293B' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitulo: { color: '#0F172A', fontWeight: '700', fontSize: 17 },
  modalCerrar: { color: '#64748B', fontSize: 20, padding: 4 },
  seccion: { backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 10, padding: 12, marginBottom: 12 },
  seccionTitulo: { color: '#0F172A', fontWeight: '700', fontSize: 13, marginBottom: 8 },
  infoTexto: { color: '#0F172A', fontSize: 14, fontWeight: '500' },
  infoTextoSub: { color: '#64748B', fontSize: 12, marginTop: 4 },
  productoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  productoNombre: { color: '#334155', fontSize: 12, flex: 1, marginRight: 8 },
  productoPrecio: { color: '#0F172A', fontSize: 12, fontWeight: '600' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 10, marginTop: 6, borderTopWidth: 1, borderTopColor: '#E2E8F0' },
  totalLabelModal: { color: '#0F172A', fontWeight: 'bold', fontSize: 13 },
  totalValorModal: { color: '#0F172A', fontWeight: 'bold', fontSize: 15 },
});