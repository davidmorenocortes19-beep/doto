import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, ActivityIndicator, Alert
} from 'react-native';
import { router } from 'expo-router';
import axios from 'axios';

const API_URL = 'http://172.30.2.10/dota/api/inventario.php';
const PRODUCTOS_API_URL = 'http://172.30.2.10/dota/api/productos.php';

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

function estadoStock(item: InventarioItem): { texto: string; color: string } {
  if (Number(item.cantidad_actual) <= 0) {
    return { texto: 'Agotado', color: '#e74c3c' };
  }

  if (Number(item.cantidad_actual) <= Number(item.stock_minimo)) {
    return { texto: 'Stock bajo', color: '#f39c12' };
  }

  return { texto: 'Disponible', color: '#2ecc71' };
}

export default function InventarioAdminScreen() {
  const [inventario, setInventario] = useState<InventarioItem[]>([]);
  const [filtrados, setFiltrados] = useState<InventarioItem[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [productos, setProductos] = useState<ProductoCatalogo[]>([]);
  const [productoBusqueda, setProductoBusqueda] = useState('');

  const [idInventario, setIdInventario] = useState<number | null>(null);
  const [idProducto, setIdProducto] = useState('');
  const [cantidadActual, setCantidadActual] = useState('');
  const [stockMinimo, setStockMinimo] = useState('');

  const cargarProductos = useCallback(async () => {
    try {
      const res = await axios.get(PRODUCTOS_API_URL, { timeout: 5000 });
      setProductos(Array.isArray(res.data) ? res.data : []);
    } catch {
      setProductos([]);
    }
  }, []);

  const cargarInventario = useCallback(async () => {
    try {
      setCargando(true);
      setError('');
      const res = await axios.get(API_URL, { timeout: 5000 });
      const data: InventarioItem[] = Array.isArray(res.data) ? res.data : [];
      setInventario(data);
      setFiltrados(data);
    } catch (e: any) {
      if (e.code === 'ECONNABORTED') {
        setError('Tiempo de espera agotado. Verifica que Apache esté activo');
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
    cargarProductos();
  }, [cargarInventario, cargarProductos]);

  const productosRegistradosIds = useMemo(() => new Set(
    inventario
      .filter(i => !idInventario || i.id_inventario !== idInventario)
      .map(i => Number(i.id_producto_fk))
  ), [idInventario, inventario]);

  const productosDisponibles = useMemo(
    () => productos.filter(p => !productosRegistradosIds.has(Number(p.id_producto))),
    [productos, productosRegistradosIds]
  );

  const productoRegistradoBuscado = useMemo(() => {
    const t = productoBusqueda.trim().toLowerCase();
    if (!t) return null;

    return productos.find(p =>
      productosRegistradosIds.has(Number(p.id_producto)) &&
      (
        p.nombre.toLowerCase() === t ||
        String(p.id_producto) === t
      )
    ) ?? null;
  }, [productoBusqueda, productos, productosRegistradosIds]);

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

  const limpiarFormulario = () => {
    setIdInventario(null);
    setIdProducto('');
    setProductoBusqueda('');
    setCantidadActual('');
    setStockMinimo('');
  };

  const validarFormulario = () => {
    if (!idProducto || !cantidadActual || !stockMinimo) {
      return 'Todos los campos del inventario son obligatorios';
    }

    if (!/^[0-9]+$/.test(idProducto)) return 'El ID del producto debe ser numérico';
    if (!/^[0-9]+$/.test(cantidadActual)) return 'La cantidad actual debe ser numérica';
    if (!/^[0-9]+$/.test(stockMinimo)) return 'El stock mínimo debe ser numérico';
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

      limpiarFormulario();
      cargarInventario();
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

  const editar = (item: InventarioItem) => {
    setIdInventario(item.id_inventario);
    setIdProducto(String(item.id_producto_fk));
    setProductoBusqueda(item.nombre);
    setCantidadActual(String(item.cantidad_actual));
    setStockMinimo(String(item.stock_minimo));
    setMensaje('');
  };

  const eliminar = (item: InventarioItem) => {
    Alert.alert(
      'Eliminar inventario',
      `¿Deseas eliminar el inventario de "${item.nombre}"?`,
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
          <Text style={styles.detalle}>Stock mínimo: {item.stock_minimo}</Text>
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
        <TouchableOpacity onPress={() => router.replace('/admin/panel_admin')} style={styles.btnVolver}>
          <Text style={styles.btnVolverTexto}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.titulo}>Inventario</Text>
        <TouchableOpacity style={styles.btnAgregar} onPress={cargarInventario}>
          <Text style={styles.btnAgregarTexto}>Recargar</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.resumenContenedor}>
        <View style={styles.resumenCard}>
          <Text style={styles.resumenValor}>{resumen.total}</Text>
          <Text style={styles.resumenLabel}>Registros</Text>
        </View>
        <View style={styles.resumenCard}>
          <Text style={[styles.resumenValor, { color: '#f39c12' }]}>{resumen.stockBajo}</Text>
          <Text style={styles.resumenLabel}>Stock bajo</Text>
        </View>
        <View style={styles.resumenCard}>
          <Text style={[styles.resumenValor, { color: '#e74c3c' }]}>{resumen.agotados}</Text>
          <Text style={styles.resumenLabel}>Agotados</Text>
        </View>
      </View>

      <View style={styles.formulario}>
        <Text style={styles.formTitulo}>{idInventario ? 'Editar inventario' : 'Registrar inventario'}</Text>

        <TextInput
          style={styles.input}
          placeholder="Buscar producto por nombre, talla, color o ID..."
          placeholderTextColor="#999"
          value={productoBusqueda}
          onChangeText={(text) => {
            setProductoBusqueda(text);
            setIdProducto('');
          }}
        />

        {productosFiltrados.length > 0 && (
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
        )}

        {idProducto !== '' && (
          <Text style={styles.productoSeleccionado}>Producto seleccionado: ID {idProducto}</Text>
        )}

        <TextInput
          style={styles.input}
          placeholder="Cantidad actual"
          placeholderTextColor="#999"
          keyboardType="numeric"
          value={cantidadActual}
          onChangeText={(text) => setCantidadActual(text.replace(/[^0-9]/g, ''))}
        />
        <TextInput
          style={styles.input}
          placeholder="Stock mínimo"
          placeholderTextColor="#999"
          keyboardType="numeric"
          value={stockMinimo}
          onChangeText={(text) => setStockMinimo(text.replace(/[^0-9]/g, ''))}
        />

        <TouchableOpacity
          style={[styles.btnGuardar, guardando && { opacity: 0.7 }]}
          onPress={guardarInventario}
          disabled={guardando}
        >
          {guardando
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.btnGuardarTexto}>{idInventario ? 'Actualizar' : 'Registrar'}</Text>}
        </TouchableOpacity>

        {idInventario && (
          <TouchableOpacity style={styles.btnCancelar} onPress={limpiarFormulario}>
            <Text style={styles.btnCancelarTexto}>Cancelar edición</Text>
          </TouchableOpacity>
        )}
      </View>

      {mensaje !== '' && <Text style={styles.mensaje}>{mensaje}</Text>}

      <View style={styles.buscadorContenedor}>
        <TextInput
          style={styles.buscador}
          placeholder="Buscar por producto, ID, talla, color o estado..."
          placeholderTextColor="#999"
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
  container:          { flex: 1, backgroundColor: '#09080D' },
  header:             { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingTop: 50, backgroundColor: '#000' },
  titulo:             { fontSize: 20, fontWeight: 'bold', color: '#B7975B' },
  btnVolver:          { padding: 8 },
  btnVolverTexto:     { color: '#B7975B', fontSize: 14 },
  btnAgregar:         { backgroundColor: '#B7975B', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  btnAgregarTexto:    { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  resumenContenedor:  { flexDirection: 'row', gap: 8, paddingHorizontal: 12, paddingTop: 12 },
  resumenCard:        { flex: 1, backgroundColor: '#1a1a2e', borderRadius: 10, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#B7975B' },
  resumenValor:       { color: '#B7975B', fontSize: 24, fontWeight: 'bold' },
  resumenLabel:       { color: '#ccc', fontSize: 11, marginTop: 2, textAlign: 'center' },
  formulario:         { margin: 12, backgroundColor: '#1a1a2e', borderRadius: 10, padding: 14, borderWidth: 1, borderColor: '#B7975B' },
  formTitulo:         { color: '#B7975B', fontWeight: 'bold', fontSize: 16, marginBottom: 10 },
  input:              { backgroundColor: '#fff', padding: 12, borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: '#ccc', fontSize: 14 },
  productosSelector:  { marginBottom: 8, gap: 6 },
  productoOpcion:     { backgroundColor: '#0d0d1a', borderWidth: 1, borderColor: '#333', borderRadius: 8, padding: 10 },
  productoOpcionActiva:{ backgroundColor: '#B7975B', borderColor: '#B7975B' },
  productoNombre:     { color: '#B7975B', fontWeight: 'bold', fontSize: 13 },
  productoNombreActivo:{ color: '#fff' },
  productoDetalle:    { color: '#aaa', fontSize: 11, marginTop: 2 },
  productoDetalleActivo:{ color: '#fff' },
  productoSeleccionado:{ color: '#2ecc71', fontSize: 12, marginBottom: 8 },
  btnGuardar:         { backgroundColor: '#B7975B', padding: 13, borderRadius: 8, alignItems: 'center', marginTop: 4 },
  btnGuardarTexto:    { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  btnCancelar:        { padding: 10, alignItems: 'center' },
  btnCancelarTexto:   { color: '#B7975B', textDecorationLine: 'underline', fontSize: 13 },
  mensaje:            { color: '#eee', textAlign: 'center', marginHorizontal: 12, marginBottom: 8, fontSize: 13 },
  buscadorContenedor: { padding: 12, paddingTop: 0 },
  buscador:           { backgroundColor: '#1a1a2e', color: '#fff', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#B7975B', fontSize: 14 },
  lista:              { paddingHorizontal: 12, paddingBottom: 20 },
  fila:               { backgroundColor: '#1a1a2e', borderRadius: 10, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#B7975B' },
  infoBloque:         { marginBottom: 12 },
  nombre:             { fontSize: 16, fontWeight: 'bold', color: '#B7975B', marginBottom: 4 },
  detalle:            { color: '#ccc', fontSize: 13, marginBottom: 2 },
  estadoBadge:        { marginTop: 6, alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  estadoTexto:        { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  acciones:           { flexDirection: 'row', gap: 10 },
  btnEditar:          { flex: 1, backgroundColor: '#e67e22', padding: 10, borderRadius: 8, alignItems: 'center' },
  btnEliminar:        { flex: 1, backgroundColor: '#e74c3c', padding: 10, borderRadius: 8, alignItems: 'center' },
  btnTexto:           { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  error:              { color: '#e74c3c', textAlign: 'center', marginTop: 20, fontSize: 14 },
  sinResultados:      { color: '#aaa', textAlign: 'center', marginTop: 30, fontSize: 14 },
});
