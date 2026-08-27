import 'react-native-gesture-handler';
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import Inicial from './Telas/Inicial';
import Cadastro from './Telas/Cadastro';
import Login from './Telas/Login';
import Imoveis from './Telas/Imoveis';
import ImoveisProprietario from './Telas/ImoveisProprietario';
import SolicitarAnuncio from './Telas/SolicitarAnuncio';
import DetalhesImovel from './Telas/DetalhesImovel';
import CadastroAdm from './Telas/CadastroAdm';
import InicialAdm from './Telas/InicialAdm';
import SolicitacoesAnuncio from './Telas/SolicitacoesAnuncios';
import Perfil from './Telas/Perfil';

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
        <Stack.Screen name="Login" component={Login}/>
        <Stack.Screen name="Imoveis" component={Imoveis}/>
        <Stack.Screen name="ImoveisProprietario" component={ImoveisProprietario}/>
        <Stack.Screen name="SolicitarAnuncio" component={SolicitarAnuncio}/>
        <Stack.Screen name="DetalhesImovel" component={DetalhesImovel}/>
        <Stack.Screen name="CadastroAdm" component={CadastroAdm}/>
        <Stack.Screen name="InicialAdm" component={InicialAdm}/>
        <Stack.Screen name="SolicitacoesAnuncio" component={SolicitacoesAnuncio}/>
        <Stack.Screen name="Perfil" component={Perfil}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}