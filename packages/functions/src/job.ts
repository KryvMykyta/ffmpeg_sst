import { S3Event } from "aws-lambda";
import { JobHandler } from "sst/node/job";
import fs, { readFileSync, unlinkSync, writeFileSync } from "fs";
import ChildProcess, { spawnSync } from "child_process";
import AWS from "aws-sdk";
import stream, { Writable } from "stream";
import assert from "assert";

// declare module "sst/node/job" {
//   export interface JobTypes {
//     CropJob: { event: S3Event };
//     MyJob: { title: string };
//   }
// }

const prefix = `resized`;
const S3 = new AWS.S3();

const cropUtil = async (input: string, outStream: Writable, format = "mp4") => {
  const cmd = "/opt/ffmpeg";
  const cmdArgs = [
    "-i",
    `${input}`,
    "-v",
    "error",
    "-f",
    format,
    "-movflags",
    "frag_keyframe+empty_moov",
    "-vf",
    `crop=w='min(iw\\,ih)':h='min(iw\\,ih)'`,
    "-",
  ];

  const proc = ChildProcess.spawn(cmd, cmdArgs, { cwd: process.cwd() });

  proc.stdout.pipe(outStream);

  proc.stderr.on("data", (data) => {
    assert(false, "Not sure what you want with stderr");
  });

  proc.on("close", (code) => {
    outStream.end();
    console.log("Child exited with", code, "and stdout has been saved");
    // at this point 'savedOutput' contains all your data.
  });
};

export const crop = async (event: S3Event) => {
  try {
    const s3Record = event.Records[0].s3;
    const Key = s3Record.object.key;
    const format = Key.split(".").pop();
    const Bucket = s3Record.bucket.name;
    if (Key.startsWith(prefix)) {
      return;
    }
    if (format !== "mkv" && format !== "avi" && format !== "mp4") {
      return;
    }

    const inputFile = await S3.getSignedUrl("getObject", {
      Bucket,
      Key,
      Expires: 1500,
    });

    const bucketStream = new stream.PassThrough();
    const newKey = `${prefix}-${Key}`;

    await cropUtil(inputFile, bucketStream);

    await S3.upload({ Bucket, Key: newKey, Body: bucketStream }).promise();

    return;
  } catch (e) {
    console.error(e);
  }
};
