# aurora-drift

A theme mod for Claude Code. Behind the conversation an aurora shifts slowly through its colors, small lights drift, and pixel sea creatures swim across: fish, jellyfish, a turtle, a squid, a ray and a seahorse. The words come first: the panels keep most of their own color, so the scene shows through as a soft wash.

Claude Code のテーマ mod です。会話の背後でオーロラがゆっくり色を変え、小さな光の粒が漂い、ピクセルの魚・クラゲ・ウミガメ・イカ・エイ・タツノオトシゴが泳ぎます。文字の読みやすさを優先していて、パネルは自分の色をほとんど保ち、背景は淡く透けて見えます。

- Dark mode draws a night sky, light mode a pale polar dawn.
- The scene draws in the Claude desktop and mobile apps. A terminal draws no theme.
- With "Reduce motion" on, the scene holds still.

## Install

At the prompt of a terminal session:

```
/plugin install aurora-drift --marketplace Ochagoro/aurora-drift
```

Answer `y` to add the marketplace, then choose a scope (the user scope is first).

From a shell:

```
claude plugin install aurora-drift --marketplace Ochagoro/aurora-drift
```

In the desktop app, where `/plugin` does not run: click + next to the prompt box, then Plugins, Add marketplace with `Ochagoro/aurora-drift`, then Add plugin.

## Adjust

Two constants at the top of `hooks/register.tsx`:

- `GLASS`: `opacity` (0 to 1) is how much of their own color the panels keep. Lower it for a stronger scene. `blur` (0 to 64) softens what is behind the panels; it stays low so the creatures keep their pixel edges.
- `buildScene('auto')`: `auto` follows the color scheme the app reports. Use `'night'` or `'day'` to pin one.

The creatures are drawn in `hooks/scene.js` as rows of letters, one letter per pixel, so a new one is a few lines of text.
