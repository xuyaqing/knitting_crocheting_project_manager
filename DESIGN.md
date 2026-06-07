# DESIGN.md

> Visual system. Read automatically before any design pass. Tokens live in
> `tailwind.config.js` and `src/index.css`.

## Creative North Star

A sunlit craft studio. Warm wool and paper tones, soft rounded surfaces, a single
clay-rose accent like a dyed skein on a cream table. Photography (yarn + finished
projects) is the hero; the UI is the quiet shelf it sits on.

## Color

Implemented by warming Tailwind's `gray` (neutral) and `rose` (accent) scales, so the
whole app shares one palette.

| Token              | Hex       | Use                                   |
| ------------------ | --------- | ------------------------------------- |
| `gray-50` (paper)  | `#FBF7F1` | App background                        |
| `white`            | `#FFFFFF` | Card surfaces                         |
| `gray-100/200`     | warm oat  | Borders, fills, placeholders          |
| `gray-400/500`     | warm taupe| Muted / secondary text                |
| `gray-800/900`     | warm ink  | Primary text, headings                |
| `rose-500` (clay)  | `#C16E5A` | Primary accent, active states, links  |
| `rose-600`         | `#AE5A47` | Accent hover                          |

Status colors (green / blue / amber) stay close to Tailwind defaults but read fine on the
warm background.

## Typography

- **Display (headings, wordmark, card titles):** Fraunces — a soft, high-contrast serif.
  Tailwind class `font-display`.
- **Body / UI:** Nunito — a rounded humanist sans. Default `font-sans`.
- Loaded via Google Fonts in `index.html`.

## Surfaces & shape

- Cards: `rounded-2xl`, hairline warm border, soft shadow, gentle hover lift.
- Generous padding; photos fill the card top edge-to-edge.

## Motion

- Calm and short: 150–220ms ease-out. Hover lifts of ~2px on cards, color transitions on
  links and tabs. Nothing bouncy.

## Surfaces inventory

Header/nav, tab bar, yarn/project/kit gallery cards, yarn & project detail pages, gauge
calculator (forms, step headers, result cards), photo galleries + lightbox, color swatches,
loading skeletons, empty states.
