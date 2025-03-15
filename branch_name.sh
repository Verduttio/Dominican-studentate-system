#!/usr/bin/env bash

current_dir=$(basename "$PWD")

branch_name="${current_dir##*-}"

echo "$branch_name"
