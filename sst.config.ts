import { SSTConfig } from "sst";
import { ExampleStack } from "./stacks/ExampleStack";
import dotenv from 'dotenv'
dotenv.config()

export default {
  config(_input) {
    return {
      name: 'ffmpeg',
      region: process.env.AWS_REGION as string,
    };
  },
  stacks(app) {
    app.stack(ExampleStack);
  }
} satisfies SSTConfig;
