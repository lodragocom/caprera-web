# -*- coding: utf-8 -*-
"""Genera i tre template email della Federazione.

Sono uno solo con tre riempimenti: quello che cambia e' il titolo, il testo,
l'etichetta del bottone e il congedo. Tenerli in un generatore invece che in
tre file copiati serve a una cosa sola — che una correzione al guscio non
debba essere fatta tre volte e dimenticata due.
"""
import pathlib

STEMMA = "https://ziggietzdtdtpsfmpthm.supabase.co/storage/v1/object/public/pubblico/stemma.png"

GUSCIO = """<!doctype html>
<html lang="it">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="dark">
<title>{titolo}</title>
</head>
<body style="margin:0;padding:0;background:#060d19;-webkit-text-size-adjust:100%;">

<!-- L'anteprima: e' la riga che si legge nella lista dei messaggi, prima di
     aprire. Senza, i client ci mettono l'inizio dell'HTML, che fa sembrare il
     messaggio spazzatura. -->
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">{anteprima}
&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;</div>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
       bgcolor="#060d19" style="background:#060d19;">
<tr><td align="center" style="padding:32px 12px;">

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
         style="max-width:480px;background:#0a1424;border:1px solid #1f2f4a;border-radius:14px;overflow:hidden;">

    <!-- Il tricolore. Sono tre celle colorate, non un'immagine: si vedono
         anche quando il client blocca le immagini, che e' il caso normale.
         L'identita' della Federazione non puo' dipendere da un permesso. -->
    <tr>
      <td height="3" bgcolor="#00863f" style="height:3px;line-height:3px;font-size:0;">&nbsp;</td>
      <td height="3" bgcolor="#f4f0e6" style="height:3px;line-height:3px;font-size:0;">&nbsp;</td>
      <td height="3" bgcolor="#c2192b" style="height:3px;line-height:3px;font-size:0;">&nbsp;</td>
    </tr>

    <tr><td colspan="3" style="padding:0;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">

        <tr><td align="center" bgcolor="#0f1c31"
                style="padding:24px 26px 18px;border-bottom:1px solid #1f2f4a;">
          <!-- L'alt e' vestito apposta: quando il client blocca le immagini —
               cioe' quasi sempre — il testo alternativo prende questi colori e
               resta una scritta della Federazione invece di un rettangolo rotto. -->
          <img src="{stemma}" width="72" height="72" alt="Federazione Caprera"
               style="display:block;width:72px;height:72px;border:0;outline:none;
                      font:500 11px/1.3 'Courier New',Courier,monospace;letter-spacing:.1em;
                      text-transform:uppercase;color:#d9b46a;text-align:center;">
          <div style="font:500 11px/1.3 'Courier New',Courier,monospace;letter-spacing:.16em;
                      text-transform:uppercase;color:#d9b46a;padding-top:12px;">Federazione Caprera</div>
          <div style="font:400 13px/1.4 -apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;
                      color:#9aa7bd;padding-top:3px;">{sottotitolo}</div>
        </td></tr>

        <tr><td style="padding:26px 26px 20px;font:400 15px/1.65 -apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#e8e4da;">
{corpo}
        </td></tr>

        <tr><td align="center" style="padding:0 26px 24px;">
          <!-- bgcolor sull'ancora oltre allo style: Outlook ignora il secondo. -->
          <a href="{{{{ .ConfirmationURL }}}}" bgcolor="#c9a227"
             style="display:inline-block;background:#c9a227;color:#060d19;text-decoration:none;
                    font:600 15px/1 -apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;
                    padding:14px 28px;border-radius:10px;">{bottone}</a>
        </td></tr>

        <tr><td style="padding:0 26px 24px;font:400 12px/1.6 -apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#64748b;">
          Se il bottone non funziona, copia questo indirizzo nel browser:<br>
          <span style="font-family:'Courier New',Courier,monospace;word-break:break-all;color:#9aa7bd;">{{{{ .ConfirmationURL }}}}</span>
        </td></tr>

        <tr><td bgcolor="#0a1424" style="padding:16px 26px;border-top:1px solid #1f2f4a;
                       font:400 12px/1.6 -apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#64748b;">
          {congedo}
        </td></tr>

      </table>
    </td></tr>
  </table>

  <div style="max-width:480px;padding:14px 8px 0;font:400 11px/1.6 -apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#4b5a72;text-align:center;">
    Federazione Caprera &middot; dal 2016<br>
    Questo messaggio parte da un indirizzo che non legge le risposte.
  </div>

</td></tr>
</table>
</body></html>
"""

TEMPLATE = {
  "conferma.html": dict(
    titolo="Conferma il tuo indirizzo",
    anteprima="Un ultimo passo e sei dentro l'archivio della Federazione.",
    sottotitolo="Conferma il tuo indirizzo",
    bottone="Conferma l&rsquo;indirizzo",
    corpo="""          <p style="margin:0 0 14px;">Hai chiesto di entrare nell&rsquo;archivio della Federazione con
          <strong style="color:#f4f0e6;">{{ .Email }}</strong>.</p>
          <p style="margin:0;">Confermalo qui sotto: serve solo a dimostrare che l&rsquo;indirizzo
          &egrave; davvero tuo.</p>""",
    congedo="Se non hai chiesto niente, ignora questo messaggio: senza la conferma non succede nulla.",
  ),
  "password.html": dict(
    titolo="Rifare la password",
    anteprima="Il collegamento per scegliere una password nuova.",
    sottotitolo="Rifare la password",
    bottone="Scegli una nuova password",
    corpo="""          <p style="margin:0 0 14px;">Qualcuno &mdash; speriamo tu &mdash; ha chiesto di reimpostare
          la password di <strong style="color:#f4f0e6;">{{ .Email }}</strong>.</p>
          <p style="margin:0;">Il bottone apre la pagina dove ne scegli una nuova.</p>""",
    congedo="Se non sei stato tu, ignora questo messaggio: la password di adesso resta valida.",
  ),
  "invito.html": dict(
    titolo="La tua Tessera del Tifoso",
    anteprima="La Presidenza ti ha intestato una societa'.",
    sottotitolo="La tua Tessera del Tifoso",
    bottone="Attiva la Tessera",
    corpo="""          <p style="margin:0 0 14px;">La Presidenza ha intestato una societ&agrave; a
          <strong style="color:#f4f0e6;">{{ .Email }}</strong>.</p>
          <p style="margin:0 0 14px;">Con la Tessera del Tifoso entri nella tua area: rosa,
          contratti, crediti, formazioni e dieci stagioni di archivio.</p>
          <p style="margin:0;">Il bottone ti porta a scegliere la password.</p>""",
    congedo="La societ&agrave; te l&rsquo;assegna la Presidenza, non si sceglie: se non &egrave; quella giusta, scrivile.",
  ),
}

d = pathlib.Path("supabase/email")
for nome, v in TEMPLATE.items():
    (d / nome).write_text(GUSCIO.format(stemma=STEMMA, **v), encoding="utf-8")
    print("scritto", nome)
