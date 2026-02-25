import { Dimensions } from 'react-native';
import Constants from './Constants';

const windowHeight = Dimensions.get('window').height;
const windowWidth = Dimensions.get('window').width;

export const getRandomPipe = (addToPosX = 0) => {
    // Tính toán độ cao ngẫu nhiên cho ống trên
    // yTop sẽ nằm trong khoảng từ -500 đến -100 (tuỳ chỉnh theo màn hình)
    let yTop = -Math.random() * 300 - 100;

    // Tạo ống trên
    const pipeTop = {
        position: { x: windowWidth + addToPosX, y: yTop },
        size: { width: Constants.PIPE_WIDTH, height: windowHeight },
        renderer: 'PipeTop' // Đánh dấu để vẽ
    };

    // Tạo ống dưới (dựa theo ống trên + khoảng cách GAP)
    const pipeBottom = {
        position: { x: windowWidth + addToPosX, y: windowHeight + yTop + Constants.GAP_SIZE },
        size: { width: Constants.PIPE_WIDTH, height: windowHeight },
        renderer: 'PipeBottom'
    };

    return { pipeTop, pipeBottom };
}