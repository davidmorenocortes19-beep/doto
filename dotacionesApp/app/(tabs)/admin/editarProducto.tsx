import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, ScrollView, Pressable, ImageBackground } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import axios from 'axios';

const BASE = 'http://192.168.40.8/doto/api';

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

  const [nombreError, setNombreError] = useState('');
  const [precioError, setPrecioError] = useState('');
  const [tallaError,  setTallaError]  = useState('');
  const [colorError,  setColorError]  = useState('');

  const [focusedField, setFocusedField] = useState<string | null>(null);

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

  const handleNombre = (text: string) => {
    setNombre(text);
    if (text.trim().length > 0 && text.trim().length < 3) {
      setNombreError('⚠ Mínimo 3 caracteres');
    } else {
      setNombreError('');
    }
  };

  const handlePrecio = (text: string) => {
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
    const limpio = text.replace(/[^a-zA-Z0-9]/g, '');
    setTalla(limpio);
    if (text !== limpio) {
      setTallaError('⚠ Solo letras y números');
    } else {
      setTallaError('');
    }
  };

  const handleColor = (text: string) => {
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
        <ActivityIndicator size="large" color="#991B1B" />
        <Text style={styles.centradoTexto}>Cargando producto...</Text>
      </View>
    );
  }

  if (errorMsg) {
    return (
      <View style={styles.centrado}>
        <Text style={styles.centradoTexto}>{errorMsg}</Text>
        <TouchableOpacity onPress={cargarProducto} style={styles.btnReintentar}>
          <Text style={styles.btnReintentarTexto}>🔄 Reintentar</Text>
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

        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.push('/admin/Productos')} style={styles.btnVolver}>
            <Text style={styles.btnVolverTexto}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.titulo}>Editar Producto</Text>
          <View style={{ width: 70 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>

            {exitoMsg ? (
              <View style={styles.exitoContenedor}>
                <Text style={styles.exitoTexto}>{exitoMsg}</Text>
              </View>
            ) : null}

            {/* NOMBRE */}
            <Text style={styles.label}>Nombre del producto</Text>
            <View
              style={[
                styles.inputOutline,
                focusedField === 'nombre' && styles.inputOutlineFocused,
                nombreError ? styles.inputOutlineError : null,
              ]}
            >
              <TextInput
                style={styles.inputField}
                placeholder="Nombre del producto"
                placeholderTextColor="#9AA5B1"
                value={nombre}
                onChangeText={handleNombre}
                onFocus={() => setFocusedField('nombre')}
                onBlur={() => setFocusedField(null)}
              />
            </View>
            {nombreError !== '' && <Text style={styles.fieldHint}>{nombreError}</Text>}
            {nombre.trim().length >= 3 && nombreError === '' && (
              <Text style={styles.fieldOk}>✅ Nombre válido</Text>
            )}

            {/* PRECIO */}
            <Text style={styles.label}>Precio</Text>
            <View
              style={[
                styles.inputOutline,
                focusedField === 'precio' && styles.inputOutlineFocused,
                precioError ? styles.inputOutlineError : null,
              ]}
            >
              <TextInput
                style={styles.inputField}
                placeholder="Precio (ej: 25000)"
                placeholderTextColor="#9AA5B1"
                value={precio}
                onChangeText={handlePrecio}
                keyboardType="decimal-pad"
                onFocus={() => setFocusedField('precio')}
                onBlur={() => setFocusedField(null)}
              />
            </View>
            {precioError !== '' && <Text style={styles.fieldHint}>{precioError}</Text>}
            {precio !== '' && !precioError && parseFloat(precio) > 0 && (
              <Text style={styles.fieldOk}>✅ Precio válido</Text>
            )}

            {/* TALLA */}
            <Text style={styles.label}>Talla</Text>
            <View
              style={[
                styles.inputOutline,
                focusedField === 'talla' && styles.inputOutlineFocused,
                tallaError ? styles.inputOutlineError : null,
              ]}
            >
              <TextInput
                style={styles.inputField}
                placeholder="Talla (ej: M, XL, 42...)"
                placeholderTextColor="#9AA5B1"
                value={talla}
                onChangeText={handleTalla}
                autoCapitalize="characters"
                onFocus={() => setFocusedField('talla')}
                onBlur={() => setFocusedField(null)}
              />
            </View>
            {tallaError !== '' && <Text style={styles.fieldHint}>{tallaError}</Text>}
            {talla !== '' && tallaError === '' && (
              <Text style={styles.fieldOk}>✅ Talla válida</Text>
            )}

            {/* COLOR */}
            <Text style={styles.label}>Color</Text>
            <View
              style={[
                styles.inputOutline,
                focusedField === 'color' && styles.inputOutlineFocused,
                colorError ? styles.inputOutlineError : null,
              ]}
            >
              <TextInput
                style={styles.inputField}
                placeholder="Color del producto"
                placeholderTextColor="#9AA5B1"
                value={color}
                onChangeText={handleColor}
                onFocus={() => setFocusedField('color')}
                onBlur={() => setFocusedField(null)}
              />
            </View>
            {colorError !== '' && <Text style={styles.fieldHint}>{colorError}</Text>}
            {color !== '' && colorError === '' && (
              <Text style={styles.fieldOk}>✅ Color válido</Text>
            )}

            {/* IMAGEN */}
            <Text style={styles.label}>Imagen</Text>
            <View
              style={[
                styles.inputOutline,
                focusedField === 'imagen' && styles.inputOutlineFocused,
              ]}
            >
              <TextInput
                style={styles.inputField}
                placeholder="URL o ruta de imagen"
                placeholderTextColor="#9AA5B1"
                value={imagen}
                onChangeText={setImagen}
                autoCapitalize="none"
                onFocus={() => setFocusedField('imagen')}
                onBlur={() => setFocusedField(null)}
              />
            </View>

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
                  activeOpacity={0.85}
                >
                  <Text style={[styles.estadoBtnTexto, estado === e && styles.estadoBtnTextoActivo]}>
                    {e}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.btnGuardar,
                guardando && { opacity: 0.6 },
                pressed && { opacity: 0.8 },
              ]}
              onPress={guardar}
              disabled={guardando}
            >
              {guardando
                ? <ActivityIndicator color="#F8FAFC" />
                : <Text style={styles.btnGuardarTexto}>💾 GUARDAR CAMBIOS</Text>
              }
            </Pressable>

          </View>
        </ScrollView>
      </View>
    </ImageBackground>
  );
}

const ACCENT = '#991B1B';
const BORDER = 'rgba(153, 27, 27, 0.25)';
const TEXT_DARK = '#0F172A';
const TEXT_GRAY = '#64748B';

const styles = StyleSheet.create({
  background: { flex: 1 },
  container: { flex: 1 },

  // Pantallas de carga / error
  centrado: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  centradoTexto: {
    color: TEXT_DARK,
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 20,
    marginTop: 10,
  },
  btnReintentar: {
    marginTop: 20,
    backgroundColor: ACCENT,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  btnReintentarTexto: {
    color: '#F8FAFC',
    fontWeight: '600',
    fontSize: 14,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.97)',
  },
  titulo: {
    fontSize: 18,
    fontWeight: '600',
    color: TEXT_DARK,
  },
  btnVolver: {
    padding: 8,
    backgroundColor: ACCENT,
    borderRadius: 8,
    width: 70,
    alignItems: 'center',
  },
  btnVolverTexto: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '600',
  },

  // Card / formulario
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'rgba(255, 255, 255, 0.97)',
    borderRadius: 16,
    paddingHorizontal: 28,
    paddingVertical: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: TEXT_GRAY,
    marginBottom: 6,
    marginLeft: 2,
  },
  inputOutline: {
    width: '100%',
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 8,
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 4,
  },
  inputOutlineFocused: {
    borderColor: ACCENT,
    borderWidth: 1.5,
    paddingHorizontal: 13.5,
    paddingVertical: 11.5,
  },
  inputOutlineError: {
    borderColor: '#DC2626',
  },
  inputField: {
    fontSize: 14,
    color: TEXT_DARK,
    padding: 0,
    outlineStyle: 'none',
  },
  fieldHint: { color: '#DC2626', fontSize: 12, marginBottom: 12, marginLeft: 4, marginTop: 4 },
  fieldOk:   { color: '#16A34A', fontSize: 12, marginBottom: 12, marginLeft: 4, marginTop: 4 },

  // Estado
  estadoContenedor: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  estadoBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  estadoBtnDisponible: {
    backgroundColor: ACCENT,
    borderColor: ACCENT,
  },
  estadoBtnAgotado: {
    backgroundColor: '#DC2626',
    borderColor: '#DC2626',
  },
  estadoBtnTexto: {
    color: TEXT_DARK,
    fontWeight: '600',
    fontSize: 14,
  },
  estadoBtnTextoActivo: {
    color: '#F8FAFC',
  },

  // Botón guardar
  btnGuardar: {
    backgroundColor: ACCENT,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 4,
  },
  btnGuardarTexto: {
    color: '#F8FAFC',
    fontWeight: '600',
    fontSize: 14,
  },

  // Éxito
  exitoContenedor: {
    backgroundColor: '#fff',
    padding: 14,
    marginBottom: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BORDER,
  },
  exitoTexto: {
    color: '#16A34A',
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 14,
  },
});