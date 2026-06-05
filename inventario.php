import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, ActivityIndicator, Alert, FlatList,
  SafeAreaView, StatusBar, Dimensions, Platform,
  KeyboardAvoidingView, Modal
} from 'react-native';

// ─── CONSTANTES ───────────────────────────────────────────────────────────────
const API_RESUMEN   = 'https://script.google.com/macros/s/AKfycbxXcNkjfFqASVBjYyJ3Jg5QQEBz1fqt0mxCelL0GbGH3omPp7Er87aFBOrLVbnWM3iN/exec';
const API_INVENTARIO = 'https://script.google.com/macros/s/AKfycbx1_3z8sJQRdzds75MNWgAyRfNbCh3LoqzXJOCmTOlPn1pnlAp03anPqh1GDgG6NVrv/exec';

const GOLD   = '#C9952A';
const BLACK  = '#0A0A0A';
const DARK   = '#141414';
const CARD   = '#1C1C1C';
const WHITE  = '#FFFFFF';
const GRAY   = '#888888';
const GREEN  = '#28a745';
const RED    = '#dc3545';
const YELLOW = '#ffc107';
const BLUE   = '#17a2b8';

type Tab = 'dashboard' | 'productos' | 'movimientos' | 'inventario' | 'reportes' | 'buscar';

type Producto = {
  codigo: string;
  nombre: string;
  unidad: string;
  grupo: string;
  stockMin: number;
  cantidad: number;
};

type Movimiento = {
  fecha: string;
  codigo: string;
  producto: string;
  tipo: string;
  cantidad: number;
  observaciones: string;
};

type Resumen = {
  totalProductos: number;
  totalMovimientos: number;
  sinStock: number;
  stockBajo: number;
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const today = () => new Date().toISOString().split('T')[0];
const monthAgo = () => {
  const d = new Date(); d.setMonth(d.getMonth() - 1);
  return d.toISOString().split('T')[0];
};

async function apiFetch<T>(url: string, params?: Record<string, string>): Promise<T> {
  const full = params
    ? `${url}?${new URLSearchParams(params).toString()}`
    : url;
  const res = await fetch(full);
  return res.json();
}

// ─── COMPONENTES REUTILIZABLES ────────────────────────────────────────────────

const Badge = ({ label, color }: { label: string; color: string }) => (
  <View style={[styles.badge, { backgroundColor: color + '22', borderColor: color }]}>
    <Text style={[styles.badgeText, { color }]}>{label}</Text>
  </View>
);

const Btn = ({
  label, onPress, color = GOLD, icon, small
}: {
  label: string; onPress: () => void; color?: string; icon?: string; small?: boolean;
}) => (
  <TouchableOpacity
    style={[styles.btn, { backgroundColor: color }, small && styles.btnSmall]}
    onPress={onPress}
    activeOpacity={0.75}
  >
    {icon ? <Text style={styles.btnIcon}>{icon}</Text> : null}
    <Text style={[styles.btnLabel, small && styles.btnLabelSmall]}>{label}</Text>
  </TouchableOpacity>
);

const Field = ({
  label, value, onChange, placeholder, numeric, multiline, half
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; numeric?: boolean; multiline?: boolean; half?: boolean;
}) => (
  <View style={[styles.field, half && styles.fieldHalf]}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <TextInput
      style={[styles.fieldInput, multiline && { height: 80, textAlignVertical: 'top' }]}
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      placeholderTextColor={GRAY}
      keyboardType={numeric ? 'numeric' : 'default'}
      multiline={multiline}
    />
  </View>
);

const Picker = ({
  label, value, options, onChange
}: {
  label: string; value: string; options: string[]; onChange: (v: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TouchableOpacity style={styles.pickerBtn} onPress={() => setOpen(true)}>
        <Text style={value ? styles.pickerValue : styles.pickerPlaceholder}>
          {value || 'Seleccionar...'}
        </Text>
        <Text style={{ color: GOLD }}>▾</Text>
      </TouchableOpacity>
      <Modal transparent visible={open} animationType="fade" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity style={styles.pickerOverlay} onPress={() => setOpen(false)}>
          <View style={styles.pickerModal}>
            <Text style={styles.pickerTitle}>{label}</Text>
            <ScrollView>
              {options.map(opt => (
                <TouchableOpacity
                  key={opt}
                  style={[styles.pickerItem, value === opt && styles.pickerItemActive]}
                  onPress={() => { onChange(opt); setOpen(false); }}
                >
                  <Text style={[styles.pickerItemText, value === opt && { color: GOLD }]}>{opt}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const SectionCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <Text style={styles.cardTitle}>{title}</Text>
    </View>
    <View style={styles.cardBody}>{children}</View>
  </View>
);

const Msg = ({ text, type }: { text: string; type: 'success' | 'error' | 'warning' | 'info' }) => {
  const colors: Record<string, string> = { success: GREEN, error: RED, warning: YELLOW, info: BLUE };
  return (
    <View style={[styles.msg, { borderLeftColor: colors[type], backgroundColor: colors[type] + '18' }]}>
      <Text style={[styles.msgText, { color: colors[type] }]}>{text}</Text>
    </View>
  );
};

// ─── PANTALLA DASHBOARD ───────────────────────────────────────────────────────
const Dashboard = () => {
  const [resumen, setResumen] = useState<Resumen | null>(null);
  const [alertas, setAlertas] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch<Resumen>(API_RESUMEN);
      setResumen(data);
    } catch {
      Alert.alert('Error', 'No se pudo cargar el resumen');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const stats = resumen ? [
    { value: resumen.totalProductos, label: 'Productos', color: GOLD },
    { value: resumen.totalMovimientos, label: 'Movimientos', color: BLUE },
    { value: resumen.sinStock, label: 'Sin Stock', color: RED },
    { value: resumen.stockBajo, label: 'Stock Bajo', color: YELLOW },
  ] : [];

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.screenPad}>
      <Text style={styles.pageTitle}>Dashboard General</Text>
      {loading ? (
        <ActivityIndicator size="large" color={GOLD} style={{ marginTop: 40 }} />
      ) : (
        <>
          <View style={styles.statsGrid}>
            {stats.map(s => (
              <View key={s.label} style={[styles.statCard, { borderTopColor: s.color }]}>
                <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
          <SectionCard title="Resumen del sistema">
            <Btn label="↻ Actualizar" onPress={load} />
          </SectionCard>
        </>
      )}
    </ScrollView>
  );
};

// ─── PANTALLA NUEVO PRODUCTO ──────────────────────────────────────────────────
const NuevoProducto = () => {
  const [codigo, setCodigo] = useState('');
  const [nombre, setNombre] = useState('');
  const [unidad, setUnidad] = useState('');
  const [grupo, setGrupo] = useState('');
  const [stockMin, setStockMin] = useState('0');
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [loading, setLoading] = useState(false);

  const UNIDADES = ['UND', 'KG', 'MT', 'LT', 'CAJA', 'ROLLO', 'PAR', 'JGO'];
  const GRUPOS   = ['Dotación', 'EPP', 'Herramientas', 'Limpieza', 'Oficina', 'Otros'];

  const registrar = async () => {
    if (!codigo || !nombre || !unidad || !grupo) {
      setMsg({ text: 'Todos los campos marcados son obligatorios', type: 'error' }); return;
    }
    setLoading(true);
    try {
      const params = { action: 'registrarProducto', codigo: codigo.toUpperCase(), nombre, unidad, grupo, stockMin };
      await apiFetch(API_RESUMEN, params as any);
      setMsg({ text: 'Producto registrado correctamente', type: 'success' });
      setCodigo(''); setNombre(''); setUnidad(''); setGrupo(''); setStockMin('0');
    } catch {
      setMsg({ text: 'Error al registrar el producto', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <ScrollView style={styles.screen} contentContainerStyle={styles.screenPad}>
        <Text style={styles.pageTitle}>Nuevo Producto</Text>
        <SectionCard title="Registrar Producto">
          <View style={styles.row}>
            <Field label="Código *" value={codigo} onChange={setCodigo} placeholder="Ej: EPP-001" half />
            <Field label="Stock Mínimo" value={stockMin} onChange={setStockMin} numeric half />
          </View>
          <Field label="Nombre *" value={nombre} onChange={setNombre} placeholder="Nombre del producto" />
          <Picker label="Unidad de Medida *" value={unidad} options={UNIDADES} onChange={setUnidad} />
          <Picker label="Grupo *" value={grupo} options={GRUPOS} onChange={setGrupo} />
          {msg && <Msg text={msg.text} type={msg.type} />}
          <View style={styles.rowBtns}>
            {loading
              ? <ActivityIndicator color={GOLD} />
              : <Btn label="✓ Registrar Producto" onPress={registrar} color={GREEN} />
            }
            <Btn label="Limpiar" onPress={() => { setCodigo(''); setNombre(''); setUnidad(''); setGrupo(''); setStockMin('0'); setMsg(null); }} color={GRAY} small />
          </View>
        </SectionCard>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// ─── PANTALLA MOVIMIENTOS ─────────────────────────────────────────────────────
const Movimientos = () => {
  const [codigo, setCodigo] = useState('');
  const [fecha, setFecha] = useState(today());
  const [tipo, setTipo] = useState('INGRESO');
  const [cantidad, setCantidad] = useState('');
  const [obs, setObs] = useState('');
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [loading, setLoading] = useState(false);

  const TIPOS = ['INGRESO', 'SALIDA', 'AJUSTE_POSITIVO', 'AJUSTE_NEGATIVO'];
  const TIPO_LABELS: Record<string, string> = {
    INGRESO: 'Ingreso', SALIDA: 'Salida',
    AJUSTE_POSITIVO: 'Ajuste Positivo', AJUSTE_NEGATIVO: 'Ajuste Negativo',
  };

  const registrar = async () => {
    if (!codigo || !fecha || !cantidad || parseFloat(cantidad) <= 0) {
      setMsg({ text: 'Todos los campos son obligatorios y la cantidad debe ser mayor a 0', type: 'error' }); return;
    }
    setLoading(true);
    try {
      const params = { action: 'registrarMovimiento', codigo: codigo.toUpperCase(), fecha, tipo, cantidad, observaciones: obs };
      await apiFetch(API_RESUMEN, params as any);
      setMsg({ text: 'Movimiento registrado correctamente', type: 'success' });
      setCodigo(''); setCantidad(''); setObs(''); setFecha(today());
    } catch {
      setMsg({ text: 'Error al registrar el movimiento', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <ScrollView style={styles.screen} contentContainerStyle={styles.screenPad}>
        <Text style={styles.pageTitle}>Registro de Movimientos</Text>
        <SectionCard title="Nuevo Movimiento">
          <View style={styles.row}>
            <Field label="Código del Producto *" value={codigo} onChange={setCodigo} placeholder="Ej: EPP-001" half />
            <Field label="Fecha *" value={fecha} onChange={setFecha} placeholder="YYYY-MM-DD" half />
          </View>
          <Picker label="Tipo de Movimiento *" value={TIPO_LABELS[tipo]} options={Object.values(TIPO_LABELS)} onChange={v => setTipo(Object.keys(TIPO_LABELS).find(k => TIPO_LABELS[k] === v) || 'INGRESO')} />
          <Field label="Cantidad *" value={cantidad} onChange={setCantidad} placeholder="0.00" numeric />
          <Field label="Observaciones" value={obs} onChange={setObs} placeholder="Opcional..." multiline />
          {msg && <Msg text={msg.text} type={msg.type} />}
          <View style={styles.rowBtns}>
            {loading
              ? <ActivityIndicator color={GOLD} />
              : <Btn label="✓ Guardar Movimiento" onPress={registrar} color={GREEN} />
            }
            <Btn label="Limpiar" onPress={() => { setCodigo(''); setCantidad(''); setObs(''); setFecha(today()); setMsg(null); }} color={GRAY} small />
          </View>
        </SectionCard>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// ─── PANTALLA INVENTARIO ──────────────────────────────────────────────────────
const Inventario = () => {
  const [data, setData] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(false);
  const [soloAlertas, setSoloAlertas] = useState(false);

  const load = useCallback(async (alertas = false) => {
    setLoading(true);
    setSoloAlertas(alertas);
    try {
      const raw = await apiFetch<any[][]>(API_INVENTARIO);
      const productos: Producto[] = raw.map(r => ({
        codigo: r[0], nombre: r[1], unidad: r[2],
        grupo: r[3], stockMin: Number(r[4]), cantidad: Number(r[5])
      }));
      setData(alertas ? productos.filter(p => p.cantidad <= 0 || p.cantidad <= p.stockMin) : productos);
    } catch {
      Alert.alert('Error', 'No se pudo cargar el inventario');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const getStatus = (p: Producto) => {
    if (p.cantidad <= 0) return { label: 'Sin Stock', color: RED };
    if (p.stockMin > 0 && p.cantidad <= p.stockMin) return { label: 'Stock Bajo', color: YELLOW };
    return { label: 'Normal', color: GREEN };
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.screenPad}>
        <Text style={styles.pageTitle}>Control de Inventario</Text>
        <View style={styles.rowBtns}>
          <Btn label="↻ Actualizar" onPress={() => load(false)} small />
          <Btn label="⚠ Solo Alertas" onPress={() => load(true)} color={YELLOW} small />
        </View>
        {soloAlertas && <Msg text="Mostrando solo productos con alertas" type="warning" />}
        {loading
          ? <ActivityIndicator size="large" color={GOLD} style={{ marginTop: 30 }} />
          : data.length === 0
            ? <Msg text="No hay productos registrados" type="info" />
            : data.map(p => {
                const st = getStatus(p);
                return (
                  <View key={p.codigo} style={[styles.productRow, { borderLeftColor: st.color }]}>
                    <View style={styles.productRowTop}>
                      <Text style={styles.productCode}>{p.codigo}</Text>
                      <Badge label={st.label} color={st.color} />
                    </View>
                    <Text style={styles.productName}>{p.nombre}</Text>
                    <View style={styles.productMeta}>
                      <Text style={styles.metaText}>📦 {p.unidad}  ·  🏷 {p.grupo}</Text>
                      <Text style={[styles.metaStock, { color: st.color }]}>
                        {p.cantidad} / mín {p.stockMin}
                      </Text>
                    </View>
                  </View>
                );
              })
        }
      </ScrollView>
    </View>
  );
};

// ─── PANTALLA REPORTES ────────────────────────────────────────────────────────
const Reportes = () => {
  const [desde, setDesde] = useState(monthAgo());
  const [hasta, setHasta] = useState(today());
  const [tipoFiltro, setTipoFiltro] = useState('');
  const [data, setData] = useState<Movimiento[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const TIPO_OPTIONS = ['Todos', 'INGRESO', 'SALIDA', 'AJUSTE_POSITIVO', 'AJUSTE_NEGATIVO'];
  const TIPO_COLOR: Record<string, string> = {
    INGRESO: GREEN, SALIDA: RED, AJUSTE_POSITIVO: GREEN, AJUSTE_NEGATIVO: RED, AJUSTE: YELLOW,
  };

  const generar = async () => {
    if (!desde || !hasta) { setMsg('Seleccione ambas fechas'); return; }
    setLoading(true);
    setMsg('');
    try {
      const params: any = { action: 'obtenerHistorial', fechaDesde: desde, fechaHasta: hasta };
      if (tipoFiltro && tipoFiltro !== 'Todos') params.tipo = tipoFiltro;
      const res = await apiFetch<Movimiento[]>(API_RESUMEN, params);
      setData(res);
      if (res.length === 0) setMsg('No hay movimientos en el período seleccionado');
    } catch {
      setMsg('Error al cargar el historial');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.screenPad}>
      <Text style={styles.pageTitle}>Reportes</Text>
      <SectionCard title="Historial de Movimientos">
        <View style={styles.row}>
          <Field label="Fecha Desde" value={desde} onChange={setDesde} placeholder="YYYY-MM-DD" half />
          <Field label="Fecha Hasta" value={hasta} onChange={setHasta} placeholder="YYYY-MM-DD" half />
        </View>
        <Picker label="Filtrar por Tipo" value={tipoFiltro || 'Todos'} options={TIPO_OPTIONS} onChange={v => setTipoFiltro(v === 'Todos' ? '' : v)} />
        <Btn label="Generar Reporte" onPress={generar} />
      </SectionCard>
      {loading && <ActivityIndicator color={GOLD} style={{ marginTop: 20 }} />}
      {msg !== '' && <Msg text={msg} type="warning" />}
      {data.map((m, i) => (
        <View key={i} style={[styles.movRow, { borderLeftColor: TIPO_COLOR[m.tipo] || GOLD }]}>
          <View style={styles.movRowTop}>
            <Text style={styles.movFecha}>{m.fecha}</Text>
            <Badge label={m.tipo.replace('_', ' ')} color={TIPO_COLOR[m.tipo] || GOLD} />
          </View>
          <Text style={styles.movProducto}>{m.producto} <Text style={styles.movCodigo}>({m.codigo})</Text></Text>
          <Text style={[styles.movCantidad, { color: TIPO_COLOR[m.tipo] || GOLD }]}>Cantidad: {m.cantidad}</Text>
          {m.observaciones ? <Text style={styles.movObs}>{m.observaciones}</Text> : null}
        </View>
      ))}
    </ScrollView>
  );
};

// ─── PANTALLA BUSCAR ──────────────────────────────────────────────────────────
const Buscar = () => {
  const [texto, setTexto] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const buscar = useCallback(async () => {
    if (texto.length < 2) return;
    setLoading(true);
    setSearched(true);
    try {
      const raw = await apiFetch<any[][]>(API_INVENTARIO);
      const term = texto.toLowerCase();
      const filtered = raw.filter(r =>
        String(r[0]).toLowerCase().includes(term) ||
        String(r[1]).toLowerCase().includes(term) ||
        String(r[3]).toLowerCase().includes(term)
      );
      setResults(filtered);
    } catch {
      Alert.alert('Error', 'No se pudo realizar la búsqueda');
    } finally {
      setLoading(false);
    }
  }, [texto]);

  useEffect(() => {
    const t = setTimeout(() => { if (texto.length >= 2) buscar(); }, 300);
    return () => clearTimeout(t);
  }, [texto, buscar]);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.screenPad}
      keyboardShouldPersistTaps="handled">
      <Text style={styles.pageTitle}>Buscar Productos</Text>
      <SectionCard title="Búsqueda">
        <View style={styles.searchRow}>
          <TextInput
            style={styles.searchInput}
            value={texto}
            onChangeText={setTexto}
            placeholder="Código, nombre o grupo..."
            placeholderTextColor={GRAY}
          />
          {texto.length > 0 &&
            <TouchableOpacity onPress={() => { setTexto(''); setResults([]); setSearched(false); }}>
              <Text style={styles.clearBtn}>✕</Text>
            </TouchableOpacity>
          }
        </View>
      </SectionCard>
      {loading && <ActivityIndicator color={GOLD} style={{ marginTop: 20 }} />}
      {searched && !loading && results.length === 0 &&
        <Msg text="No se encontraron productos" type="warning" />}
      {results.map((r, i) => {
        const cant = Number(r[5]), min = Number(r[4]);
        const color = cant <= 0 ? RED : (min > 0 && cant <= min ? YELLOW : GREEN);
        return (
          <View key={i} style={[styles.productRow, { borderLeftColor: color }]}>
            <View style={styles.productRowTop}>
              <Text style={styles.productCode}>{r[0]}</Text>
              <Badge label={cant <= 0 ? 'Sin Stock' : cant <= min ? 'Stock Bajo' : 'Normal'} color={color} />
            </View>
            <Text style={styles.productName}>{r[1]}</Text>
            <View style={styles.productMeta}>
              <Text style={styles.metaText}>{r[2]}  ·  {r[3]}</Text>
              <Text style={[styles.metaStock, { color }]}>Stock: {r[5]}</Text>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
};

// ─── APP PRINCIPAL ────────────────────────────────────────────────────────────
const TABS: { key: Tab; icon: string; label: string }[] = [
  { key: 'dashboard',   icon: '📊', label: 'Inicio' },
  { key: 'productos',   icon: '📦', label: 'Producto' },
  { key: 'movimientos', icon: '📋', label: 'Movimiento' },
  { key: 'inventario',  icon: '🗂',  label: 'Inventario' },
  { key: 'reportes',    icon: '📈', label: 'Reportes' },
  { key: 'buscar',      icon: '🔍', label: 'Buscar' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  const renderScreen = () => {
    switch (activeTab) {
      case 'dashboard':   return <Dashboard />;
      case 'productos':   return <NuevoProducto />;
      case 'movimientos': return <Movimientos />;
      case 'inventario':  return <Inventario />;
      case 'reportes':    return <Reportes />;
      case 'buscar':      return <Buscar />;
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={BLACK} />
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerLogo}>🏭</Text>
        <Text style={styles.headerTitle}>Dotaciones Toronto</Text>
      </View>
      {/* Content */}
      <View style={styles.content}>{renderScreen()}</View>
      {/* Bottom Tab Bar */}
      <View style={styles.tabBar}>
        {TABS.map(t => (
          <TouchableOpacity
            key={t.key}
            style={styles.tabItem}
            onPress={() => setActiveTab(t.key)}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabIcon, activeTab === t.key && styles.tabIconActive]}>
              {t.icon}
            </Text>
            <Text style={[styles.tabLabel, activeTab === t.key && styles.tabLabelActive]}>
              {t.label}
            </Text>
            {activeTab === t.key && <View style={styles.tabIndicator} />}
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

// ─── ESTILOS ──────────────────────────────────────────────────────────────────
const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  root:        { flex: 1, backgroundColor: BLACK },
  header:      { flexDirection: 'row', alignItems: 'center', backgroundColor: BLACK, paddingHorizontal: 18, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: GOLD + '44' },
  headerLogo:  { fontSize: 22, marginRight: 10 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: GOLD, letterSpacing: 0.5 },
  content:     { flex: 1, backgroundColor: DARK },

  // Tab bar
  tabBar:          { flexDirection: 'row', backgroundColor: BLACK, borderTopWidth: 1, borderTopColor: GOLD + '33', paddingBottom: Platform.OS === 'ios' ? 16 : 6, paddingTop: 6 },
  tabItem:         { flex: 1, alignItems: 'center', justifyContent: 'center', position: 'relative', paddingVertical: 4 },
  tabIcon:         { fontSize: 18, opacity: 0.45 },
  tabIconActive:   { opacity: 1 },
  tabLabel:        { fontSize: 9, color: GRAY, marginTop: 2, fontWeight: '500' },
  tabLabelActive:  { color: GOLD, fontWeight: '700' },
  tabIndicator:    { position: 'absolute', top: 0, width: 24, height: 2, backgroundColor: GOLD, borderRadius: 2 },

  // Screens
  screen:    { flex: 1, backgroundColor: DARK },
  screenPad: { padding: 16, paddingBottom: 30 },
  pageTitle: { fontSize: 22, fontWeight: '800', color: WHITE, marginBottom: 18, letterSpacing: -0.3 },

  // Cards
  card:       { backgroundColor: CARD, borderRadius: 14, marginBottom: 18, overflow: 'hidden', borderWidth: 1, borderColor: '#2A2A2A' },
  cardHeader: { backgroundColor: GOLD, paddingHorizontal: 18, paddingVertical: 12 },
  cardTitle:  { fontSize: 14, fontWeight: '700', color: BLACK },
  cardBody:   { padding: 16 },

  // Stats
  statsGrid:  { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 },
  statCard:   { width: (width - 44) / 2, backgroundColor: CARD, borderRadius: 12, padding: 18, borderTopWidth: 3, borderWidth: 1, borderColor: '#2A2A2A' },
  statValue:  { fontSize: 28, fontWeight: '800', marginBottom: 4 },
  statLabel:  { fontSize: 11, color: GRAY, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8 },

  // Fields
  field:        { marginBottom: 14, flex: 1 },
  fieldHalf:    { flex: 1 },
  fieldLabel:   { fontSize: 12, fontWeight: '600', color: GRAY, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.6 },
  fieldInput:   { backgroundColor: '#222', borderWidth: 1.5, borderColor: '#333', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, color: WHITE, fontSize: 14 },
  row:          { flexDirection: 'row', gap: 12 },
  rowBtns:      { flexDirection: 'row', gap: 10, marginTop: 6, flexWrap: 'wrap' },

  // Picker
  pickerBtn:         { backgroundColor: '#222', borderWidth: 1.5, borderColor: '#333', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pickerValue:       { color: WHITE, fontSize: 14 },
  pickerPlaceholder: { color: GRAY, fontSize: 14 },
  pickerOverlay:     { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 24 },
  pickerModal:       { backgroundColor: CARD, borderRadius: 16, padding: 16, maxHeight: 350, borderWidth: 1, borderColor: GOLD + '44' },
  pickerTitle:       { color: GOLD, fontWeight: '700', fontSize: 15, marginBottom: 12 },
  pickerItem:        { paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: '#2A2A2A' },
  pickerItemActive:  { backgroundColor: GOLD + '11' },
  pickerItemText:    { color: WHITE, fontSize: 14 },

  // Buttons
  btn:           { backgroundColor: GOLD, borderRadius: 10, paddingVertical: 13, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', gap: 6 },
  btnSmall:      { paddingVertical: 9, paddingHorizontal: 14 },
  btnLabel:      { color: BLACK, fontWeight: '700', fontSize: 14 },
  btnLabelSmall: { fontSize: 13 },
  btnIcon:       { fontSize: 14 },

  // Badges
  badge:     { borderRadius: 20, paddingHorizontal: 9, paddingVertical: 3, borderWidth: 1 },
  badgeText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },

  // Messages
  msg:     { borderLeftWidth: 3, borderRadius: 8, padding: 12, marginVertical: 10 },
  msgText: { fontSize: 13, fontWeight: '500' },

  // Products
  productRow:    { backgroundColor: CARD, borderRadius: 12, padding: 14, marginBottom: 10, borderLeftWidth: 4, borderWidth: 1, borderColor: '#2A2A2A' },
  productRowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  productCode:   { fontSize: 13, fontWeight: '700', color: GOLD, letterSpacing: 0.5 },
  productName:   { fontSize: 15, color: WHITE, fontWeight: '600', marginBottom: 8 },
  productMeta:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  metaText:      { fontSize: 12, color: GRAY },
  metaStock:     { fontSize: 13, fontWeight: '700' },

  // Movimientos
  movRow:     { backgroundColor: CARD, borderRadius: 12, padding: 14, marginBottom: 10, borderLeftWidth: 4, borderWidth: 1, borderColor: '#2A2A2A' },
  movRowTop:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  movFecha:   { fontSize: 12, color: GRAY },
  movProducto:{ fontSize: 14, color: WHITE, fontWeight: '600', marginBottom: 3 },
  movCodigo:  { color: GRAY, fontWeight: '400' },
  movCantidad:{ fontSize: 13, fontWeight: '700', marginBottom: 3 },
  movObs:     { fontSize: 12, color: GRAY, fontStyle: 'italic' },

  // Search
  searchRow:  { flexDirection: 'row', alignItems: 'center', backgroundColor: '#222', borderRadius: 10, borderWidth: 1.5, borderColor: '#333', paddingHorizontal: 14 },
  searchInput:{ flex: 1, paddingVertical: 12, color: WHITE, fontSize: 14 },
  clearBtn:   { color: GRAY, fontSize: 16, paddingLeft: 10 },
});