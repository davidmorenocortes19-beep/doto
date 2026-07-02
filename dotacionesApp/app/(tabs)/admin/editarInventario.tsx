import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, ActivityIndicator, ImageBackground,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import axios from 'axios';

const API_INV  = 'http://192.168.40.8/doto/api/inventario.php';
const API_PROD = 'http://192.168.40.8/doto/api/productos.php';

type Producto = { id_producto: number; nombre: string; precio: string; talla: string; color: string; };

function notificar(titulo: string, mensaje: string) {
  if (typeof window !== 'undefined') window.alert(`${titulo}\n${mensaje}`);
  else { const { Alert } = require('react-native'); Alert.alert(titulo, mensaje); }
}

export default function EditarInventarioAdmin() {
  const params       = useLocalSearchParams();
  const id           = Array.isArray(params.id) ? params.id[0] : params.id;

  const [productos,      setProductos]      = useState<Producto[]>([]);
  const [idProducto,     setIdProducto]     = useState('');
  const [cantidadActual, setCantidadActual] = useState('');
  const [stockMinimo,    setStockMinimo]    = useState('');
  const [cargando,       setCargando]       = useState(true);
  const [guardando,      setGuardando]      = useState(false);
  const [exitoMsg,       setExitoMsg]       = useState('');
  const [errorMsg,       setErrorMsg]       = useState('');
  const [idError,        setIdError]        = useState('');
  const [cantidadError,  setCantidadError]  = useState('');
  const [stockError,     setStockError]     = useState('');

  useEffect(() => {
    const init = async () => {
      try {
        const [resInv, resProd] = await Promise.all([
          axios.get(`${API_INV}?id=${id}`, { timeout: 5000 }),
          axios.get(API_PROD, { timeout: 5000 }),
        ]);
        const inv = resInv.data;
        if (inv && !inv.error) {
          setIdProducto(String(inv.id_producto_fk));
          setCantidadActual(String(inv.cantidad_actual));
          setStockMinimo(String(inv.stock_minimo));
        }
        setProductos(Array.isArray(resProd.data) ? resProd.data : []);
      } catch {
        setErrorMsg('No se pudo cargar el inventario');
      } finally {
        setCargando(false);
      }
    };
    if (id) init();
  }, [id]);

  const productoSeleccionado = productos.find(p => String(p.id_producto) === idProducto);

  const handleIdProducto = (text: string) => {
    const limpio = text.replace(/[^0-9]/g, '');
    setIdProducto(limpio);
    if (limpio && !productos.find(p => String(p.id_producto) === limpio)) {
      setIdError('⚠ No existe un producto con ese ID');
    } else setIdError('');
  };

  const handleCantidad = (text: string) => {
    const limpio = text.replace(/[^0-9]/g, '');
    setCantidadActual(limpio);
    setCantidadError(limpio !== '' && parseInt(limpio) < 0 ? '⚠ No puede ser negativo' : '');
  };

  const handleStock = (text: string) => {
    const limpio = text.replace(/[^0-9]/g, '');
    setStockMinimo(limpio);
    setStockError(limpio !== '' && parseInt(limpio) < 0 ? '⚠ No puede ser negativo' : '');
  };

  const guardar = async () => {
    let valido = true;
    if (!idProducto || !productoSeleccionado) { setIdError('⚠ Ingresa un ID de producto válido'); valido = false; }
    if (cantidadActual === '')                { setCantidadError('⚠ Campo obligatorio'); valido = false; }
    if (stockMinimo === '')                   { setStockError('⚠ Campo obligatorio'); valido = false; }
    if (!valido) return;

    setGuardando(true);
    setErrorMsg('');
    try {
      const res = await axios.put(API_INV, {
        id_inventario:   parseInt(id as string),
        id_producto_fk:  parseInt(idProducto),
        cantidad_actual: parseInt(cantidadActual),
        stock_minimo:    parseInt(stockMinimo),
      }, { timeout: 5000 });

      if (res.data.mensaje) {
        setExitoMsg('✅ Inventario actualizado correctamente');
        setTimeout(() => { setExitoMsg(''); router.replace('/admin/inventario'); }, 1500);
      } else {
        setErrorMsg(res.data.error || 'No se pudo actualizar');
      }
    } catch (e: any) {
      setErrorMsg(e?.response?.data?.error ?? 'Error de conexión');
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' }}>
      <ActivityIndicator size="large" color="#991B1B" />
    </View>
  );

  return (
    <ImageBackground source={require('../../../assets/images/camiseta.png')} style={styles.background} resizeMode="cover">
      <View style={styles.overlay} />
      <View style={styles.container}>

        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.replace('/admin/inventario')} style={styles.btnVolver}>
            <Text style={styles.btnVolverTexto}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.titulo}>Editar Inventario</Text>
          <View style={{ width: 70 }} />
        </View>

        <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">

          {exitoMsg !== '' && <View style={styles.exitoBox}><Text style={styles.exitoTexto}>{exitoMsg}</Text></View>}
          {errorMsg !== '' && <View style={styles.errorBox}><Text style={styles.errorTexto}>{errorMsg}</Text></View>}

          <Text style={styles.label}>ID del Producto *</Text>
          <TextInput
            style={[styles.input, idError ? styles.inputError : null]}
            value={idProducto}
            onChangeText={handleIdProducto}
            placeholder="Ej: 1"
            placeholderTextColor="#94A3B8"
            keyboardType="numeric"
          />
          {idError !== '' && <Text style={styles.fieldHint}>{idError}</Text>}
          {productoSeleccionado && (
            <View style={styles.productoPreview}>
              <Text style={styles.productoPreviewTexto}>✅ {productoSeleccionado.nombre}</Text>
              <Text style={styles.productoPreviewSub}>
                ${Number(productoSeleccionado.precio).toLocaleString('es-CO')} · Talla: {productoSeleccionado.talla || 'N/A'} · Color: {productoSeleccionado.color || 'N/A'}
              </Text>
            </View>
          )}

          <Text style={styles.label}>Cantidad Actual *</Text>
          <TextInput
            style={[styles.input, cantidadError ? styles.inputError : null]}
            value={cantidadActual}
            onChangeText={handleCantidad}
            placeholder="Ej: 100"
            placeholderTextColor="#94A3B8"
            keyboardType="numeric"
          />
          {cantidadError !== '' && <Text style={styles.fieldHint}>{cantidadError}</Text>}
          {cantidadActual !== '' && !cantidadError && <Text style={styles.fieldOk}>✅ Válido</Text>}

          <Text style={styles.label}>Stock Mínimo *</Text>
          <TextInput
            style={[styles.input, stockError ? styles.inputError : null]}
            value={stockMinimo}
            onChangeText={handleStock}
            placeholder="Ej: 10"
            placeholderTextColor="#94A3B8"
            keyboardType="numeric"
          />
          {stockError !== '' && <Text style={styles.fieldHint}>{stockError}</Text>}
          {stockMinimo !== '' && !stockError && <Text style={styles.fieldOk}>✅ Válido</Text>}

          <TouchableOpacity
            style={[styles.btnGuardar, guardando && { opacity: 0.6 }]}
            onPress={guardar}
            disabled={guardando}
          >
            {guardando
              ? <ActivityIndicator color="#F8FAFC" />
              : <Text style={styles.btnGuardarTexto}>💾 Guardar cambios</Text>
            }
          </TouchableOpacity>

        </ScrollView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255,255,255,0.10)' },
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingTop: 50, backgroundColor: 'rgba(255,255,255,1.0)', borderBottomWidth: 1.5, borderBottomColor: '#991B1B' },
  titulo: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  btnVolver: { backgroundColor: '#991B1B', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  btnVolverTexto: { color: '#F8FAFC', fontSize: 12, fontWeight: '600' },
  form: { padding: 20, paddingBottom: 40 },
  exitoBox: { backgroundColor: '#DCFCE7', borderWidth: 1.5, borderColor: '#166534', borderRadius: 10, padding: 14, marginBottom: 16 },
  exitoTexto: { color: '#166534', fontWeight: '600', textAlign: 'center' },
  errorBox: { backgroundColor: '#FEE2E2', borderWidth: 1.5, borderColor: '#991B1B', borderRadius: 10, padding: 14, marginBottom: 16 },
  errorTexto: { color: '#991B1B', fontWeight: '600', textAlign: 'center' },
  label: { color: '#0F172A', fontSize: 13, fontWeight: '600', marginBottom: 6, marginTop: 16 },
  input: { backgroundColor: 'rgba(255,255,255,1.0)', color: '#0F172A', padding: 14, borderRadius: 10, borderWidth: 1.5, borderColor: '#991B1B', fontSize: 15 },
  inputError: { borderColor: '#DC2626' },
  fieldHint: { color: '#DC2626', fontSize: 12, marginTop: 4 },
  fieldOk: { color: '#166534', fontSize: 12, marginTop: 4 },
  productoPreview: { backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#991B1B', borderRadius: 8, padding: 10, marginTop: 6 },
  productoPreviewTexto: { color: '#0F172A', fontWeight: '600', fontSize: 13 },
  productoPreviewSub: { color: '#64748B', fontSize: 11, marginTop: 2 },
  btnGuardar: { backgroundColor: '#991B1B', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 30 },
  btnGuardarTexto: { color: '#F8FAFC', fontWeight: '600', fontSize: 16 },
});