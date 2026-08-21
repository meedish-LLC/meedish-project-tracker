/**
 * Meedish Tracker App Logic (Advanced)
 */

const GOOGLE_APP_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwz_CQzAhkbLzf0QzGAMUG-ZVLsKKz5rwxi0l5ZSUsJzcAiF6zTLQkRGw0WWWjbRTv3-w/exec';

// === Authentication Logic ===
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  if (localStorage.getItem('meedish_user')) {
    window.location.href = 'tracker.html';
  }

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const pwd = document.getElementById('password').value;
    const btnText = document.getElementById('loginBtnText');
    const loader = document.getElementById('loginLoader');

    btnText.style.display = 'none';
    loader.style.display = 'inline-block';

    try {
      const response = await fetch(GOOGLE_APP_SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify({ action: 'verifyPassword', password: pwd })
      });
      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem('meedish_user', 'true');
        window.location.href = 'tracker.html';
      } else {
        alert("Invalid passcode. Please try again.");
        btnText.style.display = 'inline-block';
        loader.style.display = 'none';
      }
    } catch (error) {
      alert("Error verifying password. Did you copy your script URL correctly?");
      btnText.style.display = 'inline-block';
      loader.style.display = 'none';
    }
  });
}

// === Dashboard Logic ===
const trackerApp = () => {
  const container = document.getElementById('projectsContainer');
  if (!container) return;

  if (!localStorage.getItem('meedish_user')) {
    window.location.href = 'index.html';
    return;
  }

  document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('meedish_user');
    window.location.href = 'index.html';
  });

  // State
  let projects = [];
  let editingId = null;

  const fetchProjects = async () => {
    container.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 40px;"><div class="loader loader-large"></div></td></tr>';

    try {
      if (GOOGLE_APP_SCRIPT_URL.includes('YOUR_GOOGLE')) {
        container.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-secondary); padding: 40px;">Please configure your Google Apps Script URL.</td></tr>`;
        return;
      }
      const response = await fetch(GOOGLE_APP_SCRIPT_URL);
      projects = await response.json();
      renderDashboard();
    } catch (error) {
      console.error(error);
      container.innerHTML = `<tr><td colspan="8" style="text-align: center; color: red;">Failed to load data.</td></tr>`;
    }
  };

  const updateKPIs = (data) => {
    const total = data.length;
    const completed = data.filter(p => p.progress >= 100 || p.status === 'Completed').length;
    const inMotion = total - completed;

    const avgProg = total === 0 ? 0 : Math.round(data.reduce((acc, curr) => acc + parseInt(curr.progress || 0), 0) / total);

    const today = new Date();
    const late = data.filter(p => p.progress < 100 && new Date(p.end) < today).length;

    document.getElementById('kpiTotal').innerText = total;
    document.getElementById('kpiTotalSub').innerText = `${inMotion} in motion`;

    document.getElementById('kpiProgress').innerText = `${avgProg}%`;
    document.getElementById('kpiProgressSub').innerText = `${completed} tasks completed`;

    document.getElementById('kpiLate').innerText = late;
    document.getElementById('kpiLateSub').innerText = `${late} due within 7 days`;
  };

  const renderDashboard = () => {
    const searchStr = document.getElementById('searchInput').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;

    let filtered = projects.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(searchStr) || p.wbs.toLowerCase().includes(searchStr) || p.lead.toLowerCase().includes(searchStr);
      const matchStatus = statusFilter === 'All' || p.status === statusFilter;
      return matchSearch && matchStatus;
    });

    updateKPIs(projects); // Update KPIs based on ALL data, or filtered data depending on requirement. Usually all data.

    if (filtered.length === 0) {
      container.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 40px; color: var(--text-secondary);">No tasks found.</td></tr>`;
      return;
    }

    container.innerHTML = filtered.map(p => `
      <tr class="fade-in">
        <td style="font-weight: 500;">${p.wbs}</td>
        <td>
          <div style="font-weight: 500;">${p.name}</div>
          ${p.checkpoints && p.checkpoints.length > 0 ? `<div style="font-size: 11px; color: var(--text-secondary); margin-top: 4px;">&#8627; ${p.checkpoints.length} checkpoints</div>` : ''}
        </td>
        <td>${p.lead}</td>
        <td>${p.start}</td>
        <td>${p.end}</td>
        <td>
          <div style="display: flex; align-items: center; justify-content: space-between; font-size: 12px; margin-bottom: 2px;">
            <span>${p.progress}%</span>
          </div>
          <div class="progress-bar-bg">
            <div class="progress-bar-fill" style="width: ${p.progress}%"></div>
          </div>
        </td>
        <td><span class="status-badge status-${p.status.toLowerCase()}">${p.status}</span></td>
        <td style="text-align: right; white-space: nowrap;">
          <button class="action-btn" onclick="openEditModal('${p.id}')" title="Edit" ${p.status === 'Completed' ? 'disabled style="opacity: 0.3; cursor: not-allowed;"' : ''}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
          </button>
          <button class="action-btn" onclick="deleteTask('${p.id}')" title="Delete" ${p.status === 'Completed' ? 'disabled style="color: #ef4444; opacity: 0.3; cursor: not-allowed;"' : 'style="color: #ef4444;"'}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </td>
      </tr>
    `).join('');
  };

  // Listeners for filters
  document.getElementById('searchInput').addEventListener('input', renderDashboard);
  document.getElementById('statusFilter').addEventListener('change', renderDashboard);
  document.getElementById('refreshBtn').addEventListener('click', fetchProjects);

  // Modal Logic
  const modal = document.getElementById('taskModal');
  const taskForm = document.getElementById('taskForm');
  const checkpointsContainer = document.getElementById('checkpointsContainer');

  const renderModalCheckpoints = (checkpointsArr = []) => {
    checkpointsContainer.innerHTML = '';
    checkpointsArr.forEach(cp => addCheckpointInput(cp));
  };

  const addCheckpointInput = (val = '') => {
    const div = document.createElement('div');
    div.style.display = 'flex';
    div.style.gap = '8px';
    div.innerHTML = `
      <input type="text" class="input-control checkpoint-input" placeholder="Checkpoint description" value="${val}" required style="padding: 8px 12px; flex: 1;">
      <button type="button" class="btn btn-outline" onclick="this.parentElement.remove()" style="padding: 8px 12px; color: #ef4444;" title="Remove Checkpoint">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>
    `;
    checkpointsContainer.appendChild(div);
  };

  document.getElementById('addCheckpointBtn').addEventListener('click', () => {
    addCheckpointInput();
  });

  document.getElementById('newTaskBtn').addEventListener('click', () => {
    editingId = null;
    document.getElementById('modalTitle').innerText = 'New Task';
    taskForm.reset();
    document.getElementById('taskProgress').value = 0;
    renderModalCheckpoints([]);

    // Auto increment WBS
    const maxWbs = projects.reduce((max, p) => {
      const parts = p.wbs.split('.');
      const last = parseInt(parts[parts.length - 1]) || 0;
      return last > max ? last : max;
    }, 0);
    document.getElementById('taskWbs').value = `1.${maxWbs + 1}`;

    modal.classList.add('active');
  });

  document.getElementById('closeModalBtn').addEventListener('click', () => {
    modal.classList.remove('active');
  });

  window.openEditModal = (id) => {
    const p = projects.find(x => x.id === id);
    if (!p) return;
    if (p.status === 'Completed') {
      alert("Completed tasks cannot be edited.");
      return;
    }
    editingId = id;
    document.getElementById('modalTitle').innerText = `Edit Task - ${p.wbs}`;

    document.getElementById('taskId').value = p.id;
    document.getElementById('taskWbs').value = p.wbs;
    document.getElementById('taskName').value = p.name;
    document.getElementById('taskLead').value = p.lead;
    document.getElementById('taskStart').value = p.start;
    document.getElementById('taskEnd').value = p.end;
    document.getElementById('taskProgress').value = p.progress;
    renderModalCheckpoints(p.checkpoints || []);

    modal.classList.add('active');
  };

  taskForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const saveBtn = document.getElementById('saveTaskBtn');
    saveBtn.innerText = 'Saving...';

    const progress = parseInt(document.getElementById('taskProgress').value);
    const status = progress >= 100 ? 'Completed' : 'Active';

    const pData = {
      action: editingId ? 'update' : 'add',
      id: editingId || Date.now().toString(),
      wbs: document.getElementById('taskWbs').value,
      name: document.getElementById('taskName').value,
      lead: document.getElementById('taskLead').value,
      start: document.getElementById('taskStart').value,
      end: document.getElementById('taskEnd').value,
      progress: progress,
      status: status,
      checkpoints: Array.from(document.querySelectorAll('.checkpoint-input')).map(el => el.value)
    };

    try {
      await fetch(GOOGLE_APP_SCRIPT_URL, { method: 'POST', body: JSON.stringify(pData) });
      modal.classList.remove('active');
      fetchProjects();
    } catch (err) {
      alert("Error saving.");
    } finally {
      saveBtn.innerText = 'Save Task';
    }
  });

  window.deleteTask = async (id) => {
    const p = projects.find(x => x.id === id);
    if (p && p.status === 'Completed') {
      alert("Completed tasks cannot be deleted.");
      return;
    }
    if (!confirm("Are you sure you want to delete this task?")) return;
    try {
      await fetch(GOOGLE_APP_SCRIPT_URL, { method: 'POST', body: JSON.stringify({ action: 'delete', id }) });
      fetchProjects();
    } catch (err) { }
  };

  document.getElementById('exportBtn').addEventListener('click', () => {
    let csvContent = "data:text/csv;charset=utf-8,WBS,Task Name,Lead,Start Date,End Date,Progress,Status\n";
    projects.forEach(p => {
      const row = `${p.wbs},"${p.name}","${p.lead}",${p.start},${p.end},${p.progress}%,${p.status}`;
      csvContent += row + "\n";
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "tasks_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });

  fetchProjects();
};

if (document.getElementById('projectsContainer')) {
  trackerApp();
}
