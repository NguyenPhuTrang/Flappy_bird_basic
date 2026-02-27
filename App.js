import { Audio } from "expo-av";
import Matter from "matter-js";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  ImageBackground,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { GameEngine } from "react-native-game-engine";

import Constants from "./Constants";
import Physics from "./Physics";
import Bird from "./src/components/Bird";

export default function App() {
  const [running, setRunning] = useState(false);
  const [gameEngine, setGameEngine] = useState(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [sound, setSound] = useState();
  const [notification, setNotification] = useState("");

  // Các state quản lý mạng sống và hiệu ứng
  const [lives, setLives] = useState(1);
  const [displayLives, setDisplayLives] = useState(1);
  const [isBlinking, setIsBlinking] = useState(false);
  const blinkAnim = useRef(new Animated.Value(1)).current;

  // Hàm thiết lập thế giới game
  const setupWorld = () => {
    let engine = Matter.Engine.create({ enableSleeping: false });
    let world = engine.world;

    // 1. Tạo Chim
    let bird = Matter.Bodies.rectangle(
      Constants.MAX_WIDTH / 4,
      Constants.MAX_HEIGHT / 2,
      50,
      50,
      { label: "Bird" },
    );

    // 2. Tạo Vật lý cho Đất (Để chim chạm vào thì chết)
    let floor = Matter.Bodies.rectangle(
      Constants.MAX_WIDTH / 2,
      Constants.MAX_HEIGHT - 25,
      Constants.MAX_WIDTH,
      50,
      { isStatic: true, label: "Floor" },
    );

    Matter.World.add(world, [bird, floor]);

    return {
      physics: { engine: engine, world: world, score: 0, lives: 1 },
      Bird: { body: bird, size: [50, 50], renderer: Bird },
      Floor: {
        body: floor,
        size: [Constants.MAX_WIDTH, 50],
        color: "green",
        renderer: (props) => {
          const width = props.size[0];
          const height = props.size[1];
          const x = props.body.position.x - width / 2;
          const y = props.body.position.y - height / 2;
          return (
            <View
              style={{
                position: "absolute",
                left: x,
                top: y,
                width: width,
                height: height,
                backgroundColor: props.color,
              }}
            />
          );
        },
      },
    };
  };

  // --- HÀM PHÁT ÂM THANH ---
  async function playSound(type) {
    let soundFile;
    try {
      switch (type) {
        case "score":
          soundFile = require("./assets/sound/Point.mp3");
          break;
        // Có thể thêm case jump, game_over... nếu bạn có file âm thanh
        default:
          return;
      }

      const { sound } = await Audio.Sound.createAsync(soundFile);
      setSound(sound);
      await sound.playAsync();
    } catch (error) {
      console.log("Lỗi phát âm thanh (Kiểm tra tên file/đường dẫn): ", error);
    }
  }

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  useEffect(() => {
    async function configureAudio() {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
          staysActiveInBackground: false,
        });
      } catch (e) {
        console.log("Lỗi cấu hình âm thanh:", e);
      }
    }
    configureAudio();
  }, []);

  const onEvent = (e) => {
    switch (e.type) {
      case "game_over":
        setRunning(false);
        setIsGameOver(true);
        setNotification("");
        playSound("game_over");

        // --- MỚI: Xử lý nhấp nháy trái tim cuối cùng khi Game Over ---
        setIsBlinking(true);
        Animated.sequence([
          Animated.timing(blinkAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(blinkAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(blinkAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(blinkAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(blinkAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => {
          setIsBlinking(false);
          setDisplayLives(0); // Nhấp nháy xong mới thực sự ẩn
          blinkAnim.setValue(1);
        });
        break;

      case "score":
        setScore((currentScore) => currentScore + 1);
        playSound("score");
        break;
      case "jump":
        playSound("jump");
        break;
      case "level_up":
        setNotification("Level Up !");
        setTimeout(() => {
          setNotification("");
        }, 2000);
        break;

      case "add_life":
        setLives((current) => current + 1);
        setDisplayLives((current) => current + 1);
        break;

      case "lost_life":
        setIsBlinking(true);
        // --- MỚI: Tăng duration lên 300 và thêm nhịp chớp tắt lâu hơn ---
        Animated.sequence([
          Animated.timing(blinkAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(blinkAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(blinkAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(blinkAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(blinkAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => {
          setIsBlinking(false);
          setDisplayLives((current) => current - 1);
          blinkAnim.setValue(1);
        });
        break;
    }
  };

  const resetGame = () => {
    if (gameEngine) {
      gameEngine.swap(setupWorld());
      setScore(0);
      setNotification("");
      setRunning(true);
      setIsGameOver(false);
      setLives(1);
      setDisplayLives(1);
    }
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("./assets/images/backgroud.jpg")}
        style={styles.container}
        resizeMode="cover"
      >
        <GameEngine
          ref={(ref) => {
            setGameEngine(ref);
          }}
          style={styles.gameContainer}
          systems={[Physics]}
          entities={setupWorld()}
          running={running}
          onEvent={onEvent}
        >
          <StatusBar hidden={true} />
        </GameEngine>

        <Text style={styles.scoreText}>{score}</Text>

        {notification !== "" && (
          <Text style={styles.notificationText}>{notification}</Text>
        )}

        {!running && (
          <View style={styles.fullScreenButton}>
            <TouchableOpacity onPress={resetGame} style={styles.button}>
              <Text style={styles.buttonText}>
                {isGameOver ? "Game Over" : "Start"}
              </Text>
              {isGameOver && <Text style={styles.scoreResult}>{score}</Text>}
            </TouchableOpacity>
          </View>
        )}
      </ImageBackground>

      {/* --- MỚI: Đổi `running` thành `displayLives > 0` để lúc chết tim vẫn kịp chớp --- */}
      {displayLives > 0 && (
        <View
          style={{
            position: "absolute",
            top: 50,
            left: 20,
            zIndex: 10,
            flexDirection: "row",
          }}
        >
          {Array.from({ length: displayLives }).map((_, i) => {
            const isLastHeart = i === displayLives - 1;
            const currentOpacity = isBlinking && isLastHeart ? blinkAnim : 1;

            return (
              <Animated.Image
                key={i}
                source={require("./assets/images/heart.png")}
                style={{
                  width: 30,
                  height: 30,
                  marginRight: 8,
                  opacity: currentOpacity,
                }}
                resizeMode="contain"
              />
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  gameContainer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  fullScreenButton: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
    elevation: 10,
  },
  button: {
    backgroundColor: "black",
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
  },
  scoreText: {
    position: "absolute",
    top: 50,
    alignSelf: "center",
    fontSize: 60,
    fontWeight: "bold",
    color: "white",
    zIndex: 10,
  },
  scoreResult: {
    fontSize: 40,
    color: "white",
    textAlign: "center",
    marginTop: 10,
  },
  notificationText: {
    position: "absolute",
    top: 150,
    alignSelf: "center",
    fontSize: 30,
    fontWeight: "bold",
    color: "white",
    textShadowColor: "white",
    textShadowRadius: 5,
    zIndex: 20,
  },
});
