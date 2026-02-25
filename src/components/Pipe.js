import React from 'react';
import { View } from 'react-native';
import Constants from '../../Constants'; // Cần import Constants để lấy chiều rộng chuẩn

// Chiều cao của cái nắp (viền)
const CAP_HEIGHT = 30;
// Chiều rộng của nắp (rộng hơn thân ống 10 đơn vị)
const CAP_WIDTH = Constants.PIPE_WIDTH + 10;

const Pipe = ({ body, size, isTopPipe }) => {
    const width = size[0];
    const height = size[1];
    const x = body.position.x - width / 2;
    const y = body.position.y - height / 2;

    // --- Style chung cho cả thân và nắp (Màu xanh, viền đen, vệt sáng) ---
    const commonStyle = {
        backgroundColor: '#73BF2E', // Màu xanh chuẩn
        borderColor: 'black',
        borderWidth: 2,
        flexDirection: 'row', // Để vẽ vệt sáng dọc
        overflow: 'hidden'
    };

    // Component con để vẽ vệt sáng 3D (giúp ống nhìn tròn hơn)
    const Shine = () => (
         <>
            <View style={{ width: 4, height: '100%', backgroundColor: '#98E359', marginLeft: 3, opacity: 0.7 }} />
            <View style={{ width: 8, height: '100%', backgroundColor: '#98E359', marginLeft: 5, opacity: 0.3 }} />
         </>
    );

    // --- Component Thân ống (Dài) ---
    const PipeBody = () => (
        <View style={{ 
            ...commonStyle, 
            width: Constants.PIPE_WIDTH, // Chiều rộng chuẩn (50)
            flex: 1, // Tự động chiếm hết chiều cao còn lại
            // Nếu là ống trên, cần bỏ viền đáy để nối liền với nắp. Ống dưới bỏ viền trên.
            borderBottomWidth: isTopPipe ? 0 : 2,
            borderTopWidth: isTopPipe ? 2 : 0,
        }}>
            <Shine />
        </View>
    );

    // --- Component Nắp ống (Ngắn, Rộng) ---
    const PipeCap = () => (
        <View style={{ 
            ...commonStyle, 
            width: CAP_WIDTH, // Rộng hơn thân (60)
            height: CAP_HEIGHT // Chiều cao cố định (30)
        }}>
            <Shine />
        </View>
    );

    return (
        <View
            style={{
                position: 'absolute',
                left: x,
                top: y,
                width: width,
                height: height,
                alignItems: 'center', // Canh giữa thân và nắp theo trục dọc
                // Flexbox giúp sắp xếp thứ tự trên dưới dễ dàng
                flexDirection: 'column'
            }}
        >
            {/* LOGIC QUAN TRỌNG NHẤT: Sắp xếp vị trí */}
            
            {/* Nếu là Ống Trên (quay xuống): Vẽ Thân trước, Nắp sau */}
            {isTopPipe && <>
                 <PipeBody />
                 <PipeCap />
            </>}

            {/* Nếu là Ống Dưới (quay lên): Vẽ Nắp trước, Thân sau */}
            {!isTopPipe && <>
                 <PipeCap />
                 <PipeBody />
            </>}
        </View>
    );
};

export default Pipe;