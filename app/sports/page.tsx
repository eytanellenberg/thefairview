import { redirect } from "next/navigation";

export default function SportsRedirectPage({
  searchParams,
}: {
  searchParams: { sport?: string };
}) {
  if (searchParams.sport === "nba") {
    redirect("/nba");
  }

  return (
    <main className="max-w-4xl mx-auto p-10 space-y-6">
      <h1 className="text-2xl font-bold">Choose a sport</h1>

      <ul className="space-y-4 text-lg">
        <li><a href="/nba">NBA</a></li>
        <li className="text-gray-400">NFL (coming soon)</li>
        <li className="text-gray-400">MLB (coming soon)</li>
        <li className="text-gray-400">Soccer (coming soon)</li>
      </ul>
    </main>
  );
}
