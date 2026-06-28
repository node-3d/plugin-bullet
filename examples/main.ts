import * as three from 'three';
import { init, addThreeHelpers, Image, Screen } from '@node-3d/core';
import { init as initBullet } from '@node-3d/plugin-bullet';
import type { TOptsShape, TShapeInstance } from '@node-3d/plugin-bullet';
import type { TVec3Like } from '@node-3d/bullet';


const {
	doc, loop,
} = init({
	isGles3: true,
	isWebGL2: true,
	autoEsc: true,
	autoFullscreen: true,
	vsync: true,
	msaa: 2,
});

addThreeHelpers(three);

const { scene, Shape } = initBullet({ three });

const icon = new Image('bullet.png');
icon.on('load', () => {
	if (icon.data) {
		doc.icon = { width: icon.width, height: icon.height, data: icon.data };
	}
});
doc.title = 'Bullet';

const screen = new Screen({ three, fov: 60, near: 1, far: 200 });

screen.camera.position.z = 40;
screen.camera.position.y = 10;
screen.camera.position.x = 10;
screen.camera.up = new three.Vector3(0, 1, 0);
screen.camera.lookAt(new three.Vector3(0, 0, 0));

screen.renderer.shadowMap.enabled = true;
screen.scene.background = new three.Color(0x87ceeb);
screen.scene.fog = new three.FogExp2(0x87ceeb, 0.007);

const getRandom = (min: number, max: number): number => Math.random() * (max - min) + min;

const getRandomPosition = (): TVec3Like => ({
	x: getRandom(-10, 10),
	y: getRandom(20, 2000),
	z: getRandom(-10, 10)
});

let dx = 0;
let dz = 0;

const F_KEY = 70;
const UP_ARROW = 87;
const DOWN_ARROW = 83;
const LEFT_ARROW = 65;
const RIGHT_ARROW = 68;

screen.on('keydown', e => {
	if (e.keyCode === F_KEY) {
		if (e.ctrlKey && e.shiftKey) {
			screen.mode = 'windowed';
		} else if (e.ctrlKey && e.altKey) {
			screen.mode = 'fullscreen';
		} else if (e.ctrlKey) {
			screen.mode = 'borderless';
		}
	}
	
	if (e.keyCode === UP_ARROW) {
		dz = -0.2;
	} else if (e.keyCode === DOWN_ARROW) {
		dz = 0.2;
	} else if (e.keyCode === LEFT_ARROW) {
		dx = -0.2;
	} else if (e.keyCode === RIGHT_ARROW) {
		dx = 0.2;
	}
});

screen.on('keyup', e => {
	if (e.keyCode === UP_ARROW || e.keyCode === DOWN_ARROW) {
		dz = 0;
	} else if (e.keyCode === LEFT_ARROW || e.keyCode === RIGHT_ARROW) {
		dx = 0;
	}
});


//----- Floor
const floorTexture = new three.TextureLoader().load('textures/texture_1.jpg');
floorTexture.wrapS = three.RepeatWrapping;
floorTexture.wrapT = three.RepeatWrapping;
floorTexture.repeat.set(128, 128);

const floorMaterial = new three.MeshStandardMaterial({ map: floorTexture });
const geoFloor = new three.PlaneGeometry(1000, 1000, 4, 4);
geoFloor.rotateX(-Math.PI * 0.5);
const meshFloor = new three.Mesh(geoFloor, floorMaterial);
meshFloor.receiveShadow = true;

screen.scene.add(meshFloor);
//-----

const ambientLight = new three.AmbientLight(0xffeeee, 0.3);
screen.scene.add(ambientLight);

const directionalLight = new three.DirectionalLight(0xeeeeff, 1.8);
directionalLight.position.set(-150, 350, 250);
screen.scene.add(directionalLight);

const d = 256;
directionalLight.castShadow = true;
directionalLight.shadow.camera.left = -d;
directionalLight.shadow.camera.right = d;
directionalLight.shadow.camera.top = d;
directionalLight.shadow.camera.bottom = -d;
directionalLight.shadow.camera.near = 10;
directionalLight.shadow.camera.far = 500;
directionalLight.shadow.mapSize.x = 2048;
directionalLight.shadow.mapSize.y = 2048;
directionalLight.shadow.intensity = 0.55;

const plane = new Shape({
	sceneThree: screen.scene,
	color: 0xff0000,
	type: 'plane',
	debug: 'wire',
});

const raycaster = new three.Raycaster();
const mouse = new three.Vector2();

const isShapeInstance = (body: unknown): body is TShapeInstance => body instanceof Shape;

screen.on('mousedown', (e) => {
	mouse.x = (e.x / screen.w) * 2 - 1;
	mouse.y = -(e.y / screen.h) * 2 + 1;
	
	raycaster.setFromCamera(mouse, screen.camera);
	const ray = raycaster.ray;
	
	const start = ray.origin;
	const end = ray.at(9001, new three.Vector3());
	
	const { body } = scene.hit(start, end);
	const shape = isShapeInstance(body) ? body : null;
	
	if (shape?.mass) {
		if (e.button === 0) { // left
			shape.vell = [0, 10 + 30 * Math.random(), 0];
			shape.vela = [10 * Math.random(), 10 * Math.random(), 10 * Math.random()];
			shape.debug = shape.debug === 'solid' ? 'wire' : 'solid';
		} else if (e.button === 2) { // right
			shape.destroy();
		}
	}
});


const getCommonOpts = (): TOptsShape => ({
	sceneThree: screen.scene,
	pos: getRandomPosition(),
	mass: getRandom(0.3, 4),
	debug: 'solid',
	color: Math.min(0xffffff, 0x888888 + Math.floor(0x888888 * Math.random())),
});


const createCylinder = (): TShapeInstance => {
	const radius = getRandom(0.5, 2);
	return new Shape({
		...getCommonOpts(),
		type: 'roll',
		size: [radius, getRandom(5, 10), radius],
	});
};


const createBox = (): TShapeInstance => new Shape({
	...getCommonOpts(),
	size: { x: getRandom(1, 5), y: getRandom(1, 5), z: getRandom(1, 5) },
});


const createSphere = (): TShapeInstance => {
	const radius = getRandom(2, 3);
	return new Shape({
		...getCommonOpts(),
		type: 'ball',
		size: [radius, radius, radius],
	});
};


const createCapsule = (): TShapeInstance => {
	const radius = getRandom(0.5, 2);
	return new Shape({
		...getCommonOpts(),
		type: 'pill',
		size: [radius, getRandom(5, 10), radius],
	});
};

const bodies: TShapeInstance[] = [plane];

for (let i = 0; i < 40; i++) {
	bodies.push(createBox());
	bodies.push(createCylinder());
	bodies.push(createCapsule());
	bodies.push(createSphere());
}


loop(() => {
	screen.camera.position.x += dx;
	screen.camera.position.z += dz;
	
	scene.update();
	screen.draw();
});
