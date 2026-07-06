// FR copy dictionary — same shape as en.js, strings only.
// Écrit nativement en français (registre déclaratif), pas traduit.
export const fr = {
  meta: {
    home: {
      title: 'Enzo Simier · Économie appliquée et organisation industrielle',
      description:
        'Enzo Simier, analyste chez Desjardins à Montréal. Examen de fusions au Bureau de la concurrence, tarification de l’eau à HEC Montréal et un calendrier de catalyseurs biotech en ligne.',
    },
    project: {
      title: 'FDA Catalyst · Enzo Simier',
      description:
        'Un calendrier de catalyseurs biotech en ligne : 128 événements, 101 entreprises, 23 décisions PDUFA. FastAPI, Railway Postgres, React. Construit par Enzo Simier.',
    },
  },
  a11y: {
    themeToLight: 'Passer au thème clair',
    themeToDark: 'Passer au thème sombre',
    langSwitch: 'Switch to English',
    pageSections: 'Sections de la page',
    projectSections: 'Sections du projet',
    portraitAlt: 'Portrait d’Enzo Simier',
    skipToContent: 'Aller au contenu',
  },
  nav: {
    items: [
      ['À propos', '#about'],
      ['Expérience', '#experience'],
      ['Formation', '#education'],
      ['Recherche', '#research'],
      ['Projets', '#projects'],
      ['Bibliothèque', '#reading'],
    ],
    projectItems: [
      ['Accueil', '/'],
      ['Aperçu', '#overview'],
      ['Architecture', '#architecture'],
      ['Déploiement', '#deployment'],
    ],
    email: 'Courriel',
  },
  hero: {
    kicker: 'Économie appliquée · Organisation industrielle',
    name: 'Enzo Simier',
    lede: 'Analyste chez Desjardins, je surveille la concurrence des banques de détail canadiennes. Je construis mes outils avec des agents IA : serveurs MCP, pipelines de données, un calendrier biotech en direct. Ma thèse mesure ce que vaut la tarification de l’eau au Québec.',
    cvLabel: 'CV',
    linkedinLabel: 'LinkedIn',
    emailLabel: 'Courriel',
  },
  about: {
    eyebrow: 'À propos',
    title: 'Économie de la concurrence',
    lead: 'Je mesure les marchés.',
    paragraphs: [
      'Au Bureau de la concurrence, j’ai examiné des fusions : parts de marché, IHH, ratios de diversion. Chez KPMG, j’ai construit des modèles de retombées économiques pour des ports et la santé publique. Chez Desjardins, je couvre les banques de détail canadiennes et j’écris des recommandations pour la haute direction.',
      'Mes outils : agents LLM, serveurs MCP, pipelines Python. Le modèle de la thèse et le calendrier FDA plus bas en sortent directement.',
      'La formation : une M. Sc. en économie appliquée à HEC Montréal, spécialisée en organisation industrielle. Je termine à l’été 2026, ouvert aux occasions en concurrence, en tarification et en stratégie. Écrivez-moi.',
    ],
  },
  work: {
    eyebrow: 'Travail',
    title: 'Expérience',
    items: [
      {
        company: 'Desjardins',
        role: 'Analyste, analyse d’affaires corporative',
        date: 'Avril 2026 à aujourd’hui',
        details: [
          'Je suis la concurrence bancaire de détail au Canada : concurrents, comportements clientèle, signaux de marché.',
          'J’écris des recommandations, des notes de synthèse et des présentations pour la haute direction.',
        ],
      },
      {
        company: 'Bureau de la concurrence',
        role: 'Stagiaire, Direction des fusions',
        date: 'Été 2025',
        details: [
          'En examen de fusions, j’ai défini les marchés et mesuré parts, IHH, barrières à l’entrée, ratios de diversion.',
          'J’ai rédigé, sous supervision, des notes pour des certificats de décision préalable et des lettres de non-intervention.',
        ],
      },
      {
        company: 'KPMG Canada',
        role: 'Stagiaire, Services-conseils en économie et stratégie',
        date: 'Été 2024',
        details: [
          'J’ai mesuré l’impact économique de projets portuaires, dont le Port de Magog, et de santé publique.',
          'J’ai modélisé des scénarios pour les deux secteurs — faisabilité, risques, sensibilités — et écrit les sommaires de gestion.',
        ],
      },
      {
        company: 'HEC Montréal',
        role: 'Auxiliaire d’enseignement, macroéconomie',
        date: 'Automne 2023',
        details: [
          'J’ai animé les séances de révision hebdomadaires : croissance, cycles économiques, politique monétaire.',
          'Les exercices couvraient IS-LM, la courbe de Phillips et le modèle de Solow.',
        ],
      },
      {
        company: 'Accélérateur Banque Nationale',
        role: 'Stagiaire, développement des affaires',
        date: 'Été 2023',
        details: [
          'J’ai écrit les plans de mise en marché et défini les KPI de plus de 10 startups.',
          'Pour les mêmes startups, j’ai mesuré la taille des marchés et recensé les concurrents.',
        ],
      },
      {
        company: 'Front Row Ventures',
        role: 'Analyste, développement des affaires',
        date: '2021 à 2022',
        details: [
          'J’ai conçu le CRM Airtable qui suivait plus de 50 fonds de capital de risque.',
          'J’ai filtré des startups et écrit des notes d’investissement.',
        ],
      },
    ],
  },
  education: {
    eyebrow: 'Formation',
    title: 'HEC Montréal',
    items: [
      {
        school: 'HEC Montréal',
        meta: 'M. Sc. en économie appliquée · 2024 à 2026',
        text: 'La spécialisation est l’organisation industrielle. Le mémoire mesure ce que vaut la tarification volumétrique de l’eau au Québec, en partenariat avec Réseau Environnement.',
      },
      {
        school: 'HEC Montréal',
        meta: 'B.A.A. en économie et finance · 2020 à 2024',
        text: 'Diplômé avec la Mention d’excellence : moyenne cumulative dans le 5 % supérieur.',
      },
    ],
  },
  research: {
    eyebrow: 'Recherche',
    title: 'Ce que vaut la tarification volumétrique de l’eau au Québec.',
    description:
      'Ma thèse mesure ce qu’une municipalité gagne quand elle tarifie l’eau au volume. La méthode : doubles différences avec adoption échelonnée, sur des panels municipaux et de ménages. Longueuil et Laval servent de cas. Je modélise le coût de service, les coûts évités et la valeur actualisée nette, avec analyses de sensibilité. HEC Montréal et Réseau Environnement appuient le travail.',
    lens: 'Organisation industrielle, surplus du consommateur, coût de service.',
    supervisors: 'Direction : Justin Leroux et Jean-Luc Martel.',
  },
  fda: {
    eyebrow: 'Projets',
    title: 'FDA Catalyst Research',
    lede: 'J’ai construit un calendrier en direct des catalyseurs biotech. Les enregistrements BPIQ arrivent dans Railway Postgres; FastAPI les sert; React affiche la page.',
    metricLabels: ['événements', 'sociétés', 'décisions PDUFA', 'résultats cliniques'],
    liveCta: 'Calendrier en direct',
    caseCta: 'Étude de cas',
  },
  library: {
    eyebrow: 'Bibliothèque',
    title: 'Les livres que je relis',
    lede: 'Cinq livres sur des industries qui se concentrent, des institutions qui tiennent, des gens qui décident sous pression.',
    books: [
      {
        title: 'Chip War',
        author: 'Chris Miller · 2022',
        note: 'Le pouvoir de marché au sens propre : une poignée d’entreprises décide qui obtient les puces les plus rapides.',
      },
      {
        title: 'Material World',
        author: 'Ed Conway · 2023',
        note: 'La croissance est physique avant d’être financière; le sable, le cuivre et le pétrole fixent les règles.',
      },
      {
        title: 'Working in Public',
        author: 'Nadia Eghbal · Stripe Press',
        note: 'Le logiciel libre repose sur des mainteneurs non rémunérés; Eghbal explique pourquoi le modèle tient quand même.',
      },
      {
        title: 'Churchill',
        author: 'Andrew Roberts · 2018',
        note: 'Roberts suit les décennies de mandats, d’erreurs et de lectures qui ont forgé un jugement indispensable.',
      },
      {
        title: 'Caesar',
        author: 'Adrian Goldsworthy · 2006',
        note: 'César bâtit une coalition, minute chaque geste et brise la république qui l’a formé.',
      },
    ],
  },
  footer: {
    location: 'Montréal, QC',
    linkedinLabel: 'LinkedIn',
  },
  project: {
    kicker: 'FDA Catalyst Research',
    title: 'Un calendrier de catalyseurs biotech, en production sur Railway.',
    lede: 'Le calendrier suit les catalyseurs datés de 101 sociétés biotech. Il convertit les enregistrements BPIQ en événements, avec filtres, liens sources et liens TradingView. Il contient aujourd’hui 128 événements; 23 sont des décisions PDUFA.',
    openCta: 'Ouvrir le calendrier en direct',
    snapshot: {
      title: 'Instantané de production',
      description: 'Quatre mesures tirées de la version en production.',
    },
    table: {
      headers: ['Mesure', 'Nombre', 'Source', 'État'],
      rows: [
        { ticker: 'Événements', event: '128', window: 'BPIQ', status: 'En ligne' },
        { ticker: 'Sociétés', event: '101', window: 'BPIQ', status: 'En ligne' },
        { ticker: 'Décisions PDUFA', event: '23', window: 'BPIQ', status: 'En ligne' },
        { ticker: 'Résultats cliniques', event: '100', window: 'BPIQ', status: 'En ligne' },
      ],
    },
    architecture: {
      eyebrow: 'Architecture',
      title: 'La pile',
      lede: 'Le produit tient en trois pièces : un service FastAPI, Railway Postgres et un calendrier React.',
      cards: [
        ['API', 'Un service FastAPI expose les points d’accès : calendrier, santé, source, catalyseur, scanner, liste de suivi, backtest et étude de volatilité implicite.'],
        ['Données', 'Les enregistrements BPIQ alimentent Railway Postgres. Cette base contient les 128 événements que le calendrier affiche.'],
        ['Interface', 'La page calendrier affiche les catalyseurs datés, avec filtres, liens sources et liens TradingView.'],
      ],
    },
    deployment: {
      eyebrow: 'Déploiement',
      title: 'État de production',
      lede: 'Le calendrier est en ligne à une URL Railway publique. Les données résident dans Railway Postgres.',
      lines: [
        ['Calendrier web', 'En ligne'],
        ['API', 'FastAPI'],
        ['Base de données', 'Railway Postgres'],
        ['Flux de données', 'BPIQ'],
      ],
      check: {
        title: 'Vérification',
        description: 'Le calendrier en ligne charge 128 événements pour 101 sociétés. N’importe qui peut l’ouvrir.',
      },
    },
  },
}
