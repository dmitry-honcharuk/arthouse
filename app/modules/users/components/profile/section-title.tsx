import { Edit, EditOff } from '@mui/icons-material';
import { Button, Typography } from '@mui/material';
import type { Variant } from '@mui/material/styles/createTypography';
import type { FC } from 'react';

export const SectionTitle: FC<{
  isEdit?: boolean;
  onEdit?: null | (() => void);
  variant?: Variant;
}> = ({ children, variant = 'h4', onEdit, isEdit }) => {
  return (
    <div className="mb-1 relative">
      <Typography variant={variant}>{children}</Typography>
      {onEdit && (
        <div className="invisible absolute right-0 bottom-0">
          <Button
            size="small"
            color="primary"
            variant="outlined"
            onClick={onEdit}
          >
            {isEdit ? <EditOff /> : <Edit />}
          </Button>
        </div>
      )}
    </div>
  );
};
