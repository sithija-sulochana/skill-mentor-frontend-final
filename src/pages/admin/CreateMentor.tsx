import { useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/hooks/use-toast";
import {
  User,
  Mail,
  Briefcase,
  Building2,
  Calendar,
  FileText,
  ImagePlus,
  Award,
  UserPlus,
  Loader2,
  Phone,
  Upload,
  X,
} from "lucide-react";
import { uploadMentorProfileImage } from "@/lib/api";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  title: string;
  profession: string;
  company: string;
  experienceYears: string;
  bio: string;
  profileImageBase64: string;
  startYear: string;
  isCertified: boolean;
  createAt?: string;
}

interface FormErrors {
  [key: string]: string | undefined;
}

export default function CreateMentor() {
  const { getToken } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const { userId } = useAuth();

  const initialState: FormData = {
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    title: "",
    profession: "",
    company: "",
    experienceYears: "",
    bio: "",
    profileImageBase64: "",
    startYear: "",
    isCertified: false,
    createAt: new Date().toISOString(),
  };

  const [formData, setFormData] = useState<FormData>(initialState);


  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid File",
        description: "Please upload a valid image file",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Image must be under 5MB",
        variant: "destructive",
      });
      return;
    }

    // Store the file for later upload
    setSelectedImageFile(file);

    // Also create base64 preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        profileImageBase64: reader.result as string,
      }));
    };
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setSelectedImageFile(null);
    setFormData(prev => ({ ...prev, profileImageBase64: "" }));
  };


  const validateForm = () => {
    const newErrors: FormErrors = {};

    if (!formData.firstName.trim()) newErrors.firstName = "Required";
    if (!formData.lastName.trim()) newErrors.lastName = "Required";

    if (!formData.email.trim()) newErrors.email = "Required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Invalid email";

    if (!formData.title.trim()) newErrors.title = "Required";
    if (!formData.profession.trim()) newErrors.profession = "Required";
    if (!formData.company.trim()) newErrors.company = "Required";

    if (!formData.experienceYears.trim())
      newErrors.experienceYears = "Required";
    else if (Number(formData.experienceYears) < 0)
      newErrors.experienceYears = "Invalid number";

    if (!formData.bio.trim() || formData.bio.length < 20)
      newErrors.bio = "Minimum 20 characters";

    if (!/^\d{4}$/.test(formData.startYear))
      newErrors.startYear = "Invalid year";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /*  CHANGE HANDLER */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  /* SUBMIT  */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix errors",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const token = await getToken({ template: "skill-mentor" });
      if (!token) throw new Error("Authentication required");

      // First, create the mentor without the image (or with base64 fallback)
      const response = await fetch(`${API_BASE_URL}/api/v1/mentors`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          mentorId: userId,
          // Use base64 as initial profile image (fallback)
          profileImageUrl: formData.profileImageBase64,
          experienceYears: Number(formData.experienceYears),
          startYear: Number(formData.startYear),
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          createAt: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to create mentor");
      }

      const createdMentor = await response.json();

      // If we have a selected file and the mentor was created, upload the image separately
      if (selectedImageFile && createdMentor.id) {
        setIsUploadingImage(true);
        try {
          await uploadMentorProfileImage(token, createdMentor.id, selectedImageFile);
          toast({
            title: "Success",
            description: "Mentor created and profile image uploaded successfully",
          });
        } catch (uploadError) {
          console.error("Image upload failed:", uploadError);
          toast({
            title: "Partial Success",
            description: "Mentor created but image upload failed. You can update the image later.",
            variant: "default",
          });
        } finally {
          setIsUploadingImage(false);
        }
      } else {
        toast({
          title: "Success",
          description: "Mentor created successfully",
        });
      }

      setFormData(initialState);
      setSelectedImageFile(null);
      setErrors({});
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white mb-4 shadow-lg">
            <UserPlus className="w-8 h-8" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-2">
            Create New Mentor
          </h1>
          <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
            Add a new mentor to the platform by filling out the information below
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information Card */}
          <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-lg">Personal Information</CardTitle>
                  <CardDescription>Basic details about the mentor</CardDescription>
                </div>
              </div>
            </CardHeader>
            <Separator className="mb-6" />
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* First Name */}
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-medium flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-400" />
                    First Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Enter first name"
                    className={`h-11 transition-all duration-200 ${
                      errors.firstName 
                        ? "border-red-500 focus:ring-red-500" 
                        : "focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    }`}
                  />
                  {errors.firstName && (
                    <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                      <X className="w-3 h-3" /> {errors.firstName}
                    </p>
                  )}
                </div>

                {/* Last Name */}
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm font-medium flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-400" />
                    Last Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Enter last name"
                    className={`h-11 transition-all duration-200 ${
                      errors.lastName 
                        ? "border-red-500 focus:ring-red-500" 
                        : "focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    }`}
                  />
                  {errors.lastName && (
                    <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                      <X className="w-3 h-3" /> {errors.lastName}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-400" />
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="mentor@example.com"
                    className={`h-11 transition-all duration-200 ${
                      errors.email 
                        ? "border-red-500 focus:ring-red-500" 
                        : "focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    }`}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                      <X className="w-3 h-3" /> {errors.email}
                    </p>
                  )}
                </div>

                {/* Phone Number */}
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber" className="text-sm font-medium flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400" />
                    Phone Number
                  </Label>
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="+1 (555) 000-0000"
                    className="h-11 transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Professional Information Card */}
          <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-lg">Professional Details</CardTitle>
                  <CardDescription>Work experience and expertise</CardDescription>
                </div>
              </div>
            </CardHeader>
            <Separator className="mb-6" />
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-medium flex items-center gap-2">
                    <Award className="w-4 h-4 text-slate-400" />
                    Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g. Senior Developer"
                    className={`h-11 transition-all duration-200 ${
                      errors.title 
                        ? "border-red-500 focus:ring-red-500" 
                        : "focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    }`}
                  />
                  {errors.title && (
                    <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                      <X className="w-3 h-3" /> {errors.title}
                    </p>
                  )}
                </div>

                {/* Profession */}
                <div className="space-y-2">
                  <Label htmlFor="profession" className="text-sm font-medium flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-slate-400" />
                    Profession <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="profession"
                    name="profession"
                    value={formData.profession}
                    onChange={handleChange}
                    placeholder="e.g. Software Engineer"
                    className={`h-11 transition-all duration-200 ${
                      errors.profession 
                        ? "border-red-500 focus:ring-red-500" 
                        : "focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    }`}
                  />
                  {errors.profession && (
                    <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                      <X className="w-3 h-3" /> {errors.profession}
                    </p>
                  )}
                </div>

                {/* Company */}
                <div className="space-y-2">
                  <Label htmlFor="company" className="text-sm font-medium flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-slate-400" />
                    Company <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    placeholder="e.g. Google, Microsoft"
                    className={`h-11 transition-all duration-200 ${
                      errors.company 
                        ? "border-red-500 focus:ring-red-500" 
                        : "focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    }`}
                  />
                  {errors.company && (
                    <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                      <X className="w-3 h-3" /> {errors.company}
                    </p>
                  )}
                </div>

                {/* Experience Years */}
                <div className="space-y-2">
                  <Label htmlFor="experienceYears" className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    Experience (Years) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="experienceYears"
                    type="number"
                    name="experienceYears"
                    value={formData.experienceYears}
                    onChange={handleChange}
                    placeholder="e.g. 5"
                    min="0"
                    className={`h-11 transition-all duration-200 ${
                      errors.experienceYears 
                        ? "border-red-500 focus:ring-red-500" 
                        : "focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    }`}
                  />
                  {errors.experienceYears && (
                    <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                      <X className="w-3 h-3" /> {errors.experienceYears}
                    </p>
                  )}
                </div>

                {/* Start Year */}
                <div className="space-y-2 md:col-span-1">
                  <Label htmlFor="startYear" className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    Start Year <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="startYear"
                    name="startYear"
                    value={formData.startYear}
                    onChange={handleChange}
                    placeholder="e.g. 2020"
                    className={`h-11 transition-all duration-200 ${
                      errors.startYear 
                        ? "border-red-500 focus:ring-red-500" 
                        : "focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    }`}
                  />
                  {errors.startYear && (
                    <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                      <X className="w-3 h-3" /> {errors.startYear}
                    </p>
                  )}
                </div>

                {/* Certification Status */}
                <div className="space-y-2 md:col-span-1 flex items-end">
                  <div 
                    onClick={() => setFormData(prev => ({ ...prev, isCertified: !prev.isCertified }))}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 w-full ${
                      formData.isCertified
                        ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                        : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${
                      formData.isCertified
                        ? "bg-green-500 border-green-500"
                        : "border-slate-300 dark:border-slate-600"
                    }`}>
                      {formData.isCertified && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className={`w-5 h-5 ${formData.isCertified ? "text-green-600" : "text-slate-400"}`} />
                      <span className={`font-medium ${formData.isCertified ? "text-green-700 dark:text-green-400" : "text-slate-600 dark:text-slate-400"}`}>
                        Certified Mentor
                      </span>
                      {formData.isCertified && (
                        <Badge className="bg-green-500 text-white ml-2">Verified</Badge>
                      )}
                    </div>
                    <input
                      type="checkbox"
                      name="isCertified"
                      checked={formData.isCertified}
                      onChange={handleChange}
                      className="sr-only"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bio Card */}
          <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-lg">Biography</CardTitle>
                  <CardDescription>Tell us about the mentor's background</CardDescription>
                </div>
              </div>
            </CardHeader>
            <Separator className="mb-6" />
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="bio" className="text-sm font-medium flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-400" />
                  Bio <span className="text-red-500">*</span>
                  <span className="text-xs text-slate-400 ml-auto">{formData.bio.length} / 20+ characters</span>
                </Label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Write a compelling bio about the mentor's experience, expertise, and teaching style..."
                  className={`w-full rounded-lg border px-4 py-3 text-sm transition-all duration-200 resize-none bg-white dark:bg-slate-950 ${
                    errors.bio 
                      ? "border-red-500 focus:ring-red-500" 
                      : "border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  } focus:outline-none`}
                />
                {errors.bio && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <X className="w-3 h-3" /> {errors.bio}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Profile Image Card */}
          <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400">
                  <ImagePlus className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-lg">Profile Image</CardTitle>
                  <CardDescription>Upload a professional photo</CardDescription>
                </div>
              </div>
            </CardHeader>
            <Separator className="mb-6" />
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-6 items-start">
                {/* Image Preview */}
                <div className="relative group">
                  <div className={`w-32 h-32 rounded-2xl border-2 border-dashed flex items-center justify-center overflow-hidden transition-all duration-200 ${
                    formData.profileImageBase64
                      ? "border-transparent"
                      : "border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"
                  }`}>
                    {formData.profileImageBase64 ? (
                      <img
                        src={formData.profileImageBase64}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center p-4">
                        <User className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-1" />
                        <span className="text-xs text-slate-400">No image</span>
                      </div>
                    )}
                  </div>
                  {formData.profileImageBase64 && (
                    <button
                      type="button"
                      onClick={clearImage}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Upload Area */}
                <div className="flex-1 w-full">
                  <label
                    htmlFor="profileImage"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl cursor-pointer bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 hover:border-blue-400"
                  >
                    <div className="flex flex-col items-center justify-center py-4">
                      <Upload className="w-8 h-8 text-slate-400 mb-2" />
                      <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                        Click to upload
                      </p>
                      <p className="text-xs text-slate-400">PNG, JPG, GIF up to 5MB</p>
                    </div>
                    <Input
                      id="profileImage"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex flex-col sm:flex-row gap-4 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              className="h-12 px-8 text-base order-2 sm:order-1"
              onClick={() => {
                setFormData({
                  firstName: "",
                  lastName: "",
                  email: "",
                  phoneNumber: "",
                  title: "",
                  profession: "",
                  company: "",
                  experienceYears: "",
                  bio: "",
                  profileImageBase64: "",
                  startYear: "",
                  isCertified: false,
                });
                setSelectedImageFile(null);
                setErrors({});
              }}
            >
              Clear Form
            </Button>
            <Button
              type="submit"
              disabled={isLoading || isUploadingImage}
              className="h-12 px-8 text-base bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 order-1 sm:order-2"
            >
              {isLoading || isUploadingImage ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  {isUploadingImage ? "Uploading Image..." : "Creating Mentor..."}
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5 mr-2" />
                  Create Mentor
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}