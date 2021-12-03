import React, { FC, useCallback, useMemo, useReducer } from 'react';
import Immutable, { Collection, isImmutable } from 'immutable';
import { initParam, initPath, isSimpleType } from './util';

export type ImmutableType = Collection<unknown, unknown>;

type HandleType = Record<
  'delete' | 'save' | 'update' | 'merge' | 'find',
  (path: string | any, data?: any) => any
>;

export interface ContextType {
  store: ImmutableType;
  handle: HandleType;
  dispatch: React.Dispatch<{
    type: string;
    data: any;
    path: string;
  }>;
}

interface ContainerProps<T extends Record<string, unknown>>
  extends React.HTMLAttributes<HTMLElement> {
  DataContext: React.Context<ContextType>;
  initData: any;
  children: React.ReactNode;
}

const OPERATION = {
  DELETE: 'DELETE',
  SAVE: 'SAVE',
  UPDATE: 'UPDATE',
  MERGE: 'MERGE',
  FIND: 'FIND',
};

const initImmutableData = (data: any) => {
  if (data && !isImmutable(data)) {
    return Immutable.fromJS(data);
  }
  return data;
};

/**
 * ex1: path: 'editor.visible', value: ture
 * ex2: path: null, value: {'editor.visible', true, 'editor.name': 'tom'}
 */
const save = (data: any, path: string[] = [], value: any) => {
  if (path.length > 0) {
    if (isSimpleType(value)) {
      return initImmutableData(data).setIn(path, value);
    }
    return data.setIn(path, initImmutableData(value));
  }
  return Object.keys(value).reduce(
    (acc, key) => acc.setIn(initPath(key), initImmutableData(value[key])),
    data,
  );
};

const update = (data: any, path: string[] = [], value: any) => {
  data = initImmutableData(data);
  if (isSimpleType(value)) {
    return save(data, path, value);
  }
  value = Immutable.fromJS(value);
  return path.length > 0
    ? data.mergeDeepIn(path, value)
    : data.mergeDeep(value);
};

const merge = (data: any, path: string[] = [], value: any) => {
  data = initImmutableData(data);
  if (isSimpleType(value)) {
    return save(data, path, value);
  }
  value = Immutable.fromJS(value);
  return path.length > 0 ? data.mergeIn(path, value) : data.merge(value);
};

const dataReducers = (
  data: any,
  action: { type: string; data: any; path?: string },
): any => {
  const path = initPath(action.path);
  switch (action.type) {
    case OPERATION.DELETE:
      return data.deleteIn(path);
    case OPERATION.SAVE:
      return save(data, path, action.data);
    case OPERATION.UPDATE:
      return update(data, path, action.data);
    case OPERATION.MERGE:
      return merge(data, path, action.data);
    case OPERATION.FIND:
      return data.getIn(path);
    default:
      return data;
  }
};

/**
 * Create a container with `defaultValue`
 */
const Container: FC<ContainerProps<any>> = ({
  DataContext,
  initData,
  children,
}) => {
  const reducers = useCallback(() => dataReducers, []);

  const [store, dispatch] = useReducer(reducers(), initData);

  const handle: HandleType = useMemo(
    () => ({
      delete: (path, data) =>
        dispatch({ type: OPERATION.DELETE, ...initParam(path, data) }),

      save: (path, data) =>
        dispatch({ type: OPERATION.SAVE, ...initParam(path, data) }),

      update: (path, data) =>
        dispatch({ type: OPERATION.UPDATE, ...initParam(path, data) }),

      merge: (path, data) =>
        dispatch({ type: OPERATION.MERGE, ...initParam(path, data) }),

      find: (path, data) =>
        dispatch({ type: OPERATION.FIND, ...initParam(path, data) }),
    }),
    [dispatch],
  );

  return useMemo(
    () => (
      <DataContext.Provider value={{ store, handle, dispatch }}>
        {children}
      </DataContext.Provider>
    ),
    [children, handle, store],
  );
};

export default Container;
