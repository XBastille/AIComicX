import os
import re
import json
import torch
from gradio_client import Client
from diffusers import StableDiffusion3Pipeline
import shutil
import markdown
import bs4
from azure.ai.inference import ChatCompletionsClient
from azure.ai.inference.models import SystemMessage
from azure.ai.inference.models import UserMessage
from azure.core.credentials import AzureKeyCredential

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
    """Generate concise character descriptions from the complete story"""
    client = ChatCompletionsClient(
        endpoint="https://models.inference.ai.azure.com",
        credential=AzureKeyCredential(os.environ.get("GITHUB_TOKEN")),
    )

    story_context = ""
    character_names = set()
    
    for page in comic_structure:
        for panel in page['panels']:
            for dialogue in panel['dialogues']:
                character_names.add(dialogue['character'])
            
            scene_text = panel['narration'] + " " + panel.get('italic_text', '')
            
            story_context += f"Page {page['page_number']}, Panel {panel['panel_number']}:\n"
            if panel.get('italic_text', ''):
                story_context += f"Scene description: {panel['italic_text']}\n"
            if panel['narration']:
                story_context += f"Narration: {panel['narration']}\n"
            for dialogue in panel['dialogues']:
                story_context += f"{dialogue['character']}: {dialogue['text']}\n"
    
    for char_name in character_names:
        story_context += f"\nCharacter explicitly in story: {char_name}\n"
    
    llm_prompt = f"""
    Create VERY SHORT visual descriptions of each character in this comic book story.
    
    FULL STORY CONTEXT:
    {story_context}

    STYLE REQUESTED:
    {style} style

    For EACH named character that appears or is mentioned in the story, create a CONCISE ONE-SENTENCE visual description that includes:
    1. Most essential facial features (eye color, hair color/style)
    2. Most essential physical attributes (age, build)
    3. Most essential clothing/outfit

    VERY IMPORTANT don't include the "narration" as character, it's not a character, it is interering with the image generation
    Your descriptions must be EXTREMELY CONCISE - ONE SENTENCE MAXIMUM (15-20 words) - while including the key visual details.
    Note any outfit changes that happen during the story.

    OUTPUT FORMAT:
    Return a JSON object where keys are character names and values have "base" description and optional "variations":

    Example format:
    {{
      "Character1": {{
        "base": "30-year-old man with green eyes, short black hair, wearing a navy suit and red tie",
        "variations": {{
          "page_2_panel_3": "same man but wearing a torn suit with visible wounds"
        }}
      }},
      "Character2": {{
        "base": "young woman with long blonde hair, blue eyes, slender, wearing a white dress"
      }}
    }}
    """
    
    response = client.complete(
        messages=[
            SystemMessage("You create extremely concise one-sentence character descriptions for comics. Focus only on the essential visual details needed for consistency. IMPORTANT: Always respond with valid JSON."),
            UserMessage(llm_prompt)
        ],
        model="Ministral-3B",
        temperature=0.5,
        max_tokens=2000,
        top_p=1
    )
    
    response_content = response.choices[0].message.content
    
    try:
        json_content = extract_json_from_response(response_content)
        character_descriptions = json.loads(json_content)
        
        print(f"Generated descriptions for {len(character_descriptions)} characters")
        for char, desc in character_descriptions.items():
            base_desc = desc.get("base", "No description")
            print(f"- {char}: {base_desc[:50]}...")
        return character_descriptions
    except json.JSONDecodeError as e:
        print(f"Error parsing character descriptions JSON: {e}")
        print(f"Full response content: \n{response_content}")
        try:
            if response_content.find('{') >= 0 and response_content.rfind('}') > response_content.find('{'):
                start_idx = response_content.find('{')
                end_idx = response_content.rfind('}') + 1
                json_content = response_content[start_idx:end_idx]
                character_descriptions = json.loads(json_content)
                print("Recovered JSON content successfully")
                return character_descriptions
        except:
            pass
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

def generate_panel_prompts(comic_structure, character_descriptions, style):
    """Generate prompts for each panel using the pre-generated character descriptions"""
    client = ChatCompletionsClient(
        endpoint="https://models.inference.ai.azure.com",
        credential=AzureKeyCredential(os.environ.get("GITHUB_TOKEN")),
    )
    
    all_prompts = {}
    
    for page in comic_structure:
        page_num = page['page_number']
        page_key = f"page_{page_num}"
        all_prompts[page_key] = {}
        
        for panel in page['panels']:
            panel_num = panel['panel_number']
            panel_key = f"panel_{panel_num}"
            
            characters_from_dialogues = set(dialogue['character'] for dialogue in panel['dialogues'])
            
            italic_text = panel.get('italic_text', '')
            
            characters_in_panel = set()
            
            characters_in_panel.update(characters_from_dialogues)
            
            for char_name in character_descriptions.keys():
                if char_name in italic_text or char_name in panel['narration']:
                    characters_in_panel.add(char_name)
            
            character_desc_text = ""
            for char_name in characters_in_panel:
                desc = get_character_description(character_descriptions, char_name, page_num, panel_num)
                if "(no detailed description available)" not in desc:  
                    character_desc_text += f"{char_name}: {desc}. "
            
            scene_description = italic_text
            if panel['narration']:
                if scene_description:
                    scene_description += " " + panel['narration']
                else:
                    scene_description = panel['narration']
            
            llm_prompt = f"""
            Create an image prompt for a comic panel.

            SCENE DESCRIPTION:
            {scene_description}

            CHARACTERS IN THIS PANEL:
            {character_desc_text}

            STYLE: {style}, illustration style, not photorealistic

            Your task:
            1. Begin with "{style}, illustration style, not photorealistic"
            2. Create a concise prompt (max 60 words) that exactly matches the scene description
            3. INCLUDE THE CHARACTER DESCRIPTIONS provided above VERBATIM - copy and paste them
            4. Focus on the panel's specific scene, environment, and character positioning
            5. No text, speech bubbles or dialogue in the image
            
            OUTPUT ONLY THE PROMPT with no explanations.
            """
            
            response = client.complete(
                messages=[
                    SystemMessage("You create comic panel image prompts, always incorporating the exact character descriptions provided."),
                    UserMessage(llm_prompt)
                ],
                model="Ministral-3B",
                temperature=0.7,
                max_tokens=200,
                top_p=1
            )
            
            prompt = response.choices[0].message.content.strip()
            
            max_tokens = 77 
            if len(prompt.split()) > max_tokens:
                words = prompt.split()
                truncated_prompt = ' '.join(words[:max_tokens])
                print(f"WARNING: Prompt for Page {page_num}, Panel {panel_num} truncated from {len(prompt.split())} to {max_tokens} words")
                prompt = truncated_prompt
            
            all_prompts[page_key][panel_key] = prompt
    
    return all_prompts

def generate_prompt_with_llm_full_context(comic_structure, style):
    """Generate detailed image prompts for ALL panels with full story context and character consistency"""
    
    print("Generating detailed character descriptions...")
    character_descriptions = generate_character_descriptions(comic_structure, style)
    
    character_desc_path = os.path.join('output', f"character_descriptions.json")
    os.makedirs(os.path.dirname(character_desc_path), exist_ok=True)
    with open(character_desc_path, 'w', encoding='utf-8') as f:
        json.dump(character_descriptions, f, indent=2)
    print(f"Character descriptions saved to {character_desc_path}")
    
    print("Generating panel prompts with character descriptions...")
    panel_prompts = generate_panel_prompts(comic_structure, character_descriptions, style)
    
    return {
        "character_descriptions": character_descriptions,
        "panel_prompts": panel_prompts
    }

def generate_prompt_with_llm(panel_content, style):
    """Generate detailed image prompt using LLM based on panel content and chosen style
    (Used as fallback when full context generation fails)"""
    client = ChatCompletionsClient(
        endpoint="https://models.inference.ai.azure.com",
        credential=AzureKeyCredential(os.environ.get("GITHUB_TOKEN")),
    )
    
    narration = panel_content['narration']
    
    character_names = [dialogue['character'] for dialogue in panel_content['dialogues']]
    characters_text = ", ".join(character_names) if character_names else "No specific characters"
    
    llm_prompt = f"""
    Create a concise and detailed Stable Diffusion 3.5 image generation prompt based on this comic panel.
    
    PANEL CONTENT:
    Narration: {narration}
    
    CHARACTERS IN SCENE: {characters_text}
    
    STYLE REQUESTED:
    {style} style - You should generate a detailed description of this style in your prompt.
    
    Your task:
    1. Create a detailed but CONCISE description (MAXIMUM 60 WORDS)
    2. Start with style descriptors (e.g., "{style}, illustration style, not photorealistic")
    3. Include detailed character descriptions with specific facial features, clothing, and physical attributes
    4. For each character, describe their:
       - Facial features (eye color/shape, hair color/style, face shape)
       - Clothing and accessories
       - Body type and physical attributes
    5. Describe character expressions, poses, and positioning in this specific scene
    6. Include environment details that reflect the narration
    7. Do NOT include text, speech bubbles, or dialogue
    8. Your prompt must be optimized for Stable Diffusion 3.5 which has a 77 token limit
    
    OUTPUT ONLY THE PROMPT TEXT with no explanations or meta-commentary.
    """
    
    response = client.complete(
        messages=[
            SystemMessage("You are an expert at creating detailed image prompts for comic panels. Your prompts must include specific character visual details to ensure consistency. Never include text, dialogue, or speech bubbles."),
            UserMessage(llm_prompt)
        ],
        model="Ministral-3B",
        temperature=0.7,
        max_tokens=150,
        top_p=1
    )
    
    prompt = response.choices[0].message.content.strip()
    
    max_tokens = 70  
    if len(prompt.split()) > max_tokens:
        words = prompt.split()
        truncated_prompt = ' '.join(words[:max_tokens])
        print(f"WARNING: Prompt truncated from {len(prompt.split())} to {len(truncated_prompt.split())} words")
        return truncated_prompt
    
    return prompt

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
            prompts_data = generate_prompt_with_llm_full_context(comic_structure, style)
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
            print(f"Generating individual prompt for Page {page_number}, Panel {panel_num}")
            prompt = generate_prompt_with_llm(panel, style)

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