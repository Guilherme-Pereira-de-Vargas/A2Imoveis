import { useState } from 'react';

import {
View,
Text,
StyleSheet,
TextInput,
TouchableOpacity,
ImageBackground,
ScrollView,
ActivityIndicator,
} from 'react-native';

import {
collection,
getDocs,
} from 'firebase/firestore';

import { database } from '../firebaseConfig';

export default function CadastroAdm({ navigation }) {

const [busca, setBusca] = useState('');
const [buscando, setBuscando] = useState(false);
const [usuarios, setUsuarios] = useState([]);
const [pesquisou, setPesquisou] = useState(false);

// =====================================================
// BUSCAR USUÁRIOS
// =====================================================

const buscarUsuarios = async () => {

if (!busca.trim()) {

  setUsuarios([]);
  setPesquisou(false);

  return;
}


try {

  setBuscando(true);
  setPesquisou(true);


  const usuariosRef =
    collection(database, 'usuarios');


  const snap =
    await getDocs(usuariosRef);


  const textoBusca =
    busca.trim().toLowerCase();


  const lista = [];


  snap.forEach((documento) => {

    const dados =
      documento.data();


    const nome =
      String(dados.nome || '')
        .toLowerCase();


    const email =
      String(dados.email || '')
        .toLowerCase();


    const telefone =
      String(dados.telefone || '')
        .toLowerCase();


    const correspondeNome =
      nome.includes(textoBusca);


    const correspondeEmail =
      email.includes(textoBusca);


    const correspondeTelefone =
      telefone.includes(textoBusca);


    if (
      correspondeNome ||
      correspondeEmail ||
      correspondeTelefone
    ) {

      lista.push({
        id: documento.id,
        ...dados,
      });

    }

  });


  // Ordena por nome
  lista.sort((a, b) => {

    const nomeA =
      String(a.nome || '').toLowerCase();

    const nomeB =
      String(b.nome || '').toLowerCase();


    return nomeA.localeCompare(nomeB);

  });


  setUsuarios(lista);


} catch (erro) {

  console.log(
    'ERRO AO BUSCAR USUÁRIOS:',
    erro
  );

} finally {

  setBuscando(false);

}

};

// =====================================================
// LIMPAR PESQUISA
// =====================================================

const limparBusca = () => {

setBusca('');
setUsuarios([]);
setPesquisou(false);

};

// =====================================================
// ABRIR USUÁRIO
// =====================================================

const abrirUsuario = (usuario) => {

navigation.navigate(
  'DetalhesUsuario',
  {
    usuarioId: usuario.id,
    dados: usuario,
  }
);

};

// =====================================================
// TIPO DO USUÁRIO
// =====================================================

const mostrarTipoUsuario = (usuario) => {

const tipo =
  String(
    usuario.tipo ||
    usuario.role ||
    usuario.perfil ||
    ''
  ).toLowerCase();


if (
  tipo === 'proprietario' ||
  tipo === 'proprietário'
) {

  return 'PROPRIETÁRIO';

}


if (tipo === 'corretor') {

  return 'CORRETOR';

}


if (tipo === 'admin' ||
    tipo === 'administrador') {

  return 'ADMINISTRADOR';

}


return 'CLIENTE';

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
    contentContainerStyle={estilos.conteudo}
    keyboardShouldPersistTaps="handled"
    showsVerticalScrollIndicator={false}
  >


    {/* =================================================
        VOLTAR
    ================================================= */}

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


    {/* =================================================
        CABEÇALHO
    ================================================= */}

    <View style={estilos.cabecalho}>

      <Text style={estilos.icone}>
        👤
      </Text>


      <Text style={estilos.titulo}>
        PESQUISAR
        <Text style={estilos.tituloClaro}>
          {' '}USUÁRIOS
        </Text>
      </Text>


      <Text style={estilos.subtituloMarca}>
        A2 IMÓVEIS
      </Text>


      <Text style={estilos.textoExplicacao}>
        Encontre clientes, proprietários e corretores
        cadastrados no sistema.
      </Text>

    </View>


    {/* =================================================
        PESQUISA
    ================================================= */}

    <View style={estilos.cardBusca}>

      <Text style={estilos.rotulo}>
        PESQUISAR USUÁRIO
      </Text>


      <View style={estilos.containerInput}>

        <Text style={estilos.iconeBusca}>
          🔍
        </Text>


        <TextInput
          style={estilos.input}
          placeholder="Nome, e-mail ou telefone"
          placeholderTextColor="#777"
          value={busca}
          onChangeText={setBusca}
          autoCapitalize="none"
          onSubmitEditing={buscarUsuarios}
          returnKeyType="search"
        />


        {busca.length > 0 && (

          <TouchableOpacity
            style={estilos.botaoLimpar}
            onPress={limparBusca}
          >

            <Text style={estilos.textoLimpar}>
              ×
            </Text>

          </TouchableOpacity>

        )}

      </View>


      <Text style={estilos.dica}>
        Você pode pesquisar apenas uma parte do nome,
        e-mail ou telefone.
      </Text>


      <TouchableOpacity
        style={[
          estilos.botaoBuscar,
          buscando &&
          estilos.botaoDesabilitado,
        ]}
        onPress={buscarUsuarios}
        disabled={buscando}
      >

        {buscando ? (

          <View style={estilos.carregando}>

            <ActivityIndicator
              color="#111"
              size="small"
            />

            <Text style={estilos.textoBotao}>
              BUSCANDO...
            </Text>

          </View>

        ) : (

          <Text style={estilos.textoBotao}>
            BUSCAR USUÁRIO
          </Text>

        )}

      </TouchableOpacity>

    </View>


    {/* =================================================
        RESULTADOS
    ================================================= */}

    {buscando && (

      <View style={estilos.estado}>

        <ActivityIndicator
          size="large"
          color="#C9A86A"
        />

        <Text style={estilos.textoEstado}>
          Procurando usuários...
        </Text>

      </View>

    )}


    {!buscando &&
      pesquisou &&
      usuarios.length > 0 && (

        <View style={estilos.resultados}>

          <View style={estilos.cabecalhoResultados}>

            <View>

              <Text style={estilos.tituloResultados}>
                Usuários encontrados
              </Text>

              <Text style={estilos.subtituloResultados}>
                Toque em um usuário para ver os detalhes.
              </Text>

            </View>


            <View style={estilos.contador}>

              <Text style={estilos.textoContador}>
                {usuarios.length}
              </Text>

            </View>

          </View>


          {usuarios.map((usuario) => (

            <TouchableOpacity
              key={usuario.id}
              style={estilos.cardUsuario}
              activeOpacity={0.8}
              onPress={() =>
                abrirUsuario(usuario)
              }
            >

              {/* AVATAR */}

              <View style={estilos.avatar}>

                <Text style={estilos.textoAvatar}>
                  {String(
                    usuario.nome ||
                    '?'
                  )
                    .charAt(0)
                    .toUpperCase()}
                </Text>

              </View>


              {/* INFORMAÇÕES */}

              <View style={estilos.informacoesUsuario}>

                <Text
                  style={estilos.nomeUsuario}
                  numberOfLines={1}
                >
                  {usuario.nome ||
                    'Nome não informado'}
                </Text>


                <Text
                  style={estilos.emailUsuario}
                  numberOfLines={1}
                >
                  {usuario.email ||
                    'E-mail não informado'}
                </Text>


                {usuario.telefone && (

                  <Text
                    style={estilos.telefoneUsuario}
                    numberOfLines={1}
                  >
                    📱 {usuario.telefone}
                  </Text>

                )}


                <View style={estilos.linhaTipo}>

                  <Text style={estilos.tipoUsuario}>
                    {mostrarTipoUsuario(usuario)}
                  </Text>

                </View>

              </View>


              {/* SETA */}

              <Text style={estilos.seta}>
                ›
              </Text>

            </TouchableOpacity>

          ))}

        </View>

      )}


    {/* =================================================
        NENHUM RESULTADO
    ================================================= */}

    {!buscando &&
      pesquisou &&
      usuarios.length === 0 && (

        <View style={estilos.semResultado}>

          <Text style={estilos.iconeSemResultado}>
            🔎
          </Text>


          <Text style={estilos.tituloSemResultado}>
            Nenhum usuário encontrado
          </Text>


          <Text style={estilos.textoSemResultado}>
            Não encontramos nenhum usuário
            com esse nome, e-mail ou telefone.
          </Text>

        </View>

      )}


    {/* =================================================
        TEXTO INICIAL
    ================================================= */}

    {!pesquisou && (

      <View style={estilos.estadoInicial}>

        <Text style={estilos.iconeInicial}>
          👥
        </Text>


        <Text style={estilos.tituloInicial}>
          Pesquise um usuário
        </Text>


        <Text style={estilos.textoInicial}>
          Digite o nome, e-mail ou telefone
          para encontrar usuários cadastrados.
        </Text>

      </View>

    )}


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

overlay: {
...StyleSheet.absoluteFillObject,
backgroundColor: 'rgba(0, 0, 0, 0.60)',
},

scroll: {
flex: 1,
},

conteudo: {
padding: 22,
paddingTop: 55,
paddingBottom: 60,
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
zIndex: 10,
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
marginTop: 15,
},

icone: {
fontSize: 40,
marginBottom: 8,
},

titulo: {
color: '#C9A86A',
fontSize: 27,
fontWeight: 'bold',
letterSpacing: 2,
textAlign: 'center',
},

tituloClaro: {
color: '#fff',
},

subtituloMarca: {
color: '#C9A86A',
fontSize: 10,
fontWeight: 'bold',
letterSpacing: 4,
marginTop: 5,
},

textoExplicacao: {
color: '#888',
fontSize: 12,
textAlign: 'center',
lineHeight: 18,
marginTop: 13,
maxWidth: 320,
},

/* =================================================
CARD BUSCA
================================================= */

cardBusca: {
width: '100%',
backgroundColor: 'rgba(15,15,15,0.94)',
borderRadius: 18,
padding: 18,
borderWidth: 1,
borderColor: 'rgba(201,168,106,0.25)',
marginBottom: 20,
},

rotulo: {
color: '#C9A86A',
fontSize: 11,
fontWeight: 'bold',
letterSpacing: 1.5,
marginBottom: 9,
},

containerInput: {
height: 54,
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

input: {
flex: 1,
height: '100%',
color: '#fff',
fontSize: 14,
},

botaoLimpar: {
width: 28,
height: 28,
borderRadius: 14,
backgroundColor: '#292929',
justifyContent: 'center',
alignItems: 'center',
},

textoLimpar: {
color: '#aaa',
fontSize: 20,
lineHeight: 22,
},

dica: {
color: '#666',
fontSize: 10,
marginTop: 8,
lineHeight: 15,
},

botaoBuscar: {
height: 48,
borderRadius: 25,
backgroundColor: '#C9A86A',
alignItems: 'center',
justifyContent: 'center',
marginTop: 15,
},

botaoDesabilitado: {
opacity: 0.6,
},

carregando: {
flexDirection: 'row',
alignItems: 'center',
},

textoBotao: {
color: '#111',
fontSize: 12,
fontWeight: '900',
letterSpacing: 1,
marginLeft: 9,
},

/* =================================================
RESULTADOS
================================================= */

resultados: {
width: '100%',
},

cabecalhoResultados: {
flexDirection: 'row',
justifyContent: 'space-between',
alignItems: 'center',
marginBottom: 12,
},

tituloResultados: {
color: '#fff',
fontSize: 18,
fontWeight: '700',
},

subtituloResultados: {
color: '#777',
fontSize: 10,
marginTop: 4,
},

contador: {
minWidth: 34,
height: 34,
paddingHorizontal: 8,
borderRadius: 17,
backgroundColor: 'rgba(201,168,106,0.15)',
borderWidth: 1,
borderColor: 'rgba(201,168,106,0.3)',
justifyContent: 'center',
alignItems: 'center',
},

textoContador: {
color: '#C9A86A',
fontSize: 13,
fontWeight: '800',
},

/* =================================================
CARD USUÁRIO
================================================= */

cardUsuario: {
width: '100%',
backgroundColor: 'rgba(18,18,18,0.95)',
borderRadius: 16,
borderWidth: 1,
borderColor: 'rgba(201,168,106,0.16)',
padding: 15,
marginBottom: 10,
flexDirection: 'row',
alignItems: 'center',
},

avatar: {
width: 52,
height: 52,
borderRadius: 26,
backgroundColor: 'rgba(201,168,106,0.16)',
borderWidth: 1,
borderColor: 'rgba(201,168,106,0.35)',
alignItems: 'center',
justifyContent: 'center',
},

textoAvatar: {
color: '#C9A86A',
fontSize: 21,
fontWeight: '800',
},

informacoesUsuario: {
flex: 1,
marginLeft: 13,
},

nomeUsuario: {
color: '#fff',
fontSize: 15,
fontWeight: '700',
},

emailUsuario: {
color: '#999',
fontSize: 11,
marginTop: 4,
},

telefoneUsuario: {
color: '#777',
fontSize: 10,
marginTop: 4,
},

linhaTipo: {
flexDirection: 'row',
marginTop: 7,
},

tipoUsuario: {
color: '#C9A86A',
fontSize: 9,
fontWeight: '800',
letterSpacing: 1,
},

seta: {
color: '#C9A86A',
fontSize: 29,
marginLeft: 7,
},

/* =================================================
ESTADOS
================================================= */

estado: {
alignItems: 'center',
paddingVertical: 35,
},

textoEstado: {
color: '#777',
fontSize: 12,
marginTop: 10,
},

semResultado: {
backgroundColor: 'rgba(18,18,18,0.9)',
borderRadius: 18,
borderWidth: 1,
borderColor: '#292929',
alignItems: 'center',
padding: 30,
marginTop: 5,
},

iconeSemResultado: {
fontSize: 35,
marginBottom: 10,
},

tituloSemResultado: {
color: '#fff',
fontSize: 16,
fontWeight: '700',
},

textoSemResultado: {
color: '#777',
fontSize: 11,
textAlign: 'center',
lineHeight: 17,
marginTop: 7,
},

estadoInicial: {
alignItems: 'center',
paddingVertical: 35,
paddingHorizontal: 20,
},

iconeInicial: {
fontSize: 38,
marginBottom: 10,
},

tituloInicial: {
color: '#fff',
fontSize: 16,
fontWeight: '700',
},

textoInicial: {
color: '#777',
fontSize: 11,
lineHeight: 17,
textAlign: 'center',
marginTop: 7,
maxWidth: 300,
},

});