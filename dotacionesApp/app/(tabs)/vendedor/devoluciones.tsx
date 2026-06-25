import React, { useState, useCallback } from 'react';
import { router, useFocusEffect } from 'expo-router';
import {
  View, Text, TouchableOpacity, FlatList, Modal, ScrollView,
  StyleSheet, ImageBackground, ActivityIndicator, Alert, RefreshControl,
} from 'react-native';
import axios from 'axios';

const API_DEVOLUCIONES = 'http://192.168.137.9/doto/api/devoluciones.php';

type Devolucion = {
  id_devolucion:    number;
  cantidad:         number;
  motivo:           string;
  fecha_devolucion: string;
  estado:           string;
  producto_nombre:  string;
  precio_unitario:  number;
  cliente_nombre:   string;
  cliente_correo:   string;
  cliente_telefono: string;
  id_venta:         number;
};

type FiltroEstado = 'Todos' | 'Pendiente' | 'Aprobada' | 'Rechazada';
const ESTADOS: FiltroEstado[] = ['Todos', 'Pendiente', 'Aprobada', 'Rechazada'];

const colorEstado = (estado: string) => {
  switch (estado.toLowerCase()) {
    case 'pendiente':  return { bg: '#FEF9C3', border: '#CA8A04', text: '#854D0E' };
    case 'aprobada':   return { bg: '#DCFCE7', border: '#16A34A', text: '#166534' };
    case 'rechazada':  return { bg: '#FEE2E2', border: '#DC2626', text: '#991B1B' };
    default:           return { bg: '#E2E8F0', border: '#64748B', text: '#334155' };
  }
};

// Cambia esta constante según el rol: '/vendedor/panel_vendedor' o '/admin/panel_admin'
const RUTA_PANEL = '/vendedor/panel_vendedor';

export default function DevolucionesVendedor() {
  const [devoluciones,  setDevoluciones]  = useState<Devolucion[]>([]);
  const [cargando,      setCargando]      = useState(false);
  const [filtroEstado,  setFiltroEstado]  = useState<FiltroEstado>('Todos');
  const [modalVisible,  setModalVisible]  = useState(false);
  const [devActiva,     setDevActiva]     = useState<Devolucion | null>(null);
  const [actualizando,  setActualizando]  = useState(false);

  useFocusEffect(useCallback(() => { cargar(); }, []));

  const cargar = async () => {
    setCargando(true);
    try {
      const res = await axios.get(API_DEVOLUCIONES, {
        params: { todas: 1 },
        timeout: 5000,
      });
      setDevoluciones(Array.isArray(res.data) ? res.data : []);
    } catch {
      Alert.alert('Error', 'No se pudo cargar las devoluciones');
    } finally {
      setCargando(false);
    }
  };

  const cambiarEstado = async (id_devolucion: number, nuevoEstado: string) => {
    setActualizando(true);
    try {
      await axios.put(API_DEVOLUCIONES, { id_devolucion, estado: nuevoEstado });
      await cargar();
      setDevActiva(prev => prev ? { ...prev, estado: nuevoEstado } : null);
    } catch {
      Alert.alert('Error', 'No se pudo cambiar el estado');
    } finally {
      setActualizando(false);
    }
  };

  const formatearFecha = (fecha: string) => {
    const d = new Date(fecha);
    if (isNaN(d.getTime())) return fecha;
    return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const devolucionesFiltradas = devoluciones.filter(d =>
    filtroEstado === 'Todos' ? true : d.estado === filtroEstado
  );

  const renderDevolucion = ({ item }: { item: Devolucion }) => {
    const ec = colorEstado(item.estado);
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => { setDevActiva(item); setModalVisible(true); }}
        activeOpacity={0.85}
      >
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.cardId}>Dev. #{item.id_devolucion}</Text>
            <Text style={styles.cardCliente}>{item.cliente_nombre}</Text>
          </View>
          <View style={[styles.estadoBadge, { backgroundColor: ec.bg, borderColor: ec.border }]}>
            <Text style={[styles.estadoText, { color: ec.text }]}>{item.estado}</Text>
          </View>
        </View>
        <Text style={styles.cardProducto}>{item.cantidad} x {item.producto_nombre}</Text>
        <Text style={styles.cardFecha}>{formatearFecha(item.fecha_devolucion)}</Text>
        <Text style={styles.verDetalle}>Ver detalle ?</Text>
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

        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.replace(RUTA_PANEL as any)} style={styles.btnVolver}>
            <Text style={styles.btnVolverTexto}>? Volver</Text>
          </TouchableOpacity>
          <Text style={styles.titulo}>? Devoluciones</Text>
          <TouchableOpacity style={styles.btnRecargar} onPress={cargar}>
            <Text style={styles.btnRecargarTexto}>? Recargar</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.accionesBar}>
          <Text style={styles.contadorTexto}>
            {devolucionesFiltradas.length} devolución{devolucionesFiltradas.length !== 1 ? 'es' : ''}
          </Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtrosScroll}>
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

        {cargando && devoluciones.length === 0 ? (
          <ActivityIndicator size="large" color="#1E293B" style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={devolucionesFiltradas}
            keyExtractor={item => item.id_devolucion.toString()}
            renderItem={renderDevolucion}
            contentContainerStyle={styles.lista}
            refreshControl={<RefreshControl refreshing={cargando} onRefresh={cargar} />}
            ListEmptyComponent={<Text style={styles.empty}>No hay devoluciones</Text>}
          />
        )}
      </View>

      {/* MODAL DETALLE */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            {devActiva && (() => {
              const ec = colorEstado(devActiva.estado);
              return (
                <>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitulo}>Devolución #{devActiva.id_devolucion}</Text>
                    <TouchableOpacity onPress={() => setModalVisible(false)}>
                      <Text style={styles.modalCerrar}>?</Text>
                    </TouchableOpacity>
                  </View>

                  <ScrollView showsVerticalScrollIndicator={false}>
                    <View style={styles.seccion}>
                      <Text style={styles.seccionTitulo}>?? Cliente</Text>
                      <Text style={styles.infoTexto}>{devActiva.cliente_nombre}</Text>
                      <Text style={styles.infoTextoSub}>{devActiva.cliente_correo}</Text>
                      <Text style={styles.infoTextoSub}>?? {devActiva.cliente_telefono || 'Sin teléfono'}</Text>
                    </View>

                    <View style={styles.seccion}>
                      <Text style={styles.seccionTitulo}>?? Producto</Text>
                      <Text style={styles.infoTexto}>{devActiva.cantidad} x {devActiva.producto_nombre}</Text>
                      <Text style={styles.infoTextoSub}>
                        Subtotal: ${Number(devActiva.precio_unitario * devActiva.cantidad).toLocaleString('es-CO')}
                      </Text>
                    </View>

                    <View style={styles.seccion}>
                      <Text style={styles.seccionTitulo}>?? Motivo</Text>
                      <Text style={styles.infoTexto}>{devActiva.motivo}</Text>
                      <Text style={styles.infoTextoSub}>Fecha: {formatearFecha(devActiva.fecha_devolucion)}</Text>
                      <View style={[styles.estadoBadge, { backgroundColor: ec.bg, borderColor: ec.border, marginTop: 8, alignSelf: 'flex-start' }]}>
                        <Text style={[styles.estadoText, { color: ec.text }]}>{devActiva.estado}</Text>
                      </View>
                    </View>

                    <View style={styles.seccion}>
                      <Text style={styles.seccionTitulo}>?? Cambiar estado</Text>
                      <View style={styles.estadosBotones}>
                        {(['Pendiente', 'Aprobada', 'Rechazada'] as const).map(est => {
                          const ecc = colorEstado(est);
                          const esActual = devActiva.estado === est;
                          return (
                            <TouchableOpacity
                              key={est}
                              style={[styles.btnEstado, { borderColor: ecc.border }, esActual && { backgroundColor: ecc.bg }, actualizando && { opacity: 0.5 }]}
                              onPress={() => cambiarEstado(devActiva.id_devolucion, est)}
                              disabled={actualizando || esActual}
                            >
                              <Text style={[styles.btnEstadoTexto, { color: ecc.text }]}>
                                {esActual ? '? ' : ''}{est}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </View>
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
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255,255,255,0.10)' },
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingTop: 50, backgroundColor: 'rgba(255,255,255,1.0)', borderBottomWidth: 1.5, borderBottomColor: '#1E293B' },
  titulo: { fontSize: 17, fontWeight: '700', color: '#0F172A' },
  btnVolver: { backgroundColor: '#1E293B', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  btnVolverTexto: { color: '#F8FAFC', fontSize: 12, fontWeight: '600' },
  btnRecargar: { backgroundColor: '#F1F5F9', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1.5, borderColor: '#1E293B' },
  btnRecargarTexto: { color: '#0F172A', fontSize: 12, fontWeight: '600' },
  accionesBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', paddingHorizontal: 14, paddingVertical: 10, backgroundColor: 'rgba(255,255,255,1.0)', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  contadorTexto: { color: '#64748B', fontSize: 12 },
  filtrosScroll: { paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  chip: { backgroundColor: 'rgba(255,255,255,1.0)', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1.5, borderColor: '#1E293B' },
  chipActivo: { backgroundColor: '#1E293B' },
  chipTexto: { color: '#0F172A', fontSize: 12, fontWeight: '500' },
  chipTextoActivo: { color: '#F8FAFC', fontWeight: '600' },
  lista: { padding: 14, paddingBottom: 30 },
  empty: { color: '#0F172A', textAlign: 'center', marginTop: 40, fontSize: 13 },
  card: { backgroundColor: 'rgba(255,255,255,1.0)', borderWidth: 1.5, borderColor: '#1E293B', borderRadius: 12, padding: 14, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  cardId: { color: '#0F172A', fontWeight: '700', fontSize: 14 },
  cardCliente: { color: '#64748B', fontSize: 12, marginTop: 2 },
  cardProducto: { color: '#334155', fontSize: 13, marginBottom: 2 },
  cardFecha: { color: '#94A3B8', fontSize: 11, marginBottom: 6 },
  verDetalle: { color: '#1E293B', fontSize: 12, fontWeight: '600', textAlign: 'right' },
  estadoBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1 },
  estadoText: { fontSize: 10, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.5)', justifyContent: 'flex-end' },
  modalBox: { backgroundColor: '#F8FAFC', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '85%', borderTopWidth: 1.5, borderTopColor: '#1E293B' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitulo: { color: '#0F172A', fontWeight: '700', fontSize: 17 },
  modalCerrar: { color: '#64748B', fontSize: 20, padding: 4 },
  seccion: { backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 10, padding: 12, marginBottom: 12 },
  seccionTitulo: { color: '#0F172A', fontWeight: '700', fontSize: 13, marginBottom: 8 },
  infoTexto: { color: '#0F172A', fontSize: 14, fontWeight: '500' },
  infoTextoSub: { color: '#64748B', fontSize: 12, marginTop: 4 },
  estadosBotones: { flexDirection: 'row', gap: 8 },
  btnEstado: { flex: 1, paddingVertical: 8, borderRadius: 8, borderWidth: 1.5, alignItems: 'center', backgroundColor: '#FFFFFF' },
  btnEstadoTexto: { fontSize: 12, fontWeight: '600' },
});