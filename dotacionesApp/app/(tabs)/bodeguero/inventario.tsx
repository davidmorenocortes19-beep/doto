import { ImageBackground } from 'react-native';
import InventarioListado from '@/components/InventarioListado';

export default function InventarioBodegueroScreen() {
  return (
    <ImageBackground
      source={require('../../../assets/images/camiseta.png')}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <InventarioListado
        volverA="/bodeguero/panel_bodeguero"
        formularioRuta="/bodeguero/registroInventario"
      />
    </ImageBackground>
  );
}
