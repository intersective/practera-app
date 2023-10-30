################################################
#  GITHUB ACTION WORKFLOW NAME
################################################
name: Release tag validation for pull request


################################################
#  GITHUB ACTION EVENT TRIGGER
################################################
on:
  workflow_dispatch:
  pull_request:
    branches:
      - 'trunk'
    types: [opened, synchronize, reopened]


################################################
#  GITHUB ACTION JOBS
################################################
jobs:
  release-tag-validate-pr:
    name: release-tag-validate-pr
    runs-on: ubuntu-latest
    timeout-minutes: 15


################################################
#  GITHUB ACTIONS GLOBAL ENV VARIABLES  
################################################
    env:
      CFNS3BucketName: devops-cfn-templates
      PRIVATES3BucketName: devops-shared-private
      STATUSREPORTS3Bucket: deployment-status.practera.com
      VERSION_FILE: package.json



################################################
#  GITHUB REPO CHECKOUT 
################################################
    steps:
      - uses: actions/checkout@v2
        with:
          fetch-depth: 0  # Shallow clones should be disabled for a better relevancy of analysis


################################################
#  AWS CLI CONFIGURATION - DEVOPS 
################################################ 
      - name: Configure AWS credentials from $STACK_NAME account
        uses: aws-actions/configure-aws-credentials@v1
        with:
          aws-access-key-id: ${{ secrets.DEVOPS_AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.DEVOPS_AWS_SECRET_ACCESS_KEY }}
          aws-region: ap-southeast-2


################################################
#  VALIDATE NEW TAG DEFINED FOR RELEASE PROCESS
################################################ 
      - name: Validate new tag defined for release process
        run: |
          aws s3 cp s3://$STATUSREPORTS3Bucket/scripts/validate-tag-creation.sh validate-tag-creation.sh
          chmod +x ./validate-tag-creation.sh
          ./validate-tag-creation.sh
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}



# ##########################################################
# #  SLACK NOTIFICATION FOR SUCCESS
# ##########################################################  
      - name: Slack Notification
        if: ${{ success() }} # Pick up events even if the job fails or is canceled.
        uses: 8398a7/action-slack@v3
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
          MATRIX_CONTEXT: ${{ toJson(matrix) }} # required
        with:
          status: ${{ job.status }}
          author_name: New tag calculated id ${{ env.RELEASE_TAG_VERSION }} ; package/composer.json version id ${{env.NEW_TAG_VERSION}}; git latest tag id ${{env.CURRENT_TAG_VERSION}}
          mention: 'here'
          if_mention: failure,cancelled
          job_name: release-tag-validate-pr # Match the name above.
          fields: repo,commit,eventName,ref,workflow,message,author,job,took
          custom_payload: |
            {
            username: 'GitHub Action CI WorkFlow',
            icon_emoji: ':github:',
            attachments: [{
              color: '${{ job.status }}' === 'success' ? 'good' : ${{ job.status }}' === 'failure' ? 'danger' : 'warning',
              text:
             `${process.env.AS_REPO}\n
              ${process.env.AS_COMMIT}\n
              ${process.env.AS_EVENT_NAME}\n
              @${process.env.AS_REF}\n
              @${process.env.AS_WORKFLOW}\n
              ${process.env.AS_MESSAGE}\n
              ${process.env.AS_AUTHOR}\n
              ${process.env.AS_JOB}\n
              ${process.env.AS_TOOK}`,
            }]
            }



# ##########################################################
# #  SLACK NOTIFICATION FOR FAILURE
# ##########################################################  
      - name: Slack Notification
        if: ${{ failure() }} # Pick up events even if the job fails or is canceled.
        uses: 8398a7/action-slack@v3
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
          MATRIX_CONTEXT: ${{ toJson(matrix) }} # required
        with:
          status: ${{ job.status }}
          author_name: New tag creation failed; package.json version id ${{env.NEW_TAG_VERSION}}; git latest tag id ${{env.CURRENT_TAG_VERSION}}  mismatch - ${{ env.ERR_MSG }}
          mention: 'here'
          if_mention: failure,cancelled
          job_name: release-tag-validate-pr # Match the name above.
          fields: repo,commit,eventName,ref,workflow,message,author,job,took
          custom_payload: |
            {
            username: 'GitHub Action CI WorkFlow',
            icon_emoji: ':github:',
            attachments: [{
              color: '${{ job.status }}' === 'success' ? 'good' : ${{ job.status }}' === 'failure' ? 'danger' : 'warning',
              text:
             `${process.env.AS_REPO}\n
              ${process.env.AS_COMMIT}\n
              ${process.env.AS_EVENT_NAME}\n
              @${process.env.AS_REF}\n
              @${process.env.AS_WORKFLOW}\n
              ${process.env.AS_MESSAGE}\n
              ${process.env.AS_AUTHOR}\n
              ${process.env.AS_JOB}\n
              ${process.env.AS_TOOK}`,
            }]
            }
