import type { Register, ThemeSetArgs } from 'claude-code'

import { makeColors } from './make-colors.js'
import { buildScene, SCENE_ALT, SCENE_NAME } from './scene.js'

// How strongly the panels cover the scene. The words come first: the panels keep
// most of their own color, and the scene shows through as a soft wash.
// Lower `opacity` (0 to 1) for a stronger scene. `blur` (0 to 64) stays low so the
// sea creatures keep their pixel edges; the aurora and the lights are soft already.
const GLASS = { blur: 1, opacity: 0.74 }

// `auto` draws the night sky in dark mode and the pale dawn in light mode. If the
// scene and the app ever disagree about the mode, pin one with 'night' or 'day'.
const SCENE = buildScene('auto')

// A night sky by dark, a pale polar dawn by light. Every gray leans toward the
// aurora's blue-green, and the text keeps well clear of the surfaces:
// primary 13.7:1 or better, secondary 8.5:1, muted 5.9:1.
const { theme, problems } = makeColors({
  id: 'aurora-drift',
  label: 'Aurora',
  roles: { accent: '#18c2a8', danger: '#e8566a', success: '#5fbf4a', warning: '#e0a43a', pro: '#a78bfa' },
  light: {
    gray: {
      anchors: {
        'surface-0': '#ecf2f5',
        'surface-1': '#f3f7f9',
        'surface-2': '#fafcfd',
        'text-primary': '#14202a',
        'text-secondary': '#384753',
        'text-muted': '#4f5e6b',
      },
    },
    git: {
      added: '#187a32',
      removed: '#bf1d4c',
      modified: '#7a650f',
      merged: '#7450c8',
      closed: '#cc2a22',
      conflicting: '#a8500f',
      draft: '#5c6873',
    },
  },
  dark: {
    gray: {
      anchors: {
        'surface-0': '#0b1019',
        'surface-1': '#101824',
        'surface-2': '#151e2a',
        'surface-3': '#192431',
        'text-primary': '#e8f1f4',
        'text-secondary': '#c2d0d8',
        'text-muted': '#a3b4bf',
      },
    },
    git: {
      removed: '#ff5f7e',
      merged: '#bfa2ff',
      closed: '#ff7a72',
      conflicting: '#ff9248',
      draft: '#b3bcc4',
    },
  },
})

const LOOK: ThemeSetArgs = {
  colors: theme,
  backdrop: { scene: SCENE_NAME, glass: GLASS },
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    // Desktop ignores a whole palette whose text is under 3:1, so say so if an edit breaks it.
    const unpainted = problems.find(line => line.startsWith("Desktop won't paint"))

    if (unpainted !== undefined) {
      $.ui.toast(unpainted)
    }
    const set = await $.theme.set(LOOK)

    if (!set.isDrawn) {
      $.ui.status(set.reason)
    }

    return next(e)
  })

  // The backdrop is empty until a hook draws it. Every mod's hook hears every
  // backdrop, so answer for this scene alone.
  on('ui.render', { component: 'Backdrop' }, ($, e, next) => {
    if (e.surface !== 'desktop' && e.surface !== 'mobile') {
      return next(e)
    }

    if (e.props.scene !== SCENE_NAME) {
      return next(e)
    }

    const { Svg } = $.ui.resolve(e)

    return <Svg source={SCENE} alt={SCENE_ALT} isInteractive />
  })
}
