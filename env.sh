#!/usr/bin/env bash
while IFS='=' read -r name value ; do
    if [[ $name == 'CUSTOM_'* ]]; then
        sed -i "s#<$name>#${!name}#g" src/environments/environment.custom.ts
        
        sed -i "s#<$name>#${!name}#g" angular.json
        echo "replacing $name with ${!name}"
    fi
done < <(env)

cat src/environments/environment.custom.ts