'use client'
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { OrbitControls } from 'three/addons/controls/OrbitControls';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { CSS2DObject, CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';
import { Water } from 'three/addons/objects/Water.js';
import { Sky } from 'three/addons/objects/Sky.js';

import { commonSetting, setGui, setHelper } from '../components/Modeling/js/_utils';
import { settings, actionValue, currentData, world  } from '../components/Modeling/js/_common';
import { createBubble, changeBubble } from '../components/Modeling/js/_bubble';

// data
import datas from '../../public/resources/datas/data.json';

// common setting

export default function Modeling(){
    
    useEffect(() => {

      commonSetting();
      const $container = document.querySelector('.container');
      const $menu = $container.querySelector('.menu');
      let $canvas;
      let $shears, $moments;
    
    
      // * VALUE
      let areaWidth = window.innerWidth;
      let areaHeight = window.innerHeight;
      let isRequestRender = false;
      let isOcean = false;
      let isHover = false;
      let isAnimation = false;

      let labelRenderer = null;
    
      // * WORLD
      let controls;
      let water, sun, sky;
      let model;
      let gui;
    
      let positionAttributes, positionAttributesClone, colorAttributes;
      let currentMode = 'shear';
      let currentIndex = 0;
      
      const modelSize = {
        box: null,
        width: 0,
        height: 0,
        depth: 0,
      }
      const points = [];
      let numPoints = 0;
      // ### INIT
      const onInit = function () {
        onResize();
    
        // Scene
        world.scene = new THREE.Scene();
    
        // Renderer
        world.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        world.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        // world.renderer.setClearColor('#000', 1.0);
        world.renderer.setSize(areaWidth, areaHeight);
        $canvas = world.renderer.domElement;
        $container.appendChild($canvas);
    
        // Camera
        world.camera = new THREE.PerspectiveCamera(70, areaWidth / areaHeight, 1, 999);
        world.camera.position.set(0, 0, 25);
        world.camera.lookAt(0, 0, 0)
        world.scene.add(world.camera);
    
        // Light
        const ambientLight = new THREE.AmbientLight('#fff', 1);
    
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
        directionalLight.position.set(0, 5, 8);
        directionalLight.castShadow = true;
    
        world.scene.add(ambientLight, directionalLight);
    
        // Helper
        // if (_DEBUG) {
          // const helpers = setHelper({
          //   axesSize: 20,
          //   gridSize: 100,
          //   gridDivisions: 30,
          // });
          // world.scene.add(...helpers);
        // }
        // gui = setGuiMenu();
    
        // Setting
        // setEnvironment();
        setModels();
    
        // Render
        renderRequest();
        gsap.ticker.add(animate);
    
        // Loading
        THREE.DefaultLoadingManager.onProgress = function (url, itemsLoaded, itemsTotal) {
          if (itemsLoaded === itemsTotal) {
          }
        };
    
    
    
    
        /*  */
        $canvas.addEventListener('mouseenter', onMouseEnter);
        $canvas.addEventListener('mouseout',   onMouseOut);
    
        function onMouseEnter () {
          if ( isAnimation || isHover) return;
          isHover = true;
          
          changeDataValue(currentIndex);
        }
    
        function onMouseOut () {
          if ( isAnimation ) return;
          isHover = false;
          
          changeDataValue(currentIndex);
        }
    
        // 초기 화면
        changeDataValue(currentIndex);
      };
      // ### SETTING
      function setEnvironment () {
        sun = new THREE.Vector3();
    
        // Water
        const waterGeometry = new THREE.PlaneGeometry( 10000, 10000 );
        water = new Water(
          waterGeometry,
          {
            textureWidth: 512,
            textureHeight: 512,
            waterNormals: new THREE.TextureLoader().load( './resources/textures/waternormals.jpg', function ( texture ) {
              texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            } ),
            sunDirection: new THREE.Vector3(),
            sunColor: 0xffffff,
            waterColor: 0x001e0f,
            distortionScale: 3.7,
            fog: world.scene.fog !== undefined
          }
        );
        water.position.y -= 10;
        water.rotation.x = - Math.PI / 2;
        world.scene.add( water );
    
        // Skybox
        sky = new Sky();
        sky.scale.setScalar( 10000 );
        world.scene.add( sky );
    
        const skyUniforms = sky.material.uniforms;
    
        skyUniforms[ 'turbidity' ].value = 1;
        skyUniforms[ 'rayleigh' ].value = 2;
        skyUniforms[ 'mieCoefficient' ].value = 0.005;
        skyUniforms[ 'mieDirectionalG' ].value = 0.8;
    
        const parameters = {
          elevation: 2,
          azimuth: 180
        };
    
        const pmremGenerator = new THREE.PMREMGenerator( world.renderer );
        const sceneEnv = new THREE.Scene();
    
        let renderTarget;
    
        function updateSun() {
          const phi = THREE.MathUtils.degToRad( 90 - parameters.elevation );
          const theta = THREE.MathUtils.degToRad( parameters.azimuth );
    
          sun.setFromSphericalCoords( 1, phi, theta );
    
          sky.material.uniforms[ 'sunPosition' ].value.copy( sun );
          water.material.uniforms[ 'sunDirection' ].value.copy( sun ).normalize();
    
          if ( renderTarget !== undefined ) renderTarget.dispose();
    
          sceneEnv.add( sky );
          renderTarget = pmremGenerator.fromScene( sceneEnv );
          world.scene.add( sky );
    
          world.scene.environment = renderTarget.texture;
        }
    
        updateSun();
      }
      function setModels () {
        // geometry
        const geometry = new THREE.BoxGeometry(55, 1, 8, 100, 4, 4);
        const colors = [];
        for (let i = 0; i < geometry.attributes.position.count; i++) {
          colors.push(1, 1, 1); // 기본값은 흰색
        }
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    
        // material
        const material = new THREE.MeshStandardMaterial({
          side: THREE.DoubleSide,
          vertexColors: true,
        });
    
        // model
        model = new THREE.Mesh(geometry, material);
        model.castShadow = true;
        model.receiveShadow = true;
        world.scene.add(model);
        model.position.set(0, .5, 0)
    
        // model attributes
        positionAttributes = model.geometry.attributes.position;
        positionAttributesClone = positionAttributes.clone();
        colorAttributes = model.geometry.attributes.color;
    
        // model size
        modelSize.box = new THREE.Box3().setFromObject(model);
        modelSize.width = modelSize.box.max.x - modelSize.box.min.x;
        modelSize.height = modelSize.box.max.y - modelSize.box.min.y;
        modelSize.depth = modelSize.box.max.z - modelSize.box.min.z;
    
        // nodeX & nodeMesh & point
        const step = modelSize.width / 10; // 10개의 간격으로 11개의 점을 만듦
        for (let i = 0; i < 11; i++) {
          /* Node */
          // 초기값 설정
          actionValue.nodeXs[i] = -modelSize.width / 2 + i * step;  
    
          // mesh
          const plane = new THREE.Mesh(
            new THREE.BoxGeometry(0.2, modelSize.height, modelSize.depth, 1, 20, 1),
            new THREE.MeshStandardMaterial({ 
              color: '#f4e5a1', 
            })
          );
          plane.position.set(actionValue.nodeXs[i], modelSize.height/2, 0);
          plane.scale.set(1, 1.1, 1.02);
          world.scene.add(plane);
          actionValue.nodeMeshes[i] = plane;
    
          // point 생성
          points.push([
            new THREE.Vector3(actionValue.nodeXs[i], modelSize.height/2, 0), // from
            new THREE.Vector3(actionValue.nodeXs[i], modelSize.height/2, 0) // to
            // direction
          ]);
        }
    
        // 화살표
        const arrow = new THREE.Vector3( 0, -1, 0 );
        arrow.normalize();
    
        const origin = new THREE.Vector3( 0, 5, 0 );
        const length = 4;
        const hex = 0xffff00;
    
        const arrowHelper = new THREE.ArrowHelper( arrow, origin, length, hex, 1, 1 );
        world.scene.add( arrowHelper );
        actionValue.arrow = arrowHelper;
    
        setGuiMenu();
        setPoints();
      };
      
      function setGuiMenu () {
        /* GUI */
        // wireframe
        const $inputWireframe = $menu.querySelector('.input-wireframe');
        $inputWireframe.addEventListener('change', (e) => {
          model.material.wireframe = e.currentTarget.checked;
          renderRequest();
        });
    
    
    
        // ocean
        const $inputOcean = $menu.querySelector('.input-ocean');
        $inputOcean.addEventListener('change', (e) => {
          if ( $inputOcean.checked === true ) {
            isOcean = true;
            if ( !sun ) {
              setEnvironment();
            } else {
              world.scene.add( water );
              world.scene.add( sky );
            }
          } else {
            isOcean = false;
            world.scene.remove( water );
            world.scene.remove( sky );
          }
          renderRequest();
        });
    
        
        // scale factor
        const $inputScaleFactor = $menu.querySelector('.input-scaleFactor');
        const $inputScaleFactorText = $menu.querySelector('.input-scaleFactor-text');
        $inputScaleFactor.value = settings.limit.scaleFactor;
        $inputScaleFactorText.value = settings.limit.scaleFactor;
        
        $inputScaleFactor.addEventListener('input', (e) => {
          const value = e.target.value; 
    
          settings.limit.scaleFactor = value;
          $inputScaleFactorText.value = value;
          changePutWeight();
        });
    
        $inputScaleFactorText.addEventListener('input', (e) => {
          let value = e.target.value; 
    
          if ( value > $inputScaleFactorText.max ) value = $inputScaleFactorText.max;
          else if ( value < $inputScaleFactorText.min ) value = $inputScaleFactorText.min;
    
          settings.limit.scaleFactor = value;
          $inputScaleFactorText.value = value;
          $inputScaleFactor.value = value;
          changePutWeight();
        })
    
    
    
        // animation
        const $inputAnimation = $menu.querySelector('.input-animation');
        $inputAnimation.addEventListener('change', (e) => {
          if ( $inputAnimation.checked === true ) {
            isAnimation = true;
            changeDataValue(currentIndex);
            animationInterval = createAnimation();
            document.querySelector('.indicator').classList.add('active');
          } else {
            isAnimation = false;
            changeDataValue(currentIndex);
            window.clearInterval(animationInterval);
            document.querySelector('.indicator').classList.remove('active');
          }
          renderRequest();
        });
    
    
        // data
        // const $selectData = $menu.querySelector('#select-data');
        // for (let i = 0; i < datas.List.length; i++) {
        //   const $option = document.createElement('option');
        //   $option.value = i + 1;
        //   $option.textContent = i + 1;
        //   $selectData.appendChild($option);
        // }
        // $selectData.addEventListener('change', () => {
        //   currentIndex = $selectData.value - 1;
        //   changeDataValue(currentIndex)
        // })
        
      }
    
      function setPoints () {
        numPoints = points.length;
    
        // 
        for (let i = 0; i < numPoints; i++) {
          // bubble
          actionValue.markBubbles.push( 
            createBubble(280, 60, `node ${i+1}`, actionValue.nodeMeshes[i].position)
          );
          actionValue.weightBubbles.push( 
            createBubble(240, 60, `${currentData.weights[i]}`, actionValue.nodeMeshes[i].position, {
              background: 'rgba(0, 0, 0, 0)',
            })
          );
          currentData.shears[i*2-1] && actionValue.shearBubbles.push( 
            createBubble(160, 50, `${currentData.shears[i*2-1]}`, actionValue.nodeMeshes[i].position, {
              background: 'rgb(210, 43, 18)',
              padding: 30,
              visible: false,
            })
          );
          currentData.shears[i*2] && actionValue.shearBubbles.push( 
            createBubble(160, 50, `${currentData.shears[i*2]}`, actionValue.nodeMeshes[i].position, {
              background: 'rgb(210, 43, 18)',
              padding: 30,
              visible: false,
            }),
          );
          currentData.moments[i*2-1] && actionValue.momentBubbles.push( 
            createBubble(160, 50, `${currentData.moments[i*2-1]}`, actionValue.nodeMeshes[i].position, {
              background: 'rgb(51, 51, 255)',
              padding: 30,
              visible: false,
            })
          );
          currentData.moments[i*2] && actionValue.momentBubbles.push( 
            createBubble(160, 50, `${currentData.moments[i*2]}`, actionValue.nodeMeshes[i].position, {
              background: 'rgb(51, 51, 255)',
              padding: 30,
              visible: false,
            }),
          );
    
          changeDom();
        }
    
        // controls
        world.controls = new OrbitControls(world.camera, $canvas);
        // controls.maxPolarAngle = Math.PI / 2;
        world.controls.minDistance = 10;
        world.controls.maxDistance = 100;
        world.controls.addEventListener('change', renderRequest);
      }
    
      // #### Change
      // # 2
      function changePutWeight () {
    
        // positionAttributes
        for (let i = 0; i < positionAttributes.count; i++) {
          const x = positionAttributesClone.getX(i);
          const y = positionAttributesClone.getY(i);
          const z = positionAttributesClone.getZ(i);
          
          const index = actionValue.nodeXs.indexOf(normalizeValue(x));
    
          // 모든 targetX에 대해 가중치 계산
          const weight = getInterpolatedWeight(x, currentData.weights) * settings.limit.scaleFactor;
    
          // 뒤틀림 계산
          const torsion = getInterpolatedTorsion(x, z, currentData.torsions) * settings.limit.scaleFactor;
    
          index > -1 && actionValue.nodeMeshes[index].weight !== weight && (actionValue.nodeMeshes[index].weight = weight);
    
          // * position  : 애니메이션을 적용하여 Y 값을 부드럽게 변경
          const toY = y + weight + torsion;
          gsap.to(positionAttributes.array, {
            [i * 3 + 1]: toY, // Y 값을 해당 위치에 맞춰 애니메이션
            duration: 2.5,
            ease: "elastic.out(.6, 0.2)",
            onUpdate: () =>  {
              // const index = actionValue.nodeXs.indexOf(normalizeValue(x));
              if (index > -1) {
                // actionValue.nodeMeshes[0] && (actionValue.nodeMeshes[index].position.y = positionAttributes.array[i * 3 + 1]);
                // actionValue.nodeMeshes[0] && (actionValue.nodeMeshes[index].position.y = modelSize.height/2 + (weight * progress.value) );
                actionValue.markBubbles[0] && (actionValue.markBubbles[index].position.y = positionAttributes.array[i * 3 + 1] + modelSize.height * 3);
                actionValue.weightBubbles[0] && (actionValue.weightBubbles[index].position.y = positionAttributes.array[i * 3 + 1] - modelSize.height);
                actionValue.shearBubbles[index*2 - 1] && (actionValue.shearBubbles[index*2 - 1].position.set(x-.85, positionAttributes.array[i * 3 + 1] - modelSize.height*2, 0) );
                actionValue.shearBubbles[index*2] && (actionValue.shearBubbles[index*2].position.set(x+.85, positionAttributes.array[i * 3 + 1] - modelSize.height*2, 0) );
                actionValue.momentBubbles[index*2 - 1] && (actionValue.momentBubbles[index*2 - 1].position.set(x-.85, positionAttributes.array[i * 3 + 1] - modelSize.height*2, 0) );
                actionValue.momentBubbles[index*2] && (actionValue.momentBubbles[index*2].position.set(x+.85, positionAttributes.array[i * 3 + 1] - modelSize.height*2, 0) );
              }
              positionAttributes.needsUpdate = true;
              renderRequest();
            }
          });
    
    
          // * color : 애니메이션을 적용하여 색상도 부드럽게 변경
          // colorAttributes.setXYZ(i, r, g, b);
          // const normWeight = Math.min(0, weight) / (settings.limit.weightYMin * settings.limit.scaleFactor);
          const normWeight = (weight - settings.limit.weightYMin * settings.limit.scaleFactor) / 
          (settings.limit.weightYMax * settings.limit.scaleFactor - settings.limit.weightYMin * settings.limit.scaleFactor);
    
          const clampedNormWeight = Math.max(0, Math.min(1, normWeight));
    
          let r, g, b;
          if ( currentMode === 'shear' ) {
            // 흰색 1, 1, 1 -> 빨간색 1, 0, 0
            r = 1;
            g = clampedNormWeight;
            b = clampedNormWeight;
          } else if ( currentMode === 'moment' ) {
            // 흰색 1, 1, 1 -> 파란색 0, 0, 1
            r = clampedNormWeight;
            g = clampedNormWeight;
            b = 1;
          }
          gsap.to(colorAttributes.array, {
            [i * 3 + 0]: r,
            [i * 3 + 1]: g,
            [i * 3 + 2]: b,
            duration: 1,
            ease: "power2.out",
            onUpdate: () => {
              colorAttributes.needsUpdate = true;
              renderRequest();
            }
          });
        }
    
        // node mesh에도 뒤틀림 적용
        for (let i = 0; i < actionValue.nodeMeshes.length; i++) {
          const nodeMesh = actionValue.nodeMeshes[i];
          const torsionData = currentData.torsions[i];
          if (nodeMesh && torsionData) {
            applyTorsionToNodeMesh(nodeMesh, torsionData[0], torsionData[1], settings.limit.scaleFactor);
          }
    
          gsap.to(actionValue.nodeMeshes[i].position, {
            y: modelSize.height/2 + actionValue.nodeMeshes[i].weight,
            duration: 2.5,
            ease: "elastic.out(.6, 0.2)",
            onUpdate: () => {
              // console.log('progress', progress.value);
            }
          })
        }
      }
      // # 1-1
      function changeCurrentData (data) {
        currentData.id = data.ID;
        currentData.createDate = data.createDate;
        currentData.weights = [];
        currentData.shears = [ -173, -173, -135, -135, -96.2, -96.2, -57.7, -57.7, -19.2, -19.2, 19.2, 19.2, 57.7, 57.7, 96.2, 96.2, 135, 135, 173, 173 ];
        currentData.moments = [ -1590, -722, -722, -48.1, -48.1, 433, 433, 722, 722, 818, 818, 722, 722, 433, 433, -481, -481, -722, -722, -1590 ];
        currentData.torsions = [];
    
        for (const key in data) {
          if (Object.hasOwnProperty.call(data, key)) {
            if (key.includes('node')) {
              currentData.weights.push( data[key]*1 );
            } else if (key.includes('torsion')) {
              currentData.torsions.push( data[key] );
            }
          }
        }
    
        return currentData;
      }
      // # 1
      function changeDataValue (index){
        changeCurrentData(datas.List[index]);
        settings.limit.weightYMin = Math.min(...currentData.weights);
        settings.limit.weightYMax = Math.max(...currentData.weights);
        
        /* Change Data */
        changeBubble();
        changeDom();
    
        if ( isHover || isAnimation ) {
          /* Change Weight */
          changePutWeight();
      
          /* Arrow */
          const minIndex = currentData.weights.indexOf(settings.limit.weightYMin);
          actionValue.arrow.visible = true;
          actionValue.arrow.position.x = actionValue.nodeXs[minIndex];
          gsap.fromTo(actionValue.arrow.position, {
            y: settings.limit.weightYMin + 13,
          },{ 
            y: settings.limit.weightYMin + 8,
            duration: 2.5,
            ease: "elastic.out(.6, 0.2)",
          });
        } else {
          /* Change Weight */
          currentData.weights = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
          currentData.torsions = [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0]];
          settings.limit.weightYMin = -100;
          settings.limit.weightYMax = 0;
          changePutWeight();
    
          /* Arrow */
          actionValue.arrow.visible = false;
        }
      }
    
      // 
      function changeDom () {
        // 범례
        const $legend = $container.querySelector('.legend');
        const $legendMin = $legend.querySelector('.min');
        const $legendMax = $legend.querySelector('.max');
        $legendMax.innerHTML = settings.limit.weightYMax;
        $legendMin.innerHTML = settings.limit.weightYMin + "<br>(최대값)";
    
    
        // data box
        const $databox = $container.querySelector('.dataBox');
    
        $databox.querySelector('.heading .id').textContent = currentData.id;
        $databox.querySelector('.heading .date').textContent = currentData.createDate;
        $databox.querySelectorAll('.dataBox tr').forEach($tr => {
          const $tdList = $tr.querySelectorAll('td');
    
          if ( $tr.classList.contains('weight') ) {
            $tdList.forEach(($td, index) => {
              $td.innerHTML = currentData.weights[index];
            });
          } else if ( $tr.classList.contains('shear') ) {
            $tdList.forEach(($td, index) => {
              $td.innerHTML = `
                ${currentData.shears[index*2-1] ? 'Part 0/4 : ' + currentData.shears[index*2-1] + '<br> ':  ''}
                ${currentData.shears[index*2] ? 'Part 4/4 : ' + currentData.shears[index*2] : '' }
              `;
            });
          } else if ( $tr.classList.contains('moment') ) {
            $tdList.forEach(($td, index) => {
              $td.innerHTML = `
                ${currentData.moments[index*2-1] ? 'Part 0/4 : ' + currentData.moments[index*2-1] + '<br> ':  ''}
                ${currentData.moments[index*2] ? 'Part 4/4 : ' + currentData.moments[index*2] : '' }
              `;
            });
          } else if ( $tr.classList.contains('torsion') ) {
            $tdList.forEach(($td, index) => {
              if ( !currentData.torsions[index] ) return;
              $td.innerHTML = `${currentData.torsions[index][0]} / ${currentData.torsions[index][1]}`;
            });
          }
        })
      }
    
    
    
      // #### Button Action
      // click data btn
    
      // click action btn
      function onClickActionBtn (e) {
        const $btn = e.currentTarget;
        const value = $btn.dataset.value;
        $shears = $container.querySelectorAll('.points .shear');
        $moments = $container.querySelectorAll('.points .moment');
        
        currentMode = value;
    
        $container.querySelector('.btn-action.on') && $container.querySelector('.btn-action.on').classList.remove('on');
        $btn.classList.add('on');
        // bubble
        for (let i = 0; i < actionValue.shearBubbles.length; i++) {
          const sprite = actionValue.shearBubbles[i];
          sprite.visible = currentMode === 'shear' ? true : false; 
        }
        for (let i = 0; i < actionValue.momentBubbles.length; i++) {
          const sprite = actionValue.momentBubbles[i];
          sprite.visible = currentMode === 'moment' ? true : false; 
        }
    
        changePutWeight();
      }
    
      $container.querySelectorAll('.btn-action').forEach($el => { $el.addEventListener('click', onClickActionBtn) });
    
    
    
      // ### UTILL
      function normalizeValue(value, epsilon = 1e-10) {
        return Math.abs(value) < epsilon ? 0 : value;
      }
      // Cubic Spline 보간을 위한 함수들
      function cubicSpline(x, xs, ys) {
        const n = xs.length;
        const h = new Array(n - 1);
        const alpha = new Array(n - 1);
        const l = new Array(n);
        const mu = new Array(n);
        const z = new Array(n);
        const c = new Array(n);
        const b = new Array(n - 1);
        const d = new Array(n - 1);
    
        for (let i = 0; i < n - 1; i++) {
          h[i] = xs[i + 1] - xs[i];
        }
    
        for (let i = 1; i < n - 1; i++) {
          alpha[i] = (3 / h[i]) * (ys[i + 1] - ys[i]) - (3 / h[i - 1]) * (ys[i] - ys[i - 1]);
        }
    
        l[0] = 1;
        mu[0] = 0;
        z[0] = 0;
    
        for (let i = 1; i < n - 1; i++) {
          l[i] = 2 * (xs[i + 1] - xs[i - 1]) - h[i - 1] * mu[i - 1];
          mu[i] = h[i] / l[i];
          z[i] = (alpha[i] - h[i - 1] * z[i - 1]) / l[i];
        }
    
        l[n - 1] = 1;
        z[n - 1] = 0;
        c[n - 1] = 0;
    
        for (let j = n - 2; j >= 0; j--) {
          c[j] = z[j] - mu[j] * c[j + 1];
          b[j] = (ys[j + 1] - ys[j]) / h[j] - h[j] * (c[j + 1] + 2 * c[j]) / 3;
          d[j] = (c[j + 1] - c[j]) / (3 * h[j]);
        }
    
        let i = 0;
        while (i < n - 1 && x > xs[i + 1]) {
          i++;
        }
        
        const t = x - xs[i];
        return ys[i] + b[i] * t + c[i] * t * t + d[i] * t * t * t;
      }
      function getInterpolatedWeight(x, weights) {
        return cubicSpline(x, actionValue.nodeXs, weights);
      }
      function getInterpolatedTorsion(x, z, torsions) {
        const leftTorsions = torsions.map(t => t[0]);
        const rightTorsions = torsions.map(t => t[1]);
        
        // z 좌표에 따라 왼쪽과 오른쪽 torsion 값을 보간
        const leftTorsion = cubicSpline(x, actionValue.nodeXs, leftTorsions);
        const rightTorsion = cubicSpline(x, actionValue.nodeXs, rightTorsions);
        
        // z 좌표에 따라 왼쪽과 오른쪽 torsion 값을 선형 보간
        const zRatio = (z + modelSize.depth / 2) / modelSize.depth;
        return leftTorsion * (1 - zRatio) + rightTorsion * zRatio;
      }
      function applyTorsionToNodeMesh(mesh, leftTorsion, rightTorsion, scaleFactor) {
        const geometry = mesh.geometry;
        const positionAttribute = geometry.attributes.position;
        const originalPositions = geometry.userData.originalPositions || positionAttribute.array.slice();
      
        if (!geometry.userData.originalPositions) {
          geometry.userData.originalPositions = originalPositions;
        }
      
        for (let i = 0; i < positionAttribute.count; i++) {
          const x = originalPositions[i * 3];
          const y = originalPositions[i * 3 + 1];
          const z = originalPositions[i * 3 + 2];
      
          // torsion
          const zRatio = (z + mesh.geometry.parameters.depth / 2) / mesh.geometry.parameters.depth;
          const torsion = (leftTorsion * (1 - zRatio) + rightTorsion * zRatio) * scaleFactor;
      
          // y 좌표에 torsion 적용
          // positionAttribute.setY(i, y + torsion);
          const toY = y + torsion;
          gsap.to(positionAttribute.array, { 
            [i * 3 + 1]: toY, // Y 값을 해당 위치에 맞춰 애니메이션
            duration: 2.5,
            ease: "elastic.out(.6, 0.2)",
            onUpdate: () =>  {
              positionAttribute.needsUpdate = true;
            }
          });
        }
      
        positionAttribute.needsUpdate = true;
      }
    
    
      // ### ANIMATION
      let animationInterval;
      // let animationInterval = createAnimation();
      function createAnimation () {
        return setInterval(() => {
          currentIndex++;
          if ( currentIndex == datas.List.length ) currentIndex = 0;
          changeDataValue(currentIndex);
          $menu.querySelector('#select-data').value = currentIndex+1;
        }, 5000)
      }
    
    
    
    
      // ### RENDER
      const renderRequest = function () {
        isRequestRender = true;
      };
      const animate = function (time, delta) {
        if (isRequestRender) {
          // controls
          world.controls && world.controls.update();
    
          // render
          world.renderer.render(world.scene, world.camera);
    
          // water
          isOcean && water && (water.material.uniforms[ 'time' ].value += 1.0 / 240.0);
          
          // 
          !isOcean && (isRequestRender = false);
        }
      };
    
    
    
      // ### RESIZE
      const onResize = function () {
        // common
        areaWidth = $container.offsetWidth;
        areaHeight = $container.offsetHeight;
    
        // world
        if ( world.camera ) {
          world.camera.aspect = areaWidth / areaHeight;
          world.camera.updateProjectionMatrix();
        }
        if ( world.renderer ) {
          const pixelRatio = Math.min(2, window.devicePixelRatio);
          world.renderer.setSize(areaWidth, areaHeight);
          labelRenderer.setSize(areaWidth, areaHeight);
          world.renderer.setPixelRatio(pixelRatio);
        }
    
        renderRequest();
      };
    
    
    
      // ### EVENT
      window.addEventListener('load', onInit);
      window.addEventListener('resize', onResize);

      onInit()
    }, [])
  
  
  
  
    return (
        <>
        <div className="container">
            <header className="header">
                <div className="inwrap">
                <div></div>
                </div>
            </header>


            <div className="controller">
                <div className="menu">
                <nav>
                    <ul>
                    <li>
                        <div className="heading">
                        <strong className="tit">Ocean</strong>
                        <div className="chk">
                            <input type="checkbox" className="input-ocean"/>
                        </div>
                        </div>
                    </li>
                    <li>
                        <div className="heading">
                        <strong className="tit">Wireframe</strong>
                        <div className="chk">
                            <input type="checkbox" className="input-wireframe"/>
                        </div>
                        </div>
                    </li>
                    <li>
                        <div className="heading">
                        <strong className="tit">Weight Scale Factor</strong>
                        </div>
                        <div className="chk">
                        <input type="number" min="0.1" max="3" defaultValue="1" className="input-scaleFactor-text"/>
                        <input type="range" min="0.1" max="3" defaultValue="1" step="0.01" className="input-scaleFactor" />
                        </div>
                    </li>
                    <li>
                        <div className="heading">
                        <strong className="tit">Auto animation</strong>
                        <div className="chk">
                            <input type="checkbox" className="input-animation"/>
                        </div>
                        </div>
                    </li>
                    <li>
                        <div className="heading">
                        <strong className="tit">Data</strong>
                        <div className="">
                            {/* <select name="datas" id="select-data">
                            </select> */}
                        </div>
                        </div>
                    </li>
                    </ul>
                </nav>
                </div>
                <ul className="btns">
                <li><button type="button" className="btn-action btn-t1" data-value="shear">Shear -Z</button></li>
                <li><button type="button" className="btn-action btn-t1" data-value="moment">Moment -Y</button></li>
                </ul>
                <div className="legend">
                <strong className="tit">범례 표시</strong>
                <div className="graphs">
                    <div className="valus">
                    <span className="max">0</span>
                    <span className="min">0<br/>(최대값)</span>
                    </div>
                    <div className="shear"></div>
                    <div className="moment"></div>
                </div>
                </div>
            </div>

            <div className="dataBox">
                <div className="heading">
                <div className="texts">
                    <h3>Data</h3>
                    <p>
                    ID : <span className="id"></span> <span className="btw">|</span>
                    Create Date: <span className="date"></span>
                    </p>
                </div>
                </div>
                <table>
                <thead>
                    <tr className="node">
                    <th>노드(Node)</th>
                    <td>1</td>
                    <td>2</td>
                    <td>3</td>
                    <td>4</td>
                    <td>5</td>
                    <td>6</td>
                    <td>7</td>
                    <td>8</td>
                    <td>9</td>
                    <td>10</td>
                    <td>11</td>
                    </tr>
                </thead>
                <tbody>
                    <tr className="weight">
                    <th>하중(Force)</th>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    </tr>
                    <tr className="shear">
                    <th>전단력(Shear)</th>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    </tr>
                    <tr className="moment">
                    <th>무게중심(Moment)</th>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    </tr>
                    <tr className="torsion">
                    <th>뒤틀림(Torsion)</th>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    </tr>
                </tbody>
                </table>
            </div>

            <div className="indicator">
                <p>* Animation이 실행되면, 마우스 호버와 상관없이 5초마다 data 값이 자동으로 변경됩니다.</p>
            </div>
        </div>
        </>
    )
}
