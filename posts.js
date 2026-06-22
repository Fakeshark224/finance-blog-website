// posts.js
(function() {
  const COLLECTION = 'posts';
  const db = firebase.firestore();

  const ProsperPosts = {
    async createPost(postData) {
      postData.slug = this.generateSlug(postData.title);
      postData.readingTime = this.calculateReadingTime(postData.content);
      postData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
      postData.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
      postData.viewCount = 0;
      
      const docRef = await db.collection(COLLECTION).add(postData);
      return docRef.id;
    },

    async updatePost(postId, data) {
      data.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
      if (data.content) data.readingTime = this.calculateReadingTime(data.content);
      if (data.title) data.slug = this.generateSlug(data.title);
      
      await db.collection(COLLECTION).doc(postId).update(data);
    },

    async deletePost(postId) {
      await db.collection(COLLECTION).doc(postId).delete();
    },

    async getPost(postId) {
      const doc = await db.collection(COLLECTION).doc(postId).get();
      return doc.exists ? { id: doc.id, ...doc.data() } : null;
    },

    async getPostBySlug(slug) {
      const snapshot = await db.collection(COLLECTION).where('slug', '==', slug).limit(1).get();
      if (snapshot.empty) return null;
      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    },

    async getAllPosts(limitCount = 12) {
      const snapshot = await db.collection(COLLECTION)
        .where('isPublished', '==', true)
        .orderBy('createdAt', 'desc')
        .limit(limitCount)
        .get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    async getPostsByCategory(category, limitCount = 12) {
      if (category === 'All') return this.getAllPosts(limitCount);
      const snapshot = await db.collection(COLLECTION)
        .where('isPublished', '==', true)
        .where('category', '==', category)
        .orderBy('createdAt', 'desc')
        .limit(limitCount)
        .get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    async searchPosts(query) {
      query = query.toLowerCase();
      // Client-side search for simplicity (fetch all published, then filter)
      const allPosts = await this.getAllPosts(50);
      return allPosts.filter(p => p.title.toLowerCase().includes(query) || (p.excerpt && p.excerpt.toLowerCase().includes(query)));
    },

    async getRecentPosts(limitCount = 6) {
      return this.getAllPosts(limitCount);
    },

    async getRelatedPosts(category, excludeId, limitCount = 3) {
      const snapshot = await db.collection(COLLECTION)
        .where('isPublished', '==', true)
        .where('category', '==', category)
        .limit(limitCount + 1)
        .get();
      
      return snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(post => post.id !== excludeId)
        .slice(0, limitCount);
    },

    generateSlug(title) {
      return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    },

    calculateReadingTime(content) {
      if (!content) return '1 min read';
      const text = content.replace(/<[^>]+>/g, ' '); // remove html tags
      const words = text.trim().split(/\s+/).length;
      const minutes = Math.ceil(words / 200);
      return `${minutes} min read`;
    },

    async incrementViewCount(postId) {
      try {
        await db.collection(COLLECTION).doc(postId).update({
          viewCount: firebase.firestore.FieldValue.increment(1)
        });
      } catch (e) {
        console.warn("Could not increment view count", e);
      }
    },

    async seedPosts() {
      const posts = [
        {
          title: 'The Complete Guide to Building Wealth in Your 20s',
          category: 'Investing',
          excerpt: 'Practical strategies, mindset shifts, and actionable steps to set up a solid financial foundation early in life.',
          content: '<h2>Start Early</h2><p>The greatest asset you have in your 20s is time. Compound interest is the eighth wonder of the world.</p><h2>Automate Your Savings</h2><p>Set up automatic transfers to your investment accounts every payday so you never even see the money.</p><ul><li>Open a high-yield savings account</li><li>Contribute to your 401(k)</li><li>Start a Roth IRA</li></ul>',
          imageUrl: 'images/post_investing.png',
          tags: ['wealth', 'youth', 'compound interest'],
          authorName: 'James Crawford',
          isPublished: true,
          isDraft: false
        },
        {
          title: 'Zero-Based Budgeting: Take Control of Every Dollar',
          category: 'Budgeting',
          excerpt: 'Learn how to give every dollar a job and finally break the cycle of living paycheck to paycheck.',
          content: '<h2>What is Zero-Based Budgeting?</h2><p>Zero-based budgeting is a method where your income minus your expenses equals zero. Every dollar is assigned a specific purpose before the month begins.</p><h2>Steps to get started</h2><p>First, list your monthly income. Second, list your expenses. Third, assign every remaining dollar to savings, debt payoff, or investments.</p>',
          imageUrl: 'images/post_budgeting.png',
          tags: ['budget', 'money management'],
          authorName: 'Sarah Jenkins',
          isPublished: true,
          isDraft: false
        },
        {
          title: 'Bitcoin vs Ethereum: Which Crypto Should You Invest In?',
          category: 'Crypto',
          excerpt: 'A clear, jargon-free comparison of the two largest cryptocurrencies and their distinct roles in a modern portfolio.',
          content: '<h2>Digital Gold vs Digital Oil</h2><p>Bitcoin is often compared to digital gold—a store of value. Ethereum is like digital oil—the fuel for decentralized applications and smart contracts.</p><h2>Diversification</h2><p>For most investors, a mix of both provides exposure to the store-of-value narrative and the smart-contract utility narrative.</p>',
          imageUrl: 'images/post_crypto.png',
          tags: ['bitcoin', 'ethereum', 'crypto'],
          authorName: 'Alex Mercer',
          isPublished: true,
          isDraft: false
        }
      ];

      for (let p of posts) {
        p.slug = this.generateSlug(p.title);
        p.readingTime = this.calculateReadingTime(p.content);
        p.createdAt = firebase.firestore.FieldValue.serverTimestamp();
        p.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
        p.viewCount = 0;
        await db.collection(COLLECTION).add(p);
      }
    }
  };

  window.ProsperPosts = ProsperPosts;
})();
