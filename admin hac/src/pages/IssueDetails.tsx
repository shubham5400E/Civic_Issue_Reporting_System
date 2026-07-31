import { useState, useEffect } from 'react';
import ImageUpload from '@/components/ImageUpload';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { Status } from '@/store/useStore';
import { supabase } from '@/lib/supabaseClient';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  User,
  Mail,
  Phone,
  Camera,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from 'lucide-react';

const IssueDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  // Remove issues from Zustand, fetch from Supabase
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  // You may still use updateIssueStatus/addProofImages if you have Supabase logic for them
  // TODO: Replace with actual user context if needed
  const currentUser = null;
  
  const [selectedStatus, setSelectedStatus] = useState<Status>('pending');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [proofImages, setProofImages] = useState<(File | string)[]>([]);
  const [profile, setProfile] = useState(null);
  useEffect(() => {
    async function fetchIssueAndProfile() {
      setLoading(true);
      const { data: issueData, error: issueError } = await supabase
        .from('issues')
        .select('issue_id,issue_title,description,priority,status,location,created_at,updated_at,issue_category,name,citizen_id,image_urls')
        .eq('issue_id', id)
        .single();
      setIssue(issueData || null);
      console.log('Fetched citizen_id:', issueData?.citizen_id);
      if (issueData?.citizen_id) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('email,mobile')
          .eq('id', issueData.citizen_id)
          .single();
        console.log('Fetched profile:', profileData, 'Error:', profileError);
        setProfile(profileData || null);
      } else {
        setProfile(null);
      }
      setLoading(false);
    }
    if (id) fetchIssueAndProfile();
  }, [id]);

  useEffect(() => {
    if (issue) {
      setSelectedStatus(issue.status);
    }
  }, [issue]);

  if (loading) {
    return (
      <DashboardLayout title="Loading Issue...">
        <div className="text-center py-12">
          <div className="text-lg font-medium text-muted-foreground mb-2">Loading...</div>
        </div>
      </DashboardLayout>
    );
  }
  if (!issue) {
    return (
      <DashboardLayout title="Issue Not Found">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">❌</div>
          <h3 className="text-lg font-medium text-muted-foreground mb-2">
            Issue not found
          </h3>
          <p className="text-muted-foreground mb-4">
            The issue you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const handleStatusUpdate = () => {
    if (selectedStatus === issue.status) {
      toast({
        title: "No changes",
        description: "Status is already set to " + selectedStatus,
      });
      return;
    }
    if (selectedStatus === 'completed') {
      if (proofImages.length !== 3) {
        toast({
          title: "Upload Required",
          description: "Please upload exactly 3 proof images before marking as completed.",
          variant: "destructive"
        });
        return;
      }
      // Upload images to Cloudinary (only File objects)
      Promise.all(proofImages.map(async (img) => {
        if (typeof img === 'string') {
          // Already a URL, just return
          return img;
        }
        // File upload
        const formData = new FormData();
        formData.append('file', img);
        formData.append('upload_preset', 'issue_images'); // Replace with your preset
        const response = await fetch('https://api.cloudinary.com/v1_1/dqvw1zfyd/image/upload', {
          method: 'POST',
          body: formData
        });
        const data = await response.json();
        if (!data.secure_url) throw new Error('Cloudinary upload failed');
        return data.secure_url;
      })).then(async (uploadedUrls) => {
        // Update issue with status and proof image URLs
        await supabase.from('issues').update({ status: selectedStatus, proof_images: uploadedUrls }).eq('issue_id', issue.issue_id);
        toast({
          title: "Status Updated",
          description: "Issue marked as completed. Proof images uploaded and notification sent to reporter.",
        });
        setProofImages([]);
      }).catch((err) => {
        toast({
          title: "Upload Error",
          description: err.message || "Failed to upload images.",
          variant: "destructive"
        });
      });
      return;
    }
    // For other status updates
    supabase.from('issues').update({ status: selectedStatus }).eq('issue_id', issue.issue_id)
      .then(() => {
        toast({
          title: "Status Updated",
          description: `Issue status updated to ${selectedStatus.replace('-', ' ')}`,
        });
      });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'warning';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'accent';
      case 'in-process': return 'warning';
      case 'pending': return 'secondary';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle2;
      case 'in-process': return Clock;
      case 'pending': return AlertTriangle;
      default: return AlertTriangle;
    }
  };

  const StatusIcon = getStatusIcon(issue.status);

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      road: '🛣',
      water: '💧',
      electricity: '⚡',
      sanitation: '🗑',
      lighting: '💡',
      traffic: '🚦',
    };
    return icons[category] || '📋';
  };

  return (
    <DashboardLayout title="Issue Details">
      <div className="space-y-6">
        {/* Back Button */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
        >
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Issue Details */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="shadow-card border-0">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{getCategoryIcon(issue.category)}</span>
                      <div>
                        <CardTitle className="text-xl">{issue.issue_title}</CardTitle>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant="outline">{issue.issue_id}</Badge>
                          <Badge variant={getPriorityColor(issue.priority) as any} className="capitalize">
                            {issue.priority} Priority
                          </Badge>
                          <Badge variant={getStatusColor(issue.status) as any} className="capitalize">
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {issue.status.replace('-', ' ')}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium text-foreground mb-2">Description</h4>
                    <p className="text-muted-foreground leading-relaxed">{issue.description}</p>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{issue.location}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>Created {issue.created_at && !isNaN(Date.parse(issue.created_at)) ? new Date(issue.created_at).toLocaleDateString() : 'N/A'}</span>
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Last updated: {issue.updated_at && !isNaN(Date.parse(issue.updated_at)) ? new Date(issue.updated_at).toLocaleString() : 'N/A'}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Images */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="shadow-card border-0">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Camera className="w-5 h-5" />
                    <span>Issue Photos ({Array.isArray(issue.image_urls) ? issue.image_urls.length : 0})</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {(Array.isArray(issue.image_urls) ? issue.image_urls : []).map((image, index) => (
                      <motion.div
                        key={index}
                        whileHover={{ scale: 1.05 }}
                        className="aspect-square rounded-lg overflow-hidden bg-muted cursor-pointer"
                        onClick={() => setSelectedImage(image)}
                      >
                        <img
                          src={image}
                          alt={`Issue photo ${index + 1}`}
                          className="w-full h-full object-cover hover:opacity-90 transition-opacity"
                        />
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Proof Images (if completed) */}
            {issue.proofImages && issue.proofImages.length > 0 && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="shadow-card border-0 border-accent">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-accent">
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Completion Proof</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {issue.proofImages.map((image, index) => (
                        <motion.div
                          key={index}
                          whileHover={{ scale: 1.05 }}
                          className="aspect-square rounded-lg overflow-hidden bg-muted cursor-pointer"
                          onClick={() => setSelectedImage(image)}
                        >
                          <img
                            src={image}
                            alt={`Completion proof ${index + 1}`}
                            className="w-full h-full object-cover hover:opacity-90 transition-opacity"
                          />
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Reporter Info */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="shadow-card border-0">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="w-5 h-5" />
                    <span>Reporter Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="font-medium text-foreground">{issue.name}</div>
                  </div>
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm">{profile?.email || 'N/A'}</span>
                  </div>
                  {profile?.mobile && (
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      <span className="text-sm">{profile.mobile}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
            {/* Update Status Section - always visible */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="shadow-card border-0">
                <CardHeader>
                  <CardTitle>Update Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Select value={selectedStatus} onValueChange={(value: Status) => setSelectedStatus(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in-process">In Process</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>

                  {selectedStatus === 'completed' && (
                    <div className="bg-accent/10 border border-accent/20 rounded-lg p-3 mb-2">
                      <p className="text-sm text-accent-foreground">
                        <CheckCircle2 className="w-4 h-4 inline mr-1" />
                        Marking as completed will upload proof photos and notify the reporter.
                      </p>
                      <ImageUpload
                        onImagesChange={(images: string[]) => setProofImages(images)}
                        maxImages={3}
                        existingImages={proofImages.filter(img => typeof img === 'string') as string[]}
                      />
                      <div className="text-xs mt-2">Please upload exactly 3 images.</div>
                    </div>
                  )}

                  <Button 
                    onClick={handleStatusUpdate}
                    className="w-full"
                    disabled={selectedStatus === issue.status}
                  >
                    Update Status
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Upload Proof Images */}
            {/* Remove duplicate proof image upload section */}
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <motion.img
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8 }}
            src={selectedImage}
            alt="Full size"
            className="max-w-full max-h-full object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </motion.div>
      )}
    </DashboardLayout>
  );
};

export default IssueDetails;