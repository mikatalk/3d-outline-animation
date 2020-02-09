import { 
  AnimationMixer,
  LoopOnce,
  LoopRepeat, 
  MeshBasicMaterial 
} from 'three'

export default class Human {
  constructor (gltf) {
 
    this.mesh = gltf.scenes[0].children[0]
   
    this.mesh.traverse( child => {
      if ( child.isMesh ) {
        child.material = new MeshBasicMaterial({
          skinning: true,
          transparent: true,
          opacity: 0
        })
        child.castShadow = true
        child.receiveShadow = true
      }
    })

    this.animationMixer = new AnimationMixer(this.mesh)
    this.actions = {}
    for ( var i = 0; i < gltf.animations.length; i ++ ) {
      var clip = gltf.animations[i]
      var action = this.animationMixer.clipAction(clip)
      this.actions[clip.name] = this.actions[clip.name] || action
    }

    this.fadeToAction('Run', 0, LoopRepeat, 0.75, 1, true)
  }

  fadeToAction( name, duration, loop = LoopOnce, timeScale = 1, weight = 1, clampWhenFinished = true ) {
    this.previousAction = this.activeAction
    this.activeAction = this.actions[name]
    if (this.previousAction && this.previousAction !== this.activeAction) {
      this.previousAction.fadeOut(duration)
    }
    this.activeAction.loop = loop
    this.activeAction.reset()
    this.activeAction.clampWhenFinished = clampWhenFinished
    this.activeAction.setEffectiveTimeScale( timeScale )
    this.activeAction.setEffectiveWeight( weight )
    this.activeAction.fadeIn( duration )
    this.activeAction.play()
  }
  
  update (delta, lifetime) {
    this.animationMixer.update(delta)
  }
}