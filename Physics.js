import Matter from "matter-js";
import Constants from "./Constants";
import { getRandomPipe } from "./Random";
import Pipe from "./src/components/Pipe";

let tick = 0;

const Physics = (entities, { touches, time, dispatch }) => {
    let engine = entities.physics.engine;
    let currentScore = entities.physics.score; // Lấy điểm hiện tại từ entity

    // --- TÍNH TOÁN ĐỘ KHÓ (LEVEL) ---
    // Cứ mỗi 10 điểm là lên 1 cấp (0, 1, 2, 3...)
    let level = Math.floor(currentScore / 10); 

    // 1. TỐC ĐỘ (Speed): Càng cấp cao càng bay nhanh
    // Cơ bản là 3, mỗi cấp cộng thêm 0.5
    let speed = 3 + (level * 0.5); 

    // 2. KHE HỞ (Gap): Càng cấp cao khe càng hẹp
    // Cơ bản là GAP_SIZE, mỗi cấp trừ đi 5 đơn vị (nhưng không nhỏ quá 100)
    let gap = Math.max(100, Constants.GAP_SIZE - (level * 10));

    // 3. TẦN SUẤT (Frequency): Càng cấp cao ống ra càng dày đặc
    // Cơ bản là 70 tick, mỗi cấp giảm đi 2 tick (nhưng không nhanh quá 40)
    let frequency = Math.max(40, 70 - (level * 4));


    // --- XỬ LÝ CHẠM MÀN HÌNH (GIỮ NGUYÊN) ---
    touches.filter(t => t.type === "press").forEach(t => {
        Matter.Body.setVelocity(entities.Bird.body, { x: 0, y: -5 });
        dispatch({ type: 'jump' });
    });

    Matter.Engine.update(engine, time.delta);

    // --- XỬ LÝ ỐNG ---
    Object.keys(entities).forEach(key => {
        if (key.indexOf("Pipe") === 0 && entities[key].body) {
            
            // ÁP DỤNG TỐC ĐỘ MỚI (speed)
            Matter.Body.translate(entities[key].body, { x: -speed, y: 0 });

           // Logic tính điểm (trong Physics.js)
            if (key.indexOf("PipeTop") !== -1) {
                if (entities[key].body.position.x <= Constants.MAX_WIDTH / 4 && !entities[key].scored) {
                    entities[key].scored = true;
                    
                    entities.physics.score += 1; 
                    dispatch({ type: "score" });

                    // --- THÊM ĐOẠN NÀY ---
                    // Kiểm tra nếu điểm chia hết cho 10 (10, 20, 30...) thì báo Level Up
                    if (entities.physics.score > 0 && entities.physics.score % 10 === 0) {
                        dispatch({ type: "level_up" });
                    }
                    // ---------------------
                }
            }

            // Xóa ống
            if (entities[key].body.position.x < -100) {
                Matter.World.remove(engine.world, entities[key].body);
                delete entities[key];
            }
        }
    });

    // --- SINH ỐNG MỚI VỚI TẦN SUẤT VÀ KHE HỞ MỚI ---
    tick += 1;
    if (tick > frequency) { // Dùng biến frequency thay vì số 70 cố định
        tick = 0;
        
        // Truyền biến gap vào hàm getRandomPipe
        const { pipeTop, pipeBottom } = getRandomPipe(Constants.MAX_WIDTH * 0.2, gap);

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
            body: pipeTopBody, size: [pipeTop.size.width, pipeTop.size.height], renderer: Pipe, scored: false, isTopPipe: true 
        };
        entities["PipeBottom" + Date.now()] = { 
            body: pipeBottomBody, size: [pipeBottom.size.width, pipeBottom.size.height], renderer: Pipe, isTopPipe: false 
        };
    }

    // --- XỬ LÝ VA CHẠM (GIỮ NGUYÊN) ---
    Matter.Events.on(engine, 'collisionStart', (event) => {
        dispatch({ type: "game_over" });
    });

    return entities;
};

export default Physics;