import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, ActivityIndicator, Alert, ScrollView
} from 'react-native';
import { router } from 'expo-router';
import axios from 'axios';

const API_URL = 'http://192.168.137.121/dota/api/usuarios.php';

type Usuario = {
  id: number;   
  nombre: string;
  documento: string;
  correo: string;
  telefono: string;
  direccion: string;
  rol: string;
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
      const data: Usuario[] = res.data;
      setUsuarios(data);
      setFiltrados(data);
    } catch {
      setError('⚠ No se pudo conectar con el servidor');
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
        u.nombre.toLowerCase().includes(t)    ||
        u.documento.toLowerCase().includes(t) ||
        u.correo.toLowerCase().includes(t)    ||
        u.rol.toLowerCase().includes(t)
      )
    );
  };

  const eliminar = (id: number, nombre: string) => {
    Alert.alert(
      'Eliminar usuario',
      `¿Deseas eliminar a ${nombre}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar', style: 'destructive',
          onPress: async () => {
            try {
              await axios.delete(`${API_URL}?id=${id}`, { timeout: 5000 });
              cargarUsuarios();
            } catch {
              Alert.alert('Error', 'No se pudo eliminar el usuario');
            }
          }
        }
      ]
    );
  };

  const renderUsuario = ({ item }: { item: Usuario }) => (
    <View style={styles.fila}>
      <View style={styles.infoBloque}>
        <Text style={styles.nombre}>{item.nombre}</Text>
        <Text style={styles.detalle}>📄 {item.documento}</Text>
        <Text style={styles.detalle}>✉️ {item.correo}</Text>
        <Text style={styles.detalle}>📞 {item.telefono}</Text>
        <Text style={styles.detalle}>📍 {item.direccion}</Text>
        <View style={styles.rolBadge}>
          <Text style={styles.rolTexto}>{item.rol}</Text>
        </View>
      </View>

      <View style={styles.acciones}>
        <TouchableOpacity
          style={styles.btnEditar}
          onPress={() => router.push({ pathname: '/admin/editarUsuario', params: { id: item.id } })}
        >
          <Text style={styles.btnTexto}>✏️ Editar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnEliminar}
          onPress={() => eliminar(item.id, item.nombre)}
        >
          <Text style={styles.btnTexto}>🗑 Eliminar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.btnVolver}>
          <Text style={styles.btnVolverTexto}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.titulo}>Usuarios</Text>
        <TouchableOpacity
          style={styles.btnAgregar}
          onPress={() => router.push('/admin/agregarUsuario')}
        >
          <Text style={styles.btnAgregarTexto}>+ Agregar</Text>
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
      {cargando && <ActivityIndicator size="large" color="#B7975B" style={{ marginTop: 30 }} />}
      {error !== '' && <Text style={styles.error}>{error}</Text>}
      {!cargando && filtrados.length === 0 && error === '' && (
        <Text style={styles.sinResultados}>No se encontraron usuarios</Text>
      )}

      {/* LISTA */}
      <FlatList
        data={filtrados}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderUsuario}
        contentContainerStyle={styles.lista}
        onRefresh={cargarUsuarios}
        refreshing={cargando}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container:          { flex: 1, backgroundColor: '#09080D' },

  // HEADER
  header:             { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingTop: 50, backgroundColor: '#000' },
  titulo:             { fontSize: 20, fontWeight: 'bold', color: '#B7975B' },
  btnVolver:          { padding: 8 },
  btnVolverTexto:     { color: '#B7975B', fontSize: 14 },
  btnAgregar:         { backgroundColor: '#B7975B', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  btnAgregarTexto:    { color: '#fff', fontWeight: 'bold', fontSize: 13 },

  // BUSCADOR
  buscadorContenedor: { padding: 12 },
  buscador:           { backgroundColor: '#1a1a2e', color: '#fff', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#B7975B', fontSize: 14 },

  // LISTA
  lista:              { paddingHorizontal: 12, paddingBottom: 20 },

  // TARJETA USUARIO
  fila:               { backgroundColor: '#1a1a2e', borderRadius: 10, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#B7975B' },
  infoBloque:         { marginBottom: 12 },
  nombre:             { fontSize: 16, fontWeight: 'bold', color: '#B7975B', marginBottom: 4 },
  detalle:            { color: '#ccc', fontSize: 13, marginBottom: 2 },
  rolBadge:           { marginTop: 6, alignSelf: 'flex-start', backgroundColor: '#B7975B', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  rolTexto:           { color: '#000', fontWeight: 'bold', fontSize: 12 },

  // ACCIONES
  acciones:           { flexDirection: 'row', gap: 10 },
  btnEditar:          { flex: 1, backgroundColor: '#e67e22', padding: 10, borderRadius: 8, alignItems: 'center' },
  btnEliminar:        { flex: 1, backgroundColor: '#e74c3c', padding: 10, borderRadius: 8, alignItems: 'center' },
  btnTexto:           { color: '#fff', fontWeight: 'bold', fontSize: 13 },

  // ESTADOS
  error:              { color: '#e74c3c', textAlign: 'center', marginTop: 20, fontSize: 14 },
  sinResultados:      { color: '#aaa', textAlign: 'center', marginTop: 30, fontSize: 14 },
});