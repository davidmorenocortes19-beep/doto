import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';

export default function PanelVendedor() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Panel Vendedor</Text>
      <Text style={styles.subtitle}>Gestiona tus ventas y clientes</Text>

      <View style={styles.grid}>
        <View style={styles.card}><Text style={styles.cardIcon}>💰</Text><Text style={styles.cardText}>Mis Ventas</Text></View>
        <View style={styles.card}><Text style={styles.cardIcon}>👥</Text><Text style={styles.cardText}>Clientes</Text></View>
        <View style={styles.card}><Text style={styles.cardIcon}>📈</Text><Text style={styles.cardText}>Estadísticas</Text></View>
        <View style={styles.card}><Text style={styles.cardIcon}>🧾</Text><Text style={styles.cardText}>Cotizaciones</Text></View>
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