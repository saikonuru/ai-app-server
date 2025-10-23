#!/bin/bash
set -e

echo "🔧 Installing dependencies..."
bun install

echo "🧬 Generating Prisma client..."
bunx prisma generate

echo "📦 Applying Prisma migrations..."
bunx prisma migrate deploy

echo "🛠 Building Bun app..."
bun build index.ts