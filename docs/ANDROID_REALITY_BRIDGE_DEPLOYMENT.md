# Android 现实桥完整部署与验收指南

> 适用对象：从本仓库 Fork 后，自行部署网页、个人 Supabase、构建 Android APK，并希望启用“现实桥 / 设备联动”的用户。
>
> 重要边界：源码存在、网站在线、APK 构建成功、云端部署成功、真机权限通过，是五个不同状态。本文给出逐层检查方法，不能替代你的设备实测。

## 1. 先看结论

这个仓库的 Android 现实桥不是单个脚本，而是一条完整链路：

| 层 | 负责什么 | 主要入口 |
|---|---|---|
| 网页 UI | 创建规则、查看事件与执行流水、测试规则 | `components/reality-bridge-app.tsx`、`lib/reality-bridge/*` |
| 网页原生适配 | 把网页调用安全地转成 Android 原生方法 | `lib/perception/*`、`lib/device-action/*`、`lib/screenshot/*`、`lib/system-calendar/*`、`lib/widget/*`、`lib/shell-call-overlay.ts` |
| Android WebView 壳 | 安全桥、系统事件、通知、悬浮窗、截屏、通话、小组件 | `android-shell/app/src/main/java/app/floatphone/shell/*` |
| 个人云中继（可选） | 规则快照、远端事件、离线任务、推送与自检 | `app/api/push/*`、`supabase/functions/*`、`docs/personal-push-supabase.sql` |
| CI 保护 | 每次改动自动检查权限与原生/网页接口一致性 | `.github/workflows/android-reality-bridge.yml`、`scripts/check-android-reality-bridge.mjs` |

本机事件匹配、离线回复库、通知和部分设备动作可以在不依赖个人云的情况下工作。需要跨设备同步、离线主动消息或服务端定时扫描时，才必须部署个人 Supabase。

## 2. 当前 Fork 的完整性基线

本次审计对照了两个公开基线：

| 项目 | 提交 | 作用 |
|---|---|---|
| `jianchu-in/momo.float.phone` | `a7fe5c3e947e65425391036cbb0a6b31b8aa0515` | momo 站点基线 |
| `doremy1203/doremy.float.phone` | `7307868142148eae1512671a0153b5cd7938fff0` | 二改完整源码基线 |

你的 `oec0113/doremy.float.phone` Fork 与二改基线同为 `7307868142148eae1512671a0153b5cd7938fff0`。因此 Android 原生桥、网页现实桥、设备感知、截屏查岗、通话浮窗、小组件和个人云中继代码都已经在仓库里，不需要再从另一个仓库手工复制一半文件。

相对 momo 基线，二改版新增或补强了以下现实桥相关能力：

- `NativeRealityBridge.kt`：本机优先的规则执行器，电源事件在 WebView 不运行时也能落盘。
- `DeviceActionBridge.kt`：手电筒、音量、亮度、勿扰、打开应用、闹钟、计时器、媒体控制等能力。
- `PerceptionBridge.kt`：电量、网络、前台应用、使用时长、停留计时等只读感知。
- `LocationBridge.kt`、`HealthBridge.kt`、`CalendarBridge.kt`：位置、睡眠、系统日历。
- `ScreenshotBridge.kt`、`ScreenshotBallService.kt`、`CheckInService.kt`：用户确认式截屏、查岗预览与悬浮球。
- `NotificationReplyReceiver.kt`、`MediaControlListenerService.kt`：通知直接回复入口与媒体会话控制。
- `CallControlService.kt`、`CallOverlayService.kt`、`OverlayActionReceiver.kt`：通话浮窗、前台应用感知与动作按钮。
- `PhoneWidgetProvider.kt`、`PhoneWidgetConfigActivity.kt`、`PhoneWidgetRenderer.kt`：桌面小组件与独立实例。
- `app/api/push/bridge-native-event/route.ts`、`app/api/push/selfcheck/route.ts`：原生事件入云与链路自检。
- `scripts/check-android-permissions.mjs`、`scripts/check-android-reality-bridge.mjs`：原生权限与桥接口完整性自动检查。

完整文件清单由校验脚本维护。执行：

```bash
npm run check:android-bridge
```

脚本会检查 9 个分组、原生 Manifest、桥注册方式、网页调用方法是否存在、云端端点、APK 工作流和部署文档。任何一项缺失都会直接失败。

## 3. 部署顺序

严格按下面顺序做，不要跳步：

1. 部署网页并设置 HTTPS 域名。
2. 可选：部署专用个人 Supabase，并用应用内“云服务部署”完成初始化和函数部署。
3. 在 GitHub Actions 设置站点地址和可选签名密钥。
4. 构建 APK，安装到 Android。
5. 在手机系统设置和应用内逐项授权。
6. 用本机事件、规则通知、云端自检和真机功能矩阵逐项验收。

## 4. 网页部署

### 4.1 必填构建配置

在部署平台的环境变量中至少设置：

| 变量 | 值 | 说明 |
|---|---|---|
| `NEXT_PUBLIC_SELF_HOSTED_MODE` | `true` | 自部署模式。该变量是构建期注入，改完必须重新部署。 |

如果使用自己的 Supabase 作为站点服务端配置，再设置：

| 变量 | 放置位置 | 说明 |
|---|---|---|
| `SUPABASE_URL` | 服务端环境变量 | 你的 Supabase 项目地址 |
| `SUPABASE_SERVICE_ROLE_KEY` | 服务端环境变量 | 只能放服务端，绝不能写入 `NEXT_PUBLIC_*` |

`NEXT_PUBLIC_*` 会进入浏览器产物，只能放公开 URL 或公开 anon/publishable key。

### 4.2 本地构建检查

使用 Node.js 22：

```bash
npm ci
npm run check:android-bridge
npm run build
```

部署平台应与仓库 `package.json` 使用同一套构建命令。不要只上传静态文件，Next.js API Route 需要 Node 运行环境。

### 4.3 确认网页层可用

部署后先打开网页版，不要急着装 APK：

- 页面能正常登录并进入桌面。
- 桌面应用列表里存在“现实桥”。
- 设置里能看到“云服务部署”“感知”“桌面小组件”“故障诊断与设备兼容性”。
- 浏览器控制台没有持续红错。

浏览器版没有 Android 原生对象时，现实桥 UI 应安全降级，而不是白屏。出现白屏要先修网页，不要归因于手机权限。

## 5. 个人 Supabase 部署（可选但推荐）

### 5.1 为什么要独立项目

个人云会创建 `push_jobs`、`push_outbox`、`push_bridge_config`、`push_bridge_snapshots`、`life_schedule_runtime` 等表。仓库 SQL 有硬保护：检测到目标项目已有其他业务表时会拒绝部署。

因此必须新建一个专用 Supabase 项目，不要复用你已有的业务库。

### 5.2 推荐方式：应用内一键部署

1. 打开 Supabase 账号设置，创建 Personal Access Token。
2. 进入小手机设置 → 云服务部署。
3. 粘贴 Access Token。
4. 选择组织，按提示新建“AI Phone Personal Cloud”专用项目。
5. 等待应用完成数据库 Schema、Edge Functions、Cron 和密钥初始化。
6. 回到设置检查“云备份”“离线推送”是否显示已部署。

一键部署会使用 `docs/personal-push-supabase.sql` 和 `supabase/functions/*` 的构建产物。项目初始化可能需要等待几十秒，失败后可以再次点击继续。

### 5.3 手工部署时必须做什么

只有在你明确知道目标项目是专用的前提下，才手工执行：

1. 在 Supabase SQL Editor 运行 `docs/personal-push-supabase.sql`。
2. 部署 `ai-phone-push`、`push-generate`、`push-bridge`、`life-scheduler`、`push-shortcut-result`、`screen-chat` 等函数。
3. 配置函数所需 Secrets、Cron 和 Realtime。
4. 在应用里重新连接该云服务。

`docs/reality-bridge-schedule-cron.sql` 是旧版站点共享推送的迁移脚本，不是新个人云的初始化步骤。新部署以 `docs/personal-push-supabase.sql` 和应用内流程为准。

### 5.4 云端验收

在设置中执行“一键排查”，确认：

- 账号身份存在。
- 推送订阅存在，壳通道出现 `shell:` 订阅。
- `push_jobs` 能创建任务。
- `push_outbox` 没有异常积压。
- VAPID 公钥可用。
- 测试广播能从服务端到达 Android 壳。

一次广播成功只证明当时链路通了，不等于长期后台存活。强制停止应用、系统清理、断网和厂商省电策略仍需单独验证。

## 6. 构建 Android APK

工作流：`.github/workflows/android-shell.yml`，名称是 **Build Android Shell APK**。

### 6.1 设置站点地址

进入仓库 Settings → Secrets and variables → Actions → Variables，添加：

| 名称 | 值 |
|---|---|
| `SHELL_SITE_URL` | 你的 HTTPS 网页地址，例如 `https://phone.example.com/` |

手动运行工作流时也可以填写 `site_url`，本次输入优先于仓库变量。

### 6.2 可选正式签名

如需可长期覆盖升级的 Release APK，在 Actions Secrets 配置：

| Secret | 内容 |
|---|---|
| `SHELL_KEYSTORE_BASE64` | keystore 文件的 Base64 |
| `SHELL_KEYSTORE_PASSWORD` | keystore 密码 |
| `SHELL_KEY_ALIAS` | 密钥别名 |
| `SHELL_KEY_PASSWORD` | 密钥密码 |

四个值必须配套。keystore 和密码不要提交到仓库，也不要发到聊天、Issue 或截图里。更新安装的关键是签名一致；签名不一致时 Android 通常拒绝覆盖安装。

### 6.3 运行与下载

1. 打开 Actions，选择 **Build Android Shell APK**。
2. 点击 Run workflow。
3. 等待权限检查、Gradle 构建和签名校验完成。
4. 下载 `float-shell-debug`，配置签名时再下载 `float-shell-release-signed`。

工作流使用 Java 17、Gradle 8.11.1，并在构建前运行 `scripts/check-android-permissions.mjs`。

## 7. Android 首次授权

安装后先打开网页，确认能加载站点，再进入应用设置中的“故障诊断与设备兼容性”或对应权限入口。只开启你实际需要的功能。

| 能力 | Android 权限/入口 | 说明 |
|---|---|---|
| 系统通知 | 通知权限 | 现实桥本机规则、离线消息、通话提醒都需要 |
| 通话/查岗浮窗 | 悬浮窗权限 | Android 6+ 特殊访问，需要在系统设置中手动开 |
| 前台应用与停留 | 使用情况访问 | `PACKAGE_USAGE_STATS` 是特殊访问，不是普通弹窗 |
| 当前应用/通话浮窗保活 | 无障碍服务 | 对应 `CallControlService`，由用户主动开启 |
| 媒体播放状态 | 通知使用权 | 对应 `MediaControlListenerService`，不应读取通知正文 |
| 电量与后台稳定 | 电池优化白名单 | 国内 ROM 还可能有自启动、后台活动和应用锁定 |
| 精确提醒 | 精确闹钟权限 | Android 12+ 可能需要在系统设置中允许 |
| 位置 | 前台/后台位置 | 只在启用位置感知时开启，后台位置是敏感权限 |
| 日历 | 读取/写入日历 | 只在系统日历联动时开启 |
| 睡眠 | Health Connect 睡眠权限 | 需安装/启用 Health Connect 并单独授权 |
| 摄像头/麦克风 | 运行时权限 | 只在视频/语音通话时使用 |
| 勿扰/亮度 | 勿扰访问、修改系统设置 | 属于特殊能力，失败时应安全降级 |

不要在首次启动时盲目点满所有权限。先完成基础聊天与网络检查，再按现实桥规则实际需要的动作授权。

## 8. 真机验收矩阵

建议记录：手机型号、Android 版本、WebView 版本、APK versionName/versionCode、站点地址、Supabase 项目标识、测试时间。

### 8.1 本机现实桥

| 测试 | 操作 | 通过标准 |
|---|---|---|
| 原生接口检测 | 打开现实桥与设备兼容性页面 | 能识别当前为 Android Shell，诊断里能看到原生版本 |
| 本机事件落盘 | 开启现实桥后插拔充电器 | 事件出现在近期事件/执行流水 |
| 本机规则 | 建一条匹配“充电开始”的启用规则 | 命中后出现本机通知或配置的离线回复 |
| 冷却 | 连续触发同一规则 | 冷却期内不重复执行 |
| 设备动作 | 授权后测试手电筒 | 前台测试成功；后台自动执行仅支持明确列入允许列表的动作 |
| 总开关 | 关闭现实桥后再次触发 | 显示“现实桥总开关关闭”，不执行规则 |

### 8.2 感知与设备能力

| 测试 | 操作 | 通过标准 |
|---|---|---|
| 电量/网络 | 打开感知诊断 | 返回真实状态，未知值不伪造 |
| 前台应用/使用时长 | 授予使用情况访问后测试 | 能区分未授权与无数据 |
| 位置 | 授权后刷新 | 返回位置或明确失败原因 |
| 系统日历 | 授权后读取并创建一条测试事件 | 可读、可写、可删除，且用户可撤销 |
| Health Connect | 授权睡眠读取 | 返回获授权的数据或明确不可用 |
| 媒体控制 | 授予通知使用权后播放音乐 | 播放/暂停状态可读取并控制 |

### 8.3 截屏、查岗、通话与小组件

| 测试 | 操作 | 通过标准 |
|---|---|---|
| 查岗预览 | 从角色触发查岗 | 先显示预览和同意/拒绝，不静默上传 |
| 截屏悬浮球 | 开启悬浮球后点击 | 走同一套预览与确认流程 |
| 通知回复 | 从系统通知直接回复 | 回复进入正确会话并持久化 |
| 通话浮窗 | 发起通话后退到其他应用 | 浮窗显示、拖动、挂断和返回正常 |
| 桌面小组件 | 添加两个独立实例并分别修改 | 内容和 profileId 不串用 |
| 重启恢复 | 重启手机后检查需持久化的功能 | 只在系统允许的范围内恢复，强停后不假装自动复活 |

### 8.4 云端中继

| 测试 | 操作 | 通过标准 |
|---|---|---|
| 云连接 | 设置 → 云服务部署 | 显示已部署并能换设备重连 |
| 订阅 | 打开离线推送通知栏常驻提示 | 显示已连接，一键排查出现 `shell:` 订阅 |
| 原生事件入云 | 触发本机事件并查看诊断 | `/api/push/bridge-native-event` 收到并写回个人云 |
| 服务端自检 | 执行一键排查 | 账号、订阅、任务、VAPID、测试广播逐项有结论 |
| 定时扫描 | 创建到点任务 | `push_jobs` 状态变化可追踪，失败有诊断事件 |

## 9. 故障定位顺序

不要先改代码。按链路从外到内排查：

1. **站点**：APK 加载的是不是刚刚部署的 HTTPS 域名？`SHELL_SITE_URL` 是否仍是旧地址？
2. **网页版本**：桌面是否出现现实桥入口？浏览器版是否正常？
3. **原生版本**：设备兼容性页面能否读到当前 APK 版本和原生接口？
4. **权限**：通知、悬浮窗、使用情况、无障碍、通知使用权、精确闹钟是否真的授予？
5. **系统策略**：是否被厂商后台限制、电池优化、应用锁或强制停止？
6. **本机链路**：事件是否落盘？规则是否启用、匹配类型、过滤词、冷却是否正确？
7. **云端链路**：一键排查里账号、订阅、任务表、回传箱哪一段失败？
8. **代码/CI**：最后才看 Actions 日志和 `npm run check:android-bridge`。

常见现象：

| 现象 | 优先检查 |
|---|---|
| 现实桥显示不可用 | 是否在 Android Shell 内打开；APK 是否过旧；站点 Origin 是否与构建时不一致 |
| 本机事件不出现 | 现实桥总开关、原生权限、应用是否被强制停止、事件类型是否匹配 |
| 规则不触发 | 规则启用状态、匹配类型、过滤词、冷却、设备动作允许列表 |
| 通知不出现 | 通知权限、通知渠道、系统勿扰、后台限制 |
| 查岗/截屏失败 | 悬浮窗权限、前台服务限制、用户是否拒绝预览 |
| 通话浮窗不显示 | 悬浮窗权限、无障碍服务、电池优化、前台服务类型 |
| 小组件不刷新 | 启动器限制、组件是否放置、原生渲染诊断、独立 profileId |
| 云端收不到消息 | 自检结果、订阅、Realtime、Cron、函数日志、VAPID 配置 |
| 新 APK 无法覆盖安装 | 新旧 APK 签名是否一致；不要直接卸载导致本地数据丢失 |

## 10. 安全与能力边界

- 原生桥使用 nonce 门禁和可信 Origin 快照，不把原始 `ShellBridge` 直接暴露给所有页面。
- 设备动作有总开关和动作允许列表；后台只执行明确支持且明确授权的动作。
- 截屏/查岗必须经过用户可见的预览与确认，不应静默采集。
- `SUPABASE_SERVICE_ROLE_KEY`、模型 Key、邮件 Key、keystore 密码只能放服务端或 GitHub Secrets。
- 卸载 APK、清除应用数据会删除 WebView 沙箱内的聊天、角色、设置和未同步队列。卸载前先导出备份并验证可恢复。
- Android 强制停止应用后，系统会阻止广播和服务自动拉起，代码不能绕过这个限制。
- 后台存活、通知送达、使用情况访问、无障碍、精确闹钟、后台位置、全屏通知等能力受 Android 版本、厂商策略和商店政策限制。
- GitHub 可下载 APK 不等于满足 Google Play 上架政策；相关权限需要逐项说明核心用途并接受审核。

## 11. 更新与回滚

1. 网页更新后重新部署并保持 HTTPS 域名不变。
2. Android 原生代码变更后必须重新构建 APK；只更新网页不会更新已安装的原生桥。
3. 正式签名 Secret 必须长期保存；丢失后新 APK 无法覆盖旧安装。
4. 个人 Supabase 升级使用应用内云服务部署或对应迁移 SQL，不要批量执行 `docs/*.sql`。
5. 回滚网页时同时核对云端函数版本；旧网页调用新函数通常比新网页调用旧函数更容易兼容。
6. 回滚 APK 前确认签名一致，并先导出数据。

## 12. 维护命令

```bash
# 完整现实桥文件与原生/网页接口一致性
npm run check:android-bridge

# 仅 Android Manifest 权限与桥版本一致性
node scripts/check-android-permissions.mjs

# TypeScript / Next.js 生产构建
npm run build

# 桌面小组件输出回归
npm run test:widget-output
```

GitHub Actions 中还有 **Validate Android Reality Bridge**，会在相关文件变更时自动执行同一套检查。

## 13. 最终交付判断

只有同时满足以下条件，才建议把它当作“可以长期使用和部署”：

- 网页生产构建成功，HTTPS 域名稳定。
- `npm run check:android-bridge` 和 Android APK 工作流通过。
- 你使用的是自己签名并妥善保存的 Release APK。
- 个人 Supabase 是独立项目，一键排查通过。
- 至少在一台目标 Android 真机上，按第 8 节逐项完成你实际启用的功能。
- 已知限制、未验证项和无法绕过的系统策略已经如实记录。

如果其中任一项没有证据，请标为“未验证”，不要因为代码文件存在就宣布全功能可用。
