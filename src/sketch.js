// Ensure ThreeJS is in global scope for the 'examples/'
global.THREE = require('three');

// Include any additional ThreeJS examples below
require('three/examples/js/controls/OrbitControls');

const canvasSketch = require('canvas-sketch');

const createTubeWireframe = require('three-tube-wireframe');

const Random = require('canvas-sketch-util/random');

Random.setSeed(Random.getRandomSeed);

const paperColors = require('paper-colors').map(c => c.hex);

const risoColors = require('riso-colors').map(c => c.hex);

const settings = {
    dimensions: [ 1480, 1080 ],

    duration: 10,

    suffix: Random.getSeed(),

    fps: 30,

    // units: 'in',

    // orientation: 'landscape',

    pixelsPerInch: 300,

    scaleToView: true,
  // Make the loop animated
  animate: true,
  // Get a WebGL canvas rather than 2D
  context: 'webgl',
  // Turn on MSAA
  attributes: { antialias: true }
};

const sketch = ({ context }) => {
  // Create a renderer
  const renderer = new THREE.WebGLRenderer({
    context
  });

  // WebGL background color
  renderer.setClearColor(Random.pick(paperColors), 1);

  // Setup a camera
  const camera = new THREE.PerspectiveCamera(45, 1, 0.01, 100);
  camera.position.set(2, 2, -4);
  camera.lookAt(new THREE.Vector3());

  // Setup camera controller
  const controls = new THREE.OrbitControls(camera, context.canvas);

  // Setup your scene
  const scene = new THREE.Scene();

//   const geometry = new THREE.SphereGeometry(1, 16, 8);

    const geometry = new THREE.PlaneGeometry(2, 2, 10, 10);

    geometry.vertices.forEach(vertex => {
        // vertex.z = (Math.random() * 2 - 1) * 0.25;

        const f = 0.5;
        const amplitutude = 0.5;
        vertex.z = Random.noise2D(vertex.x * f, vertex.y * f);
    });

    const color = Random.pick(risoColors);
  
  const material = new THREE.MeshBasicMaterial({ 
      color: color,
    //   wireframe: true
  });

  const wireGeometry = createTubeWireframe(geometry, {
      thickness: 0.005,
      filter: () => Random.boolean(),
      mode: 'cross-hatch'
  });

  const mesh = new THREE.Mesh(wireGeometry, material);

  scene.add(mesh);

  const joinGeometry = new THREE.TorusGeometry(0.5, 0.25, 3, 3);

  geometry.vertices.forEach(vertex => {
    const joinMaterial = new THREE.MeshBasicMaterial({
        color: color,


    });

    const join = new THREE.Mesh(joinGeometry, joinMaterial);

    join.position.copy(vertex);

    join.scale.setScalar(0.05);

    // join.lookAt(new THREE.Vector3());
    
    //3d rotation thing 
    join.quaternion.fromArray(Random.quaternion());


    scene.add(join);
  });

  // draw each frame
  return {
    // Handle resize events here
    resize ({ pixelRatio, viewportWidth, viewportHeight }) {
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(viewportWidth, viewportHeight);
      camera.aspect = viewportWidth / viewportHeight;
      camera.updateProjectionMatrix();
    },
    // Update & render your scene here
    render ({ playhead }) {
    //   mesh.rotation.y = time * (10 * Math.PI / 180);
        scene.rotation.y = playhead * Math.PI * 2;
        scene.rotation.x = playhead * Math.PI * 2;
      controls.update();
      renderer.render(scene, camera);
    },
    // Dispose of events & renderer for cleaner hot-reloading
    unload () {
      controls.dispose();
      renderer.dispose();
    }
  };
};

canvasSketch(sketch, settings);
