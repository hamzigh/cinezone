# CineZone

Full-stack movie browsing app with an Angular UI and Express API.

## Run Locally

From the project root:

```bash
./run.sh
```

Optional ports:

```bash
SERVER_PORT=3000 UI_PORT=4200 ./run.sh
```

The script installs missing dependencies, starts the API from `server/`, starts the Angular UI from `ui/`, and stops both processes when you press `Ctrl+C`.
