import * as THREE from 'three';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

// ### SETTING
export function commonSetting () {
  // set dev & platform
  if (typeof window !== "undefined") {
    window._DEBUG = location.search.indexOf('debug') > -1;
    window._DEBUG && document.documentElement.classList.add('_DEBUG');
  
    window._CONTROLS = location.search.indexOf('control') > -1;
    window._CONTROLS && document.documentElement.classList.add('_CONTROLS');
  
    window._NOGUIDE = location.search.indexOf('noguide') > -1;
    window._NOGUIDE && document.documentElement.classList.add('_NOGUIDE');
  
    const platform = (navigator.userAgentData?.platform || navigator.platform)?.toLowerCase();
    window._WINDOWOS = platform.startsWith("win");
    window._WINDOWOS && document.documentElement.classList.add('_WINDOWOS');
  
    window._MACOS = platform.startsWith("mac");
    window._MACOS && document.documentElement.classList.add('_MACOS');
  
    window._LINUXOS = platform.startsWith("linux");
    window._LINUXOS && document.documentElement.classList.add('_LINUXOS');
  }
}

export function setSceneEnv (renderer, scene, hdrPath, options) {
  const defaults = {
    setBg: false,
    setEnv: false,
  };
  options = Object.assign(defaults, options);

  // pmremGenerator
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();
  new RGBELoader().load(hdrPath, function(texture) {
    const envMap = pmremGenerator.fromEquirectangular(texture).texture;
    options.setEnv && (scene.environment = envMap);
    options.setBg && (scene.background = envMap);
    texture.dispose();
    pmremGenerator.dispose();
  });
}


// ### UTILL
export function getPoint (e) {
  if (e.touches) {
    e = e.touches[0] || e.changedTouches[0];
  }
  return [e.pageX || e.clientX, e.pageY || e.clientY];
};

export const sharedUniforms = {
  u_time: { value: 0 }
};


// ### HELPER, GUI
// 이건 정리 필요
export function setHelper (options) {
  const defaults = {
    axesActive: true,
    axesSize: 20,

    gridActive: true,
    gridSize: 20,
    gridDivisions: 10,
  }
  options = Object.assign(defaults, options);


  // AXES
  const axesHelper =  options.axesActive ? new THREE.AxesHelper(options.axesSize) : '';

  // GRID
  const gridHelper = options.gridActive ? new THREE.GridHelper(options.gridSize, options.gridDivisions) : '';

  return [axesHelper, gridHelper]
}

export function setGui ( ) {
  // GUI
  const gui = new GUI({ width: 300 });
  // gui.close();

  // * return
  return gui;
}

export function setPIP (scene, camera, gui, options) {
  const defaults = {
    pip: false,
    pipCameraPosition: [30, 30, 30],
    pipCameraTargetSize: [1, 8, 4],
    pipIsLineYFollowCamera: true,
    cameraRotateGroupX, 
    cameraRotateGroupY, 
    cameraTarget, 
    cameraOffset,
  }
  options = Object.assign(defaults, options);

  // PIP
  const fog = scene.fog;
  const pip = {
    width: 400, 
    height: 300, 
    camera: new THREE.PerspectiveCamera(70, 400/300, 0.1, 999),
    cameraHelper: null,
    cameraTargetHelper: null,
    lineX: null, 
    lineY: null,
    lineZ: null,
    beforeRender: () => {
      fog && (scene.fog = null);
      if ( pip.lineX ) {
        pip.lineX.scale.set(1, 1, 1);
        pip.lineX.scale.multiplyScalar(camera.position.z);
        pip.lineX.rotation.z = cameraRotateGroupX.rotation.y;
        scene.add(pip.lineX);
        scene.add(pip.cameraHelper);
        pip.cameraTargetHelper.position.copy(cameraTarget);
        scene.add(pip.cameraTargetHelper);
      }
    },
    afterRender: () => {
      fog && (scene.fog = fog);
      scene.remove(pip.lineX);
      scene.remove(pip.cameraHelper);
      // scene.remove(pip.cameraTargetHelper);
    }
  }
    
  // - pip - camera helper
  pip.cameraHelper = new THREE.CameraHelper(camera);
  pip.camera.position.set(...options.pipCameraPosition);
  pip.camera.lookAt(scene.position);
  pip.camera.updateProjectionMatrix();
  // - pip - camera target helper
  pip.cameraTargetHelper = new THREE.Mesh(
    new THREE.SphereGeometry(...options.pipCameraTargetSize),
    new THREE.MeshBasicMaterial({ color: 'blue', depthTest: false , wireframe: true})
  );
  pip.cameraTargetHelper.renderOrder = 1;
  // - pip - line x, y
  pip.lineX = (() => {
    const shape = new THREE.Shape().absarc(0, 0, 1, 0, Math.PI * 2); // shape 
    const line = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(shape.getPoints(50)), 
      new THREE.LineBasicMaterial({ color: 0xff0000 })
    );
    line.rotation.x = -Math.PI / 2;
    options.pipIsLineYFollowCamera && (line.position.y = camera.position.y);
    return line;
  })();
  pip.lineY = (() => {
    const line = new THREE.Line(
      pip.lineX.geometry, 
      new THREE.LineBasicMaterial({ color: 0x00ff00 })
    );
    line.rotation.x = -Math.PI / 2;
    line.rotation.y = Math.PI / 2;
    pip.lineX.add(line);
    return line;
  })();
  pip.lineX.scale.set(1, 1, 1);
  pip.lineX.scale.multiplyScalar(camera.position.z);
  pip.lineX.rotation.z = cameraRotateGroupX.rotation.y;
  scene.add(pip.lineX);


  // GUI
  
  // gui - pip visible
  const folderControls = gui.addFolder('Controls');
  const pipSetting = { visible: location.search.indexOf('pip') > -1 ? true : false }
  folderControls.add(pipSetting, 'visible').name('PIP visible').onChange(() => { !pipSetting.visible &&  renderer.setSize(areaWidth, areaHeight); });

  // gui - target
  const folderTarget = gui.addFolder('Target');
  folderTarget.add(cameraTarget, 'x', -40, 40, 0.001).onChange(() => { camera.lookAt(cameraTarget); });
  folderTarget.add(cameraTarget, 'y', 0, 40, 0.001).onChange(() => { camera.lookAt(cameraTarget); });
  folderTarget.add(cameraTarget, 'z', -40, 40, 0.001).onChange(() => { camera.lookAt(cameraTarget); });

  // gui - camera
  const cameraControls = gui.addFolder('Camera');
  cameraControls.add(camera, 'zoom', 1, 10, 0.01).name('Camera X Zoom');
  cameraControls.add(camera.position, 'x', -50, 50, 0.01).name('Camera X Position');
  cameraControls.add(camera.position, 'y', -50, 50, 0.01).name('Camera Y Position');
  cameraControls.add(camera.position, 'z', -50, 50, 0.01).name('Camera Z Position');
  cameraControls.add(cameraRotateGroupX.rotation, 'y', -3.14, 3.14, 0.001).name('Camera X Rotate');
  cameraControls.add(cameraRotateGroupY.rotation, 'x', -3.14, 3.14, 0.001).name('Camera Y Rotate');
  const fovControl = cameraControls.add(camera, 'fov', 1, 150).name('Camera FOV');
  fovControl.onChange(function(value) {
    camera.fov = value;
    camera.updateProjectionMatrix();
    requestToRender = true;
  });

  // gui - look at target
  // const lookAtFolder = gui.addFolder('Offset');
  // lookAtFolder.add(cameraOffset, 'x', -window.innerWidth, window.innerWidth).onChange(
  //   camera.setViewOffset(
  //     areaWidth,
  //     areaHeight,
  //     cameraOffset.x,
  //     cameraOffset.y,
  //     areaWidth,
  //     areaHeight
  //   )
  // );
  // lookAtFolder.add(cameraOffset, 'y', -window.innerWidth, window.innerWidth).onChange(
  //   camera.setViewOffset(
  //     areaWidth,
  //     areaHeight,
  //     cameraOffset.x,
  //     cameraOffset.y,
  //     areaWidth,
  //     areaHeight
  //   )
  // );


  return {
    pip
  }
}

export function setGuiModel (gui, model) {
  const materialValue = { opacity: 1 }
  
  const modelSize = new THREE.Box3().setFromObject(model);
  const modelWidth = modelSize.max.x - modelSize.min.x;
  const modelHeight = modelSize.max.y - modelSize.min.y;
  const modelDepth = modelSize.max.z - modelSize.min.z;

  // gui - model opacity 
  const folderModel = gui.addFolder('Model');
  folderModel.add(materialValue, 'opacity', 0, 1, 0.01).name('material opacity').onChange(function(value) {
    model.traverse((child) => {
      if (child.isMesh) {
          child.material.opacity = materialValue.opacity;
      }
    });
  });

  // gui - model box
  const box = new THREE.Mesh(
    new THREE.BoxGeometry(modelWidth, modelHeight, modelDepth),
    new THREE.MeshBasicMaterial({ wireframe: true, color: 'red' })
  );
  box.position.set(0, 0, 0);
  const folderModelBox = gui.addFolder('Box');
  folderModelBox.add(box, 'visible').name('box visible');
  folderModelBox.add(box.scale, 'x', 0, 1, 0.01).name('box scale x');
  folderModelBox.add(box.scale, 'y', 0, 1, 0.01).name('box scale y');
  folderModelBox.add(box.scale, 'z', 0, 1, 0.01).name('box scale z');
  folderModelBox.add(box.position, 'x', -modelWidth/2, modelWidth/2, 0.01).name('box position x');
  folderModelBox.add(box.position, 'y', -modelHeight/2, modelHeight/2, 0.01).name('box position y');
  folderModelBox.add(box.position, 'z', -modelDepth/2, modelDepth/2, 0.01).name('box position z');

  // gui - model
  const modelFolder = gui.addFolder('Model');
  modelFolder.add(model.position, 'x', -10, 10, 0.01).name('Model Position X');
  modelFolder.add(model.position, 'y', -10, 10, 0.01).name('Model Position Y');
  modelFolder.add(model.position, 'z', -10, 10, 0.01).name('Model Position Z');
  modelFolder.add(model.rotation, 'x', -10, 10, 0.01).name('Model Rotation X');
  modelFolder.add(model.rotation, 'y', -10, 10, 0.01).name('Model Rotation Y');
  modelFolder.add(model.rotation, 'z', -10, 10, 0.01).name('Model Rotation Z');

  return {
    box
  }
}