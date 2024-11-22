import modules.shared as shared

from modules import scripts

def on_ui_settings():

    section = ('chatgpt_prompts', 'ChatGPT Prompts')

    shared.opts.add_option("gptp_openai_api_key", shared.OptionInfo("", "OpenAI API Key", section=section))
    shared.opts.add_option("gptp_deepl_api_key", shared.OptionInfo("", "DeepL API Key", section=section))

scripts.script_callbacks.on_ui_settings(on_ui_settings)
