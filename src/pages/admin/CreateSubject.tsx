import { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  BookOpen,
  FileText,
  ImageIcon,
  Users,
  Plus,
  Loader2,
  Upload,
  X,
} from "lucide-react";

interface Mentor {
  id: string;
  firstName: string;
  lastName: string;
  profession: string;
}

function CreateSubject() {
  const { getToken } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [formData, setFormData] = useState({
    subjectName: "",
    description: "",
    imageUrl: "", // Stores the Base64 String
    mentorId: "",
  });

  // 1. Fetch real mentors from your backend on mount
  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/mentors`);
        const data = await response.json();
        // Adjust based on your API response (e.g., data.content if using Pageable)
        setMentors(Array.isArray(data) ? data : data.content || []);
      } catch (error) {
        console.error("Error fetching mentors:", error);
      }
    };
    fetchMentors();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMentorChange = (value: string) => {
    setFormData((prev) => ({ ...prev, mentorId: value }));
  };

  // 2. Base64 Image Conversion Logic
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("File size exceeds 2MB limit.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // 3. Submit to Spring Boot Backend
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = await getToken({ template: "skill-mentor" });
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/subjects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(formData),

      });

      if (response.ok) {
        alert("Subject created successfully!");
        setFormData({ subjectName: "", description: "", imageUrl: "", mentorId: "" });
      } else {
        const errData = await response.json();
        alert(`Error: ${errData.message || "Failed to create subject"}`);
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert("Network error. Please check if your backend is running.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-blue-600 text-white mb-4 shadow-lg">
            <BookOpen className="w-7 h-7" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Create New Subject</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Associate a new course with a mentor</p>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Subject Details
            </CardTitle>
            <CardDescription>Enter the curriculum details and assign a lead mentor.</CardDescription>
          </CardHeader>
          <Separator />
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Subject Name */}
              <div className="space-y-2">
                <Label htmlFor="subjectName" className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-slate-400" />
                  Subject Name
                </Label>
                <Input
                  id="subjectName"
                  name="subjectName"
                  required
                  value={formData.subjectName}
                  onChange={handleChange}
                  placeholder="e.g. Advanced Java Concurrency"
                  className="h-11"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-400" />
                  Description
                </Label>
                <textarea
                  id="description"
                  name="description"
                  required
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                  placeholder="Briefly explain the course objectives..."
                />
              </div>

              {/* Image Upload (Base64) */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-slate-400" />
                  Subject Image
                </Label>
                
                {!formData.imageUrl ? (
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700 hover:bg-slate-100 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-2 text-slate-400" />
                      <p className="text-sm text-slate-500 font-medium">Click to upload image</p>
                      <p className="text-xs text-slate-400">PNG, JPG up to 2MB</p>
                    </div>
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                  </label>
                ) : (
                  <div className="relative rounded-lg overflow-hidden border border-slate-200">
                    <img src={formData.imageUrl} alt="Preview" className="w-full h-48 object-cover" />
                    <Button 
                      type="button" 
                      variant="destructive" 
                      size="icon" 
                      className="absolute top-2 right-2 rounded-full h-8 w-8"
                      onClick={() => setFormData(prev => ({ ...prev, imageUrl: "" }))}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              

              {/* Mentor Selection */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-slate-400" />
                  Assign Mentor
                </Label>
                <Select value={formData.mentorId} onValueChange={handleMentorChange}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Search or select a mentor" />
                  </SelectTrigger>
                  <SelectContent>
                    {mentors.length > 0 ? mentors.map((mentor) => (
                      <SelectItem key={mentor.id} value={mentor.id.toString()}>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">
                            {mentor?.profileImageUrl ? (
                              <img
                                src={mentor.profileImageUrl}
                                alt={`${mentor.firstName} ${mentor.lastName}`}
                                className="w-6 h-6 rounded-full object-cover"
                              />
                              
                            ) : (
                              <span className="text-xs">{mentor.firstName.charAt(0)}</span>
                            )}

                            
                          </div>
                          <span>{mentor.firstName} {mentor.lastName}</span>
                          <span className="text-xs text-slate-400">({mentor.profession})</span>
                        </div>
                      </SelectItem>
                    )) : (
                      <div className="p-2 text-sm text-slate-400 text-center">No mentors found</div>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Action Button */}
              <Button
                type="submit"
                disabled={isLoading || !formData.mentorId}
                className="w-full h-12 text-base bg-blue-600 hover:bg-blue-700 transition-all"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5 mr-2" />
                    Create Subject
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default CreateSubject;