/** The name `$.theme.set` gives the scene, and the `Backdrop` hook reads back. */
export const SCENE_NAME: string

/** What the scene shows, for a reader that cannot see it. */
export const SCENE_ALT: string

/**
 * The whole scene as one SVG document: the aurora, the drifting lights and the
 * pixel sea creatures. `auto`, the default, picks night or day from the color
 * scheme the app reports to the scene; `night` and `day` pin one.
 */
export function buildScene(mode?: 'auto' | 'night' | 'day'): string

/** The pixel sprites by name: each a list of frames, each frame a list of rows. */
export const SPRITES: Record<string, string[][]>

/** One frame of a sprite as SVG paths on a one-unit grid, in the numbered palette. */
export function drawFrame(rows: string[], palette: number): string
