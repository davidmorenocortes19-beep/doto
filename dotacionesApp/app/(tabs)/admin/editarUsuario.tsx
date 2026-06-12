import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, ScrollView, Pressable
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import axios from 'axios';

const BASE = 'http://172.30.3.242/doto/api';

type Rol = { id_rol: number; nombre_rol: string };

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

  // ✅ Errores por campo
  const [errNombre,   setErrNombre]   = useState('');
  const [errCorreo,   setErrCorreo]   = useState('');
  const [errTelefono, setErrTelefono] = useState('');
  const [errDireccion,setErrDireccion]= useState('');
  const [errRol,      setErrRol]      = useState('');

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

  // ✅ Validaciones por campo
  const validar = (): boolean => {
    let valido = true;

    if (!nombre.trim()) {
      setErrNombre('El nombre es obligatorio');
      valido = false;
    } else if (nombre.trim().length < 3) {
      setErrNombre('El nombre debe tener al menos 3 caracteres');
      valido = false;
    } else {
      setErrNombre('');
    }

    const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!correo.trim()) {
      setErrCorreo('El correo es obligatorio');
      valido = false;
    } else if (!regexCorreo.test(correo.trim())) {
      setErrCorreo('Ingresa un correo válido (ejemplo@correo.com)');
      valido = false;
    } else {
      setErrCorreo('');
    }

    const regexTel = /^[0-9]{7,15}$/;
    if (!telefono.trim()) {
      setErrTelefono('El teléfono es obligatorio');
      valido = false;
    } else if (!regexTel.test(telefono.trim())) {
      setErrTelefono('El teléfono debe tener entre 7 y 15 dígitos');
      valido = false;
    } else {
      setErrTelefono('');
    }

    if (!direccion.trim()) {
      setErrDireccion('La dirección es obligatoria');
      valido = false;
    } else if (direccion.trim().length < 5) {
      setErrDireccion('La dirección debe tener al menos 5 caracteres');
      valido = false;
    } else {
      setErrDireccion('');
    }

    if (!idRol) {
      setErrRol('Debes seleccionar un rol');
      valido = false;
    } else {
      setErrRol('');
    }

    return valido;
  };

  const guardar = async () => {
    if (!validar()) return;

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
        setTimeout(() => {
          setExitoMsg('');
          router.push('/admin/Usuarios');
        }, 2000);
      } else {
        Alert.alert('Error', res.data.error || 'Respuesta inesperada del servidor');
      }
    } catch (e: any) {
      const status  = e?.response?.status;
      const data    = e?.response?.data;
      const mensaje = e?.message;

      if (data?.error) {
        Alert.alert(`Error ${status}`, data.error);
      } else if (mensaje) {
        Alert.alert('Error de conexión', mensaje);
      } else {
        Alert.alert('Error', 'No se pudo conectar con el servidor');
      }
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

      <ScrollView
        contentContainerStyle={styles.form}
        keyboardShouldPersistTaps="handled"
      >

        <Text style={styles.label}>Nombre completo</Text>
        <TextInput
          style={[styles.input, errNombre ? styles.inputError : null]}
          value={nombre}
          onChangeText={(t) => { setNombre(t); setErrNombre(''); }}
          placeholderTextColor="#999"
          placeholder="Nombre completo"
        />
        {errNombre ? <Text style={styles.textoError}>{errNombre}</Text> : null}

        <Text style={styles.label}>Documento</Text>
        <TextInput
          style={[styles.input, styles.inputDeshabilitado]}
          value={documento}
          editable={false}
          placeholderTextColor="#999"
          placeholder="Número de documento"
          keyboardType="numeric"
        />
        <Text style={styles.nota}>* El documento no puede ser modificado</Text>

        <Text style={styles.label}>Correo electrónico</Text>
        <TextInput
          style={[styles.input, errCorreo ? styles.inputError : null]}
          value={correo}
          onChangeText={(t) => { setCorreo(t); setErrCorreo(''); }}
          placeholderTextColor="#999"
          placeholder="correo@ejemplo.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {errCorreo ? <Text style={styles.textoError}>{errCorreo}</Text> : null}

        <Text style={styles.label}>Teléfono</Text>
        <TextInput
          style={[styles.input, errTelefono ? styles.inputError : null]}
          value={telefono}
          onChangeText={(t) => { setTelefono(t); setErrTelefono(''); }}
          placeholderTextColor="#999"
          placeholder="Número de teléfono"
          keyboardType="phone-pad"
        />
        {errTelefono ? <Text style={styles.textoError}>{errTelefono}</Text> : null}

        <Text style={styles.label}>Dirección</Text>
        <TextInput
          style={[styles.input, errDireccion ? styles.inputError : null]}
          value={direccion}
          onChangeText={(t) => { setDireccion(t); setErrDireccion(''); }}
          placeholderTextColor="#999"
          placeholder="Dirección"
        />
        {errDireccion ? <Text style={styles.textoError}>{errDireccion}</Text> : null}

        <Text style={styles.label}>Rol</Text>
        <View style={styles.rolesContenedor}>
          {roles.map(r => (
            <TouchableOpacity
              key={r.id_rol}
              style={[styles.rolBtn, idRol === r.id_rol && styles.rolBtnActivo]}
              onPress={() => { setIdRol(r.id_rol); setErrRol(''); }}
            >
              <Text style={[styles.rolBtnTexto, idRol === r.id_rol && styles.rolBtnTextoActivo]}>
                {r.nombre_rol}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {errRol ? <Text style={styles.textoError}>{errRol}</Text> : null}

      </ScrollView>

      <View style={styles.footerBtn}>
        <Pressable
          style={({ pressed }) => [
            styles.btnGuardar,
            guardando && { opacity: 0.6 },
            pressed && { opacity: 0.8 }
          ]}
          onPress={() => guardar()}
          disabled={guardando}
        >
          {guardando
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.btnGuardarTexto}>💾 Guardar cambios</Text>
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
  form:               { padding: 20, paddingBottom: 40 },
  label:              { color: '#B7975B', fontSize: 13, fontWeight: 'bold', marginBottom: 6, marginTop: 14 },
  input:              { backgroundColor: '#1a1a2e', color: '#fff', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#B7975B', fontSize: 14 },
  inputError:         { borderColor: '#e74c3c' },
  inputDeshabilitado: { backgroundColor: '#111', color: '#666', borderColor: '#444' },
  nota:               { color: '#666', fontSize: 11, marginTop: 4, fontStyle: 'italic' },
  textoError:         { color: '#e74c3c', fontSize: 11, marginTop: 4 },
  rolesContenedor:    { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 4 },
  rolBtn:             { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#B7975B' },
  rolBtnActivo:       { backgroundColor: '#B7975B' },
  rolBtnTexto:        { color: '#B7975B', fontSize: 13, fontWeight: 'bold' },
  rolBtnTextoActivo:  { color: '#000' },
  btnGuardar:         { backgroundColor: '#B7975B', padding: 14, borderRadius: 10, alignItems: 'center' },
  btnGuardarTexto:    { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  footerBtn:          { padding: 10, paddingTop: 10, backgroundColor: '#09080D' },
  exitoContenedor:    { backgroundColor: '#1a4a1a', padding: 14, margin: 16, borderRadius: 10, borderWidth: 1, borderColor: '#4CAF50' },
  exitoTexto:         { color: '#4CAF50', fontWeight: 'bold', textAlign: 'center', fontSize: 14 },
});