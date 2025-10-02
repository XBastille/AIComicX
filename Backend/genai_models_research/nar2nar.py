import os
import sys
import json
import torch
import re
import shutil
from google import genai
from google.genai import types
from markitdown import MarkItDown
from diffusers import StableDiffusion3Pipeline
from gradio_client import Client


def generate_character_descriptions(formatted_text, style):
    """Generate character descriptions with dynamic variations based on story context"""
    client = genai.Client(
        api_key=os.environ["GEMINI_KEY"],
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
    Create DETAILED character descriptions with DYNAMIC VARIATIONS based on story context and scenes.
    
    FULL STORY CONTEXT:
    {story_context}

    STYLE REQUESTED:
    {style} style

    TASK: For EACH named character, create a MAIN description plus CONTEXTUAL VARIATIONS based on different scenes, settings, or time periods in the story.

    CRITICAL: Focus ONLY on PURE VISUAL APPEARANCE - no environmental context, emotions, or situational details.

    STRUCTURED FEATURE TAGGING (MANDATORY): Each description (main & variations) MUST contain tags in this exact order: [AGE_BUILD] [HAIR] [EYES] [FACIAL_FEATURES] [OUTFIT] [ACCESSORIES] [DISTINCTIVES]. Example:
    "[AGE_BUILD] 30-year-old lean athletic man. [HAIR] short dark brown windswept hair ... [EYES] intense grey eyes ... [FACIAL_FEATURES] angular jaw, straight nose ... [OUTFIT] fitted charcoal technical jacket over moisture-wicking base layer, reinforced black tactical pants, weathered climbing harness, dark composite boots ... [ACCESSORIES] fingerless tactical gloves, slim wrist device ... [DISTINCTIVES] faint healed scar across left eyebrow."

    CONTINUITY / RANGE INFERENCE:
    - Extend outfit variation ranges forward until explicit change occurs; e.g. wetsuit introduced 4.2 and used through storm at 5.1 => range "4.2-5.1".
    - Do not fragment continuous identical outfits into multiple variations.
    - Minor condition changes (wet, torn, bloodied) stay inside same [OUTFIT] segment with state adjectives appended.
    - Major garment swap (adding/removing distinct layer) starts a new variation.
    - Ensure chronological, non-overlapping ranges; fill gaps if outfit obviously maintained.

    OUTFIT COMPLETENESS RULE:
    - [OUTFIT] must always enumerate: upper layers, lower garment, footwear, materials, dominant colors, fit descriptors, and any harness/gear.
    - Never omit [OUTFIT]; omission invalid.

    SELF VALIDATION BEFORE OUTPUT:
    - Verify all seven tags appear exactly once per description.
    - Verify no variation duplicates main verbatim without justification.
    - Verify extended ranges reflect continuous presence.
    - Repair any missing tag segments prior to returning JSON.

    CORE CHARACTER CONSISTENCY (MUST MAINTAIN):
    - Exact hair color with specific shade descriptions
    - Exact eye color with intensity details  
    - Facial structure and distinctive features
    - Body build, height, age appearance
    - Any scars, birthmarks, or unique traits

    REQUIRED VISUAL DETAIL LEVEL:
    1. HAIR: Include color, texture, length, specific style, and distinctive features
       Examples: "striking metallic silver hair", "gravity-defying spiky layered brown hair with lighter brunette highlights"
    2. EYES: Include exact color, shape, and distinctive qualities
       Examples: "piercing bright emerald green eyes", "intense grey eyes", "sharp dark brown eyes"
    3. CLOTHING: Include materials, colors, fit, layering, and specific style details
       Examples: "long form-fitting trench coat of black synth-leather over sleeveless high-necked black silk top"
    4. PHYSICAL BUILD: Include height indication, build type, and distinctive physical traits
       Examples: "lean athletic build", "tall muscular imposing build", "slender but resilient build"

    FORBIDDEN ELEMENTS (NEVER INCLUDE):
    - Environmental context: "by the cold London air", "in the jungle humidity"
    - Emotional states: "determined", "focused", "concerned"
    - Situational details: "during escape", "after struggle", "while working"
    - Action descriptions: "leaning", "running", "speaking"
    - Only pure static visual appearance allowed

    VARIATION CATEGORIES TO DETECT AND CREATE (PHYSICAL APPEARANCE CHANGES ONLY):
    1. MAIN/DEFAULT: Primary outfit used throughout most of the story
    2. OUTFIT CHANGES: Different clothing/outfits worn in specific scenes
        - Casual vs formal wear
        - Work uniform vs street clothes
        - Seasonal clothing (winter coat, summer wear, etc.)
        - Special event outfits (party dress, suit, etc.)
    3. TEMPORAL CHANGES: Different ages of the same character
        - Childhood versions (younger appearance)
        - Teenage versions
        - Elderly versions (older appearance)
    4. PHYSICAL STATE CHANGES: Visible physical alterations
        - Injured/bandaged appearance
        - Different hairstyles (if significantly different)
        - Costume/disguise changes

    INSTRUCTIONS:
    1. Analyze the story to identify different contexts where characters appear
    2. Create variations ONLY for VISIBLE PHYSICAL CHANGES (outfits, age, appearance)
    3. DO NOT create variations for emotional states, moods, or situational contexts
    4. ALWAYS maintain core physical features (hair color, eyes, build, etc.)
    5. Main description should be the most commonly used outfit
    6. Each variation should be 80-100 words with complete outfit details
    7. Include specific page.panel ranges where each variation applies (e.g., "1.2-3.4")
    8. Only create variations when there are ACTUAL outfit changes or temporal differences mentioned in the story

    OUTPUT FORMAT:
    Use page.panel-page.panel format for precise panel-level tracking (e.g., "1.2-3.4, 8.1-10.3")
    {{
      "Character1": {{
        "main": "detailed main outfit description with core features...",
        "variations": {{
          "work_outfit": {{
            "1.2-3.4, 8.1-10.3": "COMPLETE character description with work uniform while maintaining ALL core features (hair, eyes, build, etc.)..."
          }},
          "formal_suit": {{
            "15.1-17.2": "COMPLETE character description with formal attire while maintaining ALL core features (hair, eyes, build, etc.)..."
          }},
          "childhood": {{
            "22.3-24.1": "COMPLETE younger version description maintaining hair color, facial features, and build..."
          }}
        }}
      }}
    }}

    EXAMPLE:
    {{
      "Emma": {{
        "main": "25-year-old woman with flowing golden blonde hair cascading to her shoulders in soft waves, bright emerald green eyes, athletic build, wearing elegant navy blue business blazer over white silk blouse, tailored black trousers, black leather heels",
        "variations": {{
          "winter_coat": {{
            "5.2-7.4": "25-year-old woman with flowing golden blonde hair in messy bun, bright emerald green eyes, athletic build, wearing thick navy winter coat, warm scarf, dark jeans, winter boots, gloves"
          }},
          "teenage": {{
            "12.1-14.3": "17-year-old version with same golden blonde hair but shorter and straighter, bright emerald green eyes, slender teenage build, wearing school uniform with pleated skirt, white blouse, navy blazer"
          }}
        }}
      }}
    }}

    IMPORTANT: 
    - NEVER include "narration" as a character
    - Only create variations for ACTUAL outfit changes or temporal (age) differences
    - DO NOT create variations for emotions, moods, situations, or contexts
    - DO NOT create variations like "determined_action", "empathetic_support", "grieving", etc.
    - Maintain character consistency across all variations
    - Use precise page.panel ranges like "1.2-3.4" for panel-level accuracy
    - Each variation should be a COMPLETE character description, not partial
    - Variations should be the SAME LENGTH and DETAIL as the main description
    - Focus ONLY on visible physical appearance changes (clothes, age, hair style)
    - Mandated tags order: [AGE_BUILD][HAIR][EYES][FACIAL_FEATURES][OUTFIT][ACCESSORIES][DISTINCTIVES]
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
        
    except json.JSONDecodeError as e:
        print(f"Error: Could not parse JSON response: {e}")
        print(f"Response content: {response_content[:500]}...")
        return {}
    except Exception as e:
        print(f"Error generating character descriptions: {e}")
        return {}

def generate_character_reference_prompt(character_name, character_desc, style):
    """Generate intelligent reference image prompt using LLM with increased detail focus"""
    client = genai.Client(
        api_key=os.environ["GEMINI_KEY"],
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
    Convert pre-formatted text with narration and dialogue into comic format JSON
    Input format expected:
    narration text
    Character A: dialogue
    Character B: dialogue
    """
    client = genai.Client(
        api_key=os.environ["GEMINI_KEY"],
    )

    prompt = f"""
    Convert the following pre-formatted text (which already has narration and character dialogue) into a comic book JSON format with pages and panels.
    Follow these formatting rules:

    1. Divide the story into pages. Pages should have 1-4 panels, depending on the scene's importance:
       - Use a single panel for an entire page to emphasize heroic, iconic, or very important moments
       - Use 2-4 panels for regular storytelling where multiple scenes flow together
    2. Each panel must contain maximum 3 dialogue lines.
    3. Format narration as array entries in the panel.
    4. If a conversation continues beyond 3 dialogue exchanges, move to a new panel.
    5. Use visual language in scene descriptions that suggests what should be drawn in the panel.
    6. For dramatic moments (revelations, plot twists, action climaxes), use a single full-page panel.
    7. IMPORTANT: Do not include any parenthetical descriptions after character names like "(off-panel)" or "(shouting)".
    8. IMPORTANT: Include all character actions as part of the narration.

    LENGTH LIMITS (CRITICAL):
    9. Single narration: Maximum 200 characters. If longer, split into multiple panels.
    10. Single dialogue: Maximum 100 characters. If longer, split into multiple dialogue entries or panels.
    11. If content exceeds limits, intelligently break it:
        - For narration: Create a new panel with continuation
        - For dialogue: Split into multiple dialogue entries in same panel, or move to next panel if already at 3 dialogues

    JSON OUTPUT FORMAT:
    {{
      "pages": [
        {{
          "page_number": 1,
          "panels": [
            {{
              "panel_number": 1,
              "scene_description": "Description of the visual scene",
              "narrations": [
                "First narration text",
                "Second narration text (optional)"
              ],
              "dialogues": [
                {{
                  "character": "Character Name",
                  "text": "Dialogue line without quotes"
                }}
              ]
            }}
          ]
        }}
      ]
    }}

    Note: The input is already formatted with narration paragraphs and character dialogues in the format "Character: dialogue".
    Your job is to organize this into the comic book page and panel JSON structure while maintaining the original dialogue.

    IMPORTANT: Return ONLY valid JSON, no markdown code blocks or explanations.

    Input text:
    {formatted_text}
    """

    try:
        model = "gemini-2.5-pro"
        contents = [
            types.Content(
                role="user",
                parts=[
                    types.Part.from_text(text=prompt),
                ],
            ),
        ]
        generate_content_config = types.GenerateContentConfig(
            response_mime_type="application/json",
            temperature=0.7,
            max_output_tokens=65536,
            top_p=1
        )

        response_chunks = []
        content = ""
        
        try:
            for chunk in client.models.generate_content_stream(
                model=model,
                contents=contents,
                config=generate_content_config,
            ):
                response_chunks.append(chunk.text)
            
            content = "".join(response_chunks)
        except Exception as stream_error:
            print(f"Error during streaming: {stream_error}")
            print(f"Attempting non-streaming generation...")
            
            response = client.models.generate_content(
                model=model,
                contents=contents,
                config=generate_content_config,
            )
            content = response.text
        
        if not content or content.strip() == "":
            print("Error: Empty response from Gemini API")
            return None
        
        try:
            comic_json = json.loads(content)
        except json.JSONDecodeError as e:
            print(f"Error: Could not parse JSON response: {e}")
            print(f"Response content (first 500 chars): {content[:500]}...")
            return None
        
        return comic_json
        
    except Exception as e:
        print(f"Error converting formatted text to comic format: {str(e)}")
        import traceback
        traceback.print_exc()
        return None

def convert_json_to_markdown(comic_json):
    """Convert comic JSON to markdown format with exact structure."""
    if not comic_json or 'pages' not in comic_json:
        return ""
    
    markdown_lines = []
    
    for page in comic_json['pages']:
        page_num = page['page_number']
        markdown_lines.append(f"## Page {page_num}")
        
        for panel in page['panels']:
            panel_num = panel['panel_number']
            markdown_lines.append(f"### Panel {panel_num}")
            
            scene_desc = panel.get('scene_description', '')
            if scene_desc:
                markdown_lines.append(f"[{scene_desc}]")
                markdown_lines.append("")  
            
            narrations = panel.get('narrations', [])
            for narration in narrations:
                markdown_lines.append(f"**Narration**: {narration}")
                markdown_lines.append("")  
            
            dialogues = panel.get('dialogues', [])
            for dialogue in dialogues:
                character = dialogue.get('character', '')
                text = dialogue.get('text', '')
                markdown_lines.append(f"**{character}:** \"{text}\"")
            
            if dialogues and panel != page['panels'][-1]:
                markdown_lines.append("")
        
        markdown_lines.append("")
        markdown_lines.append("---")
        markdown_lines.append("")
    
    return "\n".join(markdown_lines)

def extract_page_panel_info_from_json(comic_json):
    """Extract page and panel information directly from comic JSON structure."""
    if not comic_json or 'pages' not in comic_json:
        return {
            "total_pages": 0,
            "panels_per_page": []
        }
    
    total_pages = len(comic_json['pages'])
    panels_per_page = [len(page['panels']) for page in comic_json['pages']]
    
    return {
        "total_pages": total_pages,
        "panels_per_page": panels_per_page
    }

def process_formatted_file(file_path, style="american comic (modern)", generate_reference_images=False):
    """
    Process a file with pre-formatted narration and dialogue and convert it to comic format
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            formatted_text = file.read()
    except FileNotFoundError:
        print(f"Error: File '{file_path}' not found.")
        return None
    except Exception as e:
        print(f"Error reading file: {e}")
        return None
    
    print("Converting formatted text to comic JSON format...")
    comic_json = convert_formatted_to_comic(formatted_text)
    
    if not comic_json:
        print("Error: Failed to convert formatted text to comic JSON")
        return None
    
    json_output_file = os.path.splitext(file_path)[0] + ".json"
    os.makedirs('output', exist_ok=True)
    with open(json_output_file, 'w', encoding='utf-8') as f:
        json.dump(comic_json, f, indent=2)
    print(f"Comic JSON saved to: {json_output_file}")
    
    print("Converting JSON to markdown format...")
    comic_text = convert_json_to_markdown(comic_json)
    
    output_file = os.path.splitext(file_path)[0] + "_comic.md"
    with open(output_file, 'w', encoding='utf-8') as file:
        file.write(comic_text)
    
    print(f"Comic markdown format saved to {output_file}")
    
    print("\nGenerating character descriptions...")
    character_descriptions = generate_character_descriptions(formatted_text, style)
    
    print("Extracting page and panel information from JSON...")
    page_panel_info = extract_page_panel_info_from_json(comic_json)
    
    if character_descriptions:
        character_descriptions["comic_structure"] = page_panel_info
        
        char_desc_path = os.path.join('output', 'character_descriptions.json')
        with open(char_desc_path, 'w', encoding='utf-8') as f:
            json.dump(character_descriptions, f, indent=2)
        print(f"Character descriptions saved to {char_desc_path}")
        print(f"Comic structure: {page_panel_info['total_pages']} pages with {page_panel_info['panels_per_page']} panels per page")
        
        if generate_reference_images:
            print("\nGenerating character reference images...")
            os.makedirs('character_references', exist_ok=True)
            
            character_index = 1
            for char_name, char_data in character_descriptions.items():
                if char_name == "comic_structure":
                    continue
                
                char_desc = char_data.get('main', char_data.get('base', ''))
                if char_desc:
                    print(f"\nProcessing character {character_index}: {char_name}")
                    print(f"Description: {char_desc}")
                    
                    image_path = generate_character_reference_image(character_index, char_name, char_desc, style)
                    print(f"Reference image created: {image_path}")
                    print(f"Prompt saved: character_references/reference{character_index}_prompt.json")
                    
                    character_index += 1
        else:
            print("\nSkipping reference image generation (disabled)")
        
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
    
    result = process_formatted_file(input_file, style, generate_reference_images)