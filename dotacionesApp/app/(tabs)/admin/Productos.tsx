import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, ActivityIndicator, Alert, Image, ImageBackground } from 'react-native';
import { router } from 'expo-router';
import axios from 'axios';

const API_URL = 'http://192.168.1.19/doto/api/productos.php';
const API_BASE = 'http://192.168.1.19/doto/';

type Producto = {
  id_producto: number;
  nombre:      string;
  precio:      string;
  talla:       string;
  color:       string;
  imagen?:     string;
  estado:      'Disponible' | 'Agotado';
};

export default function ProductosScreen() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [filtrados, setFiltrados] = useState<Producto[]>([]);
  const [busqueda,  setBusqueda]  = useState('');
  const [cargando,  setCargando]  = useState(false);
  const [error,     setError]     = useState('');

  const cargarProductos = useCallback(async () => {
    try {
      setCargando(true);
      setError('');
      const res = await axios.get(API_URL, { timeout: 5000 });
      const data: Producto[] = Array.isArray(res.data) ? res.data : [];
      setProductos(data);
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

  useEffect(() => { cargarProductos(); }, [cargarProductos]);

  const buscar = (texto: string) => {
    setBusqueda(texto);
    const t = texto.toLowerCase();
    setFiltrados(
      productos.filter(p =>
        p.nombre.toLowerCase().includes(t) ||
        p.color.toLowerCase().includes(t)  ||
        p.talla.toLowerCase().includes(t)  ||
        p.estado.toLowerCase().includes(t)
      )
    );
  };

  const eliminar = (id: number, nombre: string) => {
    Alert.alert(
      'Eliminar producto',
      `¿Deseas eliminar "${nombre}"?`,
      [
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
      ]
    );
  };

  const obtenerImagen = (imagen?: string) => {
    if (!imagen) return '';
    if (/^https?:\/\//i.test(imagen)) return imagen;
    return `${API_BASE}${imagen.replace(/^\/+/, '')}`;
  };

  const renderProducto = ({ item }: { item: Producto }) => (
    <View style={styles.fila}>
      {obtenerImagen(item.imagen) ? (
        <Image
          source={{ uri: obtenerImagen(item.imagen) }}
          style={styles.imagenProducto}
          resizeMode="cover"
        />
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
        <View style={[
          styles.estadoBadge,
          item.estado === 'Agotado' && styles.estadoBadgeAgotado
        ]}>
          <Text style={styles.estadoTexto}>{item.estado}</Text>
        </View>
      </View>

      <View style={styles.acciones}>
        <TouchableOpacity
          style={styles.btnEditar}
          onPress={() => router.push({
            pathname: '/admin/editarProducto',
            params: { id: item.id_producto }
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
      <View style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/admin/panel_admin')} style={styles.btnVolver}>
          <Text style={styles.btnVolverTexto}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.titulo}>Productos</Text>
        <TouchableOpacity
          style={styles.btnAgregar}
          onPress={() => router.push('/admin/agregarProducto')}
        >
          <Text style={styles.btnAgregarTexto}>+ Agregar</Text>
        </TouchableOpacity>
      </View>

      {/* BUSCADOR */}
      <View style={styles.buscadorContenedor}>
        <TextInput
          style={styles.buscador}
          placeholder="🔍 Buscar por nombre, color, talla, estado..."
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
        <Text style={styles.sinResultados}>No se encontraron productos</Text>
      )}

      {/* LISTA */}
      <FlatList
        data={filtrados}
        keyExtractor={(item) => item.id_producto.toString()}
        renderItem={renderProducto}
        contentContainerStyle={styles.lista}
        onRefresh={cargarProductos}
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
  buscadorContenedor: { padding: 12 },
  buscador:           { backgroundColor: '#fff', color: '#333333', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#ccc', fontSize: 14 },
  lista:              { paddingHorizontal: 12, paddingBottom: 20 },
  fila:               { backgroundColor: '#fff', borderRadius: 10, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#ccc' },
  imagenProducto:     { width: '100%', height: 120, borderRadius: 8, marginBottom: 12, backgroundColor: '#fff' },
  imagenPlaceholder:  { width: '100%', height: 90, borderRadius: 8, marginBottom: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  imagenPlaceholderText: { fontSize: 30 },
  infoBloque:         { marginBottom: 12 },
  nombre:             { fontSize: 16, fontWeight: 'bold', color: '#333333', marginBottom: 4 },
  detalle:            { color: '#333333', fontSize: 13, marginBottom: 2 },
  estadoBadge:        { marginTop: 6, alignSelf: 'flex-start', backgroundColor: '#B7975B', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  estadoBadgeAgotado: { backgroundColor: '#B7975B' },
  estadoTexto:        { color: '#333333', fontWeight: 'bold', fontSize: 12 },
  acciones:           { flexDirection: 'row', gap: 10 },
  btnEditar:          { flex: 1, backgroundColor: '#B7975B', padding: 10, borderRadius: 8, alignItems: 'center' },
  btnEliminar:        { flex: 1, backgroundColor: '#B7975B', padding: 10, borderRadius: 8, alignItems: 'center' },
  btnTexto: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  error:              { color: '#333333', textAlign: 'center', marginTop: 20, fontSize: 14 },
  sinResultados:      { color: '#333333', textAlign: 'center', marginTop: 30, fontSize: 14 },
});
