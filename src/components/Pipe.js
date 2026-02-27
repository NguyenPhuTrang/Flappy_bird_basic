import { View } from "react-native";
import Constants from "../../Constants";

const CAP_HEIGHT = 30;
const CAP_WIDTH = Constants.PIPE_WIDTH + 10;

// 1. THÊM `opacity` VÀO ĐÂY
const Pipe = ({ body, size, isTopPipe, opacity }) => {
  const width = size[0];
  const height = size[1];
  const x = body.position.x - width / 2;
  const y = body.position.y - height / 2;

  // --- Style chung ---
  const commonStyle = {
    backgroundColor: "#73BF2E",
    borderColor: "black",
    borderWidth: 2,
    flexDirection: "row",
    overflow: "hidden",
  };

  const Shine = () => (
    <>
      <View
        style={{
          width: 4,
          height: "100%",
          backgroundColor: "#98E359",
          marginLeft: 3,
          opacity: 0.7,
        }}
      />
      <View
        style={{
          width: 8,
          height: "100%",
          backgroundColor: "#98E359",
          marginLeft: 5,
          opacity: 0.3,
        }}
      />
    </>
  );

  const PipeBody = () => (
    <View
      style={{
        ...commonStyle,
        width: Constants.PIPE_WIDTH,
        flex: 1,
        borderBottomWidth: isTopPipe ? 0 : 2,
        borderTopWidth: isTopPipe ? 2 : 0,
      }}
    >
      <Shine />
    </View>
  );

  const PipeCap = () => (
    <View style={{ ...commonStyle, width: CAP_WIDTH, height: CAP_HEIGHT }}>
      <Shine />
    </View>
  );

  return (
    <View
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: width,
        height: height,
        alignItems: "center",
        flexDirection: "column",
        // 2. GẮN OPACITY VÀO KHUNG BÊN NGOÀI CÙNG
        opacity: opacity !== undefined ? opacity : 1,
      }}
    >
      {isTopPipe && (
        <>
          <PipeBody />
          <PipeCap />
        </>
      )}

      {!isTopPipe && (
        <>
          <PipeCap />
          <PipeBody />
        </>
      )}
    </View>
  );
};

export default Pipe;
