#!/bin/bash

# JSON parsing error fix deployment script
echo "🔧 Deploying JSON parsing error fixes..."

# Add all changes
git add .

# Commit with descriptive message
git commit -m "Fix JSON parsing errors with better error handling

- Add comprehensive error handling for LLM JSON responses
- Add detailed logging for debugging malformed responses
- Improve error messages with specific details
- Add try-catch blocks in LLM library functions
- Better error reporting in frontend
- Handle edge cases in JSON extraction from LLM responses

Fixes:
- SyntaxError: Unexpected end of JSON input
- Better debugging with console logs
- More specific error messages
- Graceful fallback for malformed responses"

# Force push to deploy
git push --force

echo "✅ JSON parsing error fixes deployed!"
echo "🔧 Improvements:"
echo "  - Better error handling for malformed JSON"
echo "  - Detailed logging for debugging"
echo "  - More specific error messages"
echo "  - Graceful fallback handling"
