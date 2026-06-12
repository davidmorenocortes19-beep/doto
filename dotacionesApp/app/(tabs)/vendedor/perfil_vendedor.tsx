import React, { useState, useEffect } from 'react';
import { router } from 'expo-router';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, ImageBackground, SafeAreaView, Alert,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import axios from 'axios';
import { sesion } from '../../../constants/sesion';

const API_URL = 'http://172.30.3.242/doto/api/perfil.php';

type Vendedor = {
  id?: number;
  nombre: string;
  documento: string;
  correo: string;
  telefono: string;
  direccion: string;
};

export default function PerfilVendedor() {
  const [vendedor,       setVendedor]       = useState<Vendedor | null>(null);
  const [nuevoNombre,    setNuevoNombre]    = useState('');
  const [nuevoCorreo,    setNuevoCorreo]    = useState('');
  const [nuevoTelefono,  setNuevoTelefono]  = useState('');
  const [nuevaDireccion, setNuevaDireccion] = useState('');
  const [nuevoPassword,  setNuevoPassword]  = useState('');
  const [cargando,       setCargando]       = useState(false);
  const [mensaje,        setMensaje]        = useState('');

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    try {
      setCargando(true);
      const id = Number(sesion.id);
      if (!id || id <= 0) return;
      const res = await axios.get(`${API_URL}?id=${id}`, { timeout: 5000 });
      if (res.data.success) setVendedor(res.data.data);
    } catch {
      // sin servidor: dejar vacío
    } finally {
      setCargando(false);
    }
  };

  const guardarCambios = async () => {
    if (!nuevoNombre && !nuevoCorreo && !nuevoTelefono && !nuevaDireccion && !nuevoPassword) {
      setMensaje('⚠ Ingresa al menos un campo para actualizar');
      return;
    }

    const payload: Partial<Vendedor> & { password?: string } = { id: Number(sesion.id) };
    if (nuevoNombre)    payload.nombre    = nuevoNombre;
    if (nuevoCorreo)    payload.correo    = nuevoCorreo;
    if (nuevoTelefono)  payload.telefono  = nuevoTelefono;
    if (nuevaDireccion) payload.direccion = nuevaDireccion;
    if (nuevoPassword)  payload.password  = nuevoPassword;

    try {
      setCargando(true);
      const res = await axios.put(API_URL, payload, { timeout: 5000 });
      if (res.data.success) {
        setMensaje('✅ Perfil actualizado correctamente');
        setVendedor(prev => prev ? { ...prev, ...payload } : prev);
        if (nuevoNombre) sesion.nombre = nuevoNombre;
        if (nuevoCorreo) sesion.correo = nuevoCorreo;
        setNuevoNombre('');
        setNuevoCorreo('');
        setNuevoTelefono('');
        setNuevaDireccion('');
        setNuevoPassword('');
      } else {
        setMensaje('❌ ' + res.data.mensaje);
      }
    } catch {
      setMensaje('⚠ Error de conexión con el servidor');
    } finally {
      setCargando(false);
    }
  };

  const cerrarSesion = () => {
    Alert.alert('Cerrar sesión', '¿Estás seguro de que deseas cerrar sesión?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Cerrar sesión', style: 'destructive', onPress: () => router.replace('/') },
    ]);
  };

  return (
    <ImageBackground
      source={require('../../../assets/images/camiseta.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >

          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.replace('/vendedor/panel_vendedor')}>
              <Text style={styles.backBtn}>←</Text>
            </TouchableOpacity>
            <View style={styles.logoArea}>
              <View style={styles.logoCircle}>
                <Text style={styles.logoInitials}>DT</Text>
              </View>
              <Text style={styles.headerTitle}>Mi Perfil</Text>
            </View>
            <View style={{ width: 32 }} />
          </View>

          <ScrollView contentContainerStyle={styles.scroll}>

            {/* Avatar */}
            <View style={styles.avatarWrap}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {vendedor?.nombre
                    ? vendedor.nombre.charAt(0).toUpperCase()
                    : sesion.nombre.charAt(0).toUpperCase()}
                </Text>
              </View>
              <Text style={styles.avatarName}>{vendedor?.nombre ?? sesion.nombre}</Text>
              <View style={styles.rolBadge}>
                <Text style={styles.rolText}>{sesion.rol}</Text>
              </View>
            </View>

            {/* Información actual */}
            <View style={styles.seccion}>
              <Text style={styles.seccionTitulo}>Información Personal</Text>
              {[
                { label: 'Nombre',    valor: vendedor?.nombre },
                { label: 'Documento', valor: vendedor?.documento },
                { label: 'Correo',    valor: vendedor?.correo },
                { label: 'Teléfono',  valor: vendedor?.telefono },
                { label: 'Dirección', valor: vendedor?.direccion },
              ].map(item => (
                <View key={item.label} style={styles.infoRow}>
                  <Text style={styles.infoLabel}>{item.label}</Text>
                  <Text style={styles.infoValor}>{item.valor ?? '—'}</Text>
                </View>
              ))}
            </View>

            {/* Formulario de actualización */}
            <View style={styles.seccion}>
              <Text style={styles.seccionTitulo}>Actualizar Información</Text>
              <Text style={styles.seccionSub}>Solo llena los campos que deseas cambiar</Text>

              <TextInput style={styles.input} placeholder="Nuevo nombre"
                placeholderTextColor="#555" value={nuevoNombre}
                onChangeText={setNuevoNombre} autoCorrect={false} />

              <TextInput style={styles.input} placeholder="Nuevo correo"
                placeholderTextColor="#555" value={nuevoCorreo}
                onChangeText={setNuevoCorreo} keyboardType="email-address"
                autoCapitalize="none" />

              <TextInput style={styles.input} placeholder="Nuevo teléfono"
                placeholderTextColor="#555" value={nuevoTelefono}
                onChangeText={setNuevoTelefono} keyboardType="phone-pad" />

              <TextInput style={styles.input} placeholder="Nueva dirección"
                placeholderTextColor="#555" value={nuevaDireccion}
                onChangeText={setNuevaDireccion} />

              <TextInput style={styles.input} placeholder="Nueva contraseña"
                placeholderTextColor="#555" value={nuevoPassword}
                onChangeText={setNuevoPassword} secureTextEntry />

              {mensaje !== '' && (
                <Text style={[styles.mensaje,
                  mensaje.startsWith('✅') ? styles.mensajeOk : styles.mensajeError
                ]}>
                  {mensaje}
                </Text>
              )}

              <TouchableOpacity
                style={[styles.btnGuardar, cargando && { opacity: 0.7 }]}
                onPress={guardarCambios}
                disabled={cargando}
              >
                <Text style={styles.btnGuardarText}>Guardar Cambios</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.btnSalir} onPress={cerrarSesion}>
              <Text style={styles.btnSalirText}>Cerrar Sesión</Text>
            </TouchableOpacity>

          </ScrollView>

          {/* Bottom nav */}
          <View style={styles.bottomNav}>
            {[
              { label: 'Inicio',  icon: '🏠', route: '/vendedor/panel_vendedor' },
              { label: 'Pedidos', icon: '📋', route: '/vendedor/pedidos_vendedor' },
              { label: 'Ventas',  icon: '💰', route: '/vendedor/ver_ventas' },
              { label: 'Perfil',  icon: '👤', active: true },
              { label: 'Devol.', icon: '↩️', route: '/vendedor/devoluciones' },
            ].map(item => (
              <TouchableOpacity
                key={item.label}
                style={styles.bnav}
                onPress={() => item.route && router.push(item.route as any)}
              >
                <Text style={styles.bnavIcon}>{item.icon}</Text>
                <Text style={[styles.bnavLabel, item.active && styles.bnavActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background:     { flex: 1 },
  safeArea:       { flex: 1, backgroundColor: 'rgba(9,8,13,0.82)' },
  header:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#B7975B33', backgroundColor: 'rgba(9,8,13,0.97)' },
  backBtn:        { color: '#B7975B', fontSize: 22, paddingHorizontal: 4 },
  logoArea:       { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoCircle:     { width: 30, height: 30, borderRadius: 15, backgroundColor: '#B7975B', alignItems: 'center', justifyContent: 'center' },
  logoInitials:   { color: '#fff', fontWeight: 'bold', fontSize: 10 },
  headerTitle:    { color: '#B7975B', fontWeight: 'bold', fontSize: 15 },
  scroll:         { padding: 16, paddingBottom: 24 },
  avatarWrap:     { alignItems: 'center', marginBottom: 20 },
  avatar:         { width: 72, height: 72, borderRadius: 36, backgroundColor: '#B7975B', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  avatarText:     { color: '#fff', fontSize: 30, fontWeight: 'bold' },
  avatarName:     { color: '#eee', fontSize: 17, fontWeight: 'bold', marginBottom: 6 },
  rolBadge:       { backgroundColor: '#B7975B22', borderWidth: 1, borderColor: '#B7975B44', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 4 },
  rolText:        { color: '#B7975B', fontSize: 12, fontWeight: 'bold' },
  seccion:        { backgroundColor: '#1e1c24', borderWidth: 1, borderColor: '#B7975B33', borderRadius: 12, padding: 14, marginBottom: 14 },
  seccionTitulo:  { color: '#B7975B', fontWeight: 'bold', fontSize: 15, marginBottom: 4 },
  seccionSub:     { color: '#666', fontSize: 11, marginBottom: 12 },
  infoRow:        { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#ffffff08' },
  infoLabel:      { color: '#888', fontSize: 13 },
  infoValor:      { color: '#eee', fontSize: 13, fontWeight: '500', maxWidth: '60%', textAlign: 'right' },
  input:          { backgroundColor: '#0e0d12', borderWidth: 1, borderColor: '#B7975B33', color: '#eee', borderRadius: 8, padding: 11, fontSize: 13, marginBottom: 10 },
  mensaje:        { fontSize: 12, marginBottom: 10, textAlign: 'center' },
  mensajeOk:      { color: '#2ecc71' },
  mensajeError:   { color: '#e74c3c' },
  btnGuardar:     { backgroundColor: '#B7975B', padding: 13, borderRadius: 8, alignItems: 'center', marginTop: 4 },
  btnGuardarText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  btnSalir:       { backgroundColor: '#e74c3c22', borderWidth: 1, borderColor: '#e74c3c44', padding: 13, borderRadius: 8, alignItems: 'center', marginBottom: 8 },
  btnSalirText:   { color: '#e74c3c', fontWeight: 'bold', fontSize: 14 },
  bottomNav:      { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#B7975B22', backgroundColor: 'rgba(9,8,13,0.98)' },
  bnav:           { alignItems: 'center', gap: 2 },
  bnavIcon:       { fontSize: 18 },
  bnavLabel:      { fontSize: 9, color: '#666' },
  bnavActive:     { color: '#B7975B' },
});