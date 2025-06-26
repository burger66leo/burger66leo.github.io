/**
 * 三角形互動背景效果
 * 基於您的設計要求重新實現的大型幾何三角形背景
 */

class TriangleInteractiveBackground {
    constructor() {
        this.canvas = document.getElementById('triangle-canvas');
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.triangles = [];
        this.mouse = { x: 0, y: 0 };
        this.clock = new THREE.Clock();
        this.raycaster = new THREE.Raycaster();
        this.mouseVector = new THREE.Vector2();
        this.isRunning = true;

        this.init();
        this.createTriangles();
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
        this.camera.position.z = 5;

        // 渲染器設置
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            alpha: true,
            antialias: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setClearColor(0x000000, 0);

        // 環境光
        const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        this.scene.add(ambientLight);

        // 點光源
        const pointLight = new THREE.PointLight(0xffffff, 0.8, 100);
        pointLight.position.set(10, 10, 10);
        this.scene.add(pointLight);
    }

    createTriangles() {
        const triangleCount = window.innerWidth < 768 ? 25 : 40;

        for (let i = 0; i < triangleCount; i++) {
            const triangle = this.createSingleTriangle(i);
            this.triangles.push(triangle);
            this.scene.add(triangle);
        }
    }

    createSingleTriangle(index) {
        // 創建三角形幾何體
        const geometry = new THREE.BufferGeometry();

        // 創建大型三角形
        const size = 1.5 + Math.random() * 2.5; // 更大的三角形
        const height = size * Math.sqrt(3) / 2;
        
        const vertices = new Float32Array([
            0, height * 0.67, 0,                    // 頂點
            -size * 0.5, -height * 0.33, 0,        // 左下
            size * 0.5, -height * 0.33, 0          // 右下
        ]);

        // UV 坐標
        const uvs = new Float32Array([
            0.5, 1,    // 頂點
            0, 0,      // 左下
            1, 0       // 右下
        ]);

        geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));

        // 創建材質
        const material = this.createTriangleMaterial();

        // 創建網格
        const triangle = new THREE.Mesh(geometry, material);

        // 分佈式位置 - 覆蓋整個視野
        triangle.position.set(
            (Math.random() - 0.5) * 25,
            (Math.random() - 0.5) * 20,
            (Math.random() - 0.5) * 8 - 2
        );

        // 隨機旋轉
        triangle.rotation.set(
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 2
        );

        // 儲存初始資料
        triangle.userData = {
            originalPosition: triangle.position.clone(),
            originalRotation: triangle.rotation.clone(),
            speed: 0.3 + Math.random() * 0.7,
            amplitude: 0.8 + Math.random() * 1.2,
            index: index,
            baseScale: 0.8 + Math.random() * 0.4
        };

        triangle.scale.setScalar(triangle.userData.baseScale);

        return triangle;
    }

    createTriangleMaterial() {
        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                mousePosition: { value: new THREE.Vector2(0, 0) },
                color1: { value: new THREE.Color(0xfacf20) }, // 金色
                color2: { value: new THREE.Color(0xff6b35) }, // 橙色
                color3: { value: new THREE.Color(0x4a90e2) }, // 藍色
                opacity: { value: 0.6 },
                intensity: { value: 1.0 }
            },
            vertexShader: `
                varying vec2 vUv;
                varying vec3 vPosition;
                varying vec3 vWorldPosition;
                uniform float time;
                uniform vec2 mousePosition;
                
                void main() {
                    vUv = uv;
                    vPosition = position;
                    
                    vec3 newPosition = position;
                    
                    // 波動效果
                    float wave = sin(time * 0.5 + position.x * 0.8 + position.y * 0.6) * 0.2;
                    newPosition.z += wave;
                    
                    // 滑鼠互動變形
                    vec2 worldMouse = mousePosition * 10.0;
                    float mouseDistance = length(worldMouse - vec2(newPosition.x, newPosition.y));
                    float mouseEffect = 1.0 / (1.0 + mouseDistance * 0.2);
                    newPosition.z += mouseEffect * 0.8;
                    
                    // 頂點膨脹效果
                    float distanceFromCenter = length(position.xy);
                    newPosition.xy *= 1.0 + sin(time * 2.0 + distanceFromCenter * 3.0) * 0.05;
                    
                    vec4 worldPosition = modelMatrix * vec4(newPosition, 1.0);
                    vWorldPosition = worldPosition.xyz;
                    
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
                }
            `,
            fragmentShader: `
                varying vec2 vUv;
                varying vec3 vPosition;
                varying vec3 vWorldPosition;
                uniform float time;
                uniform vec2 mousePosition;
                uniform vec3 color1;
                uniform vec3 color2;
                uniform vec3 color3;
                uniform float opacity;
                uniform float intensity;
                
                void main() {
                    // 三角形重心座標
                    vec2 center = vec2(0.5, 0.33);
                    float distanceFromCenter = length(vUv - center);
                    
                    // 邊緣漸變
                    float edge = 1.0 - smoothstep(0.0, 0.6, distanceFromCenter);
                    
                    // 動態顏色混合
                    float colorMix1 = sin(time * 0.3 + vWorldPosition.x * 0.1) * 0.5 + 0.5;
                    float colorMix2 = cos(time * 0.2 + vWorldPosition.y * 0.1) * 0.5 + 0.5;
                    float colorMix3 = sin(time * 0.4 + vWorldPosition.z * 0.2) * 0.5 + 0.5;
                    
                    vec3 color = mix(color1, color2, colorMix1);
                    color = mix(color, color3, colorMix2 * 0.4);
                    
                    // 內部紋理
                    float pattern = sin(vUv.x * 10.0 + time) * sin(vUv.y * 8.0 + time * 0.7);
                    color += pattern * 0.1 * intensity;
                    
                    // 邊緣光暈
                    float glow = edge * (1.0 + sin(time * 3.0 + distanceFromCenter * 8.0) * 0.3);
                    color += glow * color1 * 0.3;
                    
                    // 滑鼠互動光暈
                    vec2 worldMouse = mousePosition * 5.0;
                    float mouseDistance = length(worldMouse - vWorldPosition.xy);
                    float mouseGlow = exp(-mouseDistance * 0.5) * 0.5;
                    color += mouseGlow * color2;
                    
                    // 動態亮度變化
                    float brightness = 0.8 + sin(time * 1.5 + vWorldPosition.z * 0.3) * 0.2;
                    color *= brightness * intensity;
                    
                    // 透明度計算
                    float alpha = edge * opacity;
                    
                    // 中心增強
                    float centerGlow = 1.0 - smoothstep(0.0, 0.3, distanceFromCenter);
                    alpha += centerGlow * 0.1;
                    
                    gl_FragColor = vec4(color, alpha);
                }
            `,
            transparent: true,
            side: THREE.DoubleSide,
            blending: THREE.NormalBlending
        });

        return material;
    }

    addEventListeners() {
        // 滑鼠移動事件
        window.addEventListener('mousemove', (event) => {
            this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

            this.updateMouseInteraction();
        });

        // 點擊事件
        window.addEventListener('click', (event) => {
            const x = (event.clientX / window.innerWidth) * 2 - 1;
            const y = -(event.clientY / window.innerHeight) * 2 + 1;

            this.createClickRipple(x, y);
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
    }

    updateMouseInteraction() {
        this.triangles.forEach((triangle, index) => {
            const userData = triangle.userData;

            // 計算滑鼠與三角形的距離
            const distance = Math.hypot(
                this.mouse.x * 10 - triangle.position.x,
                this.mouse.y * 10 - triangle.position.y
            );

            // 滑鼠靠近時的效果
            if (distance < 5) {
                const effect = 1 - (distance / 5);

                // 使用 GSAP 平滑動畫
                if (window.gsap) {
                    // 旋轉效果
                    gsap.to(triangle.rotation, {
                        x: userData.originalRotation.x + this.mouse.y * 0.3,
                        y: userData.originalRotation.y + this.mouse.x * 0.3,
                        duration: 0.4,
                        ease: "power2.out"
                    });

                    // 縮放效果
                    gsap.to(triangle.scale, {
                        x: userData.baseScale * (1 + effect * 0.3),
                        y: userData.baseScale * (1 + effect * 0.3),
                        z: userData.baseScale * (1 + effect * 0.3),
                        duration: 0.4,
                        ease: "power2.out"
                    });
                } else {
                    // 備用非GSAP動畫
                    triangle.rotation.x = userData.originalRotation.x + this.mouse.y * 0.3;
                    triangle.rotation.y = userData.originalRotation.y + this.mouse.x * 0.3;
                    triangle.scale.setScalar(userData.baseScale * (1 + effect * 0.3));
                }

                // 更新材質的滑鼠位置
                triangle.material.uniforms.mousePosition.value.set(
                    this.mouse.x,
                    this.mouse.y
                );
                triangle.material.uniforms.intensity.value = 1.5;
            } else {
                // 恢復原始狀態
                if (window.gsap) {
                    gsap.to(triangle.rotation, {
                        x: userData.originalRotation.x,
                        y: userData.originalRotation.y,
                        duration: 0.6,
                        ease: "power2.out"
                    });

                    gsap.to(triangle.scale, {
                        x: userData.baseScale,
                        y: userData.baseScale,
                        z: userData.baseScale,
                        duration: 0.6,
                        ease: "power2.out"
                    });
                }
                
                triangle.material.uniforms.intensity.value = 1.0;
            }
        });
    }

    createClickRipple(x, y) {
        const rippleCount = 6;
        const worldPosition = new THREE.Vector3(x * 10, y * 10, 0);

        for (let i = 0; i < rippleCount; i++) {
            const rippleTriangle = this.createSingleTriangle(-1);
            rippleTriangle.position.copy(worldPosition);
            rippleTriangle.scale.set(0.1, 0.1, 0.1);

            // 隨機方向
            const angle = (i / rippleCount) * Math.PI * 2;
            const distance = 3 + Math.random() * 4;
            const targetPosition = new THREE.Vector3(
                worldPosition.x + Math.cos(angle) * distance,
                worldPosition.y + Math.sin(angle) * distance,
                worldPosition.z + (Math.random() - 0.5) * 3
            );

            this.scene.add(rippleTriangle);

            if (window.gsap) {
                // 擴散動畫
                gsap.to(rippleTriangle.position, {
                    x: targetPosition.x,
                    y: targetPosition.y,
                    z: targetPosition.z,
                    duration: 2.0,
                    ease: "power2.out"
                });

                gsap.to(rippleTriangle.scale, {
                    x: 2.0,
                    y: 2.0,
                    z: 2.0,
                    duration: 2.0,
                    ease: "power2.out"
                });

                gsap.to(rippleTriangle.rotation, {
                    x: "+=6.28",
                    y: "+=6.28",
                    z: "+=6.28",
                    duration: 2.0,
                    ease: "power2.out"
                });

                // 淡出效果
                gsap.to(rippleTriangle.material.uniforms.opacity, {
                    value: 0,
                    duration: 2.0,
                    ease: "power2.out",
                    onComplete: () => {
                        this.scene.remove(rippleTriangle);
                    }
                });
            } else {
                // 備用動畫 - 簡單的線性變化
                setTimeout(() => {
                    this.scene.remove(rippleTriangle);
                }, 2000);
            }
        }
    }

    updateScrollEffect() {
        const scrollY = window.scrollY;
        const scrollProgress = Math.min(scrollY / (document.body.scrollHeight - window.innerHeight), 1);

        this.triangles.forEach((triangle, index) => {
            const userData = triangle.userData;

            // 滾動時的旋轉效果
            triangle.rotation.z = userData.originalRotation.z + scrollProgress * Math.PI;

            // 滾動時的位置變化
            triangle.position.y = userData.originalPosition.y + scrollProgress * 3;
            triangle.position.x = userData.originalPosition.x + scrollProgress * 2 * Math.sin(index);

            // 滾動時的顏色變化
            const hue = (scrollProgress * 0.3 + index * 0.1) % 1;
            
            if (scrollProgress < 0.33) {
                // 頂部區域：金色主題
                triangle.material.uniforms.color1.value.setHex(0xfacf20);
                triangle.material.uniforms.color2.value.setHex(0xff6b35);
                triangle.material.uniforms.color3.value.setHex(0x4a90e2);
            } else if (scrollProgress < 0.66) {
                // 中部區域：藍色主題
                triangle.material.uniforms.color1.value.setHex(0x4a90e2);
                triangle.material.uniforms.color2.value.setHex(0x7b68ee);
                triangle.material.uniforms.color3.value.setHex(0xfacf20);
            } else {
                // 底部區域：橙色主題
                triangle.material.uniforms.color1.value.setHex(0xff6b35);
                triangle.material.uniforms.color2.value.setHex(0xfacf20);
                triangle.material.uniforms.color3.value.setHex(0x4a90e2);
            }

            // 滾動時調整透明度
            triangle.material.uniforms.opacity.value = 0.6 + scrollProgress * 0.2;
        });
    }

    animate() {
        if (!this.isRunning) return;

        const elapsedTime = this.clock.getElapsedTime();

        // 更新所有三角形
        this.triangles.forEach((triangle, index) => {
            const userData = triangle.userData;

            // 基礎動畫
            triangle.rotation.x += 0.005 * userData.speed;
            triangle.rotation.y += 0.008 * userData.speed;

            // 飄浮效果
            triangle.position.y = userData.originalPosition.y +
                Math.sin(elapsedTime * userData.speed + userData.index) * userData.amplitude * 0.5;

            triangle.position.x = userData.originalPosition.x +
                Math.cos(elapsedTime * userData.speed * 0.7 + userData.index) * userData.amplitude * 0.3;

            triangle.position.z = userData.originalPosition.z +
                Math.sin(elapsedTime * userData.speed * 0.5 + userData.index * 2) * userData.amplitude * 0.3;

            // 更新材質時間
            triangle.material.uniforms.time.value = elapsedTime;
        });

        // 相機輕微移動
        this.camera.position.x = Math.sin(elapsedTime * 0.1) * 0.5;
        this.camera.position.y = Math.cos(elapsedTime * 0.15) * 0.3;

        // 渲染
        this.renderer.render(this.scene, this.camera);

        // 繼續動畫
        requestAnimationFrame(() => this.animate());
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    pause() {
        this.isRunning = false;
    }

    resume() {
        this.isRunning = true;
        this.animate();
    }

    // 公開方法
    setIntensity(intensity) {
        this.triangles.forEach(triangle => {
            triangle.material.uniforms.intensity.value = intensity;
        });
    }

    setOpacity(opacity) {
        this.triangles.forEach(triangle => {
            triangle.material.uniforms.opacity.value = opacity;
        });
    }

    setColors(color1, color2, color3) {
        this.triangles.forEach(triangle => {
            triangle.material.uniforms.color1.value.setHex(color1);
            triangle.material.uniforms.color2.value.setHex(color2);
            triangle.material.uniforms.color3.value.setHex(color3);
        });
    }
}

// 初始化函數
function initTriangleInteractiveBackground() {
    if (typeof THREE === 'undefined') {
        console.warn('Three.js not loaded, retrying...');
        setTimeout(initTriangleInteractiveBackground, 100);
        return;
    }

    const canvas = document.getElementById('triangle-canvas');
    if (!canvas) {
        console.warn('Triangle canvas not found');
        return;
    }

    // 創建三角形互動背景實例
    window.triangleBackground = new TriangleInteractiveBackground();
    
    console.log('Triangle interactive background initialized');
    console.log('Triangles created:', window.triangleBackground.triangles.length);
    console.log('Canvas:', window.triangleBackground.canvas);
    console.log('Scene:', window.triangleBackground.scene);
}

// 如果頁面已載入則立即初始化，否則等待載入
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTriangleInteractiveBackground);
} else {
    initTriangleInteractiveBackground();
}