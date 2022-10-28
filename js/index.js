// create the ui Controls using dat.gui library
var uiControls = new function() {
  this.numberOfBranches = 3;
  this.recursionDepth = 2;
  this.onClickNumOfBranches = 1;
}
var gui = new dat.GUI();
let slider1 = gui.add(uiControls, 'numberOfBranches', 1, 20, 1);
let slider2 = gui.add(uiControls, 'recursionDepth', 0, 5, 1);
let slider3 = gui.add(uiControls, 'onClickNumOfBranches', 0, 5, 1);

// create the scene, camera and renderer objects from threejs
const scene = new THREE.Scene();
scene.background = new THREE.Color( 0xffffff );
const camera = new THREE.PerspectiveCamera(75,window.innerWidth/window.innerHeight,0.1,1000);
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg'),
});

// update camera and renderer position and sizes
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );
camera.position.setZ(120);
camera.position.setY(120);
camera.lookAt(0,0,0);
const controls = new OrbitControls( camera, renderer.domElement );

// add light and grid helper
const pointLight = new THREE.PointLight(0xffffff);
pointLight.position.set(5,5,5);
const ambiantLight = new THREE.AmbientLight(0xffffff);
scene.add(pointLight,ambiantLight);
const gridHelper = new THREE.GridHelper(200, 50)
scene.add(gridHelper)

// update camera when window size is changed
window.addEventListener( 'resize', onWindowResize, false );
function onWindowResize(){
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

/**
 * this is a class that creates branches using three.cylinder geometry.
 * @param  {integer} this.n the recursion depth
 * @param  {integer} this.h the cylinder height 
 * @param  {THREE.object} this.b the object created
 */
class Makebranch {
  constructor(n){
    this.n = n
    this.h = (n+1)*(n+1)
    const geometry = new THREE.CylinderGeometry( 0.2, 0.2, this.h, 10 );
    const material = new THREE.MeshStandardMaterial( { color: 0xFF6347} )
    const cylinder = new THREE.Mesh(geometry, material)
    this.b = cylinder
  }
}

/**
 * this is a recusrive function that loops over the
 * number of branches and creates branches
 * @param  {THREE.object} root the parent branch
 * @param  {integer} n the recursion depth
 * @param  {integer} numOfBranches the number of branches
 */
function recursive(root,n,numOfBranches) {
  let a = []
  for (let i = 0; i < numOfBranches; i++){
    const r = new Makebranch(n)
    a[i] = r.b
    root.b.add(a[i])
    a[i].translateY((r.h)*(i+1))
    
    const b = new Makebranch(n)
    const branch = b.b
    a[i].add(branch)
    branch.rotateY(i * Math.PI/180 * 60)
    branch.rotateZ(Math.PI/180 * 60)
    branch.translateY(b.h/2)
    
    if (b.n != 0) {
      b.n = b.n-1;
      recursive(b,b.n,numOfBranches)
    }
  }
}

// make the root branch then add it to the scene and call the recursive function
let r = new Makebranch(uiControls.recursionDepth)
scene.add(r.b)
recursive(r,uiControls.recursionDepth,uiControls.numberOfBranches)

// create a raycaster and pointer objects
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

/**
 * this is a callback function for when the pointer is pressed.
 * if the pointer intersects an object then call the recursive function
 * on that object.
 * @param  {PointerEvent} event contains x and y positions of pointer
 */
function onPointerDown( event ) {
  console.log(event)
	pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
	raycaster.setFromCamera( pointer, camera );
	const intersects = raycaster.intersectObjects( r.b.children );
	if (0 < intersects.length) {
    let newobj = new Makebranch(0)
    newobj.b = intersects[0].object
    recursive(newobj,0,uiControls.onClickNumOfBranches)
	}
}

// create a half opaque sphere to show where the pointer is at
const rollOverGeo = new THREE.SphereGeometry(1);
let rollOverMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000, opacity: 0.5, transparent: true } );
let rollOverMesh = new THREE.Mesh( rollOverGeo, rollOverMaterial );
scene.add( rollOverMesh );

/**
 * this is a callback function for when the pointer is moved.
 * if the pointer intersects an object then move the opaque
 * sphere to that position.
 * @param  {PointerEvent} event contains x and y positions of pointer
 */
function onPointerMove( event ) {
  pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
  raycaster.setFromCamera( pointer, camera );
  const intersects = raycaster.intersectObjects( r.b.children );
  if ( intersects.length > 0 ) {
    const intersect = intersects[ 0 ];
    rollOverMesh.position.copy( intersect.point );  
  }
}

// sets the onChange property of slider1 in the uiControls to remove
// the tree and rerender the tree with new numberOfBranches
slider1.onChange(() => {
  scene.remove(r.b)
  r = new Makebranch(uiControls.recursionDepth)
  scene.add(r.b)
  recursive(r,uiControls.recursionDepth,uiControls.numberOfBranches)
})

// sets the onChange property of slider2 in the uiControls to remove
// the tree and rerender the tree with new recursionDepth
slider2.onChange(() => {
  scene.remove(r.b)
  r = new Makebranch(uiControls.recursionDepth)
  scene.add(r.b)
  recursive(r,uiControls.recursionDepth,uiControls.numberOfBranches)
})

// the render loop function
const animate = () => {
  requestAnimationFrame( animate );
  
  window.addEventListener( 'pointerdown', onPointerDown );
  document.addEventListener( 'pointermove', onPointerMove );
  
  // this is updating the orbit controls
  controls.update()

  renderer.render(scene, camera);
}

animate()



