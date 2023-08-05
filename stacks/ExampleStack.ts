import { Bucket, StackContext } from "sst/constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as dotenv from "dotenv";
dotenv.config()

export function ExampleStack({ stack }: StackContext) {
  // Create a new bucket
  const bucket = new Bucket(stack, "Bucket", {
    notifications: {
      resize: {
        function: {
          runtime: 'nodejs18.x',
          timeout: 300,
          handler: "packages/functions/src/resize.main",
          nodejs: {
            esbuild: {
              // external: ["fluent-ffmpeg"],
            },
          },
          layers: [
            new lambda.LayerVersion(stack, "FfmpegLayer", {
              code: lambda.Code.fromAsset("layer/ffmpeg"),
            }),
          ],
        },
        events: ["object_created"],
      },
    },
  });

  // Allow the notification functions to access the bucket
  bucket.attachPermissions([bucket]);

  // Show the endpoint in the output
  stack.addOutputs({
    BucketName: bucket.bucketName,
  });
}
