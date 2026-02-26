import Matter from "matter-js";
import Constants from "./Constants";
import { getRandomPipe } from "./Random";
import Heart from "./src/components/Heart";
import Pipe from "./src/components/Pipe";

let tick = 0;

const Physics = (entities, { touches, time, dispatch }) => {
  let engine = entities.physics.engine;
  let world = engine.world;
  // Lấy số mạng hiện tại (mặc định là 1 nếu chưa có)
  let lives = entities.physics.lives || 1;
  let score = entities.physics.score;

  // --- 1. TÍNH TOÁN ĐỘ KHÓ (LEVEL) ---
  let level = Math.floor(score / 10);
  let speed = 3 + level * 0.5;
  let gap = Math.max(100, Constants.GAP_SIZE - level * 10);
  let frequency = Math.max(40, 70 - level * 4);

  // --- 2. XỬ LÝ CHẠM MÀN HÌNH (JUMP) ---
  touches
    .filter((t) => t.type === "press")
    .forEach((t) => {
      if (entities.Bird) {
        Matter.Body.setVelocity(entities.Bird.body, { x: 0, y: -5 });
        Matter.Body.setAngle(entities.Bird.body, -0.78);
        dispatch({ type: "jump" });
      }
    });

  // Cập nhật Engine vật lý
  Matter.Engine.update(engine, time.delta);

  // --- 3. XỬ LÝ DI CHUYỂN & LOGIC ENTITY ---
  Object.keys(entities).forEach((key) => {
    // A. Xử lý Ống (Pipe)
    if (key.indexOf("Pipe") === 0 && entities[key].body) {
      Matter.Body.translate(entities[key].body, { x: -speed, y: 0 });

      // Logic tính điểm
      if (
        key.indexOf("PipeTop") !== -1 &&
        entities[key].body.position.x <= Constants.MAX_WIDTH / 4 &&
        !entities[key].scored
      ) {
        entities[key].scored = true;

        // Cộng điểm
        entities.physics.score += 1;
        dispatch({ type: "score" });

        // Kiểm tra Level Up
        if (entities.physics.score > 0 && entities.physics.score % 10 === 0) {
          dispatch({ type: "level_up" });
        }
      }

      // Xóa ống khi ra khỏi màn hình
      if (entities[key].body.position.x < -100) {
        Matter.World.remove(world, entities[key].body);
        delete entities[key];
      }
    }

    // B. Xử lý Trái Tim (Heart)
    if (key.indexOf("Heart") === 0 && entities[key].body) {
      Matter.Body.translate(entities[key].body, { x: -speed, y: 0 });

      // Xóa tim khi ra khỏi màn hình
      if (entities[key].body.position.x < -100) {
        Matter.World.remove(world, entities[key].body);
        delete entities[key];
      }
    }
  });

  // --- 4. SINH ỐNG VÀ TRÁI TIM MỚI ---
  tick += 1;
  if (tick > frequency) {
    tick = 0;

    // Tạo tọa độ ống
    const { pipeTop, pipeBottom } = getRandomPipe(
      Constants.MAX_WIDTH * 0.2,
      gap,
    );

    // Tạo Body cho ống
    const pipeTopBody = Matter.Bodies.rectangle(
      pipeTop.position.x,
      pipeTop.position.y,
      pipeTop.size.width,
      pipeTop.size.height,
      { isStatic: true, label: "Pipe" },
    );
    const pipeBottomBody = Matter.Bodies.rectangle(
      pipeBottom.position.x,
      pipeBottom.position.y,
      pipeBottom.size.width,
      pipeBottom.size.height,
      { isStatic: true, label: "Pipe" },
    );

    Matter.World.add(world, [pipeTopBody, pipeBottomBody]);

    // Thêm vào entities
    entities["PipeTop" + Date.now()] = {
      body: pipeTopBody,
      size: [pipeTop.size.width, pipeTop.size.height],
      renderer: Pipe,
      scored: false,
      isTopPipe: true,
    };
    entities["PipeBottom" + Date.now()] = {
      body: pipeBottomBody,
      size: [pipeBottom.size.width, pipeBottom.size.height],
      renderer: Pipe,
      isTopPipe: false,
    };

    // --- LOGIC SINH TRÁI TIM ---
    // Tỷ lệ xuất hiện: 20% gốc, giảm dần theo level, tối thiểu 5%
    let heartChance = Math.max(0.05, 0.2 - level * 0.02);

    if (Math.random() < heartChance) {
      const heartSize = 30;

      // Tọa độ Y: Trung bình cộng của 2 ống -> Nằm chính giữa
      const heartY = (pipeTop.position.y + pipeBottom.position.y) / 2;
      // Tọa độ X: Bằng ống -> Nằm thẳng hàng
      const heartX = pipeTop.position.x;

      const heartBody = Matter.Bodies.rectangle(
        heartX,
        heartY,
        heartSize,
        heartSize,
        {
          isStatic: true,
          label: "Heart",
          isSensor: true, // Quan trọng: Chim bay xuyên qua được
        },
      );

      Matter.World.add(world, heartBody);

      entities["Heart" + Date.now()] = {
        body: heartBody,
        size: [heartSize, heartSize],
        renderer: Heart,
      };
    }
  }

  // --- 5. XỬ LÝ VA CHẠM (COLLISION) ---
  // Sử dụng Matter.Query thay vì Matter.Events.on để tối ưu hiệu năng trong Loop
  if (entities.Bird) {
    // Lấy tất cả các body khác trong world trừ con chim
    const allBodies = Matter.Composite.allBodies(world);

    // Kiểm tra xem chim có chạm vào cái gì không
    const collisions = Matter.Query.collides(entities.Bird.body, allBodies);

    if (collisions.length > 0) {
      collisions.forEach((collision) => {
        const { bodyA, bodyB } = collision;
        // Tìm xem vật thể kia là cái gì (không phải con chim)
        const otherBody = bodyA.label === "Bird" ? bodyB : bodyA;

        // CASE 1: ĂN TRÁI TIM
        if (otherBody.label === "Heart") {
          // Xóa trái tim vật lý
          Matter.World.remove(world, otherBody);

          // Xóa trái tim khỏi entities (renderer)
          const heartKey = Object.keys(entities).find(
            (key) => entities[key].body === otherBody,
          );
          if (heartKey) delete entities[heartKey];

          // Logic cộng mạng
          entities.physics.lives += 1;
          dispatch({ type: "add_life" });
        }

        // CASE 2: ĐÂM VÀO ỐNG (Pipe)
        else if (otherBody.label === "Pipe") {
          // Chúng ta cần kiểm tra xem ống này đã va chạm chưa để tránh trừ mạng liên tục trong 1s
          // Tuy nhiên vì sau khi va chạm ta xóa ống luôn nên không cần cờ check

          if (entities.physics.lives > 1) {
            // MẤT MẠNG (nhưng chưa chết)
            entities.physics.lives -= 1;
            dispatch({ type: "lost_life" });

            // Xóa cái ống đó đi (Vỡ ống)
            Matter.World.remove(world, otherBody);
            const pipeKey = Object.keys(entities).find(
              (key) => entities[key].body === otherBody,
            );
            if (pipeKey) delete entities[pipeKey];
          } else {
            // HẾT MẠNG -> GAME OVER
            dispatch({ type: "game_over" });
          }
        }

        // CASE 3: CHẠM ĐẤT (Floor)
        else if (otherBody.label === "Floor") {
          dispatch({ type: "game_over" });
        }
      });
    }
  }

  return entities;
};

export default Physics;
