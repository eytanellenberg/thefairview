# TheFairView v2 - Clean Rebuild

## Architecture Simplifiée

### FREE VERSION ONLY
- Dernier match de chaque équipe
- RAI pré-match (prédiction avec 3 leviers)
- PAI post-match (performance réelle + comparaison RAI)
- Banner: "Analyses pros disponibles - contactez-nous"

### Formule FAIR Originale
```r
lin_pred = -4 + 0.06*perf_mean + -0.05*fatigue_mean + -0.04*risk_mean + 0.05*moral_mean
prob_win = plogis(lin_pred)
rai_score = prob_win * 100
```

### Mapping ESPN → FAIR

**Performance** (0-100):
- FG% + 3PT% + FT% (40%)
- Assists/Turnovers ratio (30%)
- Rebonds totaux (30%)

**Fatigue** (0-100):
- Jours de repos (60%)
- Back-to-back penalty (40%)

**Risk** (0-100):
- Nombre de blessés (60%)
- Minutes moyennes jouées (40%)

**Morale** (0-100):
- Win streak (50%)
- Home/Away (30%)
- Forme récente (last 5) (20%)

## Fichiers Créés

```
thefairview-v2/
├── app/
│   ├── api/
│   │   ├── rai/route.ts        # RAI API endpoint
│   │   └── pai/route.ts        # PAI API endpoint
│   ├── lib/
│   │   ├── fair-core.ts        # Formule FAIR originale
│   │   ├── espn-mapper.ts      # Mapping ESPN → FAIR
│   │   └── espn-api.ts         # Client ESPN API
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                # UI principale
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
└── postcss.config.js
```

## Fonctionnalités

### ✅ IMPLEMENTÉ
1. Formule FAIR exacte de simul.R
2. Mapping ESPN stats → FAIR inputs
3. API RAI (pré-match)
4. API PAI (post-match)
5. UI simple et claire
6. Top 3 leviers avec explications
7. Comparaison RAI vs PAI

### ⏳ TODO
1. Fix bug 3PT% parsing
2. Cache système pour refresh
3. Tests avec vraies données ESPN
4. Déploiement Vercel

## Déploiement

```bash
cd thefairview-v2
npm install
npm run dev        # Test local
npm run build      # Production build
```

## Vercel Deployment

```bash
vercel --prod
```

## Contact Banner
"Analyses avancées disponibles pour analystes:
- RAI détaillé par équipe
- Leviers personnalisés
- Intégration données club propriétaires
Contactez-nous: contact@thefairview.com"

## Notes Importantes

- Version FREE uniquement (pas de Premium/Club)
- Confiance: 65% (données publiques)
- Formule FAIR ORIGINALE utilisée
- ESPN API pour stats réelles
- Cache-busting pour refresh
