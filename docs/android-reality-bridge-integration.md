# Android 现实桥移植说明

本分支保留 Momo 原有网页、主题与整体框架，只移植二改版本中的 Android 现实桥相关能力。

## 已移植内容

- 完整 `android-shell/`：WebView 壳、原生通知、前台服务、交互桥、小组件、截图/设备感知等原生入口。
- 现实桥网页板块：规则编辑、本机规则、系统事件、设备动作、感知诊断、离线回复库、定时/延迟规则。
- 原生现实桥：电源连接/断开、低电量、开机、环境光线监测，以及暗光自动手电筒。
- 感知与操作设备设置页：入口位于「设置 → 连接」区域。
- Android 推送客户端桥接：`shell-detect`、`shell-notify`、`sendShellTestPush`、壳订阅辅助。
- APK 构建工作流：`.github/workflows/android-shell.yml`。
- Android 构建/权限/诊断文档。

## 网页部署

1. 提交并推送本分支。
2. 在 Netlify 中关联本仓库的 `feature/android-reality-bridge` 分支，或合并后再部署 `main`。
3. 构建命令：`npm run build`；发布目录：`.next`。
4. Netlify 环境变量需要与旧部署保持一致；单机模式使用 `NEXT_PUBLIC_SELF_HOSTED_MODE=true`。

## APK 构建

1. GitHub 仓库 Settings → Secrets and variables → Actions → Variables。
2. 新建 `SHELL_SITE_URL`，值为 Netlify 生产站点地址（必须是 HTTPS）。
3. Actions → Build Android Shell APK → Run workflow。
4. 下载 `float-shell-debug` 或已配置签名后的 release APK。

## 数据安全

- Netlify 重新部署不会删除浏览器 IndexedDB/localStorage 中的聊天和角色数据。
- 保持同一站点域名即可继续使用原数据；换域名需要先用「设置 → 数据管理」导出，再在新域名导入。
- APK 的 WebView 数据与浏览器数据隔离。安装 APK 后需要在 APK 内导入备份。
- 不要卸载 APK、清除 App 数据或清除站点数据，除非已经确认备份可用。
- APK 覆盖升级要求签名一致；长期使用建议配置固定的 release 签名。

## 首次验收

- 设置页出现「感知」和「操作设备」。
- 现实桥页面显示 Android 本机相关入口。
- 连接/断开充电、低电量事件能进入现实桥流水。
- 环境光线规则能在支持光线传感器的设备上触发。
- 手电筒等设备动作只有在逐项授权和开启后才执行。
- 通知、悬浮窗、麦克风、电池优化等权限按需开启。
