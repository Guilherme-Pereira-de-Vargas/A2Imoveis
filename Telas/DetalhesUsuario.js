import React, { useState, useEffect } from 'react';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ImageBackground,
  TextInput,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';

import {
  getAuth,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from 'firebase/auth';

import {
  doc,
  updateDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';

import { database } from '../firebaseConfig';


export default function DetalhesUsuario({ route, navigation }) {

  const { usuarioId, dados } = route.params || {};


  // =====================================================
  // DADOS DO USUÁRIO
  // =====================================================

  const [nome, setNome] =
    useState(dados?.nome || '');

  const [email] =
    useState(dados?.email || '');

  const [telefone, setTelefone] =
    useState(dados?.telefone || '');

  const [tipo, setTipo] =
    useState(dados?.tipo || 'cliente');


  // =====================================================
  // CONTROLE
  // =====================================================

  const [salvando, setSalvando] =
    useState(false);

  const [currentUserTipo, setCurrentUserTipo] =
    useState(null);


  // =====================================================
  // ADMIN
  // =====================================================

  const [showReauthModal, setShowReauthModal] =
    useState(false);

  const [reauthPassword, setReauthPassword] =
    useState('');

  const [reauthEmail, setReauthEmail] =
    useState('');

  const [reauthLoading, setReauthLoading] =
    useState(false);

  const [reauthSucceeded, setReauthSucceeded] =
    useState(false);


  // =====================================================
  // IMÓVEIS
  // =====================================================

  const [imoveis, setImoveis] =
    useState([]);

  const [carregandoImoveis, setCarregandoImoveis] =
    useState(false);

  const [mostrarImoveis, setMostrarImoveis] =
    useState(false);

  const [buscaImovel, setBuscaImovel] =
    useState('');


  // =====================================================
  // CARREGAR TIPO DO USUÁRIO LOGADO
  // =====================================================

  useEffect(() => {

    const loadCurrentTipo =
      async () => {

        try {

          const auth =
            getAuth();

          const cu =
            auth.currentUser;


          if (!cu) {
            return;
          }


          const snap =
            await getDoc(
              doc(
                database,
                'usuarios',
                cu.uid
              )
            );


          if (snap.exists()) {

            setCurrentUserTipo(
              snap.data()?.tipo || null
            );

          }

        } catch (err) {

          console.log(
            'ERRO AO CARREGAR TIPO DO USUÁRIO ATUAL:',
            err
          );

        }

      };


    loadCurrentTipo();

  }, []);


  // =====================================================
  // VERIFICAR PERMISSÃO DO USUÁRIO LOGADO
  // =====================================================

  const verificarPermissaoEdicao =
    async () => {

      try {

        const auth =
          getAuth();

        const currentUser =
          auth.currentUser;


        if (!currentUser) {

          Alert.alert(
            'Acesso negado',
            'Nenhum usuário autenticado.'
          );

          return false;
        }


        const meuDocumento =
          await getDoc(
            doc(
              database,
              'usuarios',
              currentUser.uid
            )
          );


        if (!meuDocumento.exists()) {

          Alert.alert(
            'Acesso negado',
            'Não foi possível verificar sua conta.'
          );

          return false;
        }


        const meuTipo =
          meuDocumento.data()?.tipo;


        // ---------------------------------------------
        // DONO
        // ---------------------------------------------

        if (meuTipo === 'dono') {

          return true;

        }


        // ---------------------------------------------
        // ADMIN
        // ---------------------------------------------

        if (meuTipo === 'admin') {

          if (!usuarioId) {

            Alert.alert(
              'Erro',
              'Usuário selecionado não encontrado.'
            );

            return false;
          }


          const usuarioAlvo =
            await getDoc(
              doc(
                database,
                'usuarios',
                usuarioId
              )
            );


          if (!usuarioAlvo.exists()) {

            Alert.alert(
              'Erro',
              'Não foi possível encontrar o usuário selecionado.'
            );

            return false;
          }


          const tipoAlvo =
            usuarioAlvo.data()?.tipo;


          // ADMIN NÃO PODE MEXER EM ADMIN
          if (tipoAlvo === 'admin') {

            Alert.alert(
              'Acesso negado',
              'Administradores não podem alterar outros administradores.'
            );

            return false;
          }


          // ADMIN NÃO PODE MEXER NO DONO
          if (tipoAlvo === 'dono') {

            Alert.alert(
              'Acesso negado',
              'Administradores não podem alterar a conta do dono.'
            );

            return false;
          }


          // ADMIN NÃO PODE PROMOVER NINGUÉM PARA ADMIN
          if (tipo === 'admin') {

            Alert.alert(
              'Acesso negado',
              'Apenas o dono pode promover uma conta para administrador.'
            );

            return false;
          }


          return true;

        }


        // ---------------------------------------------
        // OUTROS TIPOS
        // ---------------------------------------------

        Alert.alert(
          'Acesso negado',
          'Você não possui permissão para editar usuários.'
        );

        return false;


      } catch (err) {

        console.log(
          'ERRO AO VERIFICAR PERMISSÃO:',
          err
        );


        Alert.alert(
          'Erro',
          'Não foi possível verificar suas permissões.'
        );

        return false;

      }

    };


  // =====================================================
  // SALVAR USUÁRIO
  // =====================================================

  const salvar = async () => {

    if (!usuarioId) {

      Alert.alert(
        'Erro',
        'Usuário não encontrado.'
      );

      return;
    }


    // =================================================
    // VERIFICA NOVAMENTE A PERMISSÃO
    // =================================================

    const permitido =
      await verificarPermissaoEdicao();


    if (!permitido) {
      return;
    }


    const performSave =
      async () => {

        try {

          setSalvando(true);


          const referencia =
            doc(
              database,
              'usuarios',
              usuarioId
            );


          // -------------------------------------------
          // VERIFICA O USUÁRIO ALVO NOVAMENTE
          // -------------------------------------------

          const usuarioAtual =
            await getDoc(referencia);


          if (!usuarioAtual.exists()) {

            Alert.alert(
              'Erro',
              'Este usuário não existe mais.'
            );

            return;
          }


          const tipoAtualAlvo =
            usuarioAtual.data()?.tipo;


          // -------------------------------------------
          // SEGURANÇA EXTRA
          // -------------------------------------------

          if (
            currentUserTipo === 'admin' &&
            (
              tipoAtualAlvo === 'admin' ||
              tipoAtualAlvo === 'dono'
            )
          ) {

            Alert.alert(
              'Acesso negado',
              'Administradores não podem alterar administradores ou o dono.'
            );

            return;
          }


          if (
            currentUserTipo === 'admin' &&
            tipo === 'admin'
          ) {

            Alert.alert(
              'Acesso negado',
              'Apenas o dono pode promover uma conta para administrador.'
            );

            return;
          }


          const referenciaUsuario =
            doc(
              database,
              'usuarios',
              usuarioId
            );


          await updateDoc(
            referenciaUsuario,
            {
              nome: nome.trim(),
              telefone: telefone.trim(),
              tipo: tipo,
            }
          );


          Alert.alert(
            'Sucesso',
            'Dados atualizados com sucesso.',
            [
              {
                text: 'OK',
                onPress: () =>
                  navigation.navigate('InicialAdm'),
              },
            ]
          );


        } catch (err) {

          console.log(
            'ERRO AO SALVAR USUÁRIO:',
            err
          );


          if (
            err.code === 'permission-denied'
          ) {

            Alert.alert(
              'Acesso negado',
              'Você não possui permissão para alterar este usuário.'
            );

          } else {

            Alert.alert(
              'Erro',
              'Não foi possível salvar as alterações.'
            );

          }


        } finally {

          setSalvando(false);

        }

      };


    // =================================================
    // PROMOÇÃO PARA ADMIN
    // =================================================

    if (tipo === 'admin') {

      if (currentUserTipo !== 'dono') {

        Alert.alert(
          'Permissão negada',
          'Apenas o dono pode promover usuários para admin.'
        );

        return;
      }


      Alert.alert(
        'Confirmar promoção para Admin',
        'Ao salvar, esta conta será promovida a Admin. Tem certeza?',
        [
          {
            text: 'Cancelar',
            style: 'cancel',
          },

          {
            text: 'Confirmar',
            onPress: () =>
              performSave(),
          },
        ]
      );


      return;
    }


    await performSave();

  };


  // =====================================================
  // RECARREGAR USUÁRIO
  // =====================================================

  const atualizarDoServidor = async () => {

    if (!usuarioId) {
      return;
    }


    try {

      const snap =
        await getDoc(
          doc(
            database,
            'usuarios',
            usuarioId
          )
        );


      if (snap.exists()) {

        const d =
          snap.data();


        setNome(
          d.nome || ''
        );

        setTelefone(
          d.telefone || ''
        );

        setTipo(
          d.tipo || 'cliente'
        );

      }

    } catch (err) {

      console.log(
        'ERRO AO RECARREGAR USUÁRIO:',
        err
      );

    }

  };


  // =====================================================
  // PROMOVER PARA ADMIN
  // =====================================================

  const handleAdminPress =
    async () => {

      try {

        let myTipo =
          currentUserTipo;


        if (!myTipo) {

          const auth =
            getAuth();

          const cu =
            auth.currentUser;


          if (!cu) {

            Alert.alert(
              'Erro',
              'Nenhum usuário autenticado.'
            );

            return;
          }


          const snap =
            await getDoc(
              doc(
                database,
                'usuarios',
                cu.uid
              )
            );


          myTipo =
            snap.exists()
              ? snap.data()?.tipo
              : null;


          setCurrentUserTipo(
            myTipo
          );

        }


        // SOMENTE O DONO PODE PROMOVER
        if (myTipo !== 'dono') {

          Alert.alert(
            'Permissão negada',
            'Apenas o dono pode promover uma conta para admin.'
          );

          return;
        }


        // NÃO PERMITE PROMOVER O PRÓPRIO DONO
        if (usuarioId === getAuth().currentUser?.uid) {

          Alert.alert(
            'Acesso negado',
            'A conta do dono não pode ser alterada para admin.'
          );

          return;
        }


        Alert.alert(
          'Confirmar promoção',
          'Você está prestes a tornar esta conta admin. Será solicitada sua senha e e-mail para reautenticação.',
          [
            {
              text: 'Cancelar',
              style: 'cancel',
            },

            {
              text: 'Continuar',
              onPress: () =>
                setShowReauthModal(true),
            },
          ]
        );


      } catch (err) {

        console.log(
          'ERRO AO CHECAR PERMISSÃO:',
          err
        );


        Alert.alert(
          'Erro',
          'Não foi possível verificar permissões.'
        );

      }

    };


  // =====================================================
  // REAUTENTICAÇÃO
  // =====================================================

  const handleReauth =
    async () => {

      const auth =
        getAuth();

      const currentUser =
        auth.currentUser;


      if (
        !currentUser ||
        !currentUser.email
      ) {

        Alert.alert(
          'Erro',
          'Usuário autenticado inválido.'
        );

        return;
      }


      if (
        (reauthEmail || '')
          .trim()
          .toLowerCase() !==
        (currentUser.email || '')
          .toLowerCase()
      ) {

        Alert.alert(
          'Erro',
          'O e-mail informado não confere com o e-mail do usuário autenticado.'
        );

        return;
      }


      setReauthLoading(true);


      try {

        const cred =
          EmailAuthProvider.credential(
            currentUser.email,
            reauthPassword
          );


        await reauthenticateWithCredential(
          currentUser,
          cred
        );


        setShowReauthModal(false);

        setReauthPassword('');

        setReauthEmail('');

        setReauthSucceeded(true);

        setTipo('admin');


        Alert.alert(
          'Reautenticado',
          'Reautenticação bem-sucedida. A opção Admin foi selecionada. Agora pressione Salvar.'
        );


      } catch (err) {

        console.log(
          'ERRO DE REAUTENTICAÇÃO:',
          err
        );


        Alert.alert(
          'Erro',
          'Falha na reautenticação. Verifique o e-mail e a senha.'
        );


      } finally {

        setReauthLoading(false);

      }

    };


  // =====================================================
  // CARREGAR IMÓVEIS DO USUÁRIO
  // =====================================================

  const carregarImoveis =
    async () => {

      if (!usuarioId) {
        return;
      }


      try {

        setCarregandoImoveis(true);


        console.log(
          'BUSCANDO IMÓVEIS DO USUÁRIO:',
          usuarioId
        );


        const consulta =
          query(
            collection(
              database,
              'imoveis'
            ),
            where(
              'proprietarioId',
              '==',
              usuarioId
            )
          );


        const snapshot =
          await getDocs(consulta);


        const lista =
          snapshot.docs.map(
            (documento) => ({
              id: documento.id,
              ...documento.data(),
            })
          );


        console.log(
          'IMÓVEIS ENCONTRADOS:',
          lista.length
        );


        setImoveis(lista);


      } catch (erro) {

        console.log(
          'ERRO AO BUSCAR IMÓVEIS DO USUÁRIO:',
          erro
        );


        Alert.alert(
          'Erro',
          'Não foi possível carregar os imóveis cadastrados.'
        );


      } finally {

        setCarregandoImoveis(false);

      }

    };


  // =====================================================
  // ABRIR / FECHAR IMÓVEIS
  // =====================================================

  const alternarImoveis =
    async () => {

      if (mostrarImoveis) {

        setMostrarImoveis(false);

        return;
      }


      setMostrarImoveis(true);


      if (imoveis.length === 0) {

        await carregarImoveis();

      }

    };


  // =====================================================
  // FILTRO DOS IMÓVEIS
  // =====================================================

  const imoveisFiltrados =
    imoveis.filter(
      (imovel) => {

        const texto =
          buscaImovel
            .toLowerCase()
            .trim();


        if (!texto) {
          return true;
        }


        const titulo =
          String(
            imovel.titulo || ''
          ).toLowerCase();


        const nome =
          String(
            imovel.nome || ''
          ).toLowerCase();


        const cidade =
          String(
            imovel.cidade || ''
          ).toLowerCase();


        const bairro =
          String(
            imovel.bairro || ''
          ).toLowerCase();


        const tipoImovel =
          String(
            imovel.tipo || ''
          ).toLowerCase();


        return (
          titulo.includes(texto) ||
          nome.includes(texto) ||
          cidade.includes(texto) ||
          bairro.includes(texto) ||
          tipoImovel.includes(texto)
        );

      }
    );


  // =====================================================
  // FORMATAR PREÇO
  // =====================================================

  const formatarPreco =
    (preco) => {

      if (!preco) {
        return 'Valor não informado';
      }


      if (typeof preco === 'string') {
        return preco;
      }


      return Number(preco).toLocaleString(
        'pt-BR',
        {
          style: 'currency',
          currency: 'BRL',
        }
      );

    };


  // =====================================================
  // PEGAR IMAGEM
  // =====================================================

  const pegarImagem =
    (imovel) => {

      if (imovel.imagem) {
        return imovel.imagem;
      }


      if (
        Array.isArray(imovel.imagens) &&
        imovel.imagens.length > 0
      ) {

        return imovel.imagens[0];

      }


      if (
        Array.isArray(imovel.fotos) &&
        imovel.fotos.length > 0
      ) {

        return imovel.fotos[0];

      }


      return null;

    };


  // =====================================================
  // TELA
  // =====================================================

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


        {/* VOLTAR */}

        <TouchableOpacity
          style={estilos.botaoVoltar}
          onPress={() =>
            navigation.goBack()
          }
        >

          <Text style={estilos.iconeVoltar}>
            ‹
          </Text>

        </TouchableOpacity>


        {/* ================================================= */}
        {/* DADOS DO USUÁRIO */}
        {/* ================================================= */}

        <View style={estilos.card}>


          <View style={estilos.cabecalhoUsuario}>

            <View style={estilos.avatar}>

              <Text style={estilos.avatarTexto}>
                {nome
                  ? nome.charAt(0).toUpperCase()
                  : '?'}
              </Text>

            </View>


            <View style={estilos.infoCabecalho}>

              <Text style={estilos.titulo}>
                Dados do usuário
              </Text>

              <Text style={estilos.idUsuario}>
                ID: {usuarioId || '-'}
              </Text>

            </View>

          </View>


          {/* NOME */}

          <Text style={estilos.rotulo}>
            NOME
          </Text>

          <Text style={estilos.valor}>
            {nome || '-'}
          </Text>


          {/* EMAIL */}

          <Text
            style={[
              estilos.rotulo,
              estilos.rotuloEspacado,
            ]}
          >
            E-MAIL
          </Text>

          <Text style={estilos.valor}>
            {email || '-'}
          </Text>


          {/* TELEFONE */}

          <Text
            style={[
              estilos.rotulo,
              estilos.rotuloEspacado,
            ]}
          >
            TELEFONE
          </Text>

          <Text style={estilos.valor}>
            {telefone || '-'}
          </Text>


          {/* TIPO */}

          <Text
            style={[
              estilos.rotulo,
              estilos.rotuloEspacado,
            ]}
          >
            TIPO DE CONTA
          </Text>


          <View style={estilos.tipoContainer}>

            <TouchableOpacity
              style={[
                estilos.tipoBtn,
                tipo === 'cliente' &&
                estilos.tipoBtnSel,
              ]}
              onPress={() =>
                setTipo('cliente')
              }
              disabled={
                currentUserTipo === 'admin' &&
                (
                  dados?.tipo === 'admin' ||
                  dados?.tipo === 'dono'
                )
              }
            >

              <Text
                style={
                  tipo === 'cliente'
                    ? estilos.tipoSelText
                    : estilos.tipoText
                }
              >
                Cliente
              </Text>

            </TouchableOpacity>


            <TouchableOpacity
              style={[
                estilos.tipoBtn,
                tipo === 'proprietario' &&
                estilos.tipoBtnSel,
              ]}
              onPress={() =>
                setTipo('proprietario')
              }
              disabled={
                currentUserTipo === 'admin' &&
                (
                  dados?.tipo === 'admin' ||
                  dados?.tipo === 'dono'
                )
              }
            >

              <Text
                style={
                  tipo === 'proprietario'
                    ? estilos.tipoSelText
                    : estilos.tipoText
                }
              >
                Proprietário
              </Text>

            </TouchableOpacity>


            {/* SOMENTE O DONO VÊ ADMIN */}

            {currentUserTipo === 'dono' && (

              <TouchableOpacity
                style={[
                  estilos.tipoBtn,
                  tipo === 'admin' &&
                  estilos.tipoBtnSel,
                ]}
                onPress={
                  handleAdminPress
                }
              >

                <Text
                  style={
                    tipo === 'admin'
                      ? estilos.tipoSelText
                      : estilos.tipoText
                  }
                >
                  Admin
                </Text>

              </TouchableOpacity>

            )}

          </View>


          {/* AVISO PARA ADMIN */}

          {currentUserTipo === 'admin' &&
            (
              dados?.tipo === 'admin' ||
              dados?.tipo === 'dono'
            ) && (

              <Text style={estilos.avisoSeguranca}>
                Este usuário não pode ser alterado por um administrador.
              </Text>

            )}


          {/* BOTÃO SALVAR */}

          <TouchableOpacity
            style={[
              estilos.botao,
              estilos.botaoEntrar,
              salvando &&
              estilos.botaoDesabilitado,
            ]}
            onPress={salvar}
            disabled={
              salvando ||
              (
                currentUserTipo === 'admin' &&
                (
                  dados?.tipo === 'admin' ||
                  dados?.tipo === 'dono'
                )
              )
            }
          >

            <Text style={estilos.textoBotaoEntrar}>
              {salvando
                ? 'Salvando...'
                : 'Salvar alterações'}
            </Text>

          </TouchableOpacity>


          <TouchableOpacity
            style={[
              estilos.botao,
              estilos.botaoSec,
            ]}
            onPress={
              atualizarDoServidor
            }
          >

            <Text style={estilos.textoBotaoSec}>
              Recarregar dados
            </Text>

          </TouchableOpacity>


          {reauthSucceeded && (

            <Text style={estilos.textoReauth}>
              Reautenticação concluída. Admin selecionado.
            </Text>

          )}

        </View>


        {/* ================================================= */}
        {/* IMÓVEIS DO USUÁRIO */}
        {/* ================================================= */}

        {tipo === 'proprietario' && (

          <View style={estilos.cardImoveis}>

            <View style={estilos.tituloImoveisLinha}>

              <View style={{ flex: 1 }}>

                <Text style={estilos.tituloSecao}>
                  Imóveis cadastrados
                </Text>

                <Text style={estilos.subtituloSecao}>
                  Imóveis vinculados a este proprietário
                </Text>

              </View>


              <View style={estilos.contador}>

                <Text style={estilos.contadorTexto}>
                  {imoveis.length}
                </Text>

              </View>

            </View>


            <TouchableOpacity
              style={estilos.botaoMostrar}
              onPress={alternarImoveis}
            >

              <Text style={estilos.botaoMostrarTexto}>
                {mostrarImoveis
                  ? 'Ocultar imóveis'
                  : 'Ver imóveis cadastrados'}
              </Text>


              <Text style={estilos.seta}>
                {mostrarImoveis
                  ? '⌃'
                  : '⌄'}
              </Text>

            </TouchableOpacity>


            {mostrarImoveis && (

              <View style={estilos.areaImoveis}>

                {/* BUSCA */}

                <View style={estilos.busca}>

                  <Text style={estilos.iconeBusca}>
                    🔍
                  </Text>


                  <TextInput
                    style={estilos.inputBusca}
                    placeholder="Buscar por nome, cidade, bairro ou tipo..."
                    placeholderTextColor="#777"
                    value={buscaImovel}
                    onChangeText={setBuscaImovel}
                  />


                  {buscaImovel.length > 0 && (

                    <TouchableOpacity
                      onPress={() =>
                        setBuscaImovel('')
                      }
                    >

                      <Text style={estilos.limparBusca}>
                        ×
                      </Text>

                    </TouchableOpacity>

                  )}

                </View>


                {/* CARREGANDO */}

                {carregandoImoveis && (

                  <View style={estilos.carregando}>

                    <ActivityIndicator
                      size="small"
                      color="#C9A86A"
                    />

                    <Text style={estilos.textoCarregando}>
                      Buscando imóveis...
                    </Text>

                  </View>

                )}


                {/* RESULTADOS */}

                {!carregandoImoveis && (

                  <>

                    <Text style={estilos.resultadoBusca}>

                      {imoveisFiltrados.length}

                      {imoveisFiltrados.length === 1
                        ? ' imóvel encontrado'
                        : ' imóveis encontrados'}

                    </Text>


                    {imoveisFiltrados.map(
                      (imovel) => {

                        const imagem =
                          pegarImagem(imovel);


                        return (

                          <View
                            key={imovel.id}
                            style={estilos.cardImovel}
                          >

                            {imagem ? (

                              <Image
                                source={{
                                  uri: imagem,
                                }}
                                style={estilos.imagemImovel}
                              />

                            ) : (

                              <View
                                style={estilos.semImagem}
                              >

                                <Text style={estilos.iconeCasa}>
                                  🏠
                                </Text>

                              </View>

                            )}


                            <View style={estilos.infoImovel}>

                              <View style={estilos.linhaTituloImovel}>

                                <Text
                                  style={estilos.tituloImovel}
                                  numberOfLines={2}
                                >

                                  {imovel.titulo ||
                                    imovel.nome ||
                                    'Imóvel sem título'}

                                </Text>


                                <View
                                  style={[
                                    estilos.status,

                                    imovel.publicado
                                      ? estilos.statusPublicado
                                      : estilos.statusPendente,
                                  ]}
                                >

                                  <Text
                                    style={estilos.statusTexto}
                                  >

                                    {imovel.publicado
                                      ? 'PUBLICADO'
                                      : 'NÃO PUBLICADO'}

                                  </Text>

                                </View>

                              </View>


                              <Text style={estilos.tipoImovel}>

                                {imovel.tipo ||
                                  'Imóvel'}

                              </Text>


                              <Text style={estilos.localizacao}>

                                📍 {imovel.cidade ||
                                  'Cidade não informada'}

                                {imovel.bairro
                                  ? ` • ${imovel.bairro}`
                                  : ''}

                              </Text>


                              <View style={estilos.linhaDetalhes}>

                                <Text style={estilos.detalhe}>

                                  {imovel.finalidade ||
                                    'Finalidade não informada'}

                                </Text>


                                {imovel.quartos != null && (

                                  <Text style={estilos.detalhe}>
                                    🛏 {imovel.quartos}
                                  </Text>

                                )}


                                {imovel.area != null && (

                                  <Text style={estilos.detalhe}>
                                    📐 {imovel.area} m²
                                  </Text>

                                )}

                              </View>


                              <Text style={estilos.preco}>

                                {formatarPreco(
                                  imovel.preco
                                )}

                              </Text>


                              <Text
                                style={estilos.idImovel}
                                numberOfLines={1}
                              >

                                ID: {imovel.id}

                              </Text>

                            </View>

                          </View>

                        );

                      }
                    )}


                    {imoveisFiltrados.length === 0 && (

                      <View style={estilos.semResultado}>

                        <Text style={estilos.iconeSemResultado}>
                          🏠
                        </Text>


                        <Text style={estilos.tituloSemResultado}>
                          Nenhum imóvel encontrado
                        </Text>


                        <Text style={estilos.textoSemResultado}>

                          {buscaImovel
                            ? 'Nenhum imóvel corresponde à sua pesquisa.'
                            : 'Este usuário ainda não possui imóveis cadastrados.'}

                        </Text>

                      </View>

                    )}

                  </>

                )}

              </View>

            )}

          </View>

        )}


      </ScrollView>


      {/* ================================================= */}
      {/* MODAL DE REAUTENTICAÇÃO */}
      {/* ================================================= */}

      {showReauthModal && (

        <View style={estilos.reauthOverlay}>

          <View style={estilos.reauthBox}>


            <Text style={estilos.reauthTitulo}>
              Reautentique-se
            </Text>


            <Text style={estilos.reauthDescricao}>
              Digite seu e-mail e senha para confirmar a promoção.
            </Text>


            <TextInput
              placeholder="E-mail"
              placeholderTextColor="#777"
              style={estilos.reauthInput}
              value={reauthEmail}
              onChangeText={
                setReauthEmail
              }
              keyboardType="email-address"
              autoCapitalize="none"
            />


            <TextInput
              secureTextEntry
              placeholder="Senha"
              placeholderTextColor="#777"
              style={estilos.reauthInput}
              value={reauthPassword}
              onChangeText={
                setReauthPassword
              }
            />


            <View style={estilos.reauthBotoes}>

              <TouchableOpacity
                style={[
                  estilos.botao,
                  estilos.botaoSec,
                  estilos.botaoReauth,
                ]}
                onPress={() => {

                  setShowReauthModal(false);
                  setReauthPassword('');
                  setReauthEmail('');

                }}
              >

                <Text style={estilos.textoBotaoSec}>
                  Cancelar
                </Text>

              </TouchableOpacity>


              <TouchableOpacity
                style={[
                  estilos.botao,
                  estilos.botaoEntrar,
                  estilos.botaoReauth,
                ]}
                onPress={handleReauth}
                disabled={
                  reauthLoading ||
                  !reauthPassword ||
                  !reauthEmail
                }
              >

                <Text style={estilos.textoBotaoEntrar}>
                  {reauthLoading
                    ? 'Verificando...'
                    : 'Confirmar'}
                </Text>

              </TouchableOpacity>

            </View>

          </View>

        </View>

      )}

    </ImageBackground>

  );

}


// =====================================================
// ESTILOS
// =====================================================

const estilos = StyleSheet.create({

  fundo: {
    flex: 1,
    backgroundColor: '#111',
  },


  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.60)',
  },


  scroll: {
    flex: 1,
  },


  container: {
    padding: 20,
    paddingTop: 70,
    paddingBottom: 60,
  },


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
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },


  iconeVoltar: {
    color: '#C9A86A',
    fontSize: 38,
    lineHeight: 40,
    marginTop: -5,
  },


  card: {
    backgroundColor: 'rgba(15,15,15,0.96)',
    padding: 20,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(201,168,106,0.25)',
    marginBottom: 18,
  },


  cabecalhoUsuario: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },


  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#C9A86A',
    alignItems: 'center',
    justifyContent: 'center',
  },


  avatarTexto: {
    color: '#111',
    fontSize: 24,
    fontWeight: '900',
  },


  infoCabecalho: {
    marginLeft: 15,
    flex: 1,
  },


  titulo: {
    color: '#C9A86A',
    fontSize: 21,
    fontWeight: '700',
  },


  idUsuario: {
    color: '#666',
    fontSize: 10,
    marginTop: 5,
  },


  rotulo: {
    color: '#C9A86A',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 7,
  },


  rotuloEspacado: {
    marginTop: 16,
  },


  valor: {
    color: '#fff',
    backgroundColor: '#202020',
    padding: 12,
    borderRadius: 9,
    fontSize: 14,
  },


  tipoContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5,
    gap: 8,
  },


  tipoBtn: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 12,
    backgroundColor: '#222',
    borderWidth: 1,
    borderColor: '#333',
  },


  tipoBtnSel: {
    backgroundColor: '#C9A86A',
    borderColor: '#C9A86A',
  },


  tipoText: {
    color: '#fff',
    fontSize: 12,
  },


  tipoSelText: {
    color: '#111',
    fontWeight: '700',
    fontSize: 12,
  },


  botao: {
    width: '100%',
    paddingVertical: 13,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
  },


  botaoEntrar: {
    backgroundColor: '#C9A86A',
  },


  textoBotaoEntrar: {
    color: '#111',
    fontWeight: '800',
  },


  botaoSec: {
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#333',
  },


  textoBotaoSec: {
    color: '#fff',
    fontWeight: '700',
  },


  botaoDesabilitado: {
    opacity: 0.6,
  },


  textoReauth: {
    color: '#C9A86A',
    textAlign: 'center',
    fontSize: 11,
    marginTop: 15,
  },


  avisoSeguranca: {
    color: '#C9A86A',
    backgroundColor: 'rgba(201,168,106,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(201,168,106,0.25)',
    borderRadius: 10,
    padding: 10,
    marginTop: 15,
    fontSize: 11,
    textAlign: 'center',
  },


  /* ================================================= */
  /* IMÓVEIS */
  /* ================================================= */

  cardImoveis: {
    backgroundColor: 'rgba(15,15,15,0.96)',
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(201,168,106,0.25)',
  },


  tituloImoveisLinha: {
    flexDirection: 'row',
    alignItems: 'center',
  },


  tituloSecao: {
    color: '#fff',
    fontSize: 19,
    fontWeight: '700',
  },


  subtituloSecao: {
    color: '#777',
    fontSize: 11,
    marginTop: 4,
  },


  contador: {
    minWidth: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(201,168,106,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(201,168,106,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },


  contadorTexto: {
    color: '#C9A86A',
    fontWeight: '800',
    fontSize: 15,
  },


  botaoMostrar: {
    height: 50,
    marginTop: 18,
    borderRadius: 12,
    backgroundColor: '#C9A86A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },


  botaoMostrarTexto: {
    color: '#111',
    fontSize: 13,
    fontWeight: '800',
  },


  seta: {
    color: '#111',
    fontSize: 20,
    marginLeft: 10,
  },


  areaImoveis: {
    marginTop: 18,
  },


  busca: {
    height: 52,
    backgroundColor: '#0b0b0b',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
  },


  iconeBusca: {
    fontSize: 17,
    marginRight: 9,
  },


  inputBusca: {
    flex: 1,
    color: '#fff',
    fontSize: 12,
  },


  limparBusca: {
    color: '#C9A86A',
    fontSize: 26,
    lineHeight: 26,
  },


  resultadoBusca: {
    color: '#777',
    fontSize: 10,
    marginTop: 12,
    marginBottom: 10,
  },


  carregando: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 25,
  },


  textoCarregando: {
    color: '#888',
    fontSize: 11,
    marginLeft: 9,
  },


  cardImovel: {
    backgroundColor: '#202020',
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#303030',
  },


  imagemImovel: {
    width: '100%',
    height: 150,
  },


  semImagem: {
    width: '100%',
    height: 150,
    backgroundColor: '#171717',
    alignItems: 'center',
    justifyContent: 'center',
  },


  iconeCasa: {
    fontSize: 38,
  },


  infoImovel: {
    padding: 14,
  },


  linhaTituloImovel: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },


  tituloImovel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },


  tipoImovel: {
    color: '#C9A86A',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginTop: 6,
  },


  localizacao: {
    color: '#999',
    fontSize: 11,
    marginTop: 7,
  },


  linhaDetalhes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 10,
  },


  detalhe: {
    color: '#aaa',
    fontSize: 10,
  },


  preco: {
    color: '#C9A86A',
    fontSize: 17,
    fontWeight: '800',
    marginTop: 13,
  },


  idImovel: {
    color: '#555',
    fontSize: 8,
    marginTop: 8,
  },


  status: {
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 10,
  },


  statusPublicado: {
    backgroundColor: 'rgba(100,180,100,0.18)',
  },


  statusPendente: {
    backgroundColor: 'rgba(201,168,106,0.15)',
  },


  statusTexto: {
    color: '#C9A86A',
    fontSize: 7,
    fontWeight: '800',
  },


  semResultado: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },


  iconeSemResultado: {
    fontSize: 36,
    marginBottom: 10,
  },


  tituloSemResultado: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },


  textoSemResultado: {
    color: '#777',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 7,
    lineHeight: 17,
  },


  /* ================================================= */
  /* MODAL */
  /* ================================================= */

  reauthOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },


  reauthBox: {
    width: '100%',
    backgroundColor: '#151515',
    padding: 20,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#8E713E',
  },


  reauthTitulo: {
    color: '#C9A86A',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },


  reauthDescricao: {
    color: '#aaa',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 15,
  },


  reauthInput: {
    height: 46,
    backgroundColor: '#0b0b0b',
    color: '#fff',
    borderRadius: 9,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: 10,
  },


  reauthBotoes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },


  botaoReauth: {
    flex: 1,
  },

}); 