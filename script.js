const API_KEY = "61ee4cd2e5mshba1f7848f2fd734p16d141jsn3c771a7b6ad1"; 

document.addEventListener("DOMContentLoaded", () => {
    loadPreviousSearch();
});

async function fetchJobs() {
    const jobTitle = document.getElementById("jobTitle").value.trim();
    const location = document.getElementById("location").value.trim();
    
    if (!jobTitle) {
        alert("Please enter a job title");
        return;
    }

    const url = `https://jsearch.p.rapidapi.com/search?query=${jobTitle} in ${location}&page=1&num_pages=1`;

    const options = {
        method: "GET",
        headers: {
            "X-RapidAPI-Key": API_KEY,
            "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
        },
    };

    try {
        const response = await fetch(url, options);
        const data = await response.json();

        if (!data.data || data.data.length === 0) {
            document.getElementById("jobResults").innerHTML = "<p>No jobs found. Try another search.</p>";
            return;
        }

        localStorage.setItem('currentJobSearch', JSON.stringify({
            timestamp: new Date().getTime(),
            searchQuery: { jobTitle, location },
            jobs: data.data
        }));

        displayJobs(data.data);
    } catch (error) {
        console.error("Error fetching jobs:", error);
        document.getElementById("jobResults").innerHTML = "<p>Error fetching job listings.</p>";
    }
}

function displayJobs(jobs) {
    const jobResults = document.getElementById("jobResults");

    jobResults.innerHTML = jobs.map(job => {
        const sanitizedJob = {
            id: job.job_id,
            title: job.job_title?.replace(/['"\\]/g, '\\$&') || '',
            company: job.employer_name?.replace(/['"\\]/g, '\\$&') || 'N/A',
            city: job.job_city?.replace(/['"\\]/g, '\\$&') || 'N/A',
            country: job.job_country?.replace(/['"\\]/g, '\\$&') || 'N/A',
            applyLink: job.job_apply_link?.replace(/['"\\]/g, '\\$&') || '',
            description: job.job_description?.replace(/['"\\]/g, '\\$&') || '',
            type: job.job_employment_type?.replace(/['"\\]/g, '\\$&') || 'N/A',
            minSalary: job.job_min_salary || 'Not Specified',
            maxSalary: job.job_max_salary || ''
        };

        return `
            <div class="job-card">
                <div class="job-header">
                    <h3 class="job-title">${sanitizedJob.title}</h3>
                    <div class="company-name">${sanitizedJob.company}</div>
                </div>
                <div class="job-body">
                    <div class="job-info">
                        <div class="info-item">
                            <span class="info-label">📍 Location:</span>
                            <span class="info-value">${sanitizedJob.city}, ${sanitizedJob.country}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">💰 Salary:</span>
                            <span class="info-value">${sanitizedJob.minSalary !== 'Not Specified' ? 
                                `$${sanitizedJob.minSalary} - $${sanitizedJob.maxSalary}` : 
                                "Not Specified"}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">💼 Type:</span>
                            <span class="info-value">${sanitizedJob.type}</span>
                        </div>
                    </div>
                </div>
                    <button class="apply-btn" onclick="window.open('${sanitizedJob.applyLink}', '_blank')">
                        Apply Now
                    </button>
                    <button class="save-btn" onclick="saveJob(
                        '${sanitizedJob.id}',
                        '${sanitizedJob.title}',
                        '${sanitizedJob.company}',
                        '${sanitizedJob.city}, ${sanitizedJob.country}',
                        '${sanitizedJob.applyLink}',
                        '${sanitizedJob.description}',
                        '${sanitizedJob.type}',
                        '${sanitizedJob.minSalary}',
                        '${sanitizedJob.maxSalary}'
                    )">
                        Save Job
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function loadPreviousSearch() {
    const savedSearch = localStorage.getItem("currentJobSearch");

    if (savedSearch) {
        const { searchQuery, jobs } = JSON.parse(savedSearch);
        
        // Restore last search values in input fields
        document.getElementById("jobTitle").value = searchQuery.jobTitle;
        document.getElementById("location").value = searchQuery.location;

        displayJobs(jobs);
    }
}




