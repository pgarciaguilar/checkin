export const runtime = "edge";

export const metadata = {
  title: "Check-in — Els Esclopets",
  description: "Check-in online para Els Esclopets",
};

export default function EsclopetsPage() {
  return (
    <main className="flex-1 flex items-center justify-center p-8">
      <div className="w-full max-w-md text-center">
        <h1 className="text-3xl font-semibold tracking-tight mb-2">Els Esclopets</h1>
        <p className="text-stone-500 mb-8">Check-in online</p>
        <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm text-left">
          <p className="text-sm text-stone-400 text-center">Formulario de check-in próximamente.</p>
        </div>
      </div>
    </main>
  );
}
