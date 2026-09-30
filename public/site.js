// Logique partagée entre toutes les pages : comptes de démo, navigation, auth simulée.
// Auth SIMULEE (comptes en dur, pas de vraie securite) : usage demo / portfolio uniquement.
// Modele d'acces a 4 niveaux :
//   niveau 1 = visiteur (non connecte)
//   niveau 2 = patient connecte (acces a ses propres animaux)
//   niveau 3 = veterinaire (ses patients, son planning)
//   niveau 4 = directeur (tout : operationnel + administration)
// L'identite (identity) sert au scoping cote agent IA : elle vient de la session,
// jamais de ce que l'utilisateur tape dans le chat.

window.VC_API = 'https://n8n-bbs9.vincentg-ia.cloud/webhook/vetcare-dashboard';
window.VC_API_PATIENTS = 'https://n8n-bbs9.vincentg-ia.cloud/webhook/vetcare-patients';
// Le chat passe par le relais /api/chat (limites de la demo appliquees par visiteur).
window.VC_WEBHOOK = '/api/chat';

// role : patient | veterinaire | directeur (sert au routage /espace/<role> et au chat)
// level : niveau d'acces 2, 3 ou 4
// identity : cle de scoping (nom du proprietaire pour un patient, nom du veterinaire pour un veto)
// Mot de passe commun 'demo' (temps 1). Identifiants/mots de passe uniques : temps 2.
window.VC_ACCOUNTS = {
  // Proprietaires (niveau 2) : login = leur email (domaine reserve example.com, garanti fictif)
  'marie.dubois@example.com':     { password: 'demo', role: 'patient', level: 2, name: 'Marie Dubois',     identity: 'Marie Dubois' },
  'paul.renard@example.com':      { password: 'demo', role: 'patient', level: 2, name: 'Paul Renard',      identity: 'Paul Renard' },
  'sophie.leroy@example.com':     { password: 'demo', role: 'patient', level: 2, name: 'Sophie Leroy',     identity: 'Sophie Leroy' },
  'julie.martin@example.com':     { password: 'demo', role: 'patient', level: 2, name: 'Julie Martin',     identity: 'Julie Martin' },
  'marc.petit@example.com':       { password: 'demo', role: 'patient', level: 2, name: 'Marc Petit',       identity: 'Marc Petit' },
  'lucas.bernard@example.com':    { password: 'demo', role: 'patient', level: 2, name: 'Lucas Bernard',    identity: 'Lucas Bernard' },
  'emma.fontaine@example.com':    { password: 'demo', role: 'patient', level: 2, name: 'Emma Fontaine',    identity: 'Emma Fontaine' },
  'nicolas.faure@example.com':    { password: 'demo', role: 'patient', level: 2, name: 'Nicolas Faure',    identity: 'Nicolas Faure' },
  'chloe.lemaire@example.com':    { password: 'demo', role: 'patient', level: 2, name: 'Chloé Lemaire',    identity: 'Chloé Lemaire' },
  'antoine.rousseau@example.com': { password: 'demo', role: 'patient', level: 2, name: 'Antoine Rousseau', identity: 'Antoine Rousseau' },

  // Veterinaires (niveau 3) : login = initiale.nom@vetcare.fr
  'l.lefevre@vetcare.fr': { password: 'demo', role: 'veterinaire', level: 3, name: 'Dr. Léa Lefèvre',  identity: 'Dr. Léa Lefèvre' },
  'k.moreau@vetcare.fr':  { password: 'demo', role: 'veterinaire', level: 3, name: 'Dr. Karim Moreau', identity: 'Dr. Karim Moreau' },
  'e.blanc@vetcare.fr':   { password: 'demo', role: 'veterinaire', level: 3, name: 'Dr. Elsa Blanc',   identity: 'Dr. Elsa Blanc' },
  'h.mercier@vetcare.fr': { password: 'demo', role: 'veterinaire', level: 3, name: 'Dr. Hugo Mercier', identity: 'Dr. Hugo Mercier' },
  'n.benali@vetcare.fr':  { password: 'demo', role: 'veterinaire', level: 3, name: 'Dr. Nadia Benali', identity: 'Dr. Nadia Benali' },
  't.girard@vetcare.fr':  { password: 'demo', role: 'veterinaire', level: 3, name: 'Dr. Thomas Girard', identity: 'Dr. Thomas Girard' },
  'c.roux@vetcare.fr':    { password: 'demo', role: 'veterinaire', level: 3, name: 'Dr. Camille Roux',  identity: 'Dr. Camille Roux' },
  's.nguyen@vetcare.fr':  { password: 'demo', role: 'veterinaire', level: 3, name: 'Dr. Sophie Nguyen', identity: 'Dr. Sophie Nguyen' },

  // Direction (niveau 4)
  'directeur@vetcare.fr': { password: 'demo', role: 'directeur', level: 4, name: 'Direction', identity: 'Direction' },

  // Raccourcis de demonstration (alias pratiques)
  'patient@vetcare.fr': { password: 'demo', role: 'patient',     level: 2, name: 'Marie Dubois',    identity: 'Marie Dubois' },
  'veto@vetcare.fr':    { password: 'demo', role: 'veterinaire', level: 3, name: 'Dr. Léa Lefèvre', identity: 'Dr. Léa Lefèvre' },
};

window.VC_ROLE_LABEL = { patient: 'Patient', veterinaire: 'Vétérinaire', directeur: 'Directeur' };

window.vcCurrentUser = function () {
  const saved = localStorage.getItem('vc_email');
  const account = saved && window.VC_ACCOUNTS[saved];
  return account ? { email: saved, ...account } : null;
};

// Contexte transmis au chat : role + identite + niveau, deduits de la session (jamais du message).
window.vcChatContext = function () {
  const u = window.vcCurrentUser();
  return u
    ? { role: u.role, identity: u.identity, niveau: u.level }
    : { role: 'public', identity: '', niveau: 1 };
};

window.vcRenderNav = function () {
  const nav = document.getElementById('nav');
  if (!nav) return;
  const u = window.vcCurrentUser();
  nav.innerHTML = u
    ? '<a class="btn ghost" href="/espace/' + u.role + '" style="margin-right:10px">Mon espace</a>'
      + '<span class="badge">' + window.VC_ROLE_LABEL[u.role] + '</span>'
      + '<span style="color:var(--muted);font-size:.85rem;margin-right:12px">' + u.name + '</span>'
      + '<button class="btn ghost" onclick="vcLogout()">Déconnexion</button>'
    : '<a class="btn" href="/connexion">Se connecter</a>';
};

window.vcLogout = function () {
  localStorage.removeItem('vc_email');
  location.href = '/';
};

window.vcDoLogin = function (e) {
  e.preventDefault();
  const email = document.getElementById('email').value.trim().toLowerCase();
  const pw = document.getElementById('password').value;
  const account = window.VC_ACCOUNTS[email];
  if (!account || account.password !== pw) {
    document.getElementById('loginErr').textContent = 'Identifiants incorrects. Utilisez un compte de démo ci-dessous.';
    return false;
  }
  localStorage.setItem('vc_email', email);
  location.href = '/espace/' + account.role;
  return false;
};

// A appeler en haut de chaque page d'espace connecte : redirige si non connecte ou mauvais role.
window.vcRequireRole = function (role) {
  const u = window.vcCurrentUser();
  if (!u) { location.href = '/connexion'; return null; }
  if (u.role !== role) { location.href = '/espace/' + u.role; return null; }
  return u;
};

window.vcOpenChat = function () {
  const b = document.querySelector('.chat-window-toggle');
  if (b) b.click();
};

// Ouvre le chat et pre-remplit le champ de saisie (l'utilisateur reste libre de modifier avant d'envoyer).
window.vcOpenChatWithMessage = function (text) {
  window.vcOpenChat();
  const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
  let tries = 0;
  (function trySet() {
    const el = document.querySelector('textarea[data-test-id="chat-input"]');
    if (el) {
      nativeSetter.call(el, text);
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.focus();
    } else if (tries++ < 25) {
      setTimeout(trySet, 100);
    }
  })();
};

document.addEventListener('DOMContentLoaded', window.vcRenderNav);
