import { EditeurTopbar } from "../_components/EditeurTopbar";
import { ClientNewWizard } from "./ClientNewWizard";

export const metadata = {
  title: "ASTRAEOS · Nouveau client",
};

export default function Page() {
  return (
    <>
      <EditeurTopbar current="Nouveau client" />
      <div className="content">
        <ClientNewWizard />
      </div>
    </>
  );
}
