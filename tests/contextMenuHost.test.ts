import { fireEvent, render, screen, waitFor } from "@testing-library/vue";
import { describe, expect, it, vi } from "vitest";
import { defineComponent, h } from "vue";
import ContextMenuHost from "../src/components/context-menu/ContextMenuHost.vue";
import {
  useContextMenu,
  type ContextMenuItem,
} from "../src/components/context-menu/useContextMenu";

function renderWithHost(child: ReturnType<typeof defineComponent>) {
  return render(ContextMenuHost, {
    slots: {
      default: () => h(child),
    },
  });
}

describe("ContextMenuHost", () => {
  it("全局屏蔽浏览器原生右键菜单", () => {
    render(ContextMenuHost);

    const event = new MouseEvent("contextmenu", {
      bubbles: true,
      cancelable: true,
      clientX: 24,
      clientY: 24,
    });
    document.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
  });

  it("组件可以按点击位置声明自己的菜单项", async () => {
    const action = vi.fn();
    const items: ContextMenuItem[] = [
      { id: "open", label: "打开", action },
      { id: "disabled", label: "不可用", disabled: true },
    ];
    const Child = defineComponent({
      setup() {
        const menu = useContextMenu();
        return () =>
          h("button", {
            "data-testid": "target",
            onContextmenu: (event: MouseEvent) => menu.show(event, items),
          });
      },
    });

    renderWithHost(Child);
    await fireEvent.contextMenu(screen.getByTestId("target"), {
      clientX: 96,
      clientY: 128,
    });

    const menu = await screen.findByRole("menu");
    expect(menu).toHaveStyle({ left: "96px", top: "128px" });
    expect(screen.getByRole("menuitem", { name: "打开" })).toBeInTheDocument();
    expect(
      screen.getByRole("menuitem", { name: "不可用" }),
    ).toHaveAttribute("aria-disabled", "true");

    await fireEvent.click(screen.getByRole("menuitem", { name: "打开" }));
    expect(action).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
  });
});
