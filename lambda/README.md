### Description

This directory will hold `lambda@edge` functions.

`forwarder` - lambda function that sits infront of the CDN, handles `globalization` redirection.
`versioner` - function to create lambda function version.

### Deployment

Once `AWS` credentials is ready, just run `deploy.sh`. Make sure you installed [sam](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html) on your machine.