# Demo Mode — RAI/PAI désactivés

Ce document contient **les textes complets des codes** et **où les intégrer**, fichier par fichier.

---

## 1️⃣ `app/page.tsx`

**Objectif** : supprimer tout appel à `/api/rai` et fournir une entrée simple vers la démo Sports.

**Action** : remplace **entièrement** le fichier `app/page.tsx` par le code ci-dessous.

```tsx
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold">FAIR Engine — Demo</h1>
        <p className="text-gray-400 max-w-md mx-auto">
          Live FAIR engine under calibration. Explore the sports demo with
          stable, static attribution data.
        </p>
        <Link
          href="/sports"
          className="inline-block px-6 py-3 rounded-xl bg-white text-black font-semibold hover:bg-gray-200 transition"
        >
          Open Sports Demo
        </Link>
      </div>
    </main>
  );
}
```

📌 **Résultat** :

* Aucun `useEffect`
* Aucun `fetch`
* Zéro erreur console
* Entrée claire vers `/sports`

---

## 2️⃣ `app/api/rai/route.ts`

**Objectif** : désactiver proprement l’API RAI sans la supprimer.

**Action** : remplace **tout le contenu** du fichier par ceci.

```ts
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

**Objectif** : empêcher tout appel interne à `/api/rai`.

### 🔁 Ancien bloc à NE PLUS utiliser

```ts
const raiResponse = await fetch(
  `${request.nextUrl.origin}/api/rai?gameId=${gameId}&teamId=${teamId}`
);
const raiData = await raiResponse.json();
```

### ✅ Nouveau bloc (à mettre à la place)

```ts
const raiData = {
  status: "disabled",
  message: "RAI disabled in demo mode"
};
```

📌 **Note** :

* Le reste de la logique PAI peut rester inchangé
* Aucune dépendance réseau vers RAI

---

## 🧪 Vérifications finales

* `https://thefairview.vercel.app/sports` → UI fluide, données démo
* `https://thefairview.vercel.app/api/rai` → JSON `status: disabled`
* Console navigateur → **aucune erreur**

---

## ✅ État du produit après ces changements

* Démo stable
* Message produit clair (engine under calibration)
* Base prête pour réactivation progressive du vrai FAIR engine

---

**Commit recommandé** :

```
Disable RAI/PAI APIs for demo mode
```
