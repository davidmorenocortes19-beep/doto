import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Alert, FlatList,
} from 'react-native';


type Producto = {
  codigo: string;
  nombre: string;
  unidad: string;
  grupo: string;
  stockMin: number;
  stockActual: number;
};

type Movimiento = {
  id: number;
  codigo: string;
  producto: string;
  fecha: string;
  tipo: 'INGRESO' | 'SALIDA' | 'AJUSTE_POSITIVO' | 'AJUSTE_NEGATIVO';
  cantidad: number;
  observaciones: string;
};

type TabName = 'dashboard' | 'productos' | 'movimientos' | 'inventario' | 'buscar';


const UNIDADES = ['Unidad', 'Par', 'Caja', 'Metro', 'Kg'];
const GRUPOS   = ['Dotación', 'Calzado', 'Protección', 'Herramientas', 'Accesorios'];

const productosIniciales: Producto[] = [
  { codigo: 'CAM001', nombre: 'Camisa Manga Larga',   unidad: 'Unidad', grupo: 'Dotación',    stockMin: 10, stockActual: 25 },
  { codigo: 'PAN002', nombre: 'Pantalón Industrial',  unidad: 'Unidad', grupo: 'Dotación',    stockMin: 10, stockActual: 8  },
  { codigo: 'BOT003', nombre: 'Bota de Seguridad',    unidad: 'Par',    grupo: 'Calzado',     stockMin: 5,  stockActual: 0  },
  { codigo: 'CAS004', nombre: 'Casco Protector',      unidad: 'Unidad', grupo: 'Protección',  stockMin: 5,  stockActual: 12 },
  { codigo: 'GUA005', nombre: 'Guantes de Cuero',     unidad: 'Par',    grupo: 'Protección',  stockMin: 20, stockActual: 15 },
];

const movimientosIniciales: Movimiento[] = [
  { id: 1, codigo: 'CAM001', producto: 'Camisa Manga Larga',  fecha: '2024-01-15', tipo: 'INGRESO',  cantidad: 50, observaciones: 'Pedido mensual' },
  { id: 2, codigo: 'PAN002', producto: 'Pantalón Industrial', fecha: '2024-01-16', tipo: 'SALIDA',   cantidad: 5,  observaciones: 'Entrega a obra' },
  { id: 3, codigo: 'BOT003', producto: 'Bota de Seguridad',   fecha: '2024-01-17', tipo: 'SALIDA',   cantidad: 10, observaciones: 'Entrega empleados' },
];


function getEstado(p: Producto): { label: string; color: string } {
  if (p.stockActual <= 0)                              return { label: 'Sin Stock',  color: '#dc3545' };
  if (p.stockActual <= p.stockMin && p.stockMin > 0)  return { label: 'Stock Bajo', color: '#ffc107' };
  return { label: 'Normal', color: '#28a745' };
}

function fechaHoy(): string {
  return new Date().toISOString().split('T')[0];
}

export default function InventarioBodeguero() {
  const [tabActiva, setTabActiva]       = useState<TabName>('dashboard');
  const [productos, setProductos]       = useState<Producto[]>(productosIniciales);
  const [movimientos, setMovimientos]   = useState<Movimiento[]>(movimientosIniciales);
  const [busqueda, setBusqueda]         = useState('');

  
  const [fCodigo,   setFCodigo]   = useState('');
  const [fNombre,   setFNombre]   = useState('');
  const [fUnidad,   setFUnidad]   = useState(UNIDADES[0]);
  const [fGrupo,    setFGrupo]    = useState(GRUPOS[0]);
  const [fStockMin, setFStockMin] = useState('0');

  
  const [mCodigo,  setMCodigo]  = useState('');
  const [mFecha,   setMFecha]   = useState(fechaHoy());
  const [mTipo,    setMTipo]    = useState<Movimiento['tipo']>('INGRESO');
  const [mCant,    setMCant]    = useState('');
  const [mObs,     setMObs]     = useState('');

  
  const totalProductos   = productos.length;
  const totalMovimientos = movimientos.length;
  const sinStock         = productos.filter(p => p.stockActual <= 0).length;
  const stockBajo        = productos.filter(p => p.stockActual > 0 && p.stockActual <= p.stockMin && p.stockMin > 0).length;


  function registrarProducto() {
    if (!fCodigo.trim() || !fNombre.trim()) {
      Alert.alert('Error', 'Código y nombre son obligatorios.');
      return;
    }
    if (productos.find(p => p.codigo === fCodigo.trim().toUpperCase())) {
      Alert.alert('Error', `El código "${fCodigo}" ya existe.`);
      return;
    }
    const nuevo: Producto = {
      codigo:      fCodigo.trim().toUpperCase(),
      nombre:      fNombre.trim(),
      unidad:      fUnidad,
      grupo:       fGrupo,
      stockMin:    parseInt(fStockMin) || 0,
      stockActual: 0,
    };
    setProductos(prev => [...prev, nuevo]);
    setFCodigo(''); setFNombre(''); setFStockMin('0');
    Alert.alert('Éxito ✅', 'Producto registrado correctamente.');
  }


  function registrarMovimiento() {
    const codigoUp = mCodigo.trim().toUpperCase();
    const cant     = parseFloat(mCant);

    if (!codigoUp || !mFecha || isNaN(cant) || cant <= 0) {
      Alert.alert('Error', 'Todos los campos son obligatorios y la cantidad debe ser mayor a 0.');
      return;
    }

    const idx = productos.findIndex(p => p.codigo === codigoUp);
    if (idx === -1) { Alert.alert('Error', `Producto "${codigoUp}" no encontrado.`); return; }

    const prod = { ...productos[idx] };

    if ((mTipo === 'SALIDA' || mTipo === 'AJUSTE_NEGATIVO') && prod.stockActual < cant) {
      Alert.alert('Error', 'Stock insuficiente para realizar la salida.');
      return;
    }

    
    if (mTipo === 'INGRESO' || mTipo === 'AJUSTE_POSITIVO') prod.stockActual += cant;
    else prod.stockActual -= cant;

    const nuevosProductos = [...productos];
    nuevosProductos[idx]  = prod;
    setProductos(nuevosProductos);

    const nuevoMov: Movimiento = {
      id:            movimientos.length + 1,
      codigo:        codigoUp,
      producto:      prod.nombre,
      fecha:         mFecha,
      tipo:          mTipo,
      cantidad:      cant,
      observaciones: mObs.trim(),
    };
    setMovimientos(prev => [nuevoMov, ...prev]);

    setMCodigo(''); setMCant(''); setMObs(''); setMFecha(fechaHoy());
    Alert.alert('Éxito ✅', 'Movimiento registrado correctamente.');
  }

  // ── Productos filtrados (búsqueda) ──────────────────────────────────────────
  const productosFiltrados = busqueda.trim().length >= 2
    ? productos.filter(p =>
        p.codigo.includes(busqueda.toUpperCase()) ||
        p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.grupo.toLowerCase().includes(busqueda.toLowerCase())
      )
    : [];

  // ── Tabs ────────────────────────────────────────────────────────────────────
  const tabs: { key: TabName; label: string; icon: string }[] = [
    { key: 'dashboard',   label: 'Dashboard',  icon: '📊' },
    { key: 'productos',   label: 'Productos',  icon: '📦' },
    { key: 'movimientos', label: 'Movimientos',icon: '📋' },
    { key: 'inventario',  label: 'Inventario', icon: '🗂️' },
    { key: 'buscar',      label: 'Buscar',     icon: '🔍' },
  ];

  return (
    <View style={styles.root}>

      {/* ── Barra de tabs ── */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabBar}>
        {tabs.map(t => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tabBtn, tabActiva === t.key && styles.tabBtnActive]}
            onPress={() => setTabActiva(t.key)}
          >
            <Text style={styles.tabIcon}>{t.icon}</Text>
            <Text style={[styles.tabLabel, tabActiva === t.key && styles.tabLabelActive]}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ── Contenido por tab ── */}
      <ScrollView contentContainerStyle={styles.content}>

        {/* DASHBOARD */}
        {tabActiva === 'dashboard' && (
          <View>
            <Text style={styles.sectionTitle}>Dashboard General</Text>
            <View style={styles.statsGrid}>
              <StatCard valor={totalProductos}   label="Total Productos" />
              <StatCard valor={totalMovimientos} label="Total Movimientos" />
              <StatCard valor={sinStock}         label="Sin Stock"    color="#dc3545" />
              <StatCard valor={stockBajo}        label="Stock Bajo"   color="#ffc107" />
            </View>

            <Text style={styles.cardTitle}>Alertas de Stock</Text>
            {productos.filter(p => p.stockActual <= p.stockMin).length === 0
              ? <Text style={styles.emptyText}>No hay alertas de stock.</Text>
              : productos.filter(p => p.stockActual <= p.stockMin).map(p => {
                  const est = getEstado(p);
                  return (
                    <View key={p.codigo} style={[styles.alertRow, { borderLeftColor: est.color }]}>
                      <Text style={styles.alertCodigo}>{p.codigo}</Text>
                      <Text style={styles.alertNombre}>{p.nombre}</Text>
                      <Text style={[styles.alertEstado, { color: est.color }]}>{est.label}</Text>
                      <Text style={styles.alertStock}>Stock: {p.stockActual}</Text>
                    </View>
                  );
                })
            }
          </View>
        )}

        {/* PRODUCTOS */}
        {tabActiva === 'productos' && (
          <View>
            <Text style={styles.sectionTitle}>Registrar Nuevo Producto</Text>

            <Text style={styles.label}>Código *</Text>
            <TextInput style={styles.input} placeholder="Código único" placeholderTextColor="#666"
              autoCapitalize="characters" value={fCodigo} onChangeText={setFCodigo} />

            <Text style={styles.label}>Nombre *</Text>
            <TextInput style={styles.input} placeholder="Nombre del producto" placeholderTextColor="#666"
              value={fNombre} onChangeText={setFNombre} />

            <Text style={styles.label}>Unidad de Medida</Text>
            <View style={styles.pickerRow}>
              {UNIDADES.map(u => (
                <TouchableOpacity key={u} style={[styles.chip, fUnidad === u && styles.chipActive]}
                  onPress={() => setFUnidad(u)}>
                  <Text style={[styles.chipText, fUnidad === u && styles.chipTextActive]}>{u}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Grupo</Text>
            <View style={styles.pickerRow}>
              {GRUPOS.map(g => (
                <TouchableOpacity key={g} style={[styles.chip, fGrupo === g && styles.chipActive]}
                  onPress={() => setFGrupo(g)}>
                  <Text style={[styles.chipText, fGrupo === g && styles.chipTextActive]}>{g}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Stock Mínimo</Text>
            <TextInput style={styles.input} placeholder="0" placeholderTextColor="#666"
              keyboardType="numeric" value={fStockMin} onChangeText={setFStockMin} />

            <TouchableOpacity style={styles.btnPrimary} onPress={registrarProducto}>
              <Text style={styles.btnText}>✅ Registrar Producto</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* MOVIMIENTOS */}
        {tabActiva === 'movimientos' && (
          <View>
            <Text style={styles.sectionTitle}>Nuevo Movimiento</Text>

            <Text style={styles.label}>Código del Producto *</Text>
            <TextInput style={styles.input} placeholder="Código" placeholderTextColor="#666"
              autoCapitalize="characters" value={mCodigo} onChangeText={setMCodigo} />

            <Text style={styles.label}>Fecha *</Text>
            <TextInput style={styles.input} placeholder="YYYY-MM-DD" placeholderTextColor="#666"
              value={mFecha} onChangeText={setMFecha} />

            <Text style={styles.label}>Tipo de Movimiento *</Text>
            <View style={styles.pickerRow}>
              {(['INGRESO', 'SALIDA', 'AJUSTE_POSITIVO', 'AJUSTE_NEGATIVO'] as Movimiento['tipo'][]).map(t => (
                <TouchableOpacity key={t} style={[styles.chip, mTipo === t && styles.chipActive]}
                  onPress={() => setMTipo(t)}>
                  <Text style={[styles.chipText, mTipo === t && styles.chipTextActive]}>
                    {t.replace('_', ' ')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Cantidad *</Text>
            <TextInput style={styles.input} placeholder="0" placeholderTextColor="#666"
              keyboardType="numeric" value={mCant} onChangeText={setMCant} />

            <Text style={styles.label}>Observaciones</Text>
            <TextInput style={[styles.input, { height: 80 }]} placeholder="Observaciones opcionales"
              placeholderTextColor="#666" multiline value={mObs} onChangeText={setMObs} />

            <TouchableOpacity style={styles.btnPrimary} onPress={registrarMovimiento}>
              <Text style={styles.btnText}>💾 Guardar Movimiento</Text>
            </TouchableOpacity>

            <Text style={[styles.cardTitle, { marginTop: 24 }]}>Últimos movimientos</Text>
            {movimientos.slice(0, 10).map(m => (
              <View key={m.id} style={styles.movRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.movCodigo}>{m.codigo} — {m.producto}</Text>
                  <Text style={styles.movFecha}>{m.fecha} · {m.cantidad} uds</Text>
                  {m.observaciones ? <Text style={styles.movObs}>{m.observaciones}</Text> : null}
                </View>
                <Text style={[styles.movTipo, {
                  color: m.tipo === 'INGRESO' || m.tipo === 'AJUSTE_POSITIVO' ? '#28a745' : '#dc3545'
                }]}>
                  {m.tipo.replace('_', ' ')}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* INVENTARIO */}
        {tabActiva === 'inventario' && (
          <View>
            <Text style={styles.sectionTitle}>Stock Actual</Text>
            {productos.map(p => {
              const est = getEstado(p);
              return (
                <View key={p.codigo} style={[styles.stockRow, { borderLeftColor: est.color }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.stockCodigo}>{p.codigo}</Text>
                    <Text style={styles.stockNombre}>{p.nombre}</Text>
                    <Text style={styles.stockDetalle}>{p.unidad} · {p.grupo}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[styles.stockCantidad, { color: est.color }]}>{p.stockActual}</Text>
                    <Text style={styles.stockMin}>Mín: {p.stockMin}</Text>
                    <Text style={[styles.stockEstado, { color: est.color }]}>{est.label}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* BUSCAR */}
        {tabActiva === 'buscar' && (
          <View>
            <Text style={styles.sectionTitle}>Búsqueda de Productos</Text>
            <TextInput
              style={styles.input}
              placeholder="Buscar por código, nombre o grupo..."
              placeholderTextColor="#666"
              value={busqueda}
              onChangeText={setBusqueda}
            />
            {busqueda.trim().length > 0 && busqueda.trim().length < 2 && (
              <Text style={styles.emptyText}>Escribe al menos 2 caracteres.</Text>
            )}
            {productosFiltrados.length === 0 && busqueda.trim().length >= 2 && (
              <Text style={styles.emptyText}>No se encontraron productos.</Text>
            )}
            {productosFiltrados.map(p => {
              const est = getEstado(p);
              return (
                <View key={p.codigo} style={[styles.stockRow, { borderLeftColor: est.color }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.stockCodigo}>{p.codigo}</Text>
                    <Text style={styles.stockNombre}>{p.nombre}</Text>
                    <Text style={styles.stockDetalle}>{p.unidad} · {p.grupo}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[styles.stockCantidad, { color: est.color }]}>{p.stockActual}</Text>
                    <Text style={styles.stockMin}>Mín: {p.stockMin}</Text>
                    <Text style={[styles.stockEstado, { color: est.color }]}>{est.label}</Text>
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

// ── Sub-componente ─────────────────────────────────────────────────────────────
function StatCard({ valor, label, color = '#B7975B' }: { valor: number; label: string; color?: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={[styles.statValor, { color }]}>{valor}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

// ── Estilos ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root:    { flex: 1, backgroundColor: '#09080D' },
  content: { padding: 20, paddingBottom: 40 },

  // Tabs
  tabBar:        { flexGrow: 0, backgroundColor: '#0d0d1a', borderBottomWidth: 1, borderBottomColor: '#B7975B' },
  tabBtn:        { alignItems: 'center', paddingVertical: 10, paddingHorizontal: 16 },
  tabBtnActive:  { borderBottomWidth: 2, borderBottomColor: '#B7975B' },
  tabIcon:       { fontSize: 18 },
  tabLabel:      { color: '#aaa', fontSize: 11, marginTop: 2 },
  tabLabelActive:{ color: '#B7975B', fontWeight: 'bold' },

  // Secciones
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#B7975B', marginBottom: 20 },
  cardTitle:    { fontSize: 15, fontWeight: 'bold', color: '#B7975B', marginBottom: 12 },
  emptyText:    { color: '#666', fontStyle: 'italic', textAlign: 'center', marginTop: 12 },

  // Stats
  statsGrid:  { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  statCard:   { width: '46%', backgroundColor: '#1a1a2e', borderRadius: 10, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#333' },
  statValor:  { fontSize: 28, fontWeight: 'bold' },
  statLabel:  { color: '#aaa', fontSize: 12, marginTop: 4, textAlign: 'center' },

  // Alertas
  alertRow:   { backgroundColor: '#1a1a2e', borderRadius: 8, padding: 12, marginBottom: 8, borderLeftWidth: 4 },
  alertCodigo:{ color: '#B7975B', fontWeight: 'bold', fontSize: 13 },
  alertNombre:{ color: '#fff', fontSize: 13, marginTop: 2 },
  alertEstado:{ fontWeight: 'bold', fontSize: 12, marginTop: 4 },
  alertStock: { color: '#aaa', fontSize: 12 },

  // Formularios
  label: { color: '#aaa', fontSize: 13, marginBottom: 4, marginTop: 12 },
  input: {
    backgroundColor: '#0d0d1a',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 14,
  },

  // Chips (selector)
  pickerRow:     { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  chip:          { backgroundColor: '#0d0d1a', borderWidth: 1, borderColor: '#333', borderRadius: 20, paddingVertical: 6, paddingHorizontal: 12 },
  chipActive:    { backgroundColor: '#B7975B', borderColor: '#B7975B' },
  chipText:      { color: '#aaa', fontSize: 12 },
  chipTextActive:{ color: '#fff', fontWeight: 'bold' },

  // Botones
  btnPrimary: { backgroundColor: '#B7975B', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 20 },
  btnText:    { color: '#fff', fontWeight: 'bold', fontSize: 15 },

  // Movimientos
  movRow:    { backgroundColor: '#1a1a2e', borderRadius: 8, padding: 12, marginBottom: 8, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#333' },
  movCodigo: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  movFecha:  { color: '#aaa', fontSize: 12, marginTop: 2 },
  movObs:    { color: '#666', fontSize: 11, marginTop: 2, fontStyle: 'italic' },
  movTipo:   { fontWeight: 'bold', fontSize: 11, textAlign: 'right', maxWidth: 90 },

  // Stock
  stockRow:      { backgroundColor: '#1a1a2e', borderRadius: 8, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center', borderLeftWidth: 4 },
  stockCodigo:   { color: '#B7975B', fontWeight: 'bold', fontSize: 13 },
  stockNombre:   { color: '#fff', fontSize: 14, marginTop: 2 },
  stockDetalle:  { color: '#aaa', fontSize: 12, marginTop: 2 },
  stockCantidad: { fontSize: 22, fontWeight: 'bold' },
  stockMin:      { color: '#aaa', fontSize: 11 },
  stockEstado:   { fontWeight: 'bold', fontSize: 11, marginTop: 2 },
});