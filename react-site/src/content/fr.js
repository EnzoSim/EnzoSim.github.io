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
      ['Cafés', '#cafes'],
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
    lede: 'Économiste français à Montréal. Je fais de la veille concurrentielle sur le marché bancaire chez Desjardins, je construis mes outils avec des agents IA et je rédige une thèse sur la tarification de l’eau au Québec.',
    cvLabel: 'CV',
    linkedinLabel: 'LinkedIn',
    emailLabel: 'Courriel',
  },
  about: {
    eyebrow: 'À propos',
    title: 'Économie de la concurrence',
    lead: 'Je travaille sur la concurrence et la tarification.',
    paragraphs: [
      'Je suis français. J’ai grandi à Tahiti (dix ans), puis à Grenoble et à Rennes. Après deux ans de pharmacie à Bordeaux, j’ai bifurqué vers l’économie et je suis arrivé à Montréal en 2021 pour HEC. Résident permanent depuis.',
      'Depuis : examen de fusions au Bureau de la concurrence, conseil économique chez KPMG, veille concurrentielle chez Desjardins. Je construis mes outils avec des agents LLM, des serveurs MCP et des pipelines Python. Le modèle de la thèse et le calendrier FDA plus bas en viennent.',
      'Hors travail : la bonne table, les cafés et les golden retrievers.',
      'Je termine ma M. Sc. en économie appliquée à HEC Montréal à l’été 2026, spécialisée en organisation industrielle. Je reste ouvert aux occasions en concurrence, en tarification et en stratégie. Écrivez-moi.',
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
          'J’ai modélisé des scénarios pour les deux secteurs (faisabilité, risques, sensibilités) et écrit les sommaires de gestion.',
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
        text: 'Spécialisation en organisation industrielle. Mémoire sur la tarification volumétrique de l’eau, avec Réseau Environnement.',
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
    title: 'La tarification volumétrique de l’eau au Québec.',
    description:
      'J’estime ce que gagnent les municipalités quand elles tarifient l’eau au volume. Doubles différences avec adoption échelonnée, sur des panels municipaux et de ménages; Longueuil et Laval servent de cas. Je modélise le coût de service, les coûts évités et la valeur actualisée nette, avec analyses de sensibilité. Avec HEC Montréal et Réseau Environnement.',
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
    lede: 'Des livres sur les industries, les institutions et la décision.',
    books: [
      {
        title: 'Chip War',
        author: 'Chris Miller · 2022',
        note: 'Comment une poignée d’entreprises contrôle l’approvisionnement mondial en puces.',
      },
      {
        title: 'Material World',
        author: 'Ed Conway · 2023',
        note: 'Les intrants physiques de la croissance : sable, cuivre, pétrole.',
      },
      {
        title: 'Working in Public',
        author: 'Nadia Eghbal · Stripe Press',
        note: 'Le livre le plus clair sur les incitatifs et la maintenance du logiciel libre.',
      },
      {
        title: 'Churchill',
        author: 'Andrew Roberts · 2018',
        note: 'Roberts sur les décennies de travail derrière le jugement de Churchill.',
      },
      {
        title: 'Caesar',
        author: 'Adrian Goldsworthy · 2006',
        note: 'Bâtir des coalitions et choisir son moment, à la fin de la République.',
      },
    ],
    subscriptions: {
      title: 'Abonnements',
      groups: [
        {
          label: 'Revues',
          items: [
            {
              name: 'Arena Magazine',
              url: 'https://arenamag.com',
              note: 'Le trimestriel de Max Meyer sur la tech et le capitalisme.',
            },
            {
              name: 'Colossus Review',
              url: 'https://joincolossus.com',
              note: 'La revue imprimée de Patrick O’Shaughnessy : longs portraits d’investisseurs et de fondateurs.',
            },
            {
              name: 'Works in Progress',
              url: 'https://worksinprogress.co',
              note: 'Le magazine du progrès scientifique et économique, appuyé par Stripe.',
            },
          ],
        },
        {
          label: 'Substacks',
          items: [
            {
              name: 'Crémieux',
              url: 'https://www.cremieux.xyz',
              note: 'Des essais denses en données : économie, statistique, sciences sociales.',
            },
            {
              name: 'Campbell Ramble',
              url: 'https://www.campbellramble.ai',
              note: 'Alexander Campbell, ancien de Bridgewater, sur les marchés, la macro et la géopolitique.',
            },
          ],
        },
      ],
    },
  },
  // La section (et son lien de navigation) n’apparaît que si items est non vide.
  // Forme d’un item : { name: 'Nom du café', area: 'Quartier', note: 'Une ligne.', url: 'https://…' (optionnel) }
  cafes: {
    eyebrow: 'Cafés',
    title: 'Cafés à Montréal',
    lede: 'Une liste en cours.',
    items: [],
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
