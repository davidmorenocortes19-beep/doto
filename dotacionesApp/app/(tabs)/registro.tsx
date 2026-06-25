import React, { useState } from 'react';
import { router } from 'expo-router';
import {
  View, TextInput, TouchableOpacity, Text,
  StyleSheet, ActivityIndicator, ImageBackground, ScrollView
} from 'react-native';
import axios from 'axios';

const API_URL = 'http://192.168.137.9/doto/api/registro.php';

const validarPassword = (pass: string): string | null => {
  if (pass.length < 8) return '⚠ Mínimo 8 caracteres';
  if (!/[A-Z]/.test(pass)) return '⚠ Debe tener al menos una mayúscula';
  if (!/[a-z]/.test(pass)) return '⚠ Debe tener al menos una minúscula';
  if (!/[0-9]/.test(pass)) return '⚠ Debe tener al menos un número';
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pass)) return '⚠ Debe tener al menos un carácter especial (!@#$...)';
  return null;
};

const validarCorreo = (correo: string): string | null => {
  if (!correo.includes('@') || !correo.includes('.')) return '⚠ Ingresa un correo válido';
  return null;
};

const validarDireccion = (direccion: string): string | null => {
  if (direccion.trim().length < 5) return '⚠ Mínimo 5 caracteres';
  return null;
};

export default function RegistroScreen() {
  const [nombre, setNombre] = useState('');
  const [nombreError, setNombreError] = useState('');
  const [documento, setDocumento] = useState('');
  const [docError, setDocError] = useState('');
  const [correo, setCorreo] = useState('');
  const [correoError, setCorreoError] = useState('');
  const [telefono, setTelefono] = useState('');
  const [telError, setTelError] = useState('');
  const [direccion, setDireccion] = useState('');
  const [dirError, setDirError] = useState('');
  const [password, setPassword] = useState('');
  const [passError, setPassError] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [rol, setRol] = useState('Cliente');
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(false);

  const roles = ['Administrador', 'Cliente', 'Vendedor', 'Bodeguero'];

  const handleNombre = (text: string) => {
    const limpio = text.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]/g, '');
    setNombre(limpio);
    if (text !== limpio) {
      setNombreError('⚠ Solo se permiten letras y espacios');
    } else if (limpio.trim().length > 0 && limpio.trim().length < 3) {
      setNombreError('⚠ Mínimo 3 caracteres');
    } else {
      setNombreError('');
    }
  };

  const handleDocumento = (text: string) => {
    const limpio = text.replace(/[^0-9]/g, '');
    setDocumento(limpio);
    if (text !== limpio) {
      setDocError('⚠ Solo se permiten números');
    } else if (limpio.length > 0 && limpio.length < 5) {
      setDocError('⚠ Mínimo 5 dígitos');
    } else {
      setDocError('');
    }
  };

  const handleCorreo = (text: string) => {
    setCorreo(text);
    if (text.length > 0) {
      setCorreoError(validarCorreo(text) ?? '');
    } else {
      setCorreoError('');
    }
  };

  const handleTelefono = (text: string) => {
    const limpio = text.replace(/[^0-9]/g, '');
    setTelefono(limpio);
    if (text !== limpio) {
      setTelError('⚠ Solo se permiten números');
    } else if (limpio.length > 0 && limpio.length < 7) {
      setTelError('⚠ Mínimo 7 dígitos');
    } else {
      setTelError('');
    }
  };

  const handleDireccion = (text: string) => {
    setDireccion(text);
    if (text.length > 0) {
      setDirError(validarDireccion(text) ?? '');
    } else {
      setDirError('');
    }
  };

  const handlePassword = (text: string) => {
    setPassword(text);
    setPassError(validarPassword(text) ?? '');
  };

  const registrar = async () => {
    if (!nombre || !documento || !correo || !telefono || !direccion || !password) {
      setMensaje('⚠ Todos los campos son obligatorios');
      return;
    }
    if (nombreError || docError || correoError || telError || dirError) {
      setMensaje('⚠ Corrige los errores antes de continuar');
      return;
    }
    const errorPass = validarPassword(password);
    if (errorPass) { setMensaje(errorPass); return; }

    try {
      setCargando(true);
      setMensaje('');
      const res = await axios.post(
        API_URL,
        { nombre, documento, correo, telefono, direccion, password, rol },
        { headers: { 'Content-Type': 'application/json' }, timeout: 5000 }
      );
      if (res.data.success) {
        setMensaje('✅ Usuario registrado correctamente');
        setTimeout(() => router.replace('/'), 1500);
      } else {
        setMensaje('❌ ' + res.data.mensaje);
      }
    } catch (error: any) {
      if (error.code === 'ECONNABORTED') {
        setMensaje('⚠ Tiempo de espera agotado. Verifica que el servidor esté activo');
      } else if (error.response) {
        setMensaje('❌ Error del servidor: ' + error.response.status + ' - ' + (error.response.data?.mensaje ?? 'Sin detalle'));
      } else if (error.request) {
        setMensaje('⚠ Sin respuesta del servidor. Verifica la IP y que Apache esté activo');
      } else {
        setMensaje('⚠ Error inesperado: ' + error.message);
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <ImageBackground
      source={require('../../assets/images/camiseta.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay} />

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.container}>
          <Text style={styles.title}>Dotaciones Toronto</Text>
          <Text style={styles.subtitle}>Crea tu cuenta aquí</Text>

          {/* NOMBRE */}
          <TextInput
            placeholder="Nombre completo" placeholderTextColor="#94A3B8"
            style={[styles.input, nombreError ? styles.inputError : null]}
            onChangeText={handleNombre} value={nombre} autoCorrect={false}
          />
          {nombreError !== '' && <Text style={styles.fieldHint}>{nombreError}</Text>}
          {nombre.trim().length >= 3 && nombreError === '' && (
            <Text style={styles.fieldOk}>✅ Nombre válido</Text>
          )}

          {/* DOCUMENTO */}
          <TextInput
            placeholder="Documento" placeholderTextColor="#94A3B8"
            style={[styles.input, docError ? styles.inputError : null]}
            keyboardType="numeric" onChangeText={handleDocumento}
            value={documento} maxLength={15}
          />
          {docError !== '' && <Text style={styles.fieldHint}>{docError}</Text>}
          {documento.length >= 5 && docError === '' && (
            <Text style={styles.fieldOk}>✅ Documento válido</Text>
          )}

          {/* CORREO */}
          <TextInput
            placeholder="Correo electrónico" placeholderTextColor="#94A3B8"
            style={[styles.input, correoError ? styles.inputError : null]}
            keyboardType="email-address"
            autoCapitalize="none" onChangeText={handleCorreo} value={correo}
          />
          {correoError !== '' && <Text style={styles.fieldHint}>{correoError}</Text>}
          {correo !== '' && correoError === '' && (
            <Text style={styles.fieldOk}>✅ Correo válido</Text>
          )}

          {/* TELÉFONO */}
          <TextInput
            placeholder="Teléfono" placeholderTextColor="#94A3B8"
            style={[styles.input, telError ? styles.inputError : null]}
            keyboardType="phone-pad" onChangeText={handleTelefono}
            value={telefono} maxLength={10}
          />
          {telError !== '' && <Text style={styles.fieldHint}>{telError}</Text>}
          {telefono.length >= 7 && telError === '' && (
            <Text style={styles.fieldOk}>✅ Teléfono válido</Text>
          )}

          {/* DIRECCIÓN */}
          <TextInput
            placeholder="Dirección" placeholderTextColor="#94A3B8"
            style={[styles.input, dirError ? styles.inputError : null]}
            onChangeText={handleDireccion} value={direccion}
          />
          {dirError !== '' && <Text style={styles.fieldHint}>{dirError}</Text>}
          {direccion.trim().length >= 5 && dirError === '' && (
            <Text style={styles.fieldOk}>✅ Dirección válida</Text>
          )}

          {/* CONTRASEÑA */}
          <View style={[styles.inputWrapper, passError ? styles.inputError : null]}>
            <TextInput
              placeholder="Contraseña" placeholderTextColor="#94A3B8"
              secureTextEntry={!mostrarPassword}
              style={styles.inputPasswordInner}
              onChangeText={handlePassword} value={password}
            />
            <TouchableOpacity
              onPress={() => setMostrarPassword(!mostrarPassword)}
              activeOpacity={0.6}
              style={styles.eyeBtn}
            >
              <Text style={{ fontSize: 18 }}>
                {mostrarPassword ? '🙈' : '👁️'}
              </Text>
            </TouchableOpacity>
          </View>
          {passError !== '' && <Text style={styles.fieldHint}>{passError}</Text>}
          {password !== '' && passError === '' && (
            <Text style={styles.fieldOk}>✅ Contraseña segura</Text>
          )}

          {/* ROL */}
          <Text style={styles.label}>Selecciona tu rol:</Text>
          <View style={styles.rolContainer}>
            {roles.map((r) => (
              <TouchableOpacity
                key={r}
                style={[styles.rolBtn, rol === r && styles.rolActivo]}
                onPress={() => setRol(r)}
              >
                <Text style={rol === r ? styles.rolTextoActivo : styles.rolTexto}>{r}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.button, cargando && { opacity: 0.7 }]}
            onPress={registrar}
            disabled={cargando}
          >
            {cargando
              ? <ActivityIndicator color="#F8FAFC" />
              : <Text style={styles.buttonText}>REGISTRAR</Text>}
          </TouchableOpacity>

          {mensaje !== '' && <Text style={styles.mensaje}>{mensaje}</Text>}

          <TouchableOpacity onPress={() => router.replace('/')}>
            <Text style={styles.linkLogin}>¿Ya tienes cuenta? Inicia sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  overlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
  },
  scroll: { flexGrow: 1 },
  container: {
    flex: 1, justifyContent: 'center', padding: 30,
    backgroundColor: 'rgba(255, 255, 255, 0)',
    margin: 16, borderRadius: 16,
    borderWidth: 1.5, borderColor: '#1E293B',
    marginTop: 50, marginBottom: 30,
  },
  title: { fontSize: 24, textAlign: 'center', marginBottom: 4, fontWeight: '700', color: '#0F172A' },
  subtitle: { fontSize: 14, textAlign: 'center', color: '#64748B', marginBottom: 24 },

  input: {
    backgroundColor: 'rgba(255, 255, 255, 1.0)',
    padding: 14, borderRadius: 10, marginBottom: 4,
    borderWidth: 1.5, borderColor: '#1E293B', fontSize: 15, color: '#0F172A',
  },
  inputError: { borderColor: '#DC2626', marginBottom: 0 },
  fieldHint: { color: '#DC2626', fontSize: 12, marginBottom: 8, marginLeft: 4 },
  fieldOk: { color: '#16A34A', fontSize: 12, marginBottom: 8, marginLeft: 4 },

  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 1.0)',
    borderRadius: 10,
    marginBottom: 4,
    borderWidth: 1.5,
    borderColor: '#1E293B',
  },
  inputPasswordInner: {
    flex: 1,
    padding: 14,
    fontSize: 15,
    color: '#0F172A',
  },
  eyeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },

  label: { marginTop: 8, marginBottom: 8, fontWeight: '600', color: '#0F172A', fontSize: 13 },
  rolContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  rolBtn: {
    flex: 1, minWidth: '45%', padding: 10, borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 1.0)',
    borderWidth: 1.5, borderColor: '#1E293B', alignItems: 'center',
  },
  rolActivo: { backgroundColor: '#1E293B' },
  rolTexto: { fontWeight: '600', color: '#0F172A', fontSize: 13 },
  rolTextoActivo: { fontWeight: '600', color: '#F8FAFC', fontSize: 13 },

  button: { backgroundColor: '#1E293B', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 6 },
  buttonText: { color: '#F8FAFC', fontWeight: '600', fontSize: 15 },

  mensaje: { marginTop: 14, textAlign: 'center', color: '#0F172A', fontSize: 13 },
  linkLogin: { marginTop: 20, textAlign: 'center', color: '#102646', textDecorationLine: 'underline', fontSize: 14, fontWeight: '600' },
});