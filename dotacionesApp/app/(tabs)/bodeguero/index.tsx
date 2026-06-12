import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  ActivityIndicator, TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { sesion } from '../../../constants/sesion';

const API = 'http://192.168.40.8/doto/api/inventario.php';

export default function IndexBodeguero() {
  const [nombre,   setNombre]   = useState(sesion.nombre);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (!sesion.id) return;
    setCargando(true);
    fetch(`${API}?id=${sesion.id}`)
      .then(r => r.json())
      .then(data => {
        if (data.nombre) {
          setNombre(data.nombre);
          sesion.nombre = data.nombre; // sincronizar sesión
        }
      })
      .catch(() => {}) // si falla, usa el nombre de sesión
      .finally(() => setCargando(false));
  }, []);

  return (
    <ScrollView contentContainerStyle={s.container}>

      {/* ── Header ── */}
      <View style={s.header}>
        <View style={s.avatarCircle}>
          <Text style={s.avatarLetra}>
            {nombre ? nombre.charAt(0).toUpperCase() : '?'}
          </Text>
        </View>

        {cargando
          ? <ActivityIndicator color="#B7975B" style={{ marginTop: 12 }} />
          : <>
              <Text style={s.bienvenido}>¡Bienvenido de vuelta,</Text>
              <Text style={s.nombre}>{nombre || sesion.nombre}!</Text>
            </>
        }
        <View style={s.rolBadge}>
          <Text style={s.rolText}>🏭 Bodeguero</Text>
        </View>
      </View>

      {/* ── Descripción del rol ── */}
      <View style={s.card}>
        <Text style={s.cardIcon}>📦</Text>
        <Text style={s.cardTitle}>Tu rol</Text>
        <Text style={s.cardBody}>
          Eres responsable de gestionar el inventario, registrar movimientos
          de entrada y salida, y mantener el stock actualizado.
        </Text>
      </View>

      {/* ── Accesos rápidos ── */}
      <Text style={s.seccionTitle}>Accesos Rápidos</Text>
      <View style={s.grid}>
        <TouchableOpacity style={s.gridCard} onPress={() => router.push('/bodeguero/inventario' as any)}>
          <Text style={s.gridIcon}>🗂️</Text>
          <Text style={s.gridLabel}>Inventario</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.gridCard} onPress={() => router.push('/bodeguero/perfil' as any)}>
          <Text style={s.gridIcon}>🧑</Text>
          <Text style={s.gridLabel}>Mi Perfil</Text>
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#09080D', padding: 24, paddingBottom: 40 },

  // Header
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 32,
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 28,
    borderWidth: 1,
    borderColor: '#B7975B',
  },
  avatarCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: '#B7975B',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 14,
  },
  avatarLetra: { fontSize: 32, fontWeight: 'bold', color: '#fff' },
  bienvenido:  { fontSize: 15, color: '#aaa', textAlign: 'center' },
  nombre:      { fontSize: 26, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginTop: 4 },
  rolBadge: {
    marginTop: 10,
    backgroundColor: '#0d0d1a',
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#B7975B',
  },
  rolText: { color: '#B7975B', fontSize: 13, fontWeight: '600' },

  // Card
  card: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  cardIcon:  { fontSize: 28, marginBottom: 8 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#B7975B', marginBottom: 8 },
  cardBody:  { fontSize: 14, color: '#ccc', lineHeight: 22 },

  // Accesos rápidos
  seccionTitle: { fontSize: 16, fontWeight: 'bold', color: '#B7975B', marginBottom: 12 },
  grid:         { flexDirection: 'row', gap: 12 },
  gridCard: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#B7975B',
  },
  gridIcon:  { fontSize: 30, marginBottom: 8 },
  gridLabel: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
});