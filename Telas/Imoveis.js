import { useEffect, useState } from 'react';

import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

import {
  collection,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore';

import { database } from '../firebaseConfig';


export default function Imoveis({ navigation }) {
  const { isGuest } = useContext(AuthContext);

  const [imoveis, setImoveis] = useState([]);
  const [busca, setBusca] = useState('');
  const [filtro, setFiltro] = useState('Todos');
  const [carregando, setCarregando] = useState(true);


  // =====================================================
  // BUSCAR IMÓVEIS DO FIRESTORE
  // =====================================================

  useEffect(() => {

    const consulta = query(
      collection(database, 'imoveis'),
      where('publicado', '==', true)
    );


    const unsubscribe = onSnapshot(
      consulta,

      (snapshot) => {

        const lista = snapshot.docs.map((documento) => ({
          id: documento.id,
          ...documento.data(),
        }));

        setImoveis(lista);
        setCarregando(false);
      },

      (erro) => {

        console.log(
          'ERRO AO BUSCAR IMÓVEIS:',
          erro
        );

        setCarregando(false);
      }
    );


    return () => unsubscribe();

  }, []);


  // =====================================================
  // FILTROS
  // =====================================================

  const imoveisFiltrados = imoveis.filter((imovel) => {

    const textoBusca = busca.toLowerCase().trim();


    const correspondeBusca =
      !textoBusca ||
      String(imovel.titulo || '')
        .toLowerCase()
        .includes(textoBusca) ||

      String(imovel.cidade || '')
        .toLowerCase()
        .includes(textoBusca) ||

      String(imovel.bairro || '')
        .toLowerCase()
        .includes(textoBusca) ||

      String(imovel.tipo || '')
        .toLowerCase()
        .includes(textoBusca);


    const finalidade =
      String(imovel.finalidade || '')
        .toLowerCase();


    let correspondeFiltro = true;


    if (filtro === 'Venda') {
      correspondeFiltro =
        finalidade === 'venda' ||
        finalidade === 'comprar';
    }


    if (filtro === 'Locação') {
      correspondeFiltro =
        finalidade === 'locação' ||
        finalidade === 'locacao' ||
        finalidade === 'alugar';
    }


    return correspondeBusca && correspondeFiltro;
  });

  // =====================================================
  // FORMATAR PREÇO
  // =====================================================

  const formatarPreco = (preco) => {

    if (!preco) {
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
  // IMAGEM DO IMÓVEL
  // =====================================================

  const pegarImagem = (imovel) => {

    if (imovel.imagem) {
      return { uri: imovel.imagem };
    }

    if (
      imovel.imagens &&
      Array.isArray(imovel.imagens) &&
      imovel.imagens.length > 0
    ) {
      return { uri: imovel.imagens[0] };
    }

    return null;
  };


  return (

    <ImageBackground
      source={require('../Imagens/fundo-imoveis.png')}
      style={estilos.fundo}
      imageStyle={estilos.imagemFundo}
      resizeMode="cover"
    >

      {/* ESCURECIMENTO LEVE */}

      <View style={estilos.sombra} />


      {/* ================================================
          CONTEÚDO
      ================================================= */}

      <ScrollView
        style={estilos.scroll}
        contentContainerStyle={estilos.conteudo}
        showsVerticalScrollIndicator={false}
      >


        {/* ================================================
            CABEÇALHO
        ================================================= */}

        <View style={estilos.topo}>

          <View>

            <Text style={estilos.logo}>
              A2 <Text style={estilos.logoBranco}>IMÓVEIS</Text>
            </Text>

            <Text style={estilos.slogan}>
              REALIZANDO SONHOS
            </Text>

          </View>


          <TouchableOpacity
            style={estilos.botaoPerfil}
            onPress={() =>
              navigation?.navigate('Perfil')
            }
          >

            <Text style={estilos.iconePerfil}>
              👤
            </Text>

          </TouchableOpacity>

        </View>

        {/* ================================================
            APRESENTAÇÃO
        ================================================= */}

        <View style={estilos.apresentacao}>

          <Text style={estilos.titulo}>
            Encontre seu próximo imóvel
          </Text>

          <Text style={estilos.subtitulo}>
            Casas, apartamentos, terrenos e muito mais.
          </Text>

        </View>


        {/* ================================================
            BUSCA
        ================================================= */}

        <View style={estilos.busca}>

          <Text style={estilos.iconeBusca}>
            🔍
          </Text>

          <TextInput
            style={estilos.inputBusca}
            placeholder="Cidade, bairro ou tipo de imóvel..."
            placeholderTextColor="#888"
            value={busca}
            onChangeText={setBusca}
          />

        </View>


        {/* ================================================
            FILTROS
        ================================================= */}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={estilos.filtros}
        >

          {[
            'Todos',
            'Venda',
            'Locação',
          ].map((item) => (

            <TouchableOpacity
              key={item}
              style={[
                estilos.filtro,
                filtro === item &&
                estilos.filtroAtivo,
              ]}
              onPress={() => setFiltro(item)}
            >

              <Text
                style={[
                  estilos.textoFiltro,
                  filtro === item &&
                  estilos.textoFiltroAtivo,
                ]}
              >
                {item}
              </Text>

            </TouchableOpacity>

          ))}

        </ScrollView>


        {/* ================================================
            IMÓVEIS
        ================================================= */}

        <View style={estilos.tituloSecao}>

          <View>

            <Text style={estilos.tituloSecaoTexto}>
              Imóveis disponíveis
            </Text>

            <Text style={estilos.subtituloSecao}>
              Encontre uma oportunidade
            </Text>

          </View>


          <Text style={estilos.quantidade}>
            {imoveisFiltrados.length}
          </Text>

        </View>


        {/* CARREGANDO */}

        {carregando && (

          <View style={estilos.carregando}>

            <ActivityIndicator
              size="large"
              color="#C9A86A"
            />

            <Text style={estilos.textoCarregando}>
              Buscando imóveis...
            </Text>

          </View>

        )}


        {/* ================================================
            LISTA DE IMÓVEIS
        ================================================= */}

        {!carregando &&
          imoveisFiltrados.map((imovel) => {

            const imagem = pegarImagem(imovel);


            return (

              <TouchableOpacity
                key={imovel.id}
                style={estilos.card}
                activeOpacity={0.9}
                onPress={() =>
                  navigation?.navigate(
                    'DetalhesImovel',
                    {
                      imovel: imovel,
                    }
                  )
                }
              >


                {/* FOTO */}

                {imagem ? (

                  <Image
                    source={imagem}
                    style={estilos.imagemImovel}
                  />

                ) : (

                  <View
                    style={estilos.imagemSemFoto}
                  >

                    <Text style={estilos.iconeCasa}>
                      🏠
                    </Text>

                    <Text style={estilos.semFoto}>
                      Imagem não disponível
                    </Text>

                  </View>

                )}


                {/* FINALIDADE */}

                <View style={estilos.etiqueta}>

                  <Text style={estilos.textoEtiqueta}>
                    {imovel.finalidade || 'Imóvel'}
                  </Text>

                </View>


                {/* INFORMAÇÕES */}

                <View style={estilos.informacoes}>

                  <Text style={estilos.tipo}>
                    {imovel.tipo || 'Imóvel'}
                  </Text>


                  <Text style={estilos.nomeImovel}>
                    {imovel.titulo || 'Imóvel disponível'}
                  </Text>


                  <Text style={estilos.localizacao}>
                    📍 {imovel.cidade || 'Localização não informada'}
                    {imovel.bairro
                      ? ` • ${imovel.bairro}`
                      : ''}
                  </Text>


                  {/* CARACTERÍSTICAS */}

                  <View style={estilos.caracteristicas}>

                    {imovel.quartos != null && (

                      <Text style={estilos.caracteristica}>
                        🛏 {imovel.quartos} quartos
                      </Text>

                    )}


                    {imovel.banheiros != null && (

                      <Text style={estilos.caracteristica}>
                        🚿 {imovel.banheiros} banheiros
                      </Text>

                    )}


                    {imovel.vagas != null && (

                      <Text style={estilos.caracteristica}>
                        🚗 {imovel.vagas} vagas
                      </Text>

                    )}


                    {imovel.area != null && (

                      <Text style={estilos.caracteristica}>
                        📐 {imovel.area} m²
                      </Text>

                    )}

                  </View>


                  {/* PREÇO */}

                  <View style={estilos.rodapeCard}>

                    <Text style={estilos.preco}>
                      {formatarPreco(imovel.preco)}
                    </Text>


                    <View style={estilos.botaoDetalhes}>

                      <Text style={estilos.textoDetalhes}>
                        VER
                      </Text>

                    </View>

                  </View>

                </View>

              </TouchableOpacity>

            );

          })}


        {/* ================================================
            NENHUM IMÓVEL
        ================================================= */}

        {!carregando &&
          imoveisFiltrados.length === 0 && (

            <View style={estilos.semResultado}>

              <Text style={estilos.iconeSemResultado}>
                🏠
              </Text>

              <Text style={estilos.tituloSemResultado}>
                Nenhum imóvel encontrado
              </Text>

              <Text style={estilos.textoSemResultado}>
                Ainda não existem imóveis publicados
                com esses critérios.
              </Text>

            </View>

          )}


        {/* ================================================
            SERVIÇOS A2 IMÓVEIS
        ================================================= */}

        <View style={estilos.servicos}>

          <Text style={estilos.tituloServicos}>
            Soluções A2 Imóveis
          </Text>

          <Text style={estilos.subtituloServicos}>
            Tudo para ajudar você a realizar seu projeto.
          </Text>


          {/* TERRENO + CONSTRUÇÃO */}

          <TouchableOpacity
            style={estilos.servicoCard}
            onPress={() =>
              navigation?.navigate('TerrenoConstrucao')
            }
          >

            <View style={estilos.iconeServico}>
              <Text>🏗️</Text>
            </View>

            <View style={estilos.servicoTexto}>

              <Text style={estilos.servicoTitulo}>
                Terreno + Construção
              </Text>

              <Text style={estilos.servicoDescricao}>
                Encontre terrenos e conheça opções
                de construção financiada pela Caixa.
              </Text>

            </View>

            <Text style={estilos.setaServico}>
              ›
            </Text>

          </TouchableOpacity>


          {/* AVALIAÇÃO */}

          <TouchableOpacity
            style={estilos.servicoCard}
            onPress={() =>
              navigation?.navigate('AvaliacaoImovel')
            }
          >

            <View style={estilos.iconeServico}>
              <Text>📊</Text>
            </View>

            <View style={estilos.servicoTexto}>

              <Text style={estilos.servicoTitulo}>
                Avaliação de imóveis
              </Text>

              <Text style={estilos.servicoDescricao}>
                Solicite uma avaliação e uma
                estimativa de custos de construção.
              </Text>

            </View>

            <Text style={estilos.setaServico}>
              ›
            </Text>

          </TouchableOpacity>


          {/* VISITAS */}

          <TouchableOpacity
            style={estilos.servicoCard}
            onPress={() => {
              if (isGuest) {
                Alert.alert('Atenção', 'Faça login para agendar uma visita.');
                return;
              }
              navigation?.navigate('AgendarVisita');
            }}
          >

            <View style={estilos.iconeServico}>
              <Text>📅</Text>
            </View>

            <View style={estilos.servicoTexto}>

              <Text style={estilos.servicoTitulo}>
                Agende uma visita
              </Text>

              <Text style={estilos.servicoDescricao}>
                Escolha um imóvel e agende seu
                melhor horário para conhecê-lo.
              </Text>

            </View>

            <Text style={estilos.setaServico}>
              ›
            </Text>

          </TouchableOpacity>


          {/* ATENDIMENTO */}

          <TouchableOpacity
            style={estilos.servicoCard}
            onPress={() => {
              if (isGuest) {
                Alert.alert('Atenção', 'Faça login para acessar este serviço.');
                return;
              }
              navigation?.navigate('Atendimento');
            }}
          >

            <View style={estilos.iconeServico}>
              <Text>💬</Text>
            </View>

            <View style={estilos.servicoTexto}>

              <Text style={estilos.servicoTitulo}>
                Fale com um corretor
              </Text>

              <Text style={estilos.servicoDescricao}>
                Tire dúvidas, faça propostas e
                negocie diretamente com nossa equipe.
              </Text>

            </View>

            <Text style={estilos.setaServico}>
              ›
            </Text>

          </TouchableOpacity>

        </View>

        {/* ================================================
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
    backgroundColor: 'rgba(0,0,0,0.55)',
  },


  scroll: {
    flex: 1,
  },


  conteudo: {
    padding: 22,
    paddingTop: 55,
    paddingBottom: 60,
  },


  /* TOPO */

  topo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 35,
  },


  logo: {
    color: '#C9A86A',
    fontSize: 25,
    fontWeight: '900',
    letterSpacing: 3,
  },


  logoBranco: {
    color: '#fff',
  },


  slogan: {
    color: '#C9A86A',
    fontSize: 8,
    fontWeight: 'bold',
    letterSpacing: 3,
    marginTop: 3,
  },


  botaoPerfil: {
    width: 46,
    height: 46,
    borderRadius: 25,
    backgroundColor: 'rgba(20,20,20,0.9)',
    borderWidth: 1,
    borderColor: 'rgba(201,168,106,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },


  iconePerfil: {
    fontSize: 19,
  },


  /* APRESENTAÇÃO */

  apresentacao: {
    marginBottom: 22,
  },


  titulo: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 34,
  },


  subtitulo: {
    color: '#aaa',
    fontSize: 14,
    marginTop: 8,
  },


  /* BUSCA */

  busca: {
    height: 56,
    backgroundColor: 'rgba(20,20,20,0.9)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(201,168,106,0.25)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },


  iconeBusca: {
    fontSize: 18,
    marginRight: 10,
  },


  inputBusca: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
  },


  /* FILTROS */

  filtros: {
    marginTop: 16,
    marginBottom: 25,
  },


  filtro: {
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 30,
    backgroundColor: 'rgba(20,20,20,0.9)',
    borderWidth: 1,
    borderColor: '#444',
    marginRight: 10,
  },


  filtroAtivo: {
    backgroundColor: '#C9A86A',
    borderColor: '#C9A86A',
  },


  textoFiltro: {
    color: '#aaa',
    fontSize: 13,
    fontWeight: '600',
  },


  textoFiltroAtivo: {
    color: '#111',
  },


  /* TÍTULO IMÓVEIS */

  tituloSecao: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },


  tituloSecaoTexto: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },


  subtituloSecao: {
    color: '#777',
    fontSize: 11,
    marginTop: 4,
  },


  quantidade: {
    color: '#C9A86A',
    fontSize: 16,
    fontWeight: '700',
  },


  /* CARREGANDO */

  carregando: {
    alignItems: 'center',
    paddingVertical: 60,
  },


  textoCarregando: {
    color: '#999',
    marginTop: 12,
    fontSize: 13,
  },


  /* CARD */

  card: {
    backgroundColor: 'rgba(18,18,18,0.95)',
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 22,
    borderWidth: 1,
    borderColor: 'rgba(201,168,106,0.18)',
  },


  imagemImovel: {
    width: '100%',
    height: 210,
  },


  imagemSemFoto: {
    width: '100%',
    height: 210,
    backgroundColor: '#1b1b1b',
    justifyContent: 'center',
    alignItems: 'center',
  },


  iconeCasa: {
    fontSize: 42,
    marginBottom: 8,
  },


  semFoto: {
    color: '#666',
    fontSize: 12,
  },


  etiqueta: {
    position: 'absolute',
    top: 15,
    left: 15,
    backgroundColor: '#C9A86A',
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 20,
  },


  textoEtiqueta: {
    color: '#111',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },


  informacoes: {
    padding: 18,
  },


  tipo: {
    color: '#C9A86A',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },


  nomeImovel: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginTop: 5,
  },


  localizacao: {
    color: '#999',
    fontSize: 13,
    marginTop: 8,
  },


  caracteristicas: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#292929',
  },


  caracteristica: {
    color: '#aaa',
    fontSize: 11,
    marginRight: 14,
    marginBottom: 5,
  },


  rodapeCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
  },


  preco: {
    color: '#C9A86A',
    fontSize: 19,
    fontWeight: '800',
  },


  botaoDetalhes: {
    backgroundColor: '#C9A86A',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
  },


  textoDetalhes: {
    color: '#111',
    fontSize: 10,
    fontWeight: '800',
  },


  /* SEM RESULTADO */

  semResultado: {
    alignItems: 'center',
    paddingVertical: 45,
    paddingHorizontal: 20,
  },


  iconeSemResultado: {
    fontSize: 42,
    marginBottom: 12,
  },


  tituloSemResultado: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },


  textoSemResultado: {
    color: '#777',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 19,
  },


  /* SERVIÇOS */

  servicos: {
    marginTop: 25,
  },


  tituloServicos: {
    color: '#fff',
    fontSize: 21,
    fontWeight: '700',
  },


  subtituloServicos: {
    color: '#777',
    fontSize: 12,
    marginTop: 5,
    marginBottom: 16,
  },


  servicoCard: {
    backgroundColor: 'rgba(20,20,20,0.92)',
    borderWidth: 1,
    borderColor: 'rgba(201,168,106,0.15)',
    borderRadius: 15,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },


  iconeServico: {
    width: 43,
    height: 43,
    borderRadius: 22,
    backgroundColor: 'rgba(201,168,106,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },


  servicoTexto: {
    flex: 1,
    marginLeft: 13,
  },


  servicoTitulo: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },


  servicoDescricao: {
    color: '#888',
    fontSize: 11,
    lineHeight: 17,
    marginTop: 4,
  },


  setaServico: {
    color: '#C9A86A',
    fontSize: 25,
    marginLeft: 8,
  },


  /* RODAPÉ */

  rodape: {
    alignItems: 'center',
    marginTop: 35,
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