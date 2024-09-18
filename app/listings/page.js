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
  Heart,
  X,
  MapPin,
  Clock,
  Users,
  DollarSign,
  Percent,
} from "lucide-react";
import Image from "next/image";

// Mock data for job postings with additional details
const jobPostings = [
  {
    id: 1,
    title: "Software Engineer",
    company: "Tech Co",
    location: "San Francisco, CA",
    remote: "Yes",
    type: "Full-time",
    level: "Entry-level",
    salary: "$80,000 - $120,000",
    applicants: 45,
    timePosted: "2 days ago",
    matchRating: 85,
    tags: ["Engineering", "Full-time"],
  },
  {
    id: 2,
    title: "Product Manager",
    company: "Startup Inc",
    location: "New York, NY",
    remote: "No",
    type: "Full-time",
    level: "Mid-level",
    salary: "$100,000 - $150,000",
    applicants: 30,
    timePosted: "1 week ago",
    matchRating: 72,
    tags: ["Management", "Full-time"],
  },
  {
    id: 3,
    title: "Data Scientist",
    company: "Big Data Corp",
    location: "Boston, MA",
    remote: "Hybrid",
    type: "Full-time",
    level: "Senior",
    salary: "$130,000 - $180,000",
    applicants: 20,
    timePosted: "3 days ago",
    matchRating: 90,
    tags: ["Data", "Full-time"],
  },
  {
    id: 4,
    title: "UX Designer",
    company: "Design Studio",
    location: "Los Angeles, CA",
    remote: "Yes",
    type: "Contract",
    level: "Mid-level",
    salary: "$70 - $90 per hour",
    applicants: 15,
    timePosted: "5 hours ago",
    matchRating: 78,
    tags: ["Design", "Contract"],
  },
  {
    id: 5,
    title: "Marketing Intern",
    company: "Ad Agency",
    location: "Chicago, IL",
    remote: "No",
    type: "Part-time",
    level: "Internship",
    salary: "$20 - $25 per hour",
    applicants: 50,
    timePosted: "1 day ago",
    matchRating: 65,
    tags: ["Marketing", "Part-time", "Internship"],
  },
];

const allTags = [
  "Engineering",
  "Management",
  "Data",
  "Design",
  "Marketing",
  "Full-time",
  "Part-time",
  "Contract",
  "Internship",
];

export default function JobSearchPage() {
  const [selectedTags, setSelectedTags] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [blocked, setBlocked] = useState([]);

  const toggleTag = (tag) => {
    setSelectedTags((prevTags) =>
      prevTags.includes(tag)
        ? prevTags.filter((t) => t !== tag)
        : [...prevTags, tag]
    );
  };

  const toggleFavorite = (id) => {
    setFavorites((prevFavorites) =>
      prevFavorites.includes(id)
        ? prevFavorites.filter((favId) => favId !== id)
        : [...prevFavorites, id]
    );
  };

  const toggleBlocked = (id) => {
    setBlocked((prevBlocked) =>
      prevBlocked.includes(id)
        ? prevBlocked.filter((blockedId) => blockedId !== id)
        : [...prevBlocked, id]
    );
  };

  const filteredJobs = jobPostings
    .filter((job) => !blocked.includes(job.id))
    .filter(
      (job) =>
        selectedTags.length === 0 ||
        job.tags.some((tag) => selectedTags.includes(tag))
    );

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
      <main className="flex-1 p-6">
        <h2 className="text-2xl font-semibold mb-4">Job Listings</h2>

        {/* Filter Buttons */}
        <div className="mb-4 flex flex-wrap gap-2">
          {allTags.map((tag) => (
            <Button
              key={tag}
              variant={selectedTags.includes(tag) ? "default" : "outline"}
              size="sm"
              onClick={() => toggleTag(tag)}
            >
              {tag}
            </Button>
          ))}
        </div>

        <ScrollArea className="h-[calc(100vh-180px)]">
          <div className="space-y-4">
            {filteredJobs.map((job) => (
              <Card key={job.id} className="relative">
                <CardHeader className="pb-2">
                  <div className="flex items-start space-x-4">
                    <Image
                      src="/placeholder.svg"
                      alt={`${job.company} logo`}
                      width={64}
                      height={64}
                      className="rounded-md"
                    />
                    <div className="flex-1">
                      <div className="text-sm text-muted-foreground">
                        {job.timePosted}
                      </div>
                      <CardTitle className="text-xl">{job.title}</CardTitle>
                      <div className="flex justify-between items-center mt-1">
                        <div className="text-sm font-medium">{job.company}</div>
                        <div className="flex flex-wrap gap-1">
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
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleFavorite(job.id)}
                    >
                      <Heart
                        className={`h-4 w-4 ${
                          favorites.includes(job.id)
                            ? "fill-red-500 text-red-500"
                            : ""
                        }`}
                      />
                      <span className="sr-only">Favorite</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleBlocked(job.id)}
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Block</span>
                    </Button>
                    <Button>Apply</Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </main>
    </div>
  );
}
