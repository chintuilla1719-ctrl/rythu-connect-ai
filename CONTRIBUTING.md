# Contributing to Rythu Connect AI

Thank you for your interest in contributing to **Rythu Connect AI**. This document provides guidelines for students, developers, and contributors who wish to improve the project. Following these guidelines helps maintain code quality, consistency, and collaboration among team members.

---

# Project Overview

Rythu Connect AI is an intelligent farming assistance platform designed to help farmers make informed decisions. The system provides services such as crop recommendations, disease detection, weather updates, market price analysis, and AI-powered farmer support.

The goal of this project is to improve agricultural productivity through the use of Artificial Intelligence and Data Analytics.

---

# Ways to Contribute

Contributors can participate in the project through:

## 1. Feature Development

Develop and improve project features such as:

- Crop Recommendation System
- Disease Detection Module
- Weather Forecast Integration
- Market Price Analysis
- AI Chatbot for Farmer Queries
- User Authentication System
- Farmer Dashboard

## 2. Bug Fixing

Identify and fix:

- UI/UX issues
- API integration errors
- Database issues
- Performance bottlenecks
- Security vulnerabilities

## 3. Documentation

Improve project documentation by:

- Updating README.md
- Improving USER_MANUAL.md
- Updating AGENTS.md
- Adding screenshots and examples
- Fixing grammatical errors

## 4. Testing

Contributors can:

- Perform manual testing
- Create test cases
- Report bugs
- Verify fixes
- Test application functionality across devices

---

# Development Environment Setup

## Prerequisites

Install the following software:

- Node.js (14+)
- npm
- MongoDB
- Git
- Visual Studio Code or another editor

### Frontend

- HTML5
- CSS3
- JavaScript

### Backend

- Python 3.x

### Database

- MySQL / SQLite

### Version Control

- Git

### IDE

- Visual Studio Code

---

# Repository Setup

Clone the repository:

````bash
git clone git clone https://code.swecha.org/Prashanth15/rythu-connect-ai.git
```<repository-url>
````

Navigate to project folder:

```bash
cd rythu-connect-ai
```

Open the project:

```bash
code .
```

---

# Branching Strategy

Each contributor should create a separate branch before making changes.

## Branch Naming Format

### Feature Branches

```text
feature/feature-name
```

Examples:

```text
feature/crop-recommendation
feature/weather-module
feature/market-analysis
```

### Bug Fix Branches

```text
bugfix/bug-description
```

Examples:

```text
bugfix/login-error
bugfix/api-timeout
```

### Documentation Branches

```text
docs/document-update
```

Examples:

```text
docs/readme-update
docs/user-manual
```

---

# Coding Guidelines

## General Rules

- Write clean and readable code.
- Follow proper indentation.
- Use meaningful variable names.
- Remove unnecessary code.
- Avoid code duplication.
- Add comments where required.

### Good Example

```python
def calculate_crop_yield(area, productivity):
    return area * productivity
```

### Bad Example

```python
def c(a,b):
 return a*b
```

---

# Commit Guidelines

Commit changes frequently with meaningful messages.

## Commit Message Format

```text
<type>: <description>
```

### Examples

```text
feat: added crop recommendation module
fix: corrected weather API response
docs: updated user manual
style: improved dashboard design
test: added disease prediction test cases
```

---

# Pull Request Guidelines

Before creating a pull request:

### Checklist

- Code compiles successfully.
- Feature works correctly.
- No unnecessary files included.
- Documentation updated.
- Code reviewed by team members.

### Pull Request Template

Title:

```text
Added Crop Recommendation Feature
```

Description:

```text
Implemented crop recommendation system using soil and weather parameters.
Added UI and backend integration.
Updated documentation.
```

---

# Testing Guidelines

Before submitting code:

## Functional Testing

Verify:

- User registration
- User login
- Crop recommendation
- Disease detection
- Weather information
- Market price updates

## User Interface Testing

Check:

- Button functionality
- Form validation
- Responsive design
- Mobile compatibility

## Performance Testing

Ensure:

- Fast page loading
- Efficient API responses
- Smooth user experience

---

# Reporting Issues

When creating an issue, include:

## Issue Title

Example:

```text
Weather data not loading on dashboard
```

## Description

Provide:

- Detailed explanation
- Expected result
- Actual result
- Steps to reproduce

## Screenshots

Attach screenshots whenever possible.

---

# Documentation Standards

All documentation should:

- Use clear language.
- Include examples.
- Follow Markdown format.
- Be updated whenever features change.

Required documents:

- README.md
- CONTRIBUTING.md
- USER_MANUAL.md
- AGENTS.md

---

# Code Review Process

Every contribution should be reviewed before merging.

Reviewers should verify:

- Code quality
- Functionality
- Documentation updates
- Security considerations
- Performance impact

---

# Security Guidelines

Contributors must:

- Never expose API keys.
- Never commit passwords.
- Validate user input.
- Follow secure coding practices.
- Protect sensitive information.

---

# Team Collaboration Rules

- Communicate respectfully.
- Share progress regularly.
- Resolve conflicts professionally.
- Help other team members when needed.
- Maintain transparency in development.

---

# Contact Information

For project-related queries, contact the project maintainers through the repository discussion section or team communication channels.

---

# Acknowledgements

We appreciate all contributors who help improve Rythu Connect AI and support the mission of empowering farmers through technology.

Thank you for contributing to Rythu Connect AI.
