import DocumentsUpload from "./DocumentsUpload";

// Écran public "/parcours/documents" : le prospect dépose ses pièces justificatives.
// L'identité prospect est portée par le lien e-mail (?prospect=<slug>&name=<nom>),
// lue côté client comme les autres écrans /parcours (cf. submit-client.ts).
export default function Page() {
  return <DocumentsUpload />;
}
