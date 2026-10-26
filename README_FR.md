# OuvrierPro CI — projet Android

Ce dossier contient une base Expo / React Native de l’application OuvrierPro CI, adaptée à Android et préparée pour générer un APK.

## Fonctionnalités présentes dans cette maquette
- Écran d’entrée avec numéro de téléphone.
- Écran ouvrier et espace Patron de démonstration.
- Publication d’annonces avec ville et prix.
- Offres officielles visuellement mises en avant.
- Bouton d’appel téléphonique.
- Enregistrement local des annonces sur le même appareil.
- Section d’information sur l’abonnement Wave de 2 000 F CFA.

## Limites importantes — avant toute diffusion publique
Cette version est un **prototype local**, pas encore un service de production :
- Le numéro Patron est vérifié dans le code de l’application : il ne s’agit PAS d’une authentification sécurisée. N’utilise pas ce prototype pour protéger de vraies données ou fonctions administrateur.
- Les annonces sont stockées sur le téléphone, elles ne sont pas partagées entre utilisateurs.
- Le paiement Wave n’est pas automatisé ni vérifié. Le bouton affiche des instructions et ouvre le site Wave.
- Aucun compte utilisateur, serveur, base de données partagée, modération ou vérification de paiement n’est configuré.
- La date de gratuité est affichée comme texte et n’applique pas de restriction automatique.
- Avant publication, configure un backend, une authentification par OTP, des règles d’accès côté serveur et un processus de paiement approuvé.

## Générer un APK avec un ordinateur
1. Installe Node.js LTS depuis le site officiel : https://nodejs.org/
2. Installe Git si nécessaire : https://git-scm.com/
3. Décompresse le ZIP.
4. Ouvre un terminal dans le dossier du projet.
5. Exécute :

   ```bash
   npm install
   npx expo start
   ```

6. Pour générer un APK installable, crée un compte Expo puis lance :

   ```bash
   npx eas-cli login
   npx eas-cli build:configure
   npx eas-cli build --platform android --profile preview
   ```

7. Une fois la compilation terminée, ouvre le lien fourni par EAS sur ton téléphone Android pour télécharger l’APK.

La compilation EAS se fait dans le cloud. Ce dossier source n’est pas lui-même un APK installé.

## Tester sur téléphone
Installe Expo Go depuis Google Play, puis lance `npx expo start` sur l’ordinateur. Scanne le QR code avec Expo Go. Pour un vrai APK autonome, utilise EAS Build comme décrit ci-dessus.

## Identifiants de démonstration
Le numéro Patron prévu dans la maquette est celui indiqué dans le code source. Il ne doit pas être considéré comme un secret ou une protection réelle.
