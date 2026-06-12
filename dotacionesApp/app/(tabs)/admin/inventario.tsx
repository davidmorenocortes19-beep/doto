import InventarioListado from '@/components/InventarioListado';

export default function InventarioAdminScreen() {
  return (
    <InventarioListado
      volverA="/admin/panel_admin"
      formularioRuta="/admin/registroInventario"
    />
  );
}
