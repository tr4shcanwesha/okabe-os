<p align="center">
  <img width="1913" height="1023" alt="image" src="https://github.com/user-attachments/assets/b6f3a1ec-32da-48b0-b82b-93ff1eec940d" />
</p>

<h1>OKABE-OS</h1>

<p>
  An interactive retro-style operating system built for the GDG Tech Hunt.
</p>

---

## Development

OKABE-OS is currently under active development. The project is built with vanilla HTML, CSS and JavaScript.

> [!IMPORTANT]
> **Do not commit or push changes directly to `main`.**
>
> All development must be done on the `development` branch.
>
> ```bash
> git checkout development
> git pull origin development
> ```
>
> Push your changes to `development`. Once they are tested and ready, they can be merged into `main`.

> [!NOTE]
> The project structure and available applications may change as development continues. Check the existing code before introducing new patterns or dependencies.

## Project Structure

```text
okabe-os/
│
├── index.html
├── script.js              # Core OS functionality
├── style.css              # Global styling
│
└── wordle/
    ├── wordle.js          # Wordle application logic
    └── wordle.css         # Wordle-specific styling
````

## Core OS

`script.js` contains functionality shared across the operating system, including:

* Desktop and icons
* Window management
* Taskbar
* Start menu
* Virtual filesystem
* Message boxes
* Shared OS utilities

> [!WARNING]
> Avoid adding application-specific logic to `script.js` unless the functionality is genuinely part of the core OS.

## Adding an Application

Each application should have its own directory.

```text
new-app/
├── new-app.js
└── new-app.css
```

Add the required files to `index.html`:

```html
<link rel="stylesheet" href="new-app/new-app.css">
<script src="new-app/new-app.js"></script>
```

Use the existing OS functions when integrating applications with the desktop and window system.

```js
addDesktopIcon(...)
openWindow(...)
showMessageBox(...)
```

> [!TIP]
> Keep application-specific code inside its own directory and reuse existing OS components instead of creating duplicate functionality.

## Development Guidelines

* Keep applications modular.
* Reuse existing OS components.
* Maintain the existing visual language.
* Avoid duplicating functionality already provided by the core OS.
* Test new features with multiple windows and applications open.
* Keep hunt logic separate from reusable OS functionality.

> [!WARNING]
> Do not expose or hardcode hunt solutions, answers, or hidden clues unnecessarily.

## Roadmap

Planned applications and features include:

* GitHub
* Browser
* File Explorer
* Terminal
* Image Viewer
* Mail
* Additional utilities
* Hidden files and interactions

## Running Locally

No build system is currently required.

Open `index.html` directly, or use VS Code with Live Server.

## Live

[https://okabe-os.vercel.app/](https://okabe-os.vercel.app/)

---

<p align="center">
  Built for GDG on Campus — CMR Institute of Technology
</p>
