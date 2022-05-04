import { Card, CardContent } from '@mui/material';
import { styled } from '@mui/material/styles';
import type { Dispatch, FC, ReactNode, SetStateAction } from 'react';
import { useState } from 'react';

interface RenderOptions {
  isEdit: boolean;
  setIsEdit: Dispatch<SetStateAction<boolean>>;
  toggleIsEdit: () => void;
}

export const EditableCardSection: FC<{
  renderTitle: (options: RenderOptions) => ReactNode;
  render: (options: RenderOptions) => ReactNode;
}> = ({ renderTitle, render }) => {
  const [isEdit, setIsEdit] = useState(false);

  const toggleIsEdit = () => setIsEdit((e) => !e);

  return (
    <Section>
      {renderTitle({ isEdit, toggleIsEdit, setIsEdit })}
      <Card variant="outlined">
        <CardContent>{render({ isEdit, toggleIsEdit, setIsEdit })}</CardContent>
      </Card>
    </Section>
  );
};

const Section = styled('section')(() => ({
  '&:hover .MuiButton-root': {
    visibility: 'visible',
  },
}));
