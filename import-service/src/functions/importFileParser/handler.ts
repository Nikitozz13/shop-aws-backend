import { S3Client, CopyObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { formatJSONResponse } from '@libs/api-gateway';

const importFileParser = async (event) => {
  console.log('S3:importFileParser:event', event);

  try {
    const s3client = new S3Client({ region: process.env.AWS_REGION });

    for (const record of event.Records) {
      await s3client.send(new CopyObjectCommand({
        Bucket: process.env.S3_BUCKET,
        CopySource: process.env.S3_BUCKET + '/' + record.s3.object.key,
        Key: record.s3.object.key.replace('uploaded', 'parsed'),
      }));

      await s3client.send(new DeleteObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: record.s3.object.key,
      }));

      console.log('Parsed file ' + record.s3.object.key.split('/')[1] + ' finished');
    }

    return formatJSONResponse('ok');
  } catch (e) {
    return formatJSONResponse(e.message, 500);
  }
};

export const main = importFileParser;
