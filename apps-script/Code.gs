/**
 * MAISTÀ — Réception des leads du site vitrine
 * ------------------------------------------------------------------
 * Pour chaque demande envoyée par le formulaire de contact :
 *   1. écrit une ligne dans le Google Sheet (onglet "Leads")
 *   2. envoie un email de notification à contact@aloe-immo.fr
 *   3. (optionnel) transmet le lead au CRM Aloé
 *
 * Déploiement : voir apps-script/README.md
 * ================================================================== */

// ============ CONFIG ============
var NOTIFY_EMAIL = 'romain@aloe-immo.fr, contact@aloe-immo.fr';  // destinataires de la notification
var SHEET_NAME   = 'Leads';                  // onglet du Google Sheet
var PROGRAMME    = 'MAISTA';                 // référence programme pour le CRM Aloé

// --- CRM Aloé : activer l'UNE des 2 options quand l'info sera connue ---
// Option A — email-to-lead : mettre l'adresse d'import du CRM (laisser '' si non utilisé)
var CRM_EMAIL = '';
// Option B — API / webhook : mettre l'URL (laisser '' si non utilisé) + le token éventuel
var CRM_WEBHOOK       = '';
var CRM_WEBHOOK_TOKEN = '';
// ================================

function doPost(e){
  try {
    var p = (e && e.parameter) ? e.parameter : {};

    // Anti-spam : champ honeypot rempli => robot, on ignore silencieusement.
    if (p.website) return _json({ ok: true });

    var now = new Date();
    _sheet().appendRow([
      now,
      p.prenom || '',
      p.nom || '',
      p.email || '',
      p.tel || '',
      p.typo || 'Indifférent',
      p.msg || '',
      p.consent ? 'Oui' : 'Non',
      p.page || ''
    ]);

    _notify(p, now);
    _forwardToCRM(p, now);

    return _json({ ok: true });
  } catch (err) {
    // On loggue mais on renvoie ok pour ne pas bloquer l'UX si seul le CRM échoue.
    console.error(err);
    return _json({ ok: false, error: String(err) });
  }
}

// Health-check : ouvrir l'URL /exec dans le navigateur doit renvoyer {ok:true}
function doGet(){
  return _json({ ok: true, service: 'MAISTA leads', ts: new Date() });
}

function _sheet(){
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_NAME);
  if (!sh){
    sh = ss.insertSheet(SHEET_NAME);
    sh.appendRow(['Date','Prénom','Nom','Email','Téléphone','Typologie','Message','Consentement','Source']);
    sh.getRange('1:1').setFontWeight('bold');
    sh.setFrozenRows(1);
  }
  return sh;
}

function _notify(p, now){
  var subject = '[' + PROGRAMME + '] Nouveau lead — ' + (p.prenom || '') + ' ' + (p.nom || '');
  var body =
    'Nouvelle demande depuis le site residence-maista.fr\n\n' +
    'Programme   : ' + PROGRAMME + '\n' +
    'Date        : ' + now.toLocaleString('fr-FR') + '\n' +
    'Prénom      : ' + (p.prenom || '') + '\n' +
    'Nom         : ' + (p.nom || '') + '\n' +
    'Email       : ' + (p.email || '') + '\n' +
    'Téléphone   : ' + (p.tel || '') + '\n' +
    'Typologie   : ' + (p.typo || 'Indifférent') + '\n' +
    'Message     : ' + (p.msg || '') + '\n' +
    'Consentement: ' + (p.consent ? 'Oui' : 'Non') + '\n' +
    'Source      : ' + (p.page || '') + '\n';
  MailApp.sendEmail({
    to: NOTIFY_EMAIL,
    subject: subject,
    body: body,
    name: 'Site MAISTÀ',
    replyTo: p.email || NOTIFY_EMAIL
  });
}

function _forwardToCRM(p, now){
  // Option A — email-to-lead
  if (CRM_EMAIL){
    MailApp.sendEmail({
      to: CRM_EMAIL,
      subject: '[' + PROGRAMME + '] Lead — ' + (p.prenom || '') + ' ' + (p.nom || ''),
      body: JSON.stringify(Object.assign({programme: PROGRAMME}, p), null, 2),
      replyTo: p.email || ''
    });
  }
  // Option B — API / webhook
  if (CRM_WEBHOOK){
    var headers = {};
    if (CRM_WEBHOOK_TOKEN) headers.Authorization = 'Bearer ' + CRM_WEBHOOK_TOKEN;
    UrlFetchApp.fetch(CRM_WEBHOOK, {
      method: 'post',
      contentType: 'application/json',
      headers: headers,
      muteHttpExceptions: true,
      payload: JSON.stringify({
        program:   PROGRAMME,
        firstname: p.prenom || '',
        lastname:  p.nom || '',
        email:     p.email || '',
        phone:     p.tel || '',
        type:      p.typo || '',
        message:   p.msg || '',
        source:    p.page || '',
        date:      now.toISOString()
      })
    });
  }
}

function _json(obj){
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
