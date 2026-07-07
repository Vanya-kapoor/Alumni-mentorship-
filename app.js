// State and Storage Key Setup
const STORAGE_KEYS = {
  MENTORS: 'alumni_mentorship_mentors',
  POSTS: 'alumni_mentorship_posts',
  BOOKINGS: 'alumni_mentorship_bookings',
  ROLE: 'alumni_mentorship_role'
};

// Seed Data
const DEFAULT_MENTORS = [
  {
    id: 'm1',
    name: 'Sarah Jenkins',
    domain: 'software',
    experience: 6,
    bio: 'Senior Software Engineer at Google. Passionate about system design, Go, and assisting juniors in navigating early career challenges.',
    availability: 'weekends'
  },
  {
    id: 'm2',
    name: 'David Chen',
    domain: 'product',
    experience: 8,
    bio: 'Product Lead at Stripe, ex-Meta. Specialized in growth product management, developer API integrations, and resume reviews.',
    availability: 'weekdays'
  },
  {
    id: 'm3',
    name: 'Aisha Patel',
    domain: 'data',
    experience: 5,
    bio: 'Data Scientist at Netflix. Specialized in experimentation frameworks, machine learning models, and transition to data science roles.',
    availability: 'weekends'
  },
  {
    id: 'm4',
    name: 'Elena Rostova',
    domain: 'design',
    experience: 7,
    bio: 'Principal UX/UI Designer at Airbnb. Focused on design systems, user research, and building interactive portfolio presentations.',
    availability: 'weekdays'
  }
];

const DEFAULT_POSTS = [
  {
    id: 'p1',
    title: 'How should I prepare for a Senior frontend system design interview?',
    category: 'interview',
    body: 'I have an upcoming interview with Uber next month for a Frontend role. I am confident in JS/React but struggling with scale-specific concepts like CDNs, caching, state synchronization, and offline capabilities. Any recommended resources or tips?',
    author: 'Alex Carter',
    date: '2026-07-05',
    likes: 12,
    likedBy: [],
    comments: [
      {
        id: 'c1',
        author: 'Sarah Jenkins',
        body: 'Start with high-level architecture: explain how web assets are served, DNS, CDNs, and API gateway logic. Then dive deep into browser-specific topics: rendering strategies (SSR/CSR/hydration), service workers for offline behavior, and payload optimization.',
        date: '2026-07-06'
      }
    ]
  },
  {
    id: 'p2',
    title: 'Best practices for transition from Software Engineering to Product Management?',
    category: 'career',
    body: 'I have been a backend engineer for 4 years. I like building features but feel more drawn to why we build them and how users react. What skills should I focus on first to make the switch?',
    author: 'Maya Lin',
    date: '2026-07-04',
    likes: 8,
    likedBy: [],
    comments: [
      {
        id: 'c2',
        author: 'David Chen',
        body: 'Focus on communication and market understanding. Start aligning with your current PMs, sit in customer calls, and learn how to run design sprints. Highlight your analytical and feature scoping skills during internal transfers.',
        date: '2026-07-05'
      }
    ]
  }
];

const DEFAULT_BOOKINGS = [
  {
    id: 'b1',
    mentorId: 'm1',
    mentorName: 'Sarah Jenkins',
    studentName: 'Alex Carter',
    date: '2026-07-10',
    time: '14:30',
    message: 'I would love to get a review of my resume and some pointers on Golang concurrency concepts.',
    status: 'pending',
    createdAt: '2026-07-06'
  }
];

// App State Cache
let state = {
  mentors: [],
  posts: [],
  bookings: [],
  role: 'student', // 'student' or 'mentor'
  activeView: 'login',
  loggedIn: false
};

// Initialize Application State
function initStore() {
  state.mentors = JSON.parse(localStorage.getItem(STORAGE_KEYS.MENTORS)) || DEFAULT_MENTORS;
  state.posts = JSON.parse(localStorage.getItem(STORAGE_KEYS.POSTS)) || DEFAULT_POSTS;
  state.bookings = JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKINGS)) || DEFAULT_BOOKINGS;
  state.role = localStorage.getItem(STORAGE_KEYS.ROLE) || 'student';
  state.loggedIn = localStorage.getItem('alumni_mentorship_logged_in') === 'true';
  state.mentorProfileId = localStorage.getItem('alumni_mentorship_mentor_profile_id') || 'm1';
  
  if (state.loggedIn) {
    document.getElementById('header-nav').style.display = 'block';
    document.getElementById('header-actions').style.display = 'flex';
  } else {
    document.getElementById('header-nav').style.display = 'none';
    document.getElementById('header-actions').style.display = 'none';
  }
  
  saveToStorage();
}

function saveToStorage() {
  localStorage.setItem(STORAGE_KEYS.MENTORS, JSON.stringify(state.mentors));
  localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(state.posts));
  localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(state.bookings));
  localStorage.setItem(STORAGE_KEYS.ROLE, state.role);
  localStorage.setItem('alumni_mentorship_logged_in', state.loggedIn ? 'true' : 'false');
  localStorage.setItem('alumni_mentorship_mentor_profile_id', state.mentorProfileId || 'm1');
}

// Toast Helpers
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type === 'error' ? 'error' : ''}`;
  toast.innerHTML = `
    <span>${type === 'success' ? '✅' : '❌'}</span>
    <div>${message}</div>
  `;
  
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('slide-out');
    toast.addEventListener('animationend', () => toast.remove());
  }, 3500);
}

// Domain Display Names Helper
const DOMAIN_NAMES = {
  software: 'Software Engineering',
  data: 'Data Science & AI',
  product: 'Product Management',
  design: 'UI/UX Design',
  finance: 'Finance & Consulting'
};

const CATEGORY_NAMES = {
  career: 'Career Advice',
  interview: 'Interview Prep',
  tech: 'Technology Trends',
  referral: 'Referrals & Jobs'
};

// Routing logic
function navigateTo(viewId) {
  if (!state.loggedIn) {
    viewId = 'login';
  }
  
  state.activeView = viewId;
  
  // Update nav UI active class
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  const activeBtn = document.getElementById(`nav-${viewId}`);
  if (activeBtn) activeBtn.classList.add('active');
  
  // Show active view section
  document.querySelectorAll('.view-section').forEach(sec => {
    sec.classList.remove('active');
  });
  
  const targetSection = document.getElementById(`view-${viewId}`);
  if (targetSection) targetSection.classList.add('active');
  
  // Handle specific view load tasks
  if (viewId === 'mentors') {
    renderMentors();
  } else if (viewId === 'forum') {
    renderForum();
  } else if (viewId === 'dashboard') {
    renderDashboard();
  }
}

// 1. Mentors Page Logic
function renderMentors() {
  const container = document.getElementById('mentors-list-container');
  const searchQuery = document.getElementById('mentor-search').value.toLowerCase();
  const domainFilter = document.getElementById('mentor-domain-filter').value;
  const availabilityFilter = document.getElementById('mentor-availability-filter').value;
  
  let filtered = state.mentors;
  
  // Search
  if (searchQuery) {
    filtered = filtered.filter(m => 
      m.name.toLowerCase().includes(searchQuery) ||
      m.bio.toLowerCase().includes(searchQuery) ||
      DOMAIN_NAMES[m.domain].toLowerCase().includes(searchQuery)
    );
  }
  
  // Domain Filter
  if (domainFilter !== 'all') {
    filtered = filtered.filter(m => m.domain === domainFilter);
  }
  
  // Availability Filter
  if (availabilityFilter !== 'all') {
    filtered = filtered.filter(m => m.availability === availabilityFilter);
  }
  
  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1">
        <div class="empty-state-icon">🔍</div>
        <p>No mentors found matching your filters.</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = filtered.map(mentor => `
    <div class="mentor-card" id="mentor-card-${mentor.id}">
      <div class="mentor-header">
        <div class="mentor-avatar">${mentor.name.charAt(0)}</div>
        <div class="mentor-meta">
          <h3>${mentor.name}</h3>
          <span class="mentor-domain-badge">${DOMAIN_NAMES[mentor.domain] || mentor.domain}</span>
          <div class="mentor-exp">${mentor.experience} Years Experience</div>
        </div>
      </div>
      <p class="mentor-bio">${mentor.bio}</p>
      <div class="mentor-availability">
        <span>⏰</span> Available: ${mentor.availability === 'weekdays' ? 'Weekdays (Mon-Fri)' : 'Weekends (Sat-Sun)'}
      </div>
      <div class="mentor-footer">
        <button class="btn-primary" onclick="openBookingModal('${mentor.id}', '${mentor.name}')">
          Book Session
        </button>
      </div>
    </div>
  `).join('');
}

// 2. Forum Page Logic
let activeForumCategory = 'all';

function renderForum() {
  const container = document.getElementById('forum-posts-container');
  
  let filtered = state.posts;
  if (activeForumCategory !== 'all') {
    filtered = filtered.filter(p => p.category === activeForumCategory);
  }
  
  // Update sidebar active class
  document.querySelectorAll('.category-item').forEach(item => {
    const cat = item.getAttribute('data-category');
    if (cat === activeForumCategory) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
    
    // Update count indicator
    const countSpan = item.querySelector('span');
    const count = cat === 'all' ? state.posts.length : state.posts.filter(p => p.category === cat).length;
    countSpan.textContent = `(${count})`;
  });
  
  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">💬</div>
        <p>No questions posted in this category yet. Be the first to ask!</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = filtered.map(post => {
    const isLiked = post.likedBy && post.likedBy.includes(state.role);
    const commentsList = post.comments || [];
    
    return `
      <div class="forum-card" id="post-card-${post.id}">
        <div class="post-header">
          <div class="post-author-info">
            <div class="author-avatar">${post.author.charAt(0)}</div>
            <div class="author-details">
              <h4>${post.author}</h4>
              <span>Posted on ${post.date}</span>
            </div>
          </div>
          <span class="post-tag">${CATEGORY_NAMES[post.category] || post.category}</span>
        </div>
        <h3 class="post-title" onclick="toggleComments('${post.id}')">${post.title}</h3>
        <p class="post-content">${post.body}</p>
        
        <div class="post-actions">
          <button class="action-btn ${isLiked ? 'active' : ''}" onclick="toggleLikePost('${post.id}')">
            <span>👍</span> ${post.likes || 0} Upvotes
          </button>
          <button class="action-btn" onclick="toggleComments('${post.id}')">
            <span>💬</span> ${commentsList.length} Comments
          </button>
        </div>
        
        <!-- Comments Section -->
        <div class="comments-section" id="comments-${post.id}">
          <div class="comment-list">
            ${commentsList.map(comment => `
              <div class="comment-item">
                <div class="comment-header">
                  <span class="comment-author">${comment.author}</span>
                  <span class="comment-date">${comment.date}</span>
                </div>
                <div class="comment-body">${comment.body}</div>
              </div>
            `).join('')}
            ${commentsList.length === 0 ? '<p style="color: var(--text-muted); font-size: 0.85rem;">No comments yet. Write one below!</p>' : ''}
          </div>
          <form class="comment-form" onsubmit="submitComment(event, '${post.id}')">
            <input type="text" placeholder="Add to the discussion..." required>
            <button type="submit" class="btn-primary" style="padding: 0.5rem 1rem; font-size: 0.85rem">Reply</button>
          </form>
        </div>
      </div>
    `;
  }).join('');
}

function toggleLikePost(postId) {
  const post = state.posts.find(p => p.id === postId);
  if (!post) return;
  
  if (!post.likedBy) post.likedBy = [];
  
  const userIndex = post.likedBy.indexOf(state.role);
  if (userIndex > -1) {
    // Unlike
    post.likedBy.splice(userIndex, 1);
    post.likes = Math.max(0, post.likes - 1);
  } else {
    // Like
    post.likedBy.push(state.role);
    post.likes = (post.likes || 0) + 1;
  }
  
  saveToStorage();
  renderForum();
}

function toggleComments(postId) {
  const el = document.getElementById(`comments-${postId}`);
  if (el) {
    el.classList.toggle('active');
  }
}

function submitComment(e, postId) {
  e.preventDefault();
  const input = e.target.querySelector('input');
  const commentText = input.value.trim();
  if (!commentText) return;
  
  const post = state.posts.find(p => p.id === postId);
  if (!post) return;
  
  const authorName = state.role === 'student' ? 'Student User' : 'Alumnus Mentor';
  const newComment = {
    id: 'c_' + Date.now(),
    author: authorName,
    body: commentText,
    date: new Date().toISOString().split('T')[0]
  };
  
  post.comments.push(newComment);
  saveToStorage();
  renderForum();
  showToast('Comment added successfully!');
  
  // Retain comments open state
  const el = document.getElementById(`comments-${postId}`);
  if (el) el.classList.add('active');
}

// 3. Dashboard Logic
function renderDashboard() {
  const isMentor = state.role === 'mentor';
  const title = document.getElementById('dashboard-title');
  const bookingsTitle = document.getElementById('bookings-panel-title');
  const profilePanel = document.getElementById('dashboard-profile-panel');
  
  if (isMentor) {
    title.textContent = 'Mentor Dashboard';
    bookingsTitle.textContent = 'Incoming Booking Requests';
    renderMentorBookings();
    renderMentorForumActivity();
    
    // Display and populate mentor profile management
    profilePanel.style.display = 'block';
    const activeMentor = state.mentors.find(m => m.id === state.mentorProfileId) || state.mentors.find(m => m.id === 'm1');
    if (activeMentor) {
      document.getElementById('db-mentor-name').value = activeMentor.name;
      document.getElementById('db-mentor-domain').value = activeMentor.domain;
      document.getElementById('db-mentor-experience').value = activeMentor.experience;
      document.getElementById('db-mentor-availability').value = activeMentor.availability;
      document.getElementById('db-mentor-bio').value = activeMentor.bio;
    }
  } else {
    title.textContent = 'Student Dashboard';
    bookingsTitle.textContent = 'Sent Mentorship Bookings';
    renderStudentBookings();
    renderStudentForumActivity();
    
    // Hide mentor profile management
    profilePanel.style.display = 'none';
  }
}

function renderStudentBookings() {
  const container = document.getElementById('dashboard-bookings-container');
  // Show bookings where student requested
  const bookings = state.bookings; // Simulated current student bookings
  
  if (bookings.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📅</div>
        <p>No bookings requested yet.</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = bookings.map(b => `
    <div class="booking-item">
      <div class="booking-header">
        <div class="booking-party-info">
          <h4>Mentor: ${b.mentorName}</h4>
          <p>Requested on ${b.createdAt}</p>
        </div>
        <span class="status-badge ${b.status}">${b.status}</span>
      </div>
      <div class="booking-details">
        <div class="booking-time">
          <span>📅</span> ${b.date} at ${b.time}
        </div>
        <p class="booking-message">"${b.message}"</p>
      </div>
    </div>
  `).join('');
}

function renderMentorBookings() {
  const container = document.getElementById('dashboard-bookings-container');
  const bookings = state.bookings; // Real system would filter by logged in mentor ID
  
  if (bookings.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📅</div>
        <p>No booking requests received.</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = bookings.map(b => `
    <div class="booking-item">
      <div class="booking-header">
        <div class="booking-party-info">
          <h4>Student: ${b.studentName}</h4>
          <p>Requested on ${b.createdAt}</p>
        </div>
        <span class="status-badge ${b.status}">${b.status}</span>
      </div>
      <div class="booking-details">
        <div class="booking-time">
          <span>📅</span> ${b.date} at ${b.time}
        </div>
        <p class="booking-message">"${b.message}"</p>
      </div>
      ${b.status === 'pending' ? `
        <div class="booking-actions">
          <button class="btn-accept" onclick="updateBookingStatus('${b.id}', 'approved')">Approve Request</button>
          <button class="btn-decline" onclick="updateBookingStatus('${b.id}', 'declined')">Decline</button>
        </div>
      ` : ''}
    </div>
  `).join('');
}

function updateBookingStatus(bookingId, status) {
  const booking = state.bookings.find(b => b.id === bookingId);
  if (!booking) return;
  
  booking.status = status;
  saveToStorage();
  renderDashboard();
  showToast(`Mentorship request was successfully ${status}!`);
}

function renderStudentForumActivity() {
  const container = document.getElementById('dashboard-activity-container');
  // Filter questions and comments by 'Student User' or 'Alex Carter' (mock logged-in user names)
  const myPosts = state.posts.filter(p => p.author === 'Alex Carter' || p.author === 'Student User');
  
  if (myPosts.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">💬</div>
        <p>No questions posted. Ask one in the Discussion Forum view!</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = myPosts.map(p => `
    <div class="booking-item" style="cursor: pointer" onclick="navigateToForumPost('${p.id}')">
      <div class="booking-header">
        <h4 style="color: var(--accent-secondary); font-size: 0.95rem;">${p.title}</h4>
      </div>
      <p class="booking-details" style="font-size: 0.8rem">
        Posted on ${p.date} • ${p.likes} upvotes • ${p.comments.length} replies
      </p>
    </div>
  `).join('');
}

function renderMentorForumActivity() {
  const container = document.getElementById('dashboard-activity-container');
  const myPosts = state.posts.filter(p => p.author === 'Alumnus Mentor' || p.author === 'Sarah Jenkins' || p.author === 'David Chen');
  
  if (myPosts.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">💬</div>
        <p>No questions posted by you. You can post questions or reply in the Discussion Forum!</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = myPosts.map(p => `
    <div class="booking-item" style="cursor: pointer" onclick="navigateToForumPost('${p.id}')">
      <div class="booking-header">
        <h4 style="color: var(--accent-secondary); font-size: 0.95rem;">${p.title}</h4>
      </div>
      <p class="booking-details" style="font-size: 0.8rem">
        Posted on ${p.date} • ${p.likes} upvotes • ${p.comments.length} replies
      </p>
    </div>
  `).join('');
}

function navigateToForumPost(postId) {
  activeForumCategory = 'all';
  navigateTo('forum');
  setTimeout(() => {
    const el = document.getElementById(`comments-${postId}`);
    if (el) el.classList.add('active');
    const card = document.getElementById(`post-card-${postId}`);
    if (card) {
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      card.style.borderColor = 'var(--accent-primary)';
    }
  }, 100);
}

// Modals Handling
function openBookingModal(mentorId, mentorName) {
  document.getElementById('booking-mentor-id').value = mentorId;
  document.getElementById('booking-mentor-name').value = mentorName;
  document.getElementById('modal-booking').classList.add('active');
}

function closeBookingModal() {
  document.getElementById('modal-booking').classList.remove('active');
  document.getElementById('form-booking').reset();
}

function openRegisterMentorModal() {
  document.getElementById('modal-register-mentor').classList.add('active');
}

function closeRegisterMentorModal() {
  document.getElementById('modal-register-mentor').classList.remove('active');
  document.getElementById('form-register-mentor').reset();
}

function openAskForumModal() {
  document.getElementById('modal-ask-forum').classList.add('active');
}

function closeAskForumModal() {
  document.getElementById('modal-ask-forum').classList.remove('active');
  document.getElementById('form-ask-forum').reset();
}

// Initialize Event Listeners
function setupEventListeners() {
  // Navigation Links
  document.getElementById('logo-home').addEventListener('click', (e) => {
    e.preventDefault();
    navigateTo('mentors');
  });
  document.getElementById('nav-mentors').addEventListener('click', () => navigateTo('mentors'));
  document.getElementById('nav-forum').addEventListener('click', () => navigateTo('forum'));
  document.getElementById('nav-dashboard').addEventListener('click', () => navigateTo('dashboard'));
  
  // Role Selector
  document.getElementById('role-student').addEventListener('click', (e) => {
    switchRole('student');
  });
  document.getElementById('role-mentor').addEventListener('click', (e) => {
    switchRole('mentor');
  });
  
  // Search and Filters
  document.getElementById('mentor-search').addEventListener('input', renderMentors);
  document.getElementById('mentor-domain-filter').addEventListener('change', renderMentors);
  document.getElementById('mentor-availability-filter').addEventListener('change', renderMentors);
  
  // Modals Open
  document.getElementById('btn-open-register-mentor').addEventListener('click', openRegisterMentorModal);
  document.getElementById('btn-open-ask-forum').addEventListener('click', openAskForumModal);
  
  // Modals Close buttons
  document.getElementById('btn-close-booking').addEventListener('click', closeBookingModal);
  document.getElementById('btn-cancel-booking').addEventListener('click', closeBookingModal);
  
  document.getElementById('btn-close-register-mentor').addEventListener('click', closeRegisterMentorModal);
  document.getElementById('btn-close-register-mentor-cancel').addEventListener('click', closeRegisterMentorModal);
  
  document.getElementById('btn-close-ask-forum').addEventListener('click', closeAskForumModal);
  document.getElementById('btn-close-ask-forum-cancel').addEventListener('click', closeAskForumModal);
  
  // Modal Overlays click close
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.classList.remove('active');
      }
    });
  });
  
  // Forum Categories
  document.querySelectorAll('.category-item').forEach(item => {
    item.addEventListener('click', () => {
      activeForumCategory = item.getAttribute('data-category');
      renderForum();
    });
  });
  
  // Booking Form Submission
  document.getElementById('form-booking').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const mentorId = document.getElementById('booking-mentor-id').value;
    const mentorName = document.getElementById('booking-mentor-name').value;
    const date = document.getElementById('booking-date').value;
    const time = document.getElementById('booking-time').value;
    const message = document.getElementById('booking-message').value;
    
    const newBooking = {
      id: 'b_' + Date.now(),
      mentorId,
      mentorName,
      studentName: state.role === 'student' ? 'Student User' : 'Alumnus Mentor',
      date,
      time,
      message,
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0]
    };
    
    state.bookings.push(newBooking);
    saveToStorage();
    closeBookingModal();
    showToast('Mentorship booking request submitted!');
    
    if (state.activeView === 'dashboard') {
      renderDashboard();
    }
  });
  
  // Mentor Register Form Submission
  document.getElementById('form-register-mentor').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = document.getElementById('mentor-name').value;
    const domain = document.getElementById('mentor-domain').value;
    const experience = parseInt(document.getElementById('mentor-experience').value, 10);
    const bio = document.getElementById('mentor-bio').value;
    const availability = document.getElementById('mentor-availability').value;
    
    const newMentor = {
      id: 'm_' + Date.now(),
      name,
      domain,
      experience,
      bio,
      availability
    };
    
    state.mentorProfileId = newMentor.id;
    state.mentors.unshift(newMentor);
    saveToStorage();
    closeRegisterMentorModal();
    showToast('Congratulations! Registered as a mentor.');
    
    // Automatically switch to mentor view
    switchRole('mentor', true);
    navigateTo('dashboard');
  });
  
  // Forum Question Submission
  document.getElementById('form-ask-forum').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const title = document.getElementById('forum-title').value;
    const category = document.getElementById('forum-category').value;
    const body = document.getElementById('forum-body').value;
    
    const newPost = {
      id: 'p_' + Date.now(),
      title,
      category,
      body,
      author: state.role === 'student' ? 'Student User' : 'Alumnus Mentor',
      date: new Date().toISOString().split('T')[0],
      likes: 0,
      likedBy: [],
      comments: []
    };
    
    state.posts.unshift(newPost);
    saveToStorage();
    closeAskForumModal();
    showToast('Question successfully posted in the forum!');
    
    if (state.activeView === 'forum') {
      renderForum();
    }
  });

  // Login Form Submission
  document.getElementById('form-login').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const role = document.getElementById('login-role').value;
    
    // Setup login success
    state.loggedIn = true;
    state.role = role;
    
    // Switch Active UI role toggle
    switchRole(role, true);
    
    // Show Header elements
    document.getElementById('header-nav').style.display = 'block';
    document.getElementById('header-actions').style.display = 'flex';
    
    saveToStorage();
    showToast(`Logged in successfully as ${role === 'student' ? 'Student User' : 'Alumni Mentor'}`);
    navigateTo('mentors');
  });

  // Logout Button
  document.getElementById('btn-logout').addEventListener('click', () => {
    state.loggedIn = false;
    document.getElementById('header-nav').style.display = 'none';
    document.getElementById('header-actions').style.display = 'none';
    
    saveToStorage();
    showToast('Logged out successfully.');
    navigateTo('login');
  });
}

function switchRole(role, suppressToast = false) {
  state.role = role;
  
  // Update header switch UI
  if (role === 'mentor') {
    document.getElementById('role-student').classList.remove('active');
    document.getElementById('role-mentor').classList.add('active');
  } else {
    document.getElementById('role-mentor').classList.remove('active');
    document.getElementById('role-student').classList.add('active');
  }
  
  saveToStorage();
  if (!suppressToast) {
    showToast(`Switched active view profile role to: ${role.toUpperCase()}`);
  }
  
  // Re-render current page
  navigateTo(state.activeView);
}

// App Entry Point
window.addEventListener('DOMContentLoaded', () => {
  initStore();
  setupEventListeners();
  
  // Init default role UI state
  if (state.role === 'mentor') {
    document.getElementById('role-student').classList.remove('active');
    document.getElementById('role-mentor').classList.add('active');
  }
  
  // Load default landing view
  navigateTo('mentors');
});
