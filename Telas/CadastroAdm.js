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


export default function CadastroAdm({ navigation }) {

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  const auth = getAuth();


  // =====================================================
  // CADASTRAR PROPRIETÁRIO
  // =====================================================

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

      // =================================================
      // CRIA CONTA NO FIREBASE AUTHENTICATION
      // =================================================

      const credenciais =
        await createUserWithEmailAndPassword(
          auth,
          email.trim(),
          senha
        );


      const usuario = credenciais.user;


      // =================================================
      // SALVA OS DADOS NO FIRESTORE
      // =================================================

      await setDoc(
        doc(database, 'usuarios', usuario.uid),
        {
          uid: usuario.uid,
          nome: nome.trim(),
          email: usuario.email,
          telefone: telefone.trim(),
          tipo: 'proprietario',
        }
      );


      // =================================================
      // LIMPA OS CAMPOS
      // =================================================

      setNome('');
      setEmail('');
      setTelefone('');
      setSenha('');
      setConfirmarSenha('');


      // =================================================
      // CADASTRO REALIZADO
      // =================================================

      Alert.alert(
        'Sucesso',
        'Proprietário cadastrado com sucesso!',
        [
          {
            text: 'OK',
            onPress: () => {

              // VOLTA PARA O MENU
              navigation.navigate('InicialAdm');

            },
          },
        ]
      );


    } catch (erro) {

      // =================================================
      // ERRO SOMENTE NO CONSOLE
      // =================================================

      console.log(
        'ERRO AO CADASTRAR PROPRIETÁRIO:',
        erro
      );


      // =================================================
      // MENSAGEM SIMPLES PARA O USUÁRIO
      // =================================================

      Alert.alert(
        'Erro',
        'Não foi possível cadastrar o proprietário.'
      );

    }

  };


  return (

    <ImageBackground
      source={require('../Imagens/fundo-cadastro.png')}
      style={estilos.fundo}
      resizeMode="cover"
    >

      {/* ESCURECIMENTO */}

      <View style={estilos.overlay} />


      <ScrollView
        style={estilos.scroll}
        contentContainerStyle={estilos.container}
        showsVerticalScrollIndicator={false}
      >


        {/* =================================================
            BOTÃO VOLTAR
        ================================================= */}

        <TouchableOpacity
                    style={estilos.botaoVoltar}
                    onPress={() => navigation.goBack()}
                  >
        
                    <Text style={estilos.iconeVoltar}>
                      ‹
                    </Text>
        
                  </TouchableOpacity>


        {/* =================================================
            CABEÇALHO
        ================================================= */}

        <View style={estilos.cabecalho}>

          <Text style={estilos.icone}>
            ⌂
          </Text>


          <Text style={estilos.titulo}>
            A2{' '}
            <Text style={estilos.tituloClaro}>
              IMÓVEIS
            </Text>
          </Text>


          <Text style={estilos.subtituloMarca}>
            REALIZANDO SONHOS
          </Text>


          <Text style={estilos.crie}>
            Conta do Proprietário
          </Text>

        </View>


        {/* =================================================
            CARD
        ================================================= */}

        <View style={estilos.card}>


          {/* NOME */}

          <View style={estilos.campo}>

            <Text style={estilos.rotulo}>
              NOME COMPLETO
            </Text>


            <TextInput
              style={estilos.input}
              placeholder="Nome do Proprietário"
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
              placeholder="Email do Proprietário"
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
              placeholder="Telefone"
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


          {/* =================================================
              BOTÃO
          ================================================= */}

          <TouchableOpacity
            style={estilos.botao}
            activeOpacity={0.8}
            onPress={cadastrar}
          >

            <Text style={estilos.textoBotao}>
              CRIAR CONTA
            </Text>

          </TouchableOpacity>

        </View>


        {/* =================================================
            RODAPÉ
        ================================================= */}

        <View style={estilos.rodape}>

          <Text style={estilos.textoRodape}>
            Cadastro de proprietário
          </Text>

        </View>


      </ScrollView>

    </ImageBackground>
  );
}


/* =====================================================
   ESTILOS
===================================================== */

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
    paddingTop: 35,
    paddingBottom: 35,
  },


  /* =================================================
     VOLTAR
  ================================================= */

  botaoVoltar: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(10,10,10,0.80)',
    borderWidth: 1,
    borderColor: 'rgba(201,168,106,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  iconeVoltar: {
    color: '#C9A86A',
    fontSize: 38,
    lineHeight: 40,
    marginTop: -5,
  },

  /* =================================================
     CABEÇALHO
  ================================================= */

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


  /* =================================================
     CARD
  ================================================= */

  card: {
    width: '100%',
    backgroundColor: 'rgba(15, 15, 15, 0.93)',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: '#8E713E',
  },


  /* =================================================
     CAMPOS
  ================================================= */

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


  /* =================================================
     BOTÃO
  ================================================= */

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


  /* =================================================
     RODAPÉ
  ================================================= */

  rodape: {
    marginTop: 22,
    marginBottom: 10,
    alignItems: 'center',
  },


  textoRodape: {
    color: '#777',
    fontSize: 12,
  },

});