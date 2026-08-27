import { useEffect, useState } from 'react';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';

import {
  doc,
  getDoc,
  updateDoc,
} from 'firebase/firestore';

import {
  onAuthStateChanged,
  signOut,
} from 'firebase/auth';

import {
  database,
  auth,
} from '../firebaseConfig';


export default function Perfil({ navigation }) {

  // =====================================================
  // ESTADOS
  // =====================================================

  const [usuario, setUsuario] = useState(null);

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [saindo, setSaindo] = useState(false);


  // =====================================================
  // VERIFICAR USUÁRIO E BUSCAR PERFIL
  // =====================================================

  useEffect(() => {

    const unsubscribe = onAuthStateChanged(
      auth,
      async (usuarioLogado) => {

        try {

          // =================================================
          // NENHUM USUÁRIO LOGADO
          // =================================================

          if (!usuarioLogado) {

            console.log(
              'NENHUM USUÁRIO LOGADO'
            );

            setUsuario(null);
            setCarregando(false);

            /*
             * IMPORTANTE:
             *
             * Não mostramos Alert aqui.
             *
             * Quando fazemos signOut(), o Firebase dispara
             * automaticamente o onAuthStateChanged com null.
             *
             * Então simplesmente mandamos o usuário para Login.
             */

            navigation.reset({
              index: 0,
              routes: [
                {
                  name: 'Login',
                },
              ],
            });

            return;
          }


          // =================================================
          // PEGAR UID
          // =================================================

          const uid = usuarioLogado.uid;


          console.log(
            '===================================='
          );

          console.log(
            'USUÁRIO LOGADO'
          );

          console.log(
            'UID:',
            uid
          );

          console.log(
            'EMAIL:',
            usuarioLogado.email
          );

          console.log(
            '===================================='
          );


          // =================================================
          // REFERÊNCIA DO DOCUMENTO
          // =================================================

          /*
           * Sua estrutura do Firestore é:
           *
           * usuarios
           *   └── UID
           *
           * Exemplo:
           *
           * usuarios/
           * GMFPCXOr4EQ50hkuU3ayqSQMXG43
           *
           */

          const referencia = doc(
            database,
            'usuarios',
            uid
          );


          // =================================================
          // BUSCAR DOCUMENTO
          // =================================================

          const resultado = await getDoc(
            referencia
          );


          console.log(
            'DOCUMENTO EXISTE:',
            resultado.exists()
          );


          // =================================================
          // DOCUMENTO NÃO EXISTE
          // =================================================

          if (!resultado.exists()) {

            console.log(
              'PERFIL NÃO ENCONTRADO'
            );

            console.log(
              'UID PROCURADO:',
              uid
            );

            setUsuario(null);
            setCarregando(false);

            Alert.alert(
              'Perfil não encontrado',
              'Seu usuário está autenticado, mas não encontramos seu cadastro na coleção usuarios.'
            );

            return;
          }


          // =================================================
          // PEGAR DADOS
          // =================================================

          const dadosFirestore =
            resultado.data();


          const dados = {

            id: resultado.id,

            ...dadosFirestore,

            uid: uid,

          };


          console.log(
            '===================================='
          );

          console.log(
            'DADOS DO USUÁRIO'
          );

          console.log(
            dados
          );

          console.log(
            '===================================='
          );


          // =================================================
          // PREENCHER ESTADOS
          // =================================================

          setUsuario(dados);


          setNome(
            dados.nome || ''
          );


          setEmail(
            dados.email ||
            usuarioLogado.email ||
            ''
          );


          setTelefone(
            dados.telefone || ''
          );


        } catch (erro) {

          console.log(
            '===================================='
          );

          console.log(
            'ERRO AO BUSCAR PERFIL'
          );

          console.log(
            erro
          );

          console.log(
            '===================================='
          );


          /*
           * Se o usuário saiu durante uma operação,
           * não precisamos mostrar erro.
           */

          if (auth.currentUser) {

            Alert.alert(
              'Erro',
              'Não foi possível carregar seu perfil.'
            );

          }

        } finally {

          setCarregando(false);

        }

      }
    );


    // =================================================
    // LIMPAR LISTENER
    // =================================================

    return () => {

      unsubscribe();

    };

  }, []);


  // =====================================================
  // SALVAR PERFIL
  // =====================================================

  const salvarPerfil = async () => {

    // =================================================
    // USUÁRIO ATUAL
    // =================================================

    const usuarioAtual = auth.currentUser;


    if (!usuarioAtual) {

      Alert.alert(
        'Sessão expirada',
        'Faça login novamente.'
      );

      return;
    }


    // =================================================
    // UID
    // =================================================

    const uid = usuarioAtual.uid;


    if (!uid) {

      Alert.alert(
        'Erro',
        'UID do usuário não encontrado.'
      );

      return;
    }


    // =================================================
    // VALIDAR NOME
    // =================================================

    if (!nome.trim()) {

      Alert.alert(
        'Atenção',
        'Digite seu nome.'
      );

      return;
    }


    // =================================================
    // VALIDAR EMAIL
    // =================================================

    if (!email.trim()) {

      Alert.alert(
        'Atenção',
        'Digite seu e-mail.'
      );

      return;
    }


    try {

      setSalvando(true);


      // =================================================
      // REFERÊNCIA
      // =================================================

      const referencia = doc(
        database,
        'usuarios',
        uid
      );


      // =================================================
      // ATUALIZAR FIRESTORE
      // =================================================

      await updateDoc(
        referencia,
        {

          nome: nome.trim(),

          email: email.trim(),

          telefone: telefone.trim(),

        }
      );


      // =================================================
      // ATUALIZAR ESTADO
      // =================================================

      setUsuario({

        ...usuario,

        uid: uid,

        nome: nome.trim(),

        email: email.trim(),

        telefone: telefone.trim(),

      });


      // =================================================
      // SUCESSO
      // =================================================

      Alert.alert(
        'Sucesso',
        'Seus dados foram atualizados.'
      );


    } catch (erro) {

      console.log(
        'ERRO AO SALVAR:',
        erro
      );


      Alert.alert(
        'Erro',
        'Não foi possível salvar seus dados.'
      );


    } finally {

      setSalvando(false);

    }

  };


  // =====================================================
  // SAIR DA CONTA
  // =====================================================

  const sairDaConta = () => {

    Alert.alert(

      'Sair da conta',

      'Tem certeza que deseja sair da sua conta?',

      [

        // =================================================
        // CANCELAR
        // =================================================

        {
          text: 'Cancelar',
          style: 'cancel',
        },


        // =================================================
        // CONFIRMAR SAÍDA
        // =================================================

        {
          text: 'Sair',
          style: 'destructive',

          onPress: async () => {

            try {

              setSaindo(true);


              console.log(
                '===================================='
              );

              console.log(
                'SAINDO DA CONTA...'
              );

              console.log(
                '===================================='
              );


              // ==========================================
              // FAZER LOGOUT
              // ==========================================

              await signOut(auth);


              console.log(
                'LOGOUT REALIZADO COM SUCESSO'
              );


              /*
               * O onAuthStateChanged também será chamado
               * automaticamente.
               *
               * Porém fazemos o reset aqui para garantir
               * que o usuário seja enviado para Login.
               */


              navigation.reset({

                index: 0,

                routes: [
                  {
                    name: 'Inicial',
                  },
                ],

              });


            } catch (erro) {

              console.log(
                'ERRO AO SAIR:',
                erro
              );


              setSaindo(false);


              Alert.alert(
                'Erro',
                'Não foi possível sair da conta. Tente novamente.'
              );

            }

          },

        },

      ]

    );

  };


  // =====================================================
  // CARREGANDO
  // =====================================================

  if (carregando) {

    return (

      <ImageBackground
        source={require('../Imagens/fundo-imoveis.png')}
        style={estilos.fundo}
        imageStyle={estilos.imagemFundo}
        resizeMode="cover"
      >

        <View style={estilos.sombra} />


        <View style={estilos.carregando}>

          <ActivityIndicator
            size="large"
            color="#C9A86A"
          />


          <Text style={estilos.textoCarregando}>
            Carregando seu perfil...
          </Text>

        </View>

      </ImageBackground>

    );

  }


  // =====================================================
  // USUÁRIO NÃO ENCONTRADO
  // =====================================================

  if (!usuario) {

    return (

      <ImageBackground
        source={require('../Imagens/fundo-imoveis.png')}
        style={estilos.fundo}
        imageStyle={estilos.imagemFundo}
        resizeMode="cover"
      >

        <View style={estilos.sombra} />


        <View style={estilos.semUsuario}>

          <View style={estilos.avatarErro}>

            <Text style={estilos.iconePerfilErro}>
              👤
            </Text>

          </View>


          <Text style={estilos.tituloErro}>
            Perfil não encontrado
          </Text>


          <Text style={estilos.textoErro}>
            Não encontramos seus dados de usuário.
          </Text>


          <TouchableOpacity
            style={estilos.botaoVoltarErro}
            onPress={() =>
              navigation?.goBack()
            }
          >

            <Text style={estilos.textoVoltarErro}>
              VOLTAR
            </Text>

          </TouchableOpacity>

        </View>

      </ImageBackground>

    );

  }


  // =====================================================
  // TELA PRINCIPAL
  // =====================================================

  return (

    <ImageBackground
      source={require('../Imagens/fundo-imoveis.png')}
      style={estilos.fundo}
      imageStyle={estilos.imagemFundo}
      resizeMode="cover"
    >

      <View style={estilos.sombra} />


      <ScrollView
        style={estilos.scroll}
        contentContainerStyle={estilos.conteudo}
        showsVerticalScrollIndicator={false}
      >


        {/* =================================================
            TOPO
        ================================================= */}

        <View style={estilos.topo}>

          <TouchableOpacity
            style={estilos.botaoVoltar}
            onPress={() =>
              navigation?.goBack()
            }
          >

            <Text style={estilos.setaVoltar}>
              ‹
            </Text>

          </TouchableOpacity>


          <View style={estilos.logoContainer}>

            <Text style={estilos.logo}>

              A2{' '}

              <Text style={estilos.logoBranco}>
                IMÓVEIS
              </Text>

            </Text>


            <Text style={estilos.slogan}>
              REALIZANDO SONHOS
            </Text>

          </View>


          <View style={estilos.espacoTopo} />

        </View>


        {/* =================================================
            TÍTULO
        ================================================= */}

        <View style={estilos.tituloContainer}>

          <Text style={estilos.titulo}>
            Meu Perfil
          </Text>


          <Text style={estilos.subtitulo}>
            Gerencie suas informações pessoais.
          </Text>

        </View>


        {/* =================================================
            AVATAR
        ================================================= */}

        <View style={estilos.perfil}>

          <View style={estilos.avatar}>

            <Text style={estilos.iconePerfil}>
              👤
            </Text>

          </View>


          <Text style={estilos.nomePerfil}>
            {nome || 'Usuário'}
          </Text>


          <Text style={estilos.emailPerfil}>
            {email}
          </Text>


          <View style={estilos.tipoContainer}>

            <Text style={estilos.tipo}>
              {usuario.tipo || 'cliente'}
            </Text>

          </View>

        </View>


        {/* =================================================
            DADOS PESSOAIS
        ================================================= */}

        <View style={estilos.card}>

          <Text style={estilos.tituloCard}>
            Dados pessoais
          </Text>


          <Text style={estilos.subtituloCard}>
            Mantenha suas informações atualizadas.
          </Text>


          {/* =================================================
              NOME
          ================================================= */}

          <View style={estilos.campo}>

            <Text style={estilos.label}>
              NOME
            </Text>


            <View style={estilos.inputContainer}>

              <Text style={estilos.iconeCampo}>
                👤
              </Text>


              <TextInput
                style={estilos.input}
                value={nome}
                onChangeText={setNome}
                placeholder="Digite seu nome"
                placeholderTextColor="#666"
              />

            </View>

          </View>


          {/* =================================================
              EMAIL
          ================================================= */}

          <View style={estilos.campo}>

            <Text style={estilos.label}>
              E-MAIL
            </Text>


            <View style={estilos.inputContainer}>

              <Text style={estilos.iconeCampo}>
                ✉️
              </Text>


              <TextInput
                style={estilos.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Digite seu e-mail"
                placeholderTextColor="#666"
                keyboardType="email-address"
                autoCapitalize="none"
              />

            </View>

          </View>


          {/* =================================================
              TELEFONE
          ================================================= */}

          <View style={estilos.campo}>

            <Text style={estilos.label}>
              TELEFONE
            </Text>


            <View style={estilos.inputContainer}>

              <Text style={estilos.iconeCampo}>
                📱
              </Text>


              <TextInput
                style={estilos.input}
                value={telefone}
                onChangeText={setTelefone}
                placeholder="Digite seu telefone"
                placeholderTextColor="#666"
                keyboardType="phone-pad"
              />

            </View>

          </View>


          {/* =================================================
              TIPO
          ================================================= */}

          <View style={estilos.campo}>

            <Text style={estilos.label}>
              TIPO DE USUÁRIO
            </Text>


            <View style={estilos.inputContainer}>

              <Text style={estilos.iconeCampo}>
                🏷️
              </Text>


              <Text style={estilos.valorSomenteLeitura}>
                {usuario.tipo || 'cliente'}
              </Text>

            </View>

          </View>


          {/* =================================================
              UID
          ================================================= */}

          <View style={estilos.uidContainer}>

            <Text style={estilos.uidLabel}>
              ID DA CONTA
            </Text>


            <Text
              style={estilos.uid}
              numberOfLines={1}
            >
              {usuario.uid}
            </Text>

          </View>


          {/* =================================================
              SALVAR
          ================================================= */}

          <TouchableOpacity
            style={[
              estilos.botaoSalvar,
              salvando &&
              estilos.botaoDesabilitado,
            ]}
            onPress={salvarPerfil}
            disabled={salvando || saindo}
            activeOpacity={0.8}
          >

            {salvando ? (

              <ActivityIndicator
                size="small"
                color="#111"
              />

            ) : (

              <Text style={estilos.textoSalvar}>
                SALVAR ALTERAÇÕES
              </Text>

            )}

          </TouchableOpacity>

        </View>


        {/* =================================================
            BOTÃO SAIR
        ================================================= */}

        <TouchableOpacity
          style={[
            estilos.botaoSair,
            saindo &&
            estilos.botaoSairDesabilitado,
          ]}
          onPress={sairDaConta}
          disabled={saindo}
          activeOpacity={0.8}
        >

          {saindo ? (

            <ActivityIndicator
              size="small"
              color="#E57373"
            />

          ) : (

            <>
              <Text style={estilos.iconeSair}>
                🚪
              </Text>


              <Text style={estilos.textoSair}>
                SAIR DA CONTA
              </Text>
            </>

          )}

        </TouchableOpacity>


        {/* =================================================
            SEGURANÇA
        ================================================= */}

        <View style={estilos.info}>

          <View style={estilos.iconeInfoContainer}>

            <Text style={estilos.iconeInfo}>
              🔒
            </Text>

          </View>


          <View style={estilos.textoInfo}>

            <Text style={estilos.tituloInfo}>
              Seus dados estão protegidos
            </Text>


            <Text style={estilos.descricaoInfo}>
              Suas informações pessoais são armazenadas
              com segurança.
            </Text>

          </View>

        </View>


        {/* =================================================
            RODAPÉ
        ================================================= */}

        <View style={estilos.rodape}>

          <Text style={estilos.logoRodape}>
            A2 IMÓVEIS
          </Text>


          <Text style={estilos.textoRodape}>
            Compra • Venda • Locação • Construção
          </Text>


          <Text style={estilos.textoRodape}>
            Realizando sonhos, construindo futuros.
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
    backgroundColor: '#111',
  },


  imagemFundo: {
    width: '100%',
    height: '100%',
  },


  sombra: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.58)',
  },


  scroll: {
    flex: 1,
  },


  conteudo: {
    padding: 22,
    paddingTop: 50,
    paddingBottom: 60,
  },


  /* ===================================================
     TOPO
  =================================================== */

  topo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 30,
  },


  botaoVoltar: {
    width: 44,
    height: 44,
    borderRadius: 23,
    backgroundColor: 'rgba(20,20,20,0.9)',
    borderWidth: 1,
    borderColor: 'rgba(201,168,106,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },


  setaVoltar: {
    color: '#C9A86A',
    fontSize: 32,
    lineHeight: 34,
    marginTop: -3,
  },


  logoContainer: {
    alignItems: 'center',
  },


  logo: {
    color: '#C9A86A',
    fontSize: 21,
    fontWeight: '900',
    letterSpacing: 3,
  },


  logoBranco: {
    color: '#fff',
  },


  slogan: {
    color: '#C9A86A',
    fontSize: 7,
    fontWeight: 'bold',
    letterSpacing: 2.5,
    marginTop: 3,
  },


  espacoTopo: {
    width: 44,
  },


  /* ===================================================
     TÍTULO
  =================================================== */

  tituloContainer: {
    marginBottom: 25,
  },


  titulo: {
    color: '#fff',
    fontSize: 29,
    fontWeight: '700',
  },


  subtitulo: {
    color: '#888',
    fontSize: 13,
    marginTop: 7,
  },


  /* ===================================================
     PERFIL
  =================================================== */

  perfil: {
    alignItems: 'center',
    marginBottom: 28,
  },


  avatar: {
    width: 105,
    height: 105,
    borderRadius: 55,
    backgroundColor: 'rgba(20,20,20,0.95)',
    borderWidth: 2,
    borderColor: '#C9A86A',
    alignItems: 'center',
    justifyContent: 'center',

    shadowColor: '#C9A86A',
    shadowOpacity: 0.2,
    shadowRadius: 10,

    elevation: 5,
  },


  iconePerfil: {
    fontSize: 43,
  },


  nomePerfil: {
    color: '#fff',
    fontSize: 21,
    fontWeight: '700',
    marginTop: 12,
  },


  emailPerfil: {
    color: '#888',
    fontSize: 12,
    marginTop: 5,
  },


  tipoContainer: {
    marginTop: 8,
    paddingHorizontal: 13,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: 'rgba(201,168,106,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(201,168,106,0.25)',
  },


  tipo: {
    color: '#C9A86A',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },


  /* ===================================================
     CARD
  =================================================== */

  card: {
    backgroundColor: 'rgba(18,18,18,0.96)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(201,168,106,0.18)',
    padding: 18,
    marginBottom: 18,
  },


  tituloCard: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },


  subtituloCard: {
    color: '#777',
    fontSize: 11,
    marginTop: 4,
    marginBottom: 21,
  },


  /* ===================================================
     CAMPOS
  =================================================== */

  campo: {
    marginBottom: 16,
  },


  label: {
    color: '#C9A86A',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 7,
  },


  inputContainer: {
    height: 52,
    backgroundColor: '#161616',
    borderRadius: 13,
    borderWidth: 1,
    borderColor: 'rgba(201,168,106,0.18)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
  },


  iconeCampo: {
    fontSize: 16,
    width: 30,
  },


  input: {
    flex: 1,
    height: '100%',
    color: '#fff',
    fontSize: 14,
  },


  valorSomenteLeitura: {
    color: '#aaa',
    fontSize: 14,
    textTransform: 'capitalize',
  },


  /* ===================================================
     UID
  =================================================== */

  uidContainer: {
    backgroundColor: 'rgba(201,168,106,0.05)',
    borderRadius: 11,
    padding: 12,
    marginTop: 1,
    marginBottom: 18,
  },


  uidLabel: {
    color: '#666',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 5,
  },


  uid: {
    color: '#777',
    fontSize: 9,
  },


  /* ===================================================
     BOTÃO SALVAR
  =================================================== */

  botaoSalvar: {
    height: 53,
    backgroundColor: '#C9A86A',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },


  botaoDesabilitado: {
    opacity: 0.7,
  },


  textoSalvar: {
    color: '#111',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },


  /* ===================================================
     BOTÃO SAIR
  =================================================== */

  botaoSair: {
    height: 53,
    borderRadius: 14,
    backgroundColor: 'rgba(180,50,50,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(220,80,80,0.35)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },


  botaoSairDesabilitado: {
    opacity: 0.6,
  },


  iconeSair: {
    fontSize: 17,
    marginRight: 9,
  },


  textoSair: {
    color: '#E57373',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },


  /* ===================================================
     INFORMAÇÃO
  =================================================== */

  info: {
    backgroundColor: 'rgba(20,20,20,0.90)',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(201,168,106,0.12)',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },


  iconeInfoContainer: {
    width: 43,
    height: 43,
    borderRadius: 22,
    backgroundColor: 'rgba(201,168,106,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },


  iconeInfo: {
    fontSize: 19,
  },


  textoInfo: {
    flex: 1,
    marginLeft: 12,
  },


  tituloInfo: {
    color: '#C9A86A',
    fontSize: 12,
    fontWeight: '700',
  },


  descricaoInfo: {
    color: '#777',
    fontSize: 10,
    lineHeight: 16,
    marginTop: 3,
  },


  /* ===================================================
     CARREGANDO
  =================================================== */

  carregando: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },


  textoCarregando: {
    color: '#999',
    fontSize: 13,
    marginTop: 12,
  },


  /* ===================================================
     ERRO
  =================================================== */

  semUsuario: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },


  avatarErro: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(20,20,20,0.95)',
    borderWidth: 1,
    borderColor: 'rgba(201,168,106,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },


  iconePerfilErro: {
    fontSize: 38,
  },


  tituloErro: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },


  textoErro: {
    color: '#777',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 8,
  },


  botaoVoltarErro: {
    backgroundColor: '#C9A86A',
    borderRadius: 13,
    paddingHorizontal: 30,
    paddingVertical: 13,
    marginTop: 22,
  },


  textoVoltarErro: {
    color: '#111',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },


  /* ===================================================
     RODAPÉ
  =================================================== */

  rodape: {
    alignItems: 'center',
    paddingTop: 25,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },


  logoRodape: {
    color: '#C9A86A',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 3,
  },


  textoRodape: {
    color: '#666',
    fontSize: 10,
    marginTop: 7,
    textAlign: 'center',
  },

});
