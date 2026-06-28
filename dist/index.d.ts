import type { TBullet3D, TInitOpts } from './types.ts';
/**
 * Initialize Bullet3D.
 *
 * This function can be called repeatedly, but will ignore further calls.
 * The return value is cached and will be returned immediately for repeating calls.
 */
declare const init: (opts?: TInitOpts) => TBullet3D;
export { init };
export type { TBullet, TBullet3D, TDebugMode, TInitOpts, TNewableShape, TOptsShape, TShapeInstance, TThree, } from './types.ts';
declare const _default: {
    init: (opts?: TInitOpts) => TBullet3D;
};
export default _default;
