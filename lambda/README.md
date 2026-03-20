### Description

This directory will hold `lambda@edge` functions.

`forwarder` - lambda function that sits infront of the CDN, handles `globalization` redirection.
`versioner` - function to create lambda function version.

### Deployment

Once `AWS` credentials is ready, just run `deploy.sh` on each function.