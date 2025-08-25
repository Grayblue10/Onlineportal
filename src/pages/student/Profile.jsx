import React, { useEffect, useState } from 'react';
import { Mail, Hash, GraduationCap, BookOpen, User2 } from 'lucide-react';
import studentService from '../../services/studentService';
import { toast } from 'react-hot-toast';
import { formatAcademicYear } from '../../utils/academicYear';

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-3 py-2">
    <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-yellow-50 text-yellow-700">
      <Icon size={18} />
    </div>
    <div>
      <div className="text-sm text-gray-500">{label}</div>
      <div className="font-medium text-gray-900 break-all">{value || '—'}</div>
    </div>
  </div>
);

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const [p, s] = await Promise.all([
          studentService.getProfile(),
          studentService.getSubjects()
        ]);
        if (!mounted) return;
        setProfile(p);
        setSubjects(Array.isArray(s?.data) ? s.data : Array.isArray(s) ? s : []);
      } catch (err) {
        console.error('Failed to load profile:', err);
        toast.error(err.message || 'Failed to load profile');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-600">View your student information and enrollment details.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-800 font-semibold text-xl">
              {profile?.firstName?.[0]?.toUpperCase()}{profile?.lastName?.[0]?.toUpperCase()}
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-900">{profile?.fullName || `${profile?.firstName || ''} ${profile?.lastName || ''}`}</div>
              <div className="text-sm text-gray-500">Student</div>
            </div>
          </div>

          <div className="mt-6 space-y-2">
            <InfoRow icon={Hash} label="Student Number" value={profile?.studentId} />
            <InfoRow icon={Mail} label="Email" value={profile?.email} />
            <InfoRow icon={GraduationCap} label="Program" value={profile?.program ? `${profile.program.code} • ${profile.program.semester} sem • ${formatAcademicYear(profile.program.academicYear)}` : 'Not assigned'} />
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen size={18} className="text-yellow-700" />
            <h2 className="font-semibold text-gray-900">Enrolled Subjects</h2>
          </div>

          {subjects.length === 0 ? (
            <div className="text-gray-500 text-sm">No enrolled subjects found.</div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {subjects.map((subj) => (
                <div key={subj._id || subj.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{subj.name}</div>
                      <div className="text-sm text-gray-500">{subj.code}</div>
                    </div>
                    <div className="text-xs px-2 py-1 rounded bg-yellow-50 text-yellow-700">{subj.units || 3} units</div>
                  </div>
                  <div className="mt-2 text-sm text-gray-600 line-clamp-2">{subj.description || '—'}</div>
                  {subj.teacherName || subj.teacher?.name ? (
                    <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                      <User2 size={16} />
                      <span>{subj.teacherName || subj.teacher?.name}</span>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
