import { PhotoCamera } from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
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
  onSuccess: () => void;
  onCancel?: () => void;
  item?: ProjectItem;
  action?: string;
}

export const ImageForm: FC<Props> = ({ item, onSuccess, onCancel, action }) => {
  const [images, setImages] = useState<ImageListType>([]);
  const fetcher = useFetcher<ProjectItem>();

  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (fetcher.type === 'done' && fetcher.data) {
      formRef.current?.reset();
      setImages([]);
      onSuccess();
    }
  }, [fetcher.data, fetcher.type, onSuccess]);

  return (
    <fetcher.Form
      className="flex flex-col gap-3 w-full h-full"
      ref={formRef}
      onSubmit={(e) => {
        e.preventDefault();

        const formData = new FormData(formRef.current!);

        const [image] = images;

        if (!item && !image) {
          alert('Image is required');
          return;
        }

        if (image?.file) {
          formData.set('image', image.file);
        }

        fetcher.submit(formData, {
          action,
          method: item ? 'put' : 'post',
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
          const list = imageList.length
            ? imageList
            : item
            ? [{ data_url: item.value }]
            : [];

          return (
            <div className="flex flex-col gap-3">
              <Box
                sx={{
                  display: 'grid',
                  gap: 1,
                  gridTemplateRows: 200,
                  gridTemplateAreas: list.length
                    ? '"upload image"'
                    : '"upload"',
                  gridTemplateColumns: list.length ? '1fr 2fr' : '1fr',
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
                {list.map((image) => (
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

      <CommonItemFields item={item} />

      <div className="flex gap-2 justify-end">
        <Button type="button" onClick={onCancel}>
          Cancel
        </Button>
        <LoadingButton
          type="submit"
          variant="contained"
          loading={fetcher.type === 'actionSubmission'}
        >
          {item ? 'Update slide' : 'Add slide'}
        </LoadingButton>
      </div>
    </fetcher.Form>
  );
};
