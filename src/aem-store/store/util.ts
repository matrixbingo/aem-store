import Immutable from 'immutable';

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
          data =
            typeof v === 'undefined'
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

export const initPath = (path = ''): string[] => {
  if (path && path.length > 0) {
    return path?.indexOf('.') >= 0
      ? path.split('.')
      : Array.prototype.concat.call([], path);
  }
  return [];
};

export function initParam(
  _path: string | any,
  _data?: any,
): { path: string; data: any } {
  if (arguments.length > 2) {
    throw new Error('initParam: arguments error');
  }
  if (arguments.length === 1) {
    return { path: '', data: _data };
  }
  if (arguments.length === 2) {
    return { path: _path, data: _data };
  }
  return { path: _path, data: _data };
}

/**
 * @param obj
 * @returns number,string,boolean,undefined,object,function,symbol
 */
export const getType = (obj: any): string => {
  const type = typeof obj;
  if (type != 'object') {
    return type;
  }
  return Object.prototype.toString
    .call(obj)
    .replace(/^\[object (\S+)\]$/, '$1');
};

export const isSimpleType = (key: any): boolean => {
  const type = getType(key);
  return type === 'string' || type === 'number' || type === 'boolean';
};
