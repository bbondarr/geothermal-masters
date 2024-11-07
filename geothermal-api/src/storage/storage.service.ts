import { Injectable } from '@nestjs/common';
import {
  S3Client,
  ListObjectsV2Command,
  GetObjectCommand,
  PutObjectCommandInput,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import { streamToBuffer } from 'src/helpers/helpers';
import { FilesDto } from 'src/dto/files/files.dto';
import { FileDto } from 'src/dto/files/file.dto';

@Injectable()
export class StorageService {
  private s3: S3Client;
  public bucketName: string;

  constructor() {
    this.s3 = new S3Client({
      region: process.env.AWS_REGION,
    });
    this.bucketName = process.env.AWS_BUCKET_NAME;
  }

  public async getFile(filename: string): Promise<Buffer> {
    const fileKey = filename;
    const params = {
      Bucket: this.bucketName,
      Key: fileKey,
    };

    try {
      const response = await this.s3.send(new GetObjectCommand(params));
      const bodyStream = response.Body as Readable;

      return streamToBuffer(bodyStream);
    } catch (error: any) {
      console.error(`Error downloading file from S3: ${error.message}`);
      throw new Error(`Error downloading file from S3: ${error.message}`);
    }
  }

  public uploadFiles(files: FilesDto, folderName: number) {
    const fileArr = Object.values(files);

    const promises = fileArr.map((item) => this.s3Upload(item, folderName));
    return Promise.all(promises);
  }

  public async getBucketContent() {
    const response = await this.s3.send(
      new ListObjectsV2Command({
        Bucket: this.bucketName,
      }),
    );
    const files = response.Contents ?? [];
    const lastObj = files.length ? files.at(-1) : undefined;
    return {
      files,
      lastObj,
    };
  }

  public s3Upload(file: FileDto, folderName?: number) {
    const key = folderName ? `${folderName}/${file.name}` : `${file.name}`;
    const uploadParams: PutObjectCommandInput = {
      Bucket: this.bucketName,
      Key: key,
      Body: file.buffer,
    };

    return this.s3.send(new PutObjectCommand(uploadParams));
  }
}
