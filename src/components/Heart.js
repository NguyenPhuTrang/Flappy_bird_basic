// components/Heart.js
// 1. Thêm Image vào dòng import
import { Image, View } from "react-native";

const Heart = ({ body, size }) => {
  const width = size[0];
  const height = size[1];
  const x = body.position.x - width / 2;
  const y = body.position.y - height / 2;

  return (
    <View
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: width,
        height: height,
      }}
    >
      {/* 2. Đã bỏ dấu { } thừa bao quanh Image */}
      <Image
        source={require("../../assets/images/heart.png")}
        style={{
          width: width,
          height: height,
          resizeMode: "contain",
        }}
      />
    </View>
  );
};

export default Heart;
