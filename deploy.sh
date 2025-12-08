#!/bin/bash

set -e

echo "Building project..."
npm run build

echo "Deploying to gh-pages..."
git subtree push --prefix dist origin gh-pages

echo "✓ Deployment complete!"
