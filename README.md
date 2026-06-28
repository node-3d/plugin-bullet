# Node.js 3D Bullet

This is a part of [Node3D](https://github.com/node-3d) project.

[![NPM](https://badge.fury.io/js/%40node-3d%2Fplugin-bullet.svg)](https://badge.fury.io/js/@node-3d/plugin-bullet)
[![Lint](https://github.com/node-3d/plugin-bullet/actions/workflows/lint.yml/badge.svg)](https://github.com/node-3d/plugin-bullet/actions/workflows/lint.yml)
[![Test](https://github.com/node-3d/plugin-bullet/actions/workflows/test.yml/badge.svg)](https://github.com/node-3d/plugin-bullet/actions/workflows/test.yml)

```console
npm install @node-3d/plugin-bullet
```

Bullet physics plugin for Node.js 3D Core

![Example](examples/screenshot.jpg)

This plugin provides the `Shape` class to simplify the common use cases with Three.js and
Bullet Physics addon.

 * Can display debug shapes.
 * Updates mesh pose from physics engine.
 * Removes meshes when the body is destroyed.
 * `Shape` extends `Body` and works with `scene.hit()/scene.trace()`.

```ts
import * as three from 'three';
import { Screen, addThreeHelpers, init } from '@node-3d/core';
import { init as initBullet } from '@node-3d/plugin-bullet';

const { loop } = init();
addThreeHelpers(three);
const { scene, Shape } = initBullet({ three });

const screen = new Screen({ three });

const plane = new Shape({
	sceneThree: screen.scene,
	color: 0xface8d,
	type: 'plane',
	debug: 'solid',
});

const box = new Shape({
	sceneThree: screen.scene,
	pos: [0, 10, 0], // use { xyz } or [xyz]
	mass: 3,
	debug: 'solid',
	color: 0xbeefed,
	size: { x: 3, y: 2, z: 1 }, // use { xyz } or [xyz]
});

loop(() => {
	scene.update();
	screen.draw();
});
```

* See [example](/examples/main.ts) for a complete setup.

## API

### `init(opts?: { three?: typeof import('three') }): TBullet3D`

Initializes the plugin and returns a cached object:

* `bullet` - the complete `@node-3d/bullet` module namespace.
* `scene` - a new `Scene` instance from `@node-3d/bullet`.
* `Shape` - a Three.js-aware class bound to that scene.

Repeated `init()` calls return the first plugin instance.

### `Shape`

`Shape` extends `Body` from `@node-3d/bullet` and adds rendering support.
Constructor options include the normal body options plus:

* `sceneThree` - target Three.js scene for the generated mesh/debug mesh.
* `color` - debug/material color.
* `debug` - debug rendering mode such as `'solid'`.

The shape keeps its Three.js object in sync with Bullet simulation updates and removes
rendering resources when the physics body is destroyed.
