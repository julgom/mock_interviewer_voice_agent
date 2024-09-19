import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Share2,
  Flag,
  Link,
  Twitter,
  Linkedin,
  Facebook,
  Briefcase,
  MapPin,
  Users,
  DollarSign,
  Percent,
} from "lucide-react";
import Image from "next/image";

export default function JobModal({ job, isOpen, onClose }) {
  if (!job) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{job.title}</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="company">Company</TabsTrigger>
          </TabsList>
          <TabsContent value="overview">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Listing
                  </Button>
                  <Button variant="outline" size="sm">
                    <Flag className="h-4 w-4 mr-2" />
                    Report
                  </Button>
                </div>
                <Button variant="link" size="sm">
                  <Link className="h-4 w-4 mr-2" />
                  Original Job Post
                </Button>
              </div>
              <div className="flex items-center space-x-4">
                <Image
                  src={job.logo}
                  alt={`${job.company} logo`}
                  width={64}
                  height={64}
                  className="rounded-md"
                />
                <div className="flex-grow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {job.company} • {job.timePosted}
                      </p>
                      <h3 className="text-2xl font-bold">{job.title}</h3>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-2">
                    <p>{job.location}</p>
                    <Button>Apply</Button>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex flex-col items-center p-2 bg-gray-100 rounded">
                  <Briefcase className="h-6 w-6 mb-1" />
                  <p className="text-sm font-medium">{job.type}</p>
                </div>
                <div className="flex flex-col items-center p-2 bg-gray-100 rounded">
                  <MapPin className="h-6 w-6 mb-1" />
                  <p className="text-sm font-medium">
                    {job.remote === "Yes" ? "Remote" : "On-site"}
                  </p>
                </div>
                <div className="flex flex-col items-center p-2 bg-gray-100 rounded">
                  <Users className="h-6 w-6 mb-1" />
                  <p className="text-sm font-medium">{job.level}</p>
                </div>
                <div className="flex flex-col items-center p-2 bg-gray-100 rounded">
                  <DollarSign className="h-6 w-6 mb-1" />
                  <p className="text-sm font-medium">{job.salary}</p>
                </div>
              </div>
              <div className="bg-green-100 p-4 rounded-md">
                <h4 className="font-semibold text-green-800 mb-2">
                  Match Rating
                </h4>
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <div className="text-2xl font-bold text-green-600">
                      {job.matchRating}%
                    </div>
                    <div className="text-sm text-green-700">GOOD MATCH</div>
                  </div>
                  <div className="flex-1">
                    <div className="text-lg font-semibold text-green-600">
                      {job.expLevelMatch}%
                    </div>
                    <div className="text-sm text-green-700">Exp. Level</div>
                  </div>
                  <div className="flex-1">
                    <div className="text-lg font-semibold text-green-600">
                      {job.skillMatch}%
                    </div>
                    <div className="text-sm text-green-700">Skill</div>
                  </div>
                  <div className="flex-1">
                    <div className="text-lg font-semibold text-green-600">
                      {job.industryExpMatch}%
                    </div>
                    <div className="text-sm text-green-700">Industry Exp.</div>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Job Description</h4>
                <p>{job.description}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {job.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 text-sm font-semibold rounded-full bg-gray-200 text-gray-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Responsibilities</h4>
                <ul className="list-disc pl-5 space-y-1">
                  {job.responsibilities.map((resp, index) => (
                    <li key={index}>{resp}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Qualifications</h4>
                <div className="flex flex-wrap gap-2">
                  {job.qualifications.map((qual) => (
                    <span
                      key={qual}
                      className="px-2 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800"
                    >
                      {qual}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Required</h4>
                <ul className="list-disc pl-5 space-y-1">
                  {job.required.map((req, index) => (
                    <li key={index}>{req}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Preferred</h4>
                <ul className="list-disc pl-5 space-y-1">
                  {job.preferred.map((pref, index) => (
                    <li key={index}>{pref}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Benefits</h4>
                <ul className="list-disc pl-5 space-y-1">
                  {job.benefits.map((benefit, index) => (
                    <li key={index}>{benefit}</li>
                  ))}
                </ul>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="company">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold">{job.companyInfo.name}</h3>
                <div className="flex space-x-2">
                  <Button variant="outline" size="icon">
                    <Twitter className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Linkedin className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Facebook className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Image
                  src={job.logo}
                  alt={`${job.company} logo`}
                  width={64}
                  height={64}
                  className="rounded-md"
                />
                <p>{job.companyInfo.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-medium">Founded</p>
                  <p>{job.companyInfo.founded}</p>
                </div>
                <div>
                  <p className="font-medium">Location</p>
                  <p>{job.companyInfo.location}</p>
                </div>
                <div>
                  <p className="font-medium">Company Size</p>
                  <p>{job.companyInfo.size}</p>
                </div>
                <div>
                  <p className="font-medium">Website</p>
                  <a
                    href={job.companyInfo.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {job.companyInfo.website}
                  </a>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
