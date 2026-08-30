import { useState } from 'react';

import { View, Text, StyleSheet, TextInput, TouchableOpacity, ImageBackground, Alert } from 'react-native';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { database } from '../firebaseConfig';

export default function CadastroAdm({ navigation }) {
  const [email, setEmail] = useState('');
  const [buscando, setBuscando] = useState(false);

  const buscarUsuario = async () => {
    if (!email.trim()) {
      Alert.alert('Atenção', 'Digite o e-mail do usuário.');
      return;
    }

    try {
      setBuscando(true);
      const usuariosRef = collection(database, 'usuarios');
      const q = query(usuariosRef, where('email', '==', email.trim()));
      const snap = await getDocs(q);

      if (snap.empty) {
        Alert.alert('Não encontrado', 'Nenhum usuário foi encontrado com este e-mail.');
        return;
      }

      const docu = snap.docs[0];
      const data = docu.data();
      navigation.navigate('DetalhesUsuario', { usuarioId: docu.id, dados: data });

    } catch (erro) {
      console.log('ERRO AO BUSCAR USUÁRIO:', erro);
      Alert.alert('Erro', 'Não foi possível buscar o usuário.');
    } finally {
      setBuscando(false);
    }
  };

  return (
    <ImageBackground source={require('../Imagens/fundo-cadastro.png')} style={estilos.fundo} resizeMode="cover">
      <View style={estilos.overlay} />
      <View style={estilos.container}>
        <TouchableOpacity style={estilos.botaoVoltar} onPress={() => navigation.goBack()}>
          <Text style={estilos.iconeVoltar}>‹</Text>
        </TouchableOpacity>

        <View style={estilos.card}>
          <Text style={estilos.rotulo}>E-MAIL DO USUÁRIO</Text>
          <TextInput
            style={estilos.input}
            placeholder="Email do usuário"
            placeholderTextColor="#888"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TouchableOpacity
            style={[estilos.botao, estilos.botaoEntrar, { marginTop: 14, alignSelf: 'center' }]}
            onPress={buscarUsuario}
            accessibilityLabel={buscando ? 'Buscando' : 'Buscar'}
          >
            <Text style={estilos.textoBotaoEntrar}>{buscando ? 'Buscando...' : 'Buscar'}</Text>
          </TouchableOpacity>
        </View>
      </View>
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
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
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
    width: '92%',
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
    width: '60%',
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },

  botaoEntrar: {
    backgroundColor: '#C9A86A',
  },

  textoBotaoEntrar: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },

  botaoDesabilitado: {
    opacity: 0.7,
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