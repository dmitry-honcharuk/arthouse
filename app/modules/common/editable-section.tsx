import type { FC, ReactNode } from 'react';
import { useState } from 'react';

type Props = {
  children: (options: {
    isEdit: boolean;
    enableEditMode: () => void;
    disableEditMode: () => void;
  }) => ReactNode;
};
export const EditableSection: FC<Props> = ({ children }) => {
  const [isEdit, setIsEdit] = useState(false);

  return (
    <>
      {children({
        isEdit,
        enableEditMode: () => setIsEdit(true),
        disableEditMode: () => setIsEdit(false),
      })}
    </>
  );
};
