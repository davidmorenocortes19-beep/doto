import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, ActivityIndicator, Alert
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import axios from 'axios';

const API_URL = 'http://192.168.1.19/doto/api/inventario.php';
const PRODUCTOS_API_URL = 'http://192.168.1.19/doto/api/productos.php';

type RolInventario = 'admin' | 'bodeguero';

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

type RutasInventario = {
  panel: string;
  formulario: string;
  registros: string;
};

function rutasPorRol(rol: RolInventario): RutasInventario {
  return rol === 'admin'
    ? { panel: '/admin/panel_admin', formulario: '/admin/inventario', registros: '/admin/inventario_registros' }
    : { panel: '/bodeguero/panel_bodeguero', formulario: '/bodeguero/inventario', registros: '/bodeguero/inventario_registros' };
}

function estadoStock(item: InventarioItem): { texto: string; badge: string } {
  if (Number(item.cantidad_actual) <= 0)
    return { texto: 'Agotado',    badge: '#DC2626' };
  if (Number(item.cantidad_actual) <= Number(item.stock_minimo))
    return { texto: 'Stock bajo', badge: '#D97706' };
  return   { texto: 'Disponible', badge: '#1E293B' };
}

function useInventarioData() {
  const [inventario, setInventario] = useState<InventarioItem[]>([]);
  const [productos,  setProductos]  = useState<ProductoCatalogo[]>([]);
  const [cargando,   setCargando]   = useState(false);
  const [error,      setError]      = useState('');

  const cargarProductos = useCallback(async () => {
    try {
      const res = await axios.get(PRODUCTOS_API_URL, { timeout: 5000 });
      setProductos(Array.isArray(res.data) ? res.data : []);
    } catch { setProductos([]); }
  }, []);

  const cargarInventario = useCallback(async () => {
    try {
      setCargando(true);
      setError('');
      const res = await axios.get(API_URL, { timeout: 5000 });
      setInventario(Array.isArray(res.data) ? res.data : []);
    } catch (e: any) {
      if (e.code === 'ECONNABORTED') setError('Tiempo de espera agotado. Verifica que Apache esté activo');
      else if (e.request)            setError('Sin respuesta del servidor. Verifica la IP');
      else                           setError('Error: ' + e.message);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarInventario();
    cargarProductos();
  }, [cargarInventario, cargarProductos]);

  return { inventario, productos, cargando, error, cargarInventario };
}

export function InventarioFormularioScreen({ rol }: { rol: RolInventario }) {
  const rutas = rutasPorRol(rol);
  const params = useLocalSearchParams();
  const idParam  = Array.isArray(params.id) ? params.id[0] : params.id;
  const idEditar = idParam ? Number(idParam) : null;

  const { inventario, productos, cargando, error, cargarInventario } = useInventarioData();
  const [guardando,        setGuardando]        = useState(false);
  const [mensaje,          setMensaje]          = useState('');
  const [productoBusqueda, setProductoBusqueda] = useState('');
  const [idInventario,     setIdInventario]     = useState<number | null>(idEditar);
  const [idProducto,       setIdProducto]       = useState('');
  const [cantidadActual,   setCantidadActual]   = useState('');
  const [stockMinimo,      setStockMinimo]      = useState('');

  useEffect(() => {
    if (!idEditar || inventario.length === 0) return;
    const item = inventario.find(i => Number(i.id_inventario) === idEditar);
    if (!item) return;
    setIdInventario(item.id_inventario);
    setIdProducto(String(item.id_producto_fk));
    setProductoBusqueda(item.nombre);
    setCantidadActual(String(item.cantidad_actual));
    setStockMinimo(String(item.stock_minimo));
  }, [idEditar, inventario]);

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
    return productosDisponibles.filter(p =>
      p.nombre.toLowerCase().includes(t) ||
      String(p.id_producto).includes(t) ||
      (p.talla ?? '').toLowerCase().includes(t) ||
      (p.color ?? '').toLowerCase().includes(t)
    ).slice(0, 8);
  }, [productoBusqueda, productosDisponibles]);

  useEffect(() => {
    const t = productoBusqueda.trim().toLowerCase();
    if (!t || idProducto) return;
    const exacto = productosDisponibles.find(p =>
      p.nombre.toLowerCase() === t || String(p.id_producto) === t
    );
    if (exacto) setIdProducto(String(exacto.id_producto));
  }, [idProducto, productoBusqueda, productosDisponibles]);

  const limpiarFormulario = () => {
    setIdInventario(null);
    setIdProducto('');
    setProductoBusqueda('');
    setCantidadActual('');
    setStockMinimo('');
  };

  const validarFormulario = () => {
    if (!idProducto)                           return 'Selecciona un producto de la lista';
    if (!cantidadActual || !stockMinimo)       return 'Cantidad actual y stock mínimo son obligatorios';
    if (!/^[0-9]+$/.test(idProducto))         return 'El ID del producto debe ser numérico';
    if (!/^[0-9]+$/.test(cantidadActual))     return 'La cantidad actual debe ser numérica';
    if (!/^[0-9]+$/.test(stockMinimo))        return 'El stock mínimo debe ser numérico';
    if (Number(idProducto) <= 0)              return 'El ID del producto debe ser mayor a 0';
    return null;
  };

  const guardarInventario = async () => {
    const errorFormulario = validarFormulario();
    if (errorFormulario) { setMensaje(errorFormulario); return; }

    const payload = {
      id_inventario:   idInventario,
      id_producto_fk:  Number(idProducto),
      cantidad_actual: Number(cantidadActual),
      stock_minimo:    Number(stockMinimo),
    };

    try {
      setGuardando(true);
      setMensaje('');

      if (idInventario) {
        await axios.put(API_URL, payload, { headers: { 'Content-Type': 'application/json' }, timeout: 5000 });
        setMensaje('✅ Inventario actualizado correctamente');
        setTimeout(() => router.replace(rutas.registros as any), 900);
      } else {
        await axios.post(API_URL, payload, { headers: { 'Content-Type': 'application/json' }, timeout: 5000 });
        setMensaje('✅ Inventario registrado correctamente');
        limpiarFormulario();
        cargarInventario();
      }
    } catch (e: any) {
      if (e.response)      setMensaje(e.response.data?.error ?? 'No se pudo guardar el inventario');
      else if (e.request)  setMensaje('Sin respuesta del servidor');
      else                 setMensaje('Error: ' + e.message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace(rutas.panel as any)} style={styles.btnVolver}>
          <Text style={styles.btnVolverTexto}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.titulo}>Inventario</Text>
        <TouchableOpacity style={styles.btnAgregar} onPress={() => router.push(rutas.registros as any)}>
          <Text style={styles.btnAgregarTexto}>Registros</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.formulario}>
        <Text style={styles.formTitulo}>{idInventario ? 'Editar inventario' : 'Registrar inventario'}</Text>

        <TextInput
          style={styles.input}
          placeholder="Buscar producto por nombre, talla, color o ID..."
          placeholderTextColor="#94A3B8"
          value={productoBusqueda}
          onChangeText={(text) => { setProductoBusqueda(text); setIdProducto(''); }}
        />

        {productosFiltrados.length > 0 ? (
          <View style={styles.productosSelector}>
            {productosFiltrados.map((producto) => {
              const activo = idProducto === String(producto.id_producto);
              return (
                <TouchableOpacity
                  key={producto.id_producto}
                  style={[styles.productoOpcion, activo && styles.productoOpcionActiva]}
                  onPress={() => { setIdProducto(String(producto.id_producto)); setProductoBusqueda(producto.nombre); }}
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

        <TextInput
          style={styles.input}
          placeholder="Cantidad actual"
          placeholderTextColor="#94A3B8"
          keyboardType="numeric"
          value={cantidadActual}
          onChangeText={(text) => setCantidadActual(text.replace(/[^0-9]/g, ''))}
        />
        <TextInput
          style={styles.input}
          placeholder="Stock mínimo"
          placeholderTextColor="#94A3B8"
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
            ? <ActivityIndicator color="#F8FAFC" />
            : <Text style={styles.btnGuardarTexto}>{idInventario ? 'Actualizar' : 'Registrar'}</Text>}
        </TouchableOpacity>

        {idInventario && (
          <TouchableOpacity style={styles.btnCancelar} onPress={limpiarFormulario}>
            <Text style={styles.btnCancelarTexto}>Cancelar edición</Text>
          </TouchableOpacity>
        )}
      </View>

      {cargando && <ActivityIndicator size="large" color="#1E293B" style={{ marginTop: 20 }} />}
      {error   !== '' && <Text style={styles.error}>{error}</Text>}
      {mensaje !== '' && <Text style={styles.mensaje}>{mensaje}</Text>}
    </View>
  );
}

export function InventarioRegistrosScreen({ rol }: { rol: RolInventario }) {
  const rutas = rutasPorRol(rol);
  const { inventario, cargando, error, cargarInventario } = useInventarioData();
  const [busqueda, setBusqueda] = useState('');

  const resumen = useMemo(() => {
    const agotados  = inventario.filter(i => Number(i.cantidad_actual) <= 0).length;
    const stockBajo = inventario.filter(i =>
      Number(i.cantidad_actual) > 0 &&
      Number(i.cantidad_actual) <= Number(i.stock_minimo)
    ).length;
    return { total: inventario.length, stockBajo, agotados };
  }, [inventario]);

  const filtrados = useMemo(() => {
    const t = busqueda.toLowerCase();
    return inventario.filter(i =>
      i.nombre.toLowerCase().includes(t) ||
      String(i.id_producto_fk).includes(t) ||
      String(i.cantidad_actual).includes(t) ||
      String(i.stock_minimo).includes(t) ||
      (i.talla ?? '').toLowerCase().includes(t) ||
      (i.color ?? '').toLowerCase().includes(t) ||
      i.estado.toLowerCase().includes(t)
    );
  }, [busqueda, inventario]);

  const eliminar = (item: InventarioItem) => {
    Alert.alert(
      'Eliminar inventario',
      `¿Deseas eliminar el inventario de "${item.nombre}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar', style: 'destructive',
          onPress: async () => {
            try {
              await axios.delete(`${API_URL}?id=${item.id_inventario}`, { timeout: 5000 });
              cargarInventario();
            } catch { Alert.alert('Error', 'No se pudo eliminar el inventario'); }
          }
        }
      ]
    );
  };

  const editar = (item: InventarioItem) => {
    router.push({ pathname: rutas.formulario as any, params: { id: item.id_inventario } });
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
          <View style={[styles.estadoBadge, { backgroundColor: estado.badge }]}>
            <Text style={styles.estadoTexto}>{estado.texto}</Text>
          </View>
        </View>
        <View style={styles.acciones}>
          <TouchableOpacity style={styles.btnEditar}   onPress={() => editar(item)}>
            <Text style={styles.btnTexto}>✏️ Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnEliminar} onPress={() => eliminar(item)}>
            <Text style={styles.btnTexto}>🗑️ Eliminar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace(rutas.formulario as any)} style={styles.btnVolver}>
          <Text style={styles.btnVolverTexto}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.titulo}>Registros</Text>
        <TouchableOpacity style={styles.btnAgregar} onPress={cargarInventario}>
          <Text style={styles.btnAgregarTexto}>🔄 Recargar</Text>
        </TouchableOpacity>
      </View>

      {/* RESUMEN */}
      <View style={styles.resumenContenedor}>
        <View style={styles.resumenCard}>
          <Text style={styles.resumenValor}>{resumen.total}</Text>
          <Text style={styles.resumenLabel}>Registros</Text>
        </View>
        <View style={styles.resumenCard}>
          <Text style={[styles.resumenValor, { color: '#D97706' }]}>{resumen.stockBajo}</Text>
          <Text style={styles.resumenLabel}>Stock bajo</Text>
        </View>
        <View style={styles.resumenCard}>
          <Text style={[styles.resumenValor, { color: '#DC2626' }]}>{resumen.agotados}</Text>
          <Text style={styles.resumenLabel}>Agotados</Text>
        </View>
      </View>

      {/* BUSCADOR */}
      <View style={styles.buscadorContenedor}>
        <TextInput
          style={styles.buscador}
          placeholder="Buscar por producto, ID, talla, color o estado..."
          placeholderTextColor="#94A3B8"
          value={busqueda}
          onChangeText={setBusqueda}
        />
      </View>

      {cargando && <ActivityIndicator size="large" color="#1E293B" style={{ marginTop: 30 }} />}
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
  container: { flex: 1, backgroundColor: '#F8FAFC' },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16, paddingTop: 50,
    backgroundColor: 'rgba(255,255,255,1.0)',
    borderBottomWidth: 1.5, borderBottomColor: '#1E293B',
  },
  titulo:          { fontSize: 20, fontWeight: '600', color: '#0F172A' },
  btnVolver:       { padding: 8, backgroundColor: '#1E293B', borderRadius: 8, width: 70, alignItems: 'center' },
  btnVolverTexto:  { color: '#F8FAFC', fontSize: 13, fontWeight: '600' },
  btnAgregar:      { backgroundColor: '#1E293B', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  btnAgregarTexto: { color: '#F8FAFC', fontWeight: '600', fontSize: 13 },

  resumenContenedor: { flexDirection: 'row', gap: 8, paddingHorizontal: 12, paddingTop: 12 },
  resumenCard:  { flex: 1, backgroundColor: '#fff', borderRadius: 10, padding: 12, alignItems: 'center', borderWidth: 1.5, borderColor: '#1E293B' },
  resumenValor: { color: '#0F172A', fontSize: 24, fontWeight: '700' },
  resumenLabel: { color: '#64748B', fontSize: 11, marginTop: 2, textAlign: 'center' },

  formulario: { margin: 12, backgroundColor: '#fff', borderRadius: 16, padding: 14, borderWidth: 1.5, borderColor: '#1E293B' },
  formTitulo: { color: '#0F172A', fontWeight: '600', fontSize: 16, marginBottom: 10 },
  input: {
    backgroundColor: '#F8FAFC', padding: 12, borderRadius: 8,
    marginBottom: 8, borderWidth: 1.5, borderColor: '#1E293B', fontSize: 14, color: '#0F172A',
  },
  productosSelector:     { marginBottom: 8, gap: 6 },
  productoOpcion:        { backgroundColor: '#F8FAFC', borderWidth: 1.5, borderColor: '#1E293B', borderRadius: 8, padding: 10 },
  productoOpcionActiva:  { backgroundColor: '#1E293B', borderColor: '#1E293B' },
  productoNombre:        { color: '#0F172A', fontWeight: '600', fontSize: 13 },
  productoNombreActivo:  { color: '#F8FAFC' },
  productoDetalle:       { color: '#64748B', fontSize: 11, marginTop: 2 },
  productoDetalleActivo: { color: '#CBD5E1' },
  productoSeleccionado:  { color: '#16A34A', fontSize: 12, marginBottom: 8, fontWeight: '600' },
  sinProductos:          { color: '#64748B', fontSize: 12, textAlign: 'center', marginBottom: 8 },
  btnGuardar:      { backgroundColor: '#1E293B', padding: 13, borderRadius: 8, alignItems: 'center', marginTop: 4 },
  btnGuardarTexto: { color: '#F8FAFC', fontWeight: '600', fontSize: 14 },
  btnCancelar:     { padding: 10, alignItems: 'center' },
  btnCancelarTexto:{ color: '#64748B', textDecorationLine: 'underline', fontSize: 13 },

  mensaje:       { color: '#0F172A', textAlign: 'center', marginHorizontal: 12, marginBottom: 8, fontSize: 13, fontWeight: '500' },
  buscadorContenedor: { padding: 12 },
  buscador: {
    backgroundColor: '#fff', color: '#0F172A', padding: 12,
    borderRadius: 8, borderWidth: 1.5, borderColor: '#1E293B', fontSize: 14,
  },
  lista:       { paddingHorizontal: 12, paddingBottom: 20 },
  fila:        { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1.5, borderColor: '#1E293B' },
  infoBloque:  { marginBottom: 12 },
  nombre:      { fontSize: 16, fontWeight: '600', color: '#0F172A', marginBottom: 4 },
  detalle:     { color: '#64748B', fontSize: 13, marginBottom: 2 },
  estadoBadge: { marginTop: 6, alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  estadoTexto: { color: '#F8FAFC', fontWeight: '600', fontSize: 12 },
  acciones:    { flexDirection: 'row', gap: 10 },
  btnEditar:   { flex: 1, backgroundColor: '#1E293B', padding: 10, borderRadius: 8, alignItems: 'center' },
  btnEliminar: { flex: 1, backgroundColor: '#DC2626', padding: 10, borderRadius: 8, alignItems: 'center' },
  btnTexto:    { color: '#F8FAFC', fontWeight: '600', fontSize: 13 },
  error:         { color: '#DC2626', textAlign: 'center', marginTop: 20, fontSize: 14 },
  sinResultados: { color: '#64748B', textAlign: 'center', marginTop: 30, fontSize: 14 },
});