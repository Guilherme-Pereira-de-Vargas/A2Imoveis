import { File } from 'expo-file-system';

const CLOUD_NAME = 'boycvhni';

const UPLOAD_PRESET_IMAGENS = 'a2_imoveis';
const UPLOAD_PRESET_DOCUMENTOS = 'a2_imoveis_documentos';


// =====================================================
// UPLOAD DE IMAGEM
// =====================================================

export const uploadImagem = async (uri) => {

  try {

    console.log('Preparando imagem...');

    const arquivo = new File(uri);

    console.log('Arquivo criado:', arquivo.uri);


    const formData = new FormData();

    formData.append('file', arquivo);

    formData.append(
      'upload_preset',
      UPLOAD_PRESET_IMAGENS
    );


    console.log(
      'Enviando imagem para o Cloudinary...'
    );


    const resposta = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );


    const dados = await resposta.json();


    if (!resposta.ok) {

      console.log(
        'ERRO CLOUDINARY IMAGEM:',
        dados
      );

      throw new Error(
        dados.error?.message ||
        'Erro ao enviar imagem.'
      );
    }


    console.log(
      'Imagem enviada com sucesso!'
    );


    return dados.secure_url;


  } catch (erro) {

    console.log(
      'ERRO NO UPLOAD DA IMAGEM:',
      erro
    );

    throw erro;
  }
};


// =====================================================
// UPLOAD DO COMPROVANTE
// =====================================================

export const uploadComprovante = async (
  uri,
  mimeType,
  nome
) => {

  try {

    console.log(
      'Preparando comprovante...'
    );


    const arquivo = new File(uri);


    console.log(
      'Arquivo do comprovante criado:',
      arquivo.uri
    );


    const formData = new FormData();


    formData.append(
      'file',
      arquivo
    );


    formData.append(
      'upload_preset',
      UPLOAD_PRESET_DOCUMENTOS
    );


    console.log(
      'Enviando comprovante para o Cloudinary...'
    );


    const resposta = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/raw/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );


    const dados = await resposta.json();


    if (!resposta.ok) {

      console.log(
        'ERRO CLOUDINARY COMPROVANTE:',
        dados
      );

      throw new Error(
        dados.error?.message ||
        'Erro ao enviar comprovante.'
      );
    }


    console.log(
      'Comprovante enviado com sucesso!'
    );


    return dados.secure_url;


  } catch (erro) {

    console.log(
      'ERRO NO UPLOAD DO COMPROVANTE:',
      erro
    );

    throw erro;
  }
};