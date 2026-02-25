import { Dimensions } from 'react-native';
import Constants from './Constants';

const windowHeight = Dimensions.get('window').height;
const windowWidth = Dimensions.get('window').width;

// Thêm tham số gap vào hàm (mặc định lấy từ Constants nếu không truyền vào)
export const getRandomPipe = (addToPosX, gap = Constants.GAP_SIZE) => {
    
    // Logic random độ cao của ống trên (giữ nguyên)
    let yTop = -Math.random() * 300 - 100;

    // Tạo ống trên
    const pipeTop = {
        position: { x: windowWidth + addToPosX, y: yTop },
        size: { width: Constants.PIPE_WIDTH, height: windowHeight },
        renderer: 'PipeTop' 
    };

    // Tạo ống dưới
    const pipeBottom = {
        position: { 
            x: windowWidth + addToPosX, 
            // --- SỬA LẠI DÒNG NÀY ---
            // Thay Constants.GAP_SIZE bằng biến gap được truyền vào
            y: windowHeight + yTop + gap 
            // ------------------------
        },
        size: { width: Constants.PIPE_WIDTH, height: windowHeight },
        renderer: 'PipeBottom'
    };

    return { pipeTop, pipeBottom };
}