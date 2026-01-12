#!/bin/bash

# Backup Script for Pre-Migration
# Run this before starting the migration to Supabase → NextAuth

set -e

echo "🔄 Creating backups for Supabase to NextAuth migration..."

# Create backup directory with timestamp
BACKUP_DIR="backups/pre-migration-$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "📁 Backup directory: $BACKUP_DIR"

# Backup critical files
echo "📄 Backing up code files..."

# Auth-related files
if [ -d "src/lib/db" ]; then
    cp -r src/lib/db "$BACKUP_DIR/"
    echo "✅ Backed up src/lib/db"
fi

if [ -f "src/middleware.ts" ]; then
    cp src/middleware.ts "$BACKUP_DIR/"
    echo "✅ Backed up src/middleware.ts"
fi

if [ -d "src/app/api/auth" ]; then
    cp -r src/app/api/auth "$BACKUP_DIR/"
    echo "✅ Backed up src/app/api/auth"
fi

# Backup all files using Supabase
echo "🔍 Finding files using Supabase..."
grep -r "supabase" src --files-with-matches > "$BACKUP_DIR/files-using-supabase.txt" 2>/dev/null || true

# Create list of files to modify
if [ -f "$BACKUP_DIR/files-using-supabase.txt" ]; then
    FILE_COUNT=$(wc -l < "$BACKUP_DIR/files-using-supabase.txt")
    echo "📊 Found $FILE_COUNT files using Supabase"
    
    # Copy each file
    while IFS= read -r file; do
        if [ -f "$file" ]; then
            # Create directory structure in backup
            DIR=$(dirname "$file")
            mkdir -p "$BACKUP_DIR/$DIR"
            cp "$file" "$BACKUP_DIR/$file"
        fi
    done < "$BACKUP_DIR/files-using-supabase.txt"
fi

# Backup environment variables
if [ -f ".env.local" ]; then
    cp .env.local "$BACKUP_DIR/.env.local.backup"
    echo "✅ Backed up .env.local"
fi

if [ -f ".env" ]; then
    cp .env "$BACKUP_DIR/.env.backup"
    echo "✅ Backed up .env"
fi

# Backup package.json
if [ -f "package.json" ]; then
    cp package.json "$BACKUP_DIR/package.json.backup"
    echo "✅ Backed up package.json"
fi

# Backup database schema
if [ -f "sql/CURRENT_DATABASE_STRUCTURE.sql" ]; then
    cp sql/CURRENT_DATABASE_STRUCTURE.sql "$BACKUP_DIR/"
    echo "✅ Backed up database schema"
fi

# Create a restoration script
cat > "$BACKUP_DIR/restore.sh" << 'EOF'
#!/bin/bash

# Restoration Script
# Run this to restore backed up files if migration fails

echo "⚠️  WARNING: This will restore files from backup"
read -p "Are you sure? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ Restoration cancelled"
    exit 1
fi

echo "🔄 Restoring files..."

# Get backup directory
BACKUP_DIR=$(dirname "$0")

# Restore files
if [ -d "$BACKUP_DIR/src" ]; then
    cp -r "$BACKUP_DIR/src/"* src/
    echo "✅ Restored src/ files"
fi

if [ -f "$BACKUP_DIR/.env.local.backup" ]; then
    cp "$BACKUP_DIR/.env.local.backup" .env.local
    echo "✅ Restored .env.local"
fi

if [ -f "$BACKUP_DIR/.env.backup" ]; then
    cp "$BACKUP_DIR/.env.backup" .env
    echo "✅ Restored .env"
fi

if [ -f "$BACKUP_DIR/package.json.backup" ]; then
    cp "$BACKUP_DIR/package.json.backup" package.json
    echo "✅ Restored package.json"
    echo "🔧 Run 'npm install' to restore dependencies"
fi

echo "✅ Restoration complete!"
echo "🔧 Next steps:"
echo "   1. npm install"
echo "   2. Restart your development server"
EOF

chmod +x "$BACKUP_DIR/restore.sh"
echo "✅ Created restore.sh script"

# Create a README
cat > "$BACKUP_DIR/README.md" << EOF
# Pre-Migration Backup

Created: $(date)

## Contents

- Code files using Supabase
- Environment variables
- Database schema
- Package configuration

## To Restore

Run the restore script:

\`\`\`bash
./restore.sh
\`\`\`

Then reinstall dependencies:

\`\`\`bash
npm install
\`\`\`

## Files Backed Up

See \`files-using-supabase.txt\` for complete list.
EOF

echo "✅ Created README.md"

# Summary
echo ""
echo "🎉 Backup complete!"
echo "📍 Location: $BACKUP_DIR"
echo ""
echo "📋 Backed up:"
echo "   - $(find "$BACKUP_DIR" -type f | wc -l) files"
echo "   - $(du -sh "$BACKUP_DIR" | cut -f1) total size"
echo ""
echo "⚠️  Keep this backup until migration is confirmed successful!"
echo ""
echo "To restore if needed: cd $BACKUP_DIR && ./restore.sh"
