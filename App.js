import 'react-native-gesture-handler';
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import Inicial from './Telas/Inicial';
import Cadastro from './Telas/Cadastro';

export default function App() {

  const Stack = createStackNavigator();
  return (
    <NavigationContainer>
      <Stack.Navigator 
      initialRouteName="Inicial"
      screenOptions={{
          headerShown: false,
      }}>
        <Stack.Screen name="Inicial" component={Inicial}/>
        <Stack.Screen name="Cadastro" component={Cadastro}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}