// script.js
(function() {
  const ProsperSite = {
    init() {
      this.initHeaderScroll();
      this.initMobileNav();
      this.initDarkMode();
      this.initSearch();
      this.initNewsletter();
      this.initCookieBanner();
      this.initScrollReveal();
      
      // Page specific logic
      if (document.getElementById('post-grid')) {
        this.initPostGrid();
      }
      
      if (document.getElementById('filter-bar')) {
        this.initCategoryFilter();
      }
      
      if (document.body.classList.contains('article-layout') || document.getElementById('article-body')) {
        this.initArticlePage();
      }
    },

    // 1. HEADER SCROLL
    initHeaderScroll() {
      const header = document.getElementById('site-header');
      if (!header) return;
      window.addEventListener('scroll', () => {
        if (window.scrollY > 20) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
      });
    },

    // 2. MOBILE NAV
    initMobileNav() {
      const menuToggle = document.getElementById('menu-toggle');
      const mobileNav = document.getElementById('mobile-nav');
      if (!menuToggle || !mobileNav) return;
      
      menuToggle.addEventListener('click', () => {
        menuToggle.classList.toggle('open');
        mobileNav.classList.toggle('open');
      });
    },

    // 3. DARK MODE
    initDarkMode() {
      const toggle = document.getElementById('theme-toggle');
      if (!toggle) return;
      
      const savedTheme = localStorage.getItem('prospr-theme');
      if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
      }
      
      toggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('prospr-theme', isDark ? 'dark' : 'light');
      });
    },

    // 4. SEARCH OVERLAY
    initSearch() {
      const toggle = document.getElementById('search-toggle');
      const close = document.getElementById('search-close');
      const overlay = document.getElementById('search-overlay');
      const input = document.getElementById('search-input');
      const resultsDiv = document.getElementById('search-results');
      
      if (!toggle || !overlay) return;
      
      const openSearch = () => {
        overlay.classList.add('open');
        setTimeout(() => input.focus(), 100);
      };
      
      const closeSearch = () => {
        overlay.classList.remove('open');
        input.value = '';
        resultsDiv.innerHTML = '';
      };
      
      toggle.addEventListener('click', openSearch);
      close.addEventListener('click', closeSearch);
      
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && overlay.classList.contains('open')) {
          closeSearch();
        }
      });
      
      let debounceTimeout;
      if (input) {
        input.addEventListener('input', (e) => {
          clearTimeout(debounceTimeout);
          const query = e.target.value.trim();
          
          if (!query) {
            resultsDiv.innerHTML = '';
            return;
          }
          
          debounceTimeout = setTimeout(async () => {
            if (!window.ProsperPosts) return;
            resultsDiv.innerHTML = '<p style="color:var(--color-text-muted)">Searching...</p>';
            
            const results = await window.ProsperPosts.searchPosts(query);
            if (results.length === 0) {
              resultsDiv.innerHTML = '<p style="color:var(--color-text-muted)">No results found.</p>';
              return;
            }
            
            resultsDiv.innerHTML = results.map(post => `
              <div style="margin-bottom:1rem; border-bottom:1px solid var(--color-border); padding-bottom:1rem;">
                <a href="article.html?id=${post.id}" style="text-decoration:none;">
                  <h4 style="color:var(--color-primary); margin-bottom:0.25rem;">${post.title}</h4>
                  <p style="color:var(--color-text-muted); font-size:0.875rem;">${post.category}</p>
                </a>
              </div>
            `).join('');
          }, 300);
        });
      }
    },

    // 5. POST GRID RENDERING
    async initPostGrid() {
      const grid = document.getElementById('post-grid');
      if (!grid || !window.ProsperPosts) return;
      
      try {
        let posts = await window.ProsperPosts.getAllPosts();
        
        // Seed if empty
        if (posts.length === 0) {
          grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;">Initializing database...</div>';
          await window.ProsperPosts.seedPosts();
          posts = await window.ProsperPosts.getAllPosts();
        }
        
        this.renderPostGrid(posts, grid);
      } catch (err) {
        console.error("Error loading posts:", err);
        grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;color:red;">Error loading stories.</div>';
      }
    },
    
    renderPostGrid(posts, gridElement) {
      gridElement.innerHTML = '';
      
      if (posts.length === 0) {
        gridElement.innerHTML = '<div style="grid-column:1/-1;text-align:center;">No posts found.</div>';
        return;
      }
      
      posts.forEach((post, index) => {
        // Create post card
        const card = document.createElement('a');
        card.href = `article.html?id=${post.id}`;
        card.className = 'post-card reveal';
        
        const dateStr = post.createdAt ? this.formatDate(post.createdAt) : 'Recently';
        
        card.innerHTML = `
          <div class="post-card-image-wrapper">
            <img src="${post.imageUrl || 'https://via.placeholder.com/600x400'}" alt="${post.title}" class="post-card-image" style="width:100%;height:100%;object-fit:cover;" onerror="this.src='https://via.placeholder.com/600x400'">
          </div>
          <div class="post-card-content">
            <span class="post-card-tag">${post.category || 'Finance'}</span>
            <h3 class="post-card-title">${post.title}</h3>
            <p class="post-card-excerpt">${post.excerpt || ''}</p>
            <div class="post-card-meta">
              <span>${post.authorName || 'Prospr'}</span>
              <span class="dot"></span>
              <span>${dateStr}</span>
            </div>
          </div>
        `;
        gridElement.appendChild(card);
        
        // Inject AdSense in-feed unit after every 3rd post (if available)
        if ((index + 1) % 3 === 0 && index !== posts.length - 1) {
          const adContainer = document.createElement('div');
          adContainer.className = 'in-feed-ad';
          adContainer.style.gridColumn = '1 / -1'; // span full width
          adContainer.style.margin = '2rem 0';
          adContainer.innerHTML = `
            <ins class="adsbygoogle"
                 style="display:block"
                 data-ad-format="fluid"
                 data-ad-layout-key="-fb+5w+4e-db+86"
                 data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
                 data-ad-slot="9876543210"></ins>
          `;
          gridElement.appendChild(adContainer);
          try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
          } catch(e) {}
        }
      });
      
      // Re-trigger scroll reveal for new elements
      this.initScrollReveal();
    },

    // 6. CATEGORY FILTERING
    initCategoryFilter() {
      const filterBtns = document.querySelectorAll('.filter-btn');
      const grid = document.getElementById('post-grid');
      if (!filterBtns.length || !grid || !window.ProsperPosts) return;
      
      // Check URL for initial category
      const urlParams = new URLSearchParams(window.location.search);
      const initialCat = urlParams.get('category');
      
      filterBtns.forEach(btn => {
        btn.addEventListener('click', async () => {
          filterBtns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          
          const category = btn.dataset.category;
          grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;">Filtering...</div>';
          
          try {
            const posts = await window.ProsperPosts.getPostsByCategory(category);
            this.renderPostGrid(posts, grid);
          } catch (e) {
            console.error(e);
            grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;color:red;">Error filtering posts.</div>';
          }
        });
        
        // Auto-click if matches URL param
        if (initialCat && btn.dataset.category === initialCat) {
          setTimeout(() => btn.click(), 100);
        }
      });
    },

    // 7. ARTICLE PAGE
    async initArticlePage() {
      const urlParams = new URLSearchParams(window.location.search);
      const postId = urlParams.get('id');
      
      if (!postId || !window.ProsperPosts) {
        document.getElementById('article-title').textContent = 'Post Not Found';
        document.getElementById('article-body').innerHTML = '<p>The requested article could not be found.</p>';
        return;
      }
      
      try {
        const post = await window.ProsperPosts.getPost(postId);
        if (!post) throw new Error("Post not found");
        
        // Populate
        document.title = `${post.title} — Prospr`;
        document.getElementById('article-title').textContent = post.title;
        document.getElementById('article-tag').textContent = post.category || 'Finance';
        
        const dateStr = post.createdAt ? this.formatDate(post.createdAt) : 'Recently';
        document.getElementById('article-meta').innerHTML = `
          <span class="article-author-name">${post.authorName || 'Prospr'}</span>
          <span class="dot"></span>
          <span>${dateStr}</span>
          <span class="dot"></span>
          <span>${post.readingTime || '5 min read'}</span>
        `;
        
        if (post.imageUrl) {
          const imgEl = document.getElementById('article-image');
          if(imgEl) {
            imgEl.src = post.imageUrl;
            imgEl.style.display = 'block';
          }
        }
        
        document.getElementById('article-body').innerHTML = post.content || '';
        document.getElementById('author-bio-name').textContent = post.authorName || 'Prospr Editorial';
        
        // Setup Share
        const shareUrl = encodeURIComponent(window.location.href);
        const shareTitle = encodeURIComponent(post.title);
        document.getElementById('share-twitter').href = `https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`;
        document.getElementById('share-linkedin').href = `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`;
        
        document.getElementById('share-copy').addEventListener('click', () => {
          navigator.clipboard.writeText(window.location.href);
          this.showToast('Link copied to clipboard');
        });
        
        // View Count
        window.ProsperPosts.incrementViewCount(postId);
        
        // Related Posts
        this.loadRelatedPosts(post.category, post.id);
        
        // Reading Progress
        this.initReadingProgress();
        
      } catch (err) {
        console.error(err);
        document.getElementById('article-title').textContent = 'Error Loading Post';
        document.getElementById('article-body').innerHTML = '<p>There was an error loading this content.</p>';
      }
    },
    
    async loadRelatedPosts(category, currentId) {
      const container = document.getElementById('related-posts-container');
      if (!container || !window.ProsperPosts) return;
      
      try {
        const posts = await window.ProsperPosts.getRelatedPosts(category, currentId, 3);
        if (posts.length === 0) {
          document.getElementById('related-posts').style.display = 'none';
          return;
        }
        
        container.innerHTML = posts.map(post => {
          const dateStr = post.createdAt ? this.formatDate(post.createdAt) : '';
          return `
            <a href="article.html?id=${post.id}" style="display:flex; gap:1rem; text-decoration:none; group">
              <div style="flex-shrink:0; width:80px; height:80px; border-radius:8px; overflow:hidden;">
                <img src="${post.imageUrl || 'https://via.placeholder.com/80'}" style="width:100%; height:100%; object-fit:cover;">
              </div>
              <div>
                <h4 style="color:var(--color-primary); font-size:1rem; margin-bottom:0.25rem; line-height:1.4;">${post.title}</h4>
                <div style="font-size:0.75rem; color:var(--color-text-muted);">${dateStr}</div>
              </div>
            </a>
          `;
        }).join('');
      } catch (e) {
        console.error(e);
      }
    },

    // 8. READING PROGRESS
    initReadingProgress() {
      const progressBar = document.getElementById('reading-progress');
      const articleBody = document.getElementById('article-body');
      
      if (!progressBar || !articleBody) return;
      
      window.addEventListener('scroll', () => {
        const rect = articleBody.getBoundingClientRect();
        const height = articleBody.clientHeight;
        
        // distance from top of viewport to top of article body
        const top = rect.top; 
        
        // viewport height
        const vh = window.innerHeight; 
        
        let percentage = 0;
        
        if (top > vh) {
          percentage = 0;
        } else if (top + height < 0) {
          percentage = 100;
        } else {
          // how much is scrolled past the start
          const scrolledPastStart = vh - top;
          // total scrollable amount is height of element + height of viewport
          percentage = (scrolledPastStart / (height + vh)) * 100;
        }
        
        percentage = Math.max(0, Math.min(100, percentage));
        progressBar.style.width = percentage + '%';
      });
    },

    // 9. NEWSLETTER
    initNewsletter() {
      const form = document.getElementById('newsletter-form');
      if (!form) return;
      
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const emailInput = document.getElementById('newsletter-email');
        const btn = document.getElementById('newsletter-submit');
        const email = emailInput.value.trim();
        
        if (!email) return;
        
        btn.disabled = true;
        btn.textContent = 'Subscribing...';
        
        try {
          if (firebase.firestore) {
            await firebase.firestore().collection('subscribers').doc(email).set({
              email: email,
              subscribedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
          }
          this.showToast('Successfully subscribed!');
          emailInput.value = '';
        } catch (err) {
          console.error(err);
          this.showToast('Error subscribing. Try again.', 'error');
        } finally {
          btn.disabled = false;
          btn.textContent = 'Subscribe';
        }
      });
    },

    // 10. COOKIE BANNER
    initCookieBanner() {
      const banner = document.getElementById('cookie-banner');
      if (!banner) return;
      
      const consent = localStorage.getItem('prospr-cookies-consent');
      if (!consent) {
        // slight delay so it drops in nicely
        setTimeout(() => banner.classList.add('show'), 1000);
      }
      
      document.getElementById('cookie-accept')?.addEventListener('click', () => {
        localStorage.setItem('prospr-cookies-consent', 'accepted');
        banner.classList.remove('show');
      });
      
      document.getElementById('cookie-decline')?.addEventListener('click', () => {
        localStorage.setItem('prospr-cookies-consent', 'declined');
        banner.classList.remove('show');
      });
    },

    // 11. SCROLL REVEAL
    initScrollReveal() {
      if (!('IntersectionObserver' in window)) return;
      
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            // optionally unobserve after revealing
            // observer.unobserve(entry.target); 
          }
        });
      }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });
      
      document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
      document.querySelectorAll('.reveal-stagger').forEach(el => observer.observe(el));
    },

    // 12. TOAST
    showToast(message, type = 'success') {
      const toast = document.createElement('div');
      toast.style.cssText = `
        position: fixed;
        bottom: 2rem;
        left: 50%;
        transform: translateX(-50%) translateY(100px);
        background: ${type === 'error' ? '#DE350B' : '#1B2A4A'};
        color: #fff;
        padding: 1rem 2rem;
        border-radius: 50px;
        font-weight: 500;
        z-index: 10000;
        opacity: 0;
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
      `;
      toast.textContent = message;
      document.body.appendChild(toast);
      
      // trigger animation
      setTimeout(() => {
        toast.style.transform = 'translateX(-50%) translateY(0)';
        toast.style.opacity = '1';
      }, 10);
      
      // remove
      setTimeout(() => {
        toast.style.transform = 'translateX(-50%) translateY(20px)';
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
      }, 3000);
    },

    // 13. HELPER
    formatDate(timestamp) {
      if (!timestamp) return '';
      // handle firestore timestamp
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    }
  };

  window.ProsperSite = ProsperSite;
  
  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ProsperSite.init());
  } else {
    ProsperSite.init();
  }
})();
