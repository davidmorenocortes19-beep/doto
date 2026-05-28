import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';

export default function PanelAdmin() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Panel Administrador</Text>
      <Text style={styles.subtitle}>Bienvenido, tienes acceso total al sistema</Text>

      <View style={styles.grid}>
        <View style={styles.card}><Text style={styles.cardIcon}>👥</Text><Text style={styles.cardText}>Usuarios</Text></View>
        <View style={styles.card}><Text style={styles.cardIcon}>📦</Text><Text style={styles.cardText}>Inventario</Text></View>
        <View style={styles.card}><Text style={styles.cardIcon}>📊</Text><Text style={styles.cardText}>Reportes</Text></View>
        <View style={styles.card}><Text style={styles.cardIcon}>⚙️</Text><Text style={styles.cardText}>Configuración</Text></View>
      </View>

      <TouchableOpacity style={styles.btnSalir} onPress={() => router.replace('/')}>
        <Text style={styles.btnSalirText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:    { flexGrow: 1, padding: 24, backgroundColor: '#09080D' },
  title:        { fontSize: 24, fontWeight: 'bold', color: '#B7975B', textAlign: 'center', marginTop: 40, marginBottom: 6 },
  subtitle:     { fontSize: 14, color: '#aaa', textAlign: 'center', marginBottom: 32 },
  grid:         { flexDirection: 'row', flexWrap: 'wrap', gap: 16, justifyContent: 'center' },
  card:         { width: '44%', backgroundColor: '#1a1a2e', borderRadius: 12, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: '#B7975B' },
  cardIcon:     { fontSize: 32, marginBottom: 8 },
  cardText:     { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  btnSalir:     { marginTop: 40, backgroundColor: '#B7975B', padding: 15, borderRadius: 8, alignItems: 'center' },
  btnSalirText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
});