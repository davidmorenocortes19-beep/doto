import React, { useState } from 'react';
import { router } from 'expo-router';
import {
  View, TextInput, TouchableOpacity, Text,
  StyleSheet, ActivityIndicator, ImageBackground, ScrollView
} from 'react-native';
import axios from 'axios';

const API_URL = 'http://192.168.40.8/doto/api/registro.php';

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
  const [focusedField, setFocusedField] = useState<string | null>(null);

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
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <Text style={styles.title}>Dotaciones Toronto</Text>
          <Text style={styles.subtitle}>Crea tu cuenta aquí</Text>

          {/* NOMBRE */}
          <Text style={styles.label}>Nombre completo</Text>
          <View
            style={[
              styles.inputOutline,
              focusedField === 'nombre' && styles.inputOutlineFocused,
              nombreError ? styles.inputOutlineError : null,
            ]}
          >
            <TextInput
              style={styles.inputField}
              placeholder="Nombre completo"
              placeholderTextColor="#9AA5B1"
              onChangeText={handleNombre}
              value={nombre}
              autoCorrect={false}
              onFocus={() => setFocusedField('nombre')}
              onBlur={() => setFocusedField(null)}
            />
          </View>
          {nombreError !== '' && <Text style={styles.fieldHint}>{nombreError}</Text>}
          {nombre.trim().length >= 3 && nombreError === '' && (
            <Text style={styles.fieldOk}>✅ Nombre válido</Text>
          )}

          {/* DOCUMENTO */}
          <Text style={styles.label}>Documento</Text>
          <View
            style={[
              styles.inputOutline,
              focusedField === 'documento' && styles.inputOutlineFocused,
              docError ? styles.inputOutlineError : null,
            ]}
          >
            <TextInput
              style={styles.inputField}
              placeholder="Documento"
              placeholderTextColor="#9AA5B1"
              keyboardType="numeric"
              onChangeText={handleDocumento}
              value={documento}
              maxLength={15}
              onFocus={() => setFocusedField('documento')}
              onBlur={() => setFocusedField(null)}
            />
          </View>
          {docError !== '' && <Text style={styles.fieldHint}>{docError}</Text>}
          {documento.length >= 5 && docError === '' && (
            <Text style={styles.fieldOk}>✅ Documento válido</Text>
          )}

          {/* CORREO */}
          <Text style={styles.label}>Correo electrónico</Text>
          <View
            style={[
              styles.inputOutline,
              focusedField === 'correo' && styles.inputOutlineFocused,
              correoError ? styles.inputOutlineError : null,
            ]}
          >
            <TextInput
              style={styles.inputField}
              placeholder="tu@correo.com"
              placeholderTextColor="#9AA5B1"
              keyboardType="email-address"
              autoCapitalize="none"
              onChangeText={handleCorreo}
              value={correo}
              onFocus={() => setFocusedField('correo')}
              onBlur={() => setFocusedField(null)}
            />
          </View>
          {correoError !== '' && <Text style={styles.fieldHint}>{correoError}</Text>}
          {correo !== '' && correoError === '' && (
            <Text style={styles.fieldOk}>✅ Correo válido</Text>
          )}

          {/* TELÉFONO */}
          <Text style={styles.label}>Teléfono</Text>
          <View
            style={[
              styles.inputOutline,
              focusedField === 'telefono' && styles.inputOutlineFocused,
              telError ? styles.inputOutlineError : null,
            ]}
          >
            <TextInput
              style={styles.inputField}
              placeholder="Teléfono"
              placeholderTextColor="#9AA5B1"
              keyboardType="phone-pad"
              onChangeText={handleTelefono}
              value={telefono}
              maxLength={10}
              onFocus={() => setFocusedField('telefono')}
              onBlur={() => setFocusedField(null)}
            />
          </View>
          {telError !== '' && <Text style={styles.fieldHint}>{telError}</Text>}
          {telefono.length >= 7 && telError === '' && (
            <Text style={styles.fieldOk}>✅ Teléfono válido</Text>
          )}

          {/* DIRECCIÓN */}
          <Text style={styles.label}>Dirección</Text>
          <View
            style={[
              styles.inputOutline,
              focusedField === 'direccion' && styles.inputOutlineFocused,
              dirError ? styles.inputOutlineError : null,
            ]}
          >
            <TextInput
              style={styles.inputField}
              placeholder="Dirección"
              placeholderTextColor="#9AA5B1"
              onChangeText={handleDireccion}
              value={direccion}
              onFocus={() => setFocusedField('direccion')}
              onBlur={() => setFocusedField(null)}
            />
          </View>
          {dirError !== '' && <Text style={styles.fieldHint}>{dirError}</Text>}
          {direccion.trim().length >= 5 && dirError === '' && (
            <Text style={styles.fieldOk}>✅ Dirección válida</Text>
          )}

          {/* CONTRASEÑA */}
          <Text style={styles.label}>Contraseña</Text>
          <View
            style={[
              styles.inputOutline,
              focusedField === 'password' && styles.inputOutlineFocused,
              passError ? styles.inputOutlineError : null,
            ]}
          >
            <View style={styles.passwordRow}>
              <TextInput
                style={[styles.inputField, styles.passwordField]}
                placeholder="••••••••"
                placeholderTextColor="#9AA5B1"
                secureTextEntry={!mostrarPassword}
                onChangeText={handlePassword}
                value={password}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
              />
              <TouchableOpacity
                onPress={() => setMostrarPassword(!mostrarPassword)}
                activeOpacity={0.6}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.eyeIcon}>
                  {mostrarPassword ? 'Ocultar' : 'Ver'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          {passError !== '' && <Text style={styles.fieldHint}>{passError}</Text>}
          {password !== '' && passError === '' && (
            <Text style={styles.fieldOk}>✅ Contraseña segura</Text>
          )}

          {/* ROL */}
          <Text style={styles.label}>Selecciona tu rol</Text>
          <View style={styles.rolContainer}>
            {roles.map((r) => (
              <TouchableOpacity
                key={r}
                style={[styles.rolBtn, rol === r && styles.rolActivo]}
                onPress={() => setRol(r)}
                activeOpacity={0.85}
              >
                <Text style={rol === r ? styles.rolTextoActivo : styles.rolTexto}>{r}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.button, cargando && { opacity: 0.7 }]}
            onPress={registrar}
            disabled={cargando}
            activeOpacity={0.85}
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

const ACCENT = '#1E293B';
const BORDER = 'rgba(100, 116, 139, 0.25)';
const TEXT_DARK = '#0F172A';
const TEXT_GRAY = '#64748B';

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'rgba(255, 255, 255, 0.97)',
    borderRadius: 16,
    paddingHorizontal: 28,
    paddingVertical: 32,
    marginVertical: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: TEXT_DARK,
    textAlign: 'center',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 13,
    color: TEXT_GRAY,
    textAlign: 'center',
    marginBottom: 24,
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
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordField: {
    flex: 1,
  },
  eyeIcon: {
    fontSize: 12,
    color: TEXT_GRAY,
    fontWeight: '500',
    paddingLeft: 8,
  },
  fieldHint: { color: '#DC2626', fontSize: 12, marginBottom: 12, marginLeft: 4, marginTop: 4 },
  fieldOk: { color: '#16A34A', fontSize: 12, marginBottom: 12, marginLeft: 4, marginTop: 4 },

  rolContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  rolBtn: {
    flex: 1, minWidth: '45%', padding: 10, borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1, borderColor: BORDER, alignItems: 'center',
  },
  rolActivo: { backgroundColor: ACCENT, borderColor: ACCENT },
  rolTexto: { fontWeight: '600', color: TEXT_DARK, fontSize: 13 },
  rolTextoActivo: { fontWeight: '600', color: '#F8FAFC', fontSize: 13 },

  button: {
    backgroundColor: ACCENT,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonText: { color: '#F8FAFC', fontWeight: '600', fontSize: 14 },

  mensaje: { marginTop: 14, textAlign: 'center', color: TEXT_DARK, fontSize: 13 },
  linkLogin: {
    marginTop: 20,
    textAlign: 'center',
    color: TEXT_GRAY,
    textDecorationLine: 'underline',
    fontSize: 13,
  },
});