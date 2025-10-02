import os
import re
import json
import torch
from diffusers import DiffusionPipeline, QwenImageTransformer2DModel
from transformers.modeling_utils import no_init_weights
from dfloat11 import DFloat11Model
import shutil
import markdown
import bs4
from google import genai
from google.genai import types
import time 

global_pipeline = None

def get_or_create_pipeline():
    """Get existing pipeline or create new one for reuse across image generations"""
    global global_pipeline
    
    if global_pipeline is None:
        print("Creating new Qwen Image pipeline...")
        model_name = "Qwen/Qwen-Image"
        
        with no_init_weights():
            transformer = QwenImageTransformer2DModel.from_config(
                QwenImageTransformer2DModel.load_config(
                    model_name, subfolder="transformer",
                ),
            ).to(torch.bfloat16)

        DFloat11Model.from_pretrained(
            "DFloat11/Qwen-Image-DF11",
            device="cpu",
            cpu_offload=False,
            cpu_offload_blocks=None,
            pin_memory=True,
            bfloat16_model=transformer,
        )

        global_pipeline = DiffusionPipeline.from_pretrained(
            model_name,
            transformer=transformer,
            torch_dtype=torch.bfloat16,
        )
        global_pipeline.enable_model_cpu_offload()
        print("Pipeline created and moved to CUDA")
    else:
        print("Reusing existing pipeline")
    
    return global_pipeline

def extract_panel_content(markdown_file, target_page=None):
    """Extract pages and panels content from markdown file"""
    with open(markdown_file, 'r', encoding='utf-8') as file:
        content = file.read()
    
    html = markdown.markdown(content)
    soup = bs4.BeautifulSoup(html, 'html.parser')
    
    comic_structure = []
    
    pages = soup.find_all('h2')
    for page_idx, page in enumerate(pages):
        page_num = page_idx + 1
        
        if target_page is not None and page_num != target_page:
            continue
        
        page_content = {'page_number': page_num, 'panels': []}
        
        current = page.next_sibling
        while current and (not isinstance(current, bs4.element.Tag) or current.name != 'h2'):
            if isinstance(current, bs4.element.Tag) and current.name == 'h3':
                panel_content = {'panel_number': len(page_content['panels']) + 1, 'narration': '', 'dialogues': [], 'italic_text': ''}
                
                panel_element = current.next_sibling
                while panel_element and (not isinstance(panel_element, bs4.element.Tag) or 
                                        (panel_element.name != 'h3' and panel_element.name != 'h2')):
                    if isinstance(panel_element, bs4.element.Tag):
                        if panel_element.name == 'p':
                            if panel_element.em:
                                panel_content['italic_text'] += panel_element.text + ' '
                            elif panel_element.strong:
                                character = panel_element.strong.text.strip(':')
                                dialogue_text = panel_element.text[len(panel_element.strong.text):].strip()
                                if dialogue_text.startswith(':'):
                                    dialogue_text = dialogue_text[1:].strip()
                                panel_content['dialogues'].append({
                                    'character': character,
                                    'text': dialogue_text
                                })
                            else:
                                panel_content['narration'] += panel_element.text + ' '
                    
                    panel_element = panel_element.next_sibling
                
                panel_content['narration'] = panel_content['narration'].strip()
                panel_content['italic_text'] = panel_content['italic_text'].strip()
                page_content['panels'].append(panel_content)
            
            current = current.next_sibling
        
        comic_structure.append(page_content)
    
    return comic_structure

def extract_full_comic_structure(markdown_file):
    """Extract the entire comic structure with all pages and panels"""
    return extract_panel_content(markdown_file)

def extract_json_from_response(response_text):
    """Extract JSON from response text that might include markdown code blocks"""
    if "```json" in response_text:
        start_idx = response_text.find("```json") + 7
        end_idx = response_text.find("```", start_idx)
        if end_idx > start_idx:
            return response_text[start_idx:end_idx].strip()
    
    if "```" in response_text:
        start_idx = response_text.find("```") + 3
        end_idx = response_text.find("```", start_idx)
        if end_idx > start_idx:
            return response_text[start_idx:end_idx].strip()
    
    return response_text

def generate_character_descriptions(comic_structure, style):
    """Load character descriptions from st2nar/nar2nar output instead of generating new ones"""
    char_desc_path = os.path.join('output', 'character_descriptions.json')
    
    if os.path.exists(char_desc_path):
        with open(char_desc_path, 'r', encoding='utf-8') as f:
            character_descriptions = json.load(f)
        print(f"Loaded existing character descriptions for {len(character_descriptions)} characters")
        return character_descriptions
    else:
        print("No character descriptions found. Please run st2nar.py or nar2nar.py first.")
        return {}

def get_character_description(character_descriptions, character_name, page_num, panel_num):
    """Get the appropriate character description, including any variations for the specific panel"""
    if character_name not in character_descriptions:
        return f"{character_name} (no detailed description available)"
    
    char_data = character_descriptions[character_name]
    
    main_description = char_data.get("main", char_data.get("base", ""))
    
    variations = char_data.get("variations", {})
    
    for var_name, var_data in variations.items():
        for range_str, description in var_data.items():
            if check_page_panel_in_range(page_num, panel_num, range_str):
                return description
    
    return main_description

def check_page_panel_in_range(page_num, panel_num, range_str):
    """Check if a page.panel combination falls within the specified page.panel ranges"""
    if not range_str or range_str == "N/A":
        return False
    
    ranges = [r.strip() for r in range_str.split(',')]
    
    for single_range in ranges:
        if '-' in single_range:
            try:
                start_str, end_str = single_range.split('-')
                start_page, start_panel = map(int, start_str.split('.'))
                end_page, end_panel = map(int, end_str.split('.'))
                
                current_pos = page_num * 100 + panel_num
                start_pos = start_page * 100 + start_panel
                end_pos = end_page * 100 + end_panel
                
                if start_pos <= current_pos <= end_pos:
                    return True
            except (ValueError, IndexError):
                if check_page_in_range(page_num, single_range):
                    return True
                continue
        else:
            try:
                if '.' in single_range:
                    range_page, range_panel = map(int, single_range.split('.'))
                    if range_page == page_num and range_panel == panel_num:
                        return True
                else:
                    if int(single_range) == page_num:
                        return True
            except (ValueError, IndexError):
                continue
    
    return False

def check_page_in_range(page_num, pages_str):
    """Check if a page number falls within the specified page ranges (legacy function for backward compatibility)"""
    if not pages_str or pages_str == "N/A":
        return False
    
    ranges = [r.strip() for r in pages_str.split(',')]
    
    for range_str in ranges:
        if '-' in range_str:
            try:
                start, end = map(int, range_str.split('-'))
                if start <= page_num <= end:
                    return True
            except ValueError:
                continue
        else:
            try:
                if int(range_str) == page_num:
                    return True
            except ValueError:
                continue
    
    return False

def extract_character_features_from_tags(description):
    """Extract character features from tagged description format.
    
    Extracts content from tags like [AGE_BUILD], [HAIR], [EYES], [FACIAL_FEATURES], 
    [OUTFIT], [ACCESSORIES], [DISTINCTIVES].
    
    Args:
        description: Character description string with tagged sections
        
    Returns:
        Dictionary with feature tags as keys and their content as values
    """
    import re
    
    features = {}
    
    tags = ['AGE_BUILD', 'HAIR', 'EYES', 'FACIAL_FEATURES', 'OUTFIT', 'ACCESSORIES', 'DISTINCTIVES']
    
    for tag in tags:
        pattern = rf'\[{tag}\]\s*(.*?)(?=\s*\[(?:AGE_BUILD|HAIR|EYES|FACIAL_FEATURES|OUTFIT|ACCESSORIES|DISTINCTIVES)\]|$)'
        match = re.search(pattern, description, re.IGNORECASE | re.DOTALL)
        
        if match:
            content = match.group(1).strip()
            content = content.rstrip('.').strip()
            features[tag] = content
    
    return features

def inject_character_features_into_prompt(prompt, character_descriptions, page_num, panel_num):
    """Inject character features into prompt tokens.
    
    Replaces tokens like [CHARACTER_NAME:HAIR], [CHARACTER_NAME:EYES], etc. with actual
    character descriptions from character_descriptions.json, handling variations.
    
    Args:
        prompt: Prompt string with character tokens
        character_descriptions: Dictionary of character descriptions
        page_num: Current page number
        panel_num: Current panel number
        
    Returns:
        Prompt with all character tokens replaced with actual descriptions
    """
    import re
    
    token_pattern = r'\[([^:]+):(AGE_BUILD|HAIR|EYES|FACIAL_FEATURES|OUTFIT|ACCESSORIES|DISTINCTIVES)\]'
    
    tokens = re.findall(token_pattern, prompt)
    
    if not tokens:
        return prompt
    
    processed_chars = set()
    
    for char_name, feature_tag in tokens:
        char_name = char_name.strip()
        
        if char_name in processed_chars:
            continue
            
        full_description = get_character_description(character_descriptions, char_name, page_num, panel_num)
        
        if "(no detailed description available)" in full_description:
            print(f"Warning: No description found for character '{char_name}'")
            for tag in ['AGE_BUILD', 'HAIR', 'EYES', 'FACIAL_FEATURES', 'OUTFIT', 'ACCESSORIES', 'DISTINCTIVES']:
                token = f"[{char_name}:{tag}]"
                prompt = prompt.replace(token, f"[{tag.lower()}]")
            continue
        
        features = extract_character_features_from_tags(full_description)
        
        for tag in ['AGE_BUILD', 'HAIR', 'EYES', 'FACIAL_FEATURES', 'OUTFIT', 'ACCESSORIES', 'DISTINCTIVES']:
            token = f"[{char_name}:{tag}]"
            if token in prompt:
                if tag in features:
                    replacement = features[tag]
                    prompt = prompt.replace(token, replacement)
                    print(f"  Injected {char_name}:{tag} -> {replacement[:50]}...")
                else:
                    print(f"  Warning: {tag} not found for {char_name}, removing token")
                    prompt = prompt.replace(token, "")
        
        processed_chars.add(char_name)
    
    prompt = re.sub(r'\[([^:]+):(AGE_BUILD|HAIR|EYES|FACIAL_FEATURES|OUTFIT|ACCESSORIES|DISTINCTIVES)\]', '', prompt)
    
    prompt = re.sub(r'\s+', ' ', prompt).strip()
    
    return prompt

def extract_key_character_features(description):
    """Extract key visual features from character description for consistency"""
    import re
    
    hair_patterns = [
        r'([\w\s]*hair[\w\s]*)',
        r'([\w\s]*hairstyle[\w\s]*)',
        r'([\w\s]*haircut[\w\s]*)'
    ]
    
    clothing_patterns = [
        r'wearing ([\w\s,]+)',
        r'dressed in ([\w\s,]+)',
        r'(jacket|shirt|dress|pants|boots|shoes|cloak)[\w\s]*'
    ]
    
    physical_patterns = [
        r'([\w\s]*eyes?[\w\s]*)',
        r'([\w\s]*build[\w\s]*)',
        r'(tall|short|young|old|athletic)[\w\s]*'
    ]
    
    key_features = {
        "hair": [],
        "clothing": [],
        "physical": []
    }
    
    desc_lower = description.lower()
    
    for pattern in hair_patterns:
        matches = re.findall(pattern, desc_lower)
        key_features["hair"].extend(matches)
    
    for pattern in clothing_patterns:
        matches = re.findall(pattern, desc_lower) 
        key_features["clothing"].extend(matches)
    
    for pattern in physical_patterns:
        matches = re.findall(pattern, desc_lower)
        key_features["physical"].extend(matches)
    
    return key_features

def generate_panel_prompts_mega(comic_structure, character_descriptions, style, full_story_text=""):
    """Generate detailed prompts for ALL panels using token-based character injection approach"""
    client = genai.Client(
        api_key=os.environ["GEMINI_KEY"],
    )
    
    total_panels = sum(len(page['panels']) for page in comic_structure)
    print(f"Total panels to process: {total_panels}")
    print(f"Using TOKEN-BASED MEGA-PROMPT approach: 1 API call for all {total_panels} panels")
    print(f"Character features will be injected programmatically after LLM generation")
    
    panels_info = []
    for page in comic_structure:
        page_num = page['page_number']
        for panel in page['panels']:
            panel_num = panel['panel_number']
            panel_desc = panel.get('description', '')
            panel_dialogues = panel.get('dialogues', [])
            panel_narration = panel.get('narration', '')
            
            panel_character_descriptions = {}
            for char_name in character_descriptions.keys():
                if char_name.lower() != "narration" and char_name != "comic_structure":
                    exact_desc = get_character_description(character_descriptions, char_name, page_num, panel_num)
                    if "(no detailed description available)" not in exact_desc:
                        panel_character_descriptions[char_name] = exact_desc
            
            scene_description = panel.get('italic_text', '')
            if panel_narration:
                if scene_description:
                    scene_description += " " + panel_narration
                else:
                    scene_description = panel_narration
            
            panels_info.append({
                'page': page_num,
                'panel': panel_num,
                'description': panel_desc,
                'scene': scene_description,
                'dialogues': panel_dialogues,
                'narration': panel_narration,
                'character_descriptions': panel_character_descriptions
            })
    
    manga_specific_instructions = ""
    style_guidance = ""
    if style.lower() == "manga":
        manga_specific_instructions = """
MANGA-SPECIFIC REQUIREMENTS (MANDATORY):
- BLACK AND WHITE ONLY: Completely monochrome art, no colors mentioned for hair, clothes, or environments
- HIGH CONTRAST: Strong blacks and whites with dramatic lighting and shadows
- CLEAN LINE ART: Crisp, precise linework typical of manga illustration
- SCREEN TONES: Mention halftone patterns, gradients, and manga-style shading techniques
- MANGA COMPOSITION: Dynamic panel compositions with speed lines, impact effects, and manga-style visual storytelling
- NO COLOR DESCRIPTIONS: Never mention any colors (red, blue, silver, etc.) - describe items by material, texture, and shape only
"""
        style_guidance = f"MANDATORY: Start every prompt with 'Manga style, black and white, monochrome,' and NEVER mention colors - use material and texture instead"
    else:
        style_guidance = f"MANDATORY: Start every prompt with '{style},' and consistently maintain this artistic style throughout. NEVER use terms like 'photorealistic', 'realistic', 'hyper-detailed', or 'hyper-realistic' as these conflict with the target style."

    mega_prompt = f"""You are an expert comic book panel image prompt generator. Generate prompts with EXACT character descriptions and proper panel composition.

FULL STORY CONTEXT:
{full_story_text}

ARTISTIC STYLE REQUIREMENT:
{style_guidance}

{manga_specific_instructions}

PANELS TO GENERATE PROMPTS FOR:
"""
    
    for i, panel_info in enumerate(panels_info, 1):
        panel_chars_section = ""
        if panel_info['character_descriptions']:
            panel_chars_section = "CHARACTERS IN THIS PANEL:\n"
            for char_name in panel_info['character_descriptions'].keys():
                panel_chars_section += f"- {char_name}\n"
        
        mega_prompt += f"""
Panel {i} (Page {panel_info['page']}, Panel {panel_info['panel']}):
Scene: {panel_info['scene']}
Characters speaking: {[d.get('character', '') for d in panel_info['dialogues']]}
{panel_chars_section}
"""
    
    mega_prompt += f"""

CRITICAL CHARACTER TOKEN SYSTEM:

For character descriptions, use TOKENS instead of full text. Tokens will be programmatically replaced with complete descriptions.

AVAILABLE TOKENS (per character):
  [CHARACTER_NAME:AGE_BUILD] - age and body type
  [CHARACTER_NAME:HAIR] - MANDATORY - hair style and color
  [CHARACTER_NAME:EYES] - eye color and shape
  [CHARACTER_NAME:FACIAL_FEATURES] - facial structure
  [CHARACTER_NAME:OUTFIT] - MANDATORY - complete clothing
  [CHARACTER_NAME:ACCESSORIES] - MANDATORY - items and gear
  [CHARACTER_NAME:DISTINCTIVES] - scars, marks, traits

MANDATORY TOKENS (MUST INCLUDE FOR EVERY CHARACTER APPEARANCE):
  ✓ [CHARACTER_NAME:OUTFIT] - Without this = FAILURE
  ✓ [CHARACTER_NAME:HAIR] - Without this = FAILURE
  ✓ [CHARACTER_NAME:ACCESSORIES] - Without this = FAILURE

OPTIONAL BUT RECOMMENDED:
  • [CHARACTER_NAME:AGE_BUILD] - helps establish identity
  • [CHARACTER_NAME:EYES] - good for facial consistency
  • [CHARACTER_NAME:FACIAL_FEATURES] - for close-ups
  • [CHARACTER_NAME:DISTINCTIVES] - when visible

NAMING RULE (CRITICAL):
  ✗ NEVER write character names in the prompt text itself
  ✗ WRONG: "Elias stands...", "Dr. Thorne examines..."
  ✓ CORRECT: "A man stands...", "A woman examines...", "An elderly man..."
  ✓ Use: "a man", "a woman", "a young man", "an elderly woman", "a person"
  ✓ Names ONLY appear in tokens: [Elias Thorne:OUTFIT]

EXAMPLE (CORRECT):
"anime, medium shot of a man with [Elias Thorne:HAIR] and [Elias Thorne:EYES]. He wears [Elias Thorne:OUTFIT] with [Elias Thorne:ACCESSORIES]. He examines glowing equipment in his workshop."

EXAMPLE WITH MULTIPLE CHARACTERS (CORRECT):
"anime, wide shot showing a man with [Elias Thorne:HAIR] wearing [Elias Thorne:OUTFIT] and [Elias Thorne:ACCESSORIES] facing a woman with [Dr. Aris Thorne:HAIR] in [Dr. Aris Thorne:OUTFIT] and [Dr. Aris Thorne:ACCESSORIES]. They stand in the dimly lit chamber."

4. ACTION-CONTEXT INTEGRATION (CRITICAL FOR DYNAMIC SCENES):
   INNOVATION: Integrate action directly into character descriptions instead of treating them separately
   - WRONG: "Character standing + separate action happening"
   - CORRECT: "Character actively performing action with dynamic body language"
   
   ACTION INTEGRATION TECHNIQUES:
   - Mid-action poses: "character caught mid-unwrapping motion, hands grasping package edges"
   - Dynamic body language: "character leaning forward with focused intensity while examining"
   - Motion indicators: "character with flowing movement lines, hair and clothes in motion"
   - Emotional physicality: "character's entire body expressing tension/excitement/determination"
   - Interactive poses: "character actively engaging with objects/environment"
   
   SCENE EXAMPLES:
   CORRECT: "character crouched down, both hands actively unwrapping a package, eyes focused intently on contents, body language showing curiosity and concentration"
   WRONG: "character standing nearby while package is unwrapped"
   
   CORRECT: "character in mid-leap across gap, body stretched horizontally, coat trailing behind, expression of intense focus"
   WRONG: "character floating above gap"

5. DYNAMIC SCENE COMPOSITION:
   - Characters interact with EACH OTHER, not the camera
   - Use specific directional interactions: "facing each other", "looking at [character]"
   - Show clear spatial relationships and character actions
   - Varied camera angles that enhance drama

5. STYLE INTEGRATION:
   - Start every prompt with the required style prefix
   - Maintain consistent artistic style throughout
   - Add style-specific visual elements that complement the chosen art style

PROMPT STRUCTURE:
"{style}, [character 1 FULL visual (hair, eyes, outfit, accessories, distinctives) + integrated mid-action pose + continuity note if unchanged] , [character 2 FULL visual + reactive/dynamic pose + continuity if unchanged], [environment with spatial dynamics, motion effects, lighting], [dynamic camera / composition specification]"


CRITICAL ACTION REQUIREMENTS:
- NEVER create static character portraits - always show characters MID-ACTION
- Integrate actions into character descriptions: "character leaning forward while examining"
- Use dynamic body language: "character's body language expressing [emotion] while [action]"
- Include motion indicators: "movement lines", "flowing hair/clothes", "dynamic posture"
- Show cause-and-effect: "character reacting to" or "character actively engaging with"
- CLOSE / EXTREME CLOSE FRAMING RULE: Even if panel framing is a close-up / extreme close-up / tight focus on face, hands, an object, document, eyes, or a kiss, you MUST STILL explicitly mention the character's TOP WEAR (torso garment: type + material/texture + color + fit/cut) to anchor continuity (e.g. "in the sleek black neoprene wetsuit torso", "collar of the tactical matte charcoal jacket visible", "soaked pale blue linen shirt upper section"). Compress wording but NEVER omit. Omitting top wear = critical failure.

PANEL INDEPENDENCE RULE (CRITICAL):
- Each panel is COMPLETELY INDEPENDENT - the image generation model has NO MEMORY of previous panels
- NEVER use continuity words like "still", "continues", "remains", "same", "unchanged" - these assume model memory
- WRONG: "still sitting at the desk", "continues wearing the jacket", "remains in the same pose"
- CORRECT: "sitting at the desk", "wearing the jacket", "in a relaxed pose"
- Every panel must be described as if it's the FIRST and ONLY panel being generated
- Include full character descriptions in EVERY panel, not references to previous panels

IDIOM & METAPHOR LITERALIZATION GUARD (SEMANTIC SANITY):
- NEVER literalize idioms or figurative language from the story into visuals unless explicitly described as literal.
- Examples of SAFE translations:
    - "eye of the storm" → depict the calm circular center region of the storm, NOT a literal giant eye in the sky.
    - "circuits of the city" → depict a labyrinth/network of streets, pipes, and conduits, NOT a printed circuit board city.
- BANNED LITERALIZATIONS (unless the story explicitly states them as literal visuals): giant eye in sky for storm-eye; glowing PCB-style city for figurative "circuits".

PROMPT LENGTH FLOOR:
- If any character appears in a panel, target 150–200 words. Never go below ~120 words. Use concise, information-dense phrasing if needed.

TECHNICAL REQUIREMENTS:
- Generate exactly {len(panels_info)} prompts, one per panel
- Maximum 200 words per prompt (increased to accommodate full character descriptions)
- Use COMPLETE character descriptions provided for each panel - never abbreviate
- Each character appearance must include hair, eyes, clothing (full layered outfit), accessories, distinctives
- Continuity wording when outfit unchanged between panels
- MANDATORY: Every prompt must show characters in DYNAMIC ACTION, never static poses

OUTPUT FORMAT (JSON ONLY):
{{
  "prompts": [
    {{
      "page": 1,
      "panel": 1,
      "prompt": "exact prompt text..."
    }}
  ]
}}

Generate prompts with PERFECT character consistency using panel-specific descriptions:"""
    
    try:
        print("Sending mega-prompt to LLM...")
        response = client.models.generate_content(
            model="gemini-2.5-pro",
            contents=mega_prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",  
                temperature=0.3,
                max_output_tokens=65536,  
            )
        )
        
        if response.text is None:
            print("ERROR: LLM response is None")
            return {}
        
        response_text = response.text
        print(f"Received response from LLM ({len(response_text)} characters)")
        
        try:
            parsed_response = json.loads(response_text)
            print(f"Parsed response type: {type(parsed_response)}")
            print(f"Parsed response keys: {list(parsed_response.keys()) if isinstance(parsed_response, dict) else 'Not a dict'}")
            
            if isinstance(parsed_response, list):
                prompts_list = parsed_response
            elif isinstance(parsed_response, dict):
                prompts_list = parsed_response.get("prompts", [])
                if not prompts_list and any(key.startswith('panel_') for key in parsed_response.keys()):
                    prompts_list = []
                    for key, value in parsed_response.items():
                        if key.startswith('panel_'):
                            panel_num = int(key.split('_')[1])
                            prompts_list.append({
                                "page": 1,  
                                "panel": panel_num,
                                "prompt": value
                            })
            else:
                print(f"Unexpected response format: {type(parsed_response)}")
                return {}
            
            if len(prompts_list) != len(panels_info):
                print(f"WARNING: Expected {len(panels_info)} prompts, got {len(prompts_list)}")
            
            all_prompts = {}
            for i, prompt_data in enumerate(prompts_list):
                if isinstance(prompt_data, str):
                    panel_info = panels_info[i] if i < len(panels_info) else {"page": 1, "panel": i+1}
                    page_num = panel_info["page"]
                    panel_num = panel_info["panel"]
                    prompt_text = prompt_data
                elif isinstance(prompt_data, dict):
                    page_num = prompt_data.get("page")
                    panel_num = prompt_data.get("panel")
                    prompt_text = prompt_data.get("prompt", "")
                else:
                    print(f"Unexpected prompt data format: {type(prompt_data)}")
                    continue
                
                prompt_text_with_tokens = prompt_text

                replacements = {
                    r"\beye of the storm\b": "calm central region of the storm",
                    r"\bcircuits of the city\b": "maze-like network of streets, pipes, and conduits",
                    r"\belectric circuit city\b": "labyrinthine industrial city",
                }
                import re as _re
                for _pat, _rep in replacements.items():
                    prompt_text_with_tokens = _re.sub(_pat, _rep, prompt_text_with_tokens, flags=_re.IGNORECASE)

                print(f"Injecting character features for Page {page_num}, Panel {panel_num}...")
                safe_text = inject_character_features_into_prompt(
                    prompt_text_with_tokens, 
                    character_descriptions, 
                    page_num, 
                    panel_num
                )
                
                page_key = f"page_{page_num}"
                panel_key = f"panel_{panel_num}"
                if page_key not in all_prompts:
                    all_prompts[page_key] = {}
                all_prompts[page_key][panel_key] = safe_text
                print(f"Generated prompt for Page {page_num}, Panel {panel_num} ({len(prompt_text.split())} words)")
            
            print("Saving raw tokenized prompts to debug file...")
            all_prompts_tokenized = {}
            for i, prompt_data in enumerate(prompts_list):
                if isinstance(prompt_data, str):
                    panel_info = panels_info[i] if i < len(panels_info) else {"page": 1, "panel": i+1}
                    page_num = panel_info["page"]
                    panel_num = panel_info["panel"]
                    prompt_text = prompt_data
                elif isinstance(prompt_data, dict):
                    page_num = prompt_data.get("page")
                    panel_num = prompt_data.get("panel")
                    prompt_text = prompt_data.get("prompt", "")
                else:
                    continue
                
                prompt_text_clean = prompt_text
                for _pat, _rep in replacements.items():
                    prompt_text_clean = _re.sub(_pat, _rep, prompt_text_clean, flags=_re.IGNORECASE)
                
                page_key = f"page_{page_num}"
                panel_key = f"panel_{panel_num}"
                if page_key not in all_prompts_tokenized:
                    all_prompts_tokenized[page_key] = {}
                all_prompts_tokenized[page_key][panel_key] = prompt_text_clean
            
            print(f"Successfully generated prompts for all panels using 1 mega-prompt API call with JSON mode!")
            return all_prompts, all_prompts_tokenized
            
        except json.JSONDecodeError as e:
            print(f"Error parsing JSON response: {e}")
            print(f"Raw response: {response_text[:500]}...")
            json_text = extract_json_from_response(response_text)
            try:
                parsed_response = json.loads(json_text)
                prompts_list = parsed_response.get("prompts", [])
                
                all_prompts = {}
                all_prompts_tokenized = {}
                for prompt_data in prompts_list:
                    page_num = prompt_data.get("page")
                    panel_num = prompt_data.get("panel")
                    prompt_text = prompt_data.get("prompt", "")
                    
                    page_key = f"page_{page_num}"
                    panel_key = f"panel_{panel_num}"
                    
                    if page_key not in all_prompts:
                        all_prompts[page_key] = {}
                    if page_key not in all_prompts_tokenized:
                        all_prompts_tokenized[page_key] = {}
                    
                    all_prompts_tokenized[page_key][panel_key] = prompt_text
                    
                    all_prompts[page_key][panel_key] = inject_character_features_into_prompt(
                        prompt_text, character_descriptions, page_num, panel_num
                    )
                
                print(f"Successfully generated prompts using fallback JSON extraction!")
                return all_prompts, all_prompts_tokenized
                
            except json.JSONDecodeError as e2:
                print(f"Fallback JSON extraction also failed: {e2}")
                return {}, {}
            
    except Exception as e:
        print(f"Error in mega-prompt generation: {e}")
        return {}, {}

def generate_prompt_with_llm_full_context(comic_structure, style, markdown_file):
    """Generate detailed image prompts for ALL panels with full story context and character consistency"""
    
    try:
        with open(markdown_file, 'r', encoding='utf-8') as f:
            full_story_text = f.read()
        print(f"Loaded full story context from {markdown_file} ({len(full_story_text)} characters)")
    except Exception as e:
        print(f"Error reading story file: {e}")
        full_story_text = ""
    
    print("Loading character descriptions from st2nar/nar2nar output...")
    character_descriptions = generate_character_descriptions(comic_structure, style)
    
    if not character_descriptions:
        print("No character descriptions found. Skipping prompt generation.")
        return None
    
    character_desc_path = os.path.join('output', f"character_descriptions.json")
    os.makedirs(os.path.dirname(character_desc_path), exist_ok=True)
    with open(character_desc_path, 'w', encoding='utf-8') as f:
        json.dump(character_descriptions, f, indent=2)
    print(f"Character descriptions loaded from {character_desc_path}")
    
    print("Generating panel prompts with full story context and character descriptions...")
    panel_prompts, panel_prompts_tokenized = generate_panel_prompts_mega(comic_structure, character_descriptions, style, full_story_text)
    
    comic_structure_info = {
        "total_pages": len(comic_structure),
        "panels_per_page": [len(page['panels']) for page in comic_structure]
    }
    
    if "comic_structure" in character_descriptions:
        return {
            "character_descriptions": character_descriptions,
            "panel_prompts": panel_prompts
        }, {
            "character_descriptions": character_descriptions,
            "panel_prompts": panel_prompts_tokenized
        }
    else:
        return {
            "character_descriptions": character_descriptions,
            "comic_structure": comic_structure_info,
            "panel_prompts": panel_prompts
        }, {
            "character_descriptions": character_descriptions,
            "comic_structure": comic_structure_info,
            "panel_prompts": panel_prompts_tokenized
        }

def get_prompts_json_path(markdown_file):
    """Get the path to the JSON file for story prompts"""
    base_name = os.path.basename(markdown_file).split('.')[0]
    return os.path.join('output', f"{base_name}_prompts.json")

def save_prompts_to_json(prompts_data, prompts_data_tokenized, markdown_file):
    """Save both injected and tokenized prompts to separate JSON files"""
    json_path = get_prompts_json_path(markdown_file)
    tokenized_json_path = json_path.replace('_prompts.json', '_prompts_tokenized.json')
    
    os.makedirs(os.path.dirname(json_path), exist_ok=True)
    
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(prompts_data, f, indent=2)
    print(f"Saved injected prompts to: {json_path}")
    
    with open(tokenized_json_path, 'w', encoding='utf-8') as f:
        json.dump(prompts_data_tokenized, f, indent=2)
    print(f"Saved tokenized prompts (debug) to: {tokenized_json_path}")
    
    return json_path

def load_prompts_from_json(markdown_file):
    """Load previously generated prompts from a JSON file"""
    json_path = get_prompts_json_path(markdown_file)
    
    if not os.path.exists(json_path):
        return None
    
    with open(json_path, 'r', encoding='utf-8') as f:
        return json.load(f)

def generate_with_diffusers(prompt, negative_prompt, seed, randomize_seed, width, height, guidance_scale, num_inference_steps):
    pipe = get_or_create_pipeline()
    
    aspect_ratios = {
        "1:1": (1328, 1328),
        "16:9": (1664, 928),
        "9:16": (928, 1664),
        "4:3": (1472, 1140),
        "3:4": (1140, 1472),
    }
    
    
    if not randomize_seed and seed is not None:
        generator = torch.Generator("cuda").manual_seed(seed)
    else:
        generator = None
    
    image = pipe(
        prompt=prompt,
        negative_prompt=negative_prompt,
        width=width,
        height=height,
        num_inference_steps=num_inference_steps,
        true_cfg_scale=guidance_scale,  
        generator=generator
    ).images[0]
    
    return image

def generate_image(prompt, negative_prompt, seed, randomize_seed, width, height, guidance_scale, num_inference_steps):
    """Generate a single image using Qwen Image pipeline with reuse"""
    print("Using Qwen Image pipeline...")
    try:
        image = generate_with_diffusers(
            prompt=prompt,
            negative_prompt=negative_prompt,
            seed=seed,
            randomize_seed=randomize_seed,
            width=width,
            height=height,
            guidance_scale=guidance_scale,
            num_inference_steps=num_inference_steps
        )
        
        temp_path = os.path.join('output', 'temp_image.png')
        os.makedirs('output', exist_ok=True)
        image.save(temp_path)
        return temp_path
    except Exception as e:
        print(f"Error with Qwen Image pipeline: {e}")
        raise e

def generate_comic_images_for_page(settings=None):
    """Generate images for a single page in the comic using provided settings or defaults"""
    
    markdown_file = settings['markdown_file']
    page_number = settings['page_number']
    style = settings['style']
    
    panel_dimensions = settings.get('panel_dimensions', [])
    default_width = settings['width']
    default_height = settings['height']
    
    prompts_data = None
    
    if page_number == 1:
        print("Processing page 1: Generating character descriptions and prompts for the entire story...")
        comic_structure = extract_full_comic_structure(markdown_file)
        if comic_structure:
            prompts_data, prompts_data_tokenized = generate_prompt_with_llm_full_context(comic_structure, style, markdown_file)
            save_prompts_to_json(prompts_data, prompts_data_tokenized, markdown_file)
    else:
        prompts_data = load_prompts_from_json(markdown_file)
        if not prompts_data:
            print(f"Warning: No pre-generated prompts found for {markdown_file}.")
            print("To maintain consistency, please process page 1 first.")
    
    comic_structure = extract_panel_content(markdown_file, page_number)
    
    if not comic_structure:
        print(f"Error: Page {page_number} not found in {markdown_file}")
        return None
    
    output_dir = os.path.join('output', f"{os.path.basename(markdown_file).split('.')[0]}_page_{page_number}")
    os.makedirs(output_dir, exist_ok=True)
    
    generated_images = []
    page = comic_structure[0]  
    
    total_panels = len(page['panels'])
    
    if not panel_dimensions or len(panel_dimensions) < total_panels:
        panel_dimensions = panel_dimensions + [(default_width, default_height)] * (total_panels - len(panel_dimensions))
    
    for panel_idx, panel in enumerate(page['panels']):
        panel_num = panel['panel_number']
        
        panel_dim = panel_dimensions[panel_idx]
        
        if isinstance(panel_dim, str) and ":" in panel_dim:
            width_ratio, height_ratio = map(int, panel_dim.split(":"))
            area = default_width * default_height
            new_width = int((area * width_ratio / height_ratio) ** 0.5)
            new_height = int(area / new_width)
            width, height = new_width, new_height
        elif isinstance(panel_dim, tuple) and len(panel_dim) == 2:
            width, height = panel_dim
        else:
            width, height = default_width, default_height
            
        prompt = None
        if prompts_data and 'panel_prompts' in prompts_data:
            try:
                page_key = f"page_{page_number}"
                panel_key = f"panel_{panel_num}"
                
                prompt = prompts_data['panel_prompts'][page_key][panel_key]
                print(f"Using pre-generated prompt for Page {page_number}, Panel {panel_num}")
            except (KeyError, TypeError):
                prompt = None
                print(f"No pre-generated prompt found for Page {page_number}, Panel {panel_num}")
        
        if not prompt:
            print(f"ERROR: No prompt available for Page {page_number}, Panel {panel_num}")
            print("Please ensure page 1 has been processed first to generate prompts for the entire story.")
            continue

        print(f"Prompt for Panel {panel_num}: {prompt}")
        print(f"Using dimensions: {width}x{height}")
        
        current_seed = settings['seed'] if not settings['randomize_seed'] else None
        
        try:
            image_path = generate_image(
                prompt=prompt,
                negative_prompt=settings['negative_prompt'],
                seed=current_seed,
                randomize_seed=settings['randomize_seed'],
                width=width,
                height=height,
                guidance_scale=settings['guidance_scale'],
                num_inference_steps=settings['num_inference_steps']
            )
            
            final_image_path = os.path.join(output_dir, f'panel_{panel_num:02d}.png')
            shutil.copy(image_path, final_image_path)
            
            generated_images.append({
                'page': page['page_number'],
                'panel': panel_num,
                'prompt': prompt,
                'path': final_image_path,
                'dialogues': panel['dialogues'],
                'width': width,
                'height': height
            })
            
            print(f"Generated image for Page {page['page_number']}, Panel {panel_num} at {width}x{height}")
        except Exception as e:
            print(f"Failed to generate image for Panel {panel_num}: {e}")
    
    if generated_images:
        panel_data = {
            'style': style,
            'panels': []
        }
        
        for img in generated_images:
            panel_info = {
                'page': img['page'],
                'panel': img['panel'],
                'prompt': img['prompt'],
                'path': img['path'],
                'dialogues': img['dialogues'],
                'width': img.get('width', default_width),
                'height': img.get('height', default_height)
            }
            panel_data['panels'].append(panel_info)
        
        panel_data_path = os.path.join(output_dir, 'panel_data.json')
        with open(panel_data_path, 'w', encoding='utf-8') as f:
            json.dump(panel_data, f, indent=2)
        
        prompt_log = os.path.join(output_dir, 'panel_data.txt')
        with open(prompt_log, 'w', encoding='utf-8') as f:
            for img in generated_images:
                f.write(f"Page {img['page']}, Panel {img['panel']}:\n")
                f.write(f"Dimensions: {img.get('width', default_width)}x{img.get('height', default_height)}\n")
                f.write(f"Prompt: {img['prompt']}\n")
                f.write(f"Dialogues: {len(img['dialogues'])}\n")
                for d in img['dialogues']:
                    f.write(f"  - {d['character']}: {d['text']}\n")
                f.write("\n")
    
    return generated_images