import { ImageBackground } from 'react-native';
import InventarioFormulario from '@/components/InventarioFormulario';

export default function RegistroInventarioBodegueroScreen() {
  return (
    <ImageBackground
      source={require('../../../assets/images/camiseta.png')}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <InventarioFormulario listadoRuta="/bodeguero/inventario" />
    </ImageBackground>
  );
}
