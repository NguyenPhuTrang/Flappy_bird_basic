import Matter from "matter-js";
import Constants from "./Constants";
import { getRandomPipe } from "./Random";
import Pipe from "./src/components/Pipe"; 

let tick = 0; // Biến đếm thời gian

const Physics = (entities, { touches, time, dispatch }) => {
    let engine = entities.physics.engine;

    // 1. Xử lý chạm màn hình (Chim nhảy)
    touches.filter(t => t.type === "press").forEach(t => {
        Matter.Body.setVelocity(entities.Bird.body, {
            x: 0,
            y: -5
        });
    });
    
    dispatch({ type: 'jump' });

    // 2. Cập nhật Engine vật lý
    Matter.Engine.update(engine, time.delta);

    // 3. Xử lý Logic Ống (Di chuyển, Tính điểm, Xóa)
    Object.keys(entities).forEach(key => {
        
        // Chỉ xử lý các vật thể là Ống (tên bắt đầu bằng "Pipe")
        if (key.indexOf("Pipe") === 0 && entities[key].body) {
            
            // A. Di chuyển ống sang trái
            Matter.Body.translate(entities[key].body, { x: -3, y: 0 });

            // B. TÍNH ĐIỂM (Scoring)
            // Chỉ kiểm tra ống trên (PipeTop) để tránh cộng điểm 2 lần
            if (key.indexOf("PipeTop") !== -1) {
                // Nếu ống đã đi qua vị trí của chim (x < màn hình/4) VÀ chưa được tính điểm
                if (entities[key].body.position.x <= Constants.MAX_WIDTH / 4 && !entities[key].scored) {
                    entities[key].scored = true; // Đánh dấu đã tính điểm
                    dispatch({ type: "score" }); // Gửi sự kiện ghi điểm
                }
            }

            // C. Xóa ống nếu đi ra khỏi màn hình bên trái
            if (entities[key].body.position.x < -100) {
                Matter.World.remove(engine.world, entities[key].body);
                delete entities[key];
            }
        }
    });

    // 4. Sinh ống mới (khoảng 1 - 1.5 giây một lần)
    tick += 1;
    if (tick > 80) {
        tick = 0;
        const { pipeTop, pipeBottom } = getRandomPipe(Constants.MAX_WIDTH * 0.2);

        const pipeTopBody = Matter.Bodies.rectangle(
            pipeTop.position.x, pipeTop.position.y,
            pipeTop.size.width, pipeTop.size.height,
            { isStatic: true, label: 'Pipe' } 
        );

        const pipeBottomBody = Matter.Bodies.rectangle(
            pipeBottom.position.x, pipeBottom.position.y,
            pipeBottom.size.width, pipeBottom.size.height,
            { isStatic: true, label: 'Pipe' }
        );

        Matter.World.add(engine.world, [pipeTopBody, pipeBottomBody]);

       entities["PipeTop" + Date.now()] = { 
            body: pipeTopBody, 
            size: [pipeTop.size.width, pipeTop.size.height], 
            renderer: Pipe, 
            scored: false,
            isTopPipe: true 
        };

        entities["PipeBottom" + Date.now()] = { 
            body: pipeBottomBody, 
            size: [pipeBottom.size.width, pipeBottom.size.height], 
            renderer: Pipe,
            isTopPipe: false 
        };
    }

    // 5. Kiểm tra chim rơi xuống đất hoặc bay quá cao (QUAN TRỌNG)
    // Nếu y của chim lớn hơn chiều cao màn hình -> Chạm đất
    if (entities.Bird.body.position.y >= Constants.MAX_HEIGHT - 50) {
        dispatch({ type: "game_over" });
    }
    // (Tùy chọn) Nếu chim bay vượt quá trần nhà
    if (entities.Bird.body.position.y <= 0) {
       dispatch({ type: "game_over" });
    }

    // 6. Xử lý va chạm với Ống (Collision)
Matter.Events.on(engine, 'collisionStart', (event) => {
        dispatch({ type: "game_over" });
    });

    return entities;
};

export default Physics;