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
import * as ImagePicker from 'expo-image-picker';
import { styles } from './styles';

interface FoodAnalysisResult {
  totalCalories: number;
  protein: number;
  carbs: number;
  fat: number;
  foods: Array<{
    name: string;
    quantity: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }>;
}

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
        text1: 'Моля въведете описание на храната',
        text2: 'Например: "200г пилешко филе, 100г ориз"',
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await analyzeFood(textInput);
      setAnalysisResult(result);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Грешка при анализ',
        text2: 'Моля опитайте отново',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Необходимо разрешение',
        'Моля разрешете достъп до камерата от настройките на телефона'
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      setSelectedImage(result.assets[0].uri);
      setInputMode('camera');
      analyzeImage(result.assets[0].base64);
    }
  };

  const handleGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Необходимо разрешение',
        'Моля разрешете достъп до галерията от настройките на телефона'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      setSelectedImage(result.assets[0].uri);
      setInputMode('camera');
      analyzeImage(result.assets[0].base64);
    }
  };

  const analyzeImage = async (base64: string) => {
    setIsAnalyzing(true);
    try {
      const result = await analyzeFoodImage(base64);
      setAnalysisResult(result);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Грешка при анализ на снимката',
        text2: 'Моля опитайте отново',
      });
      setSelectedImage(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveFood = async () => {
    if (!analysisResult) return;

    Alert.alert(
      'Потвърждение',
      `Добавяне на ${analysisResult.totalCalories} калории към днешния ден?`,
      [
        { text: 'Отказ', style: 'cancel' },
        {
          text: 'Добави',
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
                text1: 'Успешно добавено!',
                text2: `${analysisResult.totalCalories} калории`,
              });

              navigation.goBack();
            } catch (error) {
              Toast.show({
                type: 'error',
                text1: 'Грешка при запазване',
                text2: 'Моля опитайте отново',
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
                  Текст
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
                  Снимка
                </Text>
              </TouchableOpacity>
            </View>

            {/* Text Input Mode */}
            {inputMode === 'text' && (
              <View style={styles.textInputContainer}>
                <Text style={styles.label}>Опишете какво ядохте:</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Например: 200г пилешко филе, 100г ориз, салата"
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
                      <Text style={styles.analyzeButtonText}>Анализирай</Text>
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
                        <Text style={styles.analyzingText}>Анализиране...</Text>
                      </View>
                    )}
                  </>
                ) : (
                  <>
                    <Text style={styles.label}>Снимайте храната:</Text>
                    <View style={styles.cameraButtons}>
                      <TouchableOpacity
                        style={styles.cameraButton}
                        onPress={handleCamera}
                      >
                        <Ionicons name="camera" size={32} color="#007AFF" />
                        <Text style={styles.cameraButtonText}>Камера</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.cameraButton}
                        onPress={handleGallery}
                      >
                        <Ionicons name="images" size={32} color="#007AFF" />
                        <Text style={styles.cameraButtonText}>Галерия</Text>
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
              <Text style={styles.resultsTitle}>Резултати от анализа</Text>
              <TouchableOpacity onPress={resetAnalysis}>
                <Ionicons name="close-circle" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.totalCaloriesCard}>
              <Text style={styles.totalCaloriesLabel}>Общо калории</Text>
              <Text style={styles.totalCaloriesValue}>
                {analysisResult.totalCalories}
              </Text>
            </View>

            <View style={styles.macrosContainer}>
              <View style={styles.macroItem}>
                <Text style={styles.macroLabel}>Протеини</Text>
                <Text style={styles.macroValue}>{analysisResult.protein}г</Text>
              </View>
              <View style={styles.macroItem}>
                <Text style={styles.macroLabel}>Въглехидрати</Text>
                <Text style={styles.macroValue}>{analysisResult.carbs}г</Text>
              </View>
              <View style={styles.macroItem}>
                <Text style={styles.macroLabel}>Мазнини</Text>
                <Text style={styles.macroValue}>{analysisResult.fat}г</Text>
              </View>
            </View>

            <View style={styles.foodsList}>
              <Text style={styles.foodsListTitle}>Разпознати храни:</Text>
              {analysisResult.foods.map((food, index) => (
                <View key={index} style={styles.foodItem}>
                  <View>
                    <Text style={styles.foodName}>{food.name}</Text>
                    <Text style={styles.foodQuantity}>{food.quantity}</Text>
                  </View>
                  <Text style={styles.foodCalories}>{food.calories} кал</Text>
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
                  <Text style={styles.saveButtonText}>Добави към дневника</Text>
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
