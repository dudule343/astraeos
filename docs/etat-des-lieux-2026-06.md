# Astraeos — État des lieux (audit 2026-06-16)

Audit read-only de l'état réel du backend par sous-système. Statuts :
**real** = fonctionnel bout-en-bout · **partial** = backend réel mais UI wireframe / données mock · **wireframe_only** = HTML statique sans backend.

## Vue d'ensemble

| Sous-système | Statut | Backend (tables / routes) | UI |
|---|---|---|---|
| Collecte de documents (content snare) | 🟢 **real** | `collectes`, `collecte_depots`, `collecte_messages`, bucket `depots` + 9 routes | Page client `/depot/[token]` = vrai React ; UI conseiller = wireframe (mais appels API live) |
| DCI / parcours client | 🟡 partial | `dci_submissions` + 4 routes | Wireframes client (POST live) ; prospect hardcodé |
| Visio & entretiens | 🟡 partial | `entretiens`, `stt_settings` + 7 routes (Deepgram, conseils IA) | Salle = wireframe ; **DCI = mock `DCI_DATA`** |
| Clients / CRM | 🟡 partial | `clients`, `personnes`, `dossiers`… + server actions CRUD | Liste = vrai React ; fiche client = wireframe ; multi-tenant hardcodé |
| Pipeline & fiche dossier | 🟡 partial | **Schéma riche réel** : `dossiers` (enum 6 étapes), `timeline_events`, `etudes` | **Aucune UI réelle, aucune route, aucune transition d'étape** |
| Agenda & RDV | 🟡 partial | Google Calendar OAuth réel (`google_tokens`, `rdv`) + routes | UI ne consomme pas l'API ; RDV jamais persistés ; types-RDV mock |
| Dirigeant — Finance | 🟡 partial | route Qonto réelle (non consommée) ; pas de tables finance | UI React riche mais **100% chiffres hardcodés** |
| Intégrations (Qonto/Google/IA BYOK/auth) | 🟡 partial | `ia_settings`, `google_tokens` + routes réelles | Wireframes (appels API live) ; auth = code partagé, pas Supabase par user |
| Conformité / KYC | 🔴 wireframe | colonnes orphelines (`yousign_*`) ; rien d'exploité | Wireframe seul |
| Dirigeant — Ingénieurs (perf/recrut/comptes) | 🔴 wireframe | aucune table dédiée | Wireframe + page `/team` mock |
| Dirigeant — Assets & partenaires | 🔴 wireframe | aucune table | Wireframe seul |
| Outils / paramétrages / référentiel | 🔴 wireframe | aucune table | Pages React mais 100% mock (StubShell intercepte les clics) |

## Constat clé

- **La DB est en avance sur l'UI.** Beaucoup de tables réelles existent déjà (dont `dossiers` avec l'enum des 6 étapes du parcours, `timeline_events`, `rdv`, `etudes`, `entretiens`…).
- **Le vrai chantier = wireframe → React + routes manquantes.** La plupart des écrans sont des `<iframe src="/wireframes/*.html">` avec données mock, alors que le backend (ou au moins le schéma) existe souvent déjà.
- **1 seule zone réellement finie** : la collecte de documents.

## Dette transverse (à traiter en chemin, pas en bloc)

- **Auth** : code d'accès unique partagé (cookie HMAC), pas d'auth Supabase par utilisateur ; `tenant_id`/`cabinet_id`/`engineer_id` hardcodés (`admin.ts`).
- **RLS** activée mais sans policy → tout dépend du `service_role`.
- **Modèle CRM détourné** : attributs B2B sérialisés en JSON dans `dossiers.internal_notes`.
- **Wireframes en iframe** : 28k+ lignes de HTML statique non maintenable, données passées par manipulation DOM.
