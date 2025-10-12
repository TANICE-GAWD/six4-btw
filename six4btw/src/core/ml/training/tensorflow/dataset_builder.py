import tensorflow as tf
import os
import json
import numpy as np
from pathlib import Path

class PerformativeDatasetBuilder:
    def __init__(self, data_dir, batch_size=32, img_size=(224, 224)):
        self.data_dir = Path(data_dir)
        self.batch_size = batch_size
        self.img_size = img_size
        self.class_names = ['authentic', 'performative']
        
    def _parse_image(self, filename, label):
        image_string = tf.io.read_file(filename)
        image = tf.image.decode_image(image_string, channels=3)
        image = tf.image.resize(image, self.img_size)
        image = tf.cast(image, tf.float32) / 255.0
        return image, label
    
    def _augment_image(self, image, label):
        image = tf.image.random_flip_left_right(image)
        image = tf.image.random_brightness(image, 0.2)
        image = tf.image.random_contrast(image, 0.8, 1.2)
        image = tf.image.random_saturation(image, 0.8, 1.2)
        image = tf.image.random_hue(image, 0.1)
        
        angle = tf.random.uniform([], -0.2, 0.2)
        image = tf.contrib.image.rotate(image, angle)
        
        return image, label
    
    def create_dataset(self, split='train'):
        split_dir = self.data_dir / split
        
        image_paths = []
        labels = []
        
        for class_idx, class_name in enumerate(self.class_names):
            class_dir = split_dir / class_name
            if class_dir.exists():
                for img_path in class_dir.glob('*.jpg'):
                    image_paths.append(str(img_path))
                    labels.append(class_idx)
                for img_path in class_dir.glob('*.png'):
                    image_paths.append(str(img_path))
                    labels.append(class_idx)
        
        dataset = tf.data.Dataset.from_tensor_slices((image_paths, labels))
        dataset = dataset.map(self._parse_image, num_parallel_calls=tf.data.AUTOTUNE)
        
        if split == 'train':
            dataset = dataset.map(self._augment_image, num_parallel_calls=tf.data.AUTOTUNE)
            dataset = dataset.shuffle(buffer_size=1000)
        
        dataset = dataset.batch(self.batch_size)
        dataset = dataset.prefetch(tf.data.AUTOTUNE)
        
        return dataset
    
    def get_class_weights(self):
        train_dir = self.data_dir / 'train'
        class_counts = {}
        
        for class_name in self.class_names:
            class_dir = train_dir / class_name
            if class_dir.exists():
                count = len(list(class_dir.glob('*.jpg'))) + len(list(class_dir.glob('*.png')))
                class_counts[class_name] = count
        
        total_samples = sum(class_counts.values())
        class_weights = {}
        
        for idx, class_name in enumerate(self.class_names):
            if class_counts[class_name] > 0:
                class_weights[idx] = total_samples / (len(self.class_names) * class_counts[class_name])
            else:
                class_weights[idx] = 1.0
        
        return class_weights

def create_performative_labels():
    performative_items = {
        'vintage_camera': 15,
        'tote_bag': 12,
        'record_player': 18,
        'typewriter': 20,
        'film_camera': 16,
        'coffee_shop': 8,
        'bookstore': 10,
        'thrift_store': 7,
        'indie_band_shirt': 14,
        'flannel_shirt': 9,
        'beanie': 6,
        'glasses_thick_rim': 11,
        'mustache_handlebar': 17,
        'beard_groomed': 8,
        'bicycle_fixed_gear': 13,
        'notebook_moleskine': 9,
        'coffee_artisan': 7,
        'vinyl_records': 15,
        'polaroid_photos': 12,
        'art_gallery': 10
    }
    
    return performative_items

def generate_training_metadata():
    metadata = {
        'dataset_version': '1.0',
        'total_classes': 2,
        'class_names': ['authentic', 'performative'],
        'image_size': [224, 224, 3],
        'performative_threshold': 0.6,
        'training_params': {
            'batch_size': 32,
            'learning_rate': 0.001,
            'epochs': 100,
            'validation_split': 0.2,
            'augmentation': True
        },
        'performative_items': create_performative_labels()
    }
    
    return metadata

def save_dataset_info(output_path, metadata):
    with open(output_path, 'w') as f:
        json.dump(metadata, f, indent=2)

class PerformativeScorer:
    def __init__(self, items_dict):
        self.items = items_dict
        self.max_score = 100
        
    def calculate_score(self, detected_items):
        total_score = 0
        detected_count = 0
        
        for item, confidence in detected_items.items():
            if item in self.items and confidence > 0.5:
                item_score = self.items[item] * confidence
                total_score += item_score
                detected_count += 1
        
        if detected_count == 0:
            return 0
        
        normalized_score = min(total_score, self.max_score)
        return int(normalized_score)
    
    def get_performative_level(self, score):
        if score >= 80:
            return "peak_performative"
        elif score >= 60:
            return "highly_performative"
        elif score >= 40:
            return "moderately_performative"
        elif score >= 20:
            return "mildly_performative"
        else:
            return "authentic"