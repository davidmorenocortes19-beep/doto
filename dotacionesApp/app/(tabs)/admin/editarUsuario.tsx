import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, ScrollView, Pressable
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import axios from 'axios';

const BASE = 'http://172.30.3.242/doto/api';

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
  const [cargando,  setCargando]  = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [errorMsg,  setErrorMsg]  = useState('');
  const [exitoMsg,  setExitoMsg]  = useState('');

  // ── Errores por campo ──────────────────────────────────────
  const [nombreError,   setNombreError]   = useState('');
  const [correoError,   setCorreoError]   = useState('');
  const [telError,      setTelError]      = useState('');
  const [dirError,      setDirError]      = useState('');
  const [rolError,      setRolError]      = useState('');

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
      if (Array.isArray(resRoles.data)) setRoles(resRoles.data);
    } catch (e: any) {
      setErrorMsg(`Error al cargar: ${e?.message ?? 'desconocido'}`);
    } finally {
      setCargando(false);
    }
  };

  // ── Handlers con validación en tiempo real ─────────────────
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
    } else if (limpio.length >= 7) {
      setTelError('');
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
    // Validar todo antes de enviar
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
        nombre,
        documento,
        correo,
        telefono,
        direccion,
        id_rol: idRol,
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
        <ActivityIndicator size="large" color="#B7975B" />
        <Text style={{ color: '#B7975B', marginTop: 10 }}>Cargando usuario...</Text>
      </View>
    );
  }

  if (errorMsg) {
    return (
      <View style={styles.centrado}>
        <Text style={{ color: '#e74c3c', fontSize: 14, textAlign: 'center', paddingHorizontal: 20 }}>
          {errorMsg}
        </Text>
        <TouchableOpacity onPress={cargarDatos} style={{ marginTop: 20 }}>
          <Text style={{ color: '#B7975B' }}>🔄 Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/admin/Usuarios')} style={styles.btnVolver}>
          <Text style={styles.btnVolverTexto}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.titulo}>Editar Usuario</Text>
        <View style={{ width: 70 }} />
      </View>

      {exitoMsg ? (
        <View style={styles.exitoContenedor}>
          <Text style={styles.exitoTexto}>{exitoMsg}</Text>
        </View>
      ) : null}

      <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">

        {/* NOMBRE */}
        <TextInput
          placeholder="Nombre completo"
          placeholderTextColor="#999"
          style={[styles.input, nombreError ? styles.inputError : null]}
          onChangeText={handleNombre}
          value={nombre}
          autoCorrect={false}
        />
        {nombreError !== '' && <Text style={styles.fieldHint}>{nombreError}</Text>}
        {nombre.trim().length >= 3 && nombreError === '' && (
          <Text style={styles.fieldOk}>✅ Nombre válido</Text>
        )}

        {/* DOCUMENTO — solo lectura */}
        <TextInput
          placeholder="Documento"
          placeholderTextColor="#999"
          style={[styles.input, styles.inputDeshabilitado]}
          value={documento}
          editable={false}
          keyboardType="numeric"
        />
        <Text style={styles.nota}>* El documento no puede ser modificado</Text>

        {/* CORREO */}
        <TextInput
          placeholder="Correo electrónico"
          placeholderTextColor="#999"
          style={[styles.input, correoError ? styles.inputError : null]}
          keyboardType="email-address"
          autoCapitalize="none"
          onChangeText={handleCorreo}
          value={correo}
        />
        {correoError !== '' && <Text style={styles.fieldHint}>{correoError}</Text>}
        {correo !== '' && correoError === '' && (
          <Text style={styles.fieldOk}>✅ Correo válido</Text>
        )}

        {/* TELÉFONO */}
        <TextInput
          placeholder="Teléfono"
          placeholderTextColor="#999"
          style={[styles.input, telError ? styles.inputError : null]}
          keyboardType="phone-pad"
          onChangeText={handleTelefono}
          value={telefono}
          maxLength={15}
        />
        {telError !== '' && <Text style={styles.fieldHint}>{telError}</Text>}
        {telefono.length >= 7 && telError === '' && (
          <Text style={styles.fieldOk}>✅ Teléfono válido</Text>
        )}

        {/* DIRECCIÓN */}
        <TextInput
          placeholder="Dirección"
          placeholderTextColor="#999"
          style={[styles.input, dirError ? styles.inputError : null]}
          onChangeText={handleDireccion}
          value={direccion}
        />
        {dirError !== '' && <Text style={styles.fieldHint}>{dirError}</Text>}
        {direccion.trim().length >= 5 && dirError === '' && (
          <Text style={styles.fieldOk}>✅ Dirección válida</Text>
        )}

        {/* ROL */}
        <Text style={styles.label}>Selecciona el rol:</Text>
        <View style={styles.rolContainer}>
          {roles.map(r => (
            <TouchableOpacity
              key={r.id_rol}
              style={[styles.rolBtn, idRol === r.id_rol && styles.rolActivo]}
              onPress={() => { setIdRol(r.id_rol); setRolError(''); }}
            >
              <Text style={idRol === r.id_rol ? styles.rolTextoActivo : styles.rolTexto}>
                {r.nombre_rol}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {rolError !== '' && <Text style={styles.fieldHint}>{rolError}</Text>}

      </ScrollView>

      <View style={styles.footerBtn}>
        <Pressable
          style={({ pressed }) => [
            styles.button,
            guardando && { opacity: 0.6 },
            pressed && { opacity: 0.8 }
          ]}
          onPress={() => guardar()}
          disabled={guardando}
        >
          {guardando
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.buttonText}>💾 GUARDAR CAMBIOS</Text>
          }
        </Pressable>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container:          { flex: 1, backgroundColor: '#09080D' },
  centrado:           { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#09080D' },
  header:             { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingTop: 50, backgroundColor: '#000' },
  titulo:             { fontSize: 20, fontWeight: 'bold', color: '#B7975B' },
  btnVolver:          { padding: 8 },
  btnVolverTexto:     { color: '#B7975B', fontSize: 14 },
  form:               { padding: 20, paddingBottom: 20 },
  input:              { backgroundColor: '#1a1a2e', color: '#fff', padding: 14, borderRadius: 8, marginBottom: 4, borderWidth: 1, borderColor: '#B7975B', fontSize: 15 },
  inputError:         { borderColor: '#e74c3c', borderWidth: 2, marginBottom: 0 },
  inputDeshabilitado: { backgroundColor: '#111', color: '#666', borderColor: '#444' },
  nota:               { color: '#666', fontSize: 11, marginBottom: 8, marginLeft: 4, fontStyle: 'italic' },
  fieldHint:          { color: '#e74c3c', fontSize: 12, marginBottom: 8, marginLeft: 4 },
  fieldOk:            { color: '#2ecc71', fontSize: 12, marginBottom: 8, marginLeft: 4 },
  label:              { marginTop: 8, marginBottom: 8, fontWeight: 'bold', color: '#B7975B' },
  rolContainer:       { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  rolBtn:             { flex: 1, minWidth: '45%', padding: 10, borderRadius: 8, backgroundColor: '#1a1a2e', alignItems: 'center', borderWidth: 1, borderColor: '#B7975B' },
  rolActivo:          { backgroundColor: '#B7975B' },
  rolTexto:           { fontWeight: 'bold', color: '#B7975B', fontSize: 13 },
  rolTextoActivo:     { fontWeight: 'bold', color: '#fff', fontSize: 13 },
  button:             { backgroundColor: '#B7975B', padding: 15, borderRadius: 8, alignItems: 'center' },
  buttonText:         { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  footerBtn:          { padding: 20, paddingTop: 10, backgroundColor: '#09080D' },
  exitoContenedor:    { backgroundColor: '#1a4a1a', padding: 14, margin: 16, borderRadius: 10, borderWidth: 1, borderColor: '#4CAF50' },
  exitoTexto:         { color: '#4CAF50', fontWeight: 'bold', textAlign: 'center', fontSize: 14 },
});