#!/bin/bash

echo "🎬 Setting up Git repository for MovieZone..."
echo "=============================================="

# Check if Git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install Git first."
    exit 1
fi

# Initialize Git repository
if [ ! -d ".git" ]; then
    echo "📁 Initializing Git repository..."
    git init
    echo "✅ Git repository initialized"
else
    echo "ℹ️  Git repository already exists"
fi

# Add all files
echo "📝 Adding files to Git..."
git add .

# Check if there are any files to commit
if git diff --cached --quiet; then
    echo "ℹ️  No changes to commit"
else
    echo "💾 Committing initial files..."
    git commit -m "🎬 Initial commit: MovieZone full-stack application

- Backend: Node.js + Express + MongoDB API
- Frontend: Next.js + React + Tailwind CSS
- User authentication and movie management
- Rating system and search functionality
- Responsive design with modern UI/UX"
    echo "✅ Initial commit created"
fi

# Check if remote origin exists
if ! git remote get-url origin &> /dev/null; then
    echo ""
    echo "🌐 To connect to GitHub:"
    echo "1. Create a new repository on GitHub"
    echo "2. Run: git remote add origin <your-github-repo-url>"
    echo "3. Run: git push -u origin main"
    echo ""
else
    echo "✅ Remote origin already configured"
fi

echo ""
echo "🔒 Security Check:"
echo "=================="

# Check for .env files
if find . -name ".env*" -type f | grep -q .; then
    echo "⚠️  WARNING: .env files found! These should NOT be committed."
    echo "   Files found:"
    find . -name ".env*" -type f
    echo ""
    echo "   Please ensure these are in your .gitignore file."
else
    echo "✅ No .env files found - good!"
fi

# Check for node_modules
if [ -d "node_modules" ] || [ -d "movieApiBackend/node_modules" ] || [ -d "movieFrontend/node_modules" ]; then
    echo "⚠️  WARNING: node_modules directories found!"
    echo "   These should be ignored by .gitignore"
else
    echo "✅ No node_modules found - good!"
fi

echo ""
echo "🎉 Git setup complete!"
echo "======================"
echo "Your repository is ready for development."
echo "Remember to:"
echo "- Never commit .env files"
echo "- Keep your API keys secret"
echo "- Use meaningful commit messages"
echo ""
echo "Happy coding! 🚀"
