import React, { useState, useEffect, useMemo } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList, ScrollView, Modal,
  StyleSheet, ActivityIndicator, Alert, Linking, Image, ImageBackground } from 'react-native';
import { router } from 'expo-router';
import axios from 'axios';

const API_URL      = 'http://192.168.1.19/doto/api/productos.php';
const API_BASE     = 'http://192.168.1.19/doto/';
const API_REPORTES = 'http://192.168.1.19/doto/api';

type Producto = {
  id_producto:  number;
  nombre:       string;
  precio:       string;
  talla:        string;
  color:        string;
  imagen?:      string;
  estado:       'Disponible' | 'Agotado';
  inhabilitado?: number;
};

type FiltroEstado = 'Todos' | 'Disponible' | 'Agotado';

const RANGOS_PRECIO = [
  { key: 'Todos', label: 'Todos',               test: (_p: number) => true },
  { key: 'r1',    label: '< $50.000',           test: (p: number) => p < 50000 },
  { key: 'r2',    label: '$50.000 - $100.000',  test: (p: number) => p >= 50000 && p <= 100000 },
  { key: 'r3',    label: '$100.000 - $200.000', test: (p: number) => p > 100000 && p <= 200000 },
  { key: 'r4',    label: '> $200.000',          test: (p: number) => p > 200000 },
];

export default function ProductosScreen() {
  const [productos,    setProductos]    = useState<Producto[]>([]);
  const [filtrados,    setFiltrados]    = useState<Producto[]>([]);
  const [busqueda,     setBusqueda]     = useState('');
  const [cargando,     setCargando]     = useState(false);
  const [error,        setError]        = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [verInhabilitados, setVerInhabilitados] = useState(false);

  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>('Todos');
  const [filtroTalla,  setFiltroTalla]  = useState<string>('Todas');
  const [filtroColor,  setFiltroColor]  = useState<string>('Todos');
  const [filtroPrecio, setFiltroPrecio] = useState<string>('Todos');

  const cargarProductos = async () => {
    try {
      setCargando(true);
      setError('');
      const params = verInhabilitados ? { inhabilitados: 1 } : {};
      const res = await axios.get(API_URL, { params, timeout: 5000 });
      setProductos(Array.isArray(res.data) ? res.data : []);
    } catch (e: any) {
      if (e.code === 'ECONNABORTED') setError('⚠ Tiempo de espera agotado');
      else if (e.request)            setError('⚠ Sin respuesta del servidor');
      else                           setError('⚠ Error: ' + e.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargarProductos(); }, [verInhabilitados]);

  const tallasDisponibles = useMemo(() => {
    const unicas = Array.from(new Set(productos.map(p => p.talla).filter(Boolean)));
    return ['Todas', ...unicas];
  }, [productos]);

  const coloresDisponibles = useMemo(() => {
    const unicos = Array.from(new Set(productos.map(p => p.color).filter(Boolean)));
    return ['Todos', ...unicos];
  }, [productos]);

  useEffect(() => {
    let resultado = [...productos];
    if (busqueda.trim() !== '') {
      const t = busqueda.toLowerCase();
      resultado = resultado.filter(p =>
        p.nombre.toLowerCase().includes(t) ||
        p.color.toLowerCase().includes(t)  ||
        p.talla.toLowerCase().includes(t)  ||
        p.estado.toLowerCase().includes(t)
      );
    }
    if (filtroEstado !== 'Todos') resultado = resultado.filter(p => p.estado === filtroEstado);
    if (filtroTalla  !== 'Todas') resultado = resultado.filter(p => p.talla === filtroTalla);
    if (filtroColor  !== 'Todos') resultado = resultado.filter(p => p.color === filtroColor);
    if (filtroPrecio !== 'Todos') {
      const rango = RANGOS_PRECIO.find(r => r.key === filtroPrecio);
      if (rango) resultado = resultado.filter(p => rango.test(parseFloat(p.precio)));
    }
    setFiltrados(resultado);
  }, [productos, busqueda, filtroEstado, filtroTalla, filtroColor, filtroPrecio]);

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

  const toggleInhabilitar = async (item: Producto) => {
    const accion = item.inhabilitado ? 'habilitar' : 'inhabilitar';
    try {
      await axios.put(API_URL, {
        id_producto:  item.id_producto,
        inhabilitado: !item.inhabilitado,
      }, { timeout: 5000 });
      await cargarProductos();
      Alert.alert('✅', `Producto ${accion === 'inhabilitar' ? 'inhabilitado' : 'habilitado'} correctamente`);
    } catch {
      Alert.alert('Error', `No se pudo ${accion} el producto`);
    }
  };

  const eliminar = (id: number, nombre: string) => {
    Alert.alert('Eliminar producto', `¿Deseas eliminar "${nombre}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar', style: 'destructive',
        onPress: async () => {
          try {
            await axios.delete(`${API_URL}?id=${id}`, { timeout: 5000 });
            cargarProductos();
          } catch {
            Alert.alert('Error', 'No se pudo eliminar el producto');
          }
        }
      }
    ]);
  };

  const exportarPDF   = async () => { try { await Linking.openURL(`${API_REPORTES}/reporteProductosPDF.php`); } catch { Alert.alert('Error', 'No se pudo abrir el reporte PDF'); } };
  const exportarExcel = async () => { try { await Linking.openURL(`${API_REPORTES}/reporteProductosExcel.php`); } catch { Alert.alert('Error', 'No se pudo abrir el reporte Excel'); } };

  const obtenerImagen = (imagen?: string) => {
    if (!imagen) return '';
    if (/^https?:\/\//i.test(imagen)) return imagen;
    return `${API_BASE}${imagen.replace(/^\/+/, '')}`;
  };

  const renderChip = (valor: string, activo: boolean, onPress: () => void, label?: string) => (
    <TouchableOpacity key={valor} style={[styles.chip, activo && styles.chipActivo]} onPress={onPress}>
      <Text style={[styles.chipTexto, activo && styles.chipTextoActivo]}>{label ?? valor}</Text>
    </TouchableOpacity>
  );

  const renderProducto = ({ item }: { item: Producto }) => (
    <View style={styles.fila}>
      {obtenerImagen(item.imagen) ? (
        <Image source={{ uri: obtenerImagen(item.imagen) }} style={styles.imagenProducto} resizeMode="cover" />
      ) : (
        <View style={styles.imagenPlaceholder}>
          <Text style={styles.imagenPlaceholderText}>📦</Text>
        </View>
      )}
      <View style={styles.infoBloque}>
        <Text style={styles.nombre}>{item.nombre}</Text>
        <Text style={styles.detalle}>💰 ${parseFloat(item.precio).toLocaleString('es-CO')}</Text>
        <Text style={styles.detalle}>👕 Talla: {item.talla || 'N/A'}</Text>
        <Text style={styles.detalle}>🎨 Color: {item.color || 'N/A'}</Text>
        <View style={[styles.estadoBadge, item.estado === 'Agotado' && styles.estadoBadgeAgotado]}>
          <Text style={styles.estadoTexto}>{item.estado}</Text>
        </View>
      </View>
      <View style={styles.acciones}>
        {!verInhabilitados && (
          <TouchableOpacity
            style={styles.btnEditar}
            onPress={() => router.push({ pathname: '/admin/editarProducto', params: { id: item.id_producto } })}
          >
            <Text style={styles.btnTexto}>✏️ Editar</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.btnEditar, { backgroundColor: item.inhabilitado ? '#166534' : '#854D0E' }]}
          onPress={() => {
            Alert.alert(
              item.inhabilitado ? 'Habilitar producto' : 'Inhabilitar producto',
              `¿Deseas ${item.inhabilitado ? 'habilitar' : 'inhabilitar'} "${item.nombre}"?`,
              [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Confirmar', onPress: () => toggleInhabilitar(item) },
              ]
            );
          }}
        >
          <Text style={styles.btnTexto}>{item.inhabilitado ? '✅ Habilitar' : '🚫 Inhabilitar'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ImageBackground source={require('../../../assets/images/camiseta.png')} style={styles.background} resizeMode="cover">
      <View style={styles.overlay} />
      <View style={styles.container}>

        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.replace('/admin/panel_admin')} style={styles.btnVolver}>
            <Text style={styles.btnVolverTexto}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.titulo}>{verInhabilitados ? '🚫 Inhabilitados' : 'Productos'}</Text>
          {!verInhabilitados ? (
            <TouchableOpacity style={styles.btnAgregar} onPress={() => router.push('/admin/agregarProducto')}>
              <Text style={styles.btnAgregarTexto}>+ Agregar</Text>
            </TouchableOpacity>
          ) : <View style={{ width: 70 }} />}
        </View>

        {/* Barra inhabilitados + exportar */}
        <View style={styles.accionesBar}>
          <TouchableOpacity
            style={[styles.btnInhabilitados, verInhabilitados && styles.btnInhabilitadosActivo]}
            onPress={() => { setVerInhabilitados(!verInhabilitados); setProductos([]); }}
          >
            <Text style={[styles.btnInhabilitadosTexto, verInhabilitados && styles.btnInhabilitadosTextoActivo]}>
              {verInhabilitados ? '✅ Ver activos' : '🚫 Ver inhabilitados'}
            </Text>
          </TouchableOpacity>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity style={styles.btnExportarSmall} onPress={exportarPDF}>
              <Text style={styles.btnExportarSmallTexto}>PDF</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnExportarSmall} onPress={exportarExcel}>
              <Text style={styles.btnExportarSmallTexto}>Excel</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.buscadorFila}>
          <TextInput
            style={styles.buscador}
            placeholder="🔍 Buscar por nombre, color, talla, estado..."
            placeholderTextColor="#94A3B8"
            value={busqueda}
            onChangeText={setBusqueda}
          />
          <TouchableOpacity style={styles.btnFiltros} onPress={() => setModalVisible(true)}>
            <Text style={styles.btnFiltrosTexto}>⚙️{filtrosActivos > 0 ? ` (${filtrosActivos})` : ''}</Text>
          </TouchableOpacity>
        </View>

        {cargando && <ActivityIndicator size="large" color="#991B1B" style={{ marginTop: 30 }} />}
        {error !== '' && <Text style={styles.error}>{error}</Text>}
        {!cargando && filtrados.length === 0 && error === '' && (
          <Text style={styles.sinResultados}>{verInhabilitados ? 'No hay productos inhabilitados' : 'No se encontraron productos'}</Text>
        )}

        <FlatList
          data={filtrados}
          keyExtractor={item => item.id_producto.toString()}
          renderItem={renderProducto}
          contentContainerStyle={styles.lista}
          onRefresh={cargarProductos}
          refreshing={cargando}
        />

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
                  {(['Todos', 'Disponible', 'Agotado'] as FiltroEstado[]).map(op => renderChip(op, filtroEstado === op, () => setFiltroEstado(op)))}
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
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255,255,255,0.10)' },
  container: { flex: 1 },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingTop: 50, backgroundColor: 'rgba(255,255,255,1.0)', borderBottomWidth: 1.5, borderBottomColor: '#991B1B' },
  titulo: { fontSize: 20, fontWeight: '600', color: '#0F172A' },
  btnVolver: { padding: 8, backgroundColor: '#991B1B', borderRadius: 8, width: 70, alignItems: 'center' },
  btnVolverTexto: { color: '#F8FAFC', fontSize: 13, fontWeight: '600' },
  btnAgregar: { backgroundColor: '#991B1B', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  btnAgregarTexto: { color: '#F8FAFC', fontWeight: '600', fontSize: 13 },

  accionesBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 10, backgroundColor: 'rgba(255,255,255,1.0)', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  btnInhabilitados: { borderWidth: 1.5, borderColor: '#991B1B', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  btnInhabilitadosActivo: { backgroundColor: '#991B1B' },
  btnInhabilitadosTexto: { color: '#991B1B', fontSize: 12, fontWeight: '600' },
  btnInhabilitadosTextoActivo: { color: '#F8FAFC' },
  btnExportarSmall: { backgroundColor: '#991B1B', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  btnExportarSmallTexto: { color: '#F8FAFC', fontSize: 11, fontWeight: '600' },

  buscadorFila: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 8 },
  buscador: { flex: 1, backgroundColor: 'rgba(255,255,255,1.0)', color: '#0F172A', padding: 12, borderRadius: 8, borderWidth: 1.5, borderColor: '#991B1B', fontSize: 14 },
  btnFiltros: { backgroundColor: 'rgba(255,255,255,1.0)', borderWidth: 1.5, borderColor: '#991B1B', paddingHorizontal: 12, paddingVertical: 12, borderRadius: 8 },
  btnFiltrosTexto: { color: '#0F172A', fontWeight: '600', fontSize: 13 },

  lista: { paddingHorizontal: 12, paddingBottom: 20 },
  fila: { backgroundColor: 'rgba(255,255,255,1.0)', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1.5, borderColor: '#991B1B' },
  imagenProducto: { width: '100%', height: 120, borderRadius: 8, marginBottom: 12, backgroundColor: '#F1F5F9' },
  imagenPlaceholder: { width: '100%', height: 90, borderRadius: 8, marginBottom: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F1F5F9' },
  imagenPlaceholderText: { fontSize: 30 },
  infoBloque: { marginBottom: 12 },
  nombre: { fontSize: 16, fontWeight: '600', color: '#0F172A', marginBottom: 4 },
  detalle: { color: '#64748B', fontSize: 13, marginBottom: 2 },
  estadoBadge: { marginTop: 6, alignSelf: 'flex-start', backgroundColor: '#991B1B', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  estadoBadgeAgotado: { backgroundColor: '#DC2626' },
  estadoTexto: { color: '#F8FAFC', fontWeight: '600', fontSize: 12 },
  acciones: { flexDirection: 'row', gap: 8 },
  btnEditar: { flex: 1, backgroundColor: '#991B1B', padding: 10, borderRadius: 8, alignItems: 'center' },
  btnTexto: { color: '#F8FAFC', fontWeight: '600', fontSize: 12 },
  error: { color: '#DC2626', textAlign: 'center', marginTop: 20, fontSize: 14 },
  sinResultados: { color: '#64748B', textAlign: 'center', marginTop: 30, fontSize: 14 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContenido: { backgroundColor: '#F8FAFC', borderTopLeftRadius: 16, borderTopRightRadius: 16, maxHeight: '75%', paddingBottom: 20, borderTopWidth: 1.5, borderColor: '#991B1B' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(100,116,139,0.2)' },
  modalTitulo: { fontSize: 17, fontWeight: '600', color: '#0F172A' },
  modalCerrar: { fontSize: 18, color: '#64748B', padding: 4 },
  filtrosTitulo: { color: '#0F172A', fontSize: 13, fontWeight: '600', marginLeft: 16, marginTop: 16, marginBottom: 6 },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 8 },
  chip: { backgroundColor: 'rgba(255,255,255,1.0)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: '#991B1B' },
  chipActivo: { backgroundColor: '#991B1B', borderColor: '#991B1B' },
  chipTexto: { color: '#0F172A', fontSize: 12, fontWeight: '500' },
  chipTextoActivo: { color: '#F8FAFC', fontWeight: '600' },
  modalBotones: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(100,116,139,0.2)' },
  btnLimpiarModal: { flex: 1, backgroundColor: 'rgba(255,255,255,1.0)', paddingVertical: 12, borderRadius: 8, alignItems: 'center', borderWidth: 1.5, borderColor: '#991B1B' },
  btnLimpiarModalTexto: { color: '#0F172A', fontWeight: '600', fontSize: 13 },
  btnAplicarModal: { flex: 1, backgroundColor: '#991B1B', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  btnAplicarModalTexto: { color: '#F8FAFC', fontWeight: '600', fontSize: 13 },
});