import React from 'react';
import { Image } from 'react-native';

const Bird = ({ body, size }) => {
    const width = size[0];
    const height = size[1];
    
    // 1. Lấy vị trí x, y
    const x = body.position.x - width / 2;
    const y = body.position.y - height / 2;

    
    // Nhân với một hệ số (ví dụ 0.1 hoặc 0.2) để điều chỉnh độ nhạy
    let rotation = body.velocity.y * 0.2; 

    // Giới hạn góc xoay để không bị quay vòng tròn
    if (rotation > 1.5) rotation = 1.5;   // Tối đa khoảng 85 độ (cắm đầu xuống)
    if (rotation < -0.5) rotation = -0.5; // Tối đa khoảng -30 độ (ngóc đầu lên)

    return (
        <Image
            style={{
                position: 'absolute',
                left: x,
                top: y,
                width: width,
                height: height,
                // 3. Áp dụng góc xoay vào style transform
                transform: [{ rotate: `${rotation}rad` }] 
            }}
            resizeMode="contain"
            source={require('../../assets/images/bird.png')} 
        />
    );
};

export default Bird;