import { S3 } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import type { UploadHandler } from '@remix-run/node';
import { writeAsyncIterableToWritable } from '@remix-run/node';
import cuid from 'cuid';
import { PassThrough } from 'stream';
import { z } from 'zod';

export const uploadHandler: UploadHandler = async ({ data, filename }) => {
  if (!filename) {
    // This is regular, non-file fields which were passed along with files

    let result = '';

    for await (const chunk of data) {
      result += Buffer.from(chunk).toString('utf8');
    }

    return result;
  }

  const stream = new PassThrough();

  const { accessKeyId, secretAccessKey, bucket, region } = z
    .object({
      region: z.string(),
      bucket: z.string(),
      accessKeyId: z.string(),
      secretAccessKey: z.string(),
    })
    .parse({
      region: process.env.AWS_REGION,
      bucket: process.env.AWS_BUCKET,
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_ID,
    });

  const name = `${cuid()}.${filename}`;

  const upload = new Upload({
    client: new S3({
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    }),
    params: {
      Bucket: bucket,
      Key: name,
      Body: stream,
      ACL: 'public-read',
    },
  });

  await Promise.all([
    writeAsyncIterableToWritable(data, stream),
    upload.done(),
  ]);

  return getObjectUrl({
    filename: name,
    bucket,
    region,
  });
};

function getObjectUrl({
  filename,
  bucket,
  region,
}: {
  filename: string;
  region: string;
  bucket: string;
}) {
  return `https://s3.${region}.amazonaws.com/${bucket}/${filename}`;
}
