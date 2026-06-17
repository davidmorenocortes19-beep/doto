import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  ActivityIndicator, TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { sesion } from '../../../constants/sesion';

const API = 'http://192.168.1.19/doto/api/inventario.php';

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
  container: { flexGrow: 1, backgroundColor: '#F8F9FA', padding: 24, paddingBottom: 40 },

  // Header
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 32,
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 28,
    borderWidth: 1,
    borderColor: '#333333',
  },
  avatarCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: '#B7975B',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 14,
  },
  avatarLetra: { fontSize: 32, fontWeight: 'bold', color: '#333333' },
  bienvenido:  { fontSize: 15, color: '#333333', textAlign: 'center' },
  nombre:      { fontSize: 26, fontWeight: 'bold', color: '#333333', textAlign: 'center', marginTop: 4 },
  rolBadge: {
    marginTop: 10,
    backgroundColor: '#F8F9FA',
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#333333',
  },
  rolText: { color: '#333333', fontSize: 13, fontWeight: '600' },

  // Card
  card: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333333',
  },
  cardIcon:  { fontSize: 28, marginBottom: 8 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#333333', marginBottom: 8 },
  cardBody:  { fontSize: 14, color: '#333333', lineHeight: 22 },

  // Accesos rápidos
  seccionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333333', marginBottom: 12 },
  grid:         { flexDirection: 'row', gap: 12 },
  gridCard: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333333',
  },
  gridIcon:  { fontSize: 30, marginBottom: 8 },
  gridLabel: { color: '#333333', fontWeight: 'bold', fontSize: 13 },
});