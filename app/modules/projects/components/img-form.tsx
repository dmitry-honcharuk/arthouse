import { PhotoCamera } from '@mui/icons-material';
import { Box, Button, Typography } from '@mui/material';
import type { ProjectItem } from '@prisma/client';
import { ProjectItemType } from '@prisma/client';
import { useFetcher } from '@remix-run/react';
import type { FC } from 'react';
import { useEffect, useRef, useState } from 'react';
import type { ImageListType } from 'react-images-uploading';
import ImageUploading from 'react-images-uploading';
import { CommonItemFields } from './common-item-fields';

interface Props {
  onSuccess: (item: ProjectItem) => void;
}

export const ImageForm: FC<Props> = ({ onSuccess }) => {
  const [images, setImages] = useState<ImageListType>([]);
  const fetcher = useFetcher<ProjectItem>();

  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (fetcher.type === 'done' && fetcher.data) {
      formRef.current?.reset();
      setImages([]);
      onSuccess(fetcher.data);
    }
  }, [fetcher.data, fetcher.type, onSuccess]);

  return (
    <fetcher.Form
      method="post"
      className="flex flex-col gap-3 w-full h-full"
      ref={formRef}
      encType="multipart/form-data"
      onSubmit={(e) => {
        e.preventDefault();

        const formData = new FormData(formRef.current!);

        if (!images[0]) {
          alert('Image is required');
          return;
        }

        formData.set('image', images[0].file!);

        fetcher.submit(formData, {
          method: 'post',
          encType: 'multipart/form-data',
        });
      }}
    >
      <input type="hidden" name="type" value={ProjectItemType.IMAGE} />
      <ImageUploading
        onChange={(imageList) => {
          setImages(imageList);
        }}
        value={images}
        dataURLKey="data_url"
      >
        {({ imageList, onImageUpload, isDragging, dragProps }) => {
          return (
            <div className="flex flex-col gap-3">
              <Box
                sx={{
                  display: 'grid',
                  gap: 1,
                  gridTemplateRows: 200,
                  gridTemplateAreas: imageList.length
                    ? '"upload image"'
                    : '"upload"',
                  gridTemplateColumns: imageList.length ? '1fr 2fr' : '1fr',
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
                {imageList.map((image) => (
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
                ))}
              </Box>
            </div>
          );
        }}
      </ImageUploading>

      <CommonItemFields />

      <Button type="submit" variant="contained" className="self-end">
        Add image
      </Button>
    </fetcher.Form>
  );
};
