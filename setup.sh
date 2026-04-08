#!/bin/bash
echo ""
echo "  ╔═══════════════════════════════════════╗"
echo "  ║   StayNP - Setting up your project    ║"
echo "  ║   नेपालमा बस्नुहोस्                      ║"
echo "  ╚═══════════════════════════════════════╝"
echo ""

cd "$(dirname "$0")"

echo "→ Cleaning old install..."
rm -rf node_modules package-lock.json .next

echo "→ Installing dependencies..."
npm install --legacy-peer-deps

if [ $? -ne 0 ]; then
  echo ""
  echo "→ Retrying with --ignore-scripts..."
  npm install --ignore-scripts --legacy-peer-deps
fi

echo ""
echo "  ✓ Setup complete!"
echo ""
echo "→ Starting StayNP dev server..."
echo ""
echo "  🌐 Open http://localhost:3000 in your browser"
echo ""

npm run dev
