import React, { useState } from 'react';
import { router } from 'expo-router';
import {
  TextInput, TouchableOpacity, Text, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, ImageBackground,
} from 'react-native';
import axios, { isAxiosError } from 'axios';
import { sesion } from '../../constants/sesion';

const API_URL = 'http://192.168.1.19/doto/api/login.php';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(false);

  const login = async () => {
    if (!username || !password) {
      setMensaje('? Todos los campos son obligatorios');
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
        setMensaje('✅ Login correcto');

        const { nombre, rol, correo, id } = res.data.usuario;

        // id guardado como número
        sesion.nombre = nombre;
        sesion.rol = rol;
        sesion.correo = correo;
        sesion.id = Number(id);

        const rol_lower = res.data.rol?.toLowerCase();

        if (rol_lower === 'administrador') router.replace('/admin/panel_admin');
        else if (rol_lower === 'bodeguero') router.replace('/bodeguero/panel_bodeguero');
        else if (rol_lower === 'vendedor') router.replace('/vendedor/panel_vendedor');
        else if (rol_lower === 'cliente') router.replace('/cliente/panel_cliente');
      } else {
        setMensaje('❌ ' + (res.data?.mensaje || 'Credenciales incorrectas'));
      }
    } catch (error) {
      if (isAxiosError(error) && error.request) {
        setMensaje('⚠ No hay conexión con el servidor');
      } else {
        setMensaje('⚠ Error inesperado');
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
        <Text style={styles.title}>Dotaciones Toronto</Text>
        <Text style={styles.subtitle}>Inicia sesión para continuar</Text>

        <TextInput
          placeholder="Correo electrónico"
          placeholderTextColor="#999"
          style={styles.input}
          onChangeText={setUsername}
          value={username}
          autoCapitalize="none"
        />
        <TextInput
          placeholder="Contraseña"
          placeholderTextColor="#999"
          secureTextEntry
          style={styles.input}
          onChangeText={setPassword}
          value={password}
        />

        <TouchableOpacity
          style={[styles.button, cargando && { opacity: 0.7 }]}
          onPress={login}
          disabled={cargando}
        >
          {cargando
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.buttonText}>INGRESAR</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.replace('/registro')}>
          <Text style={styles.link}>¿No tienes cuenta? Regístrate</Text>
        </TouchableOpacity>

        {mensaje !== '' && <Text style={styles.mensaje}>{mensaje}</Text>}
      </KeyboardAvoidingView>
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
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 1.0)',
    borderRadius: 16,
    borderWidth: 3.0,
    borderColor: '#1E293B',
    padding: 24,
    alignItems: 'center',
  },
  badge: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 4,
    marginBottom: 14,
  },
  badgeText: {
    color: '#F8FAFC',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.5,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFFC4',
    textAlign: 'center',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
  },
  input: {
    width: '100%',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 8,
    marginBottom: 14,
    borderWidth: 0.5,
    borderColor: 'rgba(100, 116, 139, 0.25)',
    color: '#0F172A',
    fontSize: 15,
  },
  button: {
    width: '100%',
    backgroundColor: '#1E293B',
    padding: 15,
    borderRadius: 8,
    marginTop: 6,
    alignItems: 'center',
  },
  buttonText: {
    color: '#F8FAFC',
    fontWeight: '600',
    fontSize: 15,
  },
  link: {
    marginTop: 18,
    textAlign: 'center',
    color: '#647791',
    fontSize: 13,
    textDecorationLine: 'underline',
  },
  mensaje: {
    marginTop: 16,
    textAlign: 'center',
    fontSize: 13,
    color: '#0F172A',
  },
  
});

