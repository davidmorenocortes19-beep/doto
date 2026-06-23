import React, { useState, useCallback } from 'react';
import { router, useFocusEffect } from 'expo-router';
import {
  View, Text, TouchableOpacity, FlatList, ScrollView, Modal,
  StyleSheet, ImageBackground, ActivityIndicator, Alert, RefreshControl,
} from 'react-native';
import axios from 'axios';

const API_DEVOLUCIONES = 'http://192.168.1.19/doto/api/devoluciones.php';

type Devolucion = {
  id_devolucion:     number;
  cantidad:          number;
  motivo:            string;
  fecha_devolucion:  string;
  producto_nombre:   string;
  producto_precio:   number;
  subtotal_devuelto: number;
  cliente_nombre:    string;
  cliente_correo:    string;
  cliente_telefono:  string;
  id_venta:          number;
  fecha_venta:       string;
  id_detalle_venta:  number;
};

export default function DevolucionesAdmin() {
  const [devoluciones,  setDevoluciones]  = useState<Devolucion[]>([]);
  const [cargando,      setCargando]      = useState(false);
  const [modalVisible,  setModalVisible]  = useState(false);
  const [itemActivo,    setItemActivo]    = useState<Devolucion | null>(null);
  const [eliminando,    setEliminando]    = useState(false);

  useFocusEffect(
    useCallback(() => { cargar(); }, [])
  );

  const cargar = async () => {
    setCargando(true);
    try {
      const res = await axios.get(API_DEVOLUCIONES, {
        params: { admin: 1 },
        timeout: 5000,
      });
      const data: Devolucion[] = Array.isArray(res.data) ? res.data : [];
      setDevoluciones(data);
    } catch {
      Alert.alert('Error', 'No se pudo cargar las devoluciones');
    } finally {
      setCargando(false);
    }
  };

  const eliminar = async (id: number) => {
    Alert.alert(
      'Eliminar devolución',
      '¿Seguro que deseas eliminar este registro?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar', style: 'destructive',
          onPress: async () => {
            setEliminando(true);
            try {
              await axios.delete(API_DEVOLUCIONES, { params: { id_devolucion: id } });
              setModalVisible(false);
              await cargar();
              Alert.alert('✅', 'Devolución eliminada');
            } catch {
              Alert.alert('Error', 'No se pudo eliminar');
            } finally {
              setEliminando(false);
            }
          },
        },
      ]
    );
  };

  const formatearFecha = (fecha: string) => {
    const d = new Date(fecha);
    if (isNaN(d.getTime())) return fecha;
    return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const abrirDetalle = (item: Devolucion) => {
    setItemActivo(item);
    setModalVisible(true);
  };

  const renderItem = ({ item }: { item: Devolucion }) => (
    <TouchableOpacity style={styles.card} onPress={() => abrirDetalle(item)} activeOpacity={0.85}>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardProducto} numberOfLines={1}>{item.producto_nombre}</Text>
          <Text style={styles.cardCliente}>{item.cliente_nombre}</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeTexto}>#{item.id_devolucion}</Text>
        </View>
      </View>

      <Text style={styles.cardFecha}>{formatearFecha(item.fecha_devolucion)}</Text>
      <View style={styles.divider} />

      <Text style={styles.cardMotivo} numberOfLines={2}>
        💬 {item.motivo}
      </Text>

      <View style={styles.cardFooter}>
        <Text style={styles.cardCantidad}>Cant: {item.cantidad}</Text>
        <Text style={styles.cardTotal}>
          −${Number(item.subtotal_devuelto).toLocaleString('es-CO')}
        </Text>
      </View>
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
          <TouchableOpacity
            onPress={() => router.replace('/admin/panel_admin')}
            style={styles.btnVolver}
          >
            <Text style={styles.btnVolverTexto}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.titulo}>↩ Devoluciones</Text>
          <TouchableOpacity style={styles.btnRecargar} onPress={cargar}>
            <Text style={styles.btnRecargarTexto}>↻ Recargar</Text>
          </TouchableOpacity>
        </View>

        {/* CONTADOR */}
        <View style={styles.infoBar}>
          <Text style={styles.infoTexto}>
            {devoluciones.length} devolución{devoluciones.length !== 1 ? 'es' : ''} registrada{devoluciones.length !== 1 ? 's' : ''}
          </Text>
          <Text style={styles.infoTotal}>
            Total devuelto: ${devoluciones
              .reduce((acc, d) => acc + d.subtotal_devuelto, 0)
              .toLocaleString('es-CO')}
          </Text>
        </View>

        {/* LISTA */}
        {cargando && devoluciones.length === 0 ? (
          <ActivityIndicator size="large" color="#1E293B" style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={devoluciones}
            keyExtractor={item => item.id_devolucion.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.lista}
            refreshControl={<RefreshControl refreshing={cargando} onRefresh={cargar} />}
            ListEmptyComponent={
              <Text style={styles.empty}>No hay devoluciones registradas</Text>
            }
          />
        )}
      </View>

      {/* MODAL DETALLE */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            {itemActivo && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitulo}>Devolución #{itemActivo.id_devolucion}</Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Text style={styles.modalCerrar}>✖</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>

                  {/* Cliente */}
                  <View style={styles.seccion}>
                    <Text style={styles.seccionTitulo}>👤 Cliente</Text>
                    <Text style={styles.infoTexto}>{itemActivo.cliente_nombre}</Text>
                    <Text style={styles.infoTextoSub}>{itemActivo.cliente_correo}</Text>
                    <Text style={styles.infoTextoSub}>
                      📞 {itemActivo.cliente_telefono || 'Sin teléfono'}
                    </Text>
                  </View>

                  {/* Producto */}
                  <View style={styles.seccion}>
                    <Text style={styles.seccionTitulo}>📦 Producto devuelto</Text>
                    <Text style={styles.infoTexto}>{itemActivo.producto_nombre}</Text>
                    <Text style={styles.infoTextoSub}>
                      Cantidad devuelta: {itemActivo.cantidad}
                    </Text>
                    <Text style={styles.infoTextoSub}>
                      Precio unitario: ${Number(itemActivo.producto_precio).toLocaleString('es-CO')}
                    </Text>
                    <Text style={[styles.infoTexto, { marginTop: 6, color: '#DC2626' }]}>
                      Total devuelto: −${Number(itemActivo.subtotal_devuelto).toLocaleString('es-CO')}
                    </Text>
                  </View>

                  {/* Venta original */}
                  <View style={styles.seccion}>
                    <Text style={styles.seccionTitulo}>🧾 Venta original</Text>
                    <Text style={styles.infoTextoSub}>
                      Venta #{itemActivo.id_venta} — {formatearFecha(itemActivo.fecha_venta)}
                    </Text>
                  </View>

                  {/* Motivo */}
                  <View style={styles.seccion}>
                    <Text style={styles.seccionTitulo}>💬 Motivo</Text>
                    <Text style={styles.infoTexto}>{itemActivo.motivo}</Text>
                    <Text style={styles.infoTextoSub}>
                      Fecha devolución: {formatearFecha(itemActivo.fecha_devolucion)}
                    </Text>
                  </View>

                  {/* Eliminar */}
                  <TouchableOpacity
                    style={[styles.btnEliminar, eliminando && { opacity: 0.5 }]}
                    onPress={() => eliminar(itemActivo.id_devolucion)}
                    disabled={eliminando}
                  >
                    <Text style={styles.btnEliminarTexto}>🗑 Eliminar devolución</Text>
                  </TouchableOpacity>

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
  overlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  container: { flex: 1 },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16, paddingTop: 50,
    backgroundColor: 'rgba(255,255,255,1.0)',
    borderBottomWidth: 1.5, borderBottomColor: '#1E293B',
  },
  titulo:           { fontSize: 17, fontWeight: '700', color: '#0F172A' },
  btnVolver:        { backgroundColor: '#1E293B', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  btnVolverTexto:   { color: '#F8FAFC', fontSize: 12, fontWeight: '600' },
  btnRecargar:      { backgroundColor: '#F1F5F9', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1.5, borderColor: '#1E293B' },
  btnRecargarTexto: { color: '#0F172A', fontSize: 12, fontWeight: '600' },

  infoBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,1.0)',
    borderBottomWidth: 1, borderBottomColor: '#E2E8F0',
  },
  infoTexto: { color: '#64748B', fontSize: 12 },
  infoTotal: { color: '#DC2626', fontSize: 12, fontWeight: '700' },

  lista: { padding: 14, paddingBottom: 30 },
  empty: { color: '#0F172A', textAlign: 'center', marginTop: 40, fontSize: 13 },

  card: {
    backgroundColor: 'rgba(255,255,255,1.0)',
    borderWidth: 1.5, borderColor: '#1E293B',
    borderRadius: 12, padding: 14, marginBottom: 12,
  },
  cardHeader:   { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 2 },
  cardProducto: { color: '#0F172A', fontWeight: '700', fontSize: 14 },
  cardCliente:  { color: '#64748B', fontSize: 12, marginTop: 2 },
  cardFecha:    { color: '#94A3B8', fontSize: 11, marginBottom: 8 },
  divider:      { height: 1, backgroundColor: '#E2E8F0', marginBottom: 8 },
  cardMotivo:   { color: '#334155', fontSize: 12, marginBottom: 8 },
  cardFooter:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardCantidad: { color: '#64748B', fontSize: 12 },
  cardTotal:    { color: '#DC2626', fontWeight: '700', fontSize: 14 },
  badge: {
    backgroundColor: '#FEE2E2', borderWidth: 1, borderColor: '#DC2626',
    borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, marginLeft: 8,
  },
  badgeTexto: { color: '#DC2626', fontSize: 10, fontWeight: 'bold' },

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
  infoTextoMod:  { color: '#0F172A', fontSize: 14, fontWeight: '500' },
  infoTextoSub:  { color: '#64748B', fontSize: 12, marginTop: 4 },

  btnEliminar: {
    backgroundColor: '#FEF2F2', borderWidth: 1.5, borderColor: '#DC2626',
    borderRadius: 10, padding: 13, alignItems: 'center', marginTop: 4, marginBottom: 8,
  },
  btnEliminarTexto: { color: '#DC2626', fontWeight: '600', fontSize: 14 },
});