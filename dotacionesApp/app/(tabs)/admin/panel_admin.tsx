import React from 'react';
import { Text, TouchableOpacity, StyleSheet, ScrollView, View, ImageBackground } from 'react-native';
import { router } from 'expo-router';
import { sesion } from '../../../constants/sesion';

const ROL_COLOR   = '#991B1B';
const ROL_LIGHT   = '#FEE2E2';
const ROL_ICONO   = '🛡️';
const ROL_NOMBRE  = 'Administrador';
const ROL_DESC    = 'Tienes control total del sistema';

const opciones = [
  { icon: '🏠', label: 'Inicio',       ruta: '/admin/panel_admin' },
  { icon: '👥', label: 'Usuarios',     ruta: '/admin/Usuarios' },
  { icon: '👕', label: 'Productos',    ruta: '/admin/Productos' },
  { icon: '📋', label: 'Ver Pedidos',  ruta: '/admin/pedidos' },
  { icon: '📦', label: 'Inventario',   ruta: '/admin/inventario' },
  { icon: '↩️', label: 'Devoluciones', ruta: '/admin/devoluciones' },
];

export default function PanelAdmin() {
  return (
    <ImageBackground
      source={require('../../../assets/images/camiseta.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay} />

      <ScrollView contentContainerStyle={styles.container}>

        {/* Header */}
        <View style={styles.header}>

          {/* Ícono de rol grande */}
          <View style={[styles.rolIconWrap, { backgroundColor: ROL_LIGHT, borderColor: ROL_COLOR }]}>
            <Text style={styles.rolIconText}>{ROL_ICONO}</Text>
          </View>

          {/* Badge de rol */}
          <View style={[styles.badge, { backgroundColor: ROL_COLOR }]}>
            <Text style={styles.badgeText}>{ROL_NOMBRE.toUpperCase()}</Text>
          </View>

          <Text style={styles.title}>Bienvenido, {sesion.nombre}</Text>
          <Text style={styles.subtitle}>{ROL_DESC}</Text>

          {/* Barra de acceso */}
          <View style={[styles.accesoBar, { backgroundColor: ROL_LIGHT, borderColor: ROL_COLOR }]}>
            <Text style={[styles.accesoTexto, { color: ROL_COLOR }]}>
               Nivel de acceso: <Text style={{ fontWeight: '700' }}>Total</Text>
            </Text>
          </View>
        </View>

        {/* Grid */}
        <View style={styles.grid}>
          {opciones.map((op) => (
            <TouchableOpacity
              key={op.label}
              style={[styles.card, { borderColor: ROL_COLOR }]}
              onPress={() => router.push(op.ruta as any)}
              activeOpacity={0.8}
            >
              <View style={[styles.iconWrap, { backgroundColor: ROL_COLOR }]}>
                <Text style={styles.cardIcon}>{op.icon}</Text>
              </View>
              <Text style={styles.cardText}>{op.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Botón cerrar sesión */}
        <TouchableOpacity
          style={[styles.btnSalir, { backgroundColor: ROL_COLOR }]}
          onPress={() => router.replace('/')}
        >
          <Text style={styles.btnSalirText}>🚪 Cerrar Sesión</Text>
        </TouchableOpacity>

      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  overlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
  },
  container: { flexGrow: 1, paddingHorizontal: 20, paddingBottom: 40 },

  header: {
    alignItems: 'center',
    paddingTop: 28, paddingBottom: 24,
    marginBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 1.0)',
    borderRadius: 16,
    paddingHorizontal: 16,
  },
  rolIconWrap: {
    width: 72, height: 72,
    borderRadius: 36,
    borderWidth: 2,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 12,
  },
  rolIconText: { fontSize: 36 },
  badge: {
    borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 5,
    marginBottom: 12,
  },
  badgeText: {
    color: '#F8FAFC', fontSize: 11,
    fontWeight: '700', letterSpacing: 1.5,
  },
  title: {
    fontSize: 20, fontWeight: '600',
    color: '#0F172A', textAlign: 'center', marginBottom: 4,
  },
  subtitle: {
    fontSize: 13, color: '#64748B',
    textAlign: 'center', marginBottom: 14,
  },
  accesoBar: {
    borderRadius: 8, borderWidth: 1,
    paddingHorizontal: 14, paddingVertical: 7,
  },
  accesoTexto: { fontSize: 12 },

  grid: {
    flexDirection: 'row', flexWrap: 'wrap',
    gap: 12, justifyContent: 'center', marginBottom: 8,
  },
  card: {
    width: '46%',
    backgroundColor: 'rgba(255, 255, 255, 1.0)',
    borderRadius: 16, borderWidth: 1.5,
    padding: 20, alignItems: 'center', gap: 10,
  },
  iconWrap: {
    width: 52, height: 52, borderRadius: 13,
    alignItems: 'center', justifyContent: 'center',
  },
  cardIcon: { fontSize: 24 },
  cardText: { fontSize: 13, fontWeight: '600', color: '#0F172A' },

  btnSalir: {
    marginTop: 28, paddingVertical: 14,
    borderRadius: 10, alignItems: 'center',
  },
  btnSalirText: { color: '#F8FAFC', fontWeight: '600', fontSize: 14 },
});