#!/usr/bin/env bash
while IFS='=' read -r name value ; do
    if [[ $name == 'CUSTOM_'* ]]; then
        sed -i "s#<$name>#${!name}#g" src/environments/environment.custom.ts
        sed -i "s#<$name>#${!name}#g" angular.json
    fi
done < <(env)