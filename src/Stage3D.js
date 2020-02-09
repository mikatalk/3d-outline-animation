import { Clock, DirectionalLight, PerspectiveCamera, Scene, Vector2, WebGLRenderer, Mesh, PlaneGeometry, ShadowMaterial } from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import Human from './Human'
import OutlinePass from './OutlinePass'

export default class Stage3D {
  constructor (container, gltf) {
    
    this.container = container

    this.createEngine()
    this.createLights()
    this.initPostProcessing()
    
    this.human = new Human(gltf)
    this.scene.add(this.human.mesh)

    this.outlinePass.selectedObjects = [this.human.mesh]
   
    this.floor = new Mesh(
      new PlaneGeometry(1000, 1000, 1, 1),
      new ShadowMaterial({
        color: 0x000066,
      })
    )
    this.floor.rotateX(-Math.PI/2)
    this.floor.castShadow = false
    this.floor.receiveShadow = true
    this.scene.add(this.floor)

    this.clock = new Clock()

    this.camera.position.x = 0
    this.camera.position.y = 2
    this.camera.position.z = 20
    this.camera.lookAt(
      this.human.mesh.position.x,
      this.human.mesh.position.y ,
      this.human.mesh.position.z
    )

    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.enableDamping = true // an animation loop is required when either damping or auto-rotation are enabled
    this.controls.dampingFactor = 0.05
    this.controls.screenSpacePanning = false
    this.controls.minDistance = 5
    this.controls.maxDistance = 50
    this.controls.maxPolarAngle = Math.PI / 2

    this.scene.rotation.y = 1
    this.scene.position.setY(-2)

    this.handleWindowResize()
    this.loop()
  }


  initPostProcessing () {
    // init the postprocessing pipeline
    this.composer = new EffectComposer(this.renderer)
    // main render pass for the 3d model and shadows
    const renderPass = new RenderPass(this.scene, this.camera)
    // add the render pass to post process pipeline
    this.composer.addPass(renderPass)
    // outline pass
    this.outlinePass = new OutlinePass(new Vector2(window.innerWidth * 0.96, window.innerHeight * 0.96), this.scene, this.camera)
    // we only want the outline on the human model, not the floor
    this.outlinePass.selectedObjects = [this.scene]
    // add the outline pass to post process pipeline
    this.composer.addPass(this.outlinePass)
  }

  loop = () => {
    window.requestAnimationFrame(this.loop)
    this.render()
    this.controls.update()
  }

  render () {
    const delta = Math.max(0, Math.min(1, this.clock.getDelta()))
    this.human.update(delta, this.clock.elapsedTime)    
    this.composer.render()
  }
  
  createEngine () {
    this.scene = new Scene()

    const aspectRatio = this.stageWidth / this.stageHeight
    const fieldOfView = 40
    const nearPlane = 1
    const farPlane = 1500
    this.camera = new PerspectiveCamera(
      fieldOfView,
      aspectRatio,
      nearPlane,
      farPlane
    )
  
    this.renderer = new WebGLRenderer({
      antialias: true,
      alpha: true
    })
    // support higher res displays
    this.renderer.setPixelRatio(window.devicePixelRatio)
    // transparent background
    this.renderer.setClearColor(0xffffff, 0)
    // enable shadows
    this.renderer.shadowMap.enabled = true
    // append the canvas element to the div#app created by vue-cli (container)
    this.container.appendChild(this.renderer.domElement)
    // watch for screen resize
    window.addEventListener('resize', this.handleWindowResize, false)
  }

  handleWindowResize = () => {
    const width = window.innerWidth * 0.96 // + 2% margin on both sides in CSS
    const height = window.innerHeight * 0.96 // + 2% margin on both sides in CSS
    // alternatively the canvas could be contained in an element
    // const {width, height} = this.renderer.domElement.getBoundingClientRect()
    this.stageWidth = width
    this.stageHeight = height
    this.renderer.setSize(this.stageWidth, this.stageHeight)
    this.camera.aspect = this.stageWidth / this.stageHeight
    this.camera.updateProjectionMatrix()
    // update the size for the composer as well
    this.composer.setSize(this.stageWidth, this.stageHeight)
  }

  createLights () {
    // A directional light shines from a specific direction. 
    // It acts like the sun, that means that all the rays produced are parallel. 
    this.shadowLight = new DirectionalLight(0xffffff, 1)

    this.shadowLight.position.set(15, 15, 10)
    this.shadowLight.lookAt(0,0,0)
  
    // Allow shadow casting 
    this.shadowLight.castShadow = true
  
    // define the visible area of the projected shadow
    this.shadowLight.shadow.camera.left = -20
    this.shadowLight.shadow.camera.right = 20
    this.shadowLight.shadow.camera.top = 20
    this.shadowLight.shadow.camera.bottom = -20

    this.shadowLight.shadow.camera.near = 1
    this.shadowLight.shadow.camera.far = 100

    this.shadowLight.shadow.mapSize.width = 512
    this.shadowLight.shadow.mapSize.height = 512

    this.scene.add(this.shadowLight)
  }

}
