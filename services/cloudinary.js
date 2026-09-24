const CLOUD_NAME = 'boycvhni';

const UPLOAD_PRESET_IMAGENS = 'a2_imoveis';


export const uploadImagem = async (uri) => {

  try {

    console.log('Preparando imagem...');

    const formData = new FormData();

    formData.append('file', {
      uri: uri,
      type: 'image/jpeg',
      name: `imagem_${Date.now()}.jpg`,
    });

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
        'ERRO CLOUDINARY:',
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
      'ERRO NO UPLOAD:',
      erro
    );

    throw erro;
  }
};