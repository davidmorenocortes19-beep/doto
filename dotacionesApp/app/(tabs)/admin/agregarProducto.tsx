import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, ScrollView, ImageBackground } from 'react-native';
import { router } from 'expo-router';
import axios from 'axios';

const API_URL = 'http://192.168.137.9/doto/api/productos.php';

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
      <View style={styles.overlay} />

      <View style={styles.container}>

        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.push('/admin/Productos')} style={styles.btnVolver}>
            <Text style={styles.btnVolverTexto}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.titulo}>Agregar Producto</Text>
          <View style={{ width: 70 }} />
        </View>

        {exitoMsg ? (
          <View style={styles.exitoContenedor}>
            <Text style={styles.exitoTexto}>{exitoMsg}</Text>
          </View>
        ) : null}

        <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">

          {/* NOMBRE */}
          <Text style={styles.label}>Nombre *</Text>
          <TextInput
            style={[styles.input, nombreError ? styles.inputError : null]}
            value={nombre}
            onChangeText={handleNombre}
            placeholderTextColor="#94A3B8"
            placeholder="Nombre del producto"
          />
          {nombreError !== '' && <Text style={styles.fieldHint}>{nombreError}</Text>}
          {nombre.trim().length >= 3 && nombreError === '' && (
            <Text style={styles.fieldOk}>✅ Nombre válido</Text>
          )}

          {/* PRECIO */}
          <Text style={styles.label}>Precio *</Text>
          <TextInput
            style={[styles.input, precioError ? styles.inputError : null]}
            value={precio}
            onChangeText={handlePrecio}
            placeholderTextColor="#94A3B8"
            placeholder="0.00"
            keyboardType="decimal-pad"
          />
          {precioError !== '' && <Text style={styles.fieldHint}>{precioError}</Text>}
          {precio !== '' && !precioError && parseFloat(precio) > 0 && (
            <Text style={styles.fieldOk}>✅ Precio válido</Text>
          )}

          {/* TALLA */}
          <Text style={styles.label}>Talla</Text>
          <TextInput
            style={[styles.input, tallaError ? styles.inputError : null]}
            value={talla}
            onChangeText={handleTalla}
            placeholderTextColor="#94A3B8"
            placeholder="XS, S, M, L, XL..."
            autoCapitalize="characters"
          />
          {tallaError !== '' && <Text style={styles.fieldHint}>{tallaError}</Text>}
          {talla !== '' && tallaError === '' && (
            <Text style={styles.fieldOk}>✅ Talla válida</Text>
          )}

          {/* COLOR */}
          <Text style={styles.label}>Color</Text>
          <TextInput
            style={[styles.input, colorError ? styles.inputError : null]}
            value={color}
            onChangeText={handleColor}
            placeholderTextColor="#94A3B8"
            placeholder="Color del producto"
          />
          {colorError !== '' && <Text style={styles.fieldHint}>{colorError}</Text>}
          {color !== '' && colorError === '' && (
            <Text style={styles.fieldOk}>✅ Color válido</Text>
          )}

          {/* IMAGEN */}
          <Text style={styles.label}>Imagen</Text>
          <TextInput
            style={styles.input}
            value={imagen}
            onChangeText={setImagen}
            placeholderTextColor="#94A3B8"
            placeholder="URL o ruta: assets/imagenes/camiseta.png"
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

          <TouchableOpacity
            style={[styles.btnGuardar, guardando && { opacity: 0.6 }]}
            onPress={guardar}
            disabled={guardando}
          >
            {guardando
              ? <ActivityIndicator color="#F8FAFC" />
              : <Text style={styles.btnGuardarTexto}>💾 Guardar producto</Text>
            }
          </TouchableOpacity>

        </ScrollView>
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
    paddingBottom: 40,
  },
  label: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 14,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 1.0)',
    color: '#0F172A',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#991B1B',
    fontSize: 14,
  },
  inputError: {
    borderColor: '#DC2626',
    borderWidth: 1.5,
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

  // Botón guardar
  btnGuardar: {
    backgroundColor: '#991B1B',
    padding: 14,
    borderRadius: 10,
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