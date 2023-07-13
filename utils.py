import json
import os

class json_utilities:
    def get_json_data(json_path):
        json_content = None
        if json_path is not None and os.path.exists(json_path):
            with open(json_path, 'r', encoding='utf-8-sig') as json_data:
                json_content = json_data.read()

        json_content = json.loads(json_content) if json_content is not None else None
        return json_content