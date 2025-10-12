import React from 'react';
import { motion } from 'framer-motion';
import { RatingMeter, Button } from '../ui';

const ResultsDisplay = ({
  apiResponse,
  originalImage,
  onReset
}) => {
  // Create preview URL for the original image
  const imagePreviewUrl = React.useMemo(() => {
    if (originalImage) {
      return URL.createObjectURL(originalImage);
    }
    return null;
  }, [originalImage]);

  // Cleanup URL when component unmounts
  React.useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  if (!apiResponse || !originalImage) {
    return null;
  }

  const { score, message: description } = apiResponse;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="w-full max-w-4xl mx-auto p-4 sm:p-6"
      role="region"
      aria-label="Rating results"
      aria-live="polite"
    >
      {/* Aesthetic Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="text-center mb-6 sm:mb-8"
      >
        <div className="inline-flex items-center justify-center mb-4">
          <div className="bg-purple-100 rounded-full p-3 border border-purple-200">
            <span className="text-2xl"></span>
          </div>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-purple-600 mb-2">
          Your Performative Analysis
        </h2>

        <div className="flex justify-center mt-3">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-purple-300 rounded-full"></div>
            <div className="w-2 h-2 bg-pink-300 rounded-full"></div>
            <div className="w-2 h-2 bg-indigo-300 rounded-full"></div>
          </div>
        </div>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
        {/* Image Display */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="space-y-4"
        >
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 text-center lg:text-left">
            Your Image
          </h3>
          <div className="relative bg-gray-100 rounded-lg overflow-hidden shadow-lg">
            <img
              src={imagePreviewUrl}
              alt={`Uploaded image: ${originalImage.name}`}
              className="w-full h-auto max-h-64 sm:max-h-96 object-contain"
              loading="lazy"
            />
          </div>
          <div className="text-xs sm:text-sm text-gray-500 text-center lg:text-left space-y-1">
            <p><span className="font-medium">File:</span> {originalImage.name}</p>
            <p><span className="font-medium">Size:</span> {(originalImage.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
        </motion.div>

        {/* Rating Display */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="flex flex-col items-center justify-center space-y-4 sm:space-y-6"
        >
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
            Performance Rating
          </h3>

          {/* Rating Meter */}
          <div className="flex justify-center">
            <RatingMeter
              score={score}
              size="large"
              animationDuration={2000}
              showPercentage={true}
              aria-label={`Performance rating: ${score} out of 100 percent`}
            />
          </div>

          {/* Score Description */}
          {description && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5, duration: 0.5 }}
              className="text-center max-w-md px-4"
            >
              <div className="bg-purple-50 rounded-xl p-4 border border-purple-100 shadow-sm">
                <p className="text-gray-800 text-base sm:text-lg leading-relaxed font-medium italic">
                  "{description}"
                </p>
              </div>
            </motion.div>
          )}

          {/* Detected Performative Items */}
          {apiResponse.detectedItems && apiResponse.detectedItems.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.8, duration: 0.5 }}
              className="text-center max-w-lg px-4"
            >
              <h4 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">
                Performative Elements Detected
              </h4>
              <div className="flex flex-wrap justify-center gap-2">
                {apiResponse.detectedItems.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 2.0 + (index * 0.1), duration: 0.3 }}
                    className={`
                      inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium
                      ${item.points >= 15
                        ? 'bg-purple-100 text-purple-800 border border-purple-200'
                        : item.points >= 10
                          ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                          : 'bg-gray-100 text-slate-700 border border-slate-200'
                      }
                    `}
                  >
                    <span className="mr-1">
                      {item.points >= 15 ? '' : item.points >= 10 ? '' : ''}
                    </span>
                    {item.item}
                    <span className="ml-1 font-bold">+{item.points}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Performative Status Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.2, duration: 0.5 }}
            className="text-center"
            role="status"
            aria-live="polite"
          >
            <div className="inline-flex items-center px-4 py-3 rounded-2xl text-sm font-bold shadow-lg">
              {score >= 80 && (
                <div className="bg-purple-500 text-white border-2 border-purple-300 shadow-purple-200" role="img" aria-label="Peak performative energy">
                  <span className="text-lg mr-2"></span>
                  6'4 btw
                </div>
              )}
              {score >= 60 && score < 80 && (
                <div className="bg-indigo-500 text-white border-2 border-indigo-300 shadow-indigo-200" role="img" aria-label="Strong indie vibes">
                  <span className="text-lg mr-2"></span>
                  He'll Explain bell hooks To You
                </div>
              )}
              {score >= 40 && score < 60 && (
                <div className="bg-blue-500 text-white border-2 border-blue-300 shadow-blue-200" role="img" aria-label="Soft boy territory">
                  <span className="text-lg mr-2"></span>
                  Clairo Listener
                </div>
              )}
              {score >= 20 && score < 40 && (
                <div className="bg-green-500 text-white border-2 border-green-300 shadow-green-200" role="img" aria-label="Aesthetic consciousness">
                  <span className="text-lg mr-2"></span>
                  Tote Bag Novice
                </div>
              )}
              {score < 20 && (
                <div className="bg-gray-500 text-white border-2 border-gray-300 shadow-gray-200" role="img" aria-label="Refreshingly authentic">
                  <span className="text-lg mr-2"></span>
                  Refreshingly Authentic
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Performative Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 3.0, duration: 0.5 }}
        className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center"
      >
        <Button
          onClick={onReset}
          variant="primary"
          size="large"
          className="w-full sm:w-auto min-w-[200px] bg-purple-500 hover:bg-purple-600 text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          aria-label="Upload another image to get a new rating"
        >
          <span className="mr-2">📸</span>
          Rate Another Aesthetic
        </Button>

        {/* <Button
          onClick={async () => {
            try {
              const shareText = score >= 60
                ? `Just got rated ${score}% performative  Apparently I'm peak indie boy energy `
                : `Only ${score}% performative - staying authentic  #NotThatGuy`;

              if (navigator.share) {
                await navigator.share({
                  title: 'My Performative Male Rating',
                  text: shareText,
                  url: window.location.href
                });
              } else {
                await navigator.clipboard.writeText(
                  `${shareText} ${window.location.href}`
                );
              }
            } catch (error) {
              console.log('Share failed:', error);
            }
          }}
          variant="secondary"
          size="large"
          className="w-full sm:w-auto min-w-[200px] bg-indigo-100 hover:bg-indigo-200 text-indigo-700 font-semibold border border-indigo-200 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
          aria-label={`Share your ${score}% performative rating result`}
        >
          <span className="mr-2"></span>
          Share the Vibes
        </Button> */}
      </motion.div>

      {/* Detailed Analysis Stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5, duration: 0.5 }}
        className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-purple-200"
        role="region"
        aria-label="Detailed analysis statistics"
      >
        <h3 className="text-center text-lg font-semibold text-gray-800 mb-4">
          Analysis Breakdown
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-center mb-6">
          <div className="bg-purple-50 rounded-xl p-3 sm:p-4 border border-purple-100 shadow-sm">
            <div className="text-xl sm:text-2xl font-bold text-purple-700" aria-label={`${score} percent`}>
              {score}%
            </div>
            <div className="text-xs sm:text-sm text-purple-600 font-medium">Performative Score</div>
          </div>

          <div className="bg-blue-50 rounded-xl p-3 sm:p-4 border border-blue-100 shadow-sm">
            <div className="text-xl sm:text-2xl font-bold text-blue-700">
              {apiResponse.detectedItems ? apiResponse.detectedItems.length : 0}
            </div>
            <div className="text-xs sm:text-sm text-blue-600 font-medium">Items Detected</div>
          </div>

          <div className="bg-green-50 rounded-xl p-3 sm:p-4 border border-green-100 shadow-sm">
            <div className="text-xl sm:text-2xl font-bold text-green-700">
              {apiResponse.processingTime ? `${apiResponse.processingTime}ms` : 'N/A'}
            </div>
            <div className="text-xs sm:text-sm text-green-600 font-medium">AI Analysis Time</div>
          </div>

          <div className="bg-orange-50 rounded-xl p-3 sm:p-4 border border-orange-100 shadow-sm">
            <div className="text-xl sm:text-2xl font-bold text-orange-700">
              {(originalImage.size / 1024).toFixed(0)}KB
            </div>
            <div className="text-xs sm:text-sm text-orange-600 font-medium">Image Size</div>
          </div>
        </div>

        {/* API Response Details */}
        {apiResponse.metadata && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.8, duration: 0.5 }}
            className="bg-slate-50 rounded-xl p-4 border border-slate-200"
          >
            <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center">
              <span className="mr-2"></span>
              AI Vision Analysis
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-slate-600">Total Labels Found:</span>
                <div className="font-bold text-slate-800">
                  {apiResponse.metadata.totalLabelsFound || 'N/A'}
                </div>
              </div>
              <div>
                <span className="text-slate-600">Performative Items:</span>
                <div className="font-bold text-slate-800">
                  {apiResponse.metadata.performativeItemsDetected || 0}
                </div>
              </div>
              <div>
                <span className="text-slate-600">Vision Processing:</span>
                <div className="font-bold text-slate-800">
                  {apiResponse.metadata.visionProcessingTime ? `${apiResponse.metadata.visionProcessingTime}ms` : 'N/A'}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* API Response Summary */}
        {/* <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 3.2, duration: 0.5 }}
          className="mt-6 bg-slate-50 rounded-xl p-6 border border-slate-200 shadow-sm"
        >
          <h4 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
            <span className="mr-2"></span>
            Analysis Summary
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"> */}
        {/* Score Breakdown */}
        {/* <div className="bg-white rounded-lg p-4 border border-slate-200">
              <h5 className="font-semibold text-slate-700 mb-2 flex items-center">
                <span className="mr-1"></span>
                Score Breakdown
              </h5>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Final Score:</span>
                  <span className="font-bold text-purple-600">{score}%</span>
                </div>
                {apiResponse.metadata?.rawScore && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">Raw Score:</span>
                    <span className="font-medium text-slate-700">{apiResponse.metadata.rawScore}</span>
                  </div>
                )}
                <div className="flex justify-between"> */}
        {/* <span className="text-slate-600">Items Found:</span>
                  <span className="font-medium text-slate-700">{apiResponse.detectedItems?.length || 0}</span>
                </div>
              </div>
            </div> */}

        {/* Processing Stats */}
        {/* <div className="bg-white rounded-lg p-4 border border-slate-200">
              <h5 className="font-semibold text-slate-700 mb-2 flex items-center">
                <span className="mr-1"></span>
                Processing Stats
              </h5>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Total Time:</span>
                  <span className="font-medium text-slate-700">{apiResponse.processingTime || 0}ms</span>
                </div>
                {apiResponse.metadata?.visionProcessingTime && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">Vision API:</span>
                    <span className="font-medium text-slate-700">{apiResponse.metadata.visionProcessingTime}ms</span>
                  </div>
                )} */}
        {/* {apiResponse.metadata?.ratingProcessingTime && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">Rating Calc:</span>
                    <span className="font-medium text-slate-700">{apiResponse.metadata.ratingProcessingTime}ms</span>
                  </div>
                )} */}
        {/* </div>
            </div> */}

        {/* Image Info */}
        {/* <div className="bg-white rounded-lg p-4 border border-slate-200">
              <h5 className="font-semibold text-slate-700 mb-2 flex items-center">
                <span className="mr-1"></span>
                Image Details
              </h5>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Size:</span>
                  <span className="font-medium text-slate-700">{(originalImage.size / 1024).toFixed(0)}KB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Type:</span>
                  <span className="font-medium text-slate-700">{originalImage.type}</span>
                </div>
                {apiResponse.metadata?.totalLabelsFound && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">Labels Found:</span>
                    <span className="font-medium text-slate-700">{apiResponse.metadata.totalLabelsFound}</span>
                  </div>
                )} */}
        {/* </div>
            </div>
          </div>
        </motion.div>
        
 */}
        {/* Debug Section - Detected Labels */}
        {apiResponse.debug && apiResponse.debug.processedLabels && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 3.4, duration: 0.5 }}
            className="mt-4 bg-blue-900 rounded-xl p-4 border border-blue-700"
          >
            <h4 className="text-sm font-semibold text-blue-300 mb-3 flex items-center">
              <span className="mr-2"></span>
              Google Vision Labels Detected
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {apiResponse.debug.processedLabels.map((label, index) => (
                <div key={index} className="bg-blue-800 rounded-lg p-2 text-xs">
                  <div className="text-blue-200 font-semibold">
                    "{label.original}"
                  </div>
                  <div className="text-blue-300">
                    Processed: "{label.processed}"
                  </div>
                  <div className="text-blue-400">
                    Confidence: {(label.confidence * 100).toFixed(1)}%
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Debug Section - Detected Items Details */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 3.6, duration: 0.5 }}
          className="mt-4 bg-purple-900 rounded-xl p-4 border border-purple-700"
        >
          <h4 className="text-sm font-semibold text-purple-300 mb-3 flex items-center">
            <span className="mr-2"></span>
            Performative Items Analysis
          </h4>
          <div className="space-y-2">
            <div className="text-purple-200 text-sm">
              <strong>Total Items in Dictionary:</strong> {Object.keys(apiResponse.performativeItems || {}).length || 'N/A'}
            </div>
            <div className="text-purple-200 text-sm">
              <strong>Items Detected Array Length:</strong> {apiResponse.detectedItems ? apiResponse.detectedItems.length : 'undefined'}
            </div>
            <div className="text-purple-200 text-sm">
              <strong>Items Detected:</strong>
            </div>
            {apiResponse.detectedItems && apiResponse.detectedItems.length > 0 ? (
              <div className="grid grid-cols-1 gap-2 mt-2">
                {apiResponse.detectedItems.map((item, index) => (
                  <div key={index} className="bg-purple-800 rounded-lg p-2 text-xs">
                    <div className="text-purple-200 font-semibold">
                      {item.item} (+{item.points} pts)
                    </div>
                    <div className="text-purple-300">
                      Match: {item.matchType} | Confidence: {(item.confidence * 100).toFixed(1)}%
                    </div>
                    {item.originalLabel && (
                      <div className="text-purple-400">
                        Original: "{item.originalLabel}"
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-2"></div>
                <div className="text-purple-700 font-medium">No performative items detected</div>
                <div className="text-purple-600 text-sm mt-1">Your image appears refreshingly authentic!</div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Detailed Performative Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 3.8, duration: 0.5 }}
          className="mt-6 bg-purple-50 rounded-xl p-6 border border-purple-200"
        >
          <h4 className="text-lg font-bold text-purple-800 mb-4 flex items-center">
            <span className="mr-2"></span>
            Detailed Item Breakdown
          </h4>

          {apiResponse.detectedItems && apiResponse.detectedItems.length > 0 ? (
            <div className="space-y-4">
              {/* Items by Category */}
              <div>
                <h5 className="font-semibold text-purple-700 mb-3">Items Detected by Performative Level</h5>
                <div className="space-y-3">
                  {/* High Value Items (15+ points) */}
                  {apiResponse.detectedItems.filter(item => item.points >= 15).length > 0 && (
                    <div>
                      <h6 className="text-sm font-medium text-pink-700 mb-2 flex items-center">
                        <span className="mr-1"></span>
                        Peak Performative (15+ points)
                      </h6>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {apiResponse.detectedItems
                          .filter(item => item.points >= 15)
                          .sort((a, b) => b.points - a.points)
                          .map((item, index) => (
                            <div key={index} className="bg-pink-100 rounded-lg p-3 border border-pink-200">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="font-semibold text-purple-800 capitalize">
                                    {item.item.replace(/_/g, ' ')}
                                  </div>
                                  <div className="text-xs text-purple-600 mt-1">
                                    {item.matchType} match • {(item.confidence * 100).toFixed(1)}% confidence
                                  </div>
                                  {item.originalLabel && item.originalLabel !== item.item && (
                                    <div className="text-xs text-purple-500 italic mt-1">
                                      detected as "{item.originalLabel}"
                                    </div>
                                  )}
                                </div>
                                <div className="bg-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full ml-2">
                                  +{item.points}
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Medium Value Items (8-14 points) */}
                  {apiResponse.detectedItems.filter(item => item.points >= 8 && item.points < 15).length > 0 && (
                    <div>
                      <h6 className="text-sm font-medium text-indigo-700 mb-2 flex items-center">
                        <span className="mr-1"></span>
                        Moderately Performative (8-14 points)
                      </h6>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {apiResponse.detectedItems
                          .filter(item => item.points >= 8 && item.points < 15)
                          .sort((a, b) => b.points - a.points)
                          .map((item, index) => (
                            <div key={index} className="bg-indigo-50 rounded-lg p-3 border border-indigo-200">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="font-semibold text-indigo-800 capitalize">
                                    {item.item.replace(/_/g, ' ')}
                                  </div>
                                  <div className="text-xs text-indigo-600 mt-1">
                                    {item.matchType} match • {(item.confidence * 100).toFixed(1)}% confidence
                                  </div>
                                  {item.originalLabel && item.originalLabel !== item.item && (
                                    <div className="text-xs text-indigo-500 italic mt-1">
                                      detected as "{item.originalLabel}"
                                    </div>
                                  )}
                                </div>
                                <div className="bg-indigo-500 text-white text-xs font-bold px-2 py-1 rounded-full ml-2">
                                  +{item.points}
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Low Value Items (<8 points) */}
                  {apiResponse.detectedItems.filter(item => item.points < 8).length > 0 && (
                    <div>
                      <h6 className="text-sm font-medium text-slate-700 mb-2 flex items-center">
                        <span className="mr-1"></span>
                        Mildly Performative (&lt;8 points)
                      </h6>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {apiResponse.detectedItems
                          .filter(item => item.points < 8)
                          .sort((a, b) => b.points - a.points)
                          .map((item, index) => (
                            <div key={index} className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="font-semibold text-slate-800 capitalize">
                                    {item.item.replace(/_/g, ' ')}
                                  </div>
                                  <div className="text-xs text-slate-600 mt-1">
                                    {item.matchType} match • {(item.confidence * 100).toFixed(1)}% confidence
                                  </div>
                                  {item.originalLabel && item.originalLabel !== item.item && (
                                    <div className="text-xs text-slate-500 italic mt-1">
                                      detected as "{item.originalLabel}"
                                    </div>
                                  )}
                                </div>
                                <div className="bg-slate-500 text-white text-xs font-bold px-2 py-1 rounded-full ml-2">
                                  +{item.points}
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Score Calculation Summary */}
              <div className="bg-white rounded-lg p-4 border border-purple-200">
                <h5 className="font-semibold text-purple-700 mb-3 flex items-center">
                  <span className="mr-1"></span>
                  Score Calculation
                </h5>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-lg font-bold text-purple-600">{apiResponse.metadata?.rawScore || 'N/A'}</div>
                    <div className="text-slate-600">Raw Points</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-purple-600">{score}%</div>
                    <div className="text-slate-600">Final Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-purple-600">{apiResponse.detectedItems.length}</div>
                    <div className="text-slate-600">Items Found</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-purple-600">{apiResponse.metadata?.totalLabelsFound || 'N/A'}</div>
                    <div className="text-slate-600">Total Labels</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-6xl mb-4"></div>
              <div className="text-purple-700 font-bold text-lg">Refreshingly Authentic!</div>
              <div className="text-purple-600 text-sm mt-2">No performative items detected in your image.</div>
              <div className="text-purple-500 text-xs mt-1">You're keeping it real! </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default ResultsDisplay;