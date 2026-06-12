import React, { useState } from 'react';
import { router } from 'expo-router';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, ImageBackground, SafeAreaView, Linking,
} from 'react-native';

export default function NosotrosCliente() {
  const [nombre,  setNombre]  = useState('');
  const [correo,  setCorreo]  = useState('');
  const [mensaje, setMensaje] = useState('');

  const enviarContacto = () => {
    if (!nombre || !correo || !mensaje) {
      alert('⚠ Todos los campos son obligatorios');
      return;
    }
    alert('Mensaje enviado ✅');
    setNombre(''); setCorreo(''); setMensaje('');
  };

  return (
    <ImageBackground
      source={require('../../../assets/images/camiseta.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safeArea}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.replace('/cliente/panel_cliente')}>
            <Text style={styles.backBtn}>←</Text>
          </TouchableOpacity>
          <View style={styles.logoArea}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoInitials}>DT</Text>
            </View>
            <Text style={styles.brand}>Dotaciones Toronto</Text>
          </View>
          <View style={{ width: 32 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll}>

          {/* mision */}
          <View style={styles.visionBox}>
            <Text style={styles.visionTitle}>Mision</Text>
            <Text style={styles.visionText}>
              Nuestra misión es actuar como un aliado estratégico de las empresas e 
              industrias colombianas que buscan proteger a sus trabajadores con productos
               diseñados para resistir, proteger y facilitar el desempeño diario en entornos de alto riesgo o demanda física.
                Nos enfocamos en crear dotaciones que no solo cumplan con 
                los estándares técnicos y normativos de seguridad, sino que 
                también contribuyan al bienestar físico y emocional del trabajador al brindar comodidad y funcionalidad.
            </Text>
          </View>
          
          
          
          
          {/* Visión */}
          <View style={styles.visionBox}>
            <Text style={styles.visionTitle}>Visión</Text>
            <Text style={styles.visionText}>
              Nuestra visión se proyecta hacia una meta clara y alcanzable:
              posicionarnos en los próximos años como un referente dentro del
              mercado bogotano de dotaciones industriales. En una ciudad tan
              diversa y dinámica como Bogotá, buscamos diferenciarnos no solo
              por el volumen de producción, sino por el valor agregado que
              ofrecemos: productos de excelente calidad, atención personalizada
              y una filosofía centrada en el bienestar y la seguridad del trabajador.
            </Text>
          </View>

          {/* Contacto */}
          <View style={styles.seccion}>
            <Text style={styles.seccionTitulo}>Contáctanos</Text>
            <Text style={styles.contactoSub}>
              Si tienes una duda o reclamo sobre nuestros productos, llena el siguiente formulario.
            </Text>

            <TextInput style={styles.input} placeholder="Nombre"
              placeholderTextColor="#333333" value={nombre} onChangeText={setNombre} />
            <TextInput style={styles.input} placeholder="Correo"
              placeholderTextColor="#333333" value={correo} onChangeText={setCorreo}
              keyboardType="email-address" autoCapitalize="none" />
            <TextInput style={[styles.input, styles.textArea]} placeholder="Mensaje"
              placeholderTextColor="#333333" value={mensaje} onChangeText={setMensaje}
              multiline numberOfLines={4} />

            <TouchableOpacity style={styles.btnEnviar} onPress={enviarContacto}>
              <Text style={styles.btnEnviarText}>Enviar</Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity onPress={() => Linking.openURL('tel:+573212099989')}>
              <Text style={styles.footerTel}>+57 321 209 9989</Text>
            </TouchableOpacity>
            <Text style={styles.footerInfo}>dotaciones.elobrero@gmail.com</Text>
            <Text style={styles.footerInfo}>Carrera 63 Sur #21-12, Bogotá D.C., Colombia</Text>
            <View style={styles.horario}>
              <Text style={styles.horarioTitulo}>Horario de Atención</Text>
              <Text style={styles.horarioText}>Lunes a Viernes: 8am - 6pm</Text>
              <Text style={styles.horarioText}>Sábado: 9am - 2pm</Text>
              <Text style={styles.horarioText}>Domingo: Cerrado</Text>
            </View>
            <Text style={styles.footerCopy}>Dotaciones Toronto 2026</Text>
          </View>

        </ScrollView>

        {/* Bottom nav */}
        <View style={styles.bottomNav}>
          {[
            { label: 'Inicio',    icon: '🏠', route: '/cliente/index_cliente' },
            { label: 'Productos', icon: '📦', route: '/cliente/productos' },
            { label: 'Pedidos',   icon: '📋', route: '/cliente/pedidos' },
            { label: 'Nosotros',  icon: 'ℹ️',  active: true },
          ].map(item => (
            <TouchableOpacity
              key={item.label}
              style={styles.bnav}
              onPress={() => item.route && router.push(item.route as any)}
            >
              <Text style={styles.bnavIcon}>{item.icon}</Text>
              <Text style={[styles.bnavLabel, item.active && styles.bnavActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background:    { flex: 1 },
  safeArea:      { flex: 1, backgroundColor: 'rgba(248,249,250,0.96)' },

  header:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#333333', backgroundColor: 'rgba(248,249,250,0.97)' },
  backBtn:       { color: '#333333', fontSize: 22, paddingHorizontal: 4 },
  logoArea:      { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoCircle:    { width: 32, height: 32, borderRadius: 16, backgroundColor: '#B7975B', alignItems: 'center', justifyContent: 'center' },
  logoInitials:  { color: '#333333', fontWeight: 'bold', fontSize: 11 },
  brand:         { color: '#333333', fontWeight: 'bold', fontSize: 14 },

  scroll:        { paddingBottom: 24 },

  hero:          { alignItems: 'center', padding: 28, borderBottomWidth: 1, borderBottomColor: '#333333' },
  heroBadge:     { backgroundColor: '#B7975B22', borderWidth: 1, borderColor: '#333333', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4, marginBottom: 12 },
  heroBadgeText: { color: '#333333', fontSize: 12 },
  heroTitle:     { color: '#333333', fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 12 },
  heroDesc:      { color: '#333333', fontSize: 13, textAlign: 'center', lineHeight: 21, paddingHorizontal: 4 },

  visionBox:     { margin: 16, backgroundColor: 'rgba(183,151,91,0.08)', borderWidth: 1, borderColor: '#333333', borderRadius: 12, padding: 16 },
  visionTitle:   { color: '#333333', fontWeight: 'bold', fontSize: 18, marginBottom: 10 },
  visionText:    { color: '#333333', fontSize: 13, lineHeight: 21 },

  seccion:       { marginHorizontal: 16, backgroundColor: '#F8F9FA', borderWidth: 1, borderColor: '#333333', borderRadius: 12, padding: 14, marginBottom: 14 },
  seccionTitulo: { color: '#333333', fontWeight: 'bold', fontSize: 16, marginBottom: 6 },
  contactoSub:   { color: '#333333', fontSize: 12, marginBottom: 12, lineHeight: 18 },
  input:         { backgroundColor: '#F8F9FA', borderWidth: 1, borderColor: '#333333', color: '#333333', borderRadius: 8, padding: 11, fontSize: 13, marginBottom: 10 },
  textArea:      { height: 90, textAlignVertical: 'top' },
  btnEnviar:     { backgroundColor: '#B7975B', padding: 13, borderRadius: 8, alignItems: 'center', marginTop: 4 },
  btnEnviarText: { color: '#333333', fontWeight: 'bold', fontSize: 14 },

  footer:        { marginHorizontal: 16, backgroundColor: '#F8F9FA', borderWidth: 1, borderColor: '#333333', borderRadius: 12, padding: 16, marginBottom: 8, alignItems: 'center' },
  footerTel:     { color: '#333333', fontWeight: 'bold', fontSize: 16, marginBottom: 6 },
  footerInfo:    { color: '#333333', fontSize: 12, marginBottom: 4, textAlign: 'center' },
  horario:       { marginTop: 12, alignItems: 'center' },
  horarioTitulo: { color: '#333333', fontWeight: 'bold', fontSize: 13, marginBottom: 6 },
  horarioText:   { color: '#333333', fontSize: 12, marginBottom: 3 },
  footerCopy:    { color: '#333333', fontSize: 11, marginTop: 14 },

  bottomNav:     { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#333333', backgroundColor: 'rgba(248,249,250,0.98)' },
  bnav:          { alignItems: 'center', gap: 2 },
  bnavIcon:      { fontSize: 18 },
  bnavLabel:     { fontSize: 9, color: '#333333' },
  bnavActive:    { color: '#333333' },
});
