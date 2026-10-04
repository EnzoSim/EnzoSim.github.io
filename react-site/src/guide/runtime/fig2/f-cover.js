/* Cover · One dashboard, twelve rules (stage #board), and the dashboard it draws (shared with f-tune.js).
   Paper: "Fig · 0 · One dashboard" (4TN-0), "· interacting" (6E6-0), "· phone" (6UJ-0), "· phone · interacting" (8KV-0);
   spec figspec/r0.json.
   The weekly review of an imaginary online shop, laid on the twelve-column grid, with the twelve rule keys above it.
   Point at a key (hover, focus, tap): the region that applies the rule is outlined (parts of fields for rules 3, 6, 9,
   10 and 11, the page's columns for rule 1), the rest dims, and the status states the rule. Point at a region: its keys
   light and the status names the rules it uses. Point at a week to read all three rows down one line; drag the staffing
   line on next week's forecast. Under 1080 px the keys become a scroller; under 640 px it sticks under the site header.
   FIG.coverDashboard(F, host, opts) draws the dashboard rows alone; the system chapter's tune figure uses rows A and B. */
(() => {
  'use strict';
  const NN = '\u202F', NB = '\u00A0';

  /* ---------- data: every number illustrative (figspec/r0.json "data") ---------- */
  const SIGN = [296, 312, 288, 305, 318, 290, 301, 322, 298, 309, 315, 412];
  const ORD = [1160, 1210, 1150, 1190, 1230, 1170, 1140, 1200, 1220, 1180, 1190, 1240];
  const REV = [81.2, 84.7, 80.5, 83.3, 86.1, 81.9, 79.8, 84.0, 85.4, 82.6, 83.3, 86.8];
  const PLAN = [83.5, 85.0, 86.5, 88.0, 89.5, 91.0, 92.5, 94.0, 95.5, 97.0, 98.5, 100.0];
  // Routine variation from weeks 1 to 11: the average plus or minus 2.66 times the average moving range.
  const routine = (v) => {
    const b = v.slice(0, 11), mean = b.reduce((s, x) => s + x, 0) / b.length;
    const mr = b.slice(1).map((x, i) => Math.abs(x - b[i])), mmr = mr.reduce((s, x) => s + x, 0) / mr.length;
    return { mean, hi: mean + 2.66 * mmr, lo: mean - 2.66 * mmr };
  };
  const ROWS = [
    { id: 'signups', v: SIGN, d: 0, dom: [250, 420], r: routine(SIGN) },
    { id: 'orders', v: ORD, d: 0, dom: [1050, 1320], r: routine(ORD) },
    { id: 'revenue', v: REV, d: 1, dom: [0, 110], plan: PLAN },
  ];
  const KPIS = [
    { id: 'orders', v: 1240, d: 0, max: 1500, cmp: 1430, kind: 'plan' },
    { id: 'revenue', v: 86.8, d: 1, max: 120, cmp: 100, kind: 'plan', unit: 'k' },
    { id: 'signups', v: 412, d: 0, max: 500, cmp: 330, kind: 'target' },
    { id: 'conversion', v: 2.6, d: 1, max: 4, cmp: 2.4, kind: 'lastYear', unit: '%' },
  ];
  const CASH = { opening: 120, receipts: 86.8, payments: 74.8, closing: 132, max: 240 }; // 120 + 86.8 = 74.8 + 132 = 206.8
  const TILES = [['north', 128, 1, 2, 1], ['west', 58, 0, 1, 2], ['central', 116, 1, 2, 2], ['east', 64, 0, 3, 2], ['south', 46, 0, 2, 3]];
  const PRODUCTS = [['A', 420, 31.2, 5], ['B', 310, 22.4, 2], ['C', 260, 15.6, -2], ['D', 150, 10.1, 14], ['E', 100, 7.5, 4]];
  const TOTAL = [1240, 86.8, 4];
  const OUTCOMES = [1150, 1175, 1175, 1200, 1200, 1200, 1225, 1225, 1225, 1225, 1250, 1250, 1250, 1275, 1275, 1275, 1300, 1300, 1325, 1350];
  // The staffing line stays on the drawn axis (1,133 to 1,367 orders); every reading from 0 to 20 of 20 is reachable.
  const STAFF = { def: 1290, min: 1140, max: 1360, step: 10, big: 50 };
  const AX = [1250 - 350 / 3, 1250 + 350 / 3]; // the dotplot's axis: one bin and a third beyond 1,150 and 1,350
  const SPAN = { instruments: 3, weeks: 8, cash: 4, regions: 4, products: 5, next: 7, words: 12 };
  const ORDER = ['instruments', 'weeks', 'cash', 'regions', 'products', 'next', 'words'];

  // From figspec/r0.json (rules) and content/en.js, fr.js (ruleExtras[n].oneLine), copied exactly.
  const RULES = {
    1: { ch: 2, hl: "overlay", key: {"en": "Grid", "fr": "Grille"},
      title: {"en": "Start from a grid that divides", "fr": "Partir d’une grille qui se divise"},
      one: {"en": "Choose a width whose sum with one gutter divides by every column count you need, then make the regions unequal on purpose.", "fr": "Choisissez une largeur dont la somme avec une gouttière se divise par chaque nombre de colonnes dont vous avez besoin, puis rendez les régions inégales à dessein."},
      here: {"en": "Here: the regions span 3 + 3 + 3 + 3, 8 + 4, 5 + 7 and 12 of the twelve columns, and every gap between them falls in a gutter.", "fr": "Ici : les régions couvrent 3 + 3 + 3 + 3, 8 + 4, 5 + 7 et 12 des douze colonnes, et chaque intervalle entre elles tombe dans une gouttière."},
      link: {"en": "/projects/dashboard-design-guide/frame-and-measure/#r1", "fr": "/projects/dashboard-design-guide/fr/cadre-et-mesure/#r1"} },
    2: { ch: 2, hl: "outline", key: {"en": "Instrument", "fr": "Instrument"},
      title: {"en": "Give every number an instrument", "fr": "Donner un instrument à chaque nombre"},
      one: {"en": "Give each headline number its unit, a scale, one comparator and the gap, and leave out bands nobody can define.", "fr": "Donnez à chaque chiffre clé son unité, une échelle, un comparateur et l’écart, et laissez de côté les bandes que personne ne sait définir."},
      here: {"en": "Here: each headline number carries its unit, a scale, one named comparator and the gap.", "fr": "Ici : chaque chiffre clé porte son unité, une échelle, un comparateur nommé et l’écart."},
      link: {"en": "/projects/dashboard-design-guide/frame-and-measure/#r2", "fr": "/projects/dashboard-design-guide/fr/cadre-et-mesure/#r2"} },
    3: { ch: 2, hl: "part", key: {"en": "Variation", "fr": "Variation"},
      title: {"en": "Compare against routine variation", "fr": "Comparer à la variation ordinaire"},
      one: {"en": "Treat a change as news only when it leaves the limits of routine variation, and say which reference you used until you have them.", "fr": "Ne tenez un changement pour un fait nouveau que lorsqu’il sort des limites de la variation ordinaire, et dites quelle référence vous employez tant que vous ne les avez pas."},
      here: {"en": "Here: sign-ups left their routine range in week 12; orders stayed inside theirs.", "fr": "Ici : les inscriptions sont sorties de leur plage ordinaire en semaine 12 ; les commandes sont restées dans la leur."},
      link: {"en": "/projects/dashboard-design-guide/frame-and-measure/#r3", "fr": "/projects/dashboard-design-guide/fr/cadre-et-mesure/#r3"} },
    4: { ch: 3, hl: "outline", key: {"en": "Identity", "fr": "Identité"},
      title: {"en": "Draw the identity", "fr": "Dessiner l’identité"},
      one: {"en": "When the numbers obey a law, draw the law: put both sides on one scale so the answer is a gap the eye can measure.", "fr": "Quand les nombres obéissent à une loi, dessinez la loi : placez les deux membres sur une même échelle, pour que la réponse soit un écart que l’œil peut mesurer."},
      here: {"en": "Here: opening plus receipts and payments plus closing share one scale, and both bars end at 206.8.", "fr": "Ici : solde d’ouverture plus encaissements et décaissements plus solde de clôture partagent une même échelle, et les deux barres finissent à 206,8."},
      link: {"en": "/projects/dashboard-design-guide/marks-and-surfaces/#r4", "fr": "/projects/dashboard-design-guide/fr/marques-et-surfaces/#r4"} },
    5: { ch: 3, hl: "outline", key: {"en": "Tone", "fr": "Ton"},
      title: {"en": "Shade for hierarchy, print the quantity", "fr": "Ombrer pour hiérarchiser, imprimer la quantité"},
      one: {"en": "Let tone say what belongs together and print the number wherever the amount matters; keep strong colour small.", "fr": "Laissez le ton dire ce qui va ensemble et imprimez le nombre partout où le montant compte ; réservez la couleur forte aux petites surfaces."},
      here: {"en": "Here: the two campaign regions share one tone, and every count is printed.", "fr": "Ici : les deux régions de la campagne partagent un même ton, et chaque nombre est imprimé."},
      link: {"en": "/projects/dashboard-design-guide/marks-and-surfaces/#r5", "fr": "/projects/dashboard-design-guide/fr/marques-et-surfaces/#r5"} },
    6: { ch: 3, hl: "part", key: {"en": "Fills", "fr": "Remplissage"},
      title: {"en": "Give each fill one job", "fr": "Donner un seul rôle à chaque remplissage"},
      one: {"en": "Give every fill one meaning and let its strength say how firm the quantity is; never let the accent also mean clickable.", "fr": "Donnez à chaque remplissage un seul sens et laissez son intensité dire à quel point la quantité est ferme ; ne laissez jamais l’accent signifier aussi « cliquable »."},
      here: {"en": "Here: solid is what happened, dashed is a plan, hatched is a forecast, and each keeps that meaning in every region.", "fr": "Ici : le plein dit ce qui a eu lieu, le tireté un plan, la hachure une prévision, et chacun garde ce sens dans chaque région."},
      link: {"en": "/projects/dashboard-design-guide/marks-and-surfaces/#r6", "fr": "/projects/dashboard-design-guide/fr/marques-et-surfaces/#r6"} },
    7: { ch: 4, hl: "outline", key: {"en": "Axis", "fr": "Axe"},
      title: {"en": "Share one axis", "fr": "Partager un même axe"},
      one: {"en": "Keep one set of columns for time and put every measure under it, so a reader compares by looking down instead of remembering.", "fr": "Gardez un seul jeu de colonnes pour le temps et placez chaque mesure dessous, pour qu’un lecteur compare en regardant vers le bas au lieu de se souvenir."},
      here: {"en": "Here: sign-ups, orders and revenue sit under the same twelve week columns; point at a week to read all three.", "fr": "Ici : inscriptions, commandes et chiffre d’affaires sont sous les mêmes douze colonnes de semaines ; pointez une semaine pour lire les trois."},
      link: {"en": "/projects/dashboard-design-guide/reading-order/#r7", "fr": "/projects/dashboard-design-guide/fr/ordre-de-lecture/#r7"} },
    8: { ch: 4, hl: "outline", key: {"en": "Tables", "fr": "Tableaux"},
      title: {"en": "Set tables to be read", "fr": "Composer les tableaux pour être lus"},
      one: {"en": "Edit a table like text: round to the digits that vary, order rows by size, align figures right, and remove every line the eye does not need.", "fr": "Révisez un tableau comme un texte : arrondissez aux chiffres qui varient, classez les lignes par grandeur, alignez les nombres à droite, et retirez chaque filet dont l’œil n’a pas besoin."},
      here: {"en": "Here: the products are ordered by revenue, rounded to the digits that vary, set right, with one in-cell bar and two rules.", "fr": "Ici : les produits sont classés par chiffre d’affaires, arrondis aux chiffres qui varient, alignés à droite, avec une barre dans la cellule et deux filets."},
      link: {"en": "/projects/dashboard-design-guide/reading-order/#r8", "fr": "/projects/dashboard-design-guide/fr/ordre-de-lecture/#r8"} },
    9: { ch: 4, hl: "part", key: {"en": "Figures", "fr": "Chiffres"},
      title: {"en": "Choose type for figures", "fr": "Choisir une typographie pour les chiffres"},
      one: {"en": "Pick a face whose figures are tabular and keep their width in bold, then measure the minus, the percent sign and the decimal point too.", "fr": "Choisissez un caractère dont les chiffres sont tabulaires et gardent leur chasse en gras, puis mesurez aussi le signe moins, le signe pour cent et le séparateur décimal."},
      here: {"en": "Here: every figure is tabular, so the columns hold still when a row turns bold.", "fr": "Ici : tous les chiffres sont tabulaires, donc les colonnes ne bougent pas quand une ligne passe en gras."},
      link: {"en": "/projects/dashboard-design-guide/reading-order/#r9", "fr": "/projects/dashboard-design-guide/fr/ordre-de-lecture/#r9"} },
    10: { ch: 5, hl: "part", key: {"en": "Spread", "fr": "Incertitude"},
      title: {"en": "Show uncertainty only when it is earned", "fr": "Ne montrer l’incertitude que lorsqu’elle est méritée"},
      one: {"en": "Draw a spread only when a model has measured its error, and then draw it as something a reader can count.", "fr": "Ne dessinez une dispersion que lorsqu’un modèle a mesuré son erreur, et dessinez-la alors comme quelque chose qu’un lecteur peut compter."},
      here: {"en": "Here: next week is drawn as 20 outcomes you can count, because its error was measured over 40 weeks; the plan carries no spread.", "fr": "Ici : la semaine prochaine est dessinée en 20 issues que l’on peut compter, parce que son erreur a été mesurée sur 40 semaines ; le plan n’a pas de dispersion."},
      link: {"en": "/projects/dashboard-design-guide/candour-and-control/#r10", "fr": "/projects/dashboard-design-guide/fr/franchise-et-controle/#r10"} },
    11: { ch: 5, hl: "part", key: {"en": "Control", "fr": "Commande"},
      title: {"en": "Put each control on its consequence", "fr": "Placer chaque commande sur sa conséquence"},
      one: {"en": "Put the control on a chart of what it changes, keep every change visible and reversible, and make an override give its reason.", "fr": "Placez la commande sur un graphique de ce qu’elle modifie, gardez chaque changement visible et réversible, et exigez qu’un ajustement manuel donne sa raison."},
      here: {"en": "Here: the staffing line sits on the forecast it changes; drag it and the chance of running short follows, and Undo steps back.", "fr": "Ici : la ligne d’effectif est posée sur la prévision qu’elle modifie ; déplacez-la et le risque de manquer suit, et Annuler revient en arrière."},
      link: {"en": "/projects/dashboard-design-guide/candour-and-control/#r11", "fr": "/projects/dashboard-design-guide/fr/franchise-et-controle/#r11"} },
    12: { ch: 5, hl: "outline", key: {"en": "Words", "fr": "Mots"},
      title: {"en": "Use plain words, and say what the numbers are", "fr": "Employer des mots simples et dire ce que sont les nombres"},
      one: {"en": "Use the reader’s words, define the terms they will search for, and say plainly what kind of number each figure is.", "fr": "Employez les mots du lecteur, définissez les termes qu’il cherchera, et dites clairement de quel type de nombre relève chaque chiffre."},
      here: {"en": "Here: every measure is named in the reader’s words and defined under the dashboard, and the numbers say they are illustrative.", "fr": "Ici : chaque mesure porte les mots du lecteur et est définie sous le tableau de bord, et les nombres disent qu’ils sont fictifs."},
      link: {"en": "/projects/dashboard-design-guide/candour-and-control/#r12", "fr": "/projects/dashboard-design-guide/fr/franchise-et-controle/#r12"} },
  };
  const REGION_SENT = {
    instruments: {"en": "Uses rules 2 and 9: every headline number has its unit, a scale, a named comparator and the gap, in tabular figures.", "fr": "Applique les règles 2 et 9 : chaque chiffre clé a son unité, une échelle, un comparateur nommé et l’écart, en chiffres tabulaires."},
    weeks: {"en": "Uses rules 3, 6 and 7: one set of week columns for every measure, a routine range for each series, and fills with one job each.", "fr": "Applique les règles 3, 6 et 7 : un seul jeu de colonnes de semaines pour chaque mesure, une plage ordinaire pour chaque série, et des remplissages à un seul rôle."},
    cash: {"en": "Uses rule 4: the cash identity is drawn, so the balance is a line the eye can check.", "fr": "Applique la règle 4 : l’identité de trésorerie est dessinée, donc l’équilibre est une ligne que l’œil vérifie."},
    regions: {"en": "Uses rule 5: tone groups the campaign regions and every count is printed.", "fr": "Applique la règle 5 : le ton regroupe les régions de la campagne et chaque nombre est imprimé."},
    products: {"en": "Uses rules 8 and 9: ordered by revenue, rounded to the digits that vary, set right with one in-cell bar and two rules; every figure tabular.", "fr": "Applique les règles 8 et 9 : classé par chiffre d’affaires, arrondi aux chiffres qui varient, aligné à droite avec une barre et deux filets ; chiffres tabulaires."},
    next: {"en": "Uses rules 10, 11 and 6: a measured forecast drawn as outcomes to count, the staffing control on top of it, and hatching for what is forecast.", "fr": "Applique les règles 10, 11 et 6 : une prévision mesurée dessinée en issues à compter, la commande d’effectif posée dessus, et la hachure pour ce qui est prévu."},
    words: {"en": "Uses rule 12: every measure is defined in the reader’s words.", "fr": "Applique la règle 12 : chaque mesure est définie avec les mots du lecteur."},
  };
  const REGION_RULES = { instruments: [2, 9], weeks: [3, 6, 7], cash: [4], regions: [5], products: [8, 9], next: [6, 10, 11], words: [12] };
  const TERMS = {"en": [["Orders", "Paid orders, counted in the week they are paid."], ["Revenue", "What paid orders brought in after refunds and before tax, in thousands of dollars."], ["Sign-ups", "New accounts with a confirmed email address."], ["Routine range", "The average of weeks 1 to 11, plus or minus 2.66 times the average change from week to week."]], "fr": [["Commandes", "Les commandes payées, comptées dans la semaine de leur paiement."], ["Chiffre d’affaires", "Ce que les commandes payées ont rapporté, après remboursements et avant taxes, en milliers de dollars."], ["Inscriptions", "Les nouveaux comptes dont l’adresse électronique est confirmée."], ["Plage ordinaire", "La moyenne des semaines 1 à 11, plus ou moins 2,66 fois l’écart moyen d’une semaine à la suivante."]]} ;
  const LABELS = {"en": {"keysAria": "The twelve rules", "reading": "Reading", "week12": "Week 12", "ruleOf": "Rule {n} of 12", "region": "Region", "readIt": "Read it in chapter {n} →", "undo": "Undo", "reset": "Reset", "staffFor": "staff for {N}", "ordersInWeek13": "orders in week 13", "week": "Week", "routineRange": "routine range", "signal": "signal", "plan": "plan", "forecast": "forecast", "staffing": "staffing", "campaign": "campaign", "total": "Total", "outcomesAbove": "outcomes are above the staffing line: a {share} chance of running short.", "medianLine": "Median 1,240; 90% between 1,175 and 1,325.", "errorLine": "Error measured over the last 40 weeks.", "bothBars": "Both bars end at 206.8, so the week balances.", "belowPlan": "below plan", "routine": "routine", "perWeek": "per week", "kPerWeek": "$K per week", "columns": "{n} columns"}, "fr": {"keysAria": "Les douze règles", "reading": "Lecture", "week12": "Semaine 12", "ruleOf": "Règle {n} sur 12", "region": "Région", "readIt": "La lire au chapitre {n} →", "undo": "Annuler", "reset": "Réinitialiser", "staffFor": "effectif pour {N}", "ordersInWeek13": "commandes en semaine 13", "week": "Semaine", "routineRange": "plage ordinaire", "signal": "signal", "plan": "plan", "forecast": "prévision", "staffing": "effectif", "campaign": "campagne", "total": "Total", "outcomesAbove": "issues sont au-dessus de la ligne d’effectif : {share} de risque de manquer.", "medianLine": "Médiane 1 240 ; 90 % entre 1 175 et 1 325.", "errorLine": "Erreur mesurée sur les 40 dernières semaines.", "bothBars": "Les deux barres finissent à 206,8 : la semaine est équilibrée.", "belowPlan": "sous le plan", "routine": "ordinaire", "perWeek": "par semaine", "kPerWeek": "k$ par semaine", "columns": "{n} colonnes"}} ;
  const STATUS = {"default": {"en": {"which": ["Reading", "Week 12"], "lead": "Sign-ups rose above their routine range, the only signal this week.", "rest": "Orders stayed inside theirs, and revenue is 13.2 below a plan that assumed growth.", "hint": "Point at a rule to find it on the page, or at a region to see the rules it uses."}, "fr": {"which": ["Lecture", "Semaine 12"], "lead": "Les inscriptions sont sorties par le haut de leur plage ordinaire, seul signal de la semaine.", "rest": "Les commandes sont restées dans la leur, et le chiffre d’affaires est 13,2 sous un plan qui supposait de la croissance.", "hint": "Pointez une règle pour la trouver sur la page, ou une région pour voir les règles qu’elle applique."}}, "week": {"en": "<b>Week {w}: {signups} sign-ups, {orders} orders, {revenue} $K of revenue.</b> {signalClause}", "fr": "<b>Semaine {w} : {signups} inscriptions, {orders} commandes, {revenue} k$ de chiffre d’affaires.</b> {signalClause}", "signalClause": {"en": {"inside": "Every measure is inside its routine range.", "signal": "Sign-ups are outside their routine range: a signal."}, "fr": {"inside": "Chaque mesure est dans sa plage ordinaire.", "signal": "Les inscriptions sont hors de leur plage ordinaire : un signal."}}}, "staffing": {"en": "<b>Staff for {N} orders: {k} of 20 outcomes are higher, a {share} chance of running short.</b> The median outcome is 1,240.", "fr": "<b>Effectif pour {N} commandes : {k} issues sur 20 sont au-dessus, soit {share} de risque de manquer.</b> L’issue médiane est 1 240.", "share": "k of 20 as words when exact (1 in 5, 1 in 4, 1 in 2, 1 in 10, 1 in 20); otherwise a whole percentage", "none": {"en": "No outcome is higher: staff covers all twenty.", "fr": "Aucune issue n’est au-dessus : l’effectif couvre les vingt."}}} ;

  /* ---------- words (everything not in the tables above) ---------- */
  const T = {
    sheetTitle: { en: 'Weekly review', fr: 'Revue de la semaine' },
    sheetHint: { en: 'an imaginary online shop · week 12 · illustrative numbers', fr: 'une boutique en ligne imaginaire · semaine 12 · nombres fictifs' },
    kpi: {
      en: { orders: ['Orders', 'week 12'], revenue: ['Revenue', 'week 12'], signups: ['Sign-ups', 'week 12'], conversion: ['Conversion', 'orders ÷ visitors'] },
      fr: { orders: ['Commandes', 'semaine 12'], revenue: ['Chiffre d’affaires', 'semaine 12'], signups: ['Inscriptions', 'semaine 12'], conversion: ['Conversion', 'commandes ÷ visiteurs'] },
    },
    unitK: { en: '$K', fr: 'k$' },
    cmp: { en: { plan: 'plan', target: 'target', lastYear: 'last year' }, fr: { plan: 'plan', target: 'objectif', lastYear: 'l’an dernier' } },
    wkTitle: { en: 'Week by week', fr: 'Semaine par semaine' },
    wkCtx: { en: 'weeks 1 to 12, one axis for every measure', fr: 'semaines 1 à 12, un seul axe pour chaque mesure' },
    rowName: { en: { signups: 'Sign-ups', orders: 'Orders', revenue: 'Revenue' }, fr: { signups: 'Inscriptions', orders: 'Commandes', revenue: 'Chiffre d’affaires' } },
    revK: { en: 'Revenue, $K', fr: 'Chiffre d’affaires, k$' },
    range: { en: (lo, hi) => `range ${lo} to ${hi}`, fr: (lo, hi) => `plage de ${lo} à ${hi}` },
    planV: { en: (v) => `plan ${v}`, fr: (v) => `plan ${v}` },
    abovePlan: { en: 'above plan', fr: 'au-dessus du plan' },
    onPlan: { en: 'on plan', fr: 'au niveau du plan' },
    wkAria: {
      en: (o) => `Sign-ups, orders and revenue for weeks 1 to 12. Sign-ups: week 12 at ${o.s} is above the routine range of ${o.slo} to ${o.shi}. Orders: week 12 at ${o.o} is inside the routine range of ${o.olo} to ${o.ohi}. Revenue: week 12 at ${o.r} $K, below the plan of ${o.p}.`,
      fr: (o) => `Inscriptions, commandes et chiffre d’affaires des semaines 1 à 12. Inscriptions : la semaine 12, à ${o.s}, est au-dessus de la plage ordinaire de ${o.slo} à ${o.shi}. Commandes : la semaine 12, à ${o.o}, est dans la plage ordinaire de ${o.olo} à ${o.ohi}. Chiffre d’affaires : ${o.r} k$ en semaine 12, sous le plan de ${o.p}.`,
    },
    cashTitle: { en: 'Cash', fr: 'Trésorerie' },
    cashCtx: { en: 'week 12, $K', fr: 'semaine 12, k$' },
    // French uses the short plain words, so each label fits inside its bar.
    seg: { en: { opening: 'opening', receipts: 'receipts', payments: 'payments', closing: 'closing' }, fr: { opening: 'ouverture', receipts: 'entrées', payments: 'sorties', closing: 'clôture' } },
    cashAria: {
      en: (o) => `Cash in week 12, $K: opening ${o.a} plus receipts ${o.b} makes ${o.t}; payments ${o.c} plus closing ${o.d} makes ${o.t}. The week balances.`,
      fr: (o) => `Trésorerie en semaine 12, k$ : ouverture ${o.a} plus entrées ${o.b} font ${o.t} ; sorties ${o.c} plus clôture ${o.d} font ${o.t}. La semaine est équilibrée.`,
    },
    regTitle: { en: 'Sign-ups by region', fr: 'Inscriptions par région' },
    week12: { en: 'week 12', fr: 'semaine 12' },
    region: { en: { north: 'North', west: 'West', central: 'Central', east: 'East', south: 'South' }, fr: { north: 'Nord', west: 'Ouest', central: 'Centre', east: 'Est', south: 'Sud' } },
    prTitle: { en: 'Products', fr: 'Produits' },
    prCtx: { en: 'week 12, ordered by revenue', fr: 'semaine 12, classés par chiffre d’affaires (CA)' },
    prCtxN: { en: 'week 12, revenue in $K, ordered by revenue', fr: 'semaine 12, chiffre d’affaires (CA) en k$, classés par CA' },
    prCols: { en: ['Product', 'Orders', 'Revenue, $K', 'vs weeks 8–11'], fr: ['Produit', 'Commandes', 'CA, k$', 'vs sem. 8–11'] },
    prColsN: { en: ['Product', 'Orders', 'Revenue', 'vs 8–11'], fr: ['Produit', 'Commandes', 'CA', 'vs 8–11'] },
    product: { en: (x) => `Product ${x}`, fr: (x) => `Produit ${x}` },
    prAria: { en: 'Products in week 12, ordered by revenue', fr: 'Produits en semaine 12, classés par chiffre d’affaires' },
    nxTitle: { en: 'Orders next week', fr: 'Commandes la semaine prochaine' },
    nxCtx: { en: 'week 13, twenty equally likely outcomes', fr: 'semaine 13, vingt issues également probables' },
    countOf: { en: (k) => `<span class="cv-cn">${k}</span> of 20`, fr: (k) => `<span class="cv-cn">${k}</span> sur 20` },
    above1: { en: 'outcome is above the staffing line: a {share} chance of running short.', fr: 'issue est au-dessus de la ligne d’effectif : {share} de risque de manquer.' },
    share: { en: { 1: '1\u00A0in\u00A020', 2: '1\u00A0in\u00A010', 4: '1\u00A0in\u00A05', 5: '1\u00A0in\u00A04', 10: '1\u00A0in\u00A02' }, fr: { 1: '1\u00A0sur\u00A020', 2: '1\u00A0sur\u00A010', 4: '1\u00A0sur\u00A05', 5: '1\u00A0sur\u00A04', 10: '1\u00A0sur\u00A02' } },
    median: { en: (m, a, b) => `Median ${m}; 90% between ${a} and ${b}.`, fr: (m, a, b) => `Médiane ${m} ; 90${NN}% entre ${a} et ${b}.` },
    staffAria: { en: 'Staffing line', fr: 'Ligne d’effectif' },
    staffText: { en: (n, k) => `staff for ${n} orders, ${k} of 20 outcomes higher`, fr: (n, k) => `effectif pour ${n} commandes, ${k} issues sur 20 au-dessus` },
    dpAria: {
      en: (n, k) => `Orders in week 13 as twenty equally likely outcomes, from 1,150 to 1,350, median 1,240. The staffing line is at ${n}; ${k} of 20 outcomes are higher.`,
      fr: (n, k) => `Commandes en semaine 13 en vingt issues également probables, de 1 150 à 1 350, médiane 1 240. La ligne d’effectif est à ${n} ; ${k} issues sur 20 sont au-dessus.`,
    },
    wdTitle: { en: 'What the numbers are', fr: 'Ce que sont les nombres' },
    wdCtx: { en: 'plain words for every measure on this page', fr: 'des mots simples pour chaque mesure de la page' },
    // cover only
    ruleAria: { en: (n, s) => `Rule ${n}: ${s}`, fr: (n, s) => `Règle ${n} : ${s}` },
    ruleOf: { en: (n) => `Rule ${n} of 12`, fr: (n) => `Règle ${n} sur 12` },
    readIt: { en: (c) => `Read it in chapter ${c} →`, fr: (c) => `La lire au chapitre ${c} →` },
    weekN: { en: (w) => `Week ${w}`, fr: (w) => `Semaine ${w}` },
    readingWeek: { en: (w) => `Reading · week ${w}`, fr: (w) => `Lecture · semaine ${w}` },
    rulesList: {
      en: (ns) => (ns.length === 1 ? `Rule ${ns[0]}` : `Rules ${ns.slice(0, -1).join(', ')} and ${ns[ns.length - 1]}`),
      fr: (ns) => (ns.length === 1 ? `Règle ${ns[0]}` : `Règles ${ns.slice(0, -1).join(', ')} et ${ns[ns.length - 1]}`),
    },
    stripRegion: { en: (title, list, many) => `${title} ${many ? 'use' : 'uses'} ${list}`, fr: (title, list) => `${title} : ${list}` },
    stripRule: { en: (n, s) => `Rule ${n} · ${s}`, fr: (n, s) => `Règle ${n} · ${s}` },
    staffTitle: { en: (n) => `Staff for ${n} orders`, fr: (n) => `Effectif pour ${n} commandes` },
    hintTouch: { en: 'Tap a rule to find it on the page, or a region to see its rules.', fr: 'Touchez une règle pour la trouver sur la page, ou une région pour voir ses règles.' },
    columns: { en: (n) => `${n} columns`, fr: (n) => `${n} colonnes` },
  };

  const pc = (k) => (Math.max(0, Math.min(1, k)) * 100).toFixed(3) + '%';
  const fill = (s, o) => String(s).replace(/\{(\w+)\}/g, (m, k) => (o[k] != null ? o[k] : m));
  const above = (n) => OUTCOMES.filter((v) => v > n).length;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const union = (rs) => {
    const ok = rs.filter((r) => r && (r.width > 0 || r.height > 0));
    if (!ok.length) return null;
    const l = Math.min(...ok.map((r) => r.left)), t = Math.min(...ok.map((r) => r.top));
    const r_ = Math.max(...ok.map((r) => r.right)), b = Math.max(...ok.map((r) => r.bottom));
    return { left: l, top: t, right: r_, bottom: b, width: r_ - l, height: b - t };
  };

  /* =====================================================================================================
     The dashboard: rows A (instruments), B (week by week; cash over regions), C (products; next week),
     D (words), on a grid of twelve equal columns with the inset as gap.
     opts: { rows: 'ABCD', uid, describedBy (id of the status the fields point to), interactive (fields focusable; default
     true), onWeek(w|null, src), onStaff(phase), onSettle(field), onLayout() }
     ===================================================================================================== */
  function coverDashboard(F, host, opts = {}) {
    const rows = opts.rows || 'ABCD';
    const uid = opts.uid || 'cv';
    const t = F.t, num = F.num, fr = F.fr, esc = F.esc;
    const lab = t(LABELS);
    const desc = opts.describedBy ? ` aria-describedby="${opts.describedBy}"` : '';
    const st = { week: null, N: STAFF.def, hist: [], row: 28, dragging: false, k: above(STAFF.def) };
    const signed = (v, d) => F.signed(v, d);
    const pctS = (v) => signed(v, 0) + (F.lang === 'fr' ? NN + '%' : '%');
    const live = opts.interactive !== false;
    const field = (cls, region, label, inner, extra = '') =>
      `<div class="cv-f ${cls}" data-region="${region}" role="group" aria-label="${esc(label)}"${live ? ' tabindex="0"' : ''}${desc}${extra}>${inner}</div>`;
    const tbar = (title, ctx, legend = '', part = '') =>
      `<div class="cv-tbar"${part ? ` data-part="${part}"` : ''}><div class="cv-tt"><b>${title}</b>${ctx}</div>${legend ? `<div class="cv-lg">${legend}</div>` : ''}</div>`;
    const dash16 = `<svg class="cv-lgi" width="16" height="10" viewBox="0 0 16 10" aria-hidden="true"><line x1="0" y1="5" x2="16" y2="5" class="cv-plan"/></svg>`;

    /* ---------- markup ---------- */
    const kpiHTML = (k, i) => {
      const [name, ctx] = t(T.kpi)[k.id];
      const unit = k.unit === 'k' ? t(T.unitK) : k.unit === '%' ? '%' : '';
      const cmp = `${t(T.cmp)[k.kind]} ${k.unit === '%' ? F.pct(k.cmp, 1) : num(k.cmp, k.d)}`;
      const gap = signed(k.v - k.cmp, k.d) + (k.unit === '%' ? NB + 'pt' : '');
      return field('cv-kpi', 'instruments', name, `<div class="cv-kh" data-part="kpi-head"><span class="cv-kl">${name}</span><span class="cv-kc">${ctx}</span></div>
        <div class="cv-kv" data-part="kpi-value"><span class="cv-kn" data-v="${k.v}" data-d="${k.d}">${num(k.v, k.d)}</span>${unit ? `<span class="cv-ku">${unit}</span>` : ''}</div>
        <div class="cv-ks" data-part="kpi-scale" aria-hidden="true"><i class="cv-ktr"></i><i class="cv-kbar" style="width:${pc(k.v / k.max)}"></i><i class="cv-ktk" style="left:${pc(k.cmp / k.max)}"></i></div>
        <div class="cv-kf" data-part="kpi-foot"><b>${gap}</b><span>${fr(cmp)}</span></div>`, ` data-k="${k.id}" style="--o:${i}"`);
    };
    const weeksHTML = () => field('cv-weeks', 'weeks', t(T.wkTitle), tbar(t(T.wkTitle), `<span>${t(T.wkCtx)}</span>`,
      `<span><i class="cv-sw cv-sw-rng"></i>${lab.routineRange}</span><span><i class="cv-sw cv-sw-sig"></i>${lab.signal}</span><span>${dash16}${lab.plan}</span>`, 'wk-head') +
      `<div class="cv-chart"></div>`, ' style="--o:4"');
    const cashHTML = () => {
      const C = CASH, s = t(T.seg), p = (v) => pc(v / C.max), tot = C.opening + C.receipts;
      const n1 = (v) => num(v, 1);
      const seg = (cls, l, w, word, v) => `<span class="cv-seg ${cls}" style="left:${l};width:${w}"><span><em>${word}${NB}</em>${n1(v)}</span></span>`;
      return field('cv-cash', 'cash', t(T.cashTitle), tbar(t(T.cashTitle), `<span>${t(T.cashCtx)}</span>`) +
        `<div class="cv-id" role="img" aria-label="${esc(fr(t(T.cashAria, { a: n1(C.opening), b: n1(C.receipts), c: n1(C.payments), d: n1(C.closing), t: n1(tot) })))}">
          <div class="cv-idr">${seg('cv-bal cv-l', '0px', p(C.opening), s.opening, C.opening)}${seg('cv-flow cv-r', `calc(${p(C.opening)} + 2px)`, `calc(${p(C.receipts)} - 2px)`, s.receipts, C.receipts)}</div>
          <div class="cv-idr cv-idr2">${seg('cv-flow cv-l', '0px', p(C.payments), s.payments, C.payments)}${seg('cv-bal cv-r', `calc(${p(C.payments)} + 2px)`, `calc(${p(C.closing)} - 2px)`, s.closing, C.closing)}</div>
          <i class="cv-idl" style="left:calc(${p(tot)} + .5px)"></i><b class="cv-idt" style="left:calc(${p(tot)} + 8.5px)">${n1(tot)}</b>
        </div><p class="cv-cap">${fr(lab.bothBars)}</p>`, ' style="--o:5"');
    };
    const regionsHTML = () => field('cv-regions', 'regions', t(T.regTitle), tbar(t(T.regTitle), `<span>${t(T.week12)}</span>`, `<span><i class="cv-sw cv-sw-camp"></i>${lab.campaign}</span>`) +
      `<div class="cv-tiles">${TILES.map(([id, n, camp, c, r], i) => `<div class="cv-tile${camp ? ' is-camp' : ''}" style="grid-column:${c};grid-row:${r};--i:${i}"><span>${t(T.region)[id]}</span><b>${num(n)}</b></div>`).join('')}</div>`, ' style="--o:6"');
    const productsHTML = () => {
      const c = t(T.prCols), cn = t(T.prColsN), two = (a, b) => `<span class="cv-wd">${a}</span><span class="cv-nw">${b}</span>`;
      const max = PRODUCTS[0][2];
      const tr = (cells, cls, i) => `<div class="cv-tr${cls}" role="row" style="--i:${i}">${cells}</div>`;
      const head = tr(`<span role="columnheader" data-part="pr-name">${c[0]}</span><span role="columnheader" data-part="pr-orders">${c[1]}</span><span role="columnheader" data-part="pr-rev">${two(c[2], cn[2])}</span><span data-part="pr-bar" aria-hidden="true"></span><span role="columnheader" data-part="pr-chg">${two(c[3], cn[3])}</span>`, ' cv-th', 0);
      const body = PRODUCTS.map(([x, o, r, ch], i) => tr(`<span role="rowheader" data-part="pr-name">${t(T.product, x)}</span><span role="cell" data-part="pr-orders">${num(o)}</span><span role="cell" data-part="pr-rev">${num(r, 1)}</span><span data-part="pr-bar" aria-hidden="true"><i class="cv-ib" style="width:${pc(r / max)}"></i></span><span role="cell" data-part="pr-chg">${pctS(ch)}</span>`, '', i + 1)).join('');
      const tot = tr(`<span role="rowheader" data-part="pr-name">${lab.total}</span><span role="cell" data-part="pr-orders">${num(TOTAL[0])}</span><span role="cell" data-part="pr-rev">${num(TOTAL[1], 1)}</span><span data-part="pr-bar" aria-hidden="true"></span><span role="cell" data-part="pr-chg">${pctS(TOTAL[2])}</span>`, ' cv-ttl', 6);
      return field('cv-products', 'products', t(T.prTitle), tbar(t(T.prTitle), two(t(T.prCtx), t(T.prCtxN))) +
        `<div class="cv-tab" role="table" aria-label="${esc(t(T.prAria))}">${head}${body}${tot}</div>`, ' style="--o:7"');
    };
    const nextHTML = () => {
      const hk = `${uid}-hk`;
      const hatchKey = `<svg class="cv-lgi" width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">${F.hatch(hk, 'cv-hatch-key')}<circle cx="6" cy="6" r="5.25" class="cv-dot-h" fill="url(#${hk})"/></svg>`;
      return field('cv-next', 'next', t(T.nxTitle), tbar(t(T.nxTitle), `<span>${t(T.nxCtx)}</span>`, `<span>${hatchKey}${lab.forecast}</span><span>${dash16}${lab.staffing}</span>`, 'nx-head') +
        `<div class="cv-nx"><div class="cv-dp" data-part="nx-plot"></div>
          <div class="cv-ro"><div class="cv-cnt" data-part="nx-count"><div class="cv-cnt-n"></div><p class="cv-cnt-s"></p></div>
            <div class="cv-notes" data-part="nx-notes"><p>${fr(t(T.median, num(1240), num(1175), num(1325)))}</p><p>${fr(lab.errorLine)}</p></div>
            <div class="cv-hist"><button type="button" class="f2-btn" data-act="undo">${lab.undo}</button><button type="button" class="f2-btn" data-act="reset">${lab.reset}</button></div></div></div>`, ' style="--o:8"');
    };
    const wordsHTML = () => field('cv-words', 'words', t(T.wdTitle), tbar(t(T.wdTitle), `<span>${t(T.wdCtx)}</span>`) +
      `<dl class="cv-terms">${t(TERMS).map(([a, b]) => `<div><dt>${a}</dt><dd>${fr(b)}</dd></div>`).join('')}</dl>`, ' style="--o:9"');

    host.innerHTML = `<div class="cv-grid">${rows.includes('A') ? KPIS.map(kpiHTML).join('') : ''}${rows.includes('B') ? weeksHTML() + cashHTML() + regionsHTML() : ''}${rows.includes('C') ? productsHTML() + nextHTML() : ''}${rows.includes('D') ? wordsHTML() : ''}</div>`;
    const q = (s) => host.querySelector(s);
    const qa = (s) => [...host.querySelectorAll(s)];
    const fields = qa('.cv-f');
    const byRegion = {};
    fields.forEach((f) => (byRegion[f.dataset.region] = byRegion[f.dataset.region] || []).push(f));

    /* ---------- week by week ---------- */
    const chart = q('.cv-chart');
    let G = null, hair = null, vals = [], ticks = [];
    const yOf = (i, v) => { const r = ROWS[i]; return G.top(i) + G.band - ((v - r.dom[0]) / (r.dom[1] - r.dom[0])) * G.band; };
    const wordOf = (i, w) => {
      const r = ROWS[i], v = r.v[w - 1];
      if (r.plan) { const p = r.plan[w - 1]; return [Math.abs(v - p) < 0.05 ? t(T.onPlan) : v < p ? lab.belowPlan : t(T.abovePlan), false]; }
      const sig = v > r.r.hi || v < r.r.lo;
      return [sig ? lab.signal : lab.routine, sig];
    };
    function drawWeeks() {
      if (!chart) return;
      const W = Math.max(240, Math.round(chart.clientWidth || 0));
      if (W === 240 && !chart.clientWidth) return;
      const wide = W >= 560;
      if (wide) {
        const band = 2 * st.row, pitch = band + 16, L = 116, R = W - 109;
        G = { wide, W, band, pitch, L, R, cw: (R - L) / 12, top: (i) => i * pitch + 8, H: 3 * pitch + 24 };
      } else {
        const band = Math.round((44 * st.row) / 28), pitch = band + 44;
        G = { wide, W, band, pitch, L: 0, R: W, cw: W / 12, top: (i) => i * pitch + 28, H: 2 * pitch + 28 + band + 28 };
      }
      G.x = (w) => G.L + (w - 0.5) * G.cw;
      const { L, R } = G, x = G.x, crisp = (v) => Math.round(v) + 0.5;
      const ptR = wide ? 2.75 : 2.25, sigR = wide ? 5.5 : 5, lastR = wide ? 4.5 : 4, bw = wide ? 16 : 12;
      const base = G.top(2) + G.band;
      let svg = '';
      ROWS.forEach((r, i) => {
        if (r.plan) {
          const bars = r.v.map((v, j) => F.rect(x(j + 1) - bw / 2, yOf(i, v), bw, base - yOf(i, v), 'cv-bar', 2, { style: `--i:${j}` })).join('');
          const plan = `<polyline class="cv-planl" points="${r.plan.map((v, j) => `${x(j + 1).toFixed(1)},${yOf(i, v).toFixed(1)}`).join(' ')}"/>`;
          svg += `<g data-part="wk-${r.id}">${bars}${plan}${F.line(L, base + 0.5, R, base + 0.5, 'cv-base')}</g>`;
          return;
        }
        const yh = yOf(i, r.r.hi), yl = yOf(i, r.r.lo), pts = r.v.map((v, j) => [x(j + 1), yOf(i, v)]);
        const dots = pts.slice(0, 11).map((p, j) => F.circle(p[0], p[1], ptR, 'cv-pt', { style: `--i:${j}` })).join('');
        const last = pts[11];
        const lastDot = i === 0 ? F.circle(last[0], last[1], sigR, 'cv-sig') : F.circle(last[0], last[1], lastR, 'cv-last');
        svg += `<g data-part="wk-${r.id}">${F.rect(L, yh, R - L, yl - yh, 'cv-rng', 3)}${F.line(L, crisp(yOf(i, r.r.mean)) , R, crisp(yOf(i, r.r.mean)), 'cv-mean')}<polyline class="cv-line" points="${pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')}"/>${dots}${lastDot}</g>`;
      });
      svg += `<line class="cv-hair" x1="0" y1="${G.top(0) - 4}" x2="0" y2="${base + 4}"/>`;
      const o = { s: num(412), slo: num(ROWS[0].r.lo), shi: num(ROWS[0].r.hi), o: num(1240), olo: num(ROWS[1].r.lo), ohi: num(ROWS[1].r.hi), r: num(86.8, 1), p: num(100, 1) };
      let html = `<svg class="f2-svg cv-wsvg" width="${W}" height="${base + 4}" viewBox="0 0 ${W} ${base + 4}" role="img" aria-label="${esc(fr(t(T.wkAria, o)))}">${svg}</svg>`;
      const names = t(T.rowName);
      ROWS.forEach((r, i) => {
        const part = ` data-part="wk-${r.id}"`;
        if (G.wide) {
          html += `<div class="cv-rl"${part} style="top:${G.top(i) + G.band / 2}px"><b>${names[r.id]}</b><span>${r.plan ? lab.kPerWeek : lab.perWeek}</span></div>`;
          if (r.plan) html += `<span class="cv-lim"${part} style="left:${R + 6}px;top:${(yOf(i, r.plan[11]) - 8).toFixed(1)}px">${num(r.plan[11], 1)}</span>`;
          else html += `<span class="cv-lim"${part} style="left:${R + 6}px;top:${(yOf(i, r.r.hi) - 8).toFixed(1)}px">${num(r.r.hi)}</span><span class="cv-lim"${part} style="left:${R + 6}px;top:${(yOf(i, r.r.lo) - 8).toFixed(1)}px">${num(r.r.lo)}</span>`;
          html += `<div class="cv-val"${part}><b></b><span></span></div>`;
        } else {
          const ctx = r.plan ? fr(t(T.planV, num(r.plan[11], 1))) : fr(t(T.range, num(r.r.lo), num(r.r.hi)));
          html += `<div class="cv-rh"${part} style="top:${i * G.pitch}px"><span class="cv-rh-l"><b>${r.plan ? t(T.revK) : names[r.id]}</b><span>${ctx}</span></span><span class="cv-val"><b></b><span></span></span></div>`;
        }
        const a = G.wide ? i * G.pitch : i * G.pitch - 2, b = G.wide ? i * G.pitch + G.pitch - 6 : G.top(i) + G.band + 2;
        html += `<i class="cv-anc" data-anc="wk-${r.id}" style="left:-4px;width:${W + 8}px;top:${a}px;height:${b - a}px"></i>`;
      });
      const axTop = G.wide ? G.H - 18 : base + 8;
      const shown = G.wide ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] : [1, 3, 5, 7, 9, 11, 12];
      html += `<div class="cv-axis" data-part="wk-axis" style="top:${axTop}px" aria-hidden="true">${G.wide ? `<span class="cv-axt">${lab.week}</span>` : ''}${shown.map((w) => `<span class="cv-tk" data-w="${w}" style="left:${(x(w) - 15).toFixed(1)}px">${num(w)}</span>`).join('')}</div>`;
      html += `<div class="cv-hit" style="left:${L}px;width:${R - L}px;top:0;height:${base + 4}px"></div>`;
      chart.style.height = G.H + 'px';
      chart.classList.toggle('is-wide', G.wide);
      chart.innerHTML = html;
      hair = chart.querySelector('.cv-hair');
      vals = [...chart.querySelectorAll('.cv-val')];
      ticks = [...chart.querySelectorAll('.cv-tk')];
      updateWeek();
    }
    function updateWeek() {
      if (!G || !hair) return;
      const w = st.week || 12;
      const xw = G.x(w);
      hair.setAttribute('x1', xw.toFixed(1));
      hair.setAttribute('x2', xw.toFixed(1));
      chart.classList.toggle('is-pointed', st.week != null);
      ROWS.forEach((r, i) => {
        const el = vals[i]; if (!el) return;
        const v = r.v[w - 1], [word, sig] = wordOf(i, w);
        el.firstChild.textContent = num(v, r.d);
        el.lastChild.textContent = word;
        el.classList.toggle('is-sig', sig);
        if (G.wide) {
          const y = yOf(i, v), top = clamp(y - 10, i * G.pitch - 8, i * G.pitch + G.pitch - 40);
          el.style.top = top.toFixed(1) + 'px';
          el.style.left = (G.W - 67) + 'px';
        }
      });
      ticks.forEach((tk) => tk.classList.toggle('is-on', +tk.dataset.w === w));
    }
    const setWeek = (w, src) => {
      const nw = w == null ? null : clamp(w, 1, 12);
      if (nw === st.week) return;
      st.week = nw;
      updateWeek();
      if (opts.onWeek) opts.onWeek(nw, src);
    };
    if (chart) {
      const weekAt = (e) => {
        if (!G) return null;
        const r = chart.getBoundingClientRect(), px = e.clientX - r.left, py = e.clientY - r.top;
        if (px < G.L || px > G.R || py < 0 || py > G.top(2) + G.band + 4) return null;
        return clamp(Math.floor((px - G.L) / G.cw) + 1, 1, 12);
      };
      chart.addEventListener('pointermove', (e) => { if (e.pointerType !== 'touch') setWeek(weekAt(e), 'ptr'); });
      chart.addEventListener('pointerleave', (e) => { if (e.pointerType !== 'touch') setWeek(null, 'ptr'); });
      chart.addEventListener('pointerdown', (e) => { if (e.pointerType === 'touch') { const w = weekAt(e); if (w) setWeek(w, 'touch'); } });
    }

    /* ---------- cash: hide a bar's word when the bar is too short for it ---------- */
    function fitCash() {
      const over = (s) => s.scrollWidth > s.clientWidth + 0.5;
      qa('.cv-seg').forEach((s) => {
        s.classList.remove('is-snug', 'is-tight');
        if (!over(s)) return;
        s.classList.add('is-snug'); // a smaller inset first, then the number alone
        if (over(s)) { s.classList.remove('is-snug'); s.classList.add('is-tight'); }
      });
    }

    /* ---------- products: narrow lanes and labels when the table is narrow ---------- */
    function fitProducts() {
      const f = q('.cv-products'); if (!f) return;
      const w = f.clientWidth - parseFloat(getComputedStyle(f).paddingLeft) - parseFloat(getComputedStyle(f).paddingRight);
      f.classList.toggle('is-narrow', w < 400);
    }

    /* ---------- instruments: the context goes under the name in every card if one name would wrap ---------- */
    function fitKpis() {
      const ks = qa('.cv-kpi'); if (!ks.length) return;
      ks.forEach((k) => k.classList.remove('is-stack'));
      if (window.matchMedia('(max-width:639px)').matches) { ks.forEach((k) => k.classList.add('is-stack')); return; }
      const wraps = ks.some((k) => { const h = k.querySelector('.cv-kh'); return h.offsetHeight > 24; });
      if (wraps) ks.forEach((k) => k.classList.add('is-stack'));
    }

    /* ---------- next week: the dotplot, the staffing line, the readout ---------- */
    const nx = q('.cv-nx'), dp = q('.cv-dp');
    let D = null, dsvg = null, hp = 0;
    const shareOf = (k) => t(T.share)[k] || F.pct(k * 5);
    const xN = (v) => D.cx + (v - 1250) * D.k;
    function drawNext() {
      if (!nx || !dp) return;
      const BW = nx.clientWidth; if (!BW) return;
      const side = BW >= 520;
      nx.classList.toggle('is-side', side);
      const PW = side ? Math.min(320, BW - 32 - 190) : Math.min(BW, 420);
      dp.style.width = PW + 'px';
      const k = Math.min(1.2, (PW - 30) / (AX[1] - AX[0]));
      D = { PW, k, cx: PW / 2, r: (12.25 * k) / 1.2 };
      const pitch = D.r * 2 + 3.5, hid = `${uid}-h${++hp}`;
      const bins = {};
      const dots = OUTCOMES.map((v) => { const j = (bins[v] = (bins[v] || 0) + 1) - 1; return { v, j, x: xN(v), y: 136 - j * pitch }; });
      const order = dots.slice().sort((a, b) => a.j - b.j || a.x - b.x);
      const dotHTML = dots.map((d) => `<g class="cv-dot" data-v="${d.v}" style="--i:${order.indexOf(d)}">${F.circle(d.x, d.y, D.r, 'cv-dot-b')}${F.circle(d.x, d.y, D.r, 'cv-dot-h', { fill: `url(#${hid})` })}</g>`).join('');
      const ticksHTML = [1150, 1200, 1250, 1300, 1350].map((v) => F.text(xN(v), 170, num(v), 'cv-dpt', 'middle')).join('');
      const x0 = xN(AX[0]), x1 = xN(AX[1]);
      dp.innerHTML = `<svg class="f2-svg cv-dps" width="${PW}" height="192" viewBox="0 0 ${PW} 192" role="img" aria-label="">${F.hatch(hid, 'cv-hatch-line')}
        <g data-part="nx-zone"><rect class="cv-zone" y="34" height="116" rx="4"/></g>
        <g class="cv-ghosts"></g>
        <g data-part="nx-dots" class="cv-dots">${dotHTML}</g>
        <g data-part="nx-axis">${F.line(x0, 150.5, x1, 150.5, 'cv-dpax')}${ticksHTML}${F.text(x0, 188, lab.ordersInWeek13, 'cv-dpt')}</g>
        <g data-part="nx-staff" class="cv-staff"><line class="cv-sline" y1="25" y2="150"/><text class="cv-slab" y="20"></text>
          <g class="f2-handle cv-handle" tabindex="0" role="slider" aria-label="${esc(t(T.staffAria))}" aria-valuemin="${STAFF.min}" aria-valuemax="${STAFF.max}">
            <rect class="cv-shit" y="0" width="28" height="152"/><circle class="f2-ring" cy="16" r="14.25"/><circle class="cv-thumb" cy="16" r="8.25"/></g></g></svg>`;
      dsvg = dp.querySelector('svg');
      const handle = dp.querySelector('.cv-handle');
      F.drag(handle, () => dsvg, {
        start: (p) => { st.dragging = true; st.from = st.N; st.dx = p.x - xN(st.N); nx.classList.add('is-dragging'); if (opts.onStaff) opts.onStaff('start'); },
        move: (p) => { const n = snap(p.x - st.dx); if (n !== st.N) place(n); if (opts.onStaff) opts.onStaff('move'); },
        end: (p, ev) => { st.dragging = false; nx.classList.remove('is-dragging'); commit(st.from); if (opts.onStaff) opts.onStaff('end', ev); },
      });
      let burst = null;
      handle.addEventListener('keydown', (e) => {
        const big = e.shiftKey ? STAFF.big : STAFF.step;
        const m = { ArrowLeft: -big, ArrowDown: -big, ArrowRight: big, ArrowUp: big }[e.key];
        let n = null;
        if (m != null) n = st.N + m; else if (e.key === 'Home') n = STAFF.min; else if (e.key === 'End') n = STAFF.max;
        if (n == null) return;
        e.preventDefault();
        if (burst == null) burst = st.N;
        place(clamp(n, STAFF.min, STAFF.max));
        if (opts.onStaff) opts.onStaff('key');
      });
      handle.addEventListener('keyup', () => { if (burst != null) { const b = burst; burst = null; commit(b); } });
      handle.addEventListener('blur', () => { if (burst != null) { const b = burst; burst = null; commit(b); } if (opts.onStaff) opts.onStaff('blur'); });
      place(st.N, true);
      drawGhosts();
    }
    const snap = (px) => clamp(Math.round((1250 + (px - D.cx) / D.k) / STAFF.step) * STAFF.step, STAFF.min, STAFF.max);
    function place(n, quiet) {
      st.N = n;
      if (!dsvg) return;
      const X = xN(n), x1 = xN(AX[1]);
      const zone = dsvg.querySelector('.cv-zone');
      zone.setAttribute('x', Math.min(X, x1).toFixed(1));
      zone.setAttribute('width', Math.max(0, x1 - X).toFixed(1));
      const sl = dsvg.querySelector('.cv-sline');
      sl.setAttribute('x1', X.toFixed(1)); sl.setAttribute('x2', X.toFixed(1));
      dsvg.querySelector('.cv-shit').setAttribute('x', (X - 14).toFixed(1));
      dsvg.querySelectorAll('.cv-handle circle').forEach((c) => c.setAttribute('cx', X.toFixed(1)));
      const lb = dsvg.querySelector('.cv-slab');
      lb.textContent = fill(lab.staffFor, { N: num(n) });
      let w = 90; try { w = lb.getComputedTextLength(); } catch { /* not rendered yet */ }
      const flip = X + 14 + w > D.PW + (nx.classList.contains('is-side') ? 24 : 6); // may run into the gutter, never into the readout
      lb.setAttribute('x', (flip ? X - 14 : X + 14).toFixed(1));
      lb.setAttribute('text-anchor', flip ? 'end' : 'start');
      const k = above(n);
      dsvg.querySelectorAll('.cv-dot').forEach((d) => d.classList.toggle('is-above', +d.dataset.v > n));
      const h = dsvg.querySelector('.cv-handle');
      h.setAttribute('aria-valuenow', String(n));
      h.setAttribute('aria-valuetext', t(T.staffText, num(n), k));
      dsvg.setAttribute('aria-label', fr(t(T.dpAria, num(n), k)));
      readout(k, quiet);
      histButtons();
    }
    let cntStop = () => {};
    function readout(k, quiet) {
      const box = q('.cv-cnt'); if (!box) return;
      const n = box.querySelector('.cv-cnt-n'), s = box.querySelector('.cv-cnt-s');
      if (!n.firstChild) n.innerHTML = t(T.countOf, k);
      const cn = n.querySelector('.cv-cn');
      const from = st.k;
      st.k = k;
      cntStop();
      if (quiet || from === k) cn.textContent = num(k);
      else cntStop = F.tween(from, k, 250, (v) => { cn.textContent = num(Math.round(v)); });
      s.textContent = k === 0 ? fr(t(STATUS.staffing.none)) : fr(fill(k === 1 ? t(T.above1) : lab.outcomesAbove, { share: shareOf(k) })).replace(/ a (\d)/, ' a\u00A0$1');
    }
    function drawGhosts() {
      const g = dsvg && dsvg.querySelector('.cv-ghosts'); if (!g) return;
      const seen = new Set();
      const last = st.hist.slice(-3).filter((v) => v !== st.N && !seen.has(v) && seen.add(v));
      g.innerHTML = last.map((v) => F.line(xN(v), 25, xN(v), 150, 'cv-ghost')).join('');
    }
    function commit(from) {
      if (from == null || from === st.N) return;
      st.hist.push(from);
      if (st.hist.length > 12) st.hist.shift();
      drawGhosts();
      histButtons();
      if (opts.onStaff) opts.onStaff('commit');
    }
    function histButtons() {
      const h = q('.cv-hist'); if (!h) return;
      const any = st.hist.length > 0 || st.N !== STAFF.def;
      h.classList.toggle('is-on', any);
      h.querySelector('[data-act="undo"]').disabled = !st.hist.length;
      h.querySelector('[data-act="reset"]').disabled = !any;
      h.querySelectorAll('button').forEach((b) => (b.tabIndex = any ? 0 : -1));
    }
    host.addEventListener('click', (e) => {
      const b = e.target.closest('.cv-hist [data-act]'); if (!b || b.disabled) return;
      if (b.dataset.act === 'undo' && st.hist.length) place(st.hist.pop());
      else if (b.dataset.act === 'reset') { st.hist = []; place(STAFF.def); }
      drawGhosts();
      histButtons();
      if (opts.onStaff) opts.onStaff('history');
    });

    /* ---------- entrance: each field rises in when a fifth of it is in view, in reading order ---------- */
    const order = (f) => ORDER.indexOf(f.dataset.region) * 10 + (+(f.style.getPropertyValue('--o')) || 0);
    function countUp(f, delay) {
      const el = f.querySelector('.cv-kn'); if (!el) return;
      const v = +el.dataset.v, d = +el.dataset.d;
      el.style.minWidth = el.offsetWidth + 'px';
      el.textContent = num(0, d);
      setTimeout(() => F.tween(0, v, 600, (x) => { el.textContent = num(x, d); }, F.ease.out), delay);
      setTimeout(() => { el.style.minWidth = ''; el.textContent = num(v, d); }, delay + 700);
    }
    const entered = new Set();
    function go(f, delay) {
      if (entered.has(f)) return;
      entered.add(f);
      f.style.setProperty('--cv-d', delay + 'ms');
      f.classList.remove('cv-wait');
      f.classList.add('cv-go');
      if (f.classList.contains('cv-kpi')) countUp(f, delay);
      setTimeout(() => { f.classList.remove('cv-go'); f.style.removeProperty('--cv-d'); if (opts.onSettle) opts.onSettle(f); }, delay + 1500);
    }
    function entrance() {
      if (F.reduce || !('IntersectionObserver' in window)) return;
      fields.forEach((f) => f.classList.add('cv-wait'));
      const io = new IntersectionObserver((es) => {
        const batch = es.filter((e) => e.isIntersecting).map((e) => e.target).sort((a, b) => order(a) - order(b));
        batch.forEach((f, i) => { io.unobserve(f); go(f, i * 60); });
      }, { threshold: 0.2 });
      fields.forEach((f) => io.observe(f));
      window.addEventListener('beforeprint', () => fields.forEach((f) => { io.unobserve(f); f.classList.remove('cv-wait'); }));
    }

    function layout() { fitKpis(); fitProducts(); drawWeeks(); drawNext(); fitCash(); }
    layout();
    entrance();
    F.onResize(host, () => layout());
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { fitKpis(); fitCash(); if (dsvg) place(st.N, true); if (opts.onLayout) opts.onLayout(); });

    return {
      host, fields, byRegion, st, layout, setWeek, drawWeeks,
      setRow(px) { st.row = px; drawWeeks(); },
      staffing: () => ({ N: st.N, k: above(st.N), hist: st.hist.length }),
      shareOf,
    };
  }

  /* =====================================================================================================
     The cover: keys, status, the sheet, and pointing in both directions.
     ===================================================================================================== */
  FIG.coverDashboard = coverDashboard;
  FIG.register('board', (root, F) => {
    const t = F.t, num = F.num, fr = F.fr, esc = F.esc;
    const uid = 'cv-' + (root.id || 'board');
    const lab = t(LABELS);
    const href = (n) => {
      const l = window.GUIDE_DATA && window.GUIDE_DATA.links && window.GUIDE_DATA.links.rule;
      return typeof l === 'function' ? l(n) : t(RULES[n].link);
    };
    const keysHTML = Array.from({ length: 12 }, (_, i) => {
      const n = i + 1, R = RULES[n];
      return `<button type="button" class="cv-key" role="radio" aria-checked="false" data-n="${n}" tabindex="${n === 1 ? 0 : -1}" aria-label="${esc(fr(t(T.ruleAria, n, t(R.title))))}" style="--i:${i}"><span class="cv-kb">${n}</span><span class="cv-kw" aria-hidden="true">${t(R.key)}</span></button>`;
    }).join('');
    root.innerHTML = `<div class="cv cv-cover">
      <div class="cv-bar"><div class="cv-keys" role="radiogroup" aria-label="${esc(lab.keysAria)}">${keysHTML}</div>
        <div class="cv-strip" aria-hidden="true"><b></b><span></span></div></div>
      <div class="cv-status" id="${uid}-status"><div class="cv-which"></div><div class="cv-text" aria-live="polite"></div></div>
      <section class="cv-sheet" aria-label="${esc(t(T.sheetTitle))}"><header class="cv-head"><h3>${t(T.sheetTitle)}</h3><span>${t(T.sheetHint)}</span></header>
        <div class="cv-dash"></div>
        <div class="cv-ov" aria-hidden="true"><div class="cv-cols">${'<i></i>'.repeat(12)}</div><div class="cv-tags"></div><div class="cv-boxes"></div></div></section>
      <div class="cv-status cv-measure" aria-hidden="true"><div class="cv-which"></div><div class="cv-text"></div></div>
    </div>`;
    const fig = root.closest('figure'), heading = document.getElementById('ex-h');
    if (fig && heading && !fig.hasAttribute('aria-labelledby')) fig.setAttribute('aria-labelledby', 'ex-h');
    const $ = (s) => root.querySelector(s);
    const bar = $('.cv-bar'), keysEl = $('.cv-keys'), strip = $('.cv-strip'), statusEl = $('.cv-status'), sheet = $('.cv-sheet');
    const whichEl = statusEl.querySelector('.cv-which'), textEl = statusEl.querySelector('.cv-text');
    const meas = $('.cv-measure'), boxesEl = $('.cv-boxes'), tagsEl = $('.cv-tags');
    const keys = [...root.querySelectorAll('.cv-key')];
    const mqPhone = window.matchMedia('(max-width:639px)'), mqStack = window.matchMedia('(max-width:1079px)');
    const touchy = () => window.matchMedia('(hover:none)').matches;

    /* state: one pinned selection, one transient one (pointer or keyboard), and the week or staffing reading */
    const S = { pin: null, tr: null, week: null, staff: false };
    const same = (a, b) => !!a && !!b && a.t === b.t && (a.t === 'rule' ? a.n === b.n : a.id === b.id);
    const sel = () => (S.tr ? S.tr.sel : S.pin);
    let lastPT = 'mouse';

    const dash = coverDashboard(F, $('.cv-dash'), {
      rows: 'ABCD', uid, describedBy: `${uid}-status`,
      onWeek: (w, src) => { S.week = w; if (w != null) S.staff = false; if (src === 'touch' && w != null) { S.pin = { t: 'region', id: 'weeks' }; S.tr = null; } apply(); },
      onStaff: (phase, ev) => {
        if (phase === 'blur') { if (!S.tr || !same(S.tr.sel, { t: 'region', id: 'next' })) S.staff = false; renderStatus(); return; }
        S.staff = true; S.week = null;
        if (phase === 'start' && lastPT === 'touch') { S.pin = { t: 'region', id: 'next' }; S.tr = null; }
        apply();
        if (phase === 'end' && lastPT !== 'touch' && ev) { // after a drag, pointing follows the pointer again
          const el = document.elementFromPoint(ev.clientX, ev.clientY), f = el && el.closest && el.closest('.cv-f');
          if (f && root.contains(f)) point({ t: 'region', id: f.dataset.region }); else scheduleClear();
        }
      },
      onSettle: () => placeBoxes(currentBoxes),
      onLayout: () => { reserve(); placeBoxes(currentBoxes); },
    });
    const fields = dash.fields, byRegion = dash.byRegion;
    const allF = (id) => byRegion[id] || [];
    const P = (s) => [...root.querySelectorAll(s)];

    /* ---------- what each rule points at (figspec/r0.json rules[n].highlight) ---------- */
    function targets(s) {
      const box = (els, kind = 'part', pad) => ({ els: els.filter(Boolean), kind, pad });
      const whole = (id) => allF(id).map((f) => box([f], 'field'));
      if (!s) return { bright: null, dims: [], boxes: [], cols: false };
      if (s.t === 'region') return { bright: new Set(allF(s.id)), dims: [], boxes: whole(s.id), cols: false };
      const kp = allF('instruments');
      switch (s.n) {
        case 1: return { bright: null, dims: [], boxes: [], cols: true };
        case 2: return { bright: new Set(kp), dims: [], boxes: whole('instruments') };
        case 3: return { bright: new Set(allF('weeks')), dims: P('.cv-weeks [data-part="wk-revenue"], .cv-weeks [data-part="wk-axis"]'), boxes: [box(P('.cv-anc[data-anc="wk-signups"], .cv-anc[data-anc="wk-orders"]'))] };
        case 4: return { bright: new Set(allF('cash')), dims: [], boxes: whole('cash') };
        case 5: return { bright: new Set(allF('regions')), dims: [], boxes: whole('regions') };
        case 6: return { bright: new Set([...allF('weeks'), ...allF('next')]), dims: P('.cv-weeks [data-part="wk-signups"], .cv-weeks [data-part="wk-orders"], .cv-weeks [data-part="wk-axis"], [data-part="nx-count"], [data-part="nx-notes"]'), boxes: [box(P('.cv-anc[data-anc="wk-revenue"]')), box(P('[data-part="nx-plot"]'))] };
        case 7: return { bright: new Set(allF('weeks')), dims: [], boxes: whole('weeks') };
        case 8: return { bright: new Set(allF('products')), dims: [], boxes: whole('products') };
        case 9: return { bright: new Set([...allF('products'), ...kp]), dims: P('[data-part="pr-name"], [data-part="pr-bar"], [data-part="kpi-head"], [data-part="kpi-scale"], [data-part="kpi-foot"]'), boxes: [box(P('[data-part="pr-orders"], [data-part="pr-rev"]')), box(P('[data-part="pr-chg"]')), ...kp.map((f) => box([f.querySelector('.cv-kn'), f.querySelector('.cv-ku')], 'part', 6))] };
        case 10: return { bright: new Set(allF('next')), dims: P('[data-part="nx-count"]'), boxes: [box(P('[data-part="nx-plot"]')), box(P('[data-part="nx-notes"]'))] };
        case 11: return { bright: new Set(allF('next')), dims: P('[data-part="nx-dots"], [data-part="nx-notes"]'), boxes: [box(P('[data-part="nx-zone"], [data-part="nx-staff"]')), box(P('[data-part="nx-count"]'))] };
        case 12: return { bright: new Set(allF('words')), dims: [], boxes: whole('words') };
        default: return { bright: null, dims: [], boxes: [], cols: false };
      }
    }

    /* ---------- outlines: a pool of boxes that slide from target to target ---------- */
    let currentBoxes = [];
    const pool = [];
    function placeBoxes(list) {
      currentBoxes = list || [];
      const base = sheet.getBoundingClientRect();
      const rects = currentBoxes.map((b) => {
        const u = union(b.els.map((el) => el.getBoundingClientRect()));
        if (!u) return null;
        const o = b.kind === 'field' ? 2 : b.pad != null ? b.pad : 8;
        const rf = b.kind === 'field' ? (parseFloat(getComputedStyle(b.els[0]).borderTopLeftRadius) || 12) + 2 : 10;
        return { x: u.left - base.left - o, y: u.top - base.top - o, w: u.width + 2 * o, h: u.height + 2 * o, r: rf };
      }).filter(Boolean);
      while (pool.length < rects.length) { const d = document.createElement('i'); d.className = 'cv-bx'; boxesEl.appendChild(d); pool.push(d); }
      pool.forEach((d, i) => {
        const r = rects[i];
        if (!r) { d.classList.remove('is-on'); return; }
        const fresh = !d.classList.contains('is-on');
        if (fresh) d.classList.add('cv-nt');
        d.style.transform = `translate(${r.x.toFixed(1)}px,${r.y.toFixed(1)}px)`;
        d.style.width = r.w.toFixed(1) + 'px';
        d.style.height = r.h.toFixed(1) + 'px';
        d.style.borderRadius = r.r + 'px';
        if (fresh) { void d.offsetWidth; d.classList.remove('cv-nt'); }
        d.classList.add('is-on');
      });
    }
    function placeTags(on) {
      if (!on || mqStack.matches) { tagsEl.innerHTML = ''; return; }
      const base = sheet.getBoundingClientRect();
      tagsEl.innerHTML = fields.map((f) => {
        const r = f.getBoundingClientRect();
        return `<span class="cv-tag" style="left:${(r.right - base.left - 12).toFixed(1)}px;top:${(r.top - base.top - 10).toFixed(1)}px">${t(T.columns, SPAN[f.dataset.region])}</span>`;
      }).join('');
    }
    function highlight(s) {
      const g = targets(s);
      fields.forEach((f) => f.classList.toggle('cv-dim', !!g.bright && !g.bright.has(f)));
      P('[data-part].cv-dim').forEach((el) => { if (!g.dims.includes(el)) el.classList.remove('cv-dim'); });
      g.dims.forEach((el) => el.classList.add('cv-dim'));
      root.classList.toggle('cv-cols-on', !!g.cols);
      placeBoxes(g.boxes);
      placeTags(!!g.cols);
    }

    /* ---------- the status: default, rule, region, week, staffing ---------- */
    function model() {
      const s = sel();
      if (S.staff) {
        const { N, k } = dash.staffing(), n = num(N);
        let lead;
        if (k === 0) lead = F.lang === 'fr' ? `<b>Effectif pour ${n} commandes.</b> ${fr(t(STATUS.staffing.none))} L’issue médiane est ${num(1240)}.` : `<b>Staff for ${n} orders.</b> ${t(STATUS.staffing.none)} The median outcome is ${num(1240)}.`;
        else if (k === 1) lead = F.lang === 'fr' ? `<b>Effectif pour ${n} commandes${NN}: 1 issue sur 20 est au-dessus, soit ${dash.shareOf(1)} de risque de manquer.</b> L’issue médiane est ${num(1240)}.` : `<b>Staff for ${n} orders: 1 of 20 outcomes is higher, a ${dash.shareOf(1)} chance of running short.</b> The median outcome is ${num(1240)}.`;
        else lead = fr(fill(t(STATUS.staffing), { N: n, k: num(k), share: dash.shareOf(k) })).replace(/1 240|1,240/, num(1240));
        const strip2 = lead.replace(/<\/?b>/g, '').replace(/^[^:]*:\s*/, '');
        return { which: [lab.reading, t(T.weekN, 13), ''], plab: t(T.readingWeek, 13), lead, mixed: true, strip: [t(T.staffTitle, n), k === 0 ? fr(t(STATUS.staffing.none)) : strip2.charAt(0).toUpperCase() + strip2.slice(1)] };
      }
      if (S.week != null) {
        const w = S.week, i = w - 1;
        const sig = SIGN[i] > ROWS[0].r.hi || SIGN[i] < ROWS[0].r.lo || ORD[i] > ROWS[1].r.hi || ORD[i] < ROWS[1].r.lo;
        const clause = t(STATUS.week.signalClause)[sig ? 'signal' : 'inside'];
        const lead = fr(fill(t(STATUS.week), { w: num(w), signups: num(SIGN[i]), orders: num(ORD[i]), revenue: num(REV[i], 1), signalClause: clause }));
        const plain = lead.replace(/<\/?b>/g, '');
        return { which: [lab.reading, t(T.weekN, w), ''], plab: t(T.readingWeek, w), lead, mixed: true, strip: [t(T.weekN, w), plain.replace(/^[^:]*:\s*/, '')] };
      }
      if (!s) {
        const D = t(STATUS.default);
        return { which: [D.which[0], D.which[1], ''], plab: t(T.readingWeek, 12), lead: fr(D.lead), rest: fr(D.rest), hint: fr(touchy() ? t(T.hintTouch) : D.hint), strip: [t(T.readingWeek, 12), fr(D.lead)] };
      }
      if (s.t === 'rule') {
        const R = RULES[s.n];
        return { which: [t(T.ruleOf, s.n), fr(t(R.title)), `<a href="${esc(href(s.n))}">${t(T.readIt, R.ch)}</a>`], lead: fr(t(R.one)), soft: true, rest: fr(t(R.here)), strip: [fr(t(T.stripRule, s.n, t(R.title))), fr(t(R.one))] };
      }
      const title = REGION_TITLE[s.id], list = t(T.rulesList, REGION_RULES[s.id]), sent = fr(t(REGION_SENT[s.id]));
      const tail = sent.replace(/^[^:]*:\s*/, '');
      return { which: [lab.region, t(title), list], lead: sent, soft: true, strip: [fr(t(T.stripRegion, t(title), list.toLowerCase(), s.id === 'instruments')), tail.charAt(0).toUpperCase() + tail.slice(1)] };
    }
    const REGION_TITLE = { instruments: { en: 'Instruments', fr: 'Instruments' }, weeks: T.wkTitle, cash: T.cashTitle, regions: T.regTitle, products: T.prTitle, next: T.nxTitle, words: T.wdTitle };
    const whichHTML = (m) => `${m.plab ? `<span class="cv-plab">${m.plab}</span>` : ''}<span class="cv-w1">${m.which[0]}</span><span class="cv-w2">${m.which[1]}</span>${m.which[2] ? `<span class="cv-w3">${m.which[2]}</span>` : ''}`;
    const textHTML = (m) => `<p class="cv-lead${m.soft ? ' is-soft' : ''}${m.mixed ? ' is-mixed' : ''}">${m.lead}</p>${m.rest ? `<p class="cv-rest">${m.rest}</p>` : ''}${m.hint ? `<p class="cv-hint">${m.hint}</p>` : ''}`;
    let lastStatus = '';
    function renderStatus() {
      const m = model();
      const wh = whichHTML(m), tx = textHTML(m);
      if (wh + tx === lastStatus) return;
      lastStatus = wh + tx;
      whichEl.classList.toggle('has-plab', !!m.plab);
      whichEl.innerHTML = wh;
      textEl.innerHTML = tx;
      strip.firstChild.innerHTML = m.strip[0];
      strip.lastChild.innerHTML = m.strip[1];
      if (!F.reduce) { statusEl.classList.remove('cv-x'); void statusEl.offsetWidth; statusEl.classList.add('cv-x'); }
    }
    // Reserve the tallest status at this width, so pointing never moves the page.
    function reserve() {
      const mw = meas.querySelector('.cv-which'), mt = meas.querySelector('.cv-text');
      const save = { pin: S.pin, tr: S.tr, week: S.week, staff: S.staff };
      let max = 0;
      const tryM = (o) => { Object.assign(S, o); const m = model(); mw.classList.toggle('has-plab', !!m.plab); mw.innerHTML = whichHTML(m); mt.innerHTML = textHTML(m); max = Math.max(max, meas.offsetHeight); };
      tryM({ pin: null, tr: null, week: null, staff: false });
      for (let n = 1; n <= 12; n++) tryM({ pin: { t: 'rule', n }, tr: null, week: null, staff: false });
      ORDER.forEach((id) => tryM({ pin: { t: 'region', id }, tr: null, week: null, staff: false }));
      [1, 5, 12].forEach((w) => tryM({ pin: null, tr: null, week: w, staff: false }));
      tryM({ pin: null, tr: null, week: null, staff: true });
      Object.assign(S, save);
      statusEl.style.minHeight = max + 'px';
    }

    /* ---------- apply the state ---------- */
    function apply() {
      const s = sel();
      keys.forEach((k) => {
        const n = +k.dataset.n;
        const on = !!s && s.t === 'rule' && s.n === n;
        const lit = !!s && s.t === 'region' && REGION_RULES[s.id].includes(n);
        k.setAttribute('aria-checked', String(on));
        k.classList.toggle('is-on', on || lit);
      });
      root.classList.toggle('cv-pinned', !!S.pin);
      highlight(s);
      renderStatus();
    }
    const setTr = (s, src) => {
      const next = s ? { sel: s, src } : null;
      if ((next && S.tr && same(next.sel, S.tr.sel) && next.src === S.tr.src) || (!next && !S.tr)) return;
      S.tr = next;
      if (!s || !same(s, { t: 'region', id: 'next' })) S.staff = false;
      apply();
    };
    const release = () => { S.pin = null; S.tr = null; S.staff = false; if (S.week != null) dash.setWeek(null, 'esc'); S.week = null; apply(); };
    function togglePin(s) {
      if (same(S.pin, s)) { S.pin = null; if (S.tr && same(S.tr.sel, s) && S.tr.src !== 'ptr') S.tr = null; }
      else { S.pin = s; S.tr = S.tr && same(S.tr.sel, s) ? S.tr : null; }
      if (!same(s, { t: 'region', id: 'next' })) S.staff = false;
      apply();
      return !!S.pin && same(S.pin, s);
    }

    /* ---------- phone: the sticky bar, scrolling to a target, sliding the scroller ---------- */
    let cvTop = 0;
    const measureTop = () => {
      const h = document.querySelector('.g-head');
      cvTop = h ? Math.round(h.getBoundingClientRect().height) : 0;
      root.style.setProperty('--cv-top', cvTop + 'px');
    };
    let stuckRaf = 0;
    const onScroll = () => {
      cancelAnimationFrame(stuckRaf);
      stuckRaf = requestAnimationFrame(() => {
        if (!mqPhone.matches) { bar.classList.remove('is-stuck'); return; }
        const b = bar.getBoundingClientRect(), s = statusEl.getBoundingClientRect(), r = root.getBoundingClientRect();
        const stuck = b.top <= cvTop + 1 && s.bottom < b.bottom + 2 && r.bottom > b.bottom + strip.offsetHeight + 40;
        bar.classList.toggle('is-stuck', stuck);
      });
    };
    let scrollStop = () => {};
    function scrollToTarget(s) {
      const g = targets(s);
      let el = g.boxes.length ? union(g.boxes[0].els.map((x) => x.getBoundingClientRect())) : null;
      if (!el && s.t === 'region') el = allF(s.id)[0] && allF(s.id)[0].getBoundingClientRect();
      if (!el) el = sheet.getBoundingClientRect();
      const offset = cvTop + bar.offsetHeight + strip.offsetHeight + 12;
      const y = Math.max(0, window.scrollY + el.top - offset);
      scrollStop();
      scrollStop = F.tween(window.scrollY, y, 300, (v) => window.scrollTo(0, v), F.ease.inOut);
    }
    // The scroller slides its lit keys into view, centred as a group (the first of them never leaves the left edge).
    function slideKeys() {
      const lit = keys.filter((x) => x.classList.contains('is-on'));
      if (!lit.length || keysEl.scrollWidth <= keysEl.clientWidth) return;
      const pad = parseFloat(getComputedStyle(keysEl).paddingLeft) || 0;
      const a = lit[0].offsetLeft, z = lit[lit.length - 1].offsetLeft + lit[lit.length - 1].offsetWidth;
      const left = Math.min(a - pad, (a + z) / 2 - keysEl.clientWidth / 2);
      keysEl.scrollTo({ left: Math.max(0, left), behavior: F.reduce ? 'auto' : 'smooth' });
    }

    /* ---------- pointer ---------- */
    // Pointing settles after 60 ms on one target, so a pointer crossing the keys or the sheet does not flicker through them.
    let dwell = 0, pending = null, leaveT = 0;
    const scheduleClear = () => { clearTimeout(leaveT); leaveT = setTimeout(() => { if (S.tr && S.tr.src === 'ptr') setTr(null); }, 140); };
    const point = (s) => {
      if (dash.st.dragging) return;
      clearTimeout(leaveT);
      if (pending && same(pending, s)) return;
      clearTimeout(dwell);
      pending = null;
      if (S.tr && same(S.tr.sel, s)) return;
      pending = s;
      dwell = setTimeout(() => { pending = null; setTr(s, 'ptr'); }, 60);
    };
    const unpoint = () => { clearTimeout(dwell); pending = null; };
    root.addEventListener('pointerdown', (e) => { lastPT = e.pointerType || 'mouse'; }, true);
    keysEl.addEventListener('pointerover', (e) => {
      if (e.pointerType === 'touch') return;
      const k = e.target.closest('.cv-key');
      if (k) point({ t: 'rule', n: +k.dataset.n });
    });
    keysEl.addEventListener('pointerout', (e) => { if (e.pointerType !== 'touch' && !(e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest('.cv-key'))) unpoint(); });
    bar.addEventListener('pointerleave', (e) => { if (e.pointerType !== 'touch') { unpoint(); scheduleClear(); } });
    statusEl.addEventListener('pointerenter', (e) => { if (e.pointerType !== 'touch') clearTimeout(leaveT); });
    statusEl.addEventListener('pointerleave', (e) => { if (e.pointerType !== 'touch') scheduleClear(); });
    const dashEl = $('.cv-dash');
    dashEl.addEventListener('pointerover', (e) => {
      if (e.pointerType === 'touch') return;
      const f = e.target.closest('.cv-f');
      if (f) point({ t: 'region', id: f.dataset.region });
    });
    sheet.addEventListener('pointerleave', (e) => { if (e.pointerType !== 'touch') { unpoint(); if (!dash.st.dragging) scheduleClear(); } });
    root.addEventListener('click', (e) => {
      const k = e.target.closest('.cv-key');
      if (k) {
        const s = { t: 'rule', n: +k.dataset.n };
        if (togglePin(s) && mqPhone.matches) scrollToTarget(s);
        return;
      }
      if (e.target.closest('a, button, .cv-handle')) return;
      if (e.target.closest('.cv-status, .cv-strip')) { if (S.pin) release(); return; }
      const f = e.target.closest('.cv-f');
      if (!f) return;
      if (lastPT === 'touch' && e.target.closest('.cv-hit')) return; // a tap on the weeks plot reads a week (and pins the region)
      const s = { t: 'region', id: f.dataset.region };
      if (togglePin(s) && mqStack.matches) slideKeys();
    });
    document.addEventListener('click', (e) => { if ((S.pin || S.week != null) && !root.contains(e.target)) release(); });

    /* ---------- keyboard ---------- */
    const rove = (k) => keys.forEach((x) => (x.tabIndex = x === k ? 0 : -1));
    keysEl.addEventListener('keydown', (e) => {
      const k = e.target.closest('.cv-key'); if (!k) return;
      const i = +k.dataset.n - 1;
      const j = { ArrowRight: i + 1, ArrowDown: i + 1, ArrowLeft: i - 1, ArrowUp: i - 1, Home: 0, End: 11 }[e.key];
      if (j == null) return;
      e.preventDefault();
      const nk = keys[(j + 12) % 12];
      nk.focus();
      if (mqStack.matches) nk.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: F.reduce ? 'auto' : 'smooth' });
    });
    root.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { if (S.pin || S.tr || S.week != null || S.staff) { e.preventDefault(); release(); } return; }
      const f = e.target.classList && e.target.classList.contains('cv-f') ? e.target : null;
      if (!f) return;
      if (f.dataset.region === 'weeks' && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
        e.preventDefault();
        dash.setWeek((S.week || 12) + (e.key === 'ArrowRight' ? 1 : -1), 'kbd');
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        togglePin({ t: 'region', id: f.dataset.region });
      }
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && S.pin && !root.contains(document.activeElement)) release(); });
    root.addEventListener('focusin', (e) => {
      const vis = e.target.matches && e.target.matches(':focus-visible');
      const k = e.target.closest('.cv-key');
      if (k) { rove(k); if (vis) setTr({ t: 'rule', n: +k.dataset.n }, 'kbd'); return; }
      const f = e.target.closest('.cv-f');
      if (f && vis) setTr({ t: 'region', id: f.dataset.region }, 'kbd');
    });
    root.addEventListener('focusout', (e) => {
      const to = e.relatedTarget;
      if (to && root.contains(to)) {
        if (S.week != null && e.target.classList && e.target.classList.contains('cv-weeks') && !e.target.contains(to)) dash.setWeek(null, 'kbd');
        return;
      }
      if (S.tr && S.tr.src === 'kbd') { S.tr = null; S.staff = false; }
      if (S.week != null && e.target.classList && e.target.classList.contains('cv-weeks')) { dash.setWeek(null, 'kbd'); return; }
      apply();
    });

    /* ---------- entrance of the keys and the status ---------- */
    if (!F.reduce && 'IntersectionObserver' in window) {
      root.classList.add('cv-pre');
      const io = new IntersectionObserver((es) => {
        if (!es.some((e) => e.isIntersecting)) return;
        io.disconnect();
        root.classList.remove('cv-pre');
        root.classList.add('cv-in');
        setTimeout(() => root.classList.remove('cv-in'), 1600);
      }, { threshold: 0.2 });
      io.observe(bar);
    }

    /* ---------- layout ---------- */
    const relayout = () => { measureTop(); reserve(); highlight(sel()); onScroll(); };
    F.onResize(root, relayout);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', () => { measureTop(); onScroll(); }, { passive: true });
    measureTop();
    reserve();
    apply();
    onScroll();
  });
})();
