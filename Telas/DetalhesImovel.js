import { useState } from 'react';

import {
  View,
  Text,
  StyleSheet,
  Image,
  ImageBackground,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
  Linking,
} from 'react-native';


const { width } = Dimensions.get('window');


export default function DetalhesImovel({
  route,
  navigation,
}) {


  // =====================================================
  // RECEBER IMÓVEL
  // =====================================================

  const { imovel } = route.params || {};


  const [fotoAtual, setFotoAtual] = useState(0);


  // =====================================================
  // PROTEÇÃO
  // =====================================================

  if (!imovel) {

    return (

      <View style={estilos.erro}>

        <Text style={estilos.erroTitulo}>
          Imóvel não encontrado
        </Text>


        <TouchableOpacity
          style={estilos.botaoErro}
          onPress={() => navigation.goBack()}
        >

          <Text style={estilos.textoBotaoErro}>
            VOLTAR
          </Text>

        </TouchableOpacity>

      </View>

    );

  }


  // =====================================================
  // FOTOS
  // =====================================================

  const fotos = [];


  if (
    imovel.imagem &&
    typeof imovel.imagem === 'string' &&
    imovel.imagem.trim() !== ''
  ) {

    fotos.push(imovel.imagem);

  }


  if (
    imovel.imagens &&
    Array.isArray(imovel.imagens)
  ) {

    imovel.imagens.forEach((foto) => {

      if (
        foto &&
        typeof foto === 'string' &&
        foto.trim() !== '' &&
        !fotos.includes(foto)
      ) {

        fotos.push(foto);

      }

    });

  }


  // =====================================================
  // IMAGEM ATUAL
  // =====================================================

  const imagemAtual =
    fotos.length > 0
      ? { uri: fotos[fotoAtual] }
      : require('../Imagens/fundo-imoveis.png');


  // =====================================================
  // PREÇO
  // =====================================================

  const formatarPreco = (preco) => {

    if (
      preco === null ||
      preco === undefined ||
      preco === ''
    ) {

      return 'Consultar valor';

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
  // LOCALIZAÇÃO
  // =====================================================

  const localizacao = [

    imovel.endereco,

    imovel.bairro,

    imovel.cidade,

  ]
    .filter(Boolean)
    .join(', ');


  // =====================================================
  // WHATSAPP
  // =====================================================

  const abrirWhatsApp = async () => {

    if (!imovel.telefone) {

      Alert.alert(
        'Contato indisponível',
        'Este imóvel ainda não possui telefone cadastrado.'
      );

      return;

    }


    const numero =
      String(imovel.telefone)
        .replace(/\D/g, '');


    if (!numero) {

      Alert.alert(
        'Telefone inválido',
        'O telefone cadastrado não é válido.'
      );

      return;

    }


    const url =
      `https://wa.me/55${numero}`;


    try {

      const podeAbrir =
        await Linking.canOpenURL(url);


      if (podeAbrir) {

        await Linking.openURL(url);

      } else {

        Alert.alert(
          'Erro',
          'Não foi possível abrir o WhatsApp.'
        );

      }

    } catch (erro) {

      console.log(
        'ERRO AO ABRIR WHATSAPP:',
        erro
      );

      Alert.alert(
        'Erro',
        'Não foi possível abrir o WhatsApp.'
      );

    }

  };


  // =====================================================
  // AGENDAR VISITA
  // =====================================================

  const agendarVisita = () => {

    navigation.navigate(
      'AgendarVisita',
      {
        imovel: imovel,
      }
    );

  };


  // =====================================================
  // FOTO ANTERIOR
  // =====================================================

  const fotoAnterior = () => {

    if (fotos.length <= 1) {
      return;
    }


    setFotoAtual((atual) => {

      if (atual === 0) {

        return fotos.length - 1;

      }

      return atual - 1;

    });

  };


  // =====================================================
  // PRÓXIMA FOTO
  // =====================================================

  const proximaFoto = () => {

    if (fotos.length <= 1) {
      return;
    }


    setFotoAtual((atual) => {

      if (atual === fotos.length - 1) {

        return 0;

      }

      return atual + 1;

    });

  };


  // =====================================================
  // RENDER
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
            GALERIA
        ================================================== */}

        <View style={estilos.galeria}>

          <Image
            source={imagemAtual}
            style={estilos.imagemPrincipal}
            resizeMode="cover"
          />


          {/* ESCURECIMENTO */}

          <View style={estilos.overlayImagem} />


          {/* VOLTAR */}

          <TouchableOpacity
            style={estilos.botaoVoltar}
            onPress={() => navigation.goBack()}
          >

            <Text style={estilos.iconeVoltar}>
              ‹
            </Text>

          </TouchableOpacity>


          {/* FINALIDADE */}

          <View style={estilos.etiquetaImagem}>

            <Text style={estilos.textoEtiquetaImagem}>
              {imovel.finalidade || 'Imóvel'}
            </Text>

          </View>


          {/* SETA ESQUERDA */}

          {fotos.length > 1 && (

            <TouchableOpacity
              style={[
                estilos.botaoFoto,
                estilos.botaoFotoEsquerda,
              ]}
              onPress={fotoAnterior}
            >

              <Text style={estilos.setaFoto}>
                ‹
              </Text>

            </TouchableOpacity>

          )}


          {/* SETA DIREITA */}

          {fotos.length > 1 && (

            <TouchableOpacity
              style={[
                estilos.botaoFoto,
                estilos.botaoFotoDireita,
              ]}
              onPress={proximaFoto}
            >

              <Text style={estilos.setaFoto}>
                ›
              </Text>

            </TouchableOpacity>

          )}


          {/* CONTADOR */}

          {fotos.length > 1 && (

            <View style={estilos.contadorFotos}>

              <Text style={estilos.textoContador}>
                {fotoAtual + 1} / {fotos.length}
              </Text>

            </View>

          )}

        </View>


        {/* =================================================
            CONTEÚDO
        ================================================== */}

        <View style={estilos.card}>


          {/* TIPO */}

          <Text style={estilos.tipo}>
            {imovel.tipo || 'Imóvel'}
          </Text>


          {/* TÍTULO */}

          <Text style={estilos.titulo}>
            {imovel.titulo || 'Imóvel disponível'}
          </Text>


          {/* LOCALIZAÇÃO */}

          <View style={estilos.blocoLocalizacao}>

            <Text style={estilos.iconeLocalizacao}>
              📍
            </Text>


            <View style={estilos.textoLocalizacaoContainer}>

              <Text style={estilos.localizacao}>
                {imovel.cidade ||
                  'Localização não informada'}
              </Text>


              {imovel.bairro && (

                <Text style={estilos.bairro}>
                  {imovel.bairro}
                </Text>

              )}

            </View>

          </View>


          {/* ENDEREÇO */}

          {imovel.endereco && (

            <View style={estilos.enderecoContainer}>

              <Text style={estilos.labelEndereco}>
                ENDEREÇO
              </Text>

              <Text style={estilos.endereco}>
                {imovel.endereco}
              </Text>

            </View>

          )}


          {/* PREÇO */}

          <View style={estilos.blocoPreco}>

            <Text style={estilos.labelPreco}>
              VALOR
            </Text>

            <Text style={estilos.preco}>
              {formatarPreco(imovel.preco)}
            </Text>

          </View>


          {/* =================================================
              CARACTERÍSTICAS
          ================================================== */}

          <View style={estilos.divisor} />


          <Text style={estilos.tituloSecao}>
            Características
          </Text>


          <View style={estilos.caracteristicas}>


            <Caracteristica
              icone="🛏"
              valor={imovel.quartos}
              texto="Quartos"
            />


            <Caracteristica
              icone="🚿"
              valor={imovel.banheiros}
              texto="Banheiros"
            />


            <Caracteristica
              icone="🚗"
              valor={imovel.vagas}
              texto="Vagas"
            />


            <Caracteristica
              icone="📐"
              valor={imovel.area}
              texto="Área"
              sufixo=" m²"
            />

          </View>


          {/* =================================================
              DESCRIÇÃO
          ================================================== */}

          <View style={estilos.divisor} />


          <Text style={estilos.tituloSecao}>
            Sobre o imóvel
          </Text>


          <Text style={estilos.descricao}>
            {imovel.descricao ||
              'Nenhuma descrição foi cadastrada para este imóvel.'}
          </Text>


          {/* =================================================
              LOCALIZAÇÃO
          ================================================== */}

          <View style={estilos.divisor} />


          <Text style={estilos.tituloSecao}>
            Localização
          </Text>


          <View style={estilos.localizacaoCard}>

            <Text style={estilos.iconeMapa}>
              📍
            </Text>


            <Text style={estilos.textoMapa}>
              {localizacao ||
                'Localização não informada'}
            </Text>


            <Text style={estilos.subtextoMapa}>
              Consulte nossa equipe para mais informações
              sobre a localização.
            </Text>

          </View>


          {/* =================================================
              CONTATO
          ================================================== */}

          <View style={estilos.divisor} />


          <Text style={estilos.tituloSecao}>
            Interessado neste imóvel?
          </Text>


          <Text style={estilos.textoContato}>
            Entre em contato com nossa equipe ou
            agende uma visita para conhecer o imóvel.
          </Text>


          {/* AGENDAR */}

          <TouchableOpacity
            style={estilos.botaoAgendar}
            activeOpacity={0.85}
            onPress={agendarVisita}
          >

            <Text style={estilos.iconeBotao}>
              📅
            </Text>

            <Text style={estilos.textoBotaoAgendar}>
              AGENDAR VISITA
            </Text>

            <Text style={estilos.setaBotao}>
              →
            </Text>

          </TouchableOpacity>


          {/* WHATSAPP */}

          <TouchableOpacity
            style={estilos.botaoWhatsApp}
            activeOpacity={0.85}
            onPress={abrirWhatsApp}
          >

            <Text style={estilos.iconeWhatsApp}>
              💬
            </Text>

            <Text style={estilos.textoWhatsApp}>
              TENHO INTERESSE
            </Text>

          </TouchableOpacity>


          {/* AVISO */}

          <Text style={estilos.aviso}>
            As informações deste imóvel estão sujeitas
            à confirmação pela A2 Imóveis.
          </Text>


        </View>

      </ScrollView>

    </ImageBackground>

  );

}


// =====================================================
// COMPONENTE CARACTERÍSTICA
// =====================================================

function Caracteristica({
  icone,
  valor,
  texto,
  sufixo = '',
}) {

  const existe =
    valor !== null &&
    valor !== undefined &&
    valor !== '';


  return (

    <View style={estilos.caracteristica}>

      <Text style={estilos.iconeCaracteristica}>
        {icone}
      </Text>


      <Text style={estilos.valorCaracteristica}>

        {existe
          ? `${valor}${sufixo}`
          : '-'
        }

      </Text>


      <Text style={estilos.textoCaracteristica}>
        {texto}
      </Text>

    </View>

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


  imagemFundo: {
    width: '100%',
    height: '100%',
  },


  sombra: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.65)',
  },


  scroll: {
    flex: 1,
  },


  conteudo: {
    paddingBottom: 50,
  },


  // ===================================================
  // GALERIA
  // ===================================================

  galeria: {
    width: '100%',
    height: 330,
    position: 'relative',
  },


  imagemPrincipal: {
    width: '100%',
    height: '100%',
    backgroundColor: '#1b1b1b',
  },


  overlayImagem: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.22)',
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
    justifyContent: 'center',
    alignItems: 'center',
  },


  iconeVoltar: {
    color: '#C9A86A',
    fontSize: 38,
    lineHeight: 40,
    marginTop: -5,
  },


  etiquetaImagem: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    backgroundColor: '#C9A86A',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },


  textoEtiquetaImagem: {
    color: '#111',
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },


  botaoFoto: {
    position: 'absolute',
    top: '50%',
    marginTop: -22,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(10,10,10,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },


  botaoFotoEsquerda: {
    left: 15,
  },


  botaoFotoDireita: {
    right: 15,
  },


  setaFoto: {
    color: '#fff',
    fontSize: 32,
    lineHeight: 35,
    marginTop: -3,
  },


  contadorFotos: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: 'rgba(10,10,10,0.75)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },


  textoContador: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },


  // ===================================================
  // CARD
  // ===================================================

  card: {
    backgroundColor: '#121212',
    marginTop: -22,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 22,
    minHeight: 600,
  },


  tipo: {
    color: '#C9A86A',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 7,
  },


  titulo: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 34,
  },


  // ===================================================
  // LOCALIZAÇÃO
  // ===================================================

  blocoLocalizacao: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 17,
  },


  iconeLocalizacao: {
    fontSize: 19,
    marginRight: 9,
  },


  textoLocalizacaoContainer: {
    flex: 1,
  },


  localizacao: {
    color: '#ddd',
    fontSize: 14,
    fontWeight: '600',
  },


  bairro: {
    color: '#777',
    fontSize: 11,
    marginTop: 3,
  },


  enderecoContainer: {
    marginTop: 15,
    paddingLeft: 29,
  },


  labelEndereco: {
    color: '#777',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 4,
  },


  endereco: {
    color: '#aaa',
    fontSize: 12,
  },


  // ===================================================
  // PREÇO
  // ===================================================

  blocoPreco: {
    marginTop: 22,
  },


  labelPreco: {
    color: '#777',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 5,
  },


  preco: {
    color: '#C9A86A',
    fontSize: 26,
    fontWeight: '900',
  },


  // ===================================================
  // DIVISOR
  // ===================================================

  divisor: {
    height: 1,
    backgroundColor: '#292929',
    marginVertical: 25,
  },


  // ===================================================
  // SEÇÃO
  // ===================================================

  tituloSecao: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 17,
  },


  // ===================================================
  // CARACTERÍSTICAS
  // ===================================================

  caracteristicas: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },


  caracteristica: {
    width: '24%',
    alignItems: 'center',
  },


  iconeCaracteristica: {
    fontSize: 20,
    marginBottom: 7,
  },


  valorCaracteristica: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },


  textoCaracteristica: {
    color: '#777',
    fontSize: 10,
    marginTop: 3,
    textAlign: 'center',
  },


  // ===================================================
  // DESCRIÇÃO
  // ===================================================

  descricao: {
    color: '#aaa',
    fontSize: 14,
    lineHeight: 23,
  },


  // ===================================================
  // LOCALIZAÇÃO
  // ===================================================

  localizacaoCard: {
    minHeight: 140,
    backgroundColor: '#0b0b0b',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#292929',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },


  iconeMapa: {
    fontSize: 30,
    marginBottom: 9,
  },


  textoMapa: {
    color: '#ddd',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },


  subtextoMapa: {
    color: '#666',
    fontSize: 10,
    marginTop: 7,
    textAlign: 'center',
  },


  // ===================================================
  // CONTATO
  // ===================================================

  textoContato: {
    color: '#888',
    fontSize: 12,
    lineHeight: 19,
    marginBottom: 17,
  },


  botaoAgendar: {
    height: 57,
    backgroundColor: '#C9A86A',
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },


  iconeBotao: {
    fontSize: 17,
    marginRight: 9,
  },


  textoBotaoAgendar: {
    color: '#111',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },


  setaBotao: {
    color: '#111',
    fontSize: 21,
    marginLeft: 10,
  },


  botaoWhatsApp: {
    height: 55,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#C9A86A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },


  iconeWhatsApp: {
    fontSize: 17,
    marginRight: 8,
  },


  textoWhatsApp: {
    color: '#C9A86A',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },


  // ===================================================
  // AVISO
  // ===================================================

  aviso: {
    color: '#555',
    fontSize: 9,
    lineHeight: 14,
    textAlign: 'center',
    marginTop: 18,
    paddingHorizontal: 15,
  },


  // ===================================================
  // ERRO
  // ===================================================

  erro: {
    flex: 1,
    backgroundColor: '#111',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },


  erroTitulo: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
  },


  botaoErro: {
    backgroundColor: '#C9A86A',
    paddingHorizontal: 30,
    paddingVertical: 14,
    borderRadius: 25,
  },


  textoBotaoErro: {
    color: '#111',
    fontSize: 12,
    fontWeight: '900',
  },

});