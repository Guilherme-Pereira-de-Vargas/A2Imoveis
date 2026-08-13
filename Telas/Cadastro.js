import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  Alert,
  ScrollView,
} from 'react-native';

import {
  getAuth,
  createUserWithEmailAndPassword,
} from 'firebase/auth';

import {
  doc,
  setDoc,
} from 'firebase/firestore';

import { database } from '../firebaseConfig';


export default function Cadastro({ navigation }) {

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  const auth = getAuth();


  const mostrarErroAuth = (erro) => {

    console.log('ERRO COMPLETO:', erro);
    console.log('CÓDIGO DO ERRO:', erro?.code);

    const mensagens = {

      'auth/email-already-in-use':
        'Esse e-mail já está sendo usado por outra conta.',

      'auth/invalid-email':
        'O e-mail informado parece inválido.',

      'auth/weak-password':
        'A senha precisa ter pelo menos 6 caracteres.',

      'auth/network-request-failed':
        'Falha de conexão. Verifique sua internet.',

      'permission-denied':
        'Sua conta foi criada, mas não foi possível salvar seus dados.',

      'firestore/permission-denied':
        'Sua conta foi criada, mas não foi possível salvar seus dados.',
    };


    Alert.alert(
      'Não foi possível concluir',
      mensagens[erro?.code] ||
      'Ocorreu um erro. Tente novamente.'
    );
  };


  const cadastrar = async () => {

    // Verifica campos vazios

    if (
      !nome.trim() ||
      !email.trim() ||
      !telefone.trim() ||
      !senha.trim() ||
      !confirmarSenha.trim()
    ) {

      Alert.alert(
        'Atenção',
        'Preencha todos os campos.'
      );

      return;
    }


    // Verifica tamanho da senha

    if (senha.length < 6) {

      Alert.alert(
        'Atenção',
        'A senha precisa ter pelo menos 6 caracteres.'
      );

      return;
    }


    // Verifica confirmação da senha

    if (senha !== confirmarSenha) {

      Alert.alert(
        'Atenção',
        'As senhas não coincidem.'
      );

      return;
    }


    try {

      // Cria usuário no Firebase Authentication

      const credenciais =
        await createUserWithEmailAndPassword(
          auth,
          email.trim(),
          senha
        );


      const usuario = credenciais.user;


      // Salva os dados no Firestore

      try {

        await setDoc(
          doc(database, 'usuarios', usuario.uid),
          {
            uid: usuario.uid,
            nome: nome.trim(),
            email: usuario.email,
            telefone: telefone.trim(),
            tipo: 'cliente',
          }
        );


        // Tudo deu certo

        Alert.alert(
          'Cadastro realizado!',
          'Sua conta foi criada com sucesso.',
          [
            {
              text: 'Entrar',
              onPress: () => {
                navigation.navigate('Login');
              },
            },
          ]
        );

      } catch (erroFirestore) {

        console.log(
          'ERRO AO SALVAR NO FIRESTORE:',
          erroFirestore
        );

        // O usuário já foi criado no Authentication,
        // mesmo que o Firestore tenha dado erro.

        Alert.alert(
          'Cadastro realizado!',
          'Sua conta foi criada, mas alguns dados não puderam ser salvos.',
          [
            {
              text: 'Entrar',
              onPress: () => {
                navigation.navigate('Login');
              },
            },
          ]
        );
      }

    } catch (erroAuth) {

      console.log(
        'ERRO NO AUTHENTICATION:',
        erroAuth
      );

      mostrarErroAuth(erroAuth);
    }
  };


  return (

    <ImageBackground
      source={require('../Imagens/fundo-cadastro.png')}
      style={estilos.fundo}
      resizeMode="cover"
    >

      <View style={estilos.overlay} />

      <ScrollView
        style={estilos.scroll}
        contentContainerStyle={estilos.container}
        showsVerticalScrollIndicator={false}
      >

        {/* CABEÇALHO */}

        <View style={estilos.cabecalho}>

          <Text style={estilos.icone}>
            ⌂
          </Text>

          <Text style={estilos.titulo}>
            A2 <Text style={estilos.tituloClaro}>IMÓVEIS</Text>
          </Text>

          <Text style={estilos.subtituloMarca}>
            REALIZANDO SONHOS
          </Text>

          <Text style={estilos.crie}>
            Crie sua conta
          </Text>

        </View>


        {/* CARD */}

        <View style={estilos.card}>


          {/* NOME */}

          <View style={estilos.campo}>

            <Text style={estilos.rotulo}>
              NOME COMPLETO
            </Text>

            <TextInput
              style={estilos.input}
              placeholder="Seu nome"
              placeholderTextColor="#888"
              value={nome}
              onChangeText={setNome}
            />

          </View>


          {/* EMAIL */}

          <View style={estilos.campo}>

            <Text style={estilos.rotulo}>
              E-MAIL
            </Text>

            <TextInput
              style={estilos.input}
              placeholder="Seu email"
              placeholderTextColor="#888"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

          </View>


          {/* TELEFONE */}

          <View style={estilos.campo}>

            <Text style={estilos.rotulo}>
              TELEFONE
            </Text>

            <TextInput
              style={estilos.input}
              placeholder="Seu telefone"
              placeholderTextColor="#888"
              value={telefone}
              onChangeText={setTelefone}
              keyboardType="phone-pad"
            />

          </View>


          {/* SENHA */}

          <View style={estilos.campo}>

            <Text style={estilos.rotulo}>
              SENHA
            </Text>

            <TextInput
              style={estilos.input}
              placeholder="Digite sua senha"
              placeholderTextColor="#888"
              value={senha}
              onChangeText={setSenha}
              secureTextEntry
            />

          </View>


          {/* CONFIRMAR SENHA */}

          <View style={estilos.campo}>

            <Text style={estilos.rotulo}>
              CONFIRMAR SENHA
            </Text>

            <TextInput
              style={estilos.input}
              placeholder="Confirme sua senha"
              placeholderTextColor="#888"
              value={confirmarSenha}
              onChangeText={setConfirmarSenha}
              secureTextEntry
            />

          </View>


          {/* BOTÃO */}

          <TouchableOpacity
            style={estilos.botao}
            onPress={cadastrar}
          >

            <Text style={estilos.textoBotao}>
              CRIAR CONTA
            </Text>

          </TouchableOpacity>

        </View>


        {/* RODAPÉ */}

        <View style={estilos.rodape}>

          <Text style={estilos.textoRodape}>
            Já tem uma conta?
          </Text>

          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
          >

            <Text style={estilos.linkRodape}>
              Entrar →
            </Text>

          </TouchableOpacity>

        </View>

      </ScrollView>

    </ImageBackground>
  );
}


const estilos = StyleSheet.create({

  fundo: {
    flex: 1,
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },

  scroll: {
    flex: 1,
  },

  container: {
    flexGrow: 1,
    alignItems: 'center',
    padding: 25,
    paddingTop: 45,
    paddingBottom: 30,
  },


  // CABEÇALHO

  cabecalho: {
    alignItems: 'center',
    marginBottom: 25,
  },

  icone: {
    color: '#C9A86A',
    fontSize: 45,
    marginBottom: 5,
  },

  titulo: {
    color: '#C9A86A',
    fontSize: 30,
    fontWeight: 'bold',
    letterSpacing: 2,
  },

  tituloClaro: {
    color: '#fff',
  },

  subtituloMarca: {
    color: '#C9A86A',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 4,
    marginTop: 5,
  },

  crie: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '500',
    marginTop: 25,
  },


  // CARD

  card: {
    width: '100%',
    backgroundColor: 'rgba(15, 15, 15, 0.93)',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: '#8E713E',
  },


  // CAMPOS

  campo: {
    marginBottom: 16,
  },

  rotulo: {
    color: '#C9A86A',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 7,
    letterSpacing: 1,
  },

  input: {
    height: 50,
    backgroundColor: '#181818',
    color: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#444',
    fontSize: 15,
  },


  // BOTÃO

  botao: {
    backgroundColor: '#C9A86A',
    height: 52,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 5,
  },

  textoBotao: {
    color: '#111',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1,
  },


  // RODAPÉ

  rodape: {
    flexDirection: 'row',
    marginTop: 22,
    marginBottom: 10,
  },

  textoRodape: {
    color: '#ddd',
    marginRight: 6,
    fontSize: 14,
  },

  linkRodape: {
    color: '#C9A86A',
    fontWeight: 'bold',
    fontSize: 14,
  },

});