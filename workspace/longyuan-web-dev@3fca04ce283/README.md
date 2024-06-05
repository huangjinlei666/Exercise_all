# FREGATA Web

Fatri web project framework with webpack4 and vue2.x

vue vue-router vuex

vuex-persistedstate 通过 localStorage 实现本地持久化

token 通过 cookie 存储，有效期 1 小时

## 开发步骤：

1.在项目根目录执行 npm install 安装依赖

2.执行 npm run dev 或 npm run start 启动本地服务

3.配置非安全浏览器：chrome 快捷方式 --> 属性 --> 快捷方式 --> 目标 中补充输入 --disable-web-security --user-data-dir=c:\kkk --disable-features=CrossSiteDocumentBlockingIfIsolating

4.在非安全浏览器中输入: localhost:3010 或 http://127.0.0.1:3010 访问本地服务

## 目录结构

docker: docker 配置

Jenkinsfile: jenkins 配置

pom.xml: maven 打包的依赖配置

mock: 前端 mock 数据

public: 模板，站点图标，静态资源目录

src: 业务目录

src --> api : 接口配置

src --> assets : 图片，样式

src --> components : 业务组件

src --> config : 业务配置文件

src --> directives : 业务指令

src --> filters : 业务过滤器

src --> layout : 布局组件

src --> locales : 国际化配置

src --> menu : 菜单配置

src --> plugins : 业务插件

src --> router : 业务路由配置

src --> store : 全局状态 store

src --> util : 业务工具类，方法目录

src --> views : 业务页面目录

src --> App.vue : 根组件

src --> i18n.js : 国际化入口文件

src --> main.js : webpack 打包入口文件
