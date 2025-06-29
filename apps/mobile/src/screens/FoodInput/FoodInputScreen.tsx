import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import {
  launchCamera,
  launchImageLibrary,
  MediaType,
  ImagePickerResponse,
  ImageLibraryOptions,
} from 'react-native-image-picker';
import { FoodAnalysisResult } from '@/services/interfaces';
import { styles } from './styles';
import { analyzeFood, analyzeFoodImage, saveFoodEntry } from '@/services/food';

const FoodInputScreen: React.FC = () => {
  const navigation = useNavigation();
  const [inputMode, setInputMode] = useState<'text' | 'camera'>('text');
  const [textInput, setTextInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] =
    useState<FoodAnalysisResult | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleTextAnalysis = async () => {
    if (!textInput.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Please enter food description',
        text2: 'Example: "200g chicken breast, 100g rice"',
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await analyzeFood(textInput);
      setAnalysisResult(result);
    } catch (error) {
      console.error('Text analysis error:', error);
      Toast.show({
        type: 'error',
        text1: 'Analysis failed',
        text2: 'Please try again',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCamera = async () => {
    const options: ImageLibraryOptions = {
      mediaType: 'photo' as MediaType,
      includeBase64: true,
      maxHeight: 2000,
      maxWidth: 2000,
      quality: 0.8,
    };

    launchCamera(options, (response: ImagePickerResponse) => {
      if (response.didCancel || response.errorMessage) {
        return;
      }

      if (response.assets && response.assets[0]) {
        const asset = response.assets[0];
        setSelectedImage(asset.uri || null);
        setInputMode('camera');
        if (asset.base64) {
          analyzeImage(asset.base64);
        }
      }
    });
  };

  const handleGallery = async () => {
    const options: ImageLibraryOptions = {
      mediaType: 'photo' as MediaType,
      includeBase64: true,
      maxHeight: 2000,
      maxWidth: 2000,
      quality: 0.8,
    };

    launchImageLibrary(options, (response: ImagePickerResponse) => {
      if (response.didCancel || response.errorMessage) {
        return;
      }

      if (response.assets && response.assets[0]) {
        const asset = response.assets[0];
        setSelectedImage(asset.uri || null);
        setInputMode('camera');
        if (asset.base64) {
          analyzeImage(asset.base64);
        }
      }
    });
  };

  const analyzeImage = async (base64: string) => {
    setIsAnalyzing(true);
    try {
      const result = await analyzeFoodImage(base64);
      setAnalysisResult(result);
    } catch (error) {
      console.error('Image analysis error:', error);
      Toast.show({
        type: 'error',
        text1: 'Image analysis failed',
        text2: 'Please try again',
      });
      setSelectedImage(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveFood = async () => {
    if (!analysisResult) return;

    Alert.alert(
      'Confirm',
      `Add ${analysisResult.totalCalories} calories to today's log?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Add',
          onPress: async () => {
            setIsSaving(true);
            try {
              await saveFoodEntry({
                foods: analysisResult.foods,
                totalCalories: analysisResult.totalCalories,
                protein: analysisResult.protein,
                carbs: analysisResult.carbs,
                fat: analysisResult.fat,
              });

              Toast.show({
                type: 'success',
                text1: 'Successfully added!',
                text2: `${analysisResult.totalCalories} calories`,
              });

              navigation.goBack();
            } catch (error) {
              console.error('Save food entry error:', error);
              Toast.show({
                type: 'error',
                text1: 'Failed to save',
                text2: 'Please try again',
              });
            } finally {
              setIsSaving(false);
            }
          },
        },
      ]
    );
  };

  const resetAnalysis = () => {
    setAnalysisResult(null);
    setTextInput('');
    setSelectedImage(null);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.content}>
        {!analysisResult ? (
          <>
            {/* Input Mode Selection */}
            <View style={styles.modeSelector}>
              <TouchableOpacity
                style={[
                  styles.modeButton,
                  inputMode === 'text' && styles.modeButtonActive,
                ]}
                onPress={() => setInputMode('text')}
              >
                <Ionicons
                  name="text-outline"
                  size={24}
                  color={inputMode === 'text' ? '#fff' : '#007AFF'}
                />
                <Text
                  style={[
                    styles.modeButtonText,
                    inputMode === 'text' && styles.modeButtonTextActive,
                  ]}
                >
                  Text
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modeButton,
                  inputMode === 'camera' && styles.modeButtonActive,
                ]}
                onPress={() => setInputMode('camera')}
              >
                <Ionicons
                  name="camera-outline"
                  size={24}
                  color={inputMode === 'camera' ? '#fff' : '#007AFF'}
                />
                <Text
                  style={[
                    styles.modeButtonText,
                    inputMode === 'camera' && styles.modeButtonTextActive,
                  ]}
                >
                  Photo
                </Text>
              </TouchableOpacity>
            </View>

            {/* Text Input Mode */}
            {inputMode === 'text' && (
              <View style={styles.textInputContainer}>
                <Text style={styles.label}>Describe what you ate:</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Example: 200g chicken breast, 100g rice, salad"
                  value={textInput}
                  onChangeText={setTextInput}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />

                <TouchableOpacity
                  style={[
                    styles.analyzeButton,
                    (!textInput.trim() || isAnalyzing) && styles.buttonDisabled,
                  ]}
                  onPress={handleTextAnalysis}
                  disabled={!textInput.trim() || isAnalyzing}
                >
                  {isAnalyzing ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <Ionicons name="search" size={20} color="#fff" />
                      <Text style={styles.analyzeButtonText}>Analyze</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {/* Camera Input Mode */}
            {inputMode === 'camera' && (
              <View style={styles.cameraContainer}>
                {selectedImage ? (
                  <>
                    <Image
                      source={{ uri: selectedImage }}
                      style={styles.previewImage}
                    />
                    {isAnalyzing && (
                      <View style={styles.analyzingOverlay}>
                        <ActivityIndicator size="large" color="#fff" />
                        <Text style={styles.analyzingText}>Analyzing...</Text>
                      </View>
                    )}
                  </>
                ) : (
                  <>
                    <Text style={styles.label}>Take a photo of your food:</Text>
                    <View style={styles.cameraButtons}>
                      <TouchableOpacity
                        style={styles.cameraButton}
                        onPress={handleCamera}
                      >
                        <Ionicons name="camera" size={32} color="#007AFF" />
                        <Text style={styles.cameraButtonText}>Camera</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.cameraButton}
                        onPress={handleGallery}
                      >
                        <Ionicons name="images" size={32} color="#007AFF" />
                        <Text style={styles.cameraButtonText}>Gallery</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </View>
            )}
          </>
        ) : (
          /* Analysis Results */
          <View style={styles.resultsContainer}>
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsTitle}>Analysis Results</Text>
              <TouchableOpacity onPress={resetAnalysis}>
                <Ionicons name="close-circle" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.totalCaloriesCard}>
              <Text style={styles.totalCaloriesLabel}>Total Calories</Text>
              <Text style={styles.totalCaloriesValue}>
                {analysisResult.totalCalories}
              </Text>
            </View>

            <View style={styles.macrosContainer}>
              <View style={styles.macroItem}>
                <Text style={styles.macroLabel}>Protein</Text>
                <Text style={styles.macroValue}>{analysisResult.protein}g</Text>
              </View>
              <View style={styles.macroItem}>
                <Text style={styles.macroLabel}>Carbs</Text>
                <Text style={styles.macroValue}>{analysisResult.carbs}g</Text>
              </View>
              <View style={styles.macroItem}>
                <Text style={styles.macroLabel}>Fat</Text>
                <Text style={styles.macroValue}>{analysisResult.fat}g</Text>
              </View>
            </View>

            <View style={styles.foodsList}>
              <Text style={styles.foodsListTitle}>Detected Foods:</Text>
              {analysisResult.foods.map((food, index) => (
                <View key={index} style={styles.foodItem}>
                  <View>
                    <Text style={styles.foodName}>{food.name}</Text>
                    <Text style={styles.foodQuantity}>{food.quantity}</Text>
                  </View>
                  <Text style={styles.foodCalories}>{food.calories} cal</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.saveButton, isSaving && styles.buttonDisabled]}
              onPress={handleSaveFood}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color="#fff" />
                  <Text style={styles.saveButtonText}>Add to Daily Log</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default FoodInputScreen;
