# VetCare Plus

Site vitrine et espace connecté d'une clinique vétérinaire fictive, avec un assistant IA conversationnel branché en direct sur un système d'automatisation n8n.

**Démo en ligne :** https://vetcare-site-peach.vercel.app

## Le contexte

Ce projet est né pendant un hackathon de fin de formation (bloc IA, La Capsule) : construire pour une clinique vétérinaire fictive un système capable de répondre aux questions des propriétaires d'animaux, de trier les emails entrants et de mesurer en continu la qualité de ses réponses — le tout avec une IA, une base de connaissance, des garde-fous de sécurité et une évaluation chiffrée.

Le dépôt que vous lisez ne contient que la **partie visible** : le site public, l'espace connecté et le widget de chat. Le reste du système — l'agent IA, son garde-fou de sécurité, la recherche documentaire (RAG), la mémoire client, le triage automatique des emails et l'évaluation continue — tourne dans une instance privée [n8n](https://n8n.io), avec [Airtable](https://airtable.com) comme base de données et [Qdrant](https://qdrant.tech) comme base vectorielle. Ce n'est pas ouvert dans ce dépôt (infrastructure personnelle), mais c'est décrit ci-dessous pour donner une vue complète du projet.

## Ce que fait le site

- **Page publique** : présentation de la clinique, 4 cartes services avec contenu déplié, infos pratiques, et un assistant conversationnel accessible à tout visiteur.
- **Espace connecté** (3 rôles, comptes de démonstration) :
  - **Patient** : fiche de son animal, historique des soins, conseils personnalisés.
  - **Vétérinaire** : planning du jour en direct, liste de ses patients, notes cliniques.
  - **Direction** : tableau de bord avec KPIs et graphiques (RDV, triage des emails, fiabilité technique), alimenté en direct par les données du système.
- **Assistant IA** : le même widget de chat s'adapte au rôle de la personne connectée (un visiteur public n'a pas accès au planning interne, un vétérinaire ou la direction si).

## ⚠️ Sécurité : ce qui est réel, ce qui est simulé

Ce projet est une démonstration. L'authentification (3 comptes en dur, mot de passe `demo`) est **simulée côté client** — ce n'est pas un vrai système de sécurité, et ce dépôt ne doit pas être utilisé tel quel pour un usage en production. Le garde-fou de sécurité de l'agent IA (guardrail), lui, est réel et tourne côté serveur (n8n) : un juge IA dédié filtre chaque message avant qu'il n'atteigne l'assistant, avec un deuxième niveau de vérification par rôle.

## Stack technique

- **[Astro](https://astro.build)** — pages statiques, zéro JavaScript framework côté client au-delà de ce qui est nécessaire.
- **JavaScript vanilla** pour l'authentification simulée et le rendu des tableaux de bord (pas de framework front lourd, volontairement).
- **[Chart.js](https://www.chartjs.org)** pour les graphiques du tableau de bord Direction.
- **[@n8n/chat](https://www.npmjs.com/package/@n8n/chat)** pour le widget de conversation, branché sur un webhook n8n public.
- **[Vercel](https://vercel.com)** pour l'hébergement et le déploiement continu.

Le backend (agent IA, RAG, mémoire, triage, évaluation) : **n8n** (orchestration), **Anthropic Claude** (Sonnet pour l'agent, Haiku pour les tâches de classification), **Cohere** (embeddings), **Qdrant** (base vectorielle), **Airtable** (données relationnelles : propriétaires, animaux, soins, vétérinaires, rendez-vous, monitoring).

## Structure du projet

```
src/
  layouts/Layout.astro       en-tête, pied de page, polices, widget de chat
  pages/
    index.astro              page publique
    connexion.astro          connexion (comptes de démo)
    espace/
      patient.astro
      veterinaire.astro
      directeur.astro
  styles/global.css          système de design (couleurs, typographie, composants)
public/
  site.js                    comptes de démo, navigation, authentification simulée
```

Chaque page d'espace connecté vérifie le rôle de l'utilisateur au chargement (`vcRequireRole`) et redirige vers la connexion ou vers le bon espace si besoin.

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
