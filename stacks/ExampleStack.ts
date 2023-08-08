import { Bucket, Job, StackContext, Function } from "sst/constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as dotenv from "dotenv";
dotenv.config();

export function ExampleStack({ stack }: StackContext) {
  // Create a new bucket
  const bucket = new Bucket(stack, "Bucket", {
    notifications: {
      resize: {
        function: {
          // runtime: "nodejs18.x",
          runtime: "container",
          timeout: 30,
          memorySize: 3008,
          // handler: "packages/functions/src/lambda.main",
          // handler: "packages/functions/src/job.crop",
          handler: "./packages/functions",
          // nodejs: {
          //   esbuild: {
          //     // external: ["fluent-ffmpeg"],
          //   },
          // },
          // layers: [
          //   new lambda.LayerVersion(stack, "FfmpegLayer", {
          //     code: lambda.Code.fromAsset("layer/ffmpeg"),
          //   }),
          // ],
        },
        events: ["object_created"],
      },
    },
  });


  bucket.attachPermissions([bucket]);

  // Show the endpoint in the output
  stack.addOutputs({
    BucketName: bucket.bucketName,
  });
}
