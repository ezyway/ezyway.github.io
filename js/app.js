function formatDate(str) {
  if (!str) return "";
  if (str.toLowerCase() === "present") return "Present";
  const [year, month] = str.split("-");
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  return `${monthNames[parseInt(month, 10) - 1]} ${year}`;
}

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
  var delta = 150 - Math.random() * 80;

  if (this.isDeleting) { delta /= 2; }

  if (!this.isDeleting && this.txt === fullTxt) {
    delta = this.period;
    this.isDeleting = true;
  } else if (this.isDeleting && this.txt === '') {
    this.isDeleting = false;
    this.loopNum++;
    delta = 500;
  }

  this._timer = setTimeout(function() {
    that.tick();
  }, delta);
};

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
    parts.push(years === 1 ? "1 yr" : years + " yrs");
  }
  if (months > 0) {
    parts.push(months === 1 ? "1 mo" : months + " mos");
  }
  
  return parts.join(" ");
}

/* Theme Management */
function initTheme() {
  var savedTheme = localStorage.getItem("portfolio-theme");
  var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  var theme = savedTheme || (prefersDark ? "dark" : "light");

  document.documentElement.setAttribute("data-theme", theme);
  updateThemeIcon(theme);

  var themeToggleBtn = document.getElementById("theme-toggle");
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", function() {
      var currentTheme = document.documentElement.getAttribute("data-theme") || "dark";
      var newTheme = currentTheme === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", newTheme);
      localStorage.setItem("portfolio-theme", newTheme);
      updateThemeIcon(newTheme);
    });
  }

  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function(e) {
    if (!localStorage.getItem("portfolio-theme")) {
      var newTheme = e.matches ? "dark" : "light";
      document.documentElement.setAttribute("data-theme", newTheme);
      updateThemeIcon(newTheme);
    }
  });
}

function updateThemeIcon(theme) {
  var themeToggleBtn = document.getElementById("theme-toggle");
  if (!themeToggleBtn) return;
  if (theme === "light") {
    themeToggleBtn.innerHTML = '<i class="fa fa-moon-o" aria-hidden="true"></i>';
    themeToggleBtn.setAttribute("aria-label", "Switch to Dark Mode");
  } else {
    themeToggleBtn.innerHTML = '<i class="fa fa-sun-o" aria-hidden="true"></i>';
    themeToggleBtn.setAttribute("aria-label", "Switch to Light Mode");
  }
}

document.addEventListener("DOMContentLoaded", function() {
  initTheme();

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Render Experience Timeline */
  const expTimeline = document.getElementById("experience-timeline-wrap");
  if (expTimeline && resumeData.experiences) {
    let expHtml = "";
    resumeData.experiences.forEach((exp, index) => {
      const dateText = (exp.start === exp.end) ? formatDate(exp.start) : `${formatDate(exp.start)} – ${formatDate(exp.end)}`;
      const durationText = calculateDuration(exp.start, exp.end);
      const isExpandedClass = index === 0 ? "is-expanded" : "";
      const logoContent = exp.logo 
        ? `<img src="${exp.logo}" alt="${exp.company} logo" loading="lazy">`
        : `<i class="fa fa-briefcase"></i>`;
        
      expHtml += `
        <div class="timeline-block ${isExpandedClass}" tabindex="0" role="button" aria-expanded="${index === 0}" data-start="${exp.start}" data-end="${exp.end}" data-category="${exp.category}">
          <div class="timeline-header-row">
            <div class="timeline-left">
              <div class="timeline-logo-badge">${logoContent}</div>
              <div class="timeline-titles">
                <h3>${exp.role}</h3>
                <p class="timeline-company">${exp.company} · ${exp.location}</p>
              </div>
            </div>
            <div class="timeline-meta">
              <div>
                <span class="timeline-date-badge">${dateText}</span>
                ${durationText ? `<span class="timeline-duration-text">${durationText}</span>` : ""}
              </div>
              <span class="timeline-expand-icon"><i class="fa fa-chevron-down"></i></span>
            </div>
          </div>
          <div class="timeline-details">
            <p>${exp.details}</p>
          </div>
        </div>
      `;
    });
    expTimeline.innerHTML = expHtml;
  }

  /* Render Education Timeline */
  const eduTimeline = document.getElementById("education-timeline-wrap");
  if (eduTimeline && resumeData.education) {
    let eduHtml = "";
    resumeData.education.forEach((edu) => {
      const dateText = (edu.start === edu.end) ? formatDate(edu.start) : `${formatDate(edu.start)} – ${formatDate(edu.end)}`;
      const durationText = calculateDuration(edu.start, edu.end);
      const logoContent = edu.logo 
        ? `<img src="${edu.logo}" alt="${edu.institution} logo" loading="lazy">`
        : `<i class="fa fa-graduation-cap"></i>`;

      eduHtml += `
        <div class="timeline-block" tabindex="0" role="button" aria-expanded="false" data-start="${edu.start}" data-end="${edu.end}">
          <div class="timeline-header-row">
            <div class="timeline-left">
              <div class="timeline-logo-badge">${logoContent}</div>
              <div class="timeline-titles">
                <h3>${edu.degree}</h3>
                <p class="timeline-company">${edu.institution} · ${edu.location}</p>
              </div>
            </div>
            <div class="timeline-meta">
              <div>
                <span class="timeline-date-badge">${dateText}</span>
                ${durationText ? `<span class="timeline-duration-text">${durationText}</span>` : ""}
              </div>
              <span class="timeline-expand-icon"><i class="fa fa-chevron-down"></i></span>
            </div>
          </div>
          <div class="timeline-details">
            <p>${edu.details}</p>
          </div>
        </div>
      `;
    });
    eduTimeline.innerHTML = eduHtml;
  }

  /* Render Projects Grid */
  const projectsGrid = document.getElementById("projects-grid-wrap");
  if (projectsGrid && resumeData.projects) {
    let projHtml = "";
    resumeData.projects.forEach((proj, index) => {
      const tagsHtml = proj.tags.map(tag => `<span>${tag}</span>`).join("");
      const isFeatured = index === 0;
      projHtml += `
        <div class="project-card" data-tilt>
          <div>
            <div class="project-top">
              <div class="project-icon-disc"><i class="fa ${proj.icon}"></i></div>
              ${isFeatured ? `<span class="project-featured-badge">Featured</span>` : ""}
            </div>
            <h3>${proj.title}</h3>
            <p>${proj.description}</p>
            ${proj.impact ? `<div class="project-impact"><i class="fa fa-bolt"></i> ${proj.impact}</div>` : ""}
          </div>
          <div>
            <div class="project-tags">
              ${tagsHtml}
            </div>
            <div class="project-card-footer">
              <a href="${proj.github}" target="_blank" rel="noopener noreferrer" class="project-link-pill">
                <i class="fa fa-github"></i> View on GitHub
              </a>
            </div>
          </div>
        </div>
      `;
    });
    projectsGrid.innerHTML = projHtml;
  }

  /* Render Skills Grid */
  const skillsWrap = document.getElementById("skills-sphere-wrap");
  if (skillsWrap && resumeData.skills) {
    let skillsHtml = "";
    resumeData.skills.forEach((group) => {
      let itemsHtml = "";
      group.items.forEach((skill) => {
        let iconHtml = "";
        if (skill.icon) {
          if (skill.icon.startsWith("fa-") || skill.icon.startsWith("fa ")) {
            iconHtml = `<i class="fa ${skill.icon}"></i>`;
          } else {
            iconHtml = `<img src="${skill.icon}" alt="${skill.name} icon" loading="lazy">`;
          }
        } else {
          iconHtml = `<i class="fa fa-code"></i>`;
        }
        itemsHtml += `
          <div class="skill-chip">
            <span class="skill-chip-icon">${iconHtml}</span>
            <span class="skill-chip-name">${skill.name}</span>
          </div>
        `;
      });
      skillsHtml += `
        <div class="skill-group">
          <h3 class="skill-group-title">${group.group}</h3>
          <div class="skill-group-chips">${itemsHtml}</div>
        </div>
      `;
    });
    skillsWrap.innerHTML = skillsHtml;
  }

  /* Timeline Accordion Interaction */
  const timelineBlocks = document.querySelectorAll("#resume .timeline-block");
  timelineBlocks.forEach(function(block) {
    function toggleBlock() {
      if (block.classList.contains("is-filtered-out")) return;
      var expanded = block.classList.toggle("is-expanded");
      block.setAttribute("aria-expanded", String(expanded));
    }

    block.addEventListener("click", function(e) {
      if (e.target.closest("a")) return;
      if (window.getSelection().toString() !== "") return;
      toggleBlock();
    });
    
    block.addEventListener("keydown", function(e) {
      if (e.key === "Enter" || e.key === " ") {
        if (document.activeElement && document.activeElement.tagName === "A") return;
        e.preventDefault();
        toggleBlock();
      }
    });
  });

  /* Filter Pills for Experience */
  var filterPills = document.querySelectorAll(".filter-pill");
  var experienceBlocks = document.querySelectorAll("#resume #experience-timeline-wrap .timeline-block[data-category]");

  function updateFilters() {
    var activePill = document.querySelector(".filter-pill.active");
    var activeFilter = activePill ? activePill.getAttribute("data-filter") : "dev";

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

  /* Update Count Badges */
  var pillCounts = document.querySelectorAll(".pill-count");
  pillCounts.forEach(function(el) {
    var filter = el.getAttribute("data-count");
    var count = 0;
    experienceBlocks.forEach(function(block) {
      var category = block.getAttribute("data-category");
      if (filter === "dev") {
        if (category === "dev" || category === "ai-dev") count++;
      } else if (category === filter) {
        count++;
      }
    });
    el.textContent = count;
  });

  /* Typewriter Init */
  var elements = document.getElementsByClassName('typewrite');
  for (var i = 0; i < elements.length; i++) {
    var toRotate = elements[i].getAttribute('data-type');
    var period = elements[i].getAttribute('data-period');
    if (toRotate) {
      var phrases = JSON.parse(toRotate);
      if (prefersReducedMotion) {
        elements[i].innerHTML = '<span class="wrap">' + phrases[0] + '</span>';
      } else {
        new TxtType(elements[i], phrases, period);
      }
    }
  }

  /* Animated Stat Counters */
  var statValues = document.querySelectorAll(".stat-number[data-count]");
  if (statValues.length) {
    function animateCounter(el) {
      var target = parseInt(el.getAttribute("data-count"), 10);
      var suffix = el.getAttribute("data-suffix") || "";
      if (prefersReducedMotion) {
        el.textContent = target + suffix;
        return;
      }
      var duration = 1400;
      var startTime = null;
      function step(timestamp) {
        if (!startTime) startTime = timestamp;
        var progress = Math.min((timestamp - startTime) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(eased * target) + suffix;
        if (progress < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }

    var statsObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          statsObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });

    statValues.forEach(function(el) { statsObserver.observe(el); });
  }

  /* Copy Email Button with Apple Tooltip feedback */
  var copyBtn = document.querySelector(".copy-email-pill");
  if (copyBtn) {
    copyBtn.addEventListener("click", function() {
      var email = copyBtn.getAttribute("data-email");
      var label = copyBtn.querySelector(".copy-email-label");
      function onSuccess() {
        if (label) label.textContent = "Copied!";
        copyBtn.classList.add("is-copied");
        setTimeout(function() {
          if (label) label.textContent = "Copy Email";
          copyBtn.classList.remove("is-copied");
        }, 2000);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(onSuccess);
      } else {
        var ta = document.createElement("textarea");
        ta.value = email;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        onSuccess();
      }
    });
  }

  /* Reveal Animations on Scroll */
  if (!prefersReducedMotion) {
    var revealObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-revealed");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -40px 0px" });

    document.querySelectorAll(".apple-card, .bento-card, .capability-card, .skill-group, .project-card, .cta-banner-inner").forEach(function(el) {
      el.classList.add("reveal");
      revealObserver.observe(el);
    });

    /* Tilt Effect for Projects */
    if (window.matchMedia("(hover: hover)").matches) {
      document.querySelectorAll("[data-tilt]").forEach(function(card) {
        card.addEventListener("mousemove", function(e) {
          var rect = card.getBoundingClientRect();
          var x = (e.clientX - rect.left) / rect.width - 0.5;
          var y = (e.clientY - rect.top) / rect.height - 0.5;
          card.style.transform = "perspective(900px) rotateY(" + (x * 5) + "deg) rotateX(" + (-y * 5) + "deg) translateY(-6px)";
        });
        card.addEventListener("mouseleave", function() {
          card.style.transform = "";
        });
      });
    }
  }
});
