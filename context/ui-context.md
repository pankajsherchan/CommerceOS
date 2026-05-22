# UI Context

## Theme

CommerceOS uses a dual-persona design system built on one shared token model:

- **Storefront** is light, editorial, and premium. It should feel like a
  credible modern commerce experience: warm neutrals, strong product imagery,
  clear hierarchy, and restrained accent usage.
- **Admin** is dark, operational, and denser. It should feel like a serious
  control surface: layered charcoal backgrounds, crisp borders, compact data
  presentation, and cool accent color for active states.

Both applications share the same semantic token names, radius scale, and
component APIs. The storefront uses the default token set; the admin overrides
the same tokens under an admin theme root such as
`html[data-theme="admin"]`.

## Token Strategy

- Canonical values live in CSS custom properties.
- Tailwind theme variables should be derived from those tokens with `@theme`.
- shadcn/ui semantic tokens such as `background`, `foreground`, `primary`,
  `border`, and `ring` should map to the same source values.
- Components must consume semantic tokens only. No hardcoded hex values in app
  components.

## Colors

| Role | CSS Variable | Storefront | Admin |
| --- | --- | --- | --- |
| Page background | `--bg-base` | `#f6f2eb` | `#0c1117` |
| Surface | `--bg-surface` | `#fffaf4` | `#111925` |
| Elevated surface | `--bg-elevated` | `#ffffff` | `#17212d` |
| Primary text | `--text-primary` | `#1d2430` | `#e6edf3` |
| Muted text | `--text-muted` | `#5f6674` | `#95a4b8` |
| Primary accent | `--accent-primary` | `#b85c2d` | `#18b7d4` |
| Accent foreground | `--accent-foreground` | `#fff8f2` | `#04161b` |
| Border | `--border-default` | `#d7cbbd` | `#233041` |
| Focus ring | `--ring-focus` | `#d97706` | `#55d7ea` |
| Error | `--state-error` | `#b42318` | `#ff6b6b` |
| Success | `--state-success` | `#157347` | `#28c38a` |

## Token Mapping

When the shared theme is implemented:

- `--bg-base` maps to `--background`
- `--bg-surface` maps to `--card`, `--popover`, and default panel surfaces
- `--text-primary` maps to `--foreground`
- `--text-muted` maps to `--muted-foreground`
- `--accent-primary` maps to `--primary`
- `--accent-foreground` maps to `--primary-foreground`
- `--border-default` maps to `--border` and `--input`
- `--ring-focus` maps to `--ring`
- `--state-error` maps to `--destructive`
- Additional semantic tokens should be exposed through Tailwind `@theme inline`
  so shared utilities stay available in both apps

## Typography

| Role | Font | Variable |
| --- | --- | --- |
| UI text | `Manrope` | `--font-sans` |
| Display / merchandising | `Fraunces` | `--font-display` |
| Code / mono | `IBM Plex Mono` | `--font-mono` |

- Storefront hero headlines, promotional banners, and large editorial headings
  may use `--font-display`.
- Admin UI should default to `--font-sans` for clarity and density.
- Use `next/font` for font loading and subsetting.

## Border Radius

| Context | Class |
| --- | --- |
| Inline / small UI | `rounded-md` |
| Inputs / buttons | `rounded-lg` |
| Cards / panels | `rounded-xl` |
| Modals / overlays | `rounded-2xl` |

- Keep one shared base radius token and derive the scale from it.
- Do not invent one-off radius values inside feature components.

## Component Library

Use `shadcn/ui` on top of Tailwind CSS with CSS variables enabled.

- Shared primitives and themed wrappers may begin in the owning app and should
  move into `shared/ui/` only once storefront and admin both need the same
  abstraction.
- Prefer generating primitives with the shadcn CLI, then composing them into
  CommerceOS-specific components.
- Prefer Radix-backed primitives from shadcn for overlays, menus, selects,
  popovers, and other accessibility-sensitive components.
- If a primitive needs customization, prefer wrappers and shared variants
  before editing generated source.

## Layout Patterns

- **Storefront shell**: sticky top navigation, optional announcement strip,
  spacious hero or merchandising band, and content constrained to a generous
  centered container.
- **Catalog pages**: filter rail plus product grid on desktop; stacked filter
  drawer plus grid on mobile.
- **Product detail**: media-heavy layout with gallery and purchase rail side by
  side on desktop; single-column flow on mobile.
- **Checkout**: progressive stacked sections with a sticky order summary rail
  on desktop and an inline summary block on mobile.
- **Admin shell**: fixed left sidebar, sticky header, and scrollable content
  workspace with card-based sections and dense tables.
- **Data tables**: filter toolbar above, table in a bordered surface, and
  pagination/actions below.
- **Modals**: centered overlay for short confirmation flows; right-side sheet
  or drawer for detailed inspect/edit flows.

## Motion

- Use motion to reinforce hierarchy, not to decorate every interaction.
- Preferred patterns are short fade/slide entrances, staggered list reveals,
  and subtle hover state transitions.
- Checkout and payment flows should keep motion minimal and distraction-free.
- Respect `prefers-reduced-motion`.

## Icons

Use `Lucide React`.

- Stroke-based icons only.
- Default sizes:
  - `h-4 w-4` for inline text and dense tables
  - `h-5 w-5` for buttons, nav items, and form affordances
  - `h-6 w-6` for feature cards or empty-state illustrations
