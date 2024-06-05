<template>
  <div id="detail">
    <div class="frequencyCount-table-box cms-card">
      <div class="top-box">
        <el-page-header @back="goBack" icon="el-icon-arrow-left" :content="$t('equipmentMng.detail')"></el-page-header>
      </div>
      <div class="top-box mt-20">
        <div class="top-title">
          {{ $t('equipmentMng.basicInfo') }}
        </div>
      </div>
      <div class="top-form">
        <el-form
          v-loading="loading"
          :model="ruleForm"
          ref="ruleForm"
          label-width="150px"
          class="demo-ruleForm"
          autocomplete="off"
          size="medium"
          :inline-message="true"
        >
          <div class="formDiv">
            <el-form-item :label="$t('equipmentMng.mainControlNo') + ':'">
              <span>{{ deviceNo }}</span>
            </el-form-item>
            <el-form-item :label="$t('equipmentMng.mainControlName') + ':'">
              <span :title="deviceName" style="width: 300px; display: inline-block" class="text-ellipsis">{{
                deviceName
              }}</span>
            </el-form-item>
            <el-form-item :label="$t('equipmentMng.equipmentTemplateName') + ':'">
              <span>{{ deviceTemplateName }}</span>
            </el-form-item>
          </div>
          <div class="formDiv">
            <el-form-item :label="$t('equipmentMng.product') + ':'">
              <span>{{ productTemplete }}</span>
            </el-form-item>
            <el-form-item :label="$t('standingBook.creationTime') + ':'">
              <span>{{ createdAt }}</span>
            </el-form-item>
          </div>
        </el-form>
      </div>
      <div class="top-box mt-20">
        <div class="top-title">
          {{ $t('equipmentMng.topologicalGraph') }}
        </div>
      </div>
      <div class="topological">
        <organization-chart :datasource="ds" @node-click="nodeClick"> </organization-chart>
        <div class="detailBox" v-if="detailBox">
          <el-card class="box-card">
            <template #header>
              <div class="card-header">
                <!-- <span>{{ detailTitle }}</span> -->
                <i class="el-icon-close" @click="closeDetail"></i>
              </div>
            </template>
            <div class="equipmentNo">
              <span> {{ $t('equipmentMng.equipmentNumber') }}：</span> <span>{{ detailDeviceNo }}</span>
            </div>
            <div class="equipmentNo">
              <span> {{ $t('equipmentMng.equipmentName') }}：</span> <span>{{ detailDeviceName }}</span>
            </div>
          </el-card>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import OrganizationChart from 'vue-organization-chart';
import 'vue-organization-chart/dist/orgchart.css';

export default {
  components: {
    OrganizationChart,
  },
  name: 'detail',
  data() {
    return {
      loading: false,
      id: '',
      statusText: '--',
      ds: {},
      ruleForm: {},
      deviceTemplateName: '--',
      deviceName: '--',
      deviceNo: '--',
      createdAt: '--',
      detailBox: false,
      detailDeviceNo: '',
      detailDeviceName: '',
      detailTitle: '',
      productTemplete: '--',
    };
  },

  mounted() {
    const id = this.$route.query.id;
    this.getDetail(id);
    // 编辑操作
  },
  methods: {
    closeDetail() {
      this.detailBox = false;
    },
    nodeClick(data) {
      // console.log(data);
      this.detailBox = true;
      this.detailDeviceNo = data.deviceNo;
      this.detailDeviceName = data.deviceName;
      // this.detailTitle = data.title;
    },
    // 返回上一页
    goBack() {
      this.$router.go(-1);
    },
    getDetail(id) {
      this.loading = true;
      this.$api.equipmentMng
        .getDetail(id)
        .then((res) => {
          if (!res) {
            return;
          }
          // console.log(res);
          this.ds = res.children[0];
          this.deviceTemplateName = res.deviceTemplateName;
          this.deviceName = res.deviceName;
          this.deviceNo = res.deviceNo;
          this.createdAt = res.createdAt;
          this.productTemplete = res.productTemplateName;
        })
        .catch((err) => {
          this.$msg.error(err);
        })
        .finally(() => {
          this.loading = false;
        });
    },
  },
};
</script>
<style lang="less">
#detail {
  height: 100%;
  min-height: 697px;
  min-width: 976px;
  padding-right: 20px;
  .topological {
    margin-top: 20px;
    position: relative;
    .detailBox {
      position: absolute;
      right: 100px;
      top: 50px;
      border-radius: 10px;
      .box-card {
        width: 250px;
        .card-header {
          width: 100%;
          display: flex;
          align-content: center;
          justify-content: flex-end;
        }
        .el-card__header {
          padding: 10px 20px;
          border-bottom: none;
          .el-icon-close {
            font-size: 20px;
            cursor: pointer;
          }
        }
        .el-card__body {
          padding: 15px 20px;
        }
        .equipmentNo {
          font-size: 14px;
          padding: 5px 0;
          span {
            color: rgba(0, 0, 0, 0.85);
            font-weight: 400;
          }
        }
      }
    }
  }
  .orgchart {
    background-image: none;
    padding: 0;
    border: none;
    .node .title {
      display: none;
    }
    .node .content {
      height: 40px;
      line-height: 40px;
      border-radius: 4px;
      background: #e9f8ff;
      font-size: 14px;
      border-color: #1890ff;
    }
    .lines {
      .downLine {
        background-color: #898989;
      }
      .rightLine {
        border-color: #898989;
      }
      .leftLine {
        border-color: #898989;
      }
      .topLine {
        border-color: #898989;
      }
      .bottomLine {
        border-color: #898989;
      }
    }
  }
  .top-box {
    display: flex;
    align-items: center;
    justify-content: space-between;
    .top-title {
      font-size: 16px;
      font-weight: 500;
      color: rgba(0, 0, 0, 0.85);
    }
  }
  .top-form {
    margin-top: 20px;
    border-bottom: 1px solid #ebebeb;
  }
  .formDiv {
    display: flex;
    .el-form-item {
      width: 30%;
    }
    .width-80 {
      width: 80px;
    }
  }
}
</style>
