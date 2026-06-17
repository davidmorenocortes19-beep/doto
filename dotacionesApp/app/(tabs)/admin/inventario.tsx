import { ImageBackground } from 'react-native';
import InventarioListado from '@/components/InventarioListado';

export default function InventarioAdminScreen() {
  return (
    <ImageBackground
      source={require('../../../assets/images/camiseta.png')}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <InventarioListado
        volverA="/admin/panel_admin"
        formularioRuta="/admin/registroInventario"
      />
    </ImageBackground>
  );
}
