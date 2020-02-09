import './style.scss'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import Stage3D from './Stage3D'

loadGLTF('human-running.glb').then(start)

function loadGLTF (modelName) {
  const loader = new GLTFLoader().setPath(process.env.BASE_URL + 'models/')
  return new Promise(accept => {
    loader.load(modelName, gltf => {
      accept(gltf)
    },
    xhr => {
      // loadingProgress = xhr.loaded / xhr.total
    })
  })
}

function start (gltf) {
  const container = document.querySelector('#app')
  const stage = new Stage3D(container, gltf)
  listenToParentFrame()
  handleResize()
  window.addEventListener('resize', handleResize)
}


/**
 * This demo is going to be hosted on a blog and multiple instances 
 * may be loaded on the same page at the same time, i.e. infinite scrolling
 * The parent iframe can pause/play using window post messaging
 * {'event-type': 'iframe-content-play'}
 * {'event-type': 'iframe-content-pause'}
 */
function listenToParentFrame () {

  try {
    window.parent.postMessage({
      'event-type': 'iframe-content-play',
    },
    document.location.origin)
  } catch (e) {
    // nothing to do here
  }
  

}

const handleResize = () => {
  const container = document.querySelector('#app')
  const {width, height} = container.getBoundingClientRect()
  try {
    window.parent.postMessage({
      'event-type': 'iframe-content-resize',
      width, 
      height
    },
    document.location.origin)
  } catch (e) {
    // nothing to do here
  }
}
