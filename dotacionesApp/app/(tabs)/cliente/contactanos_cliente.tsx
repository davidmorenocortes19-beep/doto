import React, { useState } from 'react';
import { router } from 'expo-router';
import {
    View, Text, TextInput, TouchableOpacity, ScrollView,
    StyleSheet, ImageBackground, SafeAreaView, Linking, Alert,
} from 'react-native';

export default function ContactanosCliente() {
    const [nombre, setNombre] = useState('');
    const [correo, setCorreo] = useState('');
    const [mensaje, setMensaje] = useState('');

    const enviar = () => {
        if (!nombre || !correo || !mensaje) {
            Alert.alert('⚠ Todos los campos son obligatorios');
            return;
        }
        Alert.alert('✅ Mensaje enviado');
        setNombre(''); setCorreo(''); setMensaje('');
    };

    return (
        <ImageBackground
            source={require('../../../assets/images/camiseta.png')}
            style={styles.background}
            resizeMode="cover"
        >
            <View style={styles.overlay} />

            <SafeAreaView style={styles.safeArea}>

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => router.replace('/cliente/panel_cliente')}
                        style={styles.btnVolver}
                    >
                        <Text style={styles.btnVolverTexto}>←</Text>
                    </TouchableOpacity>
                    <View style={styles.logoArea}>
                        <View style={styles.logoCircle}>
                            <Text style={styles.logoInitials}>DT</Text>
                        </View>
                        <Text style={styles.brand}>Contáctanos</Text>
                    </View>
                    <View style={{ width: 44 }} />
                </View>

                <ScrollView contentContainerStyle={styles.scroll}>

                    {/* Formulario */}
                    <View style={styles.seccion}>
                        <Text style={styles.seccionTitulo}>Contáctanos</Text>
                        <Text style={styles.seccionSub}>
                            Si tienes una duda o un reclamo de nuestros productos, por favor
                            llena el siguiente formulario con tus datos.
                        </Text>

                        <TextInput
                            style={styles.input} placeholder="Nombre"
                            placeholderTextColor="#94A3B8" value={nombre}
                            onChangeText={setNombre}
                        />
                        <TextInput
                            style={styles.input} placeholder="Correo"
                            placeholderTextColor="#94A3B8" value={correo}
                            onChangeText={setCorreo} keyboardType="email-address"
                            autoCapitalize="none"
                        />
                        <TextInput
                            style={[styles.input, styles.textArea]} placeholder="Mensaje"
                            placeholderTextColor="#94A3B8" value={mensaje}
                            onChangeText={setMensaje} multiline numberOfLines={5}
                        />

                        <TouchableOpacity style={styles.btnEnviar} onPress={enviar}>
                            <Text style={styles.btnEnviarText}>Enviar</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Info de contacto */}
                    <View style={styles.infoBox}>
                        <TouchableOpacity onPress={() => Linking.openURL('tel:+573212099989')}>
                            <Text style={styles.infoTel}>+57 321 209 9989</Text>
                        </TouchableOpacity>
                        <Text style={styles.infoText}>dotaciones.elobrero@gmail.com</Text>
                        <Text style={styles.infoText}>Carrera 63 Sur #21-12, Bogotá D.C., Colombia</Text>

                        <View style={styles.horario}>
                            <Text style={styles.horarioTitulo}>Horario de Atención</Text>
                            <Text style={styles.horarioText}>Lunes a Viernes: 8am - 6pm</Text>
                            <Text style={styles.horarioText}>Sábado: 9am - 2pm</Text>
                            <Text style={styles.horarioText}>Domingo: Cerrado</Text>
                        </View>

                        <Text style={styles.copy}>Dotaciones Toronto 2026</Text>
                    </View>

                </ScrollView>

                {/* Bottom nav */}
                <View style={styles.bottomNav}>
                    {[
                        { label: 'Inicio', icon: '🏠', route: '/cliente/panel_cliente' },
                        { label: 'Productos', icon: '📦', route: '/cliente/productos_cliente' },
                        { label: 'Pedidos', icon: '📋', route: '/cliente/pedidos' },
                        { label: 'Contáctanos', icon: '✉️', active: true },
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
    background: { flex: 1 },
    overlay: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.10)',
    },
    safeArea: { flex: 1 },

    // Header
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 14, paddingVertical: 12,
        backgroundColor: 'rgba(255, 255, 255, 1.0)',
        borderBottomWidth: 1.5, borderBottomColor: '#1E40AF',
    },
    btnVolver: {
        backgroundColor: '#1E40AF', borderRadius: 8,
        paddingHorizontal: 12, paddingVertical: 4,
    },
    btnVolverTexto: { color: '#F8FAFC', fontSize: 20, fontWeight: '600' },
    logoArea: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    logoCircle: {
        width: 30, height: 30, borderRadius: 15,
        backgroundColor: '#1E40AF', alignItems: 'center', justifyContent: 'center',
    },
    logoInitials: { color: '#F8FAFC', fontWeight: 'bold', fontSize: 10 },
    brand: { color: '#0F172A', fontWeight: '700', fontSize: 15 },

    scroll: { padding: 16, paddingBottom: 24 },

    // Formulario
    seccion: {
        backgroundColor: 'rgba(255, 255, 255, 1.0)',
        borderWidth: 1.5, borderColor: '#1E40AF',
        borderRadius: 12, padding: 16, marginBottom: 14,
    },
    seccionTitulo: { color: '#0F172A', fontWeight: '700', fontSize: 18, marginBottom: 6 },
    seccionSub: { color: '#64748B', fontSize: 12, lineHeight: 18, marginBottom: 16 },
    input: {
        backgroundColor: 'rgba(255, 255, 255, 1.0)',
        borderWidth: 1.5, borderColor: '#1E40AF',
        color: '#0F172A', borderRadius: 8,
        padding: 11, fontSize: 13, marginBottom: 10,
    },
    textArea: { height: 100, textAlignVertical: 'top' },
    btnEnviar: { backgroundColor: '#1E40AF', padding: 13, borderRadius: 8, alignItems: 'center', marginTop: 4 },
    btnEnviarText: { color: '#F8FAFC', fontWeight: '600', fontSize: 14 },

    // Info contacto
    infoBox: {
        backgroundColor: 'rgba(255, 255, 255, 1.0)',
        borderWidth: 1.5, borderColor: '#1E40AF',
        borderRadius: 12, padding: 16, alignItems: 'center',
    },
    infoTel: { color: '#1E40AF', fontWeight: '700', fontSize: 17, marginBottom: 8 },
    infoText: { color: '#64748B', fontSize: 12, marginBottom: 4, textAlign: 'center' },
    horario: { marginTop: 14, alignItems: 'center' },
    horarioTitulo: { color: '#0F172A', fontWeight: '700', fontSize: 13, marginBottom: 8 },
    horarioText: { color: '#64748B', fontSize: 12, marginBottom: 4 },
    copy: { color: '#94A3B8', fontSize: 11, marginTop: 16 },

    // Bottom nav
    bottomNav: {
        flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 8,
        backgroundColor: 'rgba(255, 255, 255, 1.0)',
        borderTopWidth: 1.5, borderTopColor: '#1E40AF',
    },
    bnav: { alignItems: 'center', gap: 2 },
    bnavIcon: { fontSize: 18 },
    bnavLabel: { fontSize: 9, color: '#64748B' },
    bnavActive: { color: '#0F172A', fontWeight: '700' },
});
