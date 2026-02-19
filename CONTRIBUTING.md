# Contributing to NeoTrace

Thank you for your interest in contributing to NeoTrace! This document provides guidelines and instructions for contributing.

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on the code, not the person

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/yourname/NeoTrace.git`
3. Create a feature branch: `git checkout -b feature/your-feature-name`
4. Install dependencies: `npm install`
5. Start development: `npm start`

## Development Guidelines

### Code Style
- Use ES6+ syntax
- Consistent indentation (2 spaces)
- Meaningful variable names
- Comments for complex logic
- No console output in production code

### Testing Before Commit
- Verify the application starts without errors
- Test all affected pages/features in browser
- Check API endpoints with curl or Postman
- Validate in both English and Chinese (if i18n changes)

### Commit Messages
Follow conventional commits:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Formatting changes
- `refactor:` Code restructuring
- `perf:` Performance improvements
- `test:` Adding tests

Example: `feat: add dark mode toggle to dashboard`

## Pull Request Process

1. Update README.md with new features or changes
2. Update i18n.js if adding user-facing text
3. Ensure no breaking changes
4. Include screenshots for UI changes
5. Reference any related issues

## Reporting Bugs

Include:
- Clear description of the bug
- Steps to reproduce
- Expected vs actual behavior
- Environment (Node version, OS, browser)
- Screenshots if applicable

## Feature Requests

- Describe the feature and use case
- Explain why it would be valuable
- Suggest a possible implementation (optional)

---

Thank you for contributing! 🎉
