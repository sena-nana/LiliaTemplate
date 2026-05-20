import { inject, type InjectionKey } from "vue";

export interface ContextMenuItem {
  id: string;
  label: string;
  disabled?: boolean;
  action?: () => void | Promise<void>;
}

export interface ContextMenuController {
  show: (event: MouseEvent, items: ContextMenuItem[]) => void;
  hide: () => void;
}

export const ContextMenuHostKey: InjectionKey<ContextMenuController> =
  Symbol("ContextMenuHost");

const noopController: ContextMenuController = {
  show: (event: MouseEvent) => event.preventDefault(),
  hide: () => {},
};

export function useContextMenu(): ContextMenuController {
  return inject(ContextMenuHostKey, noopController);
}
