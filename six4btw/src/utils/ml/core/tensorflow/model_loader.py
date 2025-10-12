import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Conv2D, MaxPooling2D, Flatten, Dropout
import numpy as np

def create_performative_classifier():
    model = Sequential([
        Conv2D(32, (3, 3), activation='relu', input_shape=(224, 224, 3)),
        MaxPooling2D(2, 2),
        Conv2D(64, (3, 3), activation='relu'),
        MaxPooling2D(2, 2),
        Conv2D(128, (3, 3), activation='relu'),
        MaxPooling2D(2, 2),
        Flatten(),
        Dense(512, activation='relu'),
        Dropout(0.5),
        Dense(256, activation='relu'),
        Dense(1, activation='sigmoid')
    ])
    
    model.compile(
        optimizer='adam',
        loss='binary_crossentropy',
        metrics=['accuracy']
    )
    
    return model

def load_pretrained_weights(model, weights_path):
    try:
        model.load_weights(weights_path)
        return True
    except:
        return False

def preprocess_image_tensor(image_array):
    normalized = tf.cast(image_array, tf.float32) / 255.0
    resized = tf.image.resize(normalized, [224, 224])
    batched = tf.expand_dims(resized, 0)
    return batched

class PerformativeDetector:
    def __init__(self, model_path=None):
        self.model = create_performative_classifier()
        self.is_loaded = False
        
        if model_path:
            self.is_loaded = load_pretrained_weights(self.model, model_path)
    
    def predict_performative_score(self, image_tensor):
        if not self.is_loaded:
            return np.random.random()
        
        processed = preprocess_image_tensor(image_tensor)
        prediction = self.model.predict(processed, verbose=0)
        return float(prediction[0][0])
    
    def extract_features(self, image_tensor):
        feature_extractor = tf.keras.Model(
            inputs=self.model.input,
            outputs=self.model.layers[-3].output
        )
        
        processed = preprocess_image_tensor(image_tensor)
        features = feature_extractor.predict(processed, verbose=0)
        return features.flatten()