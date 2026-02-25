import React, { useState, useEffect } from 'react';
import { StatusBar, TouchableOpacity, View, Text, StyleSheet, ImageBackground } from 'react-native';
import { GameEngine } from 'react-native-game-engine';
import Matter from 'matter-js';
import { Audio } from 'expo-av';

// --- KIỂM TRA LẠI ĐƯỜNG DẪN IMPORT Ở ĐÂY ---
import Constants from './Constants';
import Bird from './src/components/Bird'; 
import Physics from './Physics';
// --------------------------------------------

export default function App() {
    const [running, setRunning] = useState(false);
    const [gameEngine, setGameEngine] = useState(null);
    const [isGameOver, setIsGameOver] = useState(false);
    const [score, setScore] = useState(0);
    const [sound, setSound] = useState();

    // Hàm thiết lập thế giới game
   const setupWorld = () => {
        let engine = Matter.Engine.create({ enableSleeping: false });
        let world = engine.world;

        // 1. Tạo Chim
        let bird = Matter.Bodies.rectangle(Constants.MAX_WIDTH / 4, Constants.MAX_HEIGHT / 2, 50, 50, { label: 'Bird' });

        // 2. Tạo Vật lý cho Đất (Để chim chạm vào thì chết)
        let floor = Matter.Bodies.rectangle(
            Constants.MAX_WIDTH / 2,
            Constants.MAX_HEIGHT - 25,
            Constants.MAX_WIDTH,
            50,
            { isStatic: true, label: 'Floor' }
        );

        Matter.World.add(world, [bird, floor]);

        return {
            physics: { engine: engine, world: world },
            Bird: { body: bird, size: [50, 50], renderer: Bird },
            Floor: { 
                body: floor, 
                size: [Constants.MAX_WIDTH, 50], 
                color: 'green', 
                renderer: (props) => {
                    const width = props.size[0];
                    const height = props.size[1];
                    const x = props.body.position.x - width / 2;
                    const y = props.body.position.y - height / 2;
                    return (
                        <View style={{
                            position: 'absolute',
                            left: x,
                            top: y,
                            width: width,
                            height: height,
                            backgroundColor: props.color 
                        }} />
                    )
                }
            },
        }
    }

    // --- HÀM PHÁT ÂM THANH ---
    async function playSound(type) {
        let soundFile;
        try {
            switch (type) {
                case 'score':
                    soundFile = require('./assets/sound/Point.mp3');
                    break;
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
                playSound('game_over');
                break;
            case "score":
                setScore(currentScore => currentScore + 1);
                playSound('score');
                break;
            case "jump": 
                playSound('jump');
                break;
        }
    }

    const resetGame = () => {
        if (gameEngine) {
            gameEngine.swap(setupWorld());
            setScore(0);
            setRunning(true);
            setIsGameOver(false);
        }
    }

    return (
        <View style={styles.container}>
            <ImageBackground
                source={require('./assets/images/backgroud.jpg')} 
                style={styles.container}
                resizeMode="cover"
            >
                <GameEngine
                    ref={(ref) => { setGameEngine(ref) }}
                    style={styles.gameContainer}
                    systems={[Physics]}
                    entities={setupWorld()}
                    running={running}
                    onEvent={onEvent}
                >
                    <StatusBar hidden={true} />
                </GameEngine>

                <Text style={styles.scoreText}>{score}</Text>

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
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    gameContainer: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
    },
    fullScreenButton: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100,
        elevation: 10
    },
    button: {
        backgroundColor: 'black',
        paddingHorizontal: 30,
        paddingVertical: 10,
        borderRadius: 10
    },
    buttonText: {
        color: 'white',
        fontSize: 30,
        fontWeight: 'bold',
        textAlign: 'center'
    },
    scoreText: {
        position: 'absolute',
        top: 50,
        alignSelf: 'center',
        fontSize: 60,
        fontWeight: 'bold',
        color: 'white',
        zIndex: 10
    },
    scoreResult: {
        fontSize: 40,
        color: 'white',
        textAlign: 'center',
        marginTop: 10
    }
});