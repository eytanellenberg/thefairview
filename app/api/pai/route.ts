import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      status: "disabled",
      message: "RAI API disabled — demo mode. Live FAIR engine under calibration."
    },
    { status: 200 }
  );
}
```

📌 **Résultat** :

* `/api/rai` ne renvoie plus d’erreur
* Aucun 400
* Message explicite en mode démo

---

## 3️⃣ `app/api/pai/route.ts`

**Objectif** : fournir une API PAI stable en mode démo **sans aucun appel** à `/api/rai`.

**Action** : remplace **entièrement** le fichier `app/api/pai/route.ts` par le code complet ci-dessous.

```ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// PAI — Demo Mode (no dependency on RAI)
// -------------------------------------------------
// - No external fetch
// - No /api/rai call
// - Stable JSON contract for frontend
// -------------------------------------------------

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const gameId = searchParams.get("gameId") ?? "demo-game";
  const teamId = searchParams.get("teamId") ?? "demo-team";

  // 🔒 RAI is intentionally disabled in demo mode
  const raiData = {
    status: "disabled",
    message: "RAI disabled in demo mode"
  };

  // 📊 Static / deterministic demo PAI payload
  const paiDemo = {
    status: "demo",
    meta: {
      engine: "FAIR",
      mode: "demo",
      calibration: "in-progress"
    },
    request: {
      gameId,
      teamId
    },
    rai: raiData,
    pai: {
      value: 0.62,
      interpretation: "Moderate post-game performance attribution",
      components: [
        {
          factor: "Offensive efficiency",
          contribution: 0.28
        },
        {
          factor: "Defensive pressure",
          contribution: 0.21
        },
        {
          factor: "Pace & tempo",
          contribution: 0.13
        }
      ]
    }
  };

  return NextResponse.json(paiDemo, { status: 200 });
}
