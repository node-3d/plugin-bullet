import type * as THREE from 'three';
import type * as bullet from '@node-3d/bullet';
import type { Body, Scene, TBodyType, TOptsBody, TQuatLike, TVec3Like } from '@node-3d/bullet';
export type TThree = typeof THREE;
export type TBullet = typeof bullet;
export type TSceneInstance = InstanceType<typeof Scene>;
export type TBodyInstance = InstanceType<typeof Body>;
export type TDebugMode = 'solid' | 'wire';
export type TOptsShape = Omit<TOptsBody, 'scene' | 'mesh'> & Readonly<{
    /**
     * Bullet Physics scene where to insert bodies.
     *
     * This is only necessary if you want to use a custom scene, instead of the one
     * provided by this module.
     */
    sceneBullet?: TSceneInstance;
    /**
     * Three.js scene where to insert debug meshes.
     *
     * This is only necessary if you want to use debug meshes.
     */
    sceneThree?: THREE.Scene;
    /**
     * Three.js object to attach.
     */
    mesh?: THREE.Object3D | null;
    /**
     * Debug mesh style. Default is `null` - off.
     */
    debug?: TDebugMode | null;
    /**
     * Debug mesh color.
     */
    color?: THREE.ColorRepresentation | null;
}>;
export type TShapeInstance = TBodyInstance & {
    mesh: THREE.Object3D | null;
    debug: TDebugMode | null;
};
export type TNewableShape = typeof Body & {
    new (opts?: TOptsShape): TShapeInstance;
    debugMaterial: THREE.MeshStandardMaterial | null;
};
export type TBullet3D = Readonly<{
    /**
     * Raw `@node-3d/bullet` module.
     */
    bullet: TBullet;
    /**
     * Default physics scene.
     */
    scene: TSceneInstance;
    /**
     * Physics-driven object with optional Three.js mesh/debug mesh.
     */
    Shape: TNewableShape;
}>;
export type TInitOpts = Readonly<{
    three?: TThree | null;
}>;
export type TInitShapeOpts = Readonly<{
    scene: TSceneInstance;
    three?: TThree | null;
}>;
export type TVec3Parts = Readonly<{
    x: number;
    y: number;
    z: number;
}>;
export type TQuatParts = Readonly<{
    x: number;
    y: number;
    z: number;
    w: number;
}>;
export type TFollowEvent = Readonly<{
    pos: TVec3Like;
    quat: TQuatLike;
}>;
export type TShapeType = TBodyType | null | undefined;
