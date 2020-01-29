if [ "$CODEBUILD_WEBHOOK_BASE_REF" = "refs/heads/master" ]; then
    echo "stage"
    ng build --configuration=stage
elif [ "$CODEBUILD_WEBHOOK_BASE_REF" = "refs/heads/develop" ]; then
    echo "develop"
    ng build --configuration=dev
elif [ ! -z "$BUILD_CONFIG" ]; then
    echo $BUILD_CONFIG
    ng build --configuration=$BUILD_CONFIG
else
    echo "default"
    ng build
fi;