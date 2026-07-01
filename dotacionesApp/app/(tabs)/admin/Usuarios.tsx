import React, { useState, useEffect, useMemo } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList, ScrollView, Modal,
  StyleSheet, ActivityIndicator, Alert, Linking, ImageBackground } from 'react-native';
import { router } from 'expo-router';
import axios from 'axios';

const API_URL  = 'http://192.168.40.8/doto/api/usuarios.php';
const API_BASE = 'http://192.168.40.8/doto/api';

type Usuario = {
  id_usuario:  number;
  nombre:      string;
  documento:   string;
  correo:      string;
  telefono:    string;
  direccion:   string;
  id_rol_fk:   number;
  nombre_rol:  string;
};

export default function UsuariosScreen() {
  const [usuarios,  setUsuarios]  = useState<Usuario[]>([]);
  const [filtrados, setFiltrados] = useState<Usuario[]>([]);
  const [busqueda,  setBusqueda]  = useState('');
  const [cargando,  setCargando]  = useState(false);
  const [error,     setError]     = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  const [filtroRol, setFiltroRol] = useState<string>('Todos');

  const cargarUsuarios = async () => {
    try {
      setCargando(true);
      setError('');
      const res = await axios.get(API_URL, { timeout: 5000 });
      const data: Usuario[] = Array.isArray(res.data) ? res.data : [];
      setUsuarios(data);
    } catch (e: any) {
      if (e.code === 'ECONNABORTED') {
        setError('⚠ Tiempo de espera agotado. Verifica que Apache esté activo');
      } else if (e.request) {
        setError('⚠ Sin respuesta del servidor. Verifica la IP');
      } else {
        setError('⚠ Error: ' + e.message);
      }
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargarUsuarios(); }, []);

  const rolesDisponibles = useMemo(() => {
    const unicos = Array.from(new Set(usuarios.map(u => u.nombre_rol).filter(Boolean)));
    return ['Todos', ...unicos];
  }, [usuarios]);

  useEffect(() => {
    let resultado = [...usuarios];

    if (busqueda.trim() !== '') {
      const t = busqueda.toLowerCase();
      resultado = resultado.filter(u =>
        u.nombre.toLowerCase().includes(t)     ||
        u.documento.toLowerCase().includes(t)  ||
        u.correo.toLowerCase().includes(t)     ||
        u.nombre_rol.toLowerCase().includes(t)
      );
    }

    if (filtroRol !== 'Todos') {
      resultado = resultado.filter(u => u.nombre_rol === filtroRol);
    }

    setFiltrados(resultado);
  }, [usuarios, busqueda, filtroRol]);

  const filtrosActivos = filtroRol !== 'Todos' ? 1 : 0;

  const limpiarFiltros = () => { setFiltroRol('Todos'); };

  const exportarPDF = async () => {
    try {
      await Linking.openURL(`${API_BASE}/reporteUsuariosPDF.php`);
    } catch {
      Alert.alert('Error', 'No se pudo abrir el reporte PDF');
    }
  };

  const exportarExcel = async () => {
    try {
      await Linking.openURL(`${API_BASE}/reporteUsuariosExcel.php`);
    } catch {
      Alert.alert('Error', 'No se pudo abrir el reporte Excel');
    }
  };

  const renderChip = (valor: string, activo: boolean, onPress: () => void) => (
    <TouchableOpacity
      key={valor}
      style={[styles.chip, activo && styles.chipActivo]}
      onPress={onPress}
    >
      <Text style={[styles.chipTexto, activo && styles.chipTextoActivo]}>
        {valor}
      </Text>
    </TouchableOpacity>
  );

  const renderUsuario = ({ item }: { item: Usuario }) => (
    <View style={styles.fila}>
      <View style={styles.infoBloque}>
        <Text style={styles.nombre}>{item.nombre}</Text>
        <Text style={styles.detalle}>📄 {item.documento}</Text>
        <Text style={styles.detalle}>✉️  {item.correo}</Text>
        <Text style={styles.detalle}>📞 {item.telefono}</Text>
        <Text style={styles.detalle}>📍 {item.direccion}</Text>
        <View style={styles.rolBadge}>
          <Text style={styles.rolTexto}>{item.nombre_rol}</Text>
        </View>
      </View>

      <View style={styles.acciones}>
        <TouchableOpacity
          style={styles.btnEditar}
          onPress={() => router.push({
            pathname: '/admin/editarUsuario',
            params: { id: item.id_usuario }
          })}
        >
          <Text style={styles.btnTexto}>✏️ Editar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ImageBackground
      source={require('../../../assets/images/camiseta.png')}
      style={styles.background}
      resizeMode="cover"
    >
      {/* Overlay blanco semitransparente */}
      <View style={styles.overlay} />

      <View style={styles.container}>

        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.replace('/admin/panel_admin')} style={styles.btnVolver}>
            <Text style={styles.btnVolverTexto}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.titulo}>Usuarios</Text>
          <TouchableOpacity style={styles.btnAgregar} onPress={() => router.push('/registro')}>
            <Text style={styles.btnAgregarTexto}>+ Agregar</Text>
          </TouchableOpacity>
        </View>

        {/* BOTONES EXPORTAR */}
        <View style={styles.exportarContenedor}>
          <TouchableOpacity style={styles.btnPDF} onPress={exportarPDF}>
            <Text style={styles.btnExportarTexto}> Exportar PDF</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnExcel} onPress={exportarExcel}>
            <Text style={styles.btnExportarTexto}> Exportar Excel</Text>
          </TouchableOpacity>
        </View>

        {/* BUSCADOR + FILTROS */}
        <View style={styles.buscadorFila}>
          <TextInput
            style={styles.buscador}
            placeholder="🔍 Buscar por nombre, correo, rol..."
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

        {/* ESTADOS */}
        {cargando && <ActivityIndicator size="large" color="#1E293B" style={{ marginTop: 30 }} />}
        {error !== '' && <Text style={styles.error}>{error}</Text>}
        {!cargando && filtrados.length === 0 && error === '' && (
          <Text style={styles.sinResultados}>No se encontraron usuarios</Text>
        )}

        {/* LISTA */}
        <FlatList
          data={filtrados}
          keyExtractor={(item) => item.id_usuario.toString()}
          renderItem={renderUsuario}
          contentContainerStyle={styles.lista}
          onRefresh={cargarUsuarios}
          refreshing={cargando}
        />

        {/* MODAL FILTROS */}
        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContenido}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitulo}>Filtros</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Text style={styles.modalCerrar}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView>
                <Text style={styles.filtrosTitulo}>Rol</Text>
                <View style={styles.chipsWrap}>
                  {rolesDisponibles.map(r =>
                    renderChip(r, filtroRol === r, () => setFiltroRol(r))
                  )}
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
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
  },
  container: { flex: 1 },

  // Header
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

  // Exportar
  exportarContenedor: { flexDirection: 'row', gap: 10, paddingHorizontal: 12, paddingTop: 10, paddingBottom: 2 },
  btnPDF:             { flex: 1, backgroundColor: '#991B1B', paddingVertical: 10, borderRadius: 8, alignItems: 'center', borderWidth: 1.5, borderColor: '#991B1B' },
  btnExcel:           { flex: 1, backgroundColor: '#991B1B', paddingVertical: 10, borderRadius: 8, alignItems: 'center', borderWidth: 1.5, borderColor: '#991B1B' },
  btnExportarTexto:   { color: '#F8FAFC', fontWeight: '600', fontSize: 13 },

  // Buscador
  buscadorFila: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 8 },
  buscador: {
    flex: 1, backgroundColor: 'rgba(255, 255, 255, 1.0)', color: '#0F172A',
    padding: 12, borderRadius: 8, borderWidth: 1.5, borderColor: '#991B1B', fontSize: 14,
  },
  btnFiltros:      { backgroundColor: 'rgba(255, 255, 255, 1.0)', borderWidth: 1.5, borderColor: '#991B1B', paddingHorizontal: 12, paddingVertical: 12, borderRadius: 8 },
  btnFiltrosTexto: { color: '#0F172A', fontWeight: '600', fontSize: 13 },

  // Lista
  lista:       { paddingHorizontal: 12, paddingBottom: 20 },
  fila:        { backgroundColor: 'rgba(255, 255, 255, 1.0)', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1.5, borderColor: '#991B1B' },
  infoBloque:  { marginBottom: 12 },
  nombre:      { fontSize: 16, fontWeight: '600', color: '#0F172A', marginBottom: 4 },
  detalle:     { color: '#64748B', fontSize: 13, marginBottom: 2 },
  rolBadge:    { marginTop: 6, alignSelf: 'flex-start', backgroundColor: '#991B1B', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  rolTexto:    { color: '#F8FAFC', fontWeight: '600', fontSize: 12 },
  acciones:    { flexDirection: 'row', gap: 10 },
  btnEditar:   { flex: 1, backgroundColor: '#991B1B', padding: 10, borderRadius: 8, alignItems: 'center' },
  btnEliminar: { flex: 1, backgroundColor: '#DC2626', padding: 10, borderRadius: 8, alignItems: 'center' },
  btnTexto:    { color: '#F8FAFC', fontWeight: '600', fontSize: 13 },
  error:         { color: '#DC2626', textAlign: 'center', marginTop: 20, fontSize: 14 },
  sinResultados: { color: '#64748B', textAlign: 'center', marginTop: 30, fontSize: 14 },

  // Modal
  modalOverlay:   { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContenido: { backgroundColor: '#F8FAFC', borderTopLeftRadius: 16, borderTopRightRadius: 16, maxHeight: '75%', paddingBottom: 20, borderTopWidth: 1.5, borderColor: '#991B1B' },
  modalHeader:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(100, 116, 139, 0.2)' },
  modalTitulo:    { fontSize: 17, fontWeight: '600', color: '#0F172A' },
  modalCerrar:    { fontSize: 18, color: '#64748B', padding: 4 },
  filtrosTitulo:  { color: '#0F172A', fontSize: 13, fontWeight: '600', marginLeft: 16, marginTop: 16, marginBottom: 6 },
  chipsWrap:      { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 8 },
  chip:           { backgroundColor: 'rgba(255, 255, 255, 1.0)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: '#991B1B' },
  chipActivo:     { backgroundColor: '#991B1B', borderColor: '#991B1B' },
  chipTexto:      { color: '#0F172A', fontSize: 12, fontWeight: '500' },
  chipTextoActivo:{ color: '#F8FAFC', fontWeight: '600' },
  modalBotones:   { flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(100, 116, 139, 0.2)' },
  btnLimpiarModal:      { flex: 1, backgroundColor: 'rgba(255, 255, 255, 1.0)', paddingVertical: 12, borderRadius: 8, alignItems: 'center', borderWidth: 1.5, borderColor: '#991B1B' },
  btnLimpiarModalTexto: { color: '#0F172A', fontWeight: '600', fontSize: 13 },
  btnAplicarModal:      { flex: 1, backgroundColor: '#991B1B', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  btnAplicarModalTexto: { color: '#F8FAFC', fontWeight: '600', fontSize: 13 },
});