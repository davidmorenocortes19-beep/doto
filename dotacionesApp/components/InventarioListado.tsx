import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, ActivityIndicator, Alert
} from 'react-native';
import { router } from 'expo-router';
import axios from 'axios';

const API_URL = 'http://172.30.3.242/doto/api/inventario.php';

type InventarioItem = {
  id_inventario: number;
  id_producto_fk: number;
  nombre: string;
  precio: string;
  talla: string;
  color: string;
  estado: 'Disponible' | 'Agotado';
  cantidad_actual: number;
  stock_minimo: number;
};

type InventarioListadoProps = {
  volverA: string;
  formularioRuta: string;
};

function estadoStock(item: InventarioItem): { texto: string; color: string } {
  if (Number(item.cantidad_actual) <= 0) return { texto: 'Agotado', color: '#333333' };
  if (Number(item.cantidad_actual) <= Number(item.stock_minimo)) {
    return { texto: 'Stock bajo', color: '#333333' };
  }
  return { texto: 'Disponible', color: '#333333' };
}

export default function InventarioListado({ volverA, formularioRuta }: InventarioListadoProps) {
  const [inventario, setInventario] = useState<InventarioItem[]>([]);
  const [filtrados, setFiltrados] = useState<InventarioItem[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const cargarInventario = useCallback(async () => {
    try {
      setCargando(true);
      setError('');
      const res = await axios.get(API_URL, { timeout: 5000 });
      const data: InventarioItem[] = Array.isArray(res.data) ? res.data : [];
      setInventario(data);
      setFiltrados(data);
      setBusqueda('');
    } catch (e: any) {
      if (e.code === 'ECONNABORTED') {
        setError('Tiempo de espera agotado. Verifica que Apache este activo');
      } else if (e.request) {
        setError('Sin respuesta del servidor. Verifica la IP');
      } else {
        setError('Error: ' + e.message);
      }
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarInventario();
  }, [cargarInventario]);

  const resumen = useMemo(() => {
    const agotados = inventario.filter(i => Number(i.cantidad_actual) <= 0).length;
    const stockBajo = inventario.filter(i =>
      Number(i.cantidad_actual) > 0 &&
      Number(i.cantidad_actual) <= Number(i.stock_minimo)
    ).length;

    return { total: inventario.length, stockBajo, agotados };
  }, [inventario]);

  const buscar = (texto: string) => {
    setBusqueda(texto);
    const t = texto.toLowerCase();
    setFiltrados(
      inventario.filter(i =>
        i.nombre.toLowerCase().includes(t) ||
        String(i.id_producto_fk).includes(t) ||
        String(i.cantidad_actual).includes(t) ||
        String(i.stock_minimo).includes(t) ||
        (i.talla ?? '').toLowerCase().includes(t) ||
        (i.color ?? '').toLowerCase().includes(t) ||
        i.estado.toLowerCase().includes(t)
      )
    );
  };

  const editar = (item: InventarioItem) => {
    router.push({
      pathname: formularioRuta as any,
      params: { id: item.id_inventario }
    });
  };

  const eliminar = (item: InventarioItem) => {
    Alert.alert(
      'Eliminar inventario',
      `Deseas eliminar el inventario de "${item.nombre}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await axios.delete(`${API_URL}?id=${item.id_inventario}`, { timeout: 5000 });
              cargarInventario();
            } catch {
              Alert.alert('Error', 'No se pudo eliminar el inventario');
            }
          }
        }
      ]
    );
  };

  const renderInventario = ({ item }: { item: InventarioItem }) => {
    const estado = estadoStock(item);

    return (
      <View style={styles.fila}>
        <View style={styles.infoBloque}>
          <Text style={styles.nombre}>{item.nombre}</Text>
          <Text style={styles.detalle}>ID producto: {item.id_producto_fk}</Text>
          <Text style={styles.detalle}>Precio: ${Number(item.precio).toLocaleString('es-CO')}</Text>
          <Text style={styles.detalle}>Talla: {item.talla || 'N/A'}</Text>
          <Text style={styles.detalle}>Color: {item.color || 'N/A'}</Text>
          <Text style={styles.detalle}>Cantidad actual: {item.cantidad_actual}</Text>
          <Text style={styles.detalle}>Stock minimo: {item.stock_minimo}</Text>
          <View style={[styles.estadoBadge, { backgroundColor: estado.color }]}>
            <Text style={styles.estadoTexto}>{estado.texto}</Text>
          </View>
        </View>

        <View style={styles.acciones}>
          <TouchableOpacity style={styles.btnEditar} onPress={() => editar(item)}>
            <Text style={styles.btnTexto}>Editar</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btnEliminar} onPress={() => eliminar(item)}>
            <Text style={styles.btnTexto}>Eliminar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace(volverA as any)} style={styles.btnVolver}>
          <Text style={styles.btnVolverTexto}>Volver</Text>
        </TouchableOpacity>
        <Text style={styles.titulo}>Inventario</Text>
        <TouchableOpacity
          style={styles.btnAgregar}
          onPress={() => router.push(formularioRuta as any)}
        >
          <Text style={styles.btnAgregarTexto}>Registrar</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.resumenContenedor}>
        <View style={styles.resumenCard}>
          <Text style={styles.resumenValor}>{resumen.total}</Text>
          <Text style={styles.resumenLabel}>Registros</Text>
        </View>
        <View style={styles.resumenCard}>
          <Text style={[styles.resumenValor, { color: '#333333' }]}>{resumen.stockBajo}</Text>
          <Text style={styles.resumenLabel}>Stock bajo</Text>
        </View>
        <View style={styles.resumenCard}>
          <Text style={[styles.resumenValor, { color: '#333333' }]}>{resumen.agotados}</Text>
          <Text style={styles.resumenLabel}>Agotados</Text>
        </View>
      </View>

      <View style={styles.buscadorContenedor}>
        <TextInput
          style={styles.buscador}
          placeholder="Buscar por producto, ID, talla, color o estado..."
          placeholderTextColor="#333333"
          value={busqueda}
          onChangeText={buscar}
        />
      </View>

      {cargando && (
        <ActivityIndicator size="large" color="#B7975B" style={{ marginTop: 30 }} />
      )}
      {error !== '' && <Text style={styles.error}>{error}</Text>}
      {!cargando && filtrados.length === 0 && error === '' && (
        <Text style={styles.sinResultados}>No se encontraron registros de inventario</Text>
      )}

      <FlatList
        data={filtrados}
        keyExtractor={(item) => item.id_inventario.toString()}
        renderItem={renderInventario}
        contentContainerStyle={styles.lista}
        onRefresh={cargarInventario}
        refreshing={cargando}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingTop: 50, backgroundColor: '#F8F9FA' },
  titulo: { fontSize: 20, fontWeight: 'bold', color: '#333333' },
  btnVolver: { padding: 8 },
  btnVolverTexto: { color: '#333333', fontSize: 14 },
  btnAgregar: { backgroundColor: '#B7975B', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  btnAgregarTexto: { color: '#333333', fontWeight: 'bold', fontSize: 13 },
  resumenContenedor: { flexDirection: 'row', gap: 8, paddingHorizontal: 12, paddingTop: 12 },
  resumenCard: { flex: 1, backgroundColor: '#F8F9FA', borderRadius: 10, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#333333' },
  resumenValor: { color: '#333333', fontSize: 24, fontWeight: 'bold' },
  resumenLabel: { color: '#333333', fontSize: 11, marginTop: 2, textAlign: 'center' },
  buscadorContenedor: { padding: 12 },
  buscador: { backgroundColor: '#F8F9FA', color: '#333333', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#333333', fontSize: 14 },
  lista: { paddingHorizontal: 12, paddingBottom: 20 },
  fila: { backgroundColor: '#F8F9FA', borderRadius: 10, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#333333' },
  infoBloque: { marginBottom: 12 },
  nombre: { fontSize: 16, fontWeight: 'bold', color: '#333333', marginBottom: 4 },
  detalle: { color: '#333333', fontSize: 13, marginBottom: 2 },
  estadoBadge: { marginTop: 6, alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  estadoTexto: { color: '#333333', fontWeight: 'bold', fontSize: 12 },
  acciones: { flexDirection: 'row', gap: 10 },
  btnEditar: { flex: 1, backgroundColor: '#B7975B', padding: 10, borderRadius: 8, alignItems: 'center' },
  btnEliminar: { flex: 1, backgroundColor: '#B7975B', padding: 10, borderRadius: 8, alignItems: 'center' },
  btnTexto: { color: '#333333', fontWeight: 'bold', fontSize: 13 },
  error: { color: '#333333', textAlign: 'center', marginTop: 20, fontSize: 14 },
  sinResultados: { color: '#333333', textAlign: 'center', marginTop: 30, fontSize: 14 },
});
