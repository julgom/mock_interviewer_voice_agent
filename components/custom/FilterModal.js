import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X } from "lucide-react";

export default function FilterModal({ onApplyFilters }) {
  const [jobTitles, setJobTitles] = useState([
    "Software Engineer",
    "Backend Engineer",
    "Frontend Engineer",
    "Full-stack Engineer",
  ]);
  const [newJobTitle, setNewJobTitle] = useState("");
  const [jobTypes, setJobTypes] = useState([]);
  const [workTypes, setWorkTypes] = useState([]);
  const [location, setLocation] = useState("");
  const [radius, setRadius] = useState(25);
  const [experienceLevels, setExperienceLevels] = useState([]);
  const [requiredExperience, setRequiredExperience] = useState([0]);
  const [datePosted, setDatePosted] = useState("");
  const [minSalary, setMinSalary] = useState([0]);
  const [industries, setIndustries] = useState([
    "Information Technology",
    "Artificial Intelligence (AI)",
    "Financial Services",
    "Consulting",
    "Software",
  ]);
  const [newIndustry, setNewIndustry] = useState("");
  const [skills, setSkills] = useState([
    "ChatGPT",
    "CI/CD",
    "JavaScript",
    "HTML",
    "AWS Lambda",
  ]);
  const [newSkill, setNewSkill] = useState("");

  const handleAddJobTitle = () => {
    if (newJobTitle && !jobTitles.includes(newJobTitle)) {
      setJobTitles([...jobTitles, newJobTitle]);
      setNewJobTitle("");
    }
  };

  const handleRemoveJobTitle = (title) => {
    setJobTitles(jobTitles.filter((t) => t !== title));
  };

  const handleAddIndustry = () => {
    if (newIndustry && !industries.includes(newIndustry)) {
      setIndustries([...industries, newIndustry]);
      setNewIndustry("");
    }
  };

  const handleRemoveIndustry = (industry) => {
    setIndustries(industries.filter((i) => i !== industry));
  };

  const handleAddSkill = () => {
    if (newSkill && !skills.includes(newSkill)) {
      setSkills([...skills, newSkill]);
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skill) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const handleApply = () => {
    onApplyFilters({
      jobTitles,
      jobTypes,
      workTypes,
      location,
      radius,
      experienceLevels,
      requiredExperience: requiredExperience[0],
      datePosted,
      minSalary: minSalary[0],
      industries,
      skills,
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Filters</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Job Filters</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <h3 className="font-medium">Basic Job Criteria</h3>
              <div>
                <Label htmlFor="jobTitles">Job Title(s)</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {jobTitles.map((title, index) => (
                    <div
                      key={index}
                      className="bg-secondary text-secondary-foreground px-2 py-1 rounded-full text-sm flex items-center"
                    >
                      {title}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-1 h-4 w-4 p-0"
                        onClick={() => handleRemoveJobTitle(title)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="flex mt-2">
                  <Input
                    id="jobTitles"
                    value={newJobTitle}
                    onChange={(e) => setNewJobTitle(e.target.value)}
                    className="flex-grow"
                    placeholder="Add job title"
                  />
                  <Button onClick={handleAddJobTitle} className="ml-2">
                    Add
                  </Button>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Job Type</Label>
              <div className="flex flex-wrap gap-4">
                {["Full-time", "Contract", "Part-time", "Internship"].map(
                  (type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={type}
                        checked={jobTypes.includes(type)}
                        onCheckedChange={(checked) => {
                          setJobTypes(
                            checked
                              ? [...jobTypes, type]
                              : jobTypes.filter((t) => t !== type)
                          );
                        }}
                      />
                      <label htmlFor={type}>{type}</label>
                    </div>
                  )
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Work Type</Label>
              <div className="flex flex-wrap gap-4">
                {["Onsite", "Remote", "Hybrid"].map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox
                      id={type}
                      checked={workTypes.includes(type)}
                      onCheckedChange={(checked) => {
                        setWorkTypes(
                          checked
                            ? [...workTypes, type]
                            : workTypes.filter((t) => t !== type)
                        );
                      }}
                    />
                    <label htmlFor={type}>{type}</label>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Enter city"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="radius">Radius (miles)</Label>
                <Select
                  value={radius.toString()}
                  onValueChange={(value) => setRadius(parseInt(value))}
                >
                  <SelectTrigger id="radius">
                    <SelectValue placeholder="Select radius" />
                  </SelectTrigger>
                  <SelectContent>
                    {[5, 10, 15, 20, 25, 50, 100].map((value) => (
                      <SelectItem key={value} value={value.toString()}>
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Experience Level</Label>
              <div className="flex flex-wrap gap-4">
                {[
                  "Intern",
                  "Entry Level",
                  "Mid Level",
                  "Senior Level",
                  "Director",
                  "Executive",
                ].map((level) => (
                  <div key={level} className="flex items-center space-x-2">
                    <Checkbox
                      id={level}
                      checked={experienceLevels.includes(level)}
                      onCheckedChange={(checked) => {
                        setExperienceLevels(
                          checked
                            ? [...experienceLevels, level]
                            : experienceLevels.filter((l) => l !== level)
                        );
                      }}
                    />
                    <label htmlFor={level}>{level}</label>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Required Experience (Years)</Label>
              <Slider
                value={requiredExperience}
                onValueChange={setRequiredExperience}
                max={11}
                step={1}
              />
              <div className="text-sm text-muted-foreground">
                {requiredExperience} years
              </div>
            </div>
            <div className="space-y-2">
              <Label>Date Posted</Label>
              <Select value={datePosted} onValueChange={setDatePosted}>
                <SelectTrigger id="datePosted">
                  <SelectValue placeholder="Select date range" />
                </SelectTrigger>
                <SelectContent>
                  {[
                    "Past 24 hours",
                    "Past 3 days",
                    "Past week",
                    "Past month",
                  ].map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Minimum Annual Salary</Label>
              <Slider
                value={minSalary}
                onValueChange={setMinSalary}
                max={300}
                step={10}
              />
              <div className="text-sm text-muted-foreground">
                ${minSalary}k/yr
              </div>
            </div>
            <div className="space-y-2">
              <Label>Industry</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {industries.map((industry, index) => (
                  <div
                    key={index}
                    className="bg-secondary text-secondary-foreground px-2 py-1 rounded-full text-sm flex items-center"
                  >
                    {industry}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-1 h-4 w-4 p-0"
                      onClick={() => handleRemoveIndustry(industry)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="flex mt-2">
                <Input
                  value={newIndustry}
                  onChange={(e) => setNewIndustry(e.target.value)}
                  className="flex-grow"
                  placeholder="Add industry"
                />
                <Button onClick={handleAddIndustry} className="ml-2">
                  Add
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Skills</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {skills.map((skill, index) => (
                  <div
                    key={index}
                    className="bg-secondary text-secondary-foreground px-2 py-1 rounded-full text-sm flex items-center"
                  >
                    {skill}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-1 h-4 w-4 p-0"
                      onClick={() => handleRemoveSkill(skill)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="flex mt-2">
                <Input
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  className="flex-grow"
                  placeholder="Add skill"
                />
                <Button onClick={handleAddSkill} className="ml-2">
                  Add
                </Button>
              </div>
            </div>
          </div>
        </ScrollArea>
        <Button onClick={handleApply} className="w-full mt-4">
          Apply Filters
        </Button>
      </DialogContent>
    </Dialog>
  );
}
