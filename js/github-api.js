class GitHubAPI {
    constructor() {
        this.baseUrl = 'https://api.github.com';
        this.owner = GITHUB_CONFIG.OWNER;
        this.repo = GITHUB_CONFIG.REPO_NAME;
        this.appId = GITHUB_CONFIG.APP_ID;
        this.installationId = GITHUB_CONFIG.INSTALLATION_ID;
        this.privateKey = GITHUB_CONFIG.PRIVATE_KEY;
        this.token = null;
        this.tokenExpiresAt = null;
    }

    async getInstallationToken() {
        // Check if we have a valid token
        if (this.token && this.tokenExpiresAt && new Date() < this.tokenExpiresAt) {
            return this.token;
        }

        try {
            // Create JWT
            const now = Math.floor(Date.now() / 1000);
            const header = {
                alg: 'RS256',
                typ: 'JWT'
            };
            const payload = {
                iat: now,
                exp: now + (10 * 60), // JWT expires in 10 minutes
                iss: this.appId
            };

            // Create JWT using jsrsasign
            const sHeader = JSON.stringify(header);
            const sPayload = JSON.stringify(payload);
            const privateKey = KEYUTIL.getKey(this.privateKey);
            const jwt = KJUR.jws.JWS.sign('RS256', sHeader, sPayload, privateKey);

            console.log('JWT created successfully');

            // Get installation token
            const response = await fetch(
                `${this.baseUrl}/app/installations/${this.installationId}/access_tokens`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${jwt}`,
                        'Accept': 'application/vnd.github.v3+json'
                    }
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Installation token error:', errorData);
                throw new Error(`Failed to get installation token: ${response.status} - ${errorData.message}`);
            }

            const data = await response.json();
            this.token = data.token;
            this.tokenExpiresAt = new Date(data.expires_at);
            console.log('Installation token obtained successfully');
            return this.token;

        } catch (error) {
            console.error('Error getting installation token:', error);
            console.error('Stack trace:', error.stack);
            throw error;
        }
    }

    async uploadFile(path, content, message, isImage = false) {
        try {
            const token = await this.getInstallationToken();
            
            // First check if file exists
            let existingFile = null;
            try {
                const response = await fetch(`${this.baseUrl}/repos/${this.owner}/${this.repo}/contents/${path}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/vnd.github.v3+json'
                    }
                });
                if (response.ok) {
                    existingFile = await response.json();
                }
            } catch (error) {
                console.log('File does not exist yet');
            }
    
            // For images, content is already base64. For other files, we need to encode it
            const contentToUpload = isImage ? content : btoa(unescape(encodeURIComponent(content)));
    
            // Prepare the request body
            const body = {
                message: message,
                content: contentToUpload
            };
    
            // If file exists, include its SHA
            if (existingFile && existingFile.sha) {
                body.sha = existingFile.sha;
            }
    
            // Upload/update the file
            const response = await fetch(`${this.baseUrl}/repos/${this.owner}/${this.repo}/contents/${path}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });
    
            if (!response.ok) {
                throw new Error(`GitHub API error: ${response.status}`);
            }
    
            return await response.json();
        } catch (error) {
            console.error('Error uploading file:', error);
            throw error;
        }
    }

    async uploadProject(projectData, imageFile) {
        try {
            // 1. Upload image
            const timestamp = new Date().getTime();
            const filename = `project_${timestamp}.png`;
            const imagePath = `events/2025-01-11/images/project-screenshots/${filename}`;
            
            // Convert image to base64 properly
            const imageBase64 = await this.fileToBase64(imageFile);
            
            // Upload image with isImage flag set to true
            await this.uploadFile(imagePath, imageBase64, 'Upload project image', true);
            
            // Rest of the method stays the same...
            const projectsPath = 'events/2025-01-11/projects.json';
            let currentProjects = { projects: [] };
            try {
                const response = await fetch(`${this.baseUrl}/repos/${this.owner}/${this.repo}/contents/${projectsPath}`, {
                    headers: {
                        'Authorization': `Bearer ${this.token}`,
                        'Accept': 'application/vnd.github.v3+json'
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    currentProjects = JSON.parse(decodeURIComponent(escape(atob(data.content))));
                }
            } catch (error) {
                console.log('Creating new projects.json');
            }
            
            const newProject = {
                id: timestamp.toString(),
                name: projectData.title,
                creatorName: projectData.creatorName,
                creatorEmail: projectData.creatorEmail,
                githubLink: projectData.githubLink,
                description: projectData.description,
                uploadDate: new Date().toISOString(),
                image: `https://raw.githubusercontent.com/${this.owner}/${this.repo}/main/${imagePath}`
            };
    
            currentProjects.projects.push(newProject);
            
            // Upload updated projects.json (not an image, so no isImage flag)
            await this.uploadFile(
                projectsPath,
                JSON.stringify(currentProjects, null, 2),
                'Add new project'
            );
    
            return newProject;
        } catch (error) {
            console.error('Error uploading project:', error);
            throw error;
        }
    }

    async deleteFile(path, message) {
        try {
            // First get the file to get its SHA
            const response = await fetch(`${this.baseUrl}/repos/${this.owner}/${this.repo}/contents/${path}`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
    
            if (!response.ok) {
                throw new Error(`Failed to get file: ${response.status}`);
            }
    
            const file = await response.json();
    
            // Delete the file
            const deleteResponse = await fetch(`${this.baseUrl}/repos/${this.owner}/${this.repo}/contents/${path}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: message,
                    sha: file.sha
                })
            });
    
            if (!deleteResponse.ok) {
                throw new Error(`Failed to delete file: ${deleteResponse.status}`);
            }
    
            return await deleteResponse.json();
        } catch (error) {
            console.error('Error deleting file:', error);
            throw error;
        }
    }
    
    async deleteProject(projectId) {
        try {
            // 1. Get current projects.json
            const response = await fetch(`${this.baseUrl}/repos/${this.owner}/${this.repo}/contents/events/2025-01-11/projects.json`, {
                headers: {
                    'Authorization': `token ${this.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
    
            if (!response.ok) {
                throw new Error('Failed to get projects.json');
            }
    
            const data = await response.json();
            const currentProjects = JSON.parse(decodeURIComponent(escape(atob(data.content))));
    
            // 2. Find project to delete
            const projectToDelete = currentProjects.projects.find(p => p.id === projectId);
            if (!projectToDelete) {
                throw new Error('Project not found');
            }
    
            // 3. Delete project image if it exists
            if (projectToDelete.image) {
                const imagePath = projectToDelete.image.split('/main/')[1];
                try {
                    await this.deleteFile(imagePath, 'Delete project image');
                } catch (error) {
                    console.error('Error deleting image:', error);
                    // Continue even if image delete fails
                }
            }
    
            // 4. Update projects.json without the deleted project
            currentProjects.projects = currentProjects.projects.filter(p => p.id !== projectId);
    
            // 5. Save updated projects.json
            await this.uploadFile(
                'events/2025-01-11/projects.json',
                JSON.stringify(currentProjects, null, 2),
                'Delete project'
            );
    
            return true;
        } catch (error) {
            console.error('Error deleting project:', error);
            throw error;
        }
    }

    // Update the fileToBase64 method to handle images properly
    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                // Get the base64 string without the data URL prefix
                const base64String = reader.result.split(',')[1];
                resolve(base64String);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
    
    
}