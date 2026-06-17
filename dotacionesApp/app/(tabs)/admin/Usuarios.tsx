import React, { useState, useEffect, useCallback } from 'react'; 
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, ActivityIndicator, Alert, Linking, ImageBackground } from 'react-native';
import { router } from 'expo-router';
import axios from 'axios';

const API_URL  = 'http://192.168.1.19/doto/api/usuarios.php';
const API_BASE = 'http://192.168.1.19/doto/api';

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

  const cargarUsuarios = useCallback(async () => {
    try {
      setCargando(true);
      setError('');
      const res = await axios.get(API_URL, { timeout: 5000 });
      const data: Usuario[] = Array.isArray(res.data) ? res.data : [];
      setUsuarios(data);
      setFiltrados(data);
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
  }, []);

  useEffect(() => { cargarUsuarios(); }, [cargarUsuarios]);

  const buscar = (texto: string) => {
    setBusqueda(texto);
    const t = texto.toLowerCase();
    setFiltrados(
      usuarios.filter(u =>
        u.nombre.toLowerCase().includes(t)     ||
        u.documento.toLowerCase().includes(t)  ||
        u.correo.toLowerCase().includes(t)     ||
        u.nombre_rol.toLowerCase().includes(t)
      )
    );
  };

  // ✅ Exportar reportes
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
          onPress={() =>
            router.push({
              pathname: '/admin/editarUsuario',
              params: { id: item.id_usuario }
            })
          }
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
      <View style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/admin/panel_admin')} style={styles.btnVolver}>
          <Text style={styles.btnVolverTexto}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.titulo}>Usuarios</Text>
        <TouchableOpacity
          style={styles.btnAgregar}
          onPress={() => router.push('/registro')}
        >
          <Text style={styles.btnAgregarTexto}>+ Agregar</Text>
        </TouchableOpacity>
      </View>

      {/* ✅ Botones de exportación */}
      <View style={styles.exportarContenedor}>
        <TouchableOpacity style={styles.btnPDF} onPress={exportarPDF}>
          <Text style={styles.btnExportarTexto}>📄 Exportar PDF</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnExcel} onPress={exportarExcel}>
          <Text style={styles.btnExportarTexto}>📊 Exportar Excel</Text>
        </TouchableOpacity>
      </View>

      {/* BUSCADOR */}
      <View style={styles.buscadorContenedor}>
        <TextInput
          style={styles.buscador}
          placeholder="🔍 Buscar por nombre, correo, rol..."
          placeholderTextColor="#999"
          value={busqueda}
          onChangeText={buscar}
        />
      </View>

      {/* ESTADOS */}
      {cargando && (
        <ActivityIndicator size="large" color="#B7975B" style={{ marginTop: 30 }} />
      )}
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

    </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  container: { flex: 1, backgroundColor: 'rgba(9,8,13,0.75)' },
  header:             { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingTop: 50, backgroundColor: '#fff' },
  titulo:             { fontSize: 20, fontWeight: 'bold', color: '#B7975B' },
  btnVolver:          { padding: 8 },
  btnVolverTexto: { color: '#fff', fontSize: 14 },
  btnAgregar:         { backgroundColor: '#B7975B', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  btnAgregarTexto: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  exportarContenedor: { flexDirection: 'row', gap: 10, paddingHorizontal: 12, paddingTop: 4 },
  btnPDF:             { flex: 1, backgroundColor: '#c0392b', paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  btnExcel:           { flex: 1, backgroundColor: '#27ae60', paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  btnExportarTexto:   { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  buscadorContenedor: { padding: 12 },
  buscador:           { backgroundColor: '#fff', color: '#333333', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#ccc', fontSize: 14 },
  lista:              { paddingHorizontal: 12, paddingBottom: 20 },
  fila:               { backgroundColor: '#fff', borderRadius: 10, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#ccc' },
  infoBloque:         { marginBottom: 12 },
  nombre:             { fontSize: 16, fontWeight: 'bold', color: '#333333', marginBottom: 4 },
  detalle:            { color: '#333333', fontSize: 13, marginBottom: 2 },
  rolBadge:           { marginTop: 6, alignSelf: 'flex-start', backgroundColor: '#B7975B', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  rolTexto:           { color: '#333333', fontWeight: 'bold', fontSize: 12 },
  acciones:           { flexDirection: 'row', gap: 10 },
  btnEditar:          { flex: 1, backgroundColor: '#B7975B', padding: 10, borderRadius: 8, alignItems: 'center' },
  btnEliminar:        { flex: 1, backgroundColor: '#B7975B', padding: 10, borderRadius: 8, alignItems: 'center' },
  btnTexto: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  error:              { color: '#333333', textAlign: 'center', marginTop: 20, fontSize: 14 },
  sinResultados:      { color: '#333333', textAlign: 'center', marginTop: 30, fontSize: 14 },
});