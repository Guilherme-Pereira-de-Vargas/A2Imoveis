import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ImageBackground, Alert, ScrollView } from 'react-native';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { database } from '../firebaseConfig';

export default function Cadastro({ navigation }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  const auth = getAuth();

  const mostrarErroAuth = (erro) => {
    const mensagens = {
      'auth/email-already-in-use': 'Esse e-mail já está sendo usado por outra conta.',
      'auth/invalid-email': 'O e-mail informado parece inválido.',
      'auth/weak-password': 'A senha precisa ser mais forte.',
      'auth/network-request-failed': 'Falha de conexão. Verifique sua internet.',
    };

    Alert.alert(
      'Não foi possível concluir',
      mensagens[erro?.code] || 'Algo deu errado. Tente novamente.'
    );
  };

  const cadastrar = async () => {
    if (!nome.trim() || !email.trim() || !telefone.trim() || !senha.trim() || !confirmarSenha.trim()) {
      Alert.alert('Atenção', 'Preencha todos os campos.');
      return;
    }
    if (senha.length < 6) {
      Alert.alert('Atenção', 'A senha precisa ter pelo menos 6 caracteres.');
      return;
    }
    if (senha !== confirmarSenha) {
      Alert.alert('Atenção', 'As senhas não coincidem.');
      return;
    }

    try {
      const credenciais = await createUserWithEmailAndPassword(auth, email, senha);
      const usuario = credenciais.user;

      await setDoc(doc(database, 'usuarios', usuario.uid), {
        uid: usuario.uid,
        nome: nome.trim(),
        email: usuario.email,
        telefone: telefone.trim(),
        tipo: 'cliente',
      });

      Alert.alert(
        'Cadastro realizado!',
        '',
        [
          {
            text: 'Entrar',
            onPress: () => navigation.navigate('Login'),
          },
        ]
      );
    } catch (erro) {
      console.log(erro);
      mostrarErroAuth(erro);
    }
  };

  return (
    <ImageBackground
      source={require('../Imagens/hm1.jpg')}
      style={estilos.fundo}
      imageStyle={estilos.imagem}
      resizeMode="cover"
    >
      <View style={estilos.overlay} />
      <ScrollView
        style={estilos.scroll}
        contentContainerStyle={estilos.container}
      >
        <Text style={estilos.marca}>✂️</Text>
        <Text style={estilos.titulo}>KINGS BARBER</Text>
        <Text style={estilos.subtitulo}>Crie sua conta</Text>

        <View style={estilos.card}>
          <View style={estilos.campo}>
            <Text style={estilos.rotulo}>NOME COMPLETO</Text>
            <TextInput
              style={estilos.input}
              placeholder="Seu nome"
              placeholderTextColor="#777"
              value={nome}
              onChangeText={setNome}
            />
          </View>

          <View style={estilos.campo}>
            <Text style={estilos.rotulo}>E-MAIL</Text>
            <TextInput
              style={estilos.input}
              placeholder="Seu email"
              placeholderTextColor="#777"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={estilos.campo}>
            <Text style={estilos.rotulo}>TELEFONE</Text>
            <TextInput
              style={estilos.input}
              placeholder="Seu telefone"
              placeholderTextColor="#777"
              value={telefone}
              onChangeText={setTelefone}
            />
          </View>

          <View style={estilos.campo}>
            <Text style={estilos.rotulo}>SENHA</Text>
            <TextInput
              style={estilos.input}
              placeholder="Digite sua senha"
              placeholderTextColor="#777"
              value={senha}
              onChangeText={setSenha}
            />
          </View>

          <View style={estilos.campo}>
            <Text style={estilos.rotulo}>CONFIRMAR SENHA</Text>
            <TextInput
              style={estilos.input}
              placeholder="Confirme sua senha"
              placeholderTextColor="#777"
              value={confirmarSenha}
              onChangeText={setConfirmarSenha}
            />
          </View>

          <TouchableOpacity style={estilos.botao} onPress={cadastrar}>
            <Text style={estilos.textoBotao}>CRIAR CONTA</Text>
          </TouchableOpacity>
        </View>

        <View style={estilos.rodape}>
          <Text style={estilos.textoRodape}>Já tem conta?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={estilos.linkRodape}>Entrar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  scroll: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 25,
    minHeight: '100%',
  },
  marca: {
    fontSize: 40,
    marginBottom: 10,
  },
  titulo: {
    color: '#C9A86A',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitulo: {
    color: '#ccc',
    marginBottom: 30,
  },
  card: {
    width: '100%',
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 15,
  },
  campo: {
    marginBottom: 15,
  },
  rotulo: {
    color: '#C9A86A',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#111',
    color: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  botao: {
    backgroundColor: '#C9A86A',
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 10,
  },
  textoBotao: {
    color: '#111',
    fontWeight: 'bold',
    fontSize: 14,
  },
  rodape: {
    flexDirection: 'row',
    marginTop: 25,
  },
  textoRodape: {
    color: '#ccc',
    marginRight: 5,
  },
  linkRodape: {
    color: '#C9A86A',
    fontWeight: 'bold',
  },
});