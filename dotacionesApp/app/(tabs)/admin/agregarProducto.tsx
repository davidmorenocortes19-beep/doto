import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, ScrollView, ImageBackground } from 'react-native';
import { router } from 'expo-router';
import axios from 'axios';

const API_URL = 'http://192.168.1.19/doto/api/productos.php';

export default function AgregarProductoScreen() {
  const [nombre, setNombre] = useState('');
  const [precio, setPrecio] = useState('');
  const [talla, setTalla] = useState('');
  const [color, setColor] = useState('');
  const [imagen, setImagen] = useState('');
  const [estado, setEstado] = useState<'Disponible' | 'Agotado'>('Disponible');
  const [guardando, setGuardando] = useState(false);
  const [exitoMsg, setExitoMsg] = useState('');

  const [nombreError, setNombreError] = useState('');
  const [precioError, setPrecioError] = useState('');
  const [tallaError, setTallaError] = useState('');
  const [colorError, setColorError] = useState('');

  const [focusedField, setFocusedField] = useState<string | null>(null);

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
      const res = await axios.post(API_URL, {
        nombre,
        precio: parseFloat(precio),
        talla,
        color,
        imagen,
        estado,
      }, { timeout: 5000 });

      if (res.data.mensaje) {
        setExitoMsg('✅ Producto agregado correctamente');
        setTimeout(() => { setExitoMsg(''); router.push('/admin/Productos'); }, 2000);
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
          <Text style={styles.titulo}>Agregar Producto</Text>
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
            <Text style={styles.label}>Nombre *</Text>
            <View
              style={[
                styles.inputOutline,
                focusedField === 'nombre' && styles.inputOutlineFocused,
                nombreError ? styles.inputOutlineError : null,
              ]}
            >
              <TextInput
                style={styles.inputField}
                value={nombre}
                onChangeText={handleNombre}
                placeholderTextColor="#9AA5B1"
                placeholder="Nombre del producto"
                onFocus={() => setFocusedField('nombre')}
                onBlur={() => setFocusedField(null)}
              />
            </View>
            {nombreError !== '' && <Text style={styles.fieldHint}>{nombreError}</Text>}
            {nombre.trim().length >= 3 && nombreError === '' && (
              <Text style={styles.fieldOk}>✅ Nombre válido</Text>
            )}

            {/* PRECIO */}
            <Text style={styles.label}>Precio *</Text>
            <View
              style={[
                styles.inputOutline,
                focusedField === 'precio' && styles.inputOutlineFocused,
                precioError ? styles.inputOutlineError : null,
              ]}
            >
              <TextInput
                style={styles.inputField}
                value={precio}
                onChangeText={handlePrecio}
                placeholderTextColor="#9AA5B1"
                placeholder="0.00"
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
                value={talla}
                onChangeText={handleTalla}
                placeholderTextColor="#9AA5B1"
                placeholder="XS, S, M, L, XL..."
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
                value={color}
                onChangeText={handleColor}
                placeholderTextColor="#9AA5B1"
                placeholder="Color del producto"
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
                value={imagen}
                onChangeText={setImagen}
                placeholderTextColor="#9AA5B1"
                placeholder="URL o ruta: assets/imagenes/camiseta.png"
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

            <TouchableOpacity
              style={[styles.btnGuardar, guardando && { opacity: 0.6 }]}
              onPress={guardar}
              disabled={guardando}
              activeOpacity={0.85}
            >
              {guardando
                ? <ActivityIndicator color="#F8FAFC" />
                : <Text style={styles.btnGuardarTexto}>💾 Guardar producto</Text>
              }
            </TouchableOpacity>

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
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
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
    marginTop: 14,
  },
  inputOutline: {
    width: '100%',
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 8,
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 12,
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
  fieldHint: {
    color: '#DC2626',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  fieldOk: {
    color: '#16A34A',
    fontSize: 12,
    marginTop: 4,
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
    marginTop: 30,
  },
  btnGuardarTexto: {
    color: '#F8FAFC',
    fontWeight: '600',
    fontSize: 16,
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