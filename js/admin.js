// admin.js
let isAdminMode = false;

// Admin button click handler
document.getElementById('adminButton')?.addEventListener('click', () => {
    const password = prompt('Enter admin password:');
    if (password === 'firstdikuapplied') {
        isAdminMode = !isAdminMode;
        document.getElementById('adminButton').classList.toggle('active');
        loadProjects();
    } else {
        alert('Incorrect password');
    }
});

// Delete project handler
async function deleteProject(projectId) {
    if (!confirm('Are you sure you want to delete this project?')) {
        return;
    }

    try {
        await github.deleteProject(projectId);
        alert('Project deleted successfully!');
        loadProjects();
    } catch (error) {
        console.error('Error:', error);
        alert('Error deleting project. Please try again.');
    }
}

// Modified loadProjects function to include delete buttons
async function loadProjects() {
    const projectGrid = document.querySelector('.project-grid');
    try {
        const response = await fetch('./projects.json');
        const data = await response.json();
        
        if (!data.projects || !data.projects.length) {
            projectGrid.innerHTML = '<p class="no-projects">No projects uploaded yet.</p>';
            return;
        }

        const projectsHTML = data.projects.map(project => `
            <div class="project-card">
                ${project.image ? `<img src="${project.image}" alt="${project.name}">` : ''}
                <h4>${project.name}</h4>
                <div class="creator-info">by ${project.creatorName}</div>
                <p>${project.description}</p>
                <a href="${project.githubLink}" class="github-link">View on GitHub</a>
                ${isAdminMode ? `
                    <button class="delete-button" onclick="deleteProject('${project.id}')">
                        Delete Project
                    </button>
                ` : ''}
            </div>
        `).join('');

        projectGrid.innerHTML = projectsHTML;
    } catch (error) {
        console.error('Error loading projects:', error);
        projectGrid.innerHTML = '<p class="error">Error loading projects. Please try again later.</p>';
    }
}


