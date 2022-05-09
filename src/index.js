import './index.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { ConvexGeometry } from 'three/examples/jsm/geometries/ConvexGeometry.js'
import { SceneUtils } from 'three/examples/jsm/utils/SceneUtils.js'
import texture from './chess-texture.jpg'
import Stats from 'stats-js'
    
var renderer;

const init = () => {

    const canvas = document.querySelector('canvas.webgl')
    
    const controls = new OrbitControls(camera, canvas)
    controls.enableDamping = true
    
    renderer = new THREE.WebGLRenderer({ canvas: canvas })
    renderer.setClearColor(0xd2b48c, 1)
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    
    const spotLight = new THREE.SpotLight(0xffffff);
    spotLight.position.set(50, 100, 50);
    spotLight.castShadow = true;
    scene.add(spotLight);
    
    window.addEventListener('resize', () =>
    {
        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()
        
        renderer.setSize(window.innerWidth, window.innerHeight)
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    })
}

const createMesh = (hullGeometry) => {
    var chessTexture = new THREE.TextureLoader().load( texture );
    var mappedChessMaterial = new THREE.MeshBasicMaterial( {map : chessTexture , transparent: true, opacity: 0.7} )
    var wireFrameMat = new THREE.MeshBasicMaterial({color: 'black', wireframe: true });
    
    return SceneUtils.createMultiMaterialObject(hullGeometry, [mappedChessMaterial, wireFrameMat]);
}

var scene = new THREE.Scene()
var camera = initCamera()
init();
var stats = setStats()
var points = generatePoints();
WrapInConvex(points);
animate();


function initCamera() {
    var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000)
    camera.position.x = 30
    camera.position.y = 40
    camera.position.z = 30
    scene.add(camera)

    return camera;
}

function setStats() {
    var stats = new Stats()
    stats.setMode(0)
    stats.domElement.style.position = 'absolute'
    stats.domElement.style.left = '0px'
    stats.domElement.style.top = '0px'
    document.getElementById("Stats-output").append(stats.domElement)

    return stats;
}

function animate(){
    stats.update();
    renderer.render(scene, camera)
    
    window.requestAnimationFrame(animate)
}

function generatePoints() {
    var points = [];

    var coneR = 10;
    var coneH = 30;

    for (var i = 0; i < 10000; i++) {
        var X = -10 + Math.round(Math.random() * 20);
        var Y = -10 + Math.round(Math.random() * 20);
        var Z = -10 + Math.round(Math.random() * 20);

        var coneEquation1 = Math.pow(X,2) - (Math.pow(coneR, 2) / Math.pow(coneH, 2)) * Math.pow((Y - coneH / 2), 2) + Math.pow(Z, 2) <= 0;
        var coneEquation2 = -coneH / 2 <= Y <= coneH / 2;

        if (coneEquation1 && coneEquation2){
            points.push(new THREE.Vector3(X, Y, Z));
        }
    }

    var pointObject = new THREE.Object3D();
    var pointMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true });
    var pointGeometry = new THREE.SphereGeometry(0.2);

    points.forEach(function (point) {
        var pointMesh = new THREE.Mesh(pointGeometry, pointMaterial);
        pointMesh.position.set(point.x, point.y, point.z);
        pointObject.add(pointMesh);
    });

    scene.add(pointObject);

    return points;
}

function WrapInConvex(points) {
    var hullGeometry = new ConvexGeometry(points)
    var vertices = hullGeometry.getAttribute("position").array

    var uvs = []
    for (var i = 0; i < vertices.length; i += 3) {
        var u = Math.atan2(vertices[i], vertices[i + 2]) / (2 * Math.PI) + 0.5
        var v = 0.5 - (vertices[i + 1]) / 20
        uvs.push(...[u, v])
    }

    hullGeometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uvs), 2))
    var hullMesh = createMesh(hullGeometry)
    scene.add(hullMesh)
}
