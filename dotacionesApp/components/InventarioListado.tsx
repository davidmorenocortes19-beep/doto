import React, { useEffect, useMemo, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList, ScrollView, Modal,
  StyleSheet, ActivityIndicator, Alert, Linking, ImageBackground
} from 'react-native';
import { router } from 'expo-router';
import axios from 'axios';

const API_URL = 'http://192.168.40.8/doto/api/inventario.php';
const API_BASE = 'http://192.168.40.8/doto/api';

type InventarioItem = {
  id_inventario: number;
  id_producto_fk: number;
  nombre: string;
  precio: string;
  talla: string;
  color: string;
  estado: 'Disponible' | 'Agotado';
  cantidad_actual: number;
  stock_minimo: number;
};

type InventarioListadoProps = {
  volverA: string;
  formularioRuta: string;
};

type FiltroEstadoStock = 'Todos' | 'Disponible' | 'Stock bajo' | 'Agotado';

const RANGOS_PRECIO = [
  { key: 'Todos', label: 'Todos',                test: (_p: number) => true },
  { key: 'r1',    label: '< $50.000',            test: (p: number) => p < 50000 },
  { key: 'r2',    label: '$50.000 - $100.000',   test: (p: number) => p >= 50000 && p <= 100000 },
  { key: 'r3',    label: '$100.000 - $200.000',  test: (p: number) => p > 100000 && p <= 200000 },
  { key: 'r4',    label: '> $200.000',           test: (p: number) => p > 200000 },
];

function estadoStock(item: InventarioItem): { texto: FiltroEstadoStock; color: string; badge: string } {
  if (Number(item.cantidad_actual) <= 0)
    return { texto: 'Agotado',    color: '#DC2626', badge: '#DC2626' };
  if (Number(item.cantidad_actual) <= Number(item.stock_minimo))
    return { texto: 'Stock bajo', color: '#D97706', badge: '#D97706' };
  return   { texto: 'Disponible', color: '#16A34A', badge: '#991B1B' };
}

export default function InventarioListado({ volverA, formularioRuta }: InventarioListadoProps) {
  const [inventario, setInventario] = useState<InventarioItem[]>([]);
  const [filtrados,  setFiltrados]  = useState<InventarioItem[]>([]);
  const [busqueda,   setBusqueda]   = useState('');
  const [cargando,   setCargando]   = useState(false);
  const [error,      setError]      = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  const [filtroEstado, setFiltroEstado] = useState<FiltroEstadoStock>('Todos');
  const [filtroTalla,  setFiltroTalla]  = useState<string>('Todas');
  const [filtroColor,  setFiltroColor]  = useState<string>('Todos');
  const [filtroPrecio, setFiltroPrecio] = useState<string>('Todos');

  const cargarInventario = async () => {
    try {
      setCargando(true);
      setError('');
      const res = await axios.get(API_URL, { timeout: 5000 });
      const data: InventarioItem[] = Array.isArray(res.data) ? res.data : [];
      setInventario(data);
      setBusqueda('');
    } catch (e: any) {
      if (e.code === 'ECONNABORTED') {
        setError('Tiempo de espera agotado. Verifica que Apache esté activo');
      } else if (e.request) {
        setError('Sin respuesta del servidor. Verifica la IP');
      } else {
        setError('Error: ' + e.message);
      }
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargarInventario(); }, []);

  const resumen = useMemo(() => {
    const agotados  = inventario.filter(i => Number(i.cantidad_actual) <= 0).length;
    const stockBajo = inventario.filter(i =>
      Number(i.cantidad_actual) > 0 &&
      Number(i.cantidad_actual) <= Number(i.stock_minimo)
    ).length;
    return { total: inventario.length, stockBajo, agotados };
  }, [inventario]);

  const tallasDisponibles = useMemo(() => {
    const unicas = Array.from(new Set(inventario.map(i => i.talla).filter(Boolean)));
    return ['Todas', ...unicas];
  }, [inventario]);

  const coloresDisponibles = useMemo(() => {
    const unicos = Array.from(new Set(inventario.map(i => i.color).filter(Boolean)));
    return ['Todos', ...unicos];
  }, [inventario]);

  useEffect(() => {
    let resultado = [...inventario];

    if (busqueda.trim() !== '') {
      const t = busqueda.toLowerCase();
      resultado = resultado.filter(i =>
        i.nombre.toLowerCase().includes(t) ||
        String(i.id_producto_fk).includes(t) ||
        String(i.cantidad_actual).includes(t) ||
        String(i.stock_minimo).includes(t) ||
        (i.talla ?? '').toLowerCase().includes(t) ||
        (i.color ?? '').toLowerCase().includes(t) ||
        i.estado.toLowerCase().includes(t)
      );
    }

    if (filtroEstado !== 'Todos') resultado = resultado.filter(i => estadoStock(i).texto === filtroEstado);
    if (filtroTalla  !== 'Todas') resultado = resultado.filter(i => i.talla === filtroTalla);
    if (filtroColor  !== 'Todos') resultado = resultado.filter(i => i.color === filtroColor);
    if (filtroPrecio !== 'Todos') {
      const rango = RANGOS_PRECIO.find(r => r.key === filtroPrecio);
      if (rango) resultado = resultado.filter(i => rango.test(Number(i.precio)));
    }

    setFiltrados(resultado);
  }, [inventario, busqueda, filtroEstado, filtroTalla, filtroColor, filtroPrecio]);

  const filtrosActivos = useMemo(() => {
    let n = 0;
    if (filtroEstado !== 'Todos') n++;
    if (filtroTalla  !== 'Todas') n++;
    if (filtroColor  !== 'Todos') n++;
    if (filtroPrecio !== 'Todos') n++;
    return n;
  }, [filtroEstado, filtroTalla, filtroColor, filtroPrecio]);

  const limpiarFiltros = () => {
    setFiltroEstado('Todos');
    setFiltroTalla('Todas');
    setFiltroColor('Todos');
    setFiltroPrecio('Todos');
  };

  const editar = (item: InventarioItem) => {
    router.push({ pathname: formularioRuta as any, params: { id: item.id_inventario } });
  };

  const eliminar = (item: InventarioItem) => {
    Alert.alert(
      'Eliminar inventario',
      `¿Deseas eliminar el inventario de "${item.nombre}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar', style: 'destructive',
          onPress: async () => {
            try {
              await axios.delete(`${API_URL}?id=${item.id_inventario}`, { timeout: 5000 });
              cargarInventario();
            } catch {
              Alert.alert('Error', 'No se pudo eliminar el inventario');
            }
          }
        }
      ]
    );
  };

  const exportarPDF = async () => {
    try { await Linking.openURL(`${API_BASE}/reporteInventarioPDF.php`); }
    catch { Alert.alert('Error', 'No se pudo abrir el reporte PDF'); }
  };

  const exportarExcel = async () => {
    try { await Linking.openURL(`${API_BASE}/reporteInventarioExcel.php`); }
    catch { Alert.alert('Error', 'No se pudo abrir el reporte Excel'); }
  };

  const renderChip = (valor: string, activo: boolean, onPress: () => void, label?: string) => (
    <TouchableOpacity
      key={valor}
      style={[styles.chip, activo && styles.chipActivo]}
      onPress={onPress}
    >
      <Text style={[styles.chipTexto, activo && styles.chipTextoActivo]}>{label ?? valor}</Text>
    </TouchableOpacity>
  );

  const renderInventario = ({ item }: { item: InventarioItem }) => {
    const estado = estadoStock(item);
    return (
      <View style={styles.fila}>
        <View style={styles.infoBloque}>
          <Text style={styles.nombre}>{item.nombre}</Text>
          <Text style={styles.detalle}>ID producto: {item.id_producto_fk}</Text>
          <Text style={styles.detalle}>Precio: ${Number(item.precio).toLocaleString('es-CO')}</Text>
          <Text style={styles.detalle}>Talla: {item.talla || 'N/A'}</Text>
          <Text style={styles.detalle}>Color: {item.color || 'N/A'}</Text>
          <Text style={styles.detalle}>Cantidad actual: {item.cantidad_actual}</Text>
          <Text style={styles.detalle}>Stock mínimo: {item.stock_minimo}</Text>
          <View style={[styles.estadoBadge, { backgroundColor: estado.badge }]}>
            <Text style={styles.estadoTexto}>{estado.texto}</Text>
          </View>
        </View>
        <View style={styles.acciones}>
          <TouchableOpacity style={styles.btnEditar}   onPress={() => editar(item)}>
            <Text style={styles.btnTexto}>✏️ Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnEliminar} onPress={() => eliminar(item)}>
            <Text style={styles.btnTexto}>🗑️ Eliminar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <ImageBackground
      source={require('../assets/images/camiseta.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay} />

      <View style={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.replace(volverA as any)} style={styles.btnVolver}>
            <Text style={styles.btnVolverTexto}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.titulo}>Inventario</Text>
          <TouchableOpacity style={styles.btnAgregar} onPress={() => router.push(formularioRuta as any)}>
            <Text style={styles.btnAgregarTexto}>+ Registrar</Text>
          </TouchableOpacity>
        </View>

        {/* EXPORTAR */}
        <View style={styles.exportarContenedor}>
          <TouchableOpacity style={styles.btnPDF}   onPress={exportarPDF}>
            <Text style={styles.btnExportarTexto}> Exportar PDF</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnExcel} onPress={exportarExcel}>
            <Text style={styles.btnExportarTexto}> Exportar Excel</Text>
          </TouchableOpacity>
        </View>

        {/* RESUMEN */}
        <View style={styles.resumenContenedor}>
          <View style={styles.resumenCard}>
            <Text style={styles.resumenValor}>{resumen.total}</Text>
            <Text style={styles.resumenLabel}>Registros</Text>
          </View>
          <View style={styles.resumenCard}>
            <Text style={[styles.resumenValor, { color: '#D97706' }]}>{resumen.stockBajo}</Text>
            <Text style={styles.resumenLabel}>Stock bajo</Text>
          </View>
          <View style={styles.resumenCard}>
            <Text style={[styles.resumenValor, { color: '#DC2626' }]}>{resumen.agotados}</Text>
            <Text style={styles.resumenLabel}>Agotados</Text>
          </View>
        </View>

        {/* BUSCADOR + FILTROS */}
        <View style={styles.buscadorFila}>
          <TextInput
            style={styles.buscador}
            placeholder="Buscar por producto, ID, talla, color o estado..."
            placeholderTextColor="#94A3B8"
            value={busqueda}
            onChangeText={setBusqueda}
          />
          <TouchableOpacity style={styles.btnFiltros} onPress={() => setModalVisible(true)}>
            <Text style={styles.btnFiltrosTexto}>
              ⚙️ Filtros{filtrosActivos > 0 ? ` (${filtrosActivos})` : ''}
            </Text>
          </TouchableOpacity>
        </View>

        {cargando && <ActivityIndicator size="large" color="#1E293B" style={{ marginTop: 30 }} />}
        {error !== '' && <Text style={styles.error}>{error}</Text>}
        {!cargando && filtrados.length === 0 && error === '' && (
          <Text style={styles.sinResultados}>No se encontraron registros de inventario</Text>
        )}

        <FlatList
          data={filtrados}
          keyExtractor={(item) => item.id_inventario.toString()}
          renderItem={renderInventario}
          contentContainerStyle={styles.lista}
          onRefresh={cargarInventario}
          refreshing={cargando}
        />

        {/* MODAL FILTROS */}
        <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContenido}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitulo}>Filtros</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Text style={styles.modalCerrar}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView>
                <Text style={styles.filtrosTitulo}>Estado</Text>
                <View style={styles.chipsWrap}>
                  {(['Todos', 'Disponible', 'Stock bajo', 'Agotado'] as FiltroEstadoStock[]).map(op =>
                    renderChip(op, filtroEstado === op, () => setFiltroEstado(op))
                  )}
                </View>

                <Text style={styles.filtrosTitulo}>Talla</Text>
                <View style={styles.chipsWrap}>
                  {tallasDisponibles.map(t => renderChip(t, filtroTalla === t, () => setFiltroTalla(t)))}
                </View>

                <Text style={styles.filtrosTitulo}>Color</Text>
                <View style={styles.chipsWrap}>
                  {coloresDisponibles.map(c => renderChip(c, filtroColor === c, () => setFiltroColor(c)))}
                </View>

                <Text style={styles.filtrosTitulo}>Precio</Text>
                <View style={styles.chipsWrap}>
                  {RANGOS_PRECIO.map(r => renderChip(r.key, filtroPrecio === r.key, () => setFiltroPrecio(r.key), r.label))}
                </View>
              </ScrollView>

              <View style={styles.modalBotones}>
                <TouchableOpacity style={styles.btnLimpiarModal} onPress={limpiarFiltros}>
                  <Text style={styles.btnLimpiarModalTexto}>Limpiar filtros</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.btnAplicarModal} onPress={() => setModalVisible(false)}>
                  <Text style={styles.btnAplicarModalTexto}>Aplicar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
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
    borderBottomWidth: 1.5, borderBottomColor: '#991B1B',
  },
  titulo:          { fontSize: 20, fontWeight: '600', color: '#0F172A' },
  btnVolver:       { padding: 8, backgroundColor: '#991B1B', borderRadius: 8, width: 70, alignItems: 'center' },
  btnVolverTexto:  { color: '#F8FAFC', fontSize: 13, fontWeight: '600' },
  btnAgregar:      { backgroundColor: '#991B1B', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  btnAgregarTexto: { color: '#F8FAFC', fontWeight: '600', fontSize: 13 },

  exportarContenedor: { flexDirection: 'row', gap: 10, paddingHorizontal: 12, paddingTop: 10, paddingBottom: 2 },
  btnPDF:             { flex: 1, backgroundColor: '#991B1B', paddingVertical: 10, borderRadius: 8, alignItems: 'center', borderWidth: 1.5, borderColor: '#991B1B' },
  btnExcel:           { flex: 1, backgroundColor: '#991B1B', paddingVertical: 10, borderRadius: 8, alignItems: 'center', borderWidth: 1.5, borderColor: '#991B1B' },
  btnExportarTexto:   { color: '#F8FAFC', fontWeight: '600', fontSize: 13 },

  resumenContenedor: { flexDirection: 'row', gap: 8, paddingHorizontal: 12, paddingTop: 12 },
  resumenCard:  { flex: 1, backgroundColor: 'rgba(255,255,255,1.0)', borderRadius: 10, padding: 12, alignItems: 'center', borderWidth: 1.5, borderColor: '#991B1B' },
  resumenValor: { color: '#0F172A', fontSize: 24, fontWeight: '700' },
  resumenLabel: { color: '#64748B', fontSize: 11, marginTop: 2, textAlign: 'center' },

  buscadorFila: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 8 },
  buscador: {
    flex: 1, backgroundColor: 'rgba(255,255,255,1.0)', color: '#0F172A',
    padding: 12, borderRadius: 8, borderWidth: 1.5, borderColor: '#991B1B', fontSize: 14,
  },
  btnFiltros:      { backgroundColor: 'rgba(255,255,255,1.0)', borderWidth: 1.5, borderColor: '#991B1B', paddingHorizontal: 12, paddingVertical: 12, borderRadius: 8 },
  btnFiltrosTexto: { color: '#0F172A', fontWeight: '600', fontSize: 13 },

  lista:       { paddingHorizontal: 12, paddingBottom: 20 },
  fila:        { backgroundColor: 'rgba(255,255,255,1.0)', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1.5, borderColor: '#991B1B' },
  infoBloque:  { marginBottom: 12 },
  nombre:      { fontSize: 16, fontWeight: '600', color: '#0F172A', marginBottom: 4 },
  detalle:     { color: '#64748B', fontSize: 13, marginBottom: 2 },
  estadoBadge: { marginTop: 6, alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  estadoTexto: { color: '#F8FAFC', fontWeight: '600', fontSize: 12 },
  acciones:    { flexDirection: 'row', gap: 10 },
  btnEditar:   { flex: 1, backgroundColor: '#991B1B', padding: 10, borderRadius: 8, alignItems: 'center' },
  btnEliminar: { flex: 1, backgroundColor: '#DC2626', padding: 10, borderRadius: 8, alignItems: 'center' },
  btnTexto:    { color: '#F8FAFC', fontWeight: '600', fontSize: 13 },
  error:         { color: '#DC2626', textAlign: 'center', marginTop: 20, fontSize: 14 },
  sinResultados: { color: '#64748B', textAlign: 'center', marginTop: 30, fontSize: 14 },

  modalOverlay:   { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContenido: { backgroundColor: '#F8FAFC', borderTopLeftRadius: 16, borderTopRightRadius: 16, maxHeight: '75%', paddingBottom: 20, borderTopWidth: 1.5, borderColor: '#991B1B' },
  modalHeader:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(100,116,139,0.2)' },
  modalTitulo:    { fontSize: 17, fontWeight: '600', color: '#0F172A' },
  modalCerrar:    { fontSize: 18, color: '#64748B', padding: 4 },
  filtrosTitulo:  { color: '#0F172A', fontSize: 13, fontWeight: '600', marginLeft: 16, marginTop: 16, marginBottom: 6 },
  chipsWrap:      { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 8 },
  chip:           { backgroundColor: 'rgba(255,255,255,1.0)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: '#991B1B' },
  chipActivo:     { backgroundColor: '#991B1B', borderColor: '#991B1B' },
  chipTexto:      { color: '#0F172A', fontSize: 12, fontWeight: '500' },
  chipTextoActivo:{ color: '#F8FAFC', fontWeight: '600' },
  modalBotones:   { flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(100,116,139,0.2)' },
  btnLimpiarModal:      { flex: 1, backgroundColor: 'rgba(255,255,255,1.0)', paddingVertical: 12, borderRadius: 8, alignItems: 'center', borderWidth: 1.5, borderColor: '#991B1B' },
  btnLimpiarModalTexto: { color: '#0F172A', fontWeight: '600', fontSize: 13 },
  btnAplicarModal:      { flex: 1, backgroundColor: '#991B1B', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  btnAplicarModalTexto: { color: '#F8FAFC', fontWeight: '600', fontSize: 13 },
});