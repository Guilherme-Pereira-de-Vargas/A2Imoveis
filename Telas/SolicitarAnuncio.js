import { useState } from 'react';

import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';

import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import * as Print from 'expo-print';
import * as FileSystem from 'expo-file-system/legacy';

import {
  collection,
  doc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';

import {
  getAuth,
} from 'firebase/auth';

import {
  ref,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';

import { database, storage } from '../firebaseConfig';


export default function SolicitarAnuncio({ navigation }) {

  const [titulo, setTitulo] = useState('');
  const [tipo, setTipo] = useState('');
  const [finalidade, setFinalidade] = useState('');
  const [cidade, setCidade] = useState('');
  const [bairro, setBairro] = useState('');
  const [endereco, setEndereco] = useState('');

  const [quartos, setQuartos] = useState('');
  const [banheiros, setBanheiros] = useState('');
  const [vagas, setVagas] = useState('');
  const [area, setArea] = useState('');
  const [preco, setPreco] = useState('');
  const [descricao, setDescricao] = useState('');

  const [telefone, setTelefone] = useState('');

  // ARQUIVOS
  const [comprovante, setComprovante] = useState(null);
  const [fotos, setFotos] = useState([]);
  const [enviando, setEnviando] = useState(false);


  // =====================================================
  // SELECIONAR COMPROVANTE DE RESIDÊNCIA (PDF OU IMAGEM)
  // =====================================================
  const selecionarComprovante = async () => {
    try {
      const resultado = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (resultado.canceled) {
        return;
      }

      const arquivo = resultado.assets[0];
      setComprovante(arquivo);

    } catch (erro) {
      console.log('ERRO AO SELECIONAR COMPROVANTE:', erro);
      Alert.alert('Erro', 'Não foi possível selecionar o comprovante.');
    }
  };


  // =====================================================
  // SELECIONAR FOTOS
  // =====================================================
  const selecionarFotos = async () => {
    try {
      const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissao.granted) {
        Alert.alert(
          'Permissão necessária',
          'Precisamos de acesso à galeria para selecionar as fotos do imóvel.'
        );
        return;
      }

      const resultado = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        selectionLimit: 20,
      });

      if (resultado.canceled) {
        return;
      }

      setFotos(resultado.assets);

    } catch (erro) {
      console.log('ERRO AO SELECIONAR FOTOS:', erro);
      Alert.alert('Erro', 'Não foi possível selecionar as fotos.');
    }
  };


  // =====================================================
  // TRANSFORMAR FOTOS EM PDF
  // =====================================================
  const criarPdfDasFotos = async () => {
    let imagensHTML = '';

    for (const foto of fotos) {
      try {
        const base64 = await FileSystem.readAsStringAsync(
          foto.uri,
          {
            encoding: FileSystem.EncodingType.Base64,
          }
        );

        imagensHTML += `
          <div class="pagina">
            <img src="data:image/jpeg;base64,${base64}" />
          </div>
        `;
      } catch (erro) {
        console.log('ERRO AO CONVERTER FOTO:', erro);
      }
    }

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            @page { margin: 0; }
            body { margin: 0; padding: 0; background: white; }
            .pagina {
              width: 100%;
              height: 100vh;
              display: flex;
              justify-content: center;
              align-items: center;
              page-break-after: always;
            }
            img {
              max-width: 95%;
              max-height: 95%;
              object-fit: contain;
            }
          </style>
        </head>
        <body>
          ${imagensHTML}
        </body>
      </html>
    `;

    const pdf = await Print.printToFileAsync({ html });
    return pdf.uri;
  };


  // =====================================================
  // CONVERTER URI PARA BLOB
  // =====================================================
  const uriParaBlob = async (uri) => {
    const resposta = await fetch(uri);
    const blob = await resposta.blob();
    return blob;
  };


  // =====================================================
  // ENVIAR ARQUIVO PARA FIREBASE STORAGE
  // =====================================================
  const enviarArquivo = async (uri, caminho, mimeType = 'application/pdf') => {
    const blob = await uriParaBlob(uri);
    const referencia = ref(storage, caminho);

    await uploadBytes(referencia, blob, {
      contentType: mimeType,
    });

    const url = await getDownloadURL(referencia);
    return url;
  };


  // =====================================================
  // ENVIAR SOLICITAÇÃO
  // =====================================================
  const enviarSolicitacao = async () => {
    if (
      !titulo.trim() ||
      !tipo.trim() ||
      !finalidade ||
      !cidade.trim() ||
      !preco.trim() ||
      !telefone.trim()
    ) {
      Alert.alert('Atenção', 'Preencha os campos obrigatórios.');
      return;
    }

    if (!comprovante) {
      Alert.alert('Atenção', 'Envie o comprovante de residência.');
      return;
    }

    if (fotos.length === 0) {
      Alert.alert('Atenção', 'Selecione pelo menos uma foto do imóvel.');
      return;
    }

    try {
      setEnviando(true);

      const auth = getAuth();
      const usuario = auth.currentUser;

      if (!usuario) {
        Alert.alert('Atenção', 'Você precisa estar logado para anunciar um imóvel.');
        return;
      }

      const referenciaSolicitacao = doc(collection(database, 'solicitacoes_anuncios'));
      const idSolicitacao = referenciaSolicitacao.id;

      // Determinar a extensão e MIME Type do comprovante
      const mimeComprovante = comprovante.mimeType || 'application/pdf';
      const extensaoComprovante = mimeComprovante.startsWith('image/')
        ? (mimeComprovante.split('/')[1] || 'jpg')
        : 'pdf';

      // Criar PDF das Fotos
      const fotosPdfUri = await criarPdfDasFotos();

      // Enviar Comprovante
      const comprovanteUrl = await enviarArquivo(
        comprovante.uri,
        `solicitacoes_anuncios/${idSolicitacao}/comprovante_residencia.${extensaoComprovante}`,
        mimeComprovante
      );

      // Enviar PDF das Fotos
      const fotosPdfUrl = await enviarArquivo(
        fotosPdfUri,
        `solicitacoes_anuncios/${idSolicitacao}/fotos_imovel.pdf`,
        'application/pdf'
      );

      // Salvar Firestore
      await setDoc(referenciaSolicitacao, {
        titulo: titulo.trim(),
        tipo: tipo.trim(),
        finalidade: finalidade,
        cidade: cidade.trim(),
        bairro: bairro.trim(),
        endereco: endereco.trim(),
        quartos: quartos ? Number(quartos) : null,
        banheiros: banheiros ? Number(banheiros) : null,
        vagas: vagas ? Number(vagas) : null,
        area: area ? Number(area) : null,
        preco: preco.trim(),
        descricao: descricao.trim(),
        telefone: telefone.trim(),
        proprietarioId: usuario.uid,
        proprietarioEmail: usuario.email || '',
        comprovanteResidenciaPdf: comprovanteUrl,
        fotosPdf: fotosPdfUrl,
        status: 'pendente',
        publicado: false,
        criadoEm: serverTimestamp(),
      });

      Alert.alert(
        'Solicitação enviada! 🏠',
        'Seu imóvel foi enviado para análise.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );

    } catch (erro) {
      console.log('ERRO AO ENVIAR SOLICITAÇÃO:', erro);
      Alert.alert('Erro', 'Não foi possível enviar a solicitação.');
    } finally {
      setEnviando(false);
    }
  };


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
        <TouchableOpacity
          style={estilos.botaoVoltar}
          onPress={() => navigation.goBack()}
        >
          <Text style={estilos.voltar}>‹</Text>
          <Text style={estilos.textoVoltar}>Voltar</Text>
        </TouchableOpacity>

        <View style={estilos.cabecalho}>
          <Text style={estilos.logo}>
            A2 <Text style={estilos.logoBranco}>IMÓVEIS</Text>
          </Text>
          <Text style={estilos.titulo}>Anuncie seu imóvel</Text>
          <Text style={estilos.subtitulo}>
            Preencha as informações abaixo e envie sua propriedade para nossa equipe.
          </Text>
        </View>

        <View style={estilos.secao}>
          <Text style={estilos.tituloSecao}>Dados do imóvel</Text>

          <Text style={estilos.label}>TÍTULO *</Text>
          <TextInput
            style={estilos.input}
            placeholder="Ex: Casa moderna no Centro"
            placeholderTextColor="#777"
            value={titulo}
            onChangeText={setTitulo}
          />

          <Text style={estilos.label}>TIPO DO IMÓVEL *</Text>
          <TextInput
            style={estilos.input}
            placeholder="Casa, apartamento, terreno..."
            placeholderTextColor="#777"
            value={tipo}
            onChangeText={setTipo}
          />

          <Text style={estilos.label}>FINALIDADE *</Text>
          <View style={estilos.opcoes}>
            <TouchableOpacity
              style={[
                estilos.opcao,
                finalidade === 'Venda' && estilos.opcaoSelecionada,
              ]}
              onPress={() => setFinalidade('Venda')}
            >
              <Text
                style={[
                  estilos.textoOpcao,
                  finalidade === 'Venda' && estilos.textoOpcaoSelecionada,
                ]}
              >
                Venda
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                estilos.opcao,
                finalidade === 'Locação' && estilos.opcaoSelecionada,
              ]}
              onPress={() => setFinalidade('Locação')}
            >
              <Text
                style={[
                  estilos.textoOpcao,
                  finalidade === 'Locação' && estilos.textoOpcaoSelecionada,
                ]}
              >
                Locação
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={estilos.label}>CIDADE *</Text>
          <TextInput
            style={estilos.input}
            placeholder="Ex: Criciúma"
            placeholderTextColor="#777"
            value={cidade}
            onChangeText={setCidade}
          />

          <Text style={estilos.label}>BAIRRO</Text>
          <TextInput
            style={estilos.input}
            placeholder="Ex: Centro"
            placeholderTextColor="#777"
            value={bairro}
            onChangeText={setBairro}
          />

          <Text style={estilos.label}>ENDEREÇO</Text>
          <TextInput
            style={estilos.input}
            placeholder="Rua, número..."
            placeholderTextColor="#777"
            value={endereco}
            onChangeText={setEndereco}
          />
        </View>

        <View style={estilos.secao}>
          <Text style={estilos.tituloSecao}>Características</Text>

          <View style={estilos.linhaInputs}>
            <View style={estilos.inputPequenoContainer}>
              <Text style={estilos.label}>QUARTOS</Text>
              <TextInput
                style={estilos.input}
                placeholder="0"
                placeholderTextColor="#777"
                keyboardType="numeric"
                value={quartos}
                onChangeText={setQuartos}
              />
            </View>

            <View style={estilos.inputPequenoContainer}>
              <Text style={estilos.label}>BANHEIROS</Text>
              <TextInput
                style={estilos.input}
                placeholder="0"
                placeholderTextColor="#777"
                keyboardType="numeric"
                value={banheiros}
                onChangeText={setBanheiros}
              />
            </View>
          </View>

          <View style={estilos.linhaInputs}>
            <View style={estilos.inputPequenoContainer}>
              <Text style={estilos.label}>VAGAS</Text>
              <TextInput
                style={estilos.input}
                placeholder="0"
                placeholderTextColor="#777"
                keyboardType="numeric"
                value={vagas}
                onChangeText={setVagas}
              />
            </View>

            <View style={estilos.inputPequenoContainer}>
              <Text style={estilos.label}>ÁREA (M²)</Text>
              <TextInput
                style={estilos.input}
                placeholder="Ex: 120"
                placeholderTextColor="#777"
                keyboardType="numeric"
                value={area}
                onChangeText={setArea}
              />
            </View>
          </View>

          <Text style={estilos.label}>VALOR *</Text>
          <TextInput
            style={estilos.input}
            placeholder="Ex: R$ 450.000"
            placeholderTextColor="#777"
            value={preco}
            onChangeText={setPreco}
          />

          <Text style={estilos.label}>DESCRIÇÃO</Text>
          <TextInput
            style={[estilos.input, estilos.textarea]}
            placeholder="Descreva seu imóvel..."
            placeholderTextColor="#777"
            value={descricao}
            onChangeText={setDescricao}
            multiline
            textAlignVertical="top"
          />
        </View>

        <View style={estilos.secao}>
          <Text style={estilos.tituloSecao}>Documentos</Text>
          <Text style={estilos.explicacao}>
            Envie os documentos necessários para que nossa equipe possa analisar o imóvel.
          </Text>

          {/* COMPROVANTE */}
          <Text style={estilos.label}>COMPROVANTE DE RESIDÊNCIA *</Text>
          <TouchableOpacity
            style={estilos.botaoArquivo}
            activeOpacity={0.8}
            onPress={selecionarComprovante}
          >
            <Text style={estilos.iconeArquivo}>📄</Text>
            <View style={estilos.infoArquivo}>
              <Text style={estilos.tituloArquivo}>
                {comprovante ? 'Comprovante selecionado' : 'Selecionar comprovante'}
              </Text>
              <Text style={estilos.subtituloArquivo}>
                {comprovante ? comprovante.name : 'PDF ou imagem (JPG, PNG)'}
              </Text>
            </View>
            <Text style={estilos.setaArquivo}>›</Text>
          </TouchableOpacity>

          {/* FOTOS */}
          <Text style={estilos.label}>FOTOS DO IMÓVEL *</Text>
          <TouchableOpacity
            style={estilos.botaoArquivo}
            activeOpacity={0.8}
            onPress={selecionarFotos}
          >
            <Text style={estilos.iconeArquivo}>🖼️</Text>
            <View style={estilos.infoArquivo}>
              <Text style={estilos.tituloArquivo}>
                {fotos.length > 0
                  ? `${fotos.length} foto(s) selecionada(s)`
                  : 'Selecionar fotos'}
              </Text>
              <Text style={estilos.subtituloArquivo}>
                As fotos serão convertidas em PDF
              </Text>
            </View>
            <Text style={estilos.setaArquivo}>›</Text>
          </TouchableOpacity>

          <Text style={estilos.avisoDocumentos}>
            O comprovante pode ser PDF ou Imagem. As fotos do imóvel serão consolidadas em PDF.
          </Text>
        </View>

        <View style={estilos.secao}>
          <Text style={estilos.tituloSecao}>Seus dados</Text>
          <Text style={estilos.explicacao}>
            Nossa equipe utilizará esses dados para entrar em contato sobre o anúncio.
          </Text>

          <Text style={estilos.label}>TELEFONE / WHATSAPP *</Text>
          <TextInput
            style={estilos.input}
            placeholder="(48) 99999-9999"
            placeholderTextColor="#777"
            keyboardType="phone-pad"
            value={telefone}
            onChangeText={setTelefone}
          />
        </View>

        <TouchableOpacity
          style={[estilos.botaoEnviar, enviando && estilos.botaoDesativado]}
          onPress={enviarSolicitacao}
          disabled={enviando}
        >
          {enviando ? (
            <ActivityIndicator color="#111" />
          ) : (
            <>
              <Text style={estilos.textoBotao}>ENVIAR SOLICITAÇÃO</Text>
              <Text style={estilos.iconeBotao}>→</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={estilos.aviso}>* Campos obrigatórios</Text>
      </ScrollView>
    </ImageBackground>
  );
}

const estilos = StyleSheet.create({
  fundo: { flex: 1, backgroundColor: '#111' },
  imagemFundo: { width: '100%', height: '100%' },
  sombra: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.65)' },
  scroll: { flex: 1 },
  conteudo: { padding: 22, paddingTop: 50, paddingBottom: 60 },
  botaoVoltar: { flexDirection: 'row', alignItems: 'center', marginBottom: 25 },
  voltar: { color: '#C9A86A', fontSize: 35, lineHeight: 30 },
  textoVoltar: { color: '#aaa', fontSize: 13, marginLeft: 5 },
  cabecalho: { marginBottom: 25 },
  logo: { color: '#C9A86A', fontSize: 20, fontWeight: '900', letterSpacing: 3, marginBottom: 20 },
  logoBranco: { color: '#fff' },
  titulo: { color: '#fff', fontSize: 29, fontWeight: '700' },
  subtitulo: { color: '#999', fontSize: 13, lineHeight: 20, marginTop: 8, maxWidth: 330 },
  secao: {
    backgroundColor: 'rgba(18,18,18,0.94)',
    borderWidth: 1,
    borderColor: 'rgba(201,168,106,0.15)',
    borderRadius: 18,
    padding: 18,
    marginBottom: 18,
  },
  tituloSecao: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 20 },
  label: { color: '#C9A86A', fontSize: 10, fontWeight: '800', letterSpacing: 1.5, marginBottom: 8 },
  input: {
    height: 50,
    backgroundColor: '#0b0b0b',
    borderWidth: 1,
    borderColor: '#292929',
    borderRadius: 10,
    color: '#fff',
    fontSize: 14,
    paddingHorizontal: 14,
    marginBottom: 18,
  },
  textarea: { height: 120, paddingTop: 14 },
  opcoes: { flexDirection: 'row', marginBottom: 20 },
  opcao: {
    flex: 1,
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    backgroundColor: '#0b0b0b',
  },
  opcaoSelecionada: { backgroundColor: '#C9A86A', borderColor: '#C9A86A' },
  textoOpcao: { color: '#888', fontSize: 13, fontWeight: '700' },
  textoOpcaoSelecionada: { color: '#111' },
  linhaInputs: { flexDirection: 'row', justifyContent: 'space-between' },
  inputPequenoContainer: { width: '48%' },
  explicacao: { color: '#777', fontSize: 11, lineHeight: 17, marginTop: -12, marginBottom: 15 },
  botaoArquivo: {
    minHeight: 68,
    backgroundColor: '#0b0b0b',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 12,
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  iconeArquivo: { fontSize: 25, width: 42, textAlign: 'center' },
  infoArquivo: { flex: 1, marginLeft: 8 },
  tituloArquivo: { color: '#fff', fontSize: 13, fontWeight: '700' },
  subtituloArquivo: { color: '#777', fontSize: 10, marginTop: 5 },
  setaArquivo: { color: '#C9A86A', fontSize: 28 },
  avisoDocumentos: { color: '#666', fontSize: 10, lineHeight: 16, marginTop: -4 },
  botaoEnviar: {
    height: 58,
    backgroundColor: '#C9A86A',
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 5,
  },
  botaoDesativado: { opacity: 0.6 },
  textoBotao: { color: '#111', fontSize: 13, fontWeight: '900', letterSpacing: 1 },
  iconeBotao: { color: '#111', fontSize: 22, marginLeft: 10 },
  aviso: { color: '#666', fontSize: 10, marginTop: 12, textAlign: 'center' },
});