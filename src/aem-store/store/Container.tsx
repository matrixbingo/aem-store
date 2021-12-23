import React, { FC, useCallback, useMemo, useReducer } from 'react';
import Immutable, { Collection, isImmutable } from 'immutable';
import { initParam, initPath, isSimpleType } from './util';
import { ContainerProps, HandleType, OPERATION } from '../types/type';

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
  data = initImmutableData(data);
  if (path.length > 0) {
    if (isSimpleType(value)) {
      return data.setIn(path, value);
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
