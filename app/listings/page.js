"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Briefcase,
  FileText,
  User,
  LogOut,
  Bookmark,
  X,
  MapPin,
  Clock,
  Users,
  DollarSign,
  Percent,
} from "lucide-react";
import Image from "next/image";
import JobModal from "@/components/custom/JobModal";
import FilterModal from "@/components/custom/FilterModal";

// Mock data for job postings
const jobPostings = [
  {
    id: 1,
    title: "Software Engineer",
    company: "Waabi",
    location: "United States",
    remote: "Yes",
    type: "Full-time",
    level: "Entry Level",
    salary: "$109K/yr - $171K/yr",
    applicants: 45,
    timePosted: "2 hours ago",
    matchRating: 83,
    expLevelMatch: 100,
    skillMatch: 46,
    industryExpMatch: 73,
    tags: ["Artificial Intelligence (AI)", "Autonomous Vehicles"],
    logo: "/placeholder.svg",
    description:
      "Waabi is an artificial intelligence company that commercializes driverless trucks. The role involves collaborating with a team to develop tools and frameworks for safe self-driving technology, leveraging an AI-first approach.",
    responsibilities: [
      "Be part of a team of multidisciplinary Engineers and Researchers using an AI-first approach to enable safe self-driving at scale.",
      "Build reliable and scalable tools and frameworks to support Autonomous Vehicle (AV) development.",
      "Participate and share ideas in technical and architecture discussions, collaborating with Researchers and Engineers.",
    ],
    qualifications: [
      "Python",
      "C++",
      "Go",
      "Rust",
      "Robotics",
      "Machine Learning",
      "Linux",
      "Docker",
      "Git",
      "Automated Testing",
      "Agile/Scrum",
      "Application Development",
      "Distributed Systems",
      "Data Storage",
      "Parallel Computing",
      "Software Performance",
      "Optimization",
      "Profiling",
      "Concurrency",
      "Determinism",
      "System Design",
      "Algorithms",
      "Data Structure Design",
      "Low Level Threading",
      "Front-end Development",
    ],
    required: [
      "MS/PhD or Bachelors degree with a Computer Science, Robotics and/or similar technical field(s) of study.",
      "Demonstrated software engineering experience through previous internships, work experience, coding competitions, and/or research projects.",
      "Some experience in reading and developing production quality software, versus only creating prototypes/proof of concepts.",
      "Experience using languages such as Python, Go, C++, or Rust.",
      "Experience working in a team environment on a common codebase.",
      "Ability to learn new technologies quickly.",
      "Open-minded and collaborative team player with willingness to help others.",
      "Passionate about self-driving technologies, solving hard problems, and creating innovative solutions.",
    ],
    preferred: [
      "Experience programming in C++ for a real world robotic system.",
      "Comfortable with Linux/other unix environments.",
      "Comfortable with Docker.",
      "Comfortable with git workflows.",
      "Experience in robotics or machine learning.",
      "Experience with automated testing.",
      "Experience working in an Agile/Scrum environment.",
      "Experience working with internal cross-functional partners/stakeholders when building software frameworks.",
      "Experience in one or more of the following areas: application development, distributed systems, data storage and processing, parallel computing environments, emulation at scale, software performance, optimization, and profiling, concurrency and determinism, test-driven and API-driven development methodologies, system design/architecture, algorithms, data structure design, and low level threading. Front-end development and tools.",
    ],
    benefits: [
      "Competitive compensation and equity awards.",
      "Health and Wellness benefits encompassing Medical, Dental and Vision coverage.",
      "Unlimited Vacation.",
      "Flexible hours and Work from Home support.",
      "Daily drinks, snacks and catered meals (when in office).",
      "Regularly scheduled team building activities and social events both on-site, off-site & virtually.",
      "World-class facility that includes a gym, games room (ping pong table, video game consoles, board games,etc), multiple collaborative working spaces and a gorgeous patio!(when in office).",
    ],
    companyInfo: {
      name: "Waabi",
      description:
        "Waabi is an artificial intelligence (AI) company that commercializes driverless trucks.",
      founded: "2021",
      location: "Toronto, Ontario, CAN",
      size: "51-200 employees",
      website: "https://waabi.ai",
    },
  },
  {
    id: 2,
    title: "Full Stack Developer",
    company: "TechNova",
    location: "New York, NY",
    remote: "Hybrid",
    type: "Full-time",
    level: "Mid Level",
    salary: "$120K/yr - $180K/yr",
    applicants: 78,
    timePosted: "1 day ago",
    matchRating: 91,
    expLevelMatch: 95,
    skillMatch: 88,
    industryExpMatch: 85,
    tags: ["Full Stack", "JavaScript", "React", "Node.js"],
    logo: "/placeholder.svg",
    description:
      "TechNova is seeking a talented Full Stack Developer to join our innovative team. You'll be working on cutting-edge web applications, collaborating with designers and back-end specialists to deliver seamless user experiences.",
    responsibilities: [
      "Develop and maintain web applications using React, Node.js, and other modern technologies.",
      "Collaborate with cross-functional teams to define, design, and ship new features.",
      "Ensure the technical feasibility of UI/UX designs.",
      "Optimize applications for maximum speed and scalability.",
      "Participate in code reviews and mentor junior developers.",
    ],
    qualifications: [
      "JavaScript",
      "React",
      "Node.js",
      "Express",
      "MongoDB",
      "RESTful APIs",
      "GraphQL",
      "HTML5",
      "CSS3",
      "Sass",
      "Webpack",
      "Git",
      "Agile Methodologies",
      "Test-Driven Development",
    ],
    required: [
      "Bachelor's degree in Computer Science or related field.",
      "3+ years of experience in full stack development.",
      "Strong proficiency in JavaScript, including DOM manipulation and the JavaScript object model.",
      "Thorough understanding of React.js and its core principles.",
      "Experience with popular React.js workflows (such as Flux or Redux).",
      "Experience with Node.js and Express.js.",
      "Familiarity with RESTful APIs and GraphQL.",
      "Knowledge of modern authorization mechanisms, such as JSON Web Token.",
    ],
    preferred: [
      "Experience with cloud services (AWS, Google Cloud, or Azure).",
      "Familiarity with continuous integration and deployment (CI/CD) pipelines.",
      "Understanding of server-side rendering and its benefits.",
      "Experience with microservices architecture.",
      "Knowledge of TypeScript and static typing principles.",
      "Familiarity with Docker and containerization concepts.",
    ],
    benefits: [
      "Competitive salary and equity package.",
      "Health, dental, and vision insurance.",
      "401(k) plan with company match.",
      "Generous paid time off and parental leave.",
      "Professional development budget.",
      "Regular team outings and events.",
      "Modern office with standing desks and latest equipment.",
    ],
    companyInfo: {
      name: "TechNova",
      description:
        "TechNova is a leading software development company specializing in innovative web and mobile solutions for startups and enterprises alike.",
      founded: "2015",
      location: "New York, NY",
      size: "201-500 employees",
      website: "https://technova.com",
    },
  },
  {
    id: 3,
    title: "Data Scientist",
    company: "DataMind AI",
    location: "San Francisco, CA",
    remote: "Yes",
    type: "Full-time",
    level: "Senior Level",
    salary: "$150K/yr - $220K/yr",
    applicants: 62,
    timePosted: "3 days ago",
    matchRating: 88,
    expLevelMatch: 92,
    skillMatch: 85,
    industryExpMatch: 90,
    tags: ["Machine Learning", "AI", "Python", "Big Data"],
    logo: "/placeholder.svg",
    description:
      "DataMind AI is looking for an experienced Data Scientist to join our team. You'll be working on cutting-edge AI and machine learning projects, developing models that drive business decisions and product innovations.",
    responsibilities: [
      "Develop and implement machine learning models to solve complex business problems.",
      "Collaborate with cross-functional teams to identify and execute on data science opportunities.",
      "Design and conduct experiments to test hypotheses and evaluate model performance.",
      "Communicate findings and insights to both technical and non-technical stakeholders.",
      "Stay up-to-date with the latest advancements in AI and machine learning.",
    ],
    qualifications: [
      "Python",
      "R",
      "SQL",
      "Machine Learning",
      "Deep Learning",
      "Natural Language Processing",
      "Computer Vision",
      "Statistical Analysis",
      "Big Data Technologies",
      "Data Visualization",
    ],
    required: [
      "Ph.D. or Master's degree in Computer Science, Statistics, or related quantitative field.",
      "5+ years of experience in applied machine learning or data science roles.",
      "Strong programming skills in Python and proficiency with machine learning libraries (e.g., scikit-learn, TensorFlow, PyTorch).",
      "Experience with big data technologies such as Hadoop, Spark, or Hive.",
      "Solid understanding of statistical modeling, machine learning algorithms, and their mathematical foundations.",
      "Excellent communication skills and ability to present complex ideas to non-technical audiences.",
    ],
    preferred: [
      "Experience with cloud-based machine learning platforms (e.g., AWS SageMaker, Google Cloud AI Platform).",
      "Familiarity with deep learning frameworks and techniques.",
      "Experience with natural language processing or computer vision projects.",
      "Knowledge of data engineering principles and experience with data pipelines.",
      "Publications in peer-reviewed journals or conferences in the field of machine learning or AI.",
      "Experience mentoring junior data scientists or leading small teams.",
    ],
    benefits: [
      "Competitive salary and equity package.",
      "Comprehensive health, dental, and vision insurance.",
      "401(k) plan with generous company match.",
      "Unlimited PTO policy.",
      "Annual conference and learning budget.",
      "Home office stipend for remote workers.",
      "Regular team offsites and AI/ML workshops.",
    ],
    companyInfo: {
      name: "DataMind AI",
      description:
        "DataMind AI is a cutting-edge artificial intelligence company focused on developing innovative AI solutions for various industries, from healthcare to finance.",
      founded: "2018",
      location: "San Francisco, CA",
      size: "101-250 employees",
      website: "https://datamind.ai",
    },
  },
  {
    id: 4,
    title: "UX/UI Designer",
    company: "DesignFusion",
    location: "Austin, TX",
    remote: "Hybrid",
    type: "Full-time",
    level: "Mid Level",
    salary: "$90K/yr - $130K/yr",
    applicants: 55,
    timePosted: "5 days ago",
    matchRating: 86,
    expLevelMatch: 88,
    skillMatch: 92,
    industryExpMatch: 80,
    tags: ["UX Design", "UI Design", "Figma", "User Research"],
    logo: "/placeholder.svg",
    description:
      "DesignFusion is seeking a talented UX/UI Designer to create amazing user experiences. You'll be working on a variety of projects, from web applications to mobile apps, ensuring that the user interface is attractive, user-friendly, and aligned with our clients' brand identities.",
    responsibilities: [
      "Create user-centered designs by understanding business requirements, and user feedback.",
      "Create user flows, wireframes, prototypes and mockups.",
      "Conduct user research and evaluate user feedback.",
      "Collaborate with product managers and engineers to define and implement innovative solutions for the product direction, visuals and experience.",
      "Execute all visual design stages from concept to final hand-off to engineering.",
    ],
    qualifications: [
      "Figma",
      "Sketch",
      "Adobe Creative Suite",
      "InVision",
      "Zeplin",
      "User Research",
      "Wireframing",
      "Prototyping",
      "Visual Design",
      "Interaction Design",
      "Information Architecture",
    ],
    required: [
      "Bachelor's degree in Design, HCI, or related field.",
      "3+ years of experience in UX/UI design for digital products.",
      "Strong portfolio demonstrating your design process and high-quality UI/UX work.",
      "Proficiency in design tools such as Figma, Sketch, and Adobe Creative Suite.",
      "Solid understanding of user-centered design principles and methodologies.",
      "Experience in conducting user research and usability testing.",
      "Excellent communication skills and ability to articulate design decisions.",
    ],
    preferred: [
      "Experience with design systems and component libraries.",
      "Knowledge of HTML, CSS, and basic front-end development principles.",
      "Familiarity with Agile/Scrum development processes.",
      "Experience in designing for multiple platforms (web, iOS, Android).",
      "Understanding of accessibility standards and inclusive design principles.",
      "Experience with animation and motion design tools.",
    ],
    benefits: [
      "Competitive salary and performance bonuses.",
      "Health, dental, and vision insurance.",
      "401(k) plan with company match.",
      "Flexible work hours and partial remote work options.",
      "Professional development budget for courses and conferences.",
      "Creative workspace with the latest design tools and equipment.",
      "Regular team building activities and design workshops.",
    ],
    companyInfo: {
      name: "DesignFusion",
      description:
        "DesignFusion is a leading design agency that combines creativity and technology to deliver exceptional digital experiences for a diverse range of clients.",
      founded: "2012",
      location: "Austin, TX",
      size: "51-200 employees",
      website: "https://designfusion.com",
    },
  },
  {
    id: 5,
    title: "DevOps Engineer",
    company: "CloudScale Solutions",
    location: "Seattle, WA",
    remote: "Yes",
    type: "Full-time",
    level: "Senior Level",
    salary: "$130K/yr - $190K/yr",
    applicants: 40,
    timePosted: "1 week ago",
    matchRating: 89,
    expLevelMatch: 95,
    skillMatch: 87,
    industryExpMatch: 82,
    tags: ["DevOps", "Cloud Computing", "Kubernetes", "CI/CD"],
    logo: "/placeholder.svg",
    description:
      "CloudScale Solutions is looking for an experienced DevOps Engineer to help us build and maintain our cloud infrastructure. You'll be working on cutting-edge cloud technologies, implementing CI/CD pipelines, and ensuring the reliability and scalability of our systems.",
    responsibilities: [
      "Design, implement and manage our cloud infrastructure on AWS and Google Cloud Platform.",
      "Implement and maintain CI/CD pipelines for automated testing and deployment.",
      "Manage and optimize Kubernetes clusters for containerized applications.",
      "Implement monitoring, logging, and alerting solutions.",
      "Collaborate with development teams to improve deployment processes and system reliability.",
      "Participate in on-call rotations to ensure 24/7 system reliability.",
    ],
    qualifications: [
      "AWS",
      "Google Cloud Platform",
      "Kubernetes",
      "Docker",
      "Terraform",
      "Ansible",
      "Jenkins",
      "GitLab CI",
      "Prometheus",
      "Grafana",
      "ELK Stack",
      "Python",
      "Bash",
    ],
    required: [
      "Bachelor's degree in Computer Science, Information Technology, or related field.",
      "5+ years of experience in DevOps or Site Reliability Engineering roles.",
      "Strong experience with cloud platforms, preferably AWS and GCP.",
      "Proficiency in containerization technologies, especially Docker and Kubernetes.",
      "Experience with Infrastructure as Code tools like Terraform or CloudFormation.",
      "Strong scripting skills in Python, Bash, or similar languages.",
      "Experience with CI/CD tools and methodologies.",
      "Solid understanding of networking concepts and security best practices in cloud environments.",
    ],
    preferred: [
      "Relevant certifications (e.g., AWS Certified DevOps Engineer, Google Cloud Professional DevOps Engineer).",
      "Experience with serverless architectures and technologies.",
      "Knowledge of database administration and optimization.",
      "Familiarity with microservices architectures.",
      "Experience with service mesh technologies like Istio.",
      "Understanding of machine learning operations (MLOps) principles.",
    ],
    benefits: [
      "Competitive salary and equity package.",
      "Comprehensive health, dental, and vision insurance.",
      "401(k) plan with generous company match.",
      "Unlimited PTO policy.",
      "Home office stipend and monthly internet reimbursement for remote workers.",
      "Annual education budget for courses, certifications, and conferences.",
      "Regular virtual team building events and tech talks.",
    ],
    companyInfo: {
      name: "CloudScale Solutions",
      description:
        "CloudScale Solutions is a cloud consulting and managed services provider, helping businesses leverage the power of cloud computing to drive innovation and growth.",
      founded: "2016",
      location: "Seattle, WA",
      size: "101-250 employees",
      website: "https://cloudscalesolutions.com",
    },
  },
];

export default function JobSearchPage() {
  const [saved, setSaved] = useState([]);
  const [applied, setApplied] = useState([]);
  const [blocked, setBlocked] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const [filters, setFilters] = useState({});

  const toggleSaved = (id) => {
    setSaved((prevSaved) =>
      prevSaved.includes(id)
        ? prevSaved.filter((savedId) => savedId !== id)
        : [...prevSaved, id]
    );
  };

  const toggleApplied = (id) => {
    setApplied((prevApplied) =>
      prevApplied.includes(id)
        ? prevApplied.filter((appliedId) => appliedId !== id)
        : [...prevApplied, id]
    );
  };

  const toggleBlocked = (id) => {
    setBlocked((prevBlocked) =>
      prevBlocked.includes(id)
        ? prevBlocked.filter((blockedId) => blockedId !== id)
        : [...prevBlocked, id]
    );
  };

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
    // You would typically update your job listings based on these filters
    console.log("Applying filters:", newFilters);
  };

  const filteredJobs = jobPostings
    .filter((job) => !blocked.includes(job.id))
    .filter((job) => {
      if (activeCategory === "all") return true;
      if (activeCategory === "saved") return saved.includes(job.id);
      if (activeCategory === "applied") return applied.includes(job.id);
      return true;
    });
  // Add more filter logic here based on the `filters` state

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left Sidebar */}
      <div className="w-64 bg-white shadow-md">
        <div className="flex flex-col h-full">
          <div className="p-4">
            <h1 className="text-2xl font-bold">JobRight</h1>
          </div>
          <nav className="flex-1">
            <Button variant="ghost" className="w-full justify-start" size="lg">
              <Briefcase className="mr-2 h-4 w-4" />
              Jobs
            </Button>
            <Button variant="ghost" className="w-full justify-start" size="lg">
              <FileText className="mr-2 h-4 w-4" />
              Resume
            </Button>
            <Button variant="ghost" className="w-full justify-start" size="lg">
              <User className="mr-2 h-4 w-4" />
              Profile
            </Button>
          </nav>
          <Button
            variant="ghost"
            className="w-full justify-start mt-auto"
            size="lg"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-hidden">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-semibold">Job Listings</h2>
            <FilterModal onApplyFilters={handleApplyFilters} />
          </div>
          <div className="space-x-2">
            <Button
              variant={activeCategory === "all" ? "default" : "outline"}
              onClick={() => setActiveCategory("all")}
            >
              All Jobs
            </Button>
            <Button
              variant={activeCategory === "saved" ? "default" : "outline"}
              onClick={() => setActiveCategory("saved")}
            >
              Saved
            </Button>
            <Button
              variant={activeCategory === "applied" ? "default" : "outline"}
              onClick={() => setActiveCategory("applied")}
            >
              Applied
            </Button>
          </div>
        </div>

        <ScrollArea className="h-[calc(100vh-180px)]">
          <div className="space-y-4">
            {filteredJobs.map((job) => (
              <Card
                key={job.id}
                className="relative cursor-pointer hover:shadow-lg transition-shadow duration-200"
                onClick={() => setSelectedJob(job)}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleBlocked(job.id);
                  }}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Block</span>
                </Button>
                <CardHeader className="pb-2">
                  <div className="flex items-start space-x-4">
                    <Image
                      src={job.logo}
                      alt={`${job.company} logo`}
                      width={64}
                      height={64}
                      className="rounded-md"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">
                          {job.company}
                        </span>
                        <span>•</span>
                        <span>{job.timePosted}</span>
                      </div>
                      <CardTitle className="text-xl">{job.title}</CardTitle>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {job.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-gray-200 text-gray-700"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      {job.location}
                    </div>
                    <div className="flex items-center">
                      <Briefcase className="h-4 w-4 mr-2" />
                      {job.remote === "Yes"
                        ? "Remote"
                        : job.remote === "No"
                        ? "On-site"
                        : "Hybrid"}
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-2" />
                      {job.salary}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      {job.type}
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      {job.level}
                    </div>
                    <div className="flex items-center">
                      <Percent className="h-4 w-4 mr-2" />
                      {job.matchRating}% match
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <span className="text-sm">{job.applicants} applicants</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSaved(job.id);
                      }}
                    >
                      <Bookmark
                        className={`h-4 w-4 ${
                          saved.includes(job.id)
                            ? "fill-blue-500 text-blue-500"
                            : ""
                        }`}
                      />
                      <span className="sr-only">Save</span>
                    </Button>
                  </div>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleApplied(job.id);
                    }}
                  >
                    {applied.includes(job.id) ? "Applied" : "Apply"}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </main>

      <JobModal
        job={selectedJob}
        isOpen={!!selectedJob}
        onClose={() => setSelectedJob(null)}
      />
    </div>
  );
}
