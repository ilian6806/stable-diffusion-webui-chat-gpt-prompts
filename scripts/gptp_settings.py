import modules.shared as shared
import gradio as gr

from modules import scripts

def on_ui_settings():

    section = ('chatgpt_prompts', 'ChatGPT Prompts')

    shared.opts.add_option("gptp_openai_api_key", shared.OptionInfo("", "OpenAI API Key", section=section))

    shared.opts.add_option("gptp_openai_model", shared.OptionInfo(
        "gpt-4o",
        "OpenAI Model",
        section=section
    ).info("Supported models: gpt-4o and above"))

    shared.opts.add_option("gptp_deepl_api_url", shared.OptionInfo(
        "https://api-free.deepl.com/v2/translate",
        "DeepL API URL",
        section=section
    ).info("Must be changed to 'https://api.deepl.com/v2/translate' for paid accounts"))

    shared.opts.add_option("gptp_deepl_api_key", shared.OptionInfo("", "DeepL API Key", section=section))

scripts.script_callbacks.on_ui_settings(on_ui_settings)
