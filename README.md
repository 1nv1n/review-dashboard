# crucible-dashboard

<p align="center">
 <a href="https://raw.githubusercontent.com/InViN/crucible-dashboard/master/package.json">
  <img src="https://badge.fury.io/gh/InViN%2Fcrucible-dashboard.svg" alt="version" />
 </a>
 <a href="https://opensource.org/licenses/Apache-2.0">
  <img src="https://img.shields.io/badge/License-Apache%202.0-blue.svg" alt="license-apache-2.0" />
 </a>
 <a href="https://gitter.im/crucible-dashboard">
  <img src="https://badges.gitter.im/Join%20Chat.svg" alt="gitter" />
 </a>
 <a href="https://github.com/InViN/crucible-dashboard/pulls">
  <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="pr-welcome" />
 </a>
</p>
<p align="center">
 <a href="https://circleci.com/gh/InViN/crucible-dashboard">
  <img src="https://circleci.com/gh/InViN/crucible-dashboard.svg?style=shield" alt="circle-ci" />
 </a>
 <a href="https://codeclimate.com/github/InViN/crucible-dashboard/maintainability">
  <img src="https://api.codeclimate.com/v1/badges/a0494913c00643a957e4/maintainability" alt="code-climate"/>
 </a>
 <a href="https://snyk.io/test/github/InViN/crucible-dashboard">
  <img src="https://snyk.io/test/github/InViN/crucible-dashboard/badge.svg" alt="Known Vulnerabilities" data-canonical-src="https://snyk.io/test/github/InViN/crucible-dashboard" style="max-width:100%;" />
 </a>
 <a href="https://david-dm.org/InViN/crucible-dashboard">
  <img src="https://david-dm.org/InViN/crucible-dashboard.svg" alt="davis-dm" />
 </a>
</p>

---

### Built With

<p align="center">
 <a href="https://electronjs.org/">
  <img src="https://raw.githubusercontent.com/InViN/crucible-dashboard/master/resources/logo/electron-logo.svg?sanitize=true" alt="ElectronJS" height="100" width="100" />
 </a>
 <a href="https://getbootstrap.com/">
  <img src="https://raw.githubusercontent.com/InViN/crucible-dashboard/master/resources/logo/bootstrap-logo.svg?sanitize=true" alt="ElectronJS" height="100" width="100" />
 </a>
</p>

---

### Run From Source
```
git clone https://github.com/InViN/crucible-dashboard.git
cd crucible-dashboard
npm install
npm start
```

---

### Build Executable
```
git clone https://github.com/InViN/crucible-dashboard.git
cd crucible-dashboard
npm install
npm run build
```
This will create the following executable containing directories:
 - CrucibleDashboard-win32-x64
 - CrucibleDashboard-linux-x64
 - CrucibleDashboard-darwin-x64

---

### Usage

- After launching CrucibleDashboard.exe, input the full server address for your Crucible instance (eg: crucible.server.com).
  - Toggle between `http` & `https` as needed.
  - Use the "+" button to add multiple server instances.
- Input your username & password. Assuming a successful login, the App should load up.
- Navigate through the App by using the button bar (below the App logo).
- 'Create' brings up a dialog to create a new Review.
- 'Search' brings up a dialog to search for Reviews by JIRA identifiers (if properly linked).
- 'Pending' updates the page with a table of pending reviews (reviews that you need to complete).
- 'Open' updates the page with a table of open reviews (reviews that you have created & are currently open).
- 'Statistics' updates the page with review statistics.

---

### Feature/Component Progress:

- [ ] (In progress) Graph Review Statistics
- [x] Display Open Reviews
- [x] Display Pending Reviews
- [x] Create Review
- [ ] Close Open Review
- [ ] Open Review Remind Reviewers
- [ ] Complete Pending Review
- [ ] Add Change Sets to Review
- [ ] Review Reminders (Tray Notification)
- [ ] Diff. Change Sets
- [ ] Add Toast Notifications
- [ ] Add Themes
- [x] Multi Server Authentication
- [x] Electron Forge Integration
 
---

### Other To-Dos

 - Update electronPackagerConfig
 - Update installer config. with loading GIF & icon.
 - Update config. for Linux & Mac installer.
 - Vanilla JS -> Angular 6
 - End-to-End Tests

---

### Work-In-Progress

![crucible-dash](https://i.imgur.com/exBc6QZ.gif)

---
