# Android 现实桥全量核对报告

> 生成日期：2026-11-13  
> 目标仓库：`xbabjak-wrb/momo.float.phone`  
> 目标提交：`197bf7aed254878d87c19f3f3ae431ee84836b0d`

## 结论

本次不是关键词搜索，而是对 Git 文件树逐路径、逐 blob SHA 比较。

- 现实桥清单共 **169** 个关键文件。
- 与 Doremy 公开 `main` 比较：源码文件缺失 **0** 个，内容完全相同 **162** 个，按部署需要修改文档 **4** 个，额外新增校验/部署文件 **3** 个。
- 与 Doremy 开发仓库 `Zyxxx1203/doremy.float.phone` 比较：源码文件缺失 **0** 个。
- 所有 Android 原生、网页桥接、云端中继和集成代码均来自老师仓库，不是自行仿写。

## 比较基线

| 仓库 | 分支 | 提交 | 文件数 |
|---|---|---|---:|
| `xbabjak-wrb/momo.float.phone` | main | `197bf7aed254878d87c19f3f3ae431ee84836b0d` | 1222 |
| `doremy1203/doremy.float.phone` | main | `7307868142148eae1512671a0153b5cd7938fff0` | 1219 |
| `Zyxxx1203/doremy.float.phone` | main | `e3c0e9fb414518e431de6f735d7723660522db76` | 1219 |

## 为什么截图里只看到 iOS 现实桥

`lib/shell-detect.ts` 的判定条件是：

```ts
navigator.userAgent.includes("FloatShell/")
```

只有 Android APK 的 WebView 会设置 `FloatShell/1.0.29`。普通浏览器没有这个标记，因此：

- 在 Netlify 网页里看不到 Android 本机桥，这是设计上的降级；
- 网页只能走浏览器/iOS 快捷指令路线；
- 必须安装仓库构建的 APK，并在 APK 内打开，才会出现“本机桥 · 安卓”。

截图中“iOS现实桥”这一字面标题在 Doremy 公开 `main` 与开发仓库 `main` 中都不存在。说明截图对应的不是当前公开源码构建，可能是老师尚未公开的新版或其他自定义版本，不能据此判断本仓库缺文件。

## 与 Doremy 公开 main 的差异

你的仓库完整包含 Doremy 的 1219 个文件。除以下文档/构建辅助改动外，其余文件内容完全一致：

- `README.md`
- `DEVICE_SETUP_GUIDE.md`
- `android-shell/README.md`
- `docs/README.md`

新增的 4 个文件为完整性保护、部署与审计文档：

- `.github/workflows/android-reality-bridge-validation.yml`
- `scripts/check-android-reality-bridge.mjs`
- `docs/ANDROID_REALITY_BRIDGE_DEPLOYMENT.md`

## 与 Doremy 开发仓库 main 的差异

开发仓库比你同步的公开 main 多两个聊天/睡眠修复提交，但不包含任何现实桥结构性缺失；逐文件比较结果为现实桥关键文件缺失 0 个。

## 关键文件逐项核对

### Android native shell

| 文件 | 与 Doremy main |
|---|---|
| `android-shell/app/build.gradle` | 完全一致 |
| `android-shell/build.gradle` | 完全一致 |
| `android-shell/settings.gradle` | 完全一致 |
| `android-shell/gradle.properties` | 完全一致 |
| `android-shell/app/src/main/AndroidManifest.xml` | 完全一致 |
| `android-shell/app/src/main/java/app/floatphone/shell/MainActivity.kt` | 完全一致 |
| `android-shell/app/src/main/java/app/floatphone/shell/PushService.kt` | 完全一致 |
| `android-shell/app/src/main/java/app/floatphone/shell/BootReceiver.kt` | 完全一致 |
| `android-shell/app/src/main/java/app/floatphone/shell/NativeRealityBridge.kt` | 完全一致 |
| `android-shell/app/src/main/java/app/floatphone/shell/DeviceActionBridge.kt` | 完全一致 |
| `android-shell/app/src/main/java/app/floatphone/shell/PerceptionBridge.kt` | 完全一致 |
| `android-shell/app/src/main/java/app/floatphone/shell/HealthBridge.kt` | 完全一致 |
| `android-shell/app/src/main/java/app/floatphone/shell/LocationBridge.kt` | 完全一致 |
| `android-shell/app/src/main/java/app/floatphone/shell/CalendarBridge.kt` | 完全一致 |
| `android-shell/app/src/main/java/app/floatphone/shell/ScreenshotBridge.kt` | 完全一致 |
| `android-shell/app/src/main/java/app/floatphone/shell/ScreenshotBallService.kt` | 完全一致 |
| `android-shell/app/src/main/java/app/floatphone/shell/CheckInService.kt` | 完全一致 |
| `android-shell/app/src/main/java/app/floatphone/shell/NotificationReplyReceiver.kt` | 完全一致 |
| `android-shell/app/src/main/java/app/floatphone/shell/MediaControlListenerService.kt` | 完全一致 |
| `android-shell/app/src/main/java/app/floatphone/shell/AmbientLightMonitorService.kt` | 完全一致 |
| `android-shell/app/src/main/java/app/floatphone/shell/ShellBus.kt` | 完全一致 |
| `android-shell/app/src/main/java/app/floatphone/shell/CallControlService.kt` | 完全一致 |
| `android-shell/app/src/main/java/app/floatphone/shell/CallOverlayService.kt` | 完全一致 |
| `android-shell/app/src/main/java/app/floatphone/shell/OverlayActionReceiver.kt` | 完全一致 |
| `android-shell/app/src/main/java/app/floatphone/shell/PhoneWidgetConfigActivity.kt` | 完全一致 |
| `android-shell/app/src/main/java/app/floatphone/shell/PhoneWidgetProvider.kt` | 完全一致 |
| `android-shell/app/src/main/java/app/floatphone/shell/PhoneWidgetRenderer.kt` | 完全一致 |
| `android-shell/app/src/main/res/layout/phone_widget.xml` | 完全一致 |
| `android-shell/app/src/main/res/xml/call_control_service.xml` | 完全一致 |
| `android-shell/app/src/main/res/xml/network_security_config.xml` | 完全一致 |
| `android-shell/app/src/main/res/xml/phone_widget_info.xml` | 完全一致 |
| `android-shell/app/src/main/res/xml/shared_video_paths.xml` | 完全一致 |
| `scripts/check-android-permissions.mjs` | 完全一致 |
| `.github/workflows/android-shell.yml` | 完全一致 |

### Reality Bridge web engine

| 文件 | 与 Doremy main |
|---|---|
| `components/reality-bridge-app.tsx` | 完全一致 |
| `components/reality-bridge-scheduler.tsx` | 完全一致 |
| `lib/reality-bridge/app-actions.ts` | 完全一致 |
| `lib/reality-bridge/delayed-queue.ts` | 完全一致 |
| `lib/reality-bridge/engine.ts` | 完全一致 |
| `lib/reality-bridge/storage.ts` | 完全一致 |
| `lib/reality-bridge/types.ts` | 完全一致 |
| `styles/reality-bridge.css` | 完全一致 |
| `components/device-compatibility-bootstrap.tsx` | 完全一致 |
| `components/settings/device-compatibility-settings.tsx` | 完全一致 |
| `lib/device-compatibility.ts` | 完全一致 |
| `components/device-action/device-action-settings.tsx` | 完全一致 |
| `lib/device-action/bridge.ts` | 完全一致 |
| `lib/device-action/engine.ts` | 完全一致 |
| `lib/device-action/feedback.ts` | 完全一致 |
| `lib/device-action/index.ts` | 完全一致 |
| `lib/device-action/storage.ts` | 完全一致 |
| `lib/device-action/types.ts` | 完全一致 |

### Perception bridge

| 文件 | 与 Doremy main |
|---|---|
| `components/perception/perception-bootstrap.tsx` | 完全一致 |
| `components/perception/perception-settings.tsx` | 完全一致 |
| `lib/perception/bridge.ts` | 完全一致 |
| `lib/perception/cloud-sync.ts` | 完全一致 |
| `lib/perception/describe.ts` | 完全一致 |
| `lib/perception/diagnostics.ts` | 完全一致 |
| `lib/perception/engine.ts` | 完全一致 |
| `lib/perception/index.ts` | 完全一致 |
| `lib/perception/storage.ts` | 完全一致 |
| `lib/perception/types.ts` | 完全一致 |

### Screenshot and check-in

| 文件 | 与 Doremy main |
|---|---|
| `components/screenshot/checkin-scheduler.tsx` | 完全一致 |
| `components/screenshot/checkin-settings.tsx` | 完全一致 |
| `components/screenshot/checkin-theme-settings.tsx` | 完全一致 |
| `components/screenshot/diagnostics-panel.tsx` | 完全一致 |
| `components/screenshot/screenshot-settings.tsx` | 完全一致 |
| `lib/screenshot/ball.ts` | 完全一致 |
| `lib/screenshot/bridge.ts` | 完全一致 |
| `lib/screenshot/checkin-config.ts` | 完全一致 |
| `lib/screenshot/checkin-engine.ts` | 完全一致 |
| `lib/screenshot/checkin-guidance.ts` | 完全一致 |
| `lib/screenshot/checkin-theme.ts` | 完全一致 |
| `lib/screenshot/checkin.ts` | 完全一致 |
| `lib/screenshot/config.ts` | 完全一致 |
| `lib/screenshot/engine.ts` | 完全一致 |
| `lib/screenshot/index.ts` | 完全一致 |
| `lib/screenshot/share-targets.ts` | 完全一致 |
| `lib/screenshot/types.ts` | 完全一致 |

### Calendar and home-screen widget

| 文件 | 与 Doremy main |
|---|---|
| `components/system-calendar/system-calendar-settings.tsx` | 完全一致 |
| `lib/system-calendar/bridge.ts` | 完全一致 |
| `lib/system-calendar/config.ts` | 完全一致 |
| `lib/system-calendar/index.ts` | 完全一致 |
| `lib/system-calendar/types.ts` | 完全一致 |
| `components/widget/widget-scheduler.tsx` | 完全一致 |
| `components/widget/widget-settings.tsx` | 完全一致 |
| `lib/widget/avatar.ts` | 完全一致 |
| `lib/widget/bridge.ts` | 完全一致 |
| `lib/widget/engine.ts` | 完全一致 |
| `lib/widget/index.ts` | 完全一致 |
| `lib/widget/output.ts` | 完全一致 |
| `lib/widget/storage.ts` | 完全一致 |
| `lib/widget/template.ts` | 完全一致 |
| `lib/widget/types.ts` | 完全一致 |
| `lib/widget-storage.ts` | 完全一致 |
| `lib/widget-types.ts` | 完全一致 |

### Calls and notification reply

| 文件 | 与 Doremy main |
|---|---|
| `components/chat/call-auto-chat-control.tsx` | 完全一致 |
| `components/chat/call-layer.tsx` | 完全一致 |
| `components/chat/call-mini-window.tsx` | 完全一致 |
| `components/chat/call-subtitle-item.tsx` | 完全一致 |
| `components/chat/use-call-auto-chat.ts` | 完全一致 |
| `components/chat/use-call-reply-queue.ts` | 完全一致 |
| `components/chat/use-shell-call-overlay.ts` | 完全一致 |
| `components/settings/call-overlay-settings.tsx` | 完全一致 |
| `components/shell-push-registrar.tsx` | 完全一致 |
| `lib/call-audio-storage.ts` | 完全一致 |
| `lib/call-auto-chat.ts` | 完全一致 |
| `lib/call-overlay-theme.ts` | 完全一致 |
| `lib/call-session-store.ts` | 完全一致 |
| `lib/notification-reply.ts` | 完全一致 |
| `lib/shell-call-overlay.ts` | 完全一致 |
| `lib/shell-detect.ts` | 完全一致 |
| `lib/shell-notify.ts` | 完全一致 |

### Cloud relay and personal Supabase

| 文件 | 与 Doremy main |
|---|---|
| `app/api/push/bridge-config/route.ts` | 完全一致 |
| `app/api/push/bridge-native-event/route.ts` | 完全一致 |
| `app/api/push/bridge-snapshots/route.ts` | 完全一致 |
| `app/api/push/bridge-wake/route.ts` | 完全一致 |
| `app/api/push/deploy-personal/route.ts` | 完全一致 |
| `app/api/push/jobs/route.ts` | 完全一致 |
| `app/api/push/outbox/route.ts` | 完全一致 |
| `app/api/push/public-key/route.ts` | 完全一致 |
| `app/api/push/selfcheck/route.ts` | 完全一致 |
| `lib/personal-push-cloud.ts` | 完全一致 |
| `lib/push-bridge-shared.ts` | 完全一致 |
| `lib/push-bridge-sync.ts` | 完全一致 |
| `lib/push-client.ts` | 完全一致 |
| `lib/push-outbox-client.ts` | 完全一致 |
| `lib/push-selfcheck.ts` | 完全一致 |
| `lib/push-schedule-view.ts` | 完全一致 |
| `docs/personal-push-supabase.sql` | 完全一致 |
| `docs/reality-bridge-schedule-cron.sql` | 完全一致 |
| `public/ai-phone-push/gateway.mjs` | 完全一致 |
| `public/ai-phone-push/push-bridge.mjs` | 完全一致 |
| `public/ai-phone-push/push-generate.mjs` | 完全一致 |
| `public/ai-phone-push/schema.sql` | 完全一致 |
| `public/personal-push-sw.js` | 完全一致 |
| `supabase/functions/ai-phone-push/index.ts` | 完全一致 |
| `supabase/functions/push-bridge/index.ts` | 完全一致 |
| `supabase/functions/push-generate/index.ts` | 完全一致 |

### Application integration points

| 文件 | 与 Doremy main |
|---|---|
| `components/app-market/custom-app-runner.tsx` | 完全一致 |
| `components/debug-prompt-panel.tsx` | 完全一致 |
| `components/debug-prompt-registry.ts` | 完全一致 |
| `components/desktop-shell.tsx` | 完全一致 |
| `components/phone-settings-app.tsx` | 完全一致 |
| `components/settings/module-diagnostics.tsx` | 完全一致 |
| `components/settings/runtime-diagnostics.tsx` | 完全一致 |
| `lib/builtin-app-prompts.ts` | 完全一致 |
| `lib/custom-app-host-api.ts` | 完全一致 |
| `lib/custom-app-permission-labels.ts` | 完全一致 |
| `lib/desktop-config.ts` | 完全一致 |
| `lib/internal-capability-storage.ts` | 完全一致 |
| `lib/llm-prompt-assembler.ts` | 完全一致 |
| `lib/memory-injector.ts` | 完全一致 |
| `lib/offline-shortcut-capability.ts` | 完全一致 |
| `lib/tool-executor.ts` | 完全一致 |
| `lib/tool-prompt.ts` | 完全一致 |
| `lib/follow-up-service.ts` | 完全一致 |
| `lib/server/shortcut-email-service.ts` | 完全一致 |
| `app/api/push/shortcut-commands/route.ts` | 完全一致 |

### Deployment and diagnostics documentation

| 文件 | 与 Doremy main |
|---|---|
| `README.md` | 已按部署需要修改（文档/配置） |
| `DEVICE_SETUP_GUIDE.md` | 已按部署需要修改（文档/配置） |
| `android-shell/README.md` | 已按部署需要修改（文档/配置） |
| `android-shell/DIAGNOSTICS.md` | 完全一致 |
| `docs/README.md` | 已按部署需要修改（文档/配置） |
| `docs/隐私与权限说明.md` | 完全一致 |
| `docs/call-feature-porting-guide.md` | 完全一致 |
| `docs/ANDROID_REALITY_BRIDGE_DEPLOYMENT.md` | 新增部署文档（Doremy 原仓库没有） |
| `.github/workflows/android-reality-bridge-validation.yml` | 新增校验文件（Doremy 原仓库没有） |
| `scripts/check-android-reality-bridge.mjs` | 新增校验脚本（Doremy 原仓库没有） |

## 运行条件

1. 安装 `1.0.29` debug APK，且内部 `SHELL_SITE_URL` 为 `https://statuesque-lokum-5f1aec.netlify.app/`。
2. 在 APK 内打开，而不是在 Chrome/夸克浏览器中打开。
3. 在系统设置中按需授予通知、悬浮窗、无障碍、使用情况访问、自启动和后台活动权限。
4. 网页数据和 APK WebView 数据属于不同沙箱；迁移需要导出/导入备份。
5. 老师笔记当前只明确验证了手电筒，其他功能仍需逐项真机验收。
