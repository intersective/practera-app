if [ ! -z "$BUILD_CONFIG" ]; then
    echo $BUILD_CONFIG
    ng build --configuration=$BUILD_CONFIG
else
    echo "default"
    ng build
fi;