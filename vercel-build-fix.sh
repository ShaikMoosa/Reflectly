#!/bin/bash

echo "Running Vercel build fix script..."

# Fix Clerk auth imports
find ./app -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/import { auth } from "."@clerk\/nextjs";/import { auth } from "@clerk\/nextjs\/server";/g'

# Change all @ts-ignore to @ts-expect-error with comment
find ./app -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/\/\/ @ts-ignore/\/\/ @ts-expect-error - Type definitions/g'

echo "Build fixes applied successfully!" 