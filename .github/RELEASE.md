# GitHub Actions Workflows

This directory contains automated workflows for the DataTables Charts Plugin project.

## Overview

Our CI/CD pipeline consists of three main workflows:

1. **CI** - Continuous Integration for pull requests and pushes
2. **Prepare Release** - Automated release preparation with version bumping
3. **Release** - Automated GitHub release creation

## Workflows

### 1. CI Workflow (`ci.yml`)

**Triggers:** Push to main/develop branches, Pull requests

**Purpose:** Ensures code quality and compatibility

**Jobs:**
- **test** - Runs on multiple Node.js versions (16, 18, 20)
  - Installs dependencies
  - Runs ESLint
  - Builds minified files
  - Verifies build outputs

- **compatibility** - Tests JavaScript/CSS syntax validation
  - Validates all JS files
  - Basic CSS syntax checking

- **code-quality** - Code formatting and bundle analysis
  - Prettier formatting checks
  - Bundle size analysis with compression ratios

- **security** - Security and sensitive data checks
  - npm audit for vulnerabilities
  - Scans for potential sensitive data

### 2. Prepare Release Workflow (`prepare-release.yml`)

**Triggers:** Manual workflow dispatch

**Purpose:** Prepares a release with proper version bumping and PR creation

**Inputs:**
- `version_type`: patch/minor/major
- `custom_version`: Optional custom version number

**Process:**
1. Bumps version in package.json and source files
2. Runs linting and builds minified files
3. Generates release notes from git history
4. Creates a release preparation branch
5. Opens a pull request for review

**Outputs:**
- Release preparation branch
- Pull request with version changes
- Generated release notes

### 3. Release Workflow (`release.yml`)

**Triggers:** 
- Git tags matching `v*` pattern (automatic)
- Manual workflow dispatch

**Purpose:** Creates official GitHub releases with all assets

**Process:**
1. Installs dependencies and runs quality checks
2. Builds distribution files
3. Creates multiple release archives:
   - `datatables-chart-dist.zip` - Production files only
   - `datatables-chart-src.zip` - Source files and examples
   - `datatables-chart-complete.zip` - Complete package
4. Generates changelog from commit history
5. Creates GitHub release with all assets

**Assets Included:**
- Zip archives (3 variants)
- Individual JS/CSS files
- Generated changelog

## Usage Examples

### Creating a Patch Release

1. **Automated Approach:**
   ```
   GitHub Actions → Prepare Release → Run workflow
   Select "patch" → Review PR → Merge → Tag gets created → Release published
   ```

2. **Manual Approach:**
   ```bash
   git tag v1.0.1
   git push origin v1.0.1
   # Release workflow runs automatically
   ```

### Creating a Minor/Major Release

1. Use the "Prepare Release" workflow with appropriate version type
2. Review the created pull request
3. Merge when ready
4. Create and push the git tag

### Manual Release

1. Go to GitHub Actions → "Release"
2. Click "Run workflow"
3. Enter version (e.g., `v1.2.0`)
4. Release is created immediately

## File Structure

```
.github/
├── workflows/
│   ├── ci.yml              # Continuous Integration
│   ├── prepare-release.yml # Release Preparation
│   └── release.yml         # Release Creation
├── ISSUE_TEMPLATE/
│   └── release-planning.md # Release planning template
└── README.md              # This file
```

## Release Assets Explained

### Distribution Archive (`datatables-chart-dist.zip`)
Ready-to-use files for production:
- Minified JavaScript
- CSS stylesheet
- Basic documentation

### Source Archive (`datatables-chart-src.zip`)
Development and learning resources:
- Source JavaScript and CSS
- Complete examples
- Full documentation

### Complete Archive (`datatables-chart-complete.zip`)
Everything except:
- node_modules
- .git directory
- Temporary files

## Workflow Permissions

All workflows require these permissions:
- `contents: write` - For creating releases and updating files
- `pull-requests: write` - For creating pull requests (prepare-release only)

## Environment Variables

The workflows use these GitHub secrets:
- `GITHUB_TOKEN` - Automatically provided by GitHub

## Troubleshooting

### Common Issues

**Release workflow fails:**
1. Check that the tag starts with 'v' (e.g., v1.0.0)
2. Verify build scripts complete successfully
3. Ensure repository permissions are correct

**Missing release assets:**
1. Check build step logs in the workflow
2. Verify file paths in workflow configuration
3. Ensure terser build completes without errors

**Version conflicts:**
1. Delete conflicting tags: `git tag -d v1.0.0`
2. Push deletion: `git push --delete origin v1.0.0`
3. Fix version issues and recreate tag

### Debugging Steps

1. Check workflow logs in GitHub Actions tab
2. Verify local build works: `npm run build`
3. Test scripts locally with `scripts/release-helper.sh`
4. Ensure package.json scripts are working

## Best Practices

1. **Always use the prepare-release workflow** for planned releases
2. **Review pull requests** created by prepare-release workflow
3. **Test locally** before pushing tags
4. **Use semantic versioning** (MAJOR.MINOR.PATCH)
5. **Document breaking changes** in release notes

## Local Development

Use the provided helper script for local testing:
```bash
./scripts/release-helper.sh
```

This script provides:
- Pre-release checks
- Local building and testing
- Version bumping
- Archive creation

## Support

For workflow issues:
1. Check the workflow logs
2. Review this documentation
3. Open an issue with the "release" label
4. Include workflow run details