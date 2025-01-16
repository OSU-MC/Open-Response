# Contributing to MyClassroom
Thank you for your interest in contributing to MyClassroom! This document provides the guidelines for contributing to our GitHub repository.

## Getting Started
Before contributing, please ensure you have a GitHub account. To participate, you can fork the repository, push your contributions to your fork, and then submit a pull request (PR) to our project.

### Creating Issues
Before starting work on a feature, please create an issue detailing the problem you intend to solve or the feature you want to implement. This helps us track what's being worked on and discuss potential changes before they're implemented.

#### Issue Templates
- **Bug Report**: Use this template for reporting bugs. Include steps to reproduce, expected behavior, and any other relevant information.
- **Feature Request**: Use this template to propose new features. Describe the problem your feature solves, your proposed solution, and any alternative solutions you've considered.

#### Tracking Issues
All issues are tracked in the MyClassroom [GitHub Project](https://github.com/orgs/OSU-MC/projects/1). Here, assignments, statuses, milestones, and timelines are managed to keep our development process smooth and transparent.

### Branch/Tag Structure
Our development process involves the following branch structure:
- **Feature Branches:** All features should be developed on individual feature branches created from the `main` branch.
- **`main` Branch:** Once a feature is complete, tested, and reviewed, submit a pull request to the `main` branch.
- **Tags:** Cumulative updates in the `main` branch are considered for tagging into release versions, holding the stable release.

### Working on Features
1. Fork the repository.
2. Create a new branch from `main` for your feature. Branch name should be descriptive of the feature.
3. Commit your changes. Write meaningful commit messages that explains what you've done and why.
4. Push your changes to your fork.
5. Submit a pull request from your feature branch to the `main` branch.

### Pull Requests
- Ensure that your PR title and description are descriptive and concise.
- Attach the PR to the related issue.
- Reviews will be automatically requested from the appropriate team:
  - **Core (@OSU-MC/backend-team)**: All changes within the `/core/` directory.
  - **Client (@OSU-MC/frontend-team)**: All changes within the `/client/` directory.
  - **General (@OSU-MC/myclassroom)**: Changes in the parent directory or affecting multiple areas.
- PRs will be reviewed according to the order they are received. Once approved, they can be merged into `main` with the merge queue.

### Code Review
As an open source project, we welcome contributions from everyone. Here are some things you can do to make your contributions easier for others to review:
- Keep your changes focused. If there are multiple changes you want to make, consider splitting them into separate PRs.
- Write tests where possible and ensure existing tests pass.
- Follow the coding standards and guidelines of the project.

## Technologies
- **Frontend:** React.js
- **Backend:** Node.js

Your contributions are vital to the success of MyClassroom, and we look forward to reviewing your innovative features and improvements. Let's create something amazing together!
