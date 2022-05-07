import { random } from 'lodash';
import type { FC } from 'react';
import * as React from 'react';

export const HappyMessage: FC<{ count: number }> = ({ count }) => {
  return (
    <span>
      {count} {count === 1 ? 'person' : 'people'} liked this project.
      <br />
      {HAPPY_FACES[random(0, HAPPY_FACES.length - 1)]}
    </span>
  );
};

const HAPPY_FACES = [
  '♥‿♥',
  '(▰˘◡˘▰)',
  '(◡‿◡✿)',
  '{´◕ ◡ ◕｀}',
  '(☞ﾟヮﾟ)☞',
  '☜(ﾟヮﾟ☜)',
  '(✿◠‿◠)',
  '( ˘ ³˘)♥',
  '(っ˘з(˘⌣˘ )',
  '(◍•ᴗ•◍)❤',
  '❤',
  '❤❤❤',
  '(-■_■)',
  '(■_■-)',
  '●_●',
  '๏_๏',
  '(︶ω︶)',
  'ヾ(ｏ･ω･)ﾉ',
];
