import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.svm import SVC
from sklearn.neural_network import MLPClassifier
from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score
import joblib
import pickle
from datetime import datetime
import os

class PerformativeClassifier:
    def __init__(self, model_type='random_forest'):
        self.model_type = model_type
        self.model = None
        self.scaler = StandardScaler()
        self.label_encoder = LabelEncoder()
        self.feature_names = []
        self.is_trained = False
        
        self.model_configs = {
            'random_forest': {
                'model': RandomForestClassifier,
                'params': {
                    'n_estimators': 200,
                    'max_depth': 15,
                    'min_samples_split': 5,
                    'min_samples_leaf': 2,
                    'random_state': 42
                }
            },
            'gradient_boost': {
                'model': GradientBoostingClassifier,
                'params': {
                    'n_estimators': 150,
                    'learning_rate': 0.1,
                    'max_depth': 8,
                    'random_state': 42
                }
            },
            'svm': {
                'model': SVC,
                'params': {
                    'kernel': 'rbf',
                    'C': 1.0,
                    'gamma': 'scale',
                    'probability': True,
                    'random_state': 42
                }
            },
            'neural_network': {
                'model': MLPClassifier,
                'params': {
                    'hidden_layer_sizes': (128, 64, 32),
                    'activation': 'relu',
                    'solver': 'adam',
                    'alpha': 0.001,
                    'learning_rate': 'adaptive',
                    'max_iter': 500,
                    'random_state': 42
                }
            }
        }
        
        self._initialize_model()
    
    def _initialize_model(self):
        config = self.model_configs[self.model_type]
        self.model = config['model'](**config['params'])
    
    def prepare_features(self, data):
        feature_columns = [
            'image_brightness', 'image_contrast', 'color_variance',
            'sift_keypoints', 'orb_keypoints', 'corner_count',
            'contour_count', 'edge_density', 'symmetry_score',
            'rule_of_thirds_score', 'face_count', 'eye_count',
            'dominant_color_count', 'texture_complexity',
            'aspect_ratio_mean', 'solidity_mean', 'extent_mean'
        ]
        
        performative_item_features = [
            'vintage_camera_detected', 'tote_bag_detected', 'record_player_detected',
            'typewriter_detected', 'coffee_detected', 'books_detected',
            'glasses_detected', 'beard_detected', 'flannel_detected',
            'bicycle_detected', 'art_detected', 'indie_music_detected'
        ]
        
        aesthetic_features = [
            'sepia_tone_score', 'vintage_filter_score', 'blur_aesthetic_score',
            'grain_texture_score', 'vignette_score', 'film_look_score'
        ]
        
        all_features = feature_columns + performative_item_features + aesthetic_features
        self.feature_names = all_features
        
        return data[all_features] if isinstance(data, pd.DataFrame) else np.array(data)
    
    def train(self, X, y, validation_split=0.2):
        X_features = self.prepare_features(X)
        
        y_encoded = self.label_encoder.fit_transform(y)
        
        X_scaled = self.scaler.fit_transform(X_features)
        
        X_train, X_val, y_train, y_val = train_test_split(
            X_scaled, y_encoded, test_size=validation_split, 
            random_state=42, stratify=y_encoded
        )
        
        self.model.fit(X_train, y_train)
        self.is_trained = True
        
        train_score = self.model.score(X_train, y_train)
        val_score = self.model.score(X_val, y_val)
        
        y_pred = self.model.predict(X_val)
        y_pred_proba = self.model.predict_proba(X_val)
        
        metrics = {
            'train_accuracy': train_score,
            'validation_accuracy': val_score,
            'classification_report': classification_report(y_val, y_pred),
            'confusion_matrix': confusion_matrix(y_val, y_pred).tolist(),
            'roc_auc': roc_auc_score(y_val, y_pred_proba[:, 1]) if len(np.unique(y_encoded)) == 2 else None
        }
        
        return metrics
    
    def predict(self, X):
        if not self.is_trained:
            raise ValueError("Model must be trained before making predictions")
        
        X_features = self.prepare_features(X)
        X_scaled = self.scaler.transform(X_features)
        
        predictions = self.model.predict(X_scaled)
        probabilities = self.model.predict_proba(X_scaled)
        
        decoded_predictions = self.label_encoder.inverse_transform(predictions)
        
        return {
            'predictions': decoded_predictions,
            'probabilities': probabilities,
            'confidence': np.max(probabilities, axis=1)
        }
    
    def predict_performative_score(self, X):
        result = self.predict(X)
        
        performative_proba = result['probabilities'][:, 1] if result['probabilities'].shape[1] > 1 else result['probabilities'][:, 0]
        scores = (performative_proba * 100).astype(int)
        
        return scores
    
    def get_feature_importance(self):
        if not self.is_trained:
            raise ValueError("Model must be trained to get feature importance")
        
        if hasattr(self.model, 'feature_importances_'):
            importance_scores = self.model.feature_importances_
        elif hasattr(self.model, 'coef_'):
            importance_scores = np.abs(self.model.coef_[0])
        else:
            return None
        
        feature_importance = dict(zip(self.feature_names, importance_scores))
        sorted_features = sorted(feature_importance.items(), key=lambda x: x[1], reverse=True)
        
        return sorted_features
    
    def cross_validate(self, X, y, cv=5):
        X_features = self.prepare_features(X)
        y_encoded = self.label_encoder.fit_transform(y)
        X_scaled = self.scaler.fit_transform(X_features)
        
        scores = cross_val_score(self.model, X_scaled, y_encoded, cv=cv, scoring='accuracy')
        
        return {
            'mean_accuracy': np.mean(scores),
            'std_accuracy': np.std(scores),
            'individual_scores': scores.tolist()
        }
    
    def hyperparameter_tuning(self, X, y):
        X_features = self.prepare_features(X)
        y_encoded = self.label_encoder.fit_transform(y)
        X_scaled = self.scaler.fit_transform(X_features)
        
        param_grids = {
            'random_forest': {
                'n_estimators': [100, 200, 300],
                'max_depth': [10, 15, 20, None],
                'min_samples_split': [2, 5, 10],
                'min_samples_leaf': [1, 2, 4]
            },
            'gradient_boost': {
                'n_estimators': [100, 150, 200],
                'learning_rate': [0.05, 0.1, 0.15],
                'max_depth': [6, 8, 10]
            },
            'svm': {
                'C': [0.1, 1, 10, 100],
                'gamma': ['scale', 'auto', 0.001, 0.01],
                'kernel': ['rbf', 'poly', 'sigmoid']
            },
            'neural_network': {
                'hidden_layer_sizes': [(64, 32), (128, 64), (128, 64, 32)],
                'alpha': [0.0001, 0.001, 0.01],
                'learning_rate': ['constant', 'adaptive']
            }
        }
        
        param_grid = param_grids.get(self.model_type, {})
        
        if param_grid:
            grid_search = GridSearchCV(
                self.model, param_grid, cv=5, 
                scoring='accuracy', n_jobs=-1, verbose=1
            )
            
            grid_search.fit(X_scaled, y_encoded)
            
            self.model = grid_search.best_estimator_
            self.is_trained = True
            
            return {
                'best_params': grid_search.best_params_,
                'best_score': grid_search.best_score_,
                'cv_results': grid_search.cv_results_
            }
        
        return None
    
    def save_model(self, filepath):
        if not self.is_trained:
            raise ValueError("Cannot save untrained model")
        
        model_data = {
            'model': self.model,
            'scaler': self.scaler,
            'label_encoder': self.label_encoder,
            'feature_names': self.feature_names,
            'model_type': self.model_type,
            'timestamp': datetime.now().isoformat()
        }
        
        with open(filepath, 'wb') as f:
            pickle.dump(model_data, f)
    
    def load_model(self, filepath):
        with open(filepath, 'rb') as f:
            model_data = pickle.load(f)
        
        self.model = model_data['model']
        self.scaler = model_data['scaler']
        self.label_encoder = model_data['label_encoder']
        self.feature_names = model_data['feature_names']
        self.model_type = model_data['model_type']
        self.is_trained = True

class EnsemblePerformativeClassifier:
    def __init__(self):
        self.models = {
            'rf': PerformativeClassifier('random_forest'),
            'gb': PerformativeClassifier('gradient_boost'),
            'svm': PerformativeClassifier('svm'),
            'nn': PerformativeClassifier('neural_network')
        }
        self.weights = {'rf': 0.3, 'gb': 0.3, 'svm': 0.2, 'nn': 0.2}
        self.is_trained = False
    
    def train(self, X, y):
        results = {}
        
        for name, model in self.models.items():
            print(f"Training {name} model...")
            metrics = model.train(X, y)
            results[name] = metrics
        
        self.is_trained = True
        return results
    
    def predict_ensemble(self, X):
        if not self.is_trained:
            raise ValueError("Ensemble must be trained before making predictions")
        
        predictions = {}
        probabilities = {}
        
        for name, model in self.models.items():
            result = model.predict(X)
            predictions[name] = result['predictions']
            probabilities[name] = result['probabilities']
        
        ensemble_proba = np.zeros_like(probabilities['rf'])
        
        for name, weight in self.weights.items():
            ensemble_proba += weight * probabilities[name]
        
        ensemble_predictions = np.argmax(ensemble_proba, axis=1)
        ensemble_confidence = np.max(ensemble_proba, axis=1)
        
        return {
            'ensemble_predictions': ensemble_predictions,
            'ensemble_probabilities': ensemble_proba,
            'ensemble_confidence': ensemble_confidence,
            'individual_predictions': predictions,
            'individual_probabilities': probabilities
        }
    
    def predict_performative_score_ensemble(self, X):
        result = self.predict_ensemble(X)
        performative_proba = result['ensemble_probabilities'][:, 1]
        scores = (performative_proba * 100).astype(int)
        return scores