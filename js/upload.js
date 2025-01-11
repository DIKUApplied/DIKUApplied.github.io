const UPLOAD_PASSWORD = 'firstdikuapplied';
const modal = document.getElementById('uploadModal');
const uploadButton = document.getElementById('uploadButton');
const passwordSection = document.getElementById('passwordSection');
const uploadForm = document.getElementById('uploadForm');
const imagePreview = document.getElementById('imagePreview');

let currentImageFile = null;

// Open modal when upload button is clicked
uploadButton.onclick = () => {
    modal.style.display = 'block';
    passwordSection.style.display = 'block';
    uploadForm.style.display = 'none';
    document.getElementById('passwordInput').value = '';
    document.getElementById('passwordError').textContent = '';
};

// Close modal when clicking outside
window.onclick = (event) => {
    if (event.target === modal) {
        closeModal();
    }
};

function closeModal() {
    modal.style.display = 'none';
    // Reset form
    document.getElementById('projectForm').reset();
    imagePreview.style.backgroundImage = '';
    imagePreview.textContent = 'No image selected';
}

function validatePassword() {
    const password = document.getElementById('passwordInput').value;
    const errorElement = document.getElementById('passwordError');
    
    if (password === UPLOAD_PASSWORD) {
        passwordSection.style.display = 'none';
        uploadForm.style.display = 'block';
        errorElement.textContent = '';
    } else {
        errorElement.textContent = 'Incorrect password. Please try again.';
    }
}

// Handle image preview
document.getElementById('projectImage').onchange = function(e) {
    const file = e.target.files[0];
    if (file) {
        currentImageFile = file;
        const reader = new FileReader();
        reader.onload = function(e) {
            imagePreview.style.backgroundImage = `url(${e.target.result})`;
            imagePreview.textContent = '';
        };
        reader.readAsDataURL(file);
    }
};

const github = new GitHubAPI(GITHUB_TOKEN);

async function submitProject(e) {
    e.preventDefault();
    
    try {
        const projectData = {
            title: document.getElementById('projectTitle').value,
            creatorName: document.getElementById('creatorName').value,
            creatorEmail: document.getElementById('creatorEmail').value,
            githubLink: document.getElementById('githubLink').value,
            description: document.getElementById('description').value
        };

        const imageFile = document.getElementById('projectImage').files[0];
        
        await github.uploadProject(projectData, imageFile);
        alert('Project uploaded successfully!');
        closeModal();
        refreshProjectGrid(isAdminMode);
    } catch (error) {
        console.error('Error uploading project:', error);
        alert('Error uploading project. Please try again.');
    }
}

async function deleteProject(projectId) {
    if (!confirm('Are you sure you want to delete this project?')) {
        return;
    }

    try {
        await github.deleteProject(projectId);
        alert('Project deleted successfully!');
        refreshProjectGrid(isAdminMode);
    } catch (error) {
        console.error('Error deleting project:', error);
        alert('Error deleting project. Please try again.');
    }
}

function convertImageToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// upload.js
document.getElementById('projectForm').addEventListener('submit', submitProject);

// Close modal function
function closeModal() {
    document.getElementById('uploadModal').style.display = 'none';
    document.getElementById('projectForm').reset();
    const imagePreview = document.getElementById('imagePreview');
    imagePreview.style.backgroundImage = '';
    imagePreview.textContent = 'No image selected';
}