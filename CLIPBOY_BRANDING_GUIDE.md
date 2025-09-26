# ClipBoy Branding Guide

## 1. Brand Core

**Name:** ClipBoy

**Essence:** instant video cuts, zero fuss

**Personality:** playful, bold, helpful, a little cheeky

**Tagline Options:**
- "Clip. Cut. Ship."
- "Your fastest cut."
- "Snip it. Post it."

## 2. Logo System

### Primary Logo
- **Format:** Stacked wordmark CLIP / BOY
- **Colors:** White text, black thick outline & shadow
- **Container:** Neon-green rounded square
- **Tilt:** Slight right tilt (≈10–15°)

### Marketing Variant
- Same as primary with scissors cutting a dashed line between rows
- Use on promos, landing sections, and social—not for tiny sizes

### Monogram
- "CB" for favicons, avatars, and tiny contexts

### Clear Space
- At least 0.5× the stroke thickness around the icon

### Minimum Sizes (Raster)
- **App icon:** ≥ 128 px
- **Favicon:** ≥ 32 px (use CB)
- **Social avatar:** ≥ 512 px

### Don'ts
- No hue shifts of green
- No strokes thinner than letters
- No drop-shadow color changes
- Don't skew more than ~15°

## 3. Color Palette

### Core Colors
- **Neon Green:** `#32E33F` (Primary)
- **Ink Black:** `#000000`
- **Paper White:** `#FFFFFF`

### Accent Colors
- **Cut Line Dark:** `#0F0F0F`
- **Spark Yellow:** `#FFD400`
- **Shadow Green:** `#1BA82A` (subtle edge/shadow blend)

### Accessibility Notes
- Headlines must be white on black outline or black on neon to pass contrast
- Avoid light grey on neon

## 4. Typography

### Fonts
- **Display/Logo-adjacent:** Bungee (Google Fonts) or Anton
- **UI/Body:** Inter (Google Fonts) 400/600/800

### Suggested Scales
- **H1:** 48px / 56px line-height / 700 weight
- **H2:** 32px / 40px line-height / 700 weight
- **Body:** 16px / 24px line-height / 400 weight
- **Button:** 16px / 20px line-height / 700 weight (all caps)

### CSS Variables
```css
:root {
  --brand-green: #32E33F;
  --brand-black: #000;
  --brand-white: #fff;
  --accent-yellow: #FFD400;
  --cutline: #0F0F0F;
  --shadow-green: #1BA82A;
  --radius: 24px;
  --tilt: 12deg;
  --shadow: 0.25rem 0.5rem 0 var(--brand-black);
}
```

## 5. Graphic Language

### Motifs
- Dashed cut line
- Angled scissors
- Small yellow "spark" burst

### Angle
- Tilt key elements ~12° clockwise for motion

### Shadow
- Heavy black offset shadow
- Optional inner rim highlight at top-left

### Shapes
- Big rounded rectangles (24–28px corner radius at 1k px scale)

## 6. Components (Web/App)

### Buttons
- **Primary:** White text on brand-green block, black outline (4px), heavy shadow
- **Secondary:** Black fill, white text, thin white inner stroke

### Chips/Badges
- Rounded pill, black fill / white text
- Small scissors icon at left for "Pro"

### Cards
- White card, 2–4px black stroke
- Slight tilt on thumbnails only

### Icons
- Thick strokes, no gradients except the app tile
- Prefer 1-color fills with black outline

## 7. Voice & Copy

### Style
- Short verbs, concrete benefits, playful cutters language

### Example Hero
"Cut videos in seconds. Keep the best. Ship the rest."

### CTAs
- "Start clipping"
- "Try a quick cut"
- "Snip my video"

## 8. Asset Sizes

### Whop
- **App tile/thumbnail:** 1024×1024, 512×512, 256×256 (PNG)
- **Banner/hero:** 1600×900 (PNG/JPG)

### iOS (Key Ones)
- **1024×1024** marketing icon
- **180×180, 120×120** app icons

### Android (Key Ones)
- **512×512** Play icon
- **1024×500** feature graphic

### Social
- **X/LinkedIn header:** 1500×500
- **Post image:** 1200×675
- **Avatar:** 800×800 (use CB monogram)

### Favicon Pack
- **32×32, 48×48, 180×180** (apple-touch), **512×512** (maskable)

## 9. Implementation Notes for ClipBoy App

### Current App Updates Needed
1. **Color Scheme:** Update from current purple/indigo gradient to neon green primary
2. **Typography:** Switch to Bungee for display text, Inter for body
3. **Logo Integration:** Add ClipBoy logo with proper tilt and styling
4. **Button Styling:** Update to brand green with black outline and shadow
5. **Voice:** Update copy to match playful, cheeky tone

### CSS Implementation
```css
/* Update current gradient to brand colors */
.title-gradient {
  background: linear-gradient(to right, #32E33F, #FFD400);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Brand button styling */
.btn-primary {
  background: #32E33F;
  color: white;
  border: 4px solid #000;
  box-shadow: 0.25rem 0.5rem 0 #000;
  transform: rotate(12deg);
}
```

### Next Steps
1. Update app colors to match brand palette
2. Implement proper typography (Bungee + Inter)
3. Add ClipBoy logo with correct styling
4. Update copy to match brand voice
5. Apply consistent tilt and shadow effects
