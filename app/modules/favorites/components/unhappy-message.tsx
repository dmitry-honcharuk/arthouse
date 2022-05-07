import { random } from 'lodash';
import type { FC } from 'react';
import * as React from 'react';

export const UnhappyMessage: FC = () => {
  return (
    <span>
      No one marked this project as favourite yet.
      <br />
      {UNHAPPY_FACES[random(0, UNHAPPY_FACES.length - 1)]}
    </span>
  );
};

const UNHAPPY_FACES = [
  '(☞ಠ_ಠ)☞',
  '☜(ಠ_ಠ☜)',
  '(¬▂¬)',
  '(´･_･`)',
  '( ಠ ಠ )',
  'ヽ(。_°)ノ',
  '(;¬_¬)',
  '（；¬＿¬)',
  'ಠಿ_ಠ',
  '(゜-゜)',
  '(╯°Д°)╯︵/(.□ . \\)',
  '(╯°□°)╯︵ ┻━┻',
  '┻━┻︵ \\(°□°)/ ︵',
  '(┛ಠ_ಠ)┛彡┻━┻',
  '⊙︿⊙',
  '（ﾉ´д｀）',
  'ಠ ∩ ಠ',
  'ب_ب',
  'ಥ╭╮ಥ',
  '(ಠ_ಠ)',
  'ಠ_ಠ',
  '(･｀ｪ´･)つ',
  '(ง •̀_•́)ง',
  '（＞д＜）',
  '＼(｀0´)／',
  '(¬､¬)',
  '(」゜ロ゜)」',
  '(>_<)',
];
