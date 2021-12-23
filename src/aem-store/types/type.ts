import { Collection } from 'immutable';

export type ImmutableType = Collection<unknown, unknown>;

export type HandleType = Record<
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

export interface ContainerProps<T extends Record<string, unknown>>
  extends React.HTMLAttributes<HTMLElement> {
  DataContext: React.Context<ContextType>;
  initData: any;
  children: React.ReactNode;
}

export const OPERATION = {
  DELETE: 'DELETE',
  SAVE: 'SAVE',
  UPDATE: 'UPDATE',
  MERGE: 'MERGE',
  FIND: 'FIND',
};
