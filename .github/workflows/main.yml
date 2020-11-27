name: UNIT-TESTS-CI

on:
  workflow_dispatch:
  push:
    branches:
      - master
      - develop
  pull_request:
    branches:
      - master
      - develop
    types: [opened, synchronize, reopened]

env:
  AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
  AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
  AWS_REGION: ap-southeast-2
  AWS_USER_ID: ${{ secrets.AWS_ACCESS_USER_ID }}

jobs:
  UnitTests:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout source
        uses: actions/checkout@v2
        with:
          fetch-depth: 0

      - name: ECR login
        uses: aws-actions/amazon-ecr-login@v1

      - name: Docker pull
        run: |
          docker pull ${{ env.AWS_USER_ID }}.dkr.ecr.ap-southeast-2.amazonaws.com/practera/app-v2-unit-test:HeadlessChrome-85
          docker tag ${{ env.AWS_USER_ID }}.dkr.ecr.ap-southeast-2.amazonaws.com/practera/app-v2-unit-test:HeadlessChrome-85 practera/app-v2-unit-test:HeadlessChrome-85
          test -f src/environments/environment.ts && echo "environment here" || cp src/environments/environment.local.ts src/environments/environment.ts

      - name: Unit tests
        uses: ./.github/actions/unit-tests-build