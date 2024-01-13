import cloneDeep from 'lodash.clonedeep';
import type { Store } from 'pinia';

export default function resetStore({ store }: { store: Store }) {
  const initialState = cloneDeep(store.$state);
  store.$reset = () => {
    store.$patch((state: any) => {
      // console.log('RESETING CHAT STORE', initialState);
      Object.assign(state, initialState);
    });
  };
}
