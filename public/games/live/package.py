import json
import sys
import os
# import shutil
# from urllib import request
# from rjsmin import jsmin

ROOT = './'
# TARGET = '/games/s3package'
INJECTED_SCRIPT_FILE = "./inject.js"
# MAP_HOST = (
    # os.environ.get("MAP_HOST").rstrip("/") or "https://api.skillprint.co"
# )
# GAME_IDS_URL = "https://qa-marketplace.skillprint.co/games/map.json/" # f"{MAP_HOST}/v2/games/map.json"

# TARGET_ORIGIN = (
    # os.environ.get("TARGET_ORIGIN").rstrip("/") or "https://app.skillprint.co"
# )

if __name__ == "__main__":
    with open(INJECTED_SCRIPT_FILE, 'r') as injected_script_file:
        injected_js = injected_script_file.read()
    print(
        f"Contents of {INJECTED_SCRIPT_FILE} will be injected in index.html "
        f"when packaging."
    )

    # print(f"Fetching game -> id map from {GAME_IDS_URL}...")
    # response = request.urlopen(GAME_IDS_URL)
    # id_dict = json.loads(response.read())

    # # id_dict has a structure of { game_name: { id: game_id, s3_path: uuid } }
    # id_map = {game_name: id_dict[game_name]["s3_path"] for game_name in id_dict}

    # assert isinstance(id_map, dict), "Invalid mapping!"



    # # set the host origin that's allowed to play the game
    # injected_js = injected_js.replace("{% TARGET_ORIGIN %}", TARGET_ORIGIN)

    # print(id_map)

    for game in os.listdir(ROOT):
        path = os.path.join(ROOT, game)
        print(path)
        
        if path in ["./package.py", "./inject.js", "./SkillprintLib"]:
            continue
        
    #     print(game)
    #     # assert game in id_map, f"Game name not recognized: {game}!"
    #     assert "static" in os.listdir(path), f"No static directory for {game}!"
    #     indir = os.path.join(path, "static")
        outdir = os.path.join(path, "static")
    #     print(f"Copying assets: {game} -> {outdir}")
    #     shutil.copytree(
    #         indir,
    #         outdir,
    #         dirs_exist_ok=True
    #     )
        print(f"Injecting script into {outdir}/index.html")
        with open(f"{outdir}/index.html", "r+") as index:
            contents = index.read()
            index.seek(0)
    #         # this is ugly but has no dependencies so good enough for now
            index.write(
                contents.replace(
                    "<head>",
                    f"<head>\n<script>\n{injected_js}</script>\n"
                )
            )
    #     for dirpath, dirnames, filenames in os.walk(outdir):
    #         for filename in filenames:
    #             if filename.endswith('.js'):
    #                 file_path = os.path.join(dirpath, filename)
    #                 # load file
    #                 with open(file_path, "r") as text_file:
    #                     data = text_file.read()
    #                 # Perform minification
    #                 # Rewrite the file
    #                 with open(file_path, 'w') as filetowrite:
    #                     filetowrite.write(jsmin(data, keep_bang_comments=False))
    #                     print(f"Minifying successfully: {file_path}")
