import React, { useEffect, useState } from 'react';
import {
  Alert, Linking, SafeAreaView, ScrollView, StatusBar, StyleSheet,
  Text, TextInput, TouchableOpacity, View
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PATRON_NUMBER = '0594876763';
const WAVE_NUMBER = '0594876763';
const ABONNEMENT = 2000;
const FREE_UNTIL = '26 Décembre 2026';
const STORAGE_KEY = '@ouvrierpro_ci_offres_v1';

const INITIAL_OFFERS = [
  { id: '1', titre: 'Cherche 3 maçons à Ferké', prix: '10 000 F/j', officiel: true, par: 'OuvrierPro Officiel', telephone: PATRON_NUMBER },
  { id: '2', titre: 'Ferrailleur pour dalle à Abidjan', prix: '12 000 F/j', officiel: false, par: 'Client Anonyme', telephone: '' }
];

export default function App() {
  const [phone, setPhone] = useState('');
  const [isPatron, setIsPatron] = useState(false);
  const [logged, setLogged] = useState(false);
  const [offres, setOffres] = useState(INITIAL_OFFERS);
  const [newOffre, setNewOffre] = useState('');
  const [newPrix, setNewPrix] = useState('');
  const [newVille, setNewVille] = useState('Ferké');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) setOffres(JSON.parse(saved));
      } catch (_) {
        Alert.alert('Stockage', 'Impossible de charger les annonces enregistrées.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!loading) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(offres)).catch(() =>
        Alert.alert('Stockage', 'Impossible d’enregistrer les annonces sur cet appareil.')
      );
    }
  }, [offres, loading]);

  const normalizePhone = value => value.replace(/[^\d+]/g, '');
  const login = () => {
    const cleaned = normalizePhone(phone);
    if (cleaned === PATRON_NUMBER) {
      Alert.alert(
        'Accès Patron',
        'Pour protéger le tableau de bord, la version de démonstration utilise encore une vérification locale. Configure un vrai compte administrateur côté serveur avant publication.',
        [{ text: 'Continuer', onPress: () => { setIsPatron(true); setLogged(true); } }]
      );
    } else if (cleaned.replace(/\D/g, '').length >= 10) {
      setIsPatron(false);
      setLogged(true);
      Alert.alert('Bienvenue', `Mode ouvrier — gratuit jusqu’au ${FREE_UNTIL}.`);
    } else {
      Alert.alert('Numéro invalide', 'Entre un numéro de téléphone valide.');
    }
  };

  const publierOffre = () => {
    const titre = newOffre.trim();
    if (titre.length < 5) {
      Alert.alert('Annonce incomplète', 'Décris le travail recherché (au moins 5 caractères).');
      return;
    }
    const offre = {
      id: String(Date.now()),
      titre: `${titre}${newVille.trim() ? ' à ' + newVille.trim() : ''}`,
      prix: newPrix.trim() || 'À négocier',
      officiel: isPatron,
      par: isPatron ? 'OuvrierPro Officiel' : `Utilisateur ${phone}`,
      telephone: phone
    };
    setOffres(previous => [offre, ...previous]);
    setNewOffre('');
    setNewPrix('');
    Alert.alert('Annonce publiée', isPatron ? 'L’offre officielle est affichée en tête.' : 'Ton annonce est enregistrée sur cet appareil.');
  };

  const appeler = async numero => {
    if (!numero) {
      Alert.alert('Contact indisponible', 'Aucun numéro de contact n’a été fourni pour cette annonce.');
      return;
    }
    const url = `tel:${numero}`;
    try {
      await Linking.openURL(url);
    } catch (_) {
      Alert.alert('Appel impossible', 'Ton téléphone ne permet pas de lancer cet appel.');
    }
  };

  const payer = () => {
    Alert.alert(
      'Paiement Wave',
      `Envoie ${ABONNEMENT} F CFA au ${WAVE_NUMBER}. Cette version ne peut pas confirmer automatiquement le paiement. N’envoie pas d’argent sans vérifier le bénéficiaire.`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Ouvrir Wave', onPress: async () => {
          try { await Linking.openURL('https://wave.com/'); }
          catch (_) { Alert.alert('Wave', `Ouvre Wave et vérifie le numéro ${WAVE_NUMBER} avant tout transfert.`); }
        }}
      ]
    );
  };

  const supprimerOffre = id => {
    Alert.alert('Supprimer cette annonce ?', 'Cette action est définitive sur cet appareil.', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: () => setOffres(prev => prev.filter(o => o.id !== id)) }
    ]);
  };

  const logout = () => {
    setLogged(false);
    setIsPatron(false);
    setPhone('');
  };

  if (!logged) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFF7F0" />
        <ScrollView contentContainerStyle={styles.loginContainer} keyboardShouldPersistTaps="handled">
          <View style={styles.brandMark}><Text style={styles.brandMarkText}>OP</Text></View>
          <Text style={styles.logo}>OUVRIERPRO <Text style={styles.logoCI}>CI</Text></Text>
          <Text style={styles.sub}>Le travail du bâtiment, plus proche de toi.</Text>
          <View style={styles.locationPill}><Text style={styles.locationText}>📍 FERKÉ · ABIDJAN · CÔTE D’IVOIRE</Text></View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Bienvenue 👋</Text>
            <Text style={styles.muted}>Entre ton numéro pour accéder aux offres de chantier.</Text>
            <Text style={styles.label}>Numéro de téléphone</Text>
            <TextInput
              style={styles.input} placeholder="Ex. 0700000000" placeholderTextColor="#9CA3AF"
              value={phone} onChangeText={setPhone} keyboardType="phone-pad"
              maxLength={16} returnKeyType="done" onSubmitEditing={login}
            />
            <TouchableOpacity style={styles.primaryBtn} onPress={login} activeOpacity={0.85}>
              <Text style={styles.primaryBtnText}>ENTRER DANS L’APPLICATION →</Text>
            </TouchableOpacity>
            <View style={styles.freeBox}>
              <Text style={styles.freeTitle}>🎉 Accès gratuit jusqu’au {FREE_UNTIL}</Text>
              <Text style={styles.freeText}>Abonnement prévu ensuite : {ABONNEMENT.toLocaleString('fr-FR')} F CFA</Text>
            </View>
          </View>
          <Text style={styles.disclaimer}>Version de démonstration : la connexion, les annonces et le paiement ne sont pas encore reliés à un serveur.</Text>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF7F0" />
      <ScrollView contentContainerStyle={styles.mainContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.topbar}>
          <View>
            <Text style={styles.logoSmall}>OUVRIERPRO <Text style={styles.logoCI}>CI</Text></Text>
            <Text style={styles.topSub}>Les opportunités du chantier</Text>
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={logout}><Text style={styles.logoutText}>Quitter</Text></TouchableOpacity>
        </View>

        <View style={styles.hero}>
          <Text style={styles.heroEyebrow}>{isPatron ? 'ESPACE ADMINISTRATEUR' : 'ESPACE OUVRIER'}</Text>
          <Text style={styles.heroTitle}>{isPatron ? 'Bonjour Patron 👷🏾' : 'Trouve ton prochain chantier.'}</Text>
          <Text style={styles.heroText}>Des annonces de maçonnerie, ferraillage, coffrage et autres métiers du bâtiment.</Text>
          <View style={styles.heroStats}>
            <View><Text style={styles.statNum}>{offres.length}</Text><Text style={styles.statLabel}>annonces</Text></View>
            <View style={styles.statDivider} />
            <View><Text style={styles.statNum}>2 villes</Text><Text style={styles.statLabel}>pour commencer</Text></View>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{isPatron ? 'Publier une offre officielle' : 'Tu recrutes ? Publie une offre'}</Text>
          <Text style={styles.sectionCaption}>C’est rapide et simple.</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.label}>Description du travail</Text>
          <TextInput style={[styles.input, styles.multiline]} placeholder="Ex. Cherche 3 maçons pour une dalle" placeholderTextColor="#9CA3AF"
            value={newOffre} onChangeText={setNewOffre} multiline maxLength={180} />
          <Text style={styles.label}>Ville ou localité</Text>
          <TextInput style={styles.input} placeholder="Ferké, Abidjan..." placeholderTextColor="#9CA3AF"
            value={newVille} onChangeText={setNewVille} maxLength={50} />
          <Text style={styles.label}>Salaire (facultatif)</Text>
          <TextInput style={styles.input} placeholder="Ex. 10 000 F/j ou À négocier" placeholderTextColor="#9CA3AF"
            value={newPrix} onChangeText={setNewPrix} maxLength={40} />
          <TouchableOpacity style={isPatron ? styles.orangeBtn : styles.primaryBtn} onPress={publierOffre} activeOpacity={0.85}>
            <Text style={styles.primaryBtnText}>{isPatron ? '★ PUBLIER COMME OFFRE OFFICIELLE' : '＋ PUBLIER L’ANNONCE'}</Text>
          </TouchableOpacity>
        </View>

        {isPatron && (
          <View style={styles.adminCard}>
            <Text style={styles.adminTitle}>Tableau de bord Patron</Text>
            <Text style={styles.adminText}>Numéro Wave indiqué : {WAVE_NUMBER}</Text>
            <Text style={styles.adminText}>Tarif prévu : {ABONNEMENT.toLocaleString('fr-FR')} F CFA / abonnement</Text>
            <Text style={styles.adminWarning}>⚠️ Les paiements ne sont pas vérifiés automatiquement dans cette version.</Text>
          </View>
        )}

        <View style={styles.offersHeader}>
          <View><Text style={styles.sectionTitle}>Offres disponibles</Text><Text style={styles.sectionCaption}>Les dernières annonces de chantier</Text></View>
          <View style={styles.countPill}><Text style={styles.countText}>{offres.length}</Text></View>
        </View>

        {offres.length === 0 ? (
          <View style={styles.empty}><Text style={styles.emptyTitle}>Aucune annonce pour le moment</Text><Text style={styles.muted}>Publie la première opportunité de travail.</Text></View>
        ) : offres.map(o => (
          <View key={o.id} style={[styles.offerCard, o.officiel && styles.officialCard]}>
            <View style={styles.offerTop}>
              <View style={styles.jobIcon}><Text style={styles.jobIconText}>⌂</Text></View>
              {o.officiel && <View style={styles.officialBadge}><Text style={styles.officialBadgeText}>✓ OFFICIELLE</Text></View>}
            </View>
            <Text style={styles.offerTitle}>{o.titre}</Text>
            <Text style={styles.offerPay}>💰 {o.prix}</Text>
            <View style={styles.offerBottom}>
              <Text style={styles.offerAuthor}>{o.par}</Text>
              <View style={styles.offerActions}>
                <TouchableOpacity style={styles.callBtn} onPress={() => appeler(o.telephone)}><Text style={styles.callBtnText}>☎ APPELER</Text></TouchableOpacity>
                {isPatron && <TouchableOpacity style={styles.deleteBtn} onPress={() => supprimerOffre(o.id)}><Text style={styles.deleteText}>Supprimer</Text></TouchableOpacity>}
              </View>
            </View>
          </View>
        ))}

        {!isPatron && (
          <View style={styles.waveCard}>
            <View style={styles.waveIcon}><Text style={styles.waveIconText}>W</Text></View>
            <Text style={styles.waveTitle}>Passe à l’abonnement</Text>
            <Text style={styles.wavePrice}>{ABONNEMENT.toLocaleString('fr-FR')} F CFA</Text>
            <Text style={styles.waveText}>Paiement prévu par Wave au {WAVE_NUMBER}. Gratuit jusqu’au {FREE_UNTIL}.</Text>
            <TouchableOpacity style={styles.waveBtn} onPress={payer}><Text style={styles.waveBtnText}>INSTRUCTIONS DE PAIEMENT →</Text></TouchableOpacity>
          </View>
        )}

        <Text style={styles.footer}>OUVRIERPRO CI · Ensemble, faisons avancer les chantiers.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFF7F0' },
  loginContainer: { flexGrow: 1, padding: 22, justifyContent: 'center', paddingBottom: 36 },
  mainContainer: { padding: 18, paddingBottom: 40 },
  brandMark: { alignSelf: 'center', width: 68, height: 68, borderRadius: 22, backgroundColor: '#FF6B00', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  brandMarkText: { color: '#FFFFFF', fontSize: 27, fontWeight: '900' },
  logo: { textAlign: 'center', fontSize: 29, fontWeight: '900', color: '#18212F', letterSpacing: 0.5 },
  logoCI: { color: '#FF6B00' },
  sub: { textAlign: 'center', marginTop: 8, marginBottom: 18, color: '#667085', fontSize: 14 },
  locationPill: { alignSelf: 'center', backgroundColor: '#FCE8D8', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 30, marginBottom: 12 },
  locationText: { color: '#9A4200', fontSize: 10, fontWeight: '800', letterSpacing: 0.4 },
  card: { backgroundColor: '#FFFFFF', padding: 19, borderRadius: 20, marginTop: 14, borderWidth: 1, borderColor: '#F0E7DF', elevation: 2 },
  cardTitle: { fontSize: 22, fontWeight: '800', color: '#18212F', marginBottom: 6 },
  muted: { color: '#667085', fontSize: 13, lineHeight: 19 },
  label: { fontSize: 12, fontWeight: '800', color: '#344054', marginTop: 13, marginBottom: 7 },
  input: { borderWidth: 1, borderColor: '#E4E7EC', borderRadius: 11, paddingHorizontal: 13, paddingVertical: 12, color: '#18212F', backgroundColor: '#FFFFFF', fontSize: 14 },
  multiline: { minHeight: 82, textAlignVertical: 'top' },
  primaryBtn: { backgroundColor: '#18212F', padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  primaryBtnText: { color: '#FFFFFF', fontWeight: '900', fontSize: 12, textAlign: 'center' },
  freeBox: { marginTop: 17, backgroundColor: '#ECFDF3', padding: 13, borderRadius: 12 },
  freeTitle: { color: '#027A48', fontSize: 12, fontWeight: '800', textAlign: 'center' },
  freeText: { color: '#027A48', fontSize: 12, textAlign: 'center', marginTop: 5 },
  disclaimer: { color: '#98A2B3', fontSize: 11, textAlign: 'center', marginTop: 18, lineHeight: 17 },
  topbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, marginTop: 4 },
  logoSmall: { fontWeight: '900', color: '#18212F', fontSize: 18 },
  topSub: { color: '#667085', fontSize: 11, marginTop: 3 },
  logoutBtn: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E4E7EC', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  logoutText: { color: '#344054', fontSize: 12, fontWeight: '700' },
  hero: { backgroundColor: '#18212F', borderRadius: 22, padding: 21, marginBottom: 22 },
  heroEyebrow: { color: '#FFB27A', fontSize: 10, fontWeight: '900', letterSpacing: 1.2 },
  heroTitle: { color: '#FFFFFF', fontSize: 24, lineHeight: 30, fontWeight: '900', marginTop: 10 },
  heroText: { color: '#D0D5DD', fontSize: 13, lineHeight: 20, marginTop: 8 },
  heroStats: { flexDirection: 'row', alignItems: 'center', marginTop: 18 },
  statNum: { color: '#FFFFFF', fontWeight: '900', fontSize: 17 },
  statLabel: { color: '#D0D5DD', fontSize: 10, marginTop: 2 },
  statDivider: { width: 1, height: 30, backgroundColor: '#475467', marginHorizontal: 22 },
  sectionHeader: { marginBottom: 4 },
  sectionTitle: { color: '#18212F', fontSize: 18, fontWeight: '900' },
  sectionCaption: { color: '#667085', fontSize: 12, marginTop: 4 },
  orangeBtn: { backgroundColor: '#FF6B00', padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  adminCard: { backgroundColor: '#FFF1E6', borderColor: '#FF6B00', borderWidth: 1, padding: 15, borderRadius: 15, marginTop: 16 },
  adminTitle: { color: '#9A4200', fontWeight: '900', fontSize: 16, marginBottom: 8 },
  adminText: { color: '#7A2E0E', fontSize: 12, marginTop: 4 },
  adminWarning: { color: '#9A3412', fontSize: 11, marginTop: 9, lineHeight: 16 },
  offersHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 26, marginBottom: 13 },
  countPill: { backgroundColor: '#FCE8D8', minWidth: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  countText: { color: '#9A4200', fontWeight: '900' },
  empty: { backgroundColor: '#FFFFFF', padding: 20, borderRadius: 15, alignItems: 'center' },
  emptyTitle: { color: '#18212F', fontWeight: '800', marginBottom: 5 },
  offerCard: { backgroundColor: '#FFFFFF', padding: 16, borderRadius: 17, marginBottom: 12, borderWidth: 1, borderColor: '#F0E7DF' },
  officialCard: { backgroundColor: '#F0F7FF', borderColor: '#84CAFF', borderWidth: 1.5 },
  offerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  jobIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: '#FCE8D8', alignItems: 'center', justifyContent: 'center' },
  jobIconText: { fontSize: 23, fontWeight: '900', color: '#FF6B00' },
  officialBadge: { backgroundColor: '#175CD3', paddingHorizontal: 9, paddingVertical: 6, borderRadius: 7 },
  officialBadgeText: { color: '#FFFFFF', fontWeight: '900', fontSize: 9 },
  offerTitle: { color: '#18212F', fontWeight: '900', fontSize: 16, lineHeight: 22 },
  offerPay: { color: '#027A48', fontSize: 13, fontWeight: '800', marginTop: 9 },
  offerBottom: { borderTopWidth: 1, borderTopColor: '#EAECF0', marginTop: 13, paddingTop: 12 },
  offerAuthor: { color: '#667085', fontSize: 11, marginBottom: 10 },
  offerActions: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  callBtn: { backgroundColor: '#12B76A', paddingVertical: 10, paddingHorizontal: 15, borderRadius: 9, alignSelf: 'flex-start' },
  callBtnText: { color: '#FFFFFF', fontWeight: '900', fontSize: 11 },
  deleteBtn: { marginLeft: 10, padding: 10 },
  deleteText: { color: '#B42318', fontSize: 11, fontWeight: '800' },
  waveCard: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#B2DDFF', borderRadius: 19, padding: 18, marginTop: 18 },
  waveIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#E0F2FE', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  waveIconText: { color: '#026AA2', fontSize: 21, fontWeight: '900' },
  waveTitle: { color: '#18212F', fontSize: 18, fontWeight: '900' },
  wavePrice: { color: '#026AA2', fontSize: 25, fontWeight: '900', marginTop: 5 },
  waveText: { color: '#667085', fontSize: 12, lineHeight: 19, marginTop: 8 },
  waveBtn: { backgroundColor: '#026AA2', padding: 14, borderRadius: 11, alignItems: 'center', marginTop: 13 },
  waveBtnText: { color: '#FFFFFF', fontWeight: '900', fontSize: 11 },
  footer: { color: '#98A2B3', fontSize: 10, textAlign: 'center', marginTop: 26, lineHeight: 16 }
});
