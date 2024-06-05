<template>
  <div id="generalChart">
    <div id="mus"></div>
    <template v-if="$route.name !== 'machine' && objReady && sensorNameArray && sensorNameArray.length > 0">
      <text-box-com
        v-for="item in sensorNameArray"
        :key="item.location"
        :item="item"
        @on-text-box-add="handleTextBoxListAdd"
        @on-text-box-remove="handleTextBoxListRemove"
      ></text-box-com>
      <div class="tip-box">
        <div class="tip-box-item" v-for="tipBox in tipBoxList" :key="tipBox.text">
          <span :class="tipBox.class" style="width: 4px; height: 4px"></span>
          <span style="display: inline-block; vertical-align: middle">{{ tipBox.text }}</span>
        </div>
      </div>
    </template>
    <div class="tip-box" v-if="$route.name === 'machine'">
      <div class="tip-box-item" v-for="tipBox in tipBoxList" :key="tipBox.text">
        <span :class="tipBox.class" style="width: 4px; height: 4px"></span>
        <span style="display: inline-block; vertical-align: middle">{{ tipBox.text }}</span>
      </div>
    </div>
    <div class="progress"></div>
    <!-- <div
      class="reset"
      :style="{ right: $route.path.includes('board') ? '34%' : '2%' }"
      v-if="$route.path.includes('board') || hierarchy.type === 'MACHINE' || $route.path.includes('machine')"
      @click="handleSceneReset"
    >
      {{ $t('routineAtlas.reset') }}
    </div> -->
  </div>
</template>
<script>
import { mapState, mapMutations } from 'vuex';
import debounce from 'lodash/debounce';
import * as THREE from '@/threeCompatible/build/three.module';
import { OrbitControls } from '@/threeCompatible/examples/jsm/controls/OrbitControls';
import { OBJLoader } from '@/threeCompatible/examples/jsm/loaders/OBJLoader';
import { MTLLoader } from '@/threeCompatible/examples/jsm/loaders/MTLLoader';
import { directSensorNameList, nonDirectSensorNameList, alarmLevels } from '@/util/selectTypes';
import { getBrowserType } from '@/util/commonService';
import TextBoxCom from './textBoxCom.vue';

export default {
  name: 'generalChart',
  components: {
    TextBoxCom,
  },
  data() {
    return {
      container: null,
      renderer: null,
      camera: null,
      scene: null,
      rotateMeshes: [], // 存储模型中需要有转动动画的mesh集合
      orbitControls: null,
      progressBox: null,
      animation: true,
      objReady: '', // 风机模型加载完毕标志
      textBoxList: [], // textbox组件的实例列表
      tipBoxList: [
        { class: 'status-circle bg-color-ok', text: this.$t('common.OK') },
        { class: 'status-circle bg-color-attention', text: this.$t('common.ATTENTION') },
        { class: 'status-circle bg-color-error', text: this.$t('common.ERROR') },
      ],
      sensorNameList: nonDirectSensorNameList, // 默认非直驱
      savedObjectNames: [], // 改变颜色的模型名称
      savedColorArray: [], // 存储原本的颜色
    };
  },
  created() {
    if (this.$route.path.includes('projectSet')) {
      this.animation = false;
    }
  },
  computed: {
    ...mapState('system/layout', ['asideCollapse']),
    ...mapState('cms/pass', ['hierarchy', 'passCollapse']),
    ...mapState('cms/general', ['config', 'generalReceived']),
    ...mapState('cms/board', ['machine']),
    ...mapState('cms/screen', ['screenMachine']),
    sensorNameArray() {
      const arr = [];
      if (!this.container || !this.container.clientWidth) {
        return arr;
      }
      const length = this.sensorNameList.length;
      this.sensorNameList.forEach((ele, index) => {
        const item = this.config.find((i) => i.location === ele.location) || {};
        arr.push({ ...item, ...ele, length });
      });
      return arr;
    },
    locationAlarmObject() {
      const res = {
        sensor_bearing: '',
        sensor_gearbox: '',
        sensor_generator: '',
      };
      if (!this.config || this.config.length === 0) {
        return res;
      }
      const mainBearing = this.config.find((c) => c.location === 'mainBearing');
      const gearBox = this.config.find((c) => c.location === 'gearBox');
      const engine = this.config.find((c) => c.location === 'engine');
      if (mainBearing && mainBearing.sensorList && mainBearing.sensorList.length > 0) {
        const alarmLevelList = mainBearing.sensorList.map((s) => s.alarmLevel);
        if (alarmLevelList.includes('ATTENTION')) {
          res.sensor_bearing = 'ATTENTION';
        } else if (
          alarmLevelList.includes('ERROR') ||
          alarmLevelList.includes('EMERGENCY') ||
          alarmLevelList.includes('WARN')
        ) {
          res.sensor_bearing = 'ERROR';
        }
      }
      if (gearBox && gearBox.sensorList && gearBox.sensorList.length > 0) {
        const alarmLevelList = gearBox.sensorList.map((s) => s.alarmLevel);
        if (alarmLevelList.includes('ATTENTION')) {
          res.sensor_gearbox = 'ATTENTION';
        } else if (
          alarmLevelList.includes('ERROR') ||
          alarmLevelList.includes('EMERGENCY') ||
          alarmLevelList.includes('WARN')
        ) {
          res.sensor_gearbox = 'ERROR';
        }
      }
      if (engine && engine.sensorList && engine.sensorList.length > 0) {
        const alarmLevelList = engine.sensorList.map((s) => s.alarmLevel);
        if (alarmLevelList.includes('ATTENTION')) {
          res.sensor_generator = 'ATTENTION';
        } else if (
          alarmLevelList.includes('ERROR') ||
          alarmLevelList.includes('EMERGENCY') ||
          alarmLevelList.includes('WARN')
        ) {
          res.sensor_generator = 'ERROR';
        }
      }
      return res;
    },
  },
  mounted() {
    this.init();
    this.animate();
    // 如果WebGL创建失败，则2s后会重新创建
    const _this = this;
    setTimeout(() => {
      if (_this && !_this.renderer) {
        _this.init();
        _this.animate();
      }
    }, 2000);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.onWindowResize, false);
    this.animate = () => {};
    this.onWindowResize = () => {};

    this.container = null;
    this.renderer = null;
    this.camera = null;
    this.scene = null;
    this.rotateMeshes = [];
    this.orbitControls = null;
    this.progressBox = null;
    this.animation = true;
    this.objReady = '';
    this.textBoxList = [];
    this.savedObjectNames = [];
    this.savedColorArray = [];
  },
  watch: {
    // 监听机组点击
    hierarchy: {
      handler(val, oldVal) {
        if (this.$route.path.includes('board') || this.$route.path.includes('screen/machine')) {
          return;
        }
        this.clearOldObj(val);
      },
      immediate: true,
    },
    // 看板页面监听风机通道
    machine: {
      handler(val) {
        if (!this.$route.path.includes('board')) {
          return;
        }
        this.clearOldObj(val);
      },
      immediate: true,
    },
    // 大屏风机页面监听风机通道
    screenMachine: {
      handler(val) {
        if (!this.$route.path.includes('screen/machine')) {
          return;
        }
        this.clearOldObj(val);
      },
      immediate: true,
    },
    // 监听文本框拖拽
    generalReceived(value) {
      if (!value) {
        this.saveGeneralInit();
        return;
      }
      if (this.textBoxList.length === 0) {
        this.saveGeneralInit();
        return;
      }
      const item = this.textBoxList.find((i) => i.hover);
      if (!item) {
        this.saveGeneralInit();
        return;
      }
      this.saveLocation(item.item.location);
      this.saveConfigReceived(true);
    },
    // 监听左侧菜单栏收缩
    asideCollapse(val) {
      this.onWindowResize();
    },
    // 监听通道栏收缩
    passCollapse(val) {
      this.onWindowResize();
    },
  },
  methods: {
    ...mapMutations('cms/general', ['saveLocation', 'saveConfigReceived', 'saveGeneralInit']),
    handleSceneReset() {
      // 重置轨迹控制球的设置，该操作要先于相机位置的设置
      this.orbitControls && this.orbitControls.reset();
      // 重新设置相机的位置
      this.camera.position.set(200, 30, 100);
    },
    handleTextBoxListAdd(textbox) {
      if (textbox) {
        this.textBoxList.push(textbox);
      }
    },
    handleTextBoxListRemove(textbox) {
      if (textbox) {
        this.textBoxList.splice(this.textBoxList.indexOf(textbox), 1);
      }
    },
    clearOldObj(val) {
      // 清除之前的模型和线段
      const groupModelList = this.scene && this.scene.children.filter((c) => c.type === 'Group' || c.type === 'Line');
      if (groupModelList && groupModelList.length > 0) {
        for (let i = 0; i < groupModelList.length; i += 1) {
          this.scene.remove(groupModelList[i]);
        }
      }
      // 清除存储文本框、线段端点等的变量
      this.rotateMeshes = [];
      this.textBoxList = [];
      this.progressBox = document.querySelector('.progress');
      if (this.progressBox) {
        this.progressBox.style.display = 'block';
        this.progressBox.innerHTML = '';
      }
      // 重置轨迹控制球的设置
      this.orbitControls && this.orbitControls.reset();
      if (!val || !val.id || val.type !== 'MACHINE') {
        return;
      }
      if (this.objReady === false) {
        return;
      }
      const modelName = (val.additionalInfo && val.additionalInfo.modelName) || 'nonDirect';
      if (modelName === 'nonDirect') {
        this.sensorNameList = nonDirectSensorNameList;
      } else {
        this.sensorNameList = directSensorNameList;
      }
      // 加载新模型
      const path = `${this.$baseUrl}/statics/${modelName}/`;
      this.loadObject(path);
    },
    init() {
      // container
      this.container = document.getElementById('mus');
      this.progressBox = document.querySelector('.progress');

      // scene
      this.scene = new THREE.Scene();

      // renderer
      this.renderer = new THREE.WebGLRenderer({
        antialias: true, // 开启反锯齿
        precision: 'highp', // 着色精度
        alpha: true, // 可以设置背景色透明
        premultipliedAlpha: false,
        stencil: false,
        preserveDrawingBuffer: true, // 保存绘图缓冲
        // logarithmicDepthBuffer: true, // 深度缓冲
      });
      if (!this.container) {
        return;
      }
      this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
      const isIE = getBrowserType().type;
      if (isIE === 'IE') {
        this.renderer.setClearColor(0x000000, 1);
      } else {
        this.renderer.setClearColor(0xffffff, 0);
      }
      this.renderer.setPixelRatio(window.devicePixelRatio); // 兼容高清屏幕
      this.container.appendChild(this.renderer.domElement);

      // camera
      this.camera = new THREE.PerspectiveCamera(45, this.container.clientWidth / this.container.clientHeight, 1, 10000);
      this.camera.position.set(200, 30, 100);
      this.camera.lookAt(this.scene.position);

      this.orbitControls = new OrbitControls(this.camera, this.renderer.domElement);
      this.orbitControls.enableRotate = true;
      // this.orbitControls.minPolarAngle = 0;
      // this.orbitControls.maxPolarAngle = Math.PI;
      // this.orbitControls.minAzimuthAngle = -Math.PI / 2;
      // this.orbitControls.maxAzimuthAngle = Math.PI / 2;
      this.orbitControls.enablePan = true;
      this.orbitControls.panSpeed = 1;
      this.orbitControls.enableZoom = true;
      // this.orbitControls.minDistance = 50;
      // this.orbitControls.maxDistance = 500;
      this.orbitControls.screenSpacePanning = false;

      // light
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.25); // 从正上方照射的平行光，0.45强度
      directionalLight.position.set(1000, 500, 1000);
      const spotLight = new THREE.SpotLight(0xffffff, 0.45);
      spotLight.position.set(-1000, 500, 1000);
      this.scene.add(ambientLight);
      this.scene.add(directionalLight);
      this.scene.add(spotLight);

      window.addEventListener('resize', this.onWindowResize, false);
    },
    onWindowResize: debounce(
      function onWindowResize() {
        if (!this.container) {
          return;
        }
        this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
      },
      300,
      { leading: false, trailing: true }
    ),
    animate() {
      this.orbitControls && this.orbitControls.update();

      if (this.animation && this.rotateMeshes.length > 0) {
        this.rotateMeshes.forEach((e) => {
          e.rotateZ(-Math.PI / 1080);
        });
      }

      this.handleConfig(this.locationAlarmObject, this.scene);

      if (this.renderer) {
        this.renderer.render(this.scene, this.camera);
      }
      requestAnimationFrame(this.animate);
    },
    loadObject(path) {
      this.objReady = false;
      new MTLLoader().setPath(path).load('machine.mtl', (materials) => {
        materials.preload();
        new OBJLoader()
          .setMaterials(materials)
          .setPath(path)
          .load(
            'machine.obj',
            (obj) => {
              if (!this.camera || !this.scene) {
                return;
              }
              if (this.$route.path.includes('board')) {
                obj.position.set(-100, 0, 0);
              }
              obj.scale.set(0.1, 0.1, 0.1);

              this.rotateMeshes = [];
              obj.children.forEach((e, i) => {
                // 需要旋转的mesh
                if (e.name.includes('rotate_')) {
                  this.rotateMeshes.push(e);
                }
              });

              this.scene && this.scene.add(obj);
              this.objReady = true;
            },
            (xhr) => {
              const _this = this;
              if (xhr.lengthComputable) {
                const percentComplete = (xhr.loaded / xhr.total) * 100;
                const percent = Math.round(percentComplete);
                this.progressBox && (this.progressBox.innerHTML = `${percent}%`);
                if (percent >= 100) {
                  setTimeout(() => {
                    _this.progressBox && (_this.progressBox.style.display = 'none');
                  }, 300);
                }
              } else {
                this.progressBox.innerHTML = 'loading...';
                setTimeout(() => {
                  _this.progressBox && (_this.progressBox.style.display = 'none');
                }, 2300);
              }
            },
            (err) => {
              this.objReady = true;
              console.log('---obj load error---');
              console.log(err);
            }
          );
      });
    },
    handleConfig(obj, scene) {
      if (!scene || !scene.children || scene.children.length === 0) return;
      const group = this.scene.children.find((c) => c.type === 'Group');
      if (!group || !group.children || group.children.length === 0) return;

      // 遍历恢复原本颜色
      group.children.forEach((child) => {
        const idx = this.savedObjectNames.indexOf(child.name);
        if (idx !== -1 && child.material) {
          child.material.color.setHex(this.savedColorArray[idx]);
        }
      });

      this.savedObjectNames = [];
      this.savedColorArray = [];

      // 设置颜色
      group.children.forEach((child) => {
        let color;
        if (child.name === 'sensor_bearing' && obj.sensor_bearing) {
          const alarm = alarmLevels.find((a) => a.value === obj.sensor_bearing);
          color = alarm && alarm.color;
        }
        if (child.name === 'sensor_gearbox' && obj.sensor_gearbox) {
          const alarm = alarmLevels.find((a) => a.value === obj.sensor_gearbox);
          color = alarm && alarm.color;
        }
        if (child.name.includes('sensor_generator') && obj.sensor_generator) {
          const alarm = alarmLevels.find((a) => a.value === obj.sensor_generator);
          color = alarm && alarm.color;
        }
        if (color && child.material) {
          // 存储颜色
          this.savedObjectNames.push(child.name);
          this.savedColorArray.push(child.material.color.getHex());
          // 设置颜色
          child.material.color.setHex(color);
        }
      });
    },
  },
};
</script>
<style lang="less" scoped>
#generalChart {
  position: relative;
  height: 100%;
  overflow: hidden;
  #mus {
    width: 100%;
    height: 100%;
    min-height: 400px;
    background-repeat: no-repeat;
    background-size: cover;
    background-image: url(/images/bg2.png);
  }
  .progress {
    width: 100%;
    height: 100%;
    position: absolute;
    left: 0;
    top: 0;
    background-color: rgba(0, 0, 0, 0.5);
    color: #fff;
    font-size: 30px;
    font-weight: bold;
    text-align: center;
    line-height: 600px;
  }
  .reset {
    width: 80px;
    height: 28px;
    position: absolute;
    top: 2%;
    font-size: 12px;
    line-height: 28px;
    text-align: center;
    color: rgba(255, 255, 255, 0.85);
    cursor: pointer;
    background-color: rgba(13, 51, 75, 0.6);
    border: 1px solid rgba(71, 218, 255, 0.1);
    &:hover {
      background-color: rgba(13, 51, 75, 0.8);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }
  }
  .tip-box {
    width: 25%;
    position: absolute;
    bottom: 2%;
    left: 2%;
    color: rgba(255, 255, 255, 0.6);
    font-size: 12px;
    line-height: 12px;
    white-space: nowrap;
    .tip-box-item {
      display: inline-block;
      margin-right: 10px;
      .status-circle {
        border-radius: 0;
      }
    }
  }
}
</style>
