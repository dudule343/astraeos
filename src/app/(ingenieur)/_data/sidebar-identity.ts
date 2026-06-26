// Identité affichée dans l'encart « Connecté en tant que » du pied de la
// sidebar ingénieur. Type PUR (aucun import serveur) pour pouvoir être importé
// à la fois par le composant client `Sidebar` et par le module serveur qui la
// résout depuis la base.
export type SidebarIdentity = {
  nomComplet: string;
  role: string;
  cabinet: string;
};
