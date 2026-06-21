// Données de la maquette qualification.html, hardcodées à l'identique.

export type Product = {
  step: number;
  eyebrow: string;
  title: string;
  definition: string;
  example: string;
};

export const PRODUITS: Product[] = [
  {
    step: 2,
    eyebrow: "Produit 1 sur 9",
    title: "Actions",
    definition:
      "Une action représente une part de propriété dans une entreprise cotée en Bourse.",
    example:
      "Détenir une action LVMH ou TotalEnergies, c'est posséder une infime fraction de l'entreprise et bénéficier de ses dividendes éventuels.",
  },
  {
    step: 3,
    eyebrow: "Produit 2 sur 9",
    title: "Obligations",
    definition:
      "Une obligation est un prêt accordé à un État ou à une entreprise, qui s'engage à le rembourser avec des intérêts.",
    example:
      "Prêter de l'argent à l'État français via une Obligation Assimilable du Trésor (OAT) sur 10 ans, qui verse un coupon annuel fixé à la souscription.",
  },
  {
    step: 4,
    eyebrow: "Produit 3 sur 9",
    title: "Fonds en Euros",
    definition:
      "Support d'épargne au sein d'un contrat d'assurance-vie dont le capital est garanti par l'assureur et qui produit un rendement annuel.",
    example:
      "Le fonds en euros d'un contrat d'assurance-vie classique, qui a rapporté en moyenne 2,5 % en 2024.",
  },
  {
    step: 5,
    eyebrow: "Produit 4 sur 9",
    title: "Immobilier financier (SCPI, OPCI)",
    definition:
      "Investissement dans la pierre via un fonds mutualisé qui détient et gère un parc immobilier locatif.",
    example:
      "Acheter des parts d'une SCPI de bureaux qui distribue des revenus locatifs trimestriels (environ 4,5 % par an).",
  },
  {
    step: 6,
    eyebrow: "Produit 5 sur 9",
    title: "Produits structurés",
    definition:
      "Produit financier complexe combinant plusieurs instruments, dont le rendement est conditionné à un scénario prédéfini.",
    example:
      "Un produit qui rembourse votre capital majoré d'un gain de 5 % par an si le CAC 40 n'a pas baissé de plus de 30 % à l'échéance.",
  },
  {
    step: 7,
    eyebrow: "Produit 6 sur 9",
    title: "Capital risque (FCPI, FCPR)",
    definition:
      "Investissement dans des sociétés non cotées, principalement des PME innovantes ou en développement.",
    example:
      "Un FCPI qui investit dans des start-ups technologiques françaises, en échange d'une réduction d'impôt et d'une espérance de gain à 7-10 ans.",
  },
  {
    step: 8,
    eyebrow: "Produit 7 sur 9",
    title: "OPCVM (SICAV, FCP)",
    definition:
      "Fonds d'investissement qui mutualise l'épargne de nombreux investisseurs pour acheter des actions, obligations et autres titres.",
    example:
      "Un OPCVM « actions zone euro » qui regroupe l'argent de milliers d'épargnants pour acheter un portefeuille diversifié de grandes entreprises européennes.",
  },
  {
    step: 9,
    eyebrow: "Produit 8 sur 9",
    title: "Produits à effet de levier",
    definition:
      "Produit financier qui amplifie la variation d'un sous-jacent (action, indice) par un facteur multiplicateur, dans les deux sens.",
    example:
      "Un Turbo à effet de levier × 5 sur l'action LVMH : si LVMH gagne 1 %, vous gagnez 5 % · si elle perd 1 %, vous perdez 5 %. Risque de perte totale du capital.",
  },
  {
    step: 10,
    eyebrow: "Produit 9 sur 9",
    title: "ETF / Trackers",
    definition:
      "Fonds coté en Bourse qui réplique automatiquement l'évolution d'un indice (CAC 40, S&P 500, etc.).",
    example:
      "Un ETF qui suit le CAC 40 : si l'indice prend 2 %, votre ETF prend également 2 %. Les frais sont sensiblement inférieurs à ceux des fonds gérés activement.",
  },
  {
    step: 11,
    eyebrow: "Produit hors classique",
    title: "Crypto-monnaies",
    definition:
      "Monnaie numérique décentralisée fonctionnant sur la blockchain, sans autorité centrale ni garantie.",
    example:
      "Le Bitcoin ou l'Ethereum, dont les cours peuvent varier de plus de 50 % en quelques mois — à la hausse comme à la baisse.",
  },
];

export const CONNAISSANCE_OPTIONS = [
  "Choisir…",
  "Aucune connaissance",
  "Initié(e)",
  "Avancé(e)",
];
export const EXPERIENCE_OPTIONS = [
  "Choisir…",
  "Aucune expérience",
  "Initié(e)",
  "Avancé(e)",
];
export const OUI_NON_OPTIONS = ["Choisir…", "Oui", "Non", "Ne sait pas"];

export type Choice = { label: string; desc?: string };

export const AUTO_EVAL: Choice[] = [
  {
    label: "Novice",
    desc: "Je débute et je connais peu les placements financiers.",
  },
  {
    label: "Informé(e)",
    desc: "J'ai déjà réalisé plusieurs placements et je commence à en comprendre le fonctionnement.",
  },
  {
    label: "Expérimenté(e)",
    desc: "J'ai une expérience solide des différents produits financiers et je comprends leurs risques.",
  },
  {
    label: "Très expérimenté(e)",
    desc: "Je maîtrise la majorité des instruments financiers et je gère mes investissements de façon autonome.",
  },
];

export const HORIZON: Choice[] = [
  {
    label: "Court terme (moins de 2 ans)",
    desc: "Je prévois de récupérer le capital ou de réaliser des gains rapidement, en acceptant une performance potentiellement plus faible.",
  },
  {
    label: "Moyen terme (3 à 5 ans)",
    desc: "L'investissement peut rester actif quelques années avant d'être liquidé.",
  },
  {
    label: "Long terme (plus de 5 ans)",
    desc: "Je vise un horizon d'investissement supérieur à 5 ans, sans retrait immédiat.",
  },
];

export const PROFILE: Choice[] = [
  {
    label: "Approche prudente",
    desc: "Je privilégie la préservation du capital, quitte à limiter le potentiel de rendement. Je n'accepte qu'une faible proportion de placements à caractère dynamique.",
  },
  {
    label: "Approche équilibrée",
    desc: "Je recherche un juste équilibre entre sécurité et performance, en combinant de manière équilibrée des placements stables et plus dynamiques.",
  },
  {
    label: "Approche dynamique",
    desc: "Je suis disposé(e) à investir une part importante de mon capital dans des placements volatils afin de viser un rendement élevé à long terme, en assumant le risque d'éventuelles pertes significatives.",
  },
];

export const TOLERANCE: Choice[] = [
  {
    label: "Tolérance faible",
    desc: "J'accepte uniquement de légères variations de mon capital.",
  },
  {
    label: "Tolérance modérée",
    desc: "J'accepte des variations modérées dans l'espoir d'obtenir un rendement plus rémunérateur.",
  },
  {
    label: "Tolérance élevée",
    desc: "J'accepte des variations importantes de mon capital, considérant qu'elles peuvent améliorer mon rendement à long terme.",
  },
];

export const REACTION: Choice[] = [
  {
    label: "Liquidation immédiate",
    desc: "Je vends immédiatement pour réorienter les fonds vers un placement moins risqué.",
  },
  {
    label: "Vente différée",
    desc: "J'attends et ne vends qu'en cas de perte jugée significative.",
  },
  {
    label: "Conservation",
    desc: "Je garde ce placement en acceptant ses variations.",
  },
  {
    label: "Renforcement",
    desc: "Je réinvestis, convaincu(e) que la valeur finira par rebondir.",
  },
];

export type Curve = { label: string; desc: string; color: string; path: string; strokeWidth: number };

export const CURVES: Curve[] = [
  {
    label: "Courbe 1",
    desc: "Rendement annuel moyen 1 % · Perte maximale 0 %",
    color: "#C0392B",
    strokeWidth: 2.2,
    path: "M 70 260 L 133 259 L 196 258 L 259 257 L 322 256 L 385 254 L 448 253 L 511 251 L 574 249 L 637 247 L 700 245",
  },
  {
    label: "Courbe 2",
    desc: "Rendement annuel moyen 2 % · Perte maximale 2 %",
    color: "#E67E22",
    strokeWidth: 2.2,
    path: "M 70 260 L 133 262 L 196 264 L 259 261 L 322 257 L 385 253 L 448 249 L 511 252 L 574 244 L 637 235 L 700 230",
  },
  {
    label: "Courbe 3",
    desc: "Rendement annuel moyen 4 % · Perte maximale 7 %",
    color: "#D4AC0D",
    strokeWidth: 2.2,
    path: "M 70 260 L 133 252 L 196 263 L 259 275 L 322 268 L 385 252 L 448 240 L 511 248 L 574 226 L 637 208 L 700 194",
  },
  {
    label: "Courbe 4",
    desc: "Rendement annuel moyen 6 % · Perte maximale 13 %",
    color: "#27AE60",
    strokeWidth: 2.4,
    path: "M 70 260 L 133 240 L 196 266 L 259 290 L 322 298 L 385 272 L 448 232 L 511 218 L 574 196 L 637 178 L 700 158",
  },
  {
    label: "Courbe 5",
    desc: "Rendement annuel moyen 8 % · Perte maximale 23 %",
    color: "#16A2C2",
    strokeWidth: 2.4,
    path: "M 70 260 L 133 230 L 196 296 L 259 320 L 322 268 L 385 220 L 448 308 L 511 220 L 574 178 L 637 162 L 700 131",
  },
  {
    label: "Courbe 6",
    desc: "Rendement annuel moyen 12 % · Perte maximale 28 %",
    color: "#2E5BBA",
    strokeWidth: 2.4,
    path: "M 70 260 L 133 218 L 196 296 L 259 332 L 322 270 L 385 184 L 448 326 L 511 232 L 574 152 L 637 92 L 700 50",
  },
  {
    label: "Courbe 7",
    desc: "Rendement annuel moyen 19 % · Perte maximale 49 %",
    color: "#C71585",
    strokeWidth: 2.5,
    path: "M 70 260 L 133 192 L 196 308 L 259 374 L 322 280 L 385 168 L 448 350 L 511 218 L 574 372 L 637 168 L 700 60",
  },
];

export const ESG_EQUILIBRE: Choice[] = [
  {
    label: "Performance avant tout",
    desc: "Je privilégie exclusivement la performance financière.",
  },
  {
    label: "Équilibre",
    desc: "Je souhaite un équilibre entre performance et impact positif, en acceptant que la performance puisse être inférieure.",
  },
  {
    label: "Impact prioritaire",
    desc: "Je suis prêt(e) à prioriser l'impact sociétal, même si cela implique une diminution significative des perspectives de rendement.",
  },
];

export const ESG_PRIVILEGIER = [
  "Technologies propres / Énergies renouvelables",
  "Santé et biotechnologie",
  "Éducation et innovation sociale",
  "Immobilier durable",
];

export const ESG_EVITER = [
  "Énergies fossiles (pétrole, charbon, gaz)",
  "Armement et défense",
  "Tabac et alcool",
  "Industrie controversée (exploitation minière non responsable…)",
];

export const TOTAL_STEPS = 19;
