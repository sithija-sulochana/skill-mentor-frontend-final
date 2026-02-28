import React, { useState } from 'react';
// Assuming these are your local UI components or from a library like Shadcn
import { Button } from '@/components/ui/button'; 
import { 
  Camera, Mail, MapPin, Calendar, 
  Clock, User, Edit2, Share2 
} from 'lucide-react';

interface Session {
  id: string;
  title: string;
  mentor: string;
  date: string;
  time: string;
  duration: string;
  status: 'upcoming' | 'completed' | 'cancelled';
}

const mockSessions: Session[] = [
  {
    id: '1',
    title: 'React Basics & Component Architecture',
    mentor: 'Jane Smith',
    date: '2024-07-01',
    time: '10:00 AM',
    duration: '1 hour',
    status: 'upcoming',
  },
  {
    id: '2',
    title: 'Advanced JavaScript Patterns',
    mentor: 'Mike Johnson',
    date: '2024-07-05',
    time: '2:00 PM',
    duration: '1.5 hours',
    status: 'upcoming',
  },
  {
    id: '3',
    title: 'CSS Flexbox & Grid Mastery',
    mentor: 'Sarah Lee',
    date: '2024-07-10',
    time: '11:00 AM',
    duration: '1 hour',
    status: 'upcoming',
  },
];

// Mocking the Clerk Hooks for a standard React environment
// Replace these with your actual Auth provider logic
const useAuth = () => ({ isSignedIn: true });
const useUser = () => ({
  user: {
    firstName: 'John',
    lastName: 'Doe',
    profileImageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=160&h=160&fit=crop',
    emailAddresses: [{ emailAddress: 'john.doe@example.com' }]
  }
});

export default function ProfilePage() {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const [isEditingCover, setIsEditingCover] = useState<boolean>(false);

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Access Your Profile</h1>
          <p className="text-gray-600 mb-8">Please sign in to view your profile</p>
          <a href="/sign-in">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
              Sign In
            </Button>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <div className="max-w-6xl mx-auto">
        {/* Cover Photo */}
        <div className="relative h-48 md:h-72 w-full overflow-hidden rounded-b-2xl shadow-lg">
          <img
            src="https://images.unsplash.com/photo-1557821552-17105176677c?w=1200&h=400&fit=crop"
            alt="Cover"
            className="w-full h-full object-cover"
          />
          <button
            onClick={() => setIsEditingCover(!isEditingCover)}
            className="absolute top-4 right-4 bg-white/90 p-3 rounded-full shadow-lg hover:scale-110 transition-transform"
          >
            <Camera className="w-5 h-5 text-gray-700" />
          </button>
        </div>

        {/* Profile Header */}
        <div className="relative px-6 py-8">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-6 mb-8">
            <div className="relative -mt-24 md:-mt-20">
              <img
                src={user?.profileImageUrl}
                alt="Profile"
                className="w-32 h-32 md:w-40 md:h-40 rounded-2xl border-4 border-white dark:border-slate-900 object-cover shadow-xl"
              />
              <button className="absolute bottom-2 right-2 bg-blue-600 p-2 rounded-full text-white shadow-lg">
                <Camera className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {user?.firstName} {user?.lastName}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2 mt-1">
                <Mail className="w-4 h-4" />
                {user?.emailAddresses[0]?.emailAddress}
              </p>
            </div>

            <div className="flex gap-3 w-full md:w-auto">
              <a href="/edit-profile" className="flex-1 md:flex-none">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white flex gap-2">
                  <Edit2 className="w-4 h-4" /> Edit Profile
                </Button>
              </a>
              <Button variant="outline" className="flex gap-2">
                <Share2 className="w-4 h-4" /> Share
              </Button>
            </div>
          </div>

          {/* About & Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 p-6 rounded-2xl bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800">
              <h2 className="text-xl font-semibold mb-3 flex items-center gap-2 dark:text-white">
                <span className="w-1 h-6 bg-blue-600 rounded-full" />
                About Me
              </h2>
              <p className="text-gray-700 dark:text-gray-300">
                Software Engineer passionate about web development and building impactful user experiences.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 dark:text-white">
                <MapPin className="w-5 h-5 text-blue-600" />
                Contact
              </h3>
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Location</p>
                <p className="font-medium dark:text-white">San Francisco, CA</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sessions Section */}
        <section className="px-6 py-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Booked Sessions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockSessions.map((session) => (
              <div key={session.id} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold dark:text-white">{session.title}</h3>
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-bold">
                    {session.status}
                  </span>
                </div>
                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Calendar className="w-4 h-4" /> {session.date}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Clock className="w-4 h-4" /> {session.time} ({session.duration})
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1 bg-blue-600 text-white">Join</Button>
                  <Button size="sm" variant="outline" className="flex-1">Reschedule</Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}