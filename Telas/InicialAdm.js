import React from 'react';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  ScrollView,
} from 'react-native';


export default function InicialAdm({ navigation }) {

  const abrirTela = (tela) => {
    navigation?.navigate(tela);
  };


  return (

    <ImageBackground
      source={require('../Imagens/InicialAdm.png')}
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
        <View style={estilos.cabecalho}>

          <Text style={estilos.logo}>
            A2 <Text style={estilos.logoBranco}>IMÓVEIS</Text>
          </Text>


          <Text style={estilos.slogan}>
            REALIZANDO SONHOS
          </Text>


          <View style={estilos.linha} />


          <Text style={estilos.titulo}>
            ADMINISTRADOR
          </Text>

        </View>


        <View style={estilos.menu}>

          <TouchableOpacity
            style={estilos.botao}
            activeOpacity={0.8}
            onPress={() => abrirTela('CadastroAdm')}
          >

            <View style={estilos.iconeContainer}>

              <Text style={estilos.icone}>
                📋
              </Text>

            </View>


            <View style={estilos.textoContainer}>

              <Text style={estilos.tituloBotao}>
                Cadastrar Proprietário
              </Text>

              <Text style={estilos.descricao}>
                Cadastre novos proprietários
              </Text>

            </View>


            <Text style={estilos.seta}>
              ›
            </Text>

          </TouchableOpacity>

          <TouchableOpacity
            style={estilos.botao}
            activeOpacity={0.8}
            onPress={() => abrirTela('Tela2')}
          >

            <View style={estilos.iconeContainer}>

              <Text style={estilos.icone}>
                👥
              </Text>

            </View>


            <View style={estilos.textoContainer}>

              <Text style={estilos.tituloBotao}>
                OPÇÃO 2
              </Text>

              <Text style={estilos.descricao}>
                Veja e organize dados
                de forma prática.
              </Text>

            </View>


            <Text style={estilos.seta}>
              ›
            </Text>

          </TouchableOpacity>

          <TouchableOpacity
            style={estilos.botao}
            activeOpacity={0.8}
            onPress={() => abrirTela('Tela3')}
          >

            <View style={estilos.iconeContainer}>

              <Text style={estilos.icone}>
                📋
              </Text>

            </View>


            <View style={estilos.textoContainer}>

              <Text style={estilos.tituloBotao}>
                OPÇÃO 3
              </Text>

              <Text style={estilos.descricao}>
                Controle e acompanhe
                suas operações.
              </Text>

            </View>


            <Text style={estilos.seta}>
              ›
            </Text>

          </TouchableOpacity>

          <TouchableOpacity
            style={estilos.botao}
            activeOpacity={0.8}
            onPress={() => abrirTela('Tela4')}
          >

            <View style={estilos.iconeContainer}>

              <Text style={estilos.icone}>
                ⚙️
              </Text>

            </View>


            <View style={estilos.textoContainer}>

              <Text style={estilos.tituloBotao}>
                OPÇÃO 4
              </Text>

              <Text style={estilos.descricao}>
                Ajustes e configurações
                do sistema.
              </Text>

            </View>


            <Text style={estilos.seta}>
              ›
            </Text>

          </TouchableOpacity>


        </View>

        <View style={estilos.rodape}>

          <View style={estilos.iconeRodape}>

            <Text style={estilos.casaRodape}>
              ⌂
            </Text>

          </View>


          <View style={estilos.linhaRodape} />


          <Text style={estilos.textoRodape}>
            GESTÃO • ORGANIZAÇÃO • RESULTADOS
          </Text>

        </View>


      </ScrollView>

    </ImageBackground>
  );
}


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
    backgroundColor: 'rgba(0, 0, 0, 0.42)',
  },


  scroll: {
    flex: 1,
  },


  conteudo: {
    paddingHorizontal: 22,
    paddingTop: 55,
    paddingBottom: 45,
  },


  cabecalho: {
    alignItems: 'center',
    marginBottom: 28,
  },


  logo: {
    color: '#C9A86A',
    fontSize: 38,
    fontWeight: '900',
    letterSpacing: 3,
  },


  logoBranco: {
    color: '#fff',
    fontWeight: '500',
  },


  slogan: {
    color: '#C9A86A',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 4,
    marginTop: 5,
  },


  linha: {
    width: 80,
    height: 2,
    backgroundColor: '#C9A86A',
    marginTop: 22,
    marginBottom: 16,
  },


  titulo: {
    color: '#C9A86A',
    fontSize: 25,
    fontWeight: '700',
    letterSpacing: 3,
  },


  menu: {
    width: '100%',
  },


  botao: {
    minHeight: 125,

    backgroundColor: 'rgba(18, 18, 18, 0.91)',

    borderWidth: 1,
    borderColor: '#C9A86A',

    borderRadius: 20,

    flexDirection: 'row',
    alignItems: 'center',

    paddingHorizontal: 16,
    paddingVertical: 15,

    marginBottom: 14,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.35,
    shadowRadius: 8,

    elevation: 5,
  },

  iconeContainer: {
    width: 68,
    height: 68,

    borderRadius: 15,

    borderWidth: 1,
    borderColor: '#C9A86A',

    backgroundColor: 'rgba(201, 168, 106, 0.08)',

    alignItems: 'center',
    justifyContent: 'center',
  },


  icone: {
    fontSize: 31,
  },

  textoContainer: {
    flex: 1,
    marginLeft: 17,
    paddingRight: 8,
  },


  tituloBotao: {
    color: '#fff',
    fontSize: 19,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 7,
  },


  descricao: {
    color: '#999',
    fontSize: 12,
    lineHeight: 18,
  },


  seta: {
    color: '#C9A86A',
    fontSize: 42,
    fontWeight: '200',
    marginLeft: 5,
  },


  rodape: {
    alignItems: 'center',
    marginTop: 22,
    paddingTop: 10,
  },


  iconeRodape: {
    width: 50,
    height: 35,
    alignItems: 'center',
    justifyContent: 'center',
  },


  casaRodape: {
    color: '#C9A86A',
    fontSize: 38,
    fontWeight: '200',
  },


  linhaRodape: {
    width: 180,
    height: 1,
    backgroundColor: '#C9A86A',
    marginTop: 2,
    marginBottom: 13,
  },


  textoRodape: {
    color: '#C9A86A',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 2,
    textAlign: 'center',
  },

});