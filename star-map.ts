import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { STELLAR_CLASSES, StellarClass, getPositionFromRaDec } from './star-utils';
// import { STARS } from './stars';
import { STARS } from './stars-hip';

const renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 10, 20000);

let orbitControls = new OrbitControls(camera, renderer.domElement);
orbitControls.minDistance = 1;
orbitControls.maxDistance = 1000;
orbitControls.maxPolarAngle = Math.PI / 2;
camera.position.y = orbitControls.target.y + 20;
camera.position.x = 20;
camera.position.z = 20;
orbitControls.update();

const light = new THREE.HemisphereLight(0xB1E1FF, 0xB97A20, 1);
scene.add(light);

const light2 = new THREE.AmbientLight(0x0000FF, 0.1);
scene.add(light2);

let starPointFragmentShader = `
uniform vec3 diffuse;
uniform float opacity;

void main() {
    float centerDistance = 2.0 * length(gl_PointCoord - vec2(0.5, 0.5));
    float distanceVertical = abs(gl_PointCoord.x - 0.5);
    float distanceHorizontal = abs(gl_PointCoord.y - 0.5);

    float a = 1.0 - (centerDistance + (10.0 * min(distanceVertical, distanceHorizontal)));
    if (a < 0.0) a = 0.0;
    if (a > 1.0) a = 1.0;
    a = sin(a * 1.57);

    gl_FragColor = vec4(diffuse, a);
}
`;

let sunGeometry = new THREE.SphereBufferGeometry(1, 6, 6);
let sunMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFF00 });
let solMesh = new THREE.Mesh(sunGeometry, sunMaterial);
solMesh.name = 'Sol';
scene.add(solMesh);

// attributes = geometry
// uniforms = material

// let pointsGeometry = new THREE.BufferGeometry();
// pointsGeometry.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0], 3));
// let points = new THREE.Points(pointsGeometry, pm);
// scene.add(points);

let starSystemColorMap: {[key in StellarClass]: number} = {
    'G': 0xFFFFFF,
    'M': 0x990000,
    'K': 0xFFBE8A,
    'L': 0x381900,
    'T': 0x381900,
    'Y': 0x381900,
    'A': 0xFFFFFF,
    'D': 0x6E6E6E,
    'F': 0xFFF785,
    'B': 0xFFFFFF,
    'O': 0xFFFFFF,
    'S': 0xFFFFFF,
    'W': 0xFFFFFF,
    'R': 0xFFFFFF,
    'C': 0xFFFFFF,
    'P': 0xFFFFFF,
    'N': 0xFFFFFF
};

let sphereGeometry = new THREE.SphereGeometry(1, 20, 20);
// let starMeshes: {[key in StellarClass]: THREE.InstancedMesh};
let starMeshes: {[key in StellarClass]: THREE.Points};
let starMeshInstanceNameMap: {[key in StellarClass]: string[]};

let filter = {
    stellarClasses: ['K', 'G', 'F']
};

function applyFilter(): void {
    let cutoff = parseInt((<HTMLInputElement>document.getElementById('distance-cutoff')).value);
    if (isNaN(cutoff)) cutoff = 200.0;
    let closeStars = STARS.filter((star) => star.distance <= cutoff && star.distance >= -cutoff);
    let count = 0;
    for (let stellarClass of STELLAR_CLASSES) {
        if (filter.stellarClasses.indexOf(stellarClass) === -1) {
            starMeshes[stellarClass].visible = false;
        } else {
            starMeshes[stellarClass].visible = true;
            // count += starMeshes[stellarClass].count;
            count += closeStars.filter((star) => star.class == stellarClass).length;
        }
    }
    document.getElementById('star-count').innerText = count.toString();
}

function buildMeshes() {
    let cutoff = parseInt((<HTMLInputElement>document.getElementById('distance-cutoff')).value);
    if (isNaN(cutoff)) cutoff = 200.0;
    let closeStars = STARS.filter((star) => star.distance <= cutoff && star.distance >= -cutoff);
    
    if (starMeshes !== undefined) {
        for (let stellarClass of STELLAR_CLASSES) {
            scene.remove(starMeshes[stellarClass]);
            // starMeshes[stellarClass].dispose();
        }
    }

    starMeshes = <any>{ };
    starMeshInstanceNameMap = <any>{ };

    for (let stellarClass of STELLAR_CLASSES) {
        let starsInClass = closeStars.filter((star) => star.class === stellarClass);
        // starMeshes[stellarClass] = new THREE.InstancedMesh(sphereGeometry, new THREE.MeshBasicMaterial({ color: starSystemColorMap[stellarClass]}), starsInClass);
        // starMeshes[stellarClass] = new THREE.InstancedMesh(sphereGeometry, starMaterial, starsInClass);
        starMeshInstanceNameMap[stellarClass] = [];
        let starGeometry = new THREE.BufferGeometry();
        let points = [];
        for (let star of starsInClass) {
            points.push(...getPositionFromRaDec(star.distance, star.rightAscension, star.declination).toArray());
            starMeshInstanceNameMap[stellarClass].push(star.name);
        }
        starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
        let starMaterial = new THREE.PointsMaterial({
            size: 5.0,
            transparent: true,
            color: starSystemColorMap[stellarClass]
        })
        starMaterial.onBeforeCompile = (shader) => {
            shader.fragmentShader = starPointFragmentShader;
        };
        starMeshes[stellarClass] = new THREE.Points(starGeometry, starMaterial);
        starMeshes[stellarClass].name = stellarClass;
        scene.add(starMeshes[stellarClass]);
        starMeshes[stellarClass].visible = true;
    
    }
    
    // for (let star of closeStars) {
    //     let i = starMeshInstanceNameMap[star.class].length;
    //     let position = new THREE.Matrix4().setPosition(getPositionFromRaDec(star.distance, star.rightAscension, star.declination));
    //     starMeshes[star.class].setMatrixAt(i, position);
    //     starMeshInstanceNameMap[star.class].push(star.name);
    // }

    applyFilter();
}
buildMeshes();

let objectNameContainer = document.getElementById('object-name-container');
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();
renderer.domElement.addEventListener('pointermove', (mouseEvent) => {
    mouse.x = (mouseEvent.clientX / renderer.domElement.clientWidth) * 2 - 1;
    mouse.y = -(mouseEvent.clientY / renderer.domElement.clientHeight) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    let intersects = raycaster.intersectObjects([...Object.values(starMeshes).filter((mesh) => mesh.visible), solMesh]);
    for (let intersect of intersects) {
        if (intersect.object.name === 'Sol') {
            objectNameContainer.innerText = intersect.object.name;
        } else {
            objectNameContainer.innerText = starMeshInstanceNameMap[intersect.object.name][intersect.index];
        }
        objectNameContainer.style.left = mouseEvent.clientX + 20 + 'px';
        objectNameContainer.style.top = mouseEvent.clientY + 'px';
        break;
    }
    if (intersects.length === 0) {
        objectNameContainer.innerText = '';
    }
});

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
});

let stellarClassFilterElements = document.querySelectorAll('#filter-container input') as NodeListOf<HTMLInputElement>;
for (let i = 0; i < stellarClassFilterElements.length; i++) {
    stellarClassFilterElements[i].addEventListener('change', function() {
        let index = filter.stellarClasses.indexOf(this.name);
        if (this.checked && index === -1) {
            filter.stellarClasses.push(this.name);
        }
        if (!this.checked && index !== -1) {
            filter.stellarClasses.splice(index, 1);
        }
        applyFilter();
    });
    stellarClassFilterElements[i].checked = filter.stellarClasses.indexOf(stellarClassFilterElements[i].name) !== -1;
}

document.getElementById('distance-cutoff').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        buildMeshes();
    }
});

document.getElementById('name-search').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        let nameFilter = (this as HTMLInputElement).value.toUpperCase();
        if (nameFilter === 'SOL') {
            camera.lookAt(solMesh.position.clone());
            orbitControls.target = solMesh.position.clone();
            (this as HTMLInputElement).value = '';
        } else {
            let candidates: { class: StellarClass, i: number }[] = [];
            let exactMatch: { class: StellarClass, i: number } = undefined;
            for (let stellarClass of STELLAR_CLASSES) {
                if (filter.stellarClasses.indexOf(stellarClass) === -1) continue;
                for (let i = 0; i < starMeshInstanceNameMap[stellarClass].length; i++) {
                    if (starMeshInstanceNameMap[stellarClass][i].toUpperCase().indexOf(nameFilter) !== -1) {
                        candidates.push({ class: stellarClass, i: i });
                        if (starMeshInstanceNameMap[stellarClass][i].toUpperCase() === nameFilter) {
                            exactMatch = { class: stellarClass, i: i };
                            break;
                        }
                    }
                }
                if (exactMatch !== undefined) break;
            }
            if (exactMatch !== undefined) candidates = [exactMatch];
            if (candidates.length === 1) {
                let starMatrix = new THREE.Matrix4();
                // starMeshes[candidates[0].class].getMatrixAt(candidates[0].i, starMatrix);
                let starPosition = new THREE.Vector3().setFromMatrixPosition(starMatrix);
                camera.lookAt(starPosition);
                orbitControls.target = starPosition;
                (this as HTMLInputElement).value = '';
            }
        }
    }
});

function animate() {
	requestAnimationFrame(animate);

	renderer.render(scene, camera);
}
animate();
