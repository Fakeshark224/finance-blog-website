// auth.js
(function() {
  const ADMIN_EMAIL = 'sterlingmereholdings@gmail.com';
  
  const ProsperAuth = {
    ADMIN_EMAIL,
    
    init() {
      firebase.auth().onAuthStateChanged((user) => {
        this.updateHeaderAuth(user);
      });
    },

    isAdmin() {
      const user = firebase.auth().currentUser;
      return user && user.email === ADMIN_EMAIL;
    },

    getCurrentUser() {
      return firebase.auth().currentUser;
    },

    updateHeaderAuth(user) {
      const headerAuth = document.getElementById('header-auth');
      const mobileNavAuth = document.getElementById('mobile-nav-auth');
      
      let html = '';
      if (user) {
        const name = user.displayName || user.email.split('@')[0];
        html = `
          <span style="font-size:0.875rem; font-weight:600; color:var(--color-text-primary); margin-right:1rem;">Hi, ${name}</span>
          ${this.isAdmin() ? '<a href="admin.html" style="font-size:0.875rem; font-weight:600; color:var(--color-primary); margin-right:1rem; text-decoration:none;">Admin</a>' : ''}
          <button data-auth-action="logout" class="btn btn-outline" style="padding: 0.4rem 1rem; font-size:0.875rem;">Sign Out</button>
        `;
      } else {
        html = `
          <button onclick="window.ProsperAuth.showLoginModal()" style="position:relative; z-index:99999; background:none; border:none; font-weight:600; font-family:inherit; cursor:pointer; color:var(--color-text-primary); margin-right:1rem;">Sign In</button>
          <button onclick="window.ProsperAuth.showRegisterModal()" class="btn btn-primary" style="position:relative; z-index:99999; padding: 0.4rem 1rem; font-size:0.875rem;">Subscribe</button>
        `;
      }
      
      if (headerAuth) {
        headerAuth.innerHTML = html;
        headerAuth.style.display = 'flex';
      }
      
      if (mobileNavAuth) {
        mobileNavAuth.innerHTML = html;
        mobileNavAuth.style.display = 'flex';
        mobileNavAuth.style.flexDirection = 'column';
        mobileNavAuth.style.gap = '1rem';
        mobileNavAuth.style.padding = '1rem';
      }
    },

    createAuthModal(mode) {
      this.hideAuthModal(); // ensure any existing is removed
      
      const isLogin = mode === 'login';
      const overlay = document.createElement('div');
      overlay.className = 'auth-overlay';
      overlay.id = 'auth-modal-overlay';
      
      // Inline styles for modal that aren't in style.css
      overlay.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(27,42,74,0.8); display:flex; justify-content:center; align-items:center; z-index:9999; backdrop-filter:blur(4px);';
      
      overlay.innerHTML = `
        <div class="auth-modal" style="background:#fff; padding:2rem; border-radius:12px; width:100%; max-width:400px; position:relative; box-shadow:0 10px 40px rgba(0,0,0,0.2);">
          <button onclick="window.ProsperAuth.hideAuthModal()" class="auth-close" style="position:absolute; top:1rem; right:1rem; background:none; border:none; font-size:1.5rem; cursor:pointer; color:var(--color-text-muted);">&times;</button>
          <h2 style="margin-bottom:0.5rem; font-size:1.5rem; color:var(--color-text-primary);">${isLogin ? 'Welcome Back' : 'Join Prospr'}</h2>
          <p style="color:var(--color-text-muted); margin-bottom:1.5rem; font-size:0.875rem;">${isLogin ? 'Log in to continue your financial journey.' : 'Subscribe to save articles and get our newsletter.'}</p>
          
          <form id="auth-form" onsubmit="window.ProsperAuth.handleFormSubmit(event, '${mode}')">
            ${!isLogin ? `
              <div style="margin-bottom:1rem;">
                <label style="display:block; font-size:0.875rem; font-weight:600; margin-bottom:0.25rem;">Name</label>
                <input type="text" id="auth-name" required style="width:100%; padding:0.75rem; border:1px solid #ccc; border-radius:6px; font-family:inherit;">
              </div>
            ` : ''}
            <div style="margin-bottom:1rem;">
              <label style="display:block; font-size:0.875rem; font-weight:600; margin-bottom:0.25rem;">Email</label>
              <input type="email" id="auth-email" required style="width:100%; padding:0.75rem; border:1px solid #ccc; border-radius:6px; font-family:inherit;">
            </div>
            <div style="margin-bottom:1.5rem;">
              <label style="display:block; font-size:0.875rem; font-weight:600; margin-bottom:0.25rem;">Password</label>
              <input type="password" id="auth-pw" required style="width:100%; padding:0.75rem; border:1px solid #ccc; border-radius:6px; font-family:inherit;">
            </div>
            
            <div id="auth-error" style="color:#DE350B; font-size:0.875rem; margin-bottom:1rem; display:none;"></div>
            
            <button type="submit" class="btn btn-primary" style="width:100%;" id="auth-submit-btn">${isLogin ? 'Sign In' : 'Sign Up'}</button>
          </form>
          
          <div style="text-align:center; margin-top:1.5rem; font-size:0.875rem; color:var(--color-text-muted);">
            ${isLogin ? 'Don\'t have an account?' : 'Already have an account?'}
            <a href="#" data-auth-action="${isLogin ? 'register' : 'login'}" style="color:var(--color-primary); font-weight:600; text-decoration:none;">
              ${isLogin ? 'Sign up' : 'Sign in'}
            </a>
          </div>
        </div>
      `;
      
      document.body.appendChild(overlay);
      
      // Close on clicking backdrop
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) this.hideAuthModal();
      });
    },

    showLoginModal() { this.createAuthModal('login'); },
    showRegisterModal() { this.createAuthModal('register'); },
    
    hideAuthModal() {
      const overlay = document.getElementById('auth-modal-overlay');
      if (overlay) overlay.remove();
    },

    async handleFormSubmit(e, mode) {
      e.preventDefault();
      const email = document.getElementById('auth-email').value;
      const pw = document.getElementById('auth-pw').value;
      const name = mode === 'register' ? document.getElementById('auth-name').value : null;
      const errorDiv = document.getElementById('auth-error');
      const submitBtn = document.getElementById('auth-submit-btn');
      
      errorDiv.style.display = 'none';
      submitBtn.disabled = true;
      submitBtn.textContent = 'Please wait...';

      try {
        if (mode === 'login') {
          await firebase.auth().signInWithEmailAndPassword(email, pw);
        } else {
          const cred = await firebase.auth().createUserWithEmailAndPassword(email, pw);
          await cred.user.updateProfile({ displayName: name });
          // Save to users collection
          await firebase.firestore().collection('users').doc(cred.user.uid).set({
            email,
            name,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
          });
        }
        this.hideAuthModal();
        if(window.ProsperSite && window.ProsperSite.showToast) {
          window.ProsperSite.showToast(mode === 'login' ? 'Successfully logged in' : 'Account created successfully');
        }
      } catch (err) {
        errorDiv.textContent = err.message;
        errorDiv.style.display = 'block';
        submitBtn.disabled = false;
        submitBtn.textContent = mode === 'login' ? 'Sign In' : 'Sign Up';
      }
    },

    async logout() {
      try {
        await firebase.auth().signOut();
        if (window.location.pathname.includes('admin.html')) {
          window.location.href = 'index.html';
        }
        if(window.ProsperSite && window.ProsperSite.showToast) {
          window.ProsperSite.showToast('Successfully logged out');
        }
      } catch (err) {
        console.error("Logout error", err);
      }
    }
  };

  window.ProsperAuth = ProsperAuth;
  
  // Auto-init
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ProsperAuth.init());
  } else {
    ProsperAuth.init();
  }

  // Removed global event delegation completely as we now use reliable inline global calls
})();
