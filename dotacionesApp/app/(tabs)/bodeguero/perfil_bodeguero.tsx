import React, { useState, useEffect } from 'react';
import { router } from 'expo-router';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, ImageBackground, SafeAreaView, Alert,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import axios from 'axios';
import { sesion } from '../../../constants/sesion';

const API_URL = 'http://192.168.40.8/doto/api/perfil.php';

type Bodeguero = {
  id?: number;
  nombre: string;
  documento: string;
  correo: string;
  telefono: string;
  direccion: string;
};

const validarPassword = (pass: string): string | null => {
  if (pass.length < 8) return '? M�nimo 8 caracteres';
  if (!/[A-Z]/.test(pass)) return '? Debe tener al menos una may�scula';
  if (!/[a-z]/.test(pass)) return '? Debe tener al menos una min�scula';
  if (!/[0-9]/.test(pass)) return '? Debe tener al menos un n�mero';
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pass)) return '? Debe tener al menos un car�cter especial (!@#$...)';
  return null;
};

const validarCorreo = (correo: string): string | null => {
  if (!correo.includes('@') || !correo.includes('.')) return '? Ingresa un correo v�lido';
  return null;
};

const validarDireccion = (direccion: string): string | null => {
  if (direccion.trim().length < 5) return '? M�nimo 5 caracteres';
  return null;
};

export default function PerfilBodeguero() {
  const [bodeguero, setBodeguero] = useState<Bodeguero | null>(null);
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nombreError, setNombreError] = useState('');
  const [nuevoCorreo, setNuevoCorreo] = useState('');
  const [correoError, setCorreoError] = useState('');
  const [nuevoTelefono, setNuevoTelefono] = useState('');
  const [telError, setTelError] = useState('');
  const [nuevaDireccion, setNuevaDireccion] = useState('');
  const [dirError, setDirError] = useState('');
  const [nuevoPassword, setNuevoPassword] = useState('');
  const [passError, setPassError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState('');

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    try {
      setCargando(true);
      const id = Number(sesion.id);
      if (!id || id <= 0) return;
      const res = await axios.get(`${API_URL}?id=${id}`, { timeout: 5000 });
      if (res.data.success) setBodeguero(res.data.data);
    } catch {
      // sin servidor
    } finally {
      setCargando(false);
    }
  };

  // -- VALIDACIONES EN TIEMPO REAL -----------------------------------

  const handleNombre = (text: string) => {
    const limpio = text.replace(/[^a-zA-Z��������������\s]/g, '');
    setNuevoNombre(limpio);
    if (text !== limpio) {
      setNombreError('? Solo se permiten letras y espacios');
    } else if (limpio.trim().length > 0 && limpio.trim().length < 3) {
      setNombreError('? M�nimo 3 caracteres');
    } else {
      setNombreError('');
    }
  };

  const handleCorreo = (text: string) => {
    setNuevoCorreo(text);
    if (text.length > 0) {
      setCorreoError(validarCorreo(text) ?? '');
    } else {
      setCorreoError('');
    }
  };

  const handleTelefono = (text: string) => {
    const limpio = text.replace(/[^0-9]/g, '');
    setNuevoTelefono(limpio);
    if (text !== limpio) {
      setTelError('? Solo se permiten n�meros');
    } else if (limpio.length > 0 && limpio.length < 7) {
      setTelError('? M�nimo 7 d�gitos');
    } else {
      setTelError('');
    }
  };

  const handleDireccion = (text: string) => {
    setNuevaDireccion(text);
    if (text.length > 0) {
      setDirError(validarDireccion(text) ?? '');
    } else {
      setDirError('');
    }
  };

  const handlePassword = (text: string) => {
    setNuevoPassword(text);
    if (text.length > 0) {
      setPassError(validarPassword(text) ?? '');
    } else {
      setPassError('');
    }
  };

  const guardarCambios = async () => {
    if (!nuevoNombre && !nuevoCorreo && !nuevoTelefono && !nuevaDireccion && !nuevoPassword) {
      setMensaje('? Ingresa al menos un campo para actualizar');
      return;
    }

    if (nombreError || correoError || telError || dirError || passError) {
      setMensaje('? Corrige los errores antes de continuar');
      return;
    }

    const payload: Partial<Bodeguero> & { password?: string } = { id: Number(sesion.id) };
    if (nuevoNombre) payload.nombre = nuevoNombre;
    if (nuevoCorreo) payload.correo = nuevoCorreo;
    if (nuevoTelefono) payload.telefono = nuevoTelefono;
    if (nuevaDireccion) payload.direccion = nuevaDireccion;
    if (nuevoPassword) payload.password = nuevoPassword;

    try {
      setCargando(true);
      const res = await axios.put(API_URL, payload, { timeout: 5000 });
      if (res.data.success) {
        setMensaje('? Perfil actualizado correctamente');
        setBodeguero(prev => prev ? { ...prev, ...payload } : prev);
        if (nuevoNombre) sesion.nombre = nuevoNombre;
        if (nuevoCorreo) sesion.correo = nuevoCorreo;
        setNuevoNombre(''); setNuevoCorreo('');
        setNuevoTelefono(''); setNuevaDireccion('');
        setNuevoPassword('');
        setNombreError(''); setCorreoError('');
        setTelError(''); setDirError(''); setPassError('');
      } else {
        setMensaje('? ' + res.data.mensaje);
      }
    } catch {
      setMensaje('? Error de conexi�n con el servidor');
    } finally {
      setCargando(false);
    }
  };

  const cerrarSesion = () => {
    Alert.alert('Cerrar sesi�n', '�Est�s seguro de que deseas cerrar sesi�n?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Cerrar sesi�n', style: 'destructive', onPress: () => router.replace('/') },
    ]);
  };

  const hayErrores = !!(nombreError || correoError || telError || dirError || passError);

  return (
    <ImageBackground
      source={require('../../../assets/images/camiseta.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay} />

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >

          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.replace('/bodeguero/panel_bodeguero')}
              style={styles.btnVolver}
            >
              <Text style={styles.btnVolverTexto}>?</Text>
            </TouchableOpacity>
            <View style={styles.logoArea}>
              <View style={styles.logoCircle}>
                <Text style={styles.logoInitials}>DT</Text>
              </View>
              <Text style={styles.headerTitle}>Mi Perfil</Text>
            </View>
            <View style={{ width: 44 }} />
          </View>

          <ScrollView contentContainerStyle={styles.scroll}>

            {/* Avatar */}
            <View style={styles.avatarWrap}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {bodeguero?.nombre
                    ? bodeguero.nombre.charAt(0).toUpperCase()
                    : sesion.nombre.charAt(0).toUpperCase()}
                </Text>
              </View>
              <Text style={styles.avatarName}>{bodeguero?.nombre ?? sesion.nombre}</Text>
              <View style={styles.rolBadge}>
                <Text style={styles.rolText}>{sesion.rol}</Text>
              </View>
            </View>

            {/* Informaci�n actual */}
            <View style={styles.seccion}>
              <Text style={styles.seccionTitulo}>Informaci�n Personal</Text>
              {[
                { label: 'Nombre', valor: bodeguero?.nombre },
                { label: 'Documento', valor: bodeguero?.documento },
                { label: 'Correo', valor: bodeguero?.correo },
                { label: 'Tel�fono', valor: bodeguero?.telefono },
                { label: 'Direcci�n', valor: bodeguero?.direccion },
              ].map(item => (
                <View key={item.label} style={styles.infoRow}>
                  <Text style={styles.infoLabel}>{item.label}</Text>
                  <Text style={styles.infoValor}>{item.valor ?? '�'}</Text>
                </View>
              ))}
            </View>

            {/* Formulario de actualizaci�n */}
            <View style={styles.seccion}>
              <Text style={styles.seccionTitulo}>Actualizar Informaci�n</Text>
              <Text style={styles.seccionSub}>Solo llena los campos que deseas cambiar</Text>

              {/* NOMBRE */}
              <TextInput
                style={[styles.input, nombreError ? styles.inputError : null]}
                placeholder="Nuevo nombre" placeholderTextColor="#94A3B8"
                value={nuevoNombre} onChangeText={handleNombre} autoCorrect={false}
              />
              {nombreError !== '' && <Text style={styles.fieldHint}>{nombreError}</Text>}
              {nuevoNombre.trim().length >= 3 && nombreError === '' && (
                <Text style={styles.fieldOk}>? Nombre v�lido</Text>
              )}

              {/* CORREO */}
              <TextInput
                style={[styles.input, correoError ? styles.inputError : null]}
                placeholder="Nuevo correo" placeholderTextColor="#94A3B8"
                value={nuevoCorreo} onChangeText={handleCorreo}
                keyboardType="email-address" autoCapitalize="none"
              />
              {correoError !== '' && <Text style={styles.fieldHint}>{correoError}</Text>}
              {nuevoCorreo !== '' && correoError === '' && (
                <Text style={styles.fieldOk}>? Correo v�lido</Text>
              )}

              {/* TEL�FONO */}
              <TextInput
                style={[styles.input, telError ? styles.inputError : null]}
                placeholder="Nuevo tel�fono" placeholderTextColor="#94A3B8"
                value={nuevoTelefono} onChangeText={handleTelefono}
                keyboardType="phone-pad" maxLength={10}
              />
              {telError !== '' && <Text style={styles.fieldHint}>{telError}</Text>}
              {nuevoTelefono.length >= 7 && telError === '' && (
                <Text style={styles.fieldOk}>? Tel�fono v�lido</Text>
              )}

              {/* DIRECCI�N */}
              <TextInput
                style={[styles.input, dirError ? styles.inputError : null]}
                placeholder="Nueva direcci�n" placeholderTextColor="#94A3B8"
                value={nuevaDireccion} onChangeText={handleDireccion}
              />
              {dirError !== '' && <Text style={styles.fieldHint}>{dirError}</Text>}
              {nuevaDireccion.trim().length >= 5 && dirError === '' && (
                <Text style={styles.fieldOk}>? Direcci�n v�lida</Text>
              )}

              {/* CONTRASE�A */}
              <TextInput
                style={[styles.input, passError ? styles.inputError : null]}
                placeholder="Nueva contrase�a" placeholderTextColor="#94A3B8"
                value={nuevoPassword} onChangeText={handlePassword}
                secureTextEntry
              />
              {passError !== '' && <Text style={styles.fieldHint}>{passError}</Text>}
              {nuevoPassword !== '' && passError === '' && (
                <Text style={styles.fieldOk}>? Contrase�a segura</Text>
              )}

              {mensaje !== '' && (
                <Text style={[styles.mensaje,
                mensaje.startsWith('?') ? styles.mensajeOk : styles.mensajeError
                ]}>
                  {mensaje}
                </Text>
              )}

              <TouchableOpacity
                style={[styles.btnGuardar, (cargando || hayErrores) && { opacity: 0.7 }]}
                onPress={guardarCambios}
                disabled={cargando || hayErrores}
              >
                <Text style={styles.btnGuardarText}>?? Guardar Cambios</Text>
              </TouchableOpacity>
            </View>

          </ScrollView>

          {/* Bottom nav */}
          <View style={styles.bottomNav}>
            {[
              { label: 'Inicio', icon: '??', route: '/bodeguero/panel_bodeguero' },
              { label: 'Inventario', icon: '??', route: '/bodeguero/inventario' },
              { label: 'Perfil', icon: '??', active: true },
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
  background: { flex: 1 },
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
  },
  safeArea: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 14, paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 1.0)',
    borderBottomWidth: 1.5, borderBottomColor: '#9A3412',
  },
  btnVolver: {
    backgroundColor: '#9A3412', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 4,
  },
  btnVolverTexto: { color: '#F8FAFC', fontSize: 20, fontWeight: '600' },
  logoArea: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoCircle: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: '#9A3412', alignItems: 'center', justifyContent: 'center',
  },
  logoInitials: { color: '#F8FAFC', fontWeight: 'bold', fontSize: 10 },
  headerTitle: { color: '#0F172A', fontWeight: '600', fontSize: 15 },

  scroll: { padding: 16, paddingBottom: 24 },

  // Avatar
  avatarWrap: { alignItems: 'center', marginBottom: 20, marginTop: 8 },
  avatar: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: '#9A3412',
    alignItems: 'center', justifyContent: 'center', marginBottom: 10,
  },
  avatarText: { color: '#F8FAFC', fontSize: 30, fontWeight: 'bold' },
  avatarName: { color: '#0F172A', fontSize: 17, fontWeight: '700', marginBottom: 6 },
  rolBadge: {
    backgroundColor: '#9A3412', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 4,
  },
  rolText: { color: '#F8FAFC', fontSize: 12, fontWeight: '600' },

  // Secciones
  seccion: {
    backgroundColor: 'rgba(255, 255, 255, 1.0)',
    borderWidth: 1.5, borderColor: '#9A3412',
    borderRadius: 16, padding: 14, marginBottom: 14,
  },
  seccionTitulo: { color: '#0F172A', fontWeight: '600', fontSize: 15, marginBottom: 4 },
  seccionSub: { color: '#64748B', fontSize: 11, marginBottom: 12 },

  // Filas info
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#E2E8F0',
  },
  infoLabel: { color: '#64748B', fontSize: 13 },
  infoValor: { color: '#0F172A', fontSize: 13, fontWeight: '500', maxWidth: '60%', textAlign: 'right' },

  // Inputs
  input: {
    backgroundColor: 'rgba(255, 255, 255, 1.0)',
    borderWidth: 1.5, borderColor: '#9A3412',
    color: '#0F172A', borderRadius: 8,
    padding: 11, fontSize: 13, marginBottom: 4,
  },
  inputError: { borderColor: '#DC2626' },
  fieldHint: { color: '#DC2626', fontSize: 11, marginBottom: 8, marginLeft: 4 },
  fieldOk: { color: '#16A34A', fontSize: 11, marginBottom: 8, marginLeft: 4 },

  // Mensajes
  mensaje: { fontSize: 12, marginBottom: 10, textAlign: 'center', fontWeight: '600' },
  mensajeOk: { color: '#16A34A' },
  mensajeError: { color: '#DC2626' },

  // Botones
  btnGuardar: {
    backgroundColor: '#9A3412', padding: 13,
    borderRadius: 8, alignItems: 'center', marginTop: 4,
  },
  btnGuardarText: { color: '#F8FAFC', fontWeight: '600', fontSize: 14 },
  btnSalir: {
    marginTop: 4, marginBottom: 8,
    borderWidth: 1.5, borderColor: '#9A3412',
    paddingVertical: 13, borderRadius: 10, alignItems: 'center',
  },
  btnSalirText: { color: '#9A3412', fontWeight: '600', fontSize: 14 },

  // Bottom nav
  bottomNav: {
    flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 1.0)',
    borderTopWidth: 1.5, borderTopColor: '#9A3412',
  },
  bnav: { alignItems: 'center', gap: 2 },
  bnavIcon: { fontSize: 18 },
  bnavLabel: { fontSize: 9, color: '#64748B' },
  bnavActive: { color: '#0F172A', fontWeight: '700' },
});