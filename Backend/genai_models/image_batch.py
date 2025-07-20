import os
import re
import json
import torch
from gradio_client import Client
from diffusers import StableDiffusion3Pipeline
import shutil
import markdown
import bs4
from google import genai
from google.genai import types
import time

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

def generate_panel_prompts(comic_structure, character_descriptions, style, full_story_text=""):
    """Generate detailed prompts for each panel with enhanced character focus and increased token limit"""
    client = genai.Client(
        api_key=os.environ["GEMINI_KEY"],
    )
    
    all_prompts = {}
    request_count = 0
    start_time = time.time()
    
    total_panels = sum(len(page['panels']) for page in comic_structure)
    print(f"Total panels to process: {total_panels}")
    print(f"Estimated time with rate limiting: {(total_panels // 8) * 65} seconds")
    
    for page in comic_structure:
        page_num = page['page_number']
        page_key = f"page_{page_num}"
        all_prompts[page_key] = {}
        
        for panel in page['panels']:
            panel_num = panel['panel_number']
            panel_key = f"panel_{panel_num}"
            
            if request_count > 0 and request_count % 8 == 0:
                elapsed = time.time() - start_time
                if elapsed < 60:
                    wait_time = 65 - elapsed
                    print(f"Rate limiting: Sleeping for {wait_time:.1f} seconds after {request_count} requests...")
                    time.sleep(wait_time)
                start_time = time.time()
            
            characters_from_dialogues = set(dialogue['character'] for dialogue in panel['dialogues'])
            italic_text = panel.get('italic_text', '')
            characters_in_panel = set()
            characters_in_panel.update(characters_from_dialogues)
            
            for char_name in character_descriptions.keys():
                if char_name in italic_text or char_name in panel['narration']:
                    characters_in_panel.add(char_name)
            
            character_desc_text = ""
            for char_name in characters_in_panel:
                if char_name.lower() != "narration":
                    desc = get_character_description(character_descriptions, char_name, page_num, panel_num)
                    if "(no detailed description available)" not in desc:  
                        character_desc_text += f"{char_name}: {desc}. "
            
            character_desc_text = character_desc_text.rstrip(". ")
            
            scene_description = italic_text
            if panel['narration']:
                if scene_description:
                    scene_description += " " + panel['narration']
                else:
                    scene_description = panel['narration']
            
            if style.lower() == "manga":
                style_instruction = f"""
                Create a detailed Stable Diffusion image prompt for generating a Manga comic book panel image.

                FULL STORY CONTEXT:
                {full_story_text}

                CURRENT PANEL SCENE: {scene_description}

                CHARACTER DESCRIPTIONS (THESE ARE FIXED AND MUST NEVER CHANGE):
                {character_desc_text}

                CRITICAL INSTRUCTIONS FOR CHARACTER CONSISTENCY:
                1. This is an image prompt to generate images for a comic book panel of the above story
                2. Start with "Manga style, black and white, monochrome, clean line art, high contrast"
                3. Understand the story's setting, time period, and world from the full context above
                4. Describe the environment and scene setting consistent with the story's world and era
                5. REPLACE character names with their EXACT COMPLETE VISUAL DESCRIPTIONS from CHARACTER DESCRIPTIONS
                6. NEVER use character names in the final prompt - only their physical descriptions
                7. NEVER MODIFY OR CHANGE any character's physical features from CHARACTER DESCRIPTIONS
                8. MANDATORY: Copy hair details EXACTLY (style, length, texture) from CHARACTER DESCRIPTIONS
                9. MANDATORY: Copy outfit details EXACTLY (every piece of clothing, accessories, materials) from CHARACTER DESCRIPTIONS
                10. You must USE THE EXACT SAME, hair style, and clothing items as written in CHARACTER DESCRIPTIONS
                11. DO NOT invent outfit pieces - use only what's specified
                12. If CHARACTER DESCRIPTIONS says "fiery auburn hair" - use "fiery auburn hair", NOT "black hair" or "dark hair"
                13. If CHARACTER DESCRIPTIONS says "crimson red leather jacket" - use "crimson red leather jacket", NOT "red jacket" or "leather jacket"
                14. Describe poses, actions, and expressions based on the current panel scene
                15. Maintain consistency with the story's tone, setting, and visual style throughout
                16. MAXIMUM 150 tokens total
                17. NO speech bubbles, text, or dialogue in the image
                18. Focus on visual composition and dramatic angles appropriate for the story

                EXAMPLE OF CORRECT CHARACTER REPLACEMENT:
                If scene mentions "Isabella looks angry" and Isabella is described as "woman with long, voluminous fiery auburn hair cascading down her back in loose, dramatic waves, with a sharp, side-swept fringe, wearing a striking, form-fitting crimson red leather motorcycle jacket with silver zippers over a black top, paired with slim-fit black cargo pants", 
                CORRECT OUTPUT: "woman with long, voluminous fiery auburn hair cascading down her back in loose, dramatic waves, with a sharp, side-swept fringe, wearing a striking, form-fitting crimson red leather motorcycle jacket with silver zippers over a black top, paired with slim-fit black cargo pants looks angry"
                WRONG OUTPUT: "woman with dark hair wearing red jacket looks angry"

                OUTPUT: Single line image generation prompt only, no explanations or character names.
                """
            else:
                style_instruction = f"""
                Create a detailed Stable Diffusion image prompt for generating a {style} comic book panel image.

                FULL STORY CONTEXT:
                {full_story_text}

                CURRENT PANEL SCENE: {scene_description}

                CHARACTER DESCRIPTIONS (THESE ARE FIXED AND MUST NEVER CHANGE):
                {character_desc_text}

                CRITICAL INSTRUCTIONS FOR CHARACTER CONSISTENCY:
                1. This is an image prompt to generate images for a comic book panel of the above story
                2. Start with "{style} style" and describe the art style characteristics in detail
                3. Understand the story's setting, time period, and world from the full context above
                4. Describe the environment and scene setting consistent with the story's world and era
                5. REPLACE character names with their EXACT COMPLETE VISUAL DESCRIPTIONS from CHARACTER DESCRIPTIONS
                6. NEVER use character names in the final prompt - only their physical descriptions
                7. NEVER MODIFY OR CHANGE any character's physical features from CHARACTER DESCRIPTIONS
                8. MANDATORY: Copy hair details EXACTLY (color, style, length, texture) from CHARACTER DESCRIPTIONS
                9. MANDATORY: Copy outfit details EXACTLY (every piece of clothing, accessories, materials, colors) from CHARACTER DESCRIPTIONS
                10. You must USE THE EXACT SAME hair color, hair style, outfit colors, and clothing items as written in CHARACTER DESCRIPTIONS
                11. DO NOT invent new hair colors, clothing colors, or outfit pieces - use only what's specified
                12. If CHARACTER DESCRIPTIONS says "fiery auburn hair" - use "fiery auburn hair", NOT "black hair" or "dark hair"
                13. If CHARACTER DESCRIPTIONS says "crimson red leather jacket" - use "crimson red leather jacket", NOT "red jacket" or "leather jacket"
                14. Describe poses, actions, and expressions based on the current panel scene
                15. Maintain consistency with the story's tone, setting, and visual style throughout
                16. MAXIMUM 150 tokens total
                17. NO speech bubbles, text, or dialogue in the image
                18. Focus on visual composition and dramatic angles appropriate for the story

                EXAMPLE OF CORRECT CHARACTER REPLACEMENT:
                If scene mentions "Isabella looks angry" and Isabella is described as "woman with long, voluminous fiery auburn hair cascading down her back in loose, dramatic waves, with a sharp, side-swept fringe, wearing a striking, form-fitting crimson red leather motorcycle jacket with silver zippers over a black top, paired with slim-fit black cargo pants", 
                CORRECT OUTPUT: "woman with long, voluminous fiery auburn hair cascading down her back in loose, dramatic waves, with a sharp, side-swept fringe, wearing a striking, form-fitting crimson red leather motorcycle jacket with silver zippers over a black top, paired with slim-fit black cargo pants looks angry"
                WRONG OUTPUT: "woman with dark hair wearing red jacket looks angry"

                OUTPUT: Single line image generation prompt only, no explanations or character names.
                """
            
            print(f"Generating detailed prompt for Page {page_num}, Panel {panel_num} (Request #{request_count + 1}/{total_panels})")
            
            model = "gemini-2.5-flash"
            contents = [
                types.Content(
                    role="user",
                    parts=[
                        types.Part.from_text(text=style_instruction),
                    ],
                ),
            ]
            generate_content_config = types.GenerateContentConfig(
                response_mime_type="text/plain",
                temperature=0.3,  
                max_output_tokens=65536,
                top_p=0.8 
            )

            response_chunks = []
            for chunk in client.models.generate_content_stream(
                model=model,
                contents=contents,
                config=generate_content_config,
            ):
                if chunk.text is not None:
                    response_chunks.append(chunk.text)
            
            prompt = "".join(response_chunks).strip()
            request_count += 1
            
            prompt = prompt.replace("**", "").strip()
            
            if style.lower() == "manga":
                if not prompt.lower().startswith("manga style, black and white"):
                    prompt = f"Manga style, black and white, monochrome, clean line art, high contrast, " + prompt
            else:
                if not prompt.lower().startswith(style.lower()):
                    prompt = f"{style} style, " + prompt
            
            max_tokens = 150 
            if len(prompt.split()) > max_tokens:
                words = prompt.split()
                truncated_prompt = ' '.join(words[:max_tokens])
                print(f"WARNING: Prompt for Page {page_num}, Panel {panel_num} truncated from {len(prompt.split())} to {max_tokens} words")
                prompt = truncated_prompt
            
            all_prompts[page_key][panel_key] = prompt
    
    print(f"Generated detailed prompts for all panels using {request_count} requests with proper {style} style formatting and enhanced character details")
    return all_prompts

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
    panel_prompts = generate_panel_prompts(comic_structure, character_descriptions, style, full_story_text)
    
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
    pipe = StableDiffusion3Pipeline.from_pretrained(
        "stabilityai/stable-diffusion-3.5-large", 
        torch_dtype=torch.bfloat16
    )
    pipe = pipe.to("cuda")
    
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
    """Generate a single image using either client or local pipeline"""
    try:
        client = Client("stabilityai/stable-diffusion-3.5-large")
        result = client.predict(
            prompt=prompt,
            negative_prompt=negative_prompt,
            seed=seed if not randomize_seed else None,
            randomize_seed=randomize_seed,
            width=width,
            height=height,
            guidance_scale=guidance_scale,
            num_inference_steps=num_inference_steps,
            api_name="/infer"
        )
        return result[0] 
        
    except Exception as e:
        print(f"Error with client: {e}")
        print("Falling back to local Diffusers pipeline...")
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
        except Exception as e2:
            print(f"Error with local pipeline: {e2}")
            raise e2

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