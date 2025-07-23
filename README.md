# C. elegans Strain Ortholog Browser

A small Flask application for exploring C. elegans strain data and mapped human orthologs. All raw data files live in the `data/` directory and are loaded when the backend starts.

## Project Layout

- **backend/** – Flask API server
- **frontend/** – static HTML/JS/CSS
- **data/** – strain and phenotype tables.

## Running Locally

1. Install Python 3.
2. Install dependencies:
   ```bash
   pip install -r backend/data/requirements.txt
   ```
3. Start the server:
   ```bash
   python backend/app.py
   ```
   The app will run at `http://localhost:5000`.
4. Open that URL in your browser to use the site.

## API Endpoints

- `/api/search?query=<term>` — search within the ortholog table.
- `/api/phenotypes` — list phenotype descriptions.
- `/<filename>` — download files such as `ortholog_table.tsv`.

## Deploying

Copy the repository (including the `data/` folder) to any machine with Python and run the commands in the "Running Locally" section. For continuous availability you should use a production WSGI server such as Gunicorn and manage it with `systemd`.

Example `systemd` unit:

```ini
[Unit]
Description=C. elegans Browser
After=network.target

[Service]
WorkingDirectory=/path/to/C.elegans-Strain-Ortholog-Browser
ExecStart=/usr/bin/gunicorn -w 4 -b 0.0.0.0:8000 backend.app:app
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable and start it with:

```bash
sudo systemctl enable mybrowser.service
sudo systemctl start mybrowser.service
```

The frontend is fully static; you can also host `frontend/public` with any standard web server if desired.