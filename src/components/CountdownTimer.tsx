import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { CountdownTimerProps } from '../types';

const { width } = Dimensions.get('window');
const TIMER_SIZE = width * 0.6;
const CIRCLE_SIZE = TIMER_SIZE - 40;

const CountdownTimer: React.FC<CountdownTimerProps> = ({
  initialSeconds,
  onComplete,
  onBypass,
  question,
  appName,
  isPaused = false,
  showBypassAfterSeconds = 10,
}) => {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [showBypass, setShowBypass] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  
  const animatedValue = useRef(new Animated.Value(0)).current;
  const breathingScale = useRef(new Animated.Value(1)).current;
  const progressValue = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    // Start breathing animation
    startBreathingAnimation();
    
    if (!isPaused && !isComplete) {
      const interval = setInterval(() => {
        setSeconds(prevSeconds => {
          if (prevSeconds <= 1) {
            clearInterval(interval);
            setIsComplete(true);
            onComplete();
            return 0;
          }
          return prevSeconds - 1;
        });
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [isPaused, isComplete, onComplete]);
  
  useEffect(() => {
    // Show bypass button after specified seconds
    if (initialSeconds - seconds >= showBypassAfterSeconds && !showBypass) {
      setShowBypass(true);
    }
  }, [seconds, initialSeconds, showBypassAfterSeconds, showBypass]);
  
  useEffect(() => {
    // Update progress animation
    const progress = (initialSeconds - seconds) / initialSeconds;
    Animated.timing(progressValue, {
      toValue: progress,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [seconds, initialSeconds, progressValue]);
  
  const startBreathingAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(breathingScale, {
          toValue: 1.1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(breathingScale, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };
  
  const formatTime = (timeInSeconds: number): string => {
    const minutes = Math.floor(timeInSeconds / 60);
    const secs = timeInSeconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };
  
  const handleBypass = () => {
    setIsComplete(true);
    onBypass();
  };
  
  const getProgressColor = () => {
    const progress = seconds / initialSeconds;
    if (progress > 0.7) return '#3498DB'; // Calm blue
    if (progress > 0.3) return '#F39C12'; // Warning orange
    return '#27AE60'; // Success green
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.appName}>Opening {appName}</Text>
      
      <View style={styles.timerContainer}>
        <Animated.View
          style={[
            styles.breathingContainer,
            {
              transform: [{ scale: breathingScale }],
            },
          ]}
        >
          <View style={styles.circleContainer}>
            <Animated.View
              style={[
                styles.progressCircle,
                {
                  borderColor: getProgressColor(),
                  borderWidth: progressValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: [8, 16],
                  }),
                },
              ]}
            />
            <View style={styles.timerContent}>
              <Text style={styles.timeText}>{formatTime(seconds)}</Text>
              <Text style={styles.timeLabel}>remaining</Text>
            </View>
          </View>
        </Animated.View>
      </View>
      
      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>{question}</Text>
      </View>
      
      <View style={styles.breathingInstructions}>
        <Text style={styles.instructionText}>
          Take a moment to breathe and reflect
        </Text>
        <Text style={styles.subInstructionText}>
          The circle will guide your breathing rhythm
        </Text>
      </View>
      
      {showBypass && !isComplete && (
        <TouchableOpacity
          style={styles.bypassButton}
          onPress={handleBypass}
          activeOpacity={0.7}
        >
          <Text style={styles.bypassText}>I have a specific purpose</Text>
        </TouchableOpacity>
      )}
      
      {isComplete && (
        <View style={styles.completionContainer}>
          <Text style={styles.completionText}>
            Time for reflection is complete
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 20,
  },
  appName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 40,
    textAlign: 'center',
  },
  timerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  breathingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleContainer: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  progressCircle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    borderColor: '#3498DB',
    borderWidth: 8,
    backgroundColor: 'rgba(52, 152, 219, 0.1)',
    position: 'absolute',
  },
  timerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeText: {
    fontSize: 42,
    fontWeight: '300',
    color: '#2C3E50',
    fontVariant: ['tabular-nums'],
  },
  timeLabel: {
    fontSize: 14,
    color: '#7F8C8D',
    marginTop: 4,
  },
  questionContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  questionText: {
    fontSize: 20,
    fontWeight: '500',
    color: '#2C3E50',
    textAlign: 'center',
    lineHeight: 28,
  },
  breathingInstructions: {
    alignItems: 'center',
    marginBottom: 40,
  },
  instructionText: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    marginBottom: 4,
  },
  subInstructionText: {
    fontSize: 14,
    color: '#95A5A6',
    textAlign: 'center',
  },
  bypassButton: {
    backgroundColor: '#ECF0F1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#BDC3C7',
  },
  bypassText: {
    fontSize: 16,
    color: '#7F8C8D',
    fontWeight: '500',
  },
  completionContainer: {
    alignItems: 'center',
  },
  completionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#27AE60',
    textAlign: 'center',
  },
});

export default CountdownTimer; 