import React from 'react';
import { Text, TouchableOpacity, StyleSheet, ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { sesion } from '../../../constants/sesion';

const opciones = [
  { icon: '🏠', label: 'Inicio',       ruta: '/vendedor/panel_vendedor' },
  { icon: '👤', label: 'Perfil',       ruta: '/vendedor/perfil_vendedor' },
  { icon: '📋', label: 'Ver Pedidos',  ruta: '/vendedor/pedidos_vendedor' },
  { icon: '💰', label: 'Ver Ventas',   ruta: '/vendedor/ver_ventas' },
  { icon: '↩️', label: 'Devoluciones', ruta: '/vendedor/devoluciones' },
];

export default function PanelVendedor() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>
        Bienvenido {sesion.rol}, {sesion.nombre}
      </Text>
      <Text style={styles.subtitle}>Tienes acceso al panel de ventas</Text>

      <View style={styles.grid}>
        {opciones.map((op) => (
          <TouchableOpacity
            key={op.label}
            style={styles.card}
            onPress={() => router.push(op.ruta as any)}
          >
            <Text style={styles.cardIcon}>{op.icon}</Text>
            <Text style={styles.cardText}>{op.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.btnSalir} onPress={() => router.replace('/')}>
        <Text style={styles.btnSalirText}>🚪 Cerrar Sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:    { flexGrow: 1, padding: 24, backgroundColor: '#09080D' },
  title:        { fontSize: 24, fontWeight: 'bold', color: '#B7975B', textAlign: 'center', marginTop: 40, marginBottom: 4 },
  subtitle:     { fontSize: 14, color: '#aaa', textAlign: 'center', marginBottom: 32 },
  grid:         { flexDirection: 'row', flexWrap: 'wrap', gap: 16, justifyContent: 'center' },
  card:         { width: '44%', backgroundColor: '#1a1a2e', borderRadius: 12, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: '#B7975B' },
  cardIcon:     { fontSize: 32, marginBottom: 8 },
  cardText:     { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  btnSalir:     { marginTop: 40, backgroundColor: '#B7975B', padding: 15, borderRadius: 8, alignItems: 'center' },
  btnSalirText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
});