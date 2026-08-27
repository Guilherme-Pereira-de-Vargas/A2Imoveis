import { useState } from 'react';

import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  Alert,
} from 'react-native';

import {
  getAuth,
  signInWithEmailAndPassword,
} from 'firebase/auth';

import {
  doc,
  getDoc,
} from 'firebase/firestore';

import { database } from '../firebaseConfig';


export default function Login({ navigation }) {

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const auth = getAuth();


  const mostrarErroAuth = (erro) => {

    const mensagens = {
      'auth/invalid-email':
        'O e-mail informado parece inválido.',

      'auth/user-not-found':
        'Nenhuma conta encontrada com esse e-mail.',

      'auth/wrong-password':
        'Senha incorreta. Verifique e tente novamente.',

      'auth/too-many-requests':
        'Muitas tentativas. Tente novamente em alguns instantes.',

      'auth/network-request-failed':
        'Falha de conexão. Verifique sua internet.',
    };

    Alert.alert(
      'Ops!',
      mensagens[erro?.code] ||
      'Não foi possível entrar agora. Tente novamente.'
    );
  };


  const entrar = async () => {

    if (!email.trim() || !senha.trim()) {

      Alert.alert(
        'Atenção',
        'Preencha e-mail e senha.'
      );

      return;
    }

    try {

      const credenciais =
        await signInWithEmailAndPassword(
          auth,
          email.trim(),
          senha
        );

      const usuario = credenciais.user;

      const snapUsuario = await getDoc(
        doc(database, 'usuarios', usuario.uid)
      );

      const dadosUsuario = snapUsuario.data();

      if (dadosUsuario?.tipo === 'admin') {

        navigation.navigate(
          'InicialAdm',
          {
            adminEmail: usuario.email
          }
        );
      } else if (dadosUsuario?.tipo === 'proprietario') {
        navigation.navigate('ImoveisProprietario');
      } else {

        navigation.navigate('Imoveis');

      }

    } catch (erro) {

      console.log(erro);

      mostrarErroAuth(erro);
    }
  };


  return (

    <ImageBackground
      source={require('../Imagens/fundo-cadastro.png')}
      style={estilos.fundo}
      imageStyle={estilos.imagem}
      resizeMode="cover"
    >

      <View style={estilos.sombra} />

      <View style={estilos.area}>

        {/* LOGO A2 */}

        <Text style={estilos.logo}>
          ⌂
        </Text>

        <Text style={estilos.titulo}>
          A2 <Text style={estilos.tituloClaro}>IMÓVEIS</Text>
        </Text>

        <Text style={estilos.subtitulo}>
          REALIZANDO SONHOS
        </Text>

        <Text style={estilos.entrarTitulo}>
          Acesse sua conta
        </Text>


        {/* FORMULÁRIO */}

        <View style={estilos.caixa}>

          {/* E-MAIL */}

          <Text style={estilos.rotulo}>
            E-MAIL
          </Text>

          <TextInput
            style={estilos.campo}
            placeholder="seu@email.com"
            placeholderTextColor="rgba(255,255,255,0.3)"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />


          {/* SENHA */}

          <Text style={estilos.rotulo}>
            SENHA
          </Text>

          <View style={estilos.linhaSenha}>

            <TextInput
              style={estilos.campoSenha}
              placeholder="••••••••"
              placeholderTextColor="rgba(255,255,255,0.3)"
              value={senha}
              onChangeText={setSenha}
              secureTextEntry={!mostrarSenha}
            />

            <TouchableOpacity
              style={estilos.botaoOlho}
              onPress={() =>
                setMostrarSenha(!mostrarSenha)
              }
            >

              <Text style={estilos.textoOlho}>
                {mostrarSenha ? '🙈' : '👁️'}
              </Text>

            </TouchableOpacity>

          </View>


          {/* BOTÃO ENTRAR */}

          <TouchableOpacity
            style={estilos.botaoEntrar}
            onPress={entrar}
          >

            <Text style={estilos.textoBotao}>
              ENTRAR
            </Text>

          </TouchableOpacity>

        </View>


        {/* CADASTRO */}

        <View style={estilos.rodape}>

          <Text style={estilos.textoRodape}>
            Ainda não tem uma conta?
          </Text>

          <TouchableOpacity
            onPress={() =>
              navigation?.navigate('Cadastro')
            }
          >

            <Text style={estilos.linkRodape}>
              {' '}Criar conta
            </Text>

          </TouchableOpacity>

        </View>


        {/* ACESSO ADMINISTRATIVO */}

        <TouchableOpacity
          style={estilos.linkAdmin}
          onPress={() =>
            navigation?.navigate('AdminLogin')
          }
        >

          <Text style={estilos.linkAdminTexto}>
            Acesso administrativo
          </Text>

        </TouchableOpacity>

      </View>

    </ImageBackground>
  );
}


const estilos = StyleSheet.create({

  fundo: {
    flex: 1,
    width: '100%',
    height: '100%',
  },


  imagem: {
    width: '100%',
    height: '100%',
  },


  sombra: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.72)',
  },


  area: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
  },


  /* LOGO */

  logo: {
    color: '#C9A86A',
    fontSize: 65,
    fontWeight: 'bold',
    marginBottom: 8,
  },


  /* TÍTULO */

  titulo: {
    color: '#C9A86A',
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 6,
    marginBottom: 8,
  },


  tituloClaro: {
    color: '#fff',
  },


  /* SUBTÍTULO */

  subtitulo: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 4,
    marginBottom: 18,
  },


  entrarTitulo: {
    color: '#fff',
    fontSize: 25,
    fontWeight: '500',
    marginBottom: 35,
  },


  /* CAIXA */

  caixa: {
    width: '100%',
    backgroundColor: 'rgba(20,20,20,0.88)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(201,168,106,0.2)',
    padding: 30,
  },


  /* LABELS */

  rotulo: {
    color: 'rgba(201,168,106,0.8)',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 10,
  },


  /* INPUT E-MAIL */

  campo: {
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: 'rgba(201,168,106,0.25)',
    borderRadius: 12,
    color: '#fff',
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 24,
  },


  /* SENHA */

  linhaSenha: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
    position: 'relative',
  },


  campoSenha: {
    flex: 1,
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: 'rgba(201,168,106,0.25)',
    borderRadius: 12,
    color: '#fff',
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingRight: 50,
  },


  /* OLHO */

  botaoOlho: {
    position: 'absolute',
    right: 14,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },


  textoOlho: {
    fontSize: 18,
  },


  /* BOTÃO */

  botaoEntrar: {
    backgroundColor: '#C9A86A',
    paddingVertical: 18,
    borderRadius: 50,
    alignItems: 'center',
    marginTop: 3,
  },


  textoBotao: {
    color: '#111',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 2,
  },


  /* RODAPÉ */

  rodape: {
    flexDirection: 'row',
    marginTop: 32,
  },


  textoRodape: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 14,
  },


  linkRodape: {
    color: '#C9A86A',
    fontSize: 14,
    fontWeight: '700',
  },


  /* ADMIN */

  linkAdmin: {
    marginTop: 20,
  },


  linkAdminTexto: {
    color: '#C9A86A',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
  },

});