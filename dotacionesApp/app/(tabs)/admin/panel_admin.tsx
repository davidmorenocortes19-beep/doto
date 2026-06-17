import React from 'react';
import { Text, TouchableOpacity, StyleSheet, ScrollView, View, ImageBackground } from 'react-native';
import { router } from 'expo-router';
import { sesion } from '../../../constants/sesion';

const opciones = [
  { icon: '\u{1F3E0}', label: 'Inicio',       ruta: '/admin/panel_admin' },
  { icon: '\u{1F465}', label: 'Usuarios',     ruta: '/admin/Usuarios' },
  { icon: '\u{1F455}', label: 'Productos',    ruta: '/admin/Productos' },
  { icon: '\u{1F4CB}', label: 'Ver Pedidos',  ruta: '/admin/pedidos' },
  { icon: '\u{1F4E6}', label: 'Inventario',   ruta: '/admin/inventario' },
  { icon: '\u{21A9}\u{FE0F}', label: 'Devoluciones', ruta: '/admin/devoluciones' },
];

export default function PanelAdmin() {
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
      <Text style={styles.subtitle}>Tienes acceso total al sistema</Text>

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
        <Text style={styles.btnSalirText}>{'\u{1F6AA}'} Cerrar Sesion</Text>
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
