---
nav:
  title: 组件
  path: /components
---

## aem-ui

Demo:

```tsx

import React from 'react';
import { createContainer } from 'aem-store';

const defaultStore = {
  editor: {
    visible: false,
    loading: false,
    title: '新增',
    item: {
      id: '',
      name: '',
      list: [],
    }
  },
}

const [[ContainerUser], useUserContext, useUserStore] = createContainer(defaultStore);

const UserManager: React.FC = () => {
  return (
    <ContainerUser>
      <div>...</div>
    </ContainerUser>
  )
};

export default UserManager;

```

[更多技巧](https://d.umijs.org/guide/demo-principle)
