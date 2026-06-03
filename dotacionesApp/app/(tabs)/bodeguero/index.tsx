import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { sesion } from '../../../constants/sesion';

export default function IndexBodeguero() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>¡Bienvenido,</Text>
      <Text style={styles.nombre}>{sesion.nombre}!</Text>
      <Text style={styles.subtitle}>Bodeguero — Dotaciones Toronto</Text>

      <View style={styles.card}>
        <Text style={styles.cardIcon}>📦</Text>
        <Text style={styles.cardTitle}>Tu rol</Text>
        <Text style={styles.cardBody}>
          Eres responsable de gestionar el inventario, registrar movimientos
          de entrada y salida, y mantener el stock actualizado.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardIcon}>📋</Text>
        <Text style={styles.cardTitle}>Accesos rápidos</Text>
        <Text style={styles.cardBody}>• Inventario: consulta y actualiza el stock</Text>
        <Text style={styles.cardBody}>• Perfil: actualiza tu información personal</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, backgroundColor: '#09080D' },
  title:     { fontSize: 28, fontWeight: 'bold', color: '#B7975B', textAlign: 'center', marginTop: 40 },
  nombre:    { fontSize: 32, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: 6 },
  subtitle:  { fontSize: 14, color: '#aaa', textAlign: 'center', marginBottom: 32 },
  card: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#B7975B',
  },
  cardIcon:  { fontSize: 28, marginBottom: 8 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#B7975B', marginBottom: 8 },
  cardBody:  { fontSize: 14, color: '#ccc', marginBottom: 4, lineHeight: 20 },
});