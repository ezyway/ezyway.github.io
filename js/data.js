const resumeData = {
  profile: {
    birthDate: "1999-06-01", // June 1, 1999
    fullName: "Sreyas Cheeran Velikoth",
    email: "cvbiro.career@gmail.com",
    location: "Hyderabad, Telangana, India",
    githubUrl: "https://github.com/ezyway",
    linkedinUrl: "https://linkedin.com/in/cvbiro"
  },
  experiences: [
    {
      role: "Jr. Full Stack Developer",
      company: "Aganitha Cognitive Solutions",
      location: "Hyderabad, India",
      start: "2026-04",
      end: "present",
      category: "ai-dev",
      logo: "images/logos/aganitha.webp",
      tag: "Current Role · AI & Systems",
      tagType: "green",
      summary: "Architecting and scaling production-grade multi-agent LLM platforms and cloud-native backend services.",
      highlights: [
        "Designed and deployed multi-agent architectures using Google ADK with coordinator routing to specialized domain agents.",
        "Built scalable backend microservices using Python, FastAPI, and Docker on AWS ECS and ECR.",
        "Re-architected complex scientific and research workflows into resilient, high-throughput production services."
      ],
      skills: ["Python", "FastAPI", "Google ADK", "AWS ECS", "Docker", "SLURM", "Microservices", "REST APIs"]
    },
    {
      role: "Jr. Developer Intern",
      company: "Aganitha Cognitive Solutions",
      location: "Hyderabad, India",
      start: "2025-09",
      end: "2026-03",
      category: "ai-dev",
      logo: "images/logos/aganitha.webp",
      tag: "Genomic AI & ML",
      tagType: "purple",
      summary: "Engineered deep learning pipelines and genomic analysis tools in close collaboration with computational domain scientists.",
      highlights: [
        "Productionized machine learning pipelines for High Content Analysis (HCA) of skin tissue data to classify chemical effects.",
        "Developed Variant Effect Predictor (VEP) agents integrated with Ensembl APIs for genomic variant scoring.",
        "Built GWAS data pipelines analyzing gene relationships to generate biologically meaningful insights.",
        "Implemented dynamic agent discovery and centralized configuration using Strapi CMS."
      ],
      skills: ["Python", "PyTorch", "Ensembl API", "GWAS", "Strapi CMS", "Docker", "NLP", "Scikit-Learn"]
    },
    {
      role: "Software Developer Instructor Trainee",
      company: "NxtWave",
      location: "Hyderabad, Telangana, India",
      start: "2025-06",
      end: "2025-07",
      category: "dev",
      logo: "images/logos/nxtwave.webp",
      tag: "Instruction & CS Fundamentals",
      tagType: "blue",
      summary: "Delivered technical training on programming fundamentals, data structures, and industry-standard web technologies.",
      highlights: [
        "Conducted live coding sessions in Python, JavaScript, HTML, and CSS for aspiring software developers.",
        "Assisted in curriculum design and technical learning content covering Data Structures and Algorithms (DSA)."
      ],
      skills: ["Python", "JavaScript", "DSA", "HTML5", "CSS3", "Problem Solving"]
    },
    {
      role: "Web Developer",
      company: "Shri V.J. Modha College",
      location: "Porbandar, Gujarat, India",
      start: "2025-02",
      end: "2025-05",
      category: "dev",
      logo: "images/logos/vjmodha.webp",
      tag: "Full-Stack Web",
      tagType: "cyan",
      summary: "Led end-to-end development of a responsive college portal for academic reports, attendance, and result publishing.",
      highlights: [
        "Architected frontend using HTML5, CSS3, and JavaScript with modern, mobile-first responsive layouts.",
        "Engineered a secure administrative control panel with role-based access control and MySQL database management."
      ],
      skills: ["PHP 8.2", "MySQL", "JavaScript", "HTML5", "CSS3", "Responsive Design"]
    },
    {
      role: "Cannista",
      company: "Fire & Flower",
      location: "Saskatoon, Saskatchewan, Canada",
      start: "2024-07",
      end: "2024-11",
      category: "exploring",
      logo: "images/logos/fireandflower.webp",
      tag: "Retail & Compliance",
      tagType: "default",
      summary: "Ensured strict regulatory compliance and customer advisory in a regulated retail environment.",
      highlights: [
        "Educated customers on responsible product use and safety protocols under strict regulatory standards.",
        "Handled secure POS transactions and maintained inventory accuracy."
      ],
      skills: ["Customer Advisory", "Regulatory Compliance", "Inventory Systems", "POS"]
    },
    {
      role: "Store Associate",
      company: "Walmart",
      location: "Saskatoon, Saskatchewan, Canada",
      start: "2023-02",
      end: "2024-11",
      category: "exploring",
      logo: "images/logos/walmart.webp",
      tag: "Operations & Logistics",
      tagType: "default",
      summary: "Supported large-scale store operations, inventory logistics, and customer support.",
      highlights: [
        "Maintained high operational standards across departments and resolved logistical support requests.",
        "Addressed store maintenance needs and contributed to efficient team workflows."
      ],
      skills: ["Operations", "Logistics Support", "Team Collaboration"]
    },
    {
      role: "Web Developer",
      company: "A1 Snack Mart",
      location: "Saskatoon, Saskatchewan, Canada",
      start: "2023-06",
      end: "2023-11",
      category: "dev",
      logo: "images/logos/a1snack.webp",
      tag: "Web App & Automation",
      tagType: "cyan",
      summary: "Built a commercial store portal with an automated employee management and payroll system.",
      highlights: [
        "Built responsive web app with automated payroll calculation and weekly hours tracking, eliminating manual calculation.",
        "Integrated QR Code marketing and dynamic inventory displays."
      ],
      skills: ["PHP", "MySQL", "Bootstrap 5", "jQuery", "Payroll Automation"]
    },
    {
      role: "Programming Language Teacher",
      company: "Wisdemy",
      location: "Kochi, Kerala, India",
      start: "2021-12",
      end: "2022-01",
      category: "dev",
      logo: "images/logos/wisdemy.webp",
      tag: "OOP & Java Teaching",
      tagType: "blue",
      summary: "Taught core Object-Oriented Programming principles and CLI development in Java.",
      highlights: [
        "Mentored students in foundational OOP concepts, memory management, and clean code principles."
      ],
      skills: ["Java", "OOP", "Data Structures", "Algorithms"]
    },
    {
      role: "Computer Lab Technician",
      company: "Shri V.J. Modha College",
      location: "Porbandar, Gujarat, India",
      start: "2017-06",
      end: "2020-08",
      category: "dev",
      logo: "images/logos/vjmodha.webp",
      tag: "Systems & Infrastructure",
      tagType: "default",
      summary: "Managed computer laboratory systems, network setup, and orchestrated state-wide online examinations.",
      highlights: [
        "Maintained multi-boot OS installations, hardware troubleshooting, and LAN network switch/router configuration.",
        "Orchestrated large-scale computer-based examinations for external educational institutions."
      ],
      skills: ["Linux", "Windows Server", "Networking", "Hardware Support", "System Administration"]
    },
    {
      role: "Webcaster for Election",
      company: "Election Commission of India",
      location: "Porbandar, Gujarat, India",
      start: "2017-12",
      end: "2017-12",
      category: "exploring",
      logo: "images/logos/eci.webp",
      tag: "Field Operations",
      tagType: "default",
      summary: "Live video streaming and polling station infrastructure during state assembly elections.",
      highlights: [
        "Configured camera streaming setups at voting venues and ensured uninterrupted live feeds to the central control room."
      ],
      skills: ["Live Streaming", "Network Setup", "Field Troubleshooting"]
    }
  ],
  education: [
    {
      degree: "Postgraduate Certificate in Cyber Security",
      institution: "Saskatchewan Polytechnic",
      location: "Saskatoon, SK, Canada",
      start: "2023-01",
      end: "2023-10",
      year: "2023",
      grade: "83.85%",
      badge: "Cyber Security",
      badgeType: "blue",
      logo: "images/logos/saskpoly.webp",
      description: "Specialized post-graduate program covering network defense, digital forensics, threat analysis, and security auditing.",
      tags: ["Network Defense", "Threat Analysis", "Digital Forensics", "Risk Management"]
    },
    {
      degree: "Master of Computer Applications (MCA)",
      institution: "Cochin University of Science and Technology",
      location: "Kochi, Kerala, India",
      start: "2020-12",
      end: "2022-06",
      year: "2020 – 2022",
      grade: "9.03 CGPA",
      badge: "Advanced CS",
      badgeType: "purple",
      logo: "images/logos/cusat.webp",
      description: "Advanced study of computer science, software engineering, algorithms, distributed systems, and machine learning fundamentals.",
      tags: ["Computer Science", "Algorithms", "Software Engineering", "Machine Learning"]
    },
    {
      degree: "Bachelor of Computer Applications (BCA)",
      institution: "Shri V.J. Modha College (BKNMU)",
      location: "Porbandar, Gujarat, India",
      start: "2017-06",
      end: "2020-08",
      year: "2017 – 2020",
      grade: "8.89 CGPA",
      badge: "Computer Applications",
      badgeType: "cyan",
      logo: "images/logos/vjmodha.webp",
      description: "Core computer science fundamentals, full-stack web development, relational database engineering, and Linux system administration.",
      tags: ["Software Engineering", "Web Dev", "Database Management", "System Admin"]
    }
  ],
  projects: [
    {
      title: "RezMon",
      icon: "fa-dashboard",
      description: "A GNOME Shell system monitor extension displaying live CPU, RAM, and network statistics directly in the Linux system tray.",
      impact: "22,000+ Downloads · Published on GNOME Marketplace",
      tags: ["JavaScript", "GNOME Shell", "Linux", "System Monitor"],
      live: "https://extensions.gnome.org/extension/6952/rezmon/",
      liveLabel: "GNOME Extensions",
      github: "https://github.com/ezyway/RezMon"
    },
    {
      title: "Nayora Technologies",
      icon: "fa-globe",
      description: "Luxury corporate web platform and GCC staffing portal featuring interactive HTML5 canvas fluid ripples, 3D gyro tilt physics, dual-mode capability catalog, and live global timezone hubs.",
      impact: "Enterprise web application & cross-border IT staffing portal",
      tags: ["PHP", "JavaScript", "HTML5 Canvas", "Docker", "UI/UX Architecture"],
      live: "https://nayoratechnologies.com/",
      liveLabel: "Live Website",
      extraLink: "https://www.linkedin.com/company/nayoratechnologies/",
      extraLabel: "LinkedIn",
      extraIcon: "fa-linkedin"
    },
    {
      title: "Shri V.J. Modha College",
      icon: "fa-graduation-cap",
      description: "Official institutional web portal for Shri V.J. Modha College built with a lightweight modular PHP architecture, automated cache-busting, course syllabi, campus lab disclosures, and faculty directories.",
      impact: "Official academic portal serving thousands in Porbandar, Gujarat",
      tags: ["PHP 8.2", "Apache", "Modular Architecture", "SEO", "Docker"],
      live: "https://www.shrivjmodhacollege.com/",
      liveLabel: "Live Website"
    },
    {
      title: "Maruti Nandan Exports",
      icon: "fa-ship",
      description: "Commercial web platform for global agricultural export and maritime logistics, showcasing international product lines, brand portfolios, quality certifications, and dynamic trade inquiries.",
      impact: "Global export & shipping web presence with responsive product catalog",
      tags: ["PHP", "HTML5/CSS3", "JavaScript", "Logistics", "Docker"],
      live: "https://marutinandan.co/",
      liveLabel: "Live Website"
    },
    {
      title: "Cuckoo-Scripts",
      icon: "fa-terminal",
      description: "A comprehensive collection of deployment scripts and documentation to configure Cuckoo Sandbox for automated malware analysis.",
      impact: "Automated sandbox setup from hours of manual work to minutes",
      tags: ["Shell", "Bash", "Malware Analysis", "Sandbox"],
      github: "https://github.com/ezyway/Cuckoo-Scripts"
    },
    {
      title: "Motion-Detection",
      icon: "fa-video-camera",
      description: "An automated real-time motion detection and video streaming alert system utilizing Python, OpenCV, Ngrok, and the Telegram API.",
      impact: "Real-time security alerts with sub-second latency",
      tags: ["Python", "OpenCV", "Telegram API", "IoT Security"],
      github: "https://github.com/ezyway/Motion-Detection"
    },
    {
      title: "EFI-AN515-52-593F",
      icon: "fa-laptop",
      description: "Optimized Hackintosh OpenCore EFI configuration files to run macOS seamlessly on Acer Nitro 5 (AN515-52) laptops.",
      impact: "Community-adopted config for stable macOS on Acer Nitro 5",
      tags: ["Hackintosh", "macOS", "Hardware Tuning", "OpenCore"],
      github: "https://github.com/ezyway/EFI-AN515-52-593F"
    }
  ],
  skills: [
    {
      group: "Languages",
      items: [
        { name: "Python", icon: "images/icons/python.webp" },
        { name: "JavaScript", icon: "images/icons/javascript.webp" },
        { name: "JAVA", icon: "images/icons/java.webp" },
        { name: "C", icon: "images/icons/c.webp" },
        { name: "C++", icon: "images/icons/cplusplus.webp" },
        { name: "C#", icon: "images/icons/csharp.webp" },
        { name: "PHP", icon: "images/icons/php.webp" },
        { name: "HTML", icon: "images/icons/html5.webp" },
        { name: "CSS", icon: "images/icons/css3.webp" }
      ]
    },
    {
      group: "Frameworks & Backend",
      items: [
        { name: "FastAPI", icon: "fa-bolt" },
        { name: "Node.js", icon: "fa-terminal" },
        { name: "Next.js", icon: "fa-desktop" },
        { name: "Bootstrap", icon: "images/icons/bootstrap.webp" },
        { name: "jQuery", icon: "fa-code" },
        { name: "ASP", icon: "images/icons/asp.webp" }
      ]
    },
    {
      group: "AI & Machine Learning",
      items: [
        { name: "Agentic AI", icon: "fa-cogs" },
        { name: "Google ADK", icon: "fa-google" },
        { name: "Machine Learning", icon: "fa-area-chart" },
        { name: "Genomics Pipelines", icon: "fa-sitemap" }
      ]
    },
    {
      group: "Cloud, Data & DevOps",
      items: [
        { name: "AWS", icon: "fa-cloud" },
        { name: "Docker", icon: "fa-cubes" },
        { name: "SLURM", icon: "fa-tasks" },
        { name: "Redis", icon: "fa-database" },
        { name: "PostgreSQL", icon: "fa-database" },
        { name: "MySQL", icon: "fa-database" },
        { name: "Git", icon: "fa-git" },
        { name: "Linux", icon: "fa-linux" },
        { name: "Cyber Security", icon: "fa-shield" }
      ]
    }
  ]
};
