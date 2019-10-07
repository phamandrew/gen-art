// Ensure ThreeJS is in global scope for the 'examples/'
global.THREE = require('three');

// Include any additional ThreeJS examples below
require('three/examples/js/controls/OrbitControls');

const canvasSketch = require('canvas-sketch');

const paperColors = require('paper-colors').map(c => c.hex);

const risoColors = require('riso-colors').map(c => c.hex);

const Random = require('canvas-sketch-util/random');

const settings = {

  // Make the loop animated
  animate: true,
  // Get a WebGL canvas rather than 2D
  context: 'webgl',
  // Turn on MSAA
  attributes: { antialias: true },

  duration: 12
};

const sketch = ({ context }) => {
  // Create a renderer
  const renderer = new THREE.WebGLRenderer({
    context
  });


  const background = Random.pick(paperColors);

  // WebGL background color
  renderer.setClearColor(background, 1);

  // Setup a camera


  const camera = new THREE.OrthographicCamera();


  // Setup camera controller
  const controls = new THREE.OrbitControls(camera, context.canvas);

  // Setup your scene
  const scene = new THREE.Scene();
  const color = Random.pick(risoColors);

  const createMaterial = () => {


      const material = new THREE.ShaderMaterial({

        vertexShader: `
            varying vec2 vUv;
            void main () {
                vec3 transformed = position.xyz;
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            varying vec2 vUv;
            uniform vec3 color;
            uniform vec3 background;
            void main () {
                float d = pow(vUv.y, 4.0 * vUv.y);
                gl_FragColor = vec4(mix(color, background, d), 1.0);
            }
        `,
        uniforms: {

            color: { value: new THREE.Color(color) },
            background: { value: new THREE.Color(background) }
            }
        });
        const emptyMaterial = new THREE.MeshBasicMaterial({
            color: background
        });
        return [
            material,
            material,
            material,
            emptyMaterial,
            emptyMaterial,
            material,
            material
        ];
    };
  

  const geometry = new THREE.BoxGeometry(1, 1, 1);

  for (let i = 0; i < 50; i++) {
      
      const mesh = new THREE.Mesh(
            geometry,
            createMaterial()
      );
      mesh.position.set(
          Random.gaussian() * Random.gaussian(),
          Random.gaussian() * Random.gaussian(),
          Random.gaussian()* Random.gaussian()
      );
      mesh.scale.set(
        Random.gaussian() * Random.gaussian(),
        Random.gaussian() * Random.gaussian(),
        Random.gaussian()* Random.gaussian()
      );
      scene.add(mesh);
  };



  // Specify an ambient/unlit colour
  scene.add(new THREE.AmbientLight('#59314f'));

  // Add some light
  const light = new THREE.PointLight('#45caf7', 1, 15.5);
  light.position.set(2, 2, -4).multiplyScalar(1.5);
  scene.add(light);

  // draw each frame
  return {
    // Handle resize events here
    resize ({ pixelRatio, viewportWidth, viewportHeight }) {
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(viewportWidth, viewportHeight);
    //   camera.aspect = viewportWidth / viewportHeight;
    //   camera.updateProjectionMatrix();

    const aspect = viewportWidth / viewportHeight;

    // Ortho zoom
    const zoom = 1.0;

    // Bounds
    camera.left = -zoom * aspect;
    camera.right = zoom * aspect;
    camera.top = zoom;
    camera.bottom = -zoom;

    // Near/Far
    camera.near = -100;
    camera.far = 100;

    // Set position & look at world center
    camera.position.set(zoom, zoom, zoom);
    camera.lookAt(new THREE.Vector3());

    // Update the camera
    camera.updateProjectionMatrix();

    },
    // Update & render your scene here
    render ({ time }) {
      scene.rotation.y = time * (10 * Math.PI / 180);
      scene.rotation.x = time * (10 * Math.PI / 180);
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
