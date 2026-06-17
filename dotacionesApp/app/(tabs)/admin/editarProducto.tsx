import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, ScrollView, Pressable, ImageBackground } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import axios from 'axios';

const BASE = 'http://192.168.1.19/doto/api';

export default function EditarProductoScreen() {
  const params = useLocalSearchParams();
  const id     = Array.isArray(params.id) ? params.id[0] : params.id;

  const [nombre,    setNombre]    = useState('');
  const [precio,    setPrecio]    = useState('');
  const [talla,     setTalla]     = useState('');
  const [color,     setColor]     = useState('');
  const [imagen,    setImagen]    = useState('');
  const [estado,    setEstado]    = useState<'Disponible' | 'Agotado'>('Disponible');
  const [cargando,  setCargando]  = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [errorMsg,  setErrorMsg]  = useState('');
  const [exitoMsg,  setExitoMsg]  = useState('');

  // ── Errores por campo ──────────────────────────────────────
  const [nombreError, setNombreError] = useState('');
  const [precioError, setPrecioError] = useState('');
  const [tallaError,  setTallaError]  = useState('');
  const [colorError,  setColorError]  = useState('');

  useEffect(() => { if (id) cargarProducto(); }, [id]);

  const cargarProducto = async () => {
    try {
      setCargando(true);
      setErrorMsg('');
      const res = await axios.get(`${BASE}/productos.php?id=${id}`, { timeout: 8000 });
      const p   = res.data;
      if (!p || p.error) { setErrorMsg('No se encontró el producto'); return; }
      setNombre(p.nombre         ?? '');
      setPrecio(String(p.precio) ?? '');
      setTalla(p.talla           ?? '');
      setColor(p.color           ?? '');
      setImagen(p.imagen         ?? '');
      setEstado(p.estado         ?? 'Disponible');
    } catch (e: any) {
      setErrorMsg(`Error al cargar: ${e?.message ?? 'desconocido'}`);
    } finally {
      setCargando(false);
    }
  };

  // ── Handlers con validación en tiempo real ─────────────────

  const handleNombre = (text: string) => {
    setNombre(text);
    if (text.trim().length > 0 && text.trim().length < 3) {
      setNombreError('⚠ Mínimo 3 caracteres');
    } else {
      setNombreError('');
    }
  };

  const handlePrecio = (text: string) => {
    // Solo números y un punto decimal
    const limpio = text.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
    setPrecio(limpio);
    if (text !== limpio) {
      setPrecioError('⚠ Solo se permiten números');
    } else if (limpio !== '' && (isNaN(parseFloat(limpio)) || parseFloat(limpio) <= 0)) {
      setPrecioError('⚠ El precio debe ser mayor a 0');
    } else {
      setPrecioError('');
    }
  };

  const handleTalla = (text: string) => {
    // Solo letras y números
    const limpio = text.replace(/[^a-zA-Z0-9]/g, '');
    setTalla(limpio);
    if (text !== limpio) {
      setTallaError('⚠ Solo letras y números');
    } else {
      setTallaError('');
    }
  };

  const handleColor = (text: string) => {
    // Solo letras y espacios
    const limpio = text.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]/g, '');
    setColor(limpio);
    if (text !== limpio) {
      setColorError('⚠ Solo se permiten letras');
    } else {
      setColorError('');
    }
  };

  const guardar = async () => {
    let valido = true;

    if (!nombre.trim() || nombre.trim().length < 3) {
      setNombreError('⚠ Nombre obligatorio, mínimo 3 caracteres');
      valido = false;
    }
    if (!precio || isNaN(parseFloat(precio)) || parseFloat(precio) <= 0) {
      setPrecioError('⚠ Ingresa un precio válido mayor a 0');
      valido = false;
    }
    if (!valido) return;

    try {
      setGuardando(true);
      const res = await axios.put(`${BASE}/productos.php`, {
        id_producto: Number(id),
        nombre,
        precio:  parseFloat(precio),
        talla,
        color,
        imagen,
        estado,
      }, { timeout: 8000 });

      if (res.data.mensaje) {
        setExitoMsg('✅ Producto actualizado correctamente');
        setTimeout(() => { setExitoMsg(''); router.push('/admin/Productos'); }, 2000);
      } else {
        Alert.alert('Error', res.data.error || 'No se pudo actualizar');
      }
    } catch (e: any) {
      const data    = e?.response?.data;
      const status  = e?.response?.status;
      const mensaje = e?.message;
      if (data?.error)  Alert.alert(`Error ${status}`, data.error);
      else if (mensaje) Alert.alert('Error de conexión', mensaje);
      else              Alert.alert('Error', 'No se pudo conectar con el servidor');
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator size="large" color="#B7975B" />
        <Text style={{ color: '#333333', marginTop: 10 }}>Cargando producto...</Text>
      </View>
  );
  }

  if (errorMsg) {
    return (
      <View style={styles.centrado}>
        <Text style={{ color: '#333333', fontSize: 14, textAlign: 'center', paddingHorizontal: 20 }}>
          {errorMsg}
        </Text>
        <TouchableOpacity onPress={cargarProducto} style={{ marginTop: 20 }}>
          <Text style={{ color: '#333333' }}>🔄 Reintentar</Text>
        </TouchableOpacity>
      </View>
  );
  }

  return (
    <ImageBackground
      source={require('../../../assets/images/camiseta.png')}
      style={styles.background}
      resizeMode="cover"
    >
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

      <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">

        {/* NOMBRE */}
        <TextInput
          placeholder="Nombre del producto"
          placeholderTextColor="#999"
          style={[styles.input, nombreError ? styles.inputError : null]}
          value={nombre}
          onChangeText={handleNombre}
        />
        {nombreError !== '' && <Text style={styles.fieldHint}>{nombreError}</Text>}
        {nombre.trim().length >= 3 && nombreError === '' && (
          <Text style={styles.fieldOk}>✅ Nombre válido</Text>
        )}

        {/* PRECIO */}
        <TextInput
          placeholder="Precio (ej: 25000)"
          placeholderTextColor="#999"
          style={[styles.input, precioError ? styles.inputError : null]}
          value={precio}
          onChangeText={handlePrecio}
          keyboardType="decimal-pad"
        />
        {precioError !== '' && <Text style={styles.fieldHint}>{precioError}</Text>}
        {precio !== '' && !precioError && parseFloat(precio) > 0 && (
          <Text style={styles.fieldOk}>✅ Precio válido</Text>
        )}

        {/* TALLA */}
        <TextInput
          placeholder="Talla (ej: M, XL, 42...)"
          placeholderTextColor="#999"
          style={[styles.input, tallaError ? styles.inputError : null]}
          value={talla}
          onChangeText={handleTalla}
          autoCapitalize="characters"
        />
        {tallaError !== '' && <Text style={styles.fieldHint}>{tallaError}</Text>}
        {talla !== '' && tallaError === '' && (
          <Text style={styles.fieldOk}>✅ Talla válida</Text>
        )}

        {/* COLOR */}
        <TextInput
          placeholder="Color del producto"
          placeholderTextColor="#999"
          style={[styles.input, colorError ? styles.inputError : null]}
          value={color}
          onChangeText={handleColor}
        />
        {colorError !== '' && <Text style={styles.fieldHint}>{colorError}</Text>}
        {color !== '' && colorError === '' && (
          <Text style={styles.fieldOk}>✅ Color válido</Text>
        )}

        {/* IMAGEN */}
        <TextInput
          placeholder="URL o ruta de imagen"
          placeholderTextColor="#999"
          style={styles.input}
          value={imagen}
          onChangeText={setImagen}
          autoCapitalize="none"
        />

        {/* ESTADO */}
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
            : <Text style={styles.btnGuardarTexto}>💾 GUARDAR CAMBIOS</Text>
          }
        </Pressable>
      </View>

    </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  container: { flex: 1, backgroundColor: 'rgba(9,8,13,0.75)' },
  centrado:             { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  header:               { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingTop: 50, backgroundColor: '#fff' },
  titulo:               { fontSize: 20, fontWeight: 'bold', color: '#B7975B' },
  btnVolver:            { padding: 8 },
  btnVolverTexto: { color: '#fff', fontSize: 14 },
  form:                 { padding: 20, paddingBottom: 20 },
  input:                { backgroundColor: '#fff', color: '#333333', padding: 14, borderRadius: 8, marginBottom: 4, borderWidth: 1, borderColor: '#ccc', fontSize: 15 },
  inputError:           { borderColor: '#ccc', borderWidth: 2, marginBottom: 0 },
  fieldHint:            { color: '#333333', fontSize: 12, marginBottom: 8, marginLeft: 4 },
  fieldOk:              { color: '#333333', fontSize: 12, marginBottom: 8, marginLeft: 4 },
  label:                { color: '#eee', fontSize: 13, fontWeight: 'bold', marginBottom: 6, marginTop: 8 },
  estadoContenedor:     { flexDirection: 'row', gap: 10, marginTop: 4 },
  estadoBtn:            { flex: 1, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: '#ccc', alignItems: 'center' },
  estadoBtnDisponible:  { backgroundColor: '#B7975B', borderColor: '#ccc' },
  estadoBtnAgotado:     { backgroundColor: '#B7975B', borderColor: '#ccc' },
  estadoBtnTexto: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  estadoBtnTextoActivo: { color: '#333333' },
  btnGuardar:           { backgroundColor: '#B7975B', padding: 15, borderRadius: 8, alignItems: 'center' },
  btnGuardarTexto: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  footerBtn:            { padding: 20, paddingTop: 10, backgroundColor: '#fff' },
  exitoContenedor:      { backgroundColor: '#fff', padding: 14, margin: 16, borderRadius: 10, borderWidth: 1, borderColor: '#ccc' },
  exitoTexto:           { color: '#333333', fontWeight: 'bold', textAlign: 'center', fontSize: 14 },
});
