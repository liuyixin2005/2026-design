<template>
    <div ref="containerRef" class="farm-scene">
        <div class="scene-hint">
            <span>🖱️ 拖拽旋转视角</span>
            <span>🔍 滚轮缩放</span>
            <span>🌾 点击地块进行操作</span>
        </div>
    </div>
</template>

<script setup>
    import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
    import * as THREE from 'three'
    import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
    import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

    const props = defineProps({
        selectedTool: {
            type: String,
            default: 'seed'
        }
    })

    const emit = defineEmits(['toast', 'plot-update', 'summary-update'])

    const containerRef = ref(null)

    let scene = null
    let camera = null
    let renderer = null
    let controls = null
    let clock = null
    let raycaster = null
    let animationId = null
    let decorativeGroup = null
    let gltfLoader = null

    const pointer = new THREE.Vector2()
    let currentTool = props.selectedTool

    const farmPlots = []
    const clickableMeshes = []
    const modelCache = new Map()

    // 全局水滴粒子
    const activeWaterDrops = []

    watch(
        () => props.selectedTool,
        (val) => {
            currentTool = val
            speakToolGuide(val)
        }
    )

    onMounted(() => {
        initScene()
        initWorld()
        initFarmPlots()
        bindEvents()
        emitSummary()
        animate()
        speak('欢迎来到小小农场主，先选择工具，再点击农田开始操作吧！')
    })

    onBeforeUnmount(() => {
        window.removeEventListener('resize', handleResize)
        containerRef.value?.removeEventListener('pointerdown', handlePointerDown)

        if (animationId) cancelAnimationFrame(animationId)

        if (controls) controls.dispose()
        if (renderer) renderer.dispose()

        activeWaterDrops.forEach((drop) => {
            scene?.remove(drop.mesh)
        })
        activeWaterDrops.length = 0

        if (containerRef.value && renderer?.domElement && containerRef.value.contains(renderer.domElement)) {
            containerRef.value.removeChild(renderer.domElement)
        }
    })

    function initScene() {
        scene = new THREE.Scene()
        scene.background = new THREE.Color(0xbde7ff)
        scene.fog = new THREE.FogExp2(0xbde7ff, 0.01)

        camera = new THREE.PerspectiveCamera(
            50,
            containerRef.value.clientWidth / containerRef.value.clientHeight,
            0.1,
            300
        )
        camera.position.set(18, 15, 24)

        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
        renderer.setSize(containerRef.value.clientWidth, containerRef.value.clientHeight)
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        renderer.shadowMap.enabled = true
        renderer.shadowMap.type = THREE.PCFShadowMap
        containerRef.value.appendChild(renderer.domElement)

        controls = new OrbitControls(camera, renderer.domElement)
        controls.enableDamping = true
        controls.dampingFactor = 0.06
        controls.target.set(2, 1.8, 0)
        controls.maxPolarAngle = Math.PI / 2.08
        controls.minDistance = 10
        controls.maxDistance = 45

        clock = new THREE.Clock()
        raycaster = new THREE.Raycaster()
        gltfLoader = new GLTFLoader()

        scene.add(new THREE.AmbientLight(0x617256, 0.78))

        const sunLight = new THREE.DirectionalLight(0xfff3cf, 1.4)
        sunLight.position.set(24, 28, 10)
        sunLight.castShadow = true
        sunLight.shadow.mapSize.width = 2048
        sunLight.shadow.mapSize.height = 2048
        const d = 35
        sunLight.shadow.camera.left = -d
        sunLight.shadow.camera.right = d
        sunLight.shadow.camera.top = d
        sunLight.shadow.camera.bottom = -d
        sunLight.shadow.camera.near = 1
        sunLight.shadow.camera.far = 120
        sunLight.shadow.bias = -0.0005
        scene.add(sunLight)

        const fillLight = new THREE.PointLight(0xffddb2, 0.45)
        fillLight.position.set(-8, 8, 10)
        scene.add(fillLight)

        const coolLight = new THREE.PointLight(0xb6dbff, 0.25)
        coolLight.position.set(12, 6, -10)
        scene.add(coolLight)
    }

    function initWorld() {
        decorativeGroup = new THREE.Group()
        scene.add(decorativeGroup)

        const ground = new THREE.Mesh(
            new THREE.CircleGeometry(45, 72),
            new THREE.MeshStandardMaterial({
                color: 0x72b867,
                roughness: 0.96
            })
        )
        ground.rotation.x = -Math.PI / 2
        ground.receiveShadow = true
        scene.add(ground)

        const grid = new THREE.GridHelper(90, 40, 0x89b387, 0x5b7e58)
        grid.position.y = 0.02
        scene.add(grid)

        addGrassPatches()
        createClouds()

        createHouse(7, 5)
        createWindmill(1, 10)
        createLake(-7, 6)

        addTree(-7, -2, 1.2)
        addTree(-8, 4, 1)
        addTree(10, -4, 1.1)
        addTree(2, -8, 1)
        addTree(11, 4, 1.05)
        addTree(-3, 9, 0.95)

        createAnimal('chicken', 8.5, -1.5)
        createAnimal('sheep', -5.5, -5.5)
        createAnimal('pig', 10, 2)
    }

    function addGrassPatches() {
        const grassGroup = new THREE.Group()
        for (let i = 0; i < 180; i++) {
            const blade = new THREE.Mesh(
                new THREE.CylinderGeometry(0.015, 0.03, 0.12 + Math.random() * 0.18, 5),
                new THREE.MeshStandardMaterial({ color: 0x4f8a43, roughness: 0.9 })
            )
            const angle = Math.random() * Math.PI * 2
            const radius = 5 + Math.random() * 28
            blade.position.set(Math.cos(angle) * radius, 0.08, Math.sin(angle) * radius)
            blade.castShadow = true
            grassGroup.add(blade)
        }
        decorativeGroup.add(grassGroup)
    }

    function createClouds() {
        const cloudPositions = [
            [-10, 9, -8],
            [6, 8, 10],
            [15, 7, -2]
        ]

        cloudPositions.forEach(([x, y, z], idx) => {
            const g = new THREE.Group()
            g.userData.isCloud = true
            g.userData.speed = 0.003 + idx * 0.0008

            const mat = new THREE.MeshStandardMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.92
            })

            const s1 = new THREE.Mesh(new THREE.SphereGeometry(0.7, 12, 12), mat)
            const s2 = new THREE.Mesh(new THREE.SphereGeometry(0.58, 12, 12), mat)
            const s3 = new THREE.Mesh(new THREE.SphereGeometry(0.48, 12, 12), mat)

            s2.position.set(0.75, 0.1, 0.15)
            s3.position.set(-0.65, 0.15, -0.1)

            g.add(s1, s2, s3)
            g.position.set(x, y, z)
            decorativeGroup.add(g)
        })
    }

    async function createHouse(x, z) {
        const houseModel = await safeLoadModel('/models/farm/house.glb')

        if (houseModel) {
            applyModelShadow(houseModel)

            const result = fitModelToWorld(houseModel, {
                targetSize: 6,
                position: new THREE.Vector3(x, 0, z),
                rotation: new THREE.Euler(0, Math.PI, 0)
            })

            console.log('房屋模型尺寸修正后：', result.size, '缩放倍数：', result.scale)
            decorativeGroup.add(houseModel)
            return
        }

        const g = new THREE.Group()

        const body = new THREE.Mesh(
            new THREE.BoxGeometry(3.8, 2.8, 3.8),
            new THREE.MeshStandardMaterial({ color: 0xd6b07a, roughness: 0.8 })
        )
        body.position.y = 1.4
        body.castShadow = true
        body.receiveShadow = true
        g.add(body)

        const roof = new THREE.Mesh(
            new THREE.ConeGeometry(3.1, 1.8, 4),
            new THREE.MeshStandardMaterial({ color: 0xa54939, roughness: 0.85 })
        )
        roof.position.y = 3.7
        roof.rotation.y = Math.PI / 4
        roof.castShadow = true
        g.add(roof)

        g.position.set(x, 0, z)
        decorativeGroup.add(g)
    }

    async function createWindmill(x, z) {
        const windmillModel = await safeLoadModel('/models/farm/Windmill.glb')

        if (windmillModel) {
            applyModelShadow(windmillModel)

            const result = fitModelToWorld(windmillModel, {
                targetSize: 4.5,
                position: new THREE.Vector3(x, 0, z),
                rotation: new THREE.Euler(0, Math.PI, 0)
            })

            console.log('风车模型尺寸修正后：', result.size, '缩放倍数：', result.scale)
            decorativeGroup.add(windmillModel)
            return
        }

        const g = new THREE.Group()
        g.userData.isWindmill = true

        const tower = new THREE.Mesh(
            new THREE.CylinderGeometry(0.8, 1.0, 4.0, 16),
            new THREE.MeshStandardMaterial({ color: 0xcdb38c })
        )
        tower.position.y = 2
        tower.castShadow = true
        tower.receiveShadow = true
        g.add(tower)

        const top = new THREE.Mesh(
            new THREE.ConeGeometry(1.0, 0.9, 8),
            new THREE.MeshStandardMaterial({ color: 0x9c7e5e })
        )
        top.position.y = 4.3
        top.castShadow = true
        g.add(top)

        const bladeGroup = new THREE.Group()
        bladeGroup.position.y = 4.5
        bladeGroup.userData.isBlade = true

        for (let i = 0; i < 4; i++) {
            const blade = new THREE.Mesh(
                new THREE.BoxGeometry(2.3, 0.1, 0.35),
                new THREE.MeshStandardMaterial({ color: 0xe6dbc8 })
            )
            blade.position.x = 1.05
            blade.rotation.z = i * (Math.PI / 2)
            blade.castShadow = true
            bladeGroup.add(blade)
        }

        g.add(bladeGroup)
        g.position.set(x, 0, z)
        decorativeGroup.add(g)
    }

    function createLake(x, z) {
        const lake = new THREE.Mesh(
            new THREE.CylinderGeometry(3.8, 4.1, 0.2, 40),
            new THREE.MeshStandardMaterial({
                color: 0x439de8,
                transparent: true,
                opacity: 0.82,
                roughness: 0.2
            })
        )
        lake.position.set(x, 0.05, z)
        lake.receiveShadow = true
        lake.userData.isLake = true
        decorativeGroup.add(lake)
    }

    function addTree(x, z, s = 1) {
        const g = new THREE.Group()

        const trunk = new THREE.Mesh(
            new THREE.CylinderGeometry(0.22 * s, 0.28 * s, 2 * s, 8),
            new THREE.MeshStandardMaterial({ color: 0x7c4b28 })
        )
        trunk.position.y = 1 * s
        trunk.castShadow = true
        trunk.receiveShadow = true
        g.add(trunk)

        const crown1 = new THREE.Mesh(
            new THREE.SphereGeometry(0.95 * s, 12, 12),
            new THREE.MeshStandardMaterial({ color: 0x3f7c3b })
        )
        crown1.position.y = 2.2 * s
        crown1.castShadow = true
        g.add(crown1)

        const crown2 = new THREE.Mesh(
            new THREE.SphereGeometry(0.75 * s, 12, 12),
            new THREE.MeshStandardMaterial({ color: 0x4a8d44 })
        )
        crown2.position.set(0.45 * s, 2.45 * s, 0.12 * s)
        crown2.castShadow = true
        g.add(crown2)

        g.position.set(x, 0, z)
        decorativeGroup.add(g)
    }

    function createAnimal(type, x, z) {
        const g = new THREE.Group()
        g.userData.type = type

        if (type === 'chicken') {
            const body = new THREE.Mesh(
                new THREE.SphereGeometry(0.34, 12, 12),
                new THREE.MeshStandardMaterial({ color: 0xffcc69 })
            )
            body.position.y = 0.36
            body.castShadow = true
            g.add(body)

            const head = new THREE.Mesh(
                new THREE.SphereGeometry(0.2, 12, 12),
                new THREE.MeshStandardMaterial({ color: 0xffb445 })
            )
            head.position.set(0.26, 0.56, 0)
            g.add(head)
        }

        if (type === 'sheep') {
            const body = new THREE.Mesh(
                new THREE.SphereGeometry(0.48, 12, 12),
                new THREE.MeshStandardMaterial({ color: 0xefefef })
            )
            body.position.y = 0.48
            body.castShadow = true
            g.add(body)

            const head = new THREE.Mesh(
                new THREE.SphereGeometry(0.26, 12, 12),
                new THREE.MeshStandardMaterial({ color: 0xd8d8d8 })
            )
            head.position.set(0.42, 0.62, 0)
            g.add(head)
        }

        if (type === 'pig') {
            const body = new THREE.Mesh(
                new THREE.SphereGeometry(0.48, 12, 12),
                new THREE.MeshStandardMaterial({ color: 0xffb0a0 })
            )
            body.position.y = 0.48
            body.castShadow = true
            g.add(body)

            const head = new THREE.Mesh(
                new THREE.SphereGeometry(0.3, 12, 12),
                new THREE.MeshStandardMaterial({ color: 0xff9d8d })
            )
            head.position.set(0.48, 0.58, 0)
            g.add(head)
        }

        g.position.set(x, 0, z)
        decorativeGroup.add(g)
    }

    function initFarmPlots() {
        const startX = -2.8
        const startZ = -4.2
        let id = 1

        for (let r = 0; r < 2; r++) {
            for (let c = 0; c < 3; c++) {
                const plot = createPlot(startX + c * 3.1, startZ + r * 3.1, id++)
                farmPlots.push(plot)
            }
        }
    }

    function createPlot(x, z, id) {
        const group = new THREE.Group()
        group.position.set(x, 0, z)

        const border = new THREE.Mesh(
            new THREE.BoxGeometry(2.5, 0.28, 2.5),
            new THREE.MeshStandardMaterial({ color: 0x8a5d2e, roughness: 0.95 })
        )
        border.position.y = 0.14
        border.castShadow = true
        border.receiveShadow = true
        group.add(border)

        const soil = new THREE.Mesh(
            new THREE.BoxGeometry(2.1, 0.18, 2.1),
            new THREE.MeshStandardMaterial({ color: 0x7a4a23, roughness: 0.96 })
        )
        soil.position.y = 0.22
        soil.castShadow = true
        soil.receiveShadow = true
        group.add(soil)

        const ridges = new THREE.Group()
        for (let i = 0; i < 4; i++) {
            const ridge = new THREE.Mesh(
                new THREE.BoxGeometry(1.8, 0.08, 0.22),
                new THREE.MeshStandardMaterial({ color: 0x6b3f1c, roughness: 0.95 })
            )
            ridge.position.set(0, 0.35, -0.6 + i * 0.4)
            ridge.castShadow = true
            ridge.receiveShadow = true
            ridges.add(ridge)
        }
        group.add(ridges)

        const cropHolder = new THREE.Group()
        cropHolder.position.y = 0.32
        group.add(cropHolder)

        const hitMesh = new THREE.Mesh(
            new THREE.BoxGeometry(2.3, 0.8, 2.3),
            new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 })
        )
        hitMesh.position.y = 0.45
        group.add(hitMesh)

        scene.add(group)

        const plot = {
            id,
            group,
            soil,
            cropHolder,
            hitMesh,
            cropType: 'none',
            stage: 0,
            moisture: 25,
            fertility: 60,
            growth: 0,
            hasWeeds: false,
            hasPests: false,
            toolAnim: null,
            lowMoistureWarned: false,
            matureNotified: false,
            cropVersion: 0
        }

        hitMesh.userData.plotRef = plot
        clickableMeshes.push(hitMesh)

        updatePlotVisual(plot)
        return plot
    }

    function bindEvents() {
        window.addEventListener('resize', handleResize)
        containerRef.value.addEventListener('pointerdown', handlePointerDown)
    }

    function handleResize() {
        if (!containerRef.value || !camera || !renderer) return
        camera.aspect = containerRef.value.clientWidth / containerRef.value.clientHeight
        camera.updateProjectionMatrix()
        renderer.setSize(containerRef.value.clientWidth, containerRef.value.clientHeight)
    }

    function handlePointerDown(event) {
        const rect = containerRef.value.getBoundingClientRect()
        pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
        pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

        raycaster.setFromCamera(pointer, camera)
        const intersects = raycaster.intersectObjects(clickableMeshes, false)
        if (!intersects.length) return

        const plot = intersects[0].object.userData.plotRef
        if (!plot) return

        emit('plot-update', clonePlot(plot))
        applyTool(plot)
    }

    function applyTool(plot) {
        if (currentTool === 'seed') {
            if (plot.stage !== 0) {
                toast(`地块 ${plot.id} 已经种过作物了`)
                return
            }

           const cropPool = ['wheat', 'corn', 'carrot']
            plot.cropType = cropPool[Math.floor(Math.random() * cropPool.length)]
            plot.stage = 1
            plot.growth = 10
            plot.moisture = 35
            plot.fertility = Math.max(plot.fertility, 55)
            plot.hasWeeds = false
            plot.hasPests = false
            plot.lowMoistureWarned = false
            plot.matureNotified = false

            showToolActionModel(plot, 'seed')
            createSeedAnimation(plot)
            toast(`播种成功！地块 ${plot.id} 种下了${cropName(plot.cropType)}，要记得照顾它哦！`, true)
            updatePlotVisual(plot)
            return
        }

        if (currentTool === 'water') {
            emit('plot-update', clonePlot(plot))

            if (plot.stage === 0) {
                toast(`地块 ${plot.id} 还是空地，先播种吧`)
                return
            }

            if (plot.stage >= 4 || plot.growth >= 90) {
                toast(`地块 ${plot.id} 已经成熟啦，可以直接收割，不需要再浇水了！`, true)
                return
            }

            plot.moisture = Math.min(100, plot.moisture + 35)
            plot.lowMoistureWarned = false

            awaitShowTool(plot, 'water')

            toast(`浇水完成！地块 ${plot.id} 的禾苗宝宝喝饱啦！`, true)
            updatePlotVisual(plot)
            return
        }

        if (currentTool === 'fertilize') {
            if (plot.stage === 0) {
                toast(`空地不能施肥，先播种哦`)
                return
            }

            plot.fertility = Math.min(100, plot.fertility + 20)

            showToolActionModel(plot, 'fertilize')
            createFertilizeAnimation(plot)
            toast(`施肥成功！地块 ${plot.id} 变得更有营养啦！`, true)
            updatePlotVisual(plot)
            return
        }

        if (currentTool === 'weed') {
            if (!plot.hasWeeds) {
                toast(`地块 ${plot.id} 没有杂草`)
                return
            }
            plot.hasWeeds = false
            toast(`杂草清理完成！地块 ${plot.id} 又变干净啦！`, true)
            updatePlotVisual(plot)
            return
        }

        if (currentTool === 'pest') {
            if (!plot.hasPests) {
                toast(`地块 ${plot.id} 没有害虫`)
                return
            }
            plot.hasPests = false
            toast(`害虫已经被赶跑啦！地块 ${plot.id} 安全了！`, true)
            updatePlotVisual(plot)
            return
        }

        if (currentTool === 'harvest') {
            if (plot.stage !== 4) {
                toast(`地块 ${plot.id} 还没有成熟，不能收割`)
                return
            }

            showToolActionModel(plot, 'harvest')
            createHarvestAnimation(plot)
            const harvestedCrop = plot.cropType

            plot.cropType = 'none'
            plot.stage = 0
            plot.growth = 0
            plot.moisture = 30
            plot.hasWeeds = false
            plot.hasPests = false
            plot.lowMoistureWarned = false
            plot.matureNotified = false

            toast(`收获啦！地块 ${plot.id} 的${cropName(harvestedCrop)}已经成功收进仓库啦！`, true)
            updatePlotVisual(plot)
        }
    }

    function awaitShowTool(plot, tool) {
        showToolActionModel(plot, tool).catch((err) => {
            console.error('工具模型显示失败：', err)
        })
    }

    function updatePlotVisual(plot) {
        plot.soil.material = new THREE.MeshStandardMaterial({
            color: plot.moisture >= 50 ? 0x5f3818 : 0x7a4a23,
            roughness: 0.94
        })

        plot.cropVersion += 1
        attachCropModel(plot, plot.cropVersion)

        emit('plot-update', clonePlot(plot))
        emitSummary()
    }

    async function attachCropModel(plot, version = 0) {
        while (plot.cropHolder.children.length) {
            plot.cropHolder.remove(plot.cropHolder.children[0])
        }

        if (plot.stage <= 0 || plot.cropType === 'none') return

        const modelMap = {
            wheat: '/models/farm/crops/wheat_cluster.glb',
            corn: '/models/farm/crops/corn_cluster.glb',
            carrot: '/models/farm/crops/carrot_cluster.glb'
        }

        const url = modelMap[plot.cropType]

        // 不存在 glb 时退回程序模型
        if (!url) {
            const crop = createCropPrimitive(plot.cropType, Math.min(plot.stage, 4))
            plot.cropHolder.add(crop)
            return
        }

        const baseModel = await safeLoadModel(url)

        if (version && version !== plot.cropVersion) return

        if (!baseModel) {
            const crop = createCropPrimitive(plot.cropType, Math.min(plot.stage, 4))
            plot.cropHolder.add(crop)
            return
        }

        applyModelShadow(baseModel)

        // ---------- 1. 统一基础尺寸 ----------
        const rawBox = new THREE.Box3().setFromObject(baseModel)
        const rawSize = new THREE.Vector3()
        rawBox.getSize(rawSize)
        const maxAxis = Math.max(rawSize.x, rawSize.y, rawSize.z)

        const normalizedSizeMap = {
            wheat: 0.42,
            corn: 0.50,
            carrot: 0.34
        }

        const normalizedSize = normalizedSizeMap[plot.cropType] || 0.42
        const normalizeScale = normalizedSize / maxAxis
        baseModel.scale.setScalar(normalizeScale)

        // ---------- 2. 阶段控制：单簇大小 ----------
        const singleScaleMap = {
            1: 0.18, // 播种
            2: 0.32, // 发芽
            3: 0.52, // 幼苗
            4: 0.78, // 生长中
            5: 1.05, // 茂盛
            6: 1.28  // 成熟
        }

        // ---------- 3. 阶段控制：一块地里放多少簇 ----------
        const clusterCountMap = {
            1: 1,
            2: 1,
            3: 2,
            4: 4,
            5: 6,
            6: 8
        }

        const singleScale = singleScaleMap[plot.stage] || 1
        const clusterCount = clusterCountMap[plot.stage] || 1

        // ---------- 4. 不同作物覆盖范围 ----------
        const spreadMap = {
            wheat: 0.72,
            corn: 0.58,
            carrot: 0.52
        }

        const spread = spreadMap[plot.cropType] || 0.6

        // ---------- 5. 多簇摆放 ----------
        for (let i = 0; i < clusterCount; i++) {
            const model = baseModel.clone(true)

            model.traverse((obj) => {
                if (obj.isMesh) {
                    obj.castShadow = true
                    obj.receiveShadow = true
                }
            })

            model.scale.multiplyScalar(singleScale)

            // 重新算包围盒，保证每一簇都贴地
            const box = new THREE.Box3().setFromObject(model)
            const center = new THREE.Vector3()
            box.getCenter(center)

            // 地块内偏移：成熟阶段基本覆盖农田
            const offsetX =
                clusterCount === 1
                    ? 0
                    : (Math.random() - 0.5) * spread * 2

            const offsetZ =
                clusterCount === 1
                    ? 0
                    : (Math.random() - 0.5) * spread * 2

            model.position.set(
                -center.x + offsetX,
                -box.min.y,
                -center.z + offsetZ
            )

            model.rotation.y = Math.random() * Math.PI * 2

            // 成熟和茂盛阶段给一点高低差，更自然
            if (plot.stage >= 5) {
                model.position.y += Math.random() * 0.03
            }

            plot.cropHolder.add(model)
        }
    }

    function createCropPrimitive(type, stage) {
        const group = new THREE.Group()

        if (type === 'wheat') {
            if (stage === 1) {
                for (let i = 0; i < 3; i++) {
                    const seed = new THREE.Mesh(
                        new THREE.SphereGeometry(0.07, 8, 8),
                        new THREE.MeshStandardMaterial({ color: 0x8c6a36 })
                    )
                    seed.position.set((Math.random() - 0.5) * 0.28, 0.02, (Math.random() - 0.5) * 0.28)
                    group.add(seed)
                }
            }
            if (stage === 2) {
                for (let i = 0; i < 5; i++) {
                    const stem = new THREE.Mesh(
                        new THREE.CylinderGeometry(0.025, 0.04, 0.28, 6),
                        new THREE.MeshStandardMaterial({ color: 0x77b94e })
                    )
                    stem.position.set((Math.random() - 0.5) * 0.35, 0.14, (Math.random() - 0.5) * 0.35)
                    stem.rotation.z = (Math.random() - 0.5) * 0.35
                    stem.castShadow = true
                    group.add(stem)
                }
            }
            if (stage === 3) {
                for (let i = 0; i < 7; i++) {
                    const stem = new THREE.Mesh(
                        new THREE.CylinderGeometry(0.03, 0.05, 0.7, 6),
                        new THREE.MeshStandardMaterial({ color: 0x61983d })
                    )
                    stem.position.set((Math.random() - 0.5) * 0.42, 0.35, (Math.random() - 0.5) * 0.42)
                    stem.rotation.z = (Math.random() - 0.5) * 0.2
                    stem.castShadow = true
                    group.add(stem)

                    const leaf = new THREE.Mesh(
                        new THREE.SphereGeometry(0.08, 8, 8),
                        new THREE.MeshStandardMaterial({ color: 0x74bc48 })
                    )
                    leaf.position.set(stem.position.x, 0.65, stem.position.z)
                    leaf.scale.set(1.3, 0.6, 1)
                    group.add(leaf)
                }
            }
            if (stage === 4) {
                for (let i = 0; i < 10; i++) {
                    const stalk = new THREE.Mesh(
                        new THREE.CylinderGeometry(0.03, 0.05, 0.95, 6),
                        new THREE.MeshStandardMaterial({ color: 0x5e8f38 })
                    )
                    stalk.position.set((Math.random() - 0.5) * 0.52, 0.48, (Math.random() - 0.5) * 0.52)
                    stalk.rotation.z = (Math.random() - 0.5) * 0.16
                    stalk.castShadow = true
                    group.add(stalk)

                    const grain = new THREE.Mesh(
                        new THREE.CylinderGeometry(0.055, 0.055, 0.28, 8),
                        new THREE.MeshStandardMaterial({
                            color: 0xd8b94d,
                            emissive: 0x3a2f00,
                            emissiveIntensity: 0.18
                        })
                    )
                    grain.position.set(stalk.position.x, 0.98, stalk.position.z)
                    grain.rotation.z = 0.25
                    grain.castShadow = true
                    group.add(grain)
                }
            }
        }

        if (type === 'corn') {
            const count = stage === 4 ? 6 : stage === 3 ? 5 : stage === 2 ? 3 : 2
            for (let i = 0; i < count; i++) {
                const height = stage === 4 ? 1.2 : stage === 3 ? 0.9 : stage === 2 ? 0.5 : 0.22
                const stem = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.04, 0.06, height, 6),
                    new THREE.MeshStandardMaterial({ color: 0x5e9437 })
                )
                stem.position.set((Math.random() - 0.5) * 0.45, height / 2, (Math.random() - 0.5) * 0.45)
                stem.castShadow = true
                group.add(stem)

                if (stage >= 3) {
                    const cob = new THREE.Mesh(
                        new THREE.CylinderGeometry(0.08, 0.08, stage === 4 ? 0.36 : 0.24, 8),
                        new THREE.MeshStandardMaterial({ color: 0xf0c45a })
                    )
                    cob.position.set(stem.position.x + 0.08, height * 0.72, stem.position.z)
                    cob.rotation.z = 0.45
                    cob.castShadow = true
                    group.add(cob)
                }
            }
        }

        if (type === 'carrot') {
            const count = stage === 4 ? 8 : stage === 3 ? 6 : stage === 2 ? 4 : 2
            for (let i = 0; i < count; i++) {
                const leafHeight = stage === 4 ? 0.78 : stage === 3 ? 0.5 : stage === 2 ? 0.28 : 0.15
                const leaf = new THREE.Mesh(
                    new THREE.ConeGeometry(0.09, leafHeight, 6),
                    new THREE.MeshStandardMaterial({ color: 0x5fab44 })
                )
                leaf.position.set((Math.random() - 0.5) * 0.48, leafHeight / 2, (Math.random() - 0.5) * 0.48)
                leaf.castShadow = true
                group.add(leaf)

                if (stage === 4) {
                    const root = new THREE.Mesh(
                        new THREE.ConeGeometry(0.08, 0.26, 6),
                        new THREE.MeshStandardMaterial({ color: 0xdf7f2d })
                    )
                    root.position.set(leaf.position.x, 0.06, leaf.position.z)
                    root.rotation.x = Math.PI
                    group.add(root)
                }
            }
        }

        if (type === 'rice') {
            const count = stage === 4 ? 10 : stage === 3 ? 7 : stage === 2 ? 5 : 2
            for (let i = 0; i < count; i++) {
                const h = stage === 4 ? 1.0 : stage === 3 ? 0.72 : stage === 2 ? 0.36 : 0.18
                const stem = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.02, 0.035, h, 6),
                    new THREE.MeshStandardMaterial({ color: 0x6ca34a })
                )
                stem.position.set((Math.random() - 0.5) * 0.5, h / 2, (Math.random() - 0.5) * 0.5)
                stem.rotation.z = (Math.random() - 0.5) * 0.12
                stem.castShadow = true
                group.add(stem)

                if (stage === 4) {
                    const riceHead = new THREE.Mesh(
                        new THREE.SphereGeometry(0.055, 6, 6),
                        new THREE.MeshStandardMaterial({ color: 0xdcbc55 })
                    )
                    riceHead.position.set(stem.position.x + 0.03, h * 0.96, stem.position.z)
                    riceHead.scale.set(1.6, 0.6, 1)
                    group.add(riceHead)
                }
            }
        }

        return group
    }

    function updatePlotSimulation(plot, delta, time) {
        if (plot.stage > 0 && plot.stage < 4) {
            const growthRate =
                (plot.moisture >= 45 ? 5 : 1.2) +
                (plot.fertility >= 60 ? 3 : 0.8) -
                (plot.hasWeeds ? 2.5 : 0) -
                (plot.hasPests ? 3 : 0)

            plot.growth = Math.min(100, plot.growth + growthRate * delta)
            plot.moisture = Math.max(0, plot.moisture - 2.8 * delta)

            if (plot.moisture < 30 && !plot.lowMoistureWarned) {
                plot.lowMoistureWarned = true
                toast(`地块 ${plot.id} 的禾苗宝宝渴了，快来浇水吧！`, true)
            }

            if (plot.growth >= 12 && plot.stage < 2) {
                plot.stage = 2
                plot.cropVersion += 1
                attachCropModel(plot, plot.cropVersion)
            }

            if (plot.growth >= 28 && plot.stage < 3) {
                plot.stage = 3
                plot.cropVersion += 1
                attachCropModel(plot, plot.cropVersion)
            }

            if (plot.growth >= 48 && plot.stage < 4) {
                plot.stage = 4
                plot.cropVersion += 1
                attachCropModel(plot, plot.cropVersion)
            }

            if (plot.growth >= 70 && plot.stage < 5) {
                plot.stage = 5
                plot.cropVersion += 1
                attachCropModel(plot, plot.cropVersion)
            }

            if (plot.growth >= 96 && plot.stage < 6) {
                plot.stage = 6
                plot.cropVersion += 1
                attachCropModel(plot, plot.cropVersion)

                if (!plot.matureNotified) {
                    plot.matureNotified = true
                    toast(`收获啦！地块 ${plot.id} 的${cropName(plot.cropType)}成熟啦！`, true)
                }
            }
            if (Math.random() < 0.0009 && plot.stage >= 2) {
                plot.hasWeeds = true
            }

            if (Math.random() < 0.0007 && plot.stage >= 2) {
                plot.hasPests = true
            }
        }

        if (plot.cropHolder.children[0]) {
            plot.cropHolder.children[0].rotation.y = Math.sin(time * 1.2 + plot.id) * 0.06
        }

        if (plot.toolAnim?.particles?.length) {
            if (['seed', 'fertilize'].includes(plot.toolAnim.type)) {
                plot.toolAnim.particles.forEach((p) => {
                    p.mesh.position.y -= p.speed
                    p.mesh.material.opacity -= 0.02
                })

                plot.toolAnim.particles = plot.toolAnim.particles.filter((p) => {
                    const keep = p.mesh.position.y > 0.25 && p.mesh.material.opacity > 0.05
                    if (!keep) plot.group.remove(p.mesh)
                    return keep
                })
            }

            if (plot.toolAnim.type === 'harvest') {
                plot.toolAnim.particles.forEach((p) => {
                    p.mesh.position.x += p.vx
                    p.mesh.position.y += p.vy
                    p.mesh.position.z += p.vz
                    p.mesh.material.opacity -= 0.025
                })

                plot.toolAnim.particles = plot.toolAnim.particles.filter((p) => {
                    const keep = p.mesh.material.opacity > 0.05
                    if (!keep) plot.group.remove(p.mesh)
                    return keep
                })
            }

            if (!plot.toolAnim.particles.length) {
                plot.toolAnim = null
            }
        }
    }

    function createSeedAnimation(plot) {
        const particles = []
        for (let i = 0; i < 10; i++) {
            const seed = new THREE.Mesh(
                new THREE.SphereGeometry(0.045, 6, 6),
                new THREE.MeshStandardMaterial({ color: 0x8c6a38 })
            )
            seed.position.set((Math.random() - 0.5) * 0.6, 1 + Math.random() * 0.5, (Math.random() - 0.5) * 0.6)
            plot.group.add(seed)
            particles.push({ mesh: seed, speed: 0.03 + Math.random() * 0.015 })
        }
        plot.toolAnim = { type: 'seed', particles }
    }

    function createFertilizeAnimation(plot) {
        const particles = []
        for (let i = 0; i < 12; i++) {
            const pellet = new THREE.Mesh(
                new THREE.SphereGeometry(0.038, 6, 6),
                new THREE.MeshStandardMaterial({
                    color: 0x6e5332,
                    transparent: true,
                    opacity: 0.9
                })
            )
            pellet.position.set((Math.random() - 0.5) * 1.2, 1 + Math.random() * 0.7, (Math.random() - 0.5) * 1.2)
            plot.group.add(pellet)
            particles.push({ mesh: pellet, speed: 0.026 + Math.random() * 0.018 })
        }
        plot.toolAnim = { type: 'fertilize', particles }
    }

    function createHarvestAnimation(plot) {
        const particles = []
        for (let i = 0; i < 18; i++) {
            const spark = new THREE.Mesh(
                new THREE.SphereGeometry(0.045, 6, 6),
                new THREE.MeshStandardMaterial({
                    color: 0xffd763,
                    transparent: true,
                    opacity: 0.95
                })
            )
            spark.position.set((Math.random() - 0.5) * 0.9, 0.8 + Math.random() * 0.7, (Math.random() - 0.5) * 0.9)
            plot.group.add(spark)
            particles.push({
                mesh: spark,
                vx: (Math.random() - 0.5) * 0.03,
                vy: 0.015 + Math.random() * 0.03,
                vz: (Math.random() - 0.5) * 0.03
            })
        }
        plot.toolAnim = { type: 'harvest', particles }
    }

    function sanitizeToolModel(model) {
        const cleanGroup = new THREE.Group()
        const meshes = []

        model.updateMatrixWorld(true)

        model.traverse((obj) => {
            if (!obj.isMesh || !obj.geometry) return

            obj.geometry.computeBoundingBox()
            const geoBox = obj.geometry.boundingBox
            if (!geoBox) return

            const size = new THREE.Vector3()
            const center = new THREE.Vector3()
            geoBox.getSize(size)
            geoBox.getCenter(center)

            const tooLarge =
                size.x > 1000 || size.y > 1000 || size.z > 1000

            const tooFar =
                Math.abs(center.x) > 1000 ||
                Math.abs(center.y) > 1000 ||
                Math.abs(center.z) > 1000

            if (tooLarge || tooFar) {
                console.warn('跳过异常 mesh:', {
                    name: obj.name,
                    size,
                    center
                })
                return
            }

            const cloned = obj.clone()
            cloned.geometry = obj.geometry.clone()

            if (Array.isArray(obj.material)) {
                cloned.material = obj.material.map(m => m.clone())
            } else if (obj.material) {
                cloned.material = obj.material.clone()
            }

            cloned.position.copy(obj.position)
            cloned.rotation.copy(obj.rotation)
            cloned.scale.copy(obj.scale)

            cloned.castShadow = true
            cloned.receiveShadow = true

            if (cloned.material) {
                if (Array.isArray(cloned.material)) {
                    cloned.material.forEach(m => {
                        m.side = THREE.DoubleSide
                    })
                } else {
                    cloned.material.side = THREE.DoubleSide
                }
            }

            meshes.push(cloned)
            cleanGroup.add(cloned)
        })

        console.log('清洗后有效 mesh 数量：', meshes.length)
        return cleanGroup
    }

    function findSpoutMesh(model) {
        let target = null
        let maxX = -Infinity

        model.traverse((obj) => {
            if (!obj.isMesh) return
            const box = new THREE.Box3().setFromObject(obj)
            const center = new THREE.Vector3()
            box.getCenter(center)
            if (center.x > maxX) {
                maxX = center.x
                target = obj
            }
        })

        return target
    }

    function addSpoutAnchor(model) {
        const box = new THREE.Box3().setFromObject(model)
        const size = new THREE.Vector3()
        const center = new THREE.Vector3()
        box.getSize(size)
        box.getCenter(center)

        const anchor = new THREE.Object3D()
        anchor.name = 'spoutAnchor'

        // 根据整体包围盒，放在喷壶前上方
        anchor.position.set(
            box.max.x * 0.92,
            center.y + size.y * 0.08,
            center.z
        )

        const spoutMesh = findSpoutMesh(model)
        if (spoutMesh) {
            spoutMesh.add(anchor)
        } else {
            model.add(anchor)
        }

        model.userData.spoutAnchor = anchor
    }

    async function createToolModel(tool) {
        const modelMap = {
            water: '/models/farm/tools/watering_can.glb'
        }

        const url = modelMap[tool]
        if (!url) return null

        console.log('开始加载工具模型：', url)

        const rawModel = await safeLoadModel(url)
        if (!rawModel) {
            console.warn('工具模型加载失败，使用程序喷壶模型：', url)
            return createProceduralWateringCan()
        }

        const model = sanitizeToolModel(rawModel)
        if (!model.children.length) {
            console.warn('清洗后没有可用 mesh，使用程序喷壶模型')
            return createProceduralWateringCan()
        }

        const box = new THREE.Box3().setFromObject(model)
        const size = new THREE.Vector3()
        const center = new THREE.Vector3()
        box.getSize(size)
        box.getCenter(center)

        const maxAxis = Math.max(size.x, size.y, size.z)
        const targetSize = 1.6
        const scale = targetSize / maxAxis

        model.scale.setScalar(scale)

        const scaledBox = new THREE.Box3().setFromObject(model)
        const scaledCenter = new THREE.Vector3()
        scaledBox.getCenter(scaledCenter)

        model.position.set(
            -scaledCenter.x,
            -scaledCenter.y,
            -scaledCenter.z
        )

        // 不在模型层做复杂旋转
        model.rotation.set(0, 0, 0)

        addSpoutAnchor(model)

        console.log('喷壶最终缩放倍数：', scale)
        return model
    }

    function createProceduralWateringCan() {
        const group = new THREE.Group()

        const bodyMat = new THREE.MeshStandardMaterial({
            color: 0x5fa8d3,
            roughness: 0.65,
            metalness: 0.2
        })

        const handleMat = new THREE.MeshStandardMaterial({
            color: 0x3f6f8d,
            roughness: 0.55,
            metalness: 0.25
        })

        const body = new THREE.Mesh(
            new THREE.CylinderGeometry(0.22, 0.3, 0.55, 18),
            bodyMat
        )
        body.castShadow = true
        body.receiveShadow = true
        group.add(body)

        const top = new THREE.Mesh(
            new THREE.CylinderGeometry(0.16, 0.18, 0.08, 18),
            bodyMat
        )
        top.position.y = 0.28
        top.castShadow = true
        group.add(top)

        const spout = new THREE.Mesh(
            new THREE.CylinderGeometry(0.04, 0.06, 0.55, 12),
            bodyMat
        )
        spout.rotation.z = -1.0
        spout.position.set(0.33, 0.08, 0)
        spout.castShadow = true
        group.add(spout)

        const nozzle = new THREE.Mesh(
            new THREE.SphereGeometry(0.08, 12, 12),
            bodyMat
        )
        nozzle.scale.set(1.2, 0.7, 1)
        nozzle.position.set(0.56, -0.05, 0)
        nozzle.castShadow = true
        group.add(nozzle)

        const handle = new THREE.Mesh(
            new THREE.TorusGeometry(0.22, 0.035, 10, 20, Math.PI),
            handleMat
        )
        handle.rotation.z = Math.PI / 2
        handle.position.set(-0.16, 0.02, 0)
        handle.castShadow = true
        group.add(handle)

        group.rotation.set(-0.4, 0.6, 0.25)
        group.scale.set(0.9, 0.9, 0.9)

        const spoutAnchor = new THREE.Object3D()
        spoutAnchor.name = 'spoutAnchor'
        spoutAnchor.position.set(0.58, -0.02, 0)
        group.add(spoutAnchor)
        group.userData.spoutAnchor = spoutAnchor

        return group
    }

    function spawnWaterDropsFromSpout(spoutAnchor, count = 3) {
        if (!spoutAnchor) return

        const worldPos = new THREE.Vector3()
        const worldQuat = new THREE.Quaternion()
        spoutAnchor.getWorldPosition(worldPos)
        spoutAnchor.getWorldQuaternion(worldQuat)

        for (let i = 0; i < count; i++) {
            const mesh = new THREE.Mesh(
                new THREE.SphereGeometry(0.028 + Math.random() * 0.014, 6, 6),
                new THREE.MeshStandardMaterial({
                    color: 0x66ccff,
                    emissive: 0x225577,
                    emissiveIntensity: 0.18,
                    transparent: true,
                    opacity: 0.78
                })
            )

            mesh.position.copy(worldPos)
            mesh.castShadow = false
            mesh.receiveShadow = false
            scene.add(mesh)

            // 改成正向喷
            const dir = new THREE.Vector3(0.9, -0.45, 0)
                .normalize()
                .applyQuaternion(worldQuat)

            dir.x += (Math.random() - 0.5) * 0.05
            dir.y += (Math.random() - 0.5) * 0.03
            dir.z += (Math.random() - 0.5) * 0.05
            dir.normalize()

            activeWaterDrops.push({
                mesh,
                velocity: dir.multiplyScalar(0.085 + Math.random() * 0.025),
                life: 0.85 + Math.random() * 0.25
            })
        }
    }

    function updateActiveWaterDrops(delta) {
        for (let i = activeWaterDrops.length - 1; i >= 0; i--) {
            const drop = activeWaterDrops[i]
            drop.life -= delta

            drop.velocity.y -= 0.22 * delta
            drop.mesh.position.addScaledVector(drop.velocity, delta * 60)

            if (drop.mesh.material) {
                drop.mesh.material.opacity = Math.max(0, drop.life * 0.95)
            }

            if (drop.life <= 0 || drop.mesh.position.y < 0.28) {
                scene.remove(drop.mesh)
                activeWaterDrops.splice(i, 1)
            }
        }
    }
    function getCropLocalTarget(plot) {
        // 默认瞄准地块中心偏上一点
        const fallback = new THREE.Vector3(0, 0.55, 0)

        if (!plot.cropHolder || !plot.cropHolder.children.length) {
            return fallback
        }

        const box = new THREE.Box3().setFromObject(plot.cropHolder)
        const center = new THREE.Vector3()
        box.getCenter(center)

        // 转成 plot.group 的局部坐标
        plot.group.worldToLocal(center)

        // 稍微往上抬一点，瞄准作物中上部
        center.y += 0.15

        return center
    }

    function applyWateringModelOffset(model) {
        // 这里是“模型自身修正角度”
        // 如果后面还要微调，只调这里，不要再到处叠加 rotation
        model.rotation.set(0.08, -Math.PI / 2, -0.62)
        model.rotateY(Math.PI)
    }

    async function showToolActionModel(plot, tool) {
        console.log('准备显示工具模型：', tool, '地块：', plot.id)

        const model = await createToolModel(tool)
        if (!model) return

        // 外层：控制位置
        const toolGroup = new THREE.Group()

        // 中层：专门负责“朝向作物”
        const aimGroup = new THREE.Group()

        // 先把喷壶放到地块一侧上方
        toolGroup.position.set(0.45, 1.1, 0.45)

        // 喷壶模型挂到朝向组里
        aimGroup.add(model)
        toolGroup.add(aimGroup)
        plot.group.add(toolGroup)

        const spoutAnchor =
            model.userData?.spoutAnchor ||
            model.getObjectByName('spoutAnchor')

        let frame = 0

        function animateTool() {
            frame++

            if (tool === 'water') {
                // 每一帧都重新获取作物中心，确保始终对准当前作物
                const target = getCropLocalTarget(plot)

                // 让朝向组朝向作物
                aimGroup.lookAt(target)

                // lookAt 后再给一点浇水倾角
                aimGroup.rotation.z -= 0.55

                // 喷壶上下轻微起伏
                toolGroup.position.y =
                    1.1 - Math.sin(Math.min(frame / 55, 1) * Math.PI) * 0.08

                // 水滴从壶嘴喷出
                if (frame >= 8 && frame <= 42 && frame % 2 === 0) {
                    spawnWaterDropsFromSpout(spoutAnchor, 2)
                }
            } else {
                toolGroup.position.y -= 0.01
                toolGroup.rotation.y += 0.08
            }

            if (frame < 55) {
                requestAnimationFrame(animateTool)
            } else {
                plot.group.remove(toolGroup)
            }
        }

        animateTool()
    }

    function animate() {
        const delta = clock.getDelta()
        const time = performance.now() * 0.001

        controls.update()
        updateActiveWaterDrops(delta)

        farmPlots.forEach(plot => {
            updatePlotSimulation(plot, delta, time)
        })

        decorativeGroup.children.forEach((item, idx) => {
            if (item.userData.type === 'chicken') {
                item.rotation.y = Math.sin(time * 1.2) * 0.25
            }
            if (item.userData.type === 'sheep') {
                item.position.y = Math.abs(Math.sin(time * 2 + idx)) * 0.03
            }
            if (item.userData.type === 'pig') {
                item.rotation.y = Math.sin(time * 0.9) * 0.18
            }
            if (item.userData.isCloud) {
                item.position.x += item.userData.speed
                if (item.position.x > 22) item.position.x = -22
            }
            if (item.userData.isLake) {
                item.scale.y = 1 + Math.sin(time * 1.7) * 0.02
            }
            if (item.userData.isWindmill) {
                item.children.forEach(child => {
                    if (child.userData?.isBlade) {
                        child.rotation.y += 0.08
                    }
                })
            }
        })

        renderer.render(scene, camera)
        animationId = requestAnimationFrame(animate)
    }

    function emitSummary() {
        const planted = farmPlots.filter(p => p.stage > 0).length
        const mature = farmPlots.filter(p => p.stage === 4).length
        const dry = farmPlots.filter(p => p.stage > 0 && p.moisture < 35).length
        const weeds = farmPlots.filter(p => p.hasWeeds).length
        const pests = farmPlots.filter(p => p.hasPests).length

        emit('summary-update', {
            totalPlots: farmPlots.length,
            planted,
            mature,
            dry,
            weeds,
            pests
        })
    }

    function clonePlot(plot) {
        return {
            id: plot.id,
            cropType: plot.cropType,
            stage: plot.stage,
            moisture: Math.round(plot.moisture),
            fertility: Math.round(plot.fertility),
            growth: Math.round(plot.growth),
            hasWeeds: plot.hasWeeds,
            hasPests: plot.hasPests
        }
    }

    function cropName(type) {
        const map = {
            wheat: '小麦',
            corn: '玉米',
            carrot: '胡萝卜',
            rice: '稻苗'
        }
        return map[type] || '农作物'
    }

    function toast(text, speakIt = false) {
        emit('toast', text, speakIt)
    }

    function speak(text) {
        if (!('speechSynthesis' in window)) return
        window.speechSynthesis.cancel()
        const utter = new SpeechSynthesisUtterance(text)
        utter.lang = 'zh-CN'
        utter.rate = 1
        utter.pitch = 1.15
        utter.volume = 1
        window.speechSynthesis.speak(utter)
    }

    function speakToolGuide(tool) {
        const map = {
            seed: '请点击空地开始播种，小种子要住进软软的泥土里啦！',
            water: '禾苗宝宝口渴啦，快给它浇水吧！',
            fertilize: '施一点肥料，帮助农作物长得更快更健康！',
            weed: '杂草会抢走营养，快把它们清理掉吧！',
            pest: '害虫来捣乱啦，快保护农作物！',
            harvest: '农作物成熟啦，快来收获吧！'
        }
        const text = map[tool]
        if (text) {
            toast(text, true)
        }
    }

    function loadModel(url) {
        return new Promise((resolve, reject) => {
            if (modelCache.has(url)) {
                resolve(modelCache.get(url))
                return
            }

            gltfLoader.load(
                url,
                (gltf) => {
                    modelCache.set(url, gltf.scene)
                    resolve(gltf.scene)
                },
                undefined,
                (err) => reject(err)
            )
        })
    }

    function cloneModel(model) {
        return model.clone(true)
    }

    async function safeLoadModel(url) {
        try {
            const model = await loadModel(url)
            return cloneModel(model)
        } catch (e) {
            console.warn('模型加载失败：', url, e)
            return null
        }
    }

    function applyModelShadow(model) {
        model.traverse((obj) => {
            if (obj.isMesh) {
                obj.castShadow = true
                obj.receiveShadow = true
            }
        })
    }

    function fitModelToWorld(model, options = {}) {
        const {
            targetSize = 4,
            position = new THREE.Vector3(0, 0, 0),
            rotation = new THREE.Euler(0, 0, 0)
        } = options

        model.scale.set(1, 1, 1)
        model.rotation.copy(rotation)

        const box = new THREE.Box3().setFromObject(model)
        const size = new THREE.Vector3()
        const center = new THREE.Vector3()
        box.getSize(size)
        box.getCenter(center)

        const maxAxis = Math.max(size.x, size.y, size.z)
        const scale = targetSize / maxAxis
        model.scale.setScalar(scale)

        const scaledBox = new THREE.Box3().setFromObject(model)
        const scaledCenter = new THREE.Vector3()
        const scaledSize = new THREE.Vector3()
        scaledBox.getCenter(scaledCenter)
        scaledBox.getSize(scaledSize)

        model.position.set(
            position.x - scaledCenter.x,
            position.y - scaledBox.min.y,
            position.z - scaledCenter.z
        )

        return {
            box: scaledBox,
            size: scaledSize,
            center: scaledCenter,
            scale
        }
    }
</script>

<style scoped>
    .farm-scene {
        width: 100%;
        height: 100%;
        position: relative;
        background: linear-gradient(180deg, #c6ebff 0%, #dff5ff 36%, #d7f0c5 100%);
    }

    .scene-hint {
        position: absolute;
        left: 16px;
        bottom: 16px;
        z-index: 5;
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
        pointer-events: none;
    }

        .scene-hint span {
            padding: 8px 12px;
            border-radius: 999px;
            background: rgba(57, 74, 37, 0.72);
            color: #fffbe8;
            font-size: 13px;
            backdrop-filter: blur(4px);
        }
</style>