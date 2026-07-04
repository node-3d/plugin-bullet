import * as bullet from '@node-3d/bullet';
import { Scene } from '@node-3d/bullet';
import initShape from './shape.ts';
import type { TBullet3D, TInitOpts } from './types.ts';

const initPlugin = (opts: TInitOpts = {}): TBullet3D => {
	const { three = null } = opts;
	const scene = new Scene();
	const Shape = initShape({ scene, three });

	return {
		bullet,
		scene,
		Shape,
	};
};

let inited: TBullet3D | null = null;

/**
 * Initialize Bullet3D.
 *
 * This function can be called repeatedly, but will ignore further calls.
 * The return value is cached and will be returned immediately for repeating calls.
 */
const init = (opts: TInitOpts = {}): TBullet3D => {
	if (inited) {
		return inited;
	}
	inited = initPlugin(opts);
	return inited;
};

export { init };
export type {
	TBullet,
	TBullet3D,
	TDebugMode,
	TInitOpts,
	TNewableShape,
	TOptsShape,
	TShapeInstance,
	TThree,
} from './types.ts';

export default { init };
