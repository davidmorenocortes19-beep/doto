import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, ScrollView, Pressable, ImageBackground } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import axios from 'axios';

const BASE = 'http://192.168.1.19/doto/api';

type Rol = { id_rol: number; nombre_rol: string };

const validarCorreo = (correo: string): string | null => {
  if (!correo.trim()) return '⚠ El correo es obligatorio';
  if (!correo.includes('@') || !correo.includes('.')) return '⚠ Ingresa un correo válido';
  return null;
};

export default function EditarUsuarioScreen() {
  const params = useLocalSearchParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [nombre,    setNombre]    = useState('');
  const [documento, setDocumento] = useState('');
  const [correo,    setCorreo]    = useState('');
  const [telefono,  setTelefono]  = useState('');
  const [direccion, setDireccion] = useState('');
  const [idRol,     setIdRol]     = useState<number>(0);
  const [roles,     setRoles]     = useState<Rol[]>([]);
  const [estado,    setEstado]    = useState<'Habilitado' | 'Inhabilitado'>('Habilitado');
  const [cargando,  setCargando]  = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [errorMsg,  setErrorMsg]  = useState('');
  const [exitoMsg,  setExitoMsg]  = useState('');

  const [nombreError, setNombreError] = useState('');
  const [correoError, setCorreoError] = useState('');
  const [telError,    setTelError]    = useState('');
  const [dirError,    setDirError]    = useState('');
  const [rolError,    setRolError]    = useState('');

  const [focusedField, setFocusedField] = useState<string | null>(null);

  useEffect(() => { if (id) cargarDatos(); }, [id]);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      setErrorMsg('');
      const resUsuario = await axios.get(`${BASE}/usuarios.php?id=${id}`, { timeout: 8000 });
      const resRoles   = await axios.get(`${BASE}/roles.php`,             { timeout: 8000 });
      const u = resUsuario.data;
      if (!u || u.error) { setErrorMsg('No se encontró el usuario'); return; }
      setNombre(u.nombre       ?? '');
      setDocumento(u.documento ?? '');
      setCorreo(u.correo       ?? '');
      setTelefono(u.telefono   ?? '');
      setDireccion(u.direccion ?? '');
      setIdRol(Number(u.id_rol_fk) ?? 0);
      setEstado(u.estado === 'Inhabilitado' ? 'Inhabilitado' : 'Habilitado');
      if (Array.isArray(resRoles.data)) setRoles(resRoles.data);
    } catch (e: any) {
      setErrorMsg(`Error al cargar: ${e?.message ?? 'desconocido'}`);
    } finally {
      setCargando(false);
    }
  };

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

  const handleCorreo = (text: string) => {
    setCorreo(text);
    setCorreoError(validarCorreo(text) ?? '');
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
    if (text.trim().length > 0 && text.trim().length < 5) {
      setDirError('⚠ Mínimo 5 caracteres');
    } else {
      setDirError('');
    }
  };

  const guardar = async () => {
    let valido = true;

    if (!nombre.trim() || nombre.trim().length < 3) {
      setNombreError('⚠ Nombre obligatorio, mínimo 3 caracteres');
      valido = false;
    }
    const errCorreo = validarCorreo(correo);
    if (errCorreo) { setCorreoError(errCorreo); valido = false; }
    if (!telefono.trim() || telefono.length < 7) {
      setTelError('⚠ Teléfono obligatorio, mínimo 7 dígitos');
      valido = false;
    }
    if (!direccion.trim() || direccion.trim().length < 5) {
      setDirError('⚠ Dirección obligatoria, mínimo 5 caracteres');
      valido = false;
    }
    if (!idRol) { setRolError('⚠ Debes seleccionar un rol'); valido = false; }
    if (!valido) return;

    try {
      setGuardando(true);
      const res = await axios.post(`${BASE}/editarAdmin.php`, {
        id_usuario: Number(id),
        nombre, documento, correo, telefono, direccion, id_rol: idRol, estado,
      }, { timeout: 8000 });

      if (res.data.mensaje) {
        setExitoMsg('✅ Los datos del usuario fueron actualizados correctamente');
        setTimeout(() => { setExitoMsg(''); router.push('/admin/Usuarios'); }, 2000);
      } else {
        Alert.alert('Error', res.data.error || 'Respuesta inesperada del servidor');
      }
    } catch (e: any) {
      const data    = e?.response?.data;
      const status  = e?.response?.status;
      const mensaje = e?.message;
      if (data?.error)  Alert.alert(`Error ${status}`, data.error);
      else if (mensaje) Alert.alert('Error de conexión', mensaje);
      else              Alert.alert('Error', 'No se pudo conectar con el servidor');
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator size="large" color="#991B1B" />
        <Text style={styles.centradoTexto}>Cargando usuario...</Text>
      </View>
    );
  }

  if (errorMsg) {
    return (
      <View style={styles.centrado}>
        <Text style={styles.centradoTexto}>{errorMsg}</Text>
        <TouchableOpacity onPress={cargarDatos} style={styles.btnReintentar}>
          <Text style={styles.btnReintentarTexto}>🔄 Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ImageBackground
      source={require('../../../assets/images/camiseta.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.container}>

        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.push('/admin/Usuarios')} style={styles.btnVolver}>
            <Text style={styles.btnVolverTexto}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.titulo}>Editar Usuario</Text>
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

            {/* DOCUMENTO — solo lectura */}
            <Text style={styles.label}>Documento</Text>
            <View style={[styles.inputOutline, styles.inputOutlineDeshabilitado]}>
              <TextInput
                style={[styles.inputField, styles.inputFieldDeshabilitado]}
                placeholder="Documento"
                placeholderTextColor="#9AA5B1"
                value={documento}
                editable={false}
                keyboardType="numeric"
              />
            </View>
            <Text style={styles.nota}>* El documento no puede ser modificado</Text>

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
                maxLength={15}
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

            {/* ROL */}
            <Text style={styles.label}>Selecciona el rol</Text>
            <View style={styles.rolContainer}>
              {roles.map(r => (
                <TouchableOpacity
                  key={r.id_rol}
                  style={[styles.rolBtn, idRol === r.id_rol && styles.rolActivo]}
                  onPress={() => { setIdRol(r.id_rol); setRolError(''); }}
                  activeOpacity={0.85}
                >
                  <Text style={idRol === r.id_rol ? styles.rolTextoActivo : styles.rolTexto}>
                    {r.nombre_rol}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {rolError !== '' && <Text style={styles.fieldHint}>{rolError}</Text>}

            {/* ESTADO — Habilitar / Inhabilitar */}
            <Text style={styles.label}>Estado del usuario</Text>
            <View style={styles.rolContainer}>
              <TouchableOpacity
                style={[
                  styles.rolBtn,
                  estado === 'Habilitado' && styles.estadoHabilitadoActivo,
                ]}
                onPress={() => setEstado('Habilitado')}
                activeOpacity={0.85}
              >
                <Text style={estado === 'Habilitado' ? styles.rolTextoActivo : styles.rolTexto}>
                  Habilitado
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.rolBtn,
                  estado === 'Inhabilitado' && styles.estadoInhabilitadoActivo,
                ]}
                onPress={() => setEstado('Inhabilitado')}
                activeOpacity={0.85}
              >
                <Text style={estado === 'Inhabilitado' ? styles.rolTextoActivo : styles.rolTexto}>
                  Inhabilitado
                </Text>
              </TouchableOpacity>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.button,
                guardando && { opacity: 0.6 },
                pressed && { opacity: 0.8 },
              ]}
              onPress={guardar}
              disabled={guardando}
            >
              {guardando
                ? <ActivityIndicator color="#F8FAFC" />
                : <Text style={styles.buttonText}>💾 GUARDAR CAMBIOS</Text>
              }
            </Pressable>

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
  background: { flex: 1 },
  container: { flex: 1 },

  // Carga / error
  centrado: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  centradoTexto: {
    color: TEXT_DARK, fontSize: 14, textAlign: 'center',
    paddingHorizontal: 20, marginTop: 10,
  },
  btnReintentar: {
    marginTop: 20, backgroundColor: ACCENT,
    paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8,
  },
  btnReintentarTexto: { color: '#F8FAFC', fontWeight: '600', fontSize: 14 },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16, paddingTop: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.97)',
  },
  titulo: { fontSize: 18, fontWeight: '600', color: TEXT_DARK },
  btnVolver: {
    padding: 8, backgroundColor: ACCENT,
    borderRadius: 8, width: 70, alignItems: 'center',
  },
  btnVolverTexto: { color: '#F8FAFC', fontSize: 13, fontWeight: '600' },

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
  inputOutlineDeshabilitado: {
    backgroundColor: '#F1F5F9',
    borderColor: '#CBD5E1',
    marginBottom: 4,
  },
  inputField: {
    fontSize: 14,
    color: TEXT_DARK,
    padding: 0,
    outlineStyle: 'none',
  },
  inputFieldDeshabilitado: {
    color: TEXT_GRAY,
  },
  nota: {
    color: TEXT_GRAY, fontSize: 11,
    marginBottom: 12, marginLeft: 4, marginTop: 4, fontStyle: 'italic',
  },
  fieldHint: { color: '#DC2626', fontSize: 12, marginBottom: 12, marginLeft: 4, marginTop: 4 },
  fieldOk:   { color: '#16A34A', fontSize: 12, marginBottom: 12, marginLeft: 4, marginTop: 4 },

  // Roles / estado
  rolContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  rolBtn: {
    flex: 1, minWidth: '45%', padding: 10, borderRadius: 8,
    backgroundColor: '#fff',
    alignItems: 'center', borderWidth: 1, borderColor: BORDER,
  },
  rolActivo:      { backgroundColor: ACCENT, borderColor: ACCENT },
  rolTexto:       { fontWeight: '600', color: TEXT_DARK, fontSize: 13 },
  rolTextoActivo: { fontWeight: '600', color: '#F8FAFC', fontSize: 13 },

  estadoHabilitadoActivo:   { backgroundColor: '#16A34A', borderColor: '#16A34A' },
  estadoInhabilitadoActivo: { backgroundColor: '#DC2626', borderColor: '#DC2626' },

  // Botón guardar
  button: {
    backgroundColor: ACCENT,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonText: { color: '#F8FAFC', fontWeight: '600', fontSize: 14 },

  // Éxito
  exitoContenedor: {
    backgroundColor: '#fff',
    padding: 14, marginBottom: 20, borderRadius: 10,
    borderWidth: 1, borderColor: BORDER,
  },
  exitoTexto: { color: '#16A34A', fontWeight: '600', textAlign: 'center', fontSize: 14 },
});