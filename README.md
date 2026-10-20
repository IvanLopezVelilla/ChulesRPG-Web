# ChulesRPG Community Website

A community platform for **ChulesRPG**, an indie RPG project. Players can explore game content, submit their own assets, and take part in a small community space. A separate game client consumes asset data through the project's API.

This repository contains the website and its game-facing API. The game client is maintained separately.

[ChulesRPG oficial website](https://ventiqkhrs.cc.cd/)

## Project overview

The site connects a player-contributed content workflow with the RPG: users submit categorized assets and images through the website, while the API exposes asset and file data for use by the game. The website also provides account, gallery, news, changelog, and forum experiences.

### Main features

- **Asset gallery:** browse, search, sort, and filter community submissions.
- **Asset contributions:** submit categorized assets and their associated images.
- **Player accounts:** registration, login, session-aware navigation, and logout.
- **Community pages:** news, changelog, and forum discussions.
- **Asset interactions:** voting and asset detail views.
- **Administration flows:** controls for managing selected community content.
- **Game integration:** a FastAPI service returns assets and associated file metadata.

## Technology and skills

| Area | Technologies |
| --- | --- |
| Frontend | HTML5, CSS3, JavaScript (vanilla) |
| Website backend | PHP, PDO |
| Game-facing API | Python, FastAPI, Uvicorn |
| Database | MySQL / MariaDB |
| Python database access | MariaDB Connector/Python |

The project demonstrates full-stack feature development across a browser UI, server-side endpoints, relational data access, file uploads, and an API integration boundary between a website and a game client.

## Architecture

```text
Player's browser
  └── HTML / CSS / JavaScript
      └── Ajax/*.php ── PHP + PDO ── MySQL / MariaDB
                                      │
                                      └── community accounts and game assets

Game client
  └── FastAPI (chules_api/app.py) ───── MySQL / MariaDB
       └── /Uploads static files
```

- The browser uses PHP endpoints in `Ajax/` for website operations.
- PHP's `db.php` contains the PDO data-access methods used by those endpoints.
- The FastAPI service exposes asset and file data for the game client.
- Uploaded files are stored under `Uploads/`; the API also mounts this directory for static access.

## Repository layout

```text
Ajax/          PHP endpoints for website features
Assets/        Static website imagery
JS/            Browser-side behavior
Styles/        Page and component styles
Uploads/       Runtime upload location; user files are not tracked
chules_api/    FastAPI service
*.html         Website pages
db.php         PDO connection and database methods
```

## Run locally

### Requirements

- PHP with the PDO MySQL extension enabled
- MySQL or MariaDB
- Python 3.10 or newer
- MariaDB Connector/C development files if the Python driver needs to compile from source

### 1. Prepare a database

Create a local MySQL/MariaDB database and a dedicated application user with only the permissions the app needs. The database schema is included in the files as a sql file "chulesrpg.sql".

The PHP and Python services each have database connection settings in their source. Configure those settings for your local environment before starting either service, and never commit real credentials.

### 2. Start the website

From the repository root:

```sh
php -S 127.0.0.1:8000
```

Visit <http://127.0.0.1:8000>.

The PHP development server is for local development only; use a properly configured PHP web server for deployment.

### 3. Start the API

In a separate terminal:

```sh
python3 -m venv chules_api/.venv
. chules_api/.venv/bin/activate
pip install fastapi uvicorn mariadb
python -m uvicorn app:app --app-dir chules_api --reload --host 127.0.0.1 --port 8001
```

- API root: <http://127.0.0.1:8001/>
- Interactive API documentation: <http://127.0.0.1:8001/docs>

The API currently mounts uploads from `/var/www/webs/WebChulesRPG/Uploads`. If the project is located elsewhere, update that path in `chules_api/app.py`. Ensure the web server can write to the `Uploads/` directory if asset uploads are enabled.

## API overview

The FastAPI service currently includes endpoints to:

- Check that the API is running (`GET /`).
- Retrieve assets (`GET /assets`).
- Retrieve an asset's files (`GET /assets/{asset_id}/files`).
- Retrieve assets together with their files (`GET /assets/full`).
- Retrieve an individual asset (`GET /assets/by-id/{asset_id}`).

The interactive OpenAPI page at `/docs` provides the request and response details when the API is running.

## Security and deployment notes

- Do not publish local uploads, database exports, backups, or real database credentials. The repository's `.gitignore` excludes common local and generated files, but it does not remove files already tracked or prevent a web server from serving them.
- Login and registration currently send credentials in URL query parameters. Avoid exposing this version publicly until those flows use request bodies and the site is served over HTTPS.
- The API exposes the `Uploads/` directory as static content. Keep database exports and other private files out of that directory, and review access controls before deployment.
- The included PHP development server and Uvicorn reload command are intended for local development, not production deployment.

## Current scope and future improvements

- The game client is outside this repository; the homepage's `ChulesRPG.zip` download target is not included. Link it to a published release when one is available.
- A clean database schema or migration set and an automated test suite are not currently included.
- Production deployment configuration, including secret management, upload access controls, and hardened server settings, must be provided by the deployment environment.

---

**Personal project** · Built to explore a community contribution workflow and connect a web platform to an RPG through a shared database and API.

## License

Add a license before redistributing or accepting contributions. If you choose an open-source license, include its text in a `LICENSE` file.

## Author

**Iván López**  
[GitHub](https://github.com/IvanLopezVelilla) · [LinkedIn](https://www.linkedin.com/in/iv%C3%A1n-l%C3%B3pez-fern%C3%A1ndez-30b994415/?isSelfProfile=true)
