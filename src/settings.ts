import {
  createLiliaSettingsModel,
  LiliaAboutSection,
  LiliaAppearanceSection,
} from "@lilia/ui/settings";
import { resolveLiliaIcon } from "@lilia/ui/shell";

export const settingsModel = createLiliaSettingsModel({
  path: "/settings",
  defaultTab: "appearance",
  description: "偏好设置会保存到本地。",
  tabs: [
    { key: "appearance", label: "外观", icon: resolveLiliaIcon("palette") },
    { key: "about", label: "关于", icon: resolveLiliaIcon("info") },
  ],
  sections: {
    appearance: LiliaAppearanceSection,
    about: LiliaAboutSection,
  },
});
