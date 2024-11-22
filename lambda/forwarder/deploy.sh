#!/bin/bash

set -e

: "${STACK_NAME:?Need to set STACK_NAME}"
: "${ENV:?Need to set ENV}"
: "${REGION:?Need to set REGION}"
: "${Nonce:?Need to set Nonce}"

zip -j bin/handler.zip index.js
sam deploy \
    --stack-name "$STACK_NAME-appv3-lambdaedge-app-forwarder-$ENV" \
    --s3-bucket "$STACK_NAME-lambda-edge-$ENV" \
    --s3-prefix "app-forwarder" \
    --region "$REGION" \
    --capabilities "CAPABILITY_IAM" \
    --parameter-overrides \
    StackName="$STACK_NAME" \
    Nonce="$Nonce" \
    Env="$ENV"
