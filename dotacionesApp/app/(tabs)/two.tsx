import { ImageBackground, StyleSheet } from 'react-native';

import EditScreenInfo from '@/components/EditScreenInfo';
import { Text, View } from '@/components/Themed';

export default function TabTwoScreen() {
  return (
    <ImageBackground
      source={require('../../assets/images/camiseta.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <Text style={styles.title}>Tab Two</Text>
        <View style={styles.separator} lightColor="#B7975B" darkColor="rgba(183,151,91,0.7)" />
        <EditScreenInfo path="app/(tabs)/two.tsx" />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'rgba(9,8,13,0.75)',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#B7975B',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
