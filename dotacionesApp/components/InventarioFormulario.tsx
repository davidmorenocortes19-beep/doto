import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, ScrollView
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

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

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
      p.nombre.toLowerCase() === t ||
      String(p.id_producto) === t
    );

    if (productoExacto) {
      setIdProducto(String(productoExacto.id_producto));
    }
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
    if (errorFormulario) {
      setMensaje(errorFormulario);
      return;
    }

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
        await axios.put(API_URL, payload, {
          headers: { 'Content-Type': 'application/json' },
          timeout: 5000,
        });
        setMensaje('Inventario actualizado correctamente');
      } else {
        await axios.post(API_URL, payload, {
          headers: { 'Content-Type': 'application/json' },
          timeout: 5000,
        });
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
      <View style={styles.centrado}>
        <ActivityIndicator size="large" color="#B7975B" />
        <Text style={styles.cargandoTexto}>Cargando inventario...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centrado}>
        <Text style={styles.error}>{error}</Text>
        <TouchableOpacity onPress={cargarDatos} style={styles.btnReintentar}>
          <Text style={styles.btnReintentarTexto}>Reintentar</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push(listadoRuta as any)} style={styles.btnCancelar}>
          <Text style={styles.btnCancelarTexto}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push(listadoRuta as any)} style={styles.btnVolver}>
          <Text style={styles.btnVolverTexto}>Volver</Text>
        </TouchableOpacity>
        <Text style={styles.titulo}>{esEdicion ? 'Editar inventario' : 'Registrar inventario'}</Text>
        <View style={{ width: 70 }} />
      </View>

      <ScrollView contentContainerStyle={styles.formulario} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Producto</Text>
        <TextInput
          style={styles.input}
          placeholder="Buscar producto por nombre, talla, color o ID..."
          placeholderTextColor="#333333"
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
          <Text style={styles.productoSeleccionado}>Producto seleccionado: ID {idProducto}</Text>
        )}

        <Text style={styles.label}>Cantidad actual</Text>
        <TextInput
          style={styles.input}
          placeholder="Cantidad actual"
          placeholderTextColor="#333333"
          keyboardType="numeric"
          value={cantidadActual}
          onChangeText={(text) => setCantidadActual(text.replace(/[^0-9]/g, ''))}
        />

        <Text style={styles.label}>Stock minimo</Text>
        <TextInput
          style={styles.input}
          placeholder="Stock minimo"
          placeholderTextColor="#333333"
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
            ? <ActivityIndicator color="#333333" />
            : <Text style={styles.btnGuardarTexto}>{esEdicion ? 'Actualizar' : 'Registrar'}</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnCancelar} onPress={() => router.push(listadoRuta as any)}>
          <Text style={styles.btnCancelarTexto}>Cancelar</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  centrado: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F9FA', padding: 20 },
  cargandoTexto: { color: '#333333', marginTop: 10 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingTop: 50, backgroundColor: '#F8F9FA' },
  titulo: { fontSize: 20, fontWeight: 'bold', color: '#333333' },
  btnVolver: { padding: 8 },
  btnVolverTexto: { color: '#333333', fontSize: 14 },
  formulario: { padding: 16, paddingBottom: 40 },
  label: { color: '#333333', fontSize: 13, fontWeight: 'bold', marginBottom: 6, marginTop: 12 },
  input: { backgroundColor: '#F8F9FA', color: '#333333', padding: 12, borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: '#333333', fontSize: 14 },
  productosSelector: { marginBottom: 8, gap: 6 },
  productoOpcion: { backgroundColor: '#F8F9FA', borderWidth: 1, borderColor: '#333333', borderRadius: 8, padding: 10 },
  productoOpcionActiva: { backgroundColor: '#B7975B', borderColor: '#333333' },
  productoNombre: { color: '#333333', fontWeight: 'bold', fontSize: 13 },
  productoNombreActivo: { color: '#333333' },
  productoDetalle: { color: '#333333', fontSize: 11, marginTop: 2 },
  productoDetalleActivo: { color: '#333333' },
  productoSeleccionado: { color: '#333333', fontSize: 12, marginBottom: 8 },
  sinProductos: { color: '#333333', fontSize: 12, textAlign: 'center', marginBottom: 8 },
  btnGuardar: { backgroundColor: '#B7975B', padding: 13, borderRadius: 8, alignItems: 'center', marginTop: 18 },
  btnGuardarTexto: { color: '#333333', fontWeight: 'bold', fontSize: 14 },
  btnCancelar: { padding: 12, alignItems: 'center' },
  btnCancelarTexto: { color: '#333333', textDecorationLine: 'underline', fontSize: 13 },
  btnReintentar: { backgroundColor: '#B7975B', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, marginTop: 16 },
  btnReintentarTexto: { color: '#333333', fontWeight: 'bold' },
  mensaje: { color: '#333333', textAlign: 'center', marginTop: 8, fontSize: 13 },
  error: { color: '#333333', textAlign: 'center', fontSize: 14 },
});
