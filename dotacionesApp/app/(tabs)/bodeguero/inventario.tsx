import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Alert, ActivityIndicator,
} from 'react-native';

// ─────────────────────────────────────────────────────────────────────────────
// CONFIGURACIÓN
// ─────────────────────────────────────────────────────────────────────────────
const API = 'http://172.30.0.43/doto/api/inventario.php';

// ─────────────────────────────────────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────────────────────────────────────
type Producto = {
  codigo: string; nombre: string; unidad: string;
  grupo: string;  precio: number; stockMin: number; stockActual: number;
};

type Movimiento = {
  fecha: string; codigo: string; producto: string;
  tipo: string;  cantidad: number; observaciones: string;
};

type ResumenDash = {
  totalProductos: number; totalMovimientos: number;
  sinStock: number;       stockBajo: number;
};

type TabName = 'dashboard' | 'productos' | 'movimientos' | 'inventario' | 'buscar';

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

// GET
async function apiGet(accion: string, params: Record<string, string> = {}) {
  const qs  = new URLSearchParams({ accion, ...params }).toString();
  const res = await fetch(`${API}?${qs}`);
  if (!res.ok) throw new Error('Error HTTP ' + res.status);
  return res.json();
}

// POST (JSON)
async function apiPost(accion: string, datos: Record<string, unknown> = {}) {
  const res = await fetch(API, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ accion, ...datos }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? 'Error HTTP ' + res.status);
  }
  return res.json();
}

function getEstado(p: Pick<Producto, 'stockActual' | 'stockMin'>) {
  if (p.stockActual <= 0)                                     return { label: 'Sin Stock',  color: '#dc3545' };
  if (p.stockActual <= p.stockMin && p.stockMin > 0)         return { label: 'Stock Bajo', color: '#ffc107' };
  return { label: 'Normal', color: '#28a745' };
}

function fechaHoy() { return new Date().toISOString().split('T')[0]; }

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────
export default function Inventario() {
  const [tabActiva, setTabActiva] = useState<TabName>('dashboard');
  const [cargando,  setCargando]  = useState(false);

  const [resumen,        setResumen]        = useState<ResumenDash | null>(null);
  const [alertas,        setAlertas]        = useState<Producto[]>([]);
  const [stock,          setStock]          = useState<Producto[]>([]);
  const [historial,      setHistorial]      = useState<Movimiento[]>([]);
  const [resultBusqueda, setResultBusqueda] = useState<Producto[]>([]);
  const [unidades,       setUnidades]       = useState<string[]>([]);
  const [grupos,         setGrupos]         = useState<string[]>([]);

  // Formulario producto
  const [fCodigo,   setFCodigo]   = useState('');
  const [fNombre,   setFNombre]   = useState('');
  const [fPrecio,   setFPrecio]   = useState('');
  const [fUnidad,   setFUnidad]   = useState('');
  const [fGrupo,    setFGrupo]    = useState('');
  const [fStockMin, setFStockMin] = useState('0');

  // Formulario movimiento
  const [mCodigo, setMCodigo] = useState('');
  const [mFecha,  setMFecha]  = useState(fechaHoy());
  const [mTipo,   setMTipo]   = useState('INGRESO');
  const [mCant,   setMCant]   = useState('');
  const [mObs,    setMObs]    = useState('');

  // Filtros historial
  const [hDesde, setHDesde] = useState('');
  const [hHasta, setHHasta] = useState(fechaHoy());
  const [hTipo,  setHTipo]  = useState('');

  // Búsqueda
  const [busqueda, setBusqueda] = useState('');

  // ── Cargar listas al montar ──────────────────────────────────────────────
  useEffect(() => {
    apiGet('listas')
      .then(data => {
        setUnidades(data.unidades ?? []);
        setGrupos(data.grupos ?? []);
        setFUnidad(data.unidades?.[0] ?? '');
        setFGrupo(data.grupos?.[0] ?? '');
      })
      .catch(() => Alert.alert('Error', 'No se pudo conectar con el servidor.'));
  }, []);

  // ── Cargar datos según tab ───────────────────────────────────────────────
  useEffect(() => {
    if (tabActiva === 'dashboard')  cargarDashboard();
    if (tabActiva === 'inventario') cargarStock();
  }, [tabActiva]);

  // ── Dashboard ────────────────────────────────────────────────────────────
  async function cargarDashboard() {
    setCargando(true);
    try {
      const [res, alts] = await Promise.all([
        apiGet('resumen'),
        apiGet('alertas'),
      ]);
      setResumen(res);
      setAlertas(alts);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setCargando(false);
    }
  }

  // ── Stock ────────────────────────────────────────────────────────────────
  async function cargarStock() {
    setCargando(true);
    try {
      const data = await apiGet('stock');
      setStock(data);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setCargando(false);
    }
  }

  // ── Registrar producto ───────────────────────────────────────────────────
  async function registrarProducto() {
    if (!fCodigo.trim() || !fNombre.trim() || !fPrecio.trim()) {
      Alert.alert('Error', 'Código, nombre y precio son obligatorios.');
      return;
    }
    setCargando(true);
    try {
      const resp = await apiPost('registrarProducto', {
        codigo:   fCodigo.trim().toUpperCase(),
        nombre:   fNombre.trim(),
        precio:   parseFloat(fPrecio),
        unidad:   fUnidad,
        grupo:    fGrupo,
        stockMin: parseInt(fStockMin) || 0,
      });
      Alert.alert('Éxito ✅', resp.mensaje);
      setFCodigo(''); setFNombre(''); setFPrecio(''); setFStockMin('0');
    } catch (e: any) {
      Alert.alert('Error ❌', e.message);
    } finally {
      setCargando(false);
    }
  }

  // ── Registrar movimiento ─────────────────────────────────────────────────
  async function registrarMovimiento() {
    const cant = parseFloat(mCant);
    if (!mCodigo.trim() || !mFecha || isNaN(cant) || cant <= 0) {
      Alert.alert('Error', 'Todos los campos son obligatorios y la cantidad debe ser mayor a 0.');
      return;
    }
    setCargando(true);
    try {
      const resp = await apiPost('registrarMovimiento', {
        codigo:        mCodigo.trim().toUpperCase(),
        fecha:         mFecha,
        tipo:          mTipo,
        cantidad:      cant,
        observaciones: mObs.trim(),
      });
      Alert.alert('Éxito ✅', resp.mensaje);
      setMCodigo(''); setMCant(''); setMObs(''); setMFecha(fechaHoy());
    } catch (e: any) {
      Alert.alert('Error ❌', e.message);
    } finally {
      setCargando(false);
    }
  }

  // ── Historial ────────────────────────────────────────────────────────────
  async function cargarHistorial() {
    if (!hDesde || !hHasta) { Alert.alert('Aviso', 'Selecciona las fechas.'); return; }
    setCargando(true);
    try {
      const data = await apiGet('historial', { fechaDesde: hDesde, fechaHasta: hHasta, tipo: hTipo });
      setHistorial(data);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setCargando(false);
    }
  }

  // ── Búsqueda ─────────────────────────────────────────────────────────────
  async function buscar(q: string) {
    if (q.trim().length < 2) { setResultBusqueda([]); return; }
    setCargando(true);
    try {
      const data = await apiGet('buscar', { q: q.trim() });
      setResultBusqueda(data);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => buscar(busqueda), 400);
    return () => clearTimeout(timer);
  }, [busqueda]);

  // ─────────────────────────────────────────────────────────────────────────
  const tabs: { key: TabName; label: string; icon: string }[] = [
    { key: 'dashboard',   label: 'Dashboard',   icon: '📊' },
    { key: 'productos',   label: 'Productos',   icon: '📦' },
    { key: 'movimientos', label: 'Movimientos', icon: '📋' },
    { key: 'inventario',  label: 'Inventario',  icon: '🗂️' },
    { key: 'buscar',      label: 'Buscar',      icon: '🔍' },
  ];

  const TIPOS_MOV  = ['INGRESO', 'SALIDA', 'AJUSTE_POSITIVO', 'AJUSTE_NEGATIVO'];
  const TIPOS_LABEL: Record<string, string> = {
    INGRESO: 'Ingreso', SALIDA: 'Salida',
    AJUSTE_POSITIVO: 'Ajuste +', AJUSTE_NEGATIVO: 'Ajuste -',
  };

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <View style={s.root}>

      {/* Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.tabBar}>
        {tabs.map(t => (
          <TouchableOpacity key={t.key}
            style={[s.tabBtn, tabActiva === t.key && s.tabBtnActive]}
            onPress={() => setTabActiva(t.key)}>
            <Text style={s.tabIcon}>{t.icon}</Text>
            <Text style={[s.tabLabel, tabActiva === t.key && s.tabLabelActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {cargando && <ActivityIndicator color="#B7975B" style={{ marginTop: 10 }} />}

      <ScrollView contentContainerStyle={s.content}>

        {/* ── DASHBOARD ─────────────────────────────────────────────────── */}
        {tabActiva === 'dashboard' && (
          <View>
            <Text style={s.sectionTitle}>Dashboard General</Text>
            {resumen && (
              <View style={s.statsGrid}>
                <StatCard valor={resumen.totalProductos}   label="Productos" />
                <StatCard valor={resumen.totalMovimientos} label="Movimientos" />
                <StatCard valor={resumen.sinStock}  label="Sin Stock"  color="#dc3545" />
                <StatCard valor={resumen.stockBajo} label="Stock Bajo" color="#ffc107" />
              </View>
            )}
            <TouchableOpacity style={s.btnSecundario} onPress={cargarDashboard}>
              <Text style={s.btnText}>🔄 Actualizar</Text>
            </TouchableOpacity>
            <Text style={[s.cardTitle, { marginTop: 20 }]}>Alertas de Stock</Text>
            {alertas.length === 0
              ? <Text style={s.emptyText}>Sin alertas de stock.</Text>
              : alertas.map(p => {
                  const est = getEstado(p);
                  return (
                    <View key={p.codigo} style={[s.alertRow, { borderLeftColor: est.color }]}>
                      <Text style={s.alertCodigo}>{p.codigo}</Text>
                      <Text style={s.alertNombre}>{p.nombre}</Text>
                      <Text style={[s.alertEstado, { color: est.color }]}>{est.label}</Text>
                      <Text style={s.alertStock}>Stock: {p.stockActual} / Mín: {p.stockMin}</Text>
                    </View>
                  );
                })
            }
          </View>
        )}

        {/* ── PRODUCTOS ─────────────────────────────────────────────────── */}
        {tabActiva === 'productos' && (
          <View>
            <Text style={s.sectionTitle}>Registrar Nuevo Producto</Text>

            <Text style={s.label}>Código *</Text>
            <TextInput style={s.input} placeholder="Ej: CAM001" placeholderTextColor="#666"
              autoCapitalize="characters" value={fCodigo} onChangeText={setFCodigo} />

            <Text style={s.label}>Nombre *</Text>
            <TextInput style={s.input} placeholder="Nombre del producto" placeholderTextColor="#666"
              value={fNombre} onChangeText={setFNombre} />

            <Text style={s.label}>Precio *</Text>
            <TextInput style={s.input} placeholder="0.00" placeholderTextColor="#666"
              keyboardType="decimal-pad" value={fPrecio} onChangeText={setFPrecio} />

            <Text style={s.label}>Unidad de Medida</Text>
            <View style={s.chipRow}>
              {unidades.map(u => (
                <TouchableOpacity key={u} style={[s.chip, fUnidad === u && s.chipActive]}
                  onPress={() => setFUnidad(u)}>
                  <Text style={[s.chipText, fUnidad === u && s.chipTextActive]}>{u}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={s.label}>Grupo</Text>
            <View style={s.chipRow}>
              {grupos.map(g => (
                <TouchableOpacity key={g} style={[s.chip, fGrupo === g && s.chipActive]}
                  onPress={() => setFGrupo(g)}>
                  <Text style={[s.chipText, fGrupo === g && s.chipTextActive]}>{g}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={s.label}>Stock Mínimo</Text>
            <TextInput style={s.input} placeholder="0" placeholderTextColor="#666"
              keyboardType="numeric" value={fStockMin} onChangeText={setFStockMin} />

            <TouchableOpacity style={s.btnPrimary} onPress={registrarProducto} disabled={cargando}>
              <Text style={s.btnText}>✅ Registrar Producto</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── MOVIMIENTOS ───────────────────────────────────────────────── */}
        {tabActiva === 'movimientos' && (
          <View>
            <Text style={s.sectionTitle}>Nuevo Movimiento</Text>

            <Text style={s.label}>Código del Producto *</Text>
            <TextInput style={s.input} placeholder="Ej: CAM001" placeholderTextColor="#666"
              autoCapitalize="characters" value={mCodigo} onChangeText={setMCodigo} />

            <Text style={s.label}>Fecha *</Text>
            <TextInput style={s.input} placeholder="YYYY-MM-DD" placeholderTextColor="#666"
              value={mFecha} onChangeText={setMFecha} />

            <Text style={s.label}>Tipo de Movimiento *</Text>
            <View style={s.chipRow}>
              {TIPOS_MOV.map(t => (
                <TouchableOpacity key={t} style={[s.chip, mTipo === t && s.chipActive]}
                  onPress={() => setMTipo(t)}>
                  <Text style={[s.chipText, mTipo === t && s.chipTextActive]}>
                    {TIPOS_LABEL[t]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={s.label}>Cantidad *</Text>
            <TextInput style={s.input} placeholder="0" placeholderTextColor="#666"
              keyboardType="decimal-pad" value={mCant} onChangeText={setMCant} />

            <Text style={s.label}>Observaciones</Text>
            <TextInput style={[s.input, { height: 80 }]} placeholder="Opcional"
              placeholderTextColor="#666" multiline value={mObs} onChangeText={setMObs} />

            <TouchableOpacity style={s.btnPrimary} onPress={registrarMovimiento} disabled={cargando}>
              <Text style={s.btnText}>💾 Guardar Movimiento</Text>
            </TouchableOpacity>

            <Text style={[s.cardTitle, { marginTop: 24 }]}>Consultar Historial</Text>

            <Text style={s.label}>Desde</Text>
            <TextInput style={s.input} placeholder="YYYY-MM-DD" placeholderTextColor="#666"
              value={hDesde} onChangeText={setHDesde} />

            <Text style={s.label}>Hasta</Text>
            <TextInput style={s.input} placeholder="YYYY-MM-DD" placeholderTextColor="#666"
              value={hHasta} onChangeText={setHHasta} />

            <Text style={s.label}>Filtrar por tipo</Text>
            <View style={s.chipRow}>
              {['', ...TIPOS_MOV].map(t => (
                <TouchableOpacity key={t || 'todos'} style={[s.chip, hTipo === t && s.chipActive]}
                  onPress={() => setHTipo(t)}>
                  <Text style={[s.chipText, hTipo === t && s.chipTextActive]}>
                    {t ? TIPOS_LABEL[t] : 'Todos'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={s.btnSecundario} onPress={cargarHistorial} disabled={cargando}>
              <Text style={s.btnText}>📋 Generar Historial</Text>
            </TouchableOpacity>

            {historial.map((m, i) => (
              <View key={i} style={s.movRow}>
                <View style={{ flex: 1 }}>
                  <Text style={s.movCodigo}>{m.codigo} — {m.producto}</Text>
                  <Text style={s.movFecha}>{m.fecha} · {m.cantidad} uds</Text>
                  {m.observaciones ? <Text style={s.movObs}>{m.observaciones}</Text> : null}
                </View>
                <Text style={[s.movTipo, {
                  color: m.tipo === 'INGRESO' || m.tipo === 'AJUSTE_POSITIVO' ? '#28a745' : '#dc3545'
                }]}>
                  {TIPOS_LABEL[m.tipo] ?? m.tipo}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* ── INVENTARIO ────────────────────────────────────────────────── */}
        {tabActiva === 'inventario' && (
          <View>
            <Text style={s.sectionTitle}>Stock Actual</Text>
            <TouchableOpacity style={s.btnSecundario} onPress={cargarStock}>
              <Text style={s.btnText}>🔄 Actualizar Stock</Text>
            </TouchableOpacity>
            {stock.length === 0 && !cargando
              ? <Text style={s.emptyText}>No hay productos en inventario.</Text>
              : stock.map(p => {
                  const est = getEstado(p);
                  return (
                    <View key={p.codigo} style={[s.stockRow, { borderLeftColor: est.color }]}>
                      <View style={{ flex: 1 }}>
                        <Text style={s.stockCodigo}>{p.codigo}</Text>
                        <Text style={s.stockNombre}>{p.nombre}</Text>
                        <Text style={s.stockDetalle}>{p.unidad} · {p.grupo} · ${p.precio}</Text>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={[s.stockCantidad, { color: est.color }]}>{p.stockActual}</Text>
                        <Text style={s.stockMin}>Mín: {p.stockMin}</Text>
                        <Text style={[s.stockEstado, { color: est.color }]}>{est.label}</Text>
                      </View>
                    </View>
                  );
                })
            }
          </View>
        )}

        {/* ── BUSCAR ────────────────────────────────────────────────────── */}
        {tabActiva === 'buscar' && (
          <View>
            <Text style={s.sectionTitle}>Búsqueda de Productos</Text>
            <TextInput style={s.input}
              placeholder="Buscar por código, nombre o grupo..."
              placeholderTextColor="#666"
              value={busqueda} onChangeText={setBusqueda} />
            {busqueda.trim().length > 0 && busqueda.trim().length < 2 &&
              <Text style={s.emptyText}>Escribe al menos 2 caracteres.</Text>}
            {busqueda.trim().length >= 2 && resultBusqueda.length === 0 && !cargando &&
              <Text style={s.emptyText}>No se encontraron productos.</Text>}
            {resultBusqueda.map(p => {
              const est = getEstado(p);
              return (
                <View key={p.codigo} style={[s.stockRow, { borderLeftColor: est.color }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.stockCodigo}>{p.codigo}</Text>
                    <Text style={s.stockNombre}>{p.nombre}</Text>
                    <Text style={s.stockDetalle}>{p.unidad} · {p.grupo}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[s.stockCantidad, { color: est.color }]}>{p.stockActual}</Text>
                    <Text style={s.stockMin}>Mín: {p.stockMin}</Text>
                    <Text style={[s.stockEstado, { color: est.color }]}>{est.label}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

      </ScrollView>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTE
// ─────────────────────────────────────────────────────────────────────────────
function StatCard({ valor, label, color = '#B7975B' }: { valor: number; label: string; color?: string }) {
  return (
    <View style={s.statCard}>
      <Text style={[s.statValor, { color }]}>{valor}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ESTILOS
// ─────────────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root:    { flex: 1, backgroundColor: '#09080D' },
  content: { padding: 20, paddingBottom: 40 },

  tabBar:         { flexGrow: 0, backgroundColor: '#0d0d1a', borderBottomWidth: 1, borderBottomColor: '#B7975B' },
  tabBtn:         { alignItems: 'center', paddingVertical: 10, paddingHorizontal: 16 },
  tabBtnActive:   { borderBottomWidth: 2, borderBottomColor: '#B7975B' },
  tabIcon:        { fontSize: 18 },
  tabLabel:       { color: '#aaa', fontSize: 11, marginTop: 2 },
  tabLabelActive: { color: '#B7975B', fontWeight: 'bold' },

  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#B7975B', marginBottom: 20 },
  cardTitle:    { fontSize: 15, fontWeight: 'bold', color: '#B7975B', marginBottom: 12 },
  emptyText:    { color: '#666', fontStyle: 'italic', textAlign: 'center', marginTop: 12 },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 },
  statCard:  { width: '46%', backgroundColor: '#1a1a2e', borderRadius: 10, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#333' },
  statValor: { fontSize: 28, fontWeight: 'bold' },
  statLabel: { color: '#aaa', fontSize: 12, marginTop: 4, textAlign: 'center' },

  alertRow:    { backgroundColor: '#1a1a2e', borderRadius: 8, padding: 12, marginBottom: 8, borderLeftWidth: 4 },
  alertCodigo: { color: '#B7975B', fontWeight: 'bold', fontSize: 13 },
  alertNombre: { color: '#fff', fontSize: 13, marginTop: 2 },
  alertEstado: { fontWeight: 'bold', fontSize: 12, marginTop: 4 },
  alertStock:  { color: '#aaa', fontSize: 12 },

  label: { color: '#aaa', fontSize: 13, marginBottom: 4, marginTop: 12 },
  input: { backgroundColor: '#0d0d1a', borderWidth: 1, borderColor: '#333', borderRadius: 8, padding: 12, color: '#fff', fontSize: 14 },

  chipRow:        { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  chip:           { backgroundColor: '#0d0d1a', borderWidth: 1, borderColor: '#333', borderRadius: 20, paddingVertical: 6, paddingHorizontal: 12 },
  chipActive:     { backgroundColor: '#B7975B', borderColor: '#B7975B' },
  chipText:       { color: '#aaa', fontSize: 12 },
  chipTextActive: { color: '#fff', fontWeight: 'bold' },

  btnPrimary:    { backgroundColor: '#B7975B', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 20 },
  btnSecundario: { backgroundColor: '#1a1a2e', borderWidth: 1, borderColor: '#B7975B', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 12 },
  btnText:       { color: '#fff', fontWeight: 'bold', fontSize: 15 },

  movRow:    { backgroundColor: '#1a1a2e', borderRadius: 8, padding: 12, marginBottom: 8, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#333' },
  movCodigo: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  movFecha:  { color: '#aaa', fontSize: 12, marginTop: 2 },
  movObs:    { color: '#666', fontSize: 11, marginTop: 2, fontStyle: 'italic' },
  movTipo:   { fontWeight: 'bold', fontSize: 11, textAlign: 'right', maxWidth: 90 },

  stockRow:     { backgroundColor: '#1a1a2e', borderRadius: 8, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center', borderLeftWidth: 4 },
  stockCodigo:  { color: '#B7975B', fontWeight: 'bold', fontSize: 13 },
  stockNombre:  { color: '#fff', fontSize: 14, marginTop: 2 },
  stockDetalle: { color: '#aaa', fontSize: 12, marginTop: 2 },
  stockCantidad:{ fontSize: 22, fontWeight: 'bold' },
  stockMin:     { color: '#aaa', fontSize: 11 },
  stockEstado:  { fontWeight: 'bold', fontSize: 11, marginTop: 2 },
});