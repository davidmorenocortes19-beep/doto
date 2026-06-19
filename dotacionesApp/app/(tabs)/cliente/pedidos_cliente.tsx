import React, { useState, useEffect } from 'react';
import { router } from 'expo-router';
import {
    View, Text, TouchableOpacity, FlatList,
    StyleSheet, ImageBackground, SafeAreaView, RefreshControl,
} from 'react-native';
import axios from 'axios';
import { sesion } from '../../../constants/sesion';

const API_PEDIDOS = 'http://192.168.137.9/doto/api/pedidos.php';

type ProductoPedido = {
    id_producto_fk: number;
    nombre: string;
    precio_unitario: number;
    cantidad: number;
};

type Pedido = {
    id_pedido: number;
    fecha_pedido: string;
    estado: string;
    productos: ProductoPedido[];
    total: number;
};

export default function PedidosCliente() {
    const [pedidos, setPedidos] = useState<Pedido[]>([]);
    const [cargando, setCargando] = useState(false);

    useEffect(() => { cargar(); }, []);

    const cargar = async () => {
        setCargando(true);
        try {
            const res = await axios.get(API_PEDIDOS, {
                params: { id_usuario: sesion.id },
                timeout: 5000,
            });
            const data: Pedido[] = Array.isArray(res.data) ? res.data : [];
            setPedidos(data);
        } catch {
            // sin servidor
        } finally {
            setCargando(false);
        }
    };

    const formatearFecha = (fecha: string) => {
        const d = new Date(fecha);
        if (isNaN(d.getTime())) return fecha;
        return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const colorEstado = (estado: string) => {
        switch (estado.toLowerCase()) {
            case 'pendiente': return { bg: '#FEF9C3', border: '#CA8A04', text: '#854D0E' };
            case 'completado':
            case 'entregado': return { bg: '#DCFCE7', border: '#16A34A', text: '#166534' };
            case 'cancelado': return { bg: '#FEE2E2', border: '#DC2626', text: '#991B1B' };
            default: return { bg: '#E2E8F0', border: '#64748B', text: '#334155' };
        }
    };

    const renderPedido = ({ item }: { item: Pedido }) => {
        const estadoColor = colorEstado(item.estado);
        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <Text style={styles.cardId}>Pedido #{item.id_pedido}</Text>
                    <View style={[styles.estadoBadge, { backgroundColor: estadoColor.bg, borderColor: estadoColor.border }]}>
                        <Text style={[styles.estadoText, { color: estadoColor.text }]}>{item.estado}</Text>
                    </View>
                </View>

                <Text style={styles.cardFecha}>{formatearFecha(item.fecha_pedido)}</Text>

                <View style={styles.divider} />

                {item.productos.map((p, idx) => (
                    <View key={idx} style={styles.productoRow}>
                        <Text style={styles.productoNombre} numberOfLines={1}>
                            {p.cantidad} x {p.nombre}
                        </Text>
                        <Text style={styles.productoPrecio}>
                            ${Number(p.precio_unitario * p.cantidad).toLocaleString('es-CO')}
                        </Text>
                    </View>
                ))}

                <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Total</Text>
                    <Text style={styles.totalValor}>${Number(item.total).toLocaleString('es-CO')}</Text>
                </View>
            </View>
        );
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
                        <Text style={styles.brand}>Mis Pedidos</Text>
                    </View>
                    <View style={{ width: 36 }} />
                </View>

                {/* Lista de pedidos */}
                <FlatList
                    data={pedidos}
                    keyExtractor={item => item.id_pedido.toString()}
                    renderItem={renderPedido}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={cargando} onRefresh={cargar} />
                    }
                    ListEmptyComponent={
                        <Text style={styles.empty}>Aún no tienes pedidos realizados</Text>
                    }
                />

                {/* Bottom nav */}
                <View style={styles.bottomNav}>
                    {[
                        { label: 'Inicio', icon: '🏠', route: '/cliente/panel_cliente' },
                        { label: 'Productos', icon: '📦', route: '/cliente/productos_cliente' },
                        { label: 'Pedidos', icon: '📋', active: true },
                        { label: 'Perfil', icon: '👤', route: '/cliente/perfil_cliente' },
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
        borderBottomWidth: 1.5, borderBottomColor: '#1E293B',
    },
    btnVolver: {
        backgroundColor: '#1E293B', borderRadius: 8,
        paddingHorizontal: 12, paddingVertical: 4,
    },
    btnVolverTexto: { color: '#F8FAFC', fontSize: 20, fontWeight: '600' },
    logoArea: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    logoCircle: {
        width: 30, height: 30, borderRadius: 15,
        backgroundColor: '#1E293B', alignItems: 'center', justifyContent: 'center',
    },
    logoInitials: { color: '#F8FAFC', fontWeight: 'bold', fontSize: 10 },
    brand: { color: '#0F172A', fontWeight: '700', fontSize: 15 },

    // Lista
    listContent: { padding: 14, paddingBottom: 24 },
    empty: { color: '#0F172A', textAlign: 'center', marginTop: 40, fontSize: 13 },

    // Card de pedido
    card: {
        backgroundColor: 'rgba(255, 255, 255, 1.0)',
        borderWidth: 1.5, borderColor: '#1E293B',
        borderRadius: 12, padding: 14,
        marginBottom: 12,
    },
    cardHeader: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: 4,
    },
    cardId: { color: '#0F172A', fontWeight: '700', fontSize: 14 },
    cardFecha: { color: '#64748B', fontSize: 11, marginBottom: 10 },

    estadoBadge: {
        borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3,
        borderWidth: 1,
    },
    estadoText: { fontSize: 10, fontWeight: 'bold' },

    divider: {
        height: 1, backgroundColor: '#E2E8F0', marginBottom: 8,
    },

    productoRow: {
        flexDirection: 'row', justifyContent: 'space-between',
        marginBottom: 4,
    },
    productoNombre: { color: '#334155', fontSize: 12, flex: 1, marginRight: 8 },
    productoPrecio: { color: '#0F172A', fontSize: 12, fontWeight: '600' },

    totalRow: {
        flexDirection: 'row', justifyContent: 'space-between',
        paddingTop: 10, marginTop: 6,
        borderTopWidth: 1, borderTopColor: '#E2E8F0',
    },
    totalLabel: { color: '#0F172A', fontWeight: 'bold', fontSize: 13 },
    totalValor: { color: '#0F172A', fontWeight: 'bold', fontSize: 15 },

    // Bottom nav
    bottomNav: {
        flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 10,
        backgroundColor: 'rgba(255, 255, 255, 1.0)',
        borderTopWidth: 1.5, borderTopColor: '#1E293B',
    },
    bnav: { alignItems: 'center', gap: 2 },
    bnavIcon: { fontSize: 18 },
    bnavLabel: { fontSize: 9, color: '#64748B' },
    bnavActive: { color: '#0F172A', fontWeight: '700' },
});
