import React, { useState } from 'react';
import { router } from 'expo-router';
import {
  View, TextInput, TouchableOpacity, Text,
  StyleSheet, ActivityIndicator, ImageBackground, ScrollView
} from 'react-native';
import axios from 'axios';

const API_URL = 'http://172.30.4.54/dotaciones-toronto-master/api/registro.php';

const validarPassword = (pass: string): string | null => {
  if (pass.length < 8) return '⚠ Mínimo 8 caracteres';
  if (!/[A-Z]/.test(pass)) return '⚠ Debe tener al menos una mayúscula';
  if (!/[a-z]/.test(pass)) return '⚠ Debe tener al menos una minúscula';
  if (!/[0-9]/.test(pass)) return '⚠ Debe tener al menos un número';
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pass)) return '⚠ Debe tener al menos un carácter especial (!@#$...)';
  return null;
};

export default function RegistroScreen() {
  const [nombre,    setNombre]    = useState('');
  const [documento, setDocumento] = useState('');
  const [correo,    setCorreo]    = useState('');
  const [telefono,  setTelefono]  = useState('');
  const [direccion, setDireccion] = useState('');
  const [password,  setPassword]  = useState('');
  const [passError, setPassError] = useState('');
  const [rol,       setRol]       = useState('Cliente');
  const [mensaje,   setMensaje]   = useState('');
  const [cargando,  setCargando]  = useState(false);

  const roles = ['Administrador', 'Cliente', 'Vendedor', 'Bodeguero'];

  const handlePassword = (text: string) => {
    setPassword(text);
    setPassError(validarPassword(text) ?? '');
  };

  const registrar = async () => {
    if (!nombre || !documento || !correo || !telefono || !direccion || !password) {
      setMensaje('⚠ Todos los campos son obligatorios');
      return;
    }
    if (!correo.includes('@') || !correo.includes('.')) {
      setMensaje('⚠ Ingresa un correo válido');
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
    } catch {
      setMensaje('⚠ Error de conexión con el servidor');
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
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.container}>
          <Text style={styles.title}>Dotaciones Toronto</Text>
          <Text style={styles.subtitle}>Crear cuenta</Text>

          <TextInput placeholder="Nombre completo" placeholderTextColor="#999"
            style={styles.input} onChangeText={setNombre} value={nombre} />
          <TextInput placeholder="Documento" placeholderTextColor="#999"
            style={styles.input} keyboardType="numeric"
            onChangeText={setDocumento} value={documento} />
          <TextInput placeholder="Correo electrónico" placeholderTextColor="#999"
            style={styles.input} keyboardType="email-address"
            autoCapitalize="none" onChangeText={setCorreo} value={correo} />
          <TextInput placeholder="Teléfono" placeholderTextColor="#999"
            style={styles.input} keyboardType="phone-pad"
            onChangeText={setTelefono} value={telefono} />
          <TextInput placeholder="Dirección" placeholderTextColor="#999"
            style={styles.input} onChangeText={setDireccion} value={direccion} />

          <TextInput
            placeholder="Contraseña"
            placeholderTextColor="#999"
            secureTextEntry
            style={[styles.input, passError ? styles.inputError : null]}
            onChangeText={handlePassword}
            value={password}
          />
          {passError !== '' && <Text style={styles.passHint}>{passError}</Text>}
          {password !== '' && passError === '' && (
            <Text style={styles.passOk}>✅ Contraseña segura</Text>
          )}

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
              ? <ActivityIndicator color="#fff" />
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
  background:     { flex: 1 },
  scroll:         { flexGrow: 1 },
  container:      { flex: 1, justifyContent: 'center', padding: 30, backgroundColor: 'rgba(9,8,13,0.75)' },
  title:          { fontSize: 26, textAlign: 'center', marginBottom: 4, fontWeight: 'bold', color: '#B7975B' },
  subtitle:       { fontSize: 15, textAlign: 'center', color: '#ccc', marginBottom: 24 },
  input:          { backgroundColor: '#fff', padding: 14, borderRadius: 8, marginBottom: 4, borderWidth: 1, borderColor: '#ccc', fontSize: 15 },
  inputError:     { borderColor: '#e74c3c', marginBottom: 0 },
  passHint:       { color: '#e74c3c', fontSize: 12, marginBottom: 8, marginLeft: 4 },
  passOk:         { color: '#2ecc71', fontSize: 12, marginBottom: 8, marginLeft: 4 },
  label:          { marginTop: 8, marginBottom: 8, fontWeight: 'bold', color: '#B7975B' },
  rolContainer:   { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  rolBtn:         { flex: 1, minWidth: '45%', padding: 10, borderRadius: 8, backgroundColor: '#ddd', alignItems: 'center' },
  rolActivo:      { backgroundColor: '#B7975B' },
  rolTexto:       { fontWeight: 'bold', color: '#333', fontSize: 13 },
  rolTextoActivo: { fontWeight: 'bold', color: '#fff', fontSize: 13 },
  button:         { backgroundColor: '#B7975B', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 6 },
  buttonText:     { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  mensaje:        { marginTop: 14, textAlign: 'center', color: '#eee', fontSize: 13 },
  linkLogin:      { marginTop: 20, textAlign: 'center', color: '#B7975B', textDecorationLine: 'underline', fontSize: 14 },
});