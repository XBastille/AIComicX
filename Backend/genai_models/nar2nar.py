import os
import sys
import json
import re
import torch
from google import genai
from google.genai import types
from markitdown import MarkItDown
from diffusers import StableDiffusion3Pipeline
from gradio_client import Client

def extract_page_panel_info(comic_text):
    """Extract page and panel information from comic markdown"""
    import re
    
    page_pattern = r'^## Page \d+$'
    pages = re.findall(page_pattern, comic_text, re.MULTILINE)
    total_pages = len(pages)
    
    page_sections = re.split(r'^## Page \d+$', comic_text, flags=re.MULTILINE)[1:]  
    
    panels_per_page = []
    
    for page_content in page_sections:
        panel_pattern = r'^### Panel \d+$'
        panels = re.findall(panel_pattern, page_content, re.MULTILINE)
        panels_per_page.append(len(panels))
    
    return {
        "total_pages": total_pages,
        "panels_per_page": panels_per_page
    }

def generate_character_descriptions(formatted_text, style):
    """Generate character descriptions from formatted text with enhanced focus on outfit and hair details"""
    client = genai.Client(
        api_key=os.getenv("GEMINI_KEY"),
    )

    character_names = set()
    lines = formatted_text.split('\n')
    for line in lines:
        if ':' in line and not line.strip().startswith('*'):
            possible_char = line.split(':')[0].strip()
            if possible_char and not possible_char.lower() in ['narration', 'narrator']:
                character_names.add(possible_char)

    story_context = f"CHARACTERS FOUND: {', '.join(character_names)}\n\nSTORY CONTENT:\n{formatted_text}"

    llm_prompt = f"""
    Create DETAILED visual descriptions of each character in this pre-formatted story with HEAVY FOCUS on outfit and hair details.
    
    FULL STORY CONTEXT:
    {story_context}

    STYLE REQUESTED:
    {style} style

    For EACH named character that appears or is mentioned in the story, create a DETAILED visual description that includes:
    1. HAIR: Very detailed hair color, style, length, texture, and any accessories (35-40 words)
    2. OUTFIT: Complete detailed clothing description including colors, materials, style, accessories, and condition (40-45 words)
    3. Basic physical attributes: age range, build (10-15 words)

    VERY IMPORTANT don't include the "narration" as character, it's not a character, it is interfering with the image generation
    Your descriptions should be COMPREHENSIVE and DETAILED (80-100 words total per character) to ensure perfect character consistency.

    FOCUS PRIORITY:
    1. Hair details (color, style, length, texture)
    2. Complete outfit description (every piece of clothing, colors, materials)
    3. Physical build and age
    4. Essential facial features

    OUTPUT FORMAT:
    Return a JSON object where keys are character names and values have "base" description:

    Example format:
    {{
      "Character1": {{
        "base": "30-year-old athletic man with thick wavy auburn hair styled in a messy pompadour with silver streaks at the temples, wearing a weathered dark brown leather jacket over a faded blue denim shirt with rolled sleeves, black tactical cargo pants with multiple pockets and silver buckles, scuffed combat boots, fingerless gloves, and a worn leather shoulder holster, sharp angular jawline with piercing green eyes"
      }},
      "Character2": {{
        "base": "young woman with long silky platinum blonde hair braided with blue ribbons and small silver beads, wearing an elegant white silk dress with intricate lace sleeves and pearl buttons, blue velvet cloak with silver embroidery, white leather boots with pearl buckles, delicate silver jewelry, slender build with bright blue eyes"
      }}
    }}
    """
    
    try:
        model = "gemini-2.5-pro"
        contents = [
            types.Content(
                role="user",
                parts=[
                    types.Part.from_text(text=llm_prompt),
                ],
            ),
        ]
        generate_content_config = types.GenerateContentConfig(
            response_mime_type="application/json",
            temperature=0.5,
            max_output_tokens=65536,
            top_p=1
        )

        response_chunks = []
        for chunk in client.models.generate_content_stream(
            model=model,
            contents=contents,
            config=generate_content_config,
        ):
            response_chunks.append(chunk.text)
        
        response_content = "".join(response_chunks)
        
        character_descriptions = json.loads(response_content)
        print(f"Generated detailed descriptions for {len(character_descriptions)} characters")
        return character_descriptions
        
    except Exception as e:
        print(f"Error generating character descriptions: {e}")
        return {}

def generate_character_reference_prompt(character_name, character_desc, style):
    """Generate intelligent reference image prompt using LLM with increased detail focus"""
    client = genai.Client(
        api_key=os.getenv("GEMINI_KEY"),
    )
    
    if style.lower() == "manga":
        style_instruction = f"""
        Create a detailed Stable Diffusion image prompt for a {style} character reference.

        CHARACTER: {character_name}
        CHARACTER DESCRIPTION: {character_desc}

        INSTRUCTIONS:
        1. Start with "Manga style, black and white, monochrome, clean line art, high contrast"
        2. Describe the character's full body view and standing pose
        3. Include their COMPLETE DETAILED physical description: {character_desc}
        4. Pay special attention to hair details (style, length, texture)
        5. Include EVERY detail of their outfit (clothing, accessories, materials)
        6. Add "full body character illustration, standing pose, front facing, neutral expression"
        7. Add "plain background, character sheet style"
        8. MAXIMUM 150 tokens total 
        9. Focus on clear character design and visual details
        10. Prioritize hair and outfit consistency

        OUTPUT: Single line prompt only, no explanations or character names.
        """
    else:
        style_instruction = f"""
        Create a detailed Stable Diffusion image prompt for a {style} character reference.

        CHARACTER: {character_name}
        CHARACTER DESCRIPTION: {character_desc}

        INSTRUCTIONS:
        1. Start with "{style} style" and describe the art style characteristics
        2. Describe the character's full body view and standing pose
        3. Include their COMPLETE DETAILED physical description: {character_desc}
        4. Pay special attention to hair details (color, style, length, texture)
        5. Include EVERY detail of their outfit (clothing, accessories, materials, colors)
        6. Add "full body character illustration, standing pose, front facing, neutral expression"
        7. Add "plain background, character sheet style"
        8. MAXIMUM 150 tokens total 
        9. Focus on clear character design and visual details
        10. Prioritize hair and outfit consistency

        OUTPUT: Single line prompt only, no explanations or character names.
        """
    
    try:
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
            temperature=0.7,
            max_output_tokens=65536,
            top_p=1
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
            print(f"WARNING: Reference prompt for {character_name} truncated from {len(prompt.split())} to {max_tokens} words")
            prompt = truncated_prompt
        
        return prompt
        
    except Exception as e:
        print(f"Error generating reference prompt for {character_name}: {e}")
        raise e

def generate_character_reference_image(character_index, character_name, character_desc, style):
    """Generate reference image for a character using intelligent LLM-generated prompt"""
    
    print(f"Generating intelligent reference prompt for {character_name}")
    reference_prompt = generate_character_reference_prompt(character_name, character_desc, style)
    
    print(f"Generated prompt: {reference_prompt}")
    
    os.makedirs('character_references', exist_ok=True)
    prompt_data = {
        "character": character_name,
        "description": character_desc,
        "style": style,
        "full_prompt": reference_prompt
    }
    prompt_file = f"character_references/reference{character_index}_prompt.json"
    with open(prompt_file, 'w', encoding='utf-8') as f:
        json.dump(prompt_data, f, indent=2)
    
    try:
        client = Client("stabilityai/stable-diffusion-3.5-large")
        result = client.predict(
            prompt=reference_prompt,
            negative_prompt="multiple people, blurry, low quality, distorted face, photorealistic, realistic, photo, cropped, partial body, headshot, portrait only, text, words, speech, dialogue, speech bubble, bubble",
            seed=9,
            randomize_seed=False,
            width=768,
            height=1024,
            guidance_scale=7.5,
            num_inference_steps=30,
            api_name="/infer"
        )
        
        image_path = f"character_references/reference{character_index}.png"
        if isinstance(result[0], str):
            import shutil
            shutil.copy(result[0], image_path)
        else:
            result[0].save(image_path)
        
        return image_path
        
    except Exception as e:
        print(f"Gradio client failed: {e}")
        try:
            pipe = StableDiffusion3Pipeline.from_pretrained(
                "stabilityai/stable-diffusion-3.5-large", 
                torch_dtype=torch.bfloat16
            )
            pipe = pipe.to("cuda")
            
            generator = torch.Generator("cuda").manual_seed(9)
            
            image = pipe(
                prompt=reference_prompt,
                negative_prompt="multiple people, blurry, low quality, distorted face, photorealistic, realistic, photo, cropped, partial body, headshot, portrait only, text, words, speech, dialogue, speech bubble, bubble",
                width=768,
                height=1024,
                max_sequence_length=512,
                guidance_scale=7.5,
                num_inference_steps=30,
                generator=generator
            ).images[0]
            
            image_path = f"character_references/reference{character_index}.png"
            image.save(image_path)
            return image_path
            
        except Exception as e2:
            print(f"Local pipeline also failed: {e2}")
            raise e2

def convert_formatted_to_comic(formatted_text):
    """
    Convert pre-formatted text with narration and dialogue into comic format with pages and panels
    Input format expected:
    narration text
    Character A: dialogue
    Character B: dialogue
    """
    client = genai.Client(
        api_key=os.getenv("GEMINI_KEY"),
    )

    system_prompt = """
You are a comic book script creator that converts pre-formatted text into detailed comic book format markdown.
Follow these exact rules when converting stories:

1. Divide the story into pages using markdown headers: ## Page 1, ## Page 2, etc.
2. Pages should have 1-4 panels, depending on the scene's importance:
   - Use a single panel for an entire page to emphasize heroic, iconic, or very important moments
   - Use 2-4 panels for regular storytelling where multiple scenes flow together
3. Label panels with: ### Panel 1, ### Panel 2, etc.
4. Each panel must contain maximum 3 dialogue lines.
5. IMPORTANT: Each panel should contain only ONE narration block if it has dialogues, else only 2.
6. If a conversation continues beyond 3 dialogue exchanges, move to a new panel.
7. Use visual language in narration that suggests what should be drawn in the panel.
8. For dramatic moments (revelations, plot twists, action climaxes), use a single full-page panel.
9. IMPORTANT: Do not include phrases like "A full-page panel" in your panel descriptions. Just describe the scene directly.
10. IMPORTANT: Do not include any parenthetical descriptions after character names like "(off-panel)" or "(shouting)".
11. IMPORTANT: Include all character actions as part of the narration, not as separate italicized lines.
12. IMPORTANT: Do not use any markdown formatting (asterisks, italics, etc.) inside narration text.

Format each panel like this:
### Panel X  
[Description of the visual scene in square brackets]

**Narration**: Brief narration text.

**Character Name:** "Dialogue line"  
**Another Character:** "Response dialogue"

---

Create proper page breaks between pages.
IMPORTANT: Do NOT wrap your response in ```markdown code blocks```. Just provide the raw markdown content directly.
"""

    try:
        model = "gemini-2.5-pro"
        full_prompt = f"{system_prompt}\n\nConvert this pre-formatted text into comic book markdown format:\n\n{formatted_text}"
        
        contents = [
            types.Content(
                role="user",
                parts=[
                    types.Part.from_text(text=full_prompt),
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
            if chunk.text:
                response_chunks.append(chunk.text)
        
        comic_text = "".join(response_chunks)
        return comic_text
        
    except Exception as e:
        return f"Error converting formatted text to comic format: {str(e)}"

def process_formatted_file(file_path, style="american comic (modern)", generate_reference_images=False, silent=False):
    """
    Process a file with pre-formatted narration and dialogue and convert it to comic format
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            formatted_text = file.read()
    except FileNotFoundError:
        if not silent:
            print(f"Error: File '{file_path}' not found.")
        return None
    except Exception as e:
        if not silent:
            print(f"Error reading file: {e}")
        return None
    
    if not silent:
        print("Converting formatted text to comic format...")
    comic_text = convert_formatted_to_comic(formatted_text)
    
    output_file = os.path.splitext(file_path)[0] + "_comic.md"
    with open(output_file, 'w', encoding='utf-8') as file:
        file.write(comic_text)
    
    if not silent:
        print(f"Comic format saved to {output_file}")
        print("\nGenerating character descriptions...")
    
    character_descriptions = generate_character_descriptions(formatted_text, style)
    
    if not silent:
        print("Extracting page and panel information...")
    page_panel_info = extract_page_panel_info(comic_text)
    
    if character_descriptions:
        character_descriptions["comic_structure"] = page_panel_info
        
        script_dir = os.path.dirname(os.path.abspath(__file__))
        output_dir = os.path.join(script_dir, 'output')
        os.makedirs(output_dir, exist_ok=True)
        char_desc_path = os.path.join(output_dir, 'character_descriptions.json')
        with open(char_desc_path, 'w', encoding='utf-8') as f:
            json.dump(character_descriptions, f, indent=2)
        
        if not silent:
            print(f"Character descriptions saved to {char_desc_path}")
            print(f"Comic structure: {page_panel_info['total_pages']} pages with {page_panel_info['panels_per_page']} panels per page")
        
        if generate_reference_images:
            if not silent:
                print("\nGenerating character reference images...")
            os.makedirs('character_references', exist_ok=True)
            
            character_index = 1
            for char_name, char_data in character_descriptions.items():
                if char_name != "comic_structure":  
                    char_desc = char_data.get('base', '')
                    if char_desc:
                        if not silent:
                            print(f"\nProcessing character {character_index}: {char_name}")
                            print(f"Description: {char_desc}")
                        
                        image_path = generate_character_reference_image(character_index, char_name, char_desc, style)
                        if not silent:
                            print(f"Reference image created: {image_path}")
                            print(f"Prompt saved: character_references/reference{character_index}_prompt.json")
                        
                        character_index += 1
        else:
            if not silent:
                print("\nSkipping reference image generation (disabled)")
        
        if not silent:
            print(f"\nComic conversion complete!")
            print(f"Comic script: {output_file}")
            print(f"Character descriptions: {char_desc_path}")
            if generate_reference_images:
                print(f"Reference images: character_references/ folder")
    
    return comic_text

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python nar2nar.py <input_file>")
        sys.exit(1)
    
    input_file = sys.argv[1]
    style = "american comic (modern)"
    
    generate_reference_images = False
    
    silent_mode = len(sys.argv) > 2 and sys.argv[2] == "--silent"
    
    result = process_formatted_file(input_file, style, generate_reference_images, silent=silent_mode)
    
    if result:
        if silent_mode:
            print("COMIC_CONTENT_START")
            print(result)
            print("COMIC_CONTENT_END")
        else:
            print("\n" + "="*50)
            print("COMIC_CONTENT_START")
            print("="*50)
            print(result)
            print("="*50)
            print("COMIC_CONTENT_END")
            print("="*50)
    