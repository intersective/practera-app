#!/usr/bin/env bash

################################################
# Quick Deploy Script for Angular Changes
# Fast local deployment to AWS (p2-sandbox or p2-stage)
# Usage: ./quick-deploy.sh p2-sandbox [--skip-invalidation]
#
# SECURITY NOTE: This script is safe to commit to git repositories.
# - All temporary files are created OUTSIDE the git repo (in system temp directory)
# - No secrets are stored in the script
# - All sensitive files are automatically cleaned up
################################################

set -e

# Security: Create secure temporary directory for secrets OUTSIDE git repo
# mktemp creates directory in system temp (e.g., /var/folders/... or /tmp/)
# This ensures temporary files are NEVER in the git repository
TMP_DIR=$(mktemp -d -t quick-deploy-XXXXXX)
TMP_FILES=()

# Verify temp directory is NOT in git repo (safety check)
# This ensures temp files are never accidentally created in the repository
GIT_ROOT=$(git rev-parse --show-toplevel 2>/dev/null || echo "")
if [ -n "$GIT_ROOT" ] && [[ "$TMP_DIR" == "$GIT_ROOT"* ]]; then
    echo -e "${RED}ERROR: Temporary directory would be in git repo. Aborting for safety.${NC}"
    exit 1
fi
if [[ "$TMP_DIR" == "$(pwd)"* ]]; then
    echo -e "${RED}ERROR: Temporary directory would be in current directory. Aborting for safety.${NC}"
    exit 1
fi

# Security: Cleanup function to remove temporary files securely
cleanup() {
    local exit_code=$?
    # Securely remove all temporary files
    for file in "${TMP_FILES[@]}"; do
        if [ -f "$file" ]; then
            # Overwrite file with zeros before deletion (optional extra security)
            # shred -u "$file" 2>/dev/null || rm -f "$file"
            rm -f "$file"
        fi
    done
    # Remove temporary directory
    [ -d "$TMP_DIR" ] && rm -rf "$TMP_DIR"
    # Unset environment variables containing secrets
    unset CUSTOM_APPKEY
    unset CUSTOM_FILESTACK_SIGNATURE
    unset CUSTOM_FILESTACK_VIRUS_DETECTION
    unset CUSTOM_FILESTACK_KEY
    unset CUSTOM_FILESTACK_POLICY
    unset CUSTOM_STACK_UUID
    unset CUSTOM_PUSHER_APPID
    unset CUSTOM_PUSHERKEY
    unset CUSTOM_PUSHER_SECRET
    unset CUSTOM_PUSHER_CLUSTER
    unset CUSTOM_INTERCOM
    exit $exit_code
}

# Security: Trap signals to ensure cleanup on exit/interrupt
trap cleanup EXIT INT TERM

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if AWS profile is provided
if [ -z "$1" ]; then
    echo -e "${RED}Error: AWS profile is required${NC}"
    echo "Usage: $0 <aws-profile> [--skip-invalidation]"
    echo "Example: $0 p2-sandbox"
    echo "Example: $0 p2-stage --skip-invalidation"
    exit 1
fi

AWS_PROFILE=$1
SKIP_INVALIDATION=false

# Check for skip invalidation flag
if [ "$2" == "--skip-invalidation" ]; then
    SKIP_INVALIDATION=true
fi

# Map profile to environment configuration
case $AWS_PROFILE in
    p2-sandbox)
        STACK_NAME="p2-sandbox"
        ENV="dev"
        REGION="ap-southeast-2"
        PUBLICZONENAME="p2-sandbox.practera.com"
        BUILD_CONFIG="custom"
        CUSTOM_PATH_IMAGE="/appv3/dev/images/"
        CUSTOM_PATH_VIDEO="/appv3/dev/videos/"
        CUSTOM_JS_ENVIRONEMENT="dev"
        CUSTOMPLAIN_SKIPGLOBALLOGINFLAG="true"
        CUSTOM_BADGE_PROJECT_URL="https://badge.p2-sandbox.practera.com"
        ;;
    p2-stage)
        STACK_NAME="p2-stage"
        ENV="test"
        REGION="ap-southeast-2"
        PUBLICZONENAME="p2-stage.practera.com"
        BUILD_CONFIG="stage"
        CUSTOM_PATH_IMAGE="/appv3/test/images/"
        CUSTOM_PATH_VIDEO="/appv3/test/videos/"
        CUSTOM_JS_ENVIRONEMENT="test"
        CUSTOMPLAIN_SKIPGLOBALLOGINFLAG="false"
        CUSTOM_BADGE_PROJECT_URL="https://badge.p2-stage.practera.com"
        CUSTOM_UPLOAD_MAX_FILE_SIZE="2147483648"
        CUSTOM_ENABLE_ASSESSMENT_PAGINATION="true"
        CUSTOM_HELPLINE="programs@practera.com"
        CUSTOM_STACK_NAME="$STACK_NAME"
        ;;
    *)
        echo -e "${RED}Error: Unknown AWS profile '$AWS_PROFILE'${NC}"
        echo "Supported profiles: p2-sandbox, p2-stage"
        exit 1
        ;;
esac

# Export AWS profile
export AWS_PROFILE=$AWS_PROFILE

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Quick Deploy - Angular Fast Deployment${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "Profile: ${GREEN}$AWS_PROFILE${NC}"
echo -e "Environment: ${GREEN}$STACK_NAME ($ENV)${NC}"
echo -e "Region: ${GREEN}$REGION${NC}"
echo ""

# Check and handle AWS SSO login
echo -e "${YELLOW}[1/7]${NC} Checking AWS SSO session..."
if ! aws sts get-caller-identity --profile $AWS_PROFILE > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠${NC} AWS SSO session not found or expired"
    echo -e "${BLUE}Attempting to login to AWS SSO...${NC}"
    echo ""
    
    # Check if profile uses SSO
    if aws configure get sso_start_url --profile $AWS_PROFILE > /dev/null 2>&1; then
        echo -e "${BLUE}Running: aws sso login --profile $AWS_PROFILE${NC}"
        echo -e "${YELLOW}Please complete the SSO login in your browser...${NC}"
        echo ""
        
        if aws sso login --profile $AWS_PROFILE; then
            echo -e "${GREEN}✓${NC} AWS SSO login successful"
            echo ""
        else
            echo -e "${RED}Error: AWS SSO login failed${NC}"
            echo "Please run manually: aws sso login --profile $AWS_PROFILE"
            exit 1
        fi
    else
        echo -e "${YELLOW}⚠${NC} Profile doesn't appear to use SSO, checking regular credentials..."
        # Try one more time in case it was a temporary issue
        sleep 1
        if ! aws sts get-caller-identity --profile $AWS_PROFILE > /dev/null 2>&1; then
            echo -e "${RED}Error: Failed to authenticate with AWS profile '$AWS_PROFILE'${NC}"
            echo ""
            echo "If this profile uses SSO, run:"
            echo "  aws sso login --profile $AWS_PROFILE"
            echo ""
            echo "If this profile uses regular credentials, configure them with:"
            echo "  aws configure --profile $AWS_PROFILE"
            exit 1
        fi
    fi
else
    echo -e "${GREEN}✓${NC} AWS SSO session is valid"
fi

# Verify AWS credentials one more time
echo -e "${BLUE}Verifying AWS credentials...${NC}"
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --profile $AWS_PROFILE --query Account --output text 2>/dev/null)
if [ -z "$AWS_ACCOUNT_ID" ]; then
    echo -e "${RED}Error: Failed to verify AWS credentials${NC}"
    exit 1
fi
echo -e "${GREEN}✓${NC} AWS credentials verified (Account: $AWS_ACCOUNT_ID)"
echo ""

# Check if node_modules exists (quick check)
if [ ! -d "node_modules" ] || [ ! -f "node_modules/.bin/ng" ]; then
    echo -e "${YELLOW}[2/7]${NC} Installing dependencies..."
    npm install --silent
else
    echo -e "${YELLOW}[2/7]${NC} Dependencies already installed (skipping)"
fi
echo ""

# Fetch secrets from AWS Secrets Manager (parallelized for faster execution)
echo -e "${YELLOW}[3/7]${NC} Fetching secrets from AWS Secrets Manager (parallel)..."
# Security: Create secure temporary files with restricted permissions (600 = owner read/write only)
SECRET_APPKEY_FILE="$TMP_DIR/secret-appkey.json"
SECRET_FILESTACK_FILE="$TMP_DIR/secret-filestack.json"
SECRET_LOGINCORE_FILE="$TMP_DIR/secret-logincore.json"
SECRET_PUSHER_FILE="$TMP_DIR/secret-pusher.json"
SECRET_INTERCOM_FILE="$TMP_DIR/secret-intercom.json"

# Track files for cleanup
TMP_FILES+=("$SECRET_APPKEY_FILE" "$SECRET_FILESTACK_FILE" "$SECRET_LOGINCORE_FILE" "$SECRET_PUSHER_FILE" "$SECRET_INTERCOM_FILE")

# Fetch secrets in parallel for faster execution
(
  aws secretsmanager get-secret-value --secret-id $STACK_NAME-AppKeySecret-$ENV --profile $AWS_PROFILE --region $REGION > "$SECRET_APPKEY_FILE" &
  aws secretsmanager get-secret-value --secret-id $STACK_NAME-FilestackSecret-$ENV --profile $AWS_PROFILE --region $REGION > "$SECRET_FILESTACK_FILE" &
  aws secretsmanager get-secret-value --secret-id $STACK_NAME-LoginCoreSecrets-$ENV --profile $AWS_PROFILE --region $REGION > "$SECRET_LOGINCORE_FILE" &
  aws secretsmanager get-secret-value --secret-id $STACK_NAME-PusherSecret-$ENV --profile $AWS_PROFILE --region $REGION > "$SECRET_PUSHER_FILE" &
  aws secretsmanager get-secret-value --secret-id $STACK_NAME-IntercomSecret-$ENV --profile $AWS_PROFILE --region $REGION > "$SECRET_INTERCOM_FILE" &
  wait
)

# Security: Set restrictive permissions on temporary files (600 = owner read/write only)
chmod 600 "$SECRET_APPKEY_FILE" "$SECRET_FILESTACK_FILE" "$SECRET_LOGINCORE_FILE" "$SECRET_PUSHER_FILE" "$SECRET_INTERCOM_FILE" 2>/dev/null || true

# Extract values from fetched secrets
export CUSTOM_APPKEY=$(jq --raw-output '.SecretString' "$SECRET_APPKEY_FILE" | jq -r .appkey)
export CUSTOM_FILESTACK_SIGNATURE=$(jq --raw-output '.SecretString' "$SECRET_FILESTACK_FILE" | jq -r .signature)
export CUSTOM_FILESTACK_VIRUS_DETECTION=$(jq --raw-output '.SecretString' "$SECRET_FILESTACK_FILE" | jq -r .virusdetection)
export CUSTOM_FILESTACK_KEY=$(jq --raw-output '.SecretString' "$SECRET_FILESTACK_FILE" | jq -r .apikey)
export CUSTOM_FILESTACK_POLICY=$(jq --raw-output '.SecretString' "$SECRET_FILESTACK_FILE" | jq -r .policy)
export CUSTOM_STACK_UUID=$(jq --raw-output '.SecretString' "$SECRET_LOGINCORE_FILE" | jq -r .APP_STACK_UUID)
export CUSTOM_PUSHER_APPID=$(jq --raw-output '.SecretString' "$SECRET_PUSHER_FILE" | jq -r .app_id)
export CUSTOM_PUSHERKEY=$(jq --raw-output '.SecretString' "$SECRET_PUSHER_FILE" | jq -r .key)
export CUSTOM_PUSHER_SECRET=$(jq --raw-output '.SecretString' "$SECRET_PUSHER_FILE" | jq -r .secret)
export CUSTOM_PUSHER_CLUSTER=$(jq --raw-output '.SecretString' "$SECRET_PUSHER_FILE" | jq -r .cluster)
export CUSTOM_INTERCOM=$(jq --raw-output '.SecretString' "$SECRET_INTERCOM_FILE" | jq -r .app_id)

# Security: Immediately remove secret files after extraction (cleanup will also handle this)
rm -f "$SECRET_APPKEY_FILE" "$SECRET_FILESTACK_FILE" "$SECRET_LOGINCORE_FILE" "$SECRET_PUSHER_FILE" "$SECRET_INTERCOM_FILE"

# Set environment-specific variables
export CUSTOM_GRAPH_QL="https://core-graphql-api.$PUBLICZONENAME"
export CUSTOM_API_ENDPOINT="https://admin.$PUBLICZONENAME/"
export CUSTOM_S3_BUCKET="files.$PUBLICZONENAME"
export CUSTOM_ENVIRONMENT="$ENV"
export CUSTOM_CHAT_GRAPH_QL="https://chat-api.$PUBLICZONENAME"
export CUSTOM_GLOBAL_LOGIN_URL="https://app.login-stage.practera.com"
export CUSTOM_COUNTRY="AUS"
export CUSTOM_PATH_ANY="/appv3/$ENV/any/"
export CUSTOM_AWS_REGION="$REGION"
export CUSTOM_LOGIN_API_URL="https://api.login-stage.practera.com"
export CUSTOM_NEWRELIC="true"
export CUSTOM_PORTAL_ID="3404872"
export CUSTOM_FORM_ID="114bee73-67ac-4f23-8285-2b67e0e28df4"
export CUSTOM_LIVE_SERVER_REGION="AU"
export CUSTOM_BADGE_PROJECT_URL="https://badge.$PUBLICZONENAME"
export CUSTOM_PATH_IMAGE="/appv3/$ENV/images/"
export CUSTOM_PATH_VIDEO="/appv3/$ENV/videos/"
export CUSTOM_UPLOAD_TUS_ENDPOINT="https://tusd.practera.com/uploads/"
export CUSTOMPLAIN_SKIPGLOBALLOGINFLAG="true"

# Set environment-specific variables
if [ "$AWS_PROFILE" == "p2-stage" ]; then
    export CUSTOM_UPLOAD_MAX_FILE_SIZE="2147483648"
    export CUSTOM_ENABLE_ASSESSMENT_PAGINATION="true"
    export CUSTOM_HELPLINE="programs@practera.com"
    export CUSTOM_STACK_NAME="$STACK_NAME"
else
    # Set defaults for p2-sandbox (dev environment)
    export CUSTOM_UPLOAD_MAX_FILE_SIZE="2147483648"  # 2GB default
    export CUSTOM_ENABLE_ASSESSMENT_PAGINATION="false"
    export CUSTOM_HELPLINE="help@practera.com"
fi

echo -e "${GREEN}✓${NC} Secrets fetched"
echo ""

# Prepare environment file
echo -e "${YELLOW}[4/7]${NC} Preparing Angular environment..."
test -f projects/v3/src/environments/environment.ts && echo "environment.ts exists" || cp projects/v3/src/environments/environment.local.ts projects/v3/src/environments/environment.ts

# Backup template files (will restore after build)
ENV_CUSTOM_BACKUP="$TMP_DIR/environment.custom.ts.backup"
ANGULAR_JSON_BACKUP="$TMP_DIR/angular.json.backup"
cp projects/v3/src/environments/environment.custom.ts "$ENV_CUSTOM_BACKUP"
cp angular.json "$ANGULAR_JSON_BACKUP"
TMP_FILES+=("$ENV_CUSTOM_BACKUP" "$ANGULAR_JSON_BACKUP")

# Run env.sh to inject environment variables
# macOS compatibility: Create a temporary wrapper for env.sh that fixes sed -i for macOS
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS: sed -i requires a backup extension (empty string for in-place)
    # Replicate env.sh logic but with macOS-compatible sed commands
    export CUSTOMPLAIN_SKIPGLOBALLOGINFLAG=${CUSTOMPLAIN_SKIPGLOBALLOGINFLAG:-false}
    export CUSTOMPLAIN_PRDMODEFLAG=${CUSTOMPLAIN_PRDMODEFLAG:-true}
    
    while IFS='=' read -r name value ; do
        if [[ $name == 'CUSTOMPLAIN_'* ]]; then
            sed -i '' "s#'<$name>'#${!name}#g" projects/v3/src/environments/environment.custom.ts 2>/dev/null || true
        fi
    done < <(env)
    while IFS='=' read -r name value ; do
        if [[ $name == 'CUSTOM_'* ]]; then
            sed -i '' "s#<$name>#${!name}#g" projects/v3/src/environments/environment.custom.ts 2>/dev/null || true
            sed -i '' "s#<$name>#${!name}#g" angular.json 2>/dev/null || true
        fi
    done < <(env)
else
    # Linux: Use original env.sh (works fine on Linux) - use bash to avoid permission change
    bash env.sh
fi
echo -e "${GREEN}✓${NC} Environment prepared"
echo ""

# Build Angular applications (request must be built before v3)
echo -e "${YELLOW}[5/7]${NC} Building Angular applications..."
echo -e "${BLUE}Building 'request' app (required for v3)...${NC}"
# Build request app first (v3 depends on it)
node_modules/.bin/ng build request --configuration=$BUILD_CONFIG

echo -e "${BLUE}Building 'v3' app...${NC}"
node_modules/.bin/ng build v3 --configuration=$BUILD_CONFIG

# Generate version
npm run generate-version-v3

# Restore template files (keep placeholders for next run)
cp "$ENV_CUSTOM_BACKUP" projects/v3/src/environments/environment.custom.ts
cp "$ANGULAR_JSON_BACKUP" angular.json
rm -f "$ENV_CUSTOM_BACKUP" "$ANGULAR_JSON_BACKUP"

echo -e "${GREEN}✓${NC} Builds completed"
echo ""

# Get S3 bucket name and CloudFront distribution from CloudFormation exports (parallelized)
echo -e "${YELLOW}[6/7]${NC} Getting CloudFormation exports (parallel)..."
# Fetch both exports in parallel if CloudFront invalidation is needed
if [ "$SKIP_INVALIDATION" == "false" ]; then
    # Security: Use secure temporary file
    CF_EXPORTS_FILE="$TMP_DIR/cf-exports.json"
    TMP_FILES+=("$CF_EXPORTS_FILE")
    
    aws cloudformation list-exports --profile $AWS_PROFILE --region $REGION > "$CF_EXPORTS_FILE" &
    CF_EXPORTS_PID=$!
    wait $CF_EXPORTS_PID
    
    # Security: Set restrictive permissions
    chmod 600 "$CF_EXPORTS_FILE" 2>/dev/null || true
    
    APP_V3_S3=$(jq --arg name "$STACK_NAME-AppV3S3Bucket-$ENV" -r '.Exports[] | select(.Name == $name) | .Value' "$CF_EXPORTS_FILE")
    APP_V3_CDN=$(jq --arg name "$STACK_NAME-AppV3CloudFrontDistributionID-$ENV" -r '.Exports[] | select(.Name == $name) | .Value' "$CF_EXPORTS_FILE")
    
    # Security: Remove immediately after use
    rm -f "$CF_EXPORTS_FILE"
else
    APP_V3_S3=$(aws cloudformation list-exports --profile $AWS_PROFILE --region $REGION --query "Exports[?Name==\`$STACK_NAME-AppV3S3Bucket-$ENV\`].Value" --no-paginate --output text)
fi

if [ -z "$APP_V3_S3" ]; then
    echo -e "${RED}Error: Could not find S3 bucket export '$STACK_NAME-AppV3S3Bucket-$ENV'${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} S3 bucket: $APP_V3_S3"
echo ""

# Sync to S3
echo -e "${YELLOW}[7/7]${NC} Syncing to S3..."
echo -e "${BLUE}Uploading files to s3://$APP_V3_S3${NC}"
aws s3 sync dist/v3/ s3://$APP_V3_S3 --delete --no-progress --profile $AWS_PROFILE
echo -e "${GREEN}✓${NC} Files synced to S3"
echo ""

# Invalidate CloudFront cache (optional) - already fetched in parallel above
if [ "$SKIP_INVALIDATION" == "false" ]; then
    echo -e "${YELLOW}[Bonus]${NC} Invalidating CloudFront cache..."
    
    if [ -n "$APP_V3_CDN" ]; then
        for dist_id in $APP_V3_CDN; do
            echo -e "${BLUE}Invalidating distribution: $dist_id${NC}"
            aws cloudfront create-invalidation --distribution-id $dist_id --paths "/*" --profile $AWS_PROFILE > /dev/null 2>&1 &
        done
        wait
        echo -e "${GREEN}✓${NC} CloudFront invalidation initiated (runs in background)"
    else
        echo -e "${YELLOW}⚠${NC} CloudFront distribution ID not found, skipping invalidation"
    fi
    echo ""
else
    echo -e "${YELLOW}⚠${NC} CloudFront invalidation skipped (--skip-invalidation flag provided)"
    echo ""
fi

# Summary
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "Environment: ${GREEN}$STACK_NAME ($ENV)${NC}"
echo -e "S3 Bucket: ${GREEN}$APP_V3_S3${NC}"
echo -e "URL: ${GREEN}https://app.$PUBLICZONENAME${NC}"
echo ""
echo -e "${BLUE}Your changes should be live in a few moments!${NC}"

# Security: Cleanup is handled by trap on exit
# All temporary files and secrets will be securely removed

