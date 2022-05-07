import { VisibilityOffOutlined, VisibilityOutlined } from '@mui/icons-material';
import {
  Alert,
  Button,
  ButtonBase,
  IconButton,
  InputAdornment,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import type { Project } from '@prisma/client';
import { Form } from '@remix-run/react';
import type { FC } from 'react';
import * as React from 'react';
import { useState } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { TogglableContent } from '~/modules/common/togglable-content';
import type { WithDecryptedProjectSecurity } from '~/modules/projects/types/with-decrypted-project-security';

export const PasswordSetting: FC<{
  project: Project & WithDecryptedProjectSecurity;
  isEdit: boolean;
  onSuccess: () => void;
}> = ({ project, isEdit, onSuccess }) => {
  const [copied, setCopied] = useState(false);

  if (isEdit) {
    return (
      <Form
        method="put"
        className="flex items-start gap-2"
        onSubmit={onSuccess}
      >
        <input type="hidden" name="fields" value="password" />

        <TogglableContent defaultValue={true}>
          {({ isEnabled: isHidden, toggle }) => (
            <TextField
              className="grow"
              fullWidth
              label="Password"
              size="small"
              variant="outlined"
              name="password"
              type={isHidden ? 'password' : 'text'}
              defaultValue={project.projectSecurity?.password}
              helperText="Password is required to access secured project"
              InputLabelProps={{
                shrink: true,
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      size="small"
                      onClick={toggle}
                      edge="end"
                    >
                      {isHidden ? (
                        <VisibilityOutlined />
                      ) : (
                        <VisibilityOffOutlined />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              autoFocus
              required
            />
          )}
        </TogglableContent>
        <Button type="submit" size="small" variant="outlined">
          Save
        </Button>
      </Form>
    );
  }

  if (!project.projectSecurity || !project.projectSecurity.password) {
    return (
      <div>
        <Typography>
          You didn't specify password for this project yet
        </Typography>
        <Typography variant="caption">
          Password is required to access secured project
        </Typography>
      </div>
    );
  }

  const { password } = project.projectSecurity;

  return (
    <>
      <span className="flex flex-col gap-1 items-start">
        <TogglableContent defaultValue={true}>
          {({ isEnabled: isHidden, toggle }) => (
            <Stack direction="row" gap={2} alignItems="center">
              <CopyToClipboard text={password} onCopy={() => setCopied(true)}>
                <ButtonBase>
                  <Typography
                    letterSpacing={2}
                    className="border border-black rounded py-1 px-2 underline"
                  >
                    {isHidden ? replaceWithStars(password) : password}
                  </Typography>
                </ButtonBase>
              </CopyToClipboard>
              <IconButton size="small" onClick={toggle}>
                {isHidden ? <VisibilityOutlined /> : <VisibilityOffOutlined />}
              </IconButton>
            </Stack>
          )}
        </TogglableContent>
        <Typography variant="caption">
          Password is required to access secured project
        </Typography>
      </span>
      <Snackbar
        open={copied}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        autoHideDuration={3000}
        onClose={() => setCopied(false)}
      >
        <Alert severity="info">Password copied to clipboard.</Alert>
      </Snackbar>
    </>
  );
};

function replaceWithStars(content: string): string {
  return Array.from({ length: content.length }).fill('*').join('');
}
