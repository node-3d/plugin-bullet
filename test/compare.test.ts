import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';
import * as three from 'three';
import { matchScreenshot } from '@node-3d/core/testing';
import type { TScreenshotReportLevel } from '@node-3d/core/testing';
import initForTest from './init.ts';

const { Shape, Screen, doc, scene } = await initForTest();
const report = (level: TScreenshotReportLevel, message: string, error?: unknown): void => {
	if (error === undefined) {
		console[level](message);
		return;
	}
	console[level](message, error);
};

describe('Screenshots', () => {
	it('matches debug shapes screenshot', async () => {
		const screen = new Screen({ fov: 55, near: 1, far: 100 });
		screen.camera.position.set(8, 7, 10);
		screen.camera.lookAt(0, 1, 0);
		screen.scene.background = new three.Color(0x202838);

		screen.scene.add(new three.AmbientLight(0xffffff, 1));
		const light = new three.DirectionalLight(0xffffff, 2);
		light.position.set(5, 10, 8);
		screen.scene.add(light);

		const shapes = [
			new Shape({
				sceneThree: screen.scene,
				type: 'plane',
				debug: 'wire',
				color: 0x4f81bd,
			}),
			new Shape({
				sceneThree: screen.scene,
				type: 'box',
				pos: [0, 1.5, 0],
				size: [3, 3, 3],
				debug: 'solid',
				color: 0xffb347,
			}),
		];
		assert.strictEqual(shapes.length, 2);

		scene.update();
		screen.draw();

		assert.ok(await matchScreenshot('debug-shapes', { doc, maxFailedPixels: 200, report }));
	});
});
