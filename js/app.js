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

/* Animated Dual Linux Console: Terminal CLI Window + Live Logs Window */
function initHeroTerminal() {
  var cmdEl = document.getElementById("terminal-command-text");
  var badgesListEl = document.getElementById("terminal-badges-list");
  var logsBody = document.getElementById("hero-logs-body");
  if (!cmdEl || !badgesListEl) return;

  var prompts = [
    {
      cmd: "sbatch --partition=gpu-a100 --nodes=4 slurm_genomics_ai.sh",
      tag: "SLURM:849204",
      tagType: "green",
      output: "Allocated 4x NVIDIA A100 GPUs · Multi-agent genomic pipeline initialized"
    },
    {
      cmd: "python vep_agent.py --ensembl-api --gwas-loci chr12:25368462",
      tag: "GENOMICS-VEP",
      tagType: "purple",
      output: "Ensembl API connected · Variant impact scored · Gene relationships mapped"
    },
    {
      cmd: "srun python run_hca_transcriptomics.py --tissue skin_hca",
      tag: "TRANSCRIPTOMICS",
      tagType: "cyan",
      output: "Skin tissue HCA assays processed · Chemical dose-response classified"
    },
    {
      cmd: "python orchestrate_agents.py --coordinator ADK --routing dynamic",
      tag: "AGENTIC AI",
      tagType: "green",
      output: "Google ADK Coordinator active · Specialized scientific agents routed dynamically"
    },
    {
      cmd: "squeue -u sreyas --format='%.10i %.9P %.18j %.8T %.10M'",
      tag: "HPC/SLURM",
      tagType: "blue",
      output: "849204 gpu-a100 genomic_ai RUNNING 04:12:35 · AWS ECS backend synced"
    }
  ];

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) {
    var initialHtml = "";
    for (var k = 0; k < prompts.length; k++) {
      var pItem = prompts[k];
      initialHtml += '<div class="terminal-badge-item">' +
        '<span class="terminal-output-tag tag-' + pItem.tagType + '">' + pItem.tag + '</span> ' + pItem.output +
      '</div>';
    }
    badgesListEl.innerHTML = initialHtml;
    cmdEl.textContent = "";
    return;
  }

  var currentIndex = 0;
  var charIndex = 0;
  var isDeleting = false;
  var timeoutId = null;

  function scrollToLogsBottom() {
    if (logsBody) {
      logsBody.scrollTop = logsBody.scrollHeight;
    }
  }

  function typeStep() {
    var item = prompts[currentIndex];
    var fullCmd = item.cmd;

    if (!isDeleting) {
      charIndex++;
      cmdEl.textContent = fullCmd.substring(0, charIndex);

      if (charIndex < fullCmd.length) {
        var typingSpeed = 28 + Math.random() * 20;
        timeoutId = setTimeout(typeStep, typingSpeed);
      } else {
        // Command typed completely! Stream badge into Live Logs window
        timeoutId = setTimeout(function() {
          var badgeEl = document.createElement("div");
          badgeEl.className = "terminal-badge-item";
          badgeEl.innerHTML = '<span class="terminal-output-tag tag-' + item.tagType + '">' + item.tag + '</span> ' + item.output;
          badgesListEl.appendChild(badgeEl);

          if (badgesListEl.children.length > 20) {
            badgesListEl.removeChild(badgesListEl.firstElementChild);
          }

          scrollToLogsBottom();

          // Wait brief reading pause, then command disappears (clears from CLI)
          timeoutId = setTimeout(function() {
            isDeleting = true;
            typeStep();
          }, 1100);
        }, 250);
      }
    } else {
      // Deleting command so it disappears from the CLI prompt line
      charIndex--;
      cmdEl.textContent = fullCmd.substring(0, charIndex);

      if (charIndex === 0) {
        isDeleting = false;
        currentIndex = (currentIndex + 1) % prompts.length;
        timeoutId = setTimeout(typeStep, 350);
        return;
      }
      var deletingSpeed = 12;
      timeoutId = setTimeout(typeStep, deletingSpeed);
    }
  }

  typeStep();

  // Interactive Command Chips for direct execution
  var triggerChips = document.querySelectorAll(".terminal-cmd-chip");
  triggerChips.forEach(function(chip) {
    chip.addEventListener("click", function(e) {
      e.preventDefault();
      var cmdToRun = chip.getAttribute("data-cmd");
      if (!cmdToRun) return;

      clearTimeout(timeoutId);
      cmdEl.textContent = cmdToRun;

      var responseMap = {
        "sbatch --status": {
          tag: "SLURM:ONLINE",
          tagType: "green",
          output: "4 Nodes · 16x A100 GPUs Active · Cluster Health: Optimal · Queue: 0 pending"
        },
        "cat stack.txt": {
          tag: "TECH-STACK",
          tagType: "purple",
          output: "Python 3.12, FastAPI, Google ADK, PyTorch, Docker, AWS ECS, SLURM, Redis"
        },
        "python agent.py": {
          tag: "AGENT:ACTIVE",
          tagType: "cyan",
          output: "ADK Coordinator initialized · 4 Domain Agents ready for inference"
        },
        "clear": {
          tag: "SYSTEM",
          tagType: "blue",
          output: "Console buffer cleared"
        }
      };

      var res = responseMap[cmdToRun] || {
        tag: "EXEC",
        tagType: "green",
        output: "Command executed successfully"
      };

      if (cmdToRun === "clear") {
        badgesListEl.innerHTML = "";
      }

      var badgeEl = document.createElement("div");
      badgeEl.className = "terminal-badge-item is-user-triggered";
      badgeEl.innerHTML = '<span class="terminal-output-tag tag-' + res.tagType + '">' + res.tag + '</span> ' + res.output;
      badgesListEl.appendChild(badgeEl);
      scrollToLogsBottom();

      // Resume auto-typing loop after 3.5 seconds
      timeoutId = setTimeout(function() {
        isDeleting = true;
        charIndex = cmdToRun.length;
        typeStep();
      }, 3500);
    });
  });
}

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

      const tagHtml = exp.tag 
        ? `<span class="timeline-role-tag tag-${exp.tagType || 'default'}">${exp.tag}</span>` 
        : "";

      const summaryHtml = exp.summary 
        ? `<p class="timeline-summary">${exp.summary}</p>` 
        : (exp.details ? `<p class="timeline-summary">${exp.details}</p>` : "");

      let highlightsHtml = "";
      if (exp.highlights && exp.highlights.length > 0) {
        highlightsHtml = `
          <div class="timeline-highlights-box">
            <h4 class="timeline-highlights-heading"><i class="fa fa-check-circle-o" aria-hidden="true"></i> Key Achievements &amp; Scope</h4>
            <ul class="timeline-highlights-list">
              ${exp.highlights.map(h => `<li><span class="bullet-dot"></span><span>${h}</span></li>`).join("")}
            </ul>
          </div>
        `;
      }

      let skillsHtml = "";
      if (exp.skills && exp.skills.length > 0) {
        skillsHtml = `
          <div class="timeline-skills-box">
            <span class="timeline-skills-title"><i class="fa fa-code" aria-hidden="true"></i> Tech Stack:</span>
            <div class="timeline-skills-list">
              ${exp.skills.map(s => `<span class="exp-skill-tag">${s}</span>`).join("")}
            </div>
          </div>
        `;
      }

      expHtml += `
        <div class="timeline-block ${isExpandedClass}" tabindex="0" role="button" aria-expanded="${index === 0}" data-start="${exp.start}" data-end="${exp.end}" data-category="${exp.category}">
          <div class="timeline-header-row">
            <div class="timeline-left">
              <div class="timeline-logo-badge">${logoContent}</div>
              <div class="timeline-titles">
                <div class="timeline-role-row">
                  <h3>${exp.role}</h3>
                  ${tagHtml}
                </div>
                <p class="timeline-company">${exp.company} · <span class="timeline-location">${exp.location}</span></p>
              </div>
            </div>
            <div class="timeline-meta">
              <div class="timeline-date-group">
                <span class="timeline-date-badge">${dateText}</span>
                ${durationText ? `<span class="timeline-duration-text">${durationText}</span>` : ""}
              </div>
              <span class="timeline-expand-icon"><i class="fa fa-chevron-down"></i></span>
            </div>
          </div>
          <div class="timeline-details">
            ${summaryHtml}
            ${highlightsHtml}
            ${skillsHtml}
          </div>
        </div>
      `;
    });
    expTimeline.innerHTML = expHtml;
  }

  /* Render Education Cards Grid (Single Row on Desktop) */
  const eduGrid = document.getElementById("education-grid-wrap");
  if (eduGrid && resumeData.education) {
    let eduHtml = "";
    resumeData.education.forEach((edu) => {
      const tagsHtml = edu.tags ? edu.tags.map(t => `<span class="edu-tag-chip">${t}</span>`).join("") : "";
      const logoContent = edu.logo 
        ? `<img src="${edu.logo}" alt="${edu.institution} logo" loading="lazy">`
        : `<i class="fa fa-graduation-cap"></i>`;

      eduHtml += `
        <div class="education-card apple-card">
          <div class="edu-card-header">
            <div class="edu-logo-badge">${logoContent}</div>
            <span class="edu-badge badge-${edu.badgeType || 'blue'}">${edu.badge}</span>
          </div>
          <div class="edu-card-body">
            <h3 class="edu-degree">${edu.degree}</h3>
            <p class="edu-institution">${edu.institution}</p>
            <div class="edu-meta-pills">
              <span class="edu-meta-pill"><i class="fa fa-calendar-o"></i> ${edu.year}</span>
              <span class="edu-meta-pill"><i class="fa fa-map-marker"></i> ${edu.location}</span>
              ${edu.grade ? `<span class="edu-grade-pill"><i class="fa fa-trophy"></i> ${edu.grade}</span>` : ""}
            </div>
            <p class="edu-description">${edu.description}</p>
          </div>
          <div class="edu-card-footer">
            <div class="edu-tags-wrapper">
              ${tagsHtml}
            </div>
          </div>
        </div>
      `;
    });
    eduGrid.innerHTML = eduHtml;
  }

  /* Render Projects Grid with Category Filtering */
  const projectsGrid = document.getElementById("projects-grid-wrap");
  const projectFilterPills = document.querySelectorAll("[data-project-filter]");

  function renderProjects(filterCategory = "all") {
    if (!projectsGrid || !resumeData.projects) return;

    const filteredProjects = resumeData.projects.filter(proj => {
      if (filterCategory === "all") return true;
      return proj.category === filterCategory;
    });

    let projHtml = "";
    filteredProjects.forEach((proj) => {
      const tagsHtml = proj.tags.map(tag => `<span>${tag}</span>`).join("");
      let linksHtml = "";
      if (proj.live) {
        linksHtml += `
          <a href="${proj.live}" target="_blank" rel="noopener noreferrer" class="project-link-pill primary">
            <i class="fa fa-external-link"></i> ${proj.liveLabel || "Live Demo"}
          </a>
        `;
      }
      if (proj.github) {
        linksHtml += `
          <a href="${proj.github}" target="_blank" rel="noopener noreferrer" class="project-link-pill">
            <i class="fa fa-github"></i> GitHub
          </a>
        `;
      }
      if (proj.extraLink) {
        linksHtml += `
          <a href="${proj.extraLink}" target="_blank" rel="noopener noreferrer" class="project-link-pill">
            <i class="fa ${proj.extraIcon || 'fa-external-link'}"></i> ${proj.extraLabel || "Link"}
          </a>
        `;
      }

      let previewCoverHtml = "";
      if (proj.live) {
        const previewUrl = proj.preview || `https://api.microlink.io/?url=${encodeURIComponent(proj.live)}&screenshot=true&meta=false&embed=screenshot.url`;
        previewCoverHtml = `
          <div class="project-preview-cover">
            <img src="${previewUrl}" 
                 alt="${proj.title} live screenshot" 
                 loading="lazy" 
                 class="project-preview-img"
                 onerror="this.closest('.project-preview-cover').style.display='none';">
            <div class="project-preview-overlay">
              <a href="${proj.live}" target="_blank" rel="noopener noreferrer" class="project-preview-link" title="Visit ${proj.title}">
                <i class="fa fa-external-link"></i> Live Preview
              </a>
            </div>
          </div>
        `;
      }

      const badgeHtml = proj.badge ? `<span class="project-stat-badge tag-${proj.badgeType || 'blue'}">${proj.badge}</span>` : "";

      projHtml += `
        <div class="project-card" data-tilt data-category="${proj.category || 'all'}">
          <div>
            ${previewCoverHtml}
            <div class="project-header-row">
              <div class="project-title-group">
                <div class="project-icon-disc"><i class="fa ${proj.icon}"></i></div>
                <h3 class="project-title">${proj.title}</h3>
              </div>
              ${badgeHtml}
            </div>
            <p class="project-desc">${proj.description}</p>
            ${proj.impact ? `<div class="project-impact"><i class="fa fa-bolt"></i> ${proj.impact}</div>` : ""}
          </div>
          <div>
            <div class="project-tags">
              ${tagsHtml}
            </div>
            <div class="project-card-footer">
              ${linksHtml}
            </div>
          </div>
        </div>
      `;
    });
    projectsGrid.innerHTML = projHtml;
  }

  // Bind project category filter pills
  projectFilterPills.forEach(pill => {
    pill.addEventListener("click", () => {
      projectFilterPills.forEach(p => {
        p.classList.remove("active");
        p.setAttribute("aria-pressed", "false");
      });
      pill.classList.add("active");
      pill.setAttribute("aria-pressed", "true");
      const filter = pill.getAttribute("data-project-filter");
      renderProjects(filter);
    });
  });

  renderProjects("all");

  /* Render Rich Interactive Tech Stack Bento Matrix */
  const skillsWrap = document.getElementById("skills-sphere-wrap");
  if (skillsWrap && resumeData.skills) {
    let skillsHtml = "";
    let totalSkillsCount = 0;

    resumeData.skills.forEach((group, gIdx) => {
      let itemsHtml = "";
      totalSkillsCount += group.items.length;

      group.items.forEach((skill, sIdx) => {
        let iconContent = "";
        if (skill.icon) {
          if (skill.icon.startsWith("fa-") || skill.icon.startsWith("fa ")) {
            iconContent = `<i class="fa ${skill.icon}"></i>`;
          } else {
            iconContent = `<img src="${skill.icon}" alt="${skill.name} icon" loading="lazy">`;
          }
        } else {
          iconContent = `<i class="fa fa-code"></i>`;
        }

        const isDefaultSelected = gIdx === 0 && sIdx === 0;
        const tagsJson = JSON.stringify(skill.tags || []).replace(/"/g, "&quot;");

        itemsHtml += `
          <div class="tech-interactive-chip"
               role="button"
               tabindex="0"
               data-name="${skill.name}"
               data-group="${group.group}"
               data-category="${group.category}"
               data-level="${skill.level || 'Production Ready'}"
               data-app="${skill.app || 'Engineering System'}"
               data-desc="${skill.desc || ''}"
               data-tags="${tagsJson}"
               data-icon="${skill.icon}">
            <div class="tech-chip-icon-disc">${iconContent}</div>
            <div class="tech-chip-info">
              <span class="tech-chip-title">${skill.name}</span>
              <span class="tech-chip-level-dot ${skill.level === 'Production Core' ? 'core' : (skill.level === 'Advanced' ? 'adv' : 'ready')}" title="${skill.level}"></span>
            </div>
          </div>
        `;
      });

      const isFirst = gIdx === 0;
      skillsHtml += `
        <div class="tech-domain-card apple-bento-card ${isFirst ? 'is-expanded' : 'is-collapsed'}" 
             data-domain-category="${group.category}"
             aria-expanded="${isFirst}">
          <div class="tech-domain-header" role="button" tabindex="0" aria-label="Toggle ${group.group} category">
            <div class="tech-domain-top-row">
              <div class="tech-domain-left">
                <div class="tech-domain-icon-disc">
                  <i class="fa ${group.icon}"></i>
                </div>
                <h3 class="tech-domain-name">${group.group}</h3>
              </div>
              <div class="tech-domain-header-actions">
                <span class="tech-domain-count-badge">${group.items.length} Tools</span>
                <span class="domain-accordion-chevron" aria-hidden="true"><i class="fa fa-chevron-down"></i></span>
              </div>
            </div>
            <p class="tech-domain-desc">${group.description}</p>
          </div>
          <div class="tech-chips-grid">
            ${itemsHtml}
          </div>
        </div>
      `;
    });

    skillsWrap.innerHTML = skillsHtml;

    // Initialize the Live Tech Inspector HUD & Domain Accordion
    initTechStackControls();
  }

  function initTechStackControls() {
    const hud = document.getElementById("tech-inspector-hud");
    const hudIcon = document.getElementById("hud-icon-box");
    const hudDomain = document.getElementById("hud-domain");
    const hudStatus = document.getElementById("hud-status");
    const hudName = document.getElementById("hud-name");
    const hudDesc = document.getElementById("hud-desc");
    const hudTags = document.getElementById("hud-tags");
    const hudApp = document.getElementById("hud-app");
    const allChips = document.querySelectorAll(".tech-interactive-chip");
    const domainCards = document.querySelectorAll(".tech-domain-card");

    function updateHud(chip) {
      if (!chip || !hud) return;
      const name = chip.getAttribute("data-name");
      const group = chip.getAttribute("data-group");
      const level = chip.getAttribute("data-level");
      const app = chip.getAttribute("data-app");
      const desc = chip.getAttribute("data-desc");
      const rawTags = chip.getAttribute("data-tags");
      const icon = chip.getAttribute("data-icon");

      let tags = [];
      try {
        tags = JSON.parse(rawTags);
      } catch (e) {
        tags = [];
      }

      // Remove placeholder styling once user interacts
      hud.classList.remove("is-placeholder");

      if (hudName) hudName.textContent = name;
      if (hudDomain) hudDomain.textContent = group;
      if (hudStatus) {
        hudStatus.innerHTML = `<span class="pulse-dot"></span> ${level}`;
      }
      if (hudDesc) hudDesc.textContent = desc;
      if (hudApp) hudApp.textContent = app;

      if (hudTags) {
        hudTags.innerHTML = tags.map(t => `<span class="hud-tag">${t}</span>`).join("");
      }

      if (hudIcon) {
        if (icon) {
          if (icon.startsWith("fa-") || icon.startsWith("fa ")) {
            hudIcon.innerHTML = `<i class="fa ${icon}"></i>`;
          } else {
            hudIcon.innerHTML = `<img src="${icon}" alt="${name}" loading="lazy">`;
          }
        } else {
          hudIcon.innerHTML = `<i class="fa fa-code"></i>`;
        }
      }

      allChips.forEach(c => c.classList.remove("is-selected"));
      chip.classList.add("is-selected");

      // Micro-animation trigger
      hud.classList.remove("hud-pulse");
      void hud.offsetWidth; // trigger reflow
      hud.classList.add("hud-pulse");
    }

    // Attach click and hover listeners to all chips
    allChips.forEach(chip => {
      chip.addEventListener("click", () => updateHud(chip));
      chip.addEventListener("mouseenter", () => updateHud(chip));
      chip.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          updateHud(chip);
        }
      });
    });

    // Domain Card Accordion for Mobile (< 900px)
    domainCards.forEach(card => {
      const header = card.querySelector(".tech-domain-header");
      if (!header) return;

      function toggleDomain() {
        if (window.innerWidth <= 900) {
          const wasExpanded = card.classList.contains("is-expanded");
          
          domainCards.forEach(c => {
            c.classList.remove("is-expanded");
            c.classList.add("is-collapsed");
            c.setAttribute("aria-expanded", "false");
          });

          if (!wasExpanded) {
            card.classList.add("is-expanded");
            card.classList.remove("is-collapsed");
            card.setAttribute("aria-expanded", "true");
          }
        }
      }

      header.addEventListener("click", (e) => {
        if (e.target.closest(".tech-interactive-chip")) return;
        toggleDomain();
      });

      header.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toggleDomain();
        }
      });
    });
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

  /* Update Experience Count Badges */
  var expPillCounts = document.querySelectorAll("#resume .pill-count");
  expPillCounts.forEach(function(el) {
    var filter = el.getAttribute("data-count");
    if (!filter) return;
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

  /* Update Project Count Badges */
  var projPillCounts = document.querySelectorAll("#projects .pill-count");
  projPillCounts.forEach(function(el) {
    var filter = el.getAttribute("data-project-count");
    if (!filter || !resumeData.projects) return;
    if (filter === "all") {
      el.textContent = resumeData.projects.length;
    } else {
      el.textContent = resumeData.projects.filter(p => p.category === filter).length;
    }
  });

  /* Hero Terminal Animated Prompts */
  initHeroTerminal();

  /* Interactive Architecture Pipeline Explorer */
  const archStepsContainer = document.getElementById("architecture-steps-container");
  const archDetailPanel = document.getElementById("workflow-detail-panel");

  function renderArchitectureDetail(stepId = "01") {
    if (!archDetailPanel || !resumeData.architectureSteps) return;
    const stepData = resumeData.architectureSteps.find(s => s.id === stepId) || resumeData.architectureSteps[0];
    if (!stepData) return;

    const techChips = stepData.tech.map(t => `<span class="arch-tech-chip">${t}</span>`).join("");

    archDetailPanel.innerHTML = `
      <div class="arch-detail-card">
        <div class="arch-detail-header">
          <div class="arch-detail-title-group">
            <span class="arch-step-badge tag-${stepData.badgeType || 'blue'}">Stage ${stepData.id} · ${stepData.badge}</span>
            <h4 class="arch-step-title">${stepData.name} <span class="arch-step-role">&mdash; ${stepData.role}</span></h4>
          </div>
          <div class="arch-detail-metrics">
            <i class="fa fa-tachometer"></i> <span>${stepData.metrics}</span>
          </div>
        </div>
        <p class="arch-detail-summary">${stepData.summary}</p>
        <div class="arch-detail-footer">
          <span class="arch-tech-label">Architecture Stack:</span>
          <div class="arch-tech-chips">${techChips}</div>
        </div>
      </div>
    `;
  }

  if (archStepsContainer) {
    const stepButtons = archStepsContainer.querySelectorAll(".workflow-step");
    stepButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        stepButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        const stepId = btn.getAttribute("data-step-id");
        renderArchitectureDetail(stepId);
      });
    });
    renderArchitectureDetail("01");
  }

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

  /* Enhanced Copy Email Button */
  var copyBtns = document.querySelectorAll(".copy-email-pill");
  copyBtns.forEach(function(copyBtn) {
    copyBtn.addEventListener("click", function() {
      var email = copyBtn.getAttribute("data-email") || "cvbiro.career@gmail.com";
      var label = copyBtn.querySelector(".copy-email-label");
      function onSuccess() {
        if (label) label.textContent = "Copied! ✓";
        copyBtn.classList.add("is-copied");
        setTimeout(function() {
          if (label) label.textContent = "Copy Address";
          copyBtn.classList.remove("is-copied");
        }, 2200);
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
  });

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
