/**
 * =====================================================
 * NeoTrace — 3D Globe Visualization (Three.js)
 * =====================================================
 *
 * Interactive 3D globe displaying global cyber threats
 * with real-time event markers, color-coded severity,
 * and dynamic data updates.
 */

class CyberThreatGlobe {
  constructor(containerId = "globe3d") {
    this.container = document.getElementById(containerId);
    if (!containerId) return;

    // Scene setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0a1e);
    this.scene.fog = new THREE.Fog(0x0a0a1e, 2000, 10000);

    // Camera setup
    const width = this.container.clientWidth;
    const height = this.container.clientHeight || 600;
    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 10000);
    this.camera.position.z = 2.5;

    // Renderer setup
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.container.appendChild(this.renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    this.scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x06b6d4, 0.8);
    pointLight.position.set(2, 2, 2);
    this.scene.add(pointLight);

    // Create globe
    this.createGlobe();

    // Event markers
    this.eventMarkers = [];
    this.eventData = [];

    // Interaction
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.selectedMarker = null;

    // Animation state
    this.autoRotate = true;
    this.rotationSpeed = 0.0001;

    // Setup event listeners
    this.setupEventListeners();

    // Load initial data
    this.loadEventData();

    // Start animation loop
    this.animate();

    // Handle window resize
    window.addEventListener("resize", () => this.onWindowResize());
  }

  /**
   * Create the Earth globe with texture
   */
  createGlobe() {
    // Globe geometry with good detail
    const geometry = new THREE.IcosahedronGeometry(1, 32);

    // Create a canvas-based texture for the globe
    const canvas = document.createElement("canvas");
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext("2d");

    // Base gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, "#0a1e3a");
    gradient.addColorStop(0.5, "#1a3a5e");
    gradient.addColorStop(1, "#0a1e3a");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add continents data (simplified world map)
    ctx.fillStyle = "#1a4d2e";
    this.drawContinents(ctx, canvas.width, canvas.height);

    // Add city glow points
    ctx.fillStyle = "rgba(59, 130, 246, 0.6)";
    this.drawCityPoints(ctx, canvas.width, canvas.height);

    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = this.renderer.capabilities.maxAnisotropy;

    // Material with blue-tinted globe
    const material = new THREE.MeshPhongMaterial({
      map: texture,
      shininess: 5,
      emissive: 0x1a3a5e,
      emissiveIntensity: 0.3
    });

    this.globe = new THREE.Mesh(geometry, material);
    this.scene.add(this.globe);

    // Add glow effect
    this.addGlobeGlow();
  }

  /**
   * Draw simplified continents on canvas
   */
  drawContinents(ctx, width, height) {
    // Continent regions (rough approximations)
    const continents = [
      // North America
      { x: 100, y: 250, w: 200, h: 150 },
      // South America
      { x: 150, y: 450, w: 120, h: 180 },
      // Europe/Africa
      { x: 600, y: 150, w: 300, h: 400 },
      // Asia
      { x: 900, y: 200, w: 400, h: 300 },
      // Australia
      { x: 1200, y: 500, w: 80, h: 100 }
    ];

    continents.forEach((cont) => {
      // Irregular shapes using bezier curves
      ctx.fillRect(cont.x, cont.y, cont.w, cont.h);
    });
  }

  /**
   * Draw city/population centers on canvas
   */
  drawCityPoints(ctx, width, height) {
    const cities = [
      { x: 150, y: 300 },   // NYC
      { x: 350, y: 400 },   // São Paulo
      { x: 700, y: 300 },   // London
      { x: 750, y: 280 },   // Paris
      { x: 850, y: 250 },   // Moscow
      { x: 1050, y: 350 },  // Dubai
      { x: 1150, y: 400 },  // India
      { x: 1300, y: 280 },  // Shanghai
      { x: 1450, y: 330 },  // Tokyo
      { x: 1250, y: 550 }   // Sydney
    ];

    cities.forEach((city) => {
      ctx.beginPath();
      ctx.arc(city.x, city.y, 8, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  /**
   * Add glow effect around the globe
   */
  addGlobeGlow() {
    const glowGeometry = new THREE.IcosahedronGeometry(1.05, 16);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.1,
      depthWrite: false
    });

    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    this.globe.add(glow);
  }

  /**
   * Load cyber threat event data from API
   */
  loadEventData() {
    // Get filter values from UI
    const category = document.getElementById("mapCategoryFilter")?.value || "all";
    const confidence = parseInt(document.getElementById("mapConfidenceFilter")?.value || "40");
    const timeRange = parseInt(document.getElementById("mapTimeRange")?.value || "24");

    // Fetch events from API
    fetch(`/api/events?category=${category}&confidence=${confidence}&timeRange=${timeRange}`)
      .then((res) => res.json())
      .then((data) => {
        this.eventData = data.features || [];
        this.updateMarkers();
      })
      .catch((err) => {
        console.warn("Failed to load event data:", err);
        // Use demo data on error
        this.eventData = this.generateDemoData();
        this.updateMarkers();
      });
  }

  /**
   * Generate demo event data (fallback)
   */
  generateDemoData() {
    const categories = ["phishing", "ransomware", "vulnerability", "data-breach", "deepfake"];
    const events = [];

    for (let i = 0; i < 30; i++) {
      const lat = (Math.random() - 0.5) * 170;
      const lng = (Math.random() - 0.5) * 360;
      const severity = Math.floor(Math.random() * 5) + 1; // 1-5

      events.push({
        type: "Feature",
        properties: {
          category: categories[Math.floor(Math.random() * categories.length)],
          severity: severity,
          confidence: severity * 20,
          title: `Threat Event ${i}`
        },
        geometry: {
          type: "Point",
          coordinates: [lng, lat]
        }
      });
    }

    return events;
  }

  /**
   * Update globe markers based on current event data
   */
  updateMarkers() {
    // Remove old markers
    this.eventMarkers.forEach((marker) => this.scene.remove(marker.mesh));
    this.eventMarkers = [];

    // Add new markers
    this.eventData.forEach((event, idx) => {
      const coords = event.geometry.coordinates;
      const lng = coords[0];
      const lat = coords[1];
      const props = event.properties;

      // Convert lat/lng to 3D position on sphere
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lng + 180) * (Math.PI / 180);

      const x = Math.sin(phi) * Math.cos(theta);
      const y = Math.cos(phi);
      const z = Math.sin(phi) * Math.sin(theta);

      // Create marker geometry and material
      const markerGeo = new THREE.SphereGeometry(0.025, 16, 16);
      const color = this.getCategoryColor(props.category);
      const markerMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(color)
      });

      const marker = new THREE.Mesh(markerGeo, markerMat);
      marker.position.set(x, y, z);
      marker.scale.set(1 + props.severity / 5, 1 + props.severity / 5, 1 + props.severity / 5);

      this.globe.add(marker);

      // Store marker reference
      this.eventMarkers.push({
        mesh: marker,
        position: new THREE.Vector3(x, y, z),
        data: event,
        index: idx
      });

      // Add glow effect to marker
      this.addMarkerGlow(marker, color);
    });
  }

  /**
   * Add glow effect to individual markers
   */
  addMarkerGlow(marker, color) {
    const glowGeo = new THREE.SphereGeometry(0.035, 16, 16);
    const glowMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(color),
      transparent: true,
      opacity: 0.3,
      depthWrite: false
    });

    const glow = new THREE.Mesh(glowGeo, glowMat);
    marker.add(glow);
  }

  /**
   * Get color based on threat category
   */
  getCategoryColor(category) {
    const colors = {
      phishing: 0xec4899,        // Pink
      ransomware: 0xff6b6b,      // Red
      vulnerability: 0xffa500,   // Orange
      "data-breach": 0xffed4e,   // Yellow
      deepfake: 0x9d4edd,        // Purple
      "threat-intel": 0x3b82f6   // Blue
    };
    return colors[category] || 0x06b6d4;
  }

  /**
   * Setup mouse and touch event listeners
   */
  setupEventListeners() {
    // Mouse movement for picking
    document.addEventListener("mousemove", (e) => this.onMouseMove(e));
    document.addEventListener("click", (e) => this.onMouseClick(e));

    // Touch support
    document.addEventListener("touchmove", (e) => this.onTouchMove(e), false);
    document.addEventListener("touchend", (e) => this.onTouchEnd(e), false);

    // Control buttons
    const viewButtons = document.querySelectorAll('[data-view]');
    viewButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => this.switchView(e.target.dataset.view));
    });

    // Filter listeners
    document.getElementById("mapCategoryFilter")?.addEventListener("change", () => this.loadEventData());
    document.getElementById("mapConfidenceFilter")?.addEventListener("change", () => this.loadEventData());
    document.getElementById("mapTimeRange")?.addEventListener("change", () => this.loadEventData());
  }

  /**
   * Handle mouse movement for marker interaction
   */
  onMouseMove(event) {
    const rect = this.container.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / this.container.clientWidth) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / this.container.clientHeight) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);

    const intersects = this.raycaster.intersectObjects(
      this.eventMarkers.map((m) => m.mesh),
      false
    );

    // Highlight hovered marker
    if (intersects.length > 0) {
      const hovered = intersects[0].object;
      this.container.style.cursor = "pointer";

      // Scale up on hover
      hovered.scale.multiplyScalar(1.1);
    } else {
      this.container.style.cursor = "default";
    }
  }

  /**
   * Handle mouse click on marker
   */
  onMouseClick(event) {
    const rect = this.container.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / this.container.clientWidth) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / this.container.clientHeight) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);

    const intersects = this.raycaster.intersectObjects(
      this.eventMarkers.map((m) => m.mesh),
      false
    );

    if (intersects.length > 0) {
      const clicked = intersects[0].object;
      const markerData = this.eventMarkers.find((m) => m.mesh === clicked);

      if (markerData) {
        this.showMarkerDetails(markerData);
      }
    }
  }

  /**
   * Show event details in the detail panel
   */
  showMarkerDetails(markerData) {
    const panel = document.getElementById("mapDetailPanel");
    const data = markerData.data;
    const props = data.properties;

    const html = `
      <h4>${props.title || "Event"}</h4>
      <div class="event-detail-content">
        <p><strong>Category:</strong> <span class="badge">${props.category}</span></p>
        <p><strong>Severity:</strong> ${"★".repeat(props.severity)}</p>
        <p><strong>Confidence:</strong> ${props.confidence}%</p>
        <p><strong>Location:</strong> (${data.geometry.coordinates[1].toFixed(2)}°, ${data.geometry.coordinates[0].toFixed(2)}°)</p>
        <p><strong>Time:</strong> ${props.timestamp || "N/A"}</p>
      </div>
    `;

    if (panel) {
      panel.innerHTML = html;
    }
  }

  /**
   * Switch between 3D and 2D views
   */
  switchView(viewMode) {
    const globe3d = document.getElementById("globe3d");
    const heatmap2d = document.getElementById("heatmap");

    if (viewMode === "3d-globe") {
      if (globe3d) globe3d.style.display = "block";
      if (heatmap2d) heatmap2d.style.display = "none";
      this.animate();
    } else if (viewMode === "2d-map") {
      if (globe3d) globe3d.style.display = "none";
      if (heatmap2d) heatmap2d.style.display = "block";
    }

    // Update button states
    document.querySelectorAll('[data-view]').forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.view === viewMode);
    });
  }

  /**
   * Touch event handlers
   */
  onTouchMove(event) {
    if (event.touches.length === 2) {
      this.lastDistance = this.getTouchDistance(event.touches[0], event.touches[1]);
    }
  }

  onTouchEnd(event) {
    this.lastDistance = null;
  }

  getTouchDistance(touch1, touch2) {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Handle window resize
   */
  onWindowResize() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight || 600;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  /**
   * Main animation loop
   */
  animate = () => {
    requestAnimationFrame(this.animate);

    // Auto-rotate globe
    if (this.autoRotate && this.globe) {
      this.globe.rotation.y += this.rotationSpeed;
    }

    // Render scene
    this.renderer.render(this.scene, this.camera);
  };

  /**
   * Set auto-rotation state
   */
  setAutoRotate(enabled) {
    this.autoRotate = enabled;
  }
}

/**
 * Initialize the 3D globe on page load
 */
(function initGlobe3D() {
  // Wait for DOM to be ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      window.cyberThreatGlobe = new CyberThreatGlobe("globe3d");
    });
  } else {
    window.cyberThreatGlobe = new CyberThreatGlobe("globe3d");
  }
})();
