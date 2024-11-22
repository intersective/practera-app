#!/bin/bash

set -e

WORK_DIR="`pwd`/lambda"

cd "$WORK_DIR"/versioner
npm ci
bash deploy.sh

cd "$WORK_DIR"

cd "$WORK_DIR"/forwarder
bash deploy.sh
