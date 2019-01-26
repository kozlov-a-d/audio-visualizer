import * as THREE from 'three';
// let OrbitControls = require('three-orbit-controls')(THREE);
// import { TimelineMax } from 'gsap';
import Perlin from './libs/perlin';
import { GLOBAL } from './global';
import AudioAnalyzer from './audio-analyzer';
// import { CreateHTML } from './html';
// import * as Move from './movement';


const audio = new AudioAnalyzer();


let camera, scene, renderer, mesh, geometry;

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    scene.fog = new THREE.FogExp2( 0xcccccc, 0.002 );

    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight); 

    var container = document.getElementById('container');
    container.appendChild(renderer.domElement);

    camera = new THREE.PerspectiveCamera(
        90,
        window.innerWidth / window.innerHeight,
        1,
        1000
    );
    camera.position.z = 0;
    camera.position.y = -300;
    camera.position.x = 0;
    camera.lookAt(new THREE.Vector3( 0, 0, 0 ));
    scene.position.x = 0;
    scene.position.y = 0;
    scene.position.z = 100;
    scene.rotation.x = 30 * Math.PI / 180;


    var material = new THREE.ShaderMaterial({
        // wireframe: true,
        extensions: {
            derivatives: '#extension GL_OES_standard_derivatives : enable',
        },
        uniforms: {
            time: {
                type: 'f',
                value: 0.0
            },
        },
        vertexShader: document.getElementById('vertShader').textContent,
        fragmentShader: document.getElementById('fragShader').textContent,
        side: THREE.DoubleSide,
        transparent: true
    });

    geometry = new THREE.PlaneGeometry(600, 600, GLOBAL.geometrySegmentSize, GLOBAL.geometrySegmentSize);
    mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    console.log(geometry.vertices.length)

    animate();
}


function UpdatePlane(time) {

    for (var i = 0; i < GLOBAL.geometrySegmentSize+1; i++) {
        var koef = Math.sqrt(GLOBAL.bands[i] ) / 2 || 1;
        for (var j = 0; j < GLOBAL.geometrySegmentSize+1; j++) {
            let vec = geometry.vertices[i*100+j];
            vec.z = vec.z + 4 * koef * Perlin(vec.x / 50, vec.y / 50, time / 100) - 5; 
            // vec.z = Math.sqrt( vec.z + 10 * koef * Perlin(vec.x / 50, vec.y / 50, time / 100) ); 
            
            // vec.z = vec.z * Math.min( (vec.z - 100 )/-100 * 2.2 , 0.8 );
            vec.z = vec.z * 0.85 ;
            // if(vec.z > 50) {vec.z = vec.z - 10} 
            if(vec.z > 100) {vec.z = 100} 
            if(vec.z < 0) {vec.z = 0} 
        }
    }
}


let time = 0;

function animate() {
    time++;
    UpdatePlane(time);
    geometry.verticesNeedUpdate = true;
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

init();
