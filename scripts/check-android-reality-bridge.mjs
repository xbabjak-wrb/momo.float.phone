#!/usr/bin/env node
/**
 * Android Reality Bridge integrity check.
 *
 * This script intentionally has no npm dependencies so it can run before
 * "npm ci" in GitHub Actions. It verifies that the native shell, the web
 * bridge wrappers, the UI/routing integration and the optional cloud relay
 * are all present in the same checkout.
 */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();

const GROUPS = {
  "Android native shell": [
    "android-shell/app/build.gradle",
    "android-shell/build.gradle",
    "android-shell/settings.gradle",
    "android-shell/gradle.properties",
    "android-shell/app/src/main/AndroidManifest.xml",
    "android-shell/app/src/main/java/app/floatphone/shell/MainActivity.kt",
    "android-shell/app/src/main/java/app/floatphone/shell/PushService.kt",
    "android-shell/app/src/main/java/app/floatphone/shell/BootReceiver.kt",
    "android-shell/app/src/main/java/app/floatphone/shell/NativeRealityBridge.kt",
    "android-shell/app/src/main/java/app/floatphone/shell/DeviceActionBridge.kt",
    "android-shell/app/src/main/java/app/floatphone/shell/PerceptionBridge.kt",
    "android-shell/app/src/main/java/app/floatphone/shell/HealthBridge.kt",
    "android-shell/app/src/main/java/app/floatphone/shell/LocationBridge.kt",
    "android-shell/app/src/main/java/app/floatphone/shell/CalendarBridge.kt",
    "android-shell/app/src/main/java/app/floatphone/shell/ScreenshotBridge.kt",
    "android-shell/app/src/main/java/app/floatphone/shell/ScreenshotBallService.kt",
    "android-shell/app/src/main/java/app/floatphone/shell/CheckInService.kt",
    "android-shell/app/src/main/java/app/floatphone/shell/NotificationReplyReceiver.kt",
    "android-shell/app/src/main/java/app/floatphone/shell/MediaControlListenerService.kt",
    "android-shell/app/src/main/java/app/floatphone/shell/AmbientLightMonitorService.kt",
    "android-shell/app/src/main/java/app/floatphone/shell/ShellBus.kt",
    "android-shell/app/src/main/java/app/floatphone/shell/CallControlService.kt",
    "android-shell/app/src/main/java/app/floatphone/shell/CallOverlayService.kt",
    "android-shell/app/src/main/java/app/floatphone/shell/OverlayActionReceiver.kt",
    "android-shell/app/src/main/java/app/floatphone/shell/PhoneWidgetConfigActivity.kt",
    "android-shell/app/src/main/java/app/floatphone/shell/PhoneWidgetProvider.kt",
    "android-shell/app/src/main/java/app/floatphone/shell/PhoneWidgetRenderer.kt",
    "android-shell/app/src/main/res/layout/phone_widget.xml",
    "android-shell/app/src/main/res/xml/call_control_service.xml",
    "android-shell/app/src/main/res/xml/network_security_config.xml",
    "android-shell/app/src/main/res/xml/phone_widget_info.xml",
    "android-shell/app/src/main/res/xml/shared_video_paths.xml",
    "scripts/check-android-permissions.mjs",
    ".github/workflows/android-shell.yml",
  ],
  "Reality Bridge web engine": [
    "components/reality-bridge-app.tsx",
    "components/reality-bridge-scheduler.tsx",
    "lib/reality-bridge/app-actions.ts",
    "lib/reality-bridge/delayed-queue.ts",
    "lib/reality-bridge/engine.ts",
    "lib/reality-bridge/storage.ts",
    "lib/reality-bridge/types.ts",
    "styles/reality-bridge.css",
    "components/device-compatibility-bootstrap.tsx",
    "components/settings/device-compatibility-settings.tsx",
    "lib/device-compatibility.ts",
    "components/device-action/device-action-settings.tsx",
    "lib/device-action/bridge.ts",
    "lib/device-action/engine.ts",
    "lib/device-action/feedback.ts",
    "lib/device-action/index.ts",
    "lib/device-action/storage.ts",
    "lib/device-action/types.ts",
  ],
  "Perception bridge": [
    "components/perception/perception-bootstrap.tsx",
    "components/perception/perception-settings.tsx",
    "lib/perception/bridge.ts",
    "lib/perception/cloud-sync.ts",
    "lib/perception/describe.ts",
    "lib/perception/diagnostics.ts",
    "lib/perception/engine.ts",
    "lib/perception/index.ts",
    "lib/perception/storage.ts",
    "lib/perception/types.ts",
  ],
  "Screenshot and check-in": [
    "components/screenshot/checkin-scheduler.tsx",
    "components/screenshot/checkin-settings.tsx",
    "components/screenshot/checkin-theme-settings.tsx",
    "components/screenshot/diagnostics-panel.tsx",
    "components/screenshot/screenshot-settings.tsx",
    "lib/screenshot/ball.ts",
    "lib/screenshot/bridge.ts",
    "lib/screenshot/checkin-config.ts",
    "lib/screenshot/checkin-engine.ts",
    "lib/screenshot/checkin-guidance.ts",
    "lib/screenshot/checkin-theme.ts",
    "lib/screenshot/checkin.ts",
    "lib/screenshot/config.ts",
    "lib/screenshot/engine.ts",
    "lib/screenshot/index.ts",
    "lib/screenshot/share-targets.ts",
    "lib/screenshot/types.ts",
  ],
  "Calendar and home-screen widget": [
    "components/system-calendar/system-calendar-settings.tsx",
    "lib/system-calendar/bridge.ts",
    "lib/system-calendar/config.ts",
    "lib/system-calendar/index.ts",
    "lib/system-calendar/types.ts",
    "components/widget/widget-scheduler.tsx",
    "components/widget/widget-settings.tsx",
    "lib/widget/avatar.ts",
    "lib/widget/bridge.ts",
    "lib/widget/engine.ts",
    "lib/widget/index.ts",
    "lib/widget/output.ts",
    "lib/widget/storage.ts",
    "lib/widget/template.ts",
    "lib/widget/types.ts",
    "lib/widget-storage.ts",
    "lib/widget-types.ts",
  ],
  "Calls and notification reply": [
    "components/chat/call-auto-chat-control.tsx",
    "components/chat/call-layer.tsx",
    "components/chat/call-mini-window.tsx",
    "components/chat/call-subtitle-item.tsx",
    "components/chat/use-call-auto-chat.ts",
    "components/chat/use-call-reply-queue.ts",
    "components/chat/use-shell-call-overlay.ts",
    "components/settings/call-overlay-settings.tsx",
    "components/shell-push-registrar.tsx",
    "lib/call-audio-storage.ts",
    "lib/call-auto-chat.ts",
    "lib/call-overlay-theme.ts",
    "lib/call-session-store.ts",
    "lib/notification-reply.ts",
    "lib/shell-call-overlay.ts",
    "lib/shell-detect.ts",
    "lib/shell-notify.ts",
  ],
  "Cloud relay and personal Supabase": [
    "app/api/push/bridge-config/route.ts",
    "app/api/push/bridge-native-event/route.ts",
    "app/api/push/bridge-snapshots/route.ts",
    "app/api/push/bridge-wake/route.ts",
    "app/api/push/deploy-personal/route.ts",
    "app/api/push/jobs/route.ts",
    "app/api/push/outbox/route.ts",
    "app/api/push/public-key/route.ts",
    "app/api/push/selfcheck/route.ts",
    "lib/personal-push-cloud.ts",
    "lib/push-bridge-shared.ts",
    "lib/push-bridge-sync.ts",
    "lib/push-client.ts",
    "lib/push-outbox-client.ts",
    "lib/push-selfcheck.ts",
    "lib/push-schedule-view.ts",
    "docs/personal-push-supabase.sql",
    "docs/reality-bridge-schedule-cron.sql",
    "public/ai-phone-push/gateway.mjs",
    "public/ai-phone-push/push-bridge.mjs",
    "public/ai-phone-push/push-generate.mjs",
    "public/ai-phone-push/schema.sql",
    "public/personal-push-sw.js",
    "supabase/functions/ai-phone-push/index.ts",
    "supabase/functions/push-bridge/index.ts",
    "supabase/functions/push-generate/index.ts",
  ],
  "Application integration points": [
    "components/app-market/custom-app-runner.tsx",
    "components/debug-prompt-panel.tsx",
    "components/debug-prompt-registry.ts",
    "components/desktop-shell.tsx",
    "components/phone-settings-app.tsx",
    "components/settings/module-diagnostics.tsx",
    "components/settings/runtime-diagnostics.tsx",
    "lib/builtin-app-prompts.ts",
    "lib/custom-app-host-api.ts",
    "lib/custom-app-permission-labels.ts",
    "lib/desktop-config.ts",
    "lib/internal-capability-storage.ts",
    "lib/llm-prompt-assembler.ts",
    "lib/memory-injector.ts",
    "lib/offline-shortcut-capability.ts",
    "lib/tool-executor.ts",
    "lib/tool-prompt.ts",
    "lib/follow-up-service.ts",
    "lib/server/shortcut-email-service.ts",
    "app/api/push/shortcut-commands/route.ts",
  ],
  "Deployment and diagnostics documentation": [
    "README.md",
    "DEVICE_SETUP_GUIDE.md",
    "android-shell/README.md",
    "android-shell/DIAGNOSTICS.md",
    "docs/README.md",
    "docs/隐私与权限说明.md",
    "docs/call-feature-porting-guide.md",
    "docs/ANDROID_REALITY_BRIDGE_DEPLOYMENT.md",
    ".github/workflows/android-reality-bridge-validation.yml",
    "scripts/check-android-reality-bridge.mjs",
  ],
};

function rel(file) {
  return path.join(ROOT, ...file.split("/"));
}

async function text(file) {
  try {
    const value = await readFile(rel(file), "utf8");
    assert.ok(value.trim().length > 0, file + " is empty");
    return value;
  } catch (error) {
    throw new Error("Missing or unreadable required file: " + file + "\n" + String(error));
  }
}

function mustContain(file, source, marker) {
  assert.ok(
    source.includes(marker),
    file + " no longer contains required marker: " + marker,
  );
}

const seen = new Set();
let fileCount = 0;
for (const [group, files] of Object.entries(GROUPS)) {
  for (const file of files) {
    assert.ok(!seen.has(file), "Duplicate manifest entry: " + file);
    seen.add(file);
    await text(file);
    fileCount += 1;
  }
  console.log("  ✓ " + group + ": " + files.length + " files");
}

const manifest = await text("android-shell/app/src/main/AndroidManifest.xml");
for (const permission of [
  "android.permission.INTERNET",
  "android.permission.POST_NOTIFICATIONS",
  "android.permission.FOREGROUND_SERVICE_SPECIAL_USE",
  "android.permission.SYSTEM_ALERT_WINDOW",
  "android.permission.PACKAGE_USAGE_STATS",
  "android.permission.ACCESS_FINE_LOCATION",
  "android.permission.ACCESS_BACKGROUND_LOCATION",
  "android.permission.READ_CALENDAR",
  "android.permission.WRITE_CALENDAR",
  "android.permission.WAKE_LOCK",
  "android.permission.USE_EXACT_ALARM",
  "android.permission.SCHEDULE_EXACT_ALARM",
]) {
  mustContain("android-shell/app/src/main/AndroidManifest.xml", manifest, permission);
}
for (const component of [
  ".NativeRealityBridgeReceiver",
  ".AmbientLightMonitorService",
  ".CallControlService",
  ".CallOverlayService",
  ".CheckInService",
  ".MediaControlListenerService",
  ".NotificationReplyReceiver",
  ".PhoneWidgetProvider",
  ".PhoneWidgetConfigActivity",
]) {
  mustContain("android-shell/app/src/main/AndroidManifest.xml", manifest, component);
}

const mainActivity = await text("android-shell/app/src/main/java/app/floatphone/shell/MainActivity.kt");
for (const marker of [
  '"AndroidShellSecure"',
  '"PhoneWidgetSecure"',
  "configureNativeRealityBridge",
  "getNativeRealityBridgeLog",
  "getPerceptionSnapshot",
  "peekPendingReplies",
  "requestCheckIn",
  "updateProfile",
  "requestOverlayPermission",
  "secureBridgeDocumentStartInstalled",
]) {
  mustContain("MainActivity.kt", mainActivity, marker);
}

const nativeBridge = await text("android-shell/app/src/main/java/app/floatphone/shell/NativeRealityBridge.kt");
for (const marker of [
  "object NativeRealityBridge",
  "class NativeRealityBridgeReceiver",
  "ACTION_POWER_CONNECTED",
  "allowedDeviceActions",
  "executeBackgroundDeviceAction",
  "watchAmbientLight",
]) {
  mustContain("NativeRealityBridge.kt", nativeBridge, marker);
}

const realityApp = await text("components/reality-bridge-app.tsx");
for (const marker of [
  "configureNativeRealityBridge",
  "getNativeRealityBridgeLog",
  "RealityBridgeApp",
]) {
  mustContain("reality-bridge-app.tsx", realityApp, marker);
}

const cloudEvent = await text("app/api/push/bridge-native-event/route.ts");
mustContain("bridge-native-event/route.ts", cloudEvent, "Android 原生后台感知事件入口");
mustContain("bridge-native-event/route.ts", cloudEvent, "export async function POST");

const selfcheck = await text("app/api/push/selfcheck/route.ts");
mustContain("selfcheck/route.ts", selfcheck, "离线推送全链路自检");
mustContain("selfcheck/route.ts", selfcheck, "broadcastShellNotify");

const workflow = await text(".github/workflows/android-shell.yml");
mustContain("android-shell.yml", workflow, "SHELL_SITE_URL");
mustContain("android-shell.yml", workflow, "SHELL_KEYSTORE_BASE64");
mustContain("android-shell.yml", workflow, "check-android-permissions.mjs");

const packageJson = JSON.parse(await text("package.json"));
assert.ok(packageJson.scripts?.["check:android-bridge"], "package.json must expose check:android-bridge");

// Verify that every native method promised by the web wrappers still exists
// in MainActivity. Callback-only and deliberately legacy aliases are excluded.
const wrapperFiles = [
  "lib/perception/bridge.ts",
  "lib/device-action/bridge.ts",
  "lib/screenshot/bridge.ts",
  "lib/system-calendar/bridge.ts",
  "lib/shell-call-overlay.ts",
  "lib/notification-reply.ts",
  "lib/widget/bridge.ts",
  "components/reality-bridge-app.tsx",
];
const nonNativeCallbacks = new Set([
  "unsubscribe",
  "getOverlayTheme",
  "setOverlayTheme",
  "onNotice",
  "onOpenSettings",
]);
const nativeFunctions = new Set(
  [...mainActivity.matchAll(/\bfun\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(/g)].map(match => match[1]),
);
const missingMethods = [];
for (const file of wrapperFiles) {
  const source = await text(file);
  const methods = new Set(
    [...source.matchAll(/\b([A-Za-z_][A-Za-z0-9_]*)\?\s*:\s*\(/g)].map(match => match[1]),
  );
  for (const method of methods) {
    if (!nonNativeCallbacks.has(method) && !nativeFunctions.has(method)) {
      missingMethods.push(file + " -> MainActivity." + method);
    }
  }
}
assert.deepEqual(missingMethods, [], "Web/native bridge contract mismatch:\n" + missingMethods.join("\n"));

console.log("");
console.log("Android Reality Bridge integrity check passed.");
console.log("  Required files: " + fileCount);
console.log("  Native bridge registrations: secure dispatcher present");
console.log("  Web/native method contract: matched");
console.log("  Cloud relay endpoints: present");
