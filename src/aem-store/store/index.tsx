import React, { createContext, FC, memo, useCallback, useContext, useMemo, useReducer } from 'react';
import Immutable, { Collection, isImmutable } from 'immutable';

type ImmutableType = Collection<unknown, unknown>;

interface ContextType {store:ImmutableType; handle: HandleType; dispatch: React.Dispatch<{
  type: string;
  data: any;
  path: string;
  isImmutable?: false | undefined;
}>;}

interface ContainerProps<T extends Record<string, unknown>> extends React.HTMLAttributes<HTMLElement> {
  DataContext: React.Context<ContextType>;
  initData: any;
  children: React.ReactNode;
}

const OPERATION = {
  DELETE: 'DELETE',
  SAVE: 'SAVE',
  UPDATE: 'UPDATE',
  FIND: 'FIND',
};

type HandleType = Record<'delete'| 'save' | 'update' | 'find', (path: string, data: any) => any> ;


export const getField = (data: any, path: string[]) => {
  const newpath = path.concat();
  try {
    let p: any;
    let v: any;
    const len = newpath.length;
    for (let i = 0; i < len; i++) {
      // 如果path不是最后一个
      if (i !== len) {
        p = newpath.slice(0, i + 1);
        v = data.getIn(p);
        if (!v) {
          // eslint-disable-next-line multiline-ternary
          data = typeof v === 'undefined'
            ? data?.mergeIn(
                  p.slice(0, p.length - 1),
                  Immutable.fromJS({
                    [p[p.length - 1]]: {},
                  }),
                )
            : data.setIn(p, {});
        }
      }
    }
  } catch (ex) {
    window.console && window.console.warn && window.console.warn(ex);
  }
  return data;
};

const getOriginData = (data: any) => {
  if (data && !isImmutable(data)) {
    return Immutable.fromJS(data);
  }
  return data;
};

const dataReducers = (
  data: any,
  action: { type: string; data: any; path: string; isImmutable?: false },
): any => {
  const path = action.path.indexOf('.') >= 0
    ? action.path.split('.')
    : Array.prototype.concat.call([], action.path);
  switch (action.type) {
    case OPERATION.DELETE:
      return data.deleteIn(path);
    case OPERATION.SAVE:
      data = getOriginData(data);
      return data.setIn(path, action.isImmutable ? Immutable.fromJS(action.data) : action.data);
    case OPERATION.UPDATE:
      data = getOriginData(data);
      if (typeof action.data === 'string' && action.path) {
        return data.setIn(path, action.data);
      }
      action.data = Immutable.fromJS(action.data);
      return action.path
        ? data.mergeIn(path, action.data)
        : data.mergeDeep(action.data);
    case OPERATION.FIND:
      return data.getIn(path);
    default:
      return data;
  }
};

/**
 * Create a container with `defaultValue`
 */
const Container: FC<ContainerProps<any>> = ({ DataContext, initData, children }) => {
  const reducers = useCallback(() => dataReducers, []);

  const [store, dispatch] = useReducer(reducers(), initData);

  const handle: HandleType = useMemo(() => ({
    delete: (path: string, data: any) => {
      dispatch({ type: OPERATION.DELETE, data, path });
    },
    save: (path: string, data: any) => {
      dispatch({ type: OPERATION.SAVE, data, path });
    },
    update: (path: string, data: any) => {
      dispatch({ type: OPERATION.UPDATE, data, path });
    },
    find: (path: string, data: any) => {
      dispatch({ type: OPERATION.FIND, data, path });
    },
  }), [dispatch]);

  return (
    useMemo(() => (
      <DataContext.Provider value={{ store, handle, dispatch }}>
        {children}
      </DataContext.Provider>
    ), [children, handle, store])
  );
};

export default Container;

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
