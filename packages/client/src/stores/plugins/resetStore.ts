import cloneDeep from 'lodash.clonedeep';
import type { Store } from 'pinia';

export default function resetStore({ store }: { store: Store }) {
  const initialState = cloneDeep(store.$state);
  store.$reset = () => store.$patch(cloneDeep(initialState));
}
