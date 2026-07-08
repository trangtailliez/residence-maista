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

// --- CRM Aloé (crm.aloe-immo.fr) — programme « Résidence MAISTÀ » ---
var CRM_WEBHOOK       = 'https://crm.aloe-immo.fr/api/webhooks/site/maista-porticcio';
var CRM_WEBHOOK_TOKEN = '50f2d695e08d581df8e42625f0ad6bceb4fe015282a08262';
// Option email-to-lead, non utilisée :
var CRM_EMAIL = '';
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
  // Email-to-lead (non utilisé par défaut)
  if (CRM_EMAIL){
    MailApp.sendEmail({
      to: CRM_EMAIL,
      subject: '[' + PROGRAMME + '] Lead — ' + (p.prenom || '') + ' ' + (p.nom || ''),
      body: JSON.stringify(Object.assign({programme: PROGRAMME}, p), null, 2),
      replyTo: p.email || ''
    });
  }
  // Webhook CRM Aloé — contrat /api/webhooks/wix/{slug}
  if (CRM_WEBHOOK){
    var message = [];
    if (p.typo) message.push('Typologie souhaitée : ' + p.typo);
    if (p.msg)  message.push(p.msg);
    if (p.page) message.push('Source : ' + p.page);
    UrlFetchApp.fetch(CRM_WEBHOOK, {
      method: 'post',
      contentType: 'application/json',
      headers: { 'x-webhook-secret': CRM_WEBHOOK_TOKEN },
      muteHttpExceptions: true,
      payload: JSON.stringify({
        firstName: p.prenom || '',
        lastName:  p.nom || '',
        email:     p.email || '',
        phone:     p.tel || '',
        message:   message.join('\n'),
        consent:   Boolean(p.consent)
      })
    });
  }
}

function _json(obj){
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
