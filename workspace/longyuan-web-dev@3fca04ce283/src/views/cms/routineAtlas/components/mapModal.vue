<template>
  <div id="map-modal">
    <el-row class="first-line">
      <el-col :span="6">{{ $t('routineAtlas.map') }}</el-col>
      <el-col :span="18">{{ $t('routineAtlas.subitem') }}</el-col>
    </el-row>

    <el-row>
      <el-col :span="6">
        <el-checkbox v-model="waveform.waveformCheck" @change="checkBoxChange('waveform')">{{
          $t('routineAtlas.selectTypes.waveform')
        }}</el-checkbox>
      </el-col>
      <el-col :span="18">
        <el-checkbox-group v-model="waveform.extensionTypeList" @change="checkBoxChange('waveform')">
          <el-checkbox
            v-for="item in waveform.waveformGroup"
            :label="item.value"
            :key="item.value"
            :disabled="!waveform.waveformCheck"
            >{{ item.label }}</el-checkbox
          >
        </el-checkbox-group>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="6">
        <el-checkbox v-model="spectrogram.spectrogramCheck" @change="checkBoxChange('spectrogram')">{{
          $t('routineAtlas.selectTypes.spectrum')
        }}</el-checkbox>
      </el-col>
      <el-col :span="18">
        <el-checkbox-group v-model="spectrogram.extensionTypeList" @change="checkBoxChange('spectrogram')">
          <el-checkbox
            v-for="item in spectrogram.spectrogramGroup"
            :label="item.value"
            :key="item.value"
            :disabled="!spectrogram.spectrogramCheck"
            >{{ item.label }}</el-checkbox
          >
        </el-checkbox-group>
        <el-checkbox-group v-model="spectrogram.typeList" @change="checkBoxChange('spectrogram')">
          <el-checkbox
            v-for="item in spectrogram.typeGroup"
            :label="item.value"
            :key="item.value"
            :disabled="!spectrogram.spectrogramCheck"
            >{{ item.label }}</el-checkbox
          >
        </el-checkbox-group>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="6">
        <el-checkbox v-model="envelope.envelopeCheck" @change="checkBoxChange('envelope')">{{
          $t('routineAtlas.selectTypes.envelope')
        }}</el-checkbox>
      </el-col>
      <el-col :span="18">
        <el-checkbox-group v-model="envelope.extensionTypeList" @change="checkBoxChange('envelope')">
          <el-checkbox
            v-for="item in envelope.envelopeGroup"
            :label="item.value"
            :key="item.value"
            :disabled="!envelope.envelopeCheck"
            >{{ item.label }}</el-checkbox
          >
        </el-checkbox-group>
        <el-checkbox-group v-model="envelope.typeList" @change="checkBoxChange('envelope')">
          <el-checkbox
            v-for="item in envelope.typeGroup"
            :label="item.value"
            :key="item.value"
            :disabled="!envelope.envelopeCheck"
            >{{ item.label }}</el-checkbox
          >
        </el-checkbox-group>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="6">
        <el-checkbox v-model="cepstrum.cepstrumCheck" @change="checkBoxChange('cepstrum')">{{
          $t('routineAtlas.selectTypes.cepstrumSpectrum')
        }}</el-checkbox>
      </el-col>
      <el-col :span="18">
        <el-checkbox-group v-model="cepstrum.extensionTypeList" @change="checkBoxChange('cepstrum')">
          <el-checkbox
            v-for="item in cepstrum.cepstrumGroup"
            :label="item.value"
            :key="item.value"
            :disabled="!cepstrum.cepstrumCheck"
            >{{ item.label }}</el-checkbox
          >
        </el-checkbox-group>
      </el-col>
    </el-row>
  </div>
</template>

<script>
export default {
  name: 'mapModal',
  data() {
    return {
      waveform: {
        waveformCheck: false,
        waveformGroup: [
          {
            label: this.$t('routineAtlas.accelerationAxis'),
            value: '1',
          },
          {
            label: this.$t('routineAtlas.acceleration'),
            value: '2',
          },
        ],
        extensionTypeList: [],
        typeList: [],
      },
      spectrogram: {
        spectrogramCheck: false,
        spectrogramGroup: [
          {
            label: this.$t('routineAtlas.accelerationAxis'),
            value: '1',
          },
          {
            label: this.$t('routineAtlas.acceleration'),
            value: '2',
          },
        ],
        typeGroup: [
          {
            label: 'hz',
            value: 'hz',
          },
          {
            label: 'order',
            value: 'order',
          },
        ],
        extensionTypeList: [],
        typeList: [],
      },
      envelope: {
        envelopeCheck: false,
        envelopeGroup: [
          {
            label: this.$t('routineAtlas.accelerationAxis'),
            value: '1',
          },
          {
            label: this.$t('routineAtlas.acceleration'),
            value: '2',
          },
        ],
        typeGroup: [
          {
            label: 'hz',
            value: 'hz',
          },
          {
            label: 'order',
            value: 'order',
          },
        ],
        extensionTypeList: [],
        typeList: [],
      },
      cepstrum: {
        cepstrumCheck: false,
        cepstrumGroup: [
          {
            label: this.$t('routineAtlas.accelerationAxis'),
            value: '1',
          },
          {
            label: this.$t('routineAtlas.acceleration'),
            value: '2',
          },
        ],
        extensionTypeList: [],
        typeList: [],
      },
    };
  },
  methods: {
    checkBoxChange(val) {
      switch (val) {
        case 'waveform':
          if (!this.waveform.waveformCheck) this.waveform.extensionTypeList = [];
          this.$emit('waveformData', this.waveform);
          break;
        case 'spectrogram':
          if (!this.spectrogram.spectrogramCheck) {
            this.spectrogram.extensionTypeList = [];
            this.spectrogram.typeList = [];
          }
          this.$emit('spectrogramData', this.spectrogram);
          break;
        case 'envelope':
          if (!this.envelope.envelopeCheck) {
            this.envelope.extensionTypeList = [];
            this.envelope.typeList = [];
          }
          this.$emit('envelopeData', this.envelope);
          break;
        case 'cepstrum':
          if (!this.cepstrum.cepstrumCheck) this.cepstrum.checked = [];
          this.$emit('cepstrumData', this.cepstrum);
          break;
        default:
          console.log('未选择图谱信息或者服务错误');
      }
    },
  },
};
</script>

<style lang="less" scoped>
#map-modal {
  height: calc(100% - 32px);
  .el-col {
    padding: 10px 20px;
    line-height: 28px;
  }
  .el-col:nth-child(odd) {
    border-top: 1px solid #ebebeb;
    border-left: 1px solid #ebebeb;
  }
  .el-col:nth-child(even) {
    border: 1px solid #ebebeb;
    border-bottom: 0;
    line-height: 23px;
  }
  .el-row:last-child {
    .el-col {
      border-bottom: 1px solid #ebebeb;
    }
  }
  .el-checkbox-group {
    display: inline-block;
  }
  .first-line {
    background: #fafafa;
    font-weight: bold;
    .el-col:nth-child(2) {
      line-height: 28px;
    }
  }
  .el-checkbox {
    margin-right: 20px;
  }
}
</style>
