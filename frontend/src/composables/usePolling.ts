import { onUnmounted, reactive } from 'vue';

import { useUserStore } from '@/stores/user';

export default function usePolling(pollFn: () => void | Promise<unknown>, interval: number) {
  const userStore = useUserStore();

  const state = reactive({
    timeToMakeNextRequest: 0,
    animationFrameId: -1,
    pollingEnabled: false,
  });

  async function rafTimer(time: number) {
    if (state.timeToMakeNextRequest <= time) {
      await pollFn();
      state.timeToMakeNextRequest = time + interval;
    }
    // always makes first request
    // then checks if polling is enabled and user is logged in
    if (state.pollingEnabled && userStore.isLoggedIn) {
      state.animationFrameId = requestAnimationFrame(rafTimer);
    }
  }

  function startPolling() {
    state.pollingEnabled = true;
    state.animationFrameId = requestAnimationFrame(rafTimer);
  }

  function stopPolling() {
    state.pollingEnabled = false;
    cancelAnimationFrame(state.animationFrameId);
  }

  onUnmounted(stopPolling);

  return {
    startPolling,
    stopPolling,
  };
}
