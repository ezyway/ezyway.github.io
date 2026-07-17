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

  // 5. Render Skills (2D Orbit)
  const skillsSphere = document.getElementById("skills-sphere-wrap");
  if (skillsSphere && resumeData.skills) {
    let skillsHtml = "";
    resumeData.skills.forEach((skill) => {
      let iconHtml = "";
      if (skill.icon) {
        if (skill.icon.startsWith("fa-") || skill.icon.startsWith("fa ")) {
          iconHtml = `<i class="fa ${skill.icon}"></i>`;
        } else {
          iconHtml = `<img src="${skill.icon}" alt="${skill.name} icon">`;
        }
      } else {
        iconHtml = `<i class="fa fa-code"></i>`;
      }
      skillsHtml += `
        <div class="skill-card">
          <div class="skill-icon-wrap">${iconHtml}</div>
          <h4>${skill.name}</h4>
        </div>
      `;
    });
    skillsSphere.innerHTML = skillsHtml;

    // 2D floating animation with collision avoidance
    const container = skillsSphere;
    const cards = container.querySelectorAll(".skill-card");
    const count = cards.length;
    if (count === 0) return;

    const items = [];
    const padding = 10;

    function rand(min, max) { return Math.random() * (max - min) + min; }

    cards.forEach((card) => {
      const maxX = Math.max(container.clientWidth - card.offsetWidth - padding, 50);
      const maxY = Math.max(container.clientHeight - card.offsetHeight - padding, 50);
      card.style.left = rand(padding, maxX) + "px";
      card.style.top = rand(padding, maxY) + "px";
      items.push({
        el: card,
        x: parseFloat(card.style.left),
        y: parseFloat(card.style.top),
        vx: rand(-0.4, 0.4),
        vy: rand(-0.4, 0.4)
      });
    });

    function update() {
      const cw = container.clientWidth;
      const ch = container.clientHeight;

      for (let i = 0; i < items.length; i++) {
        const a = items[i];
        const aw = a.el.offsetWidth;
        const ah = a.el.offsetHeight;

        // Move
        a.x += a.vx;
        a.y += a.vy;

        // Wall bounce
        if (a.x < padding) { a.x = padding; a.vx *= -1; }
        if (a.y < padding) { a.y = padding; a.vy *= -1; }
        if (a.x + aw > cw - padding) { a.x = cw - padding - aw; a.vx *= -1; }
        if (a.y + ah > ch - padding) { a.y = ch - padding - ah; a.vy *= -1; }

        // Slow random direction changes
        if (Math.random() < 0.005) { a.vx += rand(-0.15, 0.15); }
        if (Math.random() < 0.005) { a.vy += rand(-0.15, 0.15); }

        // Clamp speed
        const spd = Math.sqrt(a.vx * a.vx + a.vy * a.vy);
        if (spd > 1) { a.vx = (a.vx / spd) * 1; a.vy = (a.vy / spd) * 1; }
        if (spd < 0.15 && Math.random() < 0.01) { a.vx += rand(-0.1, 0.1); a.vy += rand(-0.1, 0.1); }
      }

      // Collision avoidance — gentle separation
      for (let i = 0; i < items.length; i++) {
        for (let j = i + 1; j < items.length; j++) {
          const a = items[i], b = items[j];
          const aw = a.el.offsetWidth, ah = a.el.offsetHeight;
          const bw = b.el.offsetWidth, bh = b.el.offsetHeight;

          if (a.x < b.x + bw && a.x + aw > b.x && a.y < b.y + bh && a.y + ah > b.y) {
            const cx1 = a.x + aw / 2, cy1 = a.y + ah / 2;
            const cx2 = b.x + bw / 2, cy2 = b.y + bh / 2;
            const dx = cx2 - cx1 || 0.01;
            const dy = cy2 - cy1 || 0.01;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const nx = dx / dist, ny = dy / dist;
            const force = 0.08;
            a.vx -= nx * force; a.vy -= ny * force;
            b.vx += nx * force; b.vy += ny * force;
          }
        }
      }

      // Apply positions
      items.forEach((item) => {
        item.el.style.left = item.x + "px";
        item.el.style.top = item.y + "px";
      });

      requestAnimationFrame(update);
    }

    update();

    window.addEventListener("resize", () => {
      // Re-clamp positions after resize
      const cw = container.clientWidth;
      const ch = container.clientHeight;
      items.forEach((item) => {
        const w = item.el.offsetWidth;
        const h = item.el.offsetHeight;
        item.x = Math.max(padding, Math.min(item.x, cw - w - padding));
        item.y = Math.max(padding, Math.min(item.y, ch - h - padding));
      });
    });
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
