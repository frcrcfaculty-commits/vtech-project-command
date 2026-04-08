#!/bin/bash

###############################################################################
# Supabase SQL Migration Runner
# Quick deployment of SQL files to Supabase using REST API
# Usage: bash scripts/deploy.sh [--schema | --db-polish | --seed | --all]
###############################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

log_success() {
    echo -e "${GREEN}✓${NC} $1"
}

log_error() {
    echo -e "${RED}✗${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

log_section() {
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════${NC}"
    echo ""
}

# Check environment
check_env() {
    if [ -z "$SUPABASE_URL" ] && [ -z "$VITE_SUPABASE_URL" ]; then
        log_error "Missing SUPABASE_URL or VITE_SUPABASE_URL"
        echo "Set it with: export SUPABASE_URL=https://your-project.supabase.co"
        exit 1
    fi
    
    if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
        log_error "Missing SUPABASE_SERVICE_ROLE_KEY"
        echo "Set it with: export SUPABASE_SERVICE_ROLE_KEY=your_key"
        exit 1
    fi
    
    # Use SUPABASE_URL if set, else use VITE_SUPABASE_URL
    SUPABASE_URL=${SUPABASE_URL:-$VITE_SUPABASE_URL}
    
    log_success "Environment variables configured"
    log_info "URL: $SUPABASE_URL"
}

# Test connection
test_connection() {
    log_info "Testing Supabase connection..."
    
    response=$(curl -s -X GET \
        "${SUPABASE_URL}/rest/v1/projects?select=id&limit=1" \
        -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
        -H "Content-Type: application/json" \
        -w "\n%{http_code}")
    
    http_code=$(echo "$response" | tail -n1)
    
    if [ "$http_code" = "200" ] || [ "$http_code" = "206" ]; then
        log_success "Connected to Supabase"
        return 0
    else
        log_error "Failed to connect (HTTP $http_code)"
        return 1
    fi
}

# Execute SQL file
execute_sql() {
    local file=$1
    local name=$2
    
    if [ ! -f "$file" ]; then
        log_error "File not found: $file"
        return 1
    fi
    
    local size=$(wc -c < "$file")
    log_info "Executing $name"
    log_info "File: $file ($size bytes)"
    
    # Read SQL file
    local sql_content=$(cat "$file")
    
    # Execute via REST API (using curl with large query)
    # Note: This requires the SQL to be sent as a query string or body
    # For now, we'll just provide instructions
    
    echo ""
    log_warning "MANUAL STEP REQUIRED"
    echo ""
    echo "Copy the entire contents of: $file"
    echo ""
    echo "Then go to: ${SUPABASE_URL}/project/_/sql/new"
    echo ""
    echo "Paste the SQL and click 'RUN'"
    echo ""
    log_success "$name is ready to deploy"
    echo ""
}

# Show menu
show_menu() {
    echo ""
    echo "Choose migration to deploy:"
    echo "  1. Schema (schema.sql)"
    echo "  2. DB Polish (db_polish.sql)"
    echo "  3. Seed data (seed_realistic.sql)"
    echo "  4. All migrations"
    echo "  5. Exit"
    echo ""
}

log_section "Supabase SQL Migration Deployment"

# Handle --help before environment check
case "${1:-}" in
    --help|-h)
        echo "Deploy database migrations to Supabase"
        echo ""
        echo "Usage: bash scripts/deploy.sh [OPTION]"
        echo ""
        echo "Options:"
        echo "  --schema       Deploy schema.sql only"
        echo "  --db-polish    Deploy db_polish.sql only"
        echo "  --seed         Deploy seed_realistic.sql only"
        echo "  --all          Deploy all migrations"
        echo "  --help         Show this help"
        echo ""
        echo "Environment:"
        echo "  SUPABASE_URL              Your Supabase project URL"
        echo "  SUPABASE_SERVICE_ROLE_KEY Your service role key"
        echo ""
        exit 0
        ;;
esac

# Check environment
check_env

# Test connection
if ! test_connection; then
    log_error "Cannot proceed without Supabase connection"
    exit 1
fi

# Parse arguments
case "${1:-}" in
    --schema)
        execute_sql "sql/schema.sql" "schema.sql"
        exit 0
        ;;
    --db-polish)
        execute_sql "sql/db_polish.sql" "db_polish.sql"
        exit 0
        ;;
    --seed)
        execute_sql "sql/seed_realistic.sql" "seed_realistic.sql"
        exit 0
        ;;
    --all)
        execute_sql "sql/schema.sql" "schema.sql"
        log_section "Next: Deploy DB Polish"
        execute_sql "sql/db_polish.sql" "db_polish.sql"
        log_section "Next: Load Seed Data"
        execute_sql "sql/seed_realistic.sql" "seed_realistic.sql"
        exit 0
        ;;
    --help|-h)
        echo "Deploy database migrations to Supabase"
        echo ""
        echo "Usage: bash scripts/deploy.sh [OPTION]"
        echo ""
        echo "Options:"
        echo "  --schema       Deploy schema.sql only"
        echo "  --db-polish    Deploy db_polish.sql only"
        echo "  --seed         Deploy seed_realistic.sql only"
        echo "  --all          Deploy all migrations"
        echo "  --help         Show this help"
        echo ""
        echo "Environment:"
        echo "  SUPABASE_URL              Your Supabase project URL"
        echo "  SUPABASE_SERVICE_ROLE_KEY Your service role key"
        echo ""
        exit 0
        ;;
    *)
        # Interactive mode
        show_menu
        read -p "Enter choice (1-5): " choice
        
        case $choice in
            1) execute_sql "sql/schema.sql" "schema.sql" ;;
            2) execute_sql "sql/db_polish.sql" "db_polish.sql" ;;
            3) execute_sql "sql/seed_realistic.sql" "seed_realistic.sql" ;;
            4)
                execute_sql "sql/schema.sql" "schema.sql"
                execute_sql "sql/db_polish.sql" "db_polish.sql"
                execute_sql "sql/seed_realistic.sql" "seed_realistic.sql"
                ;;
            5) log_info "Exiting"; exit 0 ;;
            *) log_error "Invalid choice"; exit 1 ;;
        esac
        ;;
esac

log_section "Deployment Instructions"
echo "1. Go to Supabase SQL Editor: ${SUPABASE_URL}/project/_/sql/new"
echo "2. Paste the SQL content from above"
echo "3. Review the code"
echo "4. Click the 'RUN' button"
echo ""
echo "After deployment, verify:"
echo "  - No errors in the editor output"
echo "  - Check Supabase Tables editor for new objects"
echo "  - Review DEPLOY_TO_SUPABASE.md for smoke tests"
echo ""
