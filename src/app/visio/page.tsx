export const metadata = {
  title: "PRIVEOS · Visio",
};

export default function VisioPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--ivory)]">
      <iframe
        src="/wireframes/visio.html"
        title="Visio PRIVEOS"
        allow="microphone; camera"
        className="block w-full flex-1 border-0"
        style={{ height: "100vh" }}
      />
    </div>
  );
}
