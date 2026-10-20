from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
import mariadb

app = FastAPI()

# -----------------------------------
# ARCHIVOS ESTÁTICOS (IMÁGENES)
# -----------------------------------

app.mount(
    "/Uploads",
    StaticFiles(directory="/var/www/webs/WebChulesRPG/Uploads"),
    name="Uploads"
)

# -----------------------------------
# CONEXIÓN DB
# -----------------------------------

def get_connection():

    return mariadb.connect(
        host="localhost",
        user="cacahuet",
        password="changeme69",
        database="chulesrpg"
    )

# -----------------------------------
# HOME
# -----------------------------------

@app.get("/")
def home():

    return {
        "message": "ChulesRPG API funcionando"
    }

# -----------------------------------
# OBTENER TODOS LOS ASSETS
# -----------------------------------

@app.get("/assets")
def get_assets():

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT
            assets_id,
            name,
            votes,
            health,
            damage,
            defense,
            speed,
            value,
            cost,
            description,
            type,
            date,
            author,
            category
        FROM assets
    """)

    assets = []

    for row in cursor:

        assets.append({
            "id": row[0],
            "name": row[1],
            "votes": row[2],
            "health": row[3],
            "damage": row[4],
            "defense": row[5],
            "speed": row[6],
            "value": row[7],
            "cost": row[8],
            "description": row[9],
            "type": row[10],
            "date": str(row[11]),
            "author": row[12],
            "category": row[13]
        })

    conn.close()
    return assets

# -----------------------------------
# OBTENER FILES DE UN ASSET
# -----------------------------------

@app.get("/assets/{asset_id}/files")
def get_asset_files(asset_id: int):

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT files_id, name, image, asset_id
        FROM files
        WHERE asset_id=?
    """, (asset_id,))

    files = []

    for row in cursor:

        files.append({
            "files_id": row[0],
            "name": row[1],
            "image": row[2],
            "asset_id": row[3]
        })

    conn.close()
    return files

# -----------------------------------
# ASSETS + FILES (FULL)
# -----------------------------------

@app.get("/assets/full")
def get_assets_full():

    conn = get_connection()
    cursor = conn.cursor()

    # Assets
    cursor.execute("""
        SELECT
            assets_id,
            name,
            votes,
            health,
            damage,
            defense,
            speed,
            value,
            cost,
            description,
            type,
            date,
            author,
            category
        FROM assets
    """)

    assets = []

    for row in cursor:

        assets.append({
            "id": row[0],
            "name": row[1],
            "votes": row[2],
            "health": row[3],
            "damage": row[4],
            "defense": row[5],
            "speed": row[6],
            "value": row[7],
            "cost": row[8],
            "description": row[9],
            "type": row[10],
            "date": str(row[11]),
            "author": row[12],
            "category": row[13],
            "files": []
        })

    # Files
    cursor.execute("""
        SELECT files_id, name, image, asset_id
        FROM files
    """)

    files = cursor.fetchall()

    # Asociar files
    for f in files:

        file_obj = {
            "files_id": f[0],
            "name": f[1],
            "image": f[2],
            "asset_id": f[3]
        }

        for asset in assets:

            if asset["id"] == file_obj["asset_id"]:

                asset["files"].append(file_obj)
                break

    conn.close()
    return assets

# -----------------------------------
# OBTENER UN ASSET
# -----------------------------------

@app.get("/assets/by-id/{asset_id}")
def get_asset(asset_id: int):

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT
            assets_id,
            name,
            votes,
            health,
            damage,
            defense,
            speed,
            value,
            cost,
            description,
            type,
            date,
            author,
            category
        FROM assets
        WHERE assets_id=?
    """, (asset_id,))

    row = cursor.fetchone()

    conn.close()

    if row is None:

        return {
            "error": "Asset no encontrado"
        }

    return {
        "id": row[0],
        "name": row[1],
        "votes": row[2],
        "health": row[3],
        "damage": row[4],
        "defense": row[5],
        "speed": row[6],
        "value": row[7],
        "cost": row[8],
        "description": row[9],
        "type": row[10],
        "date": str(row[11]),
        "author": row[12],
        "category": row[13]
    }
