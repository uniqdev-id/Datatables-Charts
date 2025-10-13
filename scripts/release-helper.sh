#!/bin/bash

# DataTables Charts Plugin - Release Helper Script
# This script helps with local release preparation and testing

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo -e "${BLUE}=== $1 ===${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -f "src/datatables.charts.js" ]; then
    print_error "This script must be run from the project root directory"
    exit 1
fi

# Get current version
CURRENT_VERSION=$(node -p "require('./package.json').version")

print_header "DataTables Charts Release Helper"
echo -e "Current version: ${GREEN}v${CURRENT_VERSION}${NC}"
echo ""

# Show menu
show_menu() {
    echo "What would you like to do?"
    echo "1. Run pre-release checks"
    echo "2. Build and test"
    echo "3. Bump version (patch)"
    echo "4. Bump version (minor)"
    echo "5. Bump version (major)"
    echo "6. Create release archive"
    echo "7. Clean build artifacts"
    echo "8. Show current status"
    echo "9. Exit"
    echo ""
}

# Pre-release checks
run_checks() {
    print_header "Running Pre-Release Checks"

    # Check Git status
    if [ -n "$(git status --porcelain)" ]; then
        print_warning "Working directory is not clean"
        git status --short
        echo ""
    else
        print_success "Working directory is clean"
    fi

    # Check for Node.js and npm
    if command -v node > /dev/null 2>&1; then
        NODE_VERSION=$(node --version)
        print_success "Node.js version: $NODE_VERSION"
    else
        print_error "Node.js is not installed"
        return 1
    fi

    if command -v npm > /dev/null 2>&1; then
        NPM_VERSION=$(npm --version)
        print_success "npm version: $NPM_VERSION"
    else
        print_error "npm is not installed"
        return 1
    fi

    # Install dependencies
    print_info "Installing dependencies..."
    npm ci --silent
    print_success "Dependencies installed"

    # Run linting
    print_info "Running ESLint..."
    if npm run lint --silent; then
        print_success "Linting passed"
    else
        print_error "Linting failed"
        return 1
    fi

    # Check file structure
    print_info "Checking file structure..."
    required_files=("src/datatables.charts.js" "src/datatables.charts.css" "README.md" "package.json")
    for file in "${required_files[@]}"; do
        if [ -f "$file" ]; then
            print_success "Found: $file"
        else
            print_error "Missing: $file"
            return 1
        fi
    done

    print_success "All pre-release checks passed!"
}

# Build and test
build_and_test() {
    print_header "Building and Testing"

    # Clean previous build
    if [ -f "dist/datatables.charts.min.js" ]; then
        rm dist/datatables.charts.min.js
        print_info "Cleaned previous build"
    fi

    # Build
    print_info "Building minified version..."
    if npm run build --silent; then
        print_success "Build completed"
    else
        print_error "Build failed"
        return 1
    fi

    # Verify build output
    if [ -f "dist/datatables.charts.min.js" ]; then
        ORIGINAL_SIZE=$(wc -c < src/datatables.charts.js)
        MINIFIED_SIZE=$(wc -c < dist/datatables.charts.min.js)
        RATIO=$(( (MINIFIED_SIZE * 100) / ORIGINAL_SIZE ))

        print_success "Minified file created"
        print_info "Original size: ${ORIGINAL_SIZE} bytes"
        print_info "Minified size: ${MINIFIED_SIZE} bytes"
        print_info "Compression ratio: ${RATIO}%"
    else
        print_error "Minified file was not created"
        return 1
    fi

    # Test JavaScript syntax
    print_info "Testing JavaScript syntax..."
    if node -c src/datatables.charts.js && node -c dist/datatables.charts.min.js; then
        print_success "JavaScript syntax is valid"
    else
        print_error "JavaScript syntax errors found"
        return 1
    fi

    print_success "Build and test completed successfully!"
}

# Bump version
bump_version() {
    local TYPE=$1
    print_header "Bumping Version ($TYPE)"

    if [ -n "$(git status --porcelain)" ]; then
        print_error "Working directory must be clean before version bump"
        return 1
    fi

    # Bump version
    print_info "Bumping version..."
    NEW_VERSION=$(npm version $TYPE --no-git-tag-version | sed 's/v//')

    # Update source files if they contain version
    if grep -q "version.*:" src/datatables.charts.js; then
        sed -i.bak "s/version.*:.*/version: '$NEW_VERSION',/" src/datatables.charts.js
        rm src/datatables.charts.js.bak 2>/dev/null || true
        print_info "Updated version in source file"
    fi

    # Build with new version
    npm run build --silent

    print_success "Version bumped to v$NEW_VERSION"
    print_warning "Remember to commit these changes and create a git tag"
    print_info "Next steps:"
    print_info "  git add ."
    print_info "  git commit -m 'Release v$NEW_VERSION'"
    print_info "  git tag v$NEW_VERSION"
    print_info "  git push origin main"
    print_info "  git push origin v$NEW_VERSION"
}

# Create release archive
create_archive() {
    print_header "Creating Release Archive"

    # Ensure we have built files
    if [ ! -f "dist/datatables.charts.min.js" ]; then
        print_info "Building project first..."
        npm run build --silent
    fi

    # Create release directory
    RELEASE_DIR="release-$(date +%Y%m%d-%H%M%S)"
    mkdir -p $RELEASE_DIR

    # Create different archives
    print_info "Creating distribution archive..."
    zip -r "$RELEASE_DIR/datatables-chart-dist.zip" dist/ src/datatables.charts.css README.md > /dev/null

    print_info "Creating source archive..."
    zip -r "$RELEASE_DIR/datatables-chart-src.zip" src/ examples/ README.md package.json > /dev/null

    print_info "Creating complete archive..."
    zip -r "$RELEASE_DIR/datatables-chart-complete.zip" . -x "node_modules/*" ".git/*" "$RELEASE_DIR/*" > /dev/null

    print_success "Archives created in $RELEASE_DIR/"
    ls -la "$RELEASE_DIR/"
}

# Clean build artifacts
clean_build() {
    print_header "Cleaning Build Artifacts"

    if [ -f "dist/datatables.charts.min.js" ]; then
        rm dist/datatables.charts.min.js
        print_success "Removed minified JS file"
    fi

    if [ -d "release-*" ]; then
        rm -rf release-*
        print_success "Removed release directories"
    fi

    print_success "Clean completed"
}

# Show current status
show_status() {
    print_header "Current Status"

    echo -e "Version: ${GREEN}v${CURRENT_VERSION}${NC}"
    echo ""

    # Git status
    echo "Git Status:"
    if [ -n "$(git status --porcelain)" ]; then
        git status --short
    else
        echo "  Working directory clean"
    fi
    echo ""

    # File sizes
    echo "File Sizes:"
    if [ -f "src/datatables.charts.js" ]; then
        echo "  Source JS: $(wc -c < src/datatables.charts.js) bytes"
    fi
    if [ -f "src/datatables.charts.css" ]; then
        echo "  CSS: $(wc -c < src/datatables.charts.css) bytes"
    fi
    if [ -f "dist/datatables.charts.min.js" ]; then
        echo "  Minified JS: $(wc -c < dist/datatables.charts.min.js) bytes"
    else
        echo "  Minified JS: Not built"
    fi
    echo ""

    # Dependencies status
    if [ -f "package-lock.json" ]; then
        echo "Dependencies: Locked (package-lock.json exists)"
    else
        echo "Dependencies: Not locked"
    fi
}

# Main menu loop
while true; do
    show_menu
    read -p "Choose an option (1-9): " choice
    echo ""

    case $choice in
        1)
            run_checks
            ;;
        2)
            build_and_test
            ;;
        3)
            bump_version "patch"
            ;;
        4)
            bump_version "minor"
            ;;
        5)
            bump_version "major"
            ;;
        6)
            create_archive
            ;;
        7)
            clean_build
            ;;
        8)
            show_status
            ;;
        9)
            print_info "Goodbye!"
            exit 0
            ;;
        *)
            print_error "Invalid option. Please choose 1-9."
            ;;
    esac

    echo ""
    read -p "Press Enter to continue..."
    echo ""
done
