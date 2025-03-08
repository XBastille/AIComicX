import requests
import cv2
import numpy as np
import os
import math
from PIL import Image, ImageDraw, ImageFont

def detect_character(image_path, prompt):
    """Call the API and extract bounding box coordinates"""
    url = "https://api.landing.ai/v1/tools/agentic-object-detection"
    
    with open(image_path, "rb") as img_file:
        files = {"image": img_file}
        
        data = {
            "prompts": prompt,
            "model": "agentic"
        }
        
        headers = {
            "Authorization": f"Basic {os.environ.get('LANDING_AI_API_KEY')}"
        }
        
        response = requests.post(url, files=files, data=data, headers=headers)
        result = response.json()
        
        print("API response:", result)
        
        try:
            bounding_box = result['data'][0][0]['bounding_box']
            return bounding_box
        except (KeyError, IndexError) as e:
            print(f"Error extracting bounding box: {e}")
            return None

def detect_characters(image_path, prompts):
    """Call the API and extract multiple bounding boxes for different characters"""
    url = "https://api.landing.ai/v1/tools/agentic-object-detection"
    bounding_boxes = []
    
    for prompt in prompts:
        with open(image_path, "rb") as img_file:
            files = {"image": img_file}
            
            data = {
                "prompts": prompt,
                "model": "agentic"
            }
            
            headers = {
                "Authorization": f"Basic {os.environ.get('LANDING_AI_API_KEY', 'eGNycmZ2NGV4dWRpZTJwbXY4b3lhOkJaR1ZyWEpzakdRVDNiT0tuVWgwWVdtNDhDbXpFNzFF')}"
            }
            
            response = requests.post(url, files=files, data=data, headers=headers)
            result = response.json()
            
            try:
                box = result['data'][0][0]['bounding_box']
                bounding_boxes.append(box)
                print(f"Found character for prompt '{prompt}': {box}")
            except (KeyError, IndexError) as e:
                print(f"Error extracting bounding box for prompt '{prompt}': {e}")
    
    return bounding_boxes

def get_comic_font(size=24):
    """Get an appropriate comic-style font with platform-independent paths"""
    font_paths = [
        "animeace2bb_tt/animeace2_bld.ttf",
    ]
    
    for font_path in font_paths:
        try:
            font = ImageFont.truetype(font_path, size)
            print(f"Using font: {font_path}")
            return font
        except IOError:
            continue
    
    print("No comic fonts found, using default font")
    return ImageFont.load_default()

def wrap_text_pil(text, font, max_width):
    """Wrap text to fit within maximum width using PIL font"""
    words = text.split(' ')
    wrapped_lines = []
    current_line = []
    
    for word in words:
        test_line = ' '.join(current_line + [word])
        text_width = font.getbbox(test_line)[2]
        
        if text_width <= max_width:
            current_line.append(word)
        else:
            if current_line:
                wrapped_lines.append(' '.join(current_line))
                current_line = [word]
            else:
                if len(word) > 10:
                    half = len(word) // 2
                    wrapped_lines.append(word[:half] + "-")
                    current_line = [word[half:]]
                else:
                    wrapped_lines.append(word)
                    current_line = []
    
    if current_line:
        wrapped_lines.append(' '.join(current_line))
        
    return wrapped_lines

def calculate_text_dimensions_pil(lines, font, line_spacing):
    """Calculate dimensions for wrapped text using PIL font"""
    max_width = 0
    total_height = 0
    line_heights = []
    
    for line in lines:
        bbox = font.getbbox(line)
        line_width = bbox[2] - bbox[0]
        line_height = bbox[3] - bbox[1]
        line_heights.append(line_height)
        max_width = max(max_width, line_width)
        total_height += line_height
    
    if len(lines) > 1:
        total_height += line_spacing * (len(lines) - 1)
    
    return max_width, total_height, line_heights

def draw_comic_tail(img, bubble_x, bubble_y, bubble_width, bubble_height, target_x, target_y, pointer_position):
    """Draw a comic-style speech bubble tail using OpenCV with improved connection"""
    overlay = img.copy()
    
    tail_narrowness = 6 
    
    if pointer_position == "bottom":
        bubble_bottom = int(bubble_y + bubble_height)
        bubble_connect_x = min(max(int(target_x), int(bubble_x + 20)), int(bubble_x + bubble_width - 20))
        
        tail_width_at_bubble = min(25, int(bubble_width / tail_narrowness))
        
        left_curve_x = max(int(bubble_connect_x - tail_width_at_bubble/2), int(bubble_x))
        right_curve_x = min(int(bubble_connect_x + tail_width_at_bubble/2), int(bubble_x + bubble_width))
        
        points = np.array([
            [left_curve_x, bubble_bottom],                  
            [int(target_x - 8), bubble_bottom + 5],        
            [target_x, target_y],                          
            [int(target_x + 8), bubble_bottom + 5],        
            [right_curve_x, bubble_bottom],                
        ], np.int32)
        
    elif pointer_position == "top":
        bubble_top = int(bubble_y)
        bubble_connect_x = min(max(int(target_x), int(bubble_x + 20)), int(bubble_x + bubble_width - 20))
        
        tail_width_at_bubble = min(25, int(bubble_width / tail_narrowness))
        
        left_curve_x = max(int(bubble_connect_x - tail_width_at_bubble/2), int(bubble_x))
        right_curve_x = min(int(bubble_connect_x + tail_width_at_bubble/2), int(bubble_x + bubble_width))
        
        points = np.array([
            [left_curve_x, bubble_top],                     
            [int(target_x - 8), bubble_top - 5],            
            [target_x, target_y],                           
            [int(target_x + 8), bubble_top - 5],            
            [right_curve_x, bubble_top],                    
        ], np.int32)
        
    elif pointer_position == "left":
        
        bubble_left = int(bubble_x)
        
        bubble_connect_y = min(max(int(target_y), int(bubble_y + 20)), int(bubble_y + bubble_height - 20))
        
        tail_height_at_bubble = min(25, int(bubble_height / tail_narrowness))
        
        top_curve_y = max(int(bubble_connect_y - tail_height_at_bubble/2), int(bubble_y))
        bottom_curve_y = min(int(bubble_connect_y + tail_height_at_bubble/2), int(bubble_y + bubble_height))
        
        points = np.array([
            [bubble_left, top_curve_y],                    
            [bubble_left - 5, int(target_y - 8)],          
            [target_x, target_y],                          
            [bubble_left - 5, int(target_y + 8)],          
            [bubble_left, bottom_curve_y],                  
        ], np.int32)
        
    elif pointer_position == "right":
        bubble_right = int(bubble_x + bubble_width)
        bubble_connect_y = min(max(int(target_y), int(bubble_y + 20)), int(bubble_y + bubble_height - 20))
        
        tail_height_at_bubble = min(25, int(bubble_height / tail_narrowness))
        
        top_curve_y = max(int(bubble_connect_y - tail_height_at_bubble/2), int(bubble_y))
        bottom_curve_y = min(int(bubble_connect_y + tail_height_at_bubble/2), int(bubble_y + bubble_height))
        
        points = np.array([
            [bubble_right, top_curve_y],                   
            [bubble_right + 5, int(target_y - 8)],         
            [target_x, target_y],                          
            [bubble_right + 5, int(target_y + 8)],          
            [bubble_right, bottom_curve_y],                
        ], np.int32)
    
    cv2.fillPoly(overlay, [points], (255, 255, 255))
    img = cv2.addWeighted(overlay, 1.0, img, 0.0, 0)
    cv2.polylines(img, [points], True, (0, 0, 0), 2, cv2.LINE_AA)
    
    return img

def calculate_bubble_dimensions(text, font, font_size, max_width, line_spacing):
    """Calculate dimensions for a speech bubble based on text content"""
    font = get_comic_font(size=font_size)
    
    wrap_width = max_width - 60 
    
    wrapped_lines = wrap_text_pil(text, font, wrap_width)
    
    text_width, text_height, line_heights = calculate_text_dimensions_pil(
        wrapped_lines, font, line_spacing
    )
    
    text_length = len(text)
    if text_length < 20:  
        horizontal_padding = 40
        vertical_padding = 30
        
        padding_factor = max(1.0, min(1.5, text_length / 10))
        bubble_width = text_width + int(horizontal_padding * padding_factor)
        bubble_height = text_height + int(vertical_padding * padding_factor)
        
        if text_length < 10:  
            avg_size = (bubble_width + bubble_height) / 2
            bubble_width = max(int(avg_size * 1.2), bubble_width)
            bubble_height = max(int(avg_size * 0.9), bubble_height)
    else: 
        horizontal_padding = 60
        vertical_padding = 40
        bubble_width = text_width + horizontal_padding
        bubble_height = text_height + vertical_padding
    
    min_bubble_width = max(120, int(text_width * 1.2))
    min_bubble_height = max(80, int(text_height * 1.5))
    
    bubble_width = max(bubble_width, min_bubble_width)
    bubble_height = max(bubble_height, min_bubble_height)
    
    
    optimal_aspect_ratio = 1.5
    current_ratio = bubble_width / bubble_height
    
    if text_length < 20:  
        if current_ratio > 2.2:
            bubble_height = int(bubble_width / 1.8)
        elif current_ratio < 0.8:
            bubble_width = int(bubble_height * 1.2)
    else:  
        if current_ratio > 2.0:
            bubble_height = int(bubble_width / optimal_aspect_ratio)
        elif current_ratio < 1.0:
            bubble_width = int(bubble_height * optimal_aspect_ratio)
    
    return bubble_width, bubble_height, wrapped_lines, text_width, text_height, line_heights

def draw_single_bubble(img, text, bubble_x, bubble_y, bubble_width, bubble_height, 
                      target_x, target_y, pointer_position, wrapped_lines, line_heights):
    """Draw a single speech bubble with text on the image"""
    overlay = img.copy()
    
    cv2.ellipse(
        overlay, 
        (int(bubble_x + bubble_width/2), int(bubble_y + bubble_height/2)),
        (int(bubble_width/2), int(bubble_height/2)),
        0,
        0, 360,
        (255, 255, 255),
        -1
    )
    
    img = cv2.addWeighted(overlay, 1.0, img, 0.0, 0)
    
    num_points = 60
    points = []
    for i in range(num_points):
        angle = 2 * np.pi * i / num_points
        wobble = np.sin(angle * 6) * 2
        x = int(bubble_x + bubble_width/2 + (bubble_width/2 + wobble) * np.cos(angle))
        y = int(bubble_y + bubble_height/2 + (bubble_height/2 + wobble) * np.sin(angle))
        points.append([x, y])
    
    points = np.array(points, np.int32)
    points = points.reshape((-1, 1, 2))
    cv2.polylines(img, [points], True, (0, 0, 0), 2, cv2.LINE_AA)
    
    img = draw_comic_tail(img, bubble_x, bubble_y, bubble_width, bubble_height, target_x, target_y, pointer_position)
    
    cv_img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    pil_img = Image.fromarray(cv_img_rgb)
    draw = ImageDraw.Draw(pil_img)
    
    font = get_comic_font(size=26)
    line_spacing = 14
    
    text_height = sum(line_heights) + line_spacing * (len(wrapped_lines) - 1)
    remaining_height = bubble_height - text_height
    top_padding = remaining_height // 2
    
    y_offset = int(bubble_y + top_padding)
    
    for i, line in enumerate(wrapped_lines):
        bbox = font.getbbox(line)
        line_width = bbox[2] - bbox[0]
        line_height = line_heights[i]
        
        text_x = int(bubble_x + (bubble_width - line_width) / 2)
        
        draw.text((text_x, y_offset), line, fill=(0, 0, 0), font=font)
        
        y_offset += line_height + line_spacing
    
    return cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2BGR)

def check_bubble_overlap(bubble1, bubble2, padding=20):
    """Check if two bubbles overlap with padding"""
    x1, y1, w1, h1 = bubble1
    x2, y2, w2, h2 = bubble2
    
    x1 -= padding
    y1 -= padding
    w1 += 2 * padding
    h1 += 2 * padding
    x2 -= padding
    y2 -= padding
    w2 += 2 * padding
    h2 += 2 * padding
    
    return not (x1 + w1 < x2 or x2 + w2 < x1 or y1 + h1 < y2 or y2 + h2 < y1)

def get_best_bubble_position(img_width, img_height, bounding_box, bubble_width, bubble_height, 
                             existing_bubbles=None, bubble_index=0):
    """Find best position for a bubble avoiding overlap with existing bubbles"""
    if existing_bubbles is None:
        existing_bubbles = []
    
    x1, y1, x2, y2 = map(int, bounding_box)
    box_width = x2 - x1
    box_height = y2 - y1
    box_center_x = (x1 + x2) // 2
    box_center_y = (y1 + y2) // 2
    
    bubble_margin = 50
    top_margin = 70
    edge_margin = 30  
    
    max_x = img_width - bubble_width - edge_margin
    max_y = img_height - bubble_height - edge_margin
    min_x = edge_margin
    min_y = edge_margin
    
    positions = []
    
    if bubble_index == 0:
        if y1 > bubble_height + bubble_margin:  
            positions = ["top", "right", "left"]
        else: 
            positions = ["right", "left", "top"]
    else:
        positions = ["top", "right", "left", "top-shifted-right", "top-shifted-left"]
    
    for pos in positions:
        if pos == "top":
            bubble_x = box_center_x - bubble_width // 2
            bubble_y = max(min_y, y1 - bubble_height - 20) 
            pointer_position = "bottom"
            target_x = box_center_x
            target_y = y1
        elif pos == "right":
            bubble_x = min(max_x, x2 + 20)  
            bubble_y = box_center_y - bubble_height // 2
            pointer_position = "left"
            target_x = x2
            target_y = box_center_y
        elif pos == "left":
            bubble_x = max(min_x, x1 - bubble_width - 20) 
            bubble_y = box_center_y - bubble_height // 2
            pointer_position = "right"
            target_x = x1
            target_y = box_center_y
        elif pos == "top-shifted-right":
            bubble_x = min(max_x, box_center_x)  
            bubble_y = max(min_y, y1 - bubble_height - 20)
            pointer_position = "bottom"
            target_x = box_center_x + box_width // 4  
            target_y = y1
        elif pos == "top-shifted-left":
            bubble_x = max(min_x, box_center_x - bubble_width)  
            bubble_y = max(min_y, y1 - bubble_height - 20)
            pointer_position = "bottom"
            target_x = box_center_x - box_width // 4  
            target_y = y1
        else:
            bubble_x = box_center_x - bubble_width // 2
            bubble_y = max(min_y, y1 - bubble_height - 20)
            pointer_position = "bottom"
            target_x = box_center_x
            target_y = y1
        
        bubble_x = max(min_x, min(bubble_x, max_x))
        bubble_y = max(min_y, min(bubble_y, max_y))
        
        current_bubble = (bubble_x, bubble_y, bubble_width, bubble_height)
        overlap = False
        
        for existing_bubble in existing_bubbles:
            if check_bubble_overlap(current_bubble, existing_bubble):
                overlap = True
                break
        
        if not overlap:
            return bubble_x, bubble_y, pointer_position, target_x, target_y
    
    bubble_spacing = 30
    
    if existing_bubbles:
        highest_bubble = min(existing_bubbles, key=lambda b: b[1])
        
        bubble_x = highest_bubble[0]
        bubble_y = max(min_y, highest_y - bubble_height - bubble_spacing)
        
        bubble_x = max(min_x, min(bubble_x, max_x))
        bubble_y = max(min_y, min(bubble_y, max_y))
        
        pointer_position = "bottom"
        target_x = box_center_x
        target_y = y1
        
        current_bubble = (bubble_x, bubble_y, bubble_width, bubble_height)
        overlap = False
        
        for existing_bubble in existing_bubbles:
            if check_bubble_overlap(current_bubble, existing_bubble):
                overlap = True
                break
        
        if not overlap:
            return bubble_x, bubble_y, pointer_position, target_x, target_y
    
    grid_step_x = img_width // 4
    grid_step_y = img_height // 4
    
    for grid_y in range(min_y, img_height - bubble_height - edge_margin, grid_step_y):
        for grid_x in range(min_x, img_width - bubble_width - edge_margin, grid_step_x):
            bubble_x = grid_x
            bubble_y = grid_y
            
            pointer_position = "bottom"  
            
            if grid_y > box_center_y:  
                target_x = box_center_x
                target_y = y2  
                pointer_position = "top"  
            elif grid_x > box_center_x: 
                target_x = x2  
                target_y = box_center_y
                pointer_position = "left" 
            elif grid_x + bubble_width < box_center_x:  
                target_x = x1 
                target_y = box_center_y
                pointer_position = "right"  
            else:  
                target_x = box_center_x
                target_y = y1  
                pointer_position = "bottom" 
            
            current_bubble = (bubble_x, bubble_y, bubble_width, bubble_height)
            min_overlap_score = float('inf')
            min_overlap_position = None
            
            overlap_score = 0
            for existing_bubble in existing_bubbles:
                if check_bubble_overlap(current_bubble, existing_bubble, padding=10):
                
                    ex, ey, ew, eh = existing_bubble
                    overlap_x = min(bubble_x + bubble_width, ex + ew) - max(bubble_x, ex)
                    overlap_y = min(bubble_y + bubble_height, ey + eh) - max(bubble_y, ey)
                    if overlap_x > 0 and overlap_y > 0:
                        overlap_score += overlap_x * overlap_y
            
            if overlap_score < min_overlap_score:
                min_overlap_score = overlap_score
                min_overlap_position = (bubble_x, bubble_y, pointer_position, target_x, target_y)
    
    if min_overlap_position:
        return min_overlap_position
    
    bubble_x = min(max_x, box_center_x - bubble_width // 2)
    bubble_y = max(min_y, y1 - bubble_height - 20)
    pointer_position = "bottom"
    target_x = box_center_x
    target_y = y1
    
    return bubble_x, bubble_y, pointer_position, target_x, target_y

def draw_multi_speech_bubbles(image_path, bounding_box, texts):
    """Draw multiple speech bubbles for the same character with non-overlapping placement"""
    cv_img = cv2.imread(image_path)
    if cv_img is None:
        print(f"Error: Could not read image at {image_path}")
        return None
    
    img_height, img_width = cv_img.shape[:2]
    
    font_size = 26
    max_bubble_width = min(300, img_width // 3) 
    line_spacing = 14
    
    existing_bubbles = []
    
    bubble_data = []
    for text in texts:
        bubble_width, bubble_height, wrapped_lines, text_width, text_height, line_heights = (
            calculate_bubble_dimensions(text, None, font_size, max_bubble_width, line_spacing)
        )
        
        bubble_data.append({
            'text': text,
            'width': bubble_width,
            'height': bubble_height,
            'wrapped_lines': wrapped_lines,
            'line_heights': line_heights
        })
    
    for i, data in enumerate(bubble_data):
        bubble_x, bubble_y, pointer_position, target_x, target_y = get_best_bubble_position(
            img_width, img_height, bounding_box, 
            data['width'], data['height'], 
            existing_bubbles,
            i  
        )
        
        print(f"Bubble {i}: Position ({bubble_x}, {bubble_y}), Size: {data['width']}x{data['height']}")
        print(f"    Pointer: {pointer_position}, Target: ({target_x}, {target_y})")
        
        cv_img = draw_single_bubble(
            cv_img, data['text'], 
            bubble_x, bubble_y, 
            data['width'], data['height'],
            target_x, target_y, 
            pointer_position,
            data['wrapped_lines'], 
            data['line_heights']
        )
        
        existing_bubbles.append((bubble_x, bubble_y, data['width'], data['height']))
    
    base_name = os.path.splitext(image_path)[0]
    output_path = f"{base_name}_with_bubbles.jpg"
    cv2.imwrite(output_path, cv_img)
    print(f"Image saved as {output_path}")
    
    return output_path

def get_best_bubble_position_multi_character(img_width, img_height, character_boxes, character_index, 
                                           bubble_width, bubble_height, all_bubbles=None, bubble_index=0):
    """Find optimal bubble position with flexible edge placement"""
    if all_bubbles is None:
        all_bubbles = []
    
    current_box = character_boxes[character_index]
    x1, y1, x2, y2 = map(int, current_box)
    box_width = x2 - x1
    box_height = y2 - y1
    box_center_x = (x1 + x2) // 2
    box_center_y = (y1 + y2) // 2
    
    edge_margin = 30
    max_x = img_width - bubble_width - edge_margin
    max_y = img_height - bubble_height - edge_margin
    min_x = edge_margin
    min_y = edge_margin
    
    space_top = y1 - min_y
    space_bottom = max_y - y2
    space_left = x1 - min_x
    space_right = max_x - x2
    
    has_space_top = space_top >= bubble_height + 20
    has_space_bottom = space_bottom >= bubble_height + 20
    has_space_left = space_left >= bubble_width + 20
    has_space_right = space_right >= bubble_width + 20
    
    target_points = []
    
    if has_space_top:
        for i in range(5):
            offset = (i - 2) * (box_width / 8)  
            tx = box_center_x + offset
            if x1 < tx < x2:  
                target_points.append({
                    'position': "top",
                    'target_x': tx,
                    'target_y': y1,
                    'bubble_x': tx - bubble_width / 2,
                    'bubble_y': max(min_y, y1 - bubble_height - 20),
                    'pointer': "bottom"
                })
    
    if has_space_bottom:
        for i in range(5):
            offset = (i - 2) * (box_width / 8)
            tx = box_center_x + offset
            if x1 < tx < x2:
                target_points.append({
                    'position': "bottom",
                    'target_x': tx,
                    'target_y': y2,
                    'bubble_x': tx - bubble_width / 2,
                    'bubble_y': min(max_y, y2 + 20),
                    'pointer': "top"
                })
    
    if has_space_left:
        for i in range(5):
            offset = (i - 2) * (box_height / 8)
            ty = box_center_y + offset
            if y1 < ty < y2:
                target_points.append({
                    'position': "left",
                    'target_x': x1,
                    'target_y': ty,
                    'bubble_x': max(min_x, x1 - bubble_width - 20),
                    'bubble_y': ty - bubble_height / 2,
                    'pointer': "right"
                })
    
    if has_space_right:
        for i in range(5):
            offset = (i - 2) * (box_height / 8)
            ty = box_center_y + offset
            if y1 < ty < y2:
                target_points.append({
                    'position': "right",
                    'target_x': x2,
                    'target_y': ty,
                    'bubble_x': min(max_x, x2 + 20),
                    'bubble_y': ty - bubble_height / 2,
                    'pointer': "left"
                })
    
    if not target_points:
        if bubble_index == 0:
            defaults = [("top", "bottom"), ("right", "left"), ("left", "right"), ("bottom", "top")]
        elif bubble_index == 1:
            defaults = [("right", "left"), ("top", "bottom"), ("left", "right"), ("bottom", "top")]
        else:
            defaults = [("left", "right"), ("top", "bottom"), ("right", "left"), ("bottom", "top")]
        
        for pos, pointer in defaults:
            if pos == "top":
                target_points.append({
                    'position': "top",
                    'target_x': box_center_x,
                    'target_y': y1,
                    'bubble_x': box_center_x - bubble_width / 2,
                    'bubble_y': max(min_y, y1 - bubble_height - 20),
                    'pointer': pointer
                })
            elif pos == "bottom":
                target_points.append({
                    'position': "bottom",
                    'target_x': box_center_x,
                    'target_y': y2,
                    'bubble_x': box_center_x - bubble_width / 2,
                    'bubble_y': min(max_y, y2 + 20),
                    'pointer': pointer
                })
            elif pos == "left":
                target_points.append({
                    'position': "left",
                    'target_x': x1,
                    'target_y': box_center_y,
                    'bubble_x': max(min_x, x1 - bubble_width - 20),
                    'bubble_y': box_center_y - bubble_height / 2,
                    'pointer': pointer
                })
            elif pos == "right":
                target_points.append({
                    'position': "right",
                    'target_x': x2,
                    'target_y': box_center_y,
                    'bubble_x': min(max_x, x2 + 20),
                    'bubble_y': box_center_y - bubble_height / 2,
                    'pointer': pointer
                })
    
    for point in target_points:
        bubble_x = point['bubble_x']
        bubble_y = point['bubble_y']
        target_x = point['target_x']
        target_y = point['target_y']
        pointer_position = point['pointer']
        
        original_x, original_y = bubble_x, bubble_y
        bubble_x = max(min_x, min(bubble_x, max_x))
        bubble_y = max(min_y, min(bubble_y, max_y))
        
        current_bubble = (bubble_x, bubble_y, bubble_width, bubble_height)
        
        character_overlap = False
        for char_idx, char_box in enumerate(character_boxes):
            if char_idx == character_index:
                continue
            
            cx1, cy1, cx2, cy2 = map(int, char_box)
            char_rect = (cx1, cy1, cx2-cx1, cy2-cy1)
            
            if check_bubble_overlap_with_character(current_bubble, char_rect):
                character_overlap = True
                break
        
        bubble_overlap = False
        for existing_bubble in all_bubbles:
            if check_bubble_overlap(current_bubble, existing_bubble):
                bubble_overlap = True
                break
        
        if not character_overlap and not bubble_overlap:
            return bubble_x, bubble_y, pointer_position, target_x, target_y
    
    edge_points = []
    
    if has_space_top:
        for offset_x in range(-box_width, box_width, box_width//4):
            tx = box_center_x + offset_x
            if tx > edge_margin and tx < img_width - edge_margin:
                edge_points.append({
                    'position': "top",
                    'target_x': max(min(tx, x2-5), x1+5), 
                    'target_y': y1,
                    'bubble_x': tx - bubble_width / 2,
                    'bubble_y': max(min_y, y1 - bubble_height - 20),
                    'pointer': "bottom"
                })
    
    
    for point in edge_points:
        bubble_x = max(min_x, min(point['bubble_x'], max_x))
        bubble_y = max(min_y, min(point['bubble_y'], max_y))
        target_x = point['target_x']
        target_y = point['target_y']
        pointer_position = point['pointer']
        
        current_bubble = (bubble_x, bubble_y, bubble_width, bubble_height)
        overlap = False
        
        for existing_bubble in all_bubbles:
            if check_bubble_overlap(current_bubble, existing_bubble):
                overlap = True
                break
        
        if not overlap:
            return bubble_x, bubble_y, pointer_position, target_x, target_y
    
    min_overlap_score = float('inf')
    min_overlap_position = None
    
    grid_step_x = img_width // 8  
    grid_step_y = img_height // 8
    
    for grid_y in range(min_y, img_height - bubble_height - edge_margin, grid_step_y):
        for grid_x in range(min_x, img_width - bubble_width - edge_margin, grid_step_x):
            bubble_x = grid_x
            bubble_y = grid_y
            
            
            if grid_x + bubble_width/2 < x1:  
                target_x = x1
                target_y = min(max(grid_y + bubble_height/2, y1), y2)
                pointer_position = "right"
            elif grid_x > x2:  
                target_x = x2
                target_y = min(max(grid_y + bubble_height/2, y1), y2)
                pointer_position = "left"
            elif grid_y + bubble_height < y1:  
                target_x = min(max(grid_x + bubble_width/2, x1), x2)
                target_y = y1
                pointer_position = "bottom"
            else: 
                target_x = min(max(grid_x + bubble_width/2, x1), x2)
                target_y = y2
                pointer_position = "top"
            
            current_bubble = (bubble_x, bubble_y, bubble_width, bubble_height)
            overlap_score = 0
            
            for existing_bubble in all_bubbles:
                if check_bubble_overlap(current_bubble, existing_bubble, padding=10):
                    ex, ey, ew, eh = existing_bubble
                    overlap_x = min(bubble_x + bubble_width, ex + ew) - max(bubble_x, ex)
                    overlap_y = min(bubble_y + bubble_height, ey + eh) - max(bubble_y, ey)
                    
                    if overlap_x > 0 and overlap_y > 0:
                        overlap_score += overlap_x * overlap_y
            
            if overlap_score < min_overlap_score:
                min_overlap_score = overlap_score
                min_overlap_position = (bubble_x, bubble_y, pointer_position, target_x, target_y)
    
    if min_overlap_position:
        return min_overlap_position
    
    bubble_x = min(max_x, box_center_x - bubble_width // 2)
    bubble_y = max(min_y, y1 - bubble_height - 20)
    pointer_position = "bottom"
    target_x = box_center_x
    target_y = y1
    
    return bubble_x, bubble_y, pointer_position, target_x, target_y

def check_bubble_overlap_with_character(bubble, char_box, padding=20):
    """Check if a bubble overlaps with a character bounding box"""
    bx, by, bw, bh = bubble
    
    cx, cy, cw, ch = char_box
    
    bx -= padding
    by -= padding
    bw += 2 * padding
    bh += 2 * padding
    
    return not (bx + bw < cx or cx + cw < bx or by + bh < cy or cy + ch < by)

def draw_multi_character_speech_bubbles(image_path, prompts, dialogs):
    """Draw speech bubbles for multiple characters in an image"""
    character_boxes = detect_characters(image_path, prompts)
    
    cv_img = cv2.imread(image_path)
    if cv_img is None:
        print(f"Error: Could not read image at {image_path}")
        return None
    
    img_height, img_width = cv_img.shape[:2]
    
    font_size = 26
    max_bubble_width = min(300, img_width // 3)
    line_spacing = 14
    
    all_bubbles = []
    
    for char_idx, char_box in enumerate(character_boxes):
        if char_idx >= len(dialogs):
            print(f"Warning: No dialog for character {char_idx+1}")
            continue
            
        char_dialog = dialogs[char_idx]
        
        bubble_width, bubble_height, wrapped_lines, _, _, line_heights = (
            calculate_bubble_dimensions(char_dialog, None, font_size, max_bubble_width, line_spacing)
        )
        
        bubble_x, bubble_y, pointer_position, target_x, target_y = get_best_bubble_position_multi_character(
            img_width, img_height, 
            character_boxes, char_idx,  
            bubble_width, bubble_height, 
            all_bubbles,  
            0  
        )
        
        cv_img = draw_single_bubble(
            cv_img, char_dialog, 
            bubble_x, bubble_y, 
            bubble_width, bubble_height,
            target_x, target_y, 
            pointer_position,
            wrapped_lines, 
            line_heights
        )
        
        all_bubbles.append((bubble_x, bubble_y, bubble_width, bubble_height))
    
    base_name = os.path.splitext(image_path)[0]
    output_path = f"{base_name}_multi_char_bubbles.jpg"
    cv2.imwrite(output_path, cv_img)
    print(f"Image saved as {output_path}")
    
    return output_path

def draw_multi_character_multi_dialog_bubbles(image_path, prompts, character_dialogs):
    """
    Draw speech bubbles for multiple characters with multiple dialogs each
    
    Args:
        image_path: Path to the image file
        prompts: List of prompts to detect characters (one per character)
        character_dialogs: Dictionary mapping character index to list of dialogs
                          e.g., {0: ["First dialog", "Second dialog"], 1: ["Dialog for character 2"]}
    """
    character_boxes = detect_characters(image_path, prompts)
    
    cv_img = cv2.imread(image_path)
    if cv_img is None:
        print(f"Error: Could not read image at {image_path}")
        return None

    debug_img = draw_bounding_boxes(cv_img, character_boxes)
    base_name = os.path.splitext(image_path)[0]
    debug_path = f"{base_name}_debug_boxes.jpg"
    cv2.imwrite(debug_path, debug_img)
    print(f"Debug image with bounding boxes saved as {debug_path}")
    
    
    img_height, img_width = cv_img.shape[:2]
    
    font_size = 26
    max_bubble_width = min(300, img_width // 3)
    line_spacing = 14
    
    all_bubbles = []
    
    total_dialogs = sum(len(dialogs) for dialogs in character_dialogs.values())
    max_bubbles = 3 
    
    all_dialog_info = []
    for char_idx, dialogs in character_dialogs.items():
        if char_idx >= len(character_boxes):
            print(f"Warning: No detected character for index {char_idx}")
            continue
        
        for dialog in dialogs:
            all_dialog_info.append({
                'char_idx': char_idx,
                'dialog': dialog
            })
    
    if len(all_dialog_info) > max_bubbles:
        print(f"Warning: Total dialogs ({len(all_dialog_info)}) exceeds maximum allowed bubbles ({max_bubbles}). Using only first {max_bubbles}.")
        all_dialog_info = all_dialog_info[:max_bubbles]
    
    for dialog_idx, dialog_info in enumerate(all_dialog_info):
        char_idx = dialog_info['char_idx']
        dialog = dialog_info['dialog']
        
        if char_idx >= len(character_boxes):
            print(f"Error: Character index {char_idx} exceeds available characters ({len(character_boxes)})")
            continue
        
        char_box = character_boxes[char_idx]
        
        bubble_width, bubble_height, wrapped_lines, _, _, line_heights = (
            calculate_bubble_dimensions(dialog, None, font_size, max_bubble_width, line_spacing)
        )
        
        dialog_count_for_char = len(character_dialogs.get(char_idx, []))
        bubble_idx_for_char = character_dialogs[char_idx].index(dialog) if dialog in character_dialogs.get(char_idx, []) else 0
        
        bubble_x, bubble_y, pointer_position, target_x, target_y = get_best_bubble_position_multi_character(
            img_width, img_height, 
            character_boxes, char_idx,  
            bubble_width, bubble_height, 
            all_bubbles,  
            bubble_idx_for_char  
        )
        
        print(f"Bubble for Character {char_idx}, Dialog {bubble_idx_for_char+1}/{dialog_count_for_char}: "
              f"Position ({bubble_x}, {bubble_y}), Size: {bubble_width}x{bubble_height}")
        print(f"    Pointer: {pointer_position}, Target: ({target_x}, {target_y})")
        
        cv_img = draw_single_bubble(
            cv_img, dialog, 
            bubble_x, bubble_y, 
            bubble_width, bubble_height,
            target_x, target_y, 
            pointer_position,
            wrapped_lines, 
            line_heights
        )
        
        all_bubbles.append((bubble_x, bubble_y, bubble_width, bubble_height))
    
    base_name = os.path.splitext(image_path)[0]
    output_path = f"{base_name}_multi_dialogs.jpg"
    cv2.imwrite(output_path, cv_img)
    print(f"Image with multiple character dialogs saved as {output_path}")
    
    return output_path

def draw_bounding_boxes(img, character_boxes):
    """Draw bounding boxes for detected characters to help with debugging"""
    debug_img = img.copy()
    
    colors = [
        (0, 255, 0),    
        (255, 0, 0),    
        (0, 0, 255),    
        (255, 255, 0),  
        (255, 0, 255),  
    ]
    
    for i, box in enumerate(character_boxes):
        x1, y1, x2, y2 = map(int, box)
        color = colors[i % len(colors)]
        
        cv2.rectangle(debug_img, (x1, y1), (x2, y2), color, 2)
        
        cv2.putText(debug_img, f"Char {i}", (x1, y1-10), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.7, color, 2)
    
    return debug_img

def main():
    image_path = "testing_3.jpg"
    
    character_dialogs = {
        0: ["Hey, I'm here for you, tell me what's going on"],  
        1: ["Nothing seems to work", "Don't worry about it"],  
          
    }
    
    output_path = draw_multi_character_multi_dialog_bubbles(image_path, prompts, character_dialogs)
    print(f"Multi-character multi-dialog speech bubbles added. Output saved to: {output_path}")

if __name__ == "__main__":
    main()
