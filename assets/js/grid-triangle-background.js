/**
 * 網格排列三角形懸浮粒子系統
 * Grid-based Triangle Particle System
 * 規則排列的三角形網格，具有同步波浪動畫和滑鼠互動效果
 */

class GridTriangleBackground {
    constructor() {
        this.canvas = document.getElementById('triangle-canvas');
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.triangles = [];
        this.mouse = { x: 0, y: 0 };
        this.time = 0;
        this.isRunning = true;

        // 網格參數
        this.gridSettings = {
            rows: window.innerWidth < 768 ? 8 : 12,        // 行數
            cols: window.innerWidth < 768 ? 12 : 18,       // 列數
            spacing: window.innerWidth < 768 ? 1.8 : 1.4,  // 間距
            amplitude: 0.4,                                 // 動畫幅度
            waveSpeed: 0.015,                              // 波浪速度
            mouseRadius: 4,                                // 滑鼠影響範圍
            triangleSize: window.innerWidth < 768 ? 0.06 : 0.075  // 三角形大小 (縮小到25%)
        };

        this.init();
        this.createTriangleGrid();
        this.addEventListeners();
        this.animate();
    }

    init() {
        // 場景設置
        this.scene = new THREE.Scene();

        // 相機設置
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.z = 10;

        // 渲染器設置
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            alpha: true,
            antialias: !window.innerWidth < 768,
            powerPreference: 'high-performance'
        });
        
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setClearColor(0x000000, 0);

        // 環境光
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);

        // 點光源
        const pointLight = new THREE.PointLight(0xfacf20, 0.8, 100);
        pointLight.position.set(10, 10, 10);
        this.scene.add(pointLight);
    }

    createTriangleGrid() {
        const { rows, cols, spacing, triangleSize } = this.gridSettings;

        // 計算網格起始位置 (置中)
        const startX = -(cols - 1) * spacing / 2;
        const startY = -(rows - 1) * spacing / 2;

        // 清除現有三角形
        this.triangles.forEach(triangle => {
            this.scene.remove(triangle.mesh);
            triangle.geometry.dispose();
            triangle.material.dispose();
        });
        this.triangles = [];

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const triangle = this.createSingleTriangle(row, col);

                // 計算網格位置
                const x = startX + col * spacing;
                const y = startY + row * spacing;
                const z = 0;

                triangle.mesh.position.set(x, y, z);

                // 儲存網格信息和原始位置
                triangle.userData = {
                    originalPosition: { x, y, z },
                    gridRow: row,
                    gridCol: col,
                    delay: (row + col) * 0.1,           // 動畫延遲
                    amplitude: this.gridSettings.amplitude,
                    phase: Math.random() * Math.PI * 2   // 隨機相位
                };

                this.triangles.push(triangle);
                this.scene.add(triangle.mesh);
            }
        }

        console.log(`Grid created: ${rows}x${cols} = ${this.triangles.length} triangles`);
    }

    createSingleTriangle(row, col) {
        const { triangleSize } = this.gridSettings;
        
        // 創建直角三角形幾何體
        const size = triangleSize;
        
        const vertices = new Float32Array([
            0, 0, 0,           // 直角頂點 (原點)
            size, 0, 0,        // 右下角
            0, size, 0         // 左上角
        ]);

        const uvs = new Float32Array([
            0.0, 0.0,    // 直角頂點 UV
            1.0, 0.0,    // 右下角 UV
            0.0, 1.0     // 左上角 UV
        ]);

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));

        // 創建材質
        const material = this.createTriangleMaterial(row, col);
        
        // 創建網格
        const mesh = new THREE.Mesh(geometry, material);
        
        // 添加一些隨機旋轉變化 (90度的倍數，保持直角三角形的特性)
        const rotations = [0, Math.PI/2, Math.PI, Math.PI*3/2];
        mesh.rotation.z = rotations[Math.floor(Math.random() * 4)];

        return {
            mesh: mesh,
            geometry: geometry,
            material: material,
            userData: {}
        };
    }

    createTriangleMaterial(row, col) {
        // 使用簡單的白色透明線框材質
        const material = new THREE.MeshBasicMaterial({
            color: 0xffffff,        // 白色
            transparent: true,
            opacity: 0.3,           // 透明度 0.3
            wireframe: true,        // 只顯示線框
            wireframeLinewidth: 1   // 線框寬度
        });

        return material;
    }

    addEventListeners() {
        // 滑鼠移動事件
        window.addEventListener('mousemove', (event) => {
            this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        });

        // 滾動事件
        window.addEventListener('scroll', () => {
            this.updateScrollEffect();
        });

        // 窗口調整大小事件
        window.addEventListener('resize', () => {
            this.onWindowResize();
        });

        // 頁面可見性變化
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pause();
            } else {
                this.resume();
            }
        });

        // 點擊波紋效果
        window.addEventListener('click', (event) => {
            this.createClickRipple(event.clientX, event.clientY);
        });
    }

    animate() {
        if (!this.isRunning) return;

        this.time += 0.016; // 約60fps

        this.updateTriangles();
        this.updateCamera();

        // 渲染
        this.renderer.render(this.scene, this.camera);

        requestAnimationFrame(() => this.animate());
    }

    updateTriangles() {
        const { waveSpeed, mouseRadius, amplitude } = this.gridSettings;

        this.triangles.forEach((triangle) => {
            const userData = triangle.userData;
            const originalPos = userData.originalPosition;
            const mesh = triangle.mesh;

            // 基礎同步波浪動畫
            const syncWaveX = Math.sin(this.time * waveSpeed + userData.delay) * amplitude * 0.3;
            const syncWaveY = Math.cos(this.time * waveSpeed * 0.7 + userData.delay) * amplitude * 0.2;
            const syncWaveZ = Math.sin(this.time * waveSpeed * 1.3 + userData.delay + userData.phase) * amplitude * 0.1;

            // 網格協調波浪效果 (增強流動感)
            const gridSyncX = Math.sin(this.time * 0.025 + userData.gridRow * 0.4) * 0.15;
            const gridSyncY = Math.cos(this.time * 0.02 + userData.gridCol * 0.3) * 0.12;
            const gridSyncZ = Math.sin(this.time * 0.03 + (userData.gridRow + userData.gridCol) * 0.2) * 0.08;

            // 全域流動效果 - 讓整個網格有大範圍的流動感
            const globalFlowX = Math.sin(this.time * 0.008 + userData.gridRow * 0.1) * 0.25;
            const globalFlowY = Math.cos(this.time * 0.012 + userData.gridCol * 0.15) * 0.2;
            const globalFlowZ = Math.sin(this.time * 0.01 + (userData.gridRow + userData.gridCol) * 0.05) * 0.1;

            // 對角線波浪效果 - 創造從一個角落到另一個角落的流動
            const diagonalWave = Math.sin(this.time * 0.015 + (userData.gridRow + userData.gridCol) * 0.3) * 0.18;
            const diagonalFlowX = diagonalWave * Math.cos(this.time * 0.006);
            const diagonalFlowY = diagonalWave * Math.sin(this.time * 0.006);

            // 呼吸效果 - 整體縮放
            const breatheScale = 1.0 + Math.sin(this.time * 0.02) * 0.05;

            // 滑鼠互動效果
            const mouseWorldX = this.mouse.x * 12;
            const mouseWorldY = this.mouse.y * 8;

            const distanceToMouse = Math.sqrt(
                Math.pow(originalPos.x - mouseWorldX, 2) +
                Math.pow(originalPos.y - mouseWorldY, 2)
            );

            let mouseEffectX = 0;
            let mouseEffectY = 0;
            let mouseEffectZ = 0;
            let mouseScale = 1;
            let mouseRotation = 0;

            if (distanceToMouse < mouseRadius) {
                const effect = 1 - (distanceToMouse / mouseRadius);
                const pushStrength = effect * 0.6;

                // 計算推力方向
                const dx = originalPos.x - mouseWorldX;
                const dy = originalPos.y - mouseWorldY;
                const distance = Math.sqrt(dx * dx + dy * dy) || 1;

                mouseEffectX = (dx / distance) * pushStrength;
                mouseEffectY = (dy / distance) * pushStrength;
                mouseEffectZ = effect * 0.4;
                mouseScale = 1 + effect * 0.4;
                mouseRotation = effect * Math.PI * 0.3;

                // 滑鼠互動時增加透明度
                triangle.material.opacity = 0.6;
            } else {
                // 基礎透明度 + 微妙的閃爍效果
                const twinkle = Math.sin(this.time * 0.02 + userData.delay + userData.phase) * 0.05;
                triangle.material.opacity = 0.3 + twinkle;
            }

            // 更新位置 (加入所有流動效果)
            mesh.position.set(
                originalPos.x + syncWaveX + gridSyncX + globalFlowX + diagonalFlowX + mouseEffectX,
                originalPos.y + syncWaveY + gridSyncY + globalFlowY + diagonalFlowY + mouseEffectY,
                originalPos.z + syncWaveZ + gridSyncZ + globalFlowZ + mouseEffectZ
            );

            // 更新旋轉 (加入連續的流動旋轉)
            mesh.rotation.x = mouseRotation + Math.sin(this.time * 0.01 + userData.delay) * 0.1;
            mesh.rotation.y = mouseRotation * 0.7 + Math.cos(this.time * 0.008 + userData.delay) * 0.08;
            mesh.rotation.z += 0.003 + Math.sin(this.time * 0.005 + userData.gridRow) * 0.002; // 基礎旋轉 + 流動變化

            // 更新縮放 (加入呼吸效果)
            const finalScale = mouseScale * breatheScale;
            mesh.scale.setScalar(finalScale);
        });
    }

    updateCamera() {
        // 增強的相機流動效果
        this.camera.position.x = Math.sin(this.time * 0.015) * 0.8 + Math.cos(this.time * 0.008) * 0.4;
        this.camera.position.y = Math.cos(this.time * 0.012) * 0.6 + Math.sin(this.time * 0.006) * 0.3;
        this.camera.position.z = 10 + Math.sin(this.time * 0.01) * 0.5; // 輕微的前後移動
        
        // 相機也有輕微的旋轉
        this.camera.rotation.z = Math.sin(this.time * 0.005) * 0.02;
        
        this.camera.lookAt(0, 0, 0);
    }

    updateScrollEffect() {
        const scrollY = window.scrollY;
        const scrollProgress = Math.min(scrollY / (document.documentElement.scrollHeight - window.innerHeight), 1);

        // 根據滾動位置調整整體效果
        this.triangles.forEach((triangle, index) => {
            const userData = triangle.userData;

            // 滾動時的旋轉效果
            triangle.mesh.rotation.z = userData.phase + scrollProgress * Math.PI;

            // 滾動時調整透明度 (保持白色，只改變透明度)
            triangle.material.opacity = 0.3 + scrollProgress * 0.2;
        });
    }

    createClickRipple(x, y) {
        // 轉換屏幕座標到世界座標
        const mouse = new THREE.Vector2();
        mouse.x = (x / window.innerWidth) * 2 - 1;
        mouse.y = -(y / window.innerHeight) * 2 + 1;

        const worldX = mouse.x * 12;
        const worldY = mouse.y * 8;

        // 找到最接近點擊位置的三角形，創建擴散效果
        this.triangles.forEach((triangle) => {
            const userData = triangle.userData;
            const distance = Math.sqrt(
                Math.pow(userData.originalPosition.x - worldX, 2) +
                Math.pow(userData.originalPosition.y - worldY, 2)
            );

            if (distance < 6) {
                const delay = distance * 100; // 距離越遠延遲越長
                setTimeout(() => {
                    // 暫時增強透明度效果
                    triangle.material.opacity = 0.8;
                    setTimeout(() => {
                        triangle.material.opacity = 0.3;
                    }, 300);
                }, delay);
            }
        });
    }

    onWindowResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        
        this.renderer.setSize(width, height);
        
        // 根據設備類型調整網格參數
        const isMobile = width < 768;
        this.gridSettings.rows = isMobile ? 8 : 12;
        this.gridSettings.cols = isMobile ? 12 : 18;
        this.gridSettings.spacing = isMobile ? 1.8 : 1.4;
        this.gridSettings.triangleSize = isMobile ? 0.06 : 0.075;
        
        // 重新創建網格
        this.createTriangleGrid();
    }

    pause() {
        this.isRunning = false;
    }

    resume() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.animate();
        }
    }

    // 公開方法：調整透明度
    setOpacity(opacity) {
        this.triangles.forEach(triangle => {
            triangle.material.opacity = opacity;
        });
    }

    // 公開方法：調整強度 (通過透明度實現)
    setIntensity(intensity) {
        this.triangles.forEach(triangle => {
            triangle.material.opacity = Math.min(intensity * 0.3, 1.0);
        });
    }

    // 公開方法：設置顏色 (保持白色)
    setColors(color1, color2, color3) {
        // 線框材質保持白色，此方法保留兼容性但不執行操作
        console.log('Wireframe triangles maintain white color');
    }
}

// 初始化函數
function initGridTriangleBackground() {
    if (typeof THREE === 'undefined') {
        console.warn('Three.js not loaded, retrying...');
        setTimeout(initGridTriangleBackground, 100);
        return;
    }

    const canvas = document.getElementById('triangle-canvas');
    if (!canvas) {
        console.warn('Triangle canvas not found');
        return;
    }

    // 創建網格三角形背景實例
    window.triangleBackground = new GridTriangleBackground();
    
    console.log('Grid Triangle Background initialized');
    console.log('Grid dimensions:', window.triangleBackground.gridSettings);
}

// 如果頁面已載入則立即初始化，否則等待載入
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGridTriangleBackground);
} else {
    initGridTriangleBackground();
}