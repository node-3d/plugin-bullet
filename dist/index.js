import * as __rspack_external__node_3d_bullet_75ce2efc from "@node-3d/bullet";
import { Body } from "@node-3d/bullet";
import "node:path";
import "node:url";
import { promisify } from "node:util";
import { exec } from "node:child_process";
import "node:fs";
import "node:fs/promises";
const nameWindows = 'windows';
const platformAndArch = `${process.platform}-${process.arch}`;
const platformNames = {
    'win32-x64': nameWindows,
    'linux-x64': 'linux',
    'darwin-x64': 'osx',
    'linux-arm64': 'aarch64'
};
platformNames[platformAndArch];
global.AddonTools ??= {};
const loggers = {};
const levels = [
    null,
    'error',
    'warn',
    'info',
    'log',
    'debug'
];
let currentLevel = 'log';
const levelIdx = {};
for(let i = 0; i < levels.length; i++)levelIdx[levels[i] ?? 'null'] = i;
const wrapOutput = (outputFn, level)=>(...args)=>{
        const outputLevel = levelIdx[level] ?? 0;
        const activeLevel = levelIdx[currentLevel ?? 'null'] ?? 0;
        if (outputLevel > activeLevel) return;
        outputFn(...args);
    };
const isLoggerLevel = (value)=>'error' === value || 'warn' === value || 'info' === value || 'log' === value || 'debug' === value;
const assignMethods = (logger, methods)=>{
    for (const [k, v] of Object.entries(methods))if (isLoggerLevel(k) && v) logger.replace(k, v);
};
const createLogger = (opts)=>{
    const prev = loggers[opts.name];
    if (prev) {
        assignMethods(prev, opts);
        return prev;
    }
    const newLogger = {
        debug: console.debug,
        log: console.log,
        info: console.info,
        warn: console.warn,
        error: console.error,
        replace: (level, fn)=>{
            if (levelIdx[level]) newLogger[level] = wrapOutput(fn || console.log, level);
        }
    };
    assignMethods(newLogger, opts);
    loggers[opts.name] = newLogger;
    return newLogger;
};
const getLogger = (name)=>loggers[name] || createLogger({
        name
    });
if (!global.AddonTools.log) global.AddonTools.log = (name, level, ...args)=>{
    const logger = loggers[name];
    if (!logger) return;
    logger[level](...args);
};
createLogger({
    name: 'addon-tools'
});
promisify(exec);
getLogger('addon-tools');
getLogger('addon-tools');
getLogger('addon-tools');
getLogger('addon-tools');
promisify(exec);
getLogger('addon-tools');
globalThis.AddonTools ??= {};
const DEFAULT_COLOR = 0xb7fffa;
const shape_logger = getLogger('plugin-bullet');
const warnWithTrace = (...args)=>{
    shape_logger.warn(...args);
    shape_logger.warn(new Error('Debug mesh warning trace').stack);
};
const isVec3Array = (value)=>Array.isArray(value);
const isQuatArray = (value)=>Array.isArray(value);
const vec3Parts = (value)=>isVec3Array(value) ? {
        x: value[0],
        y: value[1],
        z: value[2]
    } : value;
const quatParts = (value)=>isQuatArray(value) ? {
        x: value[0],
        y: value[1],
        z: value[2],
        w: value[3]
    } : value;
const createDebugGeometry = (three, type, sizeRaw)=>{
    const size = vec3Parts(sizeRaw);
    if (!type || 'box' === type) return new three.BoxGeometry(size.x, size.y, size.z);
    if ('ball' === type) return new three.IcosahedronGeometry(0.5 * size.x, 2);
    if ('roll' === type) return new three.CylinderGeometry(0.5 * size.x, 0.5 * size.x, size.y, 16);
    if ('pill' === type) return new three.CapsuleGeometry(0.5 * size.x, size.y, 2, 16);
    if ('plane' === type) {
        const geo = new three.PlaneGeometry(1000, 1000, 4, 4);
        geo.rotateX(0.5 * -Math.PI);
        return geo;
    }
    return null;
};
const initShape = ({ scene, three })=>{
    class Shape extends Body {
        static debugMaterial = three ? new three.MeshStandardMaterial({
            color: DEFAULT_COLOR
        }) : null;
        _meshDebug = null;
        _sceneThree;
        _color;
        _debug = null;
        _mesh = null;
        constructor(opts = {}){
            const { sceneBullet, sceneThree, mesh, debug, color, ...rest } = opts;
            const sceneFinal = sceneBullet || scene;
            super({
                ...rest,
                scene: sceneFinal
            });
            Object.defineProperty(this, 'mesh', {
                configurable: true,
                get: ()=>this._mesh,
                set: (value)=>this._setMesh(value)
            });
            this._sceneThree = sceneThree || null;
            this._color = color || DEFAULT_COLOR;
            this._setMesh(mesh || null);
            this.debug = debug || null;
            this.on('update', ({ pos, quat })=>this._follow(pos, quat));
            this.on('destroy', ()=>{
                if (!this._mesh) return;
                this._mesh.visible = false;
                this._sceneThree?.remove(this._mesh);
            });
            this.on('size', ()=>this._resetDebugMesh());
            this.on('type', ()=>this._resetDebugMesh());
        }
        get debug() {
            return this._debug;
        }
        set debug(value) {
            if (this._debug === value) return;
            if (value && 'solid' !== value && 'wire' !== value) {
                warnWithTrace('Option `debug` must be "solid" or "wire", if set.');
                this._debug = null;
            } else this._debug = value || null;
            this._resetDebugMesh();
        }
        _setMesh(value) {
            if (this._mesh === value) return;
            this._mesh = value || null;
            if (!this._mesh) return;
            const pos = vec3Parts(this.pos);
            const quat = quatParts(this.quat);
            this._mesh.position.set(pos.x, pos.y, pos.z);
            this._mesh.quaternion.set(quat.x, quat.y, quat.z, quat.w);
        }
        _follow(posRaw, quatRaw) {
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
        _resetDebugMesh() {
            if (this._meshDebug) {
                this._meshDebug.visible = false;
                this._sceneThree?.remove(this._meshDebug);
                this._meshDebug = null;
            }
            if (!this._debug) return;
            if (!this._sceneThree) {
                warnWithTrace('Option `sceneThree` is required for `debug` to work.');
                this._debug = null;
                return;
            }
            if (!three || !Shape.debugMaterial) return void warnWithTrace('Init option `three` is required to create a debug mesh.');
            const geo = createDebugGeometry(three, this.type, this.size);
            if (!geo) return void warnWithTrace(`Could not create a debug mesh for shape "${this.type}".`);
            const mesh = new three.Mesh(geo, Shape.debugMaterial.clone());
            mesh.material.color = new three.Color(this._color);
            mesh.castShadow = true;
            this._sceneThree.add(mesh);
            this._meshDebug = mesh;
            if ('wire' === this._debug) mesh.material.wireframe = true;
            this._follow(this.pos, this.quat);
        }
    }
    return Shape;
};
let inited = null;
const init = (opts)=>{
    if (inited) return inited;
    inited = initShape(opts);
    return inited;
};
const shape = init;
const initPlugin = (opts = {})=>{
    const { three = null } = opts;
    const scene = new __rspack_external__node_3d_bullet_75ce2efc.Scene();
    const Shape = shape({
        scene,
        three
    });
    return {
        bullet: __rspack_external__node_3d_bullet_75ce2efc,
        scene,
        Shape
    };
};
let ts_inited = null;
const ts_init = (opts = {})=>{
    if (ts_inited) return ts_inited;
    ts_inited = initPlugin(opts);
    return ts_inited;
};
const ts = {
    init: ts_init
};
export default ts;
export { ts_init as init };
