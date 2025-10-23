#!/bin/bash
set -e

echo "🔧 Installing dependencies..."
bun install

echo "🧬 Generating Prisma client..."
bun prisma generate

echo "📦 Applying Prisma migrations..."
bun prisma migrate deploy

echo "🛠 Building Bun app..."
bun build index.ts