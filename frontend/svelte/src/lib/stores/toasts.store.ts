import { writable } from "svelte/store";
import type { ToastMsg } from "../types/toast";

/**
 * Toast messages.
 *
 * - show: display a message in toast component - messages are stacked but only one is displayed
 * - hide: remove the toast message at the first position i.e. hide the currently displayed message
 */
const initToastsStore = () => {
  const { subscribe, update } = writable<ToastMsg[]>([]);

  return {
    subscribe,

    show(msg: ToastMsg) {
      update((messages: ToastMsg[]) => [...messages, msg]);
    },

    hide() {
      update((messages: ToastMsg[]) => messages.slice(1));
    },
  };
};

export const toastsStore = initToastsStore();
