import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ImageBackground, TextInput } from 'react-native';
import { getAuth, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { database } from '../firebaseConfig';

export default function DetalhesUsuario({ route, navigation }) {
  const { usuarioId, dados } = route.params || {};

  const [nome, setNome] = useState(dados?.nome || '');
  const [email] = useState(dados?.email || '');
  const [telefone, setTelefone] = useState(dados?.telefone || '');
  const [tipo, setTipo] = useState(dados?.tipo || 'cliente');
  const [salvando, setSalvando] = useState(false);

  const salvar = async () => {
    if (!usuarioId) return;

    const performSave = async () => {
      try {
        setSalvando(true);
        const referencia = doc(database, 'usuarios', usuarioId);
        await updateDoc(referencia, {
          nome: nome.trim(),
          telefone: telefone.trim(),
          tipo: tipo,
        });

        Alert.alert('Sucesso', 'Dados atualizados com sucesso.', [
          { text: 'OK', onPress: () => navigation.navigate('InicialAdm') },
        ]);
      } catch (err) {
        console.log('ERRO AO SALVAR USUÁRIO:', err);
        Alert.alert('Erro', 'Não foi possível salvar as alterações.');
      } finally {
        setSalvando(false);
      }
    };

    if (tipo === 'admin') {
      if (currentUserTipo !== 'dono') {
        Alert.alert('Permissão negada', 'Apenas o usuário dono pode confirmar promoções para admin. Entre em contato com um superior.');
        return;
      }

      Alert.alert(
        'Confirmar promoção para Admin',
        'Ao salvar, esta conta será promovida a Admin. Tem certeza?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Confirmar', onPress: () => performSave() },
        ],
      );
      return;
    }

    await performSave();
  };

  const atualizarDoServidor = async () => {
    if (!usuarioId) return;
    try {
      const snap = await getDoc(doc(database, 'usuarios', usuarioId));
      if (snap.exists()) {
        const d = snap.data();
        setNome(d.nome || '');
        setTelefone(d.telefone || '');
        setTipo(d.tipo || 'cliente');
      }
    } catch (err) {
      console.log('ERRO AO RECARREGAR USUÁRIO:', err);
    }
  };

  const [confirmAdmin, setConfirmAdmin] = useState(false);
  const [showReauthModal, setShowReauthModal] = useState(false);
  const [reauthPassword, setReauthPassword] = useState('');
  const [reauthLoading, setReauthLoading] = useState(false);
  const [reauthSucceeded, setReauthSucceeded] = useState(false);
  const [reauthEmail, setReauthEmail] = useState('');
  const [currentUserTipo, setCurrentUserTipo] = useState(null);

  useEffect(() => {}, []);

  useEffect(() => {
    // load current logged user's tipo (to enforce only dono can promote)
    const loadCurrentTipo = async () => {
      try {
        const auth = getAuth();
        const cu = auth.currentUser;
        if (!cu) return;
        const snap = await getDoc(doc(database, 'usuarios', cu.uid));
        if (snap.exists()) {
          setCurrentUserTipo(snap.data()?.tipo || null);
        }
      } catch (err) {
        console.log('ERRO AO CARREGAR TIPO DO USUÁRIO ATUAL:', err);
      }
    };
    loadCurrentTipo();
  }, []);

  const makeAdmin = async () => {
    if (!usuarioId) return;
    try {
      const referencia = doc(database, 'usuarios', usuarioId);
      await updateDoc(referencia, { tipo: 'admin' });
      Alert.alert('Sucesso', 'Conta atualizada para admin.', [{ text: 'OK', onPress: () => navigation.navigate('InicialAdm') }]);
    } catch (err) {
      console.log('ERRO AO TORNAR ADMIN:', err);
      Alert.alert('Erro', 'Não foi possível atualizar o tipo de conta.');
    } finally {
      setConfirmAdmin(false);
    }
  };

  const handleStartAdminFlow = () => {
    // kept for compatibility; prefer handleAdminPress
    handleAdminPress();
  };

  const handleAdminPress = async () => {
    try {
      // ensure we have current user's tipo
      let myTipo = currentUserTipo;
      if (!myTipo) {
        const auth = getAuth();
        const cu = auth.currentUser;
        if (!cu) {
          Alert.alert('Erro', 'Nenhum usuário autenticado.');
          return;
        }
        const snap = await getDoc(doc(database, 'usuarios', cu.uid));
        myTipo = snap.exists() ? snap.data()?.tipo : null;
        setCurrentUserTipo(myTipo);
      }

      if (myTipo !== 'dono') {
        return;
      }

      // allow reauth flow
      Alert.alert(
        'Confirmar promoção',
        'Você está prestes a tornar esta conta admin. Será solicitada a sua senha e e-mail para reautenticação.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Continuar', onPress: () => setShowReauthModal(true) },
        ],
      );
    } catch (err) {
      console.log('ERRO AO CHECAR PERMISSÃO DE PROMOÇÃO:', err);
      Alert.alert('Erro', 'Não foi possível verificar permissões.');
    }
  };

  const handleReauth = async () => {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (!currentUser || !currentUser.email) {
      Alert.alert('Erro', 'Usuário autenticado inválido.');
      return;
    }
    if ((reauthEmail || '').trim().toLowerCase() !== (currentUser.email || '').toLowerCase()) {
      Alert.alert('Erro', 'O e-mail informado não confere com o e-mail do usuário autenticado.');
      return;
    }
    setReauthLoading(true);
    try {
      const cred = EmailAuthProvider.credential(currentUser.email, reauthPassword);
      await reauthenticateWithCredential(currentUser, cred);
      setShowReauthModal(false);
      setReauthPassword('');
      setReauthEmail('');
      setReauthSucceeded(true);
      setTipo('admin');
      Alert.alert('Reautenticado', 'Reautenticação bem-sucedida. A opção Admin foi selecionada. Agora pressione Salvar para confirmar.');
    } catch (err) {
      console.log('REAUTH ERROR', err);
      Alert.alert('Erro', 'Falha na reautenticação. Senha incorreta?');
    } finally {
      setReauthLoading(false);
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
          <Text style={estilos.rotulo}>NOME</Text>
          <Text style={estilos.valor}>{nome || '-'}</Text>

          <Text style={[estilos.rotulo, { marginTop: 12 }]}>E-MAIL</Text>
          <Text style={estilos.valor}>{email}</Text>

          <Text style={[estilos.rotulo, { marginTop: 12 }]}>TELEFONE</Text>
          <Text style={estilos.valor}>{telefone || '-'}</Text>

          <Text style={[estilos.rotulo, { marginTop: 12 }]}>TIPO DE CONTA</Text>
          <View style={estilos.tipoContainer}>
            <TouchableOpacity style={[estilos.tipoBtn, tipo === 'cliente' && estilos.tipoBtnSel]} onPress={() => setTipo('cliente')}>
              <Text style={tipo === 'cliente' ? estilos.tipoSelText : estilos.tipoText}>Cliente</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[estilos.tipoBtn, tipo === 'proprietario' && estilos.tipoBtnSel]} onPress={() => setTipo('proprietario')}>
              <Text style={tipo === 'proprietario' ? estilos.tipoSelText : estilos.tipoText}>Proprietário</Text>
            </TouchableOpacity>
            {currentUserTipo === 'dono' && (
              <TouchableOpacity
                style={[estilos.tipoBtn, tipo === 'admin' && estilos.tipoBtnSel]}
                onPress={() => handleStartAdminFlow()}
              >
                <Text style={tipo === 'admin' ? estilos.tipoSelText : estilos.tipoText}>Admin</Text>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={[estilos.botao, estilos.botaoEntrar, salvando && estilos.botaoDesabilitado, { alignSelf: 'center' }]}
            onPress={salvar}
            disabled={salvando}
            accessibilityLabel={salvando ? 'Salvando' : 'Salvar'}
          >
            <Text style={estilos.textoBotaoEntrar}>{salvando ? 'Salvando...' : 'Salvar'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[estilos.botao, estilos.botaoSec, { marginTop: 10, alignSelf: 'center' }]}
            onPress={atualizarDoServidor}
            accessibilityLabel={'Recarregar'}
          >
            <Text style={estilos.textoBotaoSec}>Recarregar</Text>
          </TouchableOpacity>

          {reauthSucceeded && (
            <View style={{ alignItems: 'center', marginTop: 12 }}>
              <Text style={{ color: '#fff', marginBottom: 8 }}>Reautenticação concluída — pronto para salvar como admin.</Text>
              <TouchableOpacity
                style={[estilos.botao, estilos.botaoDanger]}
                onPress={() => {
                  // nothing here; saving triggers confirmation
                }}
              >
                <Text style={estilos.textoBotaoDanger}>Admin selecionado</Text>
              </TouchableOpacity>
            </View>
          )}

          {showReauthModal && (
            <View style={estilos.reauthOverlay}>
              <View style={estilos.reauthBox}>
                <Text style={{ color: '#C9A86A', fontWeight: '700', marginBottom: 8 }}>Reautentique-se</Text>
                <Text style={{ color: '#fff', marginBottom: 12 }}>Digite seu e-mail e senha para confirmar a promoção.</Text>
                <TextInput
                  placeholder="Email"
                  placeholderTextColor="#777"
                  style={[estilos.reauthInput, { marginBottom: 8 }]}
                  value={reauthEmail}
                  onChangeText={setReauthEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <TextInput
                  secureTextEntry
                  placeholder="Senha"
                  placeholderTextColor="#777"
                  style={estilos.reauthInput}
                  value={reauthPassword}
                  onChangeText={setReauthPassword}
                />
                <View style={{ flexDirection: 'row', marginTop: 12, justifyContent: 'space-between' }}>
                  <TouchableOpacity style={[estilos.botao, estilos.botaoSec, { width: '48%' }]} onPress={() => { setShowReauthModal(false); setReauthPassword(''); setReauthEmail(''); }}>
                    <Text style={estilos.textoBotaoSec}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[estilos.botao, estilos.botaoEntrar, { width: '48%' }]} onPress={handleReauth} disabled={reauthLoading || !reauthPassword || !reauthEmail}>
                    <Text style={estilos.textoBotaoEntrar}>{reauthLoading ? 'Verificando...' : 'Confirmar'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </View>
      </View>
    </ImageBackground>
  );
}

const estilos = StyleSheet.create({
  fundo: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.55)' },
  container: { flex: 1, padding: 24, paddingTop: 60, alignItems: 'center', justifyContent: 'center' },
  botaoVoltar: { position: 'absolute', top: 36, left: 14, width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(10,10,10,0.8)', alignItems: 'center', justifyContent: 'center' },
  iconeVoltar: { color: '#C9A86A', fontSize: 34, lineHeight: 36, marginTop: -4 },
  titulo: { color: '#C9A86A', fontSize: 22, fontWeight: '700', marginBottom: 14 },
  card: { width: '92%', backgroundColor: 'rgba(15,15,15,0.95)', padding: 18, borderRadius: 12, borderWidth: 1, borderColor: '#8E713E' },
  rotulo: { color: '#C9A86A', fontSize: 12, fontWeight: '700', marginBottom: 8 },
  input: { backgroundColor: '#181818', color: '#fff', borderRadius: 8, paddingHorizontal: 12, height: 44, borderWidth: 1, borderColor: '#444' },
  valor: { color: '#fff', backgroundColor: '#222', padding: 10, borderRadius: 8 },
  botao: { width: '60%', paddingVertical: 12, borderRadius: 25, alignItems: 'center', justifyContent: 'center', marginTop: 14 },
  botaoEntrar: { backgroundColor: '#C9A86A' },
  textoBotaoEntrar: { color: '#fff', fontWeight: '700' },
  botaoSec: { backgroundColor: '#111' },
  textoBotaoSec: { color: '#fff', fontWeight: '700' },
  botaoDanger: { backgroundColor: '#A83232' },
  textoBotaoDanger: { color: '#fff', fontWeight: '700' },
  botaoBusca: { backgroundColor: '#C9A86A', paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  tipoBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12, backgroundColor: '#222', marginHorizontal: 12 },
  tipoBtnSel: { backgroundColor: '#C9A86A' },
  tipoText: { color: '#fff' },
  tipoSelText: { color: '#111', fontWeight: '700' },
  tipoContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 6 },
  botaoDesabilitado: { opacity: 0.7 },
  reauthOverlay: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  reauthBox: { width: '86%', backgroundColor: 'rgba(15,15,15,0.95)', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#8E713E' },
  reauthInput: { height: 44, backgroundColor: '#181818', color: '#fff', borderRadius: 8, paddingHorizontal: 12, borderWidth: 1, borderColor: '#444' },
});
