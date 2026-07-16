function navClick() { 
  const menu = document.getElementById("menu");
  if (menu) menu.click(); 
}

// helper to format dates (e.g. 2026-04 -> April 2026)
function formatDate(str) {
  if (!str) return "";
  if (str.toLowerCase() === "present") return "Present";
  const [year, month] = str.split("-");
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  return `${monthNames[parseInt(month, 10) - 1]} ${year}`;
}

// Typewriter Animation
var TxtType = function(el, toRotate, period) {
  this.toRotate = toRotate;
  this.el = el;
  this.loopNum = 0;
  this.period = parseInt(period, 10) || 2000;
  this.txt = '';
  this.tick();
  this.isDeleting = false;
};

TxtType.prototype.tick = function() {
  var i = this.loopNum % this.toRotate.length;
  var fullTxt = this.toRotate[i];

  if (this.isDeleting) {
    this.txt = fullTxt.substring(0, this.txt.length - 1);
  } else {
    this.txt = fullTxt.substring(0, this.txt.length + 1);
  }

  this.el.innerHTML = '<span class="wrap">'+this.txt+'</span>';

  var that = this;
  var delta = 200 - Math.random() * 100;

  if (this.isDeleting) { delta /= 2; }

  if (!this.isDeleting && this.txt === fullTxt) {
    delta = this.period;
    this.isDeleting = true;
  } else if (this.isDeleting && this.txt === '') {
    this.isDeleting = false;
    this.loopNum++;
    delta = 500;
  }

  setTimeout(function() {
    that.tick();
  }, delta);
};

// Calculate duration between dates
function calculateDuration(startStr, endStr) {
  if (!startStr) return "";
  
  var startDate = new Date(startStr + "-01");
  var endDate;
  if (endStr === "present") {
    endDate = new Date();
  } else {
    endDate = new Date(endStr + "-01");
  }
  
  var startYear = startDate.getFullYear();
  var startMonth = startDate.getMonth();
  
  var endYear = endDate.getFullYear();
  var endMonth = endDate.getMonth();
  
  var totalMonths = (endYear - startYear) * 12 + (endMonth - startMonth) + 1;
  if (totalMonths <= 0) return "";
  
  var years = Math.floor(totalMonths / 12);
  var months = totalMonths % 12;
  
  var parts = [];
  if (years > 0) {
    parts.push(years === 1 ? "1 year" : years + " years");
  }
  if (months > 0) {
    parts.push(months === 1 ? "1 month" : months + " months");
  }
  
  return parts.join(" ");
}

document.addEventListener("DOMContentLoaded", function() {
  // 1. Dynamic Age Calculation
  const birthDateStr = resumeData.profile.birthDate;
  if (birthDateStr) {
    const birthDate = new Date(birthDateStr);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    const ageEl = document.getElementById('dynamic-age');
    if (ageEl) {
      ageEl.textContent = age + " Years";
    }
  }

  // 2. Render Experiences Timeline
  const expTimeline = document.getElementById("experience-timeline-wrap");
  if (expTimeline && resumeData.experiences) {
    let expHtml = "";
    resumeData.experiences.forEach((exp, index) => {
      const dateText = (exp.start === exp.end) ? formatDate(exp.start) : `${formatDate(exp.start)} - ${formatDate(exp.end)}`;
      const isExpandedClass = index === 0 ? "is-expanded" : "";
      const icoClass = exp.logo ? "timeline-ico has-logo" : "timeline-ico";
      const icoContent = exp.logo 
        ? `<img src="${exp.logo}" alt="${exp.company} logo" class="timeline-logo-img">`
        : `<i class="fa fa-briefcase"></i>`;
        
      expHtml += `
        <div class="timeline-block ${isExpandedClass}" tabindex="0" data-start="${exp.start}" data-end="${exp.end}" data-category="${exp.category}">
          <div class="${icoClass}">${icoContent}</div>
          <div class="timeline-header">
            <h3>${exp.role}</h3>
            <p class="timeline-time-header">${dateText}</p>
            <p class="timeline-duration"></p>
          </div>
          <div class="timeline-content">
            <h4>${exp.company}, ${exp.location} <span class="timeline-toggle"><i class="fa fa-chevron-down"></i></span></h4>
            <p class="timeline-time-content">${dateText}</p>
            <div class="timeline-details">
              <p>${exp.details}</p>
            </div>
          </div>
        </div>
      `;
    });
    expTimeline.innerHTML = expHtml;
  }

  // 3. Render Education Timeline
  const eduTimeline = document.getElementById("education-timeline-wrap");
  if (eduTimeline && resumeData.education) {
    let eduHtml = "";
    resumeData.education.forEach((edu) => {
      const dateText = (edu.start === edu.end) ? formatDate(edu.start) : `${formatDate(edu.start)} - ${formatDate(edu.end)}`;
      const icoClass = edu.logo ? "timeline-ico has-logo" : "timeline-ico";
      const icoContent = edu.logo 
        ? `<img src="${edu.logo}" alt="${edu.institution} logo" class="timeline-logo-img">`
        : `<i class="fa fa-graduation-cap"></i>`;

      eduHtml += `
        <div class="timeline-block" tabindex="0" data-start="${edu.start}" data-end="${edu.end}">
          <div class="${icoClass}">${icoContent}</div>
          <div class="timeline-header">
            <h3>${edu.degree}</h3>
            <p class="timeline-time-header">${dateText}</p>
            <p class="timeline-duration"></p>
          </div>
          <div class="timeline-content">
            <h4>${edu.institution}, ${edu.location} <span class="timeline-toggle"><i class="fa fa-chevron-down"></i></span></h4>
            <p class="timeline-time-content">${dateText}</p>
            <div class="timeline-details">
              <p>${edu.details}</p>
            </div>
          </div>
        </div>
      `;
    });
    eduTimeline.innerHTML = eduHtml;
  }

  // 4. Render Projects
  const projectsGrid = document.getElementById("projects-grid-wrap");
  if (projectsGrid && resumeData.projects) {
    let projHtml = "";
    resumeData.projects.forEach((proj) => {
      const tagsHtml = proj.tags.map(tag => `<span>${tag}</span>`).join("");
      projHtml += `
        <div class="project-card-col">
          <div class="project-card">
            <div class="project-card-icon"><i class="fa ${proj.icon}"></i></div>
            <h3>${proj.title}</h3>
            <p>${proj.description}</p>
            <div class="project-tags">
              ${tagsHtml}
            </div>
            <a href="${proj.github}" target="_blank" class="project-link"><i class="fa fa-github"></i> View GitHub</a>
          </div>
        </div>
      `;
    });
    projectsGrid.innerHTML = projHtml;
  }

  // 5. Render Skills
  const skillsTbody = document.getElementById("skills-table-body");
  if (skillsTbody && resumeData.skills) {
    let skillsHtml = "";
    for (let i = 0; i < resumeData.skills.length; i += 2) {
      const skill1 = resumeData.skills[i];
      const skill2 = resumeData.skills[i + 1];
      skillsHtml += `<tr>`;
      skillsHtml += `<td> <img src="${skill1.icon}"> <h2 style="color:#ff0077">${skill1.name}</h2></td>`;
      if (skill2) {
        skillsHtml += `<td> <img src="${skill2.icon}" class="img-even"> <h2 style="color:#ff0077">${skill2.name}</h2></td>`;
      } else {
        skillsHtml += `<td></td>`;
      }
      skillsHtml += `</tr>`;
    }
    skillsTbody.innerHTML = skillsHtml;
  }

  // Initialize interactive timeline accordion logic
  const timelineBlocks = document.querySelectorAll("#resume .timeline-block");
  timelineBlocks.forEach(function(block) {
    var start = block.getAttribute("data-start");
    var end = block.getAttribute("data-end");
    if (start && end) {
      var durationText = calculateDuration(start, end);
      var durationEl = block.querySelector(".timeline-duration");
      if (durationEl) {
        durationEl.textContent = durationText;
      }
    }

    block.addEventListener("click", function(e) {
      if (e.target.closest("a")) return;
      if (window.getSelection().toString() !== "") return;
      if (block.classList.contains("is-filtered-out")) return;
      block.classList.toggle("is-expanded");
    });
    
    block.addEventListener("keydown", function(e) {
      if (e.key === "Enter" || e.key === " ") {
        if (document.activeElement && document.activeElement.tagName === "A") return;
        if (block.classList.contains("is-filtered-out")) return;
        e.preventDefault();
        block.classList.toggle("is-expanded");
      }
    });
  });

  // Work Experience Filtering Logic
  var filterPills = document.querySelectorAll(".filter-pill");
  var experienceBlocks = document.querySelectorAll("#resume .timeline-block[data-category]");

  function updateFilters() {
    var activePill = document.querySelector(".filter-pill.active");
    var activeFilter = activePill ? activePill.getAttribute("data-filter") : "";

    experienceBlocks.forEach(function(block) {
      var category = block.getAttribute("data-category");
      var matches = false;
      if (activeFilter === "dev") {
        matches = (category === "dev" || category === "ai-dev");
      } else {
        matches = (category === activeFilter);
      }

      if (matches) {
        block.classList.remove("is-filtered-out");
      } else {
        block.classList.add("is-filtered-out");
      }
    });
  }

  filterPills.forEach(function(pill) {
    pill.addEventListener("click", function() {
      if (pill.classList.contains("active")) return;

      filterPills.forEach(function(p) {
        p.classList.remove("active");
        p.setAttribute("aria-pressed", "false");
      });

      pill.classList.add("active");
      pill.setAttribute("aria-pressed", "true");

      updateFilters();
    });
  });

  updateFilters();

  // Initialize Typewrite effects
  var elements = document.getElementsByClassName('typewrite');
  for (var i = 0; i < elements.length; i++) {
    var toRotate = elements[i].getAttribute('data-type');
    var period = elements[i].getAttribute('data-period');
    if (toRotate) {
      new TxtType(elements[i], JSON.parse(toRotate), period);
    }
  }

  // Inject typewriter cursor CSS
  var css = document.createElement("style");
  css.type = "text/css";
  css.innerHTML = ".typewrite > .wrap { border-right: 0.08em solid #fff}";
  document.body.appendChild(css);
});
