import { platform } from 'node:process';
import * as three from 'three';
import type { Screen as TScreen, TCore3D, TGlfw, TInitOpts } from '@node-3d/core';
import type { TBullet3D } from '../ts/index.ts';

type TInitForTest = TCore3D &
	TBullet3D & {
		Screen: typeof TScreen;
	};

const shouldUseHeadlessGlfw = platform === 'darwin';

const applyGlesWindowHints = (currentGlfw: TGlfw): void => {
	currentGlfw.windowHint(currentGlfw.VISIBLE, currentGlfw.FALSE);
	currentGlfw.windowHint(currentGlfw.OPENGL_PROFILE, currentGlfw.OPENGL_ANY_PROFILE);
	currentGlfw.windowHint(currentGlfw.CONTEXT_VERSION_MAJOR, 3);
	currentGlfw.windowHint(currentGlfw.CONTEXT_VERSION_MINOR, 2);
	currentGlfw.windowHint(currentGlfw.CLIENT_API, currentGlfw.OPENGL_ES_API);
	currentGlfw.windowHint(currentGlfw.STENCIL_BITS, 0);
	currentGlfw.windowHint(currentGlfw.DEPTH_BITS, 0);
	currentGlfw.windowHint(currentGlfw.SAMPLES, 0);
};

const applyHeadlessWindowHints = (currentGlfw: TGlfw): void => {
	currentGlfw.windowHint(currentGlfw.CONTEXT_CREATION_API, currentGlfw.EGL_CONTEXT_API);
	applyGlesWindowHints(currentGlfw);
};

const bootstrapHeadlessGlfw = async (): Promise<TGlfw | null> => {
	if (!shouldUseHeadlessGlfw) {
		return null;
	}

	const nodeGlobal = globalThis as unknown as Record<string, unknown>;
	nodeGlobal.__isGlfwInited = true;
	const { glfw } = await import('@node-3d/glfw');
	glfw.initHint(glfw.PLATFORM, glfw.PLATFORM_NULL);

	if (!glfw.init()) {
		throw new Error('Failed to initialize GLFW for headless tests');
	}

	glfw.defaultWindowHints();
	nodeGlobal.__isGlfwInited = true;
	return glfw;
};

const headlessGlfw = await bootstrapHeadlessGlfw();
const core = await import('@node-3d/core');
const { addThreeHelpers, glfw, init, Screen } = core;

const getInitOpts = (): TInitOpts => {
	if (shouldUseHeadlessGlfw) {
		return {
			width: 400,
			height: 400,
			isGles3: true,
			isWebGL2: true,
			isVisible: false,
			onBeforeWindow(_window, currentGlfw) {
				applyHeadlessWindowHints(currentGlfw as TGlfw);
			},
		};
	}

	if (platform === 'linux') {
		return { width: 400, height: 400, isGles3: true, isWebGL2: true };
	}

	return { width: 400, height: 400, isGles3: false, major: 2, minor: 1 };
};

const initForTest = async (): Promise<TInitForTest> => {
	if (shouldUseHeadlessGlfw) {
		(headlessGlfw ?? glfw).windowHint(glfw.STENCIL_BITS, 0);
	}

	const node3d = init(getInitOpts());
	const { init: initBullet } = await import('../ts/index.ts');

	addThreeHelpers();
	return { ...node3d, ...initBullet({ three }), Screen };
};

export default initForTest;
