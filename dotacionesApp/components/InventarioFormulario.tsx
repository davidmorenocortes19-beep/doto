import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, ScrollView, ImageBackground
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import axios from 'axios';

const API_URL = 'http://192.168.1.19/doto/api/inventario.php';
const PRODUCTOS_API_URL = 'http://192.168.1.19/doto/api/productos.php';

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

type ProductoCatalogo = {
  id_producto: number;
  nombre: string;
  precio: string;
  talla: string;
  color: string;
  estado: 'Disponible' | 'Agotado';
};

type InventarioFormularioProps = {
  listadoRuta: string;
};

export default function InventarioFormulario({ listadoRuta }: InventarioFormularioProps) {
  const params = useLocalSearchParams();
  const idParam = Array.isArray(params.id) ? params.id[0] : params.id;
  const idInventario = idParam ? Number(idParam) : null;

  const [inventario, setInventario] = useState<InventarioItem[]>([]);
  const [productos, setProductos] = useState<ProductoCatalogo[]>([]);
  const [idProducto, setIdProducto] = useState('');
  const [productoBusqueda, setProductoBusqueda] = useState('');
  const [cantidadActual, setCantidadActual] = useState('');
  const [stockMinimo, setStockMinimo] = useState('');
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  const esEdicion = Boolean(idInventario);

  const cargarDatos = useCallback(async () => {
    try {
      setCargando(true);
      setError('');
      const [productosRes, inventarioRes] = await Promise.all([
        axios.get(PRODUCTOS_API_URL, { timeout: 5000 }),
        axios.get(API_URL, { timeout: 5000 }),
      ]);

      setProductos(Array.isArray(productosRes.data) ? productosRes.data : []);
      setInventario(Array.isArray(inventarioRes.data) ? inventarioRes.data : []);

      if (idInventario) {
        const itemRes = await axios.get(`${API_URL}?id=${idInventario}`, { timeout: 5000 });
        const item: InventarioItem = itemRes.data;
        setIdProducto(String(item.id_producto_fk));
        setProductoBusqueda(item.nombre ?? '');
        setCantidadActual(String(item.cantidad_actual ?? ''));
        setStockMinimo(String(item.stock_minimo ?? ''));
      }
    } catch (e: any) {
      if (e.response?.data?.error) {
        setError(e.response.data.error);
      } else if (e.request) {
        setError('Sin respuesta del servidor. Verifica la IP');
      } else {
        setError('Error: ' + e.message);
      }
    } finally {
      setCargando(false);
    }
  }, [idInventario]);

  useEffect(() => { cargarDatos(); }, [cargarDatos]);

  const productosRegistradosIds = useMemo(() => new Set(
    inventario
      .filter(i => !idInventario || i.id_inventario !== idInventario)
      .map(i => Number(i.id_producto_fk))
  ), [idInventario, inventario]);

  const productosDisponibles = useMemo(
    () => productos.filter(p => !productosRegistradosIds.has(Number(p.id_producto))),
    [productos, productosRegistradosIds]
  );

  const productosFiltrados = useMemo(() => {
    const t = productoBusqueda.trim().toLowerCase();
    if (!t) return productosDisponibles.slice(0, 8);
    return productosDisponibles
      .filter(p =>
        p.nombre.toLowerCase().includes(t) ||
        String(p.id_producto).includes(t) ||
        (p.talla ?? '').toLowerCase().includes(t) ||
        (p.color ?? '').toLowerCase().includes(t)
      )
      .slice(0, 8);
  }, [productoBusqueda, productosDisponibles]);

  useEffect(() => {
    const t = productoBusqueda.trim().toLowerCase();
    if (!t || idProducto) return;
    const productoExacto = productosDisponibles.find(p =>
      p.nombre.toLowerCase() === t || String(p.id_producto) === t
    );
    if (productoExacto) setIdProducto(String(productoExacto.id_producto));
  }, [idProducto, productoBusqueda, productosDisponibles]);

  const validarFormulario = () => {
    if (!idProducto) return 'Selecciona un producto de la lista';
    if (!cantidadActual || !stockMinimo) return 'Cantidad actual y stock minimo son obligatorios';
    if (!/^[0-9]+$/.test(idProducto)) return 'El ID del producto debe ser numerico';
    if (!/^[0-9]+$/.test(cantidadActual)) return 'La cantidad actual debe ser numerica';
    if (!/^[0-9]+$/.test(stockMinimo)) return 'El stock minimo debe ser numerico';
    if (Number(idProducto) <= 0) return 'El ID del producto debe ser mayor a 0';
    return null;
  };

  const guardarInventario = async () => {
    const errorFormulario = validarFormulario();
    if (errorFormulario) { setMensaje(errorFormulario); return; }

    const payload = {
      id_inventario: idInventario,
      id_producto_fk: Number(idProducto),
      cantidad_actual: Number(cantidadActual),
      stock_minimo: Number(stockMinimo),
    };

    try {
      setGuardando(true);
      setMensaje('');
      setError('');

      if (idInventario) {
        await axios.put(API_URL, payload, { headers: { 'Content-Type': 'application/json' }, timeout: 5000 });
        setMensaje('Inventario actualizado correctamente');
      } else {
        await axios.post(API_URL, payload, { headers: { 'Content-Type': 'application/json' }, timeout: 5000 });
        setMensaje('Inventario registrado correctamente');
      }

      setTimeout(() => router.push(listadoRuta as any), 900);
    } catch (e: any) {
      if (e.response) {
        setMensaje(e.response.data?.error ?? 'No se pudo guardar el inventario');
      } else if (e.request) {
        setMensaje('Sin respuesta del servidor');
      } else {
        setMensaje('Error: ' + e.message);
      }
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <ImageBackground
        source={require('../assets/images/camiseta.png')}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.overlay} />
        <View style={styles.centrado}>
          <ActivityIndicator size="large" color="#1E293B" />
          <Text style={styles.cargandoTexto}>Cargando inventario...</Text>
        </View>
      </ImageBackground>
    );
  }

  if (error) {
    return (
      <ImageBackground
        source={require('../assets/images/camiseta.png')}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.overlay} />
        <View style={styles.centrado}>
          <Text style={styles.error}>{error}</Text>
          <TouchableOpacity onPress={cargarDatos} style={styles.btnReintentar}>
            <Text style={styles.btnReintentarTexto}>Reintentar</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push(listadoRuta as any)} style={styles.btnCancelar}>
            <Text style={styles.btnCancelarTexto}>Volver</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={require('../assets/images/camiseta.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay} />

      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.push(listadoRuta as any)} style={styles.btnVolver}>
            <Text style={styles.btnVolverTexto}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.titulo}>{esEdicion ? 'Editar inventario' : 'Registrar inventario'}</Text>
          <View style={{ width: 70 }} />
        </View>

        <ScrollView contentContainerStyle={styles.formulario} keyboardShouldPersistTaps="handled">

          <Text style={styles.label}>Producto</Text>
          <TextInput
            style={styles.input}
            placeholder="Buscar producto por nombre, talla, color o ID..."
            placeholderTextColor="#94A3B8"
            value={productoBusqueda}
            onChangeText={(text) => {
              setProductoBusqueda(text);
              setIdProducto('');
            }}
          />

          {productosFiltrados.length > 0 ? (
            <View style={styles.productosSelector}>
              {productosFiltrados.map((producto) => {
                const activo = idProducto === String(producto.id_producto);
                return (
                  <TouchableOpacity
                    key={producto.id_producto}
                    style={[styles.productoOpcion, activo && styles.productoOpcionActiva]}
                    onPress={() => {
                      setIdProducto(String(producto.id_producto));
                      setProductoBusqueda(producto.nombre);
                    }}
                  >
                    <Text style={[styles.productoNombre, activo && styles.productoNombreActivo]}>
                      {producto.nombre}
                    </Text>
                    <Text style={[styles.productoDetalle, activo && styles.productoDetalleActivo]}>
                      ID {producto.id_producto} | Talla {producto.talla || 'N/A'} | Color {producto.color || 'N/A'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            <Text style={styles.sinProductos}>No hay productos disponibles para registrar</Text>
          )}

          {idProducto !== '' && (
            <Text style={styles.productoSeleccionado}>✅ Producto seleccionado: ID {idProducto}</Text>
          )}

          <Text style={styles.label}>Cantidad actual</Text>
          <TextInput
            style={styles.input}
            placeholder="Cantidad actual"
            placeholderTextColor="#94A3B8"
            keyboardType="numeric"
            value={cantidadActual}
            onChangeText={(text) => setCantidadActual(text.replace(/[^0-9]/g, ''))}
          />

          <Text style={styles.label}>Stock mínimo</Text>
          <TextInput
            style={styles.input}
            placeholder="Stock mínimo"
            placeholderTextColor="#94A3B8"
            keyboardType="numeric"
            value={stockMinimo}
            onChangeText={(text) => setStockMinimo(text.replace(/[^0-9]/g, ''))}
          />

          {mensaje !== '' && <Text style={styles.mensaje}>{mensaje}</Text>}

          <TouchableOpacity
            style={[styles.btnGuardar, guardando && { opacity: 0.7 }]}
            onPress={guardarInventario}
            disabled={guardando}
          >
            {guardando
              ? <ActivityIndicator color="#F8FAFC" />
              : <Text style={styles.btnGuardarTexto}>{esEdicion ? 'Actualizar' : 'Registrar'}</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={styles.btnCancelar} onPress={() => router.push(listadoRuta as any)}>
            <Text style={styles.btnCancelarTexto}>Cancelar</Text>
          </TouchableOpacity>

        </ScrollView>
      </View>
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
  container: { flex: 1 },
  centrado: {
    flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20,
  },
  cargandoTexto: { color: '#0F172A', marginTop: 10, fontSize: 14 },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16, paddingTop: 50,
    backgroundColor: 'rgba(255, 255, 255, 1.0)',
    borderBottomWidth: 1.5, borderBottomColor: '#1E293B',
  },
  titulo:         { fontSize: 18, fontWeight: '600', color: '#0F172A' },
  btnVolver:      { padding: 8, backgroundColor: '#1E293B', borderRadius: 8, width: 70, alignItems: 'center' },
  btnVolverTexto: { color: '#F8FAFC', fontSize: 13, fontWeight: '600' },

  // Formulario
  formulario: { padding: 16, paddingBottom: 40 },
  label: {
    color: '#0F172A', fontSize: 13, fontWeight: '600',
    marginBottom: 6, marginTop: 12,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 1.0)',
    color: '#0F172A', padding: 12, borderRadius: 10,
    marginBottom: 8, borderWidth: 1.5, borderColor: '#1E293B', fontSize: 14,
  },

  // Selector de productos
  productosSelector: { marginBottom: 8, gap: 6 },
  productoOpcion: {
    backgroundColor: 'rgba(255, 255, 255, 1.0)',
    borderWidth: 1.5, borderColor: '#1E293B',
    borderRadius: 10, padding: 10,
  },
  productoOpcionActiva: { backgroundColor: '#1E293B', borderColor: '#1E293B' },
  productoNombre:       { color: '#0F172A', fontWeight: '600', fontSize: 13 },
  productoNombreActivo: { color: '#F8FAFC' },
  productoDetalle:      { color: '#64748B', fontSize: 11, marginTop: 2 },
  productoDetalleActivo:{ color: '#CBD5E1' },
  productoSeleccionado: { color: '#16A34A', fontSize: 12, marginBottom: 8, fontWeight: '600' },
  sinProductos:         { color: '#64748B', fontSize: 12, textAlign: 'center', marginBottom: 8 },

  // Botones
  btnGuardar: {
    backgroundColor: '#1E293B', padding: 14,
    borderRadius: 10, alignItems: 'center', marginTop: 18,
  },
  btnGuardarTexto: { color: '#F8FAFC', fontWeight: '600', fontSize: 14 },
  btnCancelar:     { padding: 12, alignItems: 'center', marginTop: 4 },
  btnCancelarTexto:{ color: '#64748B', textDecorationLine: 'underline', fontSize: 13 },
  btnReintentar:   {
    backgroundColor: '#1E293B', paddingHorizontal: 16,
    paddingVertical: 10, borderRadius: 8, marginTop: 16,
  },
  btnReintentarTexto: { color: '#F8FAFC', fontWeight: '600' },

  // Feedback
  mensaje: { color: '#0F172A', textAlign: 'center', marginTop: 8, fontSize: 13, fontWeight: '500' },
  error:   { color: '#DC2626', textAlign: 'center', fontSize: 14, paddingHorizontal: 20 },
});