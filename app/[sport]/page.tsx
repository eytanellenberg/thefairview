import FairPage from "@/app/components/FairPage";
import { buildNBASnapshot } from "@/lib/nba/snapshot";
import { buildNFLSnapshot } from "@/lib/nfl/snapshot";
import { buildSoccerSnapshot } from "@/lib/soccer/snapshot";

export const dynamic = "force-dynamic";

const loaders: Record<string, Function> = {
  nba: buildNBASnapshot,
  nfl: buildNFLSnapshot,
  soccer: buildSoccerSnapshot,
};

export default async function Page({
  params,
}: {
  params: { sport: string };
}) {
  const load = loaders[params.sport];
  if (!load) return <div>Unknown sport</div>;

  const snapshot = await load();
  return <FairPage snapshot={snapshot} />;
}
