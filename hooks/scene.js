// The aurora scene: one SVG string, built once when the module loads.
// It runs no script and loads nothing. Everything that moves is CSS in its own <style>.
// There are two versions of the one idea: a night sky, and a pale polar dawn for light mode.
// No filters, masks or blend modes: only gradients, transforms and opacity, so it stays cheap.

export const SCENE_NAME = 'aurora-drift'
export const SCENE_ALT =
  'ゆっくり色を変えるオーロラの中を、ピクセルの魚やクラゲやウミガメが泳ぎ、小さな光の粒が漂う'

const W = 1600
const H = 1000

// A small seeded generator, so everything sits in the same places on every load.
function seeded(seed) {
  let a = seed >>> 0

  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)

    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const rand = seeded(20261116)
const between = (lo, hi) => lo + rand() * (hi - lo)
const index = count => Math.floor(rand() * count)
const n = value => String(Math.round(value * 10) / 10)

// ---------------------------------------------------------------------------
// The aurora
// ---------------------------------------------------------------------------

// The curtains: soft, stretched ellipses in three color layers, strongest in the
// upper part of the window so the middle and the foot stay calm for the words.
// [layer, cx, cy, rx, ry, tilt, move, seconds, delay, opacity]
const BANDS = [
  ['a', 380, 290, 640, 150, -10, 1, 70, -12, 0.9],
  ['a', 1180, 230, 680, 165, 9, 2, 86, -40, 0.85],
  ['a', 820, 410, 520, 110, -3, 3, 62, -25, 0.5],
  ['b', 640, 180, 720, 140, 5, 2, 94, -30, 0.8],
  ['b', 1330, 380, 520, 150, -14, 1, 78, -55, 0.6],
  ['b', 160, 430, 460, 140, 16, 3, 88, -8, 0.6],
  ['c', 900, 90, 820, 130, -4, 3, 104, -60, 0.85],
  ['c', 260, 130, 520, 120, 12, 1, 82, -33, 0.7],
  ['c', 1450, 130, 480, 120, -9, 2, 90, -70, 0.7],
]

const bands = BANDS.map(([layer, cx, cy, rx, ry, tilt, move, seconds, delay, opacity], i) => ({
  layer,
  rule: `.b${i}{animation:m${move} ${seconds}s ease-in-out ${delay}s infinite alternate}`,
  mark:
    `<g transform="rotate(${tilt} ${cx} ${cy})" opacity="${opacity}">` +
    `<ellipse class="bd b${i}" cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#g${layer})"/></g>`,
}))

const layer = name =>
  `<g class="l${name}">${bands
    .filter(band => band.layer === name)
    .map(band => band.mark)
    .join('')}</g>`

// The rays: tall, thin pillars of light that shimmer along the curtains.
const RAY_COUNT = 18

const rays = Array.from({ length: RAY_COUNT }, (_, i) => {
  const cx = 40 + (i + rand()) * ((W - 80) / RAY_COUNT)

  return {
    rule:
      `.r${i}{animation:sh ${n(between(5, 12))}s ease-in-out ${n(-between(0, 12))}s infinite alternate,` +
      `rw ${n(between(22, 42))}s ease-in-out ${n(-between(0, 40))}s infinite alternate}`,
    mark: `<ellipse class="r${i}" cx="${n(cx)}" cy="${n(between(180, 360))}" rx="${n(between(14, 34))}" ry="${n(between(170, 300))}" fill="url(#gr)"/>`,
  }
})

// ---------------------------------------------------------------------------
// The lights
// ---------------------------------------------------------------------------

// Each one travels slowly along one of a few paths, fading in and out at the
// ends, while it sways and twinkles on its own clock.
const TRAVEL = [
  [40, -150],
  [-60, -120],
  [90, -90],
  [-30, -170],
  [120, -40],
  [-110, -60],
  [20, -200],
  [-80, -140],
]
const SWAY = [
  [-9, 5, 11, -7],
  [8, 6, -10, -5],
  [-6, -8, 7, 9],
  [12, -3, -12, 4],
]
const TWINKLE = [
  [0.35, 1],
  [0.55, 1],
  [0.2, 0.9],
]
const GLOW_COUNT = 28
const MOTE_COUNT = 40

const lights = Array.from({ length: GLOW_COUNT + MOTE_COUNT }, (_, i) => {
  const isGlow = i < GLOW_COUNT
  const seconds = isGlow ? between(80, 150) : between(60, 130)
  const paint = isGlow ? `fill="url(#p${1 + (i % 3)})"` : 'class="mo"'
  const r = isGlow ? between(7, 17) : between(1.1, 2.4)

  return {
    rule:
      `.t${i}{animation:v${index(TRAVEL.length)} ${n(seconds)}s linear ${n(-between(0, seconds))}s infinite}` +
      `.s${i}{animation:w${index(SWAY.length)} ${n(between(7, 14))}s ease-in-out ${n(-between(0, 14))}s infinite alternate,` +
      `k${index(TWINKLE.length)} ${n(between(4, 9))}s ease-in-out ${n(-between(0, 9))}s infinite alternate}`,
    mark:
      `<g class="t${i}"><g class="s${i}">` +
      `<circle ${paint} cx="${n(between(-40, W + 40))}" cy="${n(between(60, H + 120))}" r="${n(r)}"/></g></g>`,
  }
})

const travelFrames = TRAVEL.map(
  ([dx, dy], i) =>
    `@keyframes v${i}{0%{transform:translate(0,0);opacity:0}12%{opacity:1}88%{opacity:1}` +
    `100%{transform:translate(${dx}px,${dy}px);opacity:0}}`,
).join('')

const swayFrames = SWAY.map(
  ([x1, y1, x2, y2], i) =>
    `@keyframes w${i}{from{transform:translate(${x1}px,${y1}px)}to{transform:translate(${x2}px,${y2}px)}}`,
).join('')

const twinkleFrames = TWINKLE.map(
  ([from, to], i) => `@keyframes k${i}{from{opacity:${from}}to{opacity:${to}}}`,
).join('')

// ---------------------------------------------------------------------------
// The sea creatures
// ---------------------------------------------------------------------------

// Small pixel sprites, drawn as squares on a grid, most with two frames that
// alternate: a tail flaps, a bell pulses, a flipper strokes. Each faces right.
// A letter names a color slot: a body, b shade, c highlight, e eye. A dot is empty.
export const SPRITES = {
  fish: [
    [
      '.....bb.....',
      'b..aaaaaa...',
      'bbaaaaaaaa..',
      '.baaaaaaaea.',
      'bbaacccaaa..',
      'b..accca....',
      '.....b......',
    ],
    [
      '.....bb.....',
      '...aaaaaa...',
      '.baaaaaaaa..',
      'bbaaaaaaaea.',
      '.baacccaaa..',
      '...accca....',
      '.....b......',
    ],
  ],
  tall: [
    [
      '....b....',
      '...bb....',
      '..baaa...',
      'b.aabaa..',
      'bbaabaaa.',
      '.baabaea.',
      'bbaabaaa.',
      'b.aabaa..',
      '..baaa...',
      '...bb....',
      '....b....',
    ],
    [
      '....b....',
      '...bb....',
      '..baaa...',
      '..aabaa..',
      '.baabaaa.',
      'bbaabaea.',
      '.baabaaa.',
      '..aabaa..',
      '..baaa...',
      '...bb....',
      '....b....',
    ],
  ],
  jelly: [
    [
      '...aaa...',
      '.aaaaaaa.',
      'aacaaaaaa',
      'aaaaaaaaa',
      'a.a.a.a.a',
      'b..b.b..b',
      '.b.b.b.b.',
      '.b..b..b.',
      'b..b.b..b',
      '...b.b...',
      '....b....',
      '.........',
    ],
    [
      '...aaa...',
      '..aaaaa..',
      '.aacaaaa.',
      '.aaaaaaa.',
      '.aaaaaaa.',
      '.a.a.a.a.',
      '.b.b.b.b.',
      '.b.b.b.b.',
      '..b.b.b..',
      '..b.b.b..',
      '...b.b...',
      '....b....',
    ],
  ],
  turtle: [
    [
      '....bbbbbb......',
      '..bbaabbaabb....',
      '.bbaabbaabbb.cc.',
      '.baabbaabbabccec',
      'cbbbbbbbbbbbcccc',
      '..ccccccccccc...',
      '.ccc.....ccc....',
      'ccc.......ccc...',
    ],
    [
      '....bbbbbb......',
      '..bbaabbaabb....',
      '.bbaabbaabbb.cc.',
      '.baabbaabbabccec',
      'cbbbbbbbbbbbcccc',
      'ccccccccccccc...',
      '.......ccc......',
      '................',
    ],
  ],
  squid: [
    [
      '......aaaa....',
      'b.bb.aaaaaaa..',
      '.b..baacaaaaaa',
      'bbbbbaeaaaaaaa',
      '.b..baaaaaaaaa',
      'b.bb.aaaaaaa..',
      '......aaaa....',
    ],
    [
      '......aaaa....',
      '.....aaaaaaa..',
      'bbbbbaacaaaaaa',
      '.bbbbaeaaaaaaa',
      'bbbbbaaaaaaaaa',
      '.....aaaaaaa..',
      '......aaaa....',
    ],
  ],
  seahorse: [
    [
      '..aaa..',
      '.aaeaa.',
      '.aaaaaa',
      '.aaa...',
      'baac...',
      'baaca..',
      '.aaca..',
      '..aaa..',
      '...aa..',
      '..aa...',
      '.a.a...',
      '.aa....',
    ],
    [
      '..aaa..',
      '.aaeaa.',
      '.aaaaaa',
      '.aaa...',
      '.aac...',
      'baaca..',
      'baaca..',
      '..aaa..',
      '...aa..',
      '..aa...',
      '.a.a...',
      '.aa....',
    ],
  ],
  ray: [
    [
      '........a......',
      '.......aaa.....',
      '......aaaaa.c..',
      '.....aaaaaeac..',
      'bbbbbaaaaaaaaa.',
      '.....aaaaaeac..',
      '......aaaaa.c..',
      '.......aaa.....',
      '........a......',
    ],
    [
      '...............',
      '........a......',
      '.......aaaa.c..',
      '......aaaaeac..',
      'bbbbbaaaaaaaaa.',
      '......aaaaeac..',
      '.......aaaa.c..',
      '........a......',
      '...............',
    ],
  ],
  mini: [['b.aa.', '.baaa', 'b.aa.']],
}

// One path of unit squares, a run at a time, for every cell that passes the test.
function cells(rows, test) {
  let d = ''

  rows.forEach((row, y) => {
    let x = 0

    while (x < row.length) {
      if (!test(row[x])) {
        x += 1
        continue
      }
      let end = x

      while (end < row.length && test(row[end])) {
        end += 1
      }
      d += `M${x} ${y}h${end - x}v1h${x - end}z`
      x = end
    }
  })

  return d
}

// One frame of a sprite in one palette. The whole silhouette goes down first in
// the body color, so no seam shows where two colors meet.
export function drawFrame(rows, palette) {
  let mark = `<path class="q${palette}a" d="${cells(rows, cell => cell !== '.')}"/>`

  for (const slot of ['b', 'c']) {
    const d = cells(rows, cell => cell === slot)

    if (d !== '') {
      mark += `<path class="q${palette}${slot}" d="${d}"/>`
    }
  }
  const eye = cells(rows, cell => cell === 'e')

  return eye === '' ? mark : `${mark}<path class="ey" d="${eye}"/>`
}

// Creature colors as [body, shade, highlight]. They stay in the middle of the
// range in both modes, so nothing glares or goes dark under the words.
const SEA_NIGHT = [
  ['#ff9d4d', '#e0652a', '#ffd29a'], // 0 orange
  ['#3fd6c0', '#1f9c96', '#a9f2e2'], // 1 teal
  ['#ff86b5', '#d9578e', '#ffc4dc'], // 2 pink
  ['#ffd75e', '#e0a030', '#ffeaa6'], // 3 yellow
  ['#b79bff', '#8a6be0', '#dccfff'], // 4 violet
  ['#6fb8ff', '#4a8fe0', '#c4e0ff'], // 5 blue
  ['#6fd68a', '#3f9e63', '#d2f0a8'], // 6 green
  ['#ff7f6e', '#d95548', '#ffbcae'], // 7 coral
]
const SEA_DAY = [
  ['#f28a3a', '#d4622a', '#fbc084'],
  ['#22b8a6', '#14958a', '#86e0d0'],
  ['#ee6a9e', '#cf4f85', '#f9b0cd'],
  ['#e8b62a', '#c9961a', '#f7dc82'],
  ['#9a7cf2', '#7f62dc', '#cbbcfb'],
  ['#4c98ea', '#3a7fd6', '#a6cdf6'],
  ['#48b46c', '#359457', '#b4de86'],
  ['#ec6654', '#cf4c3c', '#f7a698'],
]

const seaColors = (palettes, eye) =>
  palettes
    .map(([body, shade, highlight], i) => `.q${i}a{fill:${body}}.q${i}b{fill:${shade}}.q${i}c{fill:${highlight}}`)
    .join('') + `.ey{fill:${eye}}`

const creatures = []

// One creature: an outer group travels, a middle one bobs, and the inner one
// places the sprite, sets its pixel size and turns it to face left when asked.
function creature({ marks, x, y, travel, bob, beat }) {
  const i = creatures.length
  const hasFrames = marks.length > 1
  const beatDelay = hasFrames ? n(-between(0, beat)) : '0'

  creatures.push({
    rule:
      `.ox${i}{animation:${travel}}.oy${i}{animation:${bob}}` +
      (hasFrames
        ? `.of${i}{animation:pa ${beat}s step-end ${beatDelay}s infinite}` +
          `.og${i}{animation:pb ${beat}s step-end ${beatDelay}s infinite}`
        : ''),
    mark:
      `<g class="ox${i}"><g class="oy${i}"><g transform="translate(${x} ${y})">` +
      (hasFrames ? `<g class="of${i}">${marks[0]}</g><g class="og${i}">${marks[1]}</g>` : marks[0]) +
      '</g></g></g>',
  })
}

const sized = (pixel, isLeft, opacity, inner) =>
  `<g transform="scale(${isLeft ? -pixel : pixel} ${pixel})" opacity="${opacity}">${inner}</g>`

const swim = (isLeft, seconds) =>
  `${isLeft ? 'sl' : 'sr'} ${seconds}s linear ${n(-between(0, seconds))}s infinite`

const bobbing = (name, seconds) =>
  `${name} ${seconds}s ease-in-out ${n(-between(0, seconds))}s infinite alternate`

// The swimmers cross the whole window in their own lanes.
// [sprite, palette, pixel, lane, swims left, crossing seconds, beat seconds, opacity]
const SWIMMERS = [
  ['ray', 5, 6, 80, true, 176, 1.8, 0.85],
  ['fish', 0, 5, 170, false, 118, 0.7, 0.95],
  ['tall', 4, 5, 270, true, 164, 1, 0.9],
  ['fish', 1, 4, 350, true, 150, 0.8, 0.7],
  ['turtle', 6, 6, 470, false, 190, 1.6, 0.95],
  ['fish', 2, 5, 580, false, 132, 0.6, 0.95],
  ['tall', 3, 5, 650, false, 156, 1.1, 0.9],
  ['fish', 3, 4, 720, true, 170, 0.9, 0.7],
  ['squid', 7, 5, 800, true, 140, 1.2, 0.9],
  ['fish', 1, 6, 880, false, 124, 0.7, 1],
]

for (const [sprite, palette, pixel, lane, isLeft, seconds, beat, opacity] of SWIMMERS) {
  creature({
    marks: SPRITES[sprite].map(rows => sized(pixel, isLeft, opacity, drawFrame(rows, palette))),
    x: 0,
    y: lane,
    travel: swim(isLeft, seconds),
    bob: bobbing('bo', n(between(5, 9))),
    beat,
  })
}

// Two schools of tiny fish, each moving as one.
// [palette, pixel, lane, swims left, crossing seconds, how many]
const SCHOOLS = [
  [5, 4, 420, false, 128, 7],
  [0, 4, 230, true, 146, 6],
]

for (const [palette, pixel, lane, isLeft, seconds, count] of SCHOOLS) {
  let inner = ''

  for (let k = 0; k < count; k += 1) {
    inner +=
      `<g transform="translate(${Math.round(between(0, 170))} ${Math.round(between(-45, 45))})">` +
      `${sized(pixel, isLeft, 0.85, drawFrame(SPRITES.mini[0], palette))}</g>`
  }
  creature({
    marks: [inner],
    x: 0,
    y: lane,
    travel: swim(isLeft, seconds),
    bob: bobbing('bo', n(between(6, 10))),
    beat: 0,
  })
}

// The jellyfish rise from the foot to the top, pulsing as they go.
// [palette, pixel, x, rising seconds, beat seconds, opacity]
const JELLIES = [
  [4, 6, 230, 200, 2.2, 0.85],
  [5, 5, 1040, 240, 2.6, 0.7],
  [2, 5, 1390, 180, 2, 0.85],
]

for (const [palette, pixel, x, seconds, beat, opacity] of JELLIES) {
  creature({
    marks: SPRITES.jelly.map(rows => sized(pixel, false, opacity, drawFrame(rows, palette))),
    x,
    y: 0,
    travel: `ju ${seconds}s linear ${n(-between(0, seconds))}s infinite`,
    bob: bobbing('jw', beat * 2),
    beat,
  })
}

// One seahorse hovers near the right edge.
creature({
  marks: SPRITES.seahorse.map(rows => sized(5, true, 0.9, drawFrame(rows, 3))),
  x: 1500,
  y: 560,
  travel: bobbing('hv', 46),
  bob: bobbing('bo', 4),
  beat: 0.6,
})

const seaFrames =
  '@keyframes sr{from{transform:translateX(-360px)}to{transform:translateX(1760px)}}' +
  '@keyframes sl{from{transform:translateX(1760px)}to{transform:translateX(-360px)}}' +
  '@keyframes ju{from{transform:translateY(1080px)}to{transform:translateY(-170px)}}' +
  '@keyframes bo{from{transform:translateY(-12px)}to{transform:translateY(12px)}}' +
  '@keyframes jw{from{transform:translate(-16px,7px)}to{transform:translate(16px,-9px)}}' +
  '@keyframes hv{from{transform:translate(-46px,16px)}to{transform:translate(38px,-22px)}}' +
  // The two frames of a sprite take turns, with no fade between them.
  '@keyframes pa{0%{opacity:1}50%,100%{opacity:0}}' +
  '@keyframes pb{0%{opacity:0}50%,100%{opacity:1}}'

// ---------------------------------------------------------------------------
// The style
// ---------------------------------------------------------------------------

// How each color layer wanders through its hues, as [start, second, third].
const hueFrames = (name, [first, second, third]) =>
  `@keyframes c${name}{0%,100%{stop-color:${first}}33%{stop-color:${second}}66%{stop-color:${third}}}`

const NIGHT = {
  a: ['#4dffb5', '#3df0d6', '#4cc4ff'],
  b: ['#38d4ff', '#6f8cff', '#a07bff'],
  c: ['#b06cff', '#ff6fc8', '#6f8bff'],
  r: ['#d6fff0', '#d2f6ff', '#e6dcff'],
}
const DAY = {
  a: ['#00c389', '#00b8ad', '#1f97e8'],
  b: ['#1a9fe8', '#4f6df2', '#8458f2'],
  c: ['#9150f2', '#f04fa8', '#5470f2'],
  r: ['#58d6b6', '#62bdf0', '#a48cf5'],
}

const hues = palette =>
  Object.entries(palette)
    .map(([name, colors]) => `.g${name}{stop-color:${colors[0]}}${hueFrames(name, colors)}`)
    .join('')

// Day: a pale sky, deeper hues so they read as pastels over it, tinted lights.
const dayRules =
  '.k0{stop-color:#e2ebf5}.k1{stop-color:#edf3f8}.k2{stop-color:#f3eff8}' +
  hues(DAY) +
  '.p1{stop-color:#00a884}.p2{stop-color:#1c86e0}.p3{stop-color:#7c4cf0}' +
  '.mo{fill:#2a9d8a}' +
  seaColors(SEA_DAY, '#33424f')

// `auto` follows the color scheme the app reports to the scene; `night` and `day` pin one.
const dayStyle = mode =>
  mode === 'night' ? '' : mode === 'day' ? dayRules : `@media (prefers-color-scheme:light){${dayRules}}`

const style = mode =>
  // Night: the ground, the aurora's hues, the lights and the creatures.
  '.k0{stop-color:#040812}.k1{stop-color:#07111f}.k2{stop-color:#0a1623}' +
  hues(NIGHT) +
  '.pc{stop-color:#ffffff}.p1{stop-color:#8dffd9}.p2{stop-color:#9fdcff}.p3{stop-color:#cbb4ff}' +
  '.mo{fill:#eafff6}' +
  seaColors(SEA_NIGHT, '#14222e') +
  // Each layer's hue drifts on its own long clock, and the layers cross-fade.
  '.ga{animation:ca 110s linear infinite}.gb{animation:cb 140s linear -35s infinite}' +
  '.gc{animation:cc 170s linear -80s infinite}.gr{animation:cr 110s linear infinite}' +
  '.la{animation:fa 48s ease-in-out infinite alternate}' +
  '.lb{animation:fb 64s ease-in-out -20s infinite alternate}' +
  '.lc{animation:fc 80s ease-in-out -50s infinite alternate}' +
  '@keyframes fa{from{opacity:.6}to{opacity:1}}' +
  '@keyframes fb{from{opacity:.35}to{opacity:.95}}' +
  '@keyframes fc{from{opacity:.9}to{opacity:.3}}' +
  // The curtains sway about their own centers.
  '.bd{transform-box:fill-box;transform-origin:50% 50%}' +
  '@keyframes m1{from{transform:translate(-70px,-14px) rotate(-3deg) scale(1,.9)}to{transform:translate(80px,22px) rotate(3deg) scale(1.08,1.18)}}' +
  '@keyframes m2{from{transform:translate(90px,16px) rotate(2.5deg) scale(1.06,1.1)}to{transform:translate(-80px,-20px) rotate(-3deg) scale(.96,.86)}}' +
  '@keyframes m3{from{transform:translate(-50px,26px) rotate(-2deg) scale(.94,1.15)}to{transform:translate(100px,-12px) rotate(2deg) scale(1.08,.9)}}' +
  '@keyframes sh{from{opacity:.04}to{opacity:.5}}' +
  '@keyframes rw{from{transform:translate(-26px,0)}to{transform:translate(26px,10px)}}' +
  travelFrames +
  swayFrames +
  twinkleFrames +
  seaFrames +
  bands.map(band => band.rule).join('') +
  rays.map(ray => ray.rule).join('') +
  lights.map(light => light.rule).join('') +
  creatures.map(one => one.rule).join('') +
  dayStyle(mode) +
  // A still scene for anyone who asks for less motion.
  '@media (prefers-reduced-motion:reduce){*{animation-play-state:paused!important}}'

const auroraGradient = name =>
  `<radialGradient id="g${name}">` +
  `<stop offset="0" class="g${name}" stop-opacity=".8"/>` +
  `<stop offset=".4" class="g${name}" stop-opacity=".4"/>` +
  `<stop offset=".75" class="g${name}" stop-opacity=".1"/>` +
  `<stop offset="1" class="g${name}" stop-opacity="0"/></radialGradient>`

const lightGradient = id =>
  `<radialGradient id="p${id}">` +
  `<stop offset="0" class="pc" stop-opacity=".95"/>` +
  `<stop offset=".2" class="p${id}" stop-opacity=".62"/>` +
  `<stop offset=".55" class="p${id}" stop-opacity=".18"/>` +
  `<stop offset="1" class="p${id}" stop-opacity="0"/></radialGradient>`

export const buildScene = (mode = 'auto') =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">` +
  `<style>${style(mode)}</style>` +
  '<defs>' +
  '<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">' +
  '<stop offset="0" class="k0"/><stop offset=".55" class="k1"/><stop offset="1" class="k2"/></linearGradient>' +
  ['a', 'b', 'c'].map(auroraGradient).join('') +
  '<radialGradient id="gr">' +
  '<stop offset="0" class="gr" stop-opacity=".55"/><stop offset=".5" class="gr" stop-opacity=".2"/>' +
  '<stop offset="1" class="gr" stop-opacity="0"/></radialGradient>' +
  [1, 2, 3].map(lightGradient).join('') +
  '</defs>' +
  `<rect x="-50" y="-50" width="${W + 100}" height="${H + 100}" fill="url(#sky)"/>` +
  '<g>' +
  layer('c') +
  layer('b') +
  layer('a') +
  `<g>${rays.map(ray => ray.mark).join('')}</g>` +
  // A faint glow along the foot, so the lower half is not empty.
  `<ellipse cx="${W / 2}" cy="${H + 90}" rx="1150" ry="270" fill="url(#ga)" opacity=".2"/>` +
  '</g>' +
  `<g>${creatures.map(one => one.mark).join('')}</g>` +
  `<g>${lights.map(light => light.mark).join('')}</g>` +
  '</svg>'
