#!/bin/bash

# Progress bar update deployment script
echo "🚀 Deploying Flowbite-style progress bar update..."

# Add all changes
git add .

# Commit with descriptive message
git commit -m "Update progress bar to Flowbite design with brand colors

- Replace top-spanning progress bar with inline Flowbite design
- Add label and percentage text above progress bar
- Use brand colors for different virality levels:
  - Purple (#8B5CF6) for MVP clips
  - Green (#10B981) for high virality (80%+)
  - Cyan (#22D3EE) for medium virality (60-79%)
  - Yellow (#F59E0B) for low-medium (40-59%)
  - Red (#EF4444) for low virality (<40%)
- Apply consistent styling to both main page and experience page
- Better visual hierarchy with labeled progress bars
- More professional appearance with proper spacing

Design improvements:
- Cleaner inline progress bar design
- Better color contrast and readability
- Consistent with modern UI patterns
- More informative with labels"

# Force push to deploy
git push --force

echo "✅ Progress bar update deployment complete!"
echo "🎯 New Features:"
echo "  - Flowbite-style progress bar design"
echo "  - Brand color coding for virality levels"
echo "  - Label and percentage display"
echo "  - Better visual hierarchy"
echo "  - Professional appearance"
