import os
import cv2
import numpy as np
import pandas as pd
from PIL import Image, ImageEnhance, ImageFilter
import random
import json
from pathlib import Path
import argparse
from tqdm import tqdm
import multiprocessing as mp
from functools import partial

class PerformativeImageGenerator:
    def __init__(self, output_dir, num_samples=10000):
        self.output_dir = Path(output_dir)
        self.num_samples = num_samples
        self.performative_items = {
            'vintage_camera': 0.15,
            'tote_bag': 0.12,
            'record_player': 0.08,
            'typewriter': 0.06,
            'coffee_cup': 0.25,
            'books': 0.30,
            'glasses': 0.20,
            'beard': 0.18,
            'flannel': 0.14,
            'bicycle': 0.10,
            'art_supplies': 0.16,
            'indie_poster': 0.09,
            'vinyl_records': 0.11,
            'film_camera': 0.13,
            'notebook': 0.22
        }
        
        self.aesthetic_filters = [
            'vintage', 'sepia', 'film_grain', 'vignette', 
            'desaturated', 'high_contrast', 'soft_focus'
        ]
        
        self.setup_directories()
    
    def setup_directories(self):
        self.output_dir.mkdir(parents=True, exist_ok=True)
        (self.output_dir / 'train' / 'performative').mkdir(parents=True, exist_ok=True)
        (self.output_dir / 'train' / 'authentic').mkdir(parents=True, exist_ok=True)
        (self.output_dir / 'val' / 'performative').mkdir(parents=True, exist_ok=True)
        (self.output_dir / 'val' / 'authentic').mkdir(parents=True, exist_ok=True)
        (self.output_dir / 'test' / 'performative').mkdir(parents=True, exist_ok=True)
        (self.output_dir / 'test' / 'authentic').mkdir(parents=True, exist_ok=True)
    
    def generate_synthetic_image(self, width=512, height=512, performative=True):
        image = np.random.randint(0, 256, (height, width, 3), dtype=np.uint8)
        
        if performative:
            image = self.add_performative_elements(image)
            image = self.apply_aesthetic_filter(image)
        else:
            image = self.add_authentic_elements(image)
        
        return image
    
    def add_performative_elements(self, image):
        h, w = image.shape[:2]
        
        num_items = random.randint(2, 5)
        selected_items = random.sample(list(self.performative_items.keys()), num_items)
        
        for item in selected_items:
            if random.random() < self.performative_items[item]:
                image = self.draw_performative_item(image, item)
        
        return image
    
    def draw_performative_item(self, image, item):
        h, w = image.shape[:2]
        
        item_configs = {
            'vintage_camera': {'color': (139, 69, 19), 'size': (80, 60)},
            'tote_bag': {'color': (245, 245, 220), 'size': (100, 120)},
            'coffee_cup': {'color': (160, 82, 45), 'size': (40, 60)},
            'books': {'color': (105, 105, 105), 'size': (60, 80)},
            'glasses': {'color': (0, 0, 0), 'size': (70, 25)},
            'bicycle': {'color': (70, 130, 180), 'size': (120, 80)},
            'typewriter': {'color': (47, 79, 79), 'size': (100, 70)}
        }
        
        if item in item_configs:
            config = item_configs[item]
            x = random.randint(0, max(1, w - config['size'][0]))
            y = random.randint(0, max(1, h - config['size'][1]))
            
            cv2.rectangle(image, (x, y), 
                         (x + config['size'][0], y + config['size'][1]), 
                         config['color'], -1)
            
            cv2.rectangle(image, (x, y), 
                         (x + config['size'][0], y + config['size'][1]), 
                         (0, 0, 0), 2)
        
        return image
    
    def add_authentic_elements(self, image):
        h, w = image.shape[:2]
        
        num_elements = random.randint(1, 3)
        
        for _ in range(num_elements):
            element_type = random.choice(['circle', 'rectangle', 'line'])
            color = tuple(random.randint(0, 255) for _ in range(3))
            
            if element_type == 'circle':
                center = (random.randint(50, w-50), random.randint(50, h-50))
                radius = random.randint(20, 80)
                cv2.circle(image, center, radius, color, -1)
            
            elif element_type == 'rectangle':
                x1, y1 = random.randint(0, w//2), random.randint(0, h//2)
                x2, y2 = random.randint(x1, w), random.randint(y1, h)
                cv2.rectangle(image, (x1, y1), (x2, y2), color, -1)
            
            elif element_type == 'line':
                pt1 = (random.randint(0, w), random.randint(0, h))
                pt2 = (random.randint(0, w), random.randint(0, h))
                cv2.line(image, pt1, pt2, color, random.randint(2, 8))
        
        return image
    
    def apply_aesthetic_filter(self, image):
        filter_type = random.choice(self.aesthetic_filters)
        
        pil_image = Image.fromarray(image)
        
        if filter_type == 'vintage':
            enhancer = ImageEnhance.Color(pil_image)
            pil_image = enhancer.enhance(0.7)
            enhancer = ImageEnhance.Contrast(pil_image)
            pil_image = enhancer.enhance(1.2)
        
        elif filter_type == 'sepia':
            pixels = np.array(pil_image)
            sepia_filter = np.array([[0.393, 0.769, 0.189],
                                   [0.349, 0.686, 0.168],
                                   [0.272, 0.534, 0.131]])
            sepia_img = pixels.dot(sepia_filter.T)
            sepia_img = np.clip(sepia_img, 0, 255)
            pil_image = Image.fromarray(sepia_img.astype(np.uint8))
        
        elif filter_type == 'film_grain':
            noise = np.random.normal(0, 25, image.shape).astype(np.uint8)
            noisy_image = cv2.add(image, noise)
            pil_image = Image.fromarray(noisy_image)
        
        elif filter_type == 'vignette':
            h, w = image.shape[:2]
            kernel_x = cv2.getGaussianKernel(w, w/4)
            kernel_y = cv2.getGaussianKernel(h, h/4)
            kernel = kernel_y * kernel_x.T
            mask = kernel / kernel.max()
            
            for i in range(3):
                image[:, :, i] = image[:, :, i] * mask
            
            pil_image = Image.fromarray(image)
        
        elif filter_type == 'desaturated':
            enhancer = ImageEnhance.Color(pil_image)
            pil_image = enhancer.enhance(0.3)
        
        elif filter_type == 'high_contrast':
            enhancer = ImageEnhance.Contrast(pil_image)
            pil_image = enhancer.enhance(1.8)
        
        elif filter_type == 'soft_focus':
            pil_image = pil_image.filter(ImageFilter.GaussianBlur(radius=1.5))
        
        return np.array(pil_image)
    
    def generate_metadata(self, image, label, items_present=None):
        h, w = image.shape[:2]
        
        gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
        
        metadata = {
            'label': label,
            'width': w,
            'height': h,
            'brightness': float(np.mean(gray)),
            'contrast': float(np.std(gray)),
            'color_variance': float(np.var(image)),
            'items_present': items_present or [],
            'performative_score': self.calculate_performative_score(items_present or [])
        }
        
        sift = cv2.SIFT_create()
        keypoints, _ = sift.detectAndCompute(gray, None)
        metadata['sift_keypoints'] = len(keypoints) if keypoints else 0
        
        edges = cv2.Canny(gray, 50, 150)
        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        metadata['contour_count'] = len(contours)
        metadata['edge_density'] = float(np.sum(edges > 0) / edges.size)
        
        return metadata
    
    def calculate_performative_score(self, items):
        score = 0
        item_scores = {
            'vintage_camera': 15, 'tote_bag': 12, 'record_player': 18,
            'typewriter': 20, 'coffee_cup': 8, 'books': 10,
            'glasses': 11, 'beard': 8, 'flannel': 9, 'bicycle': 13
        }
        
        for item in items:
            score += item_scores.get(item, 5)
        
        return min(score, 100)
    
    def generate_single_image(self, args):
        idx, split, label = args
        
        performative = (label == 'performative')
        image = self.generate_synthetic_image(performative=performative)
        
        items_present = []
        if performative:
            num_items = random.randint(1, 4)
            items_present = random.sample(list(self.performative_items.keys()), num_items)
        
        filename = f"{label}_{idx:06d}.jpg"
        filepath = self.output_dir / split / label / filename
        
        cv2.imwrite(str(filepath), cv2.cvtColor(image, cv2.COLOR_RGB2BGR))
        
        metadata = self.generate_metadata(image, label, items_present)
        metadata['filename'] = filename
        metadata['filepath'] = str(filepath)
        
        return metadata
    
    def generate_dataset(self, train_split=0.7, val_split=0.2, test_split=0.1):
        assert abs(train_split + val_split + test_split - 1.0) < 1e-6
        
        train_samples = int(self.num_samples * train_split)
        val_samples = int(self.num_samples * val_split)
        test_samples = self.num_samples - train_samples - val_samples
        
        all_tasks = []
        
        splits_config = [
            ('train', train_samples),
            ('val', val_samples),
            ('test', test_samples)
        ]
        
        for split, num_split_samples in splits_config:
            performative_samples = num_split_samples // 2
            authentic_samples = num_split_samples - performative_samples
            
            for i in range(performative_samples):
                all_tasks.append((i, split, 'performative'))
            
            for i in range(authentic_samples):
                all_tasks.append((i, split, 'authentic'))
        
        print(f"Generating {len(all_tasks)} images...")
        
        with mp.Pool(processes=mp.cpu_count()) as pool:
            metadata_list = list(tqdm(
                pool.imap(self.generate_single_image, all_tasks),
                total=len(all_tasks),
                desc="Generating images"
            ))
        
        metadata_df = pd.DataFrame(metadata_list)
        metadata_df.to_csv(self.output_dir / 'dataset_metadata.csv', index=False)
        
        dataset_info = {
            'total_samples': self.num_samples,
            'train_samples': train_samples,
            'val_samples': val_samples,
            'test_samples': test_samples,
            'performative_items': self.performative_items,
            'aesthetic_filters': self.aesthetic_filters,
            'generation_timestamp': pd.Timestamp.now().isoformat()
        }
        
        with open(self.output_dir / 'dataset_info.json', 'w') as f:
            json.dump(dataset_info, f, indent=2)
        
        print(f"Dataset generated successfully!")
        print(f"Total images: {len(metadata_list)}")
        print(f"Metadata saved to: {self.output_dir / 'dataset_metadata.csv'}")
        
        return metadata_df

def augment_existing_dataset(input_dir, output_dir, augmentation_factor=3):
    input_path = Path(input_dir)
    output_path = Path(output_dir)
    
    output_path.mkdir(parents=True, exist_ok=True)
    
    augmentation_transforms = [
        {'rotation': 15}, {'rotation': -15},
        {'brightness': 1.3}, {'brightness': 0.7},
        {'contrast': 1.4}, {'contrast': 0.6},
        {'saturation': 1.5}, {'saturation': 0.5},
        {'blur': 2}, {'sharpen': True}
    ]
    
    for split in ['train', 'val', 'test']:
        for label in ['performative', 'authentic']:
            input_split_dir = input_path / split / label
            output_split_dir = output_path / split / label
            output_split_dir.mkdir(parents=True, exist_ok=True)
            
            if input_split_dir.exists():
                image_files = list(input_split_dir.glob('*.jpg')) + list(input_split_dir.glob('*.png'))
                
                for img_file in tqdm(image_files, desc=f"Augmenting {split}/{label}"):
                    image = cv2.imread(str(img_file))
                    
                    cv2.imwrite(str(output_split_dir / img_file.name), image)
                    
                    for i in range(augmentation_factor):
                        transform = random.choice(augmentation_transforms)
                        augmented = apply_augmentation(image, transform)
                        
                        aug_filename = f"aug_{i}_{img_file.stem}.jpg"
                        cv2.imwrite(str(output_split_dir / aug_filename), augmented)

def apply_augmentation(image, transform):
    if 'rotation' in transform:
        angle = transform['rotation']
        h, w = image.shape[:2]
        center = (w // 2, h // 2)
        matrix = cv2.getRotationMatrix2D(center, angle, 1.0)
        image = cv2.warpAffine(image, matrix, (w, h))
    
    if 'brightness' in transform:
        factor = transform['brightness']
        image = cv2.convertScaleAbs(image, alpha=factor, beta=0)
    
    if 'contrast' in transform:
        factor = transform['contrast']
        image = cv2.convertScaleAbs(image, alpha=factor, beta=0)
    
    if 'blur' in transform:
        kernel_size = transform['blur']
        image = cv2.GaussianBlur(image, (kernel_size*2+1, kernel_size*2+1), 0)
    
    if transform.get('sharpen'):
        kernel = np.array([[-1,-1,-1], [-1,9,-1], [-1,-1,-1]])
        image = cv2.filter2D(image, -1, kernel)
    
    return image

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Generate performative image dataset')
    parser.add_argument('--output_dir', type=str, required=True, help='Output directory for dataset')
    parser.add_argument('--num_samples', type=int, default=10000, help='Number of samples to generate')
    parser.add_argument('--augment', action='store_true', help='Apply data augmentation')
    
    args = parser.parse_args()
    
    generator = PerformativeImageGenerator(args.output_dir, args.num_samples)
    metadata = generator.generate_dataset()
    
    if args.augment:
        print("Applying data augmentation...")
        augment_existing_dataset(args.output_dir, args.output_dir + "_augmented")
        print("Augmentation complete!")