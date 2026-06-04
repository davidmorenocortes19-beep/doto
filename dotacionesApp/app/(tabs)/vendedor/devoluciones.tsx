import React, { useState, useEffect } from 'react';
import { router } from 'expo-router';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, ImageBackground, SafeAreaView, Modal,
  Alert, FlatList, KeyboardAvoidingView, Platform,
} from 'react-native';
import axios from 'axios';


const API_URL = 'http://192.168.1.48/dota/api/devoluciones.php';

type Devolucion = {
  id?: number;
  idVenta: string;
  cantidad: string;
  motivo: string;
  fecha: string;
};

const hoy = () => new Date().toISOString().split('T')[0];

export default function DevolucionesScreen() {
  const [lista,        setLista]        = useState<Devolucion[]>([]);
  const [busqueda,     setBusqueda]     = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editando,     setEditando]     = useState<Devolucion | null>(null);
  const [cargando,     setCargando]     = useState(false);

  // Form fields
  const [idVenta,   setIdVenta]   = useState('');
  const [cantidad,  setCantidad]  = useState('');
  const [motivo,    setMotivo]    = useState('');
  const [fecha,     setFecha]     = useState(hoy());
  const [formError, setFormError] = useState('');

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    try {
      setCargando(true);
      const res = await axios.get(API_URL, { timeout: 5000 });
      if (res.data.success) setLista(res.data.data);
    } catch {
      // fallback: mostrar datos locales si no hay servidor
    } finally {
      setCargando(false);
    }
  };

  const abrirModal = (dev?: Devolucion) => {
    setFormError('');
    if (dev) {
      setEditando(dev);
      setIdVenta(dev.idVenta);
      setCantidad(dev.cantidad);
      setMotivo(dev.motivo);
      setFecha(dev.fecha);
    } else {
      setEditando(null);
      setIdVenta('');
      setCantidad('');
      setMotivo('');
      setFecha(hoy());
    }
    setModalVisible(true);
  };

  const cerrarModal = () => {
    setModalVisible(false);
    setEditando(null);
    setFormError('');
  };

  const guardar = async () => {
    if (!idVenta || !cantidad || !motivo || !fecha) {
      setFormError('⚠ Todos los campos son obligatorios');
      return;
    }
    const payload: Devolucion = { idVenta, cantidad, motivo, fecha };
    if (editando?.id) payload.id = editando.id;

    try {
      setCargando(true);
      const res = editando?.id
        ? await axios.put(API_URL, payload, { timeout: 5000 })
        : await axios.post(API_URL, payload, { timeout: 5000 });

      if (res.data.success) {
        cerrarModal();
        cargar();
      } else {
        setFormError('❌ ' + res.data.mensaje);
      }
    } catch {
      // fallback local si no hay API
      if (editando) {
        setLista(prev => prev.map(d => (d.id === editando.id ? { ...payload } : d)));
      } else {
        setLista(prev => [...prev, { ...payload, id: Date.now() }]);
      }
      cerrarModal();
    } finally {
      setCargando(false);
    }
  };

  const eliminar = (dev: Devolucion) => {
    Alert.alert(
      'Eliminar devolución',
      '¿Estás seguro de que deseas eliminar esta devolución?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await axios.delete(API_URL, { data: { id: dev.id }, timeout: 5000 });
              cargar();
            } catch {
              setLista(prev => prev.filter(d => d.id !== dev.id));
            }
          },
        },
      ]
    );
  };

  const listafiltrada = lista.filter(d =>
    JSON.stringify(d).toLowerCase().includes(busqueda.toLowerCase())
  );

  const renderItem = ({ item, index }: { item: Devolucion; index: number }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardId}>Dev #{index + 1} · Venta {item.idVenta}</Text>
        <Text style={styles.cardFecha}>{item.fecha}</Text>
      </View>
      <View style={styles.motivoBadge}>
        <Text style={styles.motivoText}>{item.motivo}</Text>
      </View>
      <View style={styles.cardRow}>
        <Text style={styles.rowLabel}>Cantidad devuelta</Text>
        <Text style={styles.rowValue}>{item.cantidad} uds</Text>
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.btnEdit} onPress={() => abrirModal(item)}>
          <Text style={styles.btnEditText}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnDel} onPress={() => eliminar(item)}>
          <Text style={styles.btnDelText}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ImageBackground
      source={require('../../../assets/images/camiseta.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safeArea}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.replace('/vendedor/panel_vendedor')}>
            <Text style={styles.backBtn}>←</Text>
          </TouchableOpacity>
          <View style={styles.logoArea}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoInitials}>DT</Text>
            </View>
            <Text style={styles.headerTitle}>Devoluciones</Text>
          </View>
          <View style={{ width: 32 }} />
        </View>

        {/* Top bar: búsqueda + botón */}
        <View style={styles.topBar}>
          <View style={styles.searchWrap}>
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar..."
              placeholderTextColor="#666"
              value={busqueda}
              onChangeText={setBusqueda}
            />
            <Text style={styles.searchIcon}>🔍</Text>
          </View>
          <TouchableOpacity style={styles.btnAdd} onPress={() => abrirModal()}>
            <Text style={styles.btnAddText}>+ Registrar</Text>
          </TouchableOpacity>
        </View>

        {/* Lista */}
        <FlatList
          data={listafiltrada}
          keyExtractor={(_, i) => i.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.empty}>Sin devoluciones registradas</Text>
          }
        />

        {/* Bottom nav */}
        <View style={styles.bottomNav}>
          {[
            { label: 'Inicio', icon: '🏠', route: '/vendedor/panel_vendedor' },
            { label: 'Pedidos', icon: '📋', route: '/vendedor/pedidos' },
            { label: 'Devol.',  icon: '↩️', active: true },
            { label: 'Perfil',  icon: '👤', route: '/vendedor/perfil' },
          ].map(item => (
            <TouchableOpacity
              key={item.label}
              style={styles.bnav}
              onPress={() => item.route && router.push(item.route as any)}
            >
              <Text style={styles.bnavIcon}>{item.icon}</Text>
              <Text style={[styles.bnavLabel, item.active && styles.bnavActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

      </SafeAreaView>

      {/* Modal: Registrar / Editar */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>
              {editando ? 'Editar devolución' : 'Registrar devolución'}
            </Text>

            <Text style={styles.fieldLabel}>ID Venta</Text>
            <TextInput style={styles.fieldInput} keyboardType="numeric"
              placeholder="Ej: 10" placeholderTextColor="#555"
              value={idVenta} onChangeText={setIdVenta} />

            <Text style={styles.fieldLabel}>Cantidad</Text>
            <TextInput style={styles.fieldInput} keyboardType="numeric"
              placeholder="Ej: 2" placeholderTextColor="#555"
              value={cantidad} onChangeText={setCantidad} />

            <Text style={styles.fieldLabel}>Motivo</Text>
            <TextInput style={[styles.fieldInput, styles.textArea]} multiline
              placeholder="Descripción del motivo" placeholderTextColor="#555"
              value={motivo} onChangeText={setMotivo} />

            <Text style={styles.fieldLabel}>Fecha (YYYY-MM-DD)</Text>
            <TextInput style={styles.fieldInput}
              placeholder="2026-04-01" placeholderTextColor="#555"
              value={fecha} onChangeText={setFecha} />

            {formError !== '' && (
              <Text style={styles.formError}>{formError}</Text>
            )}

            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.btnCancel} onPress={cerrarModal}>
                <Text style={styles.btnCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btnSave, cargando && { opacity: 0.7 }]}
                onPress={guardar}
                disabled={cargando}
              >
                <Text style={styles.btnSaveText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background:    { flex: 1 },
  safeArea:      { flex: 1, backgroundColor: 'rgba(9,8,13,0.82)' },

  header:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#B7975B33', backgroundColor: 'rgba(9,8,13,0.97)' },
  backBtn:       { color: '#B7975B', fontSize: 22, paddingHorizontal: 4 },
  logoArea:      { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoCircle:    { width: 30, height: 30, borderRadius: 15, backgroundColor: '#B7975B', alignItems: 'center', justifyContent: 'center' },
  logoInitials:  { color: '#fff', fontWeight: 'bold', fontSize: 10 },
  headerTitle:   { color: '#B7975B', fontWeight: 'bold', fontSize: 15 },

  topBar:        { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12 },
  searchWrap:    { flex: 1, position: 'relative', justifyContent: 'center' },
  searchInput:   { backgroundColor: '#1e1c24', borderWidth: 1, borderColor: '#B7975B44', color: '#eee', borderRadius: 8, padding: 8, paddingRight: 32, fontSize: 12 },
  searchIcon:    { position: 'absolute', right: 8, fontSize: 14 },
  btnAdd:        { backgroundColor: '#B7975B', paddingHorizontal: 12, paddingVertical: 9, borderRadius: 8 },
  btnAddText:    { color: '#fff', fontWeight: 'bold', fontSize: 12 },

  listContent:   { paddingHorizontal: 12, paddingBottom: 16 },
  empty:         { color: '#666', textAlign: 'center', marginTop: 40, fontSize: 13 },

  card:          { backgroundColor: '#1e1c24', borderWidth: 1, borderColor: '#B7975B33', borderRadius: 10, padding: 12, marginBottom: 10 },
  cardHeader:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardId:        { color: '#B7975B', fontWeight: 'bold', fontSize: 13 },
  cardFecha:     { color: '#888', fontSize: 11 },
  motivoBadge:   { backgroundColor: '#B7975B22', borderWidth: 1, borderColor: '#B7975B33', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, marginBottom: 8, alignSelf: 'flex-start' },
  motivoText:    { color: '#B7975B', fontSize: 11 },
  cardRow:       { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  rowLabel:      { color: '#888', fontSize: 11 },
  rowValue:      { color: '#ccc', fontSize: 11, fontWeight: '500' },
  cardActions:   { flexDirection: 'row', gap: 8, justifyContent: 'flex-end' },
  btnEdit:       { backgroundColor: '#e67e22', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 6 },
  btnEditText:   { color: '#fff', fontSize: 11 },
  btnDel:        { backgroundColor: '#e74c3c', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 6 },
  btnDelText:    { color: '#fff', fontSize: 11 },

  bottomNav:     { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#B7975B22', backgroundColor: 'rgba(9,8,13,0.98)' },
  bnav:          { alignItems: 'center', gap: 2 },
  bnavIcon:      { fontSize: 18 },
  bnavLabel:     { fontSize: 9, color: '#666' },
  bnavActive:    { color: '#B7975B' },

  modalOverlay:  { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  modalBox:      { backgroundColor: '#1e1c24', borderWidth: 1, borderColor: '#B7975B55', borderRadius: 14, padding: 18, width: '88%' },
  modalTitle:    { color: '#B7975B', fontSize: 16, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  fieldLabel:    { color: '#aaa', fontSize: 11, marginBottom: 3, marginTop: 10 },
  fieldInput:    { backgroundColor: '#0e0d12', borderWidth: 1, borderColor: '#B7975B33', color: '#eee', borderRadius: 7, padding: 8, fontSize: 12 },
  textArea:      { height: 60, textAlignVertical: 'top' },
  formError:     { color: '#e74c3c', fontSize: 11, marginTop: 8 },
  modalBtns:     { flexDirection: 'row', gap: 8, marginTop: 16 },
  btnCancel:     { flex: 1, backgroundColor: '#333', padding: 10, borderRadius: 8, alignItems: 'center' },
  btnCancelText: { color: '#ccc', fontSize: 13 },
  btnSave:       { flex: 1, backgroundColor: '#B7975B', padding: 10, borderRadius: 8, alignItems: 'center' },
  btnSaveText:   { color: '#fff', fontWeight: 'bold', fontSize: 13 },
});
