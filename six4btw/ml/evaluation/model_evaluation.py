import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, roc_curve, precision_recall_curve,
    confusion_matrix, classification_report
)
from sklearn.model_selection import cross_val_score, StratifiedKFold
import torch
import torch.nn.functional as F
from torch.utils.data import DataLoader
import cv2
from PIL import Image
import os
import json
from datetime import datetime
from pathlib import Path
import argparse
from tqdm import tqdm

class PerformativeModelEvaluator:
    def __init__(self, model_path, test_data_path, device=None):
        self.model_path = model_path
        self.test_data_path = Path(test_data_path)
        self.device = device or torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model = None
        self.test_loader = None
        self.class_names = ['Authentic', 'Performative']
        
        self.load_model()
        self.setup_test_data()
    
    def load_model(self):
        try:
            from performative_net import PerformativeNet
            self.model = PerformativeNet(num_classes=2)
            
            checkpoint = torch.load(self.model_path, map_location=self.device)
            self.model.load_state_dict(checkpoint['model_state_dict'])
            self.model.to(self.device)
            self.model.eval()
            
            print(f"Model loaded successfully from {self.model_path}")
            
        except Exception as e:
            print(f"Error loading model: {e}")
            raise
    
    def setup_test_data(self):
        from image_dataset_generator import PerformativeImageDataset
        import torchvision.transforms as transforms
        
        test_transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])
        
        test_dataset = PerformativeImageDataset(
            self.test_data_path.parent, 'test', transform=test_transform
        )
        
        self.test_loader = DataLoader(
            test_dataset, batch_size=32, shuffle=False, num_workers=4
        )
        
        print(f"Test dataset loaded: {len(test_dataset)} samples")
    
    def predict_batch(self, data_loader):
        all_predictions = []
        all_probabilities = []
        all_targets = []
        
        with torch.no_grad():
            for data, target in tqdm(data_loader, desc="Making predictions"):
                data, target = data.to(self.device), target.to(self.device)
                
                outputs = self.model(data)
                probabilities = F.softmax(outputs, dim=1)
                predictions = torch.argmax(probabilities, dim=1)
                
                all_predictions.extend(predictions.cpu().numpy())
                all_probabilities.extend(probabilities.cpu().numpy())
                all_targets.extend(target.cpu().numpy())
        
        return np.array(all_predictions), np.array(all_probabilities), np.array(all_targets)
    
    def calculate_metrics(self, y_true, y_pred, y_prob):
        metrics = {
            'accuracy': accuracy_score(y_true, y_pred),
            'precision': precision_score(y_true, y_pred, average='weighted'),
            'recall': recall_score(y_true, y_pred, average='weighted'),
            'f1_score': f1_score(y_true, y_pred, average='weighted'),
            'roc_auc': roc_auc_score(y_true, y_prob[:, 1]) if y_prob.shape[1] > 1 else None
        }
        
        per_class_metrics = {}
        for i, class_name in enumerate(self.class_names):
            y_true_binary = (y_true == i).astype(int)
            y_pred_binary = (y_pred == i).astype(int)
            
            per_class_metrics[class_name] = {
                'precision': precision_score(y_true_binary, y_pred_binary, zero_division=0),
                'recall': recall_score(y_true_binary, y_pred_binary, zero_division=0),
                'f1_score': f1_score(y_true_binary, y_pred_binary, zero_division=0)
            }
        
        return metrics, per_class_metrics
    
    def plot_confusion_matrix(self, y_true, y_pred, save_path='confusion_matrix.png'):
        cm = confusion_matrix(y_true, y_pred)
        
        plt.figure(figsize=(10, 8))
        sns.heatmap(cm, annot=True, fmt='d', cmap='Blues',
                   xticklabels=self.class_names, yticklabels=self.class_names,
                   cbar_kws={'label': 'Count'})
        
        plt.title('Confusion Matrix - Performative Classification', fontsize=16, pad=20)
        plt.xlabel('Predicted Label', fontsize=12)
        plt.ylabel('True Label', fontsize=12)
        
        accuracy = accuracy_score(y_true, y_pred)
        plt.figtext(0.5, 0.02, f'Overall Accuracy: {accuracy:.3f}', 
                   ha='center', fontsize=12, weight='bold')
        
        plt.tight_layout()
        plt.savefig(save_path, dpi=300, bbox_inches='tight')
        plt.close()
        
        print(f"Confusion matrix saved to {save_path}")
    
    def plot_roc_curve(self, y_true, y_prob, save_path='roc_curve.png'):
        if y_prob.shape[1] < 2:
            print("Cannot plot ROC curve for single class")
            return
        
        fpr, tpr, _ = roc_curve(y_true, y_prob[:, 1])
        auc_score = roc_auc_score(y_true, y_prob[:, 1])
        
        plt.figure(figsize=(10, 8))
        plt.plot(fpr, tpr, color='darkorange', lw=2, 
                label=f'ROC Curve (AUC = {auc_score:.3f})')
        plt.plot([0, 1], [0, 1], color='navy', lw=2, linestyle='--', 
                label='Random Classifier')
        
        plt.xlim([0.0, 1.0])
        plt.ylim([0.0, 1.05])
        plt.xlabel('False Positive Rate', fontsize=12)
        plt.ylabel('True Positive Rate', fontsize=12)
        plt.title('ROC Curve - Performative vs Authentic Classification', fontsize=14)
        plt.legend(loc="lower right", fontsize=12)
        plt.grid(True, alpha=0.3)
        
        plt.tight_layout()
        plt.savefig(save_path, dpi=300, bbox_inches='tight')
        plt.close()
        
        print(f"ROC curve saved to {save_path}")
    
    def plot_precision_recall_curve(self, y_true, y_prob, save_path='precision_recall_curve.png'):
        if y_prob.shape[1] < 2:
            print("Cannot plot PR curve for single class")
            return
        
        precision, recall, _ = precision_recall_curve(y_true, y_prob[:, 1])
        
        plt.figure(figsize=(10, 8))
        plt.plot(recall, precision, color='blue', lw=2, 
                label='Precision-Recall Curve')
        
        plt.xlim([0.0, 1.0])
        plt.ylim([0.0, 1.05])
        plt.xlabel('Recall', fontsize=12)
        plt.ylabel('Precision', fontsize=12)
        plt.title('Precision-Recall Curve - Performative Classification', fontsize=14)
        plt.legend(loc="lower left", fontsize=12)
        plt.grid(True, alpha=0.3)
        
        plt.tight_layout()
        plt.savefig(save_path, dpi=300, bbox_inches='tight')
        plt.close()
        
        print(f"Precision-Recall curve saved to {save_path}")
    
    def plot_score_distribution(self, y_true, y_prob, save_path='score_distribution.png'):
        if y_prob.shape[1] < 2:
            print("Cannot plot score distribution for single class")
            return
        
        performative_scores = y_prob[:, 1]
        
        authentic_scores = performative_scores[y_true == 0]
        performative_true_scores = performative_scores[y_true == 1]
        
        plt.figure(figsize=(12, 8))
        
        plt.hist(authentic_scores, bins=30, alpha=0.7, label='Authentic (True)', 
                color='green', density=True)
        plt.hist(performative_true_scores, bins=30, alpha=0.7, label='Performative (True)', 
                color='red', density=True)
        
        plt.xlabel('Performative Score', fontsize=12)
        plt.ylabel('Density', fontsize=12)
        plt.title('Distribution of Performative Scores by True Class', fontsize=14)
        plt.legend(fontsize=12)
        plt.grid(True, alpha=0.3)
        
        plt.axvline(x=0.5, color='black', linestyle='--', alpha=0.8, 
                   label='Decision Threshold (0.5)')
        
        plt.tight_layout()
        plt.savefig(save_path, dpi=300, bbox_inches='tight')
        plt.close()
        
        print(f"Score distribution plot saved to {save_path}")
    
    def analyze_misclassifications(self, y_true, y_pred, y_prob, save_path='misclassification_analysis.json'):
        misclassified_indices = np.where(y_true != y_pred)[0]
        
        analysis = {
            'total_misclassifications': len(misclassified_indices),
            'misclassification_rate': len(misclassified_indices) / len(y_true),
            'false_positives': np.sum((y_true == 0) & (y_pred == 1)),
            'false_negatives': np.sum((y_true == 1) & (y_pred == 0)),
            'high_confidence_errors': [],
            'low_confidence_correct': []
        }
        
        for idx in misclassified_indices:
            confidence = np.max(y_prob[idx])
            if confidence > 0.8:
                analysis['high_confidence_errors'].append({
                    'index': int(idx),
                    'true_label': int(y_true[idx]),
                    'predicted_label': int(y_pred[idx]),
                    'confidence': float(confidence),
                    'performative_score': float(y_prob[idx, 1])
                })
        
        correct_indices = np.where(y_true == y_pred)[0]
        for idx in correct_indices:
            confidence = np.max(y_prob[idx])
            if confidence < 0.6:
                analysis['low_confidence_correct'].append({
                    'index': int(idx),
                    'true_label': int(y_true[idx]),
                    'predicted_label': int(y_pred[idx]),
                    'confidence': float(confidence),
                    'performative_score': float(y_prob[idx, 1])
                })
        
        with open(save_path, 'w') as f:
            json.dump(analysis, f, indent=2)
        
        print(f"Misclassification analysis saved to {save_path}")
        return analysis
    
    def evaluate_performative_score_accuracy(self, y_true, y_prob):
        performative_scores = (y_prob[:, 1] * 100).astype(int)
        
        score_ranges = [
            (0, 20, "Authentic"),
            (20, 40, "Mildly Performative"),
            (40, 60, "Moderately Performative"),
            (60, 80, "Highly Performative"),
            (80, 100, "Peak Performative")
        ]
        
        range_accuracy = {}
        
        for min_score, max_score, label in score_ranges:
            mask = (performative_scores >= min_score) & (performative_scores < max_score)
            if np.sum(mask) > 0:
                range_true = y_true[mask]
                range_pred = (performative_scores[mask] >= 50).astype(int)
                accuracy = accuracy_score(range_true, range_pred)
                range_accuracy[label] = {
                    'accuracy': accuracy,
                    'sample_count': np.sum(mask),
                    'score_range': f"{min_score}-{max_score}"
                }
        
        return range_accuracy
    
    def generate_comprehensive_report(self):
        print("Starting comprehensive model evaluation...")
        
        predictions, probabilities, targets = self.predict_batch(self.test_loader)
        
        metrics, per_class_metrics = self.calculate_metrics(targets, predictions, probabilities)
        
        print("\n" + "="*50)
        print("COMPREHENSIVE EVALUATION REPORT")
        print("="*50)
        
        print(f"\nOverall Metrics:")
        print(f"Accuracy: {metrics['accuracy']:.4f}")
        print(f"Precision: {metrics['precision']:.4f}")
        print(f"Recall: {metrics['recall']:.4f}")
        print(f"F1-Score: {metrics['f1_score']:.4f}")
        if metrics['roc_auc']:
            print(f"ROC-AUC: {metrics['roc_auc']:.4f}")
        
        print(f"\nPer-Class Metrics:")
        for class_name, class_metrics in per_class_metrics.items():
            print(f"\n{class_name}:")
            print(f"  Precision: {class_metrics['precision']:.4f}")
            print(f"  Recall: {class_metrics['recall']:.4f}")
            print(f"  F1-Score: {class_metrics['f1_score']:.4f}")
        
        print(f"\nDetailed Classification Report:")
        print(classification_report(targets, predictions, target_names=self.class_names))
        
        self.plot_confusion_matrix(targets, predictions)
        self.plot_roc_curve(targets, probabilities)
        self.plot_precision_recall_curve(targets, probabilities)
        self.plot_score_distribution(targets, probabilities)
        
        misclass_analysis = self.analyze_misclassifications(targets, predictions, probabilities)
        
        score_accuracy = self.evaluate_performative_score_accuracy(targets, probabilities)
        print(f"\nPerformative Score Range Accuracy:")
        for range_name, range_data in score_accuracy.items():
            print(f"{range_name}: {range_data['accuracy']:.4f} ({range_data['sample_count']} samples)")
        
        evaluation_summary = {
            'timestamp': datetime.now().isoformat(),
            'model_path': str(self.model_path),
            'test_samples': len(targets),
            'overall_metrics': metrics,
            'per_class_metrics': per_class_metrics,
            'score_range_accuracy': score_accuracy,
            'misclassification_summary': {
                'total_errors': misclass_analysis['total_misclassifications'],
                'error_rate': misclass_analysis['misclassification_rate'],
                'false_positives': misclass_analysis['false_positives'],
                'false_negatives': misclass_analysis['false_negatives']
            }
        }
        
        with open('evaluation_summary.json', 'w') as f:
            json.dump(evaluation_summary, f, indent=2)
        
        print(f"\nEvaluation complete! Summary saved to evaluation_summary.json")
        print(f"Total test samples: {len(targets)}")
        print(f"Misclassification rate: {misclass_analysis['misclassification_rate']:.4f}")
        
        return evaluation_summary

def main():
    parser = argparse.ArgumentParser(description='Evaluate Performative Classification Model')
    parser.add_argument('--model_path', type=str, required=True, 
                       help='Path to trained model checkpoint')
    parser.add_argument('--test_data_path', type=str, required=True,
                       help='Path to test dataset directory')
    parser.add_argument('--output_dir', type=str, default='evaluation_results',
                       help='Directory to save evaluation results')
    
    args = parser.parse_args()
    
    os.makedirs(args.output_dir, exist_ok=True)
    os.chdir(args.output_dir)
    
    evaluator = PerformativeModelEvaluator(args.model_path, args.test_data_path)
    
    evaluation_results = evaluator.generate_comprehensive_report()
    
    print(f"\nAll evaluation results saved to: {os.getcwd()}")

if __name__ == "__main__":
    main()