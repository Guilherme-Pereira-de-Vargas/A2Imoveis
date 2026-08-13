import { StyleSheet, View, ImageBackground, TouchableOpacity, Text } from 'react-native';
import Logo from '../Componentes/Logo';

export default function Inicial({ navigation }) {
  return (
    <View style={estilos.container}>
      <ImageBackground
        source={require('../Imagens/fundo1.png')}
        style={estilos.fundo}
        imageStyle={estilos.imagem}
        resizeMode="cover"
      >
        <Logo />
        <TouchableOpacity
          hitSlop={{ top: 10, bottom: 10 }}
          style={[estilos.botao, estilos.botaoEntrar]}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={estilos.textoBotaoEntrar}>Entrar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          hitSlop={{ top: 10, bottom: 10 }}
          style={[estilos.botao, estilos.botaoCadastrar]}
          onPress={() => navigation.navigate('Cadastro')}
        >
          <Text style={estilos.textoBotaoCadastrar}>Cadastrar</Text>
        </TouchableOpacity>
      </ImageBackground>
    </View>
  );
}

const estilos = StyleSheet.create({
  container: {
    flex: 1,
  },
  fundo: {
    flex: 1,
    width: '100%',
    height: '100%',
    alignItems: 'center',
  },
  imagem: {
    width: '100%',
    height: '100%',
  },
  botao: {
    width: '60%',
    paddingVertical: 10,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',

  },
  botaoEntrar: {
    backgroundColor: '#C9A86A',
    marginTop: 280,
  },
  botaoCadastrar: {
    backgroundColor: '#111',
    marginTop: 20,
  },
  textoBotaoEntrar: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  textoBotaoCadastrar: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
});