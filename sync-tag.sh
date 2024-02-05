#!/bin/bash

set -e

# Set the remote name
REMOTE=origin

# Fetch all tags from remote
git fetch --tags $REMOTE

# Get list of remote tags
remote_tags=$(git ls-remote --tags $REMOTE | cut -f 2 | sed 's|refs/tags/||g' | grep -v '\^{}$')

# Convert remote tags to array
readarray -t remote_tags_array <<<"$remote_tags"

# Get list of local tags
local_tags=$(git tag)

# Convert local tags to array
readarray -t local_tags_array <<<"$local_tags"

# Loop through local tags
for local_tag in "${local_tags_array[@]}"; do
    # Flag to check if local tag is on remote
    tag_found=false

    # Check if local tag is in remote tags
    for remote_tag in "${remote_tags_array[@]}"; do
        if [[ "$local_tag" == "$remote_tag" ]]; then
            tag_found=true
            break
        fi
    done

    # If local tag is not found on remote, delete it
    if [[ $tag_found == false ]]; then
        echo "Deleting local tag: $local_tag"
        git tag -d "$local_tag"
    fi
done

echo "Local tags synced with remote."
