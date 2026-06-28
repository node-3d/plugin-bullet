import { getLogger } from '@node-3d/addon-tools';
import { Body } from '@node-3d/bullet';
import type { TQuatLike, TVec3Like } from '@node-3d/bullet';
import type * as THREE from 'three';
import type {
	TDebugMode,
	TFollowEvent,
	TInitShapeOpts,
	TNewableShape,
	TOptsShape,
	TQuatParts,
	TShapeType,
	TVec3Parts,
} from './types.ts';

const DEFAULT_COLOR = 0xb7fffa;
const logger = getLogger('3d-bullet');

const warnWithTrace = (...args: readonly unknown[]): void => {
	logger.warn(...args);
	logger.warn(new Error('Debug mesh warning trace').stack);
};

const isVec3Array = (value: TVec3Like): value is readonly [number, number, number] => Array.isArray(value);

const isQuatArray = (value: TQuatLike): value is readonly [number, number, number, number] => Array.isArray(value);

const vec3Parts = (value: TVec3Like): TVec3Parts => (
	isVec3Array(value) ? { x: value[0], y: value[1], z: value[2] } : value
);

const quatParts = (value: TQuatLike): TQuatParts => (
	isQuatArray(value) ? { x: value[0], y: value[1], z: value[2], w: value[3] } : value
);

const createDebugGeometry = (
	three: typeof THREE,
	type: TShapeType,
	sizeRaw: TVec3Like,
): THREE.BufferGeometry | null => {
	const size = vec3Parts(sizeRaw);
	
	if (!type || type === 'box') {
		return new three.BoxGeometry(size.x, size.y, size.z);
	}
	
	if (type === 'ball') {
		return new three.IcosahedronGeometry(size.x * 0.5, 2);
	}
	
	if (type === 'roll') {
		return new three.CylinderGeometry(size.x * 0.5, size.x * 0.5, size.y, 16);
	}
	
	if (type === 'pill') {
		return new three.CapsuleGeometry(size.x * 0.5, size.y, 2, 16);
	}
	
	if (type === 'plane') {
		const geo = new three.PlaneGeometry(1000, 1000, 4, 4);
		geo.rotateX(-Math.PI * 0.5);
		return geo;
	}
	
	return null;
};

// oxlint-disable-next-line max-lines-per-function
const initShape = ({ scene, three }: TInitShapeOpts): TNewableShape => {
	class Shape extends Body {
		public static debugMaterial: THREE.MeshStandardMaterial | null = three ?
			new three.MeshStandardMaterial({ color: DEFAULT_COLOR }) :
			null;
		
		private _meshDebug: THREE.Mesh | null = null;
		private _sceneThree: THREE.Scene | null;
		private _color: THREE.ColorRepresentation;
		private _debug: TDebugMode | null = null;
		private _mesh: THREE.Object3D | null = null;
		
		public constructor(opts: TOptsShape = {}) {
			const { sceneBullet, sceneThree, mesh, debug, color, ...rest } = opts;
			const sceneFinal = sceneBullet || scene;
			super({ ...rest, scene: sceneFinal });
			
			Object.defineProperty(this, 'mesh', {
				configurable: true,
				get: () => this._mesh,
				set: (value: THREE.Object3D | null | undefined) => this._setMesh(value),
			});
			
			this._sceneThree = sceneThree || null;
			this._color = color || DEFAULT_COLOR;
			this._setMesh(mesh || null);
			this.debug = debug || null;
			
			this.on('update', ({ pos, quat }: TFollowEvent) => this._follow(pos, quat));
			
			this.on('destroy', () => {
				if (!this._mesh) {
					return;
				}
				this._mesh.visible = false;
				this._sceneThree?.remove(this._mesh);
			});
			
			this.on('size', () => this._resetDebugMesh());
			this.on('type', () => this._resetDebugMesh());
		}
		
		public get debug(): TDebugMode | null { return this._debug; }
		public set debug(value: TDebugMode | null | undefined) {
			if (this._debug === value) {
				return;
			}
			
			if (value && value !== 'solid' && value !== 'wire') {
				warnWithTrace('Option `debug` must be "solid" or "wire", if set.');
				this._debug = null;
			} else {
				this._debug = value || null;
			}
			
			this._resetDebugMesh();
		}
		
		private _setMesh(value: THREE.Object3D | null | undefined): void {
			if (this._mesh === value) {
				return;
			}
			
			this._mesh = value || null;
			
			if (!this._mesh) {
				return;
			}
			
			const pos = vec3Parts(this.pos);
			const quat = quatParts(this.quat);
			this._mesh.position.set(pos.x, pos.y, pos.z);
			this._mesh.quaternion.set(quat.x, quat.y, quat.z, quat.w);
		}
		
		public _follow(posRaw: TVec3Like, quatRaw: TQuatLike): void {
			const pos = vec3Parts(posRaw);
			const quat = quatParts(quatRaw);
			
			if (this._mesh) {
				this._mesh.position.set(pos.x, pos.y, pos.z);
				this._mesh.quaternion.set(quat.x, quat.y, quat.z, quat.w);
			}
			if (this._meshDebug) {
				this._meshDebug.position.set(pos.x, pos.y, pos.z);
				this._meshDebug.quaternion.set(quat.x, quat.y, quat.z, quat.w);
			}
		}
		
		public _resetDebugMesh(): void {
			if (this._meshDebug) {
				this._meshDebug.visible = false;
				this._sceneThree?.remove(this._meshDebug);
				this._meshDebug = null;
			}
			
			if (!this._debug) {
				return;
			}
			
			if (!this._sceneThree) {
				warnWithTrace('Option `sceneThree` is required for `debug` to work.');
				this._debug = null;
				return;
			}
			
			if (!three || !Shape.debugMaterial) {
				warnWithTrace('Init option `three` is required to create a debug mesh.');
				return;
			}
			
			const geo = createDebugGeometry(three, this.type, this.size);
			
			if (!geo) {
				warnWithTrace(`Could not create a debug mesh for shape "${this.type}".`);
				return;
			}
			
			const mesh = new three.Mesh(geo, Shape.debugMaterial.clone());
			mesh.material.color = new three.Color(this._color);
			mesh.castShadow = true;
			this._sceneThree.add(mesh);
			this._meshDebug = mesh;
			
			if (this._debug === 'wire') {
				mesh.material.wireframe = true;
			}
			
			this._follow(this.pos, this.quat);
		}
	}
	
	return Shape as TNewableShape;
};

let inited: TNewableShape | null = null;

const init = (opts: TInitShapeOpts): TNewableShape => {
	if (inited) {
		return inited;
	}
	inited = initShape(opts);
	return inited;
};

export default init;
