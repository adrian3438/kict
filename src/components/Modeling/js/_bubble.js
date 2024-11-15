import * as THREE from 'three';
import { currentData, actionValue, world } from "./_common";

// create
export function createBubble (bubblewidth, fontsize, message, position, options) {
  const defaults = {
    bubblewidth: bubblewidth, 
    fontsize: fontsize, 
    color: '#fff',
    background: '#000', 
    padding: 50,
    radius: 30,
    visible: true,
  }
  options = Object.assign(defaults, options);

  const ctx = document.createElement('canvas').getContext('2d');
  const ctxCanvas = ctx.canvas;

  const font = `${fontsize}px bold sans-serif`;
  const textWidth = ctx.measureText(message).width;
  const width = bubblewidth;
  const height = fontsize + options.padding;
  const radius = options.radius;

  ctx.canvas.width = width;
  ctx.canvas.height = height;

  ctx.font = font;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
  ctx.lineJoin = "round";
  ctx.lineWidth = radius;

  ctx.strokeStyle = options.background; 
  ctx.fillStyle = options.background;
  ctx.strokeRect(0 + (radius/2), 0 + (radius/2), width - radius, height - radius);
  ctx.fillRect(0 + (radius/2), 0 + (radius/2), width - radius, height - radius);

  const scaleFactor = Math.min(1, bubblewidth / textWidth);
  ctx.translate(width / 2, height / 2);
  ctx.scale(scaleFactor, 1);
  ctx.fillStyle = options.color;
  ctx.fillText(message, 0, 0);

  const textureMap = new THREE.CanvasTexture(ctxCanvas);
  textureMap.minFilter = THREE.LinearFilter;
  textureMap.wrapS = THREE.ClampToEdgeWrapping;
  textureMap.wrapT = THREE.ClampToEdgeWrapping;

  const textureMaterial = new THREE.SpriteMaterial( { map: textureMap } );
  const textureSprite = new THREE.Sprite( textureMaterial );
  textureSprite.position.copy(position);
  textureSprite.options = options;
  world.scene.add(textureSprite);

  const labelBaseScale = 0.01;
  textureSprite.scale.x = ctxCanvas.width * labelBaseScale;
  textureSprite.scale.y = ctxCanvas.height * labelBaseScale;

  textureSprite.visible = options.visible;

  return textureSprite;
}

// change
export function changeBubble () {
  // bubble
  for (let i = 0; i < actionValue.weightBubbles.length; i++) {
    const bubble = actionValue.weightBubbles[i];
    currentData.weights[i] && changeBubbleMassage(bubble, currentData.weights[i]);
  }
  for (let i = 0; i < actionValue.shearBubbles.length; i++) {
    const sprite = actionValue.shearBubbles[i];
    currentData.shears[i] && changeBubbleMassage(sprite, currentData.shears[i]);
  }
  for (let i = 0; i < actionValue.momentBubbles.length; i++) {
    const sprite = actionValue.momentBubbles[i];
    currentData.moments[i] && changeBubbleMassage(sprite, currentData.moments[i]);
  }
}

/* utils */
function changeBubbleMassage (sprite, message) {
  let options = sprite.options;

  const ctx = document.createElement('canvas').getContext('2d');
  const ctxCanvas = ctx.canvas;

  const font = `${options.fontsize}px bold sans-serif`;
  const textWidth = ctx.measureText(message).width;
  const width = options.bubblewidth;
  const height = options.fontsize + options.padding;
  const radius = options.radius;

  ctx.canvas.width = width;
  ctx.canvas.height = height;

  ctx.font = font;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
  ctx.lineJoin = "round";
  ctx.lineWidth = radius;

  ctx.strokeStyle = options.background; 
  ctx.fillStyle = options.background;
  ctx.strokeRect(0 + (radius/2), 0 + (radius/2), width - radius, height - radius);
  ctx.fillRect(0 + (radius/2), 0 + (radius/2), width - radius, height - radius);

  const scaleFactor = Math.min(1, options.bubblewidth / textWidth);
  ctx.translate(width / 2, height / 2);
  ctx.scale(scaleFactor, 1);
  ctx.fillStyle = options.color;
  ctx.fillText(message, 0, 0);

  const textureMap = new THREE.CanvasTexture(ctxCanvas);
  textureMap.minFilter = THREE.LinearFilter;
  textureMap.wrapS = THREE.ClampToEdgeWrapping;
  textureMap.wrapT = THREE.ClampToEdgeWrapping;

  sprite.material.map = textureMap;
}