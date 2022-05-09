import './index.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { ConvexGeometry } from 'three/examples/jsm/geometries/ConvexGeometry.js'
import { SceneUtils } from 'three/examples/jsm/utils/SceneUtils.js'
import texture from './chess-texture.jpg'
import Stats from 'stats-js'
    
var scene, renderer, camera, stats;

const init = () => {
    scene = new THREE.Scene()
    const canvas = document.querySelector('canvas.webgl')
    
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000)
    camera.position.x = 30;
    camera.position.y = 40;
    camera.position.z = 30;
    scene.add(camera)
    
    const controls = new OrbitControls(camera, canvas)
    controls.enableDamping = true
    
    renderer = new THREE.WebGLRenderer({ canvas: canvas })
    renderer.setClearColor(0xD85A7FFF, 1)
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

    stats = new Stats();
    stats.setMode(0);
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.left = '0px';
    stats.domElement.style.top = '0px';
    document.getElementById("Stats-output").append(stats.domElement);
}

const generatePoints = () => {
    var points = [];

    var coneR = 10;
    var coneH = 30;

    for (var i = 0; i < 10000; i++) {
        var randomX = -10 + Math.round(Math.random() * 20);
        var randomY = -10 + Math.round(Math.random() * 20);
        var randomZ = -10 + Math.round(Math.random() * 20);

        var coneEquation1 = Math.pow(randomX,2) - (Math.pow(coneR, 2) / Math.pow(coneH, 2)) * Math.pow((randomY - coneH / 2), 2) + Math.pow(randomZ, 2) <= 0;
        var coneEquation2 = -coneH / 2 <= randomY <= coneH / 2;

        if (coneEquation1 && coneEquation2){
            points.push(new THREE.Vector3(randomX, randomY, randomZ));
        }
    }

    var pointsGroup = new THREE.Object3D();
    var pointMaterial = new THREE.MeshBasicMaterial();
    var pointGeometry = new THREE.SphereGeometry(0.2);

    points.forEach(function (point) {
        var pointMesh = new THREE.Mesh(pointGeometry, pointMaterial);
        pointMesh.position.set(point.x, point.y, point.z);
        pointsGroup.add(pointMesh);
    });

    scene.add(pointsGroup);

    var hullGeometry = new ConvexGeometry(points);
    var vertices = hullGeometry.getAttribute("position").array

    var uvs = []
    for( var i = 0; i<vertices.length; i += 3){
        var u = Math.atan2(vertices[i],vertices[i+2]) / (2*Math.PI) + 0.5;
        var v = 0.5 - (vertices[i+1])/20 ;
        uvs.push(...[u,v])
    }

    hullGeometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uvs), 2));
    var hullMesh = createMesh(hullGeometry);
    scene.add(hullMesh);
}

const createMesh = (hullGeometry) => {
    var chessTexture = new THREE.TextureLoader().load( texture );
    var mappedChessMaterial = new THREE.MeshBasicMaterial( {map : chessTexture , transparent: true, opacity: 0.5} )
    var wireFrameMat = new THREE.MeshBasicMaterial({color: 'black', wireframe: true });
    
    return SceneUtils.createMultiMaterialObject(hullGeometry, [mappedChessMaterial, wireFrameMat]);
}


const tick = () =>
{
    stats.update();
    renderer.render(scene, camera)
    
    window.requestAnimationFrame(tick)
}

init();
generatePoints();
tick();