
import json
import urllib.request
import gradio as gr
import modules.shared as shared
import modules.script_callbacks as script_callbacks

from fastapi import FastAPI
from pydantic import BaseModel


class TranslationRequest(BaseModel):
    text: str
    target_lang: str = 'EN'


class GptpApi():

    BASE_PATH = '/gptp'

    def get_path(self, path):
        return f"{self.BASE_PATH}{path}"

    def add_api_route(self, path: str, endpoint, **kwargs):
        return self.app.add_api_route(self.get_path(path), endpoint, **kwargs)

    def start(self, _: gr.Blocks, app: FastAPI):
        self.app = app
        self.add_api_route('/translate', self.get_translation, methods=['POST'])

    def get_translation(self, translation_request: TranslationRequest):

        req = urllib.request.Request(
            shared.opts.gptp_deepl_api_url,
            method='POST',
            headers={
                'Content-Type': 'application/json',
                'Authorization': f'DeepL-Auth-Key {shared.opts.gptp_deepl_api_key.strip()}'
            },
            data=json.dumps({
                'text': [translation_request.text],
                'target_lang': translation_request.target_lang
            }).encode('utf-8'),
        )

        try:
            with urllib.request.urlopen(req) as response:
                response_data = response.read()
                response_text = response_data.decode('utf-8')
                response_json = json.loads(response_text)
                translated_text = response_json['translations'][0]['text']
                return {'text': translated_text}
        except urllib.error.HTTPError as e:
            error_details = e.read().decode('utf-8')
            return {'error': f'HTTP error {e.code}: {e.reason}', 'details': error_details}
        except urllib.error.URLError as e:
            return {'error': f'URL error: {e.reason}'}
        except Exception as e:
            return {'error': f'An unexpected error occurred: {str(e)}'}


try:
    api = GptpApi()
    script_callbacks.on_app_started(api.start)
except:
    pass