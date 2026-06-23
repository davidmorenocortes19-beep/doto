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
  { icon: '\u{21A9}\u{FE0F}', label: 'Devoluciones', ruta: '/admin/devoluciones_admin' },
];

export default function PanelAdmin() {
  return (
    <ImageBackground
      source={require('../../../assets/images/camiseta.png')}
      style={styles.background}
      resizeMode="cover"
    >
      {/* Overlay blanco semitransparente sobre la imagen */}
      <View style={styles.overlay} />

      <ScrollView contentContainerStyle={styles.container}>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>PANEL ADMIN</Text>
          </View>
          <Text style={styles.title}>
            Bienvenido, {sesion.nombre}
          </Text>
          <Text style={styles.subtitle}>Tienes acceso total al sistema</Text>
        </View>

        {/* Grid de opciones */}
        <View style={styles.grid}>
          {opciones.map((op) => (
            <TouchableOpacity
              key={op.label}
              style={styles.card}
              onPress={() => router.push(op.ruta as any)}
              activeOpacity={0.8}
            >
              <View style={styles.iconWrap}>
                <Text style={styles.cardIcon}>{op.icon}</Text>
              </View>
              <Text style={styles.cardText}>{op.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Botón cerrar sesión */}
        <TouchableOpacity style={styles.btnSalir} onPress={() => router.replace('/')}>
          <Text style={styles.btnSalirText}>{'\u{1F6AA}'} Cerrar Sesión</Text>
        </TouchableOpacity>

      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  // Header
  header: {
    alignItems: 'center',
    paddingTop: 28,
    paddingBottom: 28,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(100, 116, 139, 0.2)',
    marginBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 1.0)',  // agrega esto
    borderRadius: 16,
    paddingHorizontal: 16,
  },
  badge: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 4,
    marginBottom: 14,
  },
  badgeText: {
    color: '#F8FAFC',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.5,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
  },

  // Grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
    marginBottom: 8,
  },
  card: {
    width: '46%',
    backgroundColor: 'rgba(255, 255, 255, 1.0)',
    borderRadius: 16,
    borderWidth: 3.0,                        // antes 0.5
    borderColor: '#1E293B',                  // antes rgba(100, 116, 139, 0.25)
    padding: 20,
    alignItems: 'center',
    gap: 10,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 13,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardIcon: {
    fontSize: 24,
  },
  cardText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },

  // Botón salir
  btnSalir: {
    marginTop: 28,
    backgroundColor: '#1E293B',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnSalirText: {
    color: '#F8FAFC',
    fontWeight: '600',
    fontSize: 14,
  },
});