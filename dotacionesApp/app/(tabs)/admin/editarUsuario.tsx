import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, ScrollView, Pressable, ImageBackground } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import axios from 'axios';

const BASE = 'http://192.168.137.9/doto/api';

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

  const [nombreError, setNombreError] = useState('');
  const [correoError, setCorreoError] = useState('');
  const [telError,    setTelError]    = useState('');
  const [dirError,    setDirError]    = useState('');
  const [rolError,    setRolError]    = useState('');

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
        nombre, documento, correo, telefono, direccion, id_rol: idRol,
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
        <ActivityIndicator size="large" color="#1E293B" />
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
      <View style={styles.overlay} />

      <View style={styles.container}>

        {/* HEADER */}
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
            placeholderTextColor="#94A3B8"
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
            placeholderTextColor="#94A3B8"
            style={[styles.input, styles.inputDeshabilitado]}
            value={documento}
            editable={false}
            keyboardType="numeric"
          />
          <Text style={styles.nota}>* El documento no puede ser modificado</Text>

          {/* CORREO */}
          <TextInput
            placeholder="Correo electrónico"
            placeholderTextColor="#94A3B8"
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
            placeholderTextColor="#94A3B8"
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
            placeholderTextColor="#94A3B8"
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

        {/* FOOTER */}
        <View style={styles.footerBtn}>
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

      </View>
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
  container: { flex: 1 },

  // Carga / error
  centrado: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  centradoTexto: {
    color: '#0F172A', fontSize: 14, textAlign: 'center',
    paddingHorizontal: 20, marginTop: 10,
  },
  btnReintentar: {
    marginTop: 20, backgroundColor: '#1E293B',
    paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8,
  },
  btnReintentarTexto: { color: '#F8FAFC', fontWeight: '600', fontSize: 14 },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16, paddingTop: 50,
    backgroundColor: 'rgba(255, 255, 255, 1.0)',
    borderBottomWidth: 1.5, borderBottomColor: '#1E293B',
  },
  titulo: { fontSize: 18, fontWeight: '600', color: '#0F172A' },
  btnVolver: {
    padding: 8, backgroundColor: '#1E293B',
    borderRadius: 8, width: 70, alignItems: 'center',
  },
  btnVolverTexto: { color: '#F8FAFC', fontSize: 13, fontWeight: '600' },

  // Formulario
  form: { padding: 20, paddingBottom: 20 },
  label: {
    marginTop: 8, marginBottom: 8,
    fontWeight: '600', color: '#0F172A', fontSize: 13,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 1.0)',
    color: '#0F172A', padding: 14, borderRadius: 10,
    marginBottom: 4, borderWidth: 1.5, borderColor: '#1E293B', fontSize: 15,
  },
  inputError: { borderColor: '#DC2626', borderWidth: 1.5, marginBottom: 0 },
  inputDeshabilitado: {
    backgroundColor: '#F1F5F9',
    color: '#64748B', borderColor: '#CBD5E1',
  },
  nota: {
    color: '#64748B', fontSize: 11,
    marginBottom: 8, marginLeft: 4, fontStyle: 'italic',
  },
  fieldHint: { color: '#DC2626', fontSize: 12, marginBottom: 8, marginLeft: 4 },
  fieldOk:   { color: '#16A34A', fontSize: 12, marginBottom: 8, marginLeft: 4 },

  // Roles
  rolContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  rolBtn: {
    flex: 1, minWidth: '45%', padding: 10, borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 1.0)',
    alignItems: 'center', borderWidth: 1.5, borderColor: '#1E293B',
  },
  rolActivo:      { backgroundColor: '#1E293B' },
  rolTexto:       { fontWeight: '600', color: '#0F172A', fontSize: 13 },
  rolTextoActivo: { fontWeight: '600', color: '#F8FAFC', fontSize: 13 },

  // Footer
  footerBtn: {
    padding: 20, paddingTop: 10,
    backgroundColor: 'rgba(255, 255, 255, 1.0)',
    borderTopWidth: 1.5, borderTopColor: '#1E293B',
  },
  button: {
    backgroundColor: '#1E293B', padding: 15,
    borderRadius: 10, alignItems: 'center',
  },
  buttonText: { color: '#F8FAFC', fontWeight: '600', fontSize: 15 },

  // Éxito
  exitoContenedor: {
    backgroundColor: 'rgba(255, 255, 255, 1.0)',
    padding: 14, margin: 16, borderRadius: 10,
    borderWidth: 1.5, borderColor: '#1E293B',
  },
  exitoTexto: { color: '#16A34A', fontWeight: '600', textAlign: 'center', fontSize: 14 },
});