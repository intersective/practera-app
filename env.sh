#!/usr/bin/env bash
while IFS='=' read -r name value ; do
  if [[ $name == 'CUSTOM_'* ]]; then
        sed -i "s#<$name>#${!name}#g" src/environments/environment.custom.ts
  fi
  if [[ $name == 'FILESTACK_'* ]]; then
        sed -i "s#<$name>#${!name}#g" src/environments/filestack.ts
  fi
done < <(env)


