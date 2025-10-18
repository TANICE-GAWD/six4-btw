# six4-btw

![License](https://img.shields.io/badge/license-ISC-green)

##  Description

A hybrid image classification pipeline using TensorFlow, PyTorch, Pillow, and OpenCV enables real-time detection of satirical traits, performative objects, and authenticity through multi-layered YOLO and custom scene classifiers.


## Features

𝐌𝐚𝐜𝐡𝐢𝐧𝐞 𝐋𝐞𝐚𝐫𝐧𝐢𝐧𝐠 𝐈𝐦𝐚𝐠𝐞 𝐂𝐥𝐚𝐬𝐬𝐢𝐟𝐢𝐜𝐚𝐭𝐢𝐨𝐧
1. Custom TensorFlow model for “authenticity” 
2. Detects satirical male traits 
3. PyTorch visual pattern analysis 
4. Identifies performative objects

𝐀𝐝𝐯𝐚𝐧𝐜𝐞𝐝 𝐈𝐦𝐚𝐠𝐞 𝐏𝐫𝐨𝐜𝐞𝐬𝐬𝐢𝐧𝐠 𝐏𝐢𝐩𝐞𝐥𝐢𝐧𝐞 

5. Pillow for image preprocessing 
6. OpenCV for feature extraction 
7. Real-time model input preparation 
8. Automatic image enhancement 

𝐌𝐚𝐜𝐡𝐢𝐧𝐞 𝐋𝐞𝐚𝐫𝐧𝐢𝐧𝐠 𝐈𝐧𝐬𝐢𝐠𝐡𝐭𝐬

9. Real-time label detection
10. YOLO object detection for real-time item recognition
11. Multi-layered detection: YOLO + custom scene classifiers


##  Tech Stack
-  React.js
-  Express.js
-  Python


##  Key Dependencies

```
express: ^4.18.2
multer: ^1.4.5-lts.1
cors: ^2.8.5
dotenv: ^16.3.1
helmet: ^7.1.0
express-rate-limit: ^7.1.5
tensorflow>=2.12.0
torch>=2.0.0
opencv-python>=4.7.0
pillow>=9.5.0
```

##  Run Commands

- **start**: `npm run start`
- **start:prod**: `npm run start:prod`
- **dev**: `npm run dev`
- **test**: `npm run test`
- **test:coverage**: `npm run test:coverage`
- **health-check**: `npm run health-check`
- **validate-config**: `npm run validate-config`
- **test:prod-config**: `npm run test:prod-config`
- **deploy:check**: `npm run deploy:check`
- **deploy**: `npm run deploy`


##  Project Structure

```
.
├── backend
│   ├── api
│   │   ├── debug.js
│   │   ├── hello.js
│   │   ├── index.js
│   │   ├── minimal.js
│   │   ├── serverless.js
│   │   └── test.js
│   ├── deploy.js
│   ├── package.json
│   ├── scripts
│   │   ├── convert-key-to-json.js
│   │   ├── health-check.js
│   │   ├── test-production-config.js
│   │   └── validate-config.js
│   ├── server.js
│   ├── src
│   │   ├── config
│   │   │   ├── environment.js
│   │   │   └── serverless-environment.js
│   │   ├── controllers
│   │   │   ├── __tests__
│   │   │   │   └── rateController.test.js
│   │   │   └── rateController.js
│   │   ├── middleware
│   │   │   ├── __tests__
│   │   │   │   └── errorHandler.test.js
│   │   │   ├── cors.js
│   │   │   ├── errorHandler.js
│   │   │   ├── logging.js
│   │   │   ├── security.js
│   │   │   └── upload.js
│   │   ├── routes
│   │   │   └── api.js
│   │   ├── services
│   │   │   ├── __tests__
│   │   │   │   ├── ratingService.test.js
│   │   │   │   └── visionService.test.js
│   │   │   ├── index.js
│   │   │   ├── ratingService.js
│   │   │   └── visionService.js
│   │   └── utils
│   │       ├── __tests__
│   │       │   └── validation.test.js
│   │       └── validation.js
│   └── vercel.json
└── six4btw
    ├── backend
    │   ├── api
    │   │   ├── ml
    │   │   │   └── models
    │   │   │       └── performative_classifier.py
    │   │   └── services
    │   │       └── image_analysis_service.py
    │   └── ml
    │       └── training
    │           └── train_performative_model.py
    ├── eslint.config.js
    ├── index.html
    ├── ml
    │   └── evaluation
    │       └── model_evaluation.py
    ├── package.json
    ├── postcss.config.js
    ├── public
    │   └── vite.svg
    ├── scripts
    │   └── data_processing
    │       └── image_dataset_generator.py
    ├── src
    │   ├── App.css
    │   ├── App.jsx
    │   ├── assets
    │   │   └── react.svg
    │   ├── backend
    │   │   └── processing
    │   │       └── opencv
    │   │           └── image_processor.py
    │   ├── components
    │   │   ├── features
    │   │   │   ├── ImageUploader.jsx
    │   │   │   ├── ImageUploader.test.jsx
    │   │   │   ├── ResultsDisplay.jsx
    │   │   │   ├── ResultsDisplay.test.jsx
    │   │   │   └── index.js
    │   │   ├── lazy
    │   │   │   └── index.js
    │   │   └── ui
    │   │       ├── Button.jsx
    │   │       ├── ErrorBoundary.jsx
    │   │       ├── ErrorDisplay.jsx
    │   │       ├── LiveRegion.jsx
    │   │       ├── NetworkStatus.jsx
    │   │       ├── ProgressIndicator.jsx
    │   │       ├── RatingMeter.jsx
    │   │       ├── RetryButton.jsx
    │   │       ├── Spinner.jsx
    │   │       ├── index.js
    │   │       └── withErrorBoundary.jsx
    │   ├── core
    │   │   └── ml
    │   │       └── training
    │   │           └── tensorflow
    │   │               └── dataset_builder.py
    │   ├── data
    │   │   └── ml
    │   │       └── opencv
    │   │           └── feature_extractor.py
    │   ├── hooks
    │   │   ├── index.js
    │   │   ├── useAccessibility.js
    │   │   ├── useImageUpload.js
    │   │   └── useNetworkStatus.js
    │   ├── index.css
    │   ├── lib
    │   │   └── vision
    │   │       └── pytorch
    │   │           └── performative_net.py
    │   ├── main.jsx
    │   ├── pages
    │   │   ├── HomePage.jsx
    │   │   └── index.js
    │   ├── services
    │   │   ├── ratingService.js
    │   │   └── vision
    │   │       └── pytorch
    │   │           └── inference_engine.py
    │   └── utils
    │       ├── accessibilityHelpers.js
    │       ├── animationOptimization.js
    │       ├── animations.js
    │       ├── errorHandler.js
    │       ├── errorHandler.test.js
    │       ├── errorMessages.js
    │       ├── fileValidation.js
    │       ├── imageCompression.js
    │       ├── index.js
    │       ├── integrationTest.js
    │       ├── lazyLoading.jsx
    │       ├── ml
    │       │   └── core
    │       │       └── tensorflow
    │       │           └── model_loader.py
    │       └── performanceMonitor.js
    ├── tailwind.config.js
    └── vite.config.js
```

##  Contributing

Contributions are welcome! Here's how you can help:

1. **Fork** the repository
2. **Clone** your fork: `git clone https://github.com/TANICE-GAWD/six4-btw.git`
3. **Create** a new branch: `git checkout -b feature/your-feature`
4. **Commit** your changes: `git commit -am 'Add some feature'`
5. **Push** to your branch: `git push origin feature/your-feature`
6. **Open** a pull request

Please ensure your code follows the project's style guidelines and includes tests where applicable.

## 📜 License

This project is licensed under the ISC License.
