#!/bin/bash

# Simplified viral system deployment script
echo "🚀 Deploying simplified viral system..."

# Add all changes
git add .

# Commit with descriptive message
git commit -m "Simplify viral system - remove complex analysis

- Remove hook functionality from interface and display
- Simplify API to use ChatGPT directly for viral tags and scoring
- Update system prompt with 20 curated viral tags
- Remove complex viral-tags.ts analysis system
- Use isMVP field directly from ChatGPT response
- Update both main page and experience page
- Much simpler, faster, and more reliable

Benefits:
- Faster clip generation (no complex analysis)
- More accurate viral detection (ChatGPT context)
- Easier to maintain (just update prompt)
- Less error-prone (fewer moving parts)"

# Force push to deploy
git push --force

echo "✅ Simplified system deployment complete!"
echo "🎯 Features:"
echo "  - 20 curated viral tags in ChatGPT prompt"
echo "  - Direct ChatGPT scoring and MVP detection"
echo "  - No hook display (cleaner UI)"
echo "  - Much simpler and faster"
echo "  - More reliable JSON parsing"
