import { ExpandMore, PhotoCamera } from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Typography,
} from '@mui/material';
import type { Project } from '@prisma/client';
import { useFetcher } from '@remix-run/react';
import type { FC, FormEvent } from 'react';
import { useEffect, useState } from 'react';
import type { ImageListType } from 'react-images-uploading';
import ImageUploading from 'react-images-uploading';

export const ProjectPreviewForm: FC<{ project: Project; action: string }> = ({
  project,
  action,
}) => {
  const fetcher = useFetcher();
  const [images, setImages] = useState<ImageListType>([]);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const { data, type } = fetcher;

    if (type !== 'done') {
      return;
    }

    if (data?.preview === null) {
      setImages([]);
    }

    setExpanded(false);
  }, [fetcher]);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData();

    if (!images[0]) {
      alert('Image is required');
      return;
    }

    formData.set('fields', 'preview');
    formData.set('preview', images[0].file!);

    fetcher.submit(formData, {
      method: 'put',
      encType: 'multipart/form-data',
      action,
    });
  };

  return (
    <Accordion
      elevation={2}
      expanded={expanded}
      onChange={(_, isExpanded) => setExpanded(isExpanded)}
    >
      <AccordionSummary
        expandIcon={<ExpandMore />}
        aria-controls="panel1a-content"
        id="panel1a-header"
      >
        <Typography>Preview Image</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <fetcher.Form
          method="put"
          encType="multipart/form-data"
          className="flex flex-col gap-4"
          action={action}
          onSubmit={onSubmit}
        >
          <ImageUploading
            onChange={(imageList) => {
              setImages(imageList);
            }}
            value={images}
            dataURLKey="data_url"
            inputProps={{ name: 'preview' }}
          >
            {({
              imageList: [uploaded],
              onImageUpload,
              isDragging,
              dragProps,
            }) => {
              const image = uploaded
                ? uploaded
                : project.preview
                ? { data_url: project.preview }
                : null;

              return (
                <div className="flex flex-col gap-3">
                  <Box
                    sx={{
                      display: 'grid',
                      gap: 1,
                      gridTemplateAreas: image
                        ? '"upload" "image"'
                        : '"upload"',
                    }}
                  >
                    <Box
                      borderColor={isDragging ? 'primary.light' : undefined}
                      className="border-2 border-dashed border-gray-300 w-full h-full rounded pt-10 pb-8 flex justify-center items-center transition-colors"
                      {...dragProps}
                    >
                      <div className="flex flex-col gap-2">
                        <Button
                          onClick={onImageUpload}
                          startIcon={<PhotoCamera />}
                          variant="outlined"
                        >
                          Upload
                        </Button>
                        <Typography variant="caption">
                          or drug and drop here
                        </Typography>
                      </div>
                    </Box>
                    {image && (
                      <Box
                        key={image['data_url']}
                        component="img"
                        src={image['data_url']}
                        className="rounded"
                        sx={{
                          objectFit: 'cover',
                          height: '100%',
                          width: '100%',
                        }}
                      />
                    )}
                  </Box>
                </div>
              );
            }}
          </ImageUploading>
          <div className="flex gap-2 justify-end">
            {project.preview && (
              <Button
                type="button"
                color="secondary"
                disabled={fetcher.type === 'actionSubmission'}
                onClick={() => {
                  fetcher.submit(
                    { fields: 'preview', preview: '' },
                    {
                      method: 'put',
                      action,
                    }
                  );
                }}
              >
                Remove preview
              </Button>
            )}
            <LoadingButton
              type="submit"
              disabled={!images.length}
              variant="contained"
              loading={fetcher.type === 'actionSubmission'}
            >
              Save
            </LoadingButton>
          </div>
        </fetcher.Form>
      </AccordionDetails>
    </Accordion>
  );
};
