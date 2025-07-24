import os
import re
import json
import torch
from diffusers import StableDiffusion3Pipeline
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
        print("Creating new Stable Diffusion pipeline...")
        global_pipeline = StableDiffusion3Pipeline.from_pretrained(
            "stabilityai/stable-diffusion-3.5-large", 
            torch_dtype=torch.bfloat16
        )
        global_pipeline = global_pipeline.to("cuda")
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
    
    base_description = character_descriptions[character_name].get("base", "")
    
    variations = character_descriptions[character_name].get("variations", {})
    panel_key = f"page_{page_num}_panel_{panel_num}"
    
    if panel_key in variations:
        return variations[panel_key]
    
    page_key = f"page_{page_num}"
    if page_key in variations:
        return variations[page_key]
    
    return base_description

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
    """Generate detailed prompts for ALL panels using a single mega-prompt approach"""
    client = genai.Client(
        api_key=os.getenv("GEMINI_KEY"),
    )
    
    total_panels = sum(len(page['panels']) for page in comic_structure)
    print(f"Total panels to process: {total_panels}")
    print(f"Using MEGA-PROMPT approach: 1 API call for all {total_panels} panels")
    
    character_desc_text = ""
    character_consistency_map = {}
    
    for char_name, char_data in character_descriptions.items():
        if char_name.lower() != "narration" and char_name != "comic_structure":
            base_desc = char_data.get("base", "")
            if "(no detailed description available)" not in base_desc and base_desc.strip():
                character_desc_text += f"[{char_name} - OUTFIT MUST REMAIN IDENTICAL IN ALL PANELS]: {base_desc}. "
                
                character_consistency_map[char_name] = {
                    "full_description": base_desc,
                    "key_features": extract_key_character_features(base_desc)
                }
    
    character_desc_text = character_desc_text.rstrip(". ")
    
    if character_desc_text:
        character_desc_text += "\n\nCONSISTENCY MANDATE: Every character must appear in their EXACT same outfit, hair, and accessories in ALL panels. DO NOT modify, add, or remove any clothing items or physical features."
    
    panels_info = []
    for page in comic_structure:
        page_num = page['page_number']
        for panel in page['panels']:
            panel_num = panel['panel_number']
            
            scene_description = panel.get('italic_text', '')
            if panel.get('narration'):
                if scene_description:
                    scene_description += " " + panel['narration']
                else:
                    scene_description = panel['narration']
            
            panels_info.append({
                'page': page_num,
                'panel': panel_num,
                'scene': scene_description,
                'dialogues': panel.get('dialogues', [])
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

    mega_prompt = f"""You are an expert comic book panel image prompt generator. Generate Stable Diffusion 3.5 prompts that perfectly balance character consistency, rich artistic style, and dynamic scene composition.

FULL STORY CONTEXT:
{full_story_text}

CHARACTER VISUAL REFERENCE (MEMORIZE AND COPY EXACTLY):
{character_desc_text}

ARTISTIC STYLE REQUIREMENT:
{style_guidance}

{manga_specific_instructions}

PANELS TO GENERATE PROMPTS FOR:
"""
    
    for i, panel_info in enumerate(panels_info, 1):
        mega_prompt += f"""
Panel {i} (Page {panel_info['page']}, Panel {panel_info['panel']}):
Scene: {panel_info['scene']}
Characters speaking: {[d.get('character', '') for d in panel_info['dialogues']]}
"""
    
    mega_prompt += f"""

CRITICAL REQUIREMENTS:

1. ARTISTIC STYLE STRUCTURE (MANDATORY):
   - Start with: "{style}," 
   - Follow immediately with rich artistic descriptions that enhance the {style} aesthetic
   - Examples of rich style descriptions:
     * "with luminous cel-shaded coloring and ethereal atmospheric lighting"
     * "featuring dramatic depth of field and vibrant color gradients"
     * "rendered with soft bokeh effects and cinematic composition"
     * "showcasing detailed character animation with expressive linework"
     * "emphasizing emotional lighting and atmospheric perspective"

2. CHARACTER CONSISTENCY (ABSOLUTE PRECISION REQUIRED):
   - Copy character descriptions WORD-FOR-WORD from CHARACTER VISUAL REFERENCE
   - NEVER abbreviate or summarize character features
   - NEVER change hair color/style, clothing items, or physical features
   - Use COMPLETE descriptions every time a character appears
   
   CORRECT EXAMPLES:
   ✓ "striking, metallic silver hair is cut into a perfectly sleek and sharp asymmetrical bob, with one side falling to her chin and the other tucked cleanly behind her ear"
   ✓ "gravity-defying, chaotic shock of spiky, layered brown hair with lighter brunette highlights that seems to float upwards"
   ✓ "long, form-fitting trench coat of black synth-leather over a sleeveless, high-necked black silk top"
   
   WRONG EXAMPLES:
   ✗ "sleek silver hair" (missing "striking, metallic" and bob description)
   ✗ "chaotic brown hair" (missing "spiky, layered" and "brunette highlights")
   ✗ "black coat" (missing "long, form-fitting trench coat of black synth-leather")

3. DYNAMIC SCENE COMPOSITION (MANDATORY FOR ENGAGING PANELS):
   - Characters should interact WITH EACH OTHER, not with the camera
   - Use specific directional interactions: "facing each other", "looking at [character]", "turned toward [character]"
   - Avoid portrait-style compositions - focus on CHARACTER RELATIONSHIPS and ACTIONS
   - Show clear spatial relationships between characters
   - Use varied camera angles that enhance the drama: over-shoulder shots, Dutch angles, dynamic perspectives

   GOOD ACTION EXAMPLES:
   ✓ "Character A leans forward toward Character B, who steps back defensively"
   ✓ "Character A grabs Character B's shoulder, both facing each other intensely"
   ✓ "Over-shoulder shot from behind Character A, focusing on Character B's reaction"
   
   BAD ACTION EXAMPLES:
   ✗ "Character A talks" (no clear target or interaction)
   ✗ "Character A looks concerned" (portrait mode, no relationship shown)
   ✗ "Character A stands" (static, no dynamic action)

4. ENVIRONMENTAL INTEGRATION:
   - Rich, detailed backgrounds that support the story
   - Environmental storytelling through objects and atmosphere
   - Proper lighting that enhances mood and character interaction
   - Never use plain or empty backgrounds

PROMPT STRUCTURE TEMPLATE:
"{style}, [rich artistic descriptions], [COMPLETE character 1 description from reference] [specific action/pose], [COMPLETE character 2 description from reference] [specific reaction/interaction], [detailed environment description], [camera angle and composition notes]"

EXAMPLES OF PERFECT PROMPTS:

DIALOGUE SCENE:
"{style}, featuring soft bokeh lighting effects and cinematic depth of field, tall, lithe woman in her late 20s with striking, metallic silver hair cut into a perfectly sleek and sharp asymmetrical bob with one side falling to her chin and the other tucked cleanly behind her ear, wearing long, form-fitting trench coat of black synth-leather over sleeveless, high-necked black silk top, leans forward intensely toward lanky man in his early 20s with gravity-defying, chaotic shock of spiky, layered brown hair with lighter brunette highlights, wearing faded, olive-green canvas mechanic's jumpsuit heavily stained with grease over plain, worn-out charcoal grey t-shirt, who steps back nervously while his mismatched, second-hand chrome cybernetic arm with exposed wires twitches, cluttered workshop with scattered cybernetic parts and warm overhead lighting, over-shoulder shot emphasizing their tense confrontation"

ACTION SCENE:
"{style}, with dynamic motion blur and kinetic energy effects, lanky man in his early 20s with gravity-defying, chaotic shock of spiky, layered brown hair with lighter brunette highlights, wearing faded, olive-green canvas mechanic's jumpsuit over charcoal grey t-shirt, grabs tall, lithe woman in her late 20s with striking, metallic silver hair in perfectly sleek asymmetrical bob, wearing long black synth-leather trench coat over sleeveless black silk top, pulling her close as she wraps her arms around his neck, both characters facing each other in passionate embrace, detailed workshop background with cybernetic equipment, dramatic lighting from multiple angles"

TECHNICAL REQUIREMENTS:
- Generate exactly {len(panels_info)} prompts, one per panel
- Maximum 200 words per prompt (increased for character detail requirements)
- Replace character names with COMPLETE physical descriptions
- Focus on character interactions and relationships
- Ensure rich artistic style integration throughout

FORBIDDEN ACTIONS:
- Abbreviated character descriptions
- Portrait-mode character poses
- Characters talking "to camera" instead of each other
- Generic environmental backgrounds
- Missing key character details (hair style, clothing specifics)

Generate prompts with PERFECT character consistency and dynamic interactions:"""
    
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
            prompts_list = parsed_response.get("prompts", [])
            
            if len(prompts_list) != len(panels_info):
                print(f"WARNING: Expected {len(panels_info)} prompts, got {len(prompts_list)}")
            
            all_prompts = {}
            for prompt_data in prompts_list:
                page_num = prompt_data.get("page")
                panel_num = prompt_data.get("panel")
                prompt_text = prompt_data.get("prompt", "")
                
                page_key = f"page_{page_num}"
                panel_key = f"panel_{panel_num}"
                
                if page_key not in all_prompts:
                    all_prompts[page_key] = {}
                
                all_prompts[page_key][panel_key] = prompt_text
                print(f"Generated prompt for Page {page_num}, Panel {panel_num} ({len(prompt_text.split())} words)")
            
            print(f"Successfully generated prompts for all panels using 1 mega-prompt API call with JSON mode!")
            return all_prompts
            
        except json.JSONDecodeError as e:
            print(f"Error parsing JSON response: {e}")
            print(f"Raw response: {response_text[:500]}...")
            json_text = extract_json_from_response(response_text)
            try:
                parsed_response = json.loads(json_text)
                prompts_list = parsed_response.get("prompts", [])
                
                all_prompts = {}
                for prompt_data in prompts_list:
                    page_num = prompt_data.get("page")
                    panel_num = prompt_data.get("panel")
                    prompt_text = prompt_data.get("prompt", "")
                    
                    page_key = f"page_{page_num}"
                    panel_key = f"panel_{panel_num}"
                    
                    if page_key not in all_prompts:
                        all_prompts[page_key] = {}
                    
                    all_prompts[page_key][panel_key] = prompt_text
                
                print(f"Successfully generated prompts using fallback JSON extraction!")
                return all_prompts
                
            except json.JSONDecodeError as e2:
                print(f"Fallback JSON extraction also failed: {e2}")
                return {}
            
    except Exception as e:
        print(f"Error in mega-prompt generation: {e}")
        return {}

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
    panel_prompts = generate_panel_prompts_mega(comic_structure, character_descriptions, style, full_story_text)
    
    return {
        "character_descriptions": character_descriptions,
        "panel_prompts": panel_prompts
    }

def get_prompts_json_path(markdown_file):
    """Get the path to the JSON file for story prompts"""
    base_name = os.path.basename(markdown_file).split('.')[0]
    return os.path.join('output', f"{base_name}_prompts.json")

def save_prompts_to_json(prompts_data, markdown_file):
    """Save generated prompts to a JSON file"""
    json_path = get_prompts_json_path(markdown_file)
    os.makedirs(os.path.dirname(json_path), exist_ok=True)
    
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(prompts_data, f, indent=2)
    
    print(f"Saved prompts to {json_path}")
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
    
    if not randomize_seed and seed is not None:
        generator = torch.Generator("cuda").manual_seed(seed)
    else:
        generator = None
    
    image = pipe(
        prompt=prompt,
        negative_prompt=negative_prompt,
        width=width,
        height=height,
        max_sequence_length=512,
        guidance_scale=guidance_scale,
        num_inference_steps=num_inference_steps,
        generator=generator
    ).images[0]
    
    return image

def generate_image(prompt, negative_prompt, seed, randomize_seed, width, height, guidance_scale, num_inference_steps):
    """Generate a single image using local Diffusers pipeline with reuse"""
    print("Using local Diffusers pipeline...")
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
        print(f"Error with local pipeline: {e}")
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
            prompts_data = generate_prompt_with_llm_full_context(comic_structure, style, markdown_file)
            save_prompts_to_json(prompts_data, markdown_file)
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