import React, { useState, useCallback } from 'react';
import { router, useFocusEffect } from 'expo-router';
import {
  View, Text, TouchableOpacity, FlatList, ScrollView,
  StyleSheet, ImageBackground, SafeAreaView, ActivityIndicator,
  Alert, RefreshControl,
} from 'react-native';
import axios from 'axios';
import { sesion } from '../../../constants/sesion';

const API_DEVOLUCIONES = 'http://192.168.40.8/doto/api/devoluciones.php';

type Devolucion = {
  id_devolucion: number;
  cantidad: number;
  motivo: string;
  fecha_devolucion: string;
  estado: string;
  producto_nombre: string;
  precio_unitario: number;
  id_venta: number;
};

type FiltroEstado = 'Todos' | 'Pendiente' | 'Aprobada' | 'Rechazada';
const ESTADOS: FiltroEstado[] = ['Todos', 'Pendiente', 'Aprobada', 'Rechazada'];

const colorEstado = (estado: string) => {
  switch (estado.toLowerCase()) {
    case 'pendiente': return { bg: '#FEF9C3', border: '#CA8A04', text: '#854D0E' };
    case 'aprobada': return { bg: '#DCFCE7', border: '#16A34A', text: '#166534' };
    case 'rechazada': return { bg: '#FEE2E2', border: '#DC2626', text: '#991B1B' };
    default: return { bg: '#E2E8F0', border: '#64748B', text: '#334155' };
  }
};

export default function DevolucionesCliente() {
  const [devoluciones, setDevoluciones] = useState<Devolucion[]>([]);
  const [cargando, setCargando] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>('Todos');

  useFocusEffect(
    useCallback(() => {
      setDevoluciones([]);
      cargar();
    }, [])
  );

  const cargar = async () => {
    if (!sesion.id) return;
    setCargando(true);
    try {
      const res = await axios.get(API_DEVOLUCIONES, {
        params: { id_usuario: sesion.id },
        timeout: 5000,
      });
      setDevoluciones(Array.isArray(res.data) ? res.data : []);
    } catch {
      Alert.alert('Error', 'No se pudieron cargar las devoluciones');
    } finally {
      setCargando(false);
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
      <View style={styles.card}>

        {/* Header */}
        <View style={styles.cardHeader}>
          <Text style={styles.cardId}>Devolución #{item.id_devolucion}</Text>
          <View style={[styles.estadoBadge, { backgroundColor: ec.bg, borderColor: ec.border }]}>
            <Text style={[styles.estadoText, { color: ec.text }]}>{item.estado}</Text>
          </View>
        </View>

        <Text style={styles.cardFecha}>{formatearFecha(item.fecha_devolucion)}</Text>
        <View style={styles.divider} />

        {/* Producto */}
        <View style={styles.productoRow}>
          <Text style={styles.productoLabel}>Producto</Text>
          <Text style={styles.productoValor} numberOfLines={2}>{item.producto_nombre}</Text>
        </View>
        <View style={styles.productoRow}>
          <Text style={styles.productoLabel}>Cantidad</Text>
          <Text style={styles.productoValor}>{item.cantidad}</Text>
        </View>
        <View style={styles.productoRow}>
          <Text style={styles.productoLabel}>Subtotal</Text>
          <Text style={styles.productoValor}>
            ${Number(item.precio_unitario * item.cantidad).toLocaleString('es-CO')}
          </Text>
        </View>

        <View style={styles.divider} />

        {/* Motivo */}
        <Text style={styles.motivoLabel}>Motivo</Text>
        <Text style={styles.motivoTexto}>{item.motivo}</Text>

        {/* Mensaje según estado */}
        {item.estado === 'Pendiente' && (
          <View style={styles.mensajeBox}>
            <Text style={styles.mensajeTexto}>
              ⏳ Tu solicitud está siendo revisada. Pronto te contactaremos.
            </Text>
          </View>
        )}
        {item.estado === 'Aprobada' && (
          <View style={[styles.mensajeBox, styles.mensajeAprobada]}>
            <Text style={[styles.mensajeTexto, { color: '#166534' }]}>
              ✅ Tu devolución fue aprobada. Nos pondremos en contacto contigo.
            </Text>
          </View>
        )}
        {item.estado === 'Rechazada' && (
          <View style={[styles.mensajeBox, styles.mensajeRechazada]}>
            <Text style={[styles.mensajeTexto, { color: '#991B1B' }]}>
              ❌ Tu devolución fue rechazada. Contáctanos para más información.
            </Text>
          </View>
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
            <Text style={styles.brand}>Mis Devoluciones</Text>
          </View>
          <TouchableOpacity style={styles.btnRecargar} onPress={cargar}>
            <Text style={styles.btnRecargarTexto}>↻</Text>
          </TouchableOpacity>
        </View>

        {/* Filtros */}
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

        {/* Lista */}
        {cargando && devoluciones.length === 0 ? (
          <ActivityIndicator size="large" color="#1E293B" style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={devolucionesFiltradas}
            keyExtractor={item => item.id_devolucion.toString()}
            renderItem={renderDevolucion}
            contentContainerStyle={styles.listContent}
            refreshControl={<RefreshControl refreshing={cargando} onRefresh={cargar} />}
            ListEmptyComponent={
              <Text style={styles.empty}>
                {cargando ? '' : 'No tienes devoluciones registradas'}
              </Text>
            }
          />
        )}

        {/* Bottom nav */}
        <View style={styles.bottomNav}>
          {[
            { label: 'Inicio', icon: '🏠', route: '/cliente/panel_cliente' },
            { label: 'Productos', icon: '📦', route: '/cliente/productos_cliente' },
            { label: 'Pedidos', icon: '📋', route: '/cliente/pedidos_cliente' },
            { label: 'Perfil', icon: '👤', route: '/cliente/perfil_cliente' },
          ].map(item => (
            <TouchableOpacity
              key={item.label}
              style={styles.bnav}
              onPress={() => item.route && router.push(item.route as any)}
            >
              <Text style={styles.bnavIcon}>{item.icon}</Text>
              <Text style={styles.bnavLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255,255,255,0.10)' },
  safeArea: { flex: 1 },

  // Header
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 12, backgroundColor: 'rgba(255,255,255,1.0)', borderBottomWidth: 1.5, borderBottomColor: '#1E40AF' },
  btnVolver: { backgroundColor: '#1E40AF', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 4 },
  btnVolverTexto: { color: '#F8FAFC', fontSize: 20, fontWeight: '600' },
  logoArea: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoCircle: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#1E40AF', alignItems: 'center', justifyContent: 'center' },
  logoInitials: { color: '#F8FAFC', fontWeight: 'bold', fontSize: 10 },
  brand: { color: '#0F172A', fontWeight: '700', fontSize: 15 },
  btnRecargar: { backgroundColor: '#F1F5F9', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1.5, borderColor: '#1E40AF' },
  btnRecargarTexto: { color: '#0F172A', fontSize: 16, fontWeight: '600' },

  // Filtros
  filtrosScroll: { paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  chip: { backgroundColor: 'rgba(255,255,255,1.0)', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1.5, borderColor: '#1E40AF' },
  chipActivo: { backgroundColor: '#1E40AF' },
  chipTexto: { color: '#0F172A', fontSize: 12, fontWeight: '500' },
  chipTextoActivo: { color: '#F8FAFC', fontWeight: '600' },

  // Lista
  listContent: { padding: 14, paddingBottom: 24 },
  empty: { color: '#0F172A', textAlign: 'center', marginTop: 40, fontSize: 13 },

  // Card
  card: { backgroundColor: 'rgba(255,255,255,1.0)', borderWidth: 1.5, borderColor: '#1E40AF', borderRadius: 12, padding: 14, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  cardId: { color: '#0F172A', fontWeight: '700', fontSize: 14 },
  cardFecha: { color: '#64748B', fontSize: 11, marginBottom: 10 },
  estadoBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1 },
  estadoText: { fontSize: 10, fontWeight: 'bold' },
  divider: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 10 },

  // Producto info
  productoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  productoLabel: { color: '#64748B', fontSize: 12 },
  productoValor: { color: '#0F172A', fontSize: 12, fontWeight: '600', maxWidth: '65%', textAlign: 'right' },

  // Motivo
  motivoLabel: { color: '#64748B', fontSize: 12, marginBottom: 4 },
  motivoTexto: { color: '#0F172A', fontSize: 13, lineHeight: 18 },

  // Mensajes estado
  mensajeBox: { marginTop: 10, backgroundColor: '#FEF9C3', borderRadius: 8, padding: 10, borderWidth: 1, borderColor: '#CA8A04' },
  mensajeAprobada: { backgroundColor: '#DCFCE7', borderColor: '#16A34A' },
  mensajeRechazada: { backgroundColor: '#FEE2E2', borderColor: '#DC2626' },
  mensajeTexto: { fontSize: 12, color: '#854D0E', lineHeight: 18 },

  // Bottom nav
  bottomNav: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 10, backgroundColor: 'rgba(255,255,255,1.0)', borderTopWidth: 1.5, borderTopColor: '#1E40AF' },
  bnav: { alignItems: 'center', gap: 2 },
  bnavIcon: { fontSize: 18 },
  bnavLabel: { fontSize: 9, color: '#64748B' },
});
