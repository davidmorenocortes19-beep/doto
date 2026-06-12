import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, ScrollView, Pressable
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import axios from 'axios';

const BASE = 'http://192.168.40.8/doto/api';

export default function EditarProductoScreen() {
  const params     = useLocalSearchParams();
  const id         = Array.isArray(params.id) ? params.id[0] : params.id;

  const [nombre,    setNombre]    = useState('');
  const [precio,    setPrecio]    = useState('');
  const [talla,     setTalla]     = useState('');
  const [color,     setColor]     = useState('');
  const [estado,    setEstado]    = useState<'Disponible' | 'Agotado'>('Disponible');
  const [cargando,  setCargando]  = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [errorMsg,  setErrorMsg]  = useState('');
  const [exitoMsg,  setExitoMsg]  = useState('');

  useEffect(() => { if (id) cargarProducto(); }, [id]);

  const cargarProducto = async () => {
    try {
      setCargando(true);
      setErrorMsg('');
      const res = await axios.get(`${BASE}/productos.php?id=${id}`, { timeout: 8000 });
      const p   = res.data;

      if (!p || p.error) {
        setErrorMsg('No se encontró el producto');
        return;
      }

      setNombre(p.nombre         ?? '');
      setPrecio(String(p.precio) ?? '');
      setTalla(p.talla           ?? '');
      setColor(p.color           ?? '');
      setEstado(p.estado         ?? 'Disponible');

    } catch (e: any) {
      setErrorMsg(`Error al cargar: ${e?.message ?? 'desconocido'}`);
    } finally {
      setCargando(false);
    }
  };

  const guardar = async () => {
    if (!nombre || !precio) {
      Alert.alert('Campos incompletos', 'Nombre y precio son obligatorios');
      return;
    }

    if (isNaN(parseFloat(precio)) || parseFloat(precio) <= 0) {
      Alert.alert('Precio inválido', 'Ingresa un precio válido mayor a 0');
      return;
    }

    try {
      setGuardando(true);
      const res = await axios.put(`${BASE}/productos.php`, {
        id_producto: Number(id),
        nombre,
        precio:  parseFloat(precio),
        talla,
        color,
        estado,
      }, { timeout: 8000 });

      if (res.data.mensaje) {
        setExitoMsg('✅ Producto actualizado correctamente');
        setTimeout(() => {
          setExitoMsg('');
          router.push('/admin/Productos');
        }, 2000);
      } else {
        Alert.alert('Error', res.data.error || 'No se pudo actualizar');
      }
    } catch (e: any) {
      const status  = e?.response?.status;
      const data    = e?.response?.data;
      const mensaje = e?.message;

      if (data?.error) {
        Alert.alert(`Error ${status}`, data.error);
      } else if (mensaje) {
        Alert.alert('Error de conexión', mensaje);
      } else {
        Alert.alert('Error', 'No se pudo conectar con el servidor');
      }
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator size="large" color="#B7975B" />
        <Text style={{ color: '#B7975B', marginTop: 10 }}>Cargando producto...</Text>
      </View>
    );
  }

  if (errorMsg) {
    return (
      <View style={styles.centrado}>
        <Text style={{ color: '#e74c3c', fontSize: 14, textAlign: 'center', paddingHorizontal: 20 }}>
          {errorMsg}
        </Text>
        <TouchableOpacity onPress={cargarProducto} style={{ marginTop: 20 }}>
          <Text style={{ color: '#B7975B' }}>🔄 Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/admin/Productos')} style={styles.btnVolver}>
          <Text style={styles.btnVolverTexto}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.titulo}>Editar Producto</Text>
        <View style={{ width: 70 }} />
      </View>

      {exitoMsg ? (
        <View style={styles.exitoContenedor}>
          <Text style={styles.exitoTexto}>{exitoMsg}</Text>
        </View>
      ) : null}

      <ScrollView
        contentContainerStyle={styles.form}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.label}>Nombre *</Text>
        <TextInput
          style={styles.input}
          value={nombre}
          onChangeText={setNombre}
          placeholderTextColor="#999"
          placeholder="Nombre del producto"
        />

        <Text style={styles.label}>Precio *</Text>
        <TextInput
          style={styles.input}
          value={precio}
          onChangeText={setPrecio}
          placeholderTextColor="#999"
          placeholder="0.00"
          keyboardType="decimal-pad"
        />

        <Text style={styles.label}>Talla</Text>
        <TextInput
          style={styles.input}
          value={talla}
          onChangeText={setTalla}
          placeholderTextColor="#999"
          placeholder="XS, S, M, L, XL..."
          autoCapitalize="characters"
        />

        <Text style={styles.label}>Color</Text>
        <TextInput
          style={styles.input}
          value={color}
          onChangeText={setColor}
          placeholderTextColor="#999"
          placeholder="Color del producto"
        />

        <Text style={styles.label}>Estado</Text>
        <View style={styles.estadoContenedor}>
          {(['Disponible', 'Agotado'] as const).map(e => (
            <TouchableOpacity
              key={e}
              style={[
                styles.estadoBtn,
                estado === e && (e === 'Disponible' ? styles.estadoBtnDisponible : styles.estadoBtnAgotado)
              ]}
              onPress={() => setEstado(e)}
            >
              <Text style={[styles.estadoBtnTexto, estado === e && styles.estadoBtnTextoActivo]}>
                {e}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footerBtn}>
        <Pressable
          style={({ pressed }) => [
            styles.btnGuardar,
            guardando && { opacity: 0.6 },
            pressed && { opacity: 0.8 }
          ]}
          onPress={guardar}
          disabled={guardando}
        >
          {guardando
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.btnGuardarTexto}>💾 Guardar cambios</Text>
          }
        </Pressable>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container:            { flex: 1, backgroundColor: '#09080D' },
  centrado:             { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#09080D' },
  header:               { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingTop: 50, backgroundColor: '#000' },
  titulo:               { fontSize: 20, fontWeight: 'bold', color: '#B7975B' },
  btnVolver:            { padding: 8 },
  btnVolverTexto:       { color: '#B7975B', fontSize: 14 },
  form:                 { padding: 20, paddingBottom: 40 },
  label:                { color: '#B7975B', fontSize: 13, fontWeight: 'bold', marginBottom: 6, marginTop: 14 },
  input:                { backgroundColor: '#1a1a2e', color: '#fff', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#B7975B', fontSize: 14 },
  estadoContenedor:     { flexDirection: 'row', gap: 10, marginTop: 4 },
  estadoBtn:            { flex: 1, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: '#B7975B', alignItems: 'center' },
  estadoBtnDisponible:  { backgroundColor: '#2ecc71', borderColor: '#2ecc71' },
  estadoBtnAgotado:     { backgroundColor: '#e74c3c', borderColor: '#e74c3c' },
  estadoBtnTexto:       { color: '#B7975B', fontWeight: 'bold', fontSize: 14 },
  estadoBtnTextoActivo: { color: '#fff' },
  btnGuardar:           { backgroundColor: '#B7975B', padding: 14, borderRadius: 10, alignItems: 'center' },
  btnGuardarTexto:      { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  footerBtn:            { padding: 10, paddingTop: 10, backgroundColor: '#09080D' },
  exitoContenedor:      { backgroundColor: '#1a4a1a', padding: 14, margin: 16, borderRadius: 10, borderWidth: 1, borderColor: '#4CAF50' },
  exitoTexto:           { color: '#4CAF50', fontWeight: 'bold', textAlign: 'center', fontSize: 14 },
});