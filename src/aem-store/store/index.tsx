import React, { createContext, memo, useContext } from 'react';
import Immutable, { isImmutable } from 'immutable';
import Container, { ContextType, ImmutableType } from './Container';

export const useContainer = <T extends Record<string, unknown>>(context: React.Context<ContextType>) => {
  const { store, handle, dispatch } = useContext(context);
  if (isImmutable(store)) {
    return { store: store.toJS() as T, handle, dispatch };
  }
  return { store, handle, immutable: store, dispatch };
};

export const useStore = <T extends Record<string, unknown>>(context: React.Context<ContextType>) => {
  const { store } = useContext(context);
  if (isImmutable(store)) {
    return store.toJS() as T;
  }
  return store;
};

export const createContainer = <T extends Record<string, unknown>>(initStore: T) => {
  const initData: ImmutableType = Immutable.fromJS(initStore);
  const Context = createContext<any>(initData);
  const addContainer = memo(({ children }): JSX.Element => (
    <Container initData={initData} DataContext={Context}>
      {children}
    </Container>
  ));
  const withContainer = (Element: React.ComponentType): JSX.Element => (
    <Container initData={initData} DataContext={Context}>
      <Element />
    </Container>
  );

  return [
    [addContainer, withContainer],
    () => useContainer<T>(Context),
    () => useStore<T>(Context),
    Context,
  ] as const;
};
