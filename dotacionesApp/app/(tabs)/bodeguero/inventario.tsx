import React, { useState, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList, ScrollView,
  StyleSheet, ActivityIndicator, ImageBackground, RefreshControl,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import axios from 'axios';

const API_URL   = 'http://192.168.1.19/doto/api/inventario.php';
const ROL_COLOR = '#9A3412';

type InventarioItem = {
  id_inventario:   number;
  id_producto_fk:  number;
  nombre:          string;
  precio:          string;
  talla:           string;
  color:           string;
  estado:          'Disponible' | 'Agotado';
  cantidad_actual: number;
  stock_minimo:    number;
  inhabilitado:    number;
};

type FiltroEstado = 'Todos' | 'Disponible' | 'Stock bajo' | 'Agotado';
const FILTROS: FiltroEstado[] = ['Todos', 'Disponible', 'Stock bajo', 'Agotado'];

function estadoStock(item: InventarioItem): { texto: FiltroEstado; color: string } {
  if (Number(item.cantidad_actual) <= 0)                               return { texto: 'Agotado',    color: '#DC2626' };
  if (Number(item.cantidad_actual) <= Number(item.stock_minimo))       return { texto: 'Stock bajo', color: '#D97706' };
  return                                                                      { texto: 'Disponible', color: '#166534' };
}

function confirmar(titulo: string, mensaje: string, onConfirmar: () => void) {
  if (typeof window !== 'undefined') {
    if (window.confirm(`${titulo}\n${mensaje}`)) onConfirmar();
  } else {
    const { Alert } = require('react-native');
    Alert.alert(titulo, mensaje, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Confirmar', onPress: onConfirmar },
    ]);
  }
}

function notificar(titulo: string, mensaje: string) {
  if (typeof window !== 'undefined') window.alert(`${titulo}\n${mensaje}`);
  else { const { Alert } = require('react-native'); Alert.alert(titulo, mensaje); }
}

export default function InventarioBodeguero() {
  const [inventario,       setInventario]       = useState<InventarioItem[]>([]);
  const [filtrados,        setFiltrados]        = useState<InventarioItem[]>([]);
  const [busqueda,         setBusqueda]         = useState('');
  const [cargando,         setCargando]         = useState(false);
  const [error,            setError]            = useState('');
  const [filtroEstado,     setFiltroEstado]     = useState<FiltroEstado>('Todos');
  const [verInhabilitados, setVerInhabilitados] = useState(false);

  useFocusEffect(useCallback(() => { cargar(); }, [verInhabilitados]));

  const cargar = async () => {
    try {
      setCargando(true);
      setError('');
      const params = verInhabilitados ? { inhabilitados: 1 } : {};
      const res = await axios.get(API_URL, { params, timeout: 5000 });
      const data = Array.isArray(res.data) ? res.data : [];
      setInventario(data);
      aplicarFiltros(data, busqueda, filtroEstado);
    } catch {
      setError('⚠ No se pudo conectar con el servidor');
    } finally {
      setCargando(false);
    }
  };

  const aplicarFiltros = (data: InventarioItem[], texto: string, estado: FiltroEstado) => {
    let resultado = [...data];
    if (texto.trim()) {
      const t = texto.toLowerCase();
      resultado = resultado.filter(i =>
        i.nombre.toLowerCase().includes(t) ||
        String(i.cantidad_actual).includes(t) ||
        (i.talla ?? '').toLowerCase().includes(t) ||
        (i.color ?? '').toLowerCase().includes(t)
      );
    }
    if (estado !== 'Todos') resultado = resultado.filter(i => estadoStock(i).texto === estado);
    setFiltrados(resultado);
  };

  const onBusqueda = (texto: string) => { setBusqueda(texto); aplicarFiltros(inventario, texto, filtroEstado); };
  const onFiltro   = (estado: FiltroEstado) => { setFiltroEstado(estado); aplicarFiltros(inventario, busqueda, estado); };

  const resumen = {
    total:     inventario.length,
    stockBajo: inventario.filter(i => estadoStock(i).texto === 'Stock bajo').length,
    agotados:  inventario.filter(i => estadoStock(i).texto === 'Agotado').length,
  };

  const toggleInhabilitar = async (item: InventarioItem) => {
    const nuevoValor = item.inhabilitado === 1 ? 0 : 1;
    const accion     = nuevoValor === 1 ? 'inhabilitar' : 'habilitar';
    confirmar(
      `${accion.charAt(0).toUpperCase() + accion.slice(1)} inventario`,
      `¿Deseas ${accion} el inventario de "${item.nombre}"?`,
      async () => {
        try {
          await axios.put(API_URL, {
            id_inventario: item.id_inventario,
            inhabilitado:  nuevoValor,
          }, { timeout: 5000 });
          await cargar();
          notificar('✅', `Inventario ${nuevoValor === 1 ? 'inhabilitado' : 'habilitado'} correctamente`);
        } catch {
          notificar('Error', `No se pudo ${accion} el inventario`);
        }
      }
    );
  };

  const renderItem = ({ item }: { item: InventarioItem }) => {
    const est = estadoStock(item);
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardNombre}>{item.nombre}</Text>
          <View style={[styles.estadoBadge, { backgroundColor: est.color }]}>
            <Text style={styles.estadoTexto}>{est.texto}</Text>
          </View>
        </View>
        <Text style={styles.cardDetalle}>💰 ${Number(item.precio).toLocaleString('es-CO')}</Text>
        <Text style={styles.cardDetalle}>👕 Talla: {item.talla || 'N/A'} &nbsp; 🎨 Color: {item.color || 'N/A'}</Text>
        <Text style={styles.cardDetalle}>📦 Cantidad: {item.cantidad_actual} &nbsp; ⚠️ Mínimo: {item.stock_minimo}</Text>
        <View style={styles.cardAcciones}>
          {!verInhabilitados && (
            <TouchableOpacity
              style={styles.btnEditar}
              onPress={() => router.push({ pathname: '/bodeguero/editarInventario', params: { id: item.id_inventario } })}
            >
              <Text style={styles.btnTexto}>✏️ Editar</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.btnAccion, { backgroundColor: item.inhabilitado === 1 ? '#166534' : '#854D0E' }]}
            onPress={() => toggleInhabilitar(item)}
          >
            <Text style={styles.btnTexto}>{item.inhabilitado === 1 ? '✅ Habilitar' : '🚫 Inhabilitar'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <ImageBackground source={require('../../../assets/images/camiseta.png')} style={styles.background} resizeMode="cover">
      <View style={styles.overlay} />
      <View style={styles.container}>

        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.replace('/bodeguero/panel_bodeguero')} style={styles.btnVolver}>
            <Text style={styles.btnVolverTexto}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.titulo}>{verInhabilitados ? '🚫 Inhabilitados' : '📦 Inventario'}</Text>
          <TouchableOpacity style={styles.btnRecargar} onPress={cargar}>
            <Text style={styles.btnRecargarTexto}>↻ Recargar</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.accionesBar}>
          <TouchableOpacity
            style={[styles.btnInhabilitados, verInhabilitados && styles.btnInhabilitadosActivo]}
            onPress={() => { setVerInhabilitados(!verInhabilitados); setInventario([]); setFiltrados([]); }}
          >
            <Text style={[styles.btnInhabilitadosTexto, verInhabilitados && { color: '#F8FAFC' }]}>
              {verInhabilitados ? '✅ Ver activos' : '🚫 Ver inhabilitados'}
            </Text>
          </TouchableOpacity>
          {!verInhabilitados && (
            <TouchableOpacity style={styles.btnAgregar} onPress={() => router.push('/bodeguero/agregarInventario')}>
              <Text style={styles.btnAgregarTexto}>+ Registrar</Text>
            </TouchableOpacity>
          )}
        </View>

        {!verInhabilitados && (
          <View style={styles.resumenRow}>
            {[
              { label: 'Total',      valor: resumen.total,     color: ROL_COLOR },
              { label: 'Stock bajo', valor: resumen.stockBajo, color: '#D97706' },
              { label: 'Agotados',   valor: resumen.agotados,  color: '#DC2626' },
            ].map(s => (
              <View key={s.label} style={styles.resumenCard}>
                <Text style={[styles.resumenValor, { color: s.color }]}>{s.valor}</Text>
                <Text style={styles.resumenLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        )}

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtrosScroll}>
          {FILTROS.map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.chip, filtroEstado === f && styles.chipActivo]}
              onPress={() => onFiltro(f)}
            >
              <Text style={[styles.chipTexto, filtroEstado === f && styles.chipTextoActivo]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TextInput
          style={styles.buscador}
          placeholder="🔍 Buscar por nombre, talla, color..."
          placeholderTextColor="#94A3B8"
          value={busqueda}
          onChangeText={onBusqueda}
        />

        {error !== '' && <Text style={styles.error}>{error}</Text>}

        {cargando && filtrados.length === 0 ? (
          <ActivityIndicator size="large" color={ROL_COLOR} style={{ marginTop: 30 }} />
        ) : (
          <FlatList
            data={filtrados}
            keyExtractor={item => item.id_inventario.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.lista}
            refreshControl={<RefreshControl refreshing={cargando} onRefresh={cargar} />}
            ListEmptyComponent={
              <Text style={styles.sinResultados}>
                {verInhabilitados ? 'No hay inventario inhabilitado' : 'No se encontraron registros'}
              </Text>
            }
          />
        )}
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255,255,255,0.10)' },
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingTop: 50, backgroundColor: 'rgba(255,255,255,1.0)', borderBottomWidth: 1.5, borderBottomColor: '#9A3412' },
  titulo: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  btnVolver: { backgroundColor: '#9A3412', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  btnVolverTexto: { color: '#F8FAFC', fontSize: 12, fontWeight: '600' },
  btnRecargar: { backgroundColor: '#F1F5F9', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1.5, borderColor: '#9A3412' },
  btnRecargarTexto: { color: '#0F172A', fontSize: 12, fontWeight: '600' },
  accionesBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 10, backgroundColor: 'rgba(255,255,255,1.0)', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  btnInhabilitados: { borderWidth: 1.5, borderColor: '#9A3412', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  btnInhabilitadosActivo: { backgroundColor: '#9A3412' },
  btnInhabilitadosTexto: { color: '#9A3412', fontSize: 12, fontWeight: '600' },
  btnAgregar: { backgroundColor: '#9A3412', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  btnAgregarTexto: { color: '#F8FAFC', fontSize: 12, fontWeight: '600' },
  resumenRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 14, paddingTop: 12 },
  resumenCard: { flex: 1, backgroundColor: 'rgba(255,255,255,1.0)', borderRadius: 10, padding: 12, alignItems: 'center', borderWidth: 1.5, borderColor: '#9A3412' },
  resumenValor: { fontSize: 22, fontWeight: '700' },
  resumenLabel: { color: '#64748B', fontSize: 11, marginTop: 2 },
  filtrosScroll: { paddingHorizontal: 14, paddingVertical: 10, gap: 8 },
  chip: { backgroundColor: 'rgba(255,255,255,1.0)', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1.5, borderColor: '#9A3412' },
  chipActivo: { backgroundColor: '#9A3412' },
  chipTexto: { color: '#0F172A', fontSize: 12, fontWeight: '500' },
  chipTextoActivo: { color: '#F8FAFC', fontWeight: '600' },
  buscador: { marginHorizontal: 14, marginBottom: 8, backgroundColor: 'rgba(255,255,255,1.0)', color: '#0F172A', padding: 12, borderRadius: 8, borderWidth: 1.5, borderColor: '#9A3412', fontSize: 14 },
  lista: { paddingHorizontal: 14, paddingBottom: 24 },
  card: { backgroundColor: 'rgba(255,255,255,1.0)', borderWidth: 1.5, borderColor: '#9A3412', borderRadius: 12, padding: 14, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardNombre: { color: '#0F172A', fontWeight: '700', fontSize: 15, flex: 1, marginRight: 8 },
  estadoBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  estadoTexto: { color: '#F8FAFC', fontSize: 10, fontWeight: 'bold' },
  cardDetalle: { color: '#64748B', fontSize: 12, marginBottom: 4 },
  cardAcciones: { flexDirection: 'row', gap: 8, marginTop: 10 },
  btnEditar: { flex: 1, backgroundColor: '#9A3412', padding: 9, borderRadius: 8, alignItems: 'center' },
  btnAccion: { flex: 1, padding: 9, borderRadius: 8, alignItems: 'center' },
  btnTexto: { color: '#F8FAFC', fontSize: 12, fontWeight: '600' },
  error: { color: '#DC2626', textAlign: 'center', marginTop: 20 },
  sinResultados: { color: '#64748B', textAlign: 'center', marginTop: 30, fontSize: 13 },
});