// Logique partagée entre toutes les pages : comptes de démo, navigation, auth simulée.
// Auth SIMULÉE (comptes en dur, pas de vraie sécurité) : usage démo/portfolio uniquement.

window.VC_API = 'https://n8n-bbs9.vincentg-ia.cloud/webhook/vetcare-dashboard';
window.VC_API_PATIENTS = 'https://n8n-bbs9.vincentg-ia.cloud/webhook/vetcare-patients';
window.VC_WEBHOOK = 'https://n8n-bbs9.vincentg-ia.cloud/webhook/beec9f62-2a90-4c5f-9b33-c216fb162cfd/chat';

window.VC_ACCOUNTS = {
  'patient@vetcare.fr':   { password: 'demo', role: 'patient',     name: 'Marie Dubois', chatRole: 'public' },
  'veto@vetcare.fr':      { password: 'demo', role: 'veterinaire', name: 'Dr. Lefèvre',  chatRole: 'veterinaire' },
  'directeur@vetcare.fr': { password: 'demo', role: 'directeur',   name: 'Direction',    chatRole: 'directeur' },
};
window.VC_ROLE_LABEL = { patient: 'Patient', veterinaire: 'Vétérinaire', directeur: 'Directeur' };

window.vcCurrentUser = function () {
  const saved = localStorage.getItem('vc_email');
  const account = saved && window.VC_ACCOUNTS[saved];
  return account ? { email: saved, ...account } : null;
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

// À appeler en haut de chaque page d'espace connecté : redirige si non connecté ou mauvais rôle.
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

// Ouvre le chat et pré-remplit le champ de saisie (l'utilisateur reste libre de modifier avant d'envoyer).
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
