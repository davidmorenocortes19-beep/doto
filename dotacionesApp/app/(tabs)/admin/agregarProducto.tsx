import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, ScrollView
} from 'react-native';
import { router } from 'expo-router';
import axios from 'axios';

const API_URL = 'http://172.30.3.242/doto/api/productos.php';

export default function AgregarProductoScreen() {
  const [nombre, setNombre] = useState('');
  const [precio, setPrecio] = useState('');
  const [talla, setTalla] = useState('');
  const [color, setColor] = useState('');
  const [estado, setEstado] = useState<'Disponible' | 'Agotado'>('Disponible');
  const [guardando, setGuardando] = useState(false);

  const guardar = async () => {
    if (!nombre || !precio) {
      Alert.alert('Campos incompletos', 'Nombre y precio son obligatorios');
      return;
    }

    try {
      setGuardando(true);
      const res = await axios.post(API_URL, {
        nombre,
        precio: parseFloat(precio),
        talla,
        color,
        estado,
      }, { timeout: 5000 });

      if (res.data.mensaje) {
        Alert.alert('✅ Éxito', res.data.mensaje, [
          { text: 'OK', onPress: () => router.push('/admin/Productos') }
        ]);
      } else {
        Alert.alert('Error', res.data.error || 'No se pudo crear el producto');
      }
    } catch {
      Alert.alert('Error', 'No se pudo conectar con el servidor');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <View style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/admin/Productos')} style={styles.btnVolver}>
          <Text style={styles.btnVolverTexto}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.titulo}>Agregar Producto</Text>
        <View style={{ width: 70 }} />
      </View>

      <ScrollView contentContainerStyle={styles.form}>

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
              style={[styles.estadoBtn, estado === e && (e === 'Disponible' ? styles.estadoBtnDisponible : styles.estadoBtnAgotado)]}
              onPress={() => setEstado(e)}
            >
              <Text style={[styles.estadoBtnTexto, estado === e && styles.estadoBtnTextoActivo]}>
                {e}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.btnGuardar, guardando && { opacity: 0.6 }]}
          onPress={guardar}
          disabled={guardando}
        >
          {guardando
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.btnGuardarTexto}>💾 Guardar producto</Text>
          }
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09080D' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingTop: 50, backgroundColor: '#000' },
  titulo: { fontSize: 20, fontWeight: 'bold', color: '#B7975B' },
  btnVolver: { padding: 8 },
  btnVolverTexto: { color: '#B7975B', fontSize: 14 },
  form: { padding: 20, paddingBottom: 40 },
  label: { color: '#B7975B', fontSize: 13, fontWeight: 'bold', marginBottom: 6, marginTop: 14 },
  input: { backgroundColor: '#1a1a2e', color: '#fff', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#B7975B', fontSize: 14 },
  estadoContenedor: { flexDirection: 'row', gap: 10, marginTop: 4 },
  estadoBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: '#B7975B', alignItems: 'center' },
  estadoBtnDisponible: { backgroundColor: '#2ecc71', borderColor: '#2ecc71' },
  estadoBtnAgotado: { backgroundColor: '#e74c3c', borderColor: '#e74c3c' },
  estadoBtnTexto: { color: '#B7975B', fontWeight: 'bold', fontSize: 14 },
  estadoBtnTextoActivo: { color: '#fff' },
  btnGuardar: { backgroundColor: '#B7975B', padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 30 },
  btnGuardarTexto: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});