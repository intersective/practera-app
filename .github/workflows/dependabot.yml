################################################
#  GITHUB ACTION WORKFLOW NAME
################################################
name: Github Action for Dependabot - Automerge


################################################
#  GITHUB ACTION EVENT TRIGGER
################################################    
# on: pull_request_target
on: 
  workflow_dispatch:
  
# Caution: This workflow enables write permission to Dependabot PR  
permissions:
  pull-requests: write
  contents: write

################################################
#  GITHUB ACTION JOBS
################################################
jobs:
  dependabot:
    name: dependabot
    runs-on: ubuntu-latest
    timeout-minutes: 15


################################################
#  GITHUB ACTIONS GLOBAL ENV VARIABLES  
################################################
    env:
      STACK_NAME: global-stage
      ROOTSTACK: app-v2
      STATUSREPORTS3Bucket: deployment-status.practera.com
      STATUS: DEPLOYED
      REQUESTOR: DEPENDABOT
      REASON: Security_MEASURES
      ENDPOINT: NA
      BRANCH_TAG_NAME: trunk



################################################
#  GITHUB ACTOR ALLOWED - DEPENDABOT
################################################
    if: ${{ github.actor == 'dependabot[bot]' }}
    steps:


################################################
#  DEPENDABOT METADATA
################################################    
      - name: Retrieve Dependabot metadata
        id: check-metadata
        uses: dependabot/fetch-metadata@v1.1.1
        with:
          github-token: "${{ secrets.GITHUB_TOKEN }}"
      

################################################
#  PR APPROVAL
################################################
      - name: PR Auto Approval if PR submitted by Dependabot Alert only 
        run: gh pr review --approve "$PR_URL"
        env:
          PR_URL: ${{ github.event.pull_request.html_url }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}


################################################
#  PR Auto-Merge 
################################################
      - name: Perform auto-merge for PRs submitted by Dependabot
        if: ${{ steps.check-metadata.outputs.update-type != 'version-update:semver-major' }}
        run: gh pr merge --auto --squash "$PR_URL"
        env:
          PR_URL: ${{ github.event.pull_request.html_url }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}


################################################
#  AWS CLI CONFIGURATION - DEVOPS 
################################################ 
      - name: Configure AWS credentials from $STACK_NAME account in $REGION region
        uses: aws-actions/configure-aws-credentials@v1
        with:
          aws-access-key-id: ${{ secrets.DEVOPS_AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.DEVOPS_AWS_SECRET_ACCESS_KEY }}
          aws-region: ap-southeast-2


# ##########################################################
# #  SLACK NOTIFICATION
# ##########################################################  
      - name: Slack Notification
        if: ${{ success() }} # Pick up events even if the job fails or is canceled.
        uses: 8398a7/action-slack@v3
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
          MATRIX_CONTEXT: ${{ toJson(matrix) }} # required
        with:
          status: ${{ job.status }}
          author_name: DEPENDABOT PR SUBMIT success for ${{env.ROOTSTACK}}
          mention: 'here'
          if_mention: failure,cancelled
          job_name: dependabot # Match the name above.
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



# ################################################
# #  STATUS VARIABLE UPDATE
# ################################################ 
      - name: Deployment status variable update
        if: ${{ failure() }}
        run: |
          echo "STATUS=FAILURE" >> $GITHUB_ENV



# ##########################################################
# #  SLACK NOTIFICATION
# ##########################################################  
      - name: Slack Notification
        if: ${{ failure() }} # Pick up events even if the job fails or is canceled.
        uses: 8398a7/action-slack@v3
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
          MATRIX_CONTEXT: ${{ toJson(matrix) }} # required
        with:
          status: ${{ job.status }}
          author_name: DEPENDABOT PR SUBMIT failed for ${{env.ROOTSTACK}}
          mention: 'here'
          if_mention: failure,cancelled
          job_name: dependabot # Match the name above.
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

# ################################################
# #  DEVOPS-DEPLOYMENT REPORT
# ################################################ 
      - name: DevOps Deployment Reporting
        if: always()
        run: |
          pip install --upgrade pip
          pip install --upgrade csvtotable
          export REQUESTOR=${{ github.actor }}

          aws s3 cp s3://$STATUSREPORTS3Bucket/deploy-reporting.sh deploy-reporting.sh
          chmod +x deploy-reporting.sh && ./deploy-reporting.sh
