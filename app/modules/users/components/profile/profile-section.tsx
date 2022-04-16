import { Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import type { Dispatch, FC, ReactNode, SetStateAction } from 'react';
import { useState } from 'react';

const Section = styled('section')(() => ({
  '&:hover .MuiButton-root': {
    visibility: 'visible',
  },
}));
export const ProfileSection: FC<{
  renderTitle: (options: {
    isEdit: boolean;
    setIsEdit: Dispatch<SetStateAction<boolean>>;
  }) => ReactNode;
  render: (options: {
    isEdit: boolean;
    setIsEdit: Dispatch<SetStateAction<boolean>>;
  }) => ReactNode;
}> = ({ renderTitle, render }) => {
  const [isEdit, setIsEdit] = useState(false);

  return (
    <Section>
      {renderTitle({ isEdit, setIsEdit })}
      <Paper sx={{ p: 2 }} variant="outlined">
        {render({ isEdit, setIsEdit })}
      </Paper>
    </Section>
  );
};
