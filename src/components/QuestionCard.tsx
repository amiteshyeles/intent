import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { QuestionCardProps } from '../types';

const { width } = Dimensions.get('window');

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  appName,
  onAnswer,
  isOptional = true,
}) => {
  const [answer, setAnswer] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  const handleShowInput = () => {
    setShowInput(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleSubmitAnswer = () => {
    if (onAnswer) {
      onAnswer(answer);
    }
    // Could add haptic feedback here
  };

  const handleSkip = () => {
    if (onAnswer) {
      onAnswer('');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.questionText}>{question}</Text>
        
        {appName && (
          <Text style={styles.contextText}>
            Before opening {appName}
          </Text>
        )}

        {!showInput ? (
          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={styles.reflectButton}
              onPress={handleShowInput}
              activeOpacity={0.7}
            >
              <Text style={styles.reflectButtonText}>
                I'd like to reflect on this
              </Text>
            </TouchableOpacity>
            
            {isOptional && (
              <TouchableOpacity
                style={styles.skipButton}
                onPress={handleSkip}
                activeOpacity={0.7}
              >
                <Text style={styles.skipButtonText}>
                  Just thinking about it is enough
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <Animated.View
            style={[
              styles.inputContainer,
              {
                opacity: fadeAnim,
              },
            ]}
          >
            <Text style={styles.inputLabel}>
              Take a moment to reflect...
            </Text>
            
            <TextInput
              style={styles.textInput}
              placeholder="Your thoughts (optional)"
              placeholderTextColor="#95A5A6"
              value={answer}
              onChangeText={setAnswer}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              autoFocus
            />
            
            <View style={styles.inputActions}>
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmitAnswer}
                activeOpacity={0.7}
              >
                <Text style={styles.submitButtonText}>
                  {answer.trim() ? 'Continue' : 'I thought about it'}
                </Text>
              </TouchableOpacity>
            </View>
            
            <Text style={styles.privacyNote}>
              Your reflection is private and not stored
            </Text>
          </Animated.View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 30,
    width: width - 40,
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  questionText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#2C3E50',
    textAlign: 'center',
    lineHeight: 30,
    marginBottom: 12,
  },
  contextText: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    marginBottom: 30,
    fontStyle: 'italic',
  },
  actionContainer: {
    alignItems: 'center',
  },
  reflectButton: {
    backgroundColor: '#3498DB',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 25,
    marginBottom: 16,
    minWidth: 200,
  },
  reflectButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  skipButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#BDC3C7',
  },
  skipButtonText: {
    color: '#7F8C8D',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  inputContainer: {
    alignItems: 'center',
  },
  inputLabel: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    marginBottom: 16,
  },
  textInput: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#2C3E50',
    width: '100%',
    minHeight: 100,
    borderWidth: 1,
    borderColor: '#ECF0F1',
    marginBottom: 20,
  },
  inputActions: {
    alignItems: 'center',
    width: '100%',
  },
  submitButton: {
    backgroundColor: '#27AE60',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
    minWidth: 150,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  privacyNote: {
    fontSize: 12,
    color: '#95A5A6',
    textAlign: 'center',
    marginTop: 16,
    fontStyle: 'italic',
  },
});

export default QuestionCard; 