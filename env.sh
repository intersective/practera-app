#!/bin/bash

while IFS='=' read -r name value ; do echo $name; done < <(env)
while IFS='=' read -r name value ; do  if [[ $name == 'CUSTOM_'* ]]; then sed -i "s#<$name>#${!name}#g" src/environments/environment.custom.ts; fi; done < <(env)
cat src/environment/environment.custom.ts
cat src/environment/filestack.ts
