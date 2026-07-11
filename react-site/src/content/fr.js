// FR copy dictionary — same shape as en.js, strings only.
// Écrit nativement en français (registre déclaratif), pas traduit.
export const fr = {
  meta: {
    home: {
      title: 'Enzo Simier · Économie appliquée et organisation industrielle',
      description:
        'Enzo Simier, économiste à Montréal. Concurrence chez Desjardins et au Bureau de la concurrence, tarification de l’eau à HEC Montréal et outils publics.',
    },
    project: {
      title: 'FDA Catalyst · Enzo Simier',
      description:
        'Un calendrier de catalyseurs biotech en ligne : 128 événements, 101 entreprises, 23 décisions PDUFA. FastAPI, Railway Postgres, React. Construit par Enzo Simier.',
    },
  },
  a11y: {
    langSwitch: 'Switch to English',
    pageSections: 'Sections de la page',
    projectSections: 'Sections du projet',
    portraitAlt: 'Portrait d’Enzo Simier',
    skipToContent: 'Aller au contenu',
  },
  nav: {
    items: [
      ['À propos', '#about'],
      ['En ce moment', '#now'],
      ['Parcours', '#path'],
      ['Recherche', '#research'],
      ['Projets', '#built'],
      ['Lectures', '#reading'],
      ['Cafés', '#cafes'],
    ],
    projectItems: [
      ['Accueil', '/'],
      ['Aperçu', '#overview'],
      ['Architecture', '#architecture'],
      ['Déploiement', '#deployment'],
    ],
  },
  hero: {
    kicker: 'Économie appliquée · Organisation industrielle',
    name: 'Enzo Simier',
    lede: 'Économiste français à Montréal. Je travaille sur la concurrence, la tarification et la recherche économique appliquée.',
    cvLabel: 'CV',
    linkedinLabel: 'LinkedIn',
    emailLabel: 'Courriel',
  },
  about: {
    eyebrow: 'À propos',
    title: 'À propos de moi',
    body: 'J’ai passé dix ans à Tahiti, puis vécu à Grenoble et à Rennes. Avant l’économie, j’ai étudié la pharmacie à Bordeaux pendant deux ans. Je suis maintenant résident permanent du Canada. Hors travail : la bonne table, les cafés et les golden retrievers.',
  },
  now: {
    eyebrow: 'En ce moment',
    title: 'Été 2026',
    body: 'Cet été, je termine mon mémoire et je reste ouvert aux occasions en concurrence, en tarification et en stratégie.',
  },
  work: {
    eyebrow: 'Parcours',
    title: 'Expériences choisies',
    earlier: 'Expériences antérieures : HEC Montréal, Accélérateur Banque Nationale et Front Row Ventures.',
    items: [
      {
        company: 'Desjardins',
        role: 'Analyste, analyse d’affaires corporative',
        date: 'Avril à juillet 2026',
        details: [
          'J’ai suivi l’évolution du marché bancaire de détail canadien, puis traduit les mouvements des concurrents, des clients et du marché en notes destinées à la haute direction.',
        ],
      },
      {
        company: 'Bureau de la concurrence',
        role: 'Stagiaire, Direction des fusions',
        date: 'Été 2025',
        details: [
          'J’ai appris comment se construit un examen de fusion : définir les marchés, tester la concentration et l’entrée, puis traduire l’analyse en dossiers de décision sous supervision.',
        ],
      },
      {
        company: 'KPMG Canada',
        role: 'Stagiaire, Services-conseils en économie et stratégie',
        date: 'Été 2024',
        details: [
          'J’ai travaillé entre des mandats portuaires et de santé publique, en combinant analyses d’impact, de faisabilité, de risque et de sensibilité avant de les condenser en sommaires de gestion.',
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
        text: 'Spécialisation en organisation industrielle.',
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
    title: 'La tarification volumétrique de l’eau au Québec',
    description:
      'J’estime ce que gagnent les municipalités quand elles tarifient l’eau au volume. La recherche utilise des doubles différences avec adoption échelonnée sur des panels municipaux et de ménages, avec Longueuil et Laval comme cas. Je modélise le coût de service, les coûts évités et la valeur actualisée nette avec des analyses de sensibilité.',
    partners: 'HEC Montréal · Réseau Environnement',
    lens: 'Organisation industrielle, surplus du consommateur, coût de service.',
    supervisors: 'Direction : Justin Leroux et Jean-Luc Martel.',
  },
  fda: {
    title: 'FDA Catalyst Research',
    stack: 'FastAPI · Railway Postgres · React',
    lede: 'Un calendrier en direct des catalyseurs biotech, construit à partir d’enregistrements BPIQ structurés et d’une vérification au cas par cas.',
    metricLabels: ['événements', 'sociétés', 'décisions PDUFA', 'résultats cliniques'],
    liveCta: 'Calendrier en direct',
    caseCta: 'Étude de cas',
  },
  built: {
    eyebrow: 'Projets',
    title: 'Outils que je maintiens',
    lede: 'Deux projets publics.',
    wiki: {
      name: 'Wiki Project',
      stack: 'Next.js · Railway · Supabase',
      note: 'Un wiki public pour le vocabulaire, les notes de lecture et les fragments de projets.',
      liveCta: 'Ouvrir le wiki',
      sourceCta: 'GitHub',
    },
  },
  library: {
    eyebrow: 'Lectures',
    title: 'Livres et publications',
    lede: 'Des livres auxquels je reviens et les publications que je suis.',
    booksTitle: 'Livres',
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
          label: 'Infolettres',
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
  // Les DONNÉES des cafés vivent dans /cafes.json à la racine du dépôt
  // (chargées à l’exécution, mises à jour par l’action add-cafe).
  cafes: {
    eyebrow: 'Cafés',
    title: 'Cafés à Montréal',
    lede: 'Une liste en cours.',
  },
  footer: {
    note: '© 2026 Enzo Simier',
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
