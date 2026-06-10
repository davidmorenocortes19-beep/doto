import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Alert,
} from 'react-native';
import { sesion } from '../../../constants/sesion';

export default function PerfilBodeguero() {
  const [nombre,    setNombre]    = useState('');
  const [correo,    setCorreo]    = useState('');
  const [telefono,  setTelefono]  = useState('');
  const [direccion, setDireccion] = useState('');
  const [password,  setPassword]  = useState('');

  function handleActualizar() {
    if (!nombre && !correo && !telefono && !direccion && !password) {
      Alert.alert('Aviso', 'Completa al menos un campo para actualizar.');
      return;
    }

    if (nombre)    sesion.nombre = nombre;

    Alert.alert('Éxito ✅', 'Perfil actualizado correctamente.');
    setNombre(''); setCorreo(''); setTelefono(''); setDireccion(''); setPassword('');
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Mi Perfil</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Información Personal</Text>
        <InfoRow label="Nombre"    value={sesion.nombre} />
        <InfoRow label="Correo"    value={sesion.correo    ?? '—'} />
        <InfoRow label="Teléfono"  value={sesion.telefono  ?? '—'} />
        <InfoRow label="Dirección" value={sesion.direccion ?? '—'} />
        <InfoRow label="Documento" value={sesion.documento ?? '—'} />
        <InfoRow label="Rol"       value={sesion.rol} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Actualizar Información</Text>

        <Text style={styles.label}>Nuevo Nombre</Text>
        <TextInput
          style={styles.input}
          placeholder="Nuevo nombre"
          placeholderTextColor="#666"
          value={nombre}
          onChangeText={setNombre}
        />

        <Text style={styles.label}>Nuevo Correo</Text>
        <TextInput
          style={styles.input}
          placeholder="Nuevo correo"
          placeholderTextColor="#666"
          keyboardType="email-address"
          autoCapitalize="none"
          value={correo}
          onChangeText={setCorreo}
        />

        <Text style={styles.label}>Nuevo Teléfono</Text>
        <TextInput
          style={styles.input}
          placeholder="Nuevo teléfono"
          placeholderTextColor="#666"
          keyboardType="phone-pad"
          value={telefono}
          onChangeText={setTelefono}
        />

        <Text style={styles.label}>Nueva Dirección</Text>
        <TextInput
          style={styles.input}
          placeholder="Nueva dirección"
          placeholderTextColor="#666"
          value={direccion}
          onChangeText={setDireccion}
        />

        <Text style={styles.label}>Nueva Contraseña</Text>
        <TextInput
          style={styles.input}
          placeholder="Nueva contraseña"
          placeholderTextColor="#666"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity style={styles.btnActualizar} onPress={handleActualizar}>
          <Text style={styles.btnText}>Actualizar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}:</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container:     { flexGrow: 1, padding: 24, backgroundColor: '#09080D' },
  title:         { fontSize: 26, fontWeight: 'bold', color: '#B7975B', textAlign: 'center', marginTop: 40, marginBottom: 24 },
  card: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#B7975B',
  },
  cardTitle:     { fontSize: 16, fontWeight: 'bold', color: '#B7975B', marginBottom: 14 },
  infoRow:       { flexDirection: 'row', marginBottom: 8, flexWrap: 'wrap' },
  infoLabel:     { color: '#aaa', fontWeight: '600', width: 90 },
  infoValue:     { color: '#fff', flex: 1 },
  label:         { color: '#aaa', fontSize: 13, marginBottom: 4, marginTop: 10 },
  input: {
    backgroundColor: '#0d0d1a',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 14,
  },
  btnActualizar: { backgroundColor: '#B7975B', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 20 },
  btnText:       { color: '#fff', fontWeight: 'bold', fontSize: 15 },
});