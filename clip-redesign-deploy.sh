#!/bin/bash

# Clip card redesign deployment script
echo "🚀 Deploying clip card redesign..."

# Add all changes
git add .

# Commit with descriptive message
git commit -m "Redesign clip cards with new layout and functionality

- Move title to bottom of each clip card
- Remove description text from cards
- Add virality progress bar spanning top left to top right
- Show virality percentage or MVP percentage in top right
- Update to show only 2 unique viral tags per clip
- Add Save and Generate Download buttons (download icon)
- Remove description from hover overlay
- Implement save functionality for clips
- Update system prompt to ensure 2 unique tags per clip
- Apply changes to both main page and experience page

New layout:
- Progress bar at top showing virality score
- Time range below progress bar
- Thumbnail in center
- Title at bottom
- 2 viral tags on hover
- Save and Download buttons on hover

Performance improvements:
- Simplified hover effects
- Better responsive layout
- Cleaner visual hierarchy"

# Force push to deploy
git push --force

echo "✅ Clip redesign deployment complete!"
echo "🎯 New Features:"
echo "  - Virality progress bar at top"
echo "  - Title moved to bottom"
echo "  - Only 2 unique viral tags per clip"
echo "  - Save and Download buttons"
echo "  - Cleaner, more focused design"
echo "  - Better performance"
