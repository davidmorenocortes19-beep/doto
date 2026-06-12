import InventarioListado from '@/components/InventarioListado';

export default function InventarioBodegueroScreen() {
  return (
    <InventarioListado
      volverA="/bodeguero/panel_bodeguero"
      formularioRuta="/bodeguero/registroInventario"
    />
  );
}
