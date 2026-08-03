# VetCare Plus

Site vitrine et espace connecté d'une clinique vétérinaire fictive, avec un assistant IA conversationnel à 4 niveaux d'accès, branché en direct sur un système d'automatisation n8n.

**Démo en ligne :** https://vetcare-site-peach.vercel.app

## Le contexte

Ce projet est né pendant un hackathon de fin de formation (bloc IA, La Capsule) : construire pour une clinique vétérinaire fictive un système capable de répondre aux questions des propriétaires d'animaux, de trier les emails entrants et de mesurer en continu la qualité de ses réponses, le tout avec une IA, une base de connaissance, des garde-fous de sécurité et une évaluation chiffrée.

Le dépôt que vous lisez ne contient que la **partie visible** : le site public, l'espace connecté et le widget de chat. Le reste du système (l'agent IA, son garde-fou de sécurité, la recherche documentaire RAG, la mémoire client, l'outil de dossier patient, le triage automatique des emails et l'évaluation continue) tourne dans une instance privée [n8n](https://n8n.io), avec [Airtable](https://airtable.com) comme base de données et [Qdrant](https://qdrant.tech) comme base vectorielle. Ce n'est pas ouvert dans ce dépôt (infrastructure personnelle), mais c'est décrit ci-dessous pour donner une vue complète du projet.

## Ce que fait le site

- **Page publique** : présentation de la clinique, 4 services avec leur propre page (vaccination, consultations, urgences, conseils), infos pratiques, et un assistant conversationnel accessible à tout visiteur.
- **Pages services** (`/services/<slug>`) : contenu détaillé (ce qui est inclus, déroulé type, FAQ) et un bouton d'action qui ouvre l'assistant avec un message pré-rempli adapté au service. Le contenu statique renvoie directement vers le produit qui fonctionne derrière.
- **Page « Comment ça marche »** (`/comment-ca-marche`) : explique en langage accessible les mécanismes réels de l'assistant (recherche documentaire, garde-fou de sécurité, mémoire, accès par rôle, évaluation continue), avec quelques chiffres tirés des vraies évaluations du projet.
- **Espace connecté** (3 rôles, comptes de démonstration) :
  - **Patient** : fiche de chacun de ses animaux, historique des soins, conseils personnalisés.
  - **Vétérinaire** : son planning du jour en direct, la liste de ses patients, ses notes cliniques.
  - **Direction** : tableau de bord avec KPIs et graphiques (RDV, triage des emails, fiabilité technique) alimenté en direct, plus une vue administration des comptes et de leurs niveaux d'accès.

## Le modèle d'accès à 4 niveaux

Le même assistant s'adapte au niveau de la personne connectée. L'accès est cumulatif :

1. **Visiteur (public)** : renseignements généraux de santé animale et orientation vers une prise de rendez-vous.
2. **Patient connecté** : en plus, l'assistant répond sur ses propres animaux (dossier, soins, traitements).
3. **Vétérinaire** : en plus, ses patients et son planning.
4. **Direction** : accès complet, dont le pilotage et l'administration.

Ce contrôle est appliqué en défense en profondeur : un garde-fou (juge IA dédié) fait le contrôle sémantique en amont, et les outils de l'agent sont scopés en dur par l'identité de session. Point de sécurité central : l'identité et le rôle proviennent de la session, jamais du texte tapé dans le chat. Un patient ne peut donc pas accéder aux données d'un autre, même en le demandant explicitement.

## Sécurité : ce qui est réel, ce qui est simulé

Ce projet est une démonstration. L'authentification (comptes en dur, mot de passe commun `demo`) est **simulée côté client** : ce n'est pas un vrai système d'authentification, et ce dépôt ne doit pas être utilisé tel quel en production. En revanche, le contrôle d'accès de l'assistant (garde-fou 4 niveaux et scoping des outils par l'identité de session) est réel et tourne côté serveur (n8n). Des identifiants et mots de passe uniques par compte sont prévus dans un second temps.

## Stack technique

- **[Astro](https://astro.build)** : pages statiques, très peu de JavaScript côté client.
- **JavaScript vanilla** pour l'authentification simulée et le rendu des tableaux de bord (pas de framework front lourd, volontairement).
- **[Chart.js](https://www.chartjs.org)** pour les graphiques du tableau de bord Direction.
- **[@n8n/chat](https://www.npmjs.com/package/@n8n/chat)** pour le widget de conversation, branché sur un webhook n8n.
- **[Vercel](https://vercel.com)** pour l'hébergement et le déploiement continu.

Le backend (agent IA, RAG, mémoire, dossier patient, triage, évaluation) : **n8n** (orchestration), **Anthropic Claude** (Sonnet pour l'agent, Haiku pour les tâches de classification), **Cohere** (embeddings), **Qdrant** (base vectorielle), **Airtable** (données relationnelles : propriétaires, animaux, soins, vétérinaires, rendez-vous, monitoring).

## Structure du projet

```
src/
  layouts/Layout.astro       en-tete, pied de page, polices, widget de chat (contexte session)
  pages/
    index.astro              page publique
    connexion.astro          connexion (comptes de demo)
    comment-ca-marche.astro  coulisses techniques du projet
    services/[slug].astro    page dynamique, une par service (donnees dans src/data/services.js)
    espace/
      patient.astro          espace patient (multi-animaux)
      veterinaire.astro      espace veterinaire (scope au praticien connecte)
      directeur.astro        tableau de bord + vue administration
  data/
    services.js              contenu des 4 pages services (inclus, deroule, FAQ, action)
    icons.js                 icones SVG partagees
  styles/global.css          systeme de design (couleurs, typographie, composants)
public/
  site.js                    comptes de demo, navigation, auth simulee, contexte de session du chat
```

Chaque page d'espace connecté vérifie le rôle de l'utilisateur au chargement (`vcRequireRole`) et redirige vers la connexion ou vers le bon espace si besoin. Le chat reçoit son contexte (rôle, identité, niveau) via `vcChatContext`, dérivé de la session.

## Démarrer en local

```bash
npm install
npm run dev
```

Le site est accessible sur `http://localhost:4321`. Les appels vers l'assistant et les tableaux de bord passent par les webhooks n8n réels (pas de mode hors-ligne).

## Déploiement

```bash
npm run build
```

Déployé automatiquement sur Vercel (adaptateur `@astrojs/vercel`, sortie statique).

---

*Projet réalisé dans le cadre de la formation IA de [La Capsule](https://lacapsule.io).*
