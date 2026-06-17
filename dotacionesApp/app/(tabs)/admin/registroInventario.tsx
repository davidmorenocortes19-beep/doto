import { ImageBackground } from 'react-native';
import InventarioFormulario from '@/components/InventarioFormulario';

export default function RegistroInventarioAdminScreen() {
  return (
    <ImageBackground
      source={require('../../../assets/images/camiseta.png')}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <InventarioFormulario listadoRuta="/admin/inventario" />
    </ImageBackground>
  );
}
