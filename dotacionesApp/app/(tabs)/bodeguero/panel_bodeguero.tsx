import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ImageBackground } from 'react-native';
import { router } from 'expo-router';
import { sesion } from '../../../constants/sesion';

export default function PanelBodeguero() {
  return (
    <ImageBackground
      source={require('../../../assets/images/camiseta.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>
        Bienvenido {sesion.rol}, {sesion.nombre}
      </Text>
      <Text style={styles.subtitle}>Gestión de inventario y despachos</Text>

      <View style={styles.grid}>
        <TouchableOpacity style={styles.card} onPress={() => router.push('/bodeguero/inicio' as any)}>
          <Text style={styles.cardIcon}>✅</Text>
          <Text style={styles.cardText}>Inicio</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.card} onPress={() => router.push('/bodeguero/perfil' as any)}>
          <Text style={styles.cardIcon}>🧑</Text>
          <Text style={styles.cardText}>Perfil</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.card} onPress={() => router.push('/bodeguero/inventario' as any)}>
          <Text style={styles.cardIcon}>🚚</Text>
          <Text style={styles.cardText}>Inventario</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.btnSalir} onPress={() => router.replace('/')}>
        <Text style={styles.btnSalirText}>🚪 Cerrar Sesión</Text>
      </TouchableOpacity>
    </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  container:    { flexGrow: 1, padding: 24, backgroundColor: 'rgba(9,8,13,0.75)' },
  title:        { fontSize: 24, fontWeight: 'bold', color: '#B7975B', textAlign: 'center', marginTop: 40, marginBottom: 6 },
  subtitle:     { fontSize: 14, color: '#ccc', textAlign: 'center', marginBottom: 32 },
  grid:         { flexDirection: 'row', flexWrap: 'wrap', gap: 16, justifyContent: 'center' },
  card:         { width: '44%', backgroundColor: '#fff', borderRadius: 12, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: '#ccc' },
  cardIcon:     { fontSize: 32, marginBottom: 8 },
  cardText:     { color: '#333333', fontWeight: 'bold', fontSize: 14 },
  btnSalir:     { marginTop: 40, backgroundColor: '#B7975B', padding: 15, borderRadius: 8, alignItems: 'center' },
  btnSalirText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
});