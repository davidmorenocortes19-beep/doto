import React, { useState } from 'react';
import { router } from 'expo-router';
import {
  TextInput, TouchableOpacity, Text, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, ImageBackground,
} from 'react-native';
import axios, { isAxiosError } from 'axios';
import { sesion } from '../../constants/sesion';

const API_URL = 'http://172.30.3.242/dota/api/login.php';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [mensaje,  setMensaje]  = useState('');
  const [cargando, setCargando] = useState(false);

  const login = async () => {
    if (!username || !password) {
      setMensaje('⚠ Todos los campos son obligatorios');
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

        // ✅ Guardar en variable global
        sesion.nombre = nombre;
        sesion.rol    = rol;
        sesion.correo = correo;
        sesion.id     = id;

        const rol_lower = res.data.rol?.toLowerCase();

        if (rol_lower === 'administrador') router.replace('/admin/panel_admin');
        else if (rol_lower === 'bodeguero') router.replace('/bodeguero/panel_bodeguero');
        else if (rol_lower === 'vendedor')  router.replace('/vendedor/panel_vendedor');
        else if (rol_lower === 'cliente')   router.replace('/cliente/panel_cliente');
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
  background: { flex: 1 },
  container:  { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: 'rgba(9,8,13,0.75)' },
  title:      { fontSize: 26, marginBottom: 4, textAlign: 'center', fontWeight: 'bold', color: '#B7975B' },
  subtitle:   { fontSize: 14, textAlign: 'center', color: '#ccc', marginBottom: 28 },
  input:      { backgroundColor: '#fff', padding: 14, borderRadius: 8, marginBottom: 15, borderWidth: 1, borderColor: '#ccc', fontSize: 16 },
  button:     { backgroundColor: '#B7975B', padding: 15, borderRadius: 8, marginTop: 10, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  link:       { marginTop: 20, textAlign: 'center', color: '#B7975B', fontSize: 14, textDecorationLine: 'underline' },
  mensaje:    { marginTop: 20, textAlign: 'center', fontSize: 14, color: '#eee' },
});