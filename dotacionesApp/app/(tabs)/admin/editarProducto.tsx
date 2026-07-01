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
        <ActivityIndicator size="large" color="#1E293B" />
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
      <View style={styles.overlay} />

      <View style={styles.container}>

        {/* HEADER */}
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
            placeholderTextColor="#94A3B8"
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
            placeholderTextColor="#94A3B8"
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
            placeholderTextColor="#94A3B8"
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
            placeholderTextColor="#94A3B8"
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
            placeholderTextColor="#94A3B8"
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

        {/* FOOTER */}
        <View style={styles.footerBtn}>
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

      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
  },
  container: {
    flex: 1,
  },

  // Pantallas de carga / error
  centrado: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  centradoTexto: {
    color: '#0F172A',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 20,
    marginTop: 10,
  },
  btnReintentar: {
    marginTop: 20,
    backgroundColor: '#991B1B',
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
    backgroundColor: 'rgba(255, 255, 255, 1.0)',
    borderBottomWidth: 1.5,
    borderBottomColor: '#991B1B',
  },
  titulo: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
  },
  btnVolver: {
    padding: 8,
    backgroundColor: '#991B1B',
    borderRadius: 8,
    width: 70,
    alignItems: 'center',
  },
  btnVolverTexto: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '600',
  },

  // Formulario
  form: {
    padding: 20,
    paddingBottom: 20,
  },
  label: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 8,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 1.0)',
    color: '#0F172A',
    padding: 14,
    borderRadius: 10,
    marginBottom: 4,
    borderWidth: 1.5,
    borderColor: '#991B1B',
    fontSize: 15,
  },
  inputError: {
    borderColor: '#DC2626',
    borderWidth: 1.5,
    marginBottom: 0,
  },
  fieldHint: {
    color: '#DC2626',
    fontSize: 12,
    marginBottom: 8,
    marginLeft: 4,
  },
  fieldOk: {
    color: '#16A34A',
    fontSize: 12,
    marginBottom: 8,
    marginLeft: 4,
  },

  // Estado
  estadoContenedor: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  estadoBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#991B1B',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 1.0)',
  },
  estadoBtnDisponible: {
    backgroundColor: '#991B1B',
  },
  estadoBtnAgotado: {
    backgroundColor: '#DC2626',
    borderColor: '#DC2626',
  },
  estadoBtnTexto: {
    color: '#0F172A',
    fontWeight: '600',
    fontSize: 14,
  },
  estadoBtnTextoActivo: {
    color: '#F8FAFC',
  },

  // Footer botón guardar
  footerBtn: {
    padding: 20,
    paddingTop: 10,
    backgroundColor: 'rgba(255, 255, 255, 1.0)',
    borderTopWidth: 1.5,
    borderTopColor: '#991B1B',
  },
  btnGuardar: {
    backgroundColor: '#991B1B',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnGuardarTexto: {
    color: '#F8FAFC',
    fontWeight: '600',
    fontSize: 15,
  },

  // Éxito
  exitoContenedor: {
    backgroundColor: 'rgba(255, 255, 255, 1.0)',
    padding: 14,
    margin: 16,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#991B1B',
  },
  exitoTexto: {
    color: '#16A34A',
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 14,
  },
});