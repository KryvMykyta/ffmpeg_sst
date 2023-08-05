import AWS from "aws-sdk";
import fs, { readFileSync, unlinkSync, writeFileSync } from "fs";
import { spawnSync } from "child_process";
import * as dotenv from "dotenv";
dotenv.config();

const width = 100;
const prefix = `resized`;

const S3 = new AWS.S3();

type BucketKey = {
  Bucket: string;
  Key: string;
};

// Read stream for downloading from S3
async function readStreamFromS3(BucketKey: BucketKey) {
  return await S3.getObject(BucketKey).promise();
}

import { S3Handler } from "aws-lambda";

export const main: S3Handler = async (event) => {
  const s3Record = event.Records[0].s3;

  // Grab the filename and bucket name
  const Key = s3Record.object.key;
  const Bucket = s3Record.bucket.name;

  // Check if the file has already been resized
  if (Key.startsWith(prefix)) {
    return;
  }

  if (!Key.endsWith(".mp4")) {
    return;
  }

  // Stream to read the file from the bucket
  const s3object = await readStreamFromS3({ Key, Bucket });

  const newKey = `${prefix}-${Key}`;

  writeFileSync(`/tmp/${Key}`, s3object.Body as Buffer);

  spawnSync(
    "/opt/ffmpeg",
    [
      "-i",
      `/tmp/${Key}`,
      "-filter:v",
      "crop=in_w:in_w",
      `/tmp/${newKey}`,
    ],
    { stdio: "inherit" }
  );

  const resizedVideo = readFileSync(`/tmp/${newKey}`);

  unlinkSync(`/tmp/${newKey}`);
  unlinkSync(`/tmp/${Key}`);

  await S3.upload({
    Key: newKey,
    Bucket: Bucket,
    Body: resizedVideo,
  }).promise();

  return;
};
