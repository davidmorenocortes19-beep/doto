import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, FlatList, Alert
} from 'react-native';
import { router } from 'expo-router';
import axios from 'axios';

const API_URL = 'http://192.168.40.8/doto/api/inventario.php';
const PRODUCTOS_API_URL = 'http://192.168.40.8/doto/api/productos.php';

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

function getEstado(item: InventarioItem): { label: string; color: string } {
  if (Number(item.cantidad_actual) <= 0) return { label: 'Agotado', color: '#e74c3c' };
  if (Number(item.cantidad_actual) <= Number(item.stock_minimo)) return { label: 'Stock bajo', color: '#f39c12' };
  return { label: 'Disponible', color: '#2ecc71' };
}

export default function InventarioScreen() {
  const [items, setItems] = useState<InventarioItem[]>([]);
  const [filtrados, setFiltrados] = useState<InventarioItem[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [idInventario, setIdInventario] = useState<number | null>(null);
  const [idProducto, setIdProducto] = useState('');
  const [cantidadActual, setCantidadActual] = useState('');
  const [stockMinimo, setStockMinimo] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [productos, setProductos] = useState<ProductoCatalogo[]>([]);
  const [productoBusqueda, setProductoBusqueda] = useState('');

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
      setMensaje('');
      const res = await axios.get(API_URL, { timeout: 5000 });
      const data: InventarioItem[] = Array.isArray(res.data) ? res.data : [];
      setItems(data);
      setFiltrados(data);
    } catch (error: any) {
      if (error.code === 'ECONNABORTED') {
        setMensaje('Tiempo de espera agotado. Verifica que Apache esté activo');
      } else if (error.request) {
        setMensaje('Sin respuesta del servidor. Verifica la IP');
      } else {
        setMensaje('Error: ' + error.message);
      }
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarInventario();
    cargarProductos();
  }, [cargarInventario, cargarProductos]);

  const productosFiltrados = useMemo(() => {
    const t = productoBusqueda.trim().toLowerCase();

    if (!t) return productos.slice(0, 6);

    return productos
      .filter((producto) =>
        producto.nombre.toLowerCase().includes(t) ||
        String(producto.id_producto).includes(t) ||
        (producto.talla ?? '').toLowerCase().includes(t) ||
        (producto.color ?? '').toLowerCase().includes(t)
      )
      .slice(0, 6);
  }, [productoBusqueda, productos]);

  const resumen = useMemo(() => {
    const agotados = items.filter((item) => Number(item.cantidad_actual) <= 0).length;
    const bajos = items.filter((item) =>
      Number(item.cantidad_actual) > 0 &&
      Number(item.cantidad_actual) <= Number(item.stock_minimo)
    ).length;

    return { total: items.length, agotados, bajos };
  }, [items]);

  const buscar = (texto: string) => {
    setBusqueda(texto);
    const t = texto.toLowerCase();
    setFiltrados(
      items.filter((item) =>
        item.nombre.toLowerCase().includes(t) ||
        String(item.id_producto_fk).includes(t) ||
        String(item.cantidad_actual).includes(t) ||
        item.estado.toLowerCase().includes(t) ||
        (item.talla ?? '').toLowerCase().includes(t) ||
        (item.color ?? '').toLowerCase().includes(t)
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
      return 'Todos los campos son obligatorios';
    }

    if (!/^[0-9]+$/.test(idProducto)) return 'El ID del producto debe ser numérico';
    if (!/^[0-9]+$/.test(cantidadActual)) return 'La cantidad actual debe ser numérica';
    if (!/^[0-9]+$/.test(stockMinimo)) return 'El stock mínimo debe ser numérico';
    if (Number(idProducto) <= 0) return 'El ID del producto debe ser mayor a 0';

    return null;
  };

  const guardarInventario = async () => {
    const error = validarFormulario();
    if (error) {
      setMensaje(error);
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
        setMensaje('Inventario creado correctamente');
      }

      limpiarFormulario();
      cargarInventario();
    } catch (error: any) {
      if (error.response) {
        setMensaje(error.response.data?.error ?? 'No se pudo guardar el inventario');
      } else {
        setMensaje('Sin respuesta del servidor');
      }
    } finally {
      setGuardando(false);
    }
  };

  const editar = (item: InventarioItem) => {
    setIdInventario(Number(item.id_inventario));
    setIdProducto(String(item.id_producto_fk));
    setProductoBusqueda(item.nombre);
    setCantidadActual(String(item.cantidad_actual));
    setStockMinimo(String(item.stock_minimo));
    setMensaje('');
  };

  const confirmarEliminar = (item: InventarioItem) => {
    Alert.alert(
      'Eliminar inventario',
      `¿Deseas eliminar el inventario de "${item.nombre}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => eliminar(item.id_inventario),
        },
      ]
    );
  };

  const eliminar = async (id: number) => {
    try {
      setCargando(true);
      await axios.delete(`${API_URL}?id=${id}`, { timeout: 5000 });
      setMensaje('Inventario eliminado correctamente');
      cargarInventario();
    } catch (error: any) {
      if (error.response) {
        setMensaje(error.response.data?.error ?? 'No se pudo eliminar el inventario');
      } else {
        setMensaje('Sin respuesta del servidor');
      }
    } finally {
      setCargando(false);
    }
  };

  const renderItem = ({ item }: { item: InventarioItem }) => {
    const estado = getEstado(item);

    return (
      <View style={[styles.fila, { borderLeftColor: estado.color }]}>
        <View style={styles.infoBloque}>
          <View style={styles.filaHeader}>
            <Text style={styles.nombre}>{item.nombre}</Text>
            <View style={[styles.estadoBadge, { backgroundColor: estado.color }]}>
              <Text style={styles.estadoTexto}>{estado.label}</Text>
            </View>
          </View>

          <Text style={styles.detalle}>ID producto: {item.id_producto_fk}</Text>
          <Text style={styles.detalle}>Precio: ${Number(item.precio).toLocaleString('es-CO')}</Text>
          <Text style={styles.detalle}>Talla: {item.talla || 'N/A'} | Color: {item.color || 'N/A'}</Text>
          <Text style={styles.stock}>Cantidad actual: {item.cantidad_actual}</Text>
          <Text style={styles.detalle}>Stock mínimo: {item.stock_minimo}</Text>
        </View>

        <View style={styles.acciones}>
          <TouchableOpacity style={styles.btnEditar} onPress={() => editar(item)}>
            <Text style={styles.btnTexto}>Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnEliminar} onPress={() => confirmarEliminar(item)}>
            <Text style={styles.btnTexto}>Eliminar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/bodeguero/panel_bodeguero')} style={styles.btnVolver}>
          <Text style={styles.btnVolverTexto}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.titulo}>Inventario</Text>
        <TouchableOpacity style={styles.btnRecargar} onPress={cargarInventario}>
          <Text style={styles.btnRecargarTexto}>Recargar</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.resumen}>
        <View style={styles.statCard}>
          <Text style={styles.statValor}>{resumen.total}</Text>
          <Text style={styles.statLabel}>Registros</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValor, { color: '#f39c12' }]}>{resumen.bajos}</Text>
          <Text style={styles.statLabel}>Stock bajo</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValor, { color: '#e74c3c' }]}>{resumen.agotados}</Text>
          <Text style={styles.statLabel}>Agotados</Text>
        </View>
      </View>

      <View style={styles.formulario}>
        <Text style={styles.formTitle}>{idInventario ? 'Editar inventario' : 'Registrar inventario'}</Text>

        <TextInput
          placeholder="Buscar producto por nombre, talla, color o ID..."
          placeholderTextColor="#999"
          style={styles.input}
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
          placeholder="Cantidad actual"
          placeholderTextColor="#999"
          style={styles.input}
          keyboardType="numeric"
          value={cantidadActual}
          onChangeText={(text) => setCantidadActual(text.replace(/[^0-9]/g, ''))}
        />
        <TextInput
          placeholder="Stock mínimo"
          placeholderTextColor="#999"
          style={styles.input}
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
        <ActivityIndicator size="large" color="#B7975B" style={{ marginTop: 20 }} />
      )}

      {!cargando && filtrados.length === 0 && (
        <Text style={styles.sinResultados}>No se encontraron registros de inventario</Text>
      )}

      <FlatList
        data={filtrados}
        keyExtractor={(item) => item.id_inventario.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.lista}
        onRefresh={cargarInventario}
        refreshing={cargando}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09080D' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingTop: 50, backgroundColor: '#000' },
  titulo: { fontSize: 20, fontWeight: 'bold', color: '#B7975B' },
  btnVolver: { padding: 8 },
  btnVolverTexto: { color: '#B7975B', fontSize: 14 },
  btnRecargar: { backgroundColor: '#B7975B', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  btnRecargarTexto: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  resumen: { flexDirection: 'row', gap: 8, paddingHorizontal: 12, paddingTop: 12 },
  statCard: { flex: 1, backgroundColor: '#1a1a2e', borderRadius: 8, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#333' },
  statValor: { color: '#B7975B', fontSize: 24, fontWeight: 'bold' },
  statLabel: { color: '#aaa', fontSize: 11, textAlign: 'center', marginTop: 2 },
  formulario: { margin: 12, backgroundColor: '#1a1a2e', borderRadius: 10, padding: 14, borderWidth: 1, borderColor: '#B7975B' },
  formTitle: { color: '#B7975B', fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  input: { backgroundColor: '#fff', padding: 12, borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: '#ccc', fontSize: 14 },
  productosSelector: { marginBottom: 8, gap: 6 },
  productoOpcion: { backgroundColor: '#0d0d1a', borderWidth: 1, borderColor: '#333', borderRadius: 8, padding: 10 },
  productoOpcionActiva: { backgroundColor: '#B7975B', borderColor: '#B7975B' },
  productoNombre: { color: '#B7975B', fontWeight: 'bold', fontSize: 13 },
  productoNombreActivo: { color: '#fff' },
  productoDetalle: { color: '#aaa', fontSize: 11, marginTop: 2 },
  productoDetalleActivo: { color: '#fff' },
  productoSeleccionado: { color: '#2ecc71', fontSize: 12, marginBottom: 8 },
  btnGuardar: { backgroundColor: '#B7975B', padding: 13, borderRadius: 8, alignItems: 'center', marginTop: 4 },
  btnGuardarTexto: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  btnCancelar: { padding: 10, alignItems: 'center' },
  btnCancelarTexto: { color: '#B7975B', textDecorationLine: 'underline', fontSize: 13 },
  mensaje: { color: '#eee', textAlign: 'center', marginHorizontal: 12, marginBottom: 8, fontSize: 13 },
  buscadorContenedor: { paddingHorizontal: 12, paddingBottom: 12 },
  buscador: { backgroundColor: '#1a1a2e', color: '#fff', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#B7975B', fontSize: 14 },
  lista: { paddingHorizontal: 12, paddingBottom: 20 },
  fila: { backgroundColor: '#1a1a2e', borderRadius: 10, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#333', borderLeftWidth: 4 },
  filaHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 4 },
  infoBloque: { marginBottom: 12 },
  nombre: { flex: 1, fontSize: 16, fontWeight: 'bold', color: '#B7975B' },
  detalle: { color: '#ccc', fontSize: 13, marginBottom: 2 },
  stock: { color: '#fff', fontSize: 14, fontWeight: 'bold', marginTop: 4, marginBottom: 2 },
  estadoBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  estadoTexto: { color: '#fff', fontWeight: 'bold', fontSize: 11 },
  acciones: { flexDirection: 'row', gap: 10 },
  btnEditar: { flex: 1, backgroundColor: '#e67e22', padding: 10, borderRadius: 8, alignItems: 'center' },
  btnEliminar: { flex: 1, backgroundColor: '#e74c3c', padding: 10, borderRadius: 8, alignItems: 'center' },
  btnTexto: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  sinResultados: { color: '#aaa', textAlign: 'center', marginTop: 20, fontSize: 14 },
});
