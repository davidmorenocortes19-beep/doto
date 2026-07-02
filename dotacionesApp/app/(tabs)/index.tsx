import React, { useState, useCallback } from 'react';
import { router, useFocusEffect } from 'expo-router';
import {
  TextInput, TouchableOpacity, Text, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, ImageBackground, View, ScrollView,
} from 'react-native';
import axios, { isAxiosError } from 'axios';
import { sesion } from '../../constants/sesion';

const API_URL = 'http://192.168.40.8/doto/api/login.php';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(false);
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [focusUser, setFocusUser] = useState(false);
  const [focusPass, setFocusPass] = useState(false);

  // Limpia el mensaje cada vez que la pantalla vuelve a tener foco
  // (por ejemplo, al volver aquí después de cerrar sesión)
  useFocusEffect(
    useCallback(() => {
      setMensaje('');
    }, [])
  );

  const login = async () => {
    if (!username || !password) {
      setMensaje('Todos los campos son obligatorios');
      return;
    }
    try {
      setCargando(true);
      setMensaje('');
      const res = await axios.post(
        API_URL,
        { username: username.trim(), password: password.trim() },
        { headers: { 'Content-Type': 'application/json' }, timeout: 5000 }
      );

      if (res.data?.success === true) {
        const { nombre, rol, correo, id } = res.data.usuario;

        sesion.nombre = nombre;
        sesion.rol = rol;
        sesion.correo = correo;
        sesion.id = Number(id);

        const rol_lower = res.data.rol?.toLowerCase();

        if (rol_lower === 'administrador') router.replace('/admin/panel_admin');
        else if (rol_lower === 'bodeguero') router.replace('/bodeguero/panel_bodeguero');
        else if (rol_lower === 'vendedor') router.replace('/vendedor/panel_vendedor');
        else if (rol_lower === 'cliente') router.replace('/cliente/panel_cliente');
      } else if (res.data?.mensaje?.toLowerCase().includes('inhabilitado')) {
        setMensaje('Error de inicio de sesión: este usuario ha sido inhabilitado');
      } else {
        setMensaje(res.data?.mensaje || 'Credenciales incorrectas');
      }
    } catch (error) {
      if (isAxiosError(error) && error.request) {
        setMensaje('No hay conexion con el servidor');
      } else {
        setMensaje('Error inesperado');
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
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            <Text style={styles.title}>Dotaciones Toronto</Text>
            <Text style={styles.subtitle}>Inicia sesion para continuar</Text>

            {/* Campo Correo */}
            <Text style={styles.label}>Correo electronico</Text>
            <View
              style={[
                styles.inputOutline,
                focusUser && styles.inputOutlineFocused,
              ]}
            >
              <TextInput
                style={styles.inputField}
                placeholder="tu@correo.com"
                placeholderTextColor="#9AA5B1"
                onChangeText={setUsername}
                value={username}
                autoCapitalize="none"
                keyboardType="email-address"
                onFocus={() => setFocusUser(true)}
                onBlur={() => setFocusUser(false)}
              />
            </View>

            {/* Campo Contraseña */}
            <Text style={styles.label}>Contrasena</Text>
            <View
              style={[
                styles.inputOutline,
                focusPass && styles.inputOutlineFocused,
              ]}
            >
              <View style={styles.passwordRow}>
                <TextInput
                  style={[styles.inputField, styles.passwordField]}
                  placeholder="••••••••"
                  placeholderTextColor="#9AA5B1"
                  secureTextEntry={!mostrarPassword}
                  onChangeText={setPassword}
                  value={password}
                  onFocus={() => setFocusPass(true)}
                  onBlur={() => setFocusPass(false)}
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

            {mensaje !== '' && <Text style={styles.mensaje}>{mensaje}</Text>}

            {/* Fila inferior: link a la izquierda, boton a la derecha */}
            <View style={styles.bottomRow}>
              <TouchableOpacity onPress={() => router.replace('/registro')}>
                <Text style={styles.link}>Registrate</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, cargando && { opacity: 0.7 }]}
                onPress={login}
                disabled={cargando}
                activeOpacity={0.85}
              >
                {cargando
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.buttonText}>INGRESAR</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  container: {
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
    marginBottom: 16,
  },
  inputOutlineFocused: {
    borderColor: ACCENT,
    borderWidth: 1.5,
    paddingHorizontal: 13.5,
    paddingVertical: 11.5,
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
  mensaje: {
    fontSize: 13,
    color: '#d93025',
    marginBottom: 12,
    textAlign: 'center',
  },
  bottomRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  link: {
    color: TEXT_GRAY,
    fontSize: 13,
    textDecorationLine: 'underline',
  },
  button: {
    backgroundColor: ACCENT,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 110,
  },
  buttonText: {
    color: '#F8FAFC',
    fontWeight: '600',
    fontSize: 14,
  },
});