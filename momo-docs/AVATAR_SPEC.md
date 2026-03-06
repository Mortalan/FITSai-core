# FITSai Avatar Spec - 12 Character Illustrations

Generate these as **bust/portrait style**, **transparent background**, **square format** (minimum 512x512px, PNG or WebP).

Style: Fantasy RPG character portraits. Dark/moody tones to fit a dark UI theme. Each character should be distinctly different and recognizable even at small sizes (48px).

---

## 1. Kobold (Levels 1-5)
**Starter class. Small lizard-like warrior.**
- Small reptilian humanoid with green/brown scales
- Yellow slit-pupil eyes, two small horns
- Holding a battered wooden shield with a dent
- Scrappy leather armor, belt pouch
- Expression: Eager but nervous
- **Colors**: Browns `#8B4513`, greens, accent `#A0522D`

## 2. Goblin (Levels 6-10)
**Sneaky rogue trickster.**
- Green-skinned hooded figure, face half-hidden in shadow
- Glowing yellow eyes peering from under the hood
- Long pointed ears sticking out
- Holding a curved dagger, mischievous grin showing teeth
- Dark leather cloak with a belt of pouches
- **Colors**: Dark green `#228B22`, black, accent `#2E4A1E`

## 3. Troll (Levels 11-15)
**Heavy brute tank in stone armor.**
- Massive grey-blue humanoid, thick muscular build
- Heavy brow ridge, two large tusks from lower jaw
- Stone/bone armor plates strapped to shoulders and chest
- Cracked rocky skin texture
- Expression: Fierce, intimidating
- **Colors**: Slate `#2F4F4F`, grey, accent `#4A4A4A`

## 4. Dwarf (Levels 16-20)
**Stout warrior with golden helmet.**
- Short stocky build, impressively braided auburn beard
- Golden winged viking-style helmet with nose guard
- Holding a gem-encrusted pickaxe over one shoulder
- Thick plate armor with a glowing red gem on belt buckle
- Expression: Proud, confident
- **Colors**: Gold `#DAA520`, brown, accent `#FFD700`

## 5. Elf (Levels 21-25)
**Ethereal mage with silver circlet.**
- Tall, elegant features with luminous pale skin
- Long flowing silver/platinum hair
- Silver circlet with a glowing moonstone gem
- Long flowing robes with runic trim
- Pointed ears, serene almond-shaped eyes
- Expression: Calm, wise
- **Colors**: Silver `#E0E0E0`, pale blue, accent `#C0C0C0`

## 6. Wizard (Levels 26-30)
**Classic archmage with staff.**
- Long flowing white/grey beard
- Tall pointed hat decorated with stars and moons
- Holding a gnarled wooden staff topped with a glowing purple orb
- Deep purple robes covered in arcane runes
- Bushy eyebrows, wise purple-glowing eyes
- Expression: Knowing, mysterious
- **Colors**: Purple `#9370DB`, blue, accent `#7B68EE`

## 7. Phoenix (Levels 31-35)
**Majestic fire bird.**
- NOT a humanoid - a magnificent bird of fire
- Spread fiery wings with trailing flames
- Brilliant orange/red/gold feathers
- Fierce golden eyes, elaborate feathered crest
- Glowing ember chest, fire particles around
- Expression: Fierce, majestic
- **Colors**: Orange-red `#FF4500`, gold, accent `#FFD700`

## 8. Unicorn (Levels 36-40)
**Armored mythical horse with crystal horn.**
- Noble white horse head/bust in plate armor
- Spiral crystal horn glowing with iridescent light
- Flowing mane in shades of pink/purple
- Silver/white plate armor on neck and shoulders
- Gentle wise eyes with sparkle highlights
- Expression: Noble, serene
- **Colors**: Pink `#FF69B4`, white, accent `#DA70D6`

## 9. Dragon (Levels 41-45)
**Fearsome dragon head portrait.**
- Massive dragon head/bust, deep crimson red scales
- Large curved horns, ridged brow
- Glowing orange slit-pupil eyes
- Wisps of smoke curling from nostrils
- Visible fangs, hint of wing membrane at sides
- Scale texture with darker underbelly
- Expression: Powerful, commanding
- **Colors**: Crimson `#DC143C`, dark red, accent `#FF6347`

## 10. Demigod (Levels 46-48)
**Divine warrior with lightning powers.**
- Humanoid figure with glowing golden eyes (no pupils)
- Hair floating upward with divine energy
- Lightning bolt crackling in one hand
- Golden shoulder pauldrons, divine armor
- Ethereal golden aura surrounding them
- Expression: Stern, powerful
- **Colors**: Gold `#FFD700`, electric blue, accent `#FFD700`

## 11. God (Level 49)
**Radiant divine being.**
- Luminous being with features barely visible through light
- Double halo rings floating above head
- Pure white/golden robes with star patterns
- Floating stars and light particles around
- Light rays emanating from behind
- Eyes are pure white light
- Expression: Serene, transcendent
- **Colors**: White `#FFFFFF`, gold, accent `#F0E68C`

## 12. BDFL (Level 50)
**Cosmic emperor - Benevolent Dictator For Life.**
- Regal figure wearing an ornate jeweled crown
- Crown has gems in pink, cyan, and white
- Deep royal blue and purple cosmic cape
- Three small stars/planets orbiting around them
- Cosmic starfield visible in cape fabric
- Golden epaulettes on shoulders
- Expression: Confident, benevolent
- **Colors**: Royal blue `#4169E1`, purple, accent `#9370DB`

---

## File Naming Convention
Place generated images in: `frontend/public/avatars/`

```
kobold.png
goblin.png
troll.png
dwarf.png
elf.png
wizard.png
phoenix.png
unicorn.png
dragon.png
demigod.png
god.png
bdfl.png
```

## Integration
Once images are ready, the code will be updated to use `<img src="/avatars/{class}.png">` instead of the current inline SVGs. The SVGs will remain as fallback.
