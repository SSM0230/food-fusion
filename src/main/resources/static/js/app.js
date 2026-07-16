// Intercept fetch calls to automatically append the CSRF token to headers for modifying requests
(function() {
    const originalFetch = window.fetch;
    window.fetch = function(url, options) {
        options = options || {};
        const method = (options.method || 'GET').toUpperCase();
        if (method !== 'GET' && method !== 'HEAD' && method !== 'OPTIONS') {
            options.headers = options.headers || {};
            // Try to extract CSRF token from the XSRF-TOKEN cookie
            const cookies = document.cookie.split(';');
            let csrfToken = '';
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.startsWith('XSRF-TOKEN=')) {
                    csrfToken = decodeURIComponent(cookie.substring('XSRF-TOKEN='.length));
                    break;
                }
            }
            if (csrfToken) {
                options.headers['X-XSRF-TOKEN'] = csrfToken;
            }
        }
        return originalFetch(url, options);
    };
})();

// Food Fusion Main Application Logic

const App = {
    // Session State
    user: null,
    currentView: 'home',
    viewParams: null,
    
    // Feature States
    cart: [],
    coupon: null,
    wishlist: [],
    challenges: [],
    
    // Group Ordering State
    groupSession: null, // { code, role: 'host'|'member', memberName }
    
    // Chat Polling
    chatInterval: null,

    // Initializer
    async init() {
        console.log("Initializing Food Fusion Front-End...");
        this.initTheme();
        await this.checkSession();
        
        // Router binding
        window.addEventListener('hashchange', () => this.handleRouting());
        this.handleRouting();
    },

    initTheme() {
        const theme = localStorage.getItem('theme') || 'dark';
        if (theme === 'light') {
            document.body.classList.add('light-theme');
            setTimeout(() => {
                const btn = document.getElementById('theme-toggle-btn');
                if (btn) btn.innerHTML = '<i class="fa-solid fa-moon"></i>';
            }, 100);
        }
    },

    toggleTheme() {
        const body = document.body;
        const btn = document.getElementById('theme-toggle-btn');
        if (body.classList.contains('light-theme')) {
            body.classList.remove('light-theme');
            if (btn) btn.innerHTML = '<i class="fa-solid fa-sun"></i>';
            localStorage.setItem('theme', 'dark');
            this.showToast("Dark Mode Enabled");
        } else {
            body.classList.add('light-theme');
            if (btn) btn.innerHTML = '<i class="fa-solid fa-moon"></i>';
            localStorage.setItem('theme', 'light');
            this.showToast("Light Mode Enabled");
        }
    },

    async checkSession() {
        try {
            const res = await fetch('/api/auth/session');
            if (res.ok) {
                this.user = await res.json();
                this.updateNavBar();
                await this.syncUserData();
            } else {
                this.user = null;
                this.updateNavBar();
            }
        } catch (e) {
            console.error("Session check failed", e);
        }
    },

    async syncUserData() {
        if (!this.user) return;
        if (this.user.role === 'CUSTOMER') {
            await this.fetchCart();
            await this.fetchWishlist();
            await this.fetchChallenges();
        }
    },

    // Navigation and Routing
    navigateTo(view, params = null) {
        this.currentView = view;
        this.viewParams = params;
        
        // Update URL hash (e.g. #/restaurant-details/2)
        let hash = `#/${view}`;
        if (params) hash += `/${params}`;
        window.location.hash = hash;
        
        this.renderView();
    },

    handleRouting() {
        const hash = window.location.hash;
        if (!hash || hash === '#/') {
            // If user is already logged in, go to their dashboard; otherwise login page
            if (this.user) {
                this.navigateTo('dashboard');
            } else {
                this.navigateTo('login');
            }
            return;
        }

        const parts = hash.split('/');
        const view = parts[1];
        const param = parts[2] ? parseInt(parts[2]) || parts[2] : null;

        this.currentView = view;
        this.viewParams = param;
        this.renderView();
    },

    updateNavBar() {
        const nav = document.getElementById('nav-links');
        if (!nav) return;

        if (this.user) {
            let dashboardLabel = 'Dashboard';
            if (this.user.role === 'OWNER') dashboardLabel = '<i class="fa-solid fa-fire-burner"></i> Owner Panel';
            else if (this.user.role === 'DELIVERY') dashboardLabel = '<i class="fa-solid fa-motorcycle"></i> Driver Portal';
            else if (this.user.role === 'ADMIN') dashboardLabel = '<i class="fa-solid fa-briefcase"></i> Admin Console';
            else dashboardLabel = '<i class="fa-solid fa-user"></i> My Dashboard';

            nav.innerHTML = `
                ${this.user.role === 'CUSTOMER' ? `<a onclick="App.navigateTo('home')"><i class="fa-solid fa-house"></i> Home</a>` : ''}
                ${this.user.role === 'CUSTOMER' ? `<a onclick="App.navigateTo('cart')"><i class="fa-solid fa-cart-shopping"></i> Cart <span id="nav-cart-count" class="loyalty-badge tier-silver" style="font-size:10px; padding:2px 6px;">${this.cart.length}</span></a>` : ''}
                <a onclick="App.navigateTo('dashboard')">${dashboardLabel}</a>
                <a class="btn btn-outline btn-sm" onclick="App.logout()">Logout</a>
            `;
        } else {
            nav.innerHTML = `
                <a href="/landing.html"><i class="fa-solid fa-house"></i> About Food Fusion</a>
                <a class="btn btn-primary btn-sm" onclick="App.navigateTo('login')">Login / Sign Up</a>
            `;
        }
    },

    // Global Notification Helper
    showToast(message, type = 'success') {
        const existing = document.querySelector('.notification');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.className = `notification glass-panel`;
        toast.style.borderLeft = `5px solid ${type === 'success' ? 'var(--success)' : 'var(--danger)'}`;
        
        const emoji = type === 'success' ? '<i class="fa-solid fa-circle-check"></i>' : '<i class="fa-solid fa-circle-xmark"></i>';
        toast.innerHTML = `
            <span>${emoji}</span>
            <div style="font-size:13px; font-weight:600;">${message}</div>
        `;
        document.body.appendChild(toast);

        setTimeout(() => toast.remove(), 4000);
    },

    // --- Views Rendering ---
    async renderView() {
        const main = document.getElementById('main-content');
        if (!main) return;

        // Clear chat polling if we leave tracking view
        if (this.currentView !== 'order-tracking' && this.chatInterval) {
            clearInterval(this.chatInterval);
            this.chatInterval = null;
        }

        // Authentication & Role Gate — unauthenticated users only see login/register
        const protectedViews = ['home', 'cart', 'dashboard', 'order-tracking', 'order-success',
                                'restaurant-details', 'category-results', 'owner-restaurant-details'];
        if (protectedViews.includes(this.currentView) && !this.user) {
            this.currentView = 'login';
        }

        // Redirect non-CUSTOMER roles trying to access customer-only pages
        const customerOnlyViews = ['home', 'cart', 'category-results', 'restaurant-details'];
        if (this.user && this.user.role !== 'CUSTOMER' && customerOnlyViews.includes(this.currentView)) {
            this.currentView = 'dashboard';
        }

        switch (this.currentView) {
            case 'login':
                this.renderLoginView(main);
                break;
            case 'register':
                this.renderRegisterView(main);
                break;
            case 'forgot-password':
                this.renderForgotPasswordView(main);
                break;
            case 'reset-password':
                this.renderResetPasswordView(main);
                break;
            case 'home':
                await this.renderHomeView(main);
                break;
            case 'restaurant-details':
                await this.renderRestaurantDetailsView(main, this.viewParams);
                break;
            case 'cart':
                await this.renderCartView(main);
                break;
            case 'order-tracking':
                await this.renderOrderTrackingView(main, this.viewParams);
                break;
            case 'dashboard':
                await this.renderDashboardView(main);
                break;
            case 'category-results':
                await this.renderCategoryResultsView(main, this.viewParams);
                break;
            case 'owner-restaurant-details':
                await this.renderOwnerRestaurantDetailsView(main, this.viewParams);
                break;
            default:
                main.innerHTML = `<h2 style="text-align:center; padding:100px 0;">404 - View Not Found</h2>`;
        }
        this.updateNavBar();
    },

    renderLoginView(main) {
        main.innerHTML = `
            <div class="auth-container glass-panel">
                <h2>Welcome Back</h2>
                <form onsubmit="App.handleLogin(event)">
                    <div class="form-group">
                        <label>Username</label>
                        <input type="text" id="login-username" required placeholder="customer, owner1, delivery1, admin...">
                    </div>
                    <div class="form-group">
                        <label>Password</label>
                        <input type="password" id="login-password" required placeholder="Enter password (default: password)">
                    </div>
                    <button class="btn btn-primary" style="width:100%; margin-top:10px;" type="submit">Sign In</button>
                    <p style="text-align:center; margin-top:12px; font-size:13px;">
                        <a onclick="App.navigateTo('forgot-password')" style="color:var(--text-muted); cursor:pointer; text-decoration:underline;">Forgot Password?</a>
                    </p>
                    <p style="text-align:center; margin-top:15px; font-size:13px; color:var(--text-muted);">
                        Don't have an account? <a onclick="App.navigateTo('register')" style="color:var(--primary); cursor:pointer; font-weight:600;">Sign Up</a>
                    </p>
                </form>

                <hr style="border-color:var(--border-color); margin: 20px 0;">
                <h4 style="font-size: 13px; font-weight: 800; margin-bottom: 12px; text-align: center; color: var(--text-muted);">🔑 Quick Demo Roles Access</h4>
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
                    <button class="btn btn-outline btn-sm" onclick="App.quickDemoLogin('customer', 'password')">Customer</button>
                    <button class="btn btn-outline btn-sm" onclick="App.quickDemoLogin('owner1', 'password')">Hotel Owner</button>
                    <button class="btn btn-outline btn-sm" onclick="App.quickDemoLogin('delivery1', 'password')">Delivery Boy</button>
                    <button class="btn btn-outline btn-sm" onclick="App.quickDemoLogin('admin', 'password')">Platform Admin</button>
                </div>
            </div>
        `;
    },

    async quickDemoLogin(user, pass) {
        document.getElementById('login-username').value = user;
        document.getElementById('login-password').value = pass;
        const fakeEvent = { preventDefault: () => {} };
        await this.handleLogin(fakeEvent);
    },

    renderRegisterView(main) {
        main.innerHTML = `
            <div class="auth-container glass-panel" style="max-width:500px;">
                <h2>Create Account</h2>
                <form onsubmit="App.handleRegister(event)">
                    <div class="form-group">
                        <label>Username</label>
                        <input type="text" id="reg-username" required placeholder="Choose unique username">
                    </div>
                    <div class="form-group">
                        <label>Email Address</label>
                        <input type="email" id="reg-email" required placeholder="you@example.com">
                    </div>
                    <div class="form-group">
                        <label>Password</label>
                        <input type="password" id="reg-password" required placeholder="Choose a secure password">
                    </div>
                    <div class="form-group">
                        <label>Role</label>
                        <select id="reg-role">
                            <option value="CUSTOMER">Customer (Order Food)</option>
                            <option value="OWNER">Restaurant Owner (Manage Menu/Orders)</option>
                            <option value="DELIVERY">Delivery Partner (Deliver Orders)</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Date of Birth (Optional - for Birthday Rewards)</label>
                        <input type="date" id="reg-birthday">
                    </div>
                    <button class="btn btn-primary" style="width:100%; margin-top:10px;" type="submit">Create Account</button>
                    <p style="text-align:center; margin-top:20px; font-size:13px; color:var(--text-muted);">
                        Already registered? <a onclick="App.navigateTo('login')" style="color:var(--primary); cursor:pointer; font-weight:600;">Sign In</a>
                    </p>
                </form>
            </div>
        `;
    },

    renderForgotPasswordView(main) {
        main.innerHTML = `
            <div class="auth-container glass-panel" style="max-width:450px;">
                <h2 style="margin-bottom:10px;">Forgot Password</h2>
                <p style="font-size:12px; color:var(--text-muted); margin-bottom:20px;">Enter your username or email address below to receive password reset instructions.</p>
                <form onsubmit="event.preventDefault(); App.showToast('Password reset link sent to your registered email.'); App.navigateTo('reset-password');">
                    <div class="form-group">
                        <label>Username or Email Address</label>
                        <input type="text" required placeholder="Enter username or email">
                    </div>
                    <button class="btn btn-primary" style="width:100%; margin-top:10px;" type="submit">Send Reset Link</button>
                    <p style="text-align:center; margin-top:20px; font-size:13px; color:var(--text-muted);">
                        Remembered your password? <a onclick="App.navigateTo('login')" style="color:var(--primary); cursor:pointer; font-weight:600;">Sign In</a>
                    </p>
                </form>
            </div>
        `;
    },

    renderResetPasswordView(main) {
        main.innerHTML = `
            <div class="auth-container glass-panel" style="max-width:450px;">
                <h2 style="margin-bottom:10px;">Reset Password</h2>
                <p style="font-size:12px; color:var(--text-muted); margin-bottom:20px;">Choose a new secure password for your account.</p>
                <form onsubmit="event.preventDefault(); App.showToast('Password reset successfully! Please sign in.'); App.navigateTo('login');">
                    <div class="form-group">
                        <label>New Password</label>
                        <input type="password" required placeholder="Enter new password">
                    </div>
                    <div class="form-group">
                        <label>Confirm New Password</label>
                        <input type="password" required placeholder="Confirm new password">
                    </div>
                    <button class="btn btn-primary" style="width:100%; margin-top:10px;" type="submit">Reset Password</button>
                    <p style="text-align:center; margin-top:20px; font-size:13px; color:var(--text-muted);">
                        Back to <a onclick="App.navigateTo('login')" style="color:var(--primary); cursor:pointer; font-weight:600;">Sign In</a>
                    </p>
                </form>
            </div>
        `;
    },

    async renderHomeView(main) {
        try {
            const res = await fetch('/api/restaurants');
            const data = await res.json();

            // Filter sets
            const topRated = data.filter(r => r.rating >= 4.5);
            const freeDelivery = data.filter(r => r.deliveryFee <= 30.0 || r.rating >= 4.6);

            main.innerHTML = `
                <!-- Home Hero Brand Logo Banner -->
                <div class="glass-panel" style="padding:20px 30px; border-radius:16px; margin-bottom:25px; display:flex; align-items:center; justify-content:space-between;">
                    <div style="display:flex; align-items:center; gap:18px;">
                        <img src="images/logo.png" alt="Food Fusion Logo" style="height:48px; max-height:55px; width:auto; object-fit:contain; filter:drop-shadow(0 4px 12px rgba(245,158,11,0.3));">
                        <div>
                            <h2 style="font-size:22px; font-weight:800; margin:0;">Welcome to Food Fusion</h2>
                            <p style="font-size:12px; color:var(--text-muted); margin-top:2px;">Discover India's most premium food & dining delivery experience</p>
                        </div>
                    </div>
                </div>

                <!-- Swiggy/Zomato Promo Slider -->
                ${Components.heroPromoSlider()}

                <!-- Cuisine Circle Carousel -->
                ${Components.homeCuisineChips()}

                <!-- Today's limited-time flash offer banner -->
                <div class="banner" style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); margin-bottom: 30px;">
                    <div class="banner-text">
                        <span style="background:rgba(255,255,255,0.2); padding: 3px 8px; border-radius:12px; font-size:11px; font-weight:800;">LIMITED TIME ONLY</span>
                        <h1 style="font-size:26px; margin-top:8px;"><i class="fa-solid fa-bolt text-warning me-2"></i>Lightning Quick Free Delivery</h1>
                        <p style="color:rgba(255,255,255,0.9); margin:8px 0 15px 0; font-size:14px;">Order from selected premium outlets and pay ZERO delivery fee today.</p>
                        <button class="btn btn-primary" onclick="App.showSpinModal()"><i class="fa-solid fa-circle-notch me-1 text-white"></i> Spin & Win Free Meal</button>
                    </div>
                    <div class="banner-img"><i class="fa-solid fa-motorcycle text-white-50" style="font-size:5rem;"></i></div>
                </div>

                <!-- Discovery Filters & Search Bar -->
                <div class="search-container" style="margin-bottom: 25px;">
                    <div class="search-input" style="position:relative;">
                        <input type="text" id="search-box" placeholder="Search pizza, burger, biryani, Starbucks, McDonald's..." oninput="App.handleSearch(this.value)">
                        <span style="position:absolute; right:15px; top:50%; transform:translateY(-50%); cursor:pointer; font-size:18px;" onclick="App.triggerVoiceSearch()"><i class="fa-solid fa-microphone text-muted"></i></span>
                    </div>
                </div>

                <!-- Horizontal Carousels Section -->
                <div style="margin-bottom: 35px;">
                    <h3 style="font-size: 18px; font-weight: 800; margin-bottom: 12px; color: var(--text-main);"><i class="fa-solid fa-star text-warning me-2"></i>Top Rated Restaurants</h3>
                    <div class="hero-carousel">
                        ${topRated.map(r => `
                            <div style="width: 250px; flex-shrink: 0;">
                                ${Components.restaurantCard(r)}
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div style="margin-bottom: 35px;">
                    <h3 style="font-size: 18px; font-weight: 800; margin-bottom: 12px; color: var(--text-main);"><i class="fa-solid fa-motorcycle text-success me-2"></i>Free Delivery Delights</h3>
                    <div class="hero-carousel">
                        ${freeDelivery.map(r => `
                            <div style="width: 250px; flex-shrink: 0;">
                                ${Components.restaurantCard(r)}
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="dashboard-wrapper">
                    <!-- Left Panel: All Restaurants with advanced filters -->
                    <div class="content-panel">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
                            <h3 style="font-size: 18px; font-weight: 800; color: var(--text-main);">Explore All Outlets</h3>
                            <!-- Sorting Filters -->
                            <select id="home-sort" onchange="App.handleHomeSort(this.value)" style="padding:6px 12px; border-radius:6px; background:var(--bg-input); color:var(--text-main); border:1px solid var(--border-color); font-size:12px;">
                                <option value="relevance">Sort: Relevance</option>
                                <option value="rating">Sort: Rating</option>
                                <option value="distance">Sort: Distance</option>
                                <option value="speed">Sort: Delivery Time</option>
                            </select>
                        </div>
                        
                        <!-- Advanced Filter Row -->
                        <div class="categories-row" style="margin-bottom: 20px;">
                            <span class="category-chip active" id="filter-all" onclick="App.filterHomeRestaurants('all')">All Restaurants</span>
                            <span class="category-chip" id="filter-rated" onclick="App.filterHomeRestaurants('rated')"><i class="fa-solid fa-star text-warning me-1"></i> Top Rated</span>
                            <span class="category-chip" id="filter-fast" onclick="App.filterHomeRestaurants('fast')"><i class="fa-solid fa-truck-fast text-warning me-1"></i> Fast Delivery</span>
                            <span class="category-chip" id="filter-free" onclick="App.filterHomeRestaurants('free')"><i class="fa-solid fa-motorcycle text-success me-1"></i> Free Delivery</span>
                            <span class="category-chip" id="filter-budget199" onclick="App.filterHomeRestaurants('budget199')"><i class="fa-solid fa-indian-rupee-sign text-success me-1"></i> Under ₹199</span>
                            <span class="category-chip" id="filter-budget299" onclick="App.filterHomeRestaurants('budget299')"><i class="fa-solid fa-indian-rupee-sign text-success me-1"></i> Under ₹299</span>
                            <span class="category-chip" id="filter-budget499" onclick="App.filterHomeRestaurants('budget499')"><i class="fa-solid fa-indian-rupee-sign text-success me-1"></i> Under ₹499</span>
                        </div>

                        <div class="grid-cols-3" id="restaurants-list">
                            ${data.map(r => Components.restaurantCard(r)).join('')}
                        </div>
                    </div>

                    <!-- Right Widgets Sidebar -->
                    <div class="sidebar glass-panel" style="width:320px; padding:20px; height:fit-content; position:sticky; top:100px;">
                        <h3 style="font-size:18px; font-weight:700; margin-bottom:15px; border-bottom:1px solid var(--border-color); padding-bottom:8px;"><i class="fa-solid fa-bolt text-warning me-2"></i>Fast Features</h3>
                        
                        <!-- Scratch Card Reward -->
                        <div style="margin-bottom: 20px; border-bottom: 1px dashed var(--border-color); padding-bottom: 15px;">
                            ${Components.scratchCardWidget(75)}
                        </div>

                        <!-- Budget Meal Finder -->
                        <div style="margin-bottom:20px; padding-bottom:15px; border-bottom:1px dashed var(--border-color);">
                            <strong style="font-size:14px; display:block; margin-bottom:6px;"><i class="fa-solid fa-wallet text-success me-1"></i>Budget Meal Finder</strong>
                            <div style="display:flex; gap:8px;">
                                <input type="number" id="budget-input" placeholder="Budget (₹)" style="width:100px; padding:6px 10px; border-radius:6px; border:1px solid var(--border-color); background:var(--bg-input); color:#fff;">
                                <button class="btn btn-primary btn-sm" onclick="App.findBudgetMeals()">Find</button>
                            </div>
                        </div>

                        <!-- Surprise Me -->
                        <div style="margin-bottom:20px; padding-bottom:15px; border-bottom:1px dashed var(--border-color);">
                            <strong style="font-size:14px; display:block; margin-bottom:6px;"><i class="fa-solid fa-dice text-info me-1"></i>Surprise Me</strong>
                            <p style="font-size:11px; color:var(--text-muted); margin-bottom:10px;">Can't decide? Let us pick a random meal based on your mood.</p>
                            <div style="display:flex; gap:8px;">
                                <select id="surprise-category" style="padding:6px; border-radius:6px; background:var(--bg-input); color:#fff; font-size:11px; border:1px solid var(--border-color); flex-grow:1;">
                                    <option value="ALL">All Categories</option>
                                    <option value="Mains">Mains</option>
                                    <option value="Starters">Starters</option>
                                    <option value="Desserts">Desserts</option>
                                </select>
                                <button class="btn btn-secondary btn-sm" onclick="App.surpriseMe()">Roll <i class="fa-solid fa-dice-five ms-1"></i></button>
                            </div>
                        </div>

                        <!-- Group Order Joiner -->
                        <div>
                            <strong style="font-size:14px; display:block; margin-bottom:6px;"><i class="fa-solid fa-users text-primary me-1"></i>Join Group Ordering</strong>
                            <p style="font-size:11px; color:var(--text-muted); margin-bottom:8px;">Enter group code shared by your friends to add items.</p>
                            <div style="display:flex; gap:8px;">
                                <input type="text" id="group-code-input" placeholder="Lobby Code" style="text-transform:uppercase; padding:6px 10px; border-radius:6px; border:1px solid var(--border-color); background:var(--bg-input); color:#fff; width:120px;">
                                <button class="btn btn-outline btn-sm" onclick="App.joinGroupOrder()">Join</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // Cache full list for client side filters/sorting
            this.allRestaurants = data;
        } catch (e) {
            main.innerHTML = `<h2 style="text-align:center; padding:100px 0; color:var(--danger);">Connection error. Failed to load home dashboard.</h2>`;
        }
    },

    async loadRestaurants(query = '') {
        const list = document.getElementById('restaurants-list');
        if (!list) return;

        try {
            const url = query ? `/api/restaurants/search?query=${encodeURIComponent(query)}` : '/api/restaurants';
            const res = await fetch(url);
            const data = await res.json();
            
            if (data.length === 0) {
                list.innerHTML = `<p style="color:var(--text-muted);">No restaurants found matching your criteria.</p>`;
                return;
            }

            list.innerHTML = data.map(r => Components.restaurantCard(r)).join('');
        } catch (e) {
            list.innerHTML = `<p style="color:var(--danger);">Error loading restaurants.</p>`;
        }
    },

    async filterRestaurantCuisine(cuisine) {
        document.querySelectorAll('.categories-row .category-chip').forEach(chip => {
            chip.classList.remove('active');
        });
        
        if (cuisine === 'ALL') {
            document.getElementById('cuisine-all').classList.add('active');
        } else if (cuisine === 'Indian') {
            document.getElementById('cuisine-indian').classList.add('active');
        } else if (cuisine === 'Chinese') {
            document.getElementById('cuisine-chinese').classList.add('active');
        } else if (cuisine === 'French') {
            document.getElementById('cuisine-french').classList.add('active');
        } else if (cuisine === 'American') {
            document.getElementById('cuisine-american').classList.add('active');
        }

        const list = document.getElementById('restaurants-list');
        if (!list) return;

        try {
            const res = await fetch('/api/restaurants');
            const data = await res.json();
            
            const filtered = cuisine === 'ALL' ? data : data.filter(r => {
                const rCuisine = r.cuisine || r.cuisineType || "";
                return rCuisine.trim().toLowerCase() === cuisine.trim().toLowerCase();
            });
            
            if (filtered.length === 0) {
                list.innerHTML = `<p style="color:var(--text-muted); padding:20px 0;">No restaurants found in this category.</p>`;
                return;
            }

            list.innerHTML = filtered.map(r => Components.restaurantCard(r)).join('');
        } catch (e) {
            list.innerHTML = `<p style="color:var(--danger);">Error loading cuisines.</p>`;
        }
    },

    handleSearch(val) {
        // Simple debounce
        if (this.searchTimeout) clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => this.loadRestaurants(val), 300);
    },

    async renderRestaurantDetailsView(main, id) {
        try {
            // Fetch restaurant details
            let res = await fetch(`/api/restaurants/${id}`);
            const restaurant = await res.json();
            
            // Fetch restaurant menu
            res = await fetch(`/api/restaurants/${id}/menu`);
            const menu = await res.json();

            // Fetch reviews
            res = await fetch(`/api/restaurants/${id}/reviews`);
            const reviews = await res.json();

            // Check if wishlisted
            const isWishlisted = this.wishlist.some(w => w.restaurant && w.restaurant.id === restaurant.id);
            const wishText = isWishlisted ? '❤️ Favorite' : '🤍 Add to Favorites';

            // Group menu by category
            const categories = [...new Set(menu.map(item => item.category))];

            main.innerHTML = `
                <div class="glass-panel" style="padding:40px 40px 20px 40px; border-radius:20px; margin-bottom:30px; background:linear-gradient(to bottom, rgba(22, 24, 37, 0.9), var(--bg-dark));">
                    <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:20px;">
                        <div>
                            <h2 style="font-size:32px; font-weight:800;">${restaurant.name}</h2>
                            <p style="color:var(--text-muted); margin-top:6px; font-size:15px;">${restaurant.description || 'No description available.'}</p>
                            <div style="display:flex; gap:16px; margin-top:15px; font-size:14px; color:var(--text-muted);">
                                <span><i class="fa-solid fa-utensils"></i> Cuisine: <strong>${restaurant.cuisineType}</strong></span>
                                <span>🕒 Hours: <strong>${restaurant.openTime} - ${restaurant.closeTime}</strong></span>
                                <span><i class="fa-solid fa-motorcycle"></i> Delivery: <strong>${restaurant.deliveryTimeMin} mins</strong></span>
                            </div>
                        </div>
                        <div style="text-align:right; display:flex; flex-direction:column; gap:10px;">
                            <span class="loyalty-badge tier-gold" style="font-size:16px; padding:6px 12px;">★ ${restaurant.rating} Stars</span>
                            <button class="btn btn-outline btn-sm" onclick="App.toggleWishlist(${restaurant.id}, null)">${wishText}</button>
                            ${this.user && this.user.role === 'CUSTOMER' ? `
                                <button class="btn btn-secondary btn-sm" onclick="App.showCreateGroupLobbyModal(${restaurant.id})"><i class="fa-solid fa-users"></i> Start Group Order</button>
                            ` : ''}
                        </div>
                    </div>
                </div>

                <div class="dashboard-wrapper">
                    <!-- Left: Menu list by Category -->
                    <div class="content-panel">
                        <!-- Custom Combo Builder Section -->
                        ${Components.comboBuilderSection(menu)}

                        <div style="margin-bottom:25px;">
                            <h3 style="font-size:22px; font-weight:700; margin-bottom:15px;">Our Menu</h3>
                            <div class="categories-row">
                                <span class="category-chip active" onclick="App.filterMenuCategory('ALL')">All Dishes</span>
                                ${categories.map(cat => `
                                    <span class="category-chip" onclick="App.filterMenuCategory('${cat}')">${cat}</span>
                                `).join('')}
                            </div>
                        </div>
                        
                        <div class="grid-cols-2" id="menu-items-grid">
                            ${menu.map(item => Components.menuItemCard(item)).join('')}
                        </div>
                    </div>

                    <!-- Right: Reviews Panel -->
                    <div class="sidebar" style="width:340px;">
                        <h3 style="font-size:18px; font-weight:700; margin-bottom:15px;">Customer Reviews</h3>
                        
                        <!-- Add Review Form -->
                        ${this.user ? `
                            <div class="glass-panel" style="padding:15px; margin-bottom:20px; border-radius:10px;">
                                <strong style="font-size:13px; display:block; margin-bottom:10px;">Add Your Rating</strong>
                                <div style="display:flex; gap:6px; font-size:20px; margin-bottom:10px; cursor:pointer;" id="star-selector">
                                    <span onclick="App.selectReviewRating(1)">☆</span>
                                    <span onclick="App.selectReviewRating(2)">☆</span>
                                    <span onclick="App.selectReviewRating(3)">☆</span>
                                    <span onclick="App.selectReviewRating(4)">☆</span>
                                    <span onclick="App.selectReviewRating(5)">☆</span>
                                </div>
                                <textarea id="review-text-input" placeholder="Write feedback details..." style="width:100%; height:60px; padding:8px; border-radius:6px; background:var(--bg-input); border:1px solid var(--border-color); color:#fff; font-size:12px; resize:none; font-family:var(--font-family); outline:none; margin-bottom:10px;"></textarea>
                                <button class="btn btn-primary btn-sm" style="width:100%;" onclick="App.submitReview(${restaurant.id})">Post Review</button>
                            </div>
                        ` : ''}

                        <div id="reviews-list">
                            ${reviews.length === 0 ? '<p style="color:var(--text-muted); font-size:12px;">No reviews posted yet.</p>' : ''}
                            ${reviews.map(rev => Components.reviewItem(rev)).join('')}
                        </div>
                    </div>
                </div>
            `;
            
            // Cache menu items for filtering/modal customization
            this.activeRestaurantMenu = menu;
            this.selectedRating = 5; // default review stars
        } catch (e) {
            main.innerHTML = `<h2 style="text-align:center; padding:100px 0; color:var(--danger);">Error loading details.</h2>`;
        }
    },

    filterMenuCategory(cat) {
        // Toggle active chip
        document.querySelectorAll('.category-chip').forEach(chip => {
            if (chip.innerText.trim().toLowerCase() === cat.trim().toLowerCase() || (cat === 'ALL' && chip.innerText.trim() === 'All Dishes')) {
                chip.classList.add('active');
            } else {
                chip.classList.remove('active');
            }
        });

        const grid = document.getElementById('menu-items-grid');
        if (!grid || !this.activeRestaurantMenu) return;

        const filtered = cat === 'ALL' ? this.activeRestaurantMenu : this.activeRestaurantMenu.filter(item => item.category === cat);
        grid.innerHTML = filtered.map(item => Components.menuItemCard(item)).join('');
    },

    selectReviewRating(rating) {
        this.selectedRating = rating;
        const stars = document.getElementById('star-selector').children;
        for (let i = 0; i < 5; i++) {
            stars[i].innerText = i < rating ? '★' : '☆';
            stars[i].style.color = i < rating ? '#fbbf24' : 'var(--text-muted)';
        }
    },

    async submitReview(restaurantId) {
        const textInput = document.getElementById('review-text-input');
        if (!textInput.value.trim()) {
            this.showToast("Review text cannot be empty!", "error");
            return;
        }

        try {
            const res = await fetch(`/api/restaurants/${restaurantId}/reviews`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    rating: this.selectedRating,
                    reviewText: textInput.value
                })
            });

            if (res.ok) {
                this.showToast("Review posted successfully!");
                await this.renderRestaurantDetailsView(document.getElementById('main-content'), restaurantId);
            } else {
                const err = await res.json();
                this.showToast(err.error || "Failed to submit review", "error");
            }
        } catch (e) {
            this.showToast("Connection issue.", "error");
        }
    },

    // --- Shopping Cart Page & Checkout ---
    async renderCartView(main) {
        await this.fetchCart();
        
        let subtotal = 0.0;
        this.cart.forEach(item => subtotal += item.menuItem.price * item.quantity);
        
        let discount = 0.0;
        if (this.coupon) {
            if (this.coupon.discountAmount > 0) discount = this.coupon.discountAmount;
            else if (this.coupon.discountPercent > 0) discount = (subtotal * this.coupon.discountPercent) / 100;
        }

        const deliveryFee = this.cart.length > 0 ? 40.00 : 0.00;
        const platformFee = this.cart.length > 0 ? 10.00 : 0.00;
        const tax = Math.max(0, 0.05 * (subtotal - discount));
        
        // Eco Packaging surcharge
        const packagingSelect = document.getElementById('packaging-select');
        const isEco = packagingSelect ? packagingSelect.value === 'ECO' : false;
        const packagingFee = isEco ? 15.00 : 0.00;

        // Dynamic tip
        const currentTip = this.deliveryTip || 0;

        // Feed child donation
        const donateCheckbox = document.getElementById('donate-checkbox');
        const isDonating = donateCheckbox ? donateCheckbox.checked : false;
        const donationFee = isDonating ? 10.00 : 0.00;

        const total = Math.max(0, subtotal - discount + deliveryFee + platformFee + tax + packagingFee + currentTip + donationFee);

        if (this.cart.length === 0) {
            main.innerHTML = `
                <div style="text-align:center; padding:100px 20px;">
                    <div style="font-size:64px; margin-bottom:20px;"><i class="fa-solid fa-cart-shopping"></i></div>
                    <h2>Your Cart is Empty</h2>
                    <p style="color:var(--text-muted); margin-top:8px;">Browse our menu to add mouth-watering items!</p>
                    <button class="btn btn-primary" style="margin-top:20px;" onclick="App.navigateTo('home')">Explore Restaurants</button>
                </div>
            `;
            return;
        }

        // Fetch User Saved Addresses
        const addRes = await fetch('/api/auth/addresses');
        const addresses = await addRes.json();

        main.innerHTML = `
            <h2 style="font-size:28px; font-weight:800; margin-bottom:25px;">Checkout Details</h2>
            
            <div class="dashboard-wrapper">
                <!-- Left: Form inputs for address, packaging, coupons -->
                <div class="content-panel glass-panel" style="padding:30px; border-radius:16px;">
                    
                    ${this.groupSession ? `
                        <div class="glass-panel" style="padding:15px; margin-bottom:25px; border-color:var(--secondary); background:rgba(99,102,241,0.05);">
                            <h4 style="color:var(--secondary); font-size:15px; font-weight:700;"><i class="fa-solid fa-users"></i> Shared Group Cart: ${this.groupSession.code}</h4>
                            <p style="font-size:12px; color:var(--text-muted); margin-top:4px;">You are currently checking out the entire shared group cart.</p>
                        </div>
                    ` : ''}

                    <!-- Address Select -->
                    <div class="form-group" style="margin-bottom:25px;">
                        <label style="font-size:16px; color:#fff; font-weight:700;">1. Select Delivery Address</label>
                        ${addresses.length === 0 ? `
                            <p style="font-size:13px; color:var(--text-muted); margin:10px 0;">No addresses saved yet.</p>
                            <button class="btn btn-outline btn-sm" onclick="App.showAddAddressModal()">+ Add New Address</button>
                        ` : `
                            <select id="checkout-address" style="margin-top:10px;">
                                ${addresses.map(a => `<option value="${a.addressLine}, ${a.city}" ${a.default ? 'selected' : ''}>${a.addressLine}, ${a.city} (${a.zipCode})</option>`).join('')}
                            </select>
                        `}
                    </div>

                    <!-- Packaging Toggle -->
                    <div class="form-group" style="margin-bottom:25px;">
                        <label style="font-size:16px; color:#fff; font-weight:700;">2. Packaging Options</label>
                        <select id="packaging-select" style="margin-top:10px;" onchange="App.recalculateCartValues()">
                            <option value="STANDARD">Standard Packaging (Free)</option>
                            <option value="ECO"><i class="fa-solid fa-leaf"></i> Eco-Friendly Packaging (Sustainable bags, +₹15.00)</option>
                        </select>
                    </div>

                    <!-- Coupon Code Input -->
                    <div class="form-group" style="margin-bottom:25px;">
                        <label style="font-size:16px; color:#fff; font-weight:700;">3. Apply Promo Coupon</label>
                        <div style="display:flex; gap:10px; margin-top:10px;">
                            <input type="text" id="coupon-input" placeholder="WELCOME50, FEAST20..." value="${this.coupon ? this.coupon.code : ''}" style="text-transform:uppercase;">
                            <button class="btn btn-outline" onclick="App.applyPromoCoupon()">Apply</button>
                        </div>
                        ${this.coupon ? `<div style="font-size:12px; color:var(--success); margin-top:6px; font-weight:600;">✓ Coupon applied: ${this.coupon.description}</div>` : ''}
                    </div>

                    <!-- Scheduled Order Option -->
                    <div class="form-group" style="margin-bottom:25px;">
                        <label style="font-size:16px; color:#fff; font-weight:700;">4. Future Delivery Schedule (Optional)</label>
                        <input type="datetime-local" id="schedule-time" style="margin-top:10px; max-width:250px;">
                        <span style="display:block; font-size:11px; color:var(--text-muted); margin-top:4px;">Leave blank for immediate delivery.</span>
                    </div>

                    <!-- Gift Option -->
                    <div class="form-group" style="margin-bottom:25px;">
                        <label style="font-size:16px; color:#fff; font-weight:700; display:flex; align-items:center; gap:10px;">
                            <input type="checkbox" id="gift-checkbox" onchange="document.getElementById('gift-message-group').style.display = this.checked ? 'block' : 'none'" style="width:auto; cursor:pointer;">
                            <i class="fa-solid fa-gift text-warning me-1"></i> Gift this order to a friend?
                        </label>
                        <div id="gift-message-group" style="display:none; margin-top:10px;">
                            <textarea id="gift-message" placeholder="Write a personalized greeting message..." style="height:65px; resize:none;"></textarea>
                        </div>
                    </div>

                    <!-- Payment Option -->
                    <div class="form-group" style="margin-bottom:30px;">
                        <label style="font-size:16px; color:#fff; font-weight:700;">5. Payment Method</label>
                        <select id="checkout-payment" style="margin-top:10px;">
                            <option value="COD">Cash on Delivery (COD)</option>
                            <option value="UPI">UPI Payments (Mock Validation)</option>
                            <option value="CARD">Debit / Credit Card (Mock Secure Pay)</option>
                        </select>
                    </div>

                    <button class="btn btn-primary" style="width:100%; font-size:16px; padding:14px;" onclick="App.placeOrder()">Place Secure Order <i class="fa-solid fa-lock ms-1"></i></button>
                </div>

                <!-- Right: Summary Sidebar -->
                <div class="sidebar" style="width:380px; padding:0;" id="cart-summary-wrapper">
                    ${Components.cartSummary(this.cart, subtotal, discount, deliveryFee, platformFee, tax, packagingFee, total, currentTip)}
                </div>
            </div>
        `;
    },

    recalculateCartValues() {
        // Simple UI refresh to catch packaging surcharge update
        this.renderCartView(document.getElementById('main-content'));
    },

    setDeliveryTip(amount) {
        this.deliveryTip = amount;
        this.recalculateCartValues();
    },

    async fetchCart() {
        if (this.groupSession) {
            const res = await fetch(`/api/features/group-ordering/items?code=${this.groupSession.code}`);
            this.cart = await res.json();
        } else {
            const res = await fetch('/api/cart');
            this.cart = await res.json();
        }
    },

    async adjustCartQty(cartItemId, newQty) {
        if (this.groupSession) {
            // Group ordering quantities should be adjusted via general flow or left static
            this.showToast("Group order quantities are added in lobby.", "error");
            return;
        }

        try {
            const res = await fetch(`/api/cart/${cartItemId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ quantity: newQty })
            });

            if (res.ok) {
                await this.renderCartView(document.getElementById('main-content'));
            }
        } catch (e) {
            this.showToast("Error updating quantities.", "error");
        }
    },

    async applyPromoCoupon() {
        const codeInput = document.getElementById('coupon-input');
        if (!codeInput.value.trim()) {
            this.showToast("Enter a coupon code first!", "error");
            return;
        }

        let subtotal = 0.0;
        this.cart.forEach(item => subtotal += item.menuItem.price * item.quantity);

        try {
            // Validate coupon via backend
            const res = await fetch(`/api/cart`); // just to query endpoint or validate directly
            const validCouponRes = await fetch(`/api/orders/place`); // validate endpoint mock
            
            // To make it simple, let's call the helper
            const couponValRes = await fetch('/api/admin/coupons'); // get available coupons
            const coupons = await couponValRes.json();
            const matching = coupons.find(c => c.code === codeInput.value.trim().toUpperCase());
            
            if (matching && matching.active) {
                if (subtotal >= matching.minOrderValue) {
                    this.coupon = matching;
                    this.showToast("Coupon applied successfully!");
                    this.renderCartView(document.getElementById('main-content'));
                } else {
                    this.showToast(`Order must be at least ₹${matching.minOrderValue} to apply this code!`, "error");
                }
            } else {
                this.showToast("Invalid or expired coupon code.", "error");
            }
        } catch (e) {
            this.showToast("Failed to apply coupon.", "error");
        }
    },

    async placeOrder() {
        const addressSelect = document.getElementById('checkout-address');
        if (!addressSelect) {
            this.showToast("Save a shipping address first!", "error");
            return;
        }

        const address = addressSelect.value;
        const payment = document.getElementById('checkout-payment').value;
        const packaging = document.getElementById('packaging-select').value;
        const isGift = document.getElementById('gift-checkbox').checked;
        const giftMsg = isGift ? document.getElementById('gift-message').value : '';
        const scheduleVal = document.getElementById('schedule-time').value;

        // payload
        const payload = {
            addressLine: address,
            paymentMethod: payment,
            couponCode: this.coupon ? this.coupon.code : '',
            packagingOption: packaging,
            isGift: isGift,
            giftMessage: giftMsg,
            scheduledTime: scheduleVal,
            groupCode: this.groupSession ? this.groupSession.code : '',
            deliveryTip: this.deliveryTip || 0.0
        };

        try {
            const res = await fetch('/api/orders/place', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                const placed = await res.json();
                this.showToast("Order Placed Successfully!");
                this.cart = [];
                this.coupon = null;
                this.groupSession = null;
                this.navigateTo('order-tracking', placed.id);
            } else {
                const err = await res.json();
                this.showToast(err.error || "Checkout failed", "error");
            }
        } catch (e) {
            this.showToast("Checkout connection failed", "error");
        }
    },

    // --- Live Order Tracking & Chat View ---
    async renderOrderTrackingView(main, orderId) {
        try {
            const res = await fetch(`/api/orders/${orderId}/track`);
            if (!res.ok) {
                main.innerHTML = `<h2 style="text-align:center; padding:100px 0; color:var(--danger);">Unauthorized view</h2>`;
                return;
            }
            const track = await res.json();

            // Fetch order items to list in summary
            const orderDetailsRes = await fetch(`/api/orders/${orderId}`);
            const details = await orderDetailsRes.json();

            main.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                    <h2>Tracking Order #${orderId}</h2>
                    <a class="btn btn-outline btn-sm" href="/api/orders/${orderId}/invoice" download><i class="fa-solid fa-file-pdf text-danger me-1"></i> Download PDF Invoice</a>
                </div>

                <div class="dashboard-wrapper">
                    <!-- Left: tracking progress timeline -->
                    <div class="content-panel">
                        <div id="tracking-timeline-wrapper">
                            ${Components.orderProgressTimeline(track)}
                        </div>

                        <!-- Chat with Restaurant Interface -->
                        <div class="glass-panel" style="padding:20px; border-radius:16px;">
                            <h3 style="font-size:16px; font-weight:700;"><i class="fa-solid fa-comments text-info me-2"></i>Restaurant Chat Help</h3>
                            <div class="chat-window">
                                <div class="chat-messages" id="chat-messages-box">
                                    <p style="color:var(--text-muted); font-size:12px; text-align:center; padding:20px 0;">Start messaging the restaurant regarding order updates...</p>
                                </div>
                                <div class="chat-input-row">
                                    <input type="text" id="chat-message-input" placeholder="Type order related instructions..." style="flex-grow:1; padding:10px; border-radius:8px; border:1px solid var(--border-color); background:var(--bg-input); color:#fff;" onkeydown="if(event.key === 'Enter') App.sendChatMessage(${orderId})">
                                    <button class="btn btn-primary btn-sm" onclick="App.sendChatMessage(${orderId})">Send</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Right: Order items summary card -->
                    <div class="sidebar" style="width:340px; padding:20px;">
                        <h4 style="font-size:16px; font-weight:700; margin-bottom:12px; border-bottom:1px solid var(--border-color); padding-bottom:8px;">Order Details</h4>
                        <div style="font-size:13px; color:var(--text-muted); margin-bottom:15px;">
                            <div>Payment: <strong>${details.paymentMethod}</strong></div>
                            <div>Address: <strong>${details.deliveryAddress}</strong></div>
                            ${details.scheduledTime ? `<div style="color:var(--primary); font-weight:600;">Scheduled for: ${details.scheduledTime.replace("T", " ")}</div>` : ''}
                        </div>
                        <h4 style="font-size:14px; font-weight:700; margin-bottom:10px;">Summary</h4>
                        <div style="font-size:13px; max-height:200px; overflow-y:auto;">
                            <!-- items details are shown in invoice download but we list simple details here -->
                            <div style="display:flex; justify-content:space-between; font-weight:700; border-top:1px solid var(--border-color); padding-top:8px; margin-top:8px;">
                                <span>Total Paid:</span>
                                <span style="color:var(--primary);">₹${details.totalAmount.toFixed(2)}</span>
                            </div>
                        </div>
                        ${details.status === 'DELIVERED' ? `
                            <button class="btn btn-outline btn-sm" style="width:100%; margin-top:20px;" onclick="App.reorder(${details.id})"><i class="fa-solid fa-arrows-rotate me-1"></i> Reorder Items</button>
                        ` : ''}
                        ${details.status === 'PLACED' ? `
                            <button class="btn btn-outline btn-sm" style="width:100%; margin-top:20px; border-color:#ef4444; color:#ef4444;" onclick="App.cancelOrder(${details.id})"><i class="fa-solid fa-circle-xmark me-1"></i> Cancel Order</button>
                        ` : ''}
                    </div>
                </div>
            `;

            // Start chat message poll
            this.pollChatMessages(orderId);
            this.chatInterval = setInterval(() => this.pollChatMessages(orderId), 3000);

        } catch (e) {
            main.innerHTML = `<h2 style="text-align:center; padding:100px 0; color:var(--danger);">Error rendering tracking dashboard.</h2>`;
        }
    },

    async pollChatMessages(orderId) {
        const box = document.getElementById('chat-messages-box');
        if (!box) return;

        try {
            const res = await fetch(`/api/features/chat?orderId=${orderId}`);
            const messages = await res.json();
            
            if (messages.length === 0) return;

            box.innerHTML = messages.map(m => {
                const isMe = m.sender === this.user.username;
                return `
                    <div class="chat-bubble ${isMe ? 'me' : 'them'}">
                        <strong>@${m.sender}:</strong>
                        <div>${m.message}</div>
                        <div style="font-size:9px; text-align:right; margin-top:3px; opacity:0.7;">${m.timestamp.substring(11, 16)}</div>
                    </div>
                `;
            }).join('');
            box.scrollTop = box.scrollHeight; // Auto-scroll to bottom
        } catch (e) {}
    },

    async sendChatMessage(orderId) {
        const input = document.getElementById('chat-message-input');
        if (!input.value.trim()) return;

        try {
            const res = await fetch('/api/features/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId: orderId,
                    message: input.value
                })
            });

            if (res.ok) {
                input.value = '';
                await this.pollChatMessages(orderId);
            }
        } catch (e) {
            this.showToast("Message failed to send.", "error");
        }
    },

    async cancelOrder(orderId) {
        if (!confirm("Are you sure you want to cancel this order?")) return;
        try {
            const res = await fetch(`/api/orders/${orderId}/cancel`, { method: 'PUT' });
            if (res.ok) {
                this.showToast("Order cancelled successfully!");
                this.renderView();
            } else {
                const err = await res.json();
                this.showToast(err.error, "error");
            }
        } catch (e) {
            this.showToast("Cancellation failed", "error");
        }
    },

    async reorder(orderId) {
        try {
            const res = await fetch(`/api/orders/${orderId}/reorder`, { method: 'POST' });
            if (res.ok) {
                const data = await res.json();
                this.showToast(data.message);
                this.navigateTo('cart');
            }
        } catch (e) {
            this.showToast("Failed to reorder", "error");
        }
    },

    // --- User/Admin/Owner Dashboards router ---
    async renderDashboardView(main) {
        if (this.user.role === 'OWNER') {
            await this.renderOwnerPanel(main);
        } else if (this.user.role === 'DELIVERY') {
            await this.renderDeliveryPanel(main);
        } else if (this.user.role === 'ADMIN') {
            await this.renderAdminPanel(main);
        } else {
            await this.renderCustomerDashboard(main);
        }
    },

    // --- Customer Dashboard Details ---
    async renderCustomerDashboard(main) {
        // Sync progress
        await this.syncUserData();

        // Compute Customer profile summary stats
        const ordersRes = await fetch('/api/orders/history');
        const history = await ordersRes.json();

        let totalSpend = 0.0;
        history.forEach(o => {
            if (o.status === 'DELIVERED') totalSpend += o.totalAmount;
        });

        main.innerHTML = `
            <div class="glass-panel" style="padding:30px; border-radius:20px; margin-bottom:30px;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <div>
                        <h2 style="font-size:26px;"><i class="fa-solid fa-circle-user text-primary me-2"></i>Hello, @${this.user.username}!</h2>
                        <p style="color:var(--text-muted); margin-top:4px;">Membership Tier: 
                            <span class="loyalty-badge tier-${this.user.loyaltyLevel.toLowerCase()}">${this.user.loyaltyLevel}</span>
                        </p>
                    </div>
                    <div style="text-align:right;">
                        <span style="font-size:12px; color:var(--text-muted);">Loyalty Balance</span>
                        <div style="font-size:28px; font-weight:800; color:var(--primary);">${this.user.loyaltyPoints} PTS</div>
                    </div>
                </div>
            </div>

            <div class="dashboard-wrapper">
                <!-- Left Content: History & Favorites -->
                <div class="content-panel" style="display:flex; flex-direction:column; gap:30px;">
                    
                    <!-- Food Spending Analytics -->
                    ${Components.spendingAnalytics({ totalSalesAmount: totalSpend })}

                    <!-- Favorite Restaurants & Foods -->
                    <div class="glass-panel" style="padding:20px;">
                        <h3 style="font-size:18px; font-weight:700; margin-bottom:15px;"><i class="fa-solid fa-heart text-danger me-2"></i>Favorites Wishlist</h3>
                        <div style="display:flex; flex-direction:column; gap:10px;">
                            ${this.wishlist.length === 0 ? '<p style="color:var(--text-muted); font-size:12px;">No favorites saved yet.</p>' : ''}
                            ${this.wishlist.map(w => {
                                if (w.restaurant) {
                                    return `
                                        <div style="display:flex; justify-content:space-between; align-items:center; padding:10px; background:rgba(255,255,255,0.02); border-radius:8px; border:1px solid var(--border-color);">
                                            <span><i class="fa-solid fa-store text-warning me-1"></i> <strong>${w.restaurant.name}</strong> (${w.restaurant.cuisineType})</span>
                                            <div style="display:flex; gap:10px;">
                                                <button class="btn btn-primary btn-sm" onclick="App.navigateTo('restaurant-details', ${w.restaurant.id})">Order Menu</button>
                                                <button class="btn btn-outline btn-sm" style="border-color:#ef4444; color:#ef4444;" onclick="App.toggleWishlist(${w.restaurant.id}, null)">Remove</button>
                                            </div>
                                        </div>
                                    `;
                                } else {
                                    return `
                                        <div style="display:flex; justify-content:space-between; align-items:center; padding:10px; background:rgba(255,255,255,0.02); border-radius:8px; border:1px solid var(--border-color);">
                                            <span><i class="fa-solid fa-burger text-warning me-1"></i> <strong>${w.menuItem.name}</strong> - ₹${w.menuItem.price.toFixed(2)}</span>
                                            <div style="display:flex; gap:10px;">
                                                <button class="btn btn-primary btn-sm" onclick="App.quickOrderWishlistItem(${w.menuItem.id})">Quick Order</button>
                                                <button class="btn btn-outline btn-sm" style="border-color:#ef4444; color:#ef4444;" onclick="App.toggleWishlist(null, ${w.menuItem.id})">Remove</button>
                                            </div>
                                        </div>
                                    `;
                                }
                            }).join('')}
                        </div>
                    </div>

                    <!-- Order History -->
                    <div class="glass-panel" style="padding:20px;">
                        <h3 style="font-size:18px; font-weight:700; margin-bottom:15px;"><i class="fa-solid fa-clock-rotate-left text-success me-2"></i>Past Orders</h3>
                        <div style="display:flex; flex-direction:column; gap:12px;">
                            ${history.length === 0 ? '<p style="color:var(--text-muted); font-size:12px;">No orders found.</p>' : ''}
                            ${history.map(o => `
                                <div style="padding:12px; border-radius:10px; background:rgba(255,255,255,0.02); border:1px solid var(--border-color); display:flex; justify-content:space-between; align-items:center;">
                                    <div>
                                        <strong>Order #${o.id} - ${o.restaurant.name}</strong>
                                        <div style="font-size:11px; color:var(--text-muted); margin-top:4px;">Date: ${o.orderTime.substring(0, 10)} | Payout: ₹${o.totalAmount.toFixed(2)}</div>
                                    </div>
                                    <div style="display:flex; gap:10px; align-items:center;">
                                        <span class="loyalty-badge tier-silver" style="font-size:10px;">${o.status}</span>
                                        <button class="btn btn-outline btn-sm" onclick="App.navigateTo('order-tracking', ${o.id})">Track</button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>

                <!-- Right Sidebar: Challenges & Account settings -->
                <div class="sidebar" style="width:340px; padding:0; display:flex; flex-direction:column; gap:30px;">
                    <!-- Scratch Card Mystery Points Widget -->
                    ${Components.scratchCardWidget(100)}

                    <!-- Challenges list -->
                    <div class="glass-panel" style="padding:20px;">
                        <h3 style="font-size:18px; font-weight:700; margin-bottom:15px;"><i class="fa-solid fa-trophy text-warning me-2"></i>Food Challenges</h3>
                        <div style="display:flex; flex-direction:column; gap:12px;">
                            ${this.challenges.map(c => Components.challengeProgressCard(c)).join('')}
                        </div>
                    </div>

                    <!-- Account Details -->
                    <div class="glass-panel" style="padding:20px;">
                        <h3 style="font-size:18px; font-weight:700; margin-bottom:15px;"><i class="fa-solid fa-map-location-dot me-2"></i>Address Management</h3>
                        <button class="btn btn-outline btn-sm" style="width:100%;" onclick="App.showAddAddressModal()">+ Manage Saved Addresses</button>
                    </div>
                </div>
            </div>
        `;
    },

    async fetchWishlist() {
        const res = await fetch('/api/features/wishlist');
        this.wishlist = await res.json();
    },

    async fetchChallenges() {
        const res = await fetch('/api/features/challenges');
        this.challenges = await res.json();
    },

    async quickOrderWishlistItem(menuItemId) {
        try {
            const res = await fetch('/api/cart', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ menuItemId: menuItemId, quantity: 1, customizations: 'Standard Quick Order' })
            });

            if (res.ok) {
                this.showToast("Quick order item added to cart!");
                this.navigateTo('cart');
            }
        } catch (e) {
            this.showToast("Quick order failed.", "error");
        }
    },

    async toggleWishlist(restaurantId, menuItemId) {
        try {
            const res = await fetch('/api/features/wishlist/toggle', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ restaurantId, menuItemId })
            });

            if (res.ok) {
                const data = await res.json();
                this.showToast(`Item ${data.action === 'added' ? 'favorited' : 'removed favorite'}!`);
                await this.syncUserData();
                this.renderView();
            }
        } catch (e) {
            this.showToast("Wishlist toggle connection failed.", "error");
        }
    },

    // --- Restaurant Owner Panel details ---
    async renderOwnerPanel(main) {
        try {
            // Get owner restaurants
            let res = await fetch('/api/owner/restaurants');
            const restaurants = await res.json();

            // Setup default restaurant metrics
            let report = { totalSales: 0, totalOrders: 0, completedOrders: 0, popularItems: {} };
            let activeOrders = [];
            let reviewData = null;
            
            if (restaurants.length > 0) {
                const defaultRestId = restaurants[0].id;
                res = await fetch(`/api/owner/restaurants/${defaultRestId}/sales-report`);
                if (res.ok) report = await res.json();

                res = await fetch(`/api/owner/restaurants/${defaultRestId}/orders`);
                if (res.ok) activeOrders = await res.json();

                res = await fetch(`/api/owner/restaurants/${defaultRestId}/reviews`);
                if (res.ok) reviewData = await res.json();
            }

            main.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:25px;">
                    <h2>👨‍🍳 Restaurant Owner Dashboard</h2>
                    <button class="btn btn-primary" onclick="App.showRegisterRestaurantModal()">+ Register New Restaurant</button>
                </div>
                
                <div id="owner-dashboard-wrapper">
                    ${Components.ownerDashboard(report, restaurants, activeOrders, reviewData)}
                </div>
            `;
            
            this.ownerRestaurants = restaurants;
        } catch (e) {
            main.innerHTML = `<h2 style="text-align:center; padding:100px 0; color:var(--danger);">Error loading Owner Dashboard.</h2>`;
        }
    },

    async renderOwnerRestaurantDetailsView(main, restaurantId) {
        try {
            // We can re-use the public API to get restaurant details and menu items
            let res = await fetch(`/api/restaurants/${restaurantId}`);
            if (!res.ok) {
                this.navigateTo('dashboard');
                return;
            }
            const restaurant = await res.json();

            res = await fetch(`/api/restaurants/${restaurantId}/menu`);
            const menu = await res.json();

            main.innerHTML = Components.ownerRestaurantManagement(restaurant, menu);
        } catch (e) {
            main.innerHTML = `<h2 style="text-align:center; padding:100px 0; color:var(--danger);">Error loading Restaurant Details.</h2>`;
        }
    },

    async deleteRestaurant(restaurantId) {
        if (!confirm("Are you sure you want to permanently delete this restaurant and all its dishes?")) return;

        try {
            const res = await fetch(`/api/owner/restaurants/${restaurantId}`, { method: 'DELETE' });
            if (res.ok) {
                this.showToast("Restaurant deleted successfully!");
                this.navigateTo('dashboard');
            } else {
                const err = await res.json();
                this.showToast(err.error || "Failed to delete restaurant", "error");
            }
        } catch (e) {
            this.showToast("Connection failed.", "error");
        }
    },

    async deleteMenuItem(itemId) {
        if (!confirm("Delete this dish from the menu?")) return;

        try {
            const res = await fetch(`/api/owner/menu/${itemId}`, { method: 'DELETE' });
            if (res.ok) {
                this.showToast("Dish deleted.");
                this.renderView();
            } else {
                const err = await res.json();
                this.showToast(err.error || "Failed to delete dish", "error");
            }
        } catch (e) {
            this.showToast("Connection failed.", "error");
        }
    },

    downloadSalesReportPdf(restaurantId) {
        // Trigger browser download of PDF from backend
        const link = document.createElement('a');
        link.href = `/api/owner/restaurants/${restaurantId}/sales-report/pdf`;
        link.download = `sales-report-${restaurantId}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        this.showToast('Downloading PDF Sales Report...');
    },

    async toggleRestaurantStatus(id) {
        try {
            const res = await fetch(`/api/owner/restaurants/${id}/toggle`, { method: 'PUT' });
            if (res.ok) {
                this.showToast("Restaurant status updated.");
                this.renderView();
            }
        } catch (e) {
            this.showToast("Update failed.", "error");
        }
    },

    showAddMenuItemModal(restaurantId) {
        this.openModal('Add Menu Item', `
            <form onsubmit="App.submitNewMenuItem(event, ${restaurantId})">
                <div class="form-group">
                    <label>Dish Name</label>
                    <input type="text" id="new-dish-name" required placeholder="e.g. Chicken Tikka Masala">
                </div>
                <div class="form-group">
                    <label>Description</label>
                    <textarea id="new-dish-desc" rows="2" placeholder="Brief description of the dish..."></textarea>
                </div>
                <div class="grid-cols-2">
                    <div class="form-group">
                        <label>Price (₹)</label>
                        <input type="number" step="0.01" id="new-dish-price" required>
                    </div>
                    <div class="form-group">
                        <label>Category</label>
                        <select id="new-dish-category">
                            <option value="Starters">Starters</option>
                            <option value="Mains">Mains</option>
                            <option value="Desserts">Desserts</option>
                            <option value="Beverages">Beverages</option>
                            <option value="Breads">Breads</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label>Image URL (Optional)</label>
                    <input type="text" id="new-dish-image" placeholder="https://...">
                </div>
                <div class="form-group" style="display:flex; align-items:center; gap:10px;">
                    <input type="checkbox" id="new-dish-veg" style="width:auto; margin:0;">
                    <label style="margin:0; font-size:14px; font-weight:600;">Is this a Vegetarian dish? <i class="fa-solid fa-leaf text-success"></i></label>
                </div>
                <button type="submit" class="btn btn-primary" style="width:100%; margin-top:20px;">Save Menu Item</button>
            </form>
        `);
    },

    async submitNewMenuItem(e, restaurantId) {
        e.preventDefault();
        const payload = {
            name: document.getElementById('new-dish-name').value,
            description: document.getElementById('new-dish-desc').value,
            price: parseFloat(document.getElementById('new-dish-price').value),
            category: document.getElementById('new-dish-category').value,
            imageUrl: document.getElementById('new-dish-image').value,
            isVeg: document.getElementById('new-dish-veg').checked
        };

        try {
            const res = await fetch(`/api/owner/restaurants/${restaurantId}/menu`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                this.closeModal();
                this.showToast("Menu item added successfully!");
                this.renderView();
            } else {
                const err = await res.json();
                this.showToast(err.error || "Failed to add menu item", "error");
            }
        } catch (e) {
            this.showToast("Connection failed", "error");
        }
    },

    async updateOwnerOrderStatus(orderId, status) {
        try {
            const res = await fetch(`/api/owner/orders/${orderId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });

            if (res.ok) {
                this.showToast(`Order status updated to ${status}`);
                this.renderView();
            }
        } catch (e) {
            this.showToast("Failed to process order", "error");
        }
    },

    // --- Delivery Partner Panel details ---
    async renderDeliveryPanel(main) {
        try {
            if (!this.activeVehicle) this.activeVehicle = 'SCOOTER';

            let res = await fetch('/api/delivery/dashboard');
            const dashboard = await res.json();

            res = await fetch(`/api/delivery/orders/available?vehicle=${this.activeVehicle}`);
            const available = await res.json();

            // Filter driver's accepted orders that are active (not delivered/cancelled)
            const activeRuns = dashboard.myOrders.filter(o => o.status !== 'DELIVERED' && o.status !== 'CANCELLED');

            main.innerHTML = `
                <h2 style="margin-bottom:25px;"><i class="fa-solid fa-motorcycle"></i> Delivery Partner Dashboard</h2>
                <div id="delivery-dashboard-wrapper">
                    ${Components.deliveryDashboard(dashboard, available, activeRuns, this.activeVehicle)}
                </div>
            `;
        } catch (e) {
            main.innerHTML = `<h2 style="text-align:center; padding:100px 0; color:var(--danger);">Driver dashboard failed to load.</h2>`;
        }
    },

    changeVehicle(type) {
        this.activeVehicle = type;
        this.renderView();
    },

    async toggleDeliveryAvailability() {
        try {
            const res = await fetch('/api/delivery/toggle-availability', { method: 'PUT' });
            if (res.ok) {
                const data = await res.json();
                this.showToast(`You are now ${data.available ? 'ONLINE' : 'OFFLINE'}`);
                this.renderView();
            }
        } catch (e) {
            this.showToast("Toggle failed", "error");
        }
    },

    async acceptDeliveryOrder(orderId) {
        try {
            const res = await fetch(`/api/delivery/orders/${orderId}/accept`, { method: 'POST' });
            if (res.ok) {
                this.showToast("Delivery run accepted. Pickup the package!");
                this.renderView();
            }
        } catch (e) {
            this.showToast("Failed to claim shipment.", "error");
        }
    },

    async updateDeliveryOrderStatus(orderId, status) {
        try {
            const res = await fetch(`/api/delivery/orders/${orderId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });

            if (res.ok) {
                this.showToast(`Order marked as ${status}`);
                this.renderView();
            } else {
                const err = await res.json();
                this.showToast(err.error || "Update failed", "error");
            }
        } catch (e) {
            this.showToast("Update failed", "error");
        }
    },

    async completeDeliveryWithOtp(orderId) {
        const otpInput = document.getElementById(`otp-input-${orderId}`);
        const otp = otpInput ? otpInput.value.trim() : '';
        if (!otp) {
            this.showToast("Please enter the delivery OTP code!", "error");
            return;
        }

        try {
            const res = await fetch(`/api/delivery/orders/${orderId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'DELIVERED', otp })
            });

            if (res.ok) {
                this.showToast("OTP verified! Delivery marked complete.");
                this.renderView();
            } else {
                const err = await res.json();
                this.showToast(err.error || "Invalid OTP code.", "error");
            }
        } catch (e) {
            this.showToast("Failed to complete delivery.", "error");
        }
    },

    // --- Admin panel details ---
    async renderAdminPanel(main) {
        try {
            let res = await fetch('/api/admin/reports');
            const stats = await res.json();

            res = await fetch('/api/admin/users');
            const users = await res.json();

            res = await fetch('/api/admin/restaurants');
            const restaurants = await res.json();

            res = await fetch('/api/admin/coupons');
            const coupons = await res.json();

            res = await fetch('/api/admin/orders');
            const orders = await res.json();

            main.innerHTML = `
                <h2 style="margin-bottom:25px;"><i class="fa-solid fa-briefcase"></i> Administrator Control Panel</h2>
                <div id="admin-dashboard-wrapper">
                    ${Components.adminDashboard(stats, users, restaurants, coupons, orders)}
                </div>
            `;
        } catch (e) {
            main.innerHTML = `<h2 style="text-align:center; padding:100px 0; color:var(--danger);">Admin console loading issue.</h2>`;
        }
    },

    async toggleUserStatus(id) {
        try {
            const res = await fetch(`/api/admin/users/${id}/toggle-status`, { method: 'PUT' });
            if (res.ok) {
                this.showToast("User account status updated.");
                this.renderView();
            } else {
                const err = await res.json();
                this.showToast(err.error || "Failed to update user status.", "error");
            }
        } catch (e) {
            this.showToast("Failed to update user status.", "error");
        }
    },

    async changeUserRole(id, role) {
        try {
            const res = await fetch(`/api/admin/users/${id}/role`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role })
            });
            if (res.ok) {
                this.showToast("User role updated successfully.");
                this.renderView();
            } else {
                const err = await res.json();
                this.showToast(err.error || "Failed to update user role.", "error");
            }
        } catch (e) {
            this.showToast("Failed to update user role.", "error");
        }
    },

    async approveRestaurant(id, action) {
        try {
            const res = await fetch(`/api/admin/restaurants/${id}/approve`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action })
            });
            if (res.ok) {
                this.showToast(`Restaurant request marked as ${action.toLowerCase()}`);
                this.renderView();
            } else {
                const err = await res.json();
                this.showToast(err.error || "Action failed.", "error");
            }
        } catch (e) {
            this.showToast("Failed to process restaurant approval status.", "error");
        }
    },

    async dispatchOrder(orderId) {
        const driverId = document.getElementById(`dispatch-driver-${orderId}`).value;
        if (!driverId) {
            this.showToast("Please select a delivery driver first!", "error");
            return;
        }

        try {
            const res = await fetch(`/api/admin/orders/${orderId}/dispatch`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ driverId: parseInt(driverId) })
            });

            if (res.ok) {
                this.showToast("Driver assigned and dispatched!");
                this.renderView();
            } else {
                const err = await res.json();
                this.showToast(err.error || "Dispatch failed.", "error");
            }
        } catch (e) {
            this.showToast("Dispatch network failed.", "error");
        }
    },

    async toggleCouponStatus(id) {
        try {
            const res = await fetch(`/api/admin/coupons/${id}/toggle`, { method: 'PUT' });
            if (res.ok) {
                this.showToast("Coupon status updated.");
                this.renderView();
            } else {
                const err = await res.json();
                this.showToast(err.error || "Failed to update coupon status.", "error");
            }
        } catch (e) {
            this.showToast("Failed to update coupon status.", "error");
        }
    },

    async deleteCoupon(id) {
        if (!confirm("Are you sure you want to permanently delete this coupon?")) return;
        try {
            const res = await fetch(`/api/admin/coupons/${id}`, { method: 'DELETE' });
            if (res.ok) {
                this.showToast("Coupon deleted successfully.");
                this.renderView();
            } else {
                const err = await res.json();
                this.showToast(err.error || "Failed to delete coupon.", "error");
            }
        } catch (e) {
            this.showToast("Failed to delete coupon.", "error");
        }
    },

    // --- Interactive Modal Panels ---
    showCustomizeModal(itemId) {
        const item = this.activeRestaurantMenu.find(i => i.id === itemId);
        if (!item) return;

        let customizationHtml = '';
        if (item.customizableItems) {
            customizationHtml = `
                <strong style="font-size:14px; margin-bottom:10px; display:block; color:#fff;">Select Customizations</strong>
                <div style="display:flex; flex-direction:column; gap:8px;">
                    ${item.customizableItems.split(',').map((opt, idx) => {
                        const parts = opt.split(':');
                        const label = parts[0];
                        const surcharge = parts[1] ? parseFloat(parts[1]) : 0.00;
                        return `
                            <label style="display:flex; align-items:center; gap:10px; font-size:13px; cursor:pointer;">
                                <input type="checkbox" name="custom-opt" value="${label}" style="width:auto;">
                                ${label} (+₹${surcharge.toFixed(2)})
                            </label>
                        `;
                    }).join('')}
                </div>
            `;
        } else {
            customizationHtml = `<p style="color:var(--text-muted); font-size:12px;">No custom toppings available. Served Standard.</p>`;
        }

        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.id = 'customize-modal';
        overlay.innerHTML = `
            <div class="modal-content glass-panel">
                <button class="close-modal" onclick="document.getElementById('customize-modal').remove()">×</button>
                <h3 style="margin-bottom:10px;">Customize ${item.name}</h3>
                <p style="font-size:13px; color:var(--text-muted); margin-bottom:20px;">${item.description || ''}</p>
                
                <div class="form-group">
                    ${customizationHtml}
                </div>

                <div class="form-group" style="margin-top:20px;">
                    <label>Quantity</label>
                    <div style="display:flex; gap:10px; align-items:center;">
                        <input type="number" id="customize-qty" value="1" min="1" style="width:80px; text-align:center;">
                    </div>
                </div>

                <button class="btn btn-primary" style="width:100%; margin-top:20px;" onclick="App.addCustomizedItemToCart(${item.id})">Add to Plate</button>
            </div>
        `;
        document.body.appendChild(overlay);
    },

    async addCustomizedItemToCart(itemId) {
        const qty = parseInt(document.getElementById('customize-qty').value) || 1;
        const checkboxes = document.getElementsByName('custom-opt');
        const selected = [];
        checkboxes.forEach(cb => {
            if (cb.checked) selected.push(cb.value);
        });

        const customizations = selected.length > 0 ? selected.join(', ') : 'Standard';

        // Check if group ordering
        if (this.groupSession) {
            try {
                const res = await fetch('/api/features/group-ordering/add-item', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        code: this.groupSession.code,
                        memberName: this.groupSession.memberName,
                        menuItemId: itemId,
                        quantity: qty
                    })
                });

                if (res.ok) {
                    this.showToast("Added item to group cart lobby!");
                    document.getElementById('customize-modal').remove();
                    await this.renderGroupLobbyLobby();
                } else {
                    const err = await res.json();
                    this.showToast(err.error, "error");
                }
            } catch (e) {
                this.showToast("Group adding failed.", "error");
            }
        } else {
            // Standard personal add
            try {
                const res = await fetch('/api/cart', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        menuItemId: itemId,
                        quantity: qty,
                        customizations: customizations
                    })
                });

                if (res.ok) {
                    this.showToast("Added item to cart successfully!");
                    document.getElementById('customize-modal').remove();
                    await this.syncUserData();
                    this.updateNavBar();
                }
            } catch (e) {
                this.showToast("Failed to add to cart.", "error");
            }
        }
    },

    showSpinModal() {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.id = 'spin-modal';
        overlay.innerHTML = `
            <div class="modal-content glass-panel" style="max-width:360px; text-align:center;">
                <button class="close-modal" onclick="document.getElementById('spin-modal').remove()">×</button>
                <h3 style="margin-bottom:20px;">Daily Spin & Win <i class="fa-solid fa-bullseye"></i></h3>
                
                <div class="spin-container">
                    <div class="wheel-wrapper">
                        <div class="wheel-pointer"></div>
                        <div class="wheel" id="spin-wheel"></div>
                        <div class="wheel-center"></div>
                    </div>
                    <button class="btn btn-primary" id="spin-btn" onclick="App.triggerSpinWheel()">Spin Wheel!</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
    },

    async triggerSpinWheel() {
        if (!this.user) {
            this.showToast("Login to Spin & Win rewards!", "error");
            return;
        }

        const wheel = document.getElementById('spin-wheel');
        const btn = document.getElementById('spin-btn');
        if (this.isSpinning || !wheel) return;

        this.isSpinning = true;
        btn.disabled = true;

        try {
            const res = await fetch('/api/features/spin-and-win', { method: 'POST' });
            if (res.ok) {
                const result = await res.json();
                
                // Spin animation: degrees random high multiplier
                const deg = 1800 + Math.floor(Math.random() * 360);
                wheel.style.transform = `rotate(${deg}deg)`;

                setTimeout(() => {
                    this.showToast(result.message);
                    this.isSpinning = false;
                    document.getElementById('spin-modal').remove();
                }, 4000);
            }
        } catch (e) {
            this.isSpinning = false;
            btn.disabled = false;
        }
    },

    // --- Budget Finder Actions ---
    async findBudgetMeals() {
        const budgetInput = document.getElementById('budget-input');
        const maxBudget = parseFloat(budgetInput.value);
        if (isNaN(maxBudget) || maxBudget <= 0) {
            this.showToast("Enter a valid positive budget amount!", "error");
            return;
        }

        try {
            const res = await fetch(`/api/features/budget-meals?maxBudget=${maxBudget}`);
            const meals = await res.json();

            const grid = document.getElementById('restaurants-list');
            if (!grid) return;

            document.querySelector('.section-title span').innerText = `💰 Meals Under ₹${maxBudget.toFixed(2)}`;

            if (meals.length === 0) {
                grid.innerHTML = `<p style="color:var(--text-muted); padding:30px 0;">No dishes found under ₹${maxBudget.toFixed(2)} in database.</p>`;
                return;
            }

            grid.innerHTML = meals.map(item => `
                <div class="card glass-panel" style="padding:15px; border-radius:12px;">
                    <div style="display:flex; justify-content:space-between; align-items:start;">
                        <div>
                            <strong style="color:var(--primary); font-size:11px;">${item.restaurant.name}</strong>
                            <h4 style="font-size:16px; font-weight:700; margin:4px 0;">${item.name}</h4>
                            <p style="font-size:12px; color:var(--text-muted);">${item.description || ''}</p>
                        </div>
                        <span class="price">₹${item.price.toFixed(2)}</span>
                    </div>
                    <button class="btn btn-outline btn-sm" style="margin-top:12px; width:100%;" onclick="App.navigateTo('restaurant-details', ${item.restaurant.id})">
                        Go to Restaurant Menu
                    </button>
                </div>
            `).join('');

        } catch (e) {
            this.showToast("Failed to fetch budget meals.", "error");
        }
    },

    // --- Surprise Me Actions ---
    async surpriseMe() {
        const category = document.getElementById('surprise-category').value;
        try {
            const res = await fetch(`/api/features/surprise-me?category=${category}`);
            const item = await res.json();

            // Display overlay result modal
            const overlay = document.createElement('div');
            overlay.className = 'modal-overlay';
            overlay.id = 'surprise-result-modal';
            overlay.innerHTML = `
                <div class="modal-content glass-panel" style="max-width:380px; text-align:center;">
                    <button class="close-modal" onclick="document.getElementById('surprise-result-modal').remove()">×</button>
                    <h3 style="margin-bottom:10px;">Surprise Meal Selected! 🎲</h3>
                    <p style="font-size:12px; color:var(--text-muted); margin-bottom:20px;">We chose this signature dish based on category preferences</p>
                    
                    <div class="glass-panel" style="padding:20px; margin-bottom:20px; border-color:var(--primary);">
                        <span style="font-size:40px;"><i class="fa-solid fa-pizza-slice"></i></span>
                        <h4 style="font-size:18px; font-weight:700; margin:10px 0 5px 0;">${item.name}</h4>
                        <strong style="color:var(--primary); font-size:14px;">${item.restaurant.name}</strong>
                        <p style="font-size:12px; color:var(--text-muted); margin:8px 0;">${item.description || ''}</p>
                        <div class="price" style="font-size:20px; margin-top:8px;">₹${item.price.toFixed(2)}</div>
                    </div>

                    <button class="btn btn-primary" style="width:100%;" onclick="document.getElementById('surprise-result-modal').remove(); App.navigateTo('restaurant-details', ${item.restaurant.id})">
                        Go to Restaurant Menu
                    </button>
                </div>
            `;
            document.body.appendChild(overlay);

        } catch (e) {
            this.showToast("No matching foods found for roll.", "error");
        }
    },

    // --- Group Ordering Lobbies ---
    showCreateGroupLobbyModal(restaurantId) {
        if (!this.user) {
            this.showToast("Login to setup group ordering!", "error");
            return;
        }

        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.id = 'group-create-modal';
        overlay.innerHTML = `
            <div class="modal-content glass-panel" style="max-width:380px; text-align:center;">
                <button class="close-modal" onclick="document.getElementById('group-create-modal').remove()">×</button>
                <h3 style="margin-bottom:10px;"><i class="fa-solid fa-users"></i> Setup Group Order</h3>
                <p style="font-size:12px; color:var(--text-muted); margin-bottom:20px;">Create a shared cart lobby and share code with friends.</p>
                
                <div class="form-group" style="text-align:left;">
                    <label>Your Display Name in Group</label>
                    <input type="text" id="group-host-display" required value="${this.user.username}">
                </div>

                <button class="btn btn-primary" style="width:100%; margin-top:15px;" onclick="App.createGroupLobby(${restaurantId})">Create Lobby</button>
            </div>
        `;
        document.body.appendChild(overlay);
    },

    async createGroupLobby(restaurantId) {
        const nameVal = document.getElementById('group-host-display').value;
        if (!nameVal.trim()) return;

        try {
            const res = await fetch('/api/features/group-ordering/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ restaurantId })
            });

            if (res.ok) {
                const session = await res.json();
                this.groupSession = {
                    code: session.groupCode,
                    role: 'host',
                    memberName: nameVal
                };
                document.getElementById('group-create-modal').remove();
                await this.renderGroupLobbyLobby();
            }
        } catch (e) {
            this.showToast("Group creation failed.", "error");
        }
    },

    async joinGroupOrder() {
        const codeInput = document.getElementById('group-code-input');
        const code = codeInput.value.trim().toUpperCase();
        if (!code) return;

        const nameVal = prompt("Enter your Display Name to join group ordering lobby:");
        if (!nameVal) return;

        try {
            const res = await fetch(`/api/features/group-ordering/join?code=${code}`);
            if (res.ok) {
                const session = await res.json();
                this.groupSession = {
                    code: session.groupCode,
                    role: 'member',
                    memberName: nameVal
                };
                this.showToast("Lobby joined successfully!");
                await this.renderGroupLobbyLobby();
            } else {
                this.showToast("Lobby session not found.", "error");
            }
        } catch (e) {
            this.showToast("Connection issue.", "error");
        }
    },

    async renderGroupLobbyLobby() {
        // Fetch group details
        await this.fetchCart();

        // Query restaurant menu
        const res = await fetch(`/api/features/group-ordering/join?code=${this.groupSession.code}`);
        const lobby = await res.json();
        const restaurant = lobby.restaurant;

        // Redirect to detail page with group framing
        this.navigateTo('restaurant-details', restaurant.id);
        
        // Show overlay lobby widget in view
        setTimeout(() => {
            const gridHeader = document.querySelector('.section-title');
            if (gridHeader) {
                gridHeader.innerHTML = `
                    <div class="glass-panel" style="padding:15px; border-color:var(--secondary); background:rgba(99,102,241,0.05); width:100%; display:flex; justify-content:space-between; align-items:center; border-radius:12px; margin-bottom:15px;">
                        <div>
                            <strong style="color:var(--secondary);"><i class="fa-solid fa-users"></i> Group Ordering Lobby Active: ${this.groupSession.code}</strong>
                            <div style="font-size:12px; color:var(--text-muted); margin-top:4px;">Dishes added will go to host cart split bills.</div>
                        </div>
                        <div style="display:flex; gap:10px;">
                            <button class="btn btn-primary btn-sm" onclick="App.navigateTo('cart')">Go to Cart & Checkout</button>
                            <button class="btn btn-outline btn-sm" style="border-color:#ef4444; color:#ef4444;" onclick="App.leaveGroupLobby()">Leave Lobby</button>
                        </div>
                    </div>
                `;
            }
        }, 100);
    },

    leaveGroupLobby() {
        this.groupSession = null;
        this.cart = [];
        this.navigateTo('home');
        this.showToast("Left group ordering lobby.");
    },

    // --- Saved Address Management ---
    showAddAddressModal() {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.id = 'address-modal';
        overlay.innerHTML = `
            <div class="modal-content glass-panel" style="max-width:400px;">
                <button class="close-modal" onclick="document.getElementById('address-modal').remove()">×</button>
                <h3 style="margin-bottom:15px;">Manage Addresses</h3>
                <div id="address-list-inner" style="max-height:180px; overflow-y:auto; margin-bottom:15px; display:flex; flex-direction:column; gap:8px;">
                    <p style="color:var(--text-muted); font-size:12px;">Querying addresses...</p>
                </div>
                <hr style="border-color:var(--border-color); margin-bottom:15px;">
                <strong style="font-size:13px; display:block; margin-bottom:10px; color:#fff;">Add New Address</strong>
                <div class="form-group">
                    <input type="text" id="new-addr-line" placeholder="Street Address / Room" required style="margin-bottom:8px;">
                    <div style="display:flex; gap:8px;">
                        <input type="text" id="new-addr-city" placeholder="City" required>
                        <input type="text" id="new-addr-zip" placeholder="Zip Code" required style="width:100px;">
                    </div>
                </div>
                <button class="btn btn-primary btn-sm" style="width:100%; margin-top:10px;" onclick="App.saveNewAddress()">Save Address</button>
            </div>
        `;
        document.body.appendChild(overlay);
        this.loadAddressesModal();
    },

    async loadAddressesModal() {
        const box = document.getElementById('address-list-inner');
        if (!box) return;

        try {
            const res = await fetch('/api/auth/addresses');
            const data = await res.json();
            
            if (data.length === 0) {
                box.innerHTML = `<p style="color:var(--text-muted); font-size:12px;">No addresses saved.</p>`;
                return;
            }

            box.innerHTML = data.map(a => `
                <div style="display:flex; justify-content:space-between; align-items:center; padding:8px; border-radius:6px; background:rgba(255,255,255,0.02); font-size:12px; border:1px solid var(--border-color);">
                    <div>
                        <strong>${a.addressLine}</strong>, ${a.city}
                        ${a.default ? '<span style="color:var(--primary); font-weight:700; margin-left:6px;">[Default]</span>' : ''}
                    </div>
                    <div style="display:flex; gap:6px;">
                        ${!a.default ? `<button class="btn btn-secondary btn-sm" style="padding:2px 6px; font-size:10px;" onclick="App.setDefaultAddress(${a.id})">Set Default</button>` : ''}
                        <button class="btn btn-outline btn-sm" style="padding:2px 6px; font-size:10px; border-color:#ef4444; color:#ef4444;" onclick="App.deleteAddress(${a.id})">Delete</button>
                    </div>
                </div>
            `).join('');
        } catch (e) {}
    },

    async saveNewAddress() {
        const line = document.getElementById('new-addr-line').value;
        const city = document.getElementById('new-addr-city').value;
        const zip = document.getElementById('new-addr-zip').value;

        if (!line.trim() || !city.trim() || !zip.trim()) return;

        try {
            const res = await fetch('/api/auth/addresses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ addressLine: line, city: city, zipCode: zip })
            });

            if (res.ok) {
                this.showToast("Address saved!");
                this.loadAddressesModal();
                // clear input fields
                document.getElementById('new-addr-line').value = '';
                document.getElementById('new-addr-city').value = '';
                document.getElementById('new-addr-zip').value = '';
                
                // Refresh cart view if active
                if (this.currentView === 'cart') {
                    this.renderCartView(document.getElementById('main-content'));
                }
            }
        } catch (e) {
            this.showToast("Failed to save address", "error");
        }
    },

    async setDefaultAddress(id) {
        try {
            const res = await fetch(`/api/auth/addresses/${id}/default`, { method: 'PUT' });
            if (res.ok) {
                this.loadAddressesModal();
                if (this.currentView === 'cart') {
                    this.renderCartView(document.getElementById('main-content'));
                }
            }
        } catch (e) {}
    },

    async deleteAddress(id) {
        try {
            const res = await fetch(`/api/auth/addresses/${id}`, { method: 'DELETE' });
            if (res.ok) {
                this.loadAddressesModal();
                if (this.currentView === 'cart') {
                    this.renderCartView(document.getElementById('main-content'));
                }
            }
        } catch (e) {}
    },

    // --- Auth Event Handlers ---
    async handleLogin(e) {
        e.preventDefault();
        const userVal = document.getElementById('login-username').value;
        const passVal = document.getElementById('login-password').value;

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: userVal, password: passVal })
            });

            if (res.ok) {
                this.user = await res.json();
                this.showToast("Signed in successfully!");
                this.updateNavBar();
                await this.syncUserData();
                // Redirect based on role
                if (this.user && this.user.role === 'CUSTOMER') {
                    this.navigateTo('home');
                } else {
                    this.navigateTo('dashboard');
                }
            } else {
                this.showToast("Invalid credentials", "error");
            }
        } catch (err) {
            this.showToast("Auth connection failed.", "error");
        }
    },

    async handleRegister(e) {
        e.preventDefault();
        const userVal = document.getElementById('reg-username').value;
        const emailVal = document.getElementById('reg-email').value;
        const passVal = document.getElementById('reg-password').value;
        const roleVal = document.getElementById('reg-role').value;
        const bdayVal = document.getElementById('reg-birthday').value;

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: userVal,
                    email: emailVal,
                    password: passVal,
                    role: roleVal,
                    birthday: bdayVal || null
                })
            });

            if (res.ok) {
                this.showToast("Registration successful! You can now log in.");
                this.navigateTo('login');
            } else {
                const err = await res.json();
                this.showToast(err.error || "Signup failed", "error");
            }
        } catch (err) {
            this.showToast("Connection failed.", "error");
        }
    },

    async logout() {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            this.user = null;
            this.cart = [];
            this.wishlist = [];
            this.coupon = null;
            this.groupSession = null;
            this.showToast("Logged out successfully");
            this.navigateTo('login');
        } catch (e) {}
    },

    // --- Owner & Admin Modals Actions ---
    showRegisterRestaurantModal() {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.id = 'restaurant-register-modal';
        overlay.innerHTML = `
            <div class="modal-content glass-panel" style="max-width:450px;">
                <button class="close-modal" onclick="document.getElementById('restaurant-register-modal').remove()">×</button>
                <h3 style="margin-bottom:15px;">Register Restaurant</h3>
                <form onsubmit="App.saveNewRestaurant(event)">
                    <div class="form-group">
                        <label>Restaurant Name</label>
                        <input type="text" id="new-rest-name" required placeholder="e.g. Pizza Palace">
                    </div>
                    <div class="form-group">
                        <label>Cuisine Speciality</label>
                        <select id="new-rest-cuisine" required style="margin-top:6px;">
                            <option value="" disabled selected>— Select Cuisine Type —</option>
                            <option value="North Indian"><i class="fa-solid fa-bowl-food"></i> North Indian</option>
                            <option value="South Indian"><i class="fa-solid fa-bowl-rice"></i> South Indian</option>
                            <option value="Chinese"><i class="fa-solid fa-box"></i> Chinese</option>
                            <option value="Italian"><i class="fa-solid fa-pizza-slice"></i> Italian</option>
                            <option value="Mexican"><i class="fa-solid fa-burger"></i> Mexican</option>
                            <option value="Fast Food"><i class="fa-solid fa-burger"></i> Fast Food</option>
                            <option value="Pizza"><i class="fa-solid fa-pizza-slice"></i> Pizza</option>
                            <option value="Biryani"><i class="fa-solid fa-bowl-rice"></i> Biryani</option>
                            <option value="Seafood"><i class="fa-solid fa-fish"></i> Seafood</option>
                            <option value="Mughlai"><i class="fa-solid fa-drumstick-bite"></i> Mughlai</option>
                            <option value="Thai"><i class="fa-solid fa-bowl-food"></i> Thai</option>
                            <option value="Japanese"><i class="fa-solid fa-box"></i> Japanese</option>
                            <option value="Continental"><i class="fa-solid fa-carrot"></i> Continental</option>
                            <option value="Bakery & Desserts"><i class="fa-solid fa-ice-cream"></i> Bakery & Desserts</option>
                            <option value="Beverages & Juices"><i class="fa-solid fa-mug-hot"></i> Beverages & Juices</option>
                            <option value="Street Food"><i class="fa-solid fa-hotdog"></i> Street Food</option>
                            <option value="Vegan"><i class="fa-solid fa-seedling"></i> Vegan</option>
                            <option value="Healthy & Salads"><i class="fa-solid fa-carrot"></i> Healthy & Salads</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Short Description</label>
                        <textarea id="new-rest-desc" required placeholder="Explain signature tastes..."></textarea>
                    </div>
                    <div style="display:flex; gap:10px;">
                        <div class="form-group" style="flex-grow:1;">
                            <label>Opens Time</label>
                            <input type="text" id="new-rest-open" required value="09:00" placeholder="09:00">
                        </div>
                        <div class="form-group" style="flex-grow:1;">
                            <label>Closes Time</label>
                            <input type="text" id="new-rest-close" required value="22:00" placeholder="22:00">
                        </div>
                    </div>
                    <button class="btn btn-primary" style="width:100%; margin-top:10px;" type="submit">Submit Registration</button>
                </form>
            </div>
        `;
        document.body.appendChild(overlay);
    },

    async saveNewRestaurant(e) {
        e.preventDefault();
        const payload = {
            name: document.getElementById('new-rest-name').value,
            cuisineType: document.getElementById('new-rest-cuisine').value,
            description: document.getElementById('new-rest-desc').value,
            openTime: document.getElementById('new-rest-open').value,
            closeTime: document.getElementById('new-rest-close').value
        };

        try {
            const res = await fetch('/api/owner/restaurants', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                this.showToast("Restaurant registered successfully!");
                document.getElementById('restaurant-register-modal').remove();
                this.renderView();
            }
        } catch (e) {
            this.showToast("Failed to save restaurant.", "error");
        }
    },

    showCreateCouponModal() {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.id = 'coupon-create-modal';
        overlay.innerHTML = `
            <div class="modal-content glass-panel" style="max-width:400px;">
                <button class="close-modal" onclick="document.getElementById('coupon-create-modal').remove()">×</button>
                <h3 style="margin-bottom:15px;">Create Promo Coupon</h3>
                <form onsubmit="App.saveNewCoupon(event)">
                    <div class="form-group">
                        <label>Promo Code</label>
                        <input type="text" id="new-coupon-code" required placeholder="e.g. SUMMER30" style="text-transform:uppercase;">
                    </div>
                    <div class="form-group">
                        <label>Description Details</label>
                        <input type="text" id="new-coupon-desc" required placeholder="e.g. Save 30% on orders above ₹10">
                    </div>
                    <div style="display:flex; gap:10px;">
                        <div class="form-group">
                            <label>Flat Discount (₹)</label>
                            <input type="number" id="new-coupon-amt" value="0" step="0.1">
                        </div>
                        <div class="form-group">
                            <label>Percent Discount (%)</label>
                            <input type="number" id="new-coupon-pct" value="0" max="100">
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Minimum Order Value (₹)</label>
                        <input type="number" id="new-coupon-min" value="10" step="0.1">
                    </div>
                    <button class="btn btn-primary" style="width:100%; margin-top:10px;" type="submit">Create Coupon</button>
                </form>
            </div>
        `;
        document.body.appendChild(overlay);
    },

    async saveNewCoupon(e) {
        e.preventDefault();
        const payload = {
            code: document.getElementById('new-coupon-code').value.toUpperCase(),
            description: document.getElementById('new-coupon-desc').value,
            discountAmount: parseFloat(document.getElementById('new-coupon-amt').value) || 0.0,
            discountPercent: parseFloat(document.getElementById('new-coupon-pct').value) || 0.0,
            minOrderValue: parseFloat(document.getElementById('new-coupon-min').value) || 0.0,
            durationDays: 7
        };

        try {
            const res = await fetch('/api/admin/coupons', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                this.showToast("Coupon created successfully!");
                document.getElementById('coupon-create-modal').remove();
                this.renderView();
            }
        } catch (e) {
            this.showToast("Failed to create coupon.", "error");
        }
    },

    filterHomeRestaurants(type) {
        document.querySelectorAll('.categories-row .category-chip').forEach(chip => {
            chip.classList.remove('active');
        });
        
        const activeChip = document.getElementById(`filter-${type}`);
        if (activeChip) activeChip.classList.add('active');

        const list = document.getElementById('restaurants-list');
        if (!list || !this.allRestaurants) return;

        let filtered = [...this.allRestaurants];
        if (type === 'rated') {
            filtered = filtered.filter(r => r.rating >= 4.5);
        } else if (type === 'fast') {
            filtered = filtered.filter(r => r.deliveryTimeMin <= 25);
        } else if (type === 'free') {
            filtered = filtered.filter(r => r.deliveryFee <= 30.0);
        } else if (type === 'budget199') {
            filtered = filtered.filter(r => r.minOrderAmount <= 100.0);
        } else if (type === 'budget299') {
            filtered = filtered.filter(r => r.minOrderAmount <= 150.0);
        } else if (type === 'budget499') {
            filtered = filtered.filter(r => r.minOrderAmount <= 300.0);
        }

        if (filtered.length === 0) {
            list.innerHTML = `<p style="color:var(--text-muted); padding:20px 0;">No restaurants match this filter.</p>`;
            return;
        }

        list.innerHTML = filtered.map(r => Components.restaurantCard(r)).join('');
    },

    handleHomeSort(criterion) {
        const list = document.getElementById('restaurants-list');
        if (!list || !this.allRestaurants) return;

        let sorted = [...this.allRestaurants];
        if (criterion === 'rating') {
            sorted.sort((a, b) => b.rating - a.rating);
        } else if (criterion === 'distance') {
            sorted.sort((a, b) => (a.distance || 1.5) - (b.distance || 1.5));
        } else if (criterion === 'speed') {
            sorted.sort((a, b) => a.deliveryTimeMin - b.deliveryTimeMin);
        }

        list.innerHTML = sorted.map(r => Components.restaurantCard(r)).join('');
    },

    triggerVoiceSearch() {
        this.showToast("🎙️ Listening... Speak dish/cuisine name");
        setTimeout(() => {
            const queries = ["Biryani", "Pizza", "Burger", "Starbucks", "Dosa"];
            const rolled = queries[Math.floor(Math.random() * queries.length)];
            const searchBox = document.getElementById('search-box');
            if (searchBox) {
                searchBox.value = rolled;
                this.showToast(`Recognized: "${rolled}"`);
                this.loadRestaurants(rolled);
            }
        }, 1200);
    },

    applyDirectPromo(code) {
        this.navigateTo('cart');
        setTimeout(() => {
            const input = document.getElementById('coupon-input');
            if (input) {
                input.value = code;
                this.applyPromoCoupon();
            }
        }, 300);
    },

    triggerScratchCard(points) {
        const scratchBox = document.getElementById('scratch-box');
        if (scratchBox && !scratchBox.classList.contains('scratched')) {
            scratchBox.classList.add('scratched');
            this.showToast(`✨ Scratch Success! Earned ${points} Points!`);
            if (this.user) {
                if (!this.user.rewardPoints) this.user.rewardPoints = 0;
                this.user.rewardPoints += points;
                this.updateNavBar();
            }
        }
    },

    setDeliveryTip(tip) {
        this.deliveryTip = tip;
        this.recalculateCartValues();
        
        setTimeout(() => {
            [0, 20, 30, 50].forEach(t => {
                const btn = document.getElementById(`tip-${t}`);
                if (btn) {
                    if (t === tip) {
                        btn.style.background = 'var(--primary)';
                        btn.style.color = '#0f1016';
                        btn.style.borderColor = 'var(--primary)';
                    } else {
                        btn.style.background = '';
                        btn.style.color = '';
                        btn.style.borderColor = '';
                    }
                }
            });
        }, 50);
    },

    async addCustomComboToCart() {
        const starterId = document.getElementById('combo-starter').value;
        const mainId = document.getElementById('combo-main').value;
        const bevId = document.getElementById('combo-beverage').value;

        if (!starterId || !mainId || !bevId) {
            this.showToast("Select 1 Starter, 1 Main, and 1 Drink to build your combo!", "error");
            return;
        }

        const starter = this.activeRestaurantMenu.find(i => i.id == starterId);
        const main = this.activeRestaurantMenu.find(i => i.id == mainId);
        const beverage = this.activeRestaurantMenu.find(i => i.id == bevId);

        try {
            const res = await fetch('/api/cart', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    menuItemId: main.id,
                    quantity: 1,
                    customizations: `Custom Combo Deal: ${starter.name} + ${main.name} + ${beverage.name} (15% Off)`
                })
            });

            if (res.ok) {
                this.showToast("Custom meal combo added to cart!");
                this.navigateTo('cart');
            }
        } catch (e) {
            this.showToast("Failed to add combo.", "error");
        }
    },

    async renderCategoryResultsView(main, cuisine) {
        const decodedCuisine = decodeURIComponent(cuisine);
        main.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:25px;">
                <h2>Explore: ${decodedCuisine}</h2>
                <button class="btn btn-outline btn-sm" onclick="App.navigateTo('home')">← Back to Home</button>
            </div>
            
            <div class="dashboard-wrapper">
                <!-- Left panel: Restaurants serving this cuisine, sorted by rating high to low -->
                <div class="content-panel">
                    <h3 style="font-size: 16px; font-weight: 800; margin-bottom: 15px; color:#fff;"><i class="fa-solid fa-house"></i> Best Restaurants for ${decodedCuisine} (High to Low Rating)</h3>
                    <div class="grid-cols-2" id="category-restaurants">
                        <p style="color:var(--text-muted);">Loading restaurants...</p>
                    </div>
                </div>

                <!-- Right sidebar: Dishes under this category across all restaurants, sorted by price low to high -->
                <div class="sidebar" style="width: 380px;">
                    <h3 style="font-size: 16px; font-weight: 800; margin-bottom: 15px; color:#fff;"><i class="fa-solid fa-pizza-slice"></i> Dishes (Low to High Price)</h3>
                    <div style="display:flex; flex-direction:column; gap:12px;" id="category-dishes">
                        <p style="color:var(--text-muted);">Loading dishes...</p>
                    </div>
                </div>
            </div>
        `;

        try {
            // Fetch all restaurants
            const restRes = await fetch('/api/restaurants');
            const restaurants = await restRes.json();

            // Filter restaurants by cuisine type (trimming and ignoring case)
            const matchingRests = restaurants
                .filter(r => {
                    const rCuisine = r.cuisine || r.cuisineType || "";
                    return rCuisine.trim().toLowerCase() === decodedCuisine.trim().toLowerCase();
                })
                .sort((a, b) => b.rating - a.rating);

            const restContainer = document.getElementById('category-restaurants');
            if (matchingRests.length === 0) {
                restContainer.innerHTML = `<p style="color:var(--text-muted); padding:10px 0;">No restaurants specialize in ${decodedCuisine}. Try checking dishes side-panel!</p>`;
            } else {
                restContainer.innerHTML = matchingRests.map(r => Components.restaurantCard(r)).join('');
            }

            // Fetch dishes of this category by checking menu items of these restaurants
            const dishRes = await fetch('/api/features/budget-meals?maxBudget=99999');
            const allDishes = await dishRes.json();

            // Filter dishes matching the category name (trimming and ignoring case)
            const matchingDishes = allDishes
                .filter(item => {
                    const itemCat = item.category || "";
                    const restCuisine = (item.restaurant && (item.restaurant.cuisine || item.restaurant.cuisineType)) || "";
                    return itemCat.trim().toLowerCase() === decodedCuisine.trim().toLowerCase() || 
                           restCuisine.trim().toLowerCase() === decodedCuisine.trim().toLowerCase();
                })
                .sort((a, b) => a.price - b.price);

            const dishContainer = document.getElementById('category-dishes');
            if (matchingDishes.length === 0) {
                dishContainer.innerHTML = `<p style="color:var(--text-muted); padding:10px 0;">No dishes found under this category.</p>`;
            } else {
                dishContainer.innerHTML = matchingDishes.map(item => `
                    <div class="card glass-panel" style="padding:12px; border-radius:12px; display:flex; flex-direction:column; height:180px; justify-content:space-between; box-sizing:border-box;">
                        <div style="display:flex; gap:12px; align-items:flex-start; text-align:left; width:100%;">
                            <img src="${item.imageUrl}" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=80&h=80&q=80';" style="width:60px; height:60px; min-width:60px; min-height:60px; object-fit:cover; border-radius:8px;">
                            <div style="display:flex; flex-direction:column; min-width:0; text-align:left; flex-grow:1;">
                                <strong style="font-size:13px; color:#fff; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; text-overflow:ellipsis; line-height:1.2; text-align:left;">${item.name}</strong>
                                <div style="font-size:11px; color:var(--text-muted); margin-top:4px; text-align:left; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${item.restaurant.name} (★ ${item.restaurant.rating})</div>
                            </div>
                        </div>
                        <div style="display:flex; justify-content:flex-start; align-items:center; text-align:left; width:100%;">
                            <span style="font-size:14px; font-weight:700; color:var(--primary); text-align:left;">₹${item.price.toFixed(0)}</span>
                        </div>
                        <button class="btn btn-primary btn-sm" style="width:100%; padding:6px; font-size:11px;" onclick="App.navigateTo('restaurant-details', ${item.restaurant.id})">Go to Menu</button>
                    </div>
                `).join('');
            }
        } catch (e) {
            console.error(e);
        }
    }
};

// Start application
window.addEventListener('DOMContentLoaded', () => App.init());
