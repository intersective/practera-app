if [ "$CODEBUILD_WEBHOOK_BASE_REF" = "refs/heads/master" ]; then
    echo "stage"
    ng build --configuration=stage
elif [ "$CODEBUILD_WEBHOOK_BASE_REF" = "refs/heads/develop" ]; then
    echo "develop"
    ng build --configuration=dev
else
    echo "default"
    ng build
fi;