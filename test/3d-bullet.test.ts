import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';
import * as three from 'three';
import { init } from '@node-3d/core';
import { init as initBullet } from '@node-3d/plugin-bullet';

init();

const inited = initBullet({ three });

const {
	Shape, scene,
} = inited;

const initResults = [
	'Shape', 'scene', 'bullet',
] as const;

const initedClasses = {
	Shape: {
		create() {
			return new Shape();
		},
		props: ['debug', 'mesh'],
	},
} as const;


const tested = describe('Bullet 3D Inited', () => {
	it('returns all init results', () => {
		for (const name of initResults) {
			assert.ok(
				typeof inited[name],
				`Init field "${name}" is missing.`,
			);
		}
	});
	
	for (const c of Object.keys(initedClasses) as (keyof typeof initedClasses)[]) {
		it(`exports class "${c}"`, () => {
			assert.strictEqual(typeof inited[c], 'function');
		});
		
		const current = initedClasses[c];
		const instance = current.create();
		
		it(`is valid instance of ${c}`, () => {
			assert.ok(
				instance instanceof inited[c],
				`Can't instantiate class "${c}".`,
			);
		});
		
		it(`exposes properties of "${c}"`, () => {
			for (const prop of current.props) {
				assert.ok(
					instance[prop] !== undefined,
					`Property "${c}.${prop}" not found.`,
				);
			}
		});
	}
});

const interv = setInterval(() => scene.update(), 15);
await tested;
clearInterval(interv);
