# review-dashboard

<p align="center">
 <a href="https://github.com/InViN/review-dashboard/releases">
  <img src="https://badge.fury.io/gh/InViN%2Freview-dashboard.svg" alt="version" />
 </a>
 <a href="https://opensource.org/licenses/Apache-2.0">
  <img src="https://img.shields.io/badge/License-Apache%202.0-blue.svg" alt="license-apache-2.0" />
 </a>
 <a href="https://gitter.im/review-dashboard">
  <img src="https://badges.gitter.im/Join%20Chat.svg" alt="gitter" />
 </a>
 <a href="https://github.com/InViN/review-dashboard/pulls">
  <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="pr-welcome" />
 </a>
</p>
<p align="center">
 <a href="https://circleci.com/gh/InViN/review-dashboard">
  <img src="https://circleci.com/gh/InViN/review-dashboard.svg?style=shield" alt="circle-ci" />
 </a>
 <a href="https://codeclimate.com/github/InViN/review-dashboard/maintainability">
  <img src="https://api.codeclimate.com/v1/badges/c1ed2e39a2588049dc7f/maintainability" alt="code-climate"/>
 </a>
 <a href="https://snyk.io/test/github/InViN/review-dashboard">
  <img src="https://snyk.io/test/github/InViN/review-dashboard/badge.svg" alt="Known Vulnerabilities" data-canonical-src="https://snyk.io/test/github/InViN/review-dashboard" style="max-width:100%;" />
 </a>
 <a href="https://david-dm.org/InViN/review-dashboard">
  <img src="https://david-dm.org/InViN/review-dashboard.svg" alt="davis-dm" />
 </a>
</p>

---

### Built With

<p align="center">
 <a href="https://electronjs.org/">
  <img src="https://raw.githubusercontent.com/InViN/review-dashboard/master/resources/logo/electron-logo.svg?sanitize=true" alt="ElectronJS" height="100" width="100" />
 </a>
 <a href="https://getbootstrap.com/">
  <img src="https://raw.githubusercontent.com/InViN/review-dashboard/master/resources/logo/bootstrap-logo.svg?sanitize=true" alt="Bootstrap" height="100" width="100" />
 </a>
</p>

---

### Run From Source
```
git clone https://github.com/InViN/review-dashboard.git
cd review-dashboard
npm install
npm start
```

---

### Build Executable
```
git clone https://github.com/InViN/review-dashboard.git
cd review-dashboard
npm install
npm run build
```
This will create the following executable containing directories:
 - ReviewDashboard-win32-x64
 - ReviewDashboard-linux-x64
 - ReviewDashboard-darwin-x64

---

### Download (BETA)

- [Windows](https://github.com/InViN/review-dashboard/releases/download/v0.1.0-beta/ReviewDashboard-win32-x64.zip)
- [Linux](https://github.com/InViN/review-dashboard/releases/download/v0.1.0-beta/ReviewDashboard-linux-x64.zip)
- [Mac](https://github.com/InViN/review-dashboard/releases/download/v0.1.0-beta/ReviewDashboard-darwin-x64.zip)

---
### Usage
 
<details>
  <summary>
    Initial launch & Server Entry
    <ul>
      <li>
        Launch <code>ReviewDashboard.exe</code> & input the full server address for your Crucible instance (eg: crucible.server.com).
      </li>
      <ul>
        <li>
          Toggle between <code>http</code> & <code>https</code> as needed.
        </li>
        <li>
          Use the `+` button to add multiple server instances & hit `Save` once done to bring up the login screen.
        </li>
      </ul>
    </ul>
  </summary>
  <a href="#"><img src="https://imgur.com/nOmnfCz.gif" title="ReviewDashboard" /></a>
</details>

<details>
  <summary>
    Login
    <ul>
      <li>
        Input your username & password on the login screen.
      </li>
    </ul>
  </summary>
  <a href="#"><img src="https://imgur.com/Q8Gb8op.gif" title="ReviewDashboard" /></a>
</details>

<details>
  <summary>
    Use the button bar (below the App logo), to go through the views of the App.
  </summary>
  <a href="#"><img src="https://i.imgur.com/FsAOcFE.png" title="ReviewDashboard" /></a>
</details>

<details>
  <summary>
    <code>Create</code> button brings up a dialog to create a new Review.
  </summary>
  <a href="#"><img src="https://imgur.com/Szcg81J.gif" title="ReviewDashboard" /></a>
</details>

<details>
  <summary>
    <code>Search</code> brings up a dialog to search for Reviews by JIRA identifiers (if properly linked).
  </summary>
</details>

<details>
  <summary>
    <code>Pending</code> updates the App with a table of pending reviews (reviews that you need to complete).
  </summary>
  <a href="#"><img src="https://imgur.com/9q10ke8.gif" title="ReviewDashboard" /></a>
</details>

<details>
  <summary>
    <code>Open</code> updates the App with a table of open reviews (reviews that you have created & are currently open).
  </summary>
</details>

<details>
  <summary>
    <code>Statistics</code> updates the App with review statistics.
  </summary>
  <a href="#"><img src="https://imgur.com/MUL3k7G.gif" title="ReviewDashboard" /></a>
</details>

---

### Features

- [ ] (In progress) Graph Review Statistics
- [x] Display Open Reviews
- [x] Display Pending Reviews
- [x] Create Review
- [x] Close Open Review
- [ ] Open Review Remind Reviewers
- [x] Complete Pending Review
- [ ] Add Change Sets to Review
- [ ] Review Reminders (Tray Notification)
- [ ] Diff. Change Sets
- [x] Add Toast Notifications
- [ ] Add Themes
- [x] Multi Server Authentication
- [x] Electron Forge Integration
 
---

### Other To-Dos

 - Responsive Design
 - Update electronPackagerConfig
 - Update installer config. with loading GIF & icon.
 - Update config. for Linux & Mac installer.
 - Vanilla JS -> Angular 6
 - End-to-End Tests

---
